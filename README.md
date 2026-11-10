# armando-holzknecht.github.io

Minimal personal academic website. Plain HTML/CSS/JS, no build step.

```
index.html      Home: photo, short bio, 6 most recent output items
output.html     Full output feed (filterable by type)
cv.html         CV (HTML) + link to assets/Holzknecht_CV.pdf
projects.html   Project table with status (filterable)
assets/data.js  <- EDIT THIS to add output items and projects
assets/style.css, assets/main.js, assets/photo.jpg
```

## Updating content
- New paper/talk/teaching/etc.: add an entry to `output` in `assets/data.js`.
- Slides: drop the PDF into `assets/slides/` and add `links: [{ label: "slides", url: "assets/slides/<file>.pdf" }]` to the entry (works for projects too). Same pattern for `osf` / `zenodo` links.
- New project or status change: edit `projects` in `assets/data.js`
  (status: Published | Accepted | Under review | Preprint | Working paper | Data collection | In progress | Crowd project).
- New CV: replace `assets/Holzknecht_CV.pdf` and edit `cv.html`.

## Talks (reveal.js decks)
Each talk is a folder in `talks/`, e.g. `talks/2026-11-esa/index.html` (+ its css/js/img files).
- **Online:** GitHub Pages serves it at `https://<your-site>/talks/2026-11-esa/`
- **Download:** run the zip helper, which creates `talks/2026-11-esa.zip` from every talk folder:
  ```bash
  powershell -ExecutionPolicy Bypass -File scripts/zip-talks.ps1
  ```
- Link both from the talk's entry in `assets/data.js`:
  `links: [{ label: "slides", url: "talks/2026-11-esa/" }, { label: "download", url: "talks/2026-11-esa.zip" }]`

Tips: use lowercase folder names without spaces. Bundle reveal.js locally (no CDN) so the download also works offline.
GitHub rejects single files over 100 MB, so compress videos or host them on YouTube/OSF.
`talks/example-talk/` is a placeholder; delete it (and its zip) once you add a real talk.

## Preview locally
```bash
python -m http.server 8080
```
then open http://localhost:8080

## Publish on GitHub Pages
1. Create a repo named `<your-github-username>.github.io` (public).
2. Push these files:
   ```bash
   git init && git add . && git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<user>/<user>.github.io.git
   git push -u origin main
   ```
3. Repo → Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
4. Site is live at `https://<user>.github.io` within a minute or two.

## Custom domain (later)
1. Buy a domain (e.g. at Namecheap, Cloudflare, INWX, World4You).
2. Create a file `CNAME` in the repo root containing only the domain, e.g. `armandoholzknecht.com`.
3. At your registrar's DNS:
   - `A` records for `@` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - `CNAME` for `www` → `<user>.github.io`
4. Settings → Pages → Custom domain → enter it, then tick "Enforce HTTPS".

## Email on the domain
GitHub Pages only hosts the website; mail is separate. Add your mail provider's
`MX` (and SPF/DKIM `TXT`) records at the same DNS registrar — e.g. Proton Mail,
Fastmail, Google Workspace, Zoho Mail, or the registrar's own mailbox. These
records don't interfere with the GitHub Pages `A`/`CNAME` records.
