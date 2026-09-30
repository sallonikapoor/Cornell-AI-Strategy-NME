export function renderSchedule(weeks, outputs) {
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateFormat = new Intl.DateTimeFormat('en-US', {month:'long', day:'numeric', timeZone:'UTC'});
const usedWeeks = new Set();

const rows = weeks.map(item => {
  if (!['available', 'coming-soon', 'break'].includes(item.status)) throw new Error('Invalid session status');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) throw new Error('Use ISO dates');
  const date = new Date(`${item.date}T12:00:00Z`);
  if (Number.isNaN(date.valueOf())) throw new Error('Invalid date');
  if (item.status === 'break') {
    if (item.week !== null || item.link !== null) throw new Error('Breaks have no week number or link');
    return `<li class="schedule-row schedule-break"><div class="schedule-entry"><time datetime="${escape(item.date)}">${dateFormat.format(date)}</time> <span class="break-title">${escape(item.title)}</span></div></li>`;
  }
  if (!Number.isInteger(item.week) || item.week < 1 || usedWeeks.has(item.week)) throw new Error('Invalid or duplicate week');
  usedWeeks.add(item.week);
  const content = `<span class="schedule-week">Week ${item.week}</span> <time datetime="${escape(item.date)}">${dateFormat.format(date)}</time> <span class="schedule-title">${escape(item.title)}</span>`;
  if (item.status === 'available') {
    if (!item.link || !/^[a-z0-9/-]+\/$/.test(item.link) || item.link.startsWith('/') || item.link.includes('..')) throw new Error('Use a relative lesson directory');
    if (!outputs.has(item.link + 'index.html')) throw new Error(`Missing lesson: ${item.link}`);
    return `<li class="schedule-row"><a class="schedule-entry schedule-link" href="${escape(item.link)}">${content}<span class="schedule-arrow" aria-hidden="true">↗</span></a></li>`;
  }
  if (item.link !== null) throw new Error('Coming-soon weeks must not link to unavailable pages');
  return `<li class="schedule-row"><div class="schedule-entry">${content}</div></li>`;
}).join('\n      ');

return rows;
}
