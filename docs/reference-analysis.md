# Reference study — Persona 30th Anniversary

Reference: https://asia.sega.com/p30th/en/ . Studied directly in the in-app browser on 25 November 2026. No source code or game assets are reused.

## Observed in the browser

- Loading uses repeated progress typography (observed at 31%), then a layered identity reveal. The hero combines huge black anniversary lettering, a red handwritten overlay, foreground character collage and softened background screenshots.
- Black, white and intense red dominate, with cold grey-blue fields and small yellow/purple accents. Halftone dots soften the edges rather than filling every surface.
- The measured body family is Archivo / Noto Sans. Many major headings are image assets; their apparent slant and width should not be attributed to a CSS font alone. Navigation uses italic, compact uppercase type.
- Desktop composition uses large negative-space fields, angular shards and diagonal red announcement ribbons. News sits in slim two-column rows. A skewed paper panel houses the anniversary message. Section headings interrupt the grid.
- News navigation was clicked and the news/message composition inspected at approximately 1440×900. Carousel content changes across observations. Section heading classes change to `run`, and initially invisible headings become visible as their section enters view.
- At 390×844 the hero is recomposed into a tall character stack; it is not merely a scaled desktop scene. Navigation becomes a hamburger. Clicking it reveals a translucent full-screen menu with oversized central links and black angular framing.
- Hover/section motion and continuously changing carousel state establish motion as a layered system. Exact timing of the loader and scroll easing cannot be reliably measured from static captures alone.

## Implementation evidence and limits

The DOM exposes Swiper wrappers, separate vendor/top bundles, jQuery and WordPress assets. The public top bundle contains Swiper usage, one IntersectionObserver signature and requestAnimationFrame calls; no GSAP or ScrollTrigger string appears in that bundle. This supports CSS/native scroll techniques and Swiper for carousel behavior, but does not establish the contents of every vendor bundle. The top stylesheet contains twelve named keyframes, stagger delays in 0.2-second increments and long linear looping effects (one observed rule is 125 seconds). Measured computed styles and visible behavior underpin the visual observations. Library presence alone is not evidence that every effect uses that library. No WebGL/canvas claim is made, and no reference performance trace or screen recording is represented as collected.

## Translation into this portfolio

Use original angular SVG art and semantic live typography: an AI signal-mask emblem, cut-paper name composition, red ticker, work dossiers, selectable career records and an ability menu. Keep a single red/black/paper identity rather than combining every game's palette. Use native CSS, IntersectionObserver and requestAnimationFrame for choreography; the content does not require WebGL or a heavy animation framework. Treat employer projects as attributed work; avoid fictional product screenshots. Make the opening brief and skippable, keep audio opt-in, and turn continuous movement off for reduced motion.

## Complementary goods, special, and hover study

An independent browser session used bundled Playwright with a separately launched headless Microsoft Edge on 25 November 2026. It visited the public site, clicked its desktop Goods & Events and Special navigation links, hovered actual controls, and inspected responsive layouts at **1440 × 900** and **390 × 844**. Screenshots were opened and visually inspected. No reference asset or code was imported into the portfolio.

- **Goods & Events:** a giant image-based oblique heading interrupts a pale grey-blue field. Four outlined editorial entries form a two-column desktop grid inside a white backing sheet; each entry pairs an image with compact text. Black borders, a red corner wedge, small category flags, and angular language links provide structure. On the phone this becomes a single-column list, retaining horizontal image/text pairing rather than shrinking a desktop two-column grid.
- **Goods hover:** the hovered item's red corner reveals a white CHECK label. The photograph and card do not visibly zoom in the sampled pair. The label's measured transform changes from `translate(44.64px, 5.76px)` to the identity matrix; its declared transition is **0.2s ease-in-out**. This is a targeted graphic reveal, not a general card-scale effect.
- **Special:** a desaturated blue-grey background, halftone edges, white slash marks, and offset black backing paper frame a large trailer image. Three pale, angular secondary panels stack at the right. On mobile, the trailer fills the content width and the secondary panels move below it. The trailer title is live **24px/700 Archivo** on a white strip at the measured desktop size; the enormous section word is image artwork rather than a CSS font treatment.
- **Trailer affordance:** a circular PLAY TRAILER image rotates separately from its central arrow. Computed CSS reports a **20s linear** rotation and an arrow `left` transition of **0.3s ease-in-out**. The screenshot pair confirms ring movement; no additional hover-scale effect is claimed.
- **Phone navigation:** tapping the actual hamburger link opens a full-screen, almost-white translucent layer with a centered anniversary mark, widely spaced italic navigation, halftone texture, and black slash framing. Its measured background is `rgba(251, 252, 252, 0.95)`. A mouse-coordinate attempt did not open it; the saved evidence is from the successful touch-target tap.

### Measured motion, rather than inferred timing

The Goods heading changes from `.goods-title-contents` to `.goods-title-contents.run` after navigation brings it into view. Its clipped backing underline measures **0px before entry and 1040.25px afterward**, with a **0.5s ease-in-out width transition**. The heading image goes from opacity **0 to 1** with a **0.3s ease-in-out transition delayed 0.2s**; separate decorative pieces declare **0.3s ease-in-out** keyframe motion. These measurements confirm staged label, typography, and accent choreography.

Other live computed samples report **30s linear** moving announcement ribbons, multiple hero background lanes with different long linear periods (including **147.2s**, **220.8s**, and **248.4s**), and a **2.2s cubic-bezier(0.76, 0, 0.3, 1)** scroll indicator. Different layer speeds support the perceived depth. These are sampled declarations and before/after states, not measured frame rates or a full animation timeline. No performance trace, screen recording, or exact JavaScript orchestration library attribution is implied.

### Saved research evidence

- [Desktop hero](evidence/reference-desktop-hero.png)
- [Desktop Goods & Events](evidence/reference-desktop-goods.png) and [hover state](evidence/reference-desktop-goods-hover.png)
- [Desktop Special](evidence/reference-desktop-special.png) and [hover sample](evidence/reference-desktop-special-hover.png)
- [Phone hero](evidence/reference-mobile-hero.png), [phone Goods & Events](evidence/reference-mobile-goods.png), and [phone Special](evidence/reference-mobile-special.png)
- [Phone navigation after successful tap](evidence/reference-mobile-menu.png)
- [DOM and animation inventory](evidence/reference-dom-inventory.json), [interaction/computed-style samples](evidence/reference-interaction-observations.json), and [detailed heading/hover measurements](evidence/reference-detail-observations.json)

The phone section captures are viewport samples at their inspected scroll positions, not full-page composites. All evidence is research-only under `docs/`; it is excluded from the static production bundle.
