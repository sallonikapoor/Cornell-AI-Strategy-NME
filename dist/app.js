const chapterLinks = [...document.querySelectorAll('#chapters a')];
const chapters = [...document.querySelectorAll('main > .chapter')];
let scheduled = false;
function updateReading() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector('#progress').style.width = `${total > 0 ? Math.min(100, window.scrollY / total * 100) : 0}%`;
  let current = chapters[0].id;
  for (const chapter of chapters) if (chapter.getBoundingClientRect().top <= 180) current = chapter.id;
  for (const link of chapterLinks) {
    const active = link.hash === `#${current}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  }
  scheduled = false;
}
window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); } }, {passive:true});
window.addEventListener('resize', updateReading);
updateReading();
if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => { for (const entry of entries) if(entry.isIntersecting) { entry.target.classList.add('reveal'); reveal.unobserve(entry.target); } }, {threshold:.12});
  document.querySelectorAll('.opening-diagram,.token-lab,.activity,.model-map,.sort-lab,.next-week').forEach(el => reveal.observe(el));
}

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

const tasks = [
  {task:'Extract invoice fields from PDFs', answer:'Combination', why:'An LLM handles varied layouts. Code checks that the line items add up to the total.'},
  {task:'Match vendor names to the vendor list', answer:'Combination', why:'Use fuzzy-matching code first, ask an LLM to suggest matches for leftovers, and have a human confirm.'},
  {task:'Compare invoice totals to purchase order amounts', answer:'Rules / code', why:'This requires exact arithmetic. Use a deterministic calculation rather than generated text.'},
  {task:'Flag possible duplicate invoices', answer:'Rules / code', why:'The same invoice number, vendor, and amount form a simple, testable rule.'},
  {task:'Explain each mismatch in plain English', answer:'LLM', why:'Summarizing is a strength. The example still calls for reviewing the text before use.'},
  {task:'Approve payment on mismatches over $5,000', answer:'Human', why:'Financial accountability cannot be delegated to a model.'}
];
let taskIndex = 0;
const choices = [...document.querySelectorAll('[data-answer]')];
const feedback = document.querySelector('#sort-feedback');
const next = document.querySelector('#sort-next');
for (const button of choices) button.addEventListener('click', () => {
  const current = tasks[taskIndex];
  for (const choice of choices) { choice.disabled = true; choice.classList.toggle('chosen', choice === button); choice.classList.toggle('suggested', choice.dataset.answer === current.answer); }
  feedback.replaceChildren();
  const title = document.createElement('strong'); title.textContent = button.dataset.answer === current.answer ? `Matches the example: ${current.answer}` : `The lesson’s choice: ${current.answer}`;
  const explanation = document.createElement('p'); explanation.textContent = current.why;
  feedback.append(title, explanation); next.hidden = false; next.textContent = taskIndex === tasks.length - 1 ? 'Practice again ↻' : 'Next subtask →';
});
next.addEventListener('click', () => {
  taskIndex = (taskIndex + 1) % tasks.length;
  document.querySelector('#sort-task').textContent = tasks[taskIndex].task;
  document.querySelector('#sort-counter').textContent = `0${taskIndex + 1} / 06`;
  feedback.replaceChildren(); next.hidden = true;
  choices.forEach(choice => { choice.disabled = false; choice.classList.remove('chosen','suggested'); });
  choices[0].focus({preventScroll:true});
});
