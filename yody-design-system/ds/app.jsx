/* app.jsx — DashboardClient island + APP-surface shell (side-rail + top-bar
   + app-main). Maps to page.tsx (RSC) wrapping <DashboardClient>. */

const { useState: useStateA, useMemo: useMemoA } = React;

function NavLink({ icon, label, badge, active }) {
  return (
    <button className="nav-link" data-active={active ? 'true' : undefined} type="button">
      <span className="nav-link-icon"><window.Icon name={icon} size={18} /></span>
      <span className="nav-link-label">{label}</span>
      {badge && <span className="nav-link-badge">{badge}</span>}
    </button>
  );
}

function PageShell({ children }) {
  const D = window.DASH_DATA;
  const [collapsed, setCollapsed] = useStateA(false);
  return (
    <div className={'app-shell' + (collapsed ? ' collapsed' : '')} id="shell">
      {/* SIDE RAIL */}
      <aside className="side-rail">
        <div className="side-rail-head">
          <a className="app-logo" href="#"><span className="mark">Y</span><span className="name">YODY ID</span></a>
        </div>
        <div className="side-rail-body">
          <div className="nav-section">
            <div className="nav-section-title">Portal</div>
            <div className="nav-section-body">
              <NavLink icon="target" label="Vision" />
              <NavLink icon="layers" label="Capabilities" />
              <NavLink icon="grid" label="Health" />
            </div>
          </div>
          <div className="nav-section">
            <div className="nav-section-title">KPI</div>
            <div className="nav-section-body">
              <NavLink icon="grid" label="Dashboard" active badge="W1" />
              <NavLink icon="map" label="T6/2026 · narrative" />
            </div>
          </div>
        </div>
        <div className="side-rail-foot">
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--iris-tint)', color: 'var(--iris-deep)', display: 'grid', placeItems: 'center', font: '600 11px/1 var(--font-brand)', flexShrink: 0 }}>EA</span>
          <div className="info"><span className="name">ITDX EA</span><span className="meta">Phòng QTRR · CN&CĐS</span></div>
        </div>
      </aside>

      {/* TOP BAR */}
      <header className="top-bar">
        <div className="top-bar-start">
          <button className="app-burger" aria-label="Thu gọn nav" onClick={() => setCollapsed((c) => !c)}>
            <window.Icon name="grid" size={16} />
          </button>
          <nav className="breadcrumb-app">
            <a href="#">KPI</a><span className="sep">/</span>
            <span className="current">Dashboard · Tháng 6/2026</span>
          </nav>
        </div>
        <div className="top-bar-center">
          <div className="top-bar-search" tabIndex={0}>
            <window.Icon name="info" size={14} color="var(--fg-3)" />
            <span className="ph">Tìm chỉ tiêu, team, alert…</span>
            <span className="kbd-group"><span className="kbd">⌘</span><span className="kbd">K</span></span>
          </div>
        </div>
        <div className="top-bar-end">
          <span className="asof"><span className="dot" /> {D.TRACKING_META.latestWeekLabel} · {D.TRACKING_META.asOf}</span>
          <span className="top-bar-divider" />
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--iris-tint)', color: 'var(--iris-deep)', display: 'grid', placeItems: 'center', font: '600 11px/1 var(--font-brand)' }}>EA</span>
        </div>
      </header>

      {/* MAIN */}
      <main className="app-main">
        <div className="app-main-inner">{children}</div>
      </main>
    </div>
  );
}

function AgileSoon() {
  return (
    <div className="lens-soon">
      <span className="badge"><window.Icon name="gitBranch" size={13} /> Bước 3 · đang dựng</span>
      <h3>Lăng kính Agile Delivery</h3>
      <p>
        Squad · Dự án · Sprint — throughput, milestone completion, capacity drain, cross-lens bridge.
        Là một re-projection của cùng data + lớp seed Huly, bật/tắt trong cùng client island
        (chỉ thêm field <code>lens</code>), không nổ island mới. Build sau khi BSC lens được sign-off —
        seed throughput/milestone thật từ Huly (DELTA 22 · SIGMA 6 task-level, 4 squad rollup-only + fidelity badge).
      </p>
    </div>
  );
}

function Footer() {
  const D = window.DASH_DATA;
  return (
    <footer className="foot">
      <div className="col"><span className="k">Nguồn</span><span className="v">{D.TRACKING_META.source}</span></div>
      <div className="col"><span className="k">As-of</span><span className="v">{D.TRACKING_META.asOf} · {D.TRACKING_META.latestWeekLabel} · planned vs estimated</span></div>
      <div className="col"><span className="k">Lưu ý</span><span className="v">Status = nguồn sự thật vấn đề · pct = tiến độ lũy kế vs đích (W1 ≈ 23% thời gian). 3 điểm lệch sheet↔vault surface trong drill panel.</span></div>
    </footer>
  );
}

function DashboardClient() {
  const S = window.DASH_SEL, D = window.DASH_DATA;
  const [filter, setFilter] = useStateA({
    lens: 'bsc', perspective: 'all', teams: [...S.ALL_TEAMS], statuses: [...S.ALL_STATUSES], week: 'W1',
  });
  const [selectedId, setSelectedId] = useStateA(null);
  const [bscView, setBscView] = useStateA('grid');

  const health = useMemoA(() => S.computeHealthScore(filter.week), [filter.week]);
  const anomalies = useMemoA(() => S.detectAnomalies(filter.week), [filter.week]);
  const filtered = useMemoA(() => S.filterKpis(filter), [filter.perspective, filter.teams, filter.statuses, filter.week]);
  const perspWeight = useMemoA(() => {
    if (filter.perspective === 'all') return 100;
    return D.WEEKLY_TRACKING.filter((k) => k.group === filter.perspective).reduce((s, k) => s + k.weight, 0);
  }, [filter.perspective]);

  const setLens = (lens) => { setFilter({ ...filter, lens }); setSelectedId(null); };
  const open = (id) => setSelectedId(id);
  const close = () => setSelectedId(null);
  const crossToBsc = (kpiId) => { setFilter({ ...filter, lens: 'bsc' }); setSelectedId(kpiId); };

  return (
    <PageShell>
      <div className="page-head">
        <div className="page-head-start">
          <p className="page-subtitle">
            <span className="tag-mono tag-engine">BSC</span>
            <span className="sep">·</span>
            <span>CN&amp;CĐS · 12 chỉ tiêu · trọng số 100%</span>
            <span className="sep">·</span>
            <span>Owner: <strong>Phòng QTRR</strong></span>
          </p>
          <h1 className="page-title">KPI Console · Tháng 6/2026</h1>
        </div>
      </div>

      <div className="lens-tabs">
        <window.LensSwitcher lens={filter.lens} onLens={setLens} />
      </div>

      {filter.lens === 'agile' ? <window.AgileView onCrossToBsc={crossToBsc} /> : (
        <React.Fragment>
          <window.CommandBar filter={filter} setFilter={setFilter} total={D.WEEKLY_TRACKING.length} shownCount={filtered.length} perspWeight={perspWeight} />
          <window.VerdictStrip health={health} />
          <div className="grid-head">
            <div className="seg" role="group" aria-label="Kiểu hiển thị">
              <button aria-pressed={bscView === 'grid'} onClick={() => setBscView('grid')}><span className="gl"><window.Icon name="grid" size={13} /></span>Lưới</button>
              <button aria-pressed={bscView === 'table'} onClick={() => setBscView('table')}><span className="gl"><window.Icon name="layers" size={13} /></span>Bảng</button>
            </div>
            <span className="gh-meta">{filtered.length}/{D.WEEKLY_TRACKING.length} chỉ tiêu · {filter.week}</span>
          </div>
          <div className="console">
            <main>
              {filtered.length === 0 ? (
                <div className="empty">
                  <div className="ico"><window.Icon name="grid" size={40} /></div>
                  <p>Không có chỉ tiêu khớp bộ lọc.</p>
                  <button className="reset" style={{ marginTop: 12 }} onClick={() => setFilter({ ...filter, perspective: 'all', teams: [...S.ALL_TEAMS], statuses: [...S.ALL_STATUSES] })}>
                    <window.Icon name="reset" size={12} /> reset bộ lọc
                  </button>
                </div>
              ) : bscView === 'table'
                ? <window.KpiTable kpis={filtered} onOpen={open} activeId={selectedId} week={filter.week} />
                : <window.KpiGrid kpis={filtered} onOpen={open} activeId={selectedId} week={filter.week} />}
            </main>
            <window.AlertFeed anomalies={anomalies} onOpen={open} />
          </div>
          <div className="analysis-grid">
            <window.PaceRankBar kpis={filtered} week={filter.week} onOpen={open} />
            <window.PerspectiveTeamHeatmap week={filter.week} />
          </div>
          <Footer />
        </React.Fragment>
      )}

      <window.KpiDrillPanel openId={selectedId} list={filtered} onClose={close} onNav={open} week={filter.week} />
    </PageShell>
  );
}

Object.assign(window, { PageShell, NavLink, AgileSoon, Footer, DashboardClient });

ReactDOM.createRoot(document.getElementById('root')).render(<DashboardClient />);
