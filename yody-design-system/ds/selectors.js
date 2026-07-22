/* selectors.js — port of src/data/kpi-dashboard-selectors.ts (BSC lens).
   Pure, server-safe functions. No fetch. window.DASH_SEL.
   Formulas per 03-DATA-METRICS-CONTRACT §2. */
(function () {
  'use strict';
  const D = window.DASH_DATA;

  // elapsed(Wn) — % thời gian tháng đã trôi (Q2 default = data W1≈23%)
  const ELAPSED = { W1: 23, W2: 47, W3: 70, W4: 100 };
  // health score factor (DEC-1)
  const STATUS_FACTOR = { 'on-track': 1.0, watch: 0.6, pending: 0.5, 'off-track': 0.2 };

  const ALL_TEAMS = ['DELTA', 'SIGMA', 'BETA', 'GAMMA', 'LAMBDA', 'OMEGA', 'CN&CĐS'];
  const ALL_STATUSES = ['on-track', 'watch', 'off-track', 'pending'];
  const GROUP_ORDER = ['finance', 'customer', 'operation', 'learning'];

  function statusOf(kpi, week) {
    const w = week || D.TRACKING_META.latestWeek;
    const t = kpi.tracks.find((x) => x.week === w);
    return t ? t.status : 'pending';
  }

  function emptyByStatus() {
    return { 'on-track': { count: 0, weight: 0 }, 'off-track': { count: 0, weight: 0 }, watch: { count: 0, weight: 0 }, pending: { count: 0, weight: 0 } };
  }

  // ── Health score (DEC-1) ──────────────────────────────────────────────
  function computeHealthScore(week) {
    const byStatus = emptyByStatus();
    let total = 0, weighted = 0;
    for (const k of D.WEEKLY_TRACKING) {
      const st = statusOf(k, week);
      byStatus[st].count += 1;
      byStatus[st].weight += k.weight;
      total += k.weight;
      weighted += k.weight * STATUS_FACTOR[st];
    }
    return { score: Math.round((weighted / total) * 100), onTrackWeight: byStatus['on-track'].weight, total, byStatus };
  }

  // ── Pace (§2.2) — phân nhánh PaceMethod ───────────────────────────────
  function paceMethod(pctNote) {
    if (!pctNote) return 'initiative';
    if (pctNote.indexOf('Duy trì ngưỡng') >= 0) return 'threshold';
    if (pctNote.indexOf('Tăng trưởng') >= 0) return 'growth';
    if (pctNote.indexOf('Tỷ lệ') >= 0) return 'ratio';
    return 'initiative';
  }
  function paceForKpi(id, week) {
    const w = week || D.TRACKING_META.latestWeek;
    const expectedPct = ELAPSED[w];
    const r = D.PITSTOP_RESULT[id];
    const kpi = D.WEEKLY_TRACKING.find((k) => k.id === id);
    const status = kpi ? statusOf(kpi, w) : 'pending';
    // plm/iom have no PITSTOP_RESULT.pct → derive cluster avg from breakdown (P8)
    if (!r || r.pct == null) {
      const bd = D.DRIVER_BREAKDOWN[id];
      if (bd) {
        const avg = Math.round(bd.reduce((s, x) => s + x.pct, 0) / bd.length);
        return { pct: avg, expectedPct, method: 'initiative', paceRatio: avg / expectedPct, forecastEnd: Math.min(100, Math.round((avg / expectedPct) * 100)), verdict: paceVerdict('initiative', avg / expectedPct, status), derived: true, pctNote: 'Số hóa · trung bình cụm hạng mục (chưa có pct chuẩn — P8/data req §7.2)' };
      }
      return { pct: null, expectedPct, method: 'pending', paceRatio: null, forecastEnd: null, verdict: 'na', pctNote: r ? r.pctNote : 'Chưa triển khai W1' };
    }
    const method = paceMethod(r.pctNote);
    const paceRatio = r.pct / expectedPct;
    const forecastEnd = Math.min(160, Math.round((r.pct / expectedPct) * 100));
    return { pct: r.pct, expectedPct, method, paceRatio, forecastEnd, verdict: paceVerdict(method, paceRatio, status), pctNote: r.pctNote, result: r.result };
  }
  function paceVerdict(method, ratio, status) {
    if (method === 'threshold') return 'on';            // duy trì ngưỡng = đúng nhịp
    if (method === 'ratio') return status === 'off-track' ? 'behind' : 'on';
    if (ratio == null) return 'na';
    if (ratio >= 1.1) return 'ahead';
    if (ratio >= 0.95) return 'on';
    if (ratio >= 0.7) return 'watch';
    return 'behind';
  }

  // ── Trend dots (§2.1) — pad đủ 4 tuần ─────────────────────────────────
  const ALL_WEEKS = ['W1', 'W2', 'W3', 'W4'];
  function weekTrend(kpi) {
    return ALL_WEEKS.map((w) => {
      const t = kpi.tracks.find((x) => x.week === w);
      const has = !!t && D.TRACKING_WEEKS.indexOf(w) >= 0;
      return { week: w, status: t ? t.status : null, has };
    });
  }

  // ── Aggregate roll-ups (§2.5) ─────────────────────────────────────────
  function dominant(byStatus) {
    // priority for "tone" of a group cell
    const order = ['off-track', 'watch', 'pending', 'on-track'];
    let best = 'on-track', bestW = -1;
    for (const s of ALL_STATUSES) if (byStatus[s].weight > bestW) { bestW = byStatus[s].weight; best = s; }
    // if any off-track present, surface it; else weight-dominant
    if (byStatus['off-track'].weight > 0 && byStatus['off-track'].weight >= byStatus['on-track'].weight * 0.34) return 'off-track';
    return best;
    void order;
  }
  function aggregateByPerspective(week) {
    return GROUP_ORDER.map((group) => {
      const rows = D.WEEKLY_TRACKING.filter((k) => k.group === group);
      const byStatus = emptyByStatus();
      let weight = 0;
      for (const k of rows) { const st = statusOf(k, week); byStatus[st].count++; byStatus[st].weight += k.weight; weight += k.weight; }
      const onTrackPct = weight ? Math.round((byStatus['on-track'].weight / weight) * 100) : 0;
      return { group, weight, count: rows.length, byStatus, dominant: dominant(byStatus), onTrackPct };
    });
  }
  function aggregateByTeam(week) {
    const teams = [...new Set(D.WEEKLY_TRACKING.map((k) => k.team))];
    return teams.map((team) => {
      const rows = D.WEEKLY_TRACKING.filter((k) => k.team === team);
      const byStatus = emptyByStatus();
      let weight = 0;
      for (const k of rows) { const st = statusOf(k, week); byStatus[st].count++; byStatus[st].weight += k.weight; weight += k.weight; }
      return { team, weight, count: rows.length, byStatus, dominant: dominant(byStatus) };
    });
  }

  // ── Anomaly feed (§2.3, A1–A10) — rule-based, whitelist note ──────────
  function detectAnomalies(week) {
    const w = week || D.TRACKING_META.latestWeek;
    const A = [];
    const push = (o) => A.push(o);
    // A1 off-track BSC
    push({ kpiId: 'organic-traffic', kind: 'off-track', severity: 'high', bucket: 'act', team: 'OMEGA', inBsc: true,
      title: 'Organic Traffic', detail: '76% mục tiêu tuần · pace 0.52 — nguy cơ hụt đích tháng (A1+A5)' });
    push({ kpiId: 'cr-organic', kind: 'off-track', severity: 'high', bucket: 'act', team: 'OMEGA', inBsc: true,
      title: 'CR Organic Traffic', detail: '16% thực đạt (0,12% / 0,33% mục tiêu) — chưa có đòn bẩy CR (A1)' });
    // A2 off-track ngoài BSC
    push({ kpiId: 'stability', kind: 'off-track', severity: 'high', bucket: 'act', team: 'BETA', inBsc: false,
      title: 'Độ ổn định hệ thống', detail: 'kafka over-memory · ERP→Unicorn connect timeout (A2)' });
    // A4 capacity drain + A6 pace watch
    push({ kpiId: 'nshp', kind: 'capacity', severity: 'medium', bucket: 'watch', team: 'LAMBDA', inBsc: true,
      title: 'NSHP — năng lực bị rút', detail: '20% kế hoạch tháng · >70% năng lực đi support team khác · cần CTO quyết (A4+A6)' });
    // A3 cost spike
    push({ kpiId: 'chi-phi-dt', kind: 'spike', severity: 'medium', bucket: 'watch', team: 'BETA', inBsc: true,
      title: 'Spike chi phí hạ tầng', detail: 'AWS 01/6 $1.462 (2,5×) chưa rõ root cause · Datadog ~$1.000/tháng (A3)' });
    // A7 deadline crunch
    push({ kpiId: 'iom', kind: 'crunch', severity: 'low', bucket: 'watch', team: 'SIGMA', inBsc: true,
      title: 'APS — dồn deadline W4', detail: '3/5 hạng mục dồn W4 (Chia hàng + QR nhập kho) — nên kéo 1 lên W2/W3 (A7)' });
    // A8 pending
    push({ kpiId: 'timeline-qt', kind: 'pending', severity: 'low', bucket: 'watch', team: 'CN&CĐS', inBsc: true,
      title: 'Timeline Quản trị', detail: 'chưa triển khai W1 · cụm deadline BĐH dồn 15–25/06 (A8+A7)' });
    push({ kpiId: 'nhan-su-chuan', kind: 'pending', severity: 'low', bucket: 'watch', team: 'CN&CĐS', inBsc: true,
      title: 'Nhân sự đạt chuẩn', detail: 'chưa triển khai W1 · chốt ở HSC 15–25/06 (A8)' });
    // A10 repeated defect
    push({ kpiId: 'yc-ho-tro', kind: 'defect', severity: 'low', bucket: 'data', team: 'BETA', inBsc: true,
      title: 'YC Hỗ trợ — lỗi lặp', detail: '2 lỗi lặp nhiều tuần: thiếu mã sinh nhật (sync ES↔Unicorn) + lỗi OTP (A10)' });
    // A9 data quality
    push({ kpiId: 'hanh-trinh-kh', kind: 'data', severity: 'data', bucket: 'data', team: 'OMEGA', inBsc: true,
      title: 'Dataset CYO sai chuẩn', detail: D.TRACKING_DATA_NOTE + ' (A9)' });
    void w;
    return A;
  }

  // ── Filter (DEC-8, AND) ───────────────────────────────────────────────
  function filterKpis(filter) {
    const f = filter || {};
    const teams = f.teams && f.teams.length ? f.teams : ALL_TEAMS;
    const statuses = f.statuses && f.statuses.length ? f.statuses : ALL_STATUSES;
    return D.WEEKLY_TRACKING.filter((k) => {
      if (f.perspective && f.perspective !== 'all' && k.group !== f.perspective) return false;
      if (teams.indexOf(k.team) < 0) return false;
      if (statuses.indexOf(statusOf(k, f.week)) < 0) return false;
      return true;
    });
  }

  // subset weight normalize (DEC-8)
  function subsetWeight(kpis) { return kpis.reduce((s, k) => s + k.weight, 0); }

  function mapKpiToGantt(id) { return D.GANTT_BY_KPI[id] || null; }

  window.DASH_SEL = {
    ELAPSED, STATUS_FACTOR, ALL_TEAMS, ALL_STATUSES, GROUP_ORDER, ALL_WEEKS,
    statusOf, computeHealthScore, paceForKpi, weekTrend,
    aggregateByPerspective, aggregateByTeam, detectAnomalies,
    filterKpis, subsetWeight, mapKpiToGantt,
  };
})();
