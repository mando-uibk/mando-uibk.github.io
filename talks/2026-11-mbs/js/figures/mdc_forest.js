/* ManyDesignsCarbon, Figure 3 (final Nature Human Behaviour version): forest plots of the 55 designs for
   real-world (observed) and stated support (mdc_forest.json, vector extraction of the final figure).
   Both panels share one scale, as in the paper; inference one-tailed as printed in the paper's legend.
   Everything is shown at once (entry animation only, no clicks). */
PSD.figures['mdc-forest'] = function (mount, opts) {
  const P = opts.palette, el = PSD.el, D = PSD.data.mdc_forest;
  const W = 1168, H = 618, s = PSD.svg(mount, W, H), st = PSD.stepper();
  const C = { dg: '#16341A', lg: '#96C36E', blueF: '#92C4E9', blueS: '#002852', redF: '#D95D5B', redS: '#691815',
    conn: '#E5E5E5', grid: '#DADADA', axis: '#000', ink: '#222' };
  const IV = { 'Information Treatment': '†', 'Behavioral Biases/Reflective Thinking': '‡', 'Strategic Group Interactions': '×', 'Use of AI': '●' };
  const OUT = { 'Donation': '+', 'Political Contact': '■', 'Petition': '▲', 'Market Price': '♦' };
  const sig = c => c === 'p<0.005' ? { fill: C.dg, stroke: C.dg } : c === '0.005<=p<0.05' ? { fill: C.lg, stroke: C.dg } : { fill: '#fff', stroke: C.dg };
  const [PO, PS] = D.panels;

  // geometry (identical px per Cohen's d unit in both panels)
  const margin = 6, labW = 112, gap = 74;
  const u = (W - 2 * margin - 2 * labW - gap) / ((PO.domain[1] - PO.domain[0]) + (PS.domain[1] - PS.domain[0]) + 0.16);
  const pad = 0.04 * u;                                   // small inset so edge markers never touch the frame
  const Lx0 = margin + labW, Lx1 = Lx0 + u * (PO.domain[1] - PO.domain[0]) + 2 * pad;
  const Rx0 = Lx1 + gap, Rx1 = Rx0 + u * (PS.domain[1] - PS.domain[0]) + 2 * pad;
  const sxL = PSD.scale(PO.domain[0], PO.domain[1], Lx0 + pad, Lx1 - pad), sxR = PSD.scale(PS.domain[0], PS.domain[1], Rx0 + pad, Rx1 - pad);
  const rowsTop = 60, rowGap = 7.72, n = 55, rowY = i => rowsTop + i * rowGap;
  const rowsBot = rowY(n - 1), metaY = rowsBot + 18, piBase = metaY + 26, axisY = piBase + 9;
  const fs = 8.4;
  const clampTo = sx => v => Math.max(sx(sx.domain[0]) - pad, Math.min(sx(sx.domain[1]) + pad, sx(v)));

  // frame: gridlines, axes, titles, row brackets
  const fr = el('g', null, s);
  [[sxL, Lx0, Lx1, PO, 'L'], [sxR, Rx0, Rx1, PS, 'R']].forEach(([sx, x0, x1, pn, side]) => {
    for (let t = pn.domain[0]; t <= pn.domain[1] + 1e-9; t += 0.25) {
      el('line', { x1: sx(t), x2: sx(t), y1: rowsTop - 10, y2: axisY, stroke: Math.abs(t) < 1e-9 ? '#9A9A9A' : C.grid, 'stroke-width': Math.abs(t) < 1e-9 ? 1.2 : 0.8 }, fr);
      el('line', { x1: sx(t), x2: sx(t), y1: axisY, y2: axisY + 4, stroke: C.axis, 'stroke-width': 0.9 }, fr);
      el('text', { x: sx(t), y: axisY + 16, 'text-anchor': 'middle', 'font-size': 11.5, fill: C.ink, text: PSD.fmt(t, 2) }, fr);
    }
    el('line', { x1: sx(pn.domain[0]), x2: sx(pn.domain[1]), y1: axisY, y2: axisY, stroke: C.axis, 'stroke-width': 0.9 }, fr);
    el('text', { x: (x0 + x1) / 2, y: axisY + 35, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 600, fill: '#000', text: 'Cohen’s d' }, fr);
    const cx = (x0 + x1) / 2, m = pn.meta;
    el('text', { x: cx, y: 16, 'text-anchor': 'middle', 'font-size': 16.5, 'font-weight': 600, fill: '#000', text: pn.title }, fr);
    PSD.math(fr, cx, 36, [{ b: 'Q' }, ' = ' + m.Q.toFixed(2) + ',  ', { b: 'I', sup: '2' }, ' = ' + m.I2.toFixed(1) + '%,  ', { b: 'τ' }, ' = ' + m.tau.toFixed(3)],
      { 'text-anchor': 'middle', 'font-size': 13, fill: C.ink });
    // row bracket (vertical rule with a tick per design), outside the panel on the label side
    const bx = side === 'L' ? x0 - 4 : x1 + 4, tick = side === 'L' ? -3 : 3;
    el('line', { x1: bx, x2: bx, y1: rowY(0) - 3, y2: rowY(n - 1) + 3, stroke: C.axis, 'stroke-width': 0.7 }, fr);
    for (let i = 0; i < n; i++) el('line', { x1: bx, x2: bx + tick, y1: rowY(i), y2: rowY(i), stroke: C.axis, 'stroke-width': 0.6 }, fr);
  });
  const metaLab = 'Meta-effect (k = 55, N = 19,558)';
  PSD.richText(fr, margin, metaY + 4, [['Meta-effect (', 'b'], ['k', true], [' = 55, ', 'b'], ['N', true], [' = 19,558)', 'b']], { 'font-size': 10.5, fill: '#000' });
  PSD.richText(fr, W - margin, metaY + 4, [['Meta-effect (', 'b'], ['k', true], [' = 55, ', 'b'], ['N', true], [' = 19,558)', 'b']], { 'font-size': 10.5, fill: '#000', 'text-anchor': 'end' });
  el('text', { x: margin, y: piBase - 2, 'font-size': 10.5, fill: '#000', text: 'Pred. Distribution' }, fr);
  el('text', { x: W - margin, y: piBase - 2, 'text-anchor': 'end', 'font-size': 10.5, fill: '#000', text: 'Pred. Distribution' }, fr);
  st.add(fr, 'fade', 0);

  // connectors (underneath the points)
  const obs = PO.rows, sta = PS.rows;                    // already in the paper's top-to-bottom order
  const gC = el('g', null, s), right = {};
  sta.forEach((r, j) => { right[r.tid] = { x: sxR(r.d), y: rowY(j) }; });
  obs.forEach((r, i) => { const q = right[r.tid]; if (q) el('line', { x1: sxL(r.d), y1: rowY(i), x2: q.x, y2: q.y, stroke: C.conn, 'stroke-width': 0.8 }, gC); });
  st.add(gC, 'fade', 0, { delay: 1.0 });

  // rows
  function rows(data, sx, side, d0) {
    const clamp = clampTo(sx);
    data.forEach((r, i) => {
      const y = rowY(i), g = el('g', null, s), sg = sig(r.inference);
      const lab = el('g', null, fr);
      if (side === 'L') {
        el('text', { x: margin + 2, y: y + 3, 'font-size': fs, fill: C.ink, text: IV[r.category] || '' }, lab);
        el('text', { x: margin + 12, y: y + 3, 'font-size': fs, fill: C.ink, text: r.tid }, lab);
        el('text', { x: margin + 48, y: y + 3, 'font-size': fs, fill: C.ink, text: OUT[r.outcome] || '' }, lab);
        el('text', { x: Lx0 - 9, y: y + 3, 'text-anchor': 'end', 'font-size': fs - 1.4, fill: C.ink }, lab).appendChild(document.createTextNode('(n = ' + r.n + ')'));
      } else {
        el('text', { x: Rx1 + 9, y: y + 3, 'font-size': fs - 1.4, fill: C.ink }, lab).appendChild(document.createTextNode('(n = ' + r.n + ')'));
        el('text', { x: W - margin - 58, y: y + 3, 'font-size': fs, fill: C.ink, text: IV[r.category] || '' }, lab);
        el('text', { x: W - margin - 48, y: y + 3, 'font-size': fs, fill: C.ink, text: r.tid }, lab);
      }
      el('line', { x1: clamp(r.ci_low), x2: clamp(r.ci_high), y1: y, y2: y, stroke: C.dg, 'stroke-width': 0.8 }, g);
      if (side === 'L') {
        el('line', { x1: clamp(r.peer_low), x2: clamp(r.peer_high), y1: y, y2: y, stroke: C.redS, 'stroke-width': 0.8 }, g);
        const px = sx(r.peer);
        el('rect', { x: px - 2.9, y: y - 2.9, width: 5.8, height: 5.8, fill: C.redF, stroke: C.redS, 'stroke-width': 0.5 }, g);
        const tx = sx(r.self);
        el('path', { d: `M${tx} ${y - 3.8} L ${tx + 3.6} ${y + 2.6} L ${tx - 3.6} ${y + 2.6} Z`, fill: C.blueF, stroke: C.blueS, 'stroke-width': 0.5 }, g);
      }
      el('circle', { cx: sx(r.d), cy: y, r: 3.3, fill: sg.fill, stroke: sg.stroke, 'stroke-width': 0.8 }, g);
      st.add(g, 'fade', 0, { delay: d0 + (i / n) * 0.5 });
    });
  }
  rows(obs, sxL, 'L', 0.1);
  rows(sta, sxR, 'R', 0.3);

  // meta-effect diamonds + predictive distributions (shaded tails beyond the prediction interval)
  [[sxL, PO.meta, PO.domain], [sxR, PS.meta, PS.domain]].forEach(([sx, m, dom], k) => {
    const g = el('g', null, s), h = 5.5;
    el('path', { d: `M${sx(m.ci_low)} ${metaY} L ${sx(m.d)} ${metaY - h} L ${sx(m.ci_high)} ${metaY} L ${sx(m.d)} ${metaY + h} Z`, fill: C.dg, stroke: C.dg }, g);
    const sd = (m.pi_high - m.pi_low) / (2 * 1.96), amp = 16;
    const yAt = v => piBase - amp * Math.exp(-0.5 * Math.pow((v - m.d) / sd, 2));
    const lo = m.d - 3.2 * sd, hi = m.d + 3.2 * sd;
    let dC = '';
    for (let j = 0; j <= 100; j++) { const v = lo + (hi - lo) * j / 100; dC += (j ? 'L' : 'M') + sx(v).toFixed(1) + ' ' + yAt(v).toFixed(1); }
    [[lo, m.pi_low], [m.pi_high, hi]].forEach(([a, b]) => {
      let dT = '';
      for (let j = 0; j <= 30; j++) { const v = a + (b - a) * j / 30; dT += (j ? 'L' : 'M') + sx(v).toFixed(1) + ' ' + yAt(v).toFixed(1); }
      el('path', { d: dT + `L${sx(b)} ${piBase} L ${sx(a)} ${piBase} Z`, fill: C.dg }, g);
    });
    el('path', { d: dC, fill: 'none', stroke: '#333', 'stroke-width': 0.9 }, g);
    el('line', { x1: sx(lo), x2: sx(hi), y1: piBase, y2: piBase, stroke: '#333', 'stroke-width': 0.8 }, g);
    st.add(g, 'fade', 0, { delay: 0.8 + 0.15 * k });
  });

  // legend: two rows, the paper's four groups
  const lg = el('g', null, s);
  const L1 = H - 22, L2 = H - 5;
  let x = margin + 4;
  const head = (t, yy) => { el('text', { x: x, y: yy, 'font-size': 12, 'font-weight': 600, fill: '#000', text: t }, lg); x += t.length * 6.4 + 12; };
  const item = (draw, label, yy, w) => { draw(x, yy); const t = PSD.richText(lg, x + 12, yy, label, { 'font-size': 12, fill: C.ink }); x += 12 + (w || 70) + 14; return t; };
  head('Inference (one-tailed)', L1);
  item((xx, yy) => el('circle', { cx: xx + 3, cy: yy - 4, r: 3.4, fill: C.dg, stroke: C.dg }, lg), [['p', true], ' < 0.005'], L1, 52);
  item((xx, yy) => el('circle', { cx: xx + 3, cy: yy - 4, r: 3.4, fill: C.lg, stroke: C.dg }, lg), ['0.005 ≤ ', ['p', true], ' < 0.05'], L1, 88);
  item((xx, yy) => el('circle', { cx: xx + 3, cy: yy - 4, r: 3.4, fill: '#fff', stroke: C.dg }, lg), [['p', true], ' > 0.05'], L1, 46);
  item((xx, yy) => el('line', { x1: xx - 4, x2: xx + 10, y1: yy - 4, y2: yy - 4, stroke: '#666', 'stroke-width': 1.2 }, lg), ['95% CI'], L1, 40);
  x += 16;
  head('Assessments', L1);
  item((xx, yy) => el('path', { d: `M${xx + 3} ${yy - 9} L ${xx + 7} ${yy - 1} L ${xx - 1} ${yy - 1} Z`, fill: C.blueF, stroke: C.blueS, 'stroke-width': 0.6 }, lg), ['Self-assessed'], L1, 76);
  item((xx, yy) => el('rect', { x: xx, y: yy - 8, width: 6.5, height: 6.5, fill: C.redF, stroke: C.redS, 'stroke-width': 0.6 }, lg), ['Peer-assessed'], L1, 80);
  x = margin + 4;
  head('Intervention', L2);
  [['†', 'Information Treatment', 130], ['‡', 'Beh. Biases/Refl. Thinking', 150], ['×', 'Str. Group Interactions', 136], ['●', 'Use of AI', 56]].forEach(([g, t, w]) => {
    el('text', { x: x, y: L2, 'font-size': 12, fill: C.ink, text: g }, lg); el('text', { x: x + 12, y: L2, 'font-size': 12, fill: C.ink, text: t }, lg); x += 12 + w + 12;
  });
  x += 16;
  head('Outcome', L2);
  [['+', 'Donation', 52], ['■', 'Political Contact', 96], ['▲', 'Petition', 48], ['♦', 'Market Price', 74]].forEach(([g, t, w]) => {
    el('text', { x: x, y: L2, 'font-size': 12, fill: C.ink, text: g }, lg); el('text', { x: x + 13, y: L2, 'font-size': 12, fill: C.ink, text: t }, lg); x += 13 + w + 12;
  });
  st.add(lg, 'fade', 0);
  return PSD.ctrl(st, 0);
};
