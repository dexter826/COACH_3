# Quy Chuẩn Thiết Kế & Kiểm Trực Quan YODY Web Deck

Tài liệu này định nghĩa hệ thống thiết kế (Design System), bộ quy chuẩn giao diện và checklist kiểm tra trực quan cho các bài trình bày YODY Web Deck trên khung canvas 1280×720.

## 1. Design Tokens & Palette Màu

```css
:root {
  --yody-navy: #3F3F99;
  --yody-navy-deep: #2A2A86;
  --yody-yellow: #FAB005;
  --yody-white: #FFFFFF;
  --yody-surface: #F3F4F6;
  --yody-ink: #111928;
  --yody-muted: #9CA3AF;
  --yody-line: #E5E7EB;
  --safe-x: 56px;
  --safe-y: 32px;
  --font-display: "Manrope", system-ui, sans-serif;
  --font-body: "Manrope", system-ui, sans-serif;
}
```

## 2. Quy Chuẩn Canvas & Chống Tràn (Zero-Overflow)

- **Kích thước Canvas tiêu chuẩn:** 1280px × 720px.
- **Tiêu chuẩn lề an toàn (Safe Area):** `--safe-x: 56px`, `--safe-y: 32px`.
- **Hệ thống Font chữ chuẩn hóa:**
  - Hero Cover Title (`h1`): 52px – 60px
  - Slide Header Title (`h2`): 36px – 42px
  - Section Subtitle / Eyebrow: 14px – 15px (Uppercase, letter-spacing: 0.12em)
  - Card / Block Title (`h3`): 19px – 22px
  - Body Text / Paragraphs (`p`, `li`): 16px – 18px (Line-height: 1.4 – 1.5)
  - Code Block / Technical Details: 13px – 14.5px (Line-height: 1.35)
- **Phân bổ chiều dọc (Vertical Fill):** Nội dung slide phải phân bổ đều theo chiều dọc canvas, không dồn cục ở nửa trên và không tràn qua footer ở phía dưới.

## 3. Tích Hợp Icon Lucide Outline

- **Định dạng:** Sử dụng icon Lucide nét mảnh (`<i data-lucide="name"></i>`) ở các tiêu đề, thẻ quy trình và điểm lưu ý.
- **Màu sắc Icon:**
  - Icon mặc định / Cấu trúc: `--yody-navy` (`#3F3F99`).
  - Icon điểm nhấn / AI Concept: `--yody-yellow` (`#FAB005`).
  - Icon thành công / Validated: Mầu xanh lá (`#137333`).
- **Kích thước:** 16px – 20px, căn giữa theo dòng chữ (`vertical-align: middle`).

## 4. Các Mẫu Bố Cục Chủ Đạo (Layout Patterns)

1. **Editorial Typography:** Dùng tiêu đề và phát biểu chỉ đạo lớn làm trọng tâm visual.
2. **Asymmetric Split (Chia 2 Cột Bất Đối Xứng):** Cột trái dẫn dắt thông tin/code block, cột phải phân tích chi tiết.
3. **Code & Spec Comparison:** Cột trái trích dẫn trực tiếp mã nguồn/schema gốc, cột phải giải thích logic kỹ thuật.
4. **Process Flow / Step Grid:** Luồng quy trình nối tiếp hoặc dạng lưới các bước gọn gàng.
5. **Minimalist Table:** Bảng phẳng rành mạch với padding ô 12px – 16px.

## 5. Checklist Review Trước Khi Bàn Giao

- [ ] **Zero-Overflow:** Không có văn bản, bảng biểu hay khối code bị tràn viền canvas 1280×720 hoặc đè lên footer.
- [ ] **Canvas Balance:** Khoảng trắng phân bổ hài hòa, chữ to rõ nét, không bị lọt thỏm hay tạo khoảng trống thừa ở giữa slide.
- [ ] **Trực quan Lucide:** Icon Lucide hiển thị sắc nét, đúng chủ đề và quy chuẩn màu.
- [ ] **Dev Server:** Chạy mượt mà trên `npm start`, chuyển slide mượt và không có lỗi JS trên Console.
