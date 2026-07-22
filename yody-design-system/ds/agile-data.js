/* agile-data.js — seed snapshot cho lăng kính Agile Delivery.
   Maps to src/data/kpi-agile-delivery.ts (build-time snapshot như W1_ARCH).
   2 tầng fidelity: task-level (DELTA/SIGMA — số thật từ W1_ARCH) ·
   rollup-only (GAMMA/BETA/LAMBDA/OMEGA — suy từ PITSTOP note) · unmapped (DATABI).
   Mọi số cần Huly thật được đánh dấu TODO(seed-huly). KHÔNG fork kpi-t6-2026. */
(function () {
  'use strict';

  const AGILE_META = {
    asOf: '08/06/2026', latestWeek: 'W1',
    source: 'Huly milestone (6 squad) + W1_ARCH task-level (DELTA/SIGMA), đối chiếu 08/06 · snapshot thủ công (audit trail)',
    taskLevelCoverage: ['DELTA', 'SIGMA'],
  };

  const BP_LABEL = {
    'digital-transformation': 'Digital Transformation',
    innovation: 'Innovation',
    'business-insights': 'Business Insights',
  };
  const BP_SHORT = { 'digital-transformation': 'DT', innovation: 'INV', 'business-insights': 'BI' };

  /* flow = TrackStatus (đổi nhãn ở UI: on-track→Đúng nhịp · watch→Cần dõi · off-track→Nghẽn · pending→Chưa map) */
  const SQUAD_DELIVERY = [
    {
      squad: 'DELTA', engine: 'PLM', bp: 'digital-transformation', domain: 'R&D / Merchandising',
      activeHeadcount: 6, kpiIds: ['plm'], fidelity: 'task-level', flow: 'on-track',
      throughput: { week: 'W1', done: 22, wip: 3, released: 1, qc: 3, carryOver: 2 },
      capacity: { week: 'W1', focusPct: 85, supportDrain: 0 },
      flag: '19 task milestone 26/06/W1 + 3 QC sub · BOM analysis hoàn tất',
    },
    {
      squad: 'SIGMA', engine: 'APS', bp: 'digital-transformation', domain: 'Supply Chain Ops',
      activeHeadcount: 4, kpiIds: ['iom'], fidelity: 'task-level', flow: 'on-track',
      throughput: { week: 'W1', done: 6, wip: 1, released: 0, qc: 0, carryOver: 0 },
      capacity: { week: 'W1', focusPct: 60, supportDrain: 0 },
      flag: 'milestone W1.M6 · tất cả Completed · còn dư địa năng lực',
    },
    {
      squad: 'GAMMA', bp: 'digital-transformation', domain: 'Retail / Omni',
      activeHeadcount: 4, kpiIds: ['auto-don-hang'], fidelity: 'rollup-only', flow: 'on-track',
      throughput: { week: 'W1', done: 10, wip: 0, released: 10, qc: 0, carryOver: 0 }, // TODO(seed-huly): task-level thật cho GAMMA
      capacity: { week: 'W1', focusPct: 75, supportDrain: 5 },
      flag: '10/10 task done · release 8/6 (suy từ PITSTOP, chưa map Huly)',
    },
    {
      squad: 'BETA', bp: 'digital-transformation', domain: 'Infra / IT / AI nội bộ',
      activeHeadcount: 6, kpiIds: ['ai-vh-to-chuc', 'chi-phi-dt', 'yc-ho-tro'], fidelity: 'rollup-only', flow: 'watch',
      throughput: { week: 'W1', done: 4, wip: 2, released: 0, qc: 0, carryOver: 0 }, // TODO(seed-huly)
      capacity: { week: 'W1', focusPct: 65, supportDrain: 10 },
      flag: 'AI VH 40–50% · ⚠ spike chi phí hạ tầng + sự cố ổn định (ngoài BSC)',
    },
    {
      squad: 'OMEGA', bp: 'innovation', domain: 'E-commerce / MKT',
      activeHeadcount: 5, kpiIds: ['hanh-trinh-kh', 'organic-traffic', 'cr-organic'], fidelity: 'rollup-only', flow: 'on-track',
      throughput: { week: 'W1', done: 9, wip: 4, released: 4, qc: 0, carryOver: 0 }, // TODO(seed-huly)
      capacity: { week: 'W1', focusPct: 80, supportDrain: 0 },
      outcomeMiss: true,
      flag: 'Ship CYO · Tamasy · YO.CREATOR — execution OK; 2 KPI off-track là outcome thị trường (DEC-19)',
    },
    {
      squad: 'LAMBDA', bp: 'innovation', domain: 'AI / NSHP',
      activeHeadcount: 3, kpiIds: ['nshp'], fidelity: 'rollup-only', flow: 'off-track',
      throughput: { week: 'W1', done: 1, wip: 1, released: 0, qc: 0, carryOver: 0 }, // TODO(seed-huly)
      capacity: { week: 'W1', focusPct: 105, supportDrain: 72, note: '>70% năng lực bị điều đi support squad khác' },
      flag: '20% kế hoạch tháng · overcommit — KPI chính bị bỏ đói, cần CTO tái phân bổ',
    },
    {
      squad: 'DATABI', bp: 'business-insights', domain: 'Data Engineering',
      activeHeadcount: 3, kpiIds: [], fidelity: 'rollup-only', flow: 'pending',
      throughput: null,
      capacity: null,
      flag: 'Chưa map task · chờ Huly seed W2',
    },
  ];

  /* Milestone snapshot — current W1 + history (DELTA/SIGMA có nhiều tháng → delivery-trend, Q10).
     status: planned|active|completed. TODO(seed-huly): targetDateOriginal cho on-time thật (PA-5). */
  const MILESTONE_SNAPSHOT = [
    { squad: 'DELTA', label: '26/06/W1', week: 'W1', status: 'completed', targetDate: '07/06/2026', taskTotal: 19, completed: 19, deliverable: 'BOM analysis · Design System · NPL inventory' },
    { squad: 'DELTA', label: '26/05/W4', week: 'prev', status: 'completed', targetDate: '31/05/2026', taskTotal: 17, completed: 17 },
    { squad: 'DELTA', label: '26/04/W4', week: 'prev', status: 'completed', targetDate: '30/04/2026', taskTotal: 15, completed: 14 },
    { squad: 'SIGMA', label: '26/06/W1', week: 'W1', status: 'completed', targetDate: '07/06/2026', taskTotal: 6, completed: 6, deliverable: 'SH Road · NCC · WMS/TMS/Inventory' },
    { squad: 'SIGMA', label: '26/05/W4', week: 'prev', status: 'completed', targetDate: '31/05/2026', taskTotal: 8, completed: 8 },
    { squad: 'GAMMA', label: '26/06/W1', week: 'W1', status: 'completed', targetDate: '08/06/2026', taskTotal: 10, completed: 10, deliverable: 'VAT sau chiết khấu · kiểm soát CK 50% · release 8/6' },
    { squad: 'BETA', label: '26/06/W1', week: 'W1', status: 'active', targetDate: '14/06/2026', taskTotal: 8, completed: 4, deliverable: 'Hệ quản trị quy trình 40–50%' },
    { squad: 'OMEGA', label: '26/06/W1', week: 'W1', status: 'active', targetDate: '14/06/2026', taskTotal: 13, completed: 9, deliverable: 'CYO · Tamasy · Sanji · YO.CREATOR' },
    { squad: 'LAMBDA', label: '26/06/W1', week: 'W1', status: 'active', targetDate: '14/06/2026', taskTotal: 5, completed: 1, deliverable: 'AIxPerf CFR + Goal Map · LMS đối tác' },
    // DATABI: chưa có milestone — unmapped
  ];

  /* Initiative (project view) — execution progress thật (DEC-21), KHÔNG render lại BSC status.
     progressPct = % build/milestone thực thi (khác pct BSC pace). */
  const INITIATIVES = [
    { id: 'plm', squad: 'DELTA', engine: 'PLM', title: 'Chuyển đổi số Quy trình CCƯ — engine BOM', progressPct: 30, flow: 'on-track', milestone: '26/06/W1 ✓', detail: '22 task · BOM 30% · Design System 100% · NPL 60%', note: 'Nặng phân tích/spec W1 — ship tăng từ W2' },
    { id: 'iom', squad: 'SIGMA', engine: 'APS', title: 'Vận hành Hàng hoá — SH Road + QR', progressPct: 35, flow: 'on-track', milestone: '26/06/W1 ✓', detail: 'Xuất/Trả NCC 80% · Kiểm kho 40%', note: '3/5 hạng mục dồn W4 — nên kéo 1 lên W2/W3' },
    { id: 'auto-don-hang', squad: 'GAMMA', engine: 'Auto-ĐH', title: 'Tự động hóa toàn trình đơn hàng', progressPct: 50, flow: 'on-track', milestone: '26/06/W1 ✓', detail: '10/10 task · release 8/6', note: 'Core VAT + kiểm soát CK đã release' },
    { id: 'ai-vh-to-chuc', squad: 'BETA', engine: 'AI-VH', title: 'AI trong Vận hành tổ chức', progressPct: 45, flow: 'watch', milestone: '26/06/W1 ◷', detail: 'Hệ quản trị quy trình 40–50%', note: 'Chưa áp dụng AI/NotebookLM' },
    { id: 'hanh-trinh-kh', squad: 'OMEGA', engine: 'CYO', title: 'CĐS Hành trình Khách hàng', progressPct: 40, flow: 'on-track', milestone: '26/06/W1 ◷', detail: 'Ship CYO/Tamasy/YO.CREATOR', note: 'Execution OK · chưa đo adoption' },
    { id: 'nshp', squad: 'LAMBDA', engine: 'NSHP', title: 'Hoàn tất dự án CĐS NSHP', progressPct: 20, flow: 'off-track', milestone: '26/06/W1 ◷', detail: 'AIxPerf + LMS · 20% kế hoạch tháng', note: 'Overcommit — >70% năng lực đi support' },
    { id: 'organic-traffic', squad: 'OMEGA', engine: 'WEBSI', title: 'Tăng trưởng Organic Traffic', progressPct: 16, flow: 'off-track', milestone: '—', detail: '76% mục tiêu tuần', note: 'Outcome-miss (thị trường) — execution OK', outcomeMiss: true },
  ];

  window.AGILE_DATA = { AGILE_META, BP_LABEL, BP_SHORT, SQUAD_DELIVERY, MILESTONE_SNAPSHOT, INITIATIVES };
})();
