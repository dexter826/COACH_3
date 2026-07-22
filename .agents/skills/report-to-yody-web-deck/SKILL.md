---
name: report-to-yody-web-deck
description: Chuyển báo cáo, dữ liệu, tài liệu văn phòng, PDF, hình ảnh hoặc slide cũ thành web deck Reveal.js chuẩn YODY. Dùng cho báo cáo, phân tích, nghiên cứu, đề xuất, xin phê duyệt hoặc demo cần storyline, brief được duyệt và source trình chiếu hoàn chỉnh.
---

# Report to YODY Web Deck

Skill hướng dẫn quy trình 2 giai đoạn chuyển đổi tài liệu thô thành bài trình bày Web Deck Reveal.js theo chuẩn Retail Editorial của YODY.

## Giai Đoạn 1 — Phân Tích & Duyệt Brief

1. **Phân tích tài liệu gốc:** Đọc toàn bộ tài liệu đầu vào được giao. Xác định mục tiêu, đối tượng người nghe, thời lượng trình bày và giới hạn số slide.
2. **Xây dựng Storyline & Brief:** Đọc [references/brief-and-content.md](references/brief-and-content.md). Chọn storyline phù hợp với mục tiêu và đề xuất 1–3 vị trí hình ảnh minh họa đắt giá (AI Concept, sơ đồ kiến trúc, UI mockup).
3. **Tạo `brief.md`:** Khởi tạo file `brief.md` theo đúng schema quy định.
4. **Trình duyệt & Tạm dừng:** Trình `brief.md` cho người dùng phê duyệt. **Không** khởi tạo mã nguồn deck hoặc cài đặt thư viện cho đến khi nhận được sự đồng ý rõ ràng.

## Giai Đoạn 2 — Khởi Tạo & Dựng Deck

1. **Đọc Quy Chuẩn Thiết Kế:** Đọc [references/design-and-review.md](references/design-and-review.md) để nắm bộ quy tắc Design System, Lucide Icons và quy chuẩn chống tràn (Zero-Overflow).
2. **Khởi tạo dự án:** 
   - Dự án mới: Chạy `node scripts/init-deck.mjs <thu-muc-deck> --approved`.
   - Dự án đã có: Chỉnh sửa trực tiếp tại thư mục hiện hành.
3. **Dựng mã nguồn Slide:** Chuyển outline đã duyệt thành các phần tử HTML Reveal.js trong `index.html`. Sử dụng đa dạng các dạng bố cục (Editorial Typography, Asymmetric Split, Code/Spec Comparison, Process Flow).
4. **Khai báo Visual Assets:** Tạo `visual-spec.json` khai báo hợp đồng các hình ảnh minh họa cần thiết và sinh ảnh vào thư mục `assets/`.
5. **Kiểm tra trực quan & Đóng gói:** Chạy `npm start`, kiểm tra trực quan bài trình bày ở độ phân giải 1280×720 canvas, khắc phục triệt để các lỗi đè chữ, cắt lề hoặc tràn khung.

## Cấu Trúc Đầu Ra

```text
brief.md
index.html
css/yody-theme.css
js/main.js
visual-spec.json
assets/
package.json
```
