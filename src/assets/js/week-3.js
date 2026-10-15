/* All lesson text and answers start visible. JavaScript only enhances navigation. */
(() => {
  const stepper = document.querySelector('#prompt-stepper');
  const versions = [...stepper.querySelectorAll('.prompt-version')];
  const previous = document.querySelector('#version-previous');
  const next = document.querySelector('#version-next');
  const count = document.querySelector('#version-count');
  let index = 0;
  function renderVersion() {
    versions.forEach((version, i) => { version.hidden = i !== index; });
    previous.disabled = index === 0;
    next.disabled = index === versions.length - 1;
    count.textContent = `Version ${index + 1} of ${versions.length}`;
  }
  function moveVersion(delta) {
    index = Math.max(0, Math.min(versions.length - 1, index + delta));
    renderVersion();
    if (stepper.getBoundingClientRect().top < anchorOffset()) {
      window.scrollTo({top: window.scrollY + stepper.getBoundingClientRect().top - anchorOffset(), behavior: 'instant'});
    }
  }
  previous.addEventListener('click', () => moveVersion(-1));
  next.addEventListener('click', () => moveVersion(1));
  stepper.querySelector('.widget-controls').hidden = false;
  renderVersion();

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
