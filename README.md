# Marina Geller Yamaguti · Portfolio

Static site for GitHub Pages: plain HTML, CSS and vanilla JS, no build step.

```
index.html
css/styles.css
js/main.js
images/                  placeholders + GloboID illustration + favicon
Marina_Yamaguti_CV.pdf   ← add this file (the Download CV button links to it)
.nojekyll
```

## Deploy
1. Push these files to the root of a repo (e.g. `<username>.github.io`).
2. Settings → Pages → Deploy from branch → `main` / root.

All links are relative, so the site also works as a project page (`<username>.github.io/portfolio/`).

## Placeholders to replace
Search the code for `PLACEHOLDER` and `[ADD`:

| What | Where |
|---|---|
| Photo of Marina | `images/marina-placeholder.svg` → used in hero + About (flower crop). Swap the `src` for e.g. `images/marina.jpg` (square). |
| Project card screenshots | `images/iris-placeholder.svg`, `vango-placeholder.svg`, `pom-placeholder.svg`, `tibby-placeholder.svg` (4:3, ~1600×1200) |
| Case-study carousels | 3 slides each for Iris, VanGO, Pom and Tibby: `images/<project>-placeholder.svg`, `<project>-2-placeholder.svg`, `<project>-3-placeholder.svg`, plus the `<p class="carousel__caption">` next to each |
| Course lists | Backs of the Education cards (`.edu__list`) — every `[ADD: …]` item |
| Pom App Store link | `#case-pom` template, `data-placeholder="app-store-link"` |
| Tibby | card + `#case-tibby` template: description, role, year, tools, problem, process, outcome |
| CV | `Marina_Yamaguti_CV.pdf` in the repo root |

GloboID uses `images/globoid.svg`, an abstract illustration, on purpose (proprietary work).

## Editing content
- Case studies live in `<template id="case-…">` blocks at the bottom of `index.html`.
- Colours and fonts are tokens at the top of `css/styles.css`.

### Case-study carousels
Each case study opens with a scroll-snap carousel (`.carousel`) that advances on
its own. To add or remove a slide, add or remove a `<li class="carousel__slide">`
— the dots are generated from the slides, so nothing else needs changing. The
autoplay interval is `data-autoplay` in milliseconds; autoplay pauses on hover,
on focus and for readers who prefer reduced motion.

### Education cards
The cards in `#education` flip like the project cards. The back holds a
`Courses & activities` list — fill in the `[ADD: …]` items.

## Local preview
```
python3 -m http.server 4173
```
then open <http://localhost:4173>. (`.claude/launch.json` does the same from the
Claude Code browser pane; delete it if you don't want it in the repo.)
