/* ============================================================
   PSD core - helpers + figure step driver
   Contract:
     PSD.figures['id'] = function(mount, opts){ return { steps:N, play(i), reset() }; };
   <section data-fig="id" [data-fig-opts='{"k":"v"}']> + <div class="figmount">
   + hidden driver divs <div class="fragment" data-figstep="n"> drive the steps.
   Text never animates: only figures step. play(i) is idempotent and reversible.
   ============================================================ */
(function () {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const PSD = (window.PSD = window.PSD || {});
  PSD.figures = PSD.figures || {};

  PSD.palette = {
    dark: '#23373B', dark2: '#1A2A2D', ink: '#39494d', muted: '#70807f',
    accent: '#EB811B', accentSoft: '#F5AF63', green: '#14B03D',
    line: '#DCE0E0', grid: '#E6EAEA', bg: '#FAFAFA', card: '#FFFFFF',
    cat: ['#7E979B', '#EB811B', '#23373B', '#F5AF63', '#B4C5C7'],
    err: '#1A2A2D'
  };

  function el(tag, attrs, parent) {
    const n = document.createElementNS(SVGNS, tag);
    if (attrs) for (const k in attrs) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'cls') n.setAttribute('class', attrs[k]);
      else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(n);
    return n;
  }
  function svg(mount, vbW, vbH) {
    mount.innerHTML = '';
    const s = el('svg', { viewBox: `0 0 ${vbW} ${vbH}`, preserveAspectRatio: 'xMidYMid meet' }, mount);
    s.style.width = '100%'; s.style.height = '100%';
    return s;
  }
  PSD.el = el; PSD.svg = svg; PSD.SVGNS = SVGNS;

  PSD.scale = function (d0, d1, r0, r1) {
    const m = (r1 - r0) / (d1 - d0);
    const f = v => r0 + (v - d0) * m;
    f.domain = [d0, d1]; f.range = [r0, r1];
    f.invert = p => d0 + (p - r0) / m;
    return f;
  };

  /* Multi-line SVG text: lines = array of strings; returns <text>. */
  PSD.mtext = function (parent, x, y, lines, attrs, lh) {
    const t = el('text', Object.assign({ x: x, y: y }, attrs || {}), parent);
    (Array.isArray(lines) ? lines : String(lines).split('\n')).forEach((ln, i) => {
      el('tspan', { x: x, dy: i ? (lh || 1.2) + 'em' : 0, text: ln }, t);
    });
    return t;
  };

  /* Text with italic segments: parts = [['p', true], ['-hacking', false]] */
  PSD.richText = function (parent, x, y, parts, attrs) {
    const t = el('text', Object.assign({ x: x, y: y }, attrs || {}), parent);
    parts.forEach(p => {
      const s = typeof p === 'string' ? [p, false] : p;
      const sp = el('tspan', { text: s[0] }, t);
      if (s[1] === true || s[1] === 'i') sp.setAttribute('font-style', 'italic');
      if (s[1] === 'sub') { sp.setAttribute('baseline-shift', 'sub'); sp.setAttribute('font-size', '75%'); }
      if (s[1] === 'sup') { sp.setAttribute('baseline-shift', 'super'); sp.setAttribute('font-size', '75%'); }
      if (s[1] === 'b') sp.setAttribute('font-weight', 600);
    });
    return t;
  };

  /* Math text in a serif math font (the self-hosted Fira subset has no Greek).
     tokens: strings (upright) or {b, hat, prime, star, sup, sub, up} -> italic base with scripts */
  PSD.MATHFONT = "'Cambria Math','Cambria','STIX Two Math','Times New Roman',serif";
  PSD.math = function (parent, x, y, tokens, attrs) {
    const t = el('text', Object.assign({ x: x, y: y, style: 'font-family:' + PSD.MATHFONT }, attrs || {}), parent);
    const isLetters = s => /[A-Za-z]/.test(s) && !/^[0-9]+$/.test(s);
    tokens.forEach(tk => {
      if (typeof tk === 'string') { el('tspan', { text: tk }, t); return; }
      const base = tk.b + (tk.hat ? '̂' : '') + (tk.prime ? '′' : '');
      el('tspan', { 'font-style': tk.up ? 'normal' : 'italic', text: base }, t);
      if (tk.sup) el('tspan', { 'font-size': '70%', 'baseline-shift': 'super', 'font-style': isLetters(tk.sup) ? 'italic' : 'normal', text: tk.sup }, t);
      if (tk.sub) {
        const sp = el('tspan', { 'font-size': '70%', 'baseline-shift': 'sub', 'font-style': 'italic', text: tk.sub }, t);
        if (tk.sup) sp.setAttribute('dx', (-0.42 * tk.sup.length) + 'em');
      }
    });
    return t;
  };
  /* "CO2" with subscript 2 for SVG text */
  PSD.co2 = function (parent, x, y, before, after, attrs) {
    const t = el('text', Object.assign({ x: x, y: y }, attrs || {}), parent);
    if (before) el('tspan', { text: before + 'CO' }, t); else el('tspan', { text: 'CO' }, t);
    el('tspan', { 'font-size': '72%', dy: '0.22em', text: '2' }, t);
    el('tspan', { dy: '-0.22em', text: after || '' }, t);
    return t;
  };

  /* Hatch pattern (diagonal stripes) */
  PSD.hatch = function (s, id, color, bg, angle, gap, w) {
    let defs = s.querySelector('defs') || el('defs', null, s);
    const p = el('pattern', { id: id, patternUnits: 'userSpaceOnUse', width: gap, height: gap,
      patternTransform: `rotate(${angle})` }, defs);
    el('rect', { x: 0, y: 0, width: gap, height: gap, fill: bg }, p);
    el('rect', { x: 0, y: 0, width: w, height: gap, fill: color }, p);
    return `url(#${id})`;
  };

  /* ---------- Step animation system ----------
     Every animated node gets class "fx fx-<kind>"; its state is the class "off".
     Transitions live in theme.css (one motion vocabulary deck-wide) and are
     killed by html.qa-static for deterministic captures.
     kinds: fade, up, left, growx, growxr, growy, growc, pop, draw, dim, hl
     item: {node, kind, step, until, delay} -> shown when step <= i < until */
  PSD.stepper = function () {
    const items = [];
    const api = {
      add(node, kind, step, opt) {
        opt = opt || {};
        if (!node) return node;
        node.classList.add('fx', 'fx-' + kind);
        items.push({ node: node, kind: kind, step: step, until: opt.until == null ? Infinity : opt.until,
          delay: opt.delay || 0 });
        return node;
      },
      apply(i) {
        items.forEach(it => {
          const on = i >= it.step && i < it.until;
          if (it.kind === 'dim' || it.kind === 'hl') {
            it.node.classList.toggle('is-on', on);
          } else {
            it.node.classList.toggle('off', !on);
          }
          it.node.style.transitionDelay = on ? it.delay + 's' : '0s';
        });
      },
      get max() { return items.reduce((m, it) => Math.max(m, isFinite(it.step) ? it.step : 0), 0); }
    };
    return api;
  };
  /* Standard controller from a stepper */
  PSD.ctrl = function (st, steps) {
    st.apply(-1);
    return { steps: steps != null ? steps : st.max, play: i => st.apply(i), reset: () => st.apply(-1) };
  };

  /* Uniform error bar (white halo + dark line + caps), horizontal or vertical */
  PSD.errbarH = function (parent, y, xLo, xHi, o) {
    o = o || {};
    const cap = o.cap == null ? 6 : o.cap, g = el('g', null, parent);
    const col = o.color || PSD.palette.err, w = o.width || 2;
    el('line', { x1: xLo, y1: y, x2: xHi, y2: y, stroke: col, 'stroke-width': w }, g);
    if (cap) {
      el('line', { x1: xLo, y1: y - cap, x2: xLo, y2: y + cap, stroke: col, 'stroke-width': w }, g);
      el('line', { x1: xHi, y1: y - cap, x2: xHi, y2: y + cap, stroke: col, 'stroke-width': w }, g);
    }
    return g;
  };

  PSD.fmt = function (v, d) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(d == null ? 2 : d); };

  /* ---------- Driver ---------- */
  const instances = new Map();

  function ensureInstance(section) {
    if (instances.has(section)) return instances.get(section);
    const id = section.getAttribute('data-fig');
    const mount = section.querySelector('.figmount');
    if (!id || !mount || !PSD.figures[id]) { instances.set(section, null); return null; }
    let extra = {};
    try { extra = JSON.parse(section.getAttribute('data-fig-opts') || '{}'); } catch (e) { console.error(e); }
    let ctrl = null;
    try { ctrl = PSD.figures[id](mount, Object.assign({ animate: true, palette: PSD.palette }, extra)); }
    catch (e) { console.error('figure build failed:', id, e); }
    instances.set(section, ctrl);
    return ctrl;
  }
  PSD.instanceOf = function (section) { return ensureInstance(section); };

  function maxStepShown(section) {
    let mx = 0;
    section.querySelectorAll('.fragment.visible[data-figstep]').forEach(f => {
      mx = Math.max(mx, +f.getAttribute('data-figstep'));
    });
    return mx;
  }

  PSD.buildAll = function () {
    document.querySelectorAll('section[data-fig]').forEach(function (sec) {
      const ctrl = ensureInstance(sec);
      if (ctrl) try { ctrl.play(ctrl.steps || 0); } catch (e) { console.error(e); }
    });
  };

  /* Hidden figure drivers get their fragment index from data-figstep. */
  PSD.prepareFragments = function () {
    document.querySelectorAll('.reveal > .slides > section').forEach(function (sec) {
      var drivers = Array.prototype.slice.call(sec.querySelectorAll('.fragment[data-figstep]'));
      drivers.sort(function (a, b) {
        return (+a.getAttribute('data-figstep')) - (+b.getAttribute('data-figstep'));
      });
      drivers.forEach(function (d) {
        if (!d.hasAttribute('data-fragment-index')) d.setAttribute('data-fragment-index', d.getAttribute('data-figstep'));
      });
    });
  };

  /* run fn once, after two animation frames or a timer (rAF never fires in hidden tabs) */
  function later(fn, ms) {
    let done = false;
    const go = () => { if (!done) { done = true; fn(); } };
    setTimeout(() => {
      requestAnimationFrame(() => requestAnimationFrame(go));
      setTimeout(go, 90);
    }, ms || 0);
  }

  PSD.initDriver = function (deck) {
    let token = 0;
    function sync(section, entering) {
      const ctrl = ensureInstance(section);
      if (!ctrl) return;
      const defined = section.querySelectorAll('.fragment[data-figstep]').length;
      const step = defined ? maxStepShown(section) : (ctrl.steps || 0);
      try {
        if (entering && !PSD.qaStatic) {
          const my = ++token;
          ctrl.reset();
          later(() => { if (my === token && deck.getCurrentSlide() === section) ctrl.play(maxStepShown(section) || (defined ? 0 : ctrl.steps || 0)); }, 260);
        } else {
          ctrl.play(step);
        }
      } catch (e) { console.error(e); }
    }
    deck.on('ready', e => { if (e.currentSlide.hasAttribute('data-fig')) sync(e.currentSlide, true); });
    deck.on('slidechanged', e => { if (e.currentSlide.hasAttribute('data-fig')) sync(e.currentSlide, true); });
    deck.on('fragmentshown', e => {
      const sec = e.fragment.closest('section');
      if (sec && sec.hasAttribute('data-fig')) sync(sec, false);
    });
    deck.on('fragmenthidden', e => {
      const sec = e.fragment.closest('section');
      if (sec && sec.hasAttribute('data-fig')) sync(sec, false);
    });
  };
})();
