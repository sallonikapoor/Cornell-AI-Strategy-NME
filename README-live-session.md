# Week 2 live session

## Open before class

- Projector: `/week-2/`
- Phone / owner actor: `/week-2/facilitator/`
- Printable or editable cards: `/week-2/client-cards/`

The facilitator URL is unlisted, not access-controlled. It is never linked from the projector. Week 2 remains unlinked from the hub and Week 1. Open the facilitator page on its own phone while online and wait for **Offline copy ready**. A service worker caches these three pages and their local assets, scoped to Week 2. No server, remote control, external fonts, or new dependencies are required. Submit links still require Internet access.

## Run the room

Press **Start session**, paste names one per line, then **Make teams**. Without a roster, use Team 1–5 and A/B/C positions. Teams contain three members where possible and pairs for remainders; pairs share observation duties. Renaming keeps scores. Make teams / Reshuffle starts a fresh set of teams and activity progress, so use it during setup.

The agreed agenda is **77 minutes**, plus optional **4-minute card writing**. Rotation itself is 20 minutes: three six-minute rounds and two one-minute transitions. Hook/teaching/debrief time is included in the agenda; the small activity clocks time the specific task shown.

| Key | Action |
| --- | --- |
| Right, Space, PageDown | Next beat |
| Left, PageUp | Previous beat |
| T | Start / pause the current timer (or rotation while viewing observers) |
| R | Next reveal; next scope request after placing the current one |
| S | Scores drawer |
| F | Fullscreen where supported |
| ? | Shortcuts and reset controls |
| Escape | Close an open dialog |

Shortcuts are ignored while typing. Space on a focused button activates that button normally. Native scrolling and the bottom-bar arrows also work. Reference material below the final beat uses regular reading layout.

In the interview, click the question actually asked or log a custom one. Each team has five cards; preset questions lock after use. **Question log** shows who asked each question. For a custom question that genuinely uncovers repair-status data, tick that option before logging. The whiteboard bonus is awarded only once. If everyone spends their cards without finding it, R reveals “the question nobody asked.” The owner answers aloud using the fact sheet; no answer payload is displayed on the question board.

**Start three rounds** runs the rotation automatically. **Next phase** is a manual advance if discussion finishes early. The observer checklist is a separate beat; the role table returns at every phase change. Use the score drawer for judged exploits, the mistake race, and quiz points. The scope cards support pointer dragging and an accessible alternative: select a request, then activate IN / OUT / LATER. On a phone, tap the destination instead of dragging across a long page.

Peer review pairs cross teams. An odd roster produces one group of three; if there is only one team, cross-team pairing is impossible and unmatched participants are prompted to join a review group. Photograph the result; no roster is sent anywhere.

## Timings and reset

`CONFIG` at the top of `src/assets/js/live-session.js` holds agenda minutes, every activity duration in seconds, the card budget, and the whiteboard bonus. Start/pause/reset/+1 minute are available on every timed activity. Mute is in the bottom bar. Countdown deadlines use wall time, so refresh does not restart a running countdown. Automatic role switching resumes when the page is open; it does not run a background service on a closed browser.

Teams, names, scores, questions, reveals, formula fields, sorting, timers, and peer groups persist in this browser's localStorage under `cais-week-2-live-v1`. Nothing synchronizes to the phone. Open **? → Reset session → Reset session** to clear the live session. Client-card text is deliberately not persisted. If browser storage is unavailable, the session still works while the tab remains open and the controls explain the limitation.

## Source and reuse

- `src/weeks/week-2.html`: live beats and control dialogs.
- `src/week-2/facilitator.html`: phone script and answer keys.
- `src/week-2/client-cards.html`: six editable/printable cards.
- `src/partials/live-layout.html`: standalone layout; no changes to Week 1's shared layout.
- `src/partials/discovery-habits.html`: the shared teaching/observer checklist.
- `src/partials/week-2-reference.html`: full deliverable, checklist, confidentiality, finished example, and copyable homework prompt.
- `src/partials/week-2-full-notes.html`: complete original teaching text, with the owner's name removed. Long paragraphs shortened on screen remain here on the facilitator page.
- `src/data/week-2-live.json` and `src/data/week-2-scope.json`: original interview/quiz material and scope answer-key source records.
- `src/assets/css/live-session.css`: projector, phone, reduced-motion, and letter-print styles.
- `src/assets/js/live-session.js`: configuration, session interactions, and offline registration.
- `src/assets/js/live-session-core.mjs`: reusable grouping, pairing, role, and clock helpers.

To adapt for Week 3, copy the live layout and beat/control structure, give every beat a stable unique ID and `data-section`, then update content, agenda, timer keys, and activity-specific selectors/data. A `.reveal-item` appears on R; a `.timer[data-timer]` uses a matching duration key. Reuse the pure helpers and checklist partial. Give the new week its own localStorage key. Register its pages in `src/pages.json` with `layout`, `moduleScripts: true`, styles, and scripts. Add its own offline scope/precache handling in the build; the existing worker intentionally controls only Week 2.

Build and validate with `node scripts/build.mjs`. Run `node --test tests/live-session.test.mjs` for grouping, roles, pairing, and clock tests. Preview with `python -m http.server 4174 --directory dist`. The builder still validates links, assets, anchors, and duplicate IDs. It injects `<!-- INCLUDE: partials/name.html -->` markers before final page assembly and emits the versioned Week 2 service worker.

## Content staging

The original ten questions and owner answers are preserved in the owner fact sheet. The former individual five-question picker is replaced by the team interview; its original self-study instructions remain in the full notes. Long explanatory paragraphs moved to those notes, while examples, six categories/habits, metrics, scope, mistakes, and quiz questions appear as live beats. The after-class deliverable has no new grading or length requirements. New material consists of the live instructions, fictional metric exploits, scope requests, four mistake cases, and facilitator cues.

## Verification record

The 42-beat clicker walkthrough was captured at 1280×720 and 1920×1080. Browser checks covered 15-name teams, 25 interview cards, both whiteboard paths, scoring, refresh recovery, confirmed reset, all eight mouse-drag placements, keyboard controls, and three auto-advancing rounds with temporary short timers. The phone fact sheet was tested at 390px and reloaded with the local server stopped. The six-card letter layout was rendered with the actual print CSS activated in a temporary preview.

The available browser does not expose touch emulation or the native system print-preview surface. Those two checks are not claimed: pointer dragging was tested with a mouse, and the tap/keyboard placement alternative and print CSS were checked separately. A native touch-device and printer check is still useful before class. Temporary QA pages and shortened timers are never published.
