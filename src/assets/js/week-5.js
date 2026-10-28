/* Native content remains readable without JavaScript. */
(() => {
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
