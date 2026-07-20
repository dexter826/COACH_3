---
name: cv-to-candidate-record
description: Chuyển một CV thành hồ sơ ứng viên có cấu trúc, sẵn sàng để lưu vào hệ thống ATS.
---

# 1. Bối cảnh
Skill này giúp chuyển đổi CV thành dữ liệu JSON có cấu trúc (`candidate-record.json`) để import vào hệ thống ATS của YODY. Quá trình này giúp giải quyết các vấn đề nhập liệu thủ công, dữ liệu thiếu chuẩn hóa và khó tìm kiếm.

# 2. Điều kiện kích hoạt
- Kích hoạt khi người dùng cung cấp một CV (định dạng PDF, DOCX, TXT, Markdown, hình ảnh, hoặc nội dung dán trực tiếp).
- Nếu không thể đọc file hoặc nội dung không hợp lệ, thông báo rõ cho người dùng.

# 3. Quy trình thực hiện
Hãy tuân thủ nghiêm ngặt quy trình sau:
1. Đọc nội dung CV được cung cấp.
2. Đọc file `references/candidate-schema.md` để hiểu cấu trúc JSON đầu ra.
3. Đọc file `references/normalization-rules.md` để áp dụng các quy tắc chuẩn hóa dữ liệu.
4. Lấy khung JSON từ `assets/candidate-record.template.json`.
5. Trích xuất thông tin từ CV và điền vào JSON. (Tham khảo ví dụ trong `references/output-example.md`).
6. Chuẩn hóa dữ liệu theo đúng quy tắc.
7. Tạo file `candidate-record.json` chứa kết quả.
8. Chạy validation script để kiểm tra lỗi:
   ```bash
   python scripts/validate_candidate_record.py candidate-record.json
   ```
9. Nếu script báo lỗi, sửa lại file `candidate-record.json` và chạy lại cho đến khi không còn lỗi (exit code 0).
10. Hoàn thành và giao file `candidate-record.json` cho người dùng.

# 4. Nguyên tắc xử lý
- Ưu tiên độ chính xác.
- Giữ nguyên ý nghĩa thông tin trong CV.
- Phân biệt dữ liệu gốc và giá trị được tính toán.
- Ghi nhận rõ dữ liệu thiếu hoặc chưa chắc chắn vào `missingFields` và `uncertainFields`.
- Tạo JSON có thể dùng trực tiếp cho ATS.
