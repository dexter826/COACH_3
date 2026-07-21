# Skill: Candidate & JD Matcher

Tài liệu hướng dẫn sử dụng và tích hợp cho Skill `candidate-jd-matcher`.

## 📌 Tổng quan

Skill này sử dụng AI để đánh giá mức độ tương thích giữa **Hồ sơ ứng viên (dạng JSON)** và **Mô tả công việc (Job Description - JD dạng Text)**. AI sẽ phân tích dựa trên ngữ nghĩa (Semantic matching) thay vì so khớp từ khóa cứng nhắc.

## 🚀 Điều kiện Sử dụng

Skill được kích hoạt tự động khi người dùng yêu cầu:
- Đánh giá hoặc chấm điểm độ phù hợp của hồ sơ ứng viên so với JD.
- So sánh thông tin ứng viên trong hệ thống ATS với yêu cầu vị trí tuyển dụng.

## 📥 Input & 📤 Output

### Input
1. **`candidateRecord`**: Dữ liệu JSON chứa thông tin ứng viên (từ skill `cv-to-candidate-record`).
2. **`jobDescription`**: Chuỗi văn bản mô tả yêu cầu công việc.

### Output (JSON Format)
```json
{
  "score": 85,
  "pros": [
    "Kinh nghiệm dày dặn với React và hệ sinh thái Frontend.",
    "Từng làm leader, phù hợp với yêu cầu quản lý team nhỏ."
  ],
  "cons": [
    "Chưa thấy kinh nghiệm làm việc với Cloud (AWS) như JD yêu cầu."
  ],
  "recommendation": "NÊN PHỎNG VẤN"
}
```

- **`score`**: Điểm số từ 0 - 100.
- **`pros`**: Danh sách 3 điểm mạnh nhất.
- **`cons`**: Danh sách 2-3 rủi ro hoặc thiếu sót.
- **`recommendation`**: Đưa ra 1 trong 3 mức: `"NÊN PHỎNG VẤN"`, `"CÂN NHẮC"`, `"TỪ CHỐI"`.

## 📜 Lịch sử Phiên bản (Version History)

- **v1.0.0** (2026-07-21): Khởi tạo Skill đánh giá điểm match giữa CV dạng JSON và JD dạng Text.
