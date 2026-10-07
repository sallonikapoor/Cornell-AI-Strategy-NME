// All durations are in seconds. Agenda totals 77 minutes; optional card writing adds 4.
export const CONFIG = {
  storageKey: 'cais-week-2-live-v1',
  agenda: {Hook:10,Teach:8,'Live interview':15,Rotation:20,Metrics:12,Scope:7,Wrap:5},
  durations: {hook:120,interview:900,writeCard:240,rotation:360,transition:60,metricWrite:180,metricBreak:180,scope:420,interviewBrief:60,race1:45,race2:45,race3:45,race4:45,quiz1:45,quiz2:45,quiz3:45,quiz4:45},
  whiteboardBonus: 2,
  cardsPerTeam: 5
};
import {makeTeams, rolesFor, pairTeams, remaining, elapsedClock, formatTime} from './live-session-core.mjs';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const announce=text=>{const el=$('#live-announcement');if(el)el.textContent=text;};
const h=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const palette=['#B31B1B','#6E0D0D','#141414','#D6453A','#5C5C5C'];
const color=i=>palette[i%palette.length];
async function prepareOffline(){
  if(!('serviceWorker' in navigator))return;
  try {
    const root=new URL(document.body.classList.contains('live-projector')?'./':'../',location.href);
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
} else if(document.body.classList.contains('live-projector')) initialize();
function initialize(){
  document.body.classList.add('js');
  const beats=$$('.beat');
  const fresh=()=>({version:1,teams:makeTeams([]),roster:'',started:0,current:0,reveals:{},timers:{},activeTimer:null,logs:[],turn:0,whiteboard:false,whiteboardTeam:null,rotationPhase:-1,scopeIndex:-1,placements:{},pairs:[],formula:{},formulaDraft:{},example:false,muted:false,winner:false});
  let state=fresh(),storageOK=true,audio,scrollPending=false;
  try {const saved=JSON.parse(localStorage.getItem(CONFIG.storageKey)||'null');if(saved?.version===1&&Array.isArray(saved.teams)&&saved.teams.length&&saved.teams.every(t=>Array.isArray(t.members)&&typeof t.name==='string'&&Number.isFinite(t.score))) state={...state,...saved};}catch{storageOK=false;}
  const save=()=>{try{localStorage.setItem(CONFIG.storageKey,JSON.stringify(state));}catch{storageOK=false;$('#storage-note').textContent='Storage is unavailable. Keep this tab open; refresh will lose changes.';}};
  if(!storageOK)$('#storage-note').textContent='Storage is unavailable. Keep this tab open; refresh will lose changes.';
  const open=id=>{const d=document.getElementById(id);if(!d.open)d.showModal();};
  const closeAll=()=>$$('dialog[open]').forEach(d=>d.close());
  const go=i=>{state.current=Math.max(0,Math.min(beats.length-1,i));beats[state.current].scrollIntoView({behavior:'instant',block:'start'});history.replaceState(null,'','#'+beats[state.current].id);save();renderBar();};
  const goId=id=>go(beats.findIndex(b=>b.id===id));
  function renderBar(){
    const b=beats[state.current];$('#current-beat').textContent=`${state.current+1}/${beats.length} · ${b.dataset.section}`;
    $$('#agenda button').forEach(button=>button.setAttribute('aria-current',String(button.dataset.section===b.dataset.section)));
    $('#start-session').textContent=state.started?'Session started':'Start session';
    $('#mute').textContent=state.muted?'Unmute':'Mute';$('#mute').setAttribute('aria-pressed',String(state.muted));
  }
  $('#agenda').innerHTML=Object.keys(CONFIG.agenda).map(s=>`<button data-section="${h(s)}" aria-label="Jump to ${h(s)}" title="${h(s)}"></button>`).join('');
  $$('#agenda button').forEach(b=>b.addEventListener('click',()=>go(beats.findIndex(el=>el.dataset.section===b.dataset.section))));
  function renderTeams(){
    $('#roster').value=state.roster;
    $('#teams-grid').innerHTML=state.teams.map((t,i)=>`<article class="team-card" style="--team:${color(i)}"><label>Team ${i+1}<input data-team-name="${i}" value="${h(t.name)}" maxlength="28"></label><p>${h(t.members.join(' · ')||'A · B · C')}</p></article>`).join('');
    $$('[data-team-name]').forEach(input=>input.addEventListener('change',()=>{state.teams[+input.dataset.teamName].name=input.value.trim()||`Team ${+input.dataset.teamName+1}`;save();renderDependent();}));
  }
  function renderScores(){
    $('#score-list').innerHTML=state.teams.map((t,i)=>`<div class="score-row" style="--team:${color(i)}"><strong>${h(t.name)}</strong><button data-score="${i}" data-delta="-1" aria-label="Subtract point from ${h(t.name)}">−</button><output>${t.score}</output><button data-score="${i}" data-delta="1" aria-label="Add point to ${h(t.name)}">+</button></div>`).join('');
    $$('[data-score]').forEach(b=>b.addEventListener('click',()=>{state.teams[+b.dataset.score].score+=+b.dataset.delta;state.winner=false;save();renderScores();renderFinal();}));
  }
  const spent=i=>state.logs.filter(l=>l.team===i).length;
  function renderInterview(){
    const exhausted=state.teams.every((_,i)=>spent(i)>=CONFIG.cardsPerTeam);
    $('#turn-indicator').style.setProperty('--team',color(state.turn));
    $('#turn-indicator').textContent=exhausted?'All cards used. Press R to debrief.':`${state.teams[state.turn].name}, your question.`;
    $('#question-budget').innerHTML=state.teams.map((t,i)=>`<span style="--team:${color(i)}">${h(t.name)} <b aria-label="${CONFIG.cardsPerTeam-spent(i)} cards left">${'▰'.repeat(Math.max(0,CONFIG.cardsPerTeam-spent(i)))}${'▱'.repeat(spent(i))}</b></span>`).join('');
    $$('[data-question]').forEach(b=>{const log=state.logs.find(l=>l.question===+b.dataset.question);b.disabled=!!log||exhausted;b.classList.toggle('asked',!!log);b.style.setProperty('--team',log?color(log.team):'transparent');b.title=log?`Asked by ${state.teams[log.team].name}`:'';});
    $('#custom-question').disabled=exhausted;
    $('#logged-questions').innerHTML=state.logs.map(l=>'<li><strong>'+h(state.teams[l.team].name)+':</strong> '+h(l.custom||$('[data-question="'+l.question+'"]').textContent)+'</li>').join('');
    $('#interview-count').textContent=`${state.logs.length} question${state.logs.length===1?'':'s'} asked · ${state.logs.filter(l=>l.custom).length} custom`;
    $('#discovery-result').textContent=state.whiteboardTeam!==null?`${state.teams[state.whiteboardTeam].name} uncovered the repair-status whiteboard.`:'Where do you keep track of each repair’s status?';
  }
  function showWhiteboard(team=null){
    if(!state.whiteboard){state.whiteboard=true;state.whiteboardTeam=team;if(team!==null)state.teams[team].score+=CONFIG.whiteboardBonus;save();}
    $('#whiteboard-credit').textContent=team===null?'THE QUESTION NOBODY ASKED':`${state.teams[team].name} · +${CONFIG.whiteboardBonus} points`;
    chime(true);open('whiteboard');announce('The whiteboard. The data does not exist anywhere a chatbot can reach.');renderScores();renderFinal();
  }
  function logQuestion(question,custom='',key=false){
    if(spent(state.turn)>=CONFIG.cardsPerTeam||state.logs.some(l=>question!==null&&l.question===question))return;
    if(custom&&state.logs.some(l=>(l.custom||$('[data-question="'+l.question+'"]').textContent).trim().toLowerCase()===custom.toLowerCase())){$('#custom-error').textContent='That question has already been asked.';return;}
    const team=state.turn;state.logs.push({team,question,custom});
    for(let n=1;n<=state.teams.length;n++){const next=(team+n)%state.teams.length;if(spent(next)<CONFIG.cardsPerTeam){state.turn=next;break;}}
    if($('#custom-dialog').open)$('#custom-dialog').close();
    if((question===2||key)&&!state.whiteboard)showWhiteboard(team);
    save();renderInterview();announce(`Question logged for ${state.teams[team].name}. ${$('#turn-indicator').textContent}`);
  }
  $$('[data-question]').forEach(b=>b.addEventListener('click',()=>logQuestion(+b.dataset.question)));
  $('#custom-question').addEventListener('click',()=>{$('#custom-form').reset();$('#custom-error').textContent='';open('custom-dialog');$('#custom-text').focus();});
  $('#custom-form').addEventListener('submit',e=>{e.preventDefault();const text=$('#custom-text').value.trim();if(text)logQuestion(null,text,$('#custom-key').checked);});
  function renderRoles(){
    const phase=Math.max(0,state.rotationPhase),round=Math.min(2,Math.floor(phase/2));
    $('#round-label').textContent=state.rotationPhase===5?'Three rounds complete':`${phase%2?'Switch roles → ':''}Round ${round+1} / 3`;
    $('#role-table').innerHTML='<table><thead><tr><th>Team</th><th>Consultant</th><th>Client</th><th>Observer</th></tr></thead><tbody>'+state.teams.map(t=>'<tr><th>'+h(t.name)+'</th>'+rolesFor(t,round).map(n=>'<td>'+h(n)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
  }
  function startTimer(key,seconds){
    if(state.activeTimer&&state.activeTimer!==key){const old=state.timers[state.activeTimer];if(old?.running){old.left=remaining(old);old.running=false;}}
    const t=state.timers[key]||{left:CONFIG.durations[key]*1000,total:CONFIG.durations[key]*1000,running:false};
    if(seconds!==undefined){t.left=seconds*1000;t.total=t.left;}
    t.deadline=Date.now()+t.left;t.running=true;t.ended=false;state.timers[key]=t;state.activeTimer=key;save();tick();
  }
  function toggleTimer(key){
    primeAudio();if(key==='rotation'&&(state.rotationPhase<0||state.rotationPhase>=5)){rotationPhase(0);return;}const t=state.timers[key];if(t?.running){t.left=remaining(t);t.running=false;save();tick();}else startTimer(key,t?.left===0?CONFIG.durations[key]:undefined);
  }
  function rotationPhase(phase){
    state.rotationPhase=phase;
    if($('#transition').open)$('#transition').close();
    if(phase>=5){state.rotationPhase=5;save();renderRoles();goId('rotation-close');announce('All three rounds complete.');return;}
    startTimer('rotation',phase%2?CONFIG.durations.transition:CONFIG.durations.rotation);renderRoles();goId('rotation');
    if(phase%2){$('#transition-next').textContent=`Next: round ${Math.floor(phase/2)+2}. Everyone moves to the next role.`;open('transition');announce('Switch roles.');}
    save();
  }
  $('#start-rotation').addEventListener('click',()=>{primeAudio();rotationPhase(0);});
  $('#next-rotation').addEventListener('click',()=>rotationPhase(Math.min(5,state.rotationPhase+1)));
  function renderSwaps(){const teams=state.teams;$('#swap-teams').innerHTML=teams.map((t,i)=>`<div class="swap" style="--team:${color(i)}">${h(t.name)} <span>→</span> ${h(teams[(i+1)%teams.length].name)}</div>`).join('');}
  function renderPairs(){ $('#peer-pairs').innerHTML=state.pairs.map(g=>'<div>'+g.map(p=>`<span style="--team:${color(p.team)}">${h(p.name)} <small>(${h(state.teams[p.team].name)})</small></span>`).join(' ↔ ')+(g.length===1?' · join another review group':'')+'</div>').join(''); }
  $('#pair-members').addEventListener('click',()=>{state.pairs=pairTeams(state.teams);save();renderPairs();});
  function renderFinal(){const sorted=state.teams.map((t,i)=>({...t,index:i})).sort((a,b)=>b.score-a.score);$('#final-scores').classList.toggle('celebrating',state.winner);$('#final-scores').innerHTML=(state.winner?`<p class="winner-title">${sorted.filter(t=>t.score===sorted[0].score).map(t=>h(t.name)).join(' + ')} ${sorted.filter(t=>t.score===sorted[0].score).length>1?'share the win':'wins'}</p>`:'')+sorted.map(t=>`<div style="--team:${color(t.index)}"><strong>${h(t.name)}</strong><b>${t.score}</b></div>`).join('');}
  $('#celebrate').addEventListener('click',()=>{state.winner=true;save();renderFinal();chime(true);});
  const scopeRequests=['Read refund emails and draft replies for review.','Auto-approve refunds under $50.','Handle phone refund requests.','Connect directly to the ticketing platform.','Draft replies in Spanish.','Flag likely fraud.','Add a public refund-status page.','Check the policy and calculate refund amounts.'];
  function renderScope(){
    const index=state.scopeIndex,current=$('#scope-request');
    current.textContent=index<0?'Ready for the first request':scopeRequests[index];current.dataset.index=index;
    current.classList.toggle('placed',index>=0&&!!state.placements[index]);current.setAttribute('aria-disabled',String(index<0||!!state.placements[index]));
    $('#next-request').disabled=index>=0&&!state.placements[index]||index===scopeRequests.length-1;
    $$('.scope-pile').forEach(col=>col.querySelector('ol').innerHTML=Object.entries(state.placements).filter(([,pile])=>pile===col.dataset.pile).map(([i])=>`<li>${h(scopeRequests[i])}</li>`).join(''));
  }
  function nextRequest(){if(state.scopeIndex>=0&&!state.placements[state.scopeIndex]){announce('Place the current request first.');return;}if(state.scopeIndex<scopeRequests.length-1)state.scopeIndex++;save();renderScope();}
  function place(pile){const i=state.scopeIndex;if(i<0||state.placements[i])return;state.placements[i]=pile;save();renderScope();announce(`Placed in ${pile}.`);}
  $('#next-request').addEventListener('click',nextRequest);$$('[data-place]').forEach(b=>b.addEventListener('click',()=>place(b.dataset.place)));
  const drag=$('#scope-request');let dragging=false;
  drag.addEventListener('pointerdown',e=>{if(state.scopeIndex<0||state.placements[state.scopeIndex])return;dragging=true;drag.setPointerCapture(e.pointerId);drag.classList.add('dragging');});
  drag.addEventListener('pointermove',e=>{if(!dragging)return;$$('.scope-pile').forEach(c=>c.classList.toggle('drop-target',c===document.elementFromPoint(e.clientX,e.clientY)?.closest('.scope-pile')));});
  drag.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;drag.classList.remove('dragging');const pile=document.elementFromPoint(e.clientX,e.clientY)?.closest('.scope-pile');if(pile)place(pile.dataset.pile);$$('.scope-pile').forEach(c=>c.classList.remove('drop-target'));});
  drag.addEventListener('pointercancel',()=>{dragging=false;drag.classList.remove('dragging');$$('.scope-pile').forEach(c=>c.classList.remove('drop-target'));});
  drag.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('[data-place]').focus();}});
  const example={who:'The box office staff',what:'refund emails',cause:'every request is handled by hand',impact:'about 10 hours a week, delayed refunds, and occasional math mistakes'};
  function renderFormula(){ $$('[data-slot]').forEach(el=>el.value=state.formula[el.dataset.slot]||'');$('#formula-preview').textContent=state.example?"The box office staff spend about 10 hours a week on refund emails because every request is handled by hand, which delays refunds and leads to occasional math mistakes.":'';$('#formula-example').setAttribute('aria-pressed',String(state.example));$('#formula-example').textContent=state.example?'Restore team version':'Show example'; }
  $$('[data-slot]').forEach(el=>el.addEventListener('input',()=>{state.formula[el.dataset.slot]=el.value;save();}));
  $('#formula-example').addEventListener('click',()=>{if(!state.example){state.formulaDraft={...state.formula};state.formula={...example};}else state.formula={...state.formulaDraft};state.example=!state.example;save();renderFormula();});
  function renderReveals(){beats.forEach(b=>{const n=state.reveals[b.id]||0;b.querySelectorAll('.reveal-item').forEach((el,i)=>el.classList.toggle('revealed',i<n));b.querySelectorAll('[data-metric]').forEach((el,i)=>el.classList.toggle('highlighted',i<n));});}
  function reveal(){const b=beats[state.current];if(b.id==='scope'){nextRequest();return;}if(b.id==='practice'){if(!state.whiteboard&&state.teams.every((_,i)=>spent(i)>=CONFIG.cardsPerTeam))showWhiteboard();else if(state.whiteboard)goId('interview-findings');else announce('Keep asking questions; reveal is available after all cards are spent.');return;}
    const n=state.reveals[b.id]||0,items=b.querySelectorAll('.reveal-item');if(n<items.length){state.reveals[b.id]=n+1;save();renderReveals();announce(items[n].textContent);}}
  $$('.reveal-trigger').forEach(button=>button.addEventListener('click',()=>{const b=button.closest('.beat'),items=[...b.querySelectorAll('.reveal-item')],item=button.parentElement.querySelector('.reveal-item');state.reveals[b.id]=Math.max(state.reveals[b.id]||0,items.indexOf(item)+1);save();renderReveals();announce(item.textContent);}));
  function primeAudio(){if(state.muted)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();}catch{}}
  function chime(special=false){if(state.muted)return;primeAudio();if(!audio)return;try{[0,.18].forEach((delay,i)=>{const o=audio.createOscillator(),g=audio.createGain(),at=audio.currentTime+delay;o.frequency.value=special?(i?880:660):(i?660:523);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.08,at+.02);g.gain.exponentialRampToValueAtTime(.001,at+.35);o.connect(g);g.connect(audio.destination);o.start(at);o.stop(at+.4);});}catch{}}
  function tick(){
    const now=Date.now();$('#session-clock').textContent=formatTime(elapsedClock(state.started,now));
    for(const [key,t] of Object.entries(state.timers))if(t.running&&remaining(t,now)===0){t.running=false;t.left=0;t.ended=true;save();announce('Time is up.');chime();const panel=$(`[data-timer="${key}"]`);panel?.classList.add('time-up');setTimeout(()=>panel?.classList.remove('time-up'),1800);if(key==='rotation'&&state.rotationPhase>=0&&state.rotationPhase<5){rotationPhase(state.rotationPhase+1);return;}}
    $$('.timer').forEach(panel=>{const key=panel.dataset.timer,t=state.timers[key],left=t?remaining(t,now):CONFIG.durations[key]*1000;panel.querySelector('output').textContent=formatTime(left);panel.classList.toggle('urgent',left<=30000);panel.querySelector('i').style.width=`${Math.min(100,100*left/(t?.total||CONFIG.durations[key]*1000))}%`;panel.querySelector('[data-clock="toggle"]').textContent=t?.running?'Pause / T':'Start / T';});
    const active=state.activeTimer&&state.timers[state.activeTimer];$('#active-timer').textContent=active?`${state.activeTimer} ${formatTime(remaining(active,now))}${active.running?'':' · paused'}`:'';
    if($('#transition').open)$('#transition-count').textContent=formatTime(remaining(state.timers.rotation,now));
  }
  $$('[data-clock]').forEach(b=>b.addEventListener('click',()=>{const key=b.closest('.timer').dataset.timer;if(b.dataset.clock==='toggle')toggleTimer(key);if(b.dataset.clock==='reset'){const seconds=key==='rotation'&&state.rotationPhase%2===1?CONFIG.durations.transition:CONFIG.durations[key];state.timers[key]={left:seconds*1000,total:seconds*1000,running:false};save();tick();}if(b.dataset.clock==='add'){const t=state.timers[key]||{left:CONFIG.durations[key]*1000,total:CONFIG.durations[key]*1000,running:false};if(t.running)t.deadline+=60000;else t.left+=60000;t.total+=60000;state.timers[key]=t;save();tick();}}));
  $('#start-session').addEventListener('click',()=>{primeAudio();if(!state.started)state.started=Date.now();save();renderBar();});
  $('#mute').addEventListener('click',()=>{state.muted=!state.muted;save();renderBar();});
  $$('[data-open]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.open)));$$('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  $$('[data-step]').forEach(b=>b.addEventListener('click',()=>go(state.current+ +b.dataset.step)));
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{announce('Fullscreen is unavailable in this browser. Use its fullscreen command.');}}
  $('#fullscreen').addEventListener('click',fullscreen);$('#reset-session').addEventListener('click',()=>open('reset-confirm'));
  $('#confirm-reset').addEventListener('click',()=>{state=fresh();save();closeAll();renderAll();go(0);announce('Session reset.');});
  function buildTeams(){const names=$('#roster').value.split(/\r?\n/).map(n=>n.trim().slice(0,50)).filter(Boolean).slice(0,60);state={...fresh(),roster:names.join('\n'),teams:makeTeams(names),started:state.started,muted:state.muted,current:state.current};save();renderAll();announce('Teams created. Scores and activity progress restarted.');}
  $('#make-teams').addEventListener('click',buildTeams);$('#reshuffle').addEventListener('click',buildTeams);
  $$('.copy-prompt').forEach(b=>b.addEventListener('click',async()=>{const el=document.getElementById(b.dataset.copy),msg=b.closest('.prompt-card').querySelector('.copy-status');try{await navigator.clipboard.writeText(el.textContent);msg.textContent='Prompt copied.';}catch{const r=document.createRange();r.selectNodeContents(el);const sel=window.getSelection();sel.removeAllRanges();sel.addRange(r);msg.textContent='Select and copy the prompt with your device’s Copy command.';}}));
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    if($('#scores').open&&e.key.toLowerCase()==='s'){e.preventDefault();$('#scores').close();return;}
    if($('#shortcuts').open&&e.key==='?'){e.preventDefault();$('#shortcuts').close();return;}
    if($('dialog[open]'))return;
    if(e.key===' '&&e.target.closest('button,a,summary'))return;
    const key=e.key.toLowerCase();
    if(['arrowright',' ','pagedown','arrowleft','pageup','t','r','s','f','?'].includes(key))e.preventDefault();
    if(['arrowright',' ','pagedown'].includes(key))go(state.current+1);
    if(['arrowleft','pageup'].includes(key))go(state.current-1);
    if(key==='r')reveal();if(key==='s')open('scores');if(key==='?')open('shortcuts');if(key==='f')fullscreen();
    if(key==='t'){const key=beats[state.current].querySelector('.timer')?.dataset.timer||(beats[state.current].id==='observer'?'rotation':state.activeTimer);if(key)toggleTimer(key);}
  });
  window.addEventListener('scroll',()=>{if(scrollPending)return;scrollPending=true;requestAnimationFrame(()=>{scrollPending=false;const index=beats.reduce((last,b,i)=>b.getBoundingClientRect().top<=window.innerHeight*.45?i:last,0);if(index!==state.current){state.current=index;save();renderBar();}});},{passive:true});
  window.addEventListener('hashchange',()=>{const i=beats.findIndex(b=>'#'+b.id===location.hash);if(i>=0){state.current=i;save();renderBar();}});
  function renderDependent(){renderScores();renderInterview();renderRoles();renderSwaps();renderPairs();renderFinal();}
  function renderAll(){renderTeams();renderDependent();renderScope();renderFormula();renderReveals();renderBar();tick();}
  renderAll();
  const hashIndex=beats.findIndex(b=>'#'+b.id===location.hash);if(hashIndex>=0)go(hashIndex);else if(!location.hash&&state.current)go(state.current);
  setInterval(tick,200);
}
