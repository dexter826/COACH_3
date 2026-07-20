# Quy tắc Chuẩn Hóa Dữ Liệu

## 1. Họ tên
- Loại bỏ khoảng trắng thừa.
- Giữ đúng dấu tiếng Việt.
- Giữ nguyên thứ tự họ tên.

## 2. Email
- Chuyển về chữ thường (lowercase).
- Loại bỏ khoảng trắng.
- Kiểm tra cấu trúc email cơ bản.

## 3. Số điện thoại
- Loại bỏ khoảng trắng và ký tự phân cách không cần thiết (dấu chấm, gạch ngang).
- Chuẩn hóa về một định dạng thống nhất (chỉ gồm số và dấu `+`).
- Giữ mã quốc gia khi CV có cung cấp.

## 4. Ngày tháng
- `YYYY-MM` khi có tháng và năm.
- `YYYY` khi chỉ có năm.
- `present` khi công việc vẫn đang tiếp diễn.

## 5. Kinh nghiệm làm việc & Học vấn
- Sắp xếp từ kinh nghiệm/học vấn gần nhất đến cũ nhất.

## 6. Kỹ năng
- Loại bỏ kỹ năng trùng lặp.
- Chuẩn hóa cách viết phổ biến (VD: `React.js`, `ReactJS` -> `React`; `MS Excel` -> `Microsoft Excel`).
- Giữ kỹ năng cụ thể.

## 7. Liên kết
- Giữ nguyên URL gốc.
- Tách riêng LinkedIn, GitHub, Portfolio vào trường tương ứng. URL khác đưa vào `links.others`.

## 8. Thông tin suy ra (`totalExperienceMonths`)
- Tính tổng số tháng kinh nghiệm khi các mốc thời gian đủ rõ.
- Không cộng trùng các giai đoạn làm việc song song.
- Dùng `null` khi dữ liệu không đủ.

## 9. Dữ liệu thiếu hoặc chưa rõ
- Thêm tên trường vào `missingFields` cho các trường quan trọng bị thiếu (ví dụ: `email`, `phone`).
- Thêm tên trường vào `uncertainFields` cho các trường chưa chắc chắn (ví dụ: chức danh chưa rõ, ngày tháng mâu thuẫn).
