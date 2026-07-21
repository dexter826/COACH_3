# AGENTS.md — Candidate JD Matcher Skill

Hướng dẫn dành cho các AI Coding Agent (Antigravity, Claude Code, Codex, Cursor, AutoGen...) làm việc với Skill này.

## 1. Tổng quan Skill
Skill `candidate-jd-matcher` giúp đánh giá độ phù hợp của Hồ sơ ứng viên (JSON) với Mô tả công việc JD (Text) và trả về kết quả phân tích chuẩn JSON.

## 2. Quy tắc Bảo trì & Phát triển (Maintenance Contract)
- **Source of Truth:** File `SKILL.md` chứa logic và prompt thực thi chính.
- **Đồng bộ Tài liệu:** Khi sửa logic trong `SKILL.md`, phải cập nhật đồng bộ sang `README.md`.
- **Đồng bộ Version:** Cập nhật thuộc tính `version` trong YAML frontmatter của `SKILL.md` đồng thời với phần Version History trong `README.md`.
- **Tính trung lập:** Giữ câu từ hướng dẫn trung lập, không phụ thuộc vào 1 framework AI Agent cụ thể.
