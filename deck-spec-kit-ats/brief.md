# Phân Tích Kỹ Thuật: Ứng Dụng Spec Kit & Superpowers Vào ATS YODY

## Thông tin chung

- Mục tiêu trình bày: Phân tích luồng kỹ thuật chuyên sâu của tính năng Upload CV trong ATS bằng Spec Kit & Superpowers.
- Đối tượng người nghe: Đội ngũ Kỹ thuật, Product Builder, HR/TA Tech Lead.
- Thời lượng dự kiến: 30-40 phút.
- Số slide đề xuất: 22 slide (Đã bổ sung các slide Intro, Flow và chuẩn hóa chính xác 7 bước Superpowers).
- Thông điệp chính: Hiện thực hóa quy trình tự động hóa ATS từ khâu thiết kế dữ liệu (Spec Kit) đến khâu thực thi chuẩn 7 bước (Superpowers).
- Quyết định/hành động mong muốn từ người nghe: Chốt kiến trúc hệ thống và luồng Tasks để triển khai.

## Storyline

- Cấu trúc 3 phần rõ rệt: 
  - Phần 1: Tự động hóa với AI Skills.
  - Phần 2: Thiết kế dữ liệu với Spec Kit.
  - Phần 3: Kỷ luật thực thi với Superpowers (Workflow 7 bước).

## Outline từng slide

### [Intro] Phần 1: Tự Động Hóa Với AI Skills
- Mục tiêu: Khởi đầu Phần 1.
- Thông điệp chính: Ứng dụng AI Agent thay thế tác vụ thủ công. Tập trung vào Bóc tách CV và Đối sánh JD.

### Slide 1 — Kiến Trúc Tổng Quan AI Skills
- Thông điệp chính: Agent Skills biến tài liệu thô thành dữ liệu cấu trúc.
- Hình ảnh/Visual concept: ats_ai_skills_concept.png.

### Slide 2 — Flow Kỹ Thuật: cv-to-candidate-record
- Thông điệp chính: Khép kín luồng đọc, trích xuất và tự động sửa lỗi JSON (5 bước).

### Slide 3 — Dữ Liệu Đầu Ra: cv-to-candidate-record
- Thông điệp chính: Phân vùng rõ ràng trường dữ liệu JSON.

### Slide 4 — Flow Kỹ Thuật: candidate-jd-matcher
- Thông điệp chính: 5 bước đối sánh ngữ nghĩa, chấm điểm logic thay vì keyword.

### [Intro] Phần 2: Thiết Kế Dữ Liệu Với Spec Kit
- Mục tiêu: Khởi đầu Phần 2.
- Thông điệp chính: Chuyển đổi ý tưởng thành Artifact kỹ thuật.

### [Flow] Quy Trình 6 Bước Của Spec Kit
- Thông điệp chính: Sơ đồ luồng 6 bước (Constitution, Specify, Clarify, Plan, Tasks, Analyze).

### Slide 5 — Spec Kit: Constitution
- Thông điệp chính: Bảo mật, Phân quyền, Kiểm soát, Truy vết.

### Slide 6 — Spec Kit: Specify
- Thông điệp chính: User Story và 5 Acceptance Criteria cho Upload CV.

### Slide 7 — Spec Kit: Clarify
- Thông điệp chính: Hỗ trợ file, bắt buộc email/sđt, xử lý trùng lặp, ngoại lệ.

### Slide 8 — Spec Kit: Plan
- Thông điệp chính: Cấu trúc Candidate/Application, Storage, Luồng upload.
- Hình ảnh/Visual concept: ats_architecture_diagram.png.

### Slide 9 — Spec Kit: Tasks
- Thông điệp chính: 9 tasks kỹ thuật phân rã.

### Slide 10 — Spec Kit: Analyze
- Thông điệp chính: Rà soát chéo Spec và Plan.

### [Intro] Phần 3: Kỷ Luật Thực Thi Của Superpowers
- Mục tiêu: Khởi đầu Phần 3.
- Thông điệp chính: Thiết lập kỷ luật cứng rắn cho AI (7 bước workflow).

### [Flow] Flow Kỷ Luật AI: 7 Bước Superpowers
- Thông điệp chính: Sơ đồ 7 bước (Brainstorming $\rightarrow$ Git Worktrees $\rightarrow$ Writing Plans $\rightarrow$ Subagent $\rightarrow$ TDD $\rightarrow$ Code Review $\rightarrow$ Finishing).

### Slide 11 — Superpowers: Brainstorming & Writing Plans (B.1 & B.3)
- Thông điệp chính: Khám phá edge cases, chốt thiết kế và chia nhỏ task.

### Slide 12 — Superpowers: Git Worktrees & TDD (B.2 & B.5)
- Thông điệp chính: Tạo môi trường cô lập, code theo nguyên tắc Red-Green-Refactor.

### Slide 13 — Superpowers: Subagent-Driven & Debugging (B.4)
- Thông điệp chính: Dispatch đa nhiệm (UI Upload và Logic Parse) và xử lý log hệ thống.

### Slide 14 — Superpowers: Code Review (B.6)
- Thông điệp chính: Reivew code liên tục giữa các agent, chặn code lỗi.

### Slide 15 — Superpowers: Finishing Branch (B.7)
- Thông điệp chính: Nghiệm thu (Verification), dọn dẹp worktree và merge.

### Slide 16 — Lộ Trình Triển Khai MVP Tính Năng Upload CV
- Thông điệp chính: Roadmap thực chiến.
- Hình ảnh/Visual concept: ats_roadmap_mvp.png.

### Slide 17 — Tổng Kết Kỹ Thuật
- Thông điệp chính: Spec Kit (Kiến trúc) + Superpowers (Kỷ luật code) = Thành công.
