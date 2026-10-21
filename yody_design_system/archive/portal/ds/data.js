/* data.js — port of src/data/kpi-t6-2026.ts (W1, BSC CN&CĐS · T6/2026).
   Verbatim values from the repo data layer. Names kept nguyên văn (CTO).
   Exposed as window.DASH_DATA for the prototype (in repo this stays TS). */
(function () {
  'use strict';

  const TRACKING_WEEKS = ['W1'];

  const TRACKING_META = {
    asOf: '08/06/2026',
    latestWeek: 'W1',
    latestWeekLabel: 'Tuần 1',
    source: 'PITSTOP 6 team + Huly tracker, đối chiếu 08/06/2026 · Vault: 02-EPISODIC/Weekly/2026-06-W1-PITSTOP-CNCDS.md',
  };

  const TRACK_GROUP_LABEL = {
    finance: 'Tài chính (5%)',
    customer: 'Khách hàng (15%)',
    operation: 'Vận hành (75%)',
    learning: 'Học hỏi & Phát triển (5%)',
  };

  // 12 chỉ tiêu BSC chính thức (tổng 100%)
  const WEEKLY_TRACKING = [
    { id: 'chi-phi-dt', name: 'Tỷ lệ chi phí CN&CĐS / Doanh thu 2026', team: 'BETA', weight: 5, group: 'finance',
      tracks: [{ week: 'W1', status: 'on-track', note: '0,219% lũy kế (01–07/6) · MT ≤1,72% · ⚠ spike AWS 01/6 $1.462 (2,5×) · datadog est. ~$1.000/tháng' }] },
    { id: 'hanh-trinh-kh', name: 'Tỷ lệ Chuyển đổi số Hành trình Khách hàng', team: 'OMEGA', weight: 10, group: 'customer',
      tracks: [{ week: 'W1', status: 'on-track', note: 'Ship feature CYO / Tamasy / Sanji + YO.CREATOR (SRS) · chưa đo adoption thực' }] },
    { id: 'yc-ho-tro', name: 'Tỷ lệ Yêu cầu Hỗ trợ', team: 'BETA', weight: 5, group: 'customer',
      tracks: [{ week: 'W1', status: 'on-track', note: '3,29% · MT ≤10% · tự cảnh báo nguy cơ off-track tháng' }] },
    { id: 'plm', name: '% Chuyển đổi số Quy trình Chuỗi cung ứng', team: 'DELTA', weight: 15, group: 'operation',
      tracks: [{ week: 'W1', status: 'on-track', note: '3 trụ BOM ~30% (xong phân tích) · Design System 100% · NPL inventory 60% · Ngày hội 20% · #1–4 cả scope, #5–6 ITDX' }] },
    { id: 'iom', name: 'Tỷ lệ Chuyển đổi số Chức năng Vận hành Hàng hoá', team: 'SIGMA', weight: 15, group: 'operation',
      tracks: [{ week: 'W1', status: 'on-track', note: 'Xuất/Trả NCC 80% · Kiểm kho 40% · 3/5 hạng mục chưa start (W2–W4)' }] },
    { id: 'organic-traffic', name: 'Số Organic Traffic của Website / Tháng', team: 'OMEGA', weight: 5, group: 'operation',
      tracks: [{ week: 'W1', status: 'off-track', note: '95.760 / 125.806 = 76% mục tiêu tuần · MT tháng 780K' }] },
    { id: 'cr-organic', name: 'CR của Organic Traffic Website / Tháng', team: 'OMEGA', weight: 5, group: 'operation',
      tracks: [{ week: 'W1', status: 'off-track', note: '0,12% / 0,33% = 16% thực đạt · MT 0,33%' }] },
    { id: 'auto-don-hang', name: 'Tỷ lệ Tự động hóa toàn trình đơn hàng', team: 'GAMMA', weight: 10, group: 'operation',
      tracks: [{ week: 'W1', status: 'on-track', note: '10/10 task done · release 8/6' }] },
    { id: 'ai-vh-to-chuc', name: 'Mức độ áp dụng AI trong Vận hành tổ chức', team: 'BETA', weight: 10, group: 'operation',
      tracks: [{ week: 'W1', status: 'on-track', note: 'Hệ quản trị quy trình 40–50% · chưa áp dụng AI/NotebookLM' }] },
    { id: 'nshp', name: 'Tỷ lệ Hoàn tất dự án CĐS NSHP theo kế hoạch', team: 'LAMBDA', weight: 10, group: 'operation',
      tracks: [{ week: 'W1', status: 'watch', note: '90% tuần / 20% tháng · ⚠ >70% capacity đi support team khác → KPI chính bị bỏ đói' }] },
    { id: 'timeline-qt', name: '% Tuân thủ timeline Quản trị', team: 'CN&CĐS', weight: 5, group: 'operation',
      tracks: [{ week: 'W1', status: 'pending', note: 'Chưa triển khai W1' }] },
    { id: 'nhan-su-chuan', name: 'Tỷ lệ Nhân sự đạt chuẩn hiệu suất', team: 'CN&CĐS', weight: 5, group: 'learning',
      tracks: [{ week: 'W1', status: 'pending', note: 'Chưa triển khai W1' }] },
  ];

  const PITSTOP_DETAIL = [
    { id: 'chi-phi-dt', kpi: 'Tỷ lệ chi phí CN&CĐS / DT', status: 'on-track',
      effective: 'Cảnh báo sớm chi phí hạ tầng (Datadog/AWS) cho Quốc Anh xử lý.',
      ineffective: 'Spike AWS 01/6 ($1.462, 2,5×) chưa rõ root cause; Datadog leo ~$1.000/tháng; chưa kiểm soát chi phí hạ tầng khi team ship feature mới.',
      next: 'Đào dứt điểm root cause spike 01/6; lập cơ chế kiểm soát chi phí hạ tầng theo từng feature trước khi cho lên.' },
    { id: 'hanh-trinh-kh', kpi: 'CĐS Hành trình KH', status: 'on-track',
      effective: 'CYO chặn cứng PII + lọc nhiễu data sàn (tăng chất lượng AI + khớp compliance); Sanji thêm rate limit đúng trước khi scale gửi tin.',
      ineffective: 'Đo bằng "đã ship feature", chưa có metric adoption thực; dataset địa lý CYO ghi "36 tỉnh" sai chuẩn (đúng 34).',
      next: 'Gắn metric adoption thực (user active CYO, segment/dashboard được dùng); verify & sửa dataset địa lý về 34 đơn vị.' },
    { id: 'yc-ho-tro', kpi: 'Tỷ lệ Yêu cầu Hỗ trợ', status: 'on-track',
      effective: 'KPI tuần & tháng đang đạt ngưỡng (3,29% < 10%).',
      ineffective: '2 lỗi lặp lại nhiều tuần: thiếu mã sinh nhật (lệch sync Elasticsearch ↔ Unicorn) và lỗi OTP.',
      next: 'Đẩy team Ngọc Anh ưu tiên xử lý dứt điểm 2 lỗi lặp để chặn nguy cơ off-track cả tháng.' },
    { id: 'plm', kpi: '% CĐS Quy trình CCƯ (PLM)', status: 'on-track',
      effective: 'Nghiệp vụ ba trụ cột BOM đã được làm rõ cùng các bên liên quan ngay từ đầu, nhờ đó hạn chế được thay đổi phát sinh về sau. Hệ thống thiết kế dùng chung đã hoàn thiện, tạo nền tảng để tăng tốc phát triển. Phân hệ quản lý tồn kho nguyên phụ liệu đã vận hành trên dữ liệu thực tế.',
      ineffective: 'Ba trụ cột BOM mới dừng ở bước phân tích nghiệp vụ, chưa có tính năng nào được đưa vào chạy thực tế. Bên cạnh đó, lịch phát triển chi tiết cho giai đoạn tiếp theo vẫn chưa được xây dựng.',
      next: 'Hoàn tất lịch phát triển và phân rã thành các đầu việc cụ thể để bắt đầu lập trình ngay từ đầu tuần 2, qua đó duy trì nhịp độ triển khai và tránh dồn khối lượng lớn vào cuối tháng.' },
    { id: 'iom', kpi: 'Tỷ lệ Chuyển đổi số Chức năng Vận hành Hàng hoá', status: 'on-track',
      effective: 'Nghiệp vụ được làm rõ sớm và tài liệu hoá đầy đủ, nhờ đó giảm rủi ro thiếu yêu cầu trong quá trình triển khai. Luồng xuất và trả hàng nhà cung cấp đã gần hoàn thiện, sẵn sàng đưa vào vận hành.',
      ineffective: 'Chưa có dữ liệu vận hành thực tế để đánh giá hiệu quả. Ba trong năm hạng mục chưa khởi động, khiến hai phần việc chia hàng và quét mã QR nhập kho bị dồn cùng vào tuần 4.',
      next: 'Đưa luồng xuất và trả hàng nhà cung cấp vào vận hành chính thức và theo dõi sát trong giai đoạn đầu. Đồng thời sắp xếp một trong hai hạng mục của tuần 4 lên tuần 2 hoặc tuần 3 để giảm áp lực dồn việc cuối tháng.' },
    { id: 'organic-traffic', kpi: 'Số Organic Traffic Website', status: 'off-track',
      effective: 'Chưa có.',
      ineffective: 'Kế hoạch tăng trưởng traffic chưa ra kết quả (76% mục tiêu tuần); không có deliverable nào trong W1.',
      next: 'Đánh giá lại kế hoạch tăng trưởng + hiệu quả từng nguồn traffic vào BST mới; bổ sung CTKM kích mua sắm.' },
    { id: 'cr-organic', kpi: 'CR Organic Traffic', status: 'off-track',
      effective: 'Chưa có.',
      ineffective: 'CR 0,12% vs mục tiêu 0,33% (16% thực đạt); chưa có đòn bẩy CR nào trong W1.',
      next: 'Đánh giá lại kế hoạch CR + funnel chuyển đổi; bổ sung CTKM kích chuyển đổi.' },
    { id: 'auto-don-hang', kpi: 'Tỷ lệ Tự động hóa toàn trình đơn hàng', status: 'on-track',
      effective: 'Làm rõ nghiệp vụ sớm; hoàn tất VAT sau chiết khấu + kiểm soát chiết khấu 50%; xử lý dứt lỗi kéo HĐĐT (100% đơn từ 3/6).',
      ineffective: 'Không.',
      next: 'Duy trì nhịp release (validate SĐT +84 ngày 8/6) + theo dõi dữ liệu sau release.' },
    { id: 'ai-vh-to-chuc', kpi: 'Mức độ áp dụng AI trong VH tổ chức', status: 'on-track',
      effective: 'Hệ quản trị quy trình đạt 40–50% (giao diện workflow, view 2 chiều theo SĐTC & value stream).',
      ineffective: 'Chưa áp dụng AI & NotebookLM; chưa đáp ứng đủ yêu cầu vận hành của stakeholder.',
      next: 'Hoàn tất luồng vận hành cơ bản + nghiên cứu áp dụng NotebookLM (đúng phần AI Native còn thiếu).' },
    { id: 'nshp', kpi: 'Hoàn tất dự án CĐS NSHP', status: 'watch',
      effective: 'Chốt timeline/planning tháng tốt; review & testing phối hợp nhanh ở task rõ nghiệp vụ; align kịp KPI Goal Map tránh fail KPI tuần.',
      ineffective: '>70% capacity team đi support team khác → KPI chính bị bỏ đói, mới 20% tháng.',
      next: 'Tái phân bổ nguồn lực về KPI chính, giảm gánh support team khác — cần CTO quyết.' },
    { id: 'timeline-qt', kpi: '% Tuân thủ timeline Quản trị', status: 'pending', effective: null, ineffective: null, next: null },
    { id: 'nhan-su-chuan', kpi: 'Tỷ lệ Nhân sự đạt chuẩn hiệu suất', status: 'pending', effective: null, ineffective: null, next: null },
    { id: 'stability', kpi: 'Đảm bảo độ ổn định hệ thống', status: 'off-track', scope: 'extra',
      effective: 'Đã điều tra nguyên nhân sự cố, làm báo cáo sự cố, rút bài học.',
      ineffective: 'Off-track; kafka connect chưa xử lý dứt điểm (over-memory, pod crash); ERP→Unicorn connect timeout.',
      next: 'Cải thiện kiến thức network + tuân thủ tuyệt đối rule vận hành; phối hợp website check ngay tại thời điểm kafka down.' },
  ];

  const PITSTOP_RESULT = {
    'chi-phi-dt': { result: '0,219% / DT NET (MT ≤1,72%)', pct: 23, pctNote: 'Duy trì ngưỡng · W1 ≈ 23% thời gian tháng, đang đạt' },
    'hanh-trinh-kh': { result: 'Ship CYO · Tamasy · Sanji · YO.CREATOR (SRS); chưa đo adoption', pct: 40, pctNote: 'Số hóa · feature đã ship, chưa đo adoption' },
    'yc-ho-tro': { result: '3,29% tickets / active users (MT ≤10%)', pct: 23, pctNote: 'Duy trì ngưỡng · W1 ≈ 23% thời gian tháng, đang đạt' },
    'auto-don-hang': { result: '10/10 task W1 · release 8/6', pct: 50, pctNote: 'Số hóa · core VAT+kiểm soát đã release, còn CTKM trước giờ + báo cáo W2–W4' },
    'ai-vh-to-chuc': { result: 'Hệ quản trị quy trình vận hành 40–50%', pct: 45, pctNote: 'Số hóa · tiến độ build báo cáo 40–50%' },
    nshp: { result: '90% kế hoạch tuần · 20% kế hoạch tháng', pct: 20, pctNote: 'Số hóa · 20% epic kế hoạch tháng' },
    'timeline-qt': { result: '—', pct: null, pctNote: 'Chưa triển khai W1' },
    'nhan-su-chuan': { result: '—', pct: null, pctNote: 'Chưa triển khai W1' },
    'organic-traffic': { result: '95.760 lượt lũy kế (76% mục tiêu tuần · MT 780K/tháng)', pct: 12, pctNote: 'Tăng trưởng · 95.760 / 780.000 lượt tháng' },
    'cr-organic': { result: '0,12% (MT 0,33%)', pct: 36, pctNote: 'Tỷ lệ · 0,12% / 0,33% mục tiêu' },
    stability: { result: 'Đã điều tra + báo cáo sự cố, rút bài học', pct: null, pctNote: 'Ngoài BSC · không phải KPI %' },
  };

  // PLM/IOM không có trong PITSTOP_RESULT (P8). Breakdown cụm hạng mục từ note W1.
  const DRIVER_BREAKDOWN = {
    plm: [{ label: '3 trụ cột BOM (phân tích)', pct: 30 }, { label: 'Design System PLM', pct: 100 }, { label: 'Tồn kho NPL', pct: 60 }, { label: 'Ngày hội Đặt hàng (carry)', pct: 20 }],
    iom: [{ label: 'Xuất / Trả hàng NCC', pct: 80 }, { label: 'Kiểm kho định kỳ', pct: 40 }, { label: '3/5 hạng mục chưa start', pct: 0 }],
  };

  const W1_ARCH = [
    { team: 'DELTA', engine: 'PLM', kpiId: 'plm', meta: '19 task gắn milestone 26/06/W1 + 3 QC sub (không gắn milestone)', total: 22,
      clusters: [
        { label: 'Kho & NPL Master', tasks: [
          { id: 'DELTA-419', name: 'Tạo / sửa kho' }, { id: 'DELTA-420', name: 'Đơn đặt hàng NPL' },
          { id: 'DELTA-450', name: 'Phân quyền xem bảng thông số' }, { id: 'DELTA-476', name: '[QC] Kiểm tra phân quyền xem bảng thông số', tag: 'QC' },
          { id: 'DELTA-477', name: 'Hỗ trợ lấy thông tin bảng thông số' } ] },
        { label: 'Gen mã · Chất liệu · Sản phẩm', tasks: [
          { id: 'DELTA-451', name: 'QUY TẮC GEN MÃ VẢI', tag: 'Released' }, { id: 'DELTA-452', name: 'QUY TẮC GEN MÃ PHỤ LIỆU' },
          { id: 'DELTA-453', name: 'Cải tiến cho tìm kiếm Phom' }, { id: 'DELTA-455', name: 'Sửa thành phần chất liệu đã sử dụng' },
          { id: 'DELTA-456', name: 'Chất liệu | Hỗ trợ sửa khuyến cáo phục vụ in tem' }, { id: 'DELTA-457', name: 'Sản phẩm | Bổ sung thông tin Phom' },
          { id: 'DELTA-458', name: 'Demo hệ thống quản lý nguyên phụ liệu cho khối sản phẩm' }, { id: 'DELTA-460', name: '[QC] Thực hiện test gen mã vải', tag: 'QC' },
          { id: 'DELTA-461', name: '[QC] Thực hiện test gen mã và tên phụ liệu', tag: 'QC' } ] },
        { label: 'Engine BOM · Workflow & Tài liệu', tasks: [
          { id: 'DELTA-462', name: 'Làm rõ Workflow quản lý phiên bản BOM' }, { id: 'DELTA-463', name: 'Chốt Công thức & Ma trận định mức' },
          { id: 'DELTA-464', name: 'Chốt Rule mapping & Validate' }, { id: 'DELTA-465', name: 'Viết User Story & Acceptance Criteria (AC)' },
          { id: 'DELTA-466', name: 'Viết User Story & Acceptance Criteria (AC)' }, { id: 'DELTA-467', name: 'Viết User Story & Acceptance Criteria (AC)' },
          { id: 'DELTA-478', name: 'Tài liệu đặc tả yêu cầu quản trị phiên bản BOM' } ] },
        { label: 'Ngày hội Đặt hàng', tasks: [{ id: 'DELTA-454', name: 'Sirpoc Ngày hội đặt hàng cho mùa SS27' }] },
      ] },
    { team: 'SIGMA', engine: 'APS', kpiId: 'iom', meta: 'milestone W1.M6 · tất cả Completed', total: 6,
      clusters: [
        { label: 'Điều phối & Phân bổ đơn', tasks: [{ id: 'SIGMA-174', name: 'SO | Điều phối đơn tự động | Tự động tách đơn kho còn tồn' }] },
        { label: 'NCC & Kiểm kê (SH Road)', tasks: [
          { id: 'SIGMA-179', name: 'Đồng bộ phiếu trả NCC uni-shr' }, { id: 'SIGMA-180', name: 'Thiết kế tài liệu kiểm kê kho uni-shr' } ] },
        { label: 'WMS · TMS · Inventory', tasks: [
          { id: 'SIGMA-184', name: 'WMS | Update Tuyến xe' }, { id: 'SIGMA-185', name: 'STR | Bổ sung thêm nút hủy ở trạng thái Đang xử lý' },
          { id: 'SIGMA-187', name: 'INVENTORY | Cache suggestion store' } ] },
      ] },
  ];

  // ── Gantt slice source (driver board + 2 slide) — trimmed for drill ──
  const T6_WEEKS = [
    { id: 'T1.06', range: '01–07/06' }, { id: 'T2.06', range: '08–14/06' },
    { id: 'T3.06', range: '15–21/06' }, { id: 'T4.06', range: '22–30/06' },
  ];

  // Gantt sections keyed by kpiId → bars {name, kind, s, e, label?, date?}
  const GANTT_BY_KPI = {
    plm: { board: 'Driver trọng yếu', code: 'PLM', title: 'Hoàn thiện engine BOM', meta: 'DELTA · 15% · MT 4 hạng mục', bars: [
      { name: 'Tích hợp BOM với NPL Master', label: 'Hạng mục 1', kind: 'kpi', s: 1, e: 2 },
      { name: 'Module tính giá BOM cho production', label: 'Hạng mục 2', kind: 'kpi', s: 2, e: 3 },
      { name: 'Luồng phê duyệt BOM & quản trị phiên bản', label: 'Hạng mục 3', kind: 'kpi', s: 3, e: 4 },
      { name: 'Design System cho PLM', label: 'Hạng mục 4', kind: 'kpi', s: 1, e: 3 },
      { name: 'Công cụ Ngày hội Đặt hàng', label: 'Carry-over T5', kind: 'carry', s: 1, e: 4 },
      { name: 'Vận hành Xuất/Nhập/Tồn kho NPL trên PLM', label: 'Carry-over T5', kind: 'carry', s: 1, e: 4 },
    ] },
    iom: { board: 'Driver trọng yếu', code: 'APS', title: 'Tích hợp SH Road – NCC + QR nhập kho', meta: 'SIGMA · 15% · MT 5 hạng mục', bars: [
      { name: 'Xuất / Trả hàng NCC trên SH Road', label: 'Hạng mục 1', kind: 'kpi', s: 1, e: 2 },
      { name: 'Kiểm kho định kỳ tích hợp SH Road', label: 'Hạng mục 2', kind: 'kpi', s: 2, e: 3 },
      { name: 'Xử lý Hàng lỗi', label: 'Hạng mục 3', kind: 'kpi', s: 3, e: 4 },
      { name: 'Chia hàng theo đơn', label: 'Hạng mục 4', kind: 'kpi', s: 4, e: 4 },
      { name: 'QR nhập kho từ NCC', label: 'Hạng mục 5', kind: 'kpi', s: 1, e: 3 },
    ] },
    'auto-don-hang': { board: 'Slide A · Vận hành số', code: 'Tự động hóa ĐH', title: 'Tỷ lệ Tự động hóa toàn trình đơn hàng', meta: 'GAMMA · đo TCKT · 10%', bars: [
      { name: 'Logic VAT trên giá sau chiết khấu', kind: 'kpi', s: 1, e: 4 },
      { name: 'Cảnh báo chi phí chiết khấu vượt budget CTKM', kind: 'kpi', s: 1, e: 1 },
      { name: 'Xử lý đơn áp CTKM trước thời gian bắt đầu', kind: 'kpi', s: 2, e: 2 },
      { name: 'Kiểm soát mức chiết khấu tối đa (50%)', kind: 'kpi', s: 3, e: 3 },
      { name: 'Báo cáo hiệu quả điều tự động', kind: 'kpi', s: 4, e: 4 },
    ] },
    'ai-vh-to-chuc': { board: 'Slide A · Vận hành số', code: 'AI VH tổ chức', title: 'Mức độ áp dụng AI trong Vận hành tổ chức', meta: 'BETA · đo CN&CĐS · 10%', bars: [
      { name: 'AI Assistant tăng hiệu suất Cá nhân (Unicorn Mobile)', kind: 'kpi', s: 1, e: 3 },
      { name: 'AI Native: Review Hợp đồng với AI', kind: 'kpi', s: 2, e: 4 },
      { name: 'AI Native: Hỏi đáp về Quy trình với AI', kind: 'kpi', s: 2, e: 4 },
      { name: 'AI Native: Nhắc nhở luồng Phê duyệt', kind: 'kpi', s: 3, e: 4 },
    ] },
    'hanh-trinh-kh': { board: 'Slide A · Vận hành số', code: 'Hành trình KH', title: 'Tỷ lệ Chuyển đổi số Hành trình Khách hàng', meta: 'OMEGA · đo MKT · 10%', bars: [
      { name: 'Thay thế CDP cũ + vận hành Tamasy', kind: 'kpi', s: 1, e: 4 },
      { name: 'CYO (AI.CRM): dùng thử & cải tiến cho MKT', kind: 'kpi', s: 1, e: 3 },
      { name: 'CYO (AI.CRM): CYO Admin Dashboard', kind: 'kpi', s: 2, e: 4 },
      { name: 'YO.CREATOR quản lý KOL/KOC Performance', kind: 'kpi', s: 2, e: 4 },
    ] },
    nshp: { board: 'Slide B · Nền tảng & QT', code: 'NSHP', title: 'Tỷ lệ Hoàn tất dự án CĐS NSHP', meta: 'LAMBDA · đo NSHP · 10%', bars: [
      { name: 'AIxPerf: Go-live nâng cấp CFR + Goal Map', kind: 'kpi', s: 1, e: 4 },
      { name: 'LMS: chốt đối tác + chuẩn bị tích hợp', kind: 'kpi', s: 1, e: 4 },
    ] },
    'nhan-su-chuan': { board: 'Slide B · Nền tảng & QT', code: 'Nhân sự chuẩn', title: 'Tỷ lệ Nhân sự đạt chuẩn hiệu suất', meta: 'đo NSHP · 5% · HSC 15–25/06', bars: [
      { name: '90% nhân sự hoàn thành giờ đào tạo (Min 1h/tháng)', kind: 'metric', s: 1, e: 4 },
      { name: 'HSC Bài 1: video 8 từ khóa đội ngũ hiệu suất cao', kind: 'kpi', s: 3, e: 3, date: '15/06' },
      { name: 'HSC Bài 2+3: Pitstop ≥6 + Bài tốt nghiệp Canvas', kind: 'kpi', s: 4, e: 4, date: '25/06' },
      { name: 'Framework EA – GĐ1 (Vision · App Arch · Governance · People)', kind: 'kpi', s: 1, e: 4 },
    ] },
    'yc-ho-tro': { board: 'Slide B · Nền tảng & QT', code: 'YC Hỗ trợ', title: 'Tỷ lệ Yêu cầu Hỗ trợ', meta: 'đo BI · 5% · BAU', bars: [
      { name: 'Duy trì mốc TB ≤10% (Tickets / Active Users) — BAU', kind: 'metric', s: 1, e: 4 },
    ] },
    'chi-phi-dt': { board: 'Slide B · Nền tảng & QT', code: 'Chi phí/DT', title: 'Tỷ lệ chi phí CN&CĐS / Doanh thu 2026', meta: 'đo BI · 5% · BAU + 2 Epic', bars: [
      { name: 'Duy trì ≤1,72% (Chi phí / Doanh thu NET) — BAU', kind: 'metric', s: 1, e: 4 },
      { name: 'Rà soát license phần mềm + ngân sách', kind: 'kpi', s: 1, e: 2 },
      { name: 'Hợp tác Cloud giảm ngân sách hạ tầng', kind: 'kpi', s: 2, e: 4 },
    ] },
    'organic-traffic': { board: 'Slide B · Nền tảng & QT', code: 'Organic Web', title: 'Số Organic Traffic & CR Website / Tháng', meta: 'đo BI · 10% (5+5) · GA4', bars: [
      { name: 'Organic Traffic: đạt 780K lượt/tháng', kind: 'metric', s: 1, e: 4 },
      { name: 'CR Organic Traffic: đạt 0,33%', kind: 'metric', s: 1, e: 4 },
    ] },
    'cr-organic': { board: 'Slide B · Nền tảng & QT', code: 'Organic Web', title: 'Số Organic Traffic & CR Website / Tháng', meta: 'đo BI · 10% (5+5) · GA4', bars: [
      { name: 'Organic Traffic: đạt 780K lượt/tháng', kind: 'metric', s: 1, e: 4 },
      { name: 'CR Organic Traffic: đạt 0,33%', kind: 'metric', s: 1, e: 4 },
    ] },
    'timeline-qt': { board: 'Slide B · Nền tảng & QT', code: 'Timeline QT', title: '% Tuân thủ timeline Quản trị', meta: 'đo BTK · 5% · BĐH 15–25/06', bars: [
      { name: 'Cụm chốt KPI H2 & Quản trị Q3 (W3)', kind: 'kpi', s: 3, e: 3, date: '15–19/06' },
      { name: 'Cụm Kế hoạch Q3 (W4)', kind: 'kpi', s: 4, e: 4, date: '22–25/06' },
    ] },
  };

  const OFF_TRACK_EXTRA = [
    { name: 'Đảm bảo độ ổn định hệ thống', team: 'BETA', scope: 'Ngoài BSC', note: 'kafka over-memory · ERP→Unicorn connect timeout' },
  ];

  const TRACKING_DATA_NOTE = 'Dataset địa lý nạp cho CYO AI đang ghi "36 tỉnh" — sai. Chuẩn NQ 202/2025/QH15 là 34 đơn vị cấp tỉnh.';

  // Reconcile flags (DEC-12) — sheet↔vault lệch, UI lấy sheet, PIC quyết
  const RECONCILE_FLAGS = {
    'ai-vh-to-chuc': 'Sheet ghi trọng số 10%, vault KPI-CNCDS-T6-2026.md ghi 5%. UI lấy 10% theo sheet chính thức — cần PIC reconcile.',
    'organic-traffic': 'Sheet ghi 780K traffic + CR 0,33%, vault ghi 600K + 0,38%. UI lấy giá trị sheet chính thức — cần PIC reconcile.',
    'cr-organic': 'Sheet ghi CR 0,33% (Organic 780K), vault ghi 0,38% (600K). UI lấy giá trị sheet chính thức — cần PIC reconcile.',
    'yc-ho-tro': 'Sheet ghi mốc ≤10%, vault ghi 8%. UI lấy 10% theo sheet chính thức — cần PIC reconcile.',
  };

  const ENGINE_TAG = { plm: 'PLM', iom: 'APS' };

  window.DASH_DATA = {
    TRACKING_WEEKS, TRACKING_META, TRACK_GROUP_LABEL, WEEKLY_TRACKING,
    PITSTOP_DETAIL, PITSTOP_RESULT, DRIVER_BREAKDOWN, W1_ARCH, T6_WEEKS,
    GANTT_BY_KPI, OFF_TRACK_EXTRA, TRACKING_DATA_NOTE, RECONCILE_FLAGS, ENGINE_TAG,
  };
})();
