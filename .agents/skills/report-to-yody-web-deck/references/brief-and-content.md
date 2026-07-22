# Quy Định Brief, Storyline & Cấu Trúc Nội Dung

Tài liệu này quy định chuẩn mực biên soạn nội dung, lựa chọn storyline và cấu trúc file `brief.md` cho các bài trình bày YODY Web Deck.

## 1. Nguyên Tắc Nội Dung

- **Tính toàn vẹn dữ liệu:** Tóm tắt và sắp xếp lại thông tin từ tài liệu gốc nhưng giữ nguyên ngữ nghĩa, số liệu, bài học và insight cốt lõi. Không bịa đặt số liệu hay quan hệ nhân quả.
- **Minh bạch thông tin:** Phân biệt rõ dữ liệu gốc, giả định và đề xuất của AI. Ghi rõ các trường dữ liệu thiếu hoặc nghi ngờ vào phần ghi chú.
- **Đề xuất Visual Concept:** Chủ động rà soát và đề xuất 1–3 vị trí hình ảnh minh họa có giá trị cao (AI Concept Art, sơ đồ kiến trúc hệ thống, UI Mockup) cho các slide trọng tâm.

## 2. Phương Pháp Lựa Chọn Storyline

Lựa chọn storyline phù hợp với mục tiêu của bài trình bày:

| Mục tiêu trình bày | Khung Storyline Ưu Tiên |
| :--- | :--- |
| **Báo cáo kết quả** | Mục tiêu $\rightarrow$ Kết quả đạt được $\rightarrow$ Nguyên nhân $\rightarrow$ Bài học $\rightarrow$ Kế hoạch tiếp theo |
| **Phân tích kỹ thuật** | Bối cảnh $\rightarrow$ Câu hỏi/Vấn đề $\rightarrow$ Trích dẫn chứng minh/Mã nguồn $\rightarrow$ Insight $\rightarrow$ Hàm ý kỹ thuật |
| **Đề xuất / Xin phê duyệt** | Vấn đề $\rightarrow$ Tác động $\rightarrow$ Phương án lựa chọn $\rightarrow$ Khuyến nghị $\rightarrow$ Quyết định cần chốt |
| **Tiến độ dự án** | Cam kết $\rightarrow$ Trạng thái hiện tại $\rightarrow$ Rủi ro & Thách thức $\rightarrow$ Điều chỉnh $\rightarrow$ Mốc hoàn thành |

## 3. Schema Chuẩn `brief.md`

```markdown
# [Tên Bài Trình Bày]

## Thông tin chung

- Mục tiêu trình bày:
- Đối tượng người nghe:
- Thời lượng dự kiến:
- Số slide đề xuất:
- Thông điệp chính:
- Quyết định/hành động mong muốn từ người nghe:
- Tài liệu đã tham khảo:

## Storyline

- Logic kể chuyện tổng thể:
- Cách các phần kết nối:
- Kết luận/Hàm ý người nghe cần ghi nhớ:

## Outline từng slide

### Slide 1 — [Tiêu đề truyền tải thông điệp]

- Mục tiêu slide:
- Thông điệp chính:
- Trích dẫn/Dữ liệu gốc:
- Bố cục đề xuất:
- Hình ảnh/Visual concept: [Tên hình ảnh minh họa nếu có]

## Điểm cần xác nhận

- Dữ liệu còn thiếu:
- Suy luận hoặc đề xuất của AI:
- Quyết định cần người dùng chốt:
```

## 4. Hợp Đồng Visual Assets (`visual-spec.json`)

Mỗi hình ảnh minh họa được khai báo trong file `visual-spec.json` dưới dạng một JSON Array:

```json
[
  {
    "fileName": "ats_architecture_diagram.png",
    "prompt": "Clean minimalist corporate technology diagram representing ATS module architecture, white background, navy blue and golden yellow accents",
    "aspectRatio": "16:9",
    "altText": "Sơ đồ kiến trúc tổng quan các mô-đun ATS",
    "placement": "cover"
  }
]
```
