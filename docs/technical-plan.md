# Technical architecture and audio plan

Discovery date: 25 November 2026. This document records inspected capabilities and proposed choices; it is not a claim that unimplemented features have passed QA.

## Existing project and runtime

The starting directory contains 13 raster images and one resume PDF. No application, package manifest, source repository, audio files, or framework configuration was present in the initial inventory. No workspace `AGENTS.md` was found. Originals should remain outside the deployed public directory.

- Node.js 24.22.0 and npm 11.19.1 are available.
- Microsoft Edge is installed at `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`.
- `pdftoppm` is available for resume rendering.
- The bundled primary runtime includes Playwright, playwright-core, sharp, pdf-lib, pdfjs-dist, PNG tooling, and pixelmatch.
- Playwright, sharp, Vite, React, and TypeScript did not resolve from the initial project. Bundled Playwright and sharp resolved successfully through their absolute runtime package paths. Vite/React/TypeScript would need project installation if selected.
- Bundled package root: `C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1123-915-0_26.1123.915.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules`.
- Headless Edge launch through Playwright was tested successfully, including creation of a 390 × 844 viewport. The default filesystem sandbox blocked the browser pipe; the same command passed when run with the tool's approved escalation. This is an execution environment constraint, not an application error.

## Recommended application structure

Use Vite with TypeScript and custom CSS. A small static portfolio does not require a server, database, WebGL stack, UI library, or router. React is reasonable if component state makes the final project showcases substantially clearer; it should not be added solely for animation. The installed Node version meets Vite's documented runtime requirements. [Vite getting started](https://vite.dev/guide/)

Keep factual content separate from presentation. Recommended ownership boundaries:

- `content`: verified resume facts, project descriptions, skills and links.
- `styles`: palette, typography, spacing, motion durations, breakpoints and shared graphic primitives.
- `navigation`: accessible menu, section state, hash navigation and focus management.
- `motion`: scroll observers, pointer parallax, reveal choreography and media-query cleanup.
- `audio`: optional sound engine, public configuration and persisted preferences.
- `projects`: project detail interaction and supporting technical diagrams.

Prefer CSS transforms, opacity, clipping and the Web Animations API for short sequences. Use IntersectionObserver for one-time entrances and section tracking. If scroll-linked sequences require precise multi-element timelines, GSAP/ScrollTrigger is justified; otherwise avoid it. Native scrolling preserves keyboard navigation and reduces complexity. Never hide substantive content permanently when JavaScript is unavailable or reduced motion is requested.

## Original audio fallback

No `.mp3`, `.ogg`, `.wav`, `.m4a`, `.flac`, or other audio file was supplied. The reference tracks are copyrighted and no permission to redistribute them was provided. Do not download, transcribe, imitate the melody of, or embed unauthorized copies of those tracks.

Use a clearly labelled original ambient synth loop as the functional default. A restrained, late-night instrumental suits the editorial game-menu direction: original mellow chord voicings, quiet bass and sparse synthetic percussion. Generate tones with oscillators/noise in Web Audio, using an original progression and rhythm. No samples, external audio downloads or additional audio dependency are necessary. MDN documents oscillator and generated-buffer approaches as supported sound sources. [Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)

Provide one public configuration object with `source`, `title`, `artist` and `license` fields. `source: null` selects the original synth engine. A later authorized media URL selects a normal `HTMLAudioElement` with `loop`, using the same controls. Keep the title honest: never show a Persona track name while the original loop is playing. Full music files are suitable for media-element streaming rather than decoding a whole track into memory. [Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)

Required control behavior:

1. Start silent. Create/resume the AudioContext only inside an explicit Play click, tap or keyboard activation. Browser audio policies commonly require user initiation. [MDN autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
2. Play/Pause is a real button with an updating accessible label and pressed state. Keep playback state separate from mute state.
3. Mute/Unmute is a separate button. Preserve the chosen nonzero volume when muting.
4. Volume uses a labelled native range input; offer a meaningful keyboard step and visible value.
5. Ramp master gain over roughly 100–250 ms when pausing or changing mute state to avoid clicks. Stop scheduled voices/timers after a pause fade. Cancel pending ramps before setting another target.
6. Save volume and mute preferences in localStorage. Remembering a preference must never trigger sound on the next page load.
7. Show track information and a playback indicator that animates only when sound is playing. Pause its animation under `prefers-reduced-motion`.
8. Catch `play()` and `resume()` failures; leave the UI usable and display a concise status. Suspend cleanup when disposed; handle unsupported Web Audio without blocking the portfolio.

## Browser QA strategy

Use bundled Playwright against installed Edge without downloading another browser. Keep the user's browser sessions untouched. Test the local app's real URL. Screenshot the requested viewports: 1920 × 1080, 1440 × 900, 1366 × 768, 768 × 1024 and 390 × 844. Wait for fonts and the initial entrance before comparison; use full-page captures for content flow and viewport captures for composition. Record the actual screenshots and actual review findings for each refinement pass.

Suggested checks:

- No console errors, failed requests or broken images.
- All navigation targets exist, remain visible below any fixed header, and work with the menu closed and open.
- Menu opens/closes by keyboard; Escape dismisses transient UI; focus does not disappear or become trapped unexpectedly.
- Project detail controls work with mouse, touch and keyboard. External links match verified resume links and use appropriate new-tab protection where applicable.
- Public resume opens/downloads, contains no residential address or other excluded private details, and is distinct from the private original.
- At each viewport, `document.documentElement.scrollWidth <= innerWidth`; meaningful content is not clipped by decorative masks.
- Reduced-motion emulation disables continuous ornamental motion and makes hidden reveals immediately available. The interface still works.
- Audio remains silent before explicit Play, and Play/Pause/Mute/Unmute/volume/persistence all update correctly. Verify the actual audio engine state, not just button text.
- Inspect computed colors/focus rings and contrast on small labels. Use semantic headings, landmarks, labels and native controls.
- Production build passes and a production preview serves the same assets successfully.
- If Lighthouse/axe is unavailable, explicitly report that limitation and document direct accessibility/performance checks instead of claiming scores.

## Performance constraints

Use locally served subsetted fonts if licensing permits, fixed intrinsic image dimensions, and WebP/AVIF derivatives of authorized imagery. Lazy-load below-fold visuals. Keep pointer animation in a single requestAnimationFrame loop and disable it for coarse pointers. Avoid layout reads inside scroll handlers, continuously animating large filters, or large paint-heavy background effects. Listen to media-query changes and clean up observers/listeners/animation frames.

Do not ship raw reference screenshots, private PDFs, source artwork of uncertain licensing, research captures, or visual QA files as public assets.
