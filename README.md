# Cornell AI Strategy · New Member Education

A dependency-free HTML/CSS/JavaScript site. Node 22 builds every page; GitHub Pages publishes only the generated output.

## Build and preview

```sh
node scripts/build.mjs
python -m http.server 4174 --directory dist
```

Open http://localhost:4174/ and http://localhost:4174/week-1/. The same directory routes work under the GitHub Pages repository prefix.

## Source structure

- `src/hub.html`: landing-page content.
- `src/weeks/week-1.html`: Week 1 lesson content.
- `src/weeks/_template.html`: starting structure for new lessons; never published.
- `src/pages.json`: page registration, metadata, chapter navigation, and asset lists.
- `src/data/weeks.json`: schedule dates, titles, links, and availability.
- `src/partials/`: shared layout, header, sidebar shell, and footer, each authored once.
- `src/assets/css/shared.css`: shared design and responsive styles.
- `src/assets/js/shared.js`: chapter navigation, reading progress, and copy buttons. Accordions use native HTML details/summary behavior.
- `src/assets/css/week-1.css` and `src/assets/js/week-1.js`: Week 1 demonstrations, token animation, capability sort, and related styles. Only Week 1 loads these.
- `src/assets/images/`: shared logo.
- `scripts/build.mjs`: builds every registered page, copies assets, versions CSS/JS URLs, and validates local links, anchors, and duplicate IDs.
- `scripts/render-schedule.mjs`: schedule rendering and validation.
- `dist/`: disposable generated output, ignored by Git. Never edit it.

The build reads only `src/`, validates the complete output, then replaces `dist/`. Running it from a clean checkout is sufficient; there is no dependency installation step.

## Add a week

1. Copy `src/weeks/_template.html` to `src/weeks/week-2.html` and replace the authoring instructions with the lesson content.
2. Copy a lesson entry in `src/pages.json`. Set `source` to `weeks/week-2.html`, `output` to `week-2/index.html`, and update the title, description, labels, footer, and chapters to match the lesson's section IDs.
3. Start its asset lists with only `assets/css/shared.css` and `assets/js/shared.js`. Add dedicated Week 2 assets if needed; do not load Week 1's demonstrations.
4. Update the corresponding schedule record in `src/data/weeks.json` with its title, `link: "week-2/"`, and `status: "available"`.
5. Build, preview both the hub and lesson, and commit source changes. Unregistered lesson files and broken links fail the build.

Upcoming weeks use a null link and `coming-soon` status. The Thanksgiving row has a null week number and `break` status. The template is intentionally excluded from the output.

## Publish

Push source changes to `main`. `.github/workflows/pages.yml` builds the site and uploads `dist/` to GitHub Pages. Repository Settings → Pages must use **GitHub Actions** as its source. Generated files are never committed.

- Hub: https://sallonikapoor.github.io/Cornell-AI-Strategy-NME/
- Week 1: https://sallonikapoor.github.io/Cornell-AI-Strategy-NME/week-1/

## Lesson notes

Week 1 preserves the supplied lesson, exact practice prompts, submission link, and contact details. The supplemental resource remains pending at the author's request. Tokenization is illustrative rather than a live model. Practice answers are not stored or submitted. Copy buttons fall back to selecting the prompt if clipboard access fails. Google Fonts is optional, motion respects reduced-motion preferences, and native controls support keyboard access.
