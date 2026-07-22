/* ─────────────────────────────────────────────────────────
   YODY · KPI Network — canvas engine (vanilla)
   Owns: layout (radial / force / layered), render loop with
   viewport culling + level-of-detail, spatial-grid hit-testing,
   pan / zoom / node-drag / hover / click.

   const eng = new KpiGraph(canvas, data, opts);
   eng.setOptions({...}); eng.on('select'|'hover'|'zoom', cb);
   eng.fit(); eng.zoomBy(f); eng.focusNode(id);
   ───────────────────────────────────────────────────────── */
(function () {
  const TOKENS = {
    bg: "#fcfcff", bg2: "#f4f5fb", border: "#e6e7f2", borderLight: "#f0f1f8",
    fg1: "#1a1b3a", fg2: "#5a5c7e", fg3: "#6b6d8c",
    live: "#10b981", watch: "#f59e0b", risk: "#ef4444",
    iris: "#7c6cf5", brand: "#2a2b86",
  };
  const FONT = "'Be Vietnam Pro','Helvetica Neue',Arial,sans-serif";
  const MONO = "'JetBrains Mono',Menlo,monospace";
  // base node radius (world units) by level
  const R_BY_LEVEL = [26, 15, 9.5, 6, 3.4];

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  class KpiGraph {
    constructor(canvas, data, opts) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.data = data;
      this.nodes = data.nodes;
      this.edges = data.edges;
      this.cats = data.cats;
      this.opts = Object.assign({
        layout: "radial", palette: "semantic", edgeDensity: 0.5,
        sizeByImportance: true, showLabels: true, activeCats: null, search: "",
      }, opts || {});
      this.t = { x: 0, y: 0, k: 1 };            // view transform
      this.handlers = { select: [], hover: [], zoom: [] };
      this.hover = null; this.selected = null;
      this._anim = null; this._dirty = true; this._raf = null;
      this.layouts = {};                         // cached positions per mode

      this._computeLayout("radial");
      this._computeLayout("layered");
      // force is heavier — defer so first paint is instant
      setTimeout(() => { this._computeLayout("force"); if (this.opts.layout === "force") this._applyLayout("force", true); }, 30);

      this._applyLayout(this.opts.layout, false);
      this._bindEvents();
      this._resize();
      this._buildGrid();
      this.fit(false);
      this._draw();   // synchronous first paint — rAF may be throttled while hidden
      this._loop();
    }

    on(ev, cb) { (this.handlers[ev] = this.handlers[ev] || []).push(cb); return this; }
    _emit(ev, arg) { (this.handlers[ev] || []).forEach((f) => f(arg)); }

    /* ── layouts ───────────────────────────────────────── */
    _children(id) { return this.nodes.filter((n) => n.parent === id); }

    _computeLayout(mode) {
      const N = this.nodes, pos = new Array(N.length);
      if (mode === "radial") {
        // angular sector per L1 subtree; radius by level
        const ringR = [0, 700, 980, 1260, 1560];
        const root = N[0];
        pos[root.id] = { x: 0, y: 0 };
        const l1 = this._children(root.id);
        l1.forEach((b, bi) => {
          const a0 = (bi / l1.length) * Math.PI * 2;
          const a1 = ((bi + 1) / l1.length) * Math.PI * 2;
          placeSubtree.call(this, b, a0, a1);
        });
        function placeSubtree(node, a0, a1) {
          const am = (a0 + a1) / 2;
          pos[node.id] = { x: Math.cos(am) * ringR[node.level], y: Math.sin(am) * ringR[node.level] };
          const kids = this._children(node.id);
          if (!kids.length) return;
          const pad = (a1 - a0) * 0.04;
          const span = (a1 - a0) - pad * 2;
          kids.forEach((c, i) => {
            const ca0 = a0 + pad + (i / kids.length) * span;
            const ca1 = a0 + pad + ((i + 1) / kids.length) * span;
            placeSubtree.call(this, c, ca0, ca1);
          });
        }
      } else if (mode === "layered") {
        // columns by level; y spread within level grouped by subtree (in-order)
        const colX = [0, 360, 760, 1180, 1560];
        const counters = {};
        // assign an order index to leaves, then back-propagate parent y = mean(children)
        const byLevel = [[], [], [], [], []];
        N.forEach((n) => byLevel[n.level].push(n));
        let leafY = 0; const gap = 26;
        // DFS from root to order leaves
        const order = [];
        (function dfs(id) {
          const kids = N.filter((n) => n.parent === id);
          if (!kids.length) { order.push(id); return; }
          kids.forEach((k) => dfs(k.id));
        })(0);
        order.forEach((id) => { pos[id] = { x: colX[4], y: leafY * gap }; leafY++; });
        const total = leafY;
        // parents = mean of children y
        for (let lv = 3; lv >= 0; lv--) {
          byLevel[lv].forEach((n) => {
            const kids = N.filter((c) => c.parent === n.id);
            const ys = kids.map((c) => pos[c.id].y);
            const my = ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : 0;
            pos[n.id] = { x: colX[lv], y: my };
          });
        }
        // center vertically
        const cy = (total * gap) / 2;
        N.forEach((n) => { pos[n.id].y -= cy; });
      } else if (mode === "force") {
        // seed from radial, then relax: parent springs + grid-local repulsion + cluster cohesion
        const seed = this.layouts.radial || (this._computeLayout("radial"), this.layouts.radial);
        N.forEach((n) => { pos[n.id] = { x: seed[n.id].x + (Math.random() - 0.5) * 8, y: seed[n.id].y + (Math.random() - 0.5) * 8 }; });
        const ITER = 120, cell = 70;
        const linkLen = (a, b) => 30 + (R_BY_LEVEL[a.level] + R_BY_LEVEL[b.level]);
        for (let it = 0; it < ITER; it++) {
          const cooling = 1 - it / ITER;
          // grid for local repulsion
          const grid = new Map();
          for (const n of N) {
            const cx = Math.floor(pos[n.id].x / cell), cy = Math.floor(pos[n.id].y / cell);
            const key = cx + "," + cy;
            (grid.get(key) || grid.set(key, []).get(key)).push(n.id);
          }
          const fx = new Float64Array(N.length), fy = new Float64Array(N.length);
          for (const n of N) {
            const px = pos[n.id].x, py = pos[n.id].y;
            const cx = Math.floor(px / cell), cy = Math.floor(py / cell);
            for (let gx = cx - 1; gx <= cx + 1; gx++) for (let gy = cy - 1; gy <= cy + 1; gy++) {
              const arr = grid.get(gx + "," + gy); if (!arr) continue;
              for (const mid of arr) {
                if (mid === n.id) continue;
                let dx = px - pos[mid].x, dy = py - pos[mid].y;
                let d2 = dx * dx + dy * dy; if (d2 < 0.01) { d2 = 0.01; dx = Math.random(); }
                const f = 380 / d2;
                fx[n.id] += dx * f; fy[n.id] += dy * f;
              }
            }
          }
          // link springs (tree edges only — keeps clusters tight)
          for (const e of this.edges) {
            if (e.kind !== "tree") continue;
            const a = N[e.s], b = N[e.t];
            let dx = pos[b.id].x - pos[a.id].x, dy = pos[b.id].y - pos[a.id].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
            const desired = linkLen(a, b) * 1.6;
            const f = (dist - desired) * 0.02;
            const ux = dx / dist, uy = dy / dist;
            fx[a.id] += ux * f; fy[a.id] += uy * f;
            fx[b.id] -= ux * f; fy[b.id] -= uy * f;
          }
          for (const n of N) {
            if (n.level === 0) continue; // pin root
            const max = 14 * cooling + 1;
            let mx = clamp(fx[n.id], -max, max), my = clamp(fy[n.id], -max, max);
            pos[n.id].x += mx; pos[n.id].y += my;
          }
        }
      }
      this.layouts[mode] = pos;
      return pos;
    }

    _applyLayout(mode, animate) {
      const target = this.layouts[mode] || this._computeLayout(mode);
      if (!animate) {
        this.nodes.forEach((n) => { n.x = target[n.id].x; n.y = target[n.id].y; });
        this._buildGrid(); this._dirty = true; return;
      }
      const from = this.nodes.map((n) => ({ x: n.x, y: n.y }));
      const t0 = performance.now(), dur = 620;
      this._anim = (now) => {
        const p = clamp((now - t0) / dur, 0, 1);
        const e = 1 - Math.pow(1 - p, 3);
        this.nodes.forEach((n, i) => { n.x = lerp(from[i].x, target[n.id].x, e); n.y = lerp(from[i].y, target[n.id].y, e); });
        this._dirty = true;
        if (p >= 1) { this._anim = null; this._buildGrid(); }
      };
    }

    /* ── spatial grid for hit-testing ──────────────────── */
    _buildGrid() {
      const cell = 60; this._gridCell = cell; this._grid = new Map();
      for (const n of this.nodes) {
        const k = Math.floor(n.x / cell) + "," + Math.floor(n.y / cell);
        (this._grid.get(k) || this._grid.set(k, []).get(k)).push(n);
      }
      this._computeClusters();
    }
    _computeClusters() {
      const acc = {};
      for (const n of this.nodes) {
        if (n.level < 1) continue;
        const c = acc[n.cat] || (acc[n.cat] = { sx: 0, sy: 0, n: 0 });
        c.sx += n.x; c.sy += n.y; c.n++;
      }
      this._clusters = Object.keys(acc).map((ci) => {
        const c = acc[ci], cx = c.sx / c.n, cy = c.sy / c.n;
        let rad = 0;
        for (const n of this.nodes) { if (n.level < 1 || n.cat != ci) continue; const d = Math.hypot(n.x - cx, n.y - cy); if (d > rad) rad = d; }
        return { cat: +ci, cx, cy, rad, color: this.cats[ci].color };
      });
    }
    _nodeAt(sx, sy) {
      // screen → world
      const wx = (sx - this.t.x) / this.t.k, wy = (sy - this.t.y) / this.t.k;
      const cell = this._gridCell, cx = Math.floor(wx / cell), cy = Math.floor(wy / cell);
      let best = null, bestD = Infinity;
      const reach = Math.ceil((R_BY_LEVEL[0] + 14) / cell) + 1;
      for (let gx = cx - reach; gx <= cx + reach; gx++) for (let gy = cy - reach; gy <= cy + reach; gy++) {
        const arr = this._grid.get(gx + "," + gy); if (!arr) continue;
        for (const n of arr) {
          if (!this._visible(n)) continue;
          const dx = n.x - wx, dy = n.y - wy, d = dx * dx + dy * dy;
          const rr = Math.pow((this._radius(n) + 6) / this.t.k, 2);
          if (d < rr && d < bestD) { bestD = d; best = n; }
        }
      }
      return best;
    }

    /* ── view ──────────────────────────────────────────── */
    _resize() {
      const dpr = window.devicePixelRatio || 1;
      const r = this.canvas.getBoundingClientRect();
      this.W = r.width; this.H = r.height;
      this.canvas.width = Math.round(r.width * dpr);
      this.canvas.height = Math.round(r.height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._dirty = true;
    }
    fit(animate) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const n of this.nodes) { if (n.x < minX) minX = n.x; if (n.y < minY) minY = n.y; if (n.x > maxX) maxX = n.x; if (n.y > maxY) maxY = n.y; }
      const w = maxX - minX || 1, h = maxY - minY || 1;
      const pad = 80;
      const k = clamp(Math.min((this.W - pad * 2) / w, (this.H - pad * 2) / h), 0.04, 8);
      const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
      this._setView(this.W / 2 - cx * k, this.H / 2 - cy * k, k, animate);
    }
    _setView(x, y, k, animate) {
      if (!animate) { this.t = { x, y, k }; this._dirty = true; this._emit("zoom", k); return; }
      const from = Object.assign({}, this.t), t0 = performance.now(), dur = 420;
      const step = (now) => {
        const p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
        this.t = { x: lerp(from.x, x, e), y: lerp(from.y, y, e), k: lerp(from.k, k, e) };
        this._dirty = true; this._emit("zoom", this.t.k);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    zoomBy(f) {
      const k = clamp(this.t.k * f, 0.04, 8);
      const cx = this.W / 2, cy = this.H / 2;
      const wx = (cx - this.t.x) / this.t.k, wy = (cy - this.t.y) / this.t.k;
      this._setView(cx - wx * k, cy - wy * k, k, true);
    }
    focusNode(id) {
      const n = this.nodes[id]; if (!n) return;
      const k = clamp(Math.max(this.t.k, 1.6), 0.04, 8);
      this._setView(this.W / 2 - n.x * k, this.H / 2 - n.y * k, k, true);
      this.selected = n; this._dirty = true; this._emit("select", n);
    }

    /* ── visibility / sizing / color ───────────────────── */
    // max level whose LABELS we attempt to draw at the current zoom
    _detailLevel() { const k = this.t.k; return k < 0.35 ? 1 : k < 0.9 ? 2 : k < 1.8 ? 3 : 4; }
    _visible(n) {
      // network overview shows ALL nodes; only category-filter + highlight gate visibility
      if (n === this.hover || n === this.selected) return true;
      if (this._hi && this._hi.has(n.id)) return true;
      if (this._active && !this._active.has(n.cat) && n.level > 0) return false;
      return true;
    }
    _radius(n) {
      let r = R_BY_LEVEL[n.level];
      if (this.opts.sizeByImportance) r *= 0.7 + n.weight * 0.9;
      return r;
    }
    _color(n) {
      if (this.opts.palette === "status") return TOKENS[n.status];
      if (this.opts.palette === "iris") {
        const shades = ["#16175a", "#2a2b86", "#4a4bc8", "#7c6cf5", "#a99cf9"];
        return shades[n.level];
      }
      return this.cats[n.cat] ? this.cats[n.cat].color : TOKENS.brand;
    }

    /* ── interaction ───────────────────────────────────── */
    _bindEvents() {
      const c = this.canvas;
      let dragNode = null, panning = false, lastX = 0, lastY = 0, downX = 0, downY = 0, moved = false;
      this._ro = new ResizeObserver(() => { this._resize(); });
      this._ro.observe(c);

      c.addEventListener("pointerdown", (e) => {
        c.setPointerCapture(e.pointerId);
        downX = e.offsetX; downY = e.offsetY; lastX = e.offsetX; lastY = e.offsetY; moved = false;
        const n = this._nodeAt(e.offsetX, e.offsetY);
        if (n) { dragNode = n; } else { panning = true; }
      });
      c.addEventListener("pointermove", (e) => {
        if (dragNode) {
          const wx = (e.offsetX - this.t.x) / this.t.k, wy = (e.offsetY - this.t.y) / this.t.k;
          dragNode.x = wx; dragNode.y = wy; moved = true; this._buildGrid(); this._dirty = true;
        } else if (panning) {
          this.t.x += e.offsetX - lastX; this.t.y += e.offsetY - lastY;
          lastX = e.offsetX; lastY = e.offsetY; moved = true; this._dirty = true;
        } else {
          const n = this._nodeAt(e.offsetX, e.offsetY);
          if (n !== this.hover) { this.hover = n; this._recomputeHi(); this._dirty = true; this._emit("hover", n); c.style.cursor = n ? "pointer" : "grab"; }
          this._mx = e.offsetX; this._my = e.offsetY;
        }
      });
      const end = (e) => {
        if (dragNode && !moved) { this.selected = dragNode; this._recomputeHi(); this._dirty = true; this._emit("select", dragNode); }
        else if (panning && !moved) { this.selected = null; this._recomputeHi(); this._dirty = true; this._emit("select", null); }
        dragNode = null; panning = false;
        try { c.releasePointerCapture(e.pointerId); } catch (_) {}
      };
      c.addEventListener("pointerup", end);
      c.addEventListener("pointercancel", end);
      c.addEventListener("wheel", (e) => {
        e.preventDefault();
        const f = Math.exp(-e.deltaY * 0.0016);
        const k = clamp(this.t.k * f, 0.04, 8);
        const wx = (e.offsetX - this.t.x) / this.t.k, wy = (e.offsetY - this.t.y) / this.t.k;
        this.t.x = e.offsetX - wx * k; this.t.y = e.offsetY - wy * k; this.t.k = k;
        this._dirty = true; this._emit("zoom", k);
      }, { passive: false });
      c.style.cursor = "grab";
    }

    _recomputeHi() {
      const focus = this.hover || this.selected;
      if (!focus) { this._hi = null; return; }
      const s = new Set([focus.id]);
      focus.neighbors.forEach((id) => s.add(id));
      this._hi = s;
    }

    setOptions(o) {
      const prevLayout = this.opts.layout;
      Object.assign(this.opts, o);
      this._active = this.opts.activeCats && this.opts.activeCats.size ? this.opts.activeCats : null;
      if (o.layout && o.layout !== prevLayout) this._applyLayout(o.layout, true);
      this._dirty = true;
    }

    /* ── render ────────────────────────────────────────── */
    _loop() {
      const frame = (now) => {
        try {
          if (this._anim) this._anim(now);
          if (this._dirty) { this._draw(); this._dirty = false; }
        } catch (err) { if (!this._warned) { console.warn("KpiGraph draw:", err); this._warned = true; } }
        this._raf = requestAnimationFrame(frame);
      };
      this._raf = requestAnimationFrame(frame);
    }

    _draw() {
      const ctx = this.ctx, { x, y, k } = this.t;
      ctx.clearRect(0, 0, this.W, this.H);
      ctx.save();
      ctx.translate(x, y); ctx.scale(k, k);

      const detail = this._detailLevel();
      const hi = this._hi;
      const dim = hi ? 0.08 : 1;
      // viewport bounds in world space (for culling)
      const vx0 = -x / k, vy0 = -y / k, vx1 = (this.W - x) / k, vy1 = (this.H - y) / k;
      const m = 60;

      // 1 · cluster blobs (low zoom) — "tập trung theo nhóm"
      if (k < 0.6 && this._clusters) {
        const blobAlpha = clamp((0.6 - k) / 0.44, 0, 1) * 0.5;
        for (const cl of this._clusters) {
          if (this._active && !this._active.has(cl.cat)) continue;
          const g = ctx.createRadialGradient(cl.cx, cl.cy, cl.rad * 0.1, cl.cx, cl.cy, cl.rad * 1.08);
          g.addColorStop(0, hexA(cl.color, blobAlpha * 0.5));
          g.addColorStop(1, hexA(cl.color, 0));
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(cl.cx, cl.cy, cl.rad * 1.08, 0, Math.PI * 2); ctx.fill();
        }
      }

      // 2 · edges
      ctx.lineWidth = 1 / k;
      // tree edges — backbone; lighter when zoomed out, dim when something is highlighted
      for (const e of this.edges) {
        if (e.kind !== "tree") continue;
        const a = this.nodes[e.s], b = this.nodes[e.t];
        const bothHi = hi && hi.has(a.id) && hi.has(b.id);
        if (!this._visible(a) || !this._visible(b)) { if (!bothHi) continue; }
        // viewport cull: skip if both endpoints far off-screen
        if (!bothHi && (Math.max(a.x, b.x) < vx0 - m || Math.min(a.x, b.x) > vx1 + m ||
          Math.max(a.y, b.y) < vy0 - m || Math.min(a.y, b.y) > vy1 + m)) continue;
        ctx.strokeStyle = bothHi ? hexA(TOKENS.fg3, 0.55) : hexA(TOKENS.border, dim * 0.85);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      // relationship edges (influence) — curved, colored; only when zoomed in or highlighted
      if (this.opts.edgeDensity > 0) {
        let i = 0;
        for (const e of this.edges) {
          if (e.kind !== "rel") continue;
          i++;
          const a = this.nodes[e.s], b = this.nodes[e.t];
          const onHi = hi && (hi.has(a.id) && hi.has(b.id));
          if (!onHi) {
            if (k < 0.55) continue;                               // hide influence web at overview
            if ((i % 1000) / 1000 > this.opts.edgeDensity) continue;
            if (!this._visible(a) || !this._visible(b)) continue;
          }
          const col = this.cats[a.cat].color;
          ctx.strokeStyle = onHi ? hexA(col, 0.85) : hexA(col, dim * 0.45);
          ctx.lineWidth = (onHi ? 1.6 : 1) / k;
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * 0.12;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(mx, my, b.x, b.y); ctx.stroke();
        }
      }

      // 3 · nodes
      const labels = [];
      for (const n of this.nodes) {
        if (!this._visible(n)) continue;
        if (n.x < vx0 - m || n.x > vx1 + m || n.y < vy0 - m || n.y > vy1 + m) continue;
        const r = this._radius(n);
        const rDraw = Math.max(r, 1.15 / k);   // keep tiny leaves visible at overview
        const col = this._color(n);
        const isHi = !hi || (hi && hi.has(n.id));
        const a = isHi ? 1 : dim;
        ctx.beginPath(); ctx.arc(n.x, n.y, rDraw, 0, Math.PI * 2);
        ctx.fillStyle = hexA(col, a);
        ctx.fill();
        if (n.level <= 1 || n === this.hover || n === this.selected) {
          ctx.lineWidth = (n === this.selected ? 2.4 : 1.4) / k;
          ctx.strokeStyle = n === this.selected ? TOKENS.brand : hexA("#ffffff", a);
          ctx.stroke();
        }
        // status ring for at-risk leaves when highlighted/zoomed
        if (n.status === "risk" && isHi && n.level >= 3 && k > 0.4) {
          ctx.beginPath(); ctx.arc(n.x, n.y, rDraw + 2.2 / k, 0, Math.PI * 2);
          ctx.strokeStyle = hexA(TOKENS.risk, a); ctx.lineWidth = 1.2 / k; ctx.stroke();
        }
        // collect labels
        if (this.opts.showLabels) {
          const showLabel = n.level <= detail ||
            (n === this.hover || n === this.selected) ||
            (hi && hi.has(n.id) && k > 0.9 && n.level <= 3);
          if (showLabel) labels.push(n);
        }
      }

      // 4 · labels (screen space, greedy de-confliction by priority)
      ctx.restore();
      if (this.opts.showLabels && labels.length) {
        labels.sort((p, q) => {
          const pa = (p === this.hover || p === this.selected) ? -1 : p.level;
          const qa = (q === this.hover || q === this.selected) ? -1 : q.level;
          return pa - qa;
        });
        const placed = [];
        let drawn = 0;
        for (const n of labels) {
          if (drawn > 70) break;
          const forced = (n === this.hover || n === this.selected);
          const sx = n.x * k + x, sy = n.y * k + y;
          if (!forced && (sx < -40 || sx > this.W + 40 || sy < -20 || sy > this.H + 20)) continue;
          const rpx = Math.max(this._radius(n) * k, 1.15);
          const big = n.level <= 1;
          const fs = big ? clamp(13 + (1 - n.level) * 3, 12, 17) : n.level === 2 ? 12.5 : 11;
          ctx.font = (big ? "700 " : "500 ") + fs + "px " + FONT;
          const txt = n.name;
          const tw = ctx.measureText(txt).width;
          const lx = sx, ly = sy - rpx - 5;
          const rect = { x0: lx - tw / 2 - 5, y0: ly - fs - 2, x1: lx + tw / 2 + 5, y1: ly + 5 };
          if (!forced) {
            let hit = false;
            for (const p of placed) { if (rect.x0 < p.x1 && rect.x1 > p.x0 && rect.y0 < p.y1 && rect.y1 > p.y0) { hit = true; break; } }
            if (hit) continue;
          }
          placed.push(rect); drawn++;
          if (forced || n.level >= 2) {
            ctx.fillStyle = hexA("#ffffff", 0.9);
            ctx.fillRect(rect.x0, rect.y0, rect.x1 - rect.x0, rect.y1 - rect.y0);
          }
          ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
          ctx.fillStyle = big ? TOKENS.fg1 : TOKENS.fg2;
          ctx.fillText(txt, lx, ly);
        }
      }
    }

    destroy() { cancelAnimationFrame(this._raf); if (this._ro) this._ro.disconnect(); }
  }

  function hexA(hex, a) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16), g = parseInt(h.substring(2, 4), 16), b = parseInt(h.substring(4, 6), 16);
    return "rgba(" + r + "," + g + "," + b + "," + clamp(a, 0, 1) + ")";
  }

  window.KpiGraph = KpiGraph;
})();
