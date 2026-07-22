/* agile-views.jsx — Agile lens views: AgileCommandBar · AgileVerdict ·
   SquadCard · AgileGrid (squad/project/sprint pivot) · AgileAlertFeed ·
   SquadDrillPanel (V6 + cross-lens bridge) · AgileView orchestrator. */

const { useState: useStateAg, useMemo: useMemoAg, useEffect: useEffectAg, useRef: useRefAg } = React;

const BP_SEG = [
  { v: 'all', label: 'Tất cả' },
  { v: 'digital-transformation', label: 'DT' },
  { v: 'innovation', label: 'Innovation' },
  { v: 'business-insights', label: 'Business Insights' },
];
const FLOW_TOGGLES = [
  { v: 'on-track', label: 'Đúng nhịp', c: 'var(--mint)' },
  { v: 'watch', label: 'Cần dõi', c: 'var(--gold)' },
  { v: 'off-track', label: 'Nghẽn', c: 'var(--gap)' },
  { v: 'pending', label: 'Chưa map', c: 'var(--fg-3)' },
];
const PIVOTS = [{ v: 'squad', label: 'Squad' }, { v: 'project', label: 'Dự án' }, { v: 'sprint', label: 'Sprint' }];

/* ── Command bar (adaptive Agile) ────────────────────────────────────── */
function AgileCommandBar({ filter, setFilter, total, shown }) {
  const AS = window.AGILE_SEL, AD = window.AGILE_DATA;
  const squads = AS.ALL_SQUADS;
  const toggleSquad = (s) => { const c = filter.squads; setFilter({ ...filter, squads: c.indexOf(s) >= 0 ? c.filter((x) => x !== s) : [...c, s] }); };
  const toggleFlow = (s) => { const c = filter.flows; setFilter({ ...filter, flows: c.indexOf(s) >= 0 ? c.filter((x) => x !== s) : [...c, s] }); };
  const active = filter.bp !== 'all' || filter.squads.length < squads.length || filter.flows.length < 4;
  const reset = () => setFilter({ ...filter, bp: 'all', squads: [...squads], flows: [...AS.ALL_FLOWS] });
  return (
    <div className="fbar">
      <div className="fbar-row">
        <span className="fbar-lab">BP</span>
        <div className="seg" role="group" aria-label="Business Pillar">
          {BP_SEG.map((b) => <button key={b.v} aria-pressed={filter.bp === b.v} onClick={() => setFilter({ ...filter, bp: b.v })}>{b.label}</button>)}
        </div>
        <span className="spacer" />
        <div className="wk-select" title="W2–W4 chưa có dữ liệu">
          <window.Icon name="clock" size={13} color="var(--fg-3)" />
          <select value={filter.week} onChange={(e) => setFilter({ ...filter, week: e.target.value })}>
            <option value="W1">Tuần W1</option>
            <option value="W2" disabled>W2 · chưa có dữ liệu</option>
            <option value="W3" disabled>W3 · chưa có dữ liệu</option>
            <option value="W4" disabled>W4 · chưa có dữ liệu</option>
          </select>
        </div>
      </div>
      <div className="fbar-row">
        <span className="fbar-lab">Squad</span>
        <div className="chips" role="group" aria-label="Lọc squad">
          {squads.map((t) => {
            const on = filter.squads.indexOf(t) >= 0;
            return <button key={t} className="chip-f" aria-pressed={on} onClick={() => toggleSquad(t)}><span className="tick">{on && <window.Icon name="check" size={9} />}</span>{t}</button>;
          })}
        </div>
      </div>
      <div className="fbar-row">
        <span className="fbar-lab">Flow</span>
        <div className="toggles" role="group" aria-label="Lọc flow">
          {FLOW_TOGGLES.map((s) => <button key={s.v} className="tgl" aria-pressed={filter.flows.indexOf(s.v) >= 0} onClick={() => toggleFlow(s.v)}><span className="sw" style={{ background: s.c }} />{s.label}</button>)}
        </div>
        <span className="spacer" />
        <div className="readout">
          <span>Đang xem: <b className="tnum">{shown}/{total}</b> squad</span>
          {active && <button className="reset" onClick={reset}><window.Icon name="reset" size={11} /> reset</button>}
        </div>
      </div>
    </div>
  );
}

/* ── Verdict (Agile variant) ─────────────────────────────────────────── */
const SH_ORDER = [
  { key: 'on-track', label: 'Đúng nhịp', fill: 'var(--mint)', text: 'var(--mint-deep)' },
  { key: 'watch', label: 'Cần dõi', fill: 'var(--gold)', text: 'var(--plan-deep)' },
  { key: 'off-track', label: 'Nghẽn', fill: 'var(--gap)', text: 'var(--gap-deep)' },
  { key: 'pending', label: 'Chưa map', fill: 'var(--fg-3)', text: 'var(--fg-3)' },
];
const DH_TIP = 'Delivery health = Σ(headcount × hệ số flow) / Σheadcount × 100. Hệ số: đúng nhịp 1.0 · cần dõi 0.6 · chưa map 0.5 · nghẽn 0.2.';

function AgileVerdict() {
  const AS = window.AGILE_SEL;
  const dh = AS.deliveryHealth();
  const st = AS.deliveryStats();
  const score = window.useCountUp(dh.score);
  const PILLS = [
    { n: st.taskDone, lab: 'Task xong', sub: 'W1 · task-level', accent: 'mint' },
    { n: st.wip, lab: 'Đang chạy', sub: 'WIP toàn squad', accent: 'iris' },
    { n: st.blocked, lab: 'Squad nghẽn', sub: 'flow off-track', accent: 'gap' },
    { n: st.healthy + '/' + st.total, lab: 'Đúng nhịp', sub: 'squad healthy', accent: 'brand' },
  ];
  return (
    <section className="verdict-band" data-screen-label="agile-verdict">
      <div className="banner banner-info verdict-insight">
        <span className="banner-icon"><window.Icon name="gitBranch" size={11} /></span>
        <div className="banner-body">
          <b>Kết luận execution tuần 1:</b> đội ngũ giao hàng <em>khoẻ</em> — DELTA 22 task milestone PLM, SIGMA 6 task milestone APS (W1.M6 completed).
          2 KPI off-track (Organic, CR) là <b>outcome thị trường</b>, không phải squad giao kém. Nghẽn thật dồn ở <b>LAMBDA</b> — overcommit, &gt;70% năng lực đi support.
        </div>
      </div>
      <div className="kpi-grid">
        <div className="kpi health" data-accent="brand">
          <div className="kpi-label">Delivery health · <span className="health-info" title={DH_TIP}>cách tính ⓘ</span></div>
          <div className="kpi-value"><span className="tnum">{score}</span><span className="unit">/ 100</span></div>
          <div className="hbar" role="img" aria-label={'healthy ' + dh.mix['on-track']}>
            {SH_ORDER.map((s) => dh.mix[s.key] ? <span key={s.key} title={s.label + ' · ' + dh.mix[s.key]} style={{ width: (dh.mix[s.key] / dh.total * 100) + '%', background: s.fill }} /> : null)}
          </div>
          <div className="hbar-legend">
            {SH_ORDER.map((s) => <span className="lg" key={s.key}><i style={{ background: s.fill }} />{s.label} <span className="tnum" style={{ color: 'var(--fg-3)' }}>{dh.mix[s.key]}</span></span>)}
          </div>
        </div>
        {PILLS.map((p) => (
          <div className="kpi" data-accent={p.accent} key={p.lab}>
            <div className="kpi-label">{p.lab}</div>
            <div className="kpi-value"><span className="tnum">{p.n}</span></div>
            <div className="kpi-sub">{p.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Squad scorecard tile ────────────────────────────────────────────── */
function SquadCard({ s, onOpen, isActive }) {
  const AS = window.AGILE_SEL, AD = window.AGILE_DATA;
  const m = window.FLOW_META[s.flow];
  const w = AS.squadKpiWeight(s.squad);
  return (
    <button type="button" className={'scard' + (isActive ? ' is-active' : '') + (s.fidelity === 'rollup-only' ? ' is-rollup' : '')}
      style={{ borderLeftColor: m.fill }} onClick={() => onOpen(s.squad)} aria-label={'Mở squad ' + s.squad}>
      <div className="scard-r1">
        <span className="tag-mono tag-engine">{s.squad}</span>
        <span className="tag-mono">{AD.BP_SHORT[s.bp]}</span>
        <span className="spread" />
        <window.FlowPill flow={s.flow} />
      </div>
      <div className="scard-domain">{s.domain}{s.engine ? ' · ' + s.engine : ''}</div>
      <window.ThroughputBar throughput={s.throughput} fidelity={s.fidelity} />
      <div className={'scard-flag' + (s.flow === 'off-track' ? ' crit' : s.flow === 'watch' ? ' warn' : '')}>{s.flag}</div>
      <window.CapacityBar capacity={s.capacity} />
      <div className="scard-foot">
        {s.kpiIds.length > 0
          ? <span className="kpi-link"><window.Icon name="arrowRight" size={11} /> gánh {s.kpiIds.length} KPI · {w}% trọng số</span>
          : <span className="kpi-link muted">không gánh KPI BSC</span>}
        <window.FidelityBadge fidelity={s.fidelity} />
      </div>
    </button>
  );
}

/* ── Project lane row ────────────────────────────────────────────────── */
function ProjectLane({ it, onOpen }) {
  const m = window.FLOW_META[it.flow];
  const k = window.DASH_DATA.WEEKLY_TRACKING.find((x) => x.id === it.id);
  return (
    <button type="button" className="lane" style={{ borderLeftColor: m.fill }} onClick={() => onOpen(it.squad)}>
      <div className="lane-main">
        <div className="lane-top">
          <span className="tag-mono tag-engine">{it.engine}</span>
          <span className="tag-mono">{it.squad}</span>
          <span className="lane-title">{it.title}</span>
          <span className="spread" />
          <window.FlowPill flow={it.flow} />
        </div>
        <div className="lane-detail">{it.detail}{it.note ? <span className="lane-note"> · {it.note}</span> : null}</div>
        {k && <div className="kpi-link"><window.Icon name="arrowRight" size={11} /> gánh KPI: {k.name} ({k.weight}%)</div>}
      </div>
      <div className="lane-prog">
        <div className="lane-pct tnum">{it.progressPct}%</div>
        <div className="progress"><div className="progress-fill" style={{ width: it.progressPct + '%', background: m.fill }} /></div>
        <div className="lane-ms v3-mono">{it.milestone}</div>
      </div>
    </button>
  );
}

/* ── Delivery alert feed (project/sprint view) ───────────────────────── */
const AG_BUCKETS = [
  { key: 'block', title: 'Nghẽn giao hàng', icon: 'x', color: 'var(--gap)' },
  { key: 'watch', title: 'Cần theo dõi', icon: 'triangle', color: 'var(--gold-deep)' },
  { key: 'run', title: 'Đang chạy', icon: 'clock', color: 'var(--iris-deep)' },
];
function AgileAlertFeed({ alerts, onOpen }) {
  return (
    <aside className="alertrail" aria-label="Cảnh báo giao hàng">
      <div className="alert-railhead"><window.Icon name="gitBranch" size={14} color="var(--iris-deep)" /> Giao hàng<span className="ct tnum">{alerts.length} mục</span></div>
      {AG_BUCKETS.map((b) => {
        const rows = alerts.filter((a) => a.bucket === b.key);
        if (!rows.length) return null;
        return (
          <div className="alert-group" key={b.key}>
            <div className="alert-group-head" style={{ color: b.color }}><span className="ic"><window.Icon name={b.icon} size={13} /></span><span className="ti">{b.title}</span><span className="ct tnum">{rows.length}</span></div>
            <div className="alert-list">
              {rows.map((a, i) => (
                <button key={i} className={'alert sev-' + (a.severity === 'high' ? 'high' : a.severity === 'medium' ? 'medium' : 'low')} onClick={() => onOpen(a.squad)}>
                  <div className="alert-top"><span className="alert-ti">{a.title}</span><span className="alert-team">{a.squad}{a.outcomeMiss ? ' · outcome' : ''}</span><span className="alert-chev"><window.Icon name="chevronRight" size={13} /></span></div>
                  <div className="alert-detail">{a.detail}</div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </aside>
  );
}

Object.assign(window, { BP_SEG, FLOW_TOGGLES, PIVOTS, AgileCommandBar, AgileVerdict, SquadCard, ProjectLane, AgileAlertFeed, SH_ORDER });
