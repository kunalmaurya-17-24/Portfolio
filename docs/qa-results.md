# Browser QA results

Run: 2026-11-25T11:32:50.262Z. Target: http://127.0.0.1:4173/. Browser: Microsoft Edge / Chromium 158.0.4370.33.

**26 passed; 0 failed; 26 checks.**

| Check | Result |
| --- | --- |
| Layout and assets 1920 × 1080 | PASS |
| Layout and assets 1440 × 900 | PASS |
| Layout and assets 1366 × 768 | PASS |
| Layout and assets 768 × 1024 | PASS |
| Layout and assets 390 × 844 | PASS |
| All internal hash links resolve | PASS |
| Desktop navigation follows every section link | PASS |
| Navigation dialog Escape and focus return | PASS |
| Expanded navigation link and close button | PASS |
| Experience tabs click and keyboard | PASS |
| Skills tabs click and keyboard | PASS |
| All three project case files and focus return | PASS |
| External destination syntax and safe new-tab links | PASS |
| Resume HTTP response and real browser download | PASS |
| Real audio controls, preferences and silent reload | PASS |
| Decorative motion pause control | PASS |
| Education details and clipboard action | PASS |
| Axe desktop page WCAG 2.2 AA | PASS |
| Axe expanded navigation WCAG 2.2 AA | PASS |
| Axe case dialog WCAG 2.2 AA | PASS |
| Brief scroll performance trace | PASS |
| Axe mobile page WCAG 2.2 AA | PASS |
| Mobile touch navigation and project dialog | PASS |
| Reduced motion removes decorative animation and preserves content | PASS |
| Denied localStorage and sessionStorage remain functional | PASS |
| Console, uncaught errors, HTTP failures and broken requests | PASS |

## Viewport checks

| Viewport | Document width | Result |
| --- | --- | --- |
| 1920 × 1080 | 1920 | No horizontal overflow |
| 1440 × 900 | 1440 | No horizontal overflow |
| 1366 × 768 | 1366 | No horizontal overflow |
| 768 × 1024 | 768 | No horizontal overflow |
| 390 × 844 | 390 | No horizontal overflow |

## Accessibility

- desktop-page: 0 detected violations, 26 passing rules, 2 rules requiring manual review.
- desktop-menu: 0 detected violations, 13 passing rules, 1 rules requiring manual review.
- desktop-case: 0 detected violations, 15 passing rules, 0 rules requiring manual review.
- mobile-page: 0 detected violations, 26 passing rules, 2 rules requiring manual review.

## Local performance observations

These are real local browser measurements, not Lighthouse scores. Startup LCP/CLS/long tasks are frozen before scripted scrolling; LCP may identify opening typography, and its element is included in the JSON. Cold browser contexts were used for each viewport; the local server and operating system may still cache files.

| Viewport | LCP | CLS | Resource transfer | Long tasks |
| --- | --- | --- | --- | --- |
| 1920×1080 | 580 ms | 0.0459 | 108.2 KiB | 0 |
| 1440×900 | 216 ms | 0.0427 | 108.2 KiB | 1 |
| 1366×768 | 184 ms | 0.0428 | 108.2 KiB | 0 |
| 768×1024 | 172 ms | 0.0332 | 108.2 KiB | 0 |
| 390×844 | 144 ms | 0.0393 | 108.2 KiB | 1 |

A 629 ms scroll trace was captured at `docs/performance-scroll-trace.json`. Renderer main-thread identification: available. Longest observed renderer task: 2.4 ms; tasks over 50 ms: 0.

## Scope and limitations

- Automated checks use real Chromium-based Microsoft Edge. Safari, Firefox and physical mobile devices were not available and are not claimed as tested.
- Axe detects a subset of accessibility problems; incomplete rules require manual visual review. No full WCAG certification is claimed.
- External GitHub, LinkedIn and certificate URLs are checked for valid destination syntax and safe new-tab attributes. Remote availability and source-content verification are outside this local regression suite.
- Performance timings are local observations, not Lighthouse scores or representative field measurements.
- Audio engine state and scheduled playback are tested; headless execution does not constitute a human listening review.

Re-run with `npm run test:browser`. Set `BASE_URL` to a production preview URL to test the built output. Set `BROWSER_PATH` or `CODEX_NODE_MODULES` to use a different installed browser/runtime. Detailed rule failures, network diagnostics and local performance observations are in `docs/qa-results.json`.
