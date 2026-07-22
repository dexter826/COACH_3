# Design system và review YODY web deck

## Hướng thiết kế

Thiết kế theo tinh thần retail editorial hiện đại: nền sáng, navy tạo cấu trúc, yellow làm điểm nhấn nhỏ, khoảng trắng rộng và bố cục bất đối xứng có kiểm soát.

```css
--yody-gold: #fab005;
--yody-gold-hover: #e69e00;
--yody-indigo: #3f3f99;
--yody-indigo-dark: #2a2a86;
--yody-white: #ffffff;
--yody-surface: #f3f4f6;
--yody-ink: #111928;
--yody-muted: #9ca3af;
--yody-line: #e5e7eb;
--font-display: "Manrope", system-ui, -apple-system, sans-serif;
--font-body: "Manrope", system-ui, -apple-system, sans-serif;
```

### Sử dụng Icon Lucide tinh tế (Icon Integration Rules)
- **BẮT BUỘC sử dụng Icon Lucide Outline**: Nhúng icon Lucide (`<i data-lucide="name"></i>`) vào các tiêu đề cột, nhãn quy trình (step badges), điểm lưu ý (callouts) và danh sách chính để tạo điểm nhấn thị giác sắc nét.
- **Quy tắc phối màu Icon**:
  - Icon mặc định: `--yody-navy` (`#2A2A83`).
  - Icon điểm nhấn / AI Agent / Ưu tiên: `--yody-yellow` (`#FBAE18`).
  - Icon rủi ro / Cảnh báo: Màu đỏ nhạt / Muted (`#D9383A` hoặc `#66667A`).
- **Kích thước Icon chuẩn**: 18px–24px, căn giữa theo dòng chữ (`vertical-align: middle`). Không dùng icon khổng lồ làm rối bố cục.

### Cân bằng giữa Chống tràn & Tận dụng không gian (Canvas Balance Rule)
- **TẬN DỤNG KHÔNG GIAN SẮC NÉT**: Tuyệt đối không thu nhỏ font chữ quá mức khiến slide bị lọt thỏm, tạo ra các khoảng trắng ("space thừa") khổng lồ ở giữa hoặc dưới slide.
- **Tỷ lệ Font chữ tiêu chuẩn trên Canvas 1280×720**:
  - Hero Cover Title: 56–68px
  - Slide Header Title (`h2`): 40–46px (Dày dặn, dễ đọc từ xa)
  - Eyebrow Subtitle: 15–16px (Uppercase, letter-spacing: 0.12em)
  - Section / Column Subheadings (`h3`): 24–30px
  - Body Text / List items (`p`, `li`): 22–26px (Line-height: 1.45–1.55)
  - Details / Supporting text: 18–20px
  - Table Content: Cell text 19–22px, Header 17–19px (Padding ô `16px 20px`)
- **Phân bổ theo chiều dọc (Vertical Fill)**: Các khung chứa nội dung (`.layout-*`) phải được cấu hình flex/grid để phân bổ đều trên toàn bộ chiều cao khả dụng, không dồn cục ở nửa trên slide.

### Đa dạng hóa ngôn ngữ trình bày (Cấm lặp lại "Title + Card" máy móc)
- **CẤM tuyệt đối**: Dùng một mẫu duy nhất "Tiêu đề + 3 hoặc 4 ô card hình hộp" lặp đi lặp lại trên nhiều slide.
- **6 Dạng bố cục Retail Editorial**:
  1. *Editorial Typography*: Dùng câu trích dẫn hoặc insight kích thước lớn (Hero Text 44–52px) làm trọng tâm.
  2. *Asymmetric Split*: Chia 2 cột bất đối xứng (cột trái lead lớn 30–32px, cột phải thông tin chi tiết 22–24px).
  3. *Clean Bullet / Border List*: Danh sách chữ lớn rành mạch (22–26px) với đường gạch dọc màu Navy/Yellow (`border-left`) hoặc dải chấm tròn.
  4. *Stat Counter & Callouts*: Dùng con số KPI/thống kê cực lớn (64–80px) kèm 1 dòng giải nghĩa trực diện bên dưới.
  5. *Minimalist Tables*: Bảng dữ liệu phẳng, phủ kín chiều cao khả dụng, font chữ 20–22px rành mạch.
  6. *Timeline & Process Flow*: Luồng quy trình nối tiếp bằng thanh ngang mảnh (`border-top`), font tiêu đề bước 20–22px, mô tả 18–20px.

## Checklist review

- **Icon Lucide**: Tích hợp icon Lucide nét mảnh tinh tế ở các tiêu đề và nhãn quan trọng.
- **Không bị lọt thỏm/thừa space**: Chữ vừa vặn, cỡ font body 22–26px dễ đọc, khoảng cách phân bổ đều khắp canvas 1280×720.
- **Zero-Overflow**: Không bị tràn viền dưới hay cắt xén chữ.
- **Đa dạng bố cục**: Không lặp lại ô card nhàm chán.
- **`npm start`**: Chạy mượt mà, Lucide render sắc nét, chuyển slide mượt.
