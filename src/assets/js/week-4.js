/* Answers and data remain readable without JavaScript. */
(() => {
  // Read the same authored rows that provide the no-script fallback.
  const callList = document.querySelector('#call-list');
  const callRows = [...callList.querySelectorAll('tbody tr')].map(row =>
    [...row.cells].map(cell => cell.textContent.trim()));
  const callButtons = [...callList.querySelectorAll('[data-calls]')];
  function renderCalls(calls) {
    const row = callRows.find(values => values[0] === calls);
    for (const button of callButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.calls === calls));
    }
    for (const stat of callList.querySelectorAll('[data-stat]')) {
      stat.textContent = row[Number(stat.dataset.stat)];
    }
    for (const index of [5, 6]) {
      const meter = document.querySelector(`#call-meter-${index}`);
      meter.value = parseFloat(row[index]);
      meter.textContent = row[index];
    }
    callList.querySelector('.call-note').textContent = row[7];
  }
  for (const button of callButtons) {
    button.addEventListener('click', () => renderCalls(button.dataset.calls));
  }
  renderCalls('20');
  callList.querySelector('.call-fallback').hidden = true;
  callList.querySelector('.call-interactive').hidden = false;
  for (const quiz of document.querySelectorAll('.lesson-quiz')) {
    const cards = [...quiz.querySelectorAll('.quiz-card')];
    const score = quiz.querySelector('.quiz-score');
    const choices = new Map();
    function updateScore() {
      const correct = cards.filter(card => choices.get(card) === card.dataset.answer).length;
      score.textContent = `${correct} of ${cards.length} correct`;
    }
    function reset() {
      choices.clear();
      for (const card of cards) {
        card.classList.remove('answered');
        card.querySelector('.quiz-answer').hidden = true;
        card.querySelector('.quiz-verdict').textContent = '';
        for (const button of card.querySelectorAll('[data-choice]')) {
          button.disabled = false;
          button.classList.remove('chosen', 'suggested');
          button.setAttribute('aria-expanded', 'false');
        }
      }
      updateScore();
    }
    for (const card of cards) {
      const answer = card.querySelector('.quiz-answer');
      for (const button of card.querySelectorAll('[data-choice]')) {
        button.addEventListener('click', () => {
          if (choices.has(card)) return;
          choices.set(card, button.dataset.choice);
          card.classList.add('answered');
          answer.hidden = false;
          card.querySelector('.quiz-verdict').textContent = button.dataset.choice === card.dataset.answer ? 'Correct.' : 'Incorrect.';
          for (const option of card.querySelectorAll('[data-choice]')) {
            option.disabled = true;
            option.classList.toggle('chosen', option === button);
            option.classList.toggle('suggested', option.dataset.choice === card.dataset.answer);
            option.setAttribute('aria-expanded', 'true');
          }
          updateScore();
        });
      }
      card.querySelector('fieldset').hidden = false;
    }
    quiz.querySelector('.widget-controls').hidden = false;
    quiz.querySelector('.quiz-reset').addEventListener('click', reset);
    reset();
  }

  for (const details of document.querySelectorAll('details')) {
    const summary = details.querySelector('summary');
    const update = () => summary.setAttribute('aria-expanded', String(details.open));
    details.addEventListener('toggle', update);
    update();
  }

  function anchorOffset() {
    const header = document.querySelector('.topbar').getBoundingClientRect().height;
    const sidebar = document.querySelector('.sidebar');
    const navigation = getComputedStyle(sidebar).position === 'sticky' ? sidebar.getBoundingClientRect().height : 0;
    const offset = header + navigation + 12;
    document.body.style.setProperty('--lesson-anchor-offset', `${offset}px`);
    return offset;
  }
  async function jump(hash) {
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    if (document.fonts) await document.fonts.ready;
    window.scrollTo({top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - anchorOffset()), behavior: 'instant'});
    updateReading();
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.classList.contains('skip') || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (!document.getElementById(link.hash.slice(1))) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    jump(link.hash);
  });
  window.addEventListener('hashchange', () => jump(location.hash));
  window.addEventListener('resize', anchorOffset);
  anchorOffset();
  if (location.hash) jump(location.hash);
})();
