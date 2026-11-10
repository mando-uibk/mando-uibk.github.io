/* Part 2 - Large Language Models as Synthetic Populations (Holzknecht, Koenig-Kersting & Valenta).
   Port of the figures of the LLM talk (Papers/HKV_reveal/js/figs.js) onto this deck's contract:
     PSD.figures['llm-*'] = (mount, opts) => ({steps, play(i), reset()})
   Every number comes from PSD.data.llm (assets/data/llm.json, imported by build/import_llm.py from
   the HKV deck's generated bundle). Changes against the source: Fira Sans instead of CMU Sans (the
   glyph-width estimate is recalibrated to Fira), the deck's dark/orange instead of the source's
   structure blue/orange, the deck's .fx motion classes, Greek and arrows set in PSD.MATHFONT
   (the Fira files are Latin subsets), and the step adapter at the bottom.
   Figures: llm-design (Case 1 on arrival, Case 2 on 1 click), llm-prompts, llm-pipeline (model on arrival, one stage per click, 7 clicks),
   llm-panel (model list on arrival, count line on 1 click),
   llm-forest-ct / -wealth / -human (paper Figures 1-3, static), llm-mod-human (static). */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var D = PSD.data.llm;

  var C = {
    ink: '#000', ink2: '#222', muted: '#444', faint: '#777',
    rule: '#bbb', grid: '#dcdcdc', zero: '#8a8a8a',
    struct: '#23373B', accent: '#EB811B',
    control: '#5b6b7a', treat: '#0072b2',
    dens: '#e2e2e2', densPI: '#b8b8b8'
  };
  var PC = D.providerColours;

  /* Type scale, in viewBox units (~1 slide px per unit on a full-width figure). */
  var FS = { s: 20, m: 21, l: 22, h: 24 };
  /* Slightly generous advance width of a label, for placing text geometrically (never measured at
     build time); factors measured once on the deck's Fira Sans (300/700). */
  function estW(str, size) {
    var w = 0;
    String(str).split('').forEach(function (ch) {
      w += /[0-9]/.test(ch) ? 0.55 : ch === '−' || ch === '—' ? 0.78 :
        /[ .,;:\[\]()|\/-]/.test(ch) ? 0.31 : /[mwMW]/.test(ch) ? 0.82 :
        /[A-Z]/.test(ch) ? 0.62 : /[a-z]/.test(ch) ? 0.52 : 0.56;
    });
    return w * size;
  }
  var CHARW = 0.52;   // mean advance of running text, for the character-budget word wrap

  // -------------------------------------------------------- svg helpers
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs)
      if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, s, attrs) {
    var t = el('text', Object.assign({ x: x, y: y, fill: C.ink }, attrs || {}), parent);
    t.textContent = s;
    return t;
  }
  function g(parent, attrs) { return el('g', attrs || {}, parent); }
  function svg(mount, w, h) {
    mount.innerHTML = '';
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, preserveAspectRatio: 'xMidYMid meet' }, mount);
  }
  /* One motion vocabulary deck-wide: a step group fades in and rises (theme.css .fx-up). */
  function step(node, on) {
    node.classList.add('fx', 'fx-up');
    node.classList.toggle('off', !on);
  }
  /* Greek letters and arrows in the math font, CO2's subscript as a shifted 2. */
  var MATHRE = /([Ͱ-Ͽ←-⇿≤≥]+)|(₂)/g;
  function mathify(root) {
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = [];
    while (tw.nextNode()) list.push(tw.currentNode);
    list.forEach(function (tn) {
      var s = tn.nodeValue, last = 0, m, frag = null;
      MATHRE.lastIndex = 0;
      while ((m = MATHRE.exec(s))) {
        frag = frag || document.createDocumentFragment();
        if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
        var t = document.createElementNS(NS, 'tspan');
        if (m[1]) { t.setAttribute('style', 'font-family:' + PSD.MATHFONT); t.textContent = m[1]; }
        else { t.setAttribute('baseline-shift', 'sub'); t.setAttribute('font-size', '72%'); t.textContent = '2'; }
        frag.appendChild(t);
        last = m.index + m[0].length;
      }
      if (!frag) return;
      if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
      tn.parentNode.replaceChild(frag, tn);
    });
  }

  /* Where the numbers come from, stated once per figure at the top right - a label on the
     figure, never a caption under it. */
  function provenance(parent, W, label) {
    return txt(parent, W - 2, 19, label,
      { 'text-anchor': 'end', 'font-size': FS.s, 'font-weight': 700, fill: C.ink2 });
  }
  function arrow(parent, x1, y1, x2, y2, col, w) {
    var a = g(parent);
    el('line', { x1: x1, y1: y1, x2: x2 - 7, y2: y2, stroke: col || C.struct,
      'stroke-width': w || 1.6 }, a);
    el('path', { d: 'M' + x2 + ' ' + y2 + 'L' + (x2 - 8) + ' ' + (y2 - 4.2) +
      'L' + (x2 - 8) + ' ' + (y2 + 4.2) + 'Z', fill: col || C.struct }, a);
    return a;
  }
  function box(parent, x, y, w, h, attrs) {
    return el('rect', Object.assign({ x: x, y: y, width: w, height: h, rx: 4,
      fill: '#fff', stroke: '#c9c9c9', 'stroke-width': 1 }, attrs || {}), parent);
  }
  function f2(v) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(2); }
  function f3(v) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(3); }
  function thou(v) { return Math.round(v).toLocaleString('en-US'); }
  /* greedy word wrap at a character budget; returns the number of lines drawn */
  function wrapAt(parent, x, y, str, chars, size, lh, attrs) {
    var words = String(str).split(' '), line = '', lines = [];
    words.forEach(function (w) {
      if ((line + ' ' + w).length > chars) { lines.push(line); line = w; }
      else line = line ? line + ' ' + w : w;
    });
    if (line) lines.push(line);
    lines.forEach(function (L, i) {
      var a = { 'font-size': size };
      for (var k in (attrs || {})) a[k] = attrs[k];
      txt(parent, x, y + i * lh, L, a);
    });
    return lines.length;
  }
  function dnorm(x, mu, sd) {
    var z = (x - mu) / sd;
    return Math.exp(-0.5 * z * z);          // unnormalised: rescaled to 1 at mu
  }
  function pnorm(z) {                       // standard normal CDF (Abramowitz-Stegun 7.1.26)
    var t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
    var e = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 +
      t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-z * z / 2);
    return z >= 0 ? 0.5 * (1 + e) : 0.5 * (1 - e);
  }
  /* R's scales::breaks_pretty(n) equivalent, close enough for tick labels */
  function prettyBreaks(lo, hi, n) {
    var raw = (hi - lo) / n, mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var norm = raw / mag, s = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
    var stepv = s * mag, out = [];
    for (var v = Math.ceil(lo / stepv) * stepv; v <= hi + 1e-9; v += stepv)
      out.push(Math.abs(v) < 1e-9 ? 0 : v);
    return out;
  }

  var FIGS = {};
  var PROV_FULL = 'full panel · ' + D.k_panel + ' LLMs';

  function cell(id) {
    for (var i = 0; i < D.cells.length; i++) if (D.cells[i].cell === id) return D.cells[i];
    throw new Error('unknown cell ' + id);
  }
  function moderation(id) {
    for (var i = 0; i < D.moderation.length; i++)
      if (D.moderation[i].cell === id) return D.moderation[i];
    throw new Error('unknown moderation cell ' + id);
  }
  function sharedXlim(cs, pad) {
    var lo = 0, hi = 0;                       // rule-(ii) rows sit at d = 0
    cs.forEach(function (c) {
      if (c.human) {
        lo = Math.min(lo, c.human.d - 1.96 * c.human.se);
        hi = Math.max(hi, c.human.d + 1.96 * c.human.se);
      }
      c.models.forEach(function (r) {
        lo = Math.min(lo, r.d - 1.96 * r.se);
        hi = Math.max(hi, r.d + 1.96 * r.se);
      });
      lo = Math.min(lo, c.ci_lo, c.pi_lb);
      hi = Math.max(hi, c.ci_hi, c.pi_ub);
    });
    var p = (pad === undefined ? 0.04 : pad) * (hi - lo);
    return [lo - p, hi + p];
  }

  /* ==========================================================
     Design overview: the eight analysis cells, one case per click
     ========================================================== */
  FIGS.design = function (mount) {
    var W = 1180, H = 450, s = svg(mount, W, H);
    var G = [];
    var CASES = [
      { name: 'Case 1 · Nudging intervention for Carbon Pricing Support', sub: 'conceptual replication · Schwaiger\u00a0et\u00a0al.\u00a0(2026)',
        treat: ['Information treatment'], out: ['Stated support', 'Revealed support'],
        extra: 'Human benchmark: representative Austrian sample, n\u00a0=\u00a01,600',
        col: C.accent },
      { name: 'Case 2 · First-Mover actions in Classic Economic Games', sub: 'direct replication and extension · Polachek\u00a0et\u00a0al.\u00a0(2026)',
        treat: ['Wealth', 'Human emphasis'], out: ['Dictator', 'Ultimatum', 'Trust'],
        extra: 'Treatments crossed orthogonally within a five-level stake ladder (20 to 200,000 Rupees), entered as a covariate',
        col: C.treat }
    ];
    var GAP = 28, BW = (W - 4 - GAP) / 2, x = 2;
    var chars = function (size) { return Math.floor((BW - 36) / (CHARW * size)); };
    // both boxes share one layout grid, so the treatment rows line up
    function nLines(str, size) {
      var words = String(str).split(' '), line = '', n = 0;
      words.forEach(function (w) {
        if ((line + ' ' + w).length > chars(size)) { n++; line = w; } else line = line ? line + ' ' + w : w;
      });
      return n + (line ? 1 : 0);
    }
    var nameL = Math.max.apply(null, CASES.map(function (cs) { return nLines(cs.name, FS.h); }));
    var subL = Math.max.apply(null, CASES.map(function (cs) { return nLines(cs.sub, FS.s); }));
    var extL = Math.max.apply(null, CASES.map(function (cs) { return nLines(cs.extra, FS.s); }));
    CASES.forEach(function (cs) {
      var gg = g(s); G.push(gg);
      box(gg, x, 2, BW, H - 4, { stroke: cs.col, 'stroke-width': 1.8 });
      var y = 36;
      wrapAt(gg, x + 18, y, cs.name, chars(FS.h), FS.h, 30, { 'font-weight': 700, fill: cs.col });
      y += nameL * 30 - 2;
      wrapAt(gg, x + 18, y, cs.sub, chars(FS.s), FS.s, 25, { fill: C.ink2 });
      y += subL * 25 + 10;
      var nCells = cs.treat.length * cs.out.length;
      txt(gg, x + 18, y, '→ ' + nCells + ' meta-analys' +
        (nCells > 1 ? 'es' : 'is') + ', one τ each, ' + D.k_panel + ' LLMs',
        { 'font-size': FS.l, 'font-weight': 700, fill: cs.col });
      y += 36;
      wrapAt(gg, x + 18, y, cs.extra, chars(FS.s), FS.s, 25, { fill: C.ink2 });
      y += extL * 25 + 16;
      txt(gg, x + 18, y, 'treatment' + (cs.treat.length > 1 ? 's' : ''),
        { 'font-size': FS.s, fill: C.faint });
      cs.treat.forEach(function (t, i) {
        el('rect', { x: x + 18, y: y + 10 + i * 46, width: 236, height: 36, rx: 4,
          fill: cs.col, 'fill-opacity': .14, stroke: cs.col, 'stroke-width': 1.2 }, gg);
        txt(gg, x + 30, y + 35 + i * 46, t, { 'font-size': FS.s });
      });
      txt(gg, x + 304, y, 'outcome' + (cs.out.length > 1 ? 's' : ''),
        { 'font-size': FS.s, fill: C.faint });
      cs.out.forEach(function (t, i) {
        el('rect', { x: x + 304, y: y + 10 + i * 46, width: 220, height: 36, rx: 4,
          fill: '#f1f1f1', stroke: '#c9c9c9', 'stroke-width': 1.2 }, gg);
        txt(gg, x + 316, y + 35 + i * 46, t, { 'font-size': FS.s });
      });
      txt(gg, x + 279, y + 38, '×', { 'text-anchor': 'middle', 'font-size': 28, fill: C.faint });
      x += BW + GAP;
    });
    G.forEach(function (n) { step(n, false); });
    return { steps: G.length,
      play: function (i) { G.forEach(function (n, j) { step(n, i >= j); }); } };
  };

  /* ==========================================================
     Case 1 prompts: control and treatment as two aligned stacks of
     blocks; the only difference, the three tax-information blocks,
     sits in the treatment stack opposite an empty dashed slot.
     ========================================================== */
  FIGS.prompts = function (mount) {
    var W = 1180, H = 540, s = svg(mount, W, H);
    var gAll = g(s);
    provenance(gAll, W, 'reproduced from Schwaiger et al. (2026)');
    var GAP = 40, CW = (W - GAP) / 2, X0 = 0, X1 = CW + GAP;
    var top = 70, RH = 50, RG = 10, TH = 68, TG = 8;
    function head(x, col, label) {
      txt(gAll, x + 2, top - 18, label + ' prompt', { 'font-size': FS.h, 'font-weight': 700, fill: col });
      txt(gAll, x + CW - 2, top - 18, 'n = ' + D.example.n_per_arm,
        { 'text-anchor': 'end', 'font-size': FS.m, 'font-weight': 700, fill: col });
    }
    head(X0, C.control, 'Control');
    head(X1, C.treat, 'Treatment');
    function row(y, h, title, sub, o) {
      [X0, X1].forEach(function (x, i) {
        var col = i ? C.treat : C.control;
        box(gAll, x, y, CW, h, { stroke: col, 'stroke-width': 1.4 });
        var t = txt(gAll, x + 16, y + h / 2 + 7, '', { 'font-size': FS.m,
          fill: o && o.ask ? C.struct : C.ink2 });
        var a = el('tspan', { 'font-weight': 700 }); a.textContent = title; t.appendChild(a);
        if (sub) { var b = el('tspan', { fill: C.muted }); b.textContent = '  ' + sub; t.appendChild(b); }
      });
    }
    var y = top;
    row(y, RH, 'Welcome and consent'); y += RH + RG;
    row(y, RH, 'A Warming Planet', 'climate introduction'); y += RH + RG;
    var info = [
      ['Did you know?', 'the 2022 tax reform puts a price on CO₂ emissions'],
      ['Who pays the tax?', 'companies that produce or import fuels'],
      ['How much is the CO₂ tax?', '30 euros per ton of CO₂ in 2022']];
    var yT = y, hT = info.length * TH + (info.length - 1) * TG;
    box(gAll, X0, yT, CW, hT, { stroke: '#b5b5b5', 'stroke-width': 1.2,
      'stroke-dasharray': '6 5', fill: 'none' });
    info.forEach(function (b, i) {
      var yy = yT + i * (TH + TG);
      box(gAll, X1, yy, CW, TH, { stroke: C.accent, 'stroke-width': 1.6, fill: '#fdf0da' });
      txt(gAll, X1 + 16, yy + 28, b[0], { 'font-size': FS.m, 'font-weight': 700 });
      txt(gAll, X1 + 16, yy + 54, b[1], { 'font-size': FS.s, fill: C.ink2 });
    });
    y += hT + RG;
    row(y, RH, 'Survey question', 'stated support, 1–5', { ask: true }); y += RH + RG;
    row(y, RH, 'Decision task', 'donation, €0–200', { ask: true });
    step(gAll, false);
    return { steps: 1, play: function (i) { step(gAll, i >= 0); } };
  };

  /* ==========================================================
     Estimation pipeline, one model: worked through on Case 1 with
     the real responses of the example model.
     ========================================================== */
  FIGS.pipeline = function (mount) {
    var W = 1180, H = 500, s = svg(mount, W, H);
    var E = D.example, nArm = E.n_per_arm;
    var G = [];                              // one group per stage
    function mk(t, a) { var n = el('tspan', a || {}); n.textContent = t; return n; }
    var g00 = g(s); G.push(g00);
    provenance(g00, W, 'Case 1 data');

    /* ---- row 1: model -> sample -> arms -> prompts ---------------------- */
    var R1 = 124;
    var g0 = g(s); G.push(g0);
    box(g0, 2, R1 - 62, 212, 124, { stroke: C.struct, 'stroke-width': 1.8 });
    txt(g0, 108, R1 - 34, 'one potential', { 'text-anchor': 'middle', 'font-size': FS.s, fill: C.faint });
    txt(g0, 108, R1 - 10, 'synthetic population', { 'text-anchor': 'middle', 'font-size': FS.s, fill: C.faint });
    txt(g0, 108, R1 + 22, E.model, { 'text-anchor': 'middle', 'font-size': FS.l, 'font-weight': 700, fill: C.struct });
    txt(g0, 108, R1 + 48, E.firm, { 'text-anchor': 'middle', 'font-size': FS.s, fill: C.muted });

    var g1 = g(s); G.push(g1);
    arrow(g1, 220, R1, 256, R1);
    var GX = 266, COLS = 20, RS = 6.5, DR = 2.5;
    var GY = R1 - 9.5 * RS;
    var GB = GY + 19 * RS + 30;
    var dots = [];
    for (var i = 0; i < 2 * nArm; i++) {
      var cx = GX + (i % COLS) * RS, cy = GY + Math.floor(i / COLS) * RS;
      dots.push(el('circle', { cx: cx, cy: cy, r: DR, fill: '#9aa3ab' }, g1));
    }
    var gridC = GX + (COLS - 1) * RS / 2;
    txt(g1, gridC, GY - 38, 'N = ' + (2 * nArm) + ' observations',
      { 'text-anchor': 'middle', 'font-size': FS.m, 'font-weight': 700 });
    txt(g1, gridC, GY - 14, 'sampled from it', { 'text-anchor': 'middle', 'font-size': FS.s, fill: C.ink2 });
    txt(g1, gridC, GB, '400 distinct API calls', { 'text-anchor': 'middle', 'font-size': FS.s, fill: C.ink2 });

    var g2 = g(s); G.push(g2);
    var AX = 446, BX = 546;
    ['control', 'info'].forEach(function (arm, a) {
      var col = a ? C.treat : C.control, x = a ? BX : AX;
      for (var j = 0; j < nArm; j++)
        el('circle', { cx: x + (j % 10) * RS, cy: GY + Math.floor(j / 10) * RS, r: DR, fill: col }, g2);
      txt(g2, x + 4.5 * RS, GY - 14, a ? 'Treatment' : 'Control',
        { 'text-anchor': 'middle', 'font-size': FS.m, 'font-weight': 700, fill: col });
      txt(g2, x + 4.5 * RS, GB, 'n = ' + nArm,
        { 'text-anchor': 'middle', 'font-size': FS.s, 'font-weight': 700, fill: col });
    });
    arrow(g2, GX + COLS * RS + 4, R1, AX - 8, R1);

    var g3 = g(s); G.push(g3);
    var PX = 660, PW = W - PX - 2;
    arrow(g3, BX + 10 * RS + 4, R1, PX - 8, R1);
    box(g3, PX, R1 - 62, PW, 50, { stroke: C.control, 'stroke-width': 1.4 });
    var cp = txt(g3, PX + 14, R1 - 30, '', { 'font-size': FS.s, fill: C.muted });
    cp.appendChild(mk('control prompt   ', { 'font-weight': 700, fill: C.control, 'font-size': FS.m }));
    cp.appendChild(mk('welcome + "A Warming Planet"'));
    box(g3, PX, R1 + 2, PW, 74, { stroke: C.treat, 'stroke-width': 1.4 });
    txt(g3, PX + 14, R1 + 30, 'treatment prompt', { 'font-size': FS.m, 'font-weight': 700, fill: C.treat });
    var tp = txt(g3, PX + 14, R1 + 60, '', { 'font-size': FS.s, fill: C.muted });
    tp.appendChild(mk('identical, plus three blocks on '));
    tp.appendChild(mk('the Austrian CO₂ tax', { fill: C.accent, 'font-weight': 700 }));
    txt(g3, PX + PW / 2, R1 - 76, 'reproduced from Schwaiger et al. (2026)',
      { 'text-anchor': 'middle', 'font-size': FS.s, fill: C.ink2 });

    /* ---- row 2: outcomes -> distributions -> OLS -> d -------------------- */
    var R2 = 384, T2 = R2 - 80, B2 = R2 + 80;
    var g4 = g(s); G.push(g4);
    var WY = 240;
    el('path', { d: 'M' + (W - 40) + ' ' + (R1 + 76) + ' L' + (W - 40) + ' ' + WY +
      ' L30 ' + WY + ' L30 ' + (T2 - 10), fill: 'none', stroke: C.struct, 'stroke-width': 1.8 }, g4);
    el('path', { d: 'M30 ' + (T2 - 1) + 'L25 ' + (T2 - 12) + 'L35 ' + (T2 - 12) + 'Z', fill: C.struct }, g4);
    var QW = 256;
    box(g4, 2, T2, QW, B2 - T2, { stroke: '#9a9a9a', 'stroke-width': 1.2 });
    txt(g4, 16, T2 + 30, 'two outcomes per query', { 'font-size': FS.s, 'font-weight': 700 });
    txt(g4, 16, T2 + 64, '[support]', { 'font-size': FS.s, fill: C.struct, 'font-family': 'Consolas,monospace' });
    txt(g4, 16, T2 + 88, 'stated support, 1–5', { 'font-size': FS.s, fill: C.ink2 });
    txt(g4, 16, T2 + 120, '[donation]', { 'font-size': FS.s, fill: C.struct, 'font-family': 'Consolas,monospace' });
    txt(g4, 16, T2 + 144, 'revealed support, €0–200', { 'font-size': FS.s, fill: C.ink2 });

    var g5 = g(s); G.push(g5);
    var HX = 300, HW = 214, HH = 64, HB = B2 - 12;
    arrow(g5, QW + 8, R2, HX - 14, R2);
    var hs = E.histSupport, ES = E.support;
    txt(g5, HX + HW / 2, T2 + 2, 'Stated support, by arm',
      { 'text-anchor': 'middle', 'font-size': FS.m, 'font-weight': 700 });
    // a Gaussian kernel over the five Likert points, one curve per arm
    var KX = function (v) { return HX + (v - 0.5) / 5 * HW; };
    var BWK = 0.55, GRID = 140;
    function dens(counts) {
      var n = counts.reduce(function (a, b) { return a + b; }, 0), out = [];
      for (var i = 0; i <= GRID; i++) {
        var x = 0.5 + i * 5 / GRID, y = 0;
        for (var b = 0; b < 5; b++) y += counts[b] * dnorm(x, b + 1, BWK);
        out.push([x, y / n]);
      }
      return out;
    }
    var dCtrl = dens(hs.control), dTrt = dens(hs.info);
    var dmax = Math.max.apply(null, dCtrl.concat(dTrt).map(function (p) { return p[1]; }));
    function dpath(d) {
      var p = 'M' + KX(d[0][0]).toFixed(2) + ' ' + HB;
      d.forEach(function (q) { p += 'L' + KX(q[0]).toFixed(2) + ' ' + (HB - q[1] / dmax * HH).toFixed(2); });
      return p + 'L' + KX(d[d.length - 1][0]).toFixed(2) + ' ' + HB + 'Z';
    }
    [[dCtrl, C.control], [dTrt, C.treat]].forEach(function (p) {
      el('path', { d: dpath(p[0]), fill: p[1], 'fill-opacity': .32, stroke: p[1], 'stroke-width': 1.8 }, g5);
    });
    [[ES.mean0, C.control], [ES.mean1, C.treat]].forEach(function (p) {
      el('line', { x1: KX(p[0]), y1: HB - HH - 8, x2: KX(p[0]), y2: HB,
        stroke: p[1], 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, g5);
    });
    [1, 2, 3, 4, 5].forEach(function (v) {
      txt(g5, KX(v), HB + 24, String(v), { 'text-anchor': 'middle', 'font-size': FS.s, fill: C.ink2 });
    });
    el('line', { x1: HX, y1: HB, x2: HX + HW, y2: HB, stroke: C.ink, 'stroke-width': 1.1 }, g5);
    txt(g5, HX, T2 + 30, 'control ' + ES.mean0.toFixed(3), { 'font-size': FS.s, fill: C.control });
    txt(g5, HX, T2 + 54, '→ treatment ' + ES.mean1.toFixed(3), { 'font-size': FS.s, fill: C.treat, 'font-weight': 700 });

    var g6 = g(s); G.push(g6);
    var OX = 556, OW = 290;
    arrow(g6, HX + HW + 8, R2, OX - 8, R2);
    box(g6, OX, T2, OW, B2 - T2, { stroke: C.struct, 'stroke-width': 1.6 });
    txt(g6, OX + 14, T2 + 30, 'OLS', { 'font-size': FS.m, 'font-weight': 700, fill: C.struct });
    var eq = el('text', { x: OX + 14, y: T2 + 62, 'font-size': FS.m }, g6);
    eq.appendChild(mk('Outcome'));
    eq.appendChild(mk('i', { 'baseline-shift': 'sub', 'font-size': 14, 'font-style': 'italic' }));
    eq.appendChild(mk(' = α + β Info'));
    eq.appendChild(mk('i', { 'baseline-shift': 'sub', 'font-size': 14, 'font-style': 'italic' }));
    eq.appendChild(mk(' + ε'));
    eq.appendChild(mk('i', { 'baseline-shift': 'sub', 'font-size': 14, 'font-style': 'italic' }));
    txt(g6, OX + 14, T2 + 96, 'β = ' + f3(ES.beta) + '   (SE ' + ES.beta_se.toFixed(3) + ')',
      { 'font-size': FS.l, 'font-weight': 700 });
    txt(g6, OX + 14, T2 + 124, 'pooled SD = ' + ES.sd_pooled.toFixed(3), { 'font-size': FS.s, fill: C.muted });
    txt(g6, OX + 14, T2 + 150, 'Huber et al. (2023)', { 'font-size': FS.s, fill: C.ink2 });

    var g7 = g(s); G.push(g7);
    var DX = OX + OW + 34, DW = W - DX - 2;
    arrow(g7, OX + OW + 6, R2, DX - 8, R2);
    box(g7, DX, T2, DW, B2 - T2, { stroke: C.accent, 'stroke-width': 2, fill: '#fdf7ee' });
    txt(g7, W - 2, T2 - 12, 'Output: one d per LLM and cell',
      { 'text-anchor': 'end', 'font-size': FS.m, 'font-weight': 700, fill: C.accent });
    txt(g7, DX + DW / 2, T2 + 28, 'stated support', { 'text-anchor': 'middle', 'font-size': FS.s, fill: C.ink2 });
    var dl = el('text', { x: DX + DW / 2, y: T2 + 58, 'text-anchor': 'middle', 'font-size': FS.m }, g7);
    dl.appendChild(mk("Cohen's "));
    dl.appendChild(mk('d', { 'font-style': 'italic' }));
    dl.appendChild(mk(' = β / SD'));
    dl.appendChild(mk('pooled', { 'baseline-shift': 'sub', 'font-size': 14 }));
    txt(g7, DX + DW / 2, T2 + 106, f2(ES.d),
      { 'text-anchor': 'middle', 'font-size': 42, 'font-weight': 700, fill: C.struct });
    txt(g7, DX + DW / 2, T2 + 144, 'SE ' + ES.d_se.toFixed(2) + ' · 95% CI [' +
      f2(ES.d - 1.96 * ES.d_se) + ', ' + f2(ES.d + 1.96 * ES.d_se) + ']',
      { 'text-anchor': 'middle', 'font-size': FS.s, fill: C.ink2 });

    G.forEach(function (n) { step(n, false); });
    return {
      steps: G.length,
      play: function (i) {
        G.forEach(function (n, j) { step(n, i >= j); });
        // once the population has been split, the undivided grid steps back
        var undivided = i >= 3 ? '#c9ced3' : '#9aa3ab';
        dots.forEach(function (d) { d.setAttribute('fill', undivided); });
      }
    };
  };

  /* ==========================================================
     The LLM panel, grouped by provider; the count line on a click
     ========================================================== */
  FIGS.panel = function (mount) {
    var byFirm = {};
    D.panel.forEach(function (m) { (byFirm[m.firm] = byFirm[m.firm] || []).push(m); });
    var firms = D.firms.map(function (f) { return f.firm; });   // sorted by size
    var NC = 4, PITCH = 22, HEAD = 28, GAPF = 16, TOP = 72;
    /* four columns: the largest four providers head a column each, the rest fill whichever
       column is currently shortest */
    function hgt(f) { return HEAD + byFirm[f].length * PITCH + GAPF; }
    var cols = [];
    for (var c = 0; c < NC; c++) cols.push({ firms: [firms[c]], h: hgt(firms[c]) });
    firms.slice(NC).forEach(function (f) {
      var tgt = cols.slice().sort(function (p, q) { return p.h - q.h; })[0];
      tgt.firms.push(f); tgt.h += hgt(f);
    });
    var W = 1180;
    var H = TOP + Math.max.apply(null, cols.map(function (q) { return q.h; })) - GAPF;
    var s = svg(mount, W, H);
    var base = g(s), note = g(s);
    function name(m) { return m.model + (m.expost ? ' †' : ''); }
    var ADD = '#007A55', REM = '#C0392B';
    /* column widths follow the longest identifier in that column (glyph-width estimate); the
       slack is shared out as gutters, so no identifier is truncated */
    var colW = cols.map(function (col) {
      var wmax = 0;
      col.firms.forEach(function (f) {
        wmax = Math.max(wmax, estW(f + '  (00)', FS.l) + 24);
        byFirm[f].forEach(function (m) { wmax = Math.max(wmax, estW(name(m), FS.s) + 6); });
      });
      return wmax;
    });
    var used = colW.reduce(function (p, q) { return p + q; }, 0);
    var gut = Math.max(8, (W - 4 - used) / (NC - 1));
    var colX = [2];
    for (c = 1; c < NC; c++) colX.push(colX[c - 1] + colW[c - 1] + gut);
    colX[NC - 1] = Math.min(colX[NC - 1], W - 2 - colW[NC - 1]);
    cols.forEach(function (col, ci) {
      var x = colX[ci], y = TOP;
      col.firms.forEach(function (f) {
        var ms = byFirm[f];
        el('rect', { x: x, y: y - 17, width: 16, height: 16, rx: 3, fill: PC[f], stroke: '#666', 'stroke-width': 0.6 }, base);
        var nm = el('text', { x: x + 24, y: y - 2, 'font-size': FS.l, 'font-weight': 700 }, base);
        var n1 = el('tspan', {}); n1.textContent = f; nm.appendChild(n1);
        var n2 = el('tspan', { 'font-size': FS.s, 'font-weight': 400, fill: C.faint });
        n2.textContent = '  (' + ms.filter(function (m) { return !m.removed; }).length + ')'; nm.appendChild(n2);
        ms.forEach(function (m, j) {
          txt(base, x + 4, y + HEAD - 4 + j * PITCH, name(m),
            { 'font-size': FS.s, fill: m.expost ? ADD : m.removed ? REM : C.ink2,
              'font-weight': m.expost || m.removed ? 700 : null,
              'text-decoration': m.removed ? 'line-through' : null });
        });
        y += HEAD + ms.length * PITCH + GAPF;
      });
    });
    var nt = el('text', { x: 2, y: 20, 'font-size': FS.s, fill: C.ink2 }, note);
    [[D.k_panel + ' LLMs from ' + D.n_firms + ' providers:  ' + D.n_registered + ' registered  ·  ', {}],
     [D.n_expost + ' added after the pre-registration (†)', { fill: ADD, 'font-weight': 700 }],
     ['  ·  ', {}],
     [D.n_attrition + ' registered but no longer accessible', { fill: REM, 'font-weight': 700 }]]
      .forEach(function (q) { var t = el('tspan', q[1]); t.textContent = q[0]; nt.appendChild(t); });
    step(base, false); step(note, false);
    return { steps: 2, play: function (i) { step(base, i >= 0); step(note, i >= 1); } };
  };

  /* ==========================================================
     Paper-identical forest plots (Figures 1-3 of the manuscript):
     monochrome, every model labelled, ex-post additions with a dagger,
     rule-(ii) exclusions with * at d = 0 under a dotted rule, the
     meta-effect diamond, the human row (Case 1), and the distribution
     of true effects. Drawn on a bare frame: 63 labelled rows need the
     whole slide.
     ========================================================== */
  var PAPER = { ink: '#1a1a1a', grid: '#e3e3e3', dens: '#e6e6e6', human: '#0072B2', diamond: '#2b2b2b' };

  function paperPanel(parent, c, o) {
    var x0 = o.x, w = o.w, H = o.h, hum = o.human && c.human ? c.human : null;
    var exc = c.excluded || [], inc = c.models;
    var n = inc.length + exc.length;
    var TFS = 17, SFS = 14;
    var rowTop = 30;
    var yAx = H - 32, DENS_H = 56;
    var yHum = yAx - DENS_H - 11;
    var yMeta = hum ? yHum - 16 : yAx - DENS_H - 12;
    var yRule = yMeta - 10;
    var rowH = (yRule - 4 - rowTop) / n;
    var LFS = Math.min(13, rowH * 1.0);
    var Y = function (i) { return rowTop + (i + 0.5) * rowH; };
    function lab(r, ex) { return r.model + (r.registered ? '' : ' †') + (ex ? ' *' : ''); }
    var labs = inc.map(function (r) { return lab(r, false); })
      .concat(exc.map(function (r) { return lab(r, true); }));
    var LW = Math.max.apply(null, labs.map(function (s) { return estW(s, LFS); }));
    LW = Math.max(LW, estW('θ > 0: 100% [100%, 100%]', SFS * 0.8),
      estW('I2 = ' + c.I2.toFixed(1) + '%;  Q(' + c.Q_df + ') = ' + thou(c.Q), SFS * 0.8) + 4,
      hum ? estW('Human data (Schwaiger et al. 2026)', SFS * 0.8) : 0);
    var PX = x0 + LW + 12, PW = x0 + w - 8 - PX;
    var xl = o.xlim;
    var X = function (v) { return PX + PW * (v - xl[0]) / (xl[1] - xl[0]); };
    var root = g(parent);

    var tt = el('text', { x: x0 + 3, y: 16, 'font-size': TFS, 'font-weight': 700, fill: PAPER.ink }, root);
    var t1 = el('tspan', {}); t1.textContent = o.letter + '   '; tt.appendChild(t1);
    var t2 = el('tspan', {}); t2.textContent = o.title; tt.appendChild(t2);

    var ax = g(root);
    prettyBreaks(xl[0], xl[1], Math.max(3, Math.floor(PW / 60))).forEach(function (v) {
      el('line', { x1: X(v), y1: rowTop - 4, x2: X(v), y2: yAx, stroke: PAPER.grid, 'stroke-width': 1 }, ax);
      txt(ax, X(v), yAx + 14, v.toFixed(1).replace('-', '−').replace('−0.0', '0.0'),
        { 'text-anchor': 'middle', 'font-size': SFS * 0.9, fill: '#333' });
    });
    var xt = el('text', { x: PX + PW / 2, y: yAx + 29, 'text-anchor': 'middle', 'font-size': SFS, fill: PAPER.ink }, ax);
    var a1 = el('tspan', {}); a1.textContent = "Cohen's "; xt.appendChild(a1);
    var a2 = el('tspan', { 'font-style': 'italic' }); a2.textContent = 'd'; xt.appendChild(a2);
    el('line', { x1: X(0), y1: rowTop - 4, x2: X(0), y2: yAx, stroke: PAPER.ink, 'stroke-width': 1.2 }, ax);

    var pts = g(root), R = Math.max(1.6, Math.min(3, rowH * 0.36));
    inc.forEach(function (r, i) {
      var y = Y(i);
      el('line', { x1: X(Math.max(xl[0], r.d - 1.96 * r.se)), y1: y,
        x2: X(Math.min(xl[1], r.d + 1.96 * r.se)), y2: y, stroke: PAPER.ink, 'stroke-width': 1 }, pts);
      el('circle', { cx: X(r.d), cy: y, r: R, fill: '#fff', stroke: PAPER.ink, 'stroke-width': 0.9 }, pts);
      txt(pts, PX - 6, y + LFS * 0.35, labs[i], { 'text-anchor': 'end', 'font-size': LFS, fill: PAPER.ink });
    });
    if (exc.length) {
      var yd = rowTop + inc.length * rowH;
      el('line', { x1: PX - 4, y1: yd, x2: PX + PW, y2: yd, stroke: '#aaa', 'stroke-width': 0.8, 'stroke-dasharray': '1.5 2.5' }, pts);
      exc.forEach(function (r, j) {
        var y = Y(inc.length + j);
        el('circle', { cx: X(0), cy: y, r: R, fill: '#fff', stroke: PAPER.ink, 'stroke-width': 0.9 }, pts);
        txt(pts, PX - 6, y + LFS * 0.35, labs[inc.length + j], { 'text-anchor': 'end', 'font-size': LFS, fill: PAPER.ink });
      });
    }

    var pool = g(root);
    el('line', { x1: x0, y1: yRule, x2: PX + PW, y2: yRule, stroke: PAPER.ink, 'stroke-width': 1.2 }, pool);
    el('polygon', { points: [X(c.ci_lo) + ',' + yMeta, X(c.pooled_d) + ',' + (yMeta - 6),
      X(c.ci_hi) + ',' + yMeta, X(c.pooled_d) + ',' + (yMeta + 6)].join(' '), fill: PAPER.diamond }, pool);
    txt(pool, PX - 6, yMeta + 5, 'Meta-effect (μ)', { 'text-anchor': 'end', 'font-size': SFS * 0.8, fill: PAPER.ink });
    if (hum) {
      el('line', { x1: X(hum.d - 1.96 * hum.se), y1: yHum, x2: X(hum.d + 1.96 * hum.se),
        y2: yHum, stroke: PAPER.human, 'stroke-width': 2 }, pool);
      el('circle', { cx: X(hum.d), cy: yHum, r: 4.5, fill: '#fff', stroke: PAPER.human, 'stroke-width': 2 }, pool);
      txt(pool, PX - 6, yHum + 5, 'Human data (Schwaiger et al. 2026)',
        { 'text-anchor': 'end', 'font-size': SFS * 0.8, fill: PAPER.ink });
    }

    /* distribution of true effects, theta_j ~ N(mu, tau^2): solid at tau-hat, dashed at the
       bounds of tau's 95% CI; heights share one scale (the narrowest curve peaks at DENS_H) */
    var dens = g(root);
    var mu = c.pooled_d, N = 200;
    function yD(v, sd) { return yAx - dnorm(v, mu, sd) * (c.tau_lo / sd) * DENS_H; }
    function curve(sd) {
      var p = '';
      for (var i = 0; i <= N; i++) {
        var v = xl[0] + (xl[1] - xl[0]) * i / N;
        p += (i ? 'L' : 'M') + X(v).toFixed(2) + ' ' + yD(v, sd).toFixed(2);
      }
      return p;
    }
    el('path', { d: 'M' + X(xl[0]) + ' ' + yAx + curve(c.tau).replace(/^M/, 'L') +
      'L' + X(xl[1]) + ' ' + yAx + 'Z', fill: PAPER.dens }, dens);
    [c.tau_lo, c.tau_hi].forEach(function (sd) {
      el('path', { d: curve(sd), fill: 'none', stroke: '#333', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, dens);
    });
    el('path', { d: curve(c.tau), fill: 'none', stroke: PAPER.ink, 'stroke-width': 1.5 }, dens);
    el('line', { x1: PX, y1: yAx, x2: PX + PW, y2: yAx, stroke: PAPER.ink, 'stroke-width': 1 }, dens);
    var neg = [c.tau, c.tau_lo, c.tau_hi].map(function (sd) { return pnorm(-mu / sd); });
    var nLo = Math.min(neg[1], neg[2]), nHi = Math.max(neg[1], neg[2]);
    function pc(p) { return (100 * p).toFixed(0) + '%'; }
    var FS8 = SFS * 0.8;
    txt(dens, PX - 6, yAx - 3 - FS8 * 3.75, 'True effects across LLMs',
      { 'text-anchor': 'end', 'font-size': FS8, fill: PAPER.ink });
    txt(dens, PX - 6, yAx - 3 - FS8 * 2.5, 'τ = ' + f2(c.tau) + ' [' + f2(c.tau_lo) + ', ' + f2(c.tau_hi) + ']',
      { 'text-anchor': 'end', 'font-size': FS8, 'font-weight': 700, fill: PAPER.ink });
    var iq = el('text', { x: PX - 6, y: yAx + 29, 'text-anchor': 'end', 'font-size': FS8, fill: PAPER.ink }, dens);
    [['I', {}], ['2', { 'baseline-shift': 'super', 'font-size': FS8 * 0.7 }],
     [' = ' + c.I2.toFixed(1) + '%;  Q(' + c.Q_df + ') = ' + thou(c.Q), {}]]
      .forEach(function (p) { var t = el('tspan', p[1]); t.textContent = p[0]; iq.appendChild(t); });
    txt(dens, PX - 6, yAx - 3 - FS8 * 1.25, 'θ < 0: ' + pc(neg[0]) + ' [' + pc(nLo) + ', ' + pc(nHi) + ']',
      { 'text-anchor': 'end', 'font-size': FS8, fill: PAPER.ink });
    txt(dens, PX - 6, yAx - 3, 'θ > 0: ' + pc(1 - neg[0]) + ' [' + pc(1 - nHi) + ', ' + pc(1 - nLo) + ']',
      { 'text-anchor': 'end', 'font-size': FS8, fill: PAPER.ink });
    return { pts: pts, pool: pool, dens: dens };
  }

  function makePaperForest(cfg) {
    return function (mount) {
      var W = 1232, H = 706, s = svg(mount, W, H);   // bare frame: 1280 - 2 x 24 by 720 - 2 x 7
      var cs = cfg.cells.map(cell);
      var n = cs.length, gap = 26, pw = (W - gap * (n - 1)) / n;
      var shared = cfg.perPanel ? null : sharedXlim(cs, 0.03);
      var panels = cs.map(function (c, i) {
        return paperPanel(s, c, { x: i * (pw + gap), w: pw, h: H,
          xlim: shared || sharedXlim([c], 0.03), human: cfg.human,
          letter: 'abc'[i], title: cfg.titles[i] });
      });
      var groups = ['pts', 'pool', 'dens'].map(function (k) { return panels.map(function (p) { return p[k]; }); });
      groups.forEach(function (a) { a.forEach(function (x) { step(x, false); }); });
      return { steps: 3,
        play: function (i) { groups.forEach(function (a, j) { a.forEach(function (x) { step(x, i >= j); }); }); } };
    };
  }
  FIGS.forestCT = makePaperForest({ cells: ['CT-S', 'CT-D'], perPanel: true, human: true,
    titles: ['Stated support', 'Revealed support'] });
  FIGS.forestWealth = makePaperForest({ cells: ['DG-W', 'UG-W', 'TG-W'],
    titles: ['Dictator game', 'Ultimatum game', 'Trust game'] });
  FIGS.forestHuman = makePaperForest({ cells: ['DG-H', 'UG-H', 'TG-H'],
    titles: ['Dictator game', 'Ultimatum game', 'Trust game'] });

  /* ==========================================================
     Exploratory moderation by provider, one panel per cell:
     subgroup-pooled d (95% CI) per provider, with the omnibus Q_M
     test and R^2_meta of that cell's meta-regression.
     ========================================================== */
  function makeProviderMod(cfg) {
    return function (mount) {
      var W = 1180, H = 540, s = svg(mount, W, H);
      var G = [];
      var g00 = g(s); G.push(g00);
      provenance(g00, W, PROV_FULL);
      var mods = cfg.cells.map(moderation), cs = cfg.cells.map(cell);
      var lo = 0, hi = 0;
      mods.forEach(function (m) {
        m.firm.subgroups.forEach(function (r) { lo = Math.min(lo, r.ci_lo); hi = Math.max(hi, r.ci_hi); });
      });
      var pad = 0.04 * (hi - lo); lo -= pad; hi += pad;
      var n = mods.length, gap = 40, pw = (W - gap * (n - 1)) / n;
      var LABW = 112, KW = 68, top = 112, bot = H - 92;
      var firms = D.firmLevels;
      mods.forEach(function (m, pi) {
        var x0 = pi * (pw + gap), PX = x0 + LABW, PWd = pw - LABW - KW;
        var X = function (v) { return PX + PWd * (v - lo) / (hi - lo); };
        var Y = function (i) { return top + i * (bot - top) / (firms.length - 1); };
        var gg = g(s); G.push(gg);
        txt(gg, x0, 52, cfg.titles[pi], { 'font-size': FS.h, 'font-weight': 700 });
        var f = m.firm;
        var st = el('text', { x: x0, y: 82, 'font-size': FS.s, fill: C.ink2 }, gg);
        function ts(t, a) { var e = el('tspan', a || {}); e.textContent = t; st.appendChild(e); }
        ts('Q'); ts('M', { 'baseline-shift': 'sub', 'font-size': 14 });
        ts('(' + f.QM_df + ') = ' + f.QM.toFixed(2) + ',  p ' +
          (f.QM_p < 0.001 ? '< 0.001' : '= ' + f.QM_p.toFixed(3)) + ',  R');
        ts('2', { 'baseline-shift': 'super', 'font-size': 14 });
        ts(' = ' + f.R2.toFixed(1) + '%', f.QM_p < 0.005 ? { 'font-weight': 700, fill: C.struct } : {});
        var yA = bot + 22;
        prettyBreaks(lo, hi, 4).forEach(function (v) {
          el('line', { x1: X(v), y1: top - 16, x2: X(v), y2: yA, stroke: C.grid, 'stroke-width': 1 }, gg);
          txt(gg, X(v), yA + 24, v.toFixed(1).replace('-', '−').replace('−0.0', '0.0'),
            { 'text-anchor': 'middle', 'font-size': FS.s, fill: C.ink2 });
        });
        el('line', { x1: X(lo), y1: yA, x2: X(hi), y2: yA, stroke: C.ink, 'stroke-width': 1 }, gg);
        el('line', { x1: X(0), y1: top - 16, x2: X(0), y2: yA, stroke: C.zero, 'stroke-width': 1.1, 'stroke-dasharray': '5 4' }, gg);
        el('line', { x1: X(cs[pi].pooled_d), y1: top - 16, x2: X(cs[pi].pooled_d), y2: yA,
          stroke: '#000', 'stroke-width': 1.2, 'stroke-opacity': .45 }, gg);
        var byL = {};
        f.subgroups.forEach(function (r) { byL[r.level] = r; });
        firms.forEach(function (fm, i) {
          var r = byL[fm], y = Y(i);
          txt(gg, PX - 12, y + 7, fm, { 'text-anchor': 'end', 'font-size': FS.s, fill: C.ink2 });
          if (!r) return;
          el('line', { x1: X(r.ci_lo), y1: y, x2: X(r.ci_hi), y2: y, stroke: C.ink, 'stroke-width': 2 }, gg);
          el('circle', { cx: X(r.est), cy: y, r: 5, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, gg);
          txt(gg, x0 + pw, y + 7, 'k = ' + r.k, { 'text-anchor': 'end', 'font-size': FS.s, fill: C.faint });
        });
      });
      txt(G[0], W / 2, H - 4, "subgroup-pooled Cohen's d by provider", { 'text-anchor': 'middle', 'font-size': FS.m });
      G.forEach(function (x) { step(x, false); });
      return { steps: G.length, play: function (i) { G.forEach(function (x, j) { step(x, i >= j); }); } };
    };
  }
  FIGS.modHuman = makeProviderMod({ cells: ['DG-H', 'UG-H', 'TG-H'],
    titles: ['Dictator game', 'Ultimatum game', 'Trust game'] });

  /* ==========================================================
     Step adapter. The source figures count play(-1) = nothing,
     play(k) = groups 0..k. Here play(-1) is the reset state and
     play(0) the arrival state (animated in when the slide is entered):
       stepped - group 0 on arrival, one click per further group
                 (steps = groups - 1): play(i) -> source play(i);
                 with skip k, groups 0..k on arrival (steps = groups - 1 - k)
       static  - no clicks (steps 0): the whole figure on arrival
     ========================================================== */
  function reg(id, build, mode, skip) {
    PSD.figures[id] = function (mount) {
      var f = build(mount), k = skip || 0;
      mathify(mount);
      if (mode === 'stepped')
        return { steps: f.steps - 1 - k, play: function (i) { f.play(i < 0 ? -1 : i + k); },
          reset: function () { f.play(-1); } };
      return { steps: 0, play: function (i) { f.play(i >= 0 ? f.steps - 1 : -1); },
        reset: function () { f.play(-1); } };
    };
  }
  reg('llm-design', FIGS.design, 'stepped');
  reg('llm-prompts', FIGS.prompts, 'static');
  reg('llm-pipeline', FIGS.pipeline, 'stepped', 1);   // provenance label and model on arrival, then one stage per click
  reg('llm-panel', FIGS.panel, 'stepped');
  reg('llm-forest-ct', FIGS.forestCT, 'static');
  reg('llm-forest-wealth', FIGS.forestWealth, 'static');
  reg('llm-forest-human', FIGS.forestHuman, 'static');
  reg('llm-mod-human', FIGS.modHuman, 'static');

  /* ==========================================================
     HTML parts: the meta-analysis summary table and the median tau
     ========================================================== */
  function metaTable(host) {
    var cells = D.cells;
    var h = '<table class="booktabs wide meta">';
    h += '<tr class="grp"><th></th><th colspan="2">Carbon tax</th><th colspan="2">Dictator</th>' +
         '<th colspan="2">Ultimatum</th><th colspan="2">Trust</th></tr>';
    h += '<tr class="sub2"><th></th><th>Support</th><th>Donation</th><th>Wealth</th><th>Human</th>' +
         '<th>Wealth</th><th>Human</th><th>Wealth</th><th>Human</th></tr>';
    function row(label, fn, cls) {
      var r = '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + label + '</td>';
      cells.forEach(function (c) { r += '<td>' + fn(c) + '</td>'; });
      return r + '</tr>';
    }
    h += row('<i>τ</i>', function (c) { return f2(c.tau); }, 'em');
    h += row('<i>τ</i> 95% CI', function (c) { return '[' + f2(c.tau_lo) + ',&thinsp;' + f2(c.tau_hi) + ']'; });
    h += row('<i>I</i><sup>2</sup> (%)', function (c) { return c.I2.toFixed(1); });
    h += row('<i>Q</i>', function (c) { return thou(c.Q); });
    h += row('<i>p</i> (<i>Q</i>)', function (c) { return c.Q_p < 0.001 ? '&lt;0.001' : c.Q_p.toFixed(3); });
    h += row('<i>k</i> (LLMs)', function (c) { return c.k + (c.k_dropped ? ' (+' + c.k_dropped + '*)' : ''); });
    h += row('Pooled <i>d</i>', function (c) { return f2(c.pooled_d); }, 'em sub');
    h += row('95% CI', function (c) { return '[' + f2(c.ci_lo) + ',&thinsp;' + f2(c.ci_hi) + ']'; });
    h += row('95% PI', function (c) { return '[' + f2(c.pi_lb) + ',&thinsp;' + f2(c.pi_ub) + ']'; });
    host.innerHTML = h + '</table>';
  }
  PSD.llmHtml = function () {
    document.querySelectorAll('[data-llm-metatable]').forEach(function (h) { if (!h.childElementCount) metaTable(h); });
    var taus = D.cells.map(function (c) { return c.tau; }).sort(function (a, b) { return a - b; });
    var n = taus.length, med = n % 2 ? taus[(n - 1) / 2] : (taus[n / 2 - 1] + taus[n / 2]) / 2;
    document.querySelectorAll('[data-llm-medtau]').forEach(function (e) { e.textContent = med.toFixed(2); });
  };
})();
