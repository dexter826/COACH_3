# Báo cáo nghiên cứu Spec Kit và khả năng áp dụng vào dự án ATS tại YODY

## 1. Tích hợp AI Skills trong ATS Demo

Trong quá trình triển khai hệ thống ATS, các Agent Skills được sử dụng để tự động hóa các luồng công việc phức tạp. Dưới đây là mô tả và flow của 2 skill cốt lõi trong ATS Demo:

### 1.1. Skill: cv-to-candidate-record
**Mô tả:** Chuyển đổi CV đầu vào thành hồ sơ ứng viên có cấu trúc (JSON) chuẩn để lưu vào ATS. Giúp giảm tải việc nhập liệu thủ công và tăng tính chuẩn hóa dữ liệu.

**Luồng thực hiện (Flow):**
1. Đọc nội dung CV (từ file PDF, DOCX, ảnh hoặc text).
2. Đối chiếu với cấu trúc JSON mục tiêu và quy tắc chuẩn hóa dữ liệu.
3. Trích xuất thông tin, điền vào JSON và phân loại rõ dữ liệu thiếu hoặc chưa chắc chắn.
4. Chạy script validate dữ liệu tự động. Nếu có lỗi, AI tự sửa lại cấu trúc và kiểm tra lại.
5. Trả kết quả JSON hợp lệ để hệ thống nhập vào ATS.

### 1.2. Skill: candidate-jd-matcher
**Mô tả:** Đánh giá độ phù hợp của Hồ sơ ứng viên (đã cấu trúc hóa) với Yêu cầu công việc (Job Description) dựa trên semantic match (so sánh linh hoạt) thay vì chỉ đếm keyword.

**Luồng thực hiện (Flow):**
1. Nhận dữ liệu đầu vào gồm: Candidate Record (JSON) và Job Description (Text).
2. Phân tích và so sánh linh hoạt các tiêu chí về Kỹ năng chuyên môn, Kinh nghiệm làm việc và Học vấn.
3. Chấm điểm từ 0-100 và đưa ra 1 trong 3 khuyến nghị: "NÊN PHỎNG VẤN", "CÂN NHẮC", hoặc "TỪ CHỐI".
4. Tổng hợp lý do đánh giá thành 1-2 câu tóm tắt điểm mạnh và lỗ hổng.
5. Trả kết quả theo đúng cấu trúc JSON cố định gồm điểm số, khuyến nghị và lý do.

## 2. Luồng hoạt động của Spec Kit

### 2.1. Constitution

`/speckit.constitution`

Constitution xác định các nguyên tắc chung của dự án, ví dụ:

- Quy tắc bảo mật
- Tiêu chuẩn chất lượng
- Nguyên tắc kiến trúc
- Quy định về dữ liệu
- Quy tắc review và nghiệm thu

Constitution giúp các feature sau này tuân theo cùng một bộ nguyên tắc.

### 2.2. Specify

`/speckit.specify`

Bước này chuyển ý tưởng thành feature specification.

Nội dung tập trung vào:

- Người dùng là ai
- Người dùng cần làm gì
- Vấn đề được giải quyết
- User story
- Acceptance criteria
- Phạm vi và trường hợp biên

Specify tập trung vào **cần xây gì và vì sao**, chưa đi sâu vào công nghệ.

### 2.3. Clarify

`/speckit.clarify`

Clarify giúp tìm ra các điểm chưa rõ hoặc còn nhiều cách hiểu trong specification.

Ví dụ:

- Dữ liệu nào là bắt buộc?
- Người dùng nào có quyền thực hiện?
- Trường hợp trùng dữ liệu được xử lý ra sao?
- Điều gì xảy ra khi hệ thống không đọc được file?

Kết quả của bước này được cập nhật lại vào specification.

### 2.4. Plan

`/speckit.plan`

Plan chuyển yêu cầu nghiệp vụ thành kế hoạch kỹ thuật.

Nội dung có thể gồm:

- Kiến trúc
- Data model
- API
- Luồng xử lý
- Phân quyền
- Validation
- Tích hợp giữa các module
- Các quyết định kỹ thuật cần thiết

Plan cần tuân thủ constitution và bám sát specification.

### 2.5. Tasks

`/speckit.tasks`

Tasks chia kế hoạch thành các công việc có thể triển khai.

Mỗi task nên:

- Có phạm vi rõ ràng
- Liên kết với một phần của specification hoặc plan
- Có thứ tự phụ thuộc hợp lý
- Có thể giao cho developer hoặc AI agent thực hiện

### 2.6. Analyze

`/speckit.analyze`

Analyze kiểm tra sự nhất quán giữa specification, plan và tasks.

Ví dụ:

- Acceptance criteria đã được plan bao phủ chưa?
- Có task nào bị thiếu không?
- Có task nào không phục vụ yêu cầu đã thống nhất không?
- Data model có hỗ trợ đúng nghiệp vụ không?

### 2.7. Implement

`/speckit.implement`

AI coding agent triển khai feature dựa trên các task đã được tạo và review.

Ở giai đoạn này, Agent không còn phải tự suy đoán toàn bộ yêu cầu từ đầu, vì đã có specification, plan và task làm nguồn tham chiếu.

## 3. Áp dụng vào dự án ATS tại YODY

### 3.1. Bối cảnh dự án

ATS tại YODY hướng tới quản lý toàn bộ quy trình tuyển dụng, từ đăng tin, nhận CV, phân loại ứng viên đến gửi Offer hoặc Reject.

Người dùng chính:

- HR/TA
- Hiring Manager

Một số pain point hiện tại:

- HR mất thời gian nhập dữ liệu ứng viên
- Thông tin chưa được phân luồng hợp lý
- Hiring Manager phải hỏi TA để cập nhật tiến độ
- Chưa có database thống nhất để xây talent pool

Để minh họa cách áp dụng Spec Kit, báo cáo chọn feature:

> Upload CV và tạo hồ sơ ứng viên.

### 3.2. Constitution cho dự án ATS

Một số nguyên tắc có thể được đưa vào constitution:

- Dữ liệu ứng viên phải được bảo vệ
- Quyền của HR và Hiring Manager phải được phân tách rõ
- Thông tin được trích xuất từ CV cần cho phép HR kiểm tra
- Feature phải có acceptance criteria rõ ràng
- Dữ liệu ứng viên phải có cấu trúc để phục vụ tìm kiếm và talent pool
- Các thay đổi quan trọng cần có khả năng truy vết

### 3.3. Specify cho feature Upload CV

User story mẫu:

> Là HR, tôi muốn tải CV lên và nhận một hồ sơ ứng viên đã được điền sẵn để giảm thời gian nhập liệu.

Acceptance criteria mẫu:

- HR có thể tải CV lên
- Hệ thống trích xuất các trường thông tin được hỗ trợ
- HR có thể xem và chỉnh sửa dữ liệu trước khi lưu
- Hồ sơ được liên kết với tin tuyển dụng
- Trường không đọc được được để trống hoặc đánh dấu
- CV gốc được lưu kèm hồ sơ ứng viên

### 3.4. Clarify các điểm nghiệp vụ

Các câu hỏi cần làm rõ:

- Hỗ trợ PDF, DOCX hay ảnh?
- Giới hạn dung lượng file là bao nhiêu?
- Email và số điện thoại có bắt buộc không?
- Một ứng viên có thể ứng tuyển nhiều vị trí không?
- Nếu hồ sơ trùng thì cập nhật hồ sơ cũ hay tạo application mới?
- HR được chỉnh sửa những trường nào?
- CV gốc được lưu trong bao lâu?
- Khi parse thất bại, hệ thống phản hồi như thế nào?

### 3.5. Plan ở mức khái quát

Do stack chưa được xác định, plan có thể tập trung vào các quyết định cần có:

- Cấu trúc dữ liệu Candidate và Application
- Cơ chế lưu file CV
- Luồng upload và trích xuất
- Màn hình review dữ liệu
- Validation
- Phân quyền
- Cơ chế kiểm tra ứng viên trùng
- API giữa các module
- Xử lý lỗi và trạng thái parse

### 3.6. Tasks minh họa

1. Xây dựng schema Candidate
2. Xây dựng schema Application
3. Tạo chức năng upload CV
4. Tạo bước trích xuất dữ liệu CV
5. Tạo màn hình review thông tin ứng viên
6. Tạo validation
7. Liên kết ứng viên với job
8. Xử lý hồ sơ trùng
9. Kiểm tra các acceptance criteria

### 3.7. Analyze trước khi triển khai

Một số điểm cần kiểm tra:

- Spec yêu cầu HR chỉnh sửa dữ liệu nhưng plan đã có màn hình review chưa?
- Spec cho phép một ứng viên ứng tuyển nhiều job nhưng data model có hỗ trợ không?
- Task đã bao phủ trường hợp parse thất bại chưa?
- Task xử lý duplicate có đúng với nghiệp vụ đã chốt không?
- Có task nào vượt khỏi phạm vi MVP không?

## 4. Ứng dụng Superpowers vào dự án ATS

### 4.1. Khái niệm Superpowers

Superpowers là một bộ framework (gồm các plugin và skill) định hình kỷ luật và quy trình làm việc của AI Agent. Nếu Spec Kit đóng vai trò xác định "Làm cái gì" (What) thông qua các tài liệu đặc tả, thì Superpowers xác định "Làm như thế nào" (How) bằng cách bắt buộc AI phải thực hiện các bước chuẩn bị, phân tích, và kiểm tra trước khi thực sự viết code.

### 4.2. Luồng hoạt động của Superpowers trong ATS

Để triển khai một feature như Upload CV trong ATS một cách chuyên nghiệp, AI Agent sẽ được ép buộc tuân thủ các Superpowers sau:

#### 1. Brainstorming (Trước khi lên kế hoạch)
- **Áp dụng:** Ở giai đoạn Clarify & Plan của Spec Kit, Agent phải gọi skill `brainstorming`.
- **Mục đích:** Khám phá các trường hợp biên của việc parse CV, yêu cầu bảo mật dữ liệu ứng viên, và thiết kế luồng UI/UX tối ưu nhất trước khi chốt phương án kỹ thuật.

#### 2. Writing Plans (Lên kế hoạch chi tiết)
- **Áp dụng:** Khi tạo phần `/speckit.plan`.
- **Mục đích:** Bóc tách yêu cầu nghiệp vụ phức tạp của tính năng Upload CV thành các task kỹ thuật cụ thể (ví dụ: xây dựng schema, tích hợp API, làm UI review).

#### 3. Subagent-Driven Development / Dispatching Parallel Agents (Thực thi)
- **Áp dụng:** Ở giai đoạn Implement của Spec Kit.
- **Mục đích:** Quản lý các task độc lập. Ví dụ, cử một subagent xử lý phần giao diện (UI Upload), trong khi một subagent khác song song viết logic gọi skill bóc tách CV.

#### 4. Systematic Debugging & TDD (Xử lý lỗi và phát triển)
- **Áp dụng:** Trong suốt quá trình lập trình tính năng.
- **Mục đích:** Nếu module parse CV gặp lỗi với định dạng PDF mới, Agent bắt buộc dùng `systematic-debugging` để phân tích log hệ thống bài bản thay vì đoán mò sửa lỗi lung tung.

#### 5. Verification Before Completion (Nghiệm thu)
- **Áp dụng:** Cuối giai đoạn Implement.
- **Mục đích:** Agent phải tự chứng minh hệ thống đã đáp ứng toàn bộ Acceptance Criteria (như CV gốc phải được lưu, các trường thiếu phải bị đánh dấu) trước khi báo cáo hoàn thành.

### 4.3. Sự cộng hưởng giữa Spec Kit và Superpowers
Sự kết hợp này tạo ra một vòng lặp khép kín cho dự án ATS:
- **Spec Kit** giúp Product Builder và các Stakeholder (HR, TA) truyền đạt yêu cầu rõ ràng, không bị hiểu lầm.
- **Superpowers** giúp AI Agent tự quản lý bản thân, ngăn chặn tình trạng vội vàng viết code sinh lỗi, đảm bảo chất lượng kỹ thuật cao nhất cho sản phẩm đầu ra.

## 5. Cách áp dụng phù hợp cho dự án ATS

Nên áp dụng theo từng feature nhỏ thay vì đưa toàn bộ ATS vào một specification lớn.

Quy trình đề xuất:

1. Chọn một feature trong MVP
2. Viết specification
3. Review với stakeholder
4. Làm rõ các điểm chưa thống nhất
5. Tạo plan (Kết hợp skill `brainstorming`, `writing-plans`)
6. Chia tasks
7. Kiểm tra tính nhất quán
8. Cho Agent triển khai (Kết hợp `subagent-driven-development`, `systematic-debugging`)
9. Nghiệm thu dựa trên acceptance criteria (Bắt buộc dùng `verification-before-completion`)

Feature Upload CV → Candidate Record phù hợp để thử nghiệm đầu tiên vì có phạm vi rõ, gắn trực tiếp với pain point nhập liệu và dễ đánh giá kết quả.

## 6. Lợi ích

- Làm rõ yêu cầu trước khi code
- Giảm việc AI Agent tự suy diễn
- Giữ Product, HR, Hiring Manager và Developer cùng cách hiểu
- Kiểm soát phạm vi feature
- Liên kết acceptance criteria với task triển khai
- Tạo tài liệu dùng lại trong quá trình review và nghiệm thu
- Hỗ trợ thay đổi có hệ thống hơn

## 7. Hạn chế

- Chất lượng kết quả phụ thuộc vào chất lượng specification
- Quy trình có thể nặng với thay đổi rất nhỏ
- Artifact cần được cập nhật khi nghiệp vụ thay đổi
- Con người vẫn cần review các quyết định nghiệp vụ
- Spec Kit không thay thế việc trao đổi với stakeholder
- Việc triển khai đúng kỹ thuật vẫn phụ thuộc vào năng lực của Agent hoặc developer

## 8. Kết luận

Spec Kit là một phương pháp tổ chức quá trình làm việc với AI coding agent theo hướng specification-first. 

Đối với dự án ATS tại YODY, công cụ này có thể giúp biến yêu cầu nghiệp vụ thành một chuỗi artifact rõ ràng gồm specification, plan và tasks trước khi triển khai. Hơn nữa, việc tích hợp **Superpowers** đóng vai trò thiết lập kỷ luật vận hành vững chắc cho AI Agent, giúp quá trình triển khai chính xác, ít lỗi và dễ dàng kiểm chứng hơn. 

Cách áp dụng phù hợp là bắt đầu với một feature nhỏ như Upload CV → Candidate Record, đánh giá hiệu quả rồi mới mở rộng sang các phần khác của MVP. Cùng với đó, việc kết hợp các skill AI như bóc tách CV và đối sánh JD giúp hoàn thiện giải pháp và mang lại giá trị thực tế cao.

Spec Kit và Superpowers có giá trị lớn nhất khi được sử dụng như một bộ đôi quy trình phối hợp và kiểm soát yêu cầu, thay vì xem chúng là công cụ tự động xây dựng toàn bộ sản phẩm một cách mù quáng.

## Tài liệu tham khảo

1. GitHub Spec Kit repository: https://github.com/github/spec-kit
2. Spec Kit — Spec-Driven Development guide: https://github.com/github/spec-kit/blob/main/spec-driven.md
3. Spec Kit reference overview: https://github.com/github/spec-kit/blob/main/docs/reference/overview.md
4. Constitution command template: https://github.com/github/spec-kit/blob/main/templates/commands/constitution.md
