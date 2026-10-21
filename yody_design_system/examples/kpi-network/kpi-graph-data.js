/* ─────────────────────────────────────────────────────────
   YODY · KPI Network — synthetic data generator
   Builds a hierarchical KPI tree for ONE organization:
     L0 Tập đoàn → L1 Khối → L2 Phòng ban → L3 Nhóm KPI → L4 KPI
   plus cross-tree "ảnh hưởng" (influence) edges between KPIs.

   Exposes window.KpiData.build(targetTotal) -> { nodes, edges, cats, levels }
   Deterministic (seeded) so layout is stable across reloads.
   ───────────────────────────────────────────────────────── */
(function () {
  // mulberry32 — tiny seeded PRNG
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 6 KPI domains ("khối"). color = a YODY token hex (sanctioned chart palette).
  const CATS = [
    { key: "fin",  name: "Tài chính",            color: "#2a2b86", tint: "#eeeefb" }, // brand
    { key: "biz",  name: "Kinh doanh",           color: "#10b981", tint: "#d1fae5" }, // mint
    { key: "ops",  name: "Vận hành & Cung ứng",  color: "#7c6cf5", tint: "#eeeefb" }, // iris
    { key: "cust", name: "Khách hàng & Thương hiệu", color: "#f472b6", tint: "#fde7f1" }, // rose
    { key: "ppl",  name: "Con người & Tổ chức",  color: "#b07a00", tint: "#fff4d8" }, // gold-deep
    { key: "prod", name: "Sản phẩm & Đổi mới",   color: "#4a4bc8", tint: "#eeeefb" }, // iris-deep
  ];

  // department names per domain
  const DEPTS = {
    fin:  ["Kế toán", "Tài chính DN", "Kiểm soát nội bộ", "Mua hàng", "Đầu tư", "Phân tích KD"],
    biz:  ["Bán lẻ Miền Bắc", "Bán lẻ Miền Trung", "Bán lẻ Miền Nam", "Thương mại điện tử", "Bán sỉ & Đại lý", "Phát triển cửa hàng"],
    ops:  ["Kho vận", "Chuỗi cung ứng", "Logistics", "Kế hoạch hàng hoá", "Vận hành cửa hàng", "Công nghệ vận hành"],
    cust: ["CSKH", "Marketing", "Thương hiệu", "CRM & Loyalty", "Trải nghiệm KH", "Nội dung & Social"],
    ppl:  ["Tuyển dụng", "Đào tạo & Phát triển", "C&B", "Văn hoá DN", "Quan hệ lao động", "Quản trị nhân tài"],
    prod: ["Thiết kế", "Phát triển mẫu", "Quản lý chất lượng", "Nghiên cứu vật liệu", "Merchandising", "Đổi mới SX"],
  };

  // metric word pools — combine with qualifiers to make plausible KPI names
  const METRICS = {
    fin:  ["Doanh thu", "Lợi nhuận gộp", "Biên lợi nhuận", "EBITDA", "Dòng tiền", "Chi phí/Doanh thu", "ROI", "Vòng quay vốn", "Công nợ", "Tỷ suất sinh lời"],
    biz:  ["Doanh thu/cửa hàng", "Doanh thu/m²", "Tỷ lệ chuyển đổi", "Giá trị đơn TB", "Số đơn", "Tăng trưởng cùng kỳ", "Lượt khách", "Tỷ lệ trả hàng"],
    ops:  ["Tồn kho ngày", "Tỷ lệ giao đúng hạn", "Vòng quay tồn kho", "Tỷ lệ hết hàng", "Lead time", "Năng suất kho", "Chi phí logistics", "Độ chính xác đơn"],
    cust: ["NPS", "CSAT", "Tỷ lệ giữ chân", "Khách quay lại", "Độ nhận biết", "Lượt theo dõi", "Tỷ lệ phản hồi", "Chi phí thu hút KH"],
    ppl:  ["eNPS", "Tỷ lệ nghỉ việc", "Giờ đào tạo", "Tỷ lệ tuyển đạt", "Năng suất/nhân viên", "Tỷ lệ thăng tiến nội bộ", "Mức độ gắn kết"],
    prod: ["Tỷ lệ bán hết", "Số mẫu mới", "Vòng đời sản phẩm", "Tỷ lệ lỗi QC", "Time-to-market", "Tỷ lệ tái sử dụng vật liệu", "Tỷ lệ đúng size"],
  };
  const QUALS = ["Miền Bắc", "Miền Trung", "Miền Nam", "Online", "Cửa hàng", "Bán sỉ", "Quý này", "Lũy kế năm", "Khách VIP", "Khách mới", "Toàn hệ thống", "Theo tháng"];
  const STATUS = ["live", "watch", "risk"]; // on-track / theo dõi / rủi ro

  function build(targetTotal) {
    const r = rng(20260606);
    const nodes = [];
    const edges = [];
    let id = 0;

    function add(level, cat, parent, name, weight) {
      const n = {
        id: id++, level, cat, parent,
        name,
        code: "KPI-" + String(1000 + id).slice(-4),
        weight,
        status: STATUS[(r() * 3) | 0],
        // mock value/target for the detail panel
        value: Math.round(40 + r() * 60),
        target: Math.round(70 + r() * 30),
        trend: (r() * 20 - 7),
        x: 0, y: 0, vx: 0, vy: 0,
        neighbors: [],
      };
      nodes.push(n);
      if (parent >= 0) edges.push({ s: parent, t: n.id, kind: "tree" });
      return n;
    }

    // L0 root
    const root = add(0, -1, -1, "YODY", 1);

    // budget leaves so total ≈ targetTotal
    const nL1 = CATS.length;
    const deptPerBlock = 6;
    const groupPerDept = 4;
    const nL2 = nL1 * deptPerBlock;
    const nL3 = nL2 * groupPerDept;          // 144 groups
    const fixed = 1 + nL1 + nL2 + nL3;
    let leavesLeft = Math.max(nL3, (targetTotal || 3000) - fixed);
    let groupsLeft = nL3;                     // for even leaf distribution

    CATS.forEach((cat, ci) => {
      const block = add(1, ci, root.id, cat.name, 0.85);
      const depts = DEPTS[cat.key];
      for (let d = 0; d < deptPerBlock; d++) {
        const dept = add(2, ci, block.id, depts[d % depts.length], 0.55 + r() * 0.2);
        for (let g = 0; g < groupPerDept; g++) {
          const metric = METRICS[cat.key][(r() * METRICS[cat.key].length) | 0];
          const group = add(3, ci, dept.id, metric, 0.35 + r() * 0.15);
          // even spread of remaining leaves across remaining groups (±25% jitter)
          const base = leavesLeft / groupsLeft;
          let perGroup = Math.round(base * (0.78 + r() * 0.44));
          perGroup = Math.max(3, Math.min(perGroup, leavesLeft - (groupsLeft - 1) * 3));
          if (groupsLeft === 1) perGroup = leavesLeft;
          for (let k = 0; k < perGroup; k++) {
            const m = METRICS[cat.key][(r() * METRICS[cat.key].length) | 0];
            const q = QUALS[(r() * QUALS.length) | 0];
            add(4, ci, group.id, m + " · " + q, 0.12 + r() * 0.18);
            leavesLeft--;
          }
          groupsLeft--;
        }
      }
    });

    // build neighbor lists from tree edges
    edges.forEach((e) => {
      nodes[e.s].neighbors.push(e.t);
      nodes[e.t].neighbors.push(e.s);
    });

    // cross-tree influence edges between leaf/group KPIs
    const leaves = nodes.filter((n) => n.level >= 3);
    const relCount = Math.round(leaves.length * 0.28);
    for (let i = 0; i < relCount; i++) {
      const a = leaves[(r() * leaves.length) | 0];
      const b = leaves[(r() * leaves.length) | 0];
      if (a.id === b.id) continue;
      // bias toward cross-category relationships (more meaningful)
      if (a.cat === b.cat && r() < 0.55) continue;
      if (a.neighbors.includes(b.id)) continue;
      edges.push({ s: a.id, t: b.id, kind: "rel" });
      a.neighbors.push(b.id);
      b.neighbors.push(a.id);
    }

    return { nodes, edges, cats: CATS, levels: ["Tập đoàn", "Khối", "Phòng ban", "Nhóm KPI", "KPI"] };
  }

  window.KpiData = { build, CATS };
})();
