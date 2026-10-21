/* viz.jsx — diversified data-viz: KpiTable (sortable) · PaceRankBar ·
   ActivityHeatmap (squad×month cadence) · DeliveryRings · SquadLoadChart. */

const { useState: useStateV } = React;

const GROUP_SHORT = { finance: 'Tài chính', customer: 'Khách hàng', operation: 'Vận hành', learning: 'Học hỏi' };
const STATUS_SORT = { 'off-track': 0, watch: 1, pending: 2, 'on-track': 3 };
function paceFillColor(v) { return v === 'behind' ? 'var(--gap)' : v === 'watch' ? 'var(--gold)' : v === 'na' ? 'var(--fg-3)' : 'var(--mint)'; }

/* ── BSC: sortable data-table (app-data-table) ───────────────────────── */
function KpiTable({ kpis, onOpen, activeId, week }) {
  const S = window.DASH_SEL, D = window.DASH_DATA;
  const [sort, setSort] = useStateV({ key: 'weight', dir: 'desc' });
  const head = (key, label, cls) => {
    const active = sort.key === key;
    return (
      <th className={cls} data-sortable="true" data-sort={active ? sort.dir : undefined}
        onClick={() => setSort({ key, dir: active && sort.dir === 'desc' ? 'asc' : 'desc' })}>{label}</th>
    );
  };
  const rows = [...kpis].map((k) => {
    const st = S.statusOf(k, week); const pace = S.paceForKpi(k.id, week);
    return { k, st, pace };
  });
  rows.sort((a, b) => {
    let av, bv;
    if (sort.key === 'weight') { av = a.k.weight; bv = b.k.weight; }
    else if (sort.key === 'pace') { av = a.pace.pct == null ? -1 : a.pace.pct; bv = b.pace.pct == null ? -1 : b.pace.pct; }
    else if (sort.key === 'status') { av = STATUS_SORT[a.st]; bv = STATUS_SORT[b.st]; }
    else { av = a.k.name; bv = b.k.name; }
    if (av < bv) return sort.dir === 'asc' ? -1 : 1;
    if (av > bv) return sort.dir === 'asc' ? 1 : -1;
    return 0;
  });
  return (
    <div className="dt-wrap">
      <div className="dt-scroll">
        <table className="dt" data-density="cozy">
          <thead>
            <tr>
              {head('name', 'Chỉ tiêu', 'freeze')}
              <th className="center">Team</th>
              <th>Góc nhìn</th>
              {head('weight', 'Trọng số', 'num')}
              {head('status', 'Trạng thái', 'center')}
              {head('pace', 'Pace lũy kế', '')}
              <th className="center">Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ k, st, pace }) => {
              const m = window.STATUS_META[st];
              const eng = D.ENGINE_TAG[k.id];
              return (
                <tr key={k.id} className={'dt-click' + (activeId === k.id ? ' is-active' : '')} onClick={() => onOpen(k.id)} data-selected={activeId === k.id ? 'true' : undefined}>
                  <td className="freeze wrap cellspine" style={{ '--spine': m.fill }}>
                    <div className="dt-row-compact"><div className="meta">{eng && <span className="tag-mono tag-engine">{eng}</span>}<span className="name">{k.name}</span></div></div>
                  </td>
                  <td className="center"><span className="tag-mono">{k.team}</span></td>
                  <td><span className="v3-body-sm">{GROUP_SHORT[k.group]}</span></td>
                  <td className="num"><b style={{ fontFamily: 'var(--font-brand)' }}>{k.weight}%</b></td>
                  <td className="center"><window.TrackStatusPill status={st} /></td>
                  <td>
                    {pace.pct == null ? <span className="v3-mono">—</span> : (
                      <span className="mini-pace">
                        <span className="mtrack"><span className="mfill" style={{ width: Math.min(100, pace.pct) + '%', background: paceFillColor(pace.verdict) }} /></span>
                        <span className="tnum" style={{ fontWeight: 700 }}>{pace.pct}%</span>
                      </span>
                    )}
                  </td>
                  <td className="center"><window.TrackSparkline trend={S.weekTrend(k)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="dt-foot"><span className="info"><strong>{rows.length}</strong> chỉ tiêu · sort theo {sort.key === 'weight' ? 'trọng số' : sort.key === 'pace' ? 'pace' : sort.key === 'status' ? 'trạng thái' : 'tên'} ({sort.dir})</span><span className="v3-mono">Click dòng để mở drill</span></div>
    </div>
  );
}

/* ── BSC: pace ranking (bar-chart-h) ─────────────────────────────────── */
function PaceRankBar({ kpis, week, onOpen }) {
  const S = window.DASH_SEL, D = window.DASH_DATA;
  const rows = kpis.map((k) => ({ k, pace: S.paceForKpi(k.id, week), st: S.statusOf(k, week) }))
    .filter((r) => r.pace.pct != null)
    .sort((a, b) => b.pace.pct - a.pace.pct);
  return (
    <div className="viz-card">
      <div className="viz-card-head"><h3 className="viz-card-title">Pace lũy kế vs kỳ vọng W1</h3><span className="viz-card-meta">vạch = 23% (W1 ≈ thời gian tháng đã trôi)</span></div>
      <div className="bar-chart-h">
        {rows.map(({ k, pace, st }) => {
          const m = window.STATUS_META[st];
          return (
            <div className="bar-chart-row" key={k.id}>
              <span className="bname" title={k.name}><span style={{ width: 7, height: 7, borderRadius: 2, background: m.fill, flexShrink: 0 }} />{D.ENGINE_TAG[k.id] || k.team}</span>
              <span className="track" style={{ position: 'relative' }}>
                <span className="fill" style={{ width: Math.min(100, pace.pct) + '%', background: paceFillColor(pace.verdict) }} />
                <span style={{ position: 'absolute', left: '23%', top: -2, width: 1.5, height: 12, background: 'var(--fg-3)' }} />
              </span>
              <span className="bval">{pace.pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Agile: activity heatmap (squad × month cadence) ─────────────────── */
const CAD_MONTHS = ['03', '04', '05', '06'];
function ActivityHeatmap() {
  const AS = window.AGILE_SEL, AD = window.AGILE_DATA;
  const squads = AD.SQUAD_DELIVERY.map((s) => s.squad);
  const cell = (sq, mo) => {
    const ms = AD.MILESTONE_SNAPSHOT.filter((m) => m.squad === sq && m.label.indexOf('26/' + mo) === 0);
    if (!ms.length) return { pct: null };
    const pct = Math.round(ms.reduce((n, m) => n + (m.completed / m.taskTotal) * 100, 0) / ms.length);
    return { pct };
  };
  const intensity = (pct) => pct == null ? 0 : pct === 0 ? 0 : pct <= 30 ? 2 : pct <= 60 ? 3 : pct <= 85 ? 4 : 5;
  return (
    <div className="viz-card">
      <div className="viz-card-head"><h3 className="viz-card-title">Nhịp giao hàng · milestone × tháng</h3>
        <span className="heat-legend">ít <span className="sw heatmap-cell mint2" /><span className="sw heatmap-cell mint3" /><span className="sw heatmap-cell mint4" /><span className="sw heatmap-cell mint5" /> nhiều</span>
      </div>
      <div className="cadence">
        <div /><div className="cadence-cells" style={{ gridTemplateColumns: 'repeat(' + CAD_MONTHS.length + ', 1fr)' }}>{CAD_MONTHS.map((mo) => <div className="cadence-monthhead" key={mo}>T{parseInt(mo, 10)}</div>)}</div>
        {squads.map((sq) => (
          <React.Fragment key={sq}>
            <div className="cadence-row-label">{sq}</div>
            <div className="cadence-cells" style={{ gridTemplateColumns: 'repeat(' + CAD_MONTHS.length + ', 1fr)' }}>
              {CAD_MONTHS.map((mo) => {
                const c = cell(sq, mo);
                return <div className={'cadence-cell mint' + intensity(c.pct)} key={mo} title={sq + ' · T' + parseInt(mo, 10) + (c.pct == null ? ' · chưa map' : ' · ' + c.pct + '% hoàn tất')} style={c.pct != null && intensity(c.pct) >= 4 ? { color: '#fff' } : null}>{c.pct == null ? '' : c.pct}</div>;
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="v3-mono" style={{ marginTop: 10, color: 'var(--fg-3)' }}>DELTA/SIGMA có history nhiều tháng (Huly) — nhịp milestone đều, tín hiệu agile maturity. Squad khác seed từ W1.</div>
    </div>
  );
}

/* ── progress ring ───────────────────────────────────────────────────── */
function Ring({ pct, tone, size }) {
  const r = 22, circ = 2 * Math.PI * r;
  const off = circ * (1 - Math.min(100, pct) / 100);
  return (
    <div className={'progress-ring' + (size === 'lg' ? ' ring-lg' : '') + (tone ? ' ring-' + tone : '')}>
      <svg viewBox="0 0 52 52"><circle className="track" cx="26" cy="26" r={r} /><circle className="bar" cx="26" cy="26" r={r} strokeDasharray={circ} strokeDashoffset={off} /></svg>
      <div className="center tnum">{pct}%</div>
    </div>
  );
}
function DeliveryRings() {
  const AS = window.AGILE_SEL, AD = window.AGILE_DATA;
  const sm = AS.sprintMetrics('W1');
  const completedMs = AD.MILESTONE_SNAPSHOT.filter((m) => m.week === 'W1' && m.status === 'completed');
  const onTime = completedMs.length; // all completed W1 milestones hit target (seed)
  const onTimePct = completedMs.length ? 100 : 0;
  return (
    <div className="viz-card">
      <div className="viz-card-head"><h3 className="viz-card-title">Sprint W1 · tổng quan</h3><span className="viz-card-meta">{sm.completed}/{sm.total} milestone</span></div>
      <div className="ring-grid">
        <div className="ring-item"><Ring pct={sm.completionPct} tone="mint" size="lg" /><div className="ri-lab"><b>{sm.completed}/{sm.total}</b> milestone hoàn tất</div></div>
        <div className="ring-item"><Ring pct={onTimePct} tone="iris" /><div className="ri-lab"><b>{onTime}/{completedMs.length}</b> on-time</div></div>
      </div>
    </div>
  );
}

/* ── Agile: squad capacity/load ranking ──────────────────────────────── */
function SquadLoadChart() {
  const AS = window.AGILE_SEL, AD = window.AGILE_DATA;
  const rows = AD.SQUAD_DELIVERY.filter((s) => s.capacity).map((s) => ({ squad: s.squad, focus: s.capacity.focusPct, over: s.capacity.focusPct > 100, drain: s.capacity.supportDrain }))
    .sort((a, b) => b.focus - a.focus);
  return (
    <div className="viz-card">
      <div className="viz-card-head"><h3 className="viz-card-title">Năng lực theo squad</h3><span className="viz-card-meta">vạch = ngưỡng 70% · &gt;100% = overcommit</span></div>
      <div className="bar-chart-h">
        {rows.map((r) => (
          <div className="bar-chart-row" key={r.squad}>
            <span className="bname"><span className="tag-mono">{r.squad}</span></span>
            <span className="track" style={{ position: 'relative' }}>
              <span className="fill" style={{ width: Math.min(100, r.focus) + '%', background: r.over ? 'var(--gap)' : r.drain > 50 ? 'var(--gold)' : 'var(--mint)' }} />
              <span style={{ position: 'absolute', left: '70%', top: -2, width: 1.5, height: 12, background: 'var(--fg-2)' }} />
            </span>
            <span className="bval" style={r.over ? { color: 'var(--gap-deep)' } : null}>{r.focus}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { KpiTable, PaceRankBar, ActivityHeatmap, DeliveryRings, SquadLoadChart, Ring });
