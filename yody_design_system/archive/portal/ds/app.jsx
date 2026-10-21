/* app.jsx — DashboardClient (1 client island: filterState{lens} + selectedId)
   + PageShell chrome + mount. Maps to page.tsx (RSC) wrapping <DashboardClient>. */

const { useState: useStateA, useMemo: useMemoA } = React;

function PageShell({ children }) {
  const D = window.DASH_DATA;
  return (
    <div className="page">
      <header className="hdr">
        <div className="shell hdr-row">
          <div className="brand-lock">
            <span className="brand-mark">Y</span>
            <span>
              <span className="brand-name">YODY ID</span>{' '}
              <span className="brand-sub">· ITDX EA</span>
            </span>
          </div>
          <nav className="hdr-nav">
            <a href="#">Vision</a>
            <a href="#">Capabilities</a>
            <a href="#">Health</a>
            <a href="#" className="is-active">KPI</a>
          </nav>
        </div>
      </header>
      <div className="shell">
        <div className="crumbbar">
          <div className="crumb">
            <span className="crumb-path">KPI / <b>Dashboard</b></span>
            <span className="crumb-period">Tháng 6/2026</span>
          </div>
          <div className="crumb-right">
            <span className="asof"><span className="dot" /> Cập nhật {D.TRACKING_META.latestWeekLabel} · {D.TRACKING_META.asOf}</span>
            <a className="coexist" href="#" title="Bản narrative cũ — giữ làm fallback">
              <window.Icon name="arrowRight" size={13} /> Xem bản t6-2026
            </a>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function AgileSoon() {
  return (
    <div className="shell">
      <div className="lens-soon">
        <span className="badge"><window.Icon name="gitBranch" size={13} /> Bước 3 · đang dựng</span>
        <h3>Lăng kính Agile Delivery</h3>
        <p>
          Squad · Dự án · Sprint — throughput, milestone completion, capacity drain, cross-lens bridge.
          Lăng kính này là một <b>re-projection của cùng data + lớp seed Huly</b>, bật/tắt trong cùng client
          island (chỉ thêm field <code style={{ fontFamily: 'var(--font-mono)' }}>lens</code>), không nổ island mới.
          Build sau khi BSC lens được sign-off — seed throughput/milestone thật từ Huly (DELTA 22 · SIGMA 6 task-level,
          4 squad rollup-only + fidelity badge).
        </p>
      </div>
    </div>
  );
}

function Footer() {
  const D = window.DASH_DATA;
  return (
    <footer className="foot shell">
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

  return (
    <PageShell>
      <window.LensSwitcher lens={filter.lens} onLens={setLens} />

      {filter.lens === 'agile' ? <AgileSoon /> : (
        <React.Fragment>
          <window.CommandBar filter={filter} setFilter={setFilter} total={D.WEEKLY_TRACKING.length} shownCount={filtered.length} perspWeight={perspWeight} />
          <div className="shell">
            <window.VerdictStrip health={health} />
            <div className="console">
              <main>
                {filtered.length === 0 ? (
                  <div className="empty">
                    <div className="ico"><window.Icon name="grid" size={44} /></div>
                    <p>Không có chỉ tiêu khớp bộ lọc.</p>
                    <button className="reset" style={{ marginTop: 12 }} onClick={() => setFilter({ ...filter, perspective: 'all', teams: [...S.ALL_TEAMS], statuses: [...S.ALL_STATUSES] })}>
                      <window.Icon name="reset" size={12} /> reset bộ lọc
                    </button>
                  </div>
                ) : (
                  <window.KpiGrid kpis={filtered} onOpen={open} activeId={selectedId} week={filter.week} />
                )}
              </main>
              <window.AlertFeed anomalies={anomalies} onOpen={open} />
            </div>
            <window.PerspectiveTeamHeatmap week={filter.week} />
            <Footer />
          </div>
        </React.Fragment>
      )}

      <window.KpiDrillPanel openId={selectedId} list={filtered} onClose={close} onNav={open} week={filter.week} />
    </PageShell>
  );
}

Object.assign(window, { PageShell, AgileSoon, Footer, DashboardClient });

ReactDOM.createRoot(document.getElementById('root')).render(<DashboardClient />);
