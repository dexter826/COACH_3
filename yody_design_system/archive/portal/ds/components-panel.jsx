/* components-panel.jsx — KpiDrillPanel (V2). Reuse-equivalent of SidePanel
   (slide-in from right, Esc/backdrop/X, focus, prev/next). Adaptive blocks:
   tracks · pace · PITSTOP core · W1_ARCH lane · gantt slice · reconcile · cross-lens bridge. */

const { useEffect: useEffectP, useRef: useRefP } = React;

function CoreBlock({ label, color, marker, text, muted }) {
  return (
    <div className="core-item">
      <span className="ti" style={{ color }}><span aria-hidden>{marker}</span> {label}</span>
      <div className={'tx' + (muted ? ' muted' : '')}>{text || 'Chưa triển khai W1'}</div>
    </div>
  );
}

function GanttSlice({ g }) {
  const D = window.DASH_DATA;
  const weeks = D.T6_WEEKS;
  return (
    <div className="gantt">
      <div className="gantt-row head">
        <div className="gname gh">Hạng mục · {g.code}</div>
        <div className="glane glane-head">{weeks.map((w) => <div key={w.id} className="gh">{w.id.replace('.06', '')}</div>)}</div>
      </div>
      {g.bars.map((b, i) => {
        const left = ((b.s - 1) / 4) * 100;
        const width = ((b.e - b.s + 1) / 4) * 100;
        return (
          <div className="gantt-row" key={i}>
            <div className="gname">{b.label || b.name}{b.label && <span className="gk">{b.name}</span>}</div>
            <div className="glane">
              <div className="glines"><i /><i /><i /><i /></div>
              <div className={'gbar ' + b.kind} style={{ left: left + '%', width: width + '%' }} title={b.name}>
                {b.kind === 'carry' ? 'carry' : (b.date ? '⚑ ' + b.date : b.kind)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KpiDrillPanel({ openId, list, onClose, onNav, week }) {
  const D = window.DASH_DATA, S = window.DASH_SEL;
  const open = !!openId;
  const bodyRef = useRefP(null);
  const idx = openId ? list.findIndex((k) => k.id === openId) : -1;
  const canNav = idx >= 0;

  useEffectP(() => {
    if (!open) return;
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && canNav && idx > 0) onNav(list[idx - 1].id);
      else if (e.key === 'ArrowRight' && canNav && idx < list.length - 1) onNav(list[idx + 1].id);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, openId, idx, canNav, list]);

  const kpi = openId ? D.WEEKLY_TRACKING.find((k) => k.id === openId) : null;
  const detail = openId ? D.PITSTOP_DETAIL.find((p) => p.id === openId) : null;
  const isExtra = !kpi && detail && detail.scope === 'extra';
  const status = kpi ? S.statusOf(kpi, week) : (detail ? detail.status : 'pending');
  const m = window.STATUS_META[status];
  const pace = kpi ? S.paceForKpi(kpi.id, week) : null;
  const trend = kpi ? S.weekTrend(kpi) : null;
  const arch = openId ? D.W1_ARCH.find((l) => l.kpiId === openId) : null;
  const gantt = openId ? S.mapKpiToGantt(openId) : null;
  const reconcile = openId ? D.RECONCILE_FLAGS[openId] : null;
  const engine = kpi ? D.ENGINE_TAG[kpi.id] : (detail ? D.ENGINE_TAG[detail.id] : null);
  const title = kpi ? kpi.name : (detail ? detail.kpi : '');
  const groupLabel = kpi ? D.TRACK_GROUP_LABEL[kpi.group] : (isExtra ? 'Ngoài BSC · không tính trọng số' : '');
  const team = kpi ? kpi.team : (isExtra ? (D.OFF_TRACK_EXTRA[0] || {}).team : '');
  const hasPitstop = detail && (detail.effective || detail.ineffective || detail.next);

  return (
    <React.Fragment>
      <div className={'scrim' + (open ? ' open' : '')} onClick={onClose} />
      <div className={'panel' + (open ? ' open' : '')} role="dialog" aria-modal="true" aria-label={title} aria-hidden={!open}>
        {open && (
          <React.Fragment>
            <div className="panel-head">
              <div className="panel-head-top">
                <button className="iconbtn close" onClick={onClose} aria-label="Đóng"><window.Icon name="x" size={18} /></button>
                {canNav && (
                  <div className="panel-nav">
                    <button className="iconbtn" disabled={idx <= 0} onClick={() => onNav(list[idx - 1].id)} aria-label="Trước"><window.Icon name="chevronLeft" size={16} /></button>
                    <span className="panel-nav-label tnum">{idx + 1}/{list.length}</span>
                    <button className="iconbtn" disabled={idx >= list.length - 1} onClick={() => onNav(list[idx + 1].id)} aria-label="Sau"><window.Icon name="chevronRight" size={16} /></button>
                  </div>
                )}
              </div>
              <div className="panel-id">
                {engine && <span className="tag-mono tag-engine">{engine}</span>}
                {team && <span className="tag-mono">{team}</span>}
                <window.TrackStatusPill status={status} size="lg" />
              </div>
              <h2 className="panel-title">{title}</h2>
              <div className="panel-sub">{groupLabel}{kpi ? ' · ' + kpi.weight + '% trọng số' : ''}</div>
            </div>

            <div className="panel-body" ref={bodyRef}>
              {/* ① Tracks theo tuần */}
              {kpi && (
                <div className="block">
                  <div className="block-head"><span className="ic"><window.Icon name="clock" size={14} /></span> Tracks theo tuần</div>
                  <div className="tracks">
                    {trend.map((t) => {
                      const tm = t.has && t.status ? window.STATUS_META[t.status] : null;
                      return (
                        <div className={'track-cell' + (t.has ? ' has' : '')} key={t.week}>
                          <div className="w">{t.week}</div>
                          <div className="s" style={tm ? { background: tm.fill } : null} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="track-note">{(kpi.tracks.find((x) => x.week === week) || {}).note} <span className="v3-mono">· W1 baseline, trend mở từ W2</span></div>
                </div>
              )}

              {/* ② Pace */}
              {kpi && pace && pace.method !== 'pending' && (
                <div className="block">
                  <div className="block-head"><span className="ic"><window.Icon name="target" size={14} /></span> Pace vs đích cuối tháng</div>
                  <window.PaceBar pace={pace} />
                  <div className="track-note">
                    {pace.pctNote}
                    {(pace.method === 'initiative' || pace.method === 'growth') && pace.forecastEnd != null &&
                      <span> · dự báo cuối tháng nếu giữ nhịp ~<b className="tnum" style={{ color: 'var(--fg-1)' }}>{pace.forecastEnd}%</b> (kỳ vọng W1 {pace.expectedPct}%)</span>}
                  </div>
                </div>
              )}

              {/* ③ PITSTOP core */}
              {hasPitstop && (
                <div className="block">
                  <div className="block-head"><span className="ic"><window.Icon name="layers" size={14} /></span> PITSTOP W1</div>
                  <div className="core">
                    <CoreBlock label="Điều hiệu quả" color="var(--mint-deep)" marker="✓" text={detail.effective} />
                    <CoreBlock label="Điều chưa hiệu quả" color="var(--plan-deep)" marker="△" text={detail.ineffective} muted={detail.ineffective === 'Không.'} />
                    <CoreBlock label="Điều tiếp theo" color="var(--brand)" marker="→" text={detail.next} />
                  </div>
                </div>
              )}

              {/* ④ W1_ARCH lane (plm/iom) */}
              {arch && (
                <div className="block">
                  <div className="block-head"><span className="ic"><window.Icon name="map" size={14} /></span> Bản đồ task W1 · {arch.total} task</div>
                  <div className="lane-meta">{arch.meta}</div>
                  {arch.clusters.map((c, ci) => (
                    <div className="cluster" key={ci}>
                      <div className="cluster-lab">{c.label} <span className="ct tnum">· {c.tasks.length}</span></div>
                      <div className="tasklist">
                        {c.tasks.map((t) => (
                          <div className="task" key={t.id}>
                            <span className="tid">{t.id}</span>
                            <span className="tnm">{t.name.replace(/^\[QC\]\s*/, '')}</span>
                            {t.tag && <span className={'task-tag ' + t.tag.toLowerCase()}>{t.tag}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ⑤ Gantt slice */}
              {gantt && (
                <div className="block">
                  <div className="block-head"><span className="ic"><window.Icon name="grid" size={14} /></span> Gantt slice · {gantt.board}</div>
                  <div className="lane-meta">{gantt.title} <span className="v3-mono">· {gantt.meta}</span></div>
                  <GanttSlice g={gantt} />
                </div>
              )}

              {/* ⑥ Reconcile audit (DEC-12) */}
              {reconcile && (
                <div className="block">
                  <div className="audit">
                    <div className="at"><window.Icon name="info" size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> Audit · lệch sheet ↔ vault</div>
                    <div className="ax">{reconcile}</div>
                  </div>
                </div>
              )}

              {/* ⑦ Cross-lens bridge (DEC-18 — Agile lens ở bước 3) */}
              {kpi && team && team !== 'CN&CĐS' && (
                <div className="block">
                  <div className="block-head"><span className="ic"><window.Icon name="gitBranch" size={14} /></span> Thực thi bởi · cross-lens</div>
                  <div className="bridge-row">
                    <span className="bnm"><b style={{ color: 'var(--fg-1)' }}>{team}</b> gánh chỉ tiêu này{engine ? ' · engine ' + engine : ''}</span>
                    <window.TrackStatusPill status={status} />
                  </div>
                  <button className="bridge-cta" title="Lăng kính Agile Delivery sẽ mở ở bước 3" disabled>
                    Mở squad {team} trong Agile lens <window.Icon name="arrowRight" size={14} />
                  </button>
                </div>
              )}
            </div>
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { KpiDrillPanel, CoreBlock, GanttSlice });
