# Deployment (GitHub Pages)

**Why GitHub Pages:** free, HTTPS by default, ideal for a static site (HTML/CSS/JS only, no server needed).

## Steps
1. Create a **private** repo on GitHub, e.g. `alberta-trails`. (Private-repo Pages needs a paid plan or GitHub Education; if unavailable, use a public repo since no secrets are stored.)
2. In VS Code terminal:
   ```
   git init
   git add .
   git commit -m "v1.0.0 fixed and refactored"
   git branch -M main
   git remote add origin https://github.com/<user>/alberta-trails.git
   git push -u origin main
   ```
3. Repo **Settings > Pages > Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder `/ (root)` > **Save**.
4. Wait about 1 minute. Live URL: `https://<user>.github.io/alberta-trails/`
5. Tick **Enforce HTTPS** in Settings > Pages (GitHub redirects http to https automatically).
6. Verify: open DevTools > Console/Security. No mixed-content warnings; all requests are `https://`.

## Optimise before deploy
Images compressed to WebP, Bootstrap/jQuery removed, CSS/JS in separate files (cached and minifiable). Files use `?v=` for cache-busting; bump the number each release (a `Cache-Control` meta tag is invalid HTML5, so versioning is used instead).

## Secrets / API keys
- Open-Meteo needs **no key**.
- If a key is added later (e.g. Google Analytics ID, paid API): never commit it. Store it under **Settings > Secrets and variables > Actions** and inject it in a GitHub Actions deploy step; add `.env` to `.gitignore`. Note: anything shipped to a browser is public, so keep truly secret keys on a server/proxy.

## Mobile verification (DevTools > Device toolbar)
| Size | Result |
|---|---|
| 360 × 640 | No horizontal scroll, text readable, hero image fits, video scales |
| 414 × 896 | Same; layout intact |
Touch: inputs/button are at least 44 px tall, no hover-only actions, tapping the form works. Evidence: `evidence/mobile-360.png`, `evidence/mobile-414.png`.

## Redirects
GitHub Pages handles http to https. For a custom 404, add `404.html` in the root.
