# Validation evidence

## CV and playlist update — 26 November 2026

The Europass CV is now the factual source, with its summary intentionally excluded from the website and regenerated three-page public resume. Current browser regression results are in `qa-results.md`: 30 checks passed with no failures. They include the updated facts, all three project repositories, the actual public PDF bytes, the two-track selector and actual decoding/playback progression of both supplied MP3s.

The focused playlist suite (`scripts/test-playlist.mjs`, `playlist-test-results.json`) passed all 12 checks against the built production preview on port 4173 and additionally covers rapid switching, cancelling a pending switch, malformed configuration, invalid media, no MP3 requests before explicit playback, and preference persistence without autoplay. The current `screenshots/final` includes desktop/mobile sound settings alongside refreshed CV content at all five viewport sizes. Earlier design/refinement evidence below describes the original creation process.

The final deliverable is a static production build, checked in a real installed Microsoft Edge browser through Playwright and independently inspected in the in-app browser. No Lighthouse score or untested cross-browser claim is made.

## Actual results and artifacts

- [Automated browser results](qa-results.md) and [machine-readable details](qa-results.json).
- [Independent visual critique and refinement history](visual-review.md).
- [Final screenshot layout report](screenshots/final/layout-report.json).
- [Desktop hero](screenshots/final/1440x900-hero.png), [desktop full page](screenshots/final/1440x900-full.png), [phone hero](screenshots/final/390x844-hero.png), [phone full page](screenshots/final/390x844-full.png), [phone menu](screenshots/final/mobile-menu.png) and [phone case file](screenshots/final/mobile-case.png).
- All five required sizes have viewport and full-page captures: 1920×1080, 1440×900, 1366×768, 768×1024, 390×844.
- [Real scroll performance trace](performance-scroll-trace.json), with its interpretation in the QA report.
- [External destination checks](external-link-checks.json): GitHub profile/repository and three certificate viewer pages returned HTTP 200 to HEAD. LinkedIn rejects HEAD; its destination is preserved from the resume annotation and profile access is not independently guaranteed.

## Three required passes and corrective verification

1. **Design:** captured all five sizes, inspected actual images and used independent critiques. Fixed invisible outlined headings, dock overlap, tablet surname obstruction and ticker overflow; enlarged narrative text.
2. **Motion:** captured all five sizes, inspected the live menu and project/career interactions. Added section-specific choreography, rAF-batched pointer response, motion pause, optional-storage guards and clearer selected states.
3. **Final polish:** captured all five sizes and inspected dialogs and page flow. Independent review found an IntersectionObserver/clip-path deadlock. Fixed it by clipping children; regression tests now require every reveal to become visible. Removed completed name clipping to stabilize actual full-page captures. Corrected small-label contrast and large-desktop name/role overlap, then built and recaptured the production result under `screenshots/final`.

Historical pass folders intentionally preserve findings, including failures; use `final` for the delivered appearance. No source artwork was modified, and the public PDF was independently rendered and checked for omitted personal phone data.

## Reproduce

```sh
npm run build
npm run preview
```

In a second terminal, set `BASE_URL` to `http://127.0.0.1:4173/` and run `npm run test:browser`. The QA scripts can use a locally installed Playwright package or the bundled Codex runtime. Outside this environment, install Playwright and provide `BROWSER_PATH` for an installed Chromium browser. The scripts do not install browsers. `CODEX_NODE_MODULES` may override the bundled dependency root.

Run `node scripts/capture.mjs final` against a running dev server, or set `BASE_URL` for production captures. Captures progressively scroll the real page and wait for motion; they do not force hidden content visible.

## Limits

Browser execution covered Edge/Chromium and phone/tablet viewport emulation, plus the in-app browser. Firefox/WebKit binaries were unavailable. Manual device testing and field-network performance remain future checks. Local performance observations are not production-network or Lighthouse scores. The contact flow uses direct mailto and professional links; there is no message-submission backend. Public hosting has not been deployed.
