# Brief, storyline và tính toàn vẹn nội dung

## Nguyên tắc nội dung

- Đọc đủ tài liệu trong phạm vi được giao và công khai file không truy cập được.
- Giữ bối cảnh, lập luận, bằng chứng, số liệu, insight và sắc thái cần thiết; được viết lại, gom nhóm, đổi thứ tự hoặc bỏ lặp.
- Không bịa số liệu, benchmark, KPI, nguồn, kết luận hoặc quan hệ nhân quả.
- Phân biệt **dữ liệu gốc**, **suy luận** và **đề xuất**; hai loại sau phải được gắn nhãn và có căn cứ.
- Nêu rõ dữ liệu thiếu, đơn vị hoặc thời gian không rõ và nguồn mâu thuẫn.
- Chỉ tạo brief khi đã biết mục tiêu, người nghe, thời lượng và giới hạn slide. Nếu người dùng giao quyền quyết định hai thông tin cuối, tự chọn hợp lý và ghi là giả định của AI.

### Quy tắc bắt buộc đề xuất hình ảnh minh họa (Visual Proposal Rule)
- **CẤM mặc định bỏ qua ảnh**: Ngay cả với tài liệu gốc là văn bản thuần túy (`.md`, `.docx`, `.pdf` chỉ có chữ), AI **BẮT BUỘC phải chủ động phân tích và đề xuất ít nhất 1–3 vị trí hình ảnh minh họa đắt giá** (ảnh khái niệm AI concept, sơ đồ kiến trúc, UI mockup sản phẩm, ảnh bối cảnh người dùng) vào các slide trọng tâm trong `brief.md`.
- Tuyệt đối không được ghi `Image placeholder: Không` trên toàn bộ deck khi chưa đánh giá nhu cầu tạo điểm nhấn thị giác cho bài trình bày.

## Chọn storyline

Chọn logic theo mục tiêu, không ép mọi deck vào một công thức:

| Mục tiêu | Storyline ưu tiên |
| --- | --- |
| Báo cáo kết quả | Mục tiêu → Kết quả → Nguyên nhân → Bài học → Next steps |
| Phân tích | Bối cảnh → Câu hỏi → Bằng chứng → Insight → Hàm ý |
| Đề xuất/xin duyệt | Vấn đề → Tác động → Phương án → Khuyến nghị → Quyết định cần xin |
| Tiến độ | Cam kết → Trạng thái → Rủi ro → Điều chỉnh → Mốc tiếp theo |
| Nghiên cứu | Phạm vi → Phương pháp → Phát hiện → Ý nghĩa → Hạn chế |
| Demo dự án | Nhu cầu → Giải pháp → Luồng demo → Giá trị → Kế hoạch tiếp theo |

Mỗi slide chỉ có một trọng tâm. Tiêu đề phải truyền tải kết luận, insight hoặc hành động; tránh tiêu đề chung như “Phân tích”, “Kết quả”, “Thông tin”.

## Schema `brief.md`

```markdown
# [Tên deck]

## Thông tin chung

- Mục tiêu trình bày:
- Đối tượng người nghe:
- Thời lượng:
- Giới hạn số slide:
- Số slide đề xuất:
- Thông điệp chính:
- Quyết định/hành động mong muốn từ người nghe:
- Tài liệu đã đọc:
- Tài liệu không đọc được:

## Storyline

- Logic kể chuyện tổng thể:
- Cách các phần kết nối:
- Kết luận người nghe cần ghi nhớ:

## Outline từng slide

### Slide 1 — [Tiêu đề dạng thông điệp]

- Mục tiêu slide:
- Thông điệp chính:
- Nội dung dự kiến:
- Dữ liệu/bằng chứng:
- Cách thể hiện:
- Layout đề xuất:
- Biểu đồ:
- Image placeholder: [Phải đề xuất ảnh cho slide trọng tâm, ví dụ: UI Mockup / AI Concept Art / Architecture Diagram]
- Giả định/điểm chưa chắc chắn:

## Điểm cần xác nhận

- Dữ liệu còn thiếu:
- Nội dung mâu thuẫn:
- Suy luận hoặc đề xuất của AI:
- Quyết định cần người dùng chốt:
- Slide có thể thêm, bỏ hoặc gộp:
```

Sau khi tạo brief, dừng lại để người dùng duyệt hoặc yêu cầu sửa.

## Hợp đồng `visual-spec.json`

File là một JSON array. Mỗi ảnh minh họa chưa có tương ứng đúng một entry:

```json
[
  {
    "fileName": "yody_image_01.png",
    "prompt": "Mô tả đủ chi tiết để người dùng tạo hoặc chọn ảnh phù hợp",
    "aspectRatio": "16:9",
    "altText": "Mô tả ngắn nội dung ảnh",
    "placement": "cover"
  }
]
```

- Filename phải duy nhất và khớp placeholder trong HTML.
- `placement` chỉ nhận `cover`, `contain` hoặc `crop-center`; tỷ lệ phải khớp vùng layout.
- Placeholder hiển thị filename, prompt rút gọn và tỷ lệ.
- Không thêm entry cho logo, icon, chart, screenshot hoặc ảnh gốc đã có.
- Giữ `[]` chỉ khi bài trình bày được người dùng yêu cầu rõ ràng không dùng ảnh.
