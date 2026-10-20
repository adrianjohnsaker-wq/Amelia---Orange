/** PF-1 canonical, synthetic-only pre-live graph audit. No threshold changes. */
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {CANONICAL_GATES} from '../../src/ai/numogram/AmeliaQabbalaInterface';
import {AmeliaNumogramSubstrateRuntime} from '../../src/substrate/ameliaNumogramSubstrateRuntime';
import {PILOT,sha,edgesOf,loadMatrix,pairKey,findExcursions,findCandidates,preparePerturbation,probe,constructedFork} from './core.mjs';

const ROOT='experiments/pf1/prelive-output';mkdirSync(ROOT,{recursive:true});
assert.equal(PILOT.liveAuthorized,false);assert.equal(PILOT.windowSteps,240);
assert.equal(PILOT.minimumRecoveries,3);assert.equal(PILOT.minimumDistinctRoutes,2);
assert.equal(PILOT.memoryMargin,.25);assert.equal(PILOT.forkSteps,24);
assert.equal(PILOT.forksPerCandidate,24);

const runtime=new AmeliaNumogramSubstrateRuntime();runtime.setSuppressRelaySteering(true);
const graph=edgesOf(runtime.getQabbala().getGates());
const canonical=edgesOf(CANONICAL_GATES);
assert.deepEqual(graph,canonical,'RUNTIME_GRAPH_DIFFERENT_FROM_FROZEN_CANONICAL');
assert.equal(graph.length,11,'CANONICAL_EDGE_COUNT_CHANGED');
const graphDigest=sha(graph),naming=loadMatrix();
const original=readFileSync('experiments/pf1/pilot.ts','utf8');
assert(original.includes('const graph=edgesOf(rtFactory().getQabbala().getGates());'));
assert(original.includes('const negTape=recurrenceTape(graph,1500,1);'));
assert(original.includes('probe(c,graph,(ca,g,p,_cond)=>recurringFork(ca,g,p))'));
const workOrder=readFileSync('experiments/pf1/PF1_SYNTHETIC_PILOT_WORK_ORDER.md','utf8');
assert(workOrder.includes('No live beacon rounds.'));

const cycles:any[]=[];
for(let anchor=0;anchor<10;anchor++){
 function visit(path:number[]){
  for(const to of graph.filter(e=>e.source===path.at(-1)).map(e=>e.target)){
   if(to===anchor){
    if(path.length<2)continue;
    const trajectory=[...path,anchor];
    const ex=findExcursions(trajectory,graph).find(x=>x.a===anchor&&x.end===trajectory.length-1);
    if(ex)cycles.push({a:ex.a,b:ex.b,key:ex.key,path:trajectory});
   }else if(path.length<10&&!path.includes(to))visit([...path,to]);
  }
 }
 visit([anchor]);
}
assert(cycles.length>0);
const rows:any[]=[];
for(let a=0;a<10;a++)for(let b=a+1;b<10;b++){
 const key=pairKey(a,b),entity=naming[key],templates=cycles.filter(x=>x.key===key);
 const challenges=PILOT.perturbations.map((name,i)=>{
  const examples=templates.map(t=>{
   const candidate={...t,start:0,end:t.path.length-1,mostRecent:{path:t.path}};
   const p=preparePerturbation(candidate,graph,i);
   return {anchor:t.a,turn:t.b,excursion:t.path,applicable:p.applicable,
    reason:p.applicable?'VIABLE_CANONICAL_ALTERNATIVE':p.reason,
    start:p.applicable?p.start:null,blockedEdges:p.applicable?p.blocked:[],
    witness:p.applicable?[...p.toB[0],...p.toA[0].slice(1)]:null};
  });
  return {perturbation:name,applicable:examples.some(x=>x.applicable),
   totalTemplates:examples.length,
   applicableTemplates:examples.filter(x=>x.applicable).length,
   status:!templates.length?'NOT_SCANNER_CANDIDATE':
    examples.some(x=>x.applicable)?'ALTERNATIVE_EXISTS':'NO_ALTERNATIVE',
   examples};
 });
 const maxSame=Math.max(0,...templates.map(t=>{
  const c={...t,start:0,end:t.path.length-1,mostRecent:{path:t.path}};
  return PILOT.perturbations.filter((_,i)=>preparePerturbation(c,graph,i).applicable).length;
 }));
 rows.push({key,entity:entity.name,mesh:entity.mesh,scannerExcursions:templates.length,
  challengeCount:4,challenges,maxApplicableOnOneExcursion:maxSame,
  possibleWithCurrentThreshold:maxSame>=PILOT.minimumRecoveries});
}
assert.equal(rows.length,45);assert.equal(new Set(rows.map(x=>x.key)).size,45);
assert.equal(rows.reduce((s,r)=>s+r.challenges.length,0),180);

const potential=rows.filter(x=>x.possibleWithCurrentThreshold);
const controls:any[]=[];
for(const row of potential){
 const checks:any[]=[];
 for(const t of cycles.filter(c=>c.key===row.key)){
  const tape=[t.a];
  for(let j=0;j<5;j++)tape.push(...t.path.slice(1));
  const candidates=findCandidates(tape,graph,PILOT.windowSteps,PILOT.recurrenceCount).candidates;
  const c=candidates.find(x=>x.key===row.key&&x.a===t.a&&x.b===t.b);
  assert(c,'CANONICAL_SCANNER_FAILED '+row.key);
  const x=probe(c,graph,constructedFork);
  checks.push({excursion:t.path,scannerDetected:true,
   namedPair:c.key,name:naming[c.key].name,mesh:naming[c.key].mesh,
   namingCorrect:c.key===row.key&&naming[c.key].mesh===row.mesh,
   encounter:x.encounter,goal:x.goal,memory:x.memory,integration:x.integration,
   shamParity:x.shamParity,intactRecoveries:x.intactRecoveries,distinctRoutes:x.distinctRoutes,
   memoryDifference:x.memoryDifference,forks:x.forks,notApplicable:x.notApplicable,
   challengeDetails:x.measurements.intact.map((v,i)=>({perturbation:PILOT.perturbations[i],
    applicable:v.applicable,recovered:v.recovered??false,route:v.route??null,
    reason:v.reason??null}))});
 }
 controls.push({pair:row.key,entity:row.entity,mesh:row.mesh,attempts:checks.length,
  confirmed:checks.some(c=>c.encounter&&c.namingCorrect&&c.shamParity),checks});
}
const controlPass=controls.length===potential.length&&controls.length>0&&
 controls.every(x=>x.confirmed&&x.checks.every(c=>c.namingCorrect&&c.shamParity));
const out={
 schema:'PF1_CANONICAL_PRELIVE_AUDIT_V1',syntheticOnly:true,liveStartAuthorized:false,
 thresholdSource:'experiments/pf1/core.mjs PILOT (unchanged)',
 thresholds:PILOT,graph:{source:'CANONICAL_GATES/fresh Amelia runtime',edgeCount:graph.length,
  digest:graphDigest,edges:graph.map(x=>[x.source,x.target]),pinnedSubstrate:PILOT.sourceCommit},
 negativeControl:{graphIdenticalToCanonical:true,originalSourceSha256:sha(original),
  sourceEvidence:'experiments/pf1/pilot.ts graph=runtime gates; negTape=recurrenceTape(graph)',
  originalCandidates:21,originalEncounters:0},
 enumeration:{allPairs:45,perturbationChecks:180,directedSimpleExcursions:cycles.length,
  pairsWithScannerExcursion:rows.filter(x=>x.scannerExcursions>0).length,
  structurallyPossiblePairs:potential.map(x=>x.key)},
 cycles,rows,canonicalPositiveControls:controls,
 canonicalConstructedPositivePass:controlPass,
 noLiveBeacon:true,noGenesis:true,noThresholdChanges:true
};
writeFileSync(ROOT+'/CANONICAL_REACHABILITY_45x4.json',JSON.stringify(out,null,2)+'\n');
const marks=x=>x.challenges.map(c=>c.applicable?'YES':'N/A');
const lines=[
 '# PF-1 canonical-graph pre-live audit','',
 '**Synthetic structural audit only. Live start remains unauthorised.**','',
 '## Identity and scope','',
 '- The actual fresh runtime gate graph and frozen CANONICAL_GATES have identical directed edges: PASS.',
 '- Pinned substrate commit: '+PILOT.sourceCommit,
 '- Graph SHA-256: '+graphDigest,
 '- Directed open edges: '+out.graph.edges.map(x=>x.join('→')).join(', '),
 '- Original pure-recurrence negative control uses runtime-derived canonical graph, NOT syntheticGraph(): confirmed by source check.',
 '- Previous negative result retained: 21 candidate observations, ZERO encounters.',
 '- The previous positive controls ran on a distinct richer synthetic graph; this is the new canonical check.',
 '','## Complete 45 pairs × 4 challenges','',
 'YES means at least one genuine scanner-derived directed excursion of this unordered pair has a viable challenge recovery path via the turning zone under the existing perturbation implementation. N/A includes pairs that cannot be scanner candidates. The accompanying JSON contains reasons and explicit witness paths.',
 'The maximum applies to one excursion and cannot be assembled from different path templates. A pair is potentially eligible only if the unchanged 3-of-4 recovery gate can be met.',
 '','| Pair | Entity | Excursions | Block 1 | Displace | Block 2 | Combined | Max on one excursion |',
 '|---|---|---:|:---:|:---:|:---:|:---:|---:|',
 ...rows.map(x=>'| '+x.key+' | '+x.entity+' | '+x.scannerExcursions+' | '+marks(x).join(' | ')+' | '+x.maxApplicableOnOneExcursion+' |'),
 '','## Encounter-possible pairs (topology alone)','',
 ...potential.map(x=>'- '+x.key+' — '+x.entity+' ('+x.mesh+'), maximum '+x.maxApplicableOnOneExcursion+' viable challenges out of four.'),
 ...(potential.length?[]:['- None satisfies the unchanged 3/4 intact recovery gate.']),
 '','This is a necessary topology condition, not a demonstration that Amelia is capable of goal-directed recovery.',
 '','## Constructed positive agent on canonical Numogram','',
 '| Pair | Name correct | Intact recoveries | Routes | Memory delta | Sham parity | Encounter |',
 '|---|:---:|---:|---:|---:|:---:|:---:|',
 ...controls.map(x=>{
  const c=x.checks.find(y=>y.encounter)||x.checks[0];
  return '| '+x.pair+' | '+c.namingCorrect+' | '+c.intactRecoveries+' | '+c.distinctRoutes+' | '+c.memoryDifference+' | '+c.shamParity+' | '+x.confirmed+' |';
 }),
 '','Canonical graph constructed controls: '+(controlPass?'PASS':'FAIL')+'.',
 'All 45-by-4 decisions and control trajectories are archived as JSON.',
 '','## Boundaries','',
 '- No change to readout, thresholds, recurrence scanner, fork code, Governor, ProcessFieldMemory or canonical gates.',
 '- No live beacon rounds, genesis, registration or live exploration.',
 '- Live start needs separate operator approval after review.',''
];
writeFileSync(ROOT+'/CANONICAL_REACHABILITY_REPORT.md',lines.join('\n'));
assert(out.canonicalConstructedPositivePass,'CANONICAL_CONSTRUCTED_CONTROL_FAILED');
console.log('PF1_CANONICAL_PRELIVE',JSON.stringify({
 graphDigest,excursions:cycles.length,scannable:rows.filter(x=>x.scannerExcursions>0).map(x=>x.key),
 possible:potential.map(x=>x.key),controls:controls.map(x=>({pair:x.pair,confirmed:x.confirmed})),checks:180}));
