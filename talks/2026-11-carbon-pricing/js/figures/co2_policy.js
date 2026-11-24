/* CO2 Austria - policy timeline and study design (values: co2_policy.json, manuscript pp. 2-3, 10-14) */

/* Carbon price path with Klimabonus lane, then the abolition, then the two studies. The time axis starts in
   October 2022, when the carbon price was introduced, so the price path starts at the y axis.
   Steps: 0 price path, Klimabonus 2022-2024, EU-ETS II from 2028 · 1 abolition from 2025 · 2 Study 1 · 3 Study 2 */
PSD.figures['co2-timeline'] = function (mount, opts) {
  const P = opts.palette, el = PSD.el, D = PSD.data.co2_policy;
  const W = 1168, H = 372, s = PSD.svg(mount, W, H), st = PSD.stepper();
  const BLUE = '#3D6B91', KB = '#4E9A8E';
  const x0 = 150, x1 = 1120, yB = 196, yT = 40;
  const T0 = 2022.75, sx = PSD.scale(T0, 2028.6, x0, x1), sy = PSD.scale(0, 60, yB, yT);

  const gAx = el('g', null, s);
  [0, 20, 40, 60].forEach(v => {
    el('line', { x1: x0, y1: sy(v), x2: x1, y2: sy(v), stroke: P.grid, 'stroke-width': 1 }, gAx);
    el('text', { x: x0 - 12, y: sy(v) + 6, 'text-anchor': 'end', 'font-size': 16, fill: P.muted, text: '€' + v }, gAx);
  });
  PSD.co2(gAx, x0, 18, 'Carbon price per tonne of ', '', { 'font-size': 16, 'font-weight': 500, fill: P.dark });
  for (let y = 2022; y <= 2028; y++) {
    const a = Math.max(y, T0);
    if (y > 2022) el('line', { x1: sx(y), y1: yB, x2: sx(y), y2: yB + 7, stroke: P.dark, 'stroke-width': 1.5 }, gAx);
    el('text', { x: sx((a + y + 1) / 2), y: yB + 25, 'text-anchor': 'middle', 'font-size': y === 2022 ? 14 : 16, fill: P.muted, text: String(y) }, gAx);
  }
  el('line', { x1: x0, y1: yB, x2: x1, y2: yB, stroke: P.dark, 'stroke-width': 2 }, gAx);
  st.add(gAx, 'fade', 0);

  let d = '';
  D.price.forEach((p, i) => { d += (i === 0 ? `M${sx(p.from)} ${sy(p.eur)}` : `L${sx(p.from)} ${sy(p.eur)}`) + `L${sx(p.to)} ${sy(p.eur)}`; });
  const area = el('path', { d: d + `L${sx(2028)} ${yB} L${sx(T0)} ${yB} Z`, fill: BLUE, opacity: 0.08 }, s);
  st.add(area, 'fade', 0, { delay: 0.8 });
  const path = el('path', { d: d, fill: 'none', stroke: BLUE, 'stroke-width': 4, 'stroke-linejoin': 'round', pathLength: 1 }, s);
  st.add(path, 'draw', 0, { delay: 0.1 });
  [['€30', 2022.875, 30], ['€32.50', 2023.5, 32.5], ['€45', 2024.5, 45], ['€55', 2026.5, 55]].forEach((l, k) => {
    const t = el('text', { x: sx(l[1]), y: sy(l[2]) - 11, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 600, fill: BLUE, text: l[0] }, s);
    st.add(t, 'up', 0, { delay: 0.4 + 0.18 * k });
  });

  const yL = 230, hL = 38;
  const lab = el('text', { x: x0 - 12, y: yL + 25, 'text-anchor': 'end', 'font-size': 16, 'font-weight': 600, fill: P.dark, text: 'Klimabonus' }, s);
  st.add(lab, 'fade', 0, { delay: 0.6 });
  D.klimabonusYears.forEach((y, k) => {
    const g = el('g', null, s);
    const a = Math.max(y, T0);
    el('rect', { x: sx(a) + 3, y: yL, width: sx(y + 1) - sx(a) - 6, height: hL, rx: 5, fill: KB }, g);
    el('text', { x: sx((a + y + 1) / 2), y: yL + 25, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 600, fill: '#fff', text: 'paid' }, g);
    st.add(g, 'growx', 0, { delay: 0.7 + 0.15 * k });
  });
  const gAb = el('g', null, s);
  el('rect', { x: sx(2025) + 3, y: yL, width: sx(2028) - sx(2025) - 6, height: hL, rx: 5, fill: '#fff', stroke: '#B9C3C4', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, gAb);
  el('text', { x: sx(2026.5), y: yL + 25, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 600, fill: P.muted, text: 'abolished from 2025' }, gAb);
  st.add(gAb, 'growx', 1);
  const gEts = el('g', null, s);
  el('line', { x1: sx(2028), y1: yT - 8, x2: sx(2028), y2: yB, stroke: P.accent, 'stroke-width': 2.5, 'stroke-dasharray': '7 6' }, gEts);
  el('text', { x: sx(2028) + 8, y: yT + 12, 'font-size': 16, 'font-weight': 600, fill: P.accent, text: 'EU-ETS II' }, gEts);
  el('text', { x: sx(2028) + 8, y: yT + 32, 'font-size': 14, fill: P.accent, text: 'from 2028' }, gEts);
  st.add(gEts, 'fade', 0, { delay: 1.3 });

  // studies: dashed time marker through the chart, marker on a study lane, callout card with the rationale
  const yS = 296;
  const cards = [
    { S: D.studies[0], when: 'November 2024', why: ['Effect of information on support'], side: -1, w: 360 },
    { S: D.studies[1], when: 'February–March 2026', why: ['Baseline knowledge and support before', 'and after the abolition of the Klimabonus'], side: 1, w: 372 }
  ];
  cards.forEach((c, k) => {
    const x = sx(c.S.t);
    const gl = el('g', null, s);
    el('line', { x1: x, y1: yT - 4, x2: x, y2: yS, stroke: P.dark, 'stroke-width': 1.6, 'stroke-dasharray': '3 4', opacity: 0.75 }, gl);
    st.add(gl, 'fade', 2 + k);
    const g = el('g', null, s);
    const cx0 = c.side < 0 ? x - 18 - c.w : x + 18, cy0 = yS - 2, ch = c.why.length > 1 ? 74 : 56;
    el('line', { x1: x, y1: yS + 20, x2: c.side < 0 ? cx0 + c.w : cx0, y2: yS + 20, stroke: P.dark, 'stroke-width': 2 }, g);
    el('rect', { x: cx0, y: cy0, width: c.w, height: ch, rx: 8, fill: '#fff', stroke: BLUE, 'stroke-width': 2 }, g);
    el('rect', { x: cx0, y: cy0, width: 7, height: ch, rx: 3, fill: BLUE }, g);
    const t = el('text', { x: cx0 + 20, y: cy0 + 23, 'font-size': 17, fill: P.dark }, g);
    el('tspan', { 'font-weight': 600, text: c.S.label }, t);
    el('tspan', { dx: 8, fill: P.muted, 'font-size': 15, text: c.when + ' · n = ' + c.S.n.toLocaleString('en-US') }, t);
    PSD.mtext(g, cx0 + 20, cy0 + 46, c.why, { 'font-size': 16, fill: P.ink }, 1.25);
    el('circle', { cx: x, cy: yS + 20, r: 9, fill: P.dark, stroke: '#fff', 'stroke-width': 2.5 }, g);
    st.add(g, 'pop', 2 + k, { delay: 0.25 });
  });
  return PSD.ctrl(st, 3);
};

/* Study design. Steps: 0 Study 1 · 1 three arms · 2-4 information provided in each condition (overlay, one condition per click)
   · 5 abolition + Study 2 */
PSD.figures['co2-design'] = function (mount, opts) {
  const P = opts.palette, el = PSD.el, D = PSD.data.co2_policy;
  const W = 1168, H = 470, s = PSD.svg(mount, W, H), st = PSD.stepper();
  const BLUE = '#3D6B91', LB = '#8DB1C9', TEAL = '#4E9A8E';

  function studyBox(y, h, S, when, lines, panel) {
    const g = el('g', null, s);
    el('rect', { x: 0, y: y, width: 260, height: h, rx: 8, fill: BLUE }, g);
    el('text', { x: 20, y: y + 36, 'font-size': 25, 'font-weight': 600, fill: '#fff', text: S.label }, g);
    el('text', { x: 20, y: y + 62, 'font-size': 17, fill: '#E7EEF4', text: when }, g);
    el('text', { x: 20, y: y + 92, 'font-size': 21, 'font-weight': 500, fill: '#fff', text: 'n = ' + S.n.toLocaleString('en-US') }, g);
    PSD.mtext(g, 20, y + 118, lines, { 'font-size': 15.5, fill: '#E7EEF4' }, 1.25);
    el('text', { x: 20, y: y + h - 14, 'font-size': 15.5, 'font-weight': 600, fill: '#fff', text: 'Panel: ' + panel }, g);
    return g;
  }
  const S1 = D.studies[0], S2 = D.studies[1];
  st.add(studyBox(8, 262, S1, 'November 2024', ['Three-arm randomized', 'survey experiment;', 'representative quotas'], 'Bilendi & Respondi'), 'left', 0);

  const armY = [0, 94, 188], armH = 84, ax = 330;
  S1.arms.forEach((A, k) => {
    const cy = armY[k] + armH / 2;
    const con = el('path', { d: `M260 139 C 296 139, 296 ${cy}, ${ax} ${cy}`, fill: 'none', stroke: '#9FB4C3', 'stroke-width': 2.5, pathLength: 1 }, s);
    st.add(con, 'draw', 1, { delay: 0.12 * k });
    const g = el('g', null, s);
    el('rect', { x: ax, y: armY[k], width: W - ax, height: armH, rx: 8, fill: '#fff', stroke: k === 0 ? '#C9D3DA' : LB, 'stroke-width': 2 }, g);
    el('rect', { x: ax, y: armY[k], width: 8, height: armH, rx: 3, fill: k === 0 ? '#B9C6CF' : BLUE }, g);
    el('text', { x: ax + 28, y: armY[k] + 37, 'font-size': 22, 'font-weight': 600, fill: P.dark, text: A.label }, g);
    el('text', { x: ax + 28, y: armY[k] + 63, 'font-size': 16, fill: P.muted, text: 'n = ' + A.n }, g);
    const lines = k === 2 ? ['In addition, how the Klimabonus is funded through carbon tax revenues', 'and the associated distributional effects'] : [A.text];
    PSD.mtext(g, ax + 190, armY[k] + (lines.length > 1 ? 35 : 48), lines, { 'font-size': 18.5, fill: P.ink }, 1.3);
    st.add(g, 'up', 1, { delay: 0.2 + 0.12 * k });
  });

  const gDiv = el('g', null, s);
  el('line', { x1: 0, y1: 300, x2: W, y2: 300, stroke: '#B9C3C4', 'stroke-width': 2, 'stroke-dasharray': '8 7' }, gDiv);
  el('rect', { x: W / 2 - 250, y: 286, width: 500, height: 28, rx: 14, fill: P.bg }, gDiv);
  el('text', { x: W / 2, y: 306, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 500, fill: P.muted, text: '2025: Klimabonus abolished, carbon tax remains in place' }, gDiv);
  st.add(gDiv, 'fade', 5);
  st.add(studyBox(318, 150, S2, 'February–March 2026', ['Cross-sectional follow-up'], 'Norstat'), 'left', 5, { delay: 0.15 });
  const con2 = el('path', { d: `M260 398 L ${ax} 398`, fill: 'none', stroke: '#9FB4C3', 'stroke-width': 2.5, pathLength: 1 }, s);
  st.add(con2, 'draw', 5, { delay: 0.35 });
  const g2 = el('g', null, s);
  el('rect', { x: ax, y: 340, width: W - ax, height: 116, rx: 8, fill: '#fff', stroke: LB, 'stroke-width': 2 }, g2);
  el('rect', { x: ax, y: 340, width: 8, height: 116, rx: 3, fill: BLUE }, g2);
  PSD.mtext(g2, ax + 28, 377, ['Study 1 baseline protocol without an information treatment, after the', 'Klimabonus had been abolished; in addition, whether residents are aware', 'that the Klimabonus is no longer being distributed'], { 'font-size': 18.5, fill: P.ink }, 1.32);
  st.add(g2, 'up', 5, { delay: 0.5 });

  // overlay: information provided in each condition, one condition per click (steps 2-4)
  const T = PSD.data.co2_treatments;
  const gM = el('g', null, s);
  el('rect', { x: -40, y: -20, width: W + 80, height: H + 40, fill: '#FAFAFA', opacity: 0.88 }, gM);
  const mx = 70, my = 4, mw = W - 140, mh = 462;
  el('rect', { x: mx, y: my, width: mw, height: mh, rx: 12, fill: '#fff', stroke: '#C9D3DA', 'stroke-width': 1.5, style: 'filter:drop-shadow(0 10px 24px rgba(35,55,59,.18))' }, gM);
  el('text', { x: mx + 28, y: my + 40, 'font-size': 21, 'font-weight': 600, fill: P.dark, text: 'Information provided in each condition' }, gM);
  const tabW = 150, tabX = k => mx + mw - 28 - (3 - k) * (tabW + 10);
  T.conditions.forEach((c, k) => {
    el('rect', { x: tabX(k), y: my + 16, width: tabW, height: 38, rx: 19, fill: '#fff', stroke: '#C9D3DA', 'stroke-width': 1.5 }, gM);
    el('text', { x: tabX(k) + tabW / 2, y: my + 41, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 600, fill: P.muted, text: c.label }, gM);
  });
  el('line', { x1: mx + 20, y1: my + 70, x2: mx + mw - 20, y2: my + 70, stroke: '#E3E7EA', 'stroke-width': 1.5 }, gM);
  st.add(gM, 'fade', 2, { until: 5 });
  T.conditions.forEach((c, k) => {
    const gt = el('g', null, s);
    el('rect', { x: tabX(k), y: my + 16, width: tabW, height: 38, rx: 19, fill: BLUE }, gt);
    el('text', { x: tabX(k) + tabW / 2, y: my + 41, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 600, fill: '#fff', text: c.label }, gt);
    const fo = el('foreignObject', { x: mx + 24, y: my + 80, width: mw - 48, height: mh - 92 }, gt);
    const X = 'http://www.w3.org/1999/xhtml', mk = (tag, css, html) => { const e = document.createElementNS(X, tag); if (css) e.setAttribute('style', css); if (html != null) e.innerHTML = html; return e; };
    const div = mk('div', "font-family:'Fira Sans',sans-serif;color:#39494d;font-weight:300;height:100%;display:flex;flex-direction:column;gap:8px");
    if (c.lead) div.appendChild(mk('div', 'font-size:14px;font-style:italic;color:#70807f', c.lead));
    const grid = mk('div', 'display:grid;gap:12px;flex:1;min-height:0;grid-template-columns:' + (c.grid ? c.grid.columns : (c.sections.length === 1 ? '1fr' : 'repeat(' + c.sections.length + ',1fr)')) + (c.grid ? ';grid-template-rows:' + c.grid.rows : ''));
    c.sections.forEach(sec => {
      const row = sec.wide || sec.dir === 'row';
      const card = mk('div', 'background:#F6F8F9;border-radius:8px;padding:10px 14px;display:flex;flex-direction:' + (row ? 'row' : 'column') + ';gap:12px;min-height:0;overflow:hidden' + (sec.area ? ';grid-area:' + sec.area : ''));
      const txt = mk('div', 'flex:1;min-width:0');
      if (sec.h) txt.appendChild(mk('div', 'font-size:16.5px;font-weight:600;color:#23373B;margin-bottom:4px', sec.h));
      txt.appendChild(mk('div', 'font-size:' + (sec.wide ? '18px' : '14.5px') + ';line-height:1.42', sec.html));
      if (sec.img) {
        const im = mk('img', 'border-radius:4px;object-fit:contain;' + (sec.wide ? 'width:40%;align-self:center' : (row ? 'width:38%;align-self:center' : 'max-height:110px;max-width:100%;align-self:center')));
        im.setAttribute('src', 'assets/treatments/' + sec.img);
        if (sec.wide) { card.appendChild(txt); card.appendChild(im); } else { card.appendChild(im); card.appendChild(txt); }
      } else card.appendChild(txt);
      grid.appendChild(card);
    });
    div.appendChild(grid);
    fo.appendChild(div);
    st.add(gt, 'fade', 2 + k, { until: 3 + k });
  });
  return PSD.ctrl(st, 5);
};
