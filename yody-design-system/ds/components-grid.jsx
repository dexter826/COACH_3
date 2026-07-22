/* components-grid.jsx — KpiTile (VIZ-06) · KpiGrid (Z3) · PerspectiveTeamHeatmap (VIZ-08).
   Reads window primitives + DASH_SEL/DASH_DATA. */

const TILE_ALERT = {
  'chi-phi-dt': { text: 'spike AWS 01/6 · 2,5×', crit: false },
  nshp: { text: '>70% năng lực đi support', crit: false },
  'organic-traffic': { text: 'pace 0.52 · nguy cơ hụt', crit: true },
};
const ROMAN = { finance: 'I', customer: 'II', operation: 'III', learning: 'IV' };
const DRIVER_IDS = ['plm', 'iom'];

function KpiTile({ kpi, onOpen, isActive, week }) {
  const S = window.DASH_SEL, D = window.DASH_DATA;
  const status = S.statusOf(kpi, week);
  const m = window.STATUS_META[status];
  const pace = S.paceForKpi(kpi.id, week);
  const trend = S.weekTrend(kpi);
  const engine = D.ENGINE_TAG[kpi.id];
  const alert = TILE_ALERT[kpi.id];
  const isDriver = DRIVER_IDS.indexOf(kpi.id) >= 0;
  return (
    <button type="button"
      className={'tile' + (isActive ? ' is-active' : '') + (isDriver ? ' is-driver' : '')}
      style={{ borderLeftColor: m.fill }}
      onClick={() => onOpen(kpi.id)}
      aria-label={'Mở chi tiết ' + kpi.name}>
      <div className="tile-r1">
        {engine && <span className="tag-mono tag-engine">{engine}</span>}
        <span className="tag-mono">{kpi.team}</span>
        <span className="spread" />
        <window.TrackStatusPill status={status} />
      </div>
      <div className="tile-name" title={kpi.name}>{kpi.name}</div>
      <div className="tile-r3">
        <span className="weight-num">
          <span className="n v3-num-grad tnum">{kpi.weight}</span>
          <span className="u">%</span>
        </span>
        <window.TrackSparkline trend={trend} />
      </div>
      <window.PaceBar pace={pace} compact />
      {alert && (
        <div className={'tile-alert' + (alert.crit ? ' crit' : '')}>
          <window.Icon name="alert" size={12} />
          <span>{alert.text}</span>
        </div>
      )}
    </button>
  );
}

function KpiGrid({ kpis, onOpen, activeId, week }) {
  const S = window.DASH_SEL, D = window.DASH_DATA;
  const groups = S.GROUP_ORDER.filter((g) => kpis.some((k) => k.group === g));
  return (
    <div>
      {groups.map((g) => {
        const rows = kpis.filter((k) => k.group === g);
        const wsum = rows.reduce((s, k) => s + k.weight, 0);
        return (
          <section className="persp" key={g} data-screen-label={'perspective-' + g}>
            <div className="persp-head">
              <span className="roman">{ROMAN[g]}</span>
              <span className="nm">{D.TRACK_GROUP_LABEL[g]}</span>
              <span className="ct">{rows.length} chỉ tiêu · {wsum}% trọng số</span>
            </div>
            <div className="grid">
              {rows.map((k) => (
                <KpiTile key={k.id} kpi={k} onOpen={onOpen} isActive={activeId === k.id} week={week} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* PerspectiveTeamHeatmap (VIZ-08) — group × team, cell = dominant status tint */
function PerspectiveTeamHeatmap({ week }) {
  const S = window.DASH_SEL, D = window.DASH_DATA;
  const teams = [...new Set(D.WEEKLY_TRACKING.map((k) => k.team))];
  const groups = S.GROUP_ORDER;
  const cellFor = (g, t) => {
    const rows = D.WEEKLY_TRACKING.filter((k) => k.group === g && k.team === t);
    if (!rows.length) return null;
    const by = { 'on-track': 0, 'off-track': 0, watch: 0, pending: 0 };
    let weight = 0;
    rows.forEach((k) => { by[S.statusOf(k, week)] += k.weight; weight += k.weight; });
    let dom = 'on-track';
    if (by['off-track'] > 0) dom = 'off-track'; else if (by.watch > 0) dom = 'watch'; else if (by.pending >= weight) dom = 'pending';
    return { dom, weight, count: rows.length };
  };
  const tmpl = '128px repeat(' + teams.length + ', 1fr)';
  return (
    <div className="persp heat">
      <div className="persp-head">
        <span className="nm">Bản đồ trọng số · Perspective × Team</span>
        <span className="ct">ô = trạng thái trội · số = % trọng số</span>
      </div>
      <div className="heat-grid" style={{ gridTemplateColumns: tmpl }}>
        <div className="heat-cell hd" />
        {teams.map((t) => <div key={t} className="heat-cell hd">{t}</div>)}
        {groups.map((g) => (
          <React.Fragment key={g}>
            <div className="heat-cell rh v3-mono" title={D.TRACK_GROUP_LABEL[g]}>{D.TRACK_GROUP_LABEL[g].replace(/ \(.*/, '')}</div>
            {teams.map((t) => {
              const c = cellFor(g, t);
              if (!c) return <div key={t} className="heat-cell" style={{ background: 'var(--bg-2)', color: 'var(--border-hover)' }}>·</div>;
              const m = window.STATUS_META[c.dom];
              return (
                <div key={t} className="heat-cell tnum"
                  title={D.TRACK_GROUP_LABEL[g] + ' · ' + t + ' · ' + m.label + ' · ' + c.weight + '%'}
                  style={{ background: 'color-mix(in srgb, ' + m.fill + ' 18%, var(--bg))', color: m.text, border: '1px solid color-mix(in srgb, ' + m.fill + ' 30%, transparent)' }}>
                  {c.weight}%
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { KpiTile, KpiGrid, PerspectiveTeamHeatmap, TILE_ALERT, ROMAN });
