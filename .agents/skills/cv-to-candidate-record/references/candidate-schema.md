# Schema Hồ Sơ Ứng Viên (`candidate-record.json`)

## Quy ước chung
- Tên trường theo `camelCase`.
- Chuỗi rỗng `""` cho trường văn bản không có dữ liệu.
- Mảng rỗng `[]` cho danh sách không có dữ liệu.
- `null` cho giá trị số hoặc giá trị tính toán chưa xác định.

## Cấu trúc chi tiết

### `candidate` (Object)
- `fullName` (String): Họ và tên.
- `email` (String): Email.
- `phone` (String): Số điện thoại.
- `location` (String): Địa điểm hiện tại.
- `currentTitle` (String): Vị trí/chức danh hiện tại.
- `professionalSummary` (String): Tóm tắt nghề nghiệp.
- `totalExperienceMonths` (Number | null): Tổng số tháng kinh nghiệm.
- `skills` (Array of Strings): Các kỹ năng.
- `languages` (Array of Strings): Ngoại ngữ.
- `links` (Object):
  - `linkedin` (String)
  - `github` (String)
  - `portfolio` (String)
  - `others` (Array of Strings)

### `workExperience` (Array of Objects)
- `company` (String): Tên công ty.
- `title` (String): Chức danh.
- `startDate` (String): Ngày bắt đầu (`YYYY-MM` hoặc `YYYY`).
- `endDate` (String): Ngày kết thúc (`YYYY-MM`, `YYYY` hoặc `present`).
- `description` (Array of Strings): Mô tả công việc.
- `achievements` (Array of Strings): Thành tích.
- `skills` (Array of Strings): Kỹ năng/công nghệ áp dụng.

### `projects` (Array of Objects)
- `name` (String): Tên dự án.
- `role` (String): Vai trò.
- `description` (Array of Strings): Mô tả dự án.
- `technologies` (Array of Strings): Công nghệ sử dụng.
- `url` (String): Link dự án.

### `education` (Array of Objects)
- `institution` (String): Tên trường học.
- `degree` (String): Bằng cấp.
- `fieldOfStudy` (String): Chuyên ngành.
- `startDate` (String): Ngày bắt đầu.
- `endDate` (String): Ngày kết thúc.
- `details` (Array of Strings): Thông tin bổ sung.

### `certifications` (Array of Objects)
- `name` (String): Tên chứng chỉ.
- `issuer` (String): Tổ chức cấp.
- `issueDate` (String): Ngày cấp.
- `credentialUrl` (String): Link chứng chỉ.

### Metadata bổ sung
- `missingFields` (Array of Strings): Các trường quan trọng chưa tìm thấy (ví dụ: `email`, `phone`, `education`).
- `uncertainFields` (Array of Strings): Các trường có dữ liệu nhưng chưa xác định chính xác.
