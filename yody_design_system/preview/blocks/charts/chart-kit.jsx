/* ─────────────────────────────────────────────────────────
   YODY Charts Demo · chart-kit.jsx
   Browser port of registry/ui/chart.tsx (+ Card primitives)
   so the chart variants render in this no-build preview with
   the SAME component API as the real @yody/chart registry item.
   Copy-paste target for real repos = the .tsx files, not this.
   Requires globals: React, ReactDOM, Recharts (UMD).
   ───────────────────────────────────────────────────────── */

/* ── cn (strings + conditional objects) ── */
function cn(...inputs) {
  const out = [];
  for (const i of inputs.flat(Infinity)) {
    if (!i) continue;
    if (typeof i === "string") out.push(i);
    else if (typeof i === "object") for (const k in i) if (i[k]) out.push(k);
  }
  return out.join(" ");
}

/* ── Card primitives (shadcn v4 anatomy) ── */
function Card({ className, ...props }) {
  return <div data-slot="card" className={cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border py-6 shadow-sm", className)} {...props}></div>;
}
function CardHeader({ className, ...props }) {
  return <div data-slot="card-header" className={cn("grid auto-rows-min items-start gap-1.5 px-6", className)} {...props}></div>;
}
function CardTitle({ className, ...props }) {
  return <div data-slot="card-title" className={cn("leading-none font-semibold", className)} {...props}></div>;
}
function CardDescription({ className, ...props }) {
  return <div data-slot="card-description" className={cn("text-muted-foreground text-sm", className)} {...props}></div>;
}
function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props}></div>;
}
function CardFooter({ className, ...props }) {
  return <div data-slot="card-footer" className={cn("flex items-center px-6", className)} {...props}></div>;
}

/* ── icons (inline, no lucide dep) ── */
function IconTrendingUp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path>
    </svg>
  );
}
function IconTrendingDown(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 17h6v-6"></path><path d="m22 17-8.5-8.5-5 5L2 7"></path>
    </svg>
  );
}

/* ── Chart context ── */
const ChartContext = React.createContext(null);
function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within a <ChartContainer />");
  return context;
}

const CHART_THEMES = { light: "", dark: ".dark" };

function ChartStyle({ id, config }) {
  const colorConfig = Object.entries(config).filter(([, cfg]) => cfg.theme || cfg.color);
  if (!colorConfig.length) return null;
  const css = Object.entries(CHART_THEMES)
    .map(([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = (itemConfig.theme && itemConfig.theme[theme]) || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}
`)
    .join("\n");
  return <style dangerouslySetInnerHTML={{ __html: css }}></style>;
}

/* In this no-build preview, recharts' ResponsiveContainer fails to
   re-measure inside the flex/aspect-video parent — a tiny AutoSizer
   with the same contract replaces it (real .tsx keeps RC). */
function ChartAutoSizer({ children }) {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let alive = true, raf = 0;
    const measure = () => {
      if (!alive) return false;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setSize((s) => (Math.abs(s.w - r.width) > 0.5 || Math.abs(s.h - r.height) > 0.5 ? { w: r.width, h: r.height } : s));
        return true;
      }
      return false;
    };
    /* ResizeObserver never fires in this sandboxed preview iframe —
       poll with rAF until the Tailwind layout lands, then keep a slow
       interval + window resize listener for later reflows. */
    let tries = 0;
    const tick = () => { if (!measure() && tries++ < 240) raf = requestAnimationFrame(tick); };
    tick();
    const iv = setInterval(measure, 600);
    window.addEventListener("resize", measure);
    let ro = null;
    try { ro = new ResizeObserver(measure); ro.observe(el); } catch (e) {}
    return () => { alive = false; cancelAnimationFrame(raf); clearInterval(iv); window.removeEventListener("resize", measure); if (ro) ro.disconnect(); };
  }, []);
  const child = React.Children.only(children);
  return (
    <div ref={ref} className="recharts-responsive-container" style={{ width: "100%", height: "100%", minWidth: 0 }}>
      {size.w > 0 && size.h > 0 ? React.cloneElement(child, { width: size.w, height: size.h }) : null}
    </div>
  );
}

function ChartContainer({ id, className, children, config, ...props }) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config}></ChartStyle>
        <ChartAutoSizer>{children}</ChartAutoSizer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartTooltip = Recharts.Tooltip;

function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) return undefined;
  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined;
  let configLabelKey = key;
  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key];
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key] === "string") {
    configLabelKey = payloadPayload[key];
  }
  return configLabelKey in config ? config[configLabelKey] : config[key];
}

function ChartTooltipContent({
  active, payload, className,
  indicator = "dot", hideLabel = false, hideIndicator = false,
  label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey,
}) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !(payload && payload.length)) return null;
    const [item] = payload;
    const key = `${labelKey || (item && item.dataKey) || (item && item.name) || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string"
        ? (config[label] && config[label].label) || label
        : itemConfig && itemConfig.label;
    if (labelFormatter) {
      return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>;
    }
    if (!value) return null;
    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

  if (!active || !(payload && payload.length)) return null;

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div className={cn("border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl", className)}>
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || (item.payload && item.payload.fill) || item.color;
          return (
            <div
              key={item.dataKey || index}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center"
              )}
            >
              {formatter && item.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <React.Fragment>
                  {itemConfig && itemConfig.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)", {
                          "h-2.5 w-2.5": indicator === "dot",
                          "w-1": indicator === "line",
                          "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                          "my-0.5": nestLabel && indicator === "dashed",
                        })}
                        style={{ "--color-bg": indicatorColor, "--color-border": indicatorColor }}
                      ></div>
                    )
                  )}
                  <div className={cn("flex flex-1 justify-between leading-none", nestLabel ? "items-end" : "items-center")}>
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">{(itemConfig && itemConfig.label) || item.name}</span>
                    </div>
                    {item.value !== undefined && item.value !== null && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {typeof item.value === "number" ? item.value.toLocaleString("vi-VN") : item.value}
                      </span>
                    )}
                  </div>
                </React.Fragment>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = Recharts.Legend;

function ChartLegendContent({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }) {
  const { config } = useChart();
  if (!(payload && payload.length)) return null;
  return (
    <div className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}>
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        return (
          <div key={item.value} className="[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3">
            {itemConfig && itemConfig.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }}></div>
            )}
            {(itemConfig && itemConfig.label) || item.value}
          </div>
        );
      })}
    </div>
  );
}

/* ── demo shell ── */
window.CHART_VARIANTS = window.CHART_VARIANTS || [];
function registerChartVariant(v) { window.CHART_VARIANTS.push(v); }

/* recharts leaves its mount-animation clipPath on the layer <g> after
   the animation ends. DOM-cloning capture tools (screenshots, PDF
   export) fail to resolve that url() ref and clip the whole series
   away. Once the anim rect reaches full width, the clip is a no-op —
   strip it. Runs forever (interactive variants re-animate). */
setInterval(function () {
  document.querySelectorAll('g[clip-path^="url(#animationClipPath"]').forEach(function (g) {
    try {
      var id = g.getAttribute("clip-path").slice(5, -1).replace(/"/g, "");
      var cp = document.getElementById(id);
      if (!cp) { g.removeAttribute("clip-path"); return; }
      var animRect = cp.querySelector("rect");
      var defs = cp.parentElement;
      var target = 0;
      defs.querySelectorAll("clipPath rect").forEach(function (r) {
        target = Math.max(target, parseFloat(r.getAttribute("width")) || 0);
      });
      if (animRect && parseFloat(animRect.getAttribute("width")) >= target - 1) {
        g.removeAttribute("clip-path");
      }
    } catch (e) {}
  });
}, 600);

function VariantFrame({ v }) {
  return (
    <section className="variant" id={v.id} data-screen-label={v.id}>
      <div className="v-head">
        <code className="v-id">{v.id}</code>
        <p className="v-desc">{v.desc}</p>
      </div>
      <v.Component />
    </section>
  );
}

function ChartsDemoApp({ group, planned, intro }) {
  const KEY = "yody-charts-dark";
  const [dark, setDark] = React.useState(() => {
    try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; }
  });
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem(KEY, dark ? "1" : "0"); } catch (e) {}
  }, [dark]);

  const variants = window.CHART_VARIANTS;
  const doneIds = new Set(variants.map((v) => v.id));

  return (
    <div className="charts-wrap">
      <header className="charts-head">
        <div className="tt">
          <p className="meta">YODY · shadcn charts recreate</p>
          <h1>Charts · {group}</h1>
          <p>{intro} Token <code>--chart-1…5</code> map về accent YODY — đổi theme là chart tự đổi màu.</p>
        </div>
        <div className="sp"></div>
        <div className="charts-prog">
          <span className="n">{variants.length}<small> / {planned.length}</small></span>
          <button className="mode-sw" aria-label="Đổi sáng/tối" onClick={() => setDark(!dark)}>
            <span className="knob">
              {dark ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"></path></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4.2"></circle><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19"></path></svg>
              )}
            </span>
          </button>
        </div>
      </header>

      <div className="variant-checklist">
        {planned.map((id) => (
          <span key={id} className={cn("vchip", doneIds.has(id) && "done")}>{id.replace("chart-", "")}</span>
        ))}
      </div>

      <div className="charts-grid">
        {variants.map((v) => <VariantFrame key={v.id} v={v} />)}
      </div>
    </div>
  );
}

Object.assign(window, {
  cn,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  IconTrendingUp, IconTrendingDown,
  ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
  registerChartVariant, ChartsDemoApp, VariantFrame,
});
