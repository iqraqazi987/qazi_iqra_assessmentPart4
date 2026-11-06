# Maintenance Plan: Explore Alberta Trails

**Monitoring (performance and errors)**
- Performance: run Lighthouse (DevTools) and PageSpeed Insights monthly; targets: Performance ≥ 90, LCP < 2.5 s.
- Errors: `js/main.js` logs all uncaught errors and failed promises with a `[monitor]` prefix; check the Console after each release. Optional: add Google Analytics 4 / Sentry free tier for real-user error tracking (ID kept out of the repo).
- Uptime: free UptimeRobot check on the live URL (email alert if down).
- Weather API: failures show a friendly fallback message and are logged.

**Quarterly checks (Jan / Apr / Jul / Oct)**
- Update or replace libraries and review deprecated APIs (the site currently has no external libraries).
- Re-test in latest Chrome, Firefox, Safari, Edge and at 360×640 and 414×896.
- Re-run Lighthouse and the HTML validator; fix broken links and Open-Meteo API changes.
- Re-compress any new images (WebP, under 150 kB).
- Clear cache/cookies and reload to confirm no stale files.

**After every release**
- Verify cookie flags: DevTools > Application > Cookies; `lastSlide` and `contact` must show **Secure** and **SameSite=Strict**.
- Bump `?v=` on CSS/JS, hard reload, confirm no console errors, no mixed content.
- Update the changelog (git commit message + `troubleshoot_log.md`).

**Rollback steps**
1. `git log --oneline` to find the last good commit.
2. `git revert <bad-commit>` then `git push` (or `git reset --hard <good>` and force-push if needed).
3. Wait about 1 minute for Pages to redeploy; hard reload and re-check console.
4. Record the cause in the log.

**Future enhancements**
- Trail list with search/filter and maps; real contact backend (Formspree/serverless) with server-side validation and HttpOnly cookies.
- Cookie consent banner before enabling analytics.
- Service worker for offline use; automated Lighthouse CI via GitHub Actions.
