(function () {
  var S = window.SITE || { output: [], projects: [] };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmtDate(d) {
    var p = String(d).split("-");
    return p[1] ? MONTHS[parseInt(p[1], 10) - 1] + " " + p[0] : p[0];
  }

  /* links: [{label, url}] -> "[slides] [osf] [zenodo]" */
  function linkList(links, cls) {
    if (!links || !links.length) return "";
    return '<div class="' + cls + '">' + links.map(function (l) {
      var dl = /\.zip$/i.test(l.url) ? " download" : "";
      return '<a href="' + esc(l.url) + '"' + dl + ' target="_blank" rel="noopener">' + esc(l.label) + "</a>";
    }).join("") + "</div>";
  }

  var output = S.output.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });

  /* ---------- Output feed (home + output page) ---------- */
  function renderFeed(el, items) {
    el.innerHTML = items.map(function (o) {
      var title = o.url
        ? '<a class="title" href="' + esc(o.url) + '" target="_blank" rel="noopener">' + esc(o.title) + "</a>"
        : '<span class="title">' + esc(o.title) + "</span>";
      return '<li><div class="date">' + fmtDate(o.date) + "</div><div>" +
        '<span class="tag">' + esc(o.type) + "</span>" + title +
        (o.detail ? '<div class="detail">' + esc(o.detail) + "</div>" : "") +
        linkList(o.links, "flinks") +
        "</div></li>";
    }).join("");
  }

  var feed = document.getElementById("feed");
  if (feed) {
    var limit = parseInt(feed.getAttribute("data-limit") || "0", 10);
    var filterBox = document.getElementById("feed-filters");

    if (filterBox) {
      var types = ["All"].concat(output.map(function (o) { return o.type; })
        .filter(function (t, i, a) { return a.indexOf(t) === i; }));
      filterBox.innerHTML = types.map(function (t, i) {
        return '<button type="button" data-type="' + esc(t) + '" aria-pressed="' + (i === 0) + '">' + esc(t) + "</button>";
      }).join("");
      filterBox.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        filterBox.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        var t = b.getAttribute("data-type");
        renderFeed(feed, t === "All" ? output : output.filter(function (o) { return o.type === t; }));
      });
    }
    renderFeed(feed, limit ? output.slice(0, limit) : output);
  }

  /* ---------- Projects table ---------- */
  var ORDER = ["Published", "Accepted", "Under review", "Preprint", "Working paper", "Data collection", "Pre-registered", "In progress", "Crowd project"];
  var CLS = {
    "Published": "s-published", "Accepted": "s-accepted", "Under review": "s-review", "Preprint": "s-preprint",
    "Working paper": "s-wp", "Data collection": "s-progress", "Pre-registered": "s-progress", "In progress": "s-progress", "Crowd project": "s-wp"
  };

  var tbody = document.getElementById("projects-body");
  if (tbody) {
    var projects = S.projects.slice().sort(function (a, b) {
      var d = ORDER.indexOf(a.status) - ORDER.indexOf(b.status);
      return d !== 0 ? d : (b.year || 0) - (a.year || 0);
    });

    function renderProjects(list) {
      tbody.innerHTML = list.map(function (p) {
        var links = (p.links || []).map(function (l) {
          return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + "</a>";
        }).join("");
        return "<tr>" +
          '<td><div class="p-title">' + esc(p.title) + '</div><div class="p-authors">' + esc(p.authors) + "</div></td>" +
          '<td class="p-year">' + esc(p.year || "") + "</td>" +
          '<td><span class="status ' + (CLS[p.status] || "") + '">' + esc(p.status) + "</span></td>" +
          '<td class="p-venue">' + esc(p.venue || "—") + "</td>" +
          '<td class="p-links">' + (links || '<span class="p-year">—</span>') + "</td>" +
          "</tr>";
      }).join("");
    }

    var pf = document.getElementById("project-filters");
    if (pf) {
      var present = ORDER.filter(function (s) { return projects.some(function (p) { return p.status === s; }); });
      pf.innerHTML = ["All"].concat(present).map(function (s, i) {
        var n = s === "All" ? projects.length : projects.filter(function (p) { return p.status === s; }).length;
        return '<button type="button" data-status="' + esc(s) + '" aria-pressed="' + (i === 0) + '">' + esc(s) + " · " + n + "</button>";
      }).join("");
      pf.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        pf.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        var s = b.getAttribute("data-status");
        renderProjects(s === "All" ? projects : projects.filter(function (p) { return p.status === s; }));
      });
    }
    renderProjects(projects);
  }

  /* ---------- Crowd-science contributions table ---------- */
  var cbody = document.getElementById("contrib-body");
  if (cbody) {
    cbody.innerHTML = (S.contributions || []).slice()
      .sort(function (a, b) { return (b.year || 0) - (a.year || 0); })
      .map(function (p) {
        var links = (p.links || []).map(function (l) {
          return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + "</a>";
        }).join("");
        return "<tr>" +
          '<td><div class="p-title">' + esc(p.title) + "</div>" +
          (p.authors ? '<div class="p-authors">' + esc(p.authors) + "</div>" : "") + "</td>" +
          '<td class="p-year">' + esc(p.year || "") + "</td>" +
          '<td class="p-venue">' + esc(p.venue || "—") + "</td>" +
          '<td class="p-links">' + (links || '<span class="p-year">—</span>') + "</td>" +
          "</tr>";
      }).join("");
  }

  /* ---------- Name reveal (home) ---------- */
  var reveal = document.querySelector(".reveal");
  if (reveal) {
    var txt = reveal.textContent;
    reveal.innerHTML = txt.split("").map(function (c, i) {
      return '<span class="ch" aria-hidden="true" style="animation-delay:' + (150 + i * 45) + 'ms">' + esc(c) + "</span>";
    }).join("");
  }

  /* ---------- Footer year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
