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

/* The demo only sends a request when a reader clicks a button. */
(() => {
  const demo = document.querySelector('.api-demo');
  if (!demo) return;
  const buttons = [...demo.querySelectorAll('[data-demo]')];
  const status = demo.querySelector('.api-demo-status');
  const body = demo.querySelector('.api-demo-body');
  const names = {200: 'OK', 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 429: 'Too Many Requests', 500: 'Internal Server Error', 503: 'Service Unavailable'};
  for (const button of buttons) {
    button.addEventListener('click', async () => {
      buttons.forEach(item => { item.disabled = true; });
      status.textContent = 'Sending…';
      body.textContent = '';
      const started = performance.now();
      try {
        const url = button.dataset.demo === 'good' ? demo.dataset.goodUrl : demo.dataset.badUrl;
        const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
        status.textContent = `Status: ${response.status}${names[response.status] ? ' ' + names[response.status] : ''} · ${Math.round(performance.now() - started)} ms`;
        const text = await response.text();
        try { body.textContent = JSON.stringify(JSON.parse(text), null, 2); }
        catch { body.textContent = text; }
      } catch {
        status.textContent = "No response. The request didn't finish. Check your connection and try again.";
        body.textContent = '';
      } finally {
        buttons.forEach(item => { item.disabled = false; });
      }
    });
  }
})();
