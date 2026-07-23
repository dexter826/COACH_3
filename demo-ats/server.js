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
app.use(express.static(__dirname));

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/parse-cv', upload.single('cvFile'), async (req, res) => {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey || apiKey === "dán_api_key_của_bạn_vào_đây") {
            return res.status(500).json({ error: "Thiếu cấu hình OPENROUTER_API_KEY trên Server" });
        }

        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "Không tìm thấy file tải lên." });
        }

        if (file.mimetype !== 'application/pdf') {
            return res.status(400).json({ error: "Chỉ hỗ trợ file định dạng PDF." });
        }

        // Parse PDF to Text
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

        if (!pdfText || pdfText.trim().length === 0) {
            return res.status(400).json({ error: "File PDF rỗng hoặc là ảnh scan không chứa chữ." });
        }

        const SYSTEM_INSTRUCTION = `Bạn là chuyên gia nhân sự ảo của YODY (YODY ATS).
Nhiệm vụ của bạn là trích xuất thông tin từ văn bản CV của ứng viên (nhập dưới dạng Text) vào một cấu trúc JSON chuẩn.
BẠN PHẢI TRẢ VỀ DUY NHẤT MỘT CHUỖI JSON HỢP LỆ (Không Markdown, không giải thích).

Cấu trúc Output Schema:
{
  "candidate": {
    "fullName": "Tên",
    "email": "Email",
    "phone": "Số điện thoại",
    "location": "Địa chỉ",
    "currentTitle": "Chức danh",
    "professionalSummary": "Tóm tắt",
    "totalExperienceMonths": <tổng số tháng kinh nghiệm làm việc>,
    "skills": ["kỹ năng 1"],
    "languages": ["ngoại ngữ 1"],
    "links": { "linkedin": "", "github": "", "portfolio": "", "others": [] }
  },
  "workExperience": [{ "company": "", "title": "", "startDate": "", "endDate": "", "description": "" }],
  "projects": [{ "name": "", "role": "", "technologies": [], "description": "" }],
  "education": [{ "institution": "", "degree": "", "fieldOfStudy": "", "startDate": "", "endDate": "" }],
  "certifications": [{ "name": "", "issuer": "", "issueDate": "" }],
  "missingFields": ["list các trường quan trọng bị thiếu (fullName, email, phone)"]
}`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'http://localhost:3000', 
                'X-Title': 'YODY ATS Demo',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b:free",
                messages: [
                    { role: "system", content: SYSTEM_INSTRUCTION },
                    { role: "user", content: `Hãy trích xuất JSON từ nội dung CV sau:\n\n${pdfText}` }
                ],
                temperature: 0.1
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error("Lỗi API OpenRouter: " + errText);
        }

        const data = await response.json();
        let jsonString = data.choices[0].message.content;
        
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("AI không trả về định dạng JSON hợp lệ.");
        }
        jsonString = jsonMatch[0];

        const candidateRecord = JSON.parse(jsonString);
        res.json(candidateRecord);

    } catch (error) {
        console.error("Lỗi parse CV:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/match-jd', async (req, res) => {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey || apiKey === "dán_api_key_của_bạn_vào_đây") {
            return res.status(500).json({ error: "Thiếu cấu hình OPENROUTER_API_KEY trên Server" });
        }

        const { candidateRecord, jobDescription } = req.body;
        if (!candidateRecord || !jobDescription) {
            return res.status(400).json({ error: "Thiếu dữ liệu candidateRecord hoặc jobDescription" });
        }

        const MATCHER_INSTRUCTION = `Bạn là hệ thống AI phân tích và sàng lọc ứng viên thông minh của YODY ATS.
Nhiệm vụ: Nhận vào JSON ứng viên và JD (text), so sánh linh hoạt (semantic match) và trả về JSON (Không giải thích, Không bọc code block):
{
  "score": <number 0-100>,
  "recommendation": "<NÊN PHỎNG VẤN / CÂN NHẮC / TỪ CHỐI>",
  "reason": "<Chuỗi 1-2 câu tóm tắt ngắn gọn lý do chính đưa ra điểm số và khuyến nghị>"
}`;

        const promptText = `Hồ sơ ứng viên (JSON):\n${JSON.stringify(candidateRecord)}\n\nYêu cầu công việc (JD):\n${jobDescription}\n\nHãy phân tích mức độ phù hợp và trả về JSON theo đúng schema yêu cầu.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'http://localhost:3000', 
                'X-Title': 'YODY ATS Demo',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b:free",
                messages: [
                    { role: "system", content: MATCHER_INSTRUCTION },
                    { role: "user", content: promptText }
                ],
                temperature: 0.1
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error("Lỗi API OpenRouter: " + errText);
        }

        const data = await response.json();
        let jsonString = data.choices[0].message.content;
        
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("AI không trả về định dạng JSON hợp lệ.");
        }
        jsonString = jsonMatch[0];

        const matchResult = JSON.parse(jsonString);
        res.json(matchResult);

    } catch (error) {
        console.error("Lỗi match JD:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`\n✅ Backend chạy tại http://localhost:${port}`);
});
