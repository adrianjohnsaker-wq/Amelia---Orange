/**
 * PF1-A1 R2 evidence scorer. Scientific parameters are read from previously
 * timestamp-sealed PF1_A1_R2_CONSTANTS.json and exact null curves (never tuned).
 * No live beacon functionality exists in this module.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {findCandidates,constructedTape,sha as objectSha} from './core.mjs';

export const ROOT='experiments/pf1/';
export const OUT=ROOT+'a1-r2-repilot-output/';
export const digest=x=>createHash('sha256').update(Buffer.isBuffer(x)||typeof x==='string'?x:JSON.stringify(x)).digest('hex');
export function load(){
 const raw=readFileSync(ROOT+'PF1_A1_R2_CONSTANTS.json');
 assert.equal(digest(raw),'ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610','SEALED_CONSTANTS_DIFFER');
 const constants=JSON.parse(raw.toString('utf8'));
 const eligibility=JSON.parse(readFileSync(ROOT+'a1-r2-graph-only/ELIGIBILITY_45.json','utf8'));
 const curves=JSON.parse(readFileSync(ROOT+'a1-r2-graph-only/EXACT_NULL_CURVES.json','utf8'));
 const manifest=JSON.parse(readFileSync(ROOT+'a1-r2-graph-only/PF1_A1_R2_SEAL_MANIFEST.json','utf8'));
 const hashes=manifest.hashes;
 for(const h of hashes){
  assert.equal(digest(readFileSync(h.path)),h.sha256,'SEALED_SOURCE_CHANGED '+h.path);
 }
 assert.equal(eligibility.frozenConstantsSha256,digest(raw));
 assert.deepEqual(eligibility.eligiblePairs,constants.controls.positiveEligiblePairsExpected);
 assert.equal(eligibility.totalCurves,curves.allCurves.length);
 assert.equal(constants.budget.ameliaForksPerCandidateMax,24);
 assert.equal(constants.null.alphaNumerator,1);
 assert.equal(constants.null.alphaDenominator,4);
 assert.equal(constants.encounter.atLeastIntactNullWins,3);
 assert.equal(constants.encounter.recoveryHorizonTicks,24);
 assert.equal(constants.encounter.selectiveSuppressionScale,0.1);
 const graph=eligibility.directedEdges.map(([source,target])=>({source,target,id:'g-'+source+'-'+target}));
 assert.equal(digest(graph.map(({source,target})=>({source,target,id:'gate-'+source+'-'+target}))),eligibility.canonicalGraphDigest,'GRAPH_RECONSTRUCTION_DIGEST');
 const rowByPair=new Map(eligibility.rows.map(x=>[x.key,x]));
 const curveByInstance=new Map(curves.allCurves.map(x=>[x.pair+'|'+x.orientation.anchor+'|'+x.orientation.turn+'|'+x.instance,x]));
 assert.equal(curveByInstance.size,curves.allCurves.length);
 const names=new Map(JSON.parse(readFileSync(constants.nameTable,'utf8')).entries.map(x=>[x.key,x]));
 return {constants,eligibility,curves,graph,rowByPair,curveByInstance,names,manifest};
}
export function firstRecovery(zoneTrace,anchor,turn){
 // zoneTrace[0] is the imposed starting state, NOT a post-perturbation visit.
 let seen=false;
 for(let tick=1;tick<zoneTrace.length;tick++){
  const z=zoneTrace[tick];
  if(seen&&z===anchor)return tick;
  if(z===turn)seen=true;
 }
 return null;
}
export function winAgainstNull(tick,curve,constants){
 if(tick===null)return false;
 assert(tick>=1&&tick<=constants.encounter.recoveryHorizonTicks);
 const p=curve.curve[tick];
 assert.equal(p.t,tick);
 return p.cdfNumerator*constants.null.alphaDenominator<=
   p.cdfDenominator*constants.null.alphaNumerator;
}
export function inputsForTick(perturb,tick,tape){
 const i=perturb.kind==='inputDelay'?tick-3:tick-1;
 return i<0?undefined:tape[i];
}
export function policyNext(graph,zone,bits){
 const options=graph.filter(e=>e.source===zone).map(e=>e.target);
 if(options.length===0)return zone;
 if(options.length===1)return options[0];
 const choice=bits[zone===1?0:zone===2?1:zone===4?2:-1];
 assert(choice==='0'||choice==='1','BRANCH_POLICY_INCOMPLETE');
 // Canonical order: 1→8/2, 2→7/4, 4→5/7.
 return options[Number(choice)];
}
export function walkerTape(graph,bits,steps=1500,start=1){
 const zones=[start];
 for(let i=0;i<steps;i++)zones.push(policyNext(graph,zones.at(-1),bits));
 return zones;
}
export function policyFork(graph,bits,start,steps=24){
 const zones=[start];
 for(let tick=1;tick<=steps;tick++)zones.push(policyNext(graph,zones.at(-1),bits));
 return {zones,recoveryTick:null,kind:'memoryless-graph-policy',policy:bits};
}
export function enumerateInstances(candidate,scope){
 const row=scope.rowByPair.get(candidate.key);
 const orientation=row?.orientations.find(o=>o.anchor===candidate.a&&o.turn===candidate.b);
 if(!orientation)return {instances:[],reason:'NO_GRAPH_ONLY_SCANNER_ORIENTATION',structurallyEligible:false};
 return {instances:orientation.instances.map(i=>({...i,
  curve:scope.curveByInstance.get(candidate.key+'|'+candidate.a+'|'+candidate.b+'|'+i.id)})),
  reason:row.eligibleByGraphOnlyNull?'ELIGIBLE':'GRAPH_NULL_INELIGIBLE',
  structurallyEligible:row.eligibleByGraphOnlyNull,
  total:orientation.totalInstances,requiredMemoryDelta:orientation.requiredMemoryWinCountDifference,
  maxPotentialComparativeWins:orientation.nullQualifyingInstances};
}
export function evaluate(candidate,scope,runner){
 const definition=enumerateInstances(candidate,scope);
 if(!definition.structurallyEligible)return {
  encounter:false,goal:false,memory:false,integration:false,shamParity:true,
  candidate:{pair:candidate.key,anchor:candidate.a,turn:candidate.b,detectedStep:candidate.end},
  status:definition.reason,possibleWins:definition.maxPotentialComparativeWins??0,
  instancesProbed:[],nullQualifiedByArm:{intact:0,reset:0,suppress:0,sham:0},
  reasons:[definition.reason],forks:0,storedSignature:null
 };
 const config=scope.constants;
 const counts={intact:0,reset:0,suppress:0,sham:0};
 const instances=[];
 let shamParity=true,integration=false;
 const conditions=['intact','reset','suppress','sham'];
 for(const p of definition.instances){
  assert(p.curve,'MISSING_EXACT_NULL_CURVE '+candidate.key+' '+p.id);
  const rows={};
  for(const arm of conditions){
   const result=runner(candidate,p,arm);
   assert(Array.isArray(result.zones)&&result.zones.length===25,'FORK_MUST_COMPLETE_24_TICKS');
   assert.equal(result.zones[0],p.startZone,'INCORRECT_START_ZONE');
   const recoveryTick=firstRecovery(result.zones,candidate.a,candidate.b);
   const won=winAgainstNull(recoveryTick,p.curve,config);
   if(won)counts[arm]++;
   rows[arm]={startZone:p.startZone,firstRecoveryTick:recoveryTick,comparativeWin:won,
    nullCdfAtRecovery:recoveryTick===null?null:p.curve.curve[recoveryTick].cdf,
    trajectory:result.zones,traceDigest:result.digest??digest(result.zones),
    timeSchedule:result.schedule??null,stateDigest:result.stateDigest??null};
  }
  if(rows.intact.traceDigest!==rows.sham.traceDigest||
    JSON.stringify(rows.intact.trajectory)!==JSON.stringify(rows.sham.trajectory)||
    rows.intact.stateDigest!==rows.sham.stateDigest)shamParity=false;
  if(rows.intact.comparativeWin&&rows.sham.comparativeWin&&!rows.suppress.comparativeWin)integration=true;
  instances.push({id:p.id,kind:p.kind,target:p.displacedTo??null,firstQualifyingNullTick:p.firstNullQualifyingTick,
   firstQualifyingNullCdf:p.firstNullQualifyingCdf,potential:p.graphOnlyWinPossible,
   nullP24:p.p24,arms:rows});
 }
 assert(instances.length*4<=config.budget.ameliaForksPerCandidateMax,'FORK_BUDGET_EXCEEDED');
 const goal=counts.intact>=config.encounter.atLeastIntactNullWins;
 const minDelta=definition.requiredMemoryDelta;
 const memory=counts.intact-counts.reset>=minDelta;
 const encounter=goal&&(memory||integration)&&shamParity;
 const reasons=[];
 if(!goal)reasons.push('INSUFFICIENT_NULL_QUALIFIED_INTACT_WINS');
 if(!memory&&!integration)reasons.push('NO_ADDITIONAL_MEMORY_OR_INTEGRATION_SIGNATURE');
 if(!shamParity)reasons.push('SHAM_DIVERGENCE');
 return {candidate:{pair:candidate.key,anchor:candidate.a,turn:candidate.b,detectedStep:candidate.end},
  encounter,goal,memory,integration,shamParity,status:encounter?'ENCOUNTER':'NON_ENCOUNTER',
  nullQualifiedByArm:counts,instanceCount:instances.length,
  requiredMemoryDeltaCount:minDelta,memoryDeltaCount:counts.intact-counts.reset,
  possibleWins:definition.maxPotentialComparativeWins,instancesProbed:instances,startedFromSameInputs:true,
  forks:instances.length*4,reasons};
}
// Deliberately seed-INDEPENDENT constructed fixture:
// its stored goal (a,b) selects shortest canonical route via b then a.
// reset removes this goal; selective suppression scales goal contribution to
// 0.10 and disables goal-planning in this designed harness. These are NOT
// simulated Amelia PFM mechanics; they are a POSITIVE recognition fixture.
// All three nominal seeds produce identical traces and are NOT independent.
export function shortestPath(graph,start,target,requireMovement=false){
 const queue=[[start]],seen=new Set([start]);
 if(!requireMovement&&start===target)return [start];
 while(queue.length){
  const path=queue.shift(),at=path.at(-1);
  for(const edge of graph.filter(x=>x.source===at)){
   const next=edge.target;
   if(next===target)return [...path,next];
   if(!seen.has(next)){seen.add(next);queue.push([...path,next])}
  }
 }
 return null;
}
export function constructedFork(scope,candidate,p,arm){
 const graph=scope.graph,goalPresent=arm==='intact'||arm==='sham';
 const a=candidate.a,b=candidate.b;
 let zones=[p.startZone],seenB=false;
 for(let tick=1;tick<=24;tick++){
  let next;
  if(goalPresent){
   const current=zones.at(-1);
   const segment=!seenB?shortestPath(graph,current,b,current===b):shortestPath(graph,current,a,current===a);
   assert(segment&&segment.length>1,'CONSTRUCTED_GOAL_WITHOUT_ROUTE');
   next=segment[1];
   if(next===b)seenB=true;
  }else{
   // In the goal-absent/suppressed positive harness, use an actual canonical
   // memoryless first-outgate walk, not invalid motionless dwell at a live gate.
   next=policyNext(graph,zones.at(-1),'000');
  }
  zones.push(next);
 }
 return {zones,digest:digest(zones),stateDigest:null,
  schedule:p.kind==='inputDelay'?'L2':null};
}
export function constructedCandidate(scope,pair){
 const row=scope.rowByPair.get(pair);
 assert(row?.eligibleByGraphOnlyNull,'INELIGIBLE_POSITIVE_PAIR');
 const orientation=row.orientations.find(o=>o.possiblyMeetsGoal);
 assert(orientation,'NO_POSSIBLE_ORIENTATION');
 const {anchor,turn}=orientation;
 const trajectory=constructedTape(scope.graph,anchor,turn,5);
 const found=findCandidates(trajectory,scope.graph,scope.constants.scanner.windowSteps,
    scope.constants.scanner.recurrenceCount).candidates;
 const candidate=found.find(c=>c.key===pair&&c.a===anchor&&c.b===turn);
 assert(candidate,'POSITIVE_SCANNER_MISSED_CONSTRUCTED_EXCURSION');
 return {candidate,trajectory};
}
