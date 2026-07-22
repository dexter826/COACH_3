/* agile-core.jsx — Agile primitives: FlowPill · CapacityBar · ThroughputBar ·
   MilestoneProgress · FidelityBadge. Reuse BSC status tokens (relabel). */

const FLOW_META = {
  'on-track': { label: 'Đúng nhịp', fill: 'var(--mint)', text: 'var(--mint-deep)', bg: 'var(--live-bg)', border: 'color-mix(in srgb, var(--mint) 32%, transparent)', icon: 'check' },
  watch: { label: 'Cần dõi', fill: 'var(--gold)', text: 'var(--plan-deep)', bg: 'color-mix(in srgb, #fcaf16 16%, white)', border: 'color-mix(in srgb, #fcaf16 55%, transparent)', icon: 'triangle' },
  'off-track': { label: 'Nghẽn', fill: 'var(--gap)', text: 'var(--gap-deep)', bg: 'var(--gap-bg)', border: 'color-mix(in srgb, var(--gap) 34%, transparent)', icon: 'x' },
  pending: { label: 'Chưa map', fill: 'var(--fg-3)', text: 'var(--fg-3)', bg: 'var(--bg-muted)', border: 'var(--border)', icon: 'circle' },
};

function FlowPill({ flow }) {
  const m = FLOW_META[flow] || FLOW_META.pending;
  return (
    <span className="pill" style={{ color: m.text, background: m.bg, borderColor: m.border }}>
      <span className="ic" style={{ color: m.fill }}><window.Icon name={m.icon} size={11} /></span>
      {m.label}
    </span>
  );
}

/* CapacityBar — bullet + 70% threshold marker. Overcommit >100% → fill tràn đỏ (LAMBDA drain). */
function CapacityBar({ capacity }) {
  if (!capacity) return <div className="pace-na">Chưa map năng lực</div>;
  const over = capacity.focusPct > 100;
  const fillW = Math.min(100, capacity.focusPct);
  const col = over ? 'var(--gap)' : capacity.supportDrain > 50 ? 'var(--gold)' : 'var(--mint)';
  return (
    <div className="cap">
      <div className="cap-track">
        <div className="cap-fill" style={{ width: fillW + '%', background: col }} />
        <div className="cap-thresh" style={{ left: '70%' }} title="Ngưỡng 70% năng lực" />
      </div>
      <div className="cap-meta">
        <span><span className="tnum" style={{ color: 'var(--fg-1)', fontWeight: 700 }}>{capacity.focusPct}%</span> năng lực{over ? ' · overcommit' : ''}</span>
        {capacity.supportDrain > 0 && <span style={{ color: capacity.supportDrain > 70 ? 'var(--gap-deep)' : 'var(--fg-3)' }}>drain {capacity.supportDrain}%</span>}
      </div>
    </div>
  );
}

/* ThroughputBar — done · wip + stacked released|qc|carry mini-bar */
function ThroughputBar({ throughput, fidelity }) {
  if (!throughput) return <div className="pace-na">Chưa map task · chờ Huly</div>;
  const t = throughput;
  const segs = [
    { v: t.released, c: 'var(--mint)', label: 'Released' },
    { v: t.qc, c: 'var(--iris)', label: 'QC' },
    { v: t.carryOver, c: 'var(--fg-3)', label: 'Carry' },
  ].filter((s) => s.v > 0);
  const segTotal = segs.reduce((n, s) => n + s.v, 0);
  const otherDone = Math.max(0, t.done - segTotal);
  return (
    <div className="thru">
      <div className="thru-nums">
        <span><b className="tnum">{t.done}</b> done</span>
        <span><b className="tnum">{t.wip}</b> wip</span>
        {t.released > 0 && <span className="thru-tag" style={{ color: 'var(--mint-deep)' }}>{t.released} released</span>}
        {t.qc > 0 && <span className="thru-tag" style={{ color: 'var(--iris-deep)' }}>{t.qc} QC</span>}
        {t.carryOver > 0 && <span className="thru-tag" style={{ color: 'var(--fg-3)' }}>{t.carryOver} carry</span>}
      </div>
      <div className="thru-bar">
        {otherDone > 0 && <span style={{ flex: otherDone, background: 'color-mix(in srgb, var(--mint) 45%, var(--bg-muted))' }} />}
        {segs.map((s, i) => <span key={i} style={{ flex: s.v, background: s.c }} title={s.label + ' ' + s.v} />)}
      </div>
    </div>
  );
}

/* MilestoneProgress — bar (KHÔNG donut) + due pill */
function MilestoneProgress({ m }) {
  const pct = m.taskTotal ? Math.round((m.completed / m.taskTotal) * 100) : 0;
  const done = m.status === 'completed';
  const col = done ? 'var(--mint)' : 'var(--iris)';
  return (
    <div className="mstone">
      <div className="mstone-head">
        <span className="mstone-lab">{m.label}</span>
        <span className="mstone-stat" style={{ color: done ? 'var(--mint-deep)' : 'var(--iris-deep)' }}>
          {done ? '✓ completed' : '◷ active'} · {m.completed}/{m.taskTotal}
        </span>
      </div>
      <div className="progress"><div className="progress-fill" style={{ width: pct + '%', background: col }} /></div>
      {m.deliverable && <div className="mstone-deliv">{m.deliverable} <span className="v3-mono">· due {m.targetDate}</span></div>}
    </div>
  );
}

function FidelityBadge({ fidelity }) {
  if (fidelity === 'task-level') return <span className="fid fid-task" title="Số task thật từ Huly milestone"><window.Icon name="check" size={9} /> task-level</span>;
  return <span className="fid fid-roll" title="Suy từ PITSTOP — chưa map Huly task-level"><window.Icon name="info" size={9} /> rollup · chưa map Huly</span>;
}

Object.assign(window, { FLOW_META, FlowPill, CapacityBar, ThroughputBar, MilestoneProgress, FidelityBadge });
