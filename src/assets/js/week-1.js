// Anchor jumps wait for fonts and use the actual sticky chrome height.
function lessonOffset() {
  const header = document.querySelector('.topbar').getBoundingClientRect().height;
  const sidebar = document.querySelector('.sidebar');
  const nav = getComputedStyle(sidebar).position === 'sticky' ? sidebar.getBoundingClientRect().height : 0;
  const offset = header + nav + 12;
  document.body.style.setProperty('--lesson-anchor-offset', `${offset}px`);
  return offset;
}
async function jumpToLessonAnchor(hash) {
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;
  if (document.fonts) await document.fonts.ready;
  const offset = lessonOffset();
  window.scrollTo({top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset), behavior: 'instant'});
  updateReading();
}
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.classList.contains('skip') || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (!document.getElementById(decodeURIComponent(link.hash.slice(1)))) return;
  event.preventDefault();
  if (location.hash !== link.hash) history.pushState(null, '', link.hash);
  jumpToLessonAnchor(link.hash);
});
window.addEventListener('hashchange', () => jumpToLessonAnchor(location.hash));
window.addEventListener('resize', lessonOffset);
lessonOffset();
if (location.hash) jumpToLessonAnchor(location.hash);

const output = document.querySelector('#token-output');
const predict = document.querySelector('#next-token');
const replay = document.querySelector('#reset-token');
const status = document.querySelector('#token-status');
let tokenStep = 0;
predict.addEventListener('click', () => {
  output.querySelector('.empty-token')?.remove();
  const token = document.createElement('span'); token.className = 'generated-token'; token.textContent = tokenStep === 0 ? 'Paris' : '.'; output.append(token);
  tokenStep++;
  if (tokenStep === 1) { status.textContent = '“Paris” joins the context. Now the model predicts again.'; predict.innerHTML = 'Predict again <span aria-hidden="true">→</span>'; }
  else { status.textContent = 'One token added, then another. The same loop builds a response.'; predict.hidden = true; replay.hidden = false; replay.focus({preventScroll:true}); }
});
replay.addEventListener('click', () => {
  output.querySelectorAll('.generated-token').forEach(el => el.remove());
  const blank = document.createElement('span'); blank.className = 'empty-token'; blank.textContent = '?'; output.append(blank);
  tokenStep = 0; status.textContent = 'Context is ready. What comes next?'; predict.innerHTML = 'Predict next token <span aria-hidden="true">→</span>'; predict.hidden = false; replay.hidden = true; predict.focus({preventScroll:true});
});

const sortCards = [...document.querySelectorAll('.capability-card')];
const selectedChoices = card => [...card.querySelectorAll('.pile-choice[aria-pressed="true"]')].map(button => button.dataset.choice);
const sameChoices = (a, b) => a.length === b.length && a.every(choice => b.includes(choice));
for (const card of sortCards) {
  const options = [...card.querySelectorAll('.pile-choice')];
  const check = card.querySelector('.sort-check');
  const feedback = card.querySelector('.sort-feedback');
  for (const button of options) {
    button.addEventListener('click', () => {
      const selected = button.getAttribute('aria-pressed') !== 'true';
      if (selected && selectedChoices(card).length >= 2) return;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('chosen', selected);
      const choices = selectedChoices(card);
      for (const option of options) option.disabled = choices.length === 2 && option.getAttribute('aria-pressed') !== 'true';
      check.disabled = choices.length === 0;
      check.setAttribute('aria-expanded', 'false');
      feedback.hidden = true;
      document.getElementById('sort-reset-status').textContent = '';
    });
  }
  check.addEventListener('click', () => {
    const choices = selectedChoices(card);
    const suggested = card.dataset.suggested.split('|');
    const also = card.dataset.also ? card.dataset.also.split('|') : [];
    if (!choices.length) return;
    const message = sameChoices(choices, suggested) ? 'That matches our suggestion.'
      : also.length && sameChoices(choices, also) ? "That's a reasonable choice too. Here's our take."
      : choices.some(choice => suggested.includes(choice)) ? "Close. Here's our take."
      : "Here's what we'd suggest, and why.";
    feedback.hidden = false;
    feedback.querySelector('.choice-result').textContent = message;
    check.setAttribute('aria-expanded', 'true');
  });
}
document.getElementById('reset-sort').addEventListener('click', () => {
  for (const card of sortCards) {
    for (const button of card.querySelectorAll('.pile-choice')) {
      button.setAttribute('aria-pressed', 'false');
      button.classList.remove('chosen');
      button.disabled = false;
    }
    const check = card.querySelector('.sort-check');
    check.disabled = true;
    check.setAttribute('aria-expanded', 'false');
    card.querySelector('.sort-feedback').hidden = true;
    card.querySelector('.choice-result').textContent = '';
  }
  document.getElementById('sort-reset-status').textContent = 'All six steps reset. Choose who should do each step to try again.';
});
