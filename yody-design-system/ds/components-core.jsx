/* components-core.jsx — primitives: Icon, StatusMeta, TrackStatusPill,
   PaceBar (VIZ-05), TrackSparkline (VIZ-04). Exported to window.
   In repo these map to _components/TrackStatusPill.tsx · PaceBar.tsx · TrackSparkline.tsx */

const STATUS_META = {
  'on-track': { label: 'On-track', fill: 'var(--mint)', text: 'var(--mint-deep)', bg: 'var(--live-bg)', border: 'color-mix(in srgb, var(--mint) 32%, transparent)', icon: 'check' },
  watch:      { label: 'Watch', fill: 'var(--gold)', text: 'var(--plan-deep)', bg: 'color-mix(in srgb, #fcaf16 16%, white)', border: 'color-mix(in srgb, #fcaf16 55%, transparent)', icon: 'triangle' },
  'off-track': { label: 'Off-track', fill: 'var(--gap)', text: 'var(--gap-deep)', bg: 'var(--gap-bg)', border: 'color-mix(in srgb, var(--gap) 34%, transparent)', icon: 'x' },
  pending:    { label: 'Chưa triển khai', fill: 'var(--fg-3)', text: 'var(--fg-3)', bg: 'var(--bg-muted)', border: 'var(--border)', icon: 'circle' },
};

const PACE_LABEL = { initiative: 'số hóa', growth: 'tăng trưởng', ratio: 'tỷ lệ', threshold: 'duy trì ngưỡng', pending: '—' };
const PACE_VERDICT_LABEL = { ahead: 'dẫn nhịp', on: 'đúng nhịp', watch: 'theo dõi', behind: 'nguy cơ hụt', na: '—' };
function paceColor(v) { return v === 'behind' ? 'var(--gap)' : v === 'watch' ? 'var(--gold)' : v === 'na' ? 'var(--fg-3)' : 'var(--mint)'; }

/* ── Lucide-style monoline icon set (1.75 stroke, 24 viewBox) ────────── */
const ICON_PATHS = {
  check: 'M20 6 9 17l-5-5',
  triangle: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z|M12 9v4|M12 17h.01',
  x: 'M18 6 6 18|M6 6l12 12',
  circle: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0',
  chevronRight: 'm9 18 6-6-6-6',
  chevronLeft: 'm15 18-6-6 6-6',
  target: 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0|M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0|M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
  gitBranch: 'M6 3v12|M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z|M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z|M15 6a9 9 0 0 0-9 9',
  info: 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0|M12 16v-4|M12 8h.01',
  arrowRight: 'M5 12h14|m12 5 7 7-7 7',
  clock: 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0|M12 6v6l4 2',
  layers: 'm12.83 2.18 8.66 5a1 1 0 0 1 0 1.73l-8.66 5a1.66 1.66 0 0 1-1.66 0l-8.66-5a1 1 0 0 1 0-1.73l8.66-5a1.66 1.66 0 0 1 1.66 0Z|m22 17.65-9.17 5.3a1.66 1.66 0 0 1-1.66 0L2 17.65',
  map: 'M3 6v15l6-3 6 3 6-3V3l-6 3-6-3-6 3Z|M9 3v15|M15 6v15',
  alert: 'M12 9v4|M12 17h.01|M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  reset: 'M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8|M3 3v5h5',
  diamond: 'M12 2 22 12 12 22 2 12Z',
  flag: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1Z|M4 22V4',
  grid: 'M3 3h7v7H3z|M14 3h7v7h-7z|M14 14h7v7h-7z|M3 14h7v7H3z',
};
function Icon({ name, size = 16, color, style, strokeWidth = 1.75 }) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  const segs = d.split('|');
  const filled = name === 'diamond';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={filled ? 'none' : (color || 'currentColor')} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...(style || {}) }} aria-hidden="true">
      {segs.map((s, i) => <path key={i} d={s} fill={filled ? (color || 'currentColor') : 'none'} />)}
    </svg>
  );
}

/* ── TrackStatusPill ──────────────────────────────────────────────────── */
function TrackStatusPill({ status, size }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className="pill" style={{ color: m.text, background: m.bg, borderColor: m.border, fontSize: size === 'lg' ? '11px' : undefined }}>
      <span className="ic" style={{ color: m.fill }}><Icon name={m.icon} size={11} /></span>
      {m.label}
    </span>
  );
}

/* ── PaceBar (VIZ-05) — bullet: lũy kế vs target tick at elapsed ──────── */
function PaceBar({ pace, compact }) {
  if (!pace || pace.pct == null) {
    return <div className="pace-na">{pace && pace.method === 'pending' ? 'Pending · chưa có pace' : 'BAU · duy trì ngưỡng'}</div>;
  }
  const fillW = Math.max(2, Math.min(100, pace.pct));
  const tick = Math.max(0, Math.min(100, pace.expectedPct));
  const col = paceColor(pace.verdict);
  return (
    <div className="pace">
      <div className="pace-track" title={pace.pctNote}>
        <div className="pace-fill" style={{ width: fillW + '%', background: col }} />
        <div className="pace-target" style={{ left: tick + '%' }} title={'Kỳ vọng W1 · ' + tick + '% thời gian tháng'} />
      </div>
      <div className="pace-meta">
        <span><span className="pct tnum">{pace.pct}%</span> {PACE_LABEL[pace.method]}{pace.derived ? '*' : ''}</span>
        {!compact && <span style={{ color: col }}>{PACE_VERDICT_LABEL[pace.verdict]}</span>}
      </div>
    </div>
  );
}

/* ── TrackSparkline (VIZ-04) — 4 status dot, W1 filled ───────────────── */
function TrackSparkline({ trend, withLabel }) {
  return (
    <span className="dots" title="Trend W1→W4 (categorical) — W1 baseline, mở từ W2">
      {trend.map((t) => {
        const filled = t.has && t.status;
        const m = filled ? STATUS_META[t.status] : null;
        return <span key={t.week} className={'d' + (filled ? ' fill' : '')} style={filled ? { background: m.fill } : null} />;
      })}
      {withLabel && <span className="dots-label">W1 · mở từ W2</span>}
    </span>
  );
}

Object.assign(window, { STATUS_META, PACE_LABEL, PACE_VERDICT_LABEL, paceColor, Icon, TrackStatusPill, PaceBar, TrackSparkline });
