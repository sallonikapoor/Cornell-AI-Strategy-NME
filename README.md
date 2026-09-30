# Cornell AI Strategy · New Member Education

A responsive Fall 2026 NME hub with the animated Week 1 lesson adapted from `CAIS_Week1_LLMs_and_AI_Landscape.pptx`. Plain HTML, CSS, and JavaScript with a dependency-free Node script that generates the hub schedule. No framework, backend, API keys, or paid services required.

## Pages

- Hub: `https://sallonikapoor.github.io/Cornell-AI-Strategy-NME/`
- Week 1: `https://sallonikapoor.github.io/Cornell-AI-Strategy-NME/week-1/`

Directory indexes provide routing on GitHub Pages. Relative asset and navigation URLs work both locally and beneath the repository URL prefix.

## Preview

Run `node scripts/build-hub.mjs`, then serve `dist` with a local static server (for example `python -m http.server 4174 --directory dist`). Visit `/` and `/week-1/`. Google Fonts is optional; system fonts work offline. The schedule is generated as HTML and remains readable with JavaScript disabled.

## Publish on GitHub Pages

1. Create a GitHub repository and upload this folder's contents, including `.github/workflows/pages.yml`.
2. In the repository, open **Settings → Pages** and select **GitHub Actions** as the source.
3. Push to `main`, or run the **Deploy lesson to GitHub Pages** workflow from the Actions tab.
4. Copy the URL shown by the successful deployment. Repository subpaths work because all site assets use relative paths.

Only `dist/` is published. The PowerPoint and development notes are not uploaded as website assets.

## Editing

- Hub content: `src/hub.html` (generates `dist/index.html`)
- Schedule: `data/weeks.json` (week, ISO date, title, link, status)
- Week 1 content and final resource links: `dist/week-1/index.html`
- Colors, layout, animation, and mobile design: `dist/styles.css`
- Shared reading progress and chapter navigation: `dist/navigation.js`
- Token animation, prompt-copy controls, and capability-sort behavior: `dist/app.js`

To add a lesson, create `dist/week-N/index.html`, update its schedule entry with the title, relative link `week-N/`, and status `available`, then run `node scripts/build-hub.mjs`. Commit the source and generated HTML. GitHub Actions also runs the generator before publishing. Weeks marked `coming-soon` have a null link and render as text. The Thanksgiving break has a null week number and status `break`.

The deliverable submission link points to the club's supplied Drive folder. The background survey and grading language have been removed. The reading/video remains pending at the user's request. Both pages have the supplied contact email; the hub also lists the attendance contact.

The page is a post-session reference with expanded explanations of four failure modes, defenses, workflow integration, and a confidentiality callout before the deliverable. Week references follow the deck; character-level validation is explicitly labeled as related coverage in Weeks 4 and 6, since the deck gives no separate week for it.

The three main prompts (hallucination, consistency, and math) and bonus exact-string prompt reproduce the user's supplied script verbatim. Answers are collapsed until revealed. The math answer key was verified with decimal arithmetic. Copy buttons use the Clipboard API and select the prompt for manual copying if access fails. The six capability cards reuse the Hearthstone subtasks and show suggested answers, alternatives, and checks after a selection. No scores or submissions are collected. Four closing questions have revealable answers.

The token animation is illustrative, not a real tokenizer or live model. Model families reflect the supplied lesson rather than a live market listing. Technical background links appear next to relevant explanations. The original PowerPoint has not been modified.

Motion respects `prefers-reduced-motion`. Native links, buttons, accordions, and keyboard focus styles support keyboard access. Practice answers stay in the current page session and are not submitted or stored.
