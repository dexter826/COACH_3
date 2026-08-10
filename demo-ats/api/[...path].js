const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

if (process.env.NODE_ENV !== 'production') {
    app.use(express.static(path.join(__dirname, '..')));
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// Gọi Google Gemini 3.6 Flash trực tiếp
async function callGeminiApi(systemInstruction, userContent) {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        throw new Error("Thiếu cấu hình GEMINI_API_KEY trong biến môi trường (Environment Variables).");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`;
    
    let parts = [];
    if (typeof userContent === 'string') {
        parts = [{ text: userContent }];
    } else if (Array.isArray(userContent)) {
        parts = userContent;
    } else {
        parts = [{ text: String(userContent) }];
    }

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
                    parts: parts
                }
            ],
            generationConfig: {
                responseMimeType: "application/json",
                thinkingConfig: {
                    thinkingLevel: "minimal"
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
        let pdfBase64 = null;

        // 1. Nhận từ JSON Base64 payload (Chuẩn Serverless Vercel)
        if (req.body && req.body.pdfBase64) {
            pdfBase64 = req.body.pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        } 
        // 2. Nhận từ Multer Form-data (Fallback)
        else if (req.file && req.file.buffer) {
            pdfBase64 = req.file.buffer.toString('base64');
        }

        if (!pdfBase64 || pdfBase64.trim().length === 0) {
            return res.status(400).json({ error: "Không tìm thấy dữ liệu file PDF tải lên." });
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
    "yearOfBirth": "Năm sinh",
    "gender": "Giới tính",
    "location": "Địa chỉ",
    "currentTitle": "Chức danh",
    "professionalSummary": "Tóm tắt ngắn gọn",
    "totalExperienceMonths": <tổng số tháng kinh nghiệm làm việc>,
    "technicalSkills": ["kỹ năng chuyên môn 1"],
    "softSkills": ["kỹ năng mềm 1"],
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

        let userParts = [];
        let pdfParseMs = 0;
        try {
            const { processPdf } = await import('@firecrawl/pdf-inspector');
            const pdfBuffer = Buffer.from(pdfBase64, 'base64');
            const tParseStart = Date.now();
            const pdfResult = processPdf(pdfBuffer);
            pdfParseMs = Date.now() - tParseStart;

            if (pdfResult.pdfType === 'TextBased' || pdfResult.pdfType === 'Mixed') {
                userParts = [
                    { text: "Dưới đây là nội dung văn bản CV đã được trích xuất sạch sẽ dưới dạng Markdown:\n\n" + pdfResult.markdown },
                    { text: "Hãy trích xuất toàn bộ thông tin từ tài liệu CV này vào cấu trúc JSON theo đúng schema đã hướng dẫn." }
                ];
            } else {
                userParts = [
                    { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
                    { text: "Hãy trích xuất toàn bộ thông tin từ tài liệu CV này vào cấu trúc JSON theo đúng schema đã hướng dẫn." }
                ];
            }
        } catch (parseError) {
            console.error("Lỗi parse PDF với pdf-inspector, chuyển sang fallback:", parseError.message);
            userParts = [
                { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
                { text: "Hãy trích xuất toàn bộ thông tin từ tài liệu CV này vào cấu trúc JSON theo đúng schema đã hướng dẫn." }
            ];
        }

        const tAiStart = Date.now();
        const candidateRecord = await callGeminiApi(SYSTEM_INSTRUCTION, userParts);
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
            aiInferenceMs,
            totalServerMs,
            pdfParseMs
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
