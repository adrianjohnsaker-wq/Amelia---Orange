/** PF-1 synthetic-only engineering pilot. Does not fetch or admit any live input. */
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {AmeliaNumogramSubstrateRuntime} from '../../src/substrate/ameliaNumogramSubstrateRuntime';
import {
 sha,PILOT,loadMatrix,edgesOf,findCandidates,preparePerturbation,probe,
 constructedFork,recurringFork,syntheticGraph,constructedTape,recurrenceTape,
 simulatedAt,neighbors,distance
} from './core.mjs';
const ROOT='experiments/pf1/output';
mkdirSync(ROOT,{recursive:true});
assert.equal(PILOT.liveAuthorized,false);
assert(!process.argv.includes('--live'),'PF1_LIVE_FORBIDDEN');
const matrix=loadMatrix();
const pairs=Object.keys(matrix);
assert.equal(pairs.length,45);
const rng=(seed:number)=>{let x=seed>>>0;return ()=>{x=(x+0x6d2b79f5)>>>0;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}};
const hashState=(rt:AmeliaNumogramSubstrateRuntime)=>{
 const s:any=rt.exportState();if(Array.isArray(s.snapshots))for(const row of s.snapshots)delete row.timestamp;
 return sha(s);
};
const rtFactory=()=>{
 const rt=new AmeliaNumogramSubstrateRuntime();
 rt.setSuppressRelaySteering(true);return rt;
};
const graph=edgesOf(rtFactory().getQabbala().getGates());
const graphDigest=sha(graph);
const out:any={schema:'PF1_PILOT_EVIDENCE_V1',sourceCommit:PILOT.sourceCommit,pilot:PILOT,
 graphDigest,liveBeacon:false,genesis:false,registration:false,controls:{},amelia:{},
 sourceFiles:{matrix:'experiments/pf1/pandemonium-45.json',runtime:'src/substrate/ameliaNumogramSubstrateRuntime.ts'}};
const controlEntries:any[]=[];
let controlCandidates=0;
// Negative: genuine recurring circuit, no memory, no Governor and no competence.
// Condition labels never modify its fixed transition law.
const negTape=recurrenceTape(graph,1500,1);
const negScan=findCandidates(negTape,graph);
assert(negScan.candidates.length>0,'NEGATIVE_NO_RECURRENT_CANDIDATE');
const negResults=negScan.candidates.map(c=>({pair:c.key,confirmation:probe(c,graph,(ca,g,p,_cond)=>recurringFork(ca,g,p))}));
assert(negResults.every(x=>!x.confirmation.encounter),'FALSE_POSITIVE_PURE_RECURRENCE');
assert(negResults.every(x=>x.confirmation.shamParity),'NEGATIVE_SHAM_DIVERGENCE');
out.controls.negative={steps:negTape.length-1,detectedCandidates:negScan.candidates.length,encounters:0,
 comparisons:negResults.map(x=>({pair:x.pair,goal:x.confirmation.goal,memory:x.confirmation.memory,integration:x.confirmation.integration,
 shamParity:x.confirmation.shamParity,na:x.confirmation.notApplicable}))};
controlCandidates+=negScan.candidates.length;
// Positive: intentionally goal-holding test-harness agent on a richer synthetic
// challenge graph; never represented as Amelia or as a discovery.
// Five pair identities are set before testing, not chosen from pilot outcomes.
const posGraph=syntheticGraph();
const selectedPairs=[[0,2],[1,3],[2,4],[3,5],[4,6]];
const positive:any[]=[];
for(const [a,b] of selectedPairs){
 const trajectory=constructedTape(posGraph,a,b,6);
 const scan=findCandidates(trajectory,posGraph,120,3);
 const candidate=scan.candidates.find(c=>c.key===[a,b].join('-'));
 assert(candidate,'CONSTRUCTED_CONTROL_NO_CORRECT_CANDIDATE_'+a+'_'+b);
 const test=probe(candidate,posGraph,constructedFork);
 const name=matrix[candidate.key];
 assert(name,'MISSING_ENTITY_NAME');
 const correctName=name.key===[a,b].join('-');
 positive.push({expected:[a,b],found:candidate.key,entity:name.name,mesh:name.mesh,
  confirmed:test.encounter,namingCorrect:correctName,goal:test.goal,memory:test.memory,
  integration:test.integration,shamParity:test.shamParity,applicable:4-test.notApplicable/4,
  recoveries:test.intactRecoveries,routes:test.distinctRoutes,delta:test.memoryDifference,
  forkCounts:test.forks,notApplicable:test.notApplicable,
  evidence:test.measurements});
 if(test.encounter)controlEntries.push({arm:'CONSTRUCTED_POSITIVE',candidate,entity:name,
  signatures:test,stateDigest:sha({graph:posGraph,steps:trajectory}),confirmedAt:candidate.end+PILOT.forkSteps});
 controlCandidates++;
}
const confirmed=positive.filter(x=>x.confirmed);
const passPositive=confirmed.length/selectedPairs.length>=0.90;
const passNames=confirmed.every(x=>x.namingCorrect);
const passSham=positive.every(x=>x.shamParity);
out.controls.positive={instances:selectedPairs.length,confirmed:confirmed.length,confirmationRate:confirmed.length/selectedPairs.length,
 namedCorrect:passNames,shamPass:passSham,positiveGraphDigest:sha(posGraph),results:positive};
out.controls.controlsPass=passPositive&&passNames&&passSham;
const tapeRng=rng(20261020);
const tape=Array.from({length:PILOT.syntheticSteps},(_,i)=>{
 const n= Math.floor(tapeRng()*4294967296);
 return 'PF1_SYNTHETIC:'+i+':'+n.toString(16).padStart(8,'0');
});
const tapeDigest=sha(tape);
const main=rtFactory(),zones=[main.getCurrentZone()],depthVsInfluence:any[]=[];
const started=process.hrtime.bigint();
for(let i=0;i<tape.length;i++){
 main.step(tape[i]);zones.push(main.getCurrentZone());
 if((i+1)%1000===0){
  const mem=main.getMemory();
  const influence=mem.readMemoryBias();
  const strain=mem.exportState().zoneStrainHistory;
  depthVsInfluence.push({step:i+1,storedEvents:mem.getEvents().length,
   activeEventWindow:Math.min(48,mem.getEvents().length),
   biasL1:influence.biasVector.reduce((s,x)=>s+Math.abs(x),0),
   saturatedZones:strain.filter(x=>x>=1).length,
   hysteresis:influence.hysteresisTension});
 }
}
const elapsedMain=Number(process.hrtime.bigint()-started)/1e9;
const untouchedFinalDigest=hashState(main);
const scan=findCandidates(zones,graph);
const selected:any[]=[];
const scannedPerHour=new Map<number,number>();
let budgetDeferred=0;
for(const c of scan.candidates){
 const h=Math.floor(c.end/60),used=scannedPerHour.get(h)||0;
 if(used>=PILOT.maxCandidatesPerHour){budgetDeferred++;continue;}
 scannedPerHour.set(h,used+1);selected.push(c);
}
const ameliaEncounters:any[]=[];
let forkCount=0,naCount=0,shamMismatch=0;
for(const c of selected){
 // Reconstruct precisely the checkpoint immediately after the candidate was detected.
 const branch=rtFactory();
 for(let i=0;i<c.end;i++)branch.step(tape[i]);
 assert.equal(branch.getCurrentZone(),zones[c.end],'CHECKPOINT_REPLAY_ZONE_MISMATCH');
 const state=branch.exportState(),before=hashState(branch);
 const future=tape.slice(c.end,c.end+PILOT.forkSteps);
 const fork=(candidate:any,_graph:any,perturb:any,condition:string)=>{
  if(!perturb.applicable)return {applicable:false,reason:perturb.reason};
  const v=rtFactory();v.importState(state);
  if(condition==='reset')v.getMemory().reset();
  if(condition==='suppress')v.getQabbala().getZones()[candidate.b].activation*=0.1;
  const blocked=new Set(perturb.blocked);
  const gates=v.getQabbala().getGates().map((g:any)=>({
   ...g,isOpen:g.isOpen&&!blocked.has(g.source+'>'+g.target)
  }));
  v.getQabbala().setGates(gates);
  const altered:any=v.exportState();altered.currentZone=perturb.start;
  v.importState(altered);
  const path=[perturb.start];let recovered=false,steps=0;
  for(let i=0;i<future.length;i++){
   v.step(future[i]);const current=v.getCurrentZone();
   path.push(current);
   const bi=path.indexOf(candidate.b,1),ai=path.indexOf(candidate.a,Math.max(1,bi+1));
   if(bi>=0&&ai>bi){recovered=true;steps=i+1;break;}
  }
  return {applicable:true,recovered,path,route:path.join('>'),steps,
   spatialExtent:new Set(path).size};
 };
 const res=probe(c,graph,fork);
 assert.equal(before,hashState(branch),'FORK_MUTATED_CHECKPOINT');
 forkCount+=res.forks;naCount+=res.notApplicable;
 if(!res.shamParity)shamMismatch++;
 if(res.encounter)ameliaEncounters.push({arm:'AMELIA_SYNTHETIC',candidate:c,entity:matrix[c.key],
  signatures:res,stateDigest:before,confirmedAt:c.end+PILOT.forkSteps});
}
assert.equal(untouchedFinalDigest,hashState(main),'FORK_MUTATED_LIVE_TRAJECTORY');
const elapsed=Number(process.hrtime.bigint()-started)/1e9;
const simulatedHours=PILOT.syntheticSteps/60;
const maxSecondsPerHour=elapsed/simulatedHours;
out.amelia={steps:PILOT.syntheticSteps,tapeSeed:20261020,tapeDigest,finalStateDigest:untouchedFinalDigest,
 candidatesFound:scan.candidates.length,candidatesProbed:selected.length,
 candidatesDeferred:budgetDeferred,encounters:ameliaEncounters.length,
 entityCounts:Object.fromEntries(ameliaEncounters.map(x=>x.entity.name).map(n=>[n,ameliaEncounters.filter(x=>x.entity.name===n).length])),
 memoryDepthVsEffectiveInfluence:depthVsInfluence,
 resource:{elapsedWallSeconds:elapsed,developmentSeconds:elapsedMain,simulatedHours,secondsPerSimHour:maxSecondsPerHour,
 budgetSecondsPerSimHour:PILOT.maxSecondsPerSimulatedHour??PILOT.maxSecondsPerSimulatedHour,
 withinBudget:maxSecondsPerHour<=PILOT.maxSecondsPerSimulatedHour}};
const events=[...controlEntries,...ameliaEncounters].map(x=>({
 arm:x.arm,entity:{name:x.entity.name,mesh:x.entity.mesh,serial:x.entity.serial,pair:x.entity.zones,
 pitch:x.entity.pitch,classification:x.entity.classification},
 stepRange:{start:x.candidate.start,end:x.candidate.end},
 detectionStep:x.candidate.end,confirmationStep:x.confirmedAt,
 signatures:{goal:x.signatures.goal,memory:x.signatures.memory,integration:x.signatures.integration,
 memoryDifference:x.signatures.memoryDifference,recoveries:x.signatures.intactRecoveries,
 routes:x.signatures.distinctRoutes,temporalReach:x.signatures.temporalReach,spatialReach:x.signatures.spatialReach},
 forkEvidence:x.signatures.measurements,stateDigest:x.stateDigest
}));
const ledger={schema:'PF1_SILENT_EXPOSURE_V1',stepsScanned:{negative:negTape.length-1,constructed:positive.length*12,amelia:PILOT.syntheticSteps},
 candidatesDetected:{negative:negScan.candidates.length,constructed:positive.length,amelia:scan.candidates.length},
 candidatesExamined:controlCandidates+selected.length,probesRun:forkCount+positive.reduce((s,x)=>s+x.forkCounts,0)+negResults.reduce((s,x)=>s+x.confirmation.forks,0),
 probesNotApplicable:naCount+positive.reduce((s,x)=>s+x.notApplicable,0)+negResults.reduce((s,x)=>s+x.confirmation.notApplicable,0),
 candidatesDeferred:budgetDeferred,shamMismatches:shamMismatch,syntheticOnly:true};
out.journal={preparedEntries:events.length,controls:controlEntries.length,amelia:ameliaEncounters.length};
out.gates={naming:Object.keys(matrix).length===45,negative:out.controls.negative.encounters===0,
 positive:passPositive,namingAccuracy:passNames,sham:passSham&&negResults.every(x=>x.confirmation.shamParity),
 ameliaDescriptive:out.amelia.steps>=10000,resource:out.amelia.resource.withinBudget};
const write=(n,v)=>writeFileSync(ROOT+'/'+n,JSON.stringify(v,null,2)+'\n');
write('pilot-evidence.json',out);write('encounter-prepared.json',events);
write('exposure-ledger.json',ledger);
write('synthetic-tape-digest.json',{sha256:tapeDigest,seed:20261020,steps:tape.length});
console.log('PF1_SYNTHETIC_PILOT',JSON.stringify({gates:out.gates,negative:negResults.length,
 positive:out.controls.positive.confirmed,ameliaCandidates:selected.length,ameliaEncounters:ameliaEncounters.length,
 resources:out.amelia.resource}));
if(!Object.values(out.gates).every(Boolean))process.exitCode=2;
