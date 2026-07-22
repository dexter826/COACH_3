/* agile-selectors.js — pure selectors cho Agile lens.
   Maps to src/data/kpi-agile-selectors.ts. Link qua kpiId sang BSC data. */
(function () {
  'use strict';
  const A = window.AGILE_DATA;
  const D = window.DASH_DATA;
  const BSEL = window.DASH_SEL;

  const STATUS_FACTOR = { 'on-track': 1.0, watch: 0.6, pending: 0.5, 'off-track': 0.2 };
  const ALL_SQUADS = A.SQUAD_DELIVERY.map((s) => s.squad);
  const ALL_FLOWS = ['on-track', 'watch', 'off-track', 'pending'];
  const ALL_BP = ['digital-transformation', 'innovation', 'business-insights'];

  function squad(code) { return A.SQUAD_DELIVERY.find((s) => s.squad === code) || null; }

  /* trọng số BSC mà squad gánh (cross-lens context, chống PA-2) */
  function squadKpiWeight(code) {
    const s = squad(code); if (!s) return 0;
    return s.kpiIds.reduce((sum, id) => {
      const k = D.WEEKLY_TRACKING.find((x) => x.id === id);
      return sum + (k ? k.weight : 0);
    }, 0);
  }

  function squadToKpis(code) {
    const s = squad(code); if (!s) return [];
    return s.kpiIds.map((id) => {
      const k = D.WEEKLY_TRACKING.find((x) => x.id === id);
      return k ? { id, name: k.name, weight: k.weight, status: BSEL.statusOf(k) } : null;
    }).filter(Boolean);
  }
  function bridgeKpiToSquad(kpiId) {
    return A.SQUAD_DELIVERY.find((s) => s.kpiIds.indexOf(kpiId) >= 0) || null;
  }

  /* delivery health = Σ(headcount × factor[flow]) / Σheadcount × 100 */
  function deliveryHealth() {
    let num = 0, den = 0;
    const mix = { 'on-track': 0, watch: 0, 'off-track': 0, pending: 0 };
    A.SQUAD_DELIVERY.forEach((s) => {
      num += s.activeHeadcount * STATUS_FACTOR[s.flow];
      den += s.activeHeadcount;
      mix[s.flow] += 1;
    });
    return { score: Math.round((num / den) * 100), mix, total: A.SQUAD_DELIVERY.length };
  }

  /* verdict stat pills (honest — task-level only where real) */
  function deliveryStats() {
    const taskLevel = A.SQUAD_DELIVERY.filter((s) => s.fidelity === 'task-level' && s.throughput);
    const taskDone = taskLevel.reduce((n, s) => n + s.throughput.done, 0);
    const wip = A.SQUAD_DELIVERY.reduce((n, s) => n + (s.throughput ? s.throughput.wip : 0), 0);
    const blocked = A.SQUAD_DELIVERY.filter((s) => s.flow === 'off-track').length;
    const healthy = A.SQUAD_DELIVERY.filter((s) => s.flow === 'on-track').length;
    return { taskDone, wip, blocked, healthy, total: A.SQUAD_DELIVERY.length };
  }

  function squadScorecard(code) {
    const s = squad(code); if (!s) return null;
    return {
      ...s,
      kpiWeight: squadKpiWeight(code),
      kpiCount: s.kpiIds.length,
      milestones: A.MILESTONE_SNAPSHOT.filter((m) => m.squad === code),
      isDrained: !!(s.capacity && s.capacity.supportDrain > 70),
      overcommit: !!(s.capacity && s.capacity.focusPct > 100),
    };
  }

  function projectRollup() { return A.INITIATIVES; }

  /* sprint/milestone roll-up — current week */
  function sprintMetrics(week) {
    const w = week || 'W1';
    const cur = A.MILESTONE_SNAPSHOT.filter((m) => m.week === 'W1');
    const completed = cur.filter((m) => m.status === 'completed').length;
    const total = cur.length;
    return { week: w, milestones: cur, completed, total, completionPct: total ? Math.round((completed / total) * 100) : 0 };
  }

  /* milestone history (delivery trend, Q10) — squads với ≥2 milestone */
  function milestoneTrend(code) {
    return A.MILESTONE_SNAPSHOT.filter((m) => m.squad === code)
      .map((m) => ({ label: m.label, status: m.status, pct: m.taskTotal ? Math.round((m.completed / m.taskTotal) * 100) : 0 }));
  }

  /* flow metrics — burndown KHÔNG ready ở W1 (1 tuần, DEC-20) */
  function flowMetrics(code) {
    return { ready: false, reason: 'W1 baseline — burndown mở từ W2 (cần ≥2 điểm)', series: [] };
  }

  function capacityAllocation() {
    return A.SQUAD_DELIVERY.filter((s) => s.capacity).map((s) => ({
      squad: s.squad, focusPct: s.capacity.focusPct, supportDrain: s.capacity.supportDrain,
      isDrained: s.capacity.supportDrain > 70, overcommit: s.capacity.focusPct > 100,
    }));
  }

  function filterSquads(filter) {
    const f = filter || {};
    const bps = f.bps && f.bps.length ? f.bps : ALL_BP;
    const sq = f.squads && f.squads.length ? f.squads : ALL_SQUADS;
    const fl = f.flows && f.flows.length ? f.flows : ALL_FLOWS;
    return A.SQUAD_DELIVERY.filter((s) => bps.indexOf(s.bp) >= 0 && sq.indexOf(s.squad) >= 0 && fl.indexOf(s.flow) >= 0);
  }

  /* delivery alert feed (project/sprint view) — derive từ initiatives */
  function deliveryAlerts() {
    const out = [];
    A.INITIATIVES.forEach((it) => {
      if (it.flow === 'off-track') out.push({ squad: it.squad, title: it.engine + ' · ' + it.title, detail: it.detail + ' — ' + it.note, severity: 'high', bucket: 'block', outcomeMiss: it.outcomeMiss });
    });
    A.INITIATIVES.forEach((it) => {
      if (it.flow === 'watch') out.push({ squad: it.squad, title: it.engine + ' · ' + it.title, detail: it.note, severity: 'medium', bucket: 'watch' });
    });
    A.INITIATIVES.forEach((it) => {
      if (it.flow === 'on-track') out.push({ squad: it.squad, title: it.engine + ' · đang chạy', detail: it.detail, severity: 'low', bucket: 'run' });
    });
    return out;
  }

  window.AGILE_SEL = {
    STATUS_FACTOR, ALL_SQUADS, ALL_FLOWS, ALL_BP,
    squad, squadKpiWeight, squadToKpis, bridgeKpiToSquad,
    deliveryHealth, deliveryStats, squadScorecard, projectRollup,
    sprintMetrics, milestoneTrend, flowMetrics, capacityAllocation,
    filterSquads, deliveryAlerts,
  };
})();
