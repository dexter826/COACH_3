const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Set up Multer to handle file uploads in memory
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const SYSTEM_INSTRUCTION = `Bạn là hệ thống AI Agent: cv-to-candidate-record.
Nhiệm vụ: Trích xuất thông tin từ file CV (PDF/Hình ảnh) và trả về DUY NHẤT một chuỗi JSON theo schema sau (KHÔNG dùng markdown code block, KHÔNG giải thích gì thêm):
{
  "candidate": {
    "fullName": "", "email": "", "phone": "", "location": "", "currentTitle": "", "professionalSummary": "", "totalExperienceMonths": null, "skills": [], "languages": [],
    "links": { "linkedin": "", "github": "", "portfolio": "", "others": [] }
  },
  "workExperience": [ { "company": "", "title": "", "startDate": "", "endDate": "", "description": [] } ],
  "projects": [ { "name": "", "role": "", "technologies": [] } ],
  "education": [ { "institution": "", "degree": "", "fieldOfStudy": "", "startDate": "", "endDate": "" } ],
  "certifications": [ { "name": "", "issuer": "", "issueDate": "" } ],
  "missingFields": [],
  "uncertainFields": []
}

Quy tắc chuẩn hóa:
- Mảng/chuỗi rỗng "" hoặc null nếu không có thông tin.
- totalExperienceMonths tính tổng số tháng kinh nghiệm làm việc, không cộng trùng khoảng thời gian song song.
- missingFields lưu danh sách trường quan trọng bị thiếu (fullName, email, phone).
- Kỹ năng chuẩn hóa in hoa chữ cái đầu (VD: React, Node.js).`;

app.post('/api/parse-cv', upload.single('cvFile'), async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "dán_api_key_của_bạn_vào_đây") {
            return res.status(500).json({ error: "Thiếu cấu hình GEMINI_API_KEY trên Server (Xem file .env)" });
        }

        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "Vui lòng đính kèm file CV" });
        }

        const base64Data = file.buffer.toString('base64');
        const mimeType = file.mimetype;

        // Fetch to Google Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION }]
                },
                contents: [{
                    parts: [
                        { text: "Hãy trích xuất file CV này thành cấu trúc JSON đầy đủ." },
                        { inlineData: { mimeType: mimeType, data: base64Data } }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Lỗi khi gọi API Google.");
        }

        const data = await response.json();
        let jsonString = data.candidates[0].content.parts[0].text;
        
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
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "dán_api_key_của_bạn_vào_đây") {
            return res.status(500).json({ error: "Thiếu cấu hình GEMINI_API_KEY trên Server" });
        }

        const { candidateRecord, jobDescription } = req.body;
        if (!candidateRecord || !jobDescription) {
            return res.status(400).json({ error: "Thiếu dữ liệu candidateRecord hoặc jobDescription" });
        }

        const MATCHER_INSTRUCTION = `Bạn là hệ thống AI phân tích và sàng lọc ứng viên thông minh của YODY ATS.
Nhiệm vụ: Nhận vào JSON ứng viên và JD (text), so sánh linh hoạt (semantic match) và trả về JSON (Không giải thích, Không bọc code block):
{
  "score": <number 0-100>,
  "pros": [<3 chuỗi đánh giá điểm mạnh>],
  "cons": [<2-3 chuỗi đánh giá điểm thiếu sót/rủi ro>],
  "recommendation": "<NÊN PHỎNG VẤN / CÂN NHẮC / TỪ CHỐI>"
}`;

        const promptText = `Hồ sơ ứng viên (JSON):\n${JSON.stringify(candidateRecord)}\n\nYêu cầu công việc (JD):\n${jobDescription}\n\nHãy phân tích mức độ phù hợp và trả về JSON theo đúng schema yêu cầu.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: MATCHER_INSTRUCTION }]
                },
                contents: [{
                    parts: [{ text: promptText }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Lỗi khi gọi API Google Matcher.");
        }

        const data = await response.json();
        let jsonString = data.candidates[0].content.parts[0].text;
        
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
