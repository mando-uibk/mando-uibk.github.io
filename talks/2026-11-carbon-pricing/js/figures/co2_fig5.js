/* Project 1 - Figure 5: exploratory pooled associations with support (co2_fig5.json, vector extraction).
   Each column keeps its own x domain, as in the paper. Split over two slides:
   part 1 = groups a-d, part 2 = groups e-h.
   All row groups appear at once on entry (no clicks). */
PSD.figures['co2-fig5'] = function (mount, opts) {
  const P = opts.palette, el = PSD.el, D = PSD.data.co2_fig5, C = D.colors;
  const part = opts.part || 1;
  const groups = D.groups.slice(part === 1 ? 0 : 4, part === 1 ? 4 : 8);
  const W = 1168, H = 588, s = PSD.svg(mount, W, H), st = PSD.stepper();
  const labW = 330, gapC = 14, colW = (W - labW - 3 * gapC) / 4;
  const colX = i => labW + i * (colW + gapC);
  const nRows = groups.reduce((a, g) => a + g.rows.length, 0);
  const headTop = 46, axisH = 40, groupHead = part === 1 ? 26 : 22, groupGap = part === 1 ? 10 : 6;
  const rowH = (H - headTop - axisH - groups.length * (groupHead + groupGap)) / nRows;
  const fs = part === 1 ? 17 : 15;
  const per = D.xaxis.per_column;
  const sxs = per.map((pc, i) => PSD.scale(pc.domain[0], pc.domain[1], colX(i) + 4, colX(i) + colW - 4));
  // column headers
  const gH = el('g', null, s);
  D.columns.forEach((c, i) => {
    el('rect', { x: colX(i), y: 0, width: colW, height: 38, rx: 3, fill: C.column_header_fill, stroke: C.column_header_stroke, 'stroke-width': 1 }, gH);
    el('text', { x: colX(i) + colW / 2, y: 25, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 600, fill: C.column_header_text, text: c }, gH);
  });
  st.add(gH, 'fade', 0);
  let y = headTop;
  const hlRows = [];
  const dimmable = [];
  groups.forEach((G, gi) => {
    const gTop = y;
    const gLab = el('text', { x: 0, y: y + groupHead - 8, 'font-size': fs, 'font-weight': 600, fill: C.group_label_text, text: G.label }, s);
    st.add(gLab, 'fade', 0);
    y += groupHead;
    const bodyH = G.rows.length * rowH;
    // panel backgrounds + gridlines
    const gP = el('g', null, s);
    D.columns.forEach((c, i) => {
      el('rect', { x: colX(i), y: y, width: colW, height: bodyH, fill: G.band || C.panel_background, stroke: C.panel_border, 'stroke-width': 1 }, gP);
      [0, 0.5].forEach(v => el('line', { x1: sxs[i](v), y1: y, x2: sxs[i](v), y2: y + bodyH, stroke: v === 0 ? C.zero_line : C.gridline,
        'stroke-width': v === 0 ? 1.3 : 1 }, gP));
    });
    st.add(gP, 'fade', 0);
    G.rows.forEach((r, ri) => {
      const yc = y + ri * rowH + rowH / 2;
      const lab = el('text', { x: labW - 10, y: yc + fs / 3, 'text-anchor': 'end', 'font-size': fs, fill: C.row_label_text, text: r.label }, s);
      st.add(lab, 'fade', 0);
      const gr = el('g', null, s);
      r.cells.forEach((c, i) => {
        const sx = sxs[i], g = el('g', null, gr);
        el('line', { x1: sx(c.ci[0]), y1: yc, x2: sx(c.ci[1]), y2: yc, stroke: r.color, 'stroke-width': part === 1 ? 2.8 : 2.3, opacity: 0.9 }, g);
        el('circle', { cx: sx(c.est), cy: yc, r: part === 1 ? 6 : 5, fill: r.color, stroke: '#fff', 'stroke-width': 1 }, g);
        if (c.stars) el('text', { x: sx(c.ci[1]) + 4, y: yc + 5, 'font-size': part === 1 ? 16 : 14, 'font-weight': 600, fill: C.star_text, text: c.stars }, g);
        st.add(g, 'growc', 0, { delay: 0.25 + 0.18 * gi + 0.03 * ri + 0.05 * i });
      });
    });
    y += bodyH + groupGap;
  });
  // x tick labels per column
  const gX = el('g', null, s);
  D.columns.forEach((c, i) => [0, 0.5].forEach(v => el('text', { x: sxs[i](v), y: y + 12, 'text-anchor': 'middle', 'font-size': 14, fill: C.tick_label_text, text: v.toFixed(1) }, gX)));
  el('text', { x: labW + (W - labW) / 2, y: y + 32, 'text-anchor': 'middle', 'font-size': 15, fill: P.ink, text: 'Standardized conditional association (95% CI)' }, gX);
  st.add(gX, 'fade', 0);
  return PSD.ctrl(st, 0);
};
