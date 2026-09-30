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

for (const button of document.querySelectorAll('.copy-prompt')) {
  button.addEventListener('click', async () => {
    const prompt = document.getElementById(button.dataset.copy);
    const message = button.closest('.prompt-card').querySelector('.copy-status');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(prompt.textContent);
      message.textContent = 'Prompt copied. Paste it into your AI tool.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(prompt);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      prompt.focus({ preventScroll: true });
      message.textContent = 'Clipboard access is unavailable. The prompt is selected; copy it with Ctrl+C or Command+C, or use your device’s Copy command.';
    }
  });
}

for (const button of document.querySelectorAll('.pile-choice')) {
  button.addEventListener('click', () => {
    const card = button.closest('.capability-card');
    for (const option of card.querySelectorAll('.pile-choice')) {
      const selected = option === button;
      option.setAttribute('aria-pressed', String(selected));
      option.classList.toggle('chosen', selected);
      option.classList.toggle('suggested', option.dataset.choice === card.dataset.suggested);
    }
    const feedback = card.querySelector('.sort-feedback');
    feedback.querySelector('.choice-result').textContent = `Your choice: ${button.dataset.choice}. ${button.dataset.choice === card.dataset.suggested ? 'This matches the example.' : 'Compare your reasoning with the example below.'}`;
    feedback.hidden = false;
    document.getElementById('sort-reset-status').textContent = '';
  });
}
document.getElementById('reset-sort').addEventListener('click', () => {
  for (const button of document.querySelectorAll('.pile-choice')) {
    button.setAttribute('aria-pressed', 'false');
    button.classList.remove('chosen', 'suggested');
  }
  document.querySelectorAll('.sort-feedback').forEach(el => { el.hidden = true; });
  document.getElementById('sort-reset-status').textContent = 'All six cards reset. Choose a pile to try again.';
});
