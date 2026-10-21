/* YODY · KPI Network — React chrome (app surface)
   Owns UI state + drives the vanilla canvas engine imperatively. */
const { useState, useRef, useEffect, useCallback, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "layout": "radial",
  "palette": "semantic",
  "edgeDensity": 0.5,
  "sizeByImportance": true,
  "showLabels": true
}/*EDITMODE-END*/;

const STATUS_LABEL = { live: "Đạt mục tiêu", watch: "Cần theo dõi", risk: "Rủi ro" };
const STATUS_TONE = { live: "live", watch: "plan", risk: "gap" };

function fmtPct(k) { return Math.round(k * 100) + "%"; }

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const canvasRef = useRef(null);
  const engRef = useRef(null);
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hover, setHover] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [activeCats, setActiveCats] = useState(() => new Set());
  const [search, setSearch] = useState("");
  // Standalone (offline / no host) needs its own way to open the Tweaks panel —
  // the platform toolbar isn't there. Detect "no parent frame" and show a FAB.
  const isStandalone = typeof window !== "undefined" && window.parent === window;
  const [tweaksOpen, setTweaksOpen] = useState(false);

  useEffect(() => {
    const onMsg = (e) => {
      const ty = e && e.data && e.data.type;
      if (ty === "__activate_edit_mode") setTweaksOpen(true);
      else if (ty === "__deactivate_edit_mode" || ty === "__edit_mode_dismissed") setTweaksOpen(false);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const toggleTweaks = () => {
    window.postMessage({ type: tweaksOpen ? "__deactivate_edit_mode" : "__activate_edit_mode" }, "*");
  };

  // build data once
  useEffect(() => { setData(window.KpiData.build(3000)); }, []);

  // instantiate engine
  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const eng = new window.KpiGraph(canvasRef.current, data, {
      layout: t.layout, palette: t.palette, edgeDensity: t.edgeDensity,
      sizeByImportance: t.sizeByImportance, showLabels: t.showLabels,
    });
    eng.on("select", (n) => setSelected(n));
    eng.on("hover", (n) => setHover(n));
    eng.on("zoom", (k) => setZoom(k));
    engRef.current = eng;
    setZoom(eng.t.k);
    return () => eng.destroy();
  }, [data]);

  // push tweaks → engine
  useEffect(() => {
    if (!engRef.current) return;
    engRef.current.setOptions({
      layout: t.layout, palette: t.palette, edgeDensity: t.edgeDensity,
      sizeByImportance: t.sizeByImportance, showLabels: t.showLabels,
      activeCats, search,
    });
  }, [t.layout, t.palette, t.edgeDensity, t.sizeByImportance, t.showLabels, activeCats, search]);

  const cats = data ? data.cats : [];
  const ORG_CAT = { name: "Tổ chức", color: "#2a2b86", tint: "#eeeefb" };
  const catOf = (n) => (n && n.cat >= 0 && cats[n.cat]) ? cats[n.cat] : ORG_CAT;
  const counts = useMemo(() => {
    const c = {};
    if (data) data.nodes.forEach((n) => { if (n.level >= 1) c[n.cat] = (c[n.cat] || 0) + 1; });
    return c;
  }, [data]);

  const toggleCat = useCallback((ci) => {
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(ci)) next.delete(ci); else next.add(ci);
      return next;
    });
  }, []);

  const breadcrumb = useCallback((n) => {
    if (!data) return [];
    const chain = []; let cur = n;
    while (cur) { chain.unshift(cur); cur = cur.parent >= 0 ? data.nodes[cur.parent] : null; }
    return chain;
  }, [data]);

  const neighbors = useMemo(() => {
    if (!selected || !data) return [];
    return selected.neighbors.map((id) => data.nodes[id]).filter((x) => x && x.id !== selected.parent);
  }, [selected, data]);

  const onSearch = (e) => {
    const v = e.target.value; setSearch(v);
    if (e.key === "Enter" && v.trim() && data) {
      const m = data.nodes.find((n) => n.name.toLowerCase().includes(v.toLowerCase()));
      if (m) engRef.current && engRef.current.focusNode(m.id);
    }
  };

  return (
    <div className="kg-root">
      <canvas ref={canvasRef} className="kg-canvas"></canvas>

      {/* hairline grain so empty canvas reads as a surface */}
      <div className="kg-vignette" aria-hidden="true"></div>

      {/* TOP BAR */}
      <header className="kg-topbar">
        <div className="kg-brand">
          <span className="kg-logo"></span>
          <div className="kg-titles">
            <div className="kg-title">Mạng lưới KPI</div>
            <div className="kg-sub">YODY · {data ? data.nodes.length.toLocaleString("vi-VN") : "—"} chỉ số · 5 cấp</div>
          </div>
        </div>
        <div className="kg-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Tìm KPI rồi nhấn Enter…" value={search} onChange={onSearch} onKeyDown={onSearch} />
        </div>
        <div className="kg-zoomreadout"><span>Thu phóng</span><b>{fmtPct(zoom)}</b></div>
      </header>

      {/* LEGEND / FILTER */}
      <aside className="kg-legend">
        <div className="kg-legend-head">Khối chức năng</div>
        <div className="kg-legend-list">
          {cats.map((c, i) => {
            const off = activeCats.size > 0 && !activeCats.has(i);
            return (
              <button key={c.key} className={"kg-chip" + (off ? " off" : "")} onClick={() => toggleCat(i)}>
                <span className="kg-dot" style={{ background: c.color }}></span>
                <span className="kg-chip-name">{c.name}</span>
                <span className="kg-chip-count">{(counts[i] || 0).toLocaleString("vi-VN")}</span>
              </button>
            );
          })}
        </div>
        {activeCats.size > 0 && (
          <button className="kg-clear" onClick={() => setActiveCats(new Set())}>Bỏ lọc</button>
        )}
        <div className="kg-legend-foot">
          <div className="kg-foot-row"><span className="kg-edge-tree"></span> Phân cấp tổ chức</div>
          <div className="kg-foot-row"><span className="kg-edge-rel"></span> Ảnh hưởng giữa KPI</div>
        </div>
      </aside>

      {/* HOVER TOOLTIP */}
      {hover && !selected && (
        <div className="kg-hint">
          <span className="kg-hint-lv">{data.levels[hover.level]}</span>
          {hover.name}
        </div>
      )}

      {/* ZOOM CONTROLS */}
      <div className="kg-zoom">
        <button onClick={() => engRef.current && engRef.current.zoomBy(1.4)} aria-label="Phóng to">+</button>
        <button onClick={() => engRef.current && engRef.current.zoomBy(1 / 1.4)} aria-label="Thu nhỏ">−</button>
        <button className="kg-fit" onClick={() => engRef.current && engRef.current.fit(true)} aria-label="Vừa khung">⤢</button>
      </div>

      {/* DETAIL PANEL */}
      <section className={"kg-panel" + (selected ? " open" : "")}>
        {selected && (
          <div className="kg-panel-inner">
            <button className="kg-panel-close" onClick={() => { setSelected(null); engRef.current && (engRef.current.selected = null, engRef.current._recomputeHi(), engRef.current._dirty = true); }} aria-label="Đóng">×</button>
            <div className="kg-panel-crumb">
              {breadcrumb(selected).map((b, i, arr) => (
                <span key={b.id}>
                  <button className="kg-crumb" onClick={() => engRef.current && engRef.current.focusNode(b.id)}>{b.name}</button>
                  {i < arr.length - 1 && <span className="kg-crumb-sep">/</span>}
                </span>
              ))}
            </div>
            <h2 className="kg-panel-title">{selected.name}</h2>
            <div className="kg-panel-tags">
              <span className="kg-tag" style={{ background: catOf(selected).tint, color: catOf(selected).color }}>
                <span className="kg-dot" style={{ background: catOf(selected).color }}></span>{catOf(selected).name}
              </span>
              <span className={"kg-tag tone-" + STATUS_TONE[selected.status]}>{STATUS_LABEL[selected.status]}</span>
              <span className="kg-tag mono">{selected.code}</span>
            </div>

            {selected.level >= 3 && (
              <div className="kg-metrics">
                <div className="kg-metric">
                  <div className="kg-metric-label">Thực hiện</div>
                  <div className="kg-metric-val">{selected.value}<small>%</small></div>
                </div>
                <div className="kg-metric">
                  <div className="kg-metric-label">Mục tiêu</div>
                  <div className="kg-metric-val muted">{selected.target}<small>%</small></div>
                </div>
                <div className="kg-metric">
                  <div className="kg-metric-label">Xu hướng</div>
                  <div className={"kg-metric-val " + (selected.trend >= 0 ? "up" : "down")}>{selected.trend >= 0 ? "+" : ""}{selected.trend.toFixed(1)}<small>pt</small></div>
                </div>
                <div className="kg-progress">
                  <div className="kg-progress-track">
                    <div className="kg-progress-fill" style={{ width: Math.min(100, (selected.value / selected.target) * 100) + "%", background: catOf(selected).color }}></div>
                    <div className="kg-progress-target" style={{ left: "100%" }}></div>
                  </div>
                  <div className="kg-progress-cap">{Math.round((selected.value / selected.target) * 100)}% so với mục tiêu</div>
                </div>
              </div>
            )}

            <div className="kg-rel-head">Liên kết <b>{selected.neighbors.length}</b></div>
            <div className="kg-rel-list">
              {neighbors.slice(0, 40).map((nb) => (
                <button key={nb.id} className="kg-rel-item" onClick={() => engRef.current && engRef.current.focusNode(nb.id)}>
                  <span className="kg-dot" style={{ background: catOf(nb).color }}></span>
                  <span className="kg-rel-name">{nb.name}</span>
                  <span className="kg-rel-lv">{data.levels[nb.level]}</span>
                </button>
              ))}
              {neighbors.length === 0 && <div className="kg-rel-empty">Chưa có liên kết ảnh hưởng.</div>}
            </div>
          </div>
        )}
      </section>

      {/* TWEAKS */}
      {isStandalone && !tweaksOpen && (
        <button className="kg-tweaks-fab" onClick={toggleTweaks} aria-label="Mở tuỳ chỉnh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
          Tuỳ chỉnh
        </button>
      )}
      <TweaksPanel>
        <TweakSection label="Bố cục" />
        <TweakRadio label="Layout" value={t.layout}
          options={["radial", "force", "layered"]}
          onChange={(v) => setTweak("layout", v)} />
        <TweakSection label="Mã hoá hình ảnh" />
        <TweakSelect label="Màu node theo" value={t.palette}
          options={[
            { value: "semantic", label: "Khối chức năng" },
            { value: "status", label: "Trạng thái KPI" },
            { value: "iris", label: "Theo cấp (iris)" },
          ]}
          onChange={(v) => setTweak("palette", v)} />
        <TweakToggle label="Kích thước theo độ quan trọng" value={t.sizeByImportance}
          onChange={(v) => setTweak("sizeByImportance", v)} />
        <TweakToggle label="Hiện nhãn" value={t.showLabels}
          onChange={(v) => setTweak("showLabels", v)} />
        <TweakSection label="Liên kết" />
        <TweakSlider label="Mật độ edge ảnh hưởng" value={t.edgeDensity} min={0} max={1} step={0.05}
          onChange={(v) => setTweak("edgeDensity", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
