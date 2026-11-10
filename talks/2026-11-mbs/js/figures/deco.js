/* Title-slide decoration: three overlapping normal curves in the three project colours
   (abstract ornament, carries no data). Plays once on entry. */
PSD.figures['title-deco'] = function (mount, opts) {
  const el = PSD.el, s = PSD.svg(mount, 640, 380), st = PSD.stepper();
  const base = 330;
  const curves = [
    { mu: 230, sd: 78, amp: 150, col: '#3D6B91' },
    { mu: 330, sd: 58, amp: 215, col: '#7470A8' },
    { mu: 430, sd: 92, amp: 120, col: '#4E9A8E' }
  ];
  const axis = el('line', { x1: 40, y1: base, x2: 620, y2: base, stroke: '#C9D1D2', 'stroke-width': 2 }, s);
  st.add(axis, 'growx', 0, { delay: 0 });
  curves.forEach((c, k) => {
    let d = '';
    for (let x = 40; x <= 620; x += 4) {
      const y = base - c.amp * Math.exp(-0.5 * Math.pow((x - c.mu) / c.sd, 2));
      d += (x === 40 ? 'M' : 'L') + x + ' ' + y.toFixed(1);
    }
    const fill = el('path', { d: d + `L620 ${base} L40 ${base} Z`, fill: c.col, opacity: 0.09 }, s);
    const g = el('g', null, s);
    const line = el('path', { d: d, fill: 'none', stroke: c.col, 'stroke-width': 3, pathLength: 1, opacity: 0.85 }, g);
    st.add(line, 'draw', 0, { delay: 0.25 + 0.35 * k });
    st.add(fill, 'fade', 0, { delay: 0.9 + 0.35 * k });
    const dot = el('circle', { cx: c.mu, cy: base, r: 7, fill: c.col }, s);
    st.add(dot, 'pop', 0, { delay: 1.2 + 0.35 * k });
    const vl = el('line', { x1: c.mu, y1: base, x2: c.mu, y2: base - c.amp, stroke: c.col, 'stroke-width': 1.5,
      'stroke-dasharray': '4 5', opacity: 0.6 }, s);
    st.add(vl, 'fade', 0, { delay: 1.4 + 0.35 * k });
  });
  return PSD.ctrl(st, 0);
};
