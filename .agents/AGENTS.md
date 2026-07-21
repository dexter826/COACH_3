# AGENTS.md

Hướng dẫn dành cho các AI Coding Agent (Antigravity, Claude Code, Codex, Cursor, AutoGen...) làm việc trong repository này.

## 1. Giới thiệu Repository

Dự án này chứa hệ thống xử lý hồ sơ ứng viên và tuyển dụng tự động (ATS) cho YODY, bao gồm các AI Agent Skill được tiêu chuẩn hóa tại thư mục `.agents/skills/`.

## 2. Cấu trúc Thư mục Skills

Mỗi skill nằm trong một thư mục riêng thuộc `.agents/skills/`:
- `SKILL.md` — Định nghĩa chính của skill cho AI Agent (YAML frontmatter + prompt hướng dẫn). **Đây là Source of Truth.**
- `README.md` — Tài liệu cho con người đọc: Tổng quan, điều kiện kích hoạt, ví dụ I/O và lịch sử phiên bản.
- `scripts/` (nếu có) — Các kịch bản phụ trợ (ví dụ validate dữ liệu).
- `references/` (nếu có) — Các tài liệu tham chiếu (schema, rules...).
- `assets/` (nếu có) — Thư mục mẫu (template, dữ liệu mẫu...).

## 3. Quy tắc Ứng xử & Viết Code (Coding & Style Rules)

- **Ngôn ngữ phản hồi:** Luôn luôn giao tiếp và phản hồi người dùng bằng **Tiếng Việt**.
- **Quy tắc Comment trong Code:**
  - Áp dụng nguyên tắc tối giản (Minimalist).
  - Chỉ comment ở đầu hàm, không comment từng dòng logic bên trong.
  - Ngắn gọn (dưới 12 từ/dòng), tập trung giải thích "Tại sao" thay vì "Cái gì".
  - Không dùng các tiền tố kiểu AI (như "Fix:", "Update:", "Giải thích:").

## 4. Quy ước Bảo trì (Maintenance Contract)

Khi thay đổi nội dung của một skill:
1. **Đồng bộ `SKILL.md` và `README.md`:** Mọi thay đổi về logic, quy trình hoặc định dạng đầu ra trong `SKILL.md` phải được cập nhật đồng bộ sang `README.md`.
2. **Đồng bộ Version:** Thuộc tính `version` trong YAML frontmatter của `SKILL.md` và phần **Lịch sử phiên bản** trong `README.md` phải được nâng cùng lúc.
3. **Tính tương thích Đa Agent (Cross-agent Compatibility):** Giữ câu chữ hướng dẫn trung lập, không phụ thuộc vào 1 framework hoặc nền tảng Agent cụ thể nào.

## 5. Danh sách các Skill hiện có

1. **candidate-jd-matcher** (`.agents/skills/candidate-jd-matcher/`) — Đánh giá độ phù hợp của ứng viên với JD.
2. **cv-to-candidate-record** (`.agents/skills/cv-to-candidate-record/`) — Trích xuất CV thành hồ sơ JSON chuẩn ATS.
