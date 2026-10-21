/* components-zones.jsx — LensSwitcher (Z0.5) · CommandBar (Z1) ·
   VerdictStrip (Z2) · AlertFeed (Z4). */

const { useState, useEffect, useRef } = React;

function useCountUp(target, dur = 700) {
  const [v, setV] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(target); prev.current = target; return; }
    const from = prev.current, to = target, t0 = performance.now();
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setV(Math.round(from + (to - from) * e));
      if (k < 1) raf = requestAnimationFrame(step); else prev.current = to;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

/* ── Z0.5 Lens switcher = app tabs ───────────────────────────────────── */
function LensSwitcher({ lens, onLens }) {
  return (
    <div className="tabs" role="tablist" aria-label="Lăng kính">
      <button className="tab" role="tab" data-active={lens === 'bsc' ? 'true' : undefined} aria-selected={lens === 'bsc'} onClick={() => onLens('bsc')}>
        <span className="gl"><window.Icon name="target" size={15} /></span> BSC Outcome
      </button>
      <button className="tab" role="tab" data-active={lens === 'agile' ? 'true' : undefined} aria-selected={lens === 'agile'} onClick={() => onLens('agile')}>
        <span className="gl"><window.Icon name="gitBranch" size={15} /></span> Agile Delivery
      </button>
    </div>
  );
}

/* ── Z1 Command bar (sticky filter) ──────────────────────────────────── */
const PERSPECTIVES = [
  { v: 'all', label: 'Tất cả' }, { v: 'finance', label: 'Tài chính' },
  { v: 'customer', label: 'Khách hàng' }, { v: 'operation', label: 'Vận hành' },
  { v: 'learning', label: 'Học hỏi' },
];
const STATUS_TOGGLES = [
  { v: 'on-track', label: 'On-track', c: 'var(--mint)' }, { v: 'watch', label: 'Watch', c: 'var(--gold)' },
  { v: 'off-track', label: 'Off-track', c: 'var(--gap)' }, { v: 'pending', label: 'Pending', c: 'var(--fg-3)' },
];

function CommandBar({ filter, setFilter, total, shownCount, perspWeight }) {
  const D = window.DASH_DATA, S = window.DASH_SEL;
  const teams = S.ALL_TEAMS;
  const toggleTeam = (t) => {
    const cur = filter.teams;
    setFilter({ ...filter, teams: cur.indexOf(t) >= 0 ? cur.filter((x) => x !== t) : [...cur, t] });
  };
  const toggleStatus = (s) => {
    const cur = filter.statuses;
    setFilter({ ...filter, statuses: cur.indexOf(s) >= 0 ? cur.filter((x) => x !== s) : [...cur, s] });
  };
  const active = filter.perspective !== 'all' || filter.teams.length < teams.length || filter.statuses.length < 4;
  const reset = () => setFilter({ ...filter, perspective: 'all', teams: [...teams], statuses: [...S.ALL_STATUSES] });
  const perspLabel = (PERSPECTIVES.find((p) => p.v === filter.perspective) || {}).label;

  return (
    <div className="fbar">
      <div className="fbar-row">
        <span className="fbar-lab">Góc nhìn</span>
        <div className="seg" role="group" aria-label="Góc nhìn BSC">
          {PERSPECTIVES.map((p) => (
            <button key={p.v} aria-pressed={filter.perspective === p.v}
              onClick={() => setFilter({ ...filter, perspective: p.v })}>{p.label}</button>
          ))}
        </div>
        <span className="spacer" />
        <div className="wk-select" title="W2–W4 chưa có dữ liệu — mở dần theo tuần">
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
        <span className="fbar-lab">Team</span>
        <div className="chips" role="group" aria-label="Lọc theo team">
          {teams.map((t) => {
            const on = filter.teams.indexOf(t) >= 0;
            return (
              <button key={t} className="chip-f" aria-pressed={on} onClick={() => toggleTeam(t)}>
                <span className="tick">{on && <window.Icon name="check" size={9} />}</span>{t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="fbar-row">
        <span className="fbar-lab">Trạng thái</span>
        <div className="toggles" role="group" aria-label="Lọc theo trạng thái">
          {STATUS_TOGGLES.map((s) => (
            <button key={s.v} className="tgl" aria-pressed={filter.statuses.indexOf(s.v) >= 0} onClick={() => toggleStatus(s.v)}>
              <span className="sw" style={{ background: s.c }} />{s.label}
            </button>
          ))}
        </div>
        <span className="spacer" />
        <div className="readout">
          <span>Đang lọc: <b className="tnum">{shownCount}/{total}</b> chỉ tiêu</span>
          {active && <button className="reset" onClick={reset}><window.Icon name="reset" size={11} /> reset</button>}
        </div>
      </div>

      {filter.perspective !== 'all' && (
        <div className="fbar-row" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="subview">
            <window.Icon name="info" size={13} color="var(--iris-deep)" />
            Đang xem: <b style={{ color: 'var(--brand)', fontWeight: 700 }}>{perspLabel}</b> · {shownCount} chỉ tiêu · {perspWeight}% trọng số nhóm (sức khỏe vẫn tính trên 100% toàn cảnh)
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Z2 Verdict strip ────────────────────────────────────────────────── */
const HBAR_ORDER = [
  { key: 'on-track', label: 'Đúng tiến độ', fill: 'var(--mint)', text: 'var(--mint-deep)' },
  { key: 'watch', label: 'Cần lưu ý', fill: 'var(--gold)', text: 'var(--plan-deep)' },
  { key: 'off-track', label: 'Chưa đạt MXH', fill: 'var(--gap)', text: 'var(--gap-deep)' },
  { key: 'pending', label: 'Chưa triển khai', fill: 'var(--fg-3)', text: 'var(--fg-3)' },
];
const HEALTH_TIP = 'Sức khỏe = Σ(trọng số × hệ số trạng thái) / Σtrọng số × 100. Hệ số: on-track 1.0 · watch 0.6 · pending 0.5 · off-track 0.2. W1: 70×1.0 + 10×0.6 + 10×0.5 + 10×0.2 = 83/100.';

function VerdictStrip({ health }) {
  const w = health.byStatus, total = health.total;
  const score = useCountUp(health.score);
  const KPI_ACCENT = { 'on-track': 'mint', watch: 'gold', 'off-track': 'gap', pending: 'neutral' };
  return (
    <section className="verdict-band" data-screen-label="verdict-strip">
      <div className="banner banner-info verdict-insight">
        <span className="banner-icon"><window.Icon name="diamond" size={11} /></span>
        <div className="banner-body">
          <b>Kết luận tuần 1:</b> mở tháng <em>tích cực</em> — {w['on-track'].weight}/{total}% trọng số đúng tiến độ,
          tiến độ lũy kế dẫn trước lịch (W1 ≈ 23% thời gian). Rủi ro dồn ở <b>OMEGA</b> (Organic Traffic &amp; CR off-track) và <b>NSHP</b> thiếu người.
        </div>
      </div>
      <div className="kpi-grid">
        <div className="kpi health" data-accent="brand">
          <div className="kpi-label">Sức khỏe KPI · <span className="health-info" title={HEALTH_TIP}>cách tính ⓘ</span></div>
          <div className="kpi-value"><span className="tnum">{score}</span><span className="unit">/ 100</span></div>
          <div className="hbar" role="img" aria-label={'On-track ' + w['on-track'].weight + '%'}>
            {HBAR_ORDER.map((s) => w[s.key].weight ? <span key={s.key} title={s.label + ' · ' + w[s.key].weight + '%'} style={{ width: (w[s.key].weight / total * 100) + '%', background: s.fill }} /> : null)}
          </div>
          <div className="hbar-legend">
            {HBAR_ORDER.map((s) => (
              <span className="lg" key={s.key}><i style={{ background: s.fill }} />{s.label} <span className="tnum" style={{ color: 'var(--fg-3)' }}>{w[s.key].weight}%</span></span>
            ))}
          </div>
        </div>
        {HBAR_ORDER.map((s) => (
          <div className="kpi" data-accent={KPI_ACCENT[s.key]} key={s.key}>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-value"><span className="tnum">{w[s.key].count}</span><span className="unit">chỉ tiêu</span></div>
            <div className="kpi-sub tnum" style={{ color: s.text }}>{w[s.key].weight}% trọng số</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Z4 Alert feed ───────────────────────────────────────────────────── */
const BUCKETS = [
  { key: 'act', title: 'Cần xử lý', icon: 'alert', color: 'var(--gap)' },
  { key: 'watch', title: 'Theo dõi', icon: 'triangle', color: 'var(--gold-deep)' },
  { key: 'data', title: 'Lưu ý dữ liệu', icon: 'info', color: 'var(--iris-deep)' },
];

function AlertFeed({ anomalies, onOpen }) {
  return (
    <aside className="alertrail" aria-label="Cảnh báo">
      <div className="alert-railhead">
        <window.Icon name="alert" size={14} color="var(--gap)" /> Cảnh báo
        <span className="ct tnum">{anomalies.length} mục</span>
      </div>
      {BUCKETS.map((b) => {
        const rows = anomalies.filter((a) => a.bucket === b.key);
        if (!rows.length) return null;
        return (
          <div className="alert-group" key={b.key}>
            <div className="alert-group-head" style={{ color: b.color }}>
              <span className="ic"><window.Icon name={b.icon} size={13} /></span>
              <span className="ti">{b.title}</span>
              <span className="ct tnum">{rows.length} mục</span>
            </div>
            <div className="alert-list">
              {rows.map((a, i) => {
                const sev = b.key === 'data' ? 'sev-data' : 'sev-' + a.severity;
                const m = a.kind === 'off-track' ? window.STATUS_META['off-track'] : a.kind === 'capacity' || a.kind === 'spike' || a.kind === 'crunch' ? window.STATUS_META.watch : a.kind === 'pending' ? window.STATUS_META.pending : window.STATUS_META.watch;
                return (
                  <button key={a.kpiId + i} className={'alert ' + sev} onClick={() => onOpen(a.kpiId)}>
                    <div className="alert-top">
                      <span className="alert-ic" style={{ color: m.fill }}><window.Icon name={m.icon} size={12} /></span>
                      <span className="alert-ti">{a.title}</span>
                      <span className="alert-team">{a.team}{!a.inBsc ? ' · ngoài BSC' : ''}</span>
                      <span className="alert-chev"><window.Icon name="chevronRight" size={13} /></span>
                    </div>
                    <div className="alert-detail">{a.detail}</div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </aside>
  );
}

Object.assign(window, { useCountUp, LensSwitcher, CommandBar, VerdictStrip, AlertFeed, PERSPECTIVES, HBAR_ORDER });
