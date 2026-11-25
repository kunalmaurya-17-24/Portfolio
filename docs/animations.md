# Motion systems

The site uses CSS, IntersectionObserver, requestAnimationFrame and Web Audio; there is no animation framework or scroll hijacking.

| System | Choreography | Implementation |
| --- | --- | --- |
| Opening | 850ms title hold, then a 650ms angular exit; visitors may skip | Session-scoped optional preference, CSS clip transition; reduced motion skips it |
| Name and emblem | Name lines stagger at 120/250ms; 800/900ms type reveals and 1100ms mask entrance | CSS keyframes; completed clip animations are removed on animationend, avoiding retained layers and full-page compositor artifacts |
| Section headings | Horizontal paper-cut reveal over 850ms | Observe the unclipped wrapper and clip its child heading; an observed element must not be fully clipped |
| Feature dossier | 1000ms diagram cut, followed by 800ms copy motion at 200ms delay | Child clip and transform transitions after the parent intersects |
| Profile | 1000ms horizontal statement entrance | Child type clipping with a geometrically visible observed heading |
| Hero depth | A restrained scroll drift, capped after 950px, and 10px/8px fine-pointer range | Passive scroll listener and one rAF per frame; scoped CSS custom properties, cached pointer/reduced-motion queries |
| Role and skills menus | 300ms content entrance; 200–250ms selected-paper transforms | Semantic tablists; native button click and arrow/Home/End keys |
| Dossier and directory | 350ms modal entrance and 400ms menu cut | Native dialog supplies modal focus and Escape behavior |
| Ticker | 35-second linear type loop | User pause/resume control plus prefers-reduced-motion fallback |
| Sound indicator | Alternating 800ms equalizer, only during playback | CSS keyed to actual audio state; paused with decorative motion and reduced motion |
| Audio | Smooth gain/volume ramps | Gesture-started original synth or authorized HTMLAudioElement; hidden tabs pause without automatic restart |

Reveals run once, then their observer subscriptions are removed. The scroll handler batches work without reading element geometry on every frame. The pointer response is disabled for coarse pointers and reduced motion. Vite teardown disconnects observers, cancels rAF/timers, removes document listeners and disposes audio. Full-page screenshot regression checks assert that every reveal has completed after progressive scrolling.
