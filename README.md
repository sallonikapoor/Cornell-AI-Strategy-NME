# Cornell AI Strategy · New Member Education

A responsive, animated Week 1 lesson adapted from `CAIS_Week1_LLMs_and_AI_Landscape.pptx`. Plain HTML, CSS, and JavaScript. No build process, backend, API keys, or paid services required.

## Preview

Open `dist/index.html` in a browser, or serve `dist` with a local static server. Google Fonts is optional; system fonts work offline.

## Publish on GitHub Pages

1. Create a GitHub repository and upload this folder's contents, including `.github/workflows/pages.yml`.
2. In the repository, open **Settings → Pages** and select **GitHub Actions** as the source.
3. Push to `main`, or run the **Deploy lesson to GitHub Pages** workflow from the Actions tab.
4. Copy the URL shown by the successful deployment. Repository subpaths work because all site assets use relative paths.

Only `dist/` is published. The PowerPoint and development notes are not uploaded as website assets.

## Editing

- Lesson content and final resource links: `dist/index.html`
- Colors, layout, animation, and mobile design: `dist/styles.css`
- Token animation, prompt-copy controls, and capability-sort behavior: `dist/app.js`

The deliverable submission link points to the club's supplied Drive folder. The background survey and grading language have been removed. Reading/video and contact details are still pending.

The page is a post-session reference with expanded explanations of four failure modes, defenses, workflow integration, and a confidentiality callout before the deliverable. Week references follow the deck; character-level validation is explicitly labeled as related coverage in Weeks 4 and 6, since the deck gives no separate week for it.

The three main prompts (hallucination, consistency, and math) and bonus exact-string prompt reproduce the user's supplied script verbatim. Answers are collapsed until revealed. The math answer key was verified with decimal arithmetic. Copy buttons use the Clipboard API and select the prompt for manual copying if access fails. The six capability cards reuse the Hearthstone subtasks and show suggested answers, alternatives, and checks after a selection. No scores or submissions are collected. Four closing questions have revealable answers.

The token animation is illustrative, not a real tokenizer or live model. Model families reflect the supplied lesson rather than a live market listing. Technical background links appear next to relevant explanations. The original PowerPoint has not been modified.

Motion respects `prefers-reduced-motion`. Native links, buttons, accordions, and keyboard focus styles support keyboard access. Practice answers stay in the current page session and are not submitted or stored.
