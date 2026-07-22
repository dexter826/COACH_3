/* agile-app.jsx — SprintView · SquadDrillPanel (V6 + cross-lens) · AgileView orchestrator. */

const { useState: useStateAv, useMemo: useMemoAv, useEffect: useEffectAv, useRef: useRefAv } = React;

/* ── Sprint / Milestone view ─────────────────────────────────────────── */
function SprintView() {
  const AS = window.AGILE_SEL, AD = window.AGILE_DATA;
  const sm = AS.sprintMetrics('W1');
  const trendSquads = ['DELTA', 'SIGMA'];
  return (
    <div>
      <div className="analysis-grid" style={{ marginTop: 0, marginBottom: 14 }}>
        <window.DeliveryRings />
        <window.ActivityHeatmap />
      </div>
      <div className="section-card">
        <div className="section-card-head">
          <h3 className="section-card-title">Milestone completion · Sprint W1</h3>
          <span className="section-card-meta tnum">{sm.completed}/{sm.total} milestone hoàn tất · {sm.completionPct}%</span>
        </div>
        <div className="mstone-list">
          {sm.milestones.map((m) => (
            <div className="mstone-row" key={m.squad}>
              <span className="tag-mono tag-engine" style={{ alignSelf: 'start' }}>{m.squad}</span>
              <window.MilestoneProgress m={m} />
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <div className="section-card-head"><h3 className="section-card-title">Burndown</h3></div>
        <div className="burndown-empty">
          <window.Icon name="clock" size={20} color="var(--fg-3)" />
          <div>
            <div className="be-title">W1 baseline — burndown mở từ W2</div>
            <div className="be-sub v3-body-sm">Cần ≥2 điểm tuần để vẽ (DEC-20). Không fabricate đường cong từ 1 điểm.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Squad drill panel (V6) + cross-lens bridge ──────────────────────── */
function SquadDrillPanel({ openSquad, list, onClose, onNav, onCrossToBsc }) {
  const AS = window.AGILE_SEL, AD = window.AGILE_DATA, D = window.DASH_DATA;
  const open = !!openSquad;
  const bodyRef = useRefAv(null);
  const idx = openSquad ? list.findIndex((s) => s.squad === openSquad) : -1;
  const canNav = idx >= 0;

  useEffectAv(() => {
    if (!open) return;
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && canNav && idx > 0) onNav(list[idx - 1].squad);
      else if (e.key === 'ArrowRight' && canNav && idx < list.length - 1) onNav(list[idx + 1].squad);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, openSquad, idx, canNav, list]);

  const sc = openSquad ? AS.squadScorecard(openSquad) : null;
  const m = sc ? window.FLOW_META[sc.flow] : null;
  const arch = openSquad ? D.W1_ARCH.find((l) => l.team === openSquad) : null;
  const kpis = openSquad ? AS.squadToKpis(openSquad) : [];
  const FLOW_DOTS = ['W1', 'W2', 'W3', 'W4'];

  return (
    <React.Fragment>
      <div className={'scrim' + (open ? ' open' : '')} onClick={onClose} />
      <div className={'panel' + (open ? ' open' : '')} role="dialog" aria-modal="true" aria-label={openSquad || ''} aria-hidden={!open}>
        {open && sc && (
          <React.Fragment>
            <div className="panel-head">
              <div className="panel-head-top">
                <button className="iconbtn close" onClick={onClose} aria-label="Đóng"><window.Icon name="x" size={18} /></button>
                {canNav && (
                  <div className="panel-nav">
                    <button className="iconbtn" disabled={idx <= 0} onClick={() => onNav(list[idx - 1].squad)} aria-label="Trước"><window.Icon name="chevronLeft" size={16} /></button>
                    <span className="panel-nav-label tnum">{idx + 1}/{list.length}</span>
                    <button className="iconbtn" disabled={idx >= list.length - 1} onClick={() => onNav(list[idx + 1].squad)} aria-label="Sau"><window.Icon name="chevronRight" size={16} /></button>
                  </div>
                )}
              </div>
              <div className="panel-id">
                <span className="tag-mono tag-engine">{sc.squad}</span>
                {sc.engine && <span className="tag-mono">{sc.engine}</span>}
                <span className="tag-mono">{AD.BP_SHORT[sc.bp]}</span>
                <window.FlowPill flow={sc.flow} />
              </div>
              <h2 className="panel-title">{sc.domain}</h2>
              <div className="panel-sub">BP. {AD.BP_LABEL[sc.bp]} · {sc.activeHeadcount} người active · <window.FidelityBadgeInline fidelity={sc.fidelity} /></div>
            </div>

            <div className="panel-body" ref={bodyRef}>
              {/* ① Flow tuần */}
              <div className="block">
                <div className="block-head"><span className="ic"><window.Icon name="clock" size={13} /></span> Flow tuần</div>
                <div className="tracks">
                  {FLOW_DOTS.map((wk, i) => (
                    <div className={'track-cell' + (i === 0 ? ' has' : '')} key={wk}>
                      <div className="w">{wk}</div>
                      <div className="s" style={i === 0 ? { background: m.fill } : null} />
                    </div>
                  ))}
                </div>
                <div className="track-note">{sc.flag} <span className="v3-mono">· W1 baseline</span></div>
              </div>

              {/* ② Throughput + capacity */}
              {sc.throughput && (
                <div className="block">
                  <div className="block-head"><span className="ic"><window.Icon name="layers" size={13} /></span> Throughput &amp; năng lực · W1</div>
                  <window.ThroughputBar throughput={sc.throughput} fidelity={sc.fidelity} />
                  <div style={{ marginTop: 12 }}><window.CapacityBar capacity={sc.capacity} /></div>
                  {sc.capacity && sc.capacity.note && <div className="track-note" style={{ color: 'var(--gap-deep)' }}>⚑ {sc.capacity.note}</div>}
                </div>
              )}

              {/* ③ Milestone */}
              {sc.milestones.length > 0 && (
                <div className="block">
                  <div className="block-head"><span className="ic"><window.Icon name="grid" size={13} /></span> Milestone {sc.milestones.length > 1 ? '· history' : ''}</div>
                  <div className="mstone-list">
                    {sc.milestones.map((ms) => <window.MilestoneProgress key={ms.label} m={ms} />)}
                  </div>
                </div>
              )}

              {/* ④ Task map (task-level only) */}
              {arch && (
                <div className="block">
                  <div className="block-head"><span className="ic"><window.Icon name="map" size={13} /></span> Bản đồ task W1 · {arch.total} task</div>
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

              {/* ⑤ Cross-lens bridge (DEC-18) */}
              <div className="block">
                <div className="block-head"><span className="ic"><window.Icon name="target" size={13} /></span> KPI BSC squad này gánh · cross-lens</div>
                {kpis.length === 0
                  ? <div className="track-note">Squad chưa gánh chỉ tiêu BSC nào (governance/data).</div>
                  : kpis.map((k) => (
                    <div className="bridge-row" key={k.id} style={{ marginBottom: 8 }}>
                      <span className="bnm">{k.name} <span className="v3-mono">· {k.weight}%</span></span>
                      <window.TrackStatusPill status={k.status} />
                      <button className="iconbtn" title="Mở trong BSC lens" onClick={() => onCrossToBsc(k.id)} aria-label="Mở trong BSC lens"><window.Icon name="arrowRight" size={14} /></button>
                    </div>
                  ))}
                {sc.outcomeMiss && <div className="audit" style={{ marginTop: 10 }}><div className="at"><window.Icon name="info" size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> outcome-miss ≠ execution-miss</div><div className="ax">Squad đã ship đủ feature; KPI off-track do outcome thị trường (DEC-19) — đừng đổ lỗi đội ngũ.</div></div>}
                {kpis.length > 0 && (
                  <button className="bridge-cta" onClick={() => onCrossToBsc(kpis[0].id)}>
                    Mở {kpis[0].name.length > 28 ? 'KPI chính' : kpis[0].name} trong BSC lens <window.Icon name="arrowRight" size={14} />
                  </button>
                )}
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
}

/* inline fidelity badge for panel sub */
function FidelityBadgeInline({ fidelity }) {
  return fidelity === 'task-level'
    ? <span style={{ color: 'var(--mint-deep)' }}>task-level (Huly)</span>
    : <span style={{ color: 'var(--gold-deep)' }}>rollup · chưa map Huly</span>;
}

/* ── AgileView orchestrator ──────────────────────────────────────────── */
function AgileView({ onCrossToBsc }) {
  const AS = window.AGILE_SEL, AD = window.AGILE_DATA;
  const [filter, setFilter] = useStateAv({ bp: 'all', squads: [...AS.ALL_SQUADS], flows: [...AS.ALL_FLOWS], week: 'W1' });
  const [pivot, setPivot] = useStateAv('squad');
  const [selectedSquad, setSelectedSquad] = useStateAv(null);

  const squads = useMemoAv(() => AS.filterSquads(filter), [filter.bp, filter.squads, filter.flows]);
  const alerts = useMemoAv(() => AS.deliveryAlerts(), []);
  const bpGroups = AS.ALL_BP.filter((bp) => squads.some((s) => s.bp === bp));

  const open = (sq) => setSelectedSquad(sq);
  const close = () => setSelectedSquad(null);

  return (
    <React.Fragment>
      <window.AgileCommandBar filter={filter} setFilter={setFilter} total={AS.ALL_SQUADS.length} shown={squads.length} />
      <window.AgileVerdict />

      <div className="pivot-row">
        <div className="seg" role="group" aria-label="Nhóm theo">
          {window.PIVOTS.map((p) => <button key={p.v} aria-pressed={pivot === p.v} onClick={() => setPivot(p.v)}>{p.label}</button>)}
        </div>
        <span className="pivot-meta v3-mono">
          {pivot === 'squad' ? squads.length + ' squad · ' + squads.filter((s) => s.fidelity === 'rollup-only').length + ' chưa map task'
            : pivot === 'project' ? AD.INITIATIVES.length + ' sáng kiến'
            : AS.sprintMetrics('W1').total + ' milestone tuần'}
        </span>
      </div>

      {pivot === 'squad' && (
        squads.length === 0
          ? <div className="empty"><div className="ico"><window.Icon name="grid" size={40} /></div><p>Không có squad khớp bộ lọc.</p></div>
          : <div>
            {bpGroups.map((bp) => (
              <section className="bpgroup" key={bp}>
                <div className="bp-divider"><span className="bp-ln" /><span className="bp-nm">BP. {AD.BP_LABEL[bp]}</span><span className="bp-ct v3-mono">{squads.filter((s) => s.bp === bp).length} squad</span></div>
                <div className="squad-grid">
                  {squads.filter((s) => s.bp === bp).map((s) => <window.SquadCard key={s.squad} s={s} onOpen={open} isActive={selectedSquad === s.squad} />)}
                </div>
              </section>
            ))}
            <div className="analysis-grid" style={{ gridTemplateColumns: '1fr' }}>
              <window.SquadLoadChart />
            </div>
            <div className="agile-foot v3-mono">Throughput W1 — DELTA/SIGMA từ Huly task-level; còn lại suy từ PITSTOP rollup (fidelity badge).</div>
          </div>
      )}

      {pivot === 'project' && (
        <div className="console">
          <main>
            <div className="lane-list">
              {AD.INITIATIVES.map((it) => <window.ProjectLane key={it.id + it.squad} it={it} onOpen={open} />)}
            </div>
          </main>
          <window.AgileAlertFeed alerts={alerts} onOpen={open} />
        </div>
      )}

      {pivot === 'sprint' && (
        <div className="console">
          <main><SprintView /></main>
          <window.AgileAlertFeed alerts={alerts} onOpen={open} />
        </div>
      )}

      <SquadDrillPanel openSquad={selectedSquad} list={squads} onClose={close} onNav={open} onCrossToBsc={onCrossToBsc} />
    </React.Fragment>
  );
}

Object.assign(window, { SprintView, SquadDrillPanel, FidelityBadgeInline, AgileView });
