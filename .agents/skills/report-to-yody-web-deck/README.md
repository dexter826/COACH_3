# Skill: Report to YODY Web Deck

Tài liệu hướng dẫn sử dụng và tích hợp cho Skill `report-to-yody-web-deck`.

## Tổng quan

Skill này chuyển báo cáo, dữ liệu, tài liệu văn phòng, PDF, hình ảnh hoặc slide cũ thành một web deck Reveal.js theo chuẩn trình bày YODY. Quy trình tập trung vào storyline, brief được duyệt, hệ thống thiết kế Retail Editorial và kiểm tra trực quan để deck có thể trình chiếu ngay.

## Điều kiện Kích hoạt

Skill được kích hoạt khi người dùng yêu cầu:
- Chuyển báo cáo, nghiên cứu, phân tích, đề xuất hoặc tài liệu nội bộ thành bài trình chiếu.
- Tạo web deck Reveal.js theo chuẩn YODY.
- Dựng slide từ PDF, Word, Excel, hình ảnh, slide cũ hoặc nội dung thô.
- Chuẩn bị deck xin phê duyệt, demo, họp chiến lược hoặc trình bày điều hành.

## Tài nguyên & Thư mục Phụ trợ

Skill này đi kèm các tài nguyên tại thư mục `report-to-yody-web-deck/`:
- **`references/brief-and-content.md`**: Quy tắc phân tích tài liệu, chọn mức chắt lọc nội dung, xây dựng storyline và tạo `brief.md`.
- **`references/design-and-review.md`**: Quy chuẩn thiết kế, bố cục, typography, Lucide Icons và tiêu chuẩn kiểm tra Zero-Overflow.
- **`assets/starter-template/`**: Template Reveal.js khởi tạo sẵn cấu trúc HTML, CSS, JS, package và logo YODY.
- **`scripts/init-deck.mjs`**: Script khởi tạo thư mục deck mới từ starter template.

## Quy trình Xử lý

### Giai đoạn 1 - Phân tích & Duyệt Brief

1. Xác nhận chế độ chắt lọc nội dung: Executive, Balanced hoặc Detailed.
2. Đọc toàn bộ tài liệu nguồn.
3. Xác định mục tiêu, người nghe, thời lượng và giới hạn số slide.
4. Tham chiếu `references/brief-and-content.md`.
5. Tạo `brief.md` theo schema quy định.
6. Trình người dùng duyệt brief và tạm dừng cho đến khi có đồng ý rõ ràng.

### Giai đoạn 2 - Khởi tạo & Dựng Deck

1. Đọc `references/design-and-review.md`.
2. Khởi tạo dự án mới bằng `node scripts/init-deck.mjs <thu-muc-deck> --approved` hoặc chỉnh sửa trực tiếp dự án deck hiện có.
3. Chuyển outline đã duyệt thành các section Reveal.js trong `index.html`.
4. Khai báo và sinh visual assets theo `visual-spec.json`.
5. Chạy `npm start`, kiểm tra trực quan ở canvas 1280x720 và sửa triệt để lỗi tràn chữ, đè chữ, cắt lề hoặc sai nhịp bố cục.

## Cấu trúc Đầu ra

```text
brief.md
index.html
css/yody-theme.css
js/main.js
visual-spec.json
assets/
package.json
```

## Lịch sử Phiên bản

- **v1.0.0** (2026-07-22): Khởi tạo Skill chuyển báo cáo và tài liệu nguồn thành web deck Reveal.js chuẩn YODY kèm starter template, quy trình duyệt brief và checklist kiểm tra trực quan.
