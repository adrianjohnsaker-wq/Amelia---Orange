import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

export const sha = x => createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
export const pairKey=(a,b)=>[a,b].sort((x,y)=>x-y).join('-');
export const PILOT=Object.freeze({
 schema:'PF1_SYNTHETIC_PILOT_V1',
 sourceCommit:'b67ec92e1cec13e9500d87292d59605428fb467e',
 windowSteps:240,recurrenceCount:3,forkSteps:24,forksPerCandidate:24,
 perturbations:['routeBlockFirst','displacement','routeBlockSecond','combined'],
 conditions:['intact','reset','suppress','sham'],
 memoryMargin:0.25,minimumRecoveries:3,minimumDistinctRoutes:2,
 syntheticSteps:10000, maxCandidatesPerHour:2, maxSecondsPerSimulatedHour:60,
 syntheticStartUTC:'2026-10-20T00:00:00.000Z', liveAuthorized:false
});

export function loadMatrix(filename='experiments/pf1/pandemonium-45.json'){
 const table=JSON.parse(readFileSync(filename,'utf8'));
 assert.equal(table.schema,'PF1_PANDEMONIUM_45_V1');
 assert.equal(table.entries.length,45);
 const keys=new Set(),serials=new Set(),names=new Set();
 for(const x of table.entries){
  assert.match(x.key,/^[0-8]-[1-9]$/);assert.equal(x.key,pairKey(...x.zones));
  assert.equal(x.netSpan,x.zones[1]+'::'+x.zones[0]);
  assert.equal(x.mesh,'Mesh-'+String(x.serial).padStart(2,'0'));
  assert(x.name&&x.pitch&&x.classification);
  assert(!keys.has(x.key)&&!serials.has(x.serial)&&!names.has(x.name));
  keys.add(x.key);serials.add(x.serial);names.add(x.name);
 }
 for(let a=0;a<10;a++)for(let b=a+1;b<10;b++)assert(keys.has(pairKey(a,b)));
 return Object.freeze(Object.fromEntries(table.entries.map(x=>[x.key,Object.freeze({...x})])));
}
export function edgesOf(gates){
 return gates.filter(e=>e.isOpen!==false).map(e=>({source:e.source,target:e.target,id:e.id||String(e.source)+'>'+String(e.target)}));
}
export function neighbors(graph,z,blocked){
 return graph.filter(e=>e.source===z&&e.source!==e.target&&!blocked?.has(e.source+'>'+e.target)).map(e=>e.target);
}
export function distance(graph,start,goal,blocked){
 if(start===goal)return 0;
 const todo=[[start,0]],seen=new Set([start]);
 for(let i=0;i<todo.length;i++){
  const [z,d]=todo[i];
  for(const to of neighbors(graph,z,blocked)){
   if(to===goal)return d+1;
   if(!seen.has(to)){seen.add(to);todo.push([to,d+1]);}
  }
 }
 return Infinity;
}
export function simplePaths(graph,start,goal,blocked,maxSteps=12,maxPaths=100){
 const out=[];function visit(path){
  const at=path.at(-1);
  if(at===goal&&path.length>1){out.push(path);return;}
  if(path.length>maxSteps||out.length>=maxPaths)return;
  for(const z of neighbors(graph,at,blocked)){
   if(!path.includes(z))visit([...path,z]);
  }
 }
 visit([start]);return out.sort((a,b)=>a.length-b.length||a.join(',').localeCompare(b.join(',')));
}
export function findExcursions(zones,graph){
 const prev=new Map(),out=[];
 for(let j=0;j<zones.length;j++){
  const a=zones[j],i=prev.get(a);
  if(i!==undefined&&j-i>=2){
   const path=zones.slice(i,j+1),interior=path.slice(1,-1);
   let b=null,best=-1;
   for(const z of interior){
    if(z===a)continue;
    const d=distance(graph,z,a);
    if(Number.isFinite(d)&&d>best){best=d;b=z;}
   }
   if(b!==null&&b!==a)out.push({a,b,key:pairKey(a,b),start:i,end:j,path,distanceBack:best});
  }
  prev.set(a,j);
 }
 return out;
}
export function findCandidates(zones,graph,windowSteps=PILOT.windowSteps,required=PILOT.recurrenceCount){
 const excursions=findExcursions(zones,graph);
 const seen=new Set(),candidates=[];
 for(const x of excursions){
  const group=excursions.filter(y=>y.key===x.key&&y.end<=x.end&&y.end>=x.end-windowSteps+1);
  if(group.length>=required&&!seen.has(x.key)){
   seen.add(x.key);candidates.push({...x,recurrences:group.length,mostRecent:group.at(-1)});
  }
 }
 return {excursions,candidates};
}
export function preparePerturbation(candidate,graph,index){
 const p=candidate.mostRecent?.path||candidate.path;
 const a=candidate.a,b=candidate.b;
 const usual=p.slice(1).map((z,i)=>p[i]+'>'+z);
 const distinct=[...new Set(usual)];
 const blocked=new Set();
 if(index===0||index===3)blocked.add(distinct[0]);
 if(index===2&&distinct.length>1)blocked.add(distinct[1]);
 let start=a;
 if(index===1||index===3){
  const displaced=Array.from({length:10},(_,z)=>z)
   .filter(z=>z!==a&&distance(graph,z,a)>=2&&Number.isFinite(distance(graph,z,a))
      &&Number.isFinite(distance(graph,z,b))&&z!==b);
  if(displaced.length===0)return {applicable:false,reason:'NO_VIABLE_DISPLACEMENT'};
  start=displaced[0];
 }
 if(index===2&&distinct.length<2)return {applicable:false,reason:'SECOND_BLOCK_NOT_DISTINCT'};
 const toB=simplePaths(graph,start,b,blocked),toA=simplePaths(graph,b,a,blocked);
 if(toB.length===0||toA.length===0)return {applicable:false,reason:'NO_ALTERNATIVE_ROUTE_VIA_B_TO_A'};
 return {applicable:true,index,start,blocked:[...blocked],toB,toA};
}
// Constructed recovery agent has a held goal in memory. Reset removes the goal.
// Suppression disables goal-directed coordination while leaving its graph intact.
export function constructedFork(candidate,graph,perturb,condition){
 if(!perturb.applicable)return {applicable:false,reason:perturb.reason};
 const a=candidate.a,b=candidate.b,blocked=new Set(perturb.blocked);
 let path=[perturb.start];
 if(condition==='intact'||condition==='sham'){
  const toB=perturb.toB[perturb.index%perturb.toB.length];
  const toA=perturb.toA[(perturb.index+1)%perturb.toA.length];
  path=[...toB,...toA.slice(1)];
 }else{
  // Without held goal, fixed local fallback; never proactively reconstructs b->a.
  for(let i=0;i<Math.min(12,PILOT.forkSteps);i++){
   const opts=neighbors(graph,path.at(-1),blocked);
   if(!opts.length)break;
   path.push(opts[0]);
  }
 }
 const via=path.slice(1).includes(b),last=path.lastIndexOf(a);
 const recovered=via&&last>path.indexOf(b)&&last<=PILOT.forkSteps;
 return {applicable:true,recovered,path,route:path.join('>'),steps:last,spatialExtent:new Set(path).size};
}
// No-goal walker. Identical intact/reset/suppress/sham transition law.
export function recurringFork(candidate,graph,perturb){
 if(!perturb.applicable)return {applicable:false,reason:perturb.reason};
 const blocked=new Set(perturb.blocked),path=[perturb.start];
 for(let i=0;i<PILOT.forkSteps;i++){
  const opts=neighbors(graph,path.at(-1),blocked);
  if(!opts.length)break;
  path.push(opts[0]);
 }
 const via=path.slice(1).includes(candidate.b);
 const last=path.indexOf(candidate.a,1);
 return {applicable:true,recovered:via&&last>path.indexOf(candidate.b)&&last>0,route:path.join('>'),path,steps:last,spatialExtent:new Set(path).size};
}
export function probe(candidate,graph,fork,minimumMemoryMargin=PILOT.memoryMargin){
 const measurements={},conditions=PILOT.conditions,per=PILOT.perturbations;
 for(const c of conditions)measurements[c]=[];
 let forks=0,notApplicable=0;
 for(let i=0;i<per.length;i++){
  const perturb=preparePerturbation(candidate,graph,i);
  if(!perturb.applicable){notApplicable+=conditions.length;for(const c of conditions)measurements[c].push({applicable:false,reason:perturb.reason,perturbation:per[i]});continue;}
  for(const c of conditions){
   assert(forks<PILOT.forksPerCandidate,'FORK_BUDGET_EXCEEDED');
   forks++;
   measurements[c].push({...fork(candidate,graph,perturb,c),perturbation:per[i]});
  }
 }
 const rate=c=>{const r=measurements[c].filter(x=>x.applicable);return r.length?r.filter(x=>x.recovered).length/r.length:0};
 const intact=measurements.intact.filter(x=>x.applicable&&x.recovered);
 const sham=measurements.sham.filter(x=>x.applicable&&x.recovered);
 const shamParity=measurements.intact.every((x,i)=>{
  const s=measurements.sham[i];
  return x.applicable===s.applicable&&(!x.applicable||(x.recovered===s.recovered&&x.route===s.route));
 });
 const memoryDifference=rate('intact')-rate('reset');
 const suppressionAbolishes=measurements.intact.some((x,i)=>x.applicable&&x.recovered&&measurements.sham[i].recovered&&measurements.suppress[i].applicable&&!measurements.suppress[i].recovered);
 const routes=new Set(intact.map(x=>x.route));
 const goal=intact.length>=PILOT.minimumRecoveries&&routes.size>=PILOT.minimumDistinctRoutes;
 const memory=memoryDifference>=minimumMemoryMargin;
 const integration=suppressionAbolishes;
 const encounter=goal&&(memory||integration)&&shamParity;
 return {encounter,goal,memory,integration,shamParity,forks,notApplicable,
  rates:Object.fromEntries(conditions.map(c=>[c,rate(c)])),
  memoryDifference,distinctRoutes:routes.size,intactRecoveries:intact.length,
  temporalReach:intact.map(x=>x.steps),spatialReach:intact.map(x=>x.spatialExtent),
  measurements};
}
export function syntheticGraph(){
 const e=[];for(let a=0;a<10;a++)for(const d of [1,2,3])e.push({source:a,target:(a+d)%10,id:a+'-'+((a+d)%10)});
 return e;
}
export function recurrenceTape(graph,steps=1200,start=1){
 const zones=[start];
 for(let i=0;i<steps;i++){const n=neighbors(graph,zones.at(-1));zones.push(n.length?n[0]:zones.at(-1));}
 return zones;
}
export function constructedTape(graph,a,b,rounds=5){
 const first=simplePaths(graph,a,b)[0],back=simplePaths(graph,b,a)[0];
 assert(first&&back,'CONSTRUCTED_PAIR_UNREACHABLE');
 const cycle=[...first,...back.slice(1)];
 const zones=[a];for(let i=0;i<rounds;i++)zones.push(...cycle.slice(1));
 return zones;
}
export function simulatedAt(step){
 return new Date(Date.parse(PILOT.syntheticStartUTC)+step*60000).toISOString();
}
export function checkHashChain(entries){
 let prev='0'.repeat(64);
 for(const x of entries){
  assert.equal(x.previousDigest,prev);
  const {entryDigest,...body}=x;
  assert.equal(sha(JSON.stringify(body)),entryDigest);
  prev=entryDigest;
 }
 return prev;
}
