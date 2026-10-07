// All durations are in seconds. Agenda totals 77 minutes; optional card writing adds 4.
export const CONFIG = {
  agenda: {Hook:10,Teach:8,'Live interview':15,Rotation:20,Metrics:12,Scope:7,Wrap:5},
  durations: {writeCard:240}
};
const $=s=>document.querySelector(s);
const h=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function prepareOffline(){
  if(!('serviceWorker' in navigator))return;
  try {
    const root=new URL('../',location.href);
    await navigator.serviceWorker.register(new URL('sw.js',root),{scope:root.pathname});
    await navigator.serviceWorker.ready;
    if($('#offline-status'))$('#offline-status').textContent='Offline copy ready. Keep this tab bookmarked on this phone.';
  } catch {if($('#offline-status'))$('#offline-status').textContent='Offline copy unavailable. Keep this page open while connected.';}
}
prepareOffline();
if(document.body.classList.contains('facilitator')){
  $('#run-timings').innerHTML='<ul>'+Object.entries(CONFIG.agenda).map(([section,min])=>`<li><strong>${h(section)}</strong> · ${min} min</li>`).join('')+`</ul><p><strong>${Object.values(CONFIG.agenda).reduce((a,b)=>a+b,0)} minutes</strong> + optional ${CONFIG.durations.writeCard/60}-minute card writing.</p>`;
} else if(document.body.classList.contains('client-cards-page')){
  $('#print-cards').addEventListener('click',()=>window.print());
}
