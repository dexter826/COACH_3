# AGENTS.md — CV to Candidate Record Skill

Hướng dẫn dành cho các AI Coding Agent (Antigravity, Claude Code, Codex, Cursor, AutoGen...) làm việc với Skill này.

## 1. Tổng quan Skill
Skill `cv-to-candidate-record` chuyển đổi file CV thành định dạng JSON có cấu trúc chuẩn ATS (`candidate-record.json`) kèm script validation kiểm tra tự động.

## 2. Quy tắc Bảo trì & Phát triển (Maintenance Contract)
- **Source of Truth:** File `SKILL.md` chứa logic và quy trình 10 bước bóc tách CV.
- **Đồng bộ Tài liệu:** Khi thay đổi quy trình hoặc danh mục tài nguyên (`references/`, `assets/`, `scripts/`), phải cập nhật đồng bộ `README.md`.
- **Đồng bộ Version:** Cập nhật thuộc tính `version` trong YAML frontmatter của `SKILL.md` đồng thời với phần Version History trong `README.md`.
- **Validation Script:** Bắt buộc đảm bảo `python scripts/validate_candidate_record.py` chạy thành công không có lỗi.
- **Tính trung lập:** Giữ câu từ hướng dẫn trung lập, không phụ thuộc vào 1 framework AI Agent cụ thể.
