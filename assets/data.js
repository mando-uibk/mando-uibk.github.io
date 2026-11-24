/*
  ============================================================
  SITE DATA — edit this file to update the website.
  ============================================================

  OUTPUT  (shown on "Output" page; the newest 6 also appear on the home page)
    date:   "YYYY-MM" or "YYYY"   (used for sorting, newest first)
    type:   Paper | Preprint | Talk | Grant | Event | Contribution (crowd-science projects, non core-team)
    title:  main line
    detail: optional grey second line
    url:    optional link on the title
    links:  optional list of extra links, shown as [slides] [osf] [zenodo]

    Example talk with a reveal.js deck:
      1. copy the deck folder to  talks/2026-11-esa/   (its index.html must be at the top of that folder)
      2. run  scripts\zip-talks.ps1   -> creates talks/2026-11-esa.zip
      3. add:
      { date: "2026-11", type: "Talk", title: "My talk", detail: "Conference, City",
        links: [ { label: "slides",   url: "talks/2026-11-esa/" },        // opens the deck online
                 { label: "download", url: "talks/2026-11-esa.zip" } ] }, // downloads the whole deck

    Example talk with PDF slides — put the PDF in assets/slides/:
        links: [ { label: "slides (pdf)", url: "assets/slides/2026-11-conference.pdf" } ]

  PROJECTS  (shown in the table on "Projects")
    status must be one of:
      "Published" | "Accepted" | "Under review" | "Preprint" | "Working paper" |
      "Data collection" | "Pre-registered" | "In progress" | "Crowd project"
    links: [ { label: "paper" | "preprint" | "osf" | "zenodo" | "slides" | ..., url: "..." } ]
*/

window.SITE = {
  output: [
    { date: "2026-11", type: "Talk", title: "Large Language Models as Synthetic Populations: Quantifying Between-LLM Heterogeneity", detail: "with C. König-Kersting, D. Valenta · Leibniz Open Science Day 2026, Berlin",
      links: [{ label: "slides", url: "talks/2026-11-leibniz-osd/" }, { label: "pdf", url: "talks/2026-11-leibniz-osd/Holzknecht_LeibnizOSD2026.pdf" }, { label: "download", url: "talks/2026-11-leibniz-osd.zip" }, { label: "osf", url: "https://osf.io/k7fnh" }] },
    { date: "2026-11", type: "Talk", title: "From carbon pricing support to AI in meta-science", detail: "Research seminar, MBS School of Business",
      links: [{ label: "slides", url: "talks/2026-11-mbs/" }, { label: "pdf", url: "talks/2026-11-mbs/Holzknecht_MBS_ResearchTalk.pdf" }, { label: "download", url: "talks/2026-11-mbs.zip" }, { label: "Carbon Pricing Projects", url: "talks/2026-11-carbon-pricing/" }] },
    { date: "2026-04", type: "Paper", title: "Fifty-five Crowdsourced Designs Assessing Carbon Pricing Support in the U.S.", detail: "with R. Schwaiger, J. Huber, E. Blanco, M. Kirchler + 100+ co-authors · #ManyDesignsCarbon · Nature Human Behaviour (forthcoming)", url: "https://doi.org/10.21203/rs.3.rs-8797610/v1", links: [{ label: "preprint", url: "https://doi.org/10.21203/rs.3.rs-8797610/v1" }, { label: "osf", url: "https://osf.io/ujvdn" }] },
    { date: "2026-06", type: "Contribution", title: "ManyLabsDACH", detail: "Innsbruck EconLab site · with M. Stefan, M. Walzl", links: [{ label: "zenodo", url: "https://zenodo.org/records/23620402" }] },
    { date: "2026-04", type: "Contribution", title: "Reproducibility and robustness of economics and political science research", detail: "Brodeur et al. (347 authors) · Nature", url: "https://doi.org/10.1038/s41586-026-10251-x" },
    { date: "2026-03", type: "Paper", title: "From individual choices to the four-eyes principle: The big robber game revisited among financial professionals and students", detail: "with S. Bachler, J. Huber, M. Kirchler · Journal of Economic Psychology 113, 102885", url: "https://doi.org/10.1016/j.joep.2026.102885", links: [{ label: "osf", url: "https://osf.io/t5rcv" }] },
    { date: "2026-02", type: "Preprint", title: "What Do Replicability and Robustness Reveal About True Effects?", detail: "with F. Holzmeister, M. Johannesson · SSRN", url: "https://doi.org/10.2139/ssrn.7329458", links: [{ label: "osf", url: "https://osf.io/ezfv3" }, { label: "replication kit", url: "https://zenodo.org/records/23973504" }] },
    { date: "2026-01", type: "Grant", title: "Early Stage Funding, Universität Innsbruck", detail: "€ 12,000" },
    { date: "2025-11", type: "Paper", title: "Speculating in zero-value assets: The greater fool game experiment", detail: "with J. Huber, M. Kirchler, T. Neugebauer · European Economic Review 180, 105180", url: "https://doi.org/10.1016/j.euroecorev.2025.105180", links: [{ label: "osf", url: "https://osf.io/gszbw" }] },
    { date: "2025-09", type: "Talk", title: "#ManyDesignsCarbon", detail: "ESA Europe Meeting, Brno · EF 2025, Maastricht · SABE 2025, Trento" },
    { date: "2025-07", type: "Talk", title: "Speculation in zero-value assets: The greater fool game experiment", detail: "SABE Early-Career Researcher Workshop, Trento" },
    { date: "2025-06", type: "Event", title: "8th Lindau Nobel Laureate Meeting in Economic Sciences", detail: "Lindau, Germany" },
    { date: "2025", type: "Contribution", title: "#ManyDaughters", url: "https://www.manydaughters.com/" },
    { date: "2024-12", type: "Paper", title: "Covariates of behavioral consistency among adolescents", detail: "with M. Aschenwald, M. Kirchler, M. Razen · Journal of Behavioral and Experimental Finance 44, 100986", url: "https://doi.org/10.1016/j.jbef.2024.100986", links: [{ label: "osf", url: "https://osf.io/wxvc9" }] },
    { date: "2024-06", type: "Talk", title: "Speculation in zero-value assets: The greater fool game experiment", detail: "Experimental Finance Conference 2024, Stavanger · IDS Workshop, Innsbruck · PhD Seminar, Innsbruck" },
    { date: "2024-05", type: "Talk", title: "The effects of uncertainty around ESG-ratings on retail investors' preferences", detail: "with A. Erhart · Climate Action Workshop 2024, Innsbruck (presented as \"Risk, return and ESG preferences among retail investors\")" },
    { date: "2024", type: "Contribution", title: "Replication Ring for Priming · WoCCAP · Innsbruck Replication Games", url: "https://osf.io/ysnmg", links: [{ label: "osf: replication games report", url: "https://osf.io/kugbs" }] },
    { date: "2023-07", type: "Talk", title: "The Big Robber Game revisited among Financial Professionals and Students", detail: "ESA World Meeting, Lyon · Experimental Finance Conference, Sofia · IDS & SFB Workshops, Innsbruck" }
  ],

  projects: [
    /* ---------- published ---------- */
    {
      title: "From individual choices to the four-eyes principle: The big robber game revisited among financial professionals and students",
      authors: "Holzknecht, Bachler, Huber, Kirchler",
      year: 2026, status: "Published", venue: "Journal of Economic Psychology",
      links: [{ label: "paper", url: "https://doi.org/10.1016/j.joep.2026.102885" }, { label: "osf", url: "https://osf.io/t5rcv" }]
    },
    {
      title: "Speculating in zero-value assets: The greater fool game experiment",
      authors: "Holzknecht, Huber, Kirchler, Neugebauer",
      year: 2025, status: "Published", venue: "European Economic Review",
      links: [{ label: "paper", url: "https://doi.org/10.1016/j.euroecorev.2025.105180" }, { label: "osf", url: "https://osf.io/gszbw" }]
    },
    {
      title: "Covariates of behavioral consistency among adolescents",
      authors: "Aschenwald, Holzknecht, Kirchler, Razen",
      year: 2024, status: "Published", venue: "Journal of Behavioral and Experimental Finance",
      links: [{ label: "paper", url: "https://doi.org/10.1016/j.jbef.2024.100986" }, { label: "osf", url: "https://osf.io/wxvc9" }]
    },

    /* ---------- preprints / working papers ---------- */
    {
      title: "What do replicability and robustness reveal about true effects?",
      authors: "Holzknecht, Holzmeister, Johannesson",
      year: 2026, status: "Preprint", venue: "SSRN",
      links: [{ label: "ssrn", url: "https://doi.org/10.2139/ssrn.7329458" }, { label: "osf", url: "https://osf.io/ezfv3" }, { label: "replication kit", url: "https://zenodo.org/records/23973504" }]
    },
    {
      title: "Fifty-five Crowdsourced Designs Assessing Carbon Pricing Support in the U.S. (#ManyDesignsCarbon)",
      authors: "Holzknecht, Schwaiger, Huber, Blanco, Kirchler + 100+ co-authors",
      year: 2026, status: "Accepted", venue: "Nature Human Behaviour (forthcoming)",
      links: [{ label: "preprint", url: "https://doi.org/10.21203/rs.3.rs-8797610/v1" }, { label: "osf", url: "https://osf.io/ujvdn" }]
    },
    {
      title: "The effects of uncertainty around ESG-ratings on retail investors' preferences: Experimental evidence",
      authors: "Erhart, Holzknecht · earlier title: \"Risk, return and ESG preferences among retail investors\"",
      year: 2025, status: "Working paper", venue: "",
      links: []
    },

    /* ---------- ongoing ---------- */
    {
      title: "The ESS replication project: Replicating observational studies with the European Social Survey",
      authors: "Holzknecht, Holzmeister, Johannesson, Neyse",
      year: 2026, status: "Pre-registered", venue: "",
      links: [{ label: "pap", url: "https://zenodo.org/records/23187422" }, { label: "stage 1", url: "https://zenodo.org/records/23910694" }]
    }

  ],

  /* CONTRIBUTIONS to crowd-science projects (non core-team member) — shown in a separate table on Projects */
  contributions: [
    {
      title: "ManyLabsDACH",
      authors: "Registered by Holzknecht, Stefan, Walzl (Innsbruck EconLab)",
      year: 2026, venue: "Pre-registered (2026)",
      links: [{ label: "zenodo", url: "https://zenodo.org/records/23620402" }]
    },
    {
      title: "Reproducibility and robustness of economics and political science research",
      authors: "Brodeur et al. (347 authors, incl. Holzknecht) · working paper: \"Mass reproducibility and replicability: A new hope\"",
      year: 2026, venue: "Nature",
      links: [
        { label: "paper", url: "https://doi.org/10.1038/s41586-026-10251-x" },
        { label: "working paper", url: "https://doi.org/10.2139/ssrn.4790780" },
        { label: "i4r", url: "https://ideas.repec.org/p/zbw/i4rdps/107.html" }
      ]
    },
    {
      title: "#ManyDaughters: Impact of having daughters on attitudes, preferences, and behaviors",
      authors: "Coordinators: Albrecht, Baillon, Dreber, Holzmeister, Imai, Johannesson, Neyse, Toussaert",
      year: 2025, venue: "Pre-registered (2025) · analysis ongoing",
      links: [
        { label: "website", url: "https://www.manydaughters.com/" },
        { label: "timeline", url: "https://www.manydaughters.com/timeline" }
      ]
    },
    {
      title: "Wisdom of the Crowd: Crowd Analysis Project (WoC-CAP)",
      authors: "Crowd analysis of forecast-aggregation mechanisms",
      year: 2024, venue: "Competition completed (results 2025)",
      links: [
        { label: "website", url: "https://woccap.com/" },
        { label: "results", url: "https://woccap.com/results/" }
      ]
    },
    {
      title: "Replication Games report on Altmann et al. (2022)",
      authors: "Replication Games team",
      year: 2024, venue: "Institute for Replication",
      links: [{ label: "osf", url: "https://osf.io/kugbs" }]
    },
    {
      title: "Replication ring for priming",
      authors: "Multi-lab replication of priming effects",
      year: 2024, venue: "Ongoing",
      links: [{ label: "osf", url: "https://osf.io/ysnmg" }]
    }
  ]
};
