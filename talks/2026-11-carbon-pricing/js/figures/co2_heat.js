/* CO2 Austria - Figures 2 and 3: response distributions as heat-map tables (co2_fig2.json / co2_fig3.json).
   Cell fills, printed percentages and the outlined correct responses are taken from the vector PDF.
   Both figures: one quadrant per step in reading order (0 top left · 1 top right · 2 bottom left · 3 bottom right),
   Study 1 then Study 2 within each quadrant. */
(function () {
  function build(mount, opts, key) {
    const P = opts.palette, el = PSD.el, D = PSD.data[key], C = D.colors;
    const W = 1168, H = 588, s = PSD.svg(mount, W, H), st = PSD.stepper();
    const isK = key === 'co2_fig2';
    const rowH = isK ? 44 : 40, cellW = 150, cellGap = 16, labW = isK ? 240 : 190, panW = labW + 12 + 2 * cellW + cellGap;
    const colX = [(W / 2 - panW) / 2 - 10, W / 2 + (W / 2 - panW) / 2 + 10];
    const panelTop = r => (isK ? 36 : 0) + (r === 0 ? 0 : (isK ? 296 : 300));
    const rowLabelsMap = { 'Redistributed to people/firms': ['Redistributed to', 'people/firms'] };
    /* opts.drop: panel ids left out (combined deck: Q3 of Figure 2). The remaining panels step in reading
       order; a row left with a single panel is centred. */
    const drop = opts.drop || [];
    const panels = D.panels.filter(pn => drop.indexOf(pn.id) < 0);
    panels.forEach((pn, pi) => {
      const quadStep = pi;
      const alone = panels.filter(q => q.grid.row === pn.grid.row).length === 1;
      const gx = alone ? (W - panW) / 2 : colX[pn.grid.col], gy = panelTop(pn.grid.row);
      const cx1 = gx + labW + 12, cx2 = cx1 + cellW + cellGap;
      const gL = el('g', null, s);
      el('text', { x: cx1 + cellW / 2, y: gy + 16, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 500, fill: C.study_header_text, text: 'Study 1' }, gL);
      el('text', { x: cx2 + cellW / 2, y: gy + 16, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 500, fill: C.study_header_text, text: 'Study 2' }, gL);
      const mid = (cx1 + cx2 + cellW) / 2;
      el('text', { x: mid, y: gy + 41, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 600, fill: C.title_text, text: pn.id }, gL);
      if (/CO2/.test(pn.title)) PSD.co2(gL, mid, gy + 61, '', pn.title.replace('CO2', ''), { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 600, fill: C.title_text });
      else el('text', { x: mid, y: gy + 61, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 600, fill: C.title_text, text: pn.title }, gL);
      const y0 = gy + 74;
      pn.rows.forEach((r, i) => {
        const L = rowLabelsMap[r] || [r];
        PSD.mtext(gL, cx1 - 12, y0 + i * rowH + rowH / 2 + 6 - (L.length - 1) * 9, L, { 'text-anchor': 'end', 'font-size': 16, fill: C.row_label_text }, 1.15);
      });
      st.add(gL, 'fade', quadStep);
      const stepFor = () => quadStep;
      [1, 2].forEach(study => {
        const vals = pn['study' + study], fills = pn['fill' + study], x = study === 1 ? cx1 : cx2;
        const dBase = 0.25 + (study - 1) * 0.35;
        if (study === 1 && pn.notMeasured1) {
          const g = el('g', null, s);
          el('rect', { x: x, y: y0 + 3, width: cellW, height: pn.rows.length * rowH - 6, fill: '#f3f4f5', stroke: C.cell_stroke, 'stroke-width': 1.2 }, g);
          el('text', { x: x + cellW / 2, y: y0 + pn.rows.length * rowH / 2 + 5, 'text-anchor': 'middle', 'font-size': 15, fill: P.muted, text: 'Not measured' }, g);
          st.add(g, 'fade', stepFor(1), { delay: dBase });
          return;
        }
        vals.forEach((v, i) => {
          const g = el('g', null, s), yy = y0 + i * rowH + 3;
          const correct = pn['correct' + study] === i;
          el('rect', { x: x, y: yy, width: cellW, height: rowH - 6, fill: fills[i], stroke: correct ? '#20262d' : C.cell_stroke, 'stroke-width': correct ? 2.8 : 1.2 }, g);
          el('text', { x: x + cellW / 2, y: yy + (rowH - 6) / 2 + 6, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 600, fill: C.pct_text, text: v.toFixed(1) + '%' }, g);
          st.add(g, 'pop', stepFor(study), { delay: dBase + 0.06 * i });
        });
      });
    });
    return PSD.ctrl(st, panels.length - 1);
  }
  PSD.figures['co2-fig2'] = (m, o) => build(m, o, 'co2_fig2');
  PSD.figures['co2-fig3'] = (m, o) => build(m, o, 'co2_fig3');
})();
