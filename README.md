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
- Scripted token demonstration and six practice tasks: `dist/app.js`

The original deck has placeholders for the assignment submission link, survey, reading/video, and contact channel. These appear as pending information, not broken links. Add the final URLs and reading title before sending the lesson to members.

The three in-class failure prompts and capability-sort cards were not included in the presentation. The website refers to the supplied class card for the failure activity and uses the six Hearthstone example subtasks for its interactive practice. The token animation is explicitly illustrative, not a real tokenizer or live model. The class-test evidence in the worked example is labeled as sample evidence. Model families reflect the supplied lesson rather than a live market listing.

Motion respects `prefers-reduced-motion`. Native links, buttons, accordions, and keyboard focus styles support keyboard access. Practice answers stay in the current page session and are not submitted or stored.
