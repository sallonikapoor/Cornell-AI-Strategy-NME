const COPPERLINE = {
  "patience": 8,
  "scopeSeconds": 180,
  "defaultTeams": 5,
  "facts": [
    {
      "id": "F1",
      "key": false,
      "text": "About 120 emails a week, over half asking \"is my bike ready?\""
    },
    {
      "id": "F2",
      "key": true,
      "text": "Repair status lives on a whiteboard in the back, often a day behind"
    },
    {
      "id": "F3",
      "key": false,
      "text": "Mechanics get interrupted constantly"
    },
    {
      "id": "F4",
      "key": false,
      "text": "Success = no interruptions, no repeat emails"
    },
    {
      "id": "F5",
      "key": false,
      "text": "Never quote a wrong price"
    },
    {
      "id": "F6",
      "key": false,
      "text": "Uses Square, ~$50/month, nobody technical"
    },
    {
      "id": "F7",
      "key": false,
      "text": "Two years of emails in Gmail"
    }
  ],
  "questions": [
    {
      "question": "Walk me through what happens when an email comes in today.",
      "cost": 1,
      "fact": "F3",
      "answer": "Whoever's at the counter reads it. If it's about a repair, they go into the back and ask a mechanic, then write back."
    },
    {
      "question": "How many emails do you get, and what are they about?",
      "cost": 1,
      "fact": "F1",
      "answer": "About 120 a week. More than half are \"is my bike ready yet?\""
    },
    {
      "question": "Where do you keep track of each repair's status?",
      "cost": 1,
      "fact": "F2",
      "answer": "On the whiteboard in the back. Honestly, it's usually a day behind."
    },
    {
      "question": "What's the most frustrating part of all this?",
      "cost": 1,
      "fact": "F3",
      "answer": "My mechanics get interrupted every ten minutes. It slows down the actual repairs."
    },
    {
      "question": "If this were fixed, what would be different?",
      "cost": 1,
      "fact": "F4",
      "answer": "Nobody bugs the mechanics, and customers stop emailing twice about the same bike."
    },
    {
      "question": "Is there anything an answer must never get wrong?",
      "cost": 1,
      "fact": "F5",
      "answer": "Prices. We quoted someone the wrong price last year and got a one-star review."
    },
    {
      "question": "What tools do you use, and what's your budget?",
      "cost": 1,
      "fact": "F6",
      "answer": "We run everything through Square. Maybe $50 a month? Nobody here is technical."
    },
    {
      "question": "Do you have past emails we could look at?",
      "cost": 1,
      "fact": "F7",
      "answer": "Two years of them, all in Gmail."
    },
    {
      "question": "Tell us about your shop.",
      "cost": 2,
      "fact": null,
      "answer": "Two locations, a repair service, lots of loyal customers. What else do you want to know?"
    },
    {
      "question": "Do your customers like your service?",
      "cost": 2,
      "fact": null,
      "answer": "Mostly! The reviews are good. Well, almost all of them."
    },
    {
      "question": "What if we built a chatbot that answers repair questions?",
      "cost": 3,
      "fact": null,
      "answer": "That's exactly what I asked for! When can you start?"
    },
    {
      "question": "Which AI model should we use?",
      "cost": 3,
      "fact": null,
      "answer": "No idea. That's why I called you."
    }
  ],
  "scope": [
    "Phase 1: Move repair status off the whiteboard into Square or a shared spreadsheet, and have code text customers automatically when their bike's status changes.",
    "Phase 2: An LLM drafts replies to general questions, like hours and services, for staff to review. It never quotes prices; it links to the price list.",
    "Out for now: a public chatbot.",
    "Done: cut \"is it ready?\" emails in half within a month, measured by tagging two weeks of emails before and after. Guardrail: zero wrong price quotes."
  ],
  "message": "Hi! We're Copperline Bikes. We get way too many customer emails and we want to use AI to answer them. Can you build us a chatbot? — Owner, Copperline Bikes",
  "rules": "Take turns asking the owner one question. Good questions find facts. Bad ones wear out the owner's patience.",
  "instructions": "With your team, using only what's in the case file, write: 1. A problem statement. 2. Phase 1: what you'd do first. 3. One success metric with a guardrail.",
  "missed": "Without the whiteboard, you'd have built a chatbot that still can't answer 'Is my bike ready?'",
  "closing": "The most valuable first step here isn't AI at all."
};
// Retire only the former Week 2 presentation state; leave other storage untouched.
try { localStorage.removeItem('cais-week-2-live-v1'); } catch {}
// Direct lesson visits start at Overview; explicit anchor links still work.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo({top: 0, behavior: 'instant'});
// Anchor jumps wait for fonts and use the actual sticky chrome height.
function lessonOffset() {
  const header = document.querySelector('.topbar').getBoundingClientRect().height;
  const sidebar = document.querySelector('.sidebar');
  const nav = getComputedStyle(sidebar).position === 'sticky' ? sidebar.getBoundingClientRect().height : 0;
  const offset = header + nav + 12;
  document.body.style.setProperty('--lesson-anchor-offset', `${offset}px`);
  return offset;
}
async function jumpToLessonAnchor(hash) {
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;
  if (document.fonts) await document.fonts.ready;
  const offset = lessonOffset();
  window.scrollTo({top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset), behavior: 'instant'});
  updateReading();
}
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.classList.contains('skip') || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (!document.getElementById(decodeURIComponent(link.hash.slice(1)))) return;
  event.preventDefault();
  if (location.hash !== link.hash) history.pushState(null, '', link.hash);
  jumpToLessonAnchor(link.hash);
});
window.addEventListener('hashchange', () => jumpToLessonAnchor(location.hash));
window.addEventListener('resize', lessonOffset);
lessonOffset();
if (location.hash) jumpToLessonAnchor(location.hash);


// Both interactions are scoped to their component; the lesson remains scrollable.
const worked = document.querySelector('#worked-stage');
const activity = document.querySelector('#copperline-stage');
const steps = [...worked.querySelectorAll('.example-step')];
let workedIndex = 0, presenting = null, returnFocus = null, siblings = [], fullscreenExit = Promise.resolve();
const html = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function present(panel, trigger) {
  if (presenting) return;
  await fullscreenExit;
  panel.dataset.native = 'false';
  presenting = panel; returnFocus = trigger;
  panel.hidden = false;
  panel.classList.add('presenting');
  panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','true');
  document.body.style.overflow = 'hidden';
  // Keep background content out of the focus order without moving the lesson DOM.
  for(let node=panel; node.parentElement && node.parentElement!==document.documentElement; node=node.parentElement) {
    for(const sibling of node.parentElement.children) if(sibling!==node&&!sibling.inert) {sibling.inert=true;siblings.push(sibling);}
  }
  panel.querySelector('[data-exit]').hidden = false;
  panel.focus({preventScroll:true});
  try { if(panel.requestFullscreen) await panel.requestFullscreen(); } catch { /* Fixed overlay is the fallback. */ }
  fitWorked();
}
function closePresentation() {
  if(!presenting)return;
  const panel=presenting;presenting=null;
  if(document.fullscreenElement)fullscreenExit=document.exitFullscreen().catch(()=>{});
  panel.dataset.native='false';
  panel.classList.remove('presenting');panel.removeAttribute('role');panel.removeAttribute('aria-modal');
  document.body.style.overflow='';siblings.forEach(el=>el.inert=false);siblings=[];
  if(panel===activity){panel.hidden=true;pauseTimer();}else panel.querySelector('[data-exit]').hidden=true;
  returnFocus?.focus({preventScroll:true});fitWorked();
}
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&presenting?.matches(':not(:fullscreen)')&&presenting.dataset.native==='true')closePresentation();else if(document.fullscreenElement&&presenting)presenting.dataset.native='true';});
[worked,activity].forEach(panel=>panel.querySelector('[data-exit]').addEventListener('click',closePresentation));
function fitWorked(){
  const grid=worked.querySelector('.worked-steps');grid.style.fontSize='';
  if(worked.classList.contains('presenting')){
    let size=22;grid.style.fontSize=size+'px';
    while(worked.scrollHeight>worked.clientHeight+1&&size>13){grid.style.fontSize=(--size)+'px';}
  }
}
function renderWorked(){
  steps.forEach((step,i)=>{step.hidden=i>workedIndex;step.classList.toggle('current',i===workedIndex);});
  worked.querySelector('#worked-counter').textContent=`${workedIndex+1} of ${steps.length}`;
  worked.querySelector('[data-back]').disabled=workedIndex===0;worked.querySelector('[data-next]').disabled=workedIndex===steps.length-1;
  fitWorked();
}
worked.querySelector('.stage-controls').hidden=false;
worked.querySelector('[data-back]').addEventListener('click',()=>{workedIndex=Math.max(0,workedIndex-1);renderWorked();});
worked.querySelector('[data-next]').addEventListener('click',()=>{workedIndex=Math.min(steps.length-1,workedIndex+1);renderWorked();});
worked.querySelector('#present-example').addEventListener('click',e=>present(worked,e.currentTarget));
window.addEventListener('resize',fitWorked);renderWorked();
const content=document.querySelector('#activity-content'), answerPanel=document.querySelector('#owner-answer'), restartPanel=document.querySelector('#restart-confirm');
let screen=0, teams=COPPERLINE.defaultTeams, turn=0, patience=COPPERLINE.patience, asked=new Set(), found=new Set(), pending=null, ended=false, reveal=0;
let timerLeft=COPPERLINE.scopeSeconds*1000, deadline=0, timerInterval=null, audio=null;
function factsMarkup(missed=false,onlyFound=false){return '<ul class="case-facts">'+COPPERLINE.facts.filter(f=>!onlyFound||found.has(f.id)).map(f=>'<li class="'+(!found.has(f.id)&&missed?'missed':'')+'">'+(f.key?'★ ':'')+(found.has(f.id)||missed?html(f.text):'???')+(!found.has(f.id)&&missed?'<small>Never found.</small>':'')+'</li>').join('')+'</ul>';}
function primeAudio(){try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();}catch{}}
function chime(){if(!audio)return;try{const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.frequency.value=660;gain.gain.setValueAtTime(.06,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.5);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+.5);}catch{}}
function clock(){const el=document.querySelector('#scope-clock');if(el){const seconds=Math.ceil(timerLeft/1000);el.textContent=`${String(Math.floor(seconds/60)).padStart(1,'0')}:${String(seconds%60).padStart(2,'0')}`;}}
function pauseTimer(){if(deadline)timerLeft=Math.max(0,deadline-Date.now());deadline=0;clearInterval(timerInterval);timerInterval=null;const b=document.querySelector('#timer-toggle');if(b)b.textContent='Start';clock();}
function toggleTimer(){primeAudio();if(deadline){pauseTimer();return;}if(!timerLeft)timerLeft=COPPERLINE.scopeSeconds*1000;deadline=Date.now()+timerLeft;document.querySelector('#timer-toggle').textContent='Pause';timerInterval=setInterval(()=>{timerLeft=Math.max(0,deadline-Date.now());clock();if(!timerLeft){pauseTimer();chime();document.querySelector('#scope-clock')?.classList.add('time-up');}},100);}
function endInterview(){ended=true;renderActivity();}
function renderActivity(){
  document.querySelector('#activity-counter').textContent=`${screen+1} of 4`;
  document.querySelector('#activity-back').disabled=screen===0;
  const next=document.querySelector('#activity-next');next.hidden=screen===0||(screen===1&&!ended);next.disabled=screen===3&&reveal>=3;
  next.textContent=screen===2?'Reveal':'Next';
  activity.dataset.screen=screen;
  if(screen===0){
    content.innerHTML='<h2>COPPERLINE BIKES.</h2><blockquote>'+html(COPPERLINE.message)+'</blockquote><label class="team-picker">Teams <select id="team-count">'+[['1','Solo'],['3','3'],['4','4'],['5','5'],['6','6']].map(([v,t])=>'<option value="'+v+'"'+(+v===teams?' selected':'')+'>'+t+'</option>').join('')+'</select></label><p>'+html(COPPERLINE.rules)+'</p><button class="button" id="begin-interview">Start the interview</button>';
    document.querySelector('#team-count').addEventListener('change',e=>teams=+e.target.value);
    document.querySelector('#begin-interview').addEventListener('click',()=>{screen=1;renderActivity();});
  }else if(screen===1){
    content.innerHTML='<div class="interview-layout"><div class="question-grid">'+COPPERLINE.questions.map((q,i)=>'<button class="activity-question" data-question="'+i+'"'+(asked.has(i)||ended?' disabled':'')+'>'+html(q.question)+(asked.has(i)?'<small>−'+q.cost+' patience</small>':'')+'</button>').join('')+'</div><aside class="case-file"><h3>Patience</h3><div class="patience-pips" aria-label="'+patience+' of '+COPPERLINE.patience+' patience">'+Array.from({length:COPPERLINE.patience},(_,i)=>'<i class="'+(i<patience?'remaining':'')+'"></i>').join('')+'</div>'+(patience<=3&&!ended?'<p class="patience-warning">The owner keeps glancing at the clock.</p>':'')+'<h3>Case file</h3>'+factsMarkup()+(teams>1?'<p class="turn-indicator">Team '+(turn+1)+', your question</p>':'')+(ended?'<p class="owner-leaving">I\'ve got to get back to the shop. Good luck!</p>':'<button class="text-button" id="end-interview">Owner has to go</button>')+'</aside></div>';
    content.querySelectorAll('[data-question]').forEach(b=>b.addEventListener('click',()=>ask(+b.dataset.question)));
    document.querySelector('#end-interview')?.addEventListener('click',endInterview);
  }else if(screen===2){
    content.innerHTML='<h2>Scope it.</h2><p class="scope-instructions">'+html(COPPERLINE.instructions)+'</p><div class="scope-round"><div><h3>Case file</h3>'+factsMarkup(false,true)+'</div><div class="scope-timer"><output id="scope-clock" aria-live="off"></output><div><button class="button" id="timer-toggle">Start</button><button class="text-button" id="timer-add">+1 min</button></div></div></div>';
    clock();document.querySelector('#timer-toggle').addEventListener('click',toggleTimer);document.querySelector('#timer-add').addEventListener('click',()=>{timerLeft+=60000;if(deadline)deadline+=60000;clock();});
  }else{
    const missingKey=!found.has('F2');
    content.innerHTML='<h2>Reveal.</h2><div class="reveal-layout"><div><h3>Case file</h3>'+factsMarkup(true)+'</div><div>'+(missingKey&&reveal>=1?'<p class="key-missed">'+html(COPPERLINE.missed)+'</p>':'')+(reveal>=2?'<h3>A strong first scope</h3><ul class="strong-scope">'+COPPERLINE.scope.map(t=>'<li>'+html(t)+'</li>').join('')+'</ul>':'')+'</div></div>'+(reveal>=3?'<p class="activity-closing">'+html(COPPERLINE.closing)+'</p>':'');
  }
}
function ask(index){pending=index;const q=COPPERLINE.questions[index],key=q.fact==='F2'&&!found.has(q.fact);answerPanel.classList.toggle('key-found',key);document.querySelector('#owner-answer-text').textContent=q.answer;document.querySelector('#answer-cost').textContent='−'+q.cost+' patience';document.querySelector('#answer-result').textContent=key?'Key fact found.':q.fact?(found.has(q.fact)?'Already in the case file.':'New fact added to the case file'):'Nothing new.';answerPanel.hidden=false;content.inert=true;activity.querySelectorAll('.stage-controls').forEach(el=>el.inert=true);document.querySelector('#close-answer').focus();}
function closeAnswer(){if(pending===null)return;const q=COPPERLINE.questions[pending];asked.add(pending);if(q.fact)found.add(q.fact);patience=Math.max(0,patience-q.cost);turn=(turn+1)%teams;pending=null;answerPanel.hidden=true;content.inert=false;activity.querySelectorAll('.stage-controls').forEach(el=>el.inert=false);if(patience===0)ended=true;renderActivity();(content.querySelector('[data-question]:not(:disabled)')||document.querySelector('#activity-next')).focus();}
document.querySelector('#close-answer').addEventListener('click',closeAnswer);
function nextScreen(){if(screen===0){screen=1;}else if(screen===1){if(!ended)return;screen=2;}else if(screen===2){pauseTimer();screen=3;reveal=0;}else{reveal=Math.min(3,reveal+1);if(reveal===1&&found.has('F2'))reveal=2;}renderActivity();}
function previousScreen(){if(screen===3&&reveal>0){reveal--;if(reveal===1&&found.has('F2'))reveal=0;}else{pauseTimer();screen=Math.max(0,screen-1);}renderActivity();}
document.querySelector('#activity-next').addEventListener('click',nextScreen);document.querySelector('#activity-back').addEventListener('click',previousScreen);
document.querySelector('#restart-activity').addEventListener('click',()=>{restartPanel.hidden=false;content.inert=true;activity.querySelectorAll('.stage-controls').forEach(el=>el.inert=true);document.querySelector('#cancel-restart').focus();});
function dismissRestart(){restartPanel.hidden=true;content.inert=false;activity.querySelectorAll('.stage-controls').forEach(el=>el.inert=false);document.querySelector('#restart-activity').focus();}
document.querySelector('#cancel-restart').addEventListener('click',dismissRestart);
document.querySelector('#confirm-restart').addEventListener('click',()=>{pauseTimer();screen=0;turn=0;patience=COPPERLINE.patience;asked.clear();found.clear();ended=false;pending=null;reveal=0;timerLeft=COPPERLINE.scopeSeconds*1000;dismissRestart();renderActivity();});
const launch=document.querySelector('#start-activity');launch.hidden=false;launch.addEventListener('click',e=>{renderActivity();present(activity,e.currentTarget);});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&presenting){e.preventDefault();if(!restartPanel.hidden)dismissRestart();else {if(!answerPanel.hidden)closeAnswer();closePresentation();}return;}
  if(presenting&&e.key==='Tab'){
    const panel=!restartPanel.hidden?restartPanel:!answerPanel.hidden?answerPanel:presenting;
    const focusable=[...panel.querySelectorAll('button,a,select,[tabindex="0"]')].filter(el=>!el.disabled&&!el.closest('[hidden],[inert]'));
    const first=focusable[0],last=focusable.at(-1);
    if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}return;
  }
  if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable]'))return;
  const panel=presenting||e.target.closest('.lesson-stage');if(!panel)return;
  if(panel===activity&&!answerPanel.hidden&&[' ','ArrowRight','PageDown'].includes(e.key)){e.preventDefault();closeAnswer();return;}
  if(!restartPanel.hidden)return;
  if(!['ArrowLeft','ArrowRight','PageDown','PageUp'].includes(e.key))return;e.preventDefault();
  const forward=['ArrowRight','PageDown'].includes(e.key);
  if(panel===worked){workedIndex=Math.max(0,Math.min(steps.length-1,workedIndex+(forward?1:-1)));renderWorked();}else if(forward)nextScreen();else previousScreen();
});
