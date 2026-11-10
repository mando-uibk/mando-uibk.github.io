/* ESS example cards (pilot paper S6350, von dem Knesebeck & Geyer 2007): the pages of a card PDF,
   stacked in a scroll box (page images and sizes: cards.json, made by build/render_cards.py).
   Step 0 shows the top of the card; every further click scrolls one stop down, the stops evenly spaced
   from top to bottom (opts.steps, chosen so that one stop is less than a screen height).
   The mouse wheel or trackpad scrolls freely in between. */
(function () {
  PSD.figures['ess-card'] = function (mount, opts) {
    const card = PSD.data.cards.cards[opts.card];
    const steps = opts.steps;
    const box = document.createElement('div');
    box.className = 'cardscroll';
    card.pages.forEach(function (p, i) {
      const img = document.createElement('img');
      img.className = 'sheet';
      img.src = p.src;
      img.width = p.w;
      img.height = p.h;
      img.alt = card.title + ', page ' + (i + 1);
      img.draggable = false;
      box.appendChild(img);
    });
    mount.appendChild(box);

    const st = PSD.stepper();
    st.add(box, 'fade', 0);

    function stopTop(k) {
      const max = Math.max(0, box.scrollHeight - box.clientHeight);
      return Math.round(k / steps * max);
    }
    function play(i) {
      const hidden = box.classList.contains('off');
      st.apply(i);
      const k = Math.max(0, Math.min(i, steps));
      box.dataset.stop = String(k);
      const top = stopTop(k);
      const instant = hidden || PSD.qaStatic || document.documentElement.classList.contains('qa-static');
      if (instant) box.scrollTop = top;
      else box.scrollTo({ top: top, behavior: 'smooth' });
    }
    function reset() {
      st.apply(-1);
      box.dataset.stop = '0';
      box.scrollTop = 0;
    }
    reset();
    return { steps: steps, play: play, reset: reset };
  };
})();
