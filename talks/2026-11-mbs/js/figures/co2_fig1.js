/* Project 1 - Figure 1: Support for the carbon tax in Study 1 and Study 2 (co2_fig1.json, vector extraction).
   One common bar scale as in the paper: EUR and % 1:1, five-point means as 25 x (mean - 1).
   Steps: 0 labels · 1 Study 1 bars · 2 Study 2 bars (hatched) */
PSD.figures['co2-fig1'] = function (mount, opts) {
  const P = opts.palette, el = PSD.el, D = PSD.data.co2_fig1, C = D.colors;
  const W = 1168, H = 588, s = PSD.svg(mount, W, H), st = PSD.stepper();
  const X0 = 430, K = 11.2, bh = 44;
  const units = (o, v) => o.unit === 'EUR' || o.unit === '%' ? v : 25 * (v - 1);
  const xv = (o, v) => X0 + K * units(o, v);
  const hatchRW = PSD.hatch(s, 'h1rw', C.study2_realworld_hatch_stripe, C.study2_realworld_bar_base, 45, 9, 3.2);
  const hatchSR = PSD.hatch(s, 'h1sr', C.study2_selfreported_hatch_stripe, C.study2_selfreported_bar_base, 45, 9, 3.2);
  const labels = {
    donations: ['Donations'], letters: ['Letter signatures'],
    tax: ['Support for a CO₂ tax in Austria'], social: ['Support for CO₂ tax increase', 'to social price (€110 per tonne)']
  };
  let y = 20;
  D.groups.forEach((G, gi) => {
    const rw = gi === 0;
    const head = el('text', { x: X0, y: y + 14, 'font-size': 17, 'font-weight': 600,
      fill: rw ? C.heading_realworld : C.heading_selfreported, text: G.label }, s);
    st.add(head, 'fade', 0);
    y += 30;
    G.outcomes.forEach((o, oi) => {
      const key = o.key in labels ? o.key : (o.label.indexOf('social') >= 0 ? 'social' : (o.label.indexOf('Support') >= 0 ? 'tax' : (o.label.indexOf('Letter') >= 0 ? 'letters' : 'donations')));
      const L = labels[key] || [o.label];
      PSD.mtext(s, X0 - 84, y + bh - (L.length - 1) * 11 + 6, L, { 'text-anchor': 'end', 'font-size': 19, fill: C.outcome_label }, 1.2);
      o.bars.forEach((b, bi) => {
        const yy = y + bi * bh;
        el('text', { x: X0 - 12, y: yy + bh / 2 + 5, 'text-anchor': 'end', 'font-size': 15, fill: C.study_label,
          text: 'Study ' + b.study }, s);
        const g = el('g', null, s);
        const fill = b.study === 1 ? (rw ? C.study1_realworld_bar : C.study1_selfreported_bar) : (rw ? hatchRW : hatchSR);
        const bar = el('rect', { x: X0, y: yy, width: xv(o, b.value_drawn || b.value) - X0, height: bh,
          fill: fill, stroke: '#1f2a30', 'stroke-width': 0.9 }, g);
        st.add(bar, 'growx', b.study, { delay: 0.15 * (gi * 2 + oi) });
        const gci = el('g', null, s);
        PSD.errbarH(gci, yy + bh / 2, xv(o, b.ci[0]), xv(o, b.ci[1]), { cap: 5, width: 2, color: '#111' });
        const unitTxt = o.unit === 'EUR' ? ' EUR' : (o.unit === '%' ? '%' : '');
        const txt = (o.unit === 'EUR' ? b.value.toFixed(1) : (o.unit === '%' ? b.value.toFixed(1) : b.value.toFixed(2))) + unitTxt;
        const t = el('text', { x: xv(o, b.ci[1]) + 12, y: yy + bh / 2 + 6, 'font-size': 17, fill: '#111' }, gci);
        el('tspan', { 'font-weight': 600, text: txt }, t);
        el('tspan', { dx: 8, fill: P.muted, 'font-size': 14, text: 'n = ' + b.n + (o.unit === 'EUR' || o.unit === '%' ? '' : ' (mean 1–5)') }, t);
        st.add(gci, 'fade', b.study, { delay: 0.15 * (gi * 2 + oi) + 0.45 });
      });
      y += 2 * bh + 34;
    });
    y += 14;
  });
  return PSD.ctrl(st, 2);
};
