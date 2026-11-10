/* Muravyev (2026), "Does Empirical Finance Replicate?": the figure on dmurav.com/replications
   ("Coefficient ratios fall discontinuously when the original sample ends"), redrawn in the deck's style.
   Values: muravyev.json, extracted from the author's vector PDF by build/extract_muravyev.py (exact tick calibration).
   Points: mean yearly coefficient ratio (yearly / published), year 0 as an open circle as in the original;
   grey bands: 95% paper-bootstrap intervals; dashed: the original's two fitted lines; grey line: end of the original sample.
   Shown as a lowkey overlay on slide 32: a white card over a light veil, for one click between the Muravyev bullet and
   the next one. Steps: 0 nothing visible (axes prepared inside the closed card) · 1 card opens, data build up ·
   2 card closes (same click as the next bullet). */
(function () {
  PSD.figures['muravyev-ratio'] = function (mount, opts) {
    const P = opts.palette, el = PSD.el, D = PSD.data.muravyev, st = PSD.stepper();
    const wrap = document.createElement('div');
    wrap.className = 'figmodal';
    const card = document.createElement('div');
    card.className = 'figmodal-card';
    wrap.appendChild(card);
    mount.innerHTML = '';
    mount.appendChild(wrap);

    const W = 1000, H = 430, s = PSD.svg(card, W, H);
    const L = 58, R = 14, T = 40, B = 58;
    const x = PSD.scale(-10.6, 10.6, L, W - R), y = PSD.scale(0, 1.16, H - B, T);
    const BAND = '#D5DBDB', FS = 16;
    const num = v => (v < 0 ? '−' : '') + Math.abs(v);

    /* ---- axes, grid, sample end, titles, provenance (prepared at step 0, inside the closed card) */
    const gAx = el('g', null, s);
    [0.2, 0.4, 0.6, 0.8, 1.0].forEach(v => {
      el('line', { x1: L, y1: y(v), x2: W - R, y2: y(v), stroke: P.grid, 'stroke-width': 1 }, gAx);
    });
    el('line', { x1: x(D.sample_end), y1: T - 6, x2: x(D.sample_end), y2: H - B, stroke: '#A9B3B4', 'stroke-width': 1.5 }, gAx);
    el('line', { x1: L, y1: H - B, x2: W - R, y2: H - B, stroke: P.dark, 'stroke-width': 1.4 }, gAx);
    el('line', { x1: L, y1: T - 6, x2: L, y2: H - B, stroke: P.dark, 'stroke-width': 1.4 }, gAx);
    [0, 0.2, 0.4, 0.6, 0.8, 1.0].forEach(v => {
      el('line', { x1: L - 6, y1: y(v), x2: L, y2: y(v), stroke: P.dark, 'stroke-width': 1.2 }, gAx);
      el('text', { x: L - 10, y: y(v) + 5.5, 'text-anchor': 'end', 'font-size': FS, fill: P.ink, text: v.toFixed(1) }, gAx);
    });
    for (let k = -10; k <= 10; k += 2) {
      el('line', { x1: x(k), y1: H - B, x2: x(k), y2: H - B + 6, stroke: P.dark, 'stroke-width': 1.2 }, gAx);
      el('text', { x: x(k), y: H - B + 24, 'text-anchor': 'middle', 'font-size': FS, fill: P.ink, text: num(k) }, gAx);
    }
    el('text', { x: (L + W - R) / 2, y: H - 6, 'text-anchor': 'middle', 'font-size': FS, fill: P.dark, text: D.xlab }, gAx);
    el('text', { x: L - 46, y: 16, 'font-size': FS, 'font-weight': 500, fill: P.dark, text: D.ylab }, gAx);
    el('text', { x: W - R, y: 16, 'text-anchor': 'end', 'font-size': 14, fill: P.muted,
      text: 'Muravyev (2026), dmurav.com/replications' }, gAx);
    st.add(gAx, 'fade', 0);

    /* ---- the card itself: open for exactly one click */
    st.add(wrap, 'fade', 1, { until: 2 });

    /* ---- data: bands, fitted lines, points, built up as the card opens */
    const gBand = el('g', null, s);
    D.bands.forEach(rows => {
      const up = rows.map(r => `${x(r.year).toFixed(1)},${y(r.hi).toFixed(1)}`);
      const lo = rows.slice().reverse().map(r => `${x(r.year).toFixed(1)},${y(r.lo).toFixed(1)}`);
      el('polygon', { points: up.concat(lo).join(' '), fill: BAND }, gBand);
    });
    const lx = x(3.2), ly = y(1.07);
    el('rect', { x: lx, y: ly - 13, width: 30, height: 16, fill: BAND }, gBand);
    el('text', { x: lx + 40, y: ly, 'font-size': 15, fill: P.ink, text: '95% paper-bootstrap interval' }, gBand);
    st.add(gBand, 'fade', 1, { delay: 0.2 });

    const gFit = el('g', null, s);
    D.fits.forEach(f => {
      el('line', { x1: x(f.x0), y1: y(f.y0), x2: x(f.x1), y2: y(f.y1), stroke: P.ink, 'stroke-width': 2.4,
        'stroke-dasharray': '9 6' }, gFit);
    });
    st.add(gFit, 'fade', 1, { delay: 0.75 });

    D.points.forEach((p, i) => {
      const c = el('circle', { cx: x(p.year), cy: y(p.ratio), r: 6, fill: p.open ? P.card : P.dark,
        stroke: P.dark, 'stroke-width': p.open ? 1.8 : 0 }, s);
      st.add(c, 'pop', 1, { delay: 0.3 + 0.02 * i });
    });
    return PSD.ctrl(st, 2);
  };
})();
