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

// Accordions use native <details>/<summary> for keyboard and no-JavaScript support.
