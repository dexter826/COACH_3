---
name: report-to-yody-web-deck
description: Chuyển báo cáo, dữ liệu, tài liệu văn phòng, PDF, hình ảnh hoặc slide cũ thành web deck Reveal.js chuẩn YODY. Dùng cho báo cáo, phân tích, nghiên cứu, đề xuất, xin phê duyệt hoặc demo cần storyline, brief được duyệt và source trình chiếu hoàn chỉnh.
---

# Report to YODY Web Deck

## Giai đoạn 1 — Phân tích và duyệt brief

1. Đọc toàn bộ tài liệu trong phạm vi người dùng giao bằng công cụ phù hợp. Công khai file lỗi, không hỗ trợ hoặc không truy cập được.
2. Xác định mục tiêu, người nghe, thời lượng và giới hạn slide; không hỏi lại thông tin đã có. Nếu người dùng giao quyền quyết định thời lượng hoặc số slide, tự chọn và ghi rõ đó là giả định của AI.
3. Đọc [references/brief-and-content.md](references/brief-and-content.md), xây storyline. **BẮT BUỘC chủ động rà soát và đề xuất ít nhất 1–3 vị trí hình ảnh minh họa đắt giá** (ảnh khái niệm AI concept, sơ đồ kiến trúc, UI mockup sản phẩm) vào các slide trọng tâm trong `brief.md`.
4. Tạo `brief.md` đúng schema trong reference, ghi rõ nguồn đã đọc, dữ liệu thiếu, mâu thuẫn, giả định, suy luận và các vị trí ảnh đề xuất.
5. Trình brief rồi **dừng lại**. Không khởi tạo project, cài dependency hoặc viết slide cho đến khi người dùng duyệt rõ ràng.

## Giai đoạn 2 — Dựng và kiểm tra deck

Chỉ bắt đầu sau khi brief được duyệt.

1. Đọc [references/design-and-review.md](references/design-and-review.md). Tuân thủ nghiêm ngặt quy tắc **Chống tràn khung (Zero-Overflow)** ở 1280×720, **Cân bằng khoảng không gian (Canvas Balance)** và **Đa dạng hóa bố cục** (Tuyệt đối không lặp lại mẫu Title + 3 Card nhàm chán).
2. Với project mới, chạy `node scripts/init-deck.mjs <thu-muc-deck> --approved`. Với deck đã có, chỉnh tại chỗ và giữ nguyên tài liệu nguồn cùng asset hiện hữu; không chạy script khởi tạo. Nếu không xác định được loại project, hỏi người dùng trước khi sửa.
3. Chuyển outline đã duyệt thành Reveal.js deck; sử dụng linh hoạt các dạng bố cục Editorial Typography, Asymmetric Split, Minimalist List, Process Flow, Table phẳng và Khung ảnh minh họa chiến lược để đảm bảo tính thẩm mỹ cao và nhịp điệu sinh động.
4. Tạo `visual-spec.json` chứa khai báo hợp đồng các ảnh minh họa chưa có. Nếu người dùng yêu cầu tạo ảnh AI, sử dụng công cụ tạo ảnh để sinh ảnh và đặt vào thư mục `assets/`.
5. Chạy `npm start`, kiểm tra từng slide ở 1280×720, sửa triệt để lỗi tràn/cắt/lệch, biểu đồ và điều hướng.
6. Giao source hoàn chỉnh nhưng không đóng gói `node_modules`. Chỉ tạo speaker notes, nguồn trên slide, ảnh AI, PDF hoặc deploy khi người dùng yêu cầu.

## Đầu ra

Project deck gồm:

```text
brief.md
index.html
css/yody-theme.css
js/main.js
visual-spec.json
assets/yody-logo.png
package.json
package-lock.json
```

Nếu không thể review trong trình duyệt, báo rõ deck chưa được xác minh trực quan.
