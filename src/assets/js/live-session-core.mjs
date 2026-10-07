// Pure session helpers are shared by the browser and dependency-free Node tests.
export function shuffled(items, random = Math.random) {
  const result = [...items];
  for (let i=result.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; }
  return result;
}
export function makeTeams(names, random = Math.random) {
  if (!names.length) return Array.from({length:5},(_,i)=>({name:`Team ${i+1}`,members:[],score:0}));
  const roster=shuffled(names,random), count=Math.max(1,Math.ceil(roster.length/3));
  const teams=Array.from({length:count},(_,i)=>({name:`Team ${i+1}`,members:[],score:0}));
  roster.forEach((name,i)=>teams[i%count].members.push(name));
  return teams;
}
export function rolesFor(team, round) {
  const members=team.members.length ? team.members : ['A','B','C'];
  const groups=Array.from({length:3},()=>[]);
  members.forEach((name,i)=>groups[i%3].push(name));
  if(members.length===2) groups[2]=[members[round%2]+' (also observes)'];
  if(members.length===1) return [members[0],members[0],members[0]];
  return Array.from({length:3},(_,role)=>groups[(role+round)%3].join(' + '));
}
export function pairTeams(teams, random=Math.random) {
  const pools=teams.map((team,i)=>({team:i,names:shuffled(team.members.length?team.members:['A','B','C'],random)}));
  const groups=[];
  while(pools.filter(p=>p.names.length).length>1){
    const active=pools.filter(p=>p.names.length).sort((a,b)=>b.names.length-a.names.length);
    groups.push([active[0],active[1]].map(p=>({name:p.names.pop(),team:p.team})));
  }
  const rest=pools.find(p=>p.names.length);
  if(rest) while(rest.names.length){
    const person={name:rest.names.pop(),team:rest.team};
    const pair=groups.find(g=>g.length===2&&g.every(p=>p.team!==person.team));
    if(pair)pair.push(person);else groups.push([person]);
  }
  return groups;
}
export function remaining(timer, now=Date.now()) { return timer?.running ? Math.max(0,timer.deadline-now) : Math.max(0,timer?.left||0); }
export function elapsedClock(start, now=Date.now()) { return start ? Math.max(0,now-start) : 0; }
export function formatTime(ms) {const s=Math.ceil(Math.max(0,ms)/1000);return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;}
