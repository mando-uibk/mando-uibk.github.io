/* Project 1 - Figure 4: fully covariate controlled Study 1 treatment effects (co2_fig4.json, vector extraction).
   Thick lines 95% CI, thin lines 99.5% CI; circles Tax, diamonds Tax + KB.
   Steps: 0 axes and labels · 1 Support · 2 Knowledge · 3 Perceptions */
PSD.figures['co2-fig4'] = function (mount, opts) {
  const P = opts.palette, el = PSD.el, D = PSD.data.co2_fig4, C = D.colors;
  const W = 1168, H = 588, s = PSD.svg(mount, W, H), st = PSD.stepper();
  const PX0 = 420, PX1 = 1150, sx = PSD.scale(D.xaxis.domain[0], D.xaxis.domain[1], PX0, PX1);
  const rowH = 33, blockGap = 16, top = 6, off = 7.5;
  const nRows = D.blocks.reduce((a, b) => a + b.rows.length, 0);
  const plotBottom = top + nRows * rowH + D.blocks.length * 10 + (D.blocks.length - 1) * blockGap;
  const gAx = el('g', null, s);
  // blocks: panels and labels
  let y = top;
  const blockY = [];
  D.blocks.forEach(B => {
    const h = B.rows.length * rowH + 10;
    blockY.push(y);
    el('rect', { x: PX0, y: y, width: PX1 - PX0, height: h, fill: C.panel_background }, gAx);
    el('rect', { x: 0, y: y, width: 140, height: h, fill: C.block_label_box_fill, stroke: C.block_label_box_stroke, 'stroke-width': 1 }, gAx);
    el('text', { x: 70, y: y + h / 2 + 6, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 600, fill: P.dark, text: B.name }, gAx);
    y += h + blockGap;
  });
  D.xaxis.ticks.forEach(v => {
    el('line', { x1: sx(v), y1: top, x2: sx(v), y2: plotBottom, stroke: C.gridline, 'stroke-width': 1 }, gAx);
    el('text', { x: sx(v), y: plotBottom + 19, 'text-anchor': 'middle', 'font-size': 15, fill: P.muted, text: PSD.fmt(v, 1) }, gAx);
  });
  el('line', { x1: sx(0), y1: top, x2: sx(0), y2: plotBottom, stroke: C.zero_line, 'stroke-width': 1.4, 'stroke-dasharray': '5 5' }, gAx);
  el('text', { x: (PX0 + PX1) / 2, y: plotBottom + 38, 'text-anchor': 'middle', 'font-size': 16, fill: P.ink, text: 'Standardized treatment effect' }, gAx);
  // legend
  const ly = plotBottom + 64;
  el('circle', { cx: PX0 + 180, cy: ly - 5, r: 6, fill: P.dark }, gAx);
  el('text', { x: PX0 + 194, y: ly, 'font-size': 15.5, fill: P.ink, text: 'Tax vs Baseline' }, gAx);
  el('path', { d: `M${PX0 + 380} ${ly - 12} l7 7 l-7 7 l-7 -7 Z`, fill: P.dark }, gAx);
  el('text', { x: PX0 + 396, y: ly, 'font-size': 15.5, fill: P.ink, text: 'Tax + KB vs Baseline' }, gAx);
  st.add(gAx, 'fade', 0);
  // rows
  y = top + 5;
  D.blocks.forEach((B, bi) => {
    B.rows.forEach((r, ri) => {
      const yc = y + ri * rowH + rowH / 2;
      const gl = el('g', null, s);
      if (r.band) {
        el('rect', { x: PX0, y: yc - rowH / 2, width: PX1 - PX0, height: rowH, fill: C.band_effective || '#ecf3f2' }, gl);
        el('line', { x1: 0, y1: yc - rowH / 2, x2: PX1, y2: yc - rowH / 2, stroke: C.band_top_line, 'stroke-width': 1.2 }, gl);
      }
      const label = [r.label];
      PSD.mtext(gl, PX0 - 14, yc + 6 - (label.length - 1) * 9, label, { 'text-anchor': 'end', 'font-size': 17, fill: P.ink }, 1.1);
      st.add(gl, 'fade', 0);
      [['tax', -off], ['taxkb', off]].forEach(([k, dy], j) => {
        const e = r[k], yy = yc + dy, col = r.color;
        const g = el('g', null, s);
        el('line', { x1: sx(e.ci995[0]), y1: yy, x2: sx(e.ci995[1]), y2: yy, stroke: col, 'stroke-width': 1.6, opacity: 0.45 }, g);
        el('line', { x1: sx(e.ci95[0]), y1: yy, x2: sx(e.ci95[1]), y2: yy, stroke: col, 'stroke-width': 3.6, opacity: 0.85 }, g);
        st.add(g, 'growc', bi + 1, { delay: 0.08 * ri + 0.05 * j });
        const pt = k === 'tax' ? el('circle', { cx: sx(e.est), cy: yy, r: 6, fill: col }, s)
          : el('path', { d: `M${sx(e.est)} ${yy - 7.5} l7.5 7.5 l-7.5 7.5 l-7.5 -7.5 Z`, fill: col }, s);
        st.add(pt, 'pop', bi + 1, { delay: 0.08 * ri + 0.05 * j + 0.3 });
        if (e.stars) {
          const t = el('text', { x: sx(e.ci995[1]) + 6, y: yy + 5, 'font-size': 15, 'font-weight': 600, fill: P.dark, text: e.stars }, s);
          st.add(t, 'fade', bi + 1, { delay: 0.08 * ri + 0.6 });
        }
      });
    });
    y += B.rows.length * rowH + 10 + blockGap;
  });
  return PSD.ctrl(st, 3);
};
