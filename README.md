# Kunal Maurya / Behind the Systems

A Persona-inspired interactive portfolio for an Agentic AI & LLM Engineer. Oversized editorial typography, original angular artwork, conceptual project diagrams, selectable experience records, and an optional instrumental soundtrack form a single red, ink, and paper identity.

This is a local project deliverable. No production site has been deployed.

## Run locally

Use Node.js **20.19+ or 22.12+** and npm. Development was performed with Node 24.22.0 and npm 11.19.1.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173/`. Keep the terminal running while using the development server.

```sh
npm run build
npm run preview
```

`build` first checks TypeScript with `tsc --noEmit`, then creates the static production bundle in `dist/`. `preview` serves that bundle, normally at `http://127.0.0.1:4173/`. Deploy the contents of **`dist/` only**, using a static host at the domain root. Do not serve the entire workspace: it contains the original private resume and third-party reference imagery. There are no required environment variables, accounts, databases, or server processes beyond static hosting.

## Technology

- **Vite + TypeScript:** a small client-rendered application using native DOM APIs.
- **Custom CSS and original SVG:** design tokens, typography, halftone screens, angular clipping, responsive compositions, and schematic project artwork.
- **Native browser APIs:** IntersectionObserver for section entrances, requestAnimationFrame for scroll-linked changes, native modal dialogs, semantic tabs, and Web Audio.
- **Self-hosted fonts:** Latin WOFF2 subsets of Barlow Condensed and Space Grotesk, with `font-display: swap`.
- **Development QA:** browser automation and axe-core; the actual checks and their limits are recorded in the testing documentation.

The implementation does not need React, GSAP, a component library, WebGL, or a remote font service. The production experience has no analytics or form backend.

## Edit content and design

| File | Responsibility |
| --- | --- |
| `src/main.ts` | Page structure, biography, education, credentials, contact links, original inline artwork, and UI interactions |
| `src/data.ts` | Experience records, skill categories, and expanded project case files |
| `src/style.css` | Palette/type tokens, compositions, responsive rules, animation keyframes, focus and reduced-motion styles |
| `src/fonts.css` | Font faces and local Latin font subsets |
| `src/audio.ts` | Original instrumental, authorized-file playback, state, persistence, and audio cleanup |
| `public/audio/track.json` | Optional authorized audio source and actual track information |
| `public/Kunal-Maurya-Resume.pdf` | Public resume served by the view/download links |
| `index.html` | Title, metadata, language, favicon link, skip link, and no-JavaScript resume fallback |

All hard-coded content is trusted local source; it is not a user-input CMS. Update both the relevant showcase and its case file when changing a project. Preserve the distinction between the personal ATS Resume Tailoring Agent and employer-owned professional work at Chirpn and FrugalX. Results are the owner's supplied resume claims, not independently reproduced benchmarks.

The source resume was read completely and both pages visually checked. The public PDF is a freshly typeset, two-page derivative containing the professional email and general city, with the personal phone number omitted. The original PDF remains untouched outside `public/`. See [content analysis](docs/content-analysis.md) for factual provenance and privacy decisions. Replace the public PDF with an updated, reviewed version rather than moving the original into `public/`.

## Motion and interaction systems

- **Opening:** a skippable, 850ms title sequence followed by staggered name and emblem entrances. A session preference suppresses repeat openings.
- **Hero:** clipped type and artwork reveals, restrained scroll-linked displacement, and fine-pointer-only response. Touch users receive the complete composition without pointer effects.
- **Sections:** one-time IntersectionObserver entrances reveal sections as they enter view. Motion uses opacity, transforms, and clipping rather than layout measurements on every animation frame.
- **Project dossiers:** native modal case files provide challenge, engineering, outcomes, and genuine repository destinations where available. Conceptual diagrams are explicitly labeled.
- **Experience/toolkit:** keyboard-operable tabs support arrow keys, Home, and End; the active panel remains part of a semantic document structure.
- **Menus and details:** full-screen native navigation dialog, close/Escape behavior, coursework disclosure, hover inversions, and focused control states.
- **Continuous details:** moving typography and sound indicators have reduced-motion alternatives. The ticker includes a motion pause control.

`prefers-reduced-motion` disables the intro, continuous animation, smooth scrolling, and transform-based reveals. Reading content and all actions remain available. No fabricated skill ratings are used.

## Responsive approach

Large screens use a poster-like name/artwork composition and differentiated editorial project spreads. Around tablet widths the project feature, profile, education, and technical menus reflow. Small phones use a tall hero with recomposed artwork, a full-screen navigation directory, stacked project stories, and a compact sound dock. Native dialogs scroll independently. Fine-pointer effects are conditional, and touch controls retain native button/link behavior.

Visual review targets are **1920 × 1080**, **1440 × 900**, **1366 × 768**, **768 × 1024**, and **390 × 844**. Historical pass screenshots are evidence of the iterative process, not a substitute for the final rendered result.

## Audio

The site ships with **After Hours / Original instrumental**, a sample-free procedural track built with Web Audio. It is not a Persona recording or transcription. No authorized game soundtrack was supplied.

Pressing Play explicitly starts playback; volume and mute preferences persist without granting autoplay. Playback pauses when the browser tab becomes hidden. Set `src` in `public/audio/track.json` to a file you are authorized to redistribute, or leave it `null` for the original instrumental. See [audio configuration and behavior](docs/audio.md) for the configuration format and detailed lifecycle behavior.

## Research, screenshots, and validation

- [Reference website study](docs/reference-analysis.md)
- [Creative direction](docs/creative-direction.md)
- [Supplied image review](docs/asset-analysis.md)
- [Technical architecture](docs/technical-plan.md)
- [Animation systems and timing](docs/animations.md)
- [Tool and agent inventory](docs/tool-inventory.md)
- [Asset attribution and licensing](docs/asset-licensing.md)
- [Implementation plan](docs/PLAN.md)
- [Testing and validation results](docs/testing.md)
- [Final automated results: 26 checks passed](docs/qa-results.md)
- [Screenshot evidence](docs/screenshots/) contains the design, motion, and final polish passes, including desktop/mobile views and layout reports.

The [design-pass captures](docs/screenshots/pass-1-design/) preserve the first visual review. Subsequent passes and final QA evidence are kept alongside them. Consult the final validation report for completed checks, discovered fixes, and browser-coverage limits; a successful build alone is not a visual-quality claim.

The browser regression entry point is `npm run test:browser`. Browser tooling is development-only; the site itself has no Playwright runtime dependency. See the testing report and script for browser executable/module-path configuration in this workspace.

## Scope and remaining limits

- No production deployment or custom domain setup was performed.
- The contact action opens the visitor's email client via `mailto:`; no message is sent to a backend. Copy Email is a convenience fallback.
- Professional case studies describe employer-owned work. No private source code, fabricated product screenshot, or unavailable public demo is included.
- No confirmed personal portrait or authorized Persona soundtrack was provided. The hero uses original abstract artwork; supplied franchise/fan imagery is retained only for research outside the shipped bundle.
- Certificate, GitHub, and LinkedIn destinations are the links supplied in the resume and depend on their external owners' availability and access settings.
- The page requires modern JavaScript for its interactive rendering. A no-JavaScript visitor receives a direct public-resume link.
- Screen-reader and browser compatibility claims must remain bounded by the actual recorded validation. This project does not claim an audited accessibility certification or an Awwwards award.
