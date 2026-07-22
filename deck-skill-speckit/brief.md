# Phân Tích Kỹ Thuật 2 Skill ATS: cv-to-candidate-record & candidate-jd-matcher

## Thông tin chung

- Mục tiêu trình bày: Báo cáo phân tích chuyên sâu nội dung, quy trình, tài nguyên và cấu trúc kỹ thuật của 2 AI Skill (`cv-to-candidate-record` và `candidate-jd-matcher`) trong hệ thống YODY ATS bằng phương pháp trích dẫn trực tiếp mã nguồn / văn bản gốc.
- Đối tượng người nghe: Đội ngũ Kỹ thuật / Đội ngũ Sản phẩm YODY.
- Thời lượng: 8 - 10 phút (Giả định của AI).
- Giới hạn số slide: 6 slide (Phân chia thành 2 phần rõ ràng cho 2 skill).
- Số slide đề xuất: 6 slide.
- Thông điệp chính: Trích dẫn trực tiếp văn bản/mã nguồn từ SKILL.md, JSON Schema, Normalization Rules, Python Script và Output JSON Format để phân tích chi tiết cơ chế hoạt động của 2 skill.
- Quyết định/hành động mong muốn từ người nghe: Phê duyệt brief và cấu trúc hiển thị trích dẫn nội dung trực tiếp trên Web Deck Reveal.js.
- Tài liệu đã đọc:
  1. `c:\MyProject\YODY\COACH_3\.agents\skills\cv-to-candidate-record\SKILL.md` (Metadata, Bối cảnh, Quy trình 10 bước, Nguyên tắc xử lý)
  2. `c:\MyProject\YODY\COACH_3\.agents\skills\cv-to-candidate-record\references\candidate-schema.md` (Cấu trúc schema chi tiết)
  3. `c:\MyProject\YODY\COACH_3\.agents\skills\cv-to-candidate-record\references\normalization-rules.md` (9 nhóm quy tắc chuẩn hóa dữ liệu)
  4. `c:\MyProject\YODY\COACH_3\.agents\skills\cv-to-candidate-record\assets\candidate-record.template.json` (Template JSON mẫu)
  5. `c:\MyProject\YODY\COACH_3\.agents\skills\cv-to-candidate-record\scripts\validate_candidate_record.py` (Script Python kiểm thử tự động)
  6. `c:\MyProject\YODY\COACH_3\.agents\skills\candidate-jd-matcher\SKILL.md` (Metadata, 2 luồng dữ liệu vào, Quy tắc chấm điểm, Output JSON Format)
- Tài liệu không đọc được: Không có.

## Storyline

- Logic kể chuyện tổng thể: Chia thành 2 phần phân tích chuyên sâu riêng biệt cho từng skill theo mô hình: **[Cột trái: Trích dẫn nội dung/code gốc] $\rightarrow$ [Cột phải: Phân tích & Giải thích kỹ thuật trực tiếp]**.
- Cách các phần kết nối:
  - **Phần 1 (Slide 1, 2, 3, 4):** Skill `cv-to-candidate-record` – Khai báo Metadata, trích đoạn SKILL.md quy trình 10 bước, trích đoạn Schema/Rules và trích đoạn mã nguồn Python script kiểm thử.
  - **Phần 2 (Slide 5, 6):** Skill `candidate-jd-matcher` – Trích đoạn SKILL.md ngữ cảnh so khớp 2 luồng dữ liệu & trích đoạn Output JSON response mẫu 3 trạng thái phỏng vấn.

## Outline từng slide

### Slide 1 — Metadata Tổng Quan & Phân Phối Trách Nhiệm 2 Skill

- Mục tiêu slide: Khai báo metadata và phân định vai trò của 2 skill trong dự án.
- Thông điệp chính: Skill 1 đóng vai trò bóc tách & chuẩn hóa (Parsing Layer); Skill 2 đóng vai trò so khớp & đánh giá (Matching Layer).
- Nội dung dự kiến:
  - Trích dẫn gốc YAML Frontmatter của 2 file `SKILL.md` (`name`, `version`, `description`).
  - Cột phải: Phân tích phân phối trách nhiệm giữa 2 lớp xử lý.
- Dữ liệu/bằng chứng: Nội dung YAML Frontmatter từ `cv-to-candidate-record/SKILL.md` và `candidate-jd-matcher/SKILL.md`.
- Layout đề xuất: 2-Column Spec Layout (Trái: Dark Code Extract, Phải: Phân tích kỹ thuật).

### Slide 2 — Skill 1: cv-to-candidate-record – Trích Đoạn SKILL.md & Quy Trình 10 Bước

- Mục tiêu slide: Phân tích chi tiết quy trình 10 bước bóc tách CV.
- Thông điệp chính: Sử dụng quy trình bóc tách 10 bước khép kín với cơ chế kiểm định tự động (loop until exit code 0).
- Nội dung dự kiến:
  - Trích đoạn nguyên văn Section 1 (Bối cảnh) và Section 3 (Quy trình 10 bước) từ SKILL.md.
  - Cột phải: Phân tích cơ chế gác cổng (Quality Gate), chấp nhận đa dạng đầu vào (PDF, DOCX, TXT, MD, Image, Raw Text) và nguyên tắc ghi nhận `missingFields` / `uncertainFields`.
- Dữ liệu/bằng chứng: Văn bản gốc từ `cv-to-candidate-record/SKILL.md`.
- Layout đề xuất: 2-Column Code/Text Extract Layout.

### Slide 3 — Skill 1: Trích Đoạn JSON Schema & Quy Tắc Chuẩn Hóa

- Mục tiêu slide: Phân tích cấu trúc JSON Template và 9 nhóm quy tắc chuẩn hóa.
- Thông điệp chính: Biến đổi dữ liệu thô thành định dạng JSON chuẩn mực bằng bộ quy tắc nghiêm ngặt.
- Nội dung dự kiến:
  - Trích đoạn JSON Template gốc từ `assets/candidate-record.template.json`.
  - Trích đoạn các câu quy tắc gốc từ `references/normalization-rules.md` (Email lowercase, SĐT số & `+`, Kỹ năng alias `ReactJS` $\rightarrow$ `React`, Ngày tháng `YYYY-MM` / `present`, Sắp xếp chronology).
- Dữ liệu/bằng chứng: Code JSON trong `template.json` và câu chữ gốc trong `normalization-rules.md`.
- Layout đề xuất: 2-Column Code & Rules Extract Layout.

### Slide 4 — Skill 1: Trích Đoạn Mã Nguồn Script Python Validation

- Mục tiêu slide: Phân tích logic kiểm thử dữ liệu tự động của Skill 1.
- Thông điệp chính: Đảm bảo 100% dữ liệu đạt chuẩn trước khi nạp vào ATS thông qua script Python `validate_candidate_record.py`.
- Nội dung dự kiến:
  - Trích đoạn mã Python gốc (`validate_email`, `validate_date`, check trùng lặp `lowered_skills`).
  - Cột phải: Phân tích logic Regex Email/Date, logic ép kiểu chữ thường để lọc trùng skill và yêu cầu đủ 7 root keys bắt buộc (Exit code 1 nếu lỗi, Exit code 0 khi hợp lệ).
- Dữ liệu/bằng chứng: Đoạn code Python thực tế từ `scripts/validate_candidate_record.py`.
- Layout đề xuất: Code Highlight & Technical Analysis Layout.

### Slide 5 — Skill 2: candidate-jd-matcher – Trích Đoạn Ngữ Cảnh & Semantic Matching

- Mục tiêu slide: Phân tích cơ chế AI So Khớp Ngữ Nghĩa của Skill 2.
- Thông điệp chính: So khớp ngữ nghĩa thông minh thay vì so khớp từ khóa cứng nhắc.
- Nội dung dự kiến:
  - Trích đoạn nguyên văn phần Ngữ cảnh & Hướng dẫn chấm điểm từ `candidate-jd-matcher/SKILL.md`.
  - Cột phải: Phân tích tư duy Semantic Match (VD: React $\in$ Frontend Framework), 2 luồng input (`candidateRecord` JSON & `jobDescription` Text) và 3 tiêu chí tính Score (0 - 100).
- Dữ liệu/bằng chứng: Văn bản gốc trong `candidate-jd-matcher/SKILL.md`.
- Layout đề xuất: 2-Column Extract & AI Logic Layout.

### Slide 6 — Skill 2: Trích Đoạn Output JSON Response & 3 Trạng Thái Recommendation

- Mục tiêu slide: Phân tích cấu trúc JSON đầu ra bắt buộc và 3 mức phỏng vấn.
- Thông điệp chính: Trả về kết quả so khớp duy nhất dưới dạng JSON chuẩn xác kèm lý do cô đọng.
- Nội dung dự kiến:
  - Trích đoạn Output Format mẫu gốc từ `candidate-jd-matcher/SKILL.md` (`score`, `recommendation`, `reason`).
  - Cột phải: Phân tích quy định trả về JSON duy nhất (không markdown code block, không text dư) và ý nghĩa 3 trạng thái (`NÊN PHỎNG VẤN`, `CÂN NHẮC`, `TỪ CHỐI`).
- Dữ liệu/bằng chứng: JSON mẫu trong `candidate-jd-matcher/SKILL.md`.
- Layout đề xuất: JSON Response Spec & Recommendation Cards Layout.

## Điểm cần xác nhận

- Dữ liệu còn thiếu: Không có.
- Nội dung mâu thuẫn: Không có.
- Suy luận hoặc đề xuất của AI:
  1. Đã cập nhật `brief.md` đồng bộ 100% với phương pháp trích dẫn nội dung trực tiếp đã được người dùng duyệt.
  2. Brief phân định rõ ràng 2 phần: Phần 1 cho Skill 1 (Slide 1-4) và Phần 2 cho Skill 2 (Slide 5-6).
- Quyết định cần người dùng chốt: Phê duyệt `brief.md` đã cập nhật.
