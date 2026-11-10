/* Project 3 - ESS replication project figures (values: ess.json from PAP1/PAP2) */
(function () {
  const TEAL = '#4E9A8E', TEAL_D = '#2F6F66', TEAL_L = '#D6EBE7', ORANGE_BG = '#FCEBD9', ORANGE = '#E2A04F',
    GREY_BG = '#F1F2F2', GREY = '#8C9596', BLUE_BG = '#E3EEF3', BLUE = '#5B93AE';
  const fmt = n => n.toLocaleString('en-US');

  /* Initial feasibility screen 2003-2014. Steps: bar k appears at step k (0..3) */
  PSD.figures['ess-feas'] = function (mount, opts) {
    const P = opts.palette, el = PSD.el, D = PSD.data.ess.feasibility;
    const W = 770, H = 588, s = PSD.svg(mount, W, H), st = PSD.stepper();
    const x0 = 20, x1 = 740, sx = PSD.scale(0, 1120, 0, x1 - x0);
    const cols = ['#2F6F66', '#3F857A', '#4E9A8E', '#6FB2A6'];
    D.steps.forEach((b, k) => {
      const y = 70 + k * 122, g = el('g', null, s);
      el('text', { x: x0, y: y - 12, 'font-size': 19, fill: P.ink, text: b.label }, g);
      const bar = el('rect', { x: x0, y: y, width: sx(b.n), height: 54, rx: 5, fill: cols[k] }, s);
      st.add(bar, 'growx', k, { delay: 0.1 });
      const t = el('text', { x: x0 + sx(b.n) - 14, y: y + 37, 'text-anchor': 'end', 'font-size': 26, 'font-weight': 600,
        fill: '#fff', text: fmt(b.n) }, s);
      st.add(t, 'fade', k, { delay: 0.45 });
      st.add(g, 'fade', k);
    });
    return PSD.ctrl(st, 3);
  };

  /* PRISMA flow, landscape. Steps 0..4 = columns */
  PSD.figures['ess-prisma'] = function (mount, opts) {
    const P = opts.palette, el = PSD.el, D = PSD.data.ess.prisma;
    const W = 1168, H = 604, s = PSD.svg(mount, W, H), st = PSD.stepper();
    const cw = 224, gap = 12, cx = k => k * (cw + gap);
    const mainY = 46, mainH = 112;
    const mains = [D.identified, D.screened, D.acquisition, D.assessed, D.included];
    const mainLines = [['Substantive publications', 'listed in the ESS', 'bibliography'], ['Records screened'],
      ['Studies handed over', 'to acquisition'], ['Full texts retrieved', 'and assessed'], ['Studies included,', 'handed to Stage 1']];
    // phase bands
    const bands = [['Identification', 0, 0, 0], ['Screening', 1, 3, 1], ['Included', 4, 4, 4]];
    bands.forEach(b => {
      const g = el('g', null, s);
      const xa = cx(b[1]), xb = cx(b[2]) + cw;
      el('rect', { x: xa, y: 0, width: xb - xa, height: 30, rx: 4, fill: '#E9ECEC' }, g);
      el('text', { x: (xa + xb) / 2, y: 21, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 500, fill: P.ink, text: b[0] }, g);
      st.add(g, 'fade', b[3]);
    });
    function box(x, y, w, h, fill, stroke, dash) {
      return { x, y, w, h, node: null, fill, stroke, dash };
    }
    function listBox(g, x, y, w, title, items, total, fill, stroke, dashed) {
      const lh = 19, wrapAt = 26;
      const rows = [];
      items.forEach(it => {
        const words = it[0].split(' '); let line = '', lines = [];
        words.forEach(wd => { if ((line + ' ' + wd).trim().length > wrapAt) { lines.push(line.trim()); line = wd; } else line += ' ' + wd; });
        lines.push(line.trim());
        rows.push({ lines, n: it[1] });
      });
      const nLines = rows.reduce((a, r) => a + r.lines.length, 0);
      const h = 38 + nLines * lh + (total != null ? 32 : 6) + 6 + ((Array.isArray(title) ? title.length : 1) - 1) * 18;
      el('rect', { x: x, y: y, width: w, height: h, rx: 4, fill: fill, stroke: stroke, 'stroke-width': 2,
        'stroke-dasharray': dashed ? '7 5' : null }, g);
      const tl = Array.isArray(title) ? title : [title];
      tl.forEach((t, i) => el('text', { x: x + 12, y: y + 25 + i * 18, 'font-size': 15, 'font-weight': 600, fill: P.dark, text: t }, g));
      let yy = y + 48 + (tl.length - 1) * 18;
      rows.forEach(r => {
        r.lines.forEach((ln, i) => {
          el('text', { x: x + 16, y: yy + i * lh, 'font-size': 14, fill: P.ink, text: ln }, g);
        });
        el('text', { x: x + w - 12, y: yy + (r.lines.length - 1) * lh, 'text-anchor': 'end', 'font-size': 14,
          'font-style': 'italic', fill: P.muted, text: fmt(r.n) }, g);
        yy += r.lines.length * lh;
      });
      if (total != null) {
        el('line', { x1: x + 12, y1: yy - 8, x2: x + w - 12, y2: yy - 8, stroke: stroke, 'stroke-width': 1.2 }, g);
        el('text', { x: x + 16, y: yy + 14, 'font-size': 14, 'font-weight': 600, fill: P.dark, text: 'Total' }, g);
        el('text', { x: x + w - 12, y: yy + 14, 'text-anchor': 'end', 'font-size': 14, 'font-weight': 600, 'font-style': 'italic',
          fill: P.dark, text: fmt(total) }, g);
      }
      return h;
    }
    function simpleBox(g, x, y, w, title, n) {
      el('rect', { x: x, y: y, width: w, height: 64, rx: 4, fill: ORANGE_BG, stroke: ORANGE, 'stroke-width': 2 }, g);
      el('text', { x: x + w / 2, y: y + 26, 'text-anchor': 'middle', 'font-size': 15, fill: P.dark, text: title }, g);
      el('text', { x: x + w / 2, y: y + 49, 'text-anchor': 'middle', 'font-size': 14, 'font-style': 'italic', fill: P.muted, text: 'n = ' + fmt(n) }, g);
      return 64;
    }
    const exY = mainY + mainH + 46;
    mains.forEach((m, k) => {
      const g = el('g', null, s), x = cx(k);
      el('rect', { x: x, y: mainY, width: cw, height: mainH, rx: 4, fill: k === 4 ? TEAL_L : GREY_BG,
        stroke: k === 4 ? TEAL : GREY, 'stroke-width': 2 }, g);
      const L = mainLines[k];
      L.forEach((ln, i) => el('text', { x: x + cw / 2, y: mainY + 30 + i * 21 + (3 - L.length) * 10, 'text-anchor': 'middle',
        'font-size': 16, 'font-weight': 600, fill: P.dark, text: ln }, g));
      el('text', { x: x + cw / 2, y: mainY + mainH - 14, 'text-anchor': 'middle', 'font-size': 19, 'font-style': 'italic',
        'font-weight': 500, fill: k === 4 ? TEAL_D : P.dark, text: 'n = ' + fmt(m.n) }, g);
      // vertical connector to exclusion box(es)
      el('line', { x1: x + cw / 2, y1: mainY + mainH, x2: x + cw / 2, y2: exY - 4, stroke: GREY, 'stroke-width': 2,
        'stroke-dasharray': k === 4 ? '6 5' : null, 'marker-end': 'url(#arr)' }, g);
      // horizontal arrow to next main box
      if (k < 4) el('line', { x1: x + cw, y1: mainY + mainH / 2, x2: x + cw + gap - 1, y2: mainY + mainH / 2, stroke: GREY,
        'stroke-width': 2, 'marker-end': 'url(#arr)' }, g);
      const ge = el('g', null, g);
      if (k === 0) listBox(ge, x, exY, cw, ['Records removed', 'before screening'], D.removedBefore.items, D.removedBefore.total, ORANGE_BG, ORANGE);
      if (k === 1) simpleBox(ge, x, exY, cw, D.excludedIndex.label, D.excludedIndex.n);
      if (k === 2) {
        simpleBox(ge, x, exY, cw, D.notRetrievable.label, D.notRetrievable.n);
        listBox(ge, x, exY + 78, cw, D.removedWhile.label, D.removedWhile.items, D.removedWhile.total, ORANGE_BG, ORANGE);
      }
      if (k === 3) listBox(ge, x, exY, cw, D.removedAfter.label, D.removedAfter.items, D.removedAfter.total, ORANGE_BG, ORANGE);
      if (k === 4) listBox(ge, x, exY, cw, ['How the full text', 'was obtained'], D.obtained.items, null, BLUE_BG, BLUE, true);
      st.add(g, 'up', k, { delay: 0.05 });
    });
    const defs = el('defs', null, s);
    const mk = el('marker', { id: 'arr', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 0 L10 5 L0 10 Z', fill: GREY }, mk);
    return PSD.ctrl(st, 4);
  };

  /* AI-assisted identification of key results. Steps: 0 PDF+agent · 1 card · 2 verification · 3 eligibility · 4 outcomes */
  PSD.figures['ess-pipeline'] = function (mount, opts) {
    const P = opts.palette, el = PSD.el;
    const W = 1168, H = 588, s = PSD.svg(mount, W, H), st = PSD.stepper();
    const defs = el('defs', null, s);
    const mk = el('marker', { id: 'arrp', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 0 L10 5 L0 10 Z', fill: '#8FA3A6' }, mk);
    const rowY = 70, bh = 150;
    const boxes = [
      { x: 0, w: 150, title: ['Article', 'PDF'], body: ['and its own', 'supplementary', 'material'], fill: '#fff', stroke: '#C9D1D2', step: 0 },
      { x: 196, w: 230, title: ['AI agent'], body: ['Claude Opus 5.5,', 'one article per agent,', 'fresh context,', 'no human intervention'], fill: TEAL_L, stroke: TEAL, step: 0 },
      { x: 472, w: 230, title: ['Specification card'], body: ['key result and published', 'estimates, specification,', 'reading of each criterion;', 'quoted verbatim or', 'marked as inference'], fill: '#fff', stroke: TEAL, step: 1 },
      { x: 748, w: 190, title: ['Verification', 'script'], body: ['checks the card', 'against the article', 'and reference files'], fill: '#EEF3F8', stroke: BLUE, step: 2 },
      { x: 984, w: 184, title: ['Eligibility', 'script'], body: ['recomputes each', 'criterion from', 'the facts on the', 'card'], fill: '#EEF3F8', stroke: BLUE, step: 3 }
    ];
    boxes.forEach((b, k) => {
      const g = el('g', null, s);
      el('rect', { x: b.x, y: rowY, width: b.w, height: bh + (k === 2 ? 20 : 0), rx: 8, fill: b.fill, stroke: b.stroke, 'stroke-width': 2.2 }, g);
      b.title.forEach((t, i) => el('text', { x: b.x + b.w / 2, y: rowY + 30 + i * 22, 'text-anchor': 'middle', 'font-size': 19,
        'font-weight': 600, fill: P.dark, text: t }, g));
      const by = rowY + 30 + b.title.length * 22 + 6;
      b.body.forEach((t, i) => el('text', { x: b.x + b.w / 2, y: by + i * 19, 'text-anchor': 'middle', 'font-size': 15,
        fill: P.ink, text: t }, g));
      st.add(g, 'pop', b.step, { delay: k === 1 ? 0.25 : 0.05 });
      if (k > 0) {
        const a = el('line', { x1: boxes[k - 1].x + boxes[k - 1].w + 2, y1: rowY + bh / 2, x2: b.x - 4, y2: rowY + bh / 2,
          stroke: '#8FA3A6', 'stroke-width': 2.5, 'marker-end': 'url(#arrp)' }, s);
        st.add(a, 'fade', b.step, { delay: k === 1 ? 0.15 : 0 });
      }
    });
    // verification checks
    const checks = ['every quote and estimate verbatim, on the page given', 'journal in the SSCI/SCIE list; indicators in the codebook',
      'every ESS variable exists in the rounds analysed', 'later rounds and countries recomputed from the card',
      'card complete; significance consistent with coefficient and SE'];
    const gc = el('g', null, s);
    const cx0 = 500, cy0 = 398;
    el('text', { x: cx0, y: cy0 - 8, 'font-size': 16, 'font-weight': 600, fill: BLUE, text: 'Five checks of the verification script' }, gc);
    checks.forEach((c, i) => {
      el('circle', { cx: cx0 + 12, cy: cy0 + 22 + i * 30 - 5, r: 11, fill: BLUE }, gc);
      el('text', { x: cx0 + 12, y: cy0 + 22 + i * 30, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: '#fff', text: String(i + 1) }, gc);
      el('text', { x: cx0 + 32, y: cy0 + 22 + i * 30, 'font-size': 16, fill: P.ink, text: c }, gc);
    });
    st.add(gc, 'up', 2, { delay: 0.25 });
    // fail loop: verification -> new agent
    const loop1 = el('path', { d: `M843 ${rowY} C 843 18, 311 18, 311 ${rowY - 2}`, fill: 'none', stroke: P.accent, 'stroke-width': 2.2,
      'stroke-dasharray': '7 6', 'marker-end': 'url(#arrp)' }, s);
    st.add(loop1, 'fade', 2, { delay: 0.5 });
    const l1t = el('text', { x: 577, y: 22, 'text-anchor': 'middle', 'font-size': 15, fill: P.accent,
      text: 'card fails a check: discarded, and the article is read again by a new agent' }, s);
    st.add(l1t, 'fade', 2, { delay: 0.6 });
    // next-candidate loop: eligibility -> new agent (below)
    const loop2 = el('path', { d: `M1076 ${rowY + bh} C 1076 280, 700 268, 311 ${rowY + bh + 4}`, fill: 'none', stroke: P.accent,
      'stroke-width': 2.2, 'stroke-dasharray': '7 6', 'marker-end': 'url(#arrp)' }, s);
    st.add(loop2, 'fade', 3, { delay: 0.35 });
    const l2 = PSD.mtext(s, 330, 322, ['key result fails (d)-(g) or the exclusion criterion:', 'next candidate read by a new agent (at most three)'],
      { 'font-size': 15, fill: P.accent }, 1.25);
    st.add(l2, 'fade', 3, { delay: 0.45 });
    // outcomes
    const outs = [['Included', TEAL, '#fff'], ['Excluded', '#fff', P.dark]];
    outs.forEach((o, k) => {
      const g = el('g', null, s), y = 380 + k * 66, x = 990;
      el('rect', { x: x, y: y, width: 178, height: 50, rx: 25, fill: o[1], stroke: k === 0 ? TEAL : '#B9C3C4', 'stroke-width': 2 }, g);
      el('text', { x: x + 89, y: y + 32, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 600, fill: o[2], text: o[0] }, g);
      st.add(g, 'left', 4, { delay: 0.12 * k });
    });
    const gOut = el('path', { d: `M1100 ${rowY + bh} L 1100 372`, stroke: '#8FA3A6', 'stroke-width': 2.5, fill: 'none', 'marker-end': 'url(#arrp)' }, s);
    st.add(gOut, 'fade', 4);
    const note = PSD.mtext(s, 0, 400, ['No card is edited manually, and no individual', 'cards are reviewed by humans.'], { 'font-size': 17, fill: P.ink }, 1.3);
    st.add(note, 'fade', 4, { delay: 0.3 });
    const SC = PSD.data.ess.screening;
    const count = PSD.mtext(s, 0, 480, ['After three runs, ' + fmt(SC.remain) + ' of the ' + fmt(SC.papers) + ' papers remain;',
      fmt(SC.replication) + ' for replication, excluding the two pilot papers.'], { 'font-size': 17, 'font-weight': 600, fill: TEAL_D }, 1.3);
    st.add(count, 'fade', 4, { delay: 0.45 });

    // travelling token
    const tok = el('circle', { cx: 0, cy: 0, r: 11, fill: P.accent, stroke: '#fff', 'stroke-width': 3 }, s);
    tok.style.transition = 'transform .9s cubic-bezier(.22,.61,.36,1), opacity .4s';
    const pos = [[75, rowY + bh + 18], [311, rowY + bh + 18], [587, rowY + bh + 38], [843, rowY + bh + 18], [1076, rowY + bh + 18]];
    const base = st.apply;
    function play(i) {
      base(i);
      const k = Math.max(0, Math.min(4, i));
      tok.style.transform = `translate(${pos[k][0]}px, ${pos[k][1]}px)`;
      tok.style.opacity = i < 0 ? 0 : (i >= 4 ? 0 : 1);
    }
    play(-1);
    return { steps: 4, play: play, reset: () => play(-1) };
  };

  /* One script, several runs (PAP2, Stage 2 prompt, section 3). Steps: 0 axis · 1 recreation · 2 pooled · 3 round by round */
  PSD.figures['ess-runs'] = function (mount, opts) {
    const P = opts.palette, el = PSD.el;
    const W = 770, H = 588, s = PSD.svg(mount, W, H), st = PSD.stepper();
    const x0 = 150, x1 = 760, sx = r => x0 + (r - 0.5) * (x1 - x0) / 11;
    const gAx = el('g', null, s);
    el('text', { x: x0, y: 26, 'font-size': 17, 'font-weight': 500, fill: P.dark, text: 'ESS round' }, gAx);
    for (let r = 1; r <= 11; r++) {
      el('rect', { x: sx(r) - 23, y: 40, width: 46, height: 36, rx: 5, fill: r <= 4 ? '#E9ECEC' : TEAL_L }, gAx);
      el('text', { x: sx(r), y: 64, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 600, fill: P.dark, text: String(r) }, gAx);
    }
    el('text', { x: sx(1), y: 98, 'text-anchor': 'middle', 'font-size': 14, fill: P.muted, text: '2002/03' }, gAx);
    el('text', { x: sx(11), y: 98, 'text-anchor': 'middle', 'font-size': 14, fill: P.muted, text: '2023/24' }, gAx);
    el('line', { x1: (sx(4) + sx(5)) / 2, y1: 34, x2: (sx(4) + sx(5)) / 2, y2: 560, stroke: P.accent, 'stroke-width': 2.2, 'stroke-dasharray': '7 6' }, gAx);
    PSD.mtext(gAx, (sx(4) + sx(5)) / 2 + 10, 128, ['example: card’s', 'rounds 1–4'], { 'font-size': 14, fill: P.accent }, 1.2);
    st.add(gAx, 'fade', 0);
    const runs = [
      { name: 'Recreation', from: 1, to: 4, sub: ['card’s rounds', 'card’s countries'], col: '#7E979B' },
      { name: 'Pooled', from: 5, to: 11, sub: ['all holdout rounds'], col: '#5E7E83' },
      { name: 'Round by round', from: 5, to: 11, sub: ['each holdout round separately'], col: TEAL, split: true }
    ];
    runs.forEach((R, k) => {
      const y = 222 + k * 128, g = el('g', null, s);
      el('text', { x: 0, y: y + 30, 'font-size': 20, 'font-weight': 600, fill: P.dark, text: R.name }, g);
      st.add(g, 'fade', k + 1);
      if (R.split) {
        for (let r = R.from; r <= R.to; r++) {
          const b = el('rect', { x: sx(r) - 23, y: y, width: 46, height: 46, rx: 7, fill: R.col }, s);
          st.add(b, 'growx', k + 1, { delay: 0.1 + 0.06 * (r - R.from) });
        }
        const t = el('text', { x: sx(R.from) - 23, y: y + 72, 'font-size': 16, 'font-weight': 500, fill: R.col, text: R.sub.join(' · ') }, s);
        st.add(t, 'fade', k + 1, { delay: 0.6 });
        return;
      }
      const bar = el('rect', { x: sx(R.from) - 23, y: y, width: sx(R.to) - sx(R.from) + 46, height: 46, rx: 7, fill: R.col }, s);
      st.add(bar, 'growx', k + 1, { delay: 0.1 });
      const inside = R.to - R.from > 4;
      const t = el('text', { x: inside ? sx(R.from) - 8 : sx(R.to) + 40, y: y + 29, 'font-size': 16, 'font-weight': 500,
        fill: inside ? '#fff' : R.col, text: R.sub.join(' · ') }, s);
      st.add(t, 'fade', k + 1, { delay: 0.5 });
    });
    return PSD.ctrl(st, 3);
  };

  /* Statistical power. Steps: 0 axis + relative effect size 1 · 1 previous projects about 0.5 · 2 MDE with sampling distributions */
  PSD.figures['ess-power'] = function (mount, opts) {
    const P = opts.palette, el = PSD.el, D = PSD.data.ess.power;
    const W = 770, H = 588, s = PSD.svg(mount, W, H), st = PSD.stepper();
    // overview axis 0 .. 1.1
    const x0 = 30, x1 = 740, sx = PSD.scale(0, 1.1, x0, x1), yA = 150;
    const g0 = el('g', null, s);
    el('text', { x: x0, y: 40, 'font-size': 18, 'font-weight': 500, fill: P.dark, text: 'Relative replication effect size' }, g0);
    el('line', { x1: x0, y1: yA, x2: x1, y2: yA, stroke: P.dark, 'stroke-width': 2 }, g0);
    [0, 0.25, 0.5, 0.75, 1].forEach(v => {
      el('line', { x1: sx(v), y1: yA, x2: sx(v), y2: yA + 8, stroke: P.dark, 'stroke-width': 1.5 }, g0);
      el('text', { x: sx(v), y: yA + 30, 'text-anchor': 'middle', 'font-size': 16, fill: P.muted, text: v.toFixed(2).replace(/0$/, '').replace(/\.0$/, '') }, g0);
    });
    st.add(g0, 'fade', 0);
    const one = el('g', null, s);
    el('circle', { cx: sx(1), cy: yA, r: 10, fill: P.dark }, one);
    el('text', { x: sx(1), y: yA - 22, 'text-anchor': 'middle', 'font-size': 16, fill: P.dark, text: '1 = original effect size' }, one);
    st.add(one, 'pop', 0, { delay: 0.3 });
    const prev = el('g', null, s);
    el('circle', { cx: sx(D.previous), cy: yA, r: 10, fill: P.accent }, prev);
    PSD.mtext(prev, sx(D.previous), yA - 46, ['about 0.5 in large-scale', 'replication projects'], { 'text-anchor': 'middle', 'font-size': 16, fill: P.accent }, 1.2);
    st.add(prev, 'pop', 1);
    // zoom panel
    const zx0 = 30, zx1 = 740, zs = PSD.scale(0.82, 1.06, zx0, zx1), yB = 520, amp = 200;
    const gz = el('g', null, s);
    const zoomL = el('path', { d: `M${sx(0.82)} ${yA + 40} L ${zx0} 250 M ${sx(1.06)} ${yA + 40} L ${zx1} 250`, stroke: '#C9D1D2',
      'stroke-width': 1.5, 'stroke-dasharray': '4 5', fill: 'none' }, gz);
    el('line', { x1: zx0, y1: yB, x2: zx1, y2: yB, stroke: P.dark, 'stroke-width': 2 }, gz);
    [0.85, 0.9, 0.95, 1.0, 1.05].forEach(v => {
      el('line', { x1: zs(v), y1: yB, x2: zs(v), y2: yB + 8, stroke: P.dark, 'stroke-width': 1.5 }, gz);
      el('text', { x: zs(v), y: yB + 30, 'text-anchor': 'middle', 'font-size': 16, fill: P.muted, text: v.toFixed(2) }, gz);
    });
    st.add(gz, 'fade', 2);
    function curve(mu, col, op) {
      let d = '';
      for (let v = 0.82; v <= 1.0601; v += 0.002) {
        const y = yB - amp * Math.exp(-0.5 * Math.pow((v - mu) / D.se, 2));
        d += (d ? 'L' : 'M') + zs(v).toFixed(1) + ' ' + y.toFixed(1);
      }
      const g = el('g', null, s);
      el('path', { d: d + `L${zs(1.06)} ${yB} L${zs(0.82)} ${yB} Z`, fill: col, opacity: op }, g);
      el('path', { d: d, fill: 'none', stroke: col, 'stroke-width': 3 }, g);
      return g;
    }
    st.add(curve(1, P.dark, 0.1), 'growy', 2, { delay: 0.2 });
    const alt = 1 - D.mde005;
    st.add(curve(alt, TEAL, 0.16), 'growy', 2, { delay: 0.55 });
    const lab = el('g', null, s);
    el('text', { x: zs(1) + 8, y: yB - amp - 12, 'font-size': 15.5, fill: P.dark, text: 'SE = ' + D.se }, lab);
    PSD.mtext(lab, zs(alt) - 10, yB - amp - 30, ['MDE = ' + D.mde005, '(90% power, 0.5% level)'], { 'text-anchor': 'end', 'font-size': 15.5, fill: TEAL_D, 'font-weight': 500 }, 1.2);
    el('line', { x1: zs(alt), y1: yB - amp - 6, x2: zs(alt), y2: yB, stroke: TEAL_D, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, lab);
    el('line', { x1: zs(1), y1: yB - amp - 6, x2: zs(1), y2: yB, stroke: P.dark, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, lab);
    el('text', { x: zx1, y: 268, 'text-anchor': 'end', 'font-size': 15.5, fill: P.muted, text: 'n = 300 papers, SD = ' + D.sd }, lab);
    st.add(lab, 'fade', 2, { delay: 0.8 });
    return PSD.ctrl(st, 2);
  };
})();
