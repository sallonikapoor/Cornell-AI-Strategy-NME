# Development guide

[← Project overview](../README.md)

A dependency-free HTML/CSS/JavaScript site. Node 22 builds every page; GitHub Pages publishes only the generated output.

## Build and preview

Prerequisites: Node 22 and Python 3 for the preview command. Run these commands from the repository root. On systems where Python 3 is named `python3`, use that command instead. No npm install is needed.

```sh
node scripts/build.mjs
python -m http.server 4174 --directory dist
```

Open the [local hub](http://localhost:4174/) and [local Week 1 lesson](http://localhost:4174/week-1/). The same directory routes work under the GitHub Pages repository prefix.

## Source structure

- `src/hub.html`: landing-page content.
- `src/weeks/week-1.html` and `src/weeks/week-2.html`: published lesson content.
- `src/weeks/_template.html`: starting structure for new lessons; never published.
- `src/pages.json`: page registration, metadata, chapter navigation, and asset lists.
- `src/data/weeks.json`: schedule dates, titles, links, and availability.
- `src/partials/`: shared layout, header, sidebar shell, and footer, each authored once.
- `src/assets/css/shared.css`: shared design and responsive styles.
- `src/assets/js/shared.js`: chapter navigation, reading progress, and copy buttons. Accordions use native HTML details/summary behavior.
- `src/assets/css/week-1.css` and `src/assets/js/week-1.js`: Week 1 demonstrations, token animation, capability sort, and related styles. Only Week 1 loads these.
- `src/assets/css/week-2.css` and `src/assets/js/week-2.js`: Week 2 discovery practice components.
- `src/assets/css/week-2-support.css` and `src/assets/js/week-2-support.js`: separate facilitator and printable-card support; not loaded by the lesson.
- `src/assets/images/`: shared logo.
- `scripts/build.mjs`: builds every registered page, copies assets, versions CSS/JS URLs, and validates local links, anchors, and duplicate IDs.
- `scripts/render-schedule.mjs`: schedule rendering and validation.
- `dist/`: disposable generated output, ignored by Git. Never edit it.

The build reads only `src/`, validates the complete output, then replaces `dist/`. Running it from a clean checkout is sufficient; there is no dependency installation step.

## Add a week

1. Copy `src/weeks/_template.html` to `src/weeks/week-N.html` and replace the authoring instructions with the lesson content.
2. Copy a lesson entry in `src/pages.json`. Set `source` to `weeks/week-N.html`, `output` to `week-N/index.html`, and update the title, description, labels, `actionArrow`, footer, and chapters to match the lesson's section IDs.
3. Start its asset lists with only `assets/css/shared.css` and `assets/js/shared.js`. Add dedicated lesson assets if needed; do not load Week 1's demonstrations.
4. Update the corresponding schedule record in `src/data/weeks.json` with its title, `link: "week-N/"`, and `status: "available"`.
5. Build, preview both the hub and lesson, and commit source changes. Unregistered lesson files and broken links fail the build.

Upcoming weeks use a null link and `coming-soon` status. The Thanksgiving row has a null week number and `break` status. The template is intentionally excluded from the output.

## Publish

Push source changes to `main`. `.github/workflows/pages.yml` builds the site and uploads `dist/` to GitHub Pages. Repository Settings → Pages must use **GitHub Actions** as its source. Generated files are never committed.

- [Live hub](https://sallonikapoor.github.io/Cornell-AI-Strategy-NME/)
- [Live Week 1 lesson](https://sallonikapoor.github.io/Cornell-AI-Strategy-NME/week-1/)

## Lesson notes

Week 1 preserves the supplied lesson, exact practice prompts, submission link, and contact details. The supplemental resource remains pending at the author's request. Tokenization is illustrative rather than a live model. Practice answers are not stored or submitted. Copy buttons fall back to selecting the prompt if clipboard access fails. Google Fonts is optional, motion respects reduced-motion preferences, and native controls support keyboard access.

## Documentation and screenshots

The curriculum table in the README mirrors `src/data/weeks.json`. When the schedule changes, regenerate its rows from the week, date, title, and status fields; skip the break record and retain the November 25 break note. Mark `available` as Available and `coming-soon` as Upcoming. Only link lessons that exist.

Screenshots are committed under `docs/screenshots/`: `hub-desktop.png`, `week-1-hero-desktop.png`, `week-1-failures-desktop.png`, `week-1-sort-desktop.png`, and `week-1-mobile.png`. Refresh them from the local build when the design changes. Desktop captures use 1440 × 1000 (1440 × 1200 for failure modes); mobile uses 390 × 844. The capability-sort capture shows a selected card and its explanation. These documentation files are not copied into `dist/`.

Week 2 uses the same submission folder as Week 1. Replace `TEMPLATE_URL_WEEK2` in `src/weeks/week-2.html`’s `BLUEPRINT_TEMPLATE_LINK` comment with an HTTP(S) URL to show the optional template link; the placeholder is omitted from the built page. Its supplemental reading/video remains pending. The interview uses only fictional material. Practice answers reset on reload; there is no saved lesson progress.

## Week 2 support pages

Week 2 uses the shared lesson layout, CSS, and navigation. Its question interaction is in `week-2.js`, with component-only styles in `week-2.css`. The separate facilitator and client-card pages retain their standalone layout and offline support through `week-2-support.css` and `week-2-support.js`. They do not load on the lesson. See [the support-page guide](../README-live-session.md).
