# Zyren (James Walker) — portfolio

Static site: `index.html`, `styles.css`, `main.js`. No build step.
Deployed with GitHub Pages from `main`; custom domain set in `CNAME`.

## Motion layer
Everything degrades cleanly: with JavaScript off, or `prefers-reduced-motion: reduce`, all content is visible and nothing animates.

Libraries are vendored (pinned) in `vendor/`:
- GSAP 3.15.0 + ScrollTrigger — hero entrance, section/row reveals, divider draws, magnetic buttons
- Lenis 1.3.26 — light smooth scrolling (mouse/trackpad only; touch stays native; the loop sleeps when idle)
- SplitType 0.3.4 — hero and contact titles
- Lucide (ISC) — arrow icons, inlined as an SVG sprite in `index.html`

Hover states live in CSS under `(hover: hover) and (pointer: fine)`.

## Editing
Contact links (Gmail compose + GitHub) appear in the nav, hero, contact section, and footer of `index.html`; search for `zyrencodes@gmail.com` and `github.com/Zyrencodes` to change them.
Resume: `resume/James-Walker-Resume.pdf`.
