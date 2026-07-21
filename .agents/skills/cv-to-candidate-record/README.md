# Skill: CV to Candidate Record

Tài liệu hướng dẫn sử dụng và tích hợp cho Skill `cv-to-candidate-record`.

## 📌 Tổng quan

Skill này trích xuất thông tin từ file CV (PDF, DOCX, TXT, Markdown, hình ảnh hoặc văn bản dán trực tiếp) thành định dạng JSON chuẩn hoá (`candidate-record.json`) sẵn sàng để lưu trữ vào hệ thống ATS của YODY.

## 🚀 Điều kiện Kích hoạt

Skill được tự động gọi khi người dùng:
- Cung cấp hoặc tải lên file CV.
- Yêu cầu bóc tách/chuyển đổi thông tin CV thành định dạng JSON cho hệ thống ATS.

## 📂 Tài nguyên & Thư mục Phụ trợ

Skill này đi kèm các tài nguyên tại thư mục `cv-to-candidate-record/`:
- **`references/candidate-schema.md`**: Định nghĩa cấu trúc các trường thông tin JSON.
- **`references/normalization-rules.md`**: Quy tắc chuẩn hóa dữ liệu (ngày tháng, số điện thoại, tên trường...).
- **`references/output-example.md`**: File JSON ví dụ đầu ra chuẩn.
- **`assets/candidate-record.template.json`**: Khung JSON mẫu để điền dữ liệu.
- **`scripts/validate_candidate_record.py`**: Kịch bản kiểm tra tính hợp lệ của file JSON đầu ra.

## 🔄 Quy trình Xử lý (10 Bước)

1. Đọc nội dung CV nguồn.
2. Tham chiếu `references/candidate-schema.md`.
3. Áp dụng quy tắc tại `references/normalization-rules.md`.
4. Lấy khung mẫu từ `assets/candidate-record.template.json`.
5. Trích xuất thông tin từ CV điền vào mẫu.
6. Chuẩn hóa dữ liệu theo chuẩn YODY ATS.
7. Xuất file `candidate-record.json`.
8. Chạy script kiểm tra: `python scripts/validate_candidate_record.py candidate-record.json`
9. Sửa lỗi nếu có cho tới khi script báo không có lỗi.
10. Hoàn thành và bàn giao file JSON.

## 📜 Lịch sử Phiên bản (Version History)

- **v1.0.0** (2026-07-21): Khởi tạo Skill trích xuất CV thành hồ sơ JSON chuẩn ATS kèm script validation.
