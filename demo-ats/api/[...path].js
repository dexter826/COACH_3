const express = require('express');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();
const pdfModule = require('pdf-parse');
const isLegacy = typeof pdfModule === 'function';
const PDFParseClass = pdfModule.PDFParse || pdfModule.default;

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
const path = require('path');
if (process.env.NODE_ENV !== 'production') {
    app.use(express.static(path.join(__dirname, '..')));
}

const upload = multer({ storage: multer.memoryStorage() });

// Gọi Google Gemini 3.6 Flash trực tiếp
async function callGeminiApi(systemInstruction, userPrompt) {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        throw new Error("Thiếu cấu hình GEMINI_API_KEY trong file .env");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`;
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            },
            contents: [
                {
                    role: "user",
                    parts: [{ text: userPrompt }]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
                thinkingConfig: {
                    thinkingBudget: 1
                }
            }
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Lỗi Google Gemini API (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
        throw new Error("Gemini không trả về dữ liệu.");
    }

    return JSON.parse(rawText);
}

app.post('/api/parse-cv', upload.single('cvFile'), async (req, res) => {
    const tServerStart = Date.now();
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "Không tìm thấy file tải lên." });
        }

        if (file.mimetype !== 'application/pdf') {
            return res.status(400).json({ error: "Chỉ hỗ trợ file định dạng PDF." });
        }

        // Parse PDF to Text
        const tPdfStart = Date.now();
        let pdfText = "";
        try {
            if (isLegacy) {
                const data = await pdfModule(file.buffer);
                pdfText = data.text;
            } else {
                const parser = new PDFParseClass({ data: file.buffer });
                const data = await parser.getText();
                pdfText = data.text;
            }
        } catch (err) {
            console.error("Lỗi gốc từ pdf-parse:", err);
            return res.status(400).json({ error: "Lỗi đọc PDF: " + err.message });
        }
        const pdfParseMs = Date.now() - tPdfStart;

        if (!pdfText || pdfText.trim().length === 0) {
            return res.status(400).json({ error: "File PDF rỗng hoặc là ảnh scan không chứa chữ." });
        }

        const SYSTEM_INSTRUCTION = `Bạn là chuyên gia nhân sự ảo của YODY (YODY ATS).
Nhiệm vụ: Trích xuất toàn bộ thông tin từ văn bản CV của ứng viên vào cấu trúc JSON chuẩn mở rộng.
BẠN PHẢI TRẢ VỀ DUY NHẤT MỘT CHUỖI JSON HỢP LỆ.

Quy tắc tối ưu tốc độ & chuẩn hóa:
- "description" trong workExperience, projects, awards, volunteerActivities: Tóm tắt 1-2 gạch đầu dòng ngắn gọn về trách nhiệm/kết quả chính.
- "professionalSummary": Tóm tắt tối đa 2 câu súc tích.
- "socialLinks": Mảng động chứa tất cả liên kết mạng xã hội hoặc portfolio tìm thấy (platform: "LinkedIn" | "GitHub" | "Behance" | "Dribbble" | "Kaggle" | "Facebook" | "Portfolio" | "Website" | "TikTok" | "Khác", url: string).
- Bỏ qua mục không có thông tin (để chuỗi rỗng "" hoặc mảng rỗng []).

Cấu trúc Output Schema Mở Rộng:
{
  "candidate": {
    "fullName": "Tên",
    "email": "Email",
    "phone": "Số điện thoại",
    "location": "Địa chỉ",
    "currentTitle": "Chức danh",
    "professionalSummary": "Tóm tắt ngắn gọn",
    "totalExperienceMonths": <tổng số tháng kinh nghiệm làm việc>,
    "skills": ["kỹ năng 1"],
    "languages": ["ngoại ngữ 1"],
    "socialLinks": [
      { "platform": "Tên nền tảng", "url": "Đường dẫn" }
    ],
    "links": { "linkedin": "", "github": "", "portfolio": "" }
  },
  "workExperience": [{ "company": "", "title": "", "startDate": "", "endDate": "", "description": "" }],
  "projects": [{ "name": "", "role": "", "technologies": [], "description": "", "url": "" }],
  "education": [{ "institution": "", "degree": "", "fieldOfStudy": "", "startDate": "", "endDate": "" }],
  "certifications": [{ "name": "", "issuer": "", "issueDate": "", "credentialUrl": "" }],
  "awards": [{ "title": "", "issuer": "", "issueDate": "", "description": "" }],
  "volunteerActivities": [{ "organization": "", "role": "", "startDate": "", "endDate": "", "description": "" }],
  "references": [{ "name": "", "title": "", "company": "", "email": "", "phone": "", "relationship": "" }],
  "customAttributes": {},
  "missingFields": ["list các trường quan trọng bị thiếu (fullName, email, phone)"]
}`;

        const tAiStart = Date.now();
        const candidateRecord = await callGeminiApi(SYSTEM_INSTRUCTION, `Hãy trích xuất JSON từ nội dung CV sau:\n\n${pdfText}`);
        const aiInferenceMs = Date.now() - tAiStart;
        const totalServerMs = Date.now() - tServerStart;

        // Chuẩn hóa fallback socialLinks nếu chỉ có links cũ hoặc ngược lại
        if (candidateRecord.candidate) {
            if (!candidateRecord.candidate.socialLinks) {
                candidateRecord.candidate.socialLinks = [];
                const oldLinks = candidateRecord.candidate.links || {};
                if (oldLinks.linkedin) candidateRecord.candidate.socialLinks.push({ platform: "LinkedIn", url: oldLinks.linkedin });
                if (oldLinks.github) candidateRecord.candidate.socialLinks.push({ platform: "GitHub", url: oldLinks.github });
                if (oldLinks.portfolio) candidateRecord.candidate.socialLinks.push({ platform: "Portfolio", url: oldLinks.portfolio });
            }
        }

        candidateRecord._timings = {
            pdfParseMs,
            aiInferenceMs,
            totalServerMs
        };

        res.json(candidateRecord);

    } catch (error) {
        console.error("Lỗi parse CV:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint lưu hồ sơ ứng viên sau khi HR chỉnh sửa
app.post('/api/candidates/save', (req, res) => {
    try {
        const candidateData = req.body;
        if (!candidateData || !candidateData.candidate) {
            return res.status(400).json({ error: "Dữ liệu ứng viên không hợp lệ." });
        }
        const candidateId = candidateData.id || ('cand_' + Date.now());
        candidateData.id = candidateId;
        candidateData.updatedAt = new Date().toISOString();
        res.json({
            success: true,
            message: "Hồ sơ ứng viên đã được lưu thành công.",
            id: candidateId,
            updatedAt: candidateData.updatedAt
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/match-jd', async (req, res) => {
    const tServerStart = Date.now();
    try {
        const { candidateRecord, jobDescription } = req.body;
        if (!candidateRecord || !jobDescription) {
            return res.status(400).json({ error: "Thiếu dữ liệu candidateRecord hoặc jobDescription" });
        }

        const MATCHER_INSTRUCTION = `Bạn là hệ thống AI phân tích và sàng lọc ứng viên thông minh của YODY ATS.
Nhiệm vụ: Nhận vào JSON ứng viên và JD (text), so sánh linh hoạt (semantic match) và trả về JSON:
{
  "score": <number 0-100>,
  "recommendation": "<NÊN PHỎNG VẤN / CÂN NHẮC / TỪ CHỐI>",
  "reason": "<Chuỗi 1-2 câu tóm tắt ngắn gọn lý do chính đưa ra điểm số và khuyến nghị>"
}`;

        const promptText = `Hồ sơ ứng viên (JSON):\n${JSON.stringify(candidateRecord)}\n\nYêu cầu công việc (JD):\n${jobDescription}\n\nHãy phân tích mức độ phù hợp và trả về JSON theo đúng schema yêu cầu.`;

        const tAiStart = Date.now();
        const matchResult = await callGeminiApi(MATCHER_INSTRUCTION, promptText);
        const aiInferenceMs = Date.now() - tAiStart;
        const totalServerMs = Date.now() - tServerStart;

        matchResult._timings = {
            aiInferenceMs,
            totalServerMs
        };

        res.json(matchResult);

    } catch (error) {
        console.error("Lỗi match JD:", error.message);
        res.status(500).json({ error: error.message });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`\n✅ Backend chạy tại http://localhost:${port}`);
    });
}

module.exports = app;

module.exports.config = {
    api: {
        bodyParser: false,
    },
};
