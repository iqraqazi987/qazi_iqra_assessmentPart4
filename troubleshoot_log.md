# Troubleshoot Log

Tested in VS Code (Live Server) + Chrome DevTools (Console, Network, Elements, Lighthouse). Evidence = screenshots in `/evidence`.

## Baseline run (original script, unchanged)
Opened the original `index.html` unchanged in VS Code (Live Server) and captured: Console errors (`evidence/00-console-before.png`), Network failures/HTTP warnings (`evidence/00-network-before.png`), Lighthouse report (`evidence/00-lighthouse-before.png`), and Application > Cookies showing missing Secure/SameSite flags (`evidence/00-cookies-before.png`).

| Issue | Fix & Evidence Link |
|---|---|
| 1. `<html>` had no `lang` (accessibility/SEO) | Added `lang="en"`. [evidence/01-lighthouse-before-after.png](evidence/01-lighthouse-before-after.png) |
| 2. Title "Trails" and no meta description (poor SEO) | Descriptive title + meta description. [evidence/02-seo.png](evidence/02-seo.png) |
| 3. Viewport meta missing quotes / `initial-scale` | `content="width=device-width, initial-scale=1"` quoted. [evidence/03-viewport.png](evidence/03-viewport.png) |
| 4. `Cache-Control: max-age=31536000` meta forced stale cache (a one-year cache) | Removed the meta tag. Also found by the W3C validator: `Cache-Control` is not a valid `http-equiv` value in HTML5 (caching is controlled by server HTTP headers, which GitHub Pages sets itself at about 10 min). Fix: CSS and JS now load as `styles.css?v=1.0.0` / `main.js?v=1.0.0`; bumping the version each release forces browsers to re-download. Cleared cache (DevTools > Application > Clear site data, hard reload) and confirmed 200, not "from disk cache", in Network. [evidence/04-cache.png](evidence/04-cache.png), [evidence/04b-validator-error.png](evidence/04b-validator-error.png) |
| 5. Bootstrap 3.3.7 `@import` inside `<style>` (150 kB unused, render-blocking, outdated) | Removed; ~25 lines of own CSS in `css/styles.css`. Page weight and requests dropped. [evidence/05-network-size.png](evidence/05-network-size.png) |
| 6. Conflicting `body{margin:0}` / `body{margin:8px}` | Single rule `margin:0;padding:8px`. [evidence/06-elements.png](evidence/06-elements.png) |
| 7. 1 MB `hero.png`, no modern formats | Replaced with compressed `mobile/desktop.webp` + `.jpg` fallback via `image-set` (see Image compression below). [evidence/07-images.png](evidence/07-images.png) |
| 7b. Media query backwards (`min-width:768px` loaded *mobile.jpg*) and `.background` class unused | Mobile-first: mobile image by default, desktop image at `min-width:768px`; merged into `.hero`. [evidence/07b-responsive.png](evidence/07b-responsive.png) |
| 8. jQuery 2.0.0 loaded over **HTTP** (mixed content, blocking, vulnerable) | jQuery removed completely (not needed); script now local with `defer`. Plug-in/library update = outdated jQuery replaced by vanilla JS. [evidence/08-mixed-content.png](evidence/08-mixed-content.png) |
| 9. Slider plugin set insecure cookie, ran before DOM existed | One `setCookie()` helper: `Secure; SameSite=Strict; Max-Age; Path=/`. Verified in DevTools > Application > Cookies. [evidence/09-cookies.png](evidence/09-cookies.png) |
| 10.1 Global `weatherData` | Removed; all code inside an IIFE with `'use strict'`. [evidence/10-console.png](evidence/10-console.png) |
| 10.2 HTTP fetch, no error handling, `innerText` wiped the hero markup, nonsense `dewpoint` var, wrong longitude (`115` instead of `-115`) | HTTPS Open-Meteo URL, `async/await` + `try/catch/finally`, 8 s `AbortController` timeout, writes to a dedicated `<p id="weather">` with `textContent`. Verified with breakpoints and step-through in Sources panel; tested offline mode to see fallback message. [evidence/10-2-breakpoint.png](evidence/10-2-breakpoint.png) |
| 10.3 Unused `validate()`, insecure `contact` cookie, `console.log(FormData)` unreadable | Real validation with `checkValidity()`, visible status message, secure cookie. [evidence/10-3-form.png](evidence/10-3-form.png) |
| 10.4 `setInterval` logging every second forever | Removed. Console now clean. [evidence/10-4-console-clean.png](evidence/10-4-console-clean.png) |
| 10.5 Unused `oldHelper()` | Deleted dead code. |
| 11. Logo missing `alt`, unoptimised PNG | Added alt, width/height (no layout shift), WebP with PNG fallback. [evidence/11-logo.png](evidence/11-logo.png) |
| 11b. Broken tags: `</headerscript ...>`, `</iframemain>`, `<script ...script>`, `</bodyhtml>`, `</lili>`, `labelli` | Rewrote all broken tags; HTML validates at validator.w3.org. [evidence/11b-validator.png](evidence/11b-validator.png) |
| 12. `<form>` inside `<ul>` (invalid) and unlabelled inputs | Form is a normal block with `label for`/`id`, `type="email"`, `autocomplete`. [evidence/12-form.png](evidence/12-form.png) |
| 13. YouTube embed tracks users; fixed 600 px width overflowed phones | `youtube-nocookie.com`, `loading="lazy"`, `title`, responsive 16:9 wrapper. [evidence/13-iframe-mobile.png](evidence/13-iframe-mobile.png) |
| 14. Google Tag script had no `https://` (404 relative URL) and was duplicated | Removed the broken tags. Analytics is optional; see maintenance_plan.md for adding GA4 with `https://www.googletagmanager.com/gtag/js?id=ID`. [evidence/14-network-404.png](evidence/14-network-404.png) |
| 15. `role="banner"` / `role="contentinfo"` redundant | Removed; native `<header>`/`<footer>` already carry the roles. |

## Image compression
```
cwebp -q 75 -resize 1600 0 desktop.jpg -o desktop.webp
cwebp -q 75 -resize 800 0 mobile.jpg -o mobile.webp
cwebp -q 80 logo.png -o logo.webp
```
(or squoosh.app). Result: hero 1 MB -> under 100 kB.

## Final verification
Validator: no errors after removing the invalid meta. Hard reload with cache disabled: **0 console errors, 0 failed requests, 0 mixed-content warnings.** Lighthouse re-run after fixes. [evidence/final-lighthouse.png](evidence/final-lighthouse.png)
