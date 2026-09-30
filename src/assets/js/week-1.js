if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => { for (const entry of entries) if(entry.isIntersecting) { entry.target.classList.add('reveal'); reveal.unobserve(entry.target); } }, {threshold:.12});
  document.querySelectorAll('.opening-diagram,.token-lab,.model-map,.next-week').forEach(el => reveal.observe(el));
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
