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


// Answers stay in this page only; no storage or network requests.
const questionCards = [...document.querySelectorAll('.question-card')];
const questionCount = document.querySelector('#question-count');
const finishInterview = document.querySelector('#finish-interview');
const debrief = document.querySelector('#interview-debrief');
const feedback = document.querySelector('#interview-feedback');
const review = document.querySelector('#question-review');
let finishedEarly = false;
function updateInterview() {
  const selected = questionCards.filter(card => card.querySelector('button').getAttribute('aria-pressed') === 'true');
  const complete = selected.length > 0 && (selected.length === 5 || finishedEarly);
  questionCount.textContent = `${selected.length} of 5 questions asked`;
  questionCards.forEach(card => {
    const button = card.querySelector('button');
    const chosen = selected.includes(card);
    button.disabled = selected.length === 5 && !chosen;
    button.setAttribute('aria-expanded', String(chosen));
    card.querySelector('.dana-answer').hidden = !chosen;
    card.querySelector('.question-mark').textContent = chosen ? '−' : '+';
  });
  finishInterview.disabled = selected.length === 0;
  finishInterview.setAttribute('aria-expanded', String(complete));
  debrief.hidden = !complete;
  review.replaceChildren();
  if (!complete) { feedback.textContent = ''; return; }
  feedback.textContent = selected.some(card => card.dataset.value === 'low')
    ? 'Questions about the AI itself, like which model or what personality, can wait. In discovery, they use up time without telling you anything about the problem.'
    : 'Strong interview. Every question got you something useful.';
  selected.forEach(card => {
    const row = document.createElement('li');
    const value = document.createElement('strong');
    value.textContent = card.dataset.value === 'low' ? 'Low value: ' : 'High value: ';
    row.append(value, card.querySelector('.question-choice span:nth-child(2)').textContent);
    review.append(row);
  });
}
questionCards.forEach(card => card.querySelector('button').addEventListener('click', event => {
  const button = event.currentTarget;
  button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
  updateInterview();
}));
finishInterview.addEventListener('click', () => { finishedEarly = true; updateInterview(); });
document.querySelector('#reset-interview').addEventListener('click', () => {
  finishedEarly = false;
  questionCards.forEach(card => card.querySelector('button').setAttribute('aria-pressed', 'false'));
  updateInterview();
});
