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
