# AGENTS.md - Report to YODY Web Deck Skill

Hướng dẫn dành cho các AI Coding Agent (Antigravity, Claude Code, Codex, Cursor, AutoGen...) làm việc với Skill này.

## 1. Tổng quan Skill

Skill `report-to-yody-web-deck` chuyển báo cáo, dữ liệu, tài liệu văn phòng, PDF, hình ảnh hoặc slide cũ thành web deck Reveal.js theo chuẩn YODY. Quy trình bắt buộc đi qua bước phân tích và duyệt `brief.md` trước khi dựng mã nguồn deck.

## 2. Quy tắc Bảo trì & Phát triển (Maintenance Contract)

- **Source of Truth:** File `SKILL.md` chứa logic và quy trình thực thi chính.
- **Đồng bộ Tài liệu:** Khi sửa quy trình, trigger, cấu trúc đầu ra hoặc danh mục tài nguyên (`references/`, `assets/`, `scripts/`), phải cập nhật đồng bộ `README.md`.
- **Đồng bộ Reference:** Khi thay đổi yêu cầu brief, storyline, thiết kế, kiểm tra trực quan hoặc tiêu chuẩn Zero-Overflow, phải cập nhật các file liên quan trong `references/`.
- **Starter Template:** Khi sửa `assets/starter-template/`, phải đảm bảo `scripts/init-deck.mjs` vẫn khởi tạo được một deck mới đầy đủ.
- **Duyệt Brief:** Không bỏ qua giai đoạn duyệt `brief.md`; chỉ dựng deck sau khi người dùng đồng ý rõ ràng.
- **Kiểm tra Trực quan:** Deck hoàn chỉnh phải được chạy thử và kiểm tra lỗi tràn chữ, đè chữ, cắt lề, thiếu asset hoặc sai bố cục trước khi bàn giao.
- **Đồng bộ Version:** Nếu thêm thuộc tính `version` trong YAML frontmatter của `SKILL.md`, phải cập nhật đồng thời phần Version History trong `README.md`.
- **Tính trung lập:** Giữ câu từ hướng dẫn trung lập, không phụ thuộc vào một framework AI Agent cụ thể.
