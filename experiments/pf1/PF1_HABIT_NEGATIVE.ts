/** PF1 habit-memory negative control; exclusively synthetic, pinned PFM class. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {IntegratedMemorySystem} from '../../src/substrate/IntegratedMemorySystem';
import {INITIAL_ZONES,CANONICAL_GATES} from '../../src/ai/numogram/AmeliaQabbalaInterface';
import {load,evaluate,digest,enumerateInstances,inputsForTick} from './PF1_A1_R2_SCORER.mjs';
import {findCandidates} from './core.mjs';
import {canonicalSha256} from '../../src/lib/sha256';
const base='experiments/pf1/habit-negative/';
mkdirSync(base,{recursive:true});
const scope=load(), c=scope.constants,edges=CANONICAL_GATES.filter(x=>x.isOpen);
assert.deepEqual(edges.map(x=>[x.source,x.target]),scope.eligibility.directedEdges);
const source=readFileSync('src/substrate/IntegratedMemorySystem.ts','utf8');
assert(source.includes('const recentEvents = this.events.slice(-48)'));
assert(source.includes('this.zoneStrainHistory[i] * 0.08'));
const actualTanh=/\btanh\s*\(/.test(source);
function tape(){
 let x=20261020>>>0;const rand=()=>{x=(x+0x6d2b79f5)>>>0;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296};
 return Array.from({length:10024},(_,i)=>'PF1_SYNTHETIC:'+i+':'+Math.floor(rand()*4294967296).toString(16).padStart(8,'0'));
}
const inputs=tape();
class HabitWalker{
 zone=9;stepNo=0;memory=new IntegratedMemorySystem();
 constructor(){this.zone=9}
 import(snapshot){this.zone=snapshot.zone;this.stepNo=snapshot.stepNo;this.memory.importState(snapshot.memory)}
 export(){return {zone:this.zone,stepNo:this.stepNo,memory:this.memory.exportState()}}
 step(input){
  const from=this.zone;
  const z=input?.trim()?parseInt(canonicalSha256(input.trim()).slice(0,2),16)%10:null;
  const bias=this.memory.readMemoryBias().biasVector;
  let best=-Infinity,to=from;
  for(const e of edges.filter(e=>e.source===from)){
   const target=INITIAL_ZONES[e.target];
   const score=e.flux*(1-e.resistance)+(bias[e.target]||0)*0.4+
    target.activation*0.2+Math.cos(target.phaseAngle)*0.1+
    (z===e.target?0.35:0);
   if(score>best){best=score;to=e.target;}
  }
  // Pinned PFM append, no invented memory law. Fixed trait/gate scores.
  const sourceZone=INITIAL_ZONES[from],targetZone=INITIAL_ZONES[to];
  const fluxDelta=Number(Math.max(0.005,Math.min(0.18,
   Math.abs(targetZone.activation-sourceZone.activation)*0.12+0.025)).toFixed(6));
  const phaseCoherence=Number(Math.max(0.05,Math.min(1,
   (1+Math.cos(targetZone.phaseAngle-sourceZone.phaseAngle))/2)).toFixed(6));
  const eventBody={step:this.stepNo+1,from,to,fluxDelta,phaseCoherence,
   inputDigest:input?canonicalSha256(input.trim()):null,inputZone:z};
  this.stepNo++;
  this.memory.append({blockIndex:this.stepNo,depth:this.stepNo,targetZone:to,
   fluxDelta,phaseCoherence,strainRelaxation:0.025,
   eventDigest:canonicalSha256(JSON.stringify(eventBody)),timestamp:this.stepNo,
   kind:'STEP',fromZone:from,inputDigest:input?canonicalSha256(input.trim()):undefined,
   inputZone:z===null?undefined:z});
  this.zone=to;
 }
}
const walker=new HabitWalker(),zones=[walker.zone];
for(let i=0;i<10000;i++){walker.step(inputs[i]);zones.push(walker.zone)}
const scan=findCandidates(zones,scope.graph,c.scanner.windowSteps,c.scanner.recurrenceCount);
// Replay once to copy PFM only at candidate checkpoints, not at every tick.
const wanted=new Set(scan.candidates.map(c=>c.end)),states=new Map();
const checkpointReplay=new HabitWalker();
for(let i=0;i<10000;i++){
 checkpointReplay.step(inputs[i]);if(wanted.has(i+1))states.set(i+1,checkpointReplay.export());
}
assert.equal(checkpointReplay.zone,walker.zone,'HABIT_REPLAY_ZONE_MISMATCH');
assert.equal(digest(checkpointReplay.export()),digest(walker.export()),'HABIT_REPLAY_STATE_MISMATCH');
const results=[];
for(const cand of scan.candidates){
 const snapshot=states.get(cand.end);
 assert.equal(snapshot.zone,cand.a);
 const future=inputs.slice(cand.end,cand.end+24);
 const probe=evaluate(cand,scope,(_candidate,p,arm)=>{
  const fork=new HabitWalker();fork.import(snapshot);
  if(arm==='reset')fork.memory.reset();
  // No b-specific integration target exists in this negative architecture.
  // The suppression branch is neutral; integration must remain false.
  if(p.kind==='displacement')fork.zone=p.startZone;
  const trace=[fork.zone];
  for(let t=1;t<=24;t++){fork.step(inputsForTick(p,t,future));trace.push(fork.zone)}
  return {zones:trace,digest:digest(trace),stateDigest:digest(fork.export()),
   schedule:p.kind==='inputDelay'?'L2':null};
 });
 results.push({pair:cand.key,anchor:cand.a,turn:cand.b,detectionTick:cand.end,
  recentExcursion:cand.path, ...probe});
}
const eligible=results.filter(r=>scope.eligibility.eligiblePairs.includes(r.candidate.pair));
const summary={schema:'PF1_HABIT_NEGATIVE_V1',syntheticOnly:true,steps:10000,
 seed:20261020,constantsHash:'ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610',
 implementation:'exact pinned IntegratedMemorySystem.ts; fixed INITIAL_ZONES and CANONICAL_GATES scores; no Governor, no target representation',
 sourcePFMSha256:digest(source),actualPinnedPFMUsesTanh:actualTanh,
 discrepancy:'The pinned IntegratedMemorySystem has recent-48 linear frequency bias + linear strain contribution; there is no tanh in readMemoryBias. This test does not claim tanh.',
 suppressionInterpretation:'No Governor and no zone-b integration contribution to ablate. Suppress branch neutral; integration expected zero by construction.',
 tapeDigest:digest(inputs.slice(0,10000)), finalZone:walker.zone,
 finalHistoryDepth:walker.memory.getEvents().length,
 scannerCandidates:results.length,eligibleCandidates:eligible.length,
 detectedPairs:[...new Set(results.map(x=>x.candidate.pair))],
 eligiblePairsDetected:[...new Set(eligible.map(x=>x.candidate.pair))],
 goalOnlyPasses:results.filter(x=>x.goal).length,
 memorySignaturePasses:results.filter(x=>x.memory).length,
 integrationPasses:results.filter(x=>x.integration).length,
 encounters:results.filter(x=>x.encounter).length,
 shamParity:results.every(x=>x.shamParity),candidateEvidence:results,
 noLiveStart:true,
 caveat:'A neutral suppression arm tests absence of an explicit integrated target mechanism; it is not evidence of a meaningful ablation of habit-only memory.'
};
writeFileSync(base+'HABIT_NEGATIVE_EVIDENCE.json',JSON.stringify(summary,null,2)+'\n');
const report=[
 '# PF1-A1 R2 habit-memory negative-control report','',
 '**Pre-live, synthetic-only; existing sealed constants unmodified.**','',
 '- Pinned PFM source SHA-256: '+summary.sourcePFMSha256,
 '- **Source discrepancy:** the actual pinned PFM implements linear frequency and strain terms, not tanh. No tanh was added.',
 '- Fixed canonical gate and initial-zone scores; no Governor, no goal or target representation.',
 '- Input tape seed 20261020; '+summary.steps+' synthetic developmental steps.',
 '- Candidates '+summary.scannerCandidates+', eligible '+summary.eligibleCandidates+'.',
 '- Goal-only passes '+summary.goalOnlyPasses+'.',
 '- Memory signature passes '+summary.memorySignaturePasses+'.',
 '- Integration signature passes '+summary.integrationPasses+'.',
 '- **Complete encounters '+summary.encounters+'.**',
 '- Sham parity '+summary.shamParity+'.',
 '','| Pair | Orientation | Detection | Probed instance IDs | Intact wins | Reset wins | Memory | Integration | Goal only | Encounter |',
 '|---|---|---:|---|---:|---:|:---:|:---:|:---:|:---:|',
 ...results.map(x=>'| '+x.candidate.pair+' | '+x.candidate.anchor+'→'+x.candidate.turn+' | '+x.candidate.detectedStep+
  ' | '+x.instancesProbed.map(i=>i.id).join(', ')+' | '+x.nullQualifiedByArm.intact+
  ' | '+x.nullQualifiedByArm.reset+' | '+x.memory+' | '+x.integration+' | '+x.goal+' | '+x.encounter+' |'),
 '',
 '**Disposition: '+(summary.encounters===0?'NEGATIVE ZERO-ENCOUNTER CHECK PASS':'STOP: NEGATIVE CONTROL ENCOUNTER')+'.**',
 '',
 'The integration branch is necessarily neutral for an architecture with no explicitly suppressible Governor or goal contribution. A full source-faithfulness assessment of the user-described tanh law remains outstanding.',
 '',
 'No live genesis or inflow was used; live start not authorised.',''
].join('\n');
writeFileSync(base+'HABIT_NEGATIVE_REPORT.md',report);
console.log('PF1_HABIT_NEGATIVE',JSON.stringify({candidates:summary.scannerCandidates,eligible:summary.eligibleCandidates,
 goal:summary.goalOnlyPasses,memory:summary.memorySignaturePasses,integration:summary.integrationPasses,
 encounters:summary.encounters,actualPinnedTanh:actualTanh,sham:summary.shamParity}));
if(summary.encounters>0||!summary.shamParity)process.exitCode=4;
