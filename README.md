# doctordoomies — portfolio

A small static site about how I got into programming and what I'm learning now.
Plain HTML, CSS, and one JS file. No build step. Deployed with GitHub Pages (Actions workflow in `.github/workflows/pages.yml`).

## Before it's finished

1. **Email.** Search `index.html` for `YOUR_EMAIL_HERE` (two places: the internship section and the footer) and replace it with your address.
2. **Resume.** Save your resume as `resume/resume.pdf`, then set `HAS_RESUME = true` at the top of `main.js`. The Resume links stay hidden until then, so there is never a dead link.
3. **GitHub.** Links point to `https://github.com/doctordoomies`.

## Motion

Everything is an enhancement. With JavaScript off, or `prefers-reduced-motion: reduce`, all content is visible and nothing animates.

Libraries are vendored (pinned) in `vendor/`:

- GSAP 3.15.0 + ScrollTrigger: hero entrance, reveals, divider draws, magnetic buttons
- Lenis 1.3.26: light smooth scrolling (mouse/trackpad only; sleeps when idle)
- SplitType 0.3.4: hero and closing titles
- Lucide (ISC): arrow icons, inlined as an SVG sprite

Hover effects are CSS under `(hover: hover) and (pointer: fine)`.
