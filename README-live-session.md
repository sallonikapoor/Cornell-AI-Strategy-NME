# Week 2 support pages

The main `/week-2/` route is a normal scrolling lesson, using the same header, sidebar, footer, and shared styles as Week 1. It has no slideshow, session clock, scoring, shortcuts, or saved progress. The discovery practice allows five questions; its debrief appears only after **I'm done asking**. Reloading resets the practice. Only the retired `cais-week-2-live-v1` storage entry is removed; no other storage is cleared.

The separate `/week-2/facilitator/` notes and `/week-2/client-cards/` printable/editable cards are preserved. The facilitator script describes the earlier live activity and remains available as teaching material. These pages use `src/partials/live-layout.html`, `src/assets/css/week-2-support.css`, and `src/assets/js/week-2-support.js`. The latter supplies the displayed agenda and print button, with no session-state persistence. Existing offline support remains scoped to Week 2. Neither support page is linked from the lesson.

Lesson content is authored in `src/weeks/week-2.html`; the five-question interaction is in `src/assets/js/week-2.js`. Component styles are in `src/assets/css/week-2.css`. The shared lesson shell and styles are not duplicated. The hub and Week 1 still do not link to Week 2.

Build and validate local links, assets, anchors, and duplicate IDs with `node scripts/build.mjs`. Preview with `python -m http.server 4174 --directory dist`.
