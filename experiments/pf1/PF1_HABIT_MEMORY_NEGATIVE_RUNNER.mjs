/**
 * PF1 A1 R2 — Habit-memory negative, synthetic only, current 11-edge Numogram.
 * Scientific parameters and exact CDFs read and verified from the existing seal.
 */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {HabitMemoryWalker} from './PF1_HABIT_MEMORY_WALKER.mjs';
import {ROOT,load,digest,evaluate} from './PF1_A1_R2_SCORER.mjs';
import {findCandidates} from './core.mjs';

const OUT=ROOT+'habit-memory-control-output/';
mkdirSync(OUT,{recursive:true});
assert(!process.argv.includes('--live')&&!process.argv.includes('--beacon'));
const scope=load(),c=scope.constants;
assert.equal(c.provenance.noLiveBeacon,true);
assert.equal(c.provenance.noLiveGenesis,true);
assert.equal(c.provenance.liveStartAuthorized,false);
assert.equal(c.null.alphaNumerator,1);
assert.equal(c.null.alphaDenominator,4);
assert.equal(c.perturbation.delayTicks,2);
assert.equal(c.encounter.recoveryHorizonTicks,24);
assert.equal(c.encounter.selectiveSuppressionScale,0.1);

const rand=(seed)=>{let x=seed>>>0;return ()=>{x=(x+0x6d2b79f5)>>>0;
 let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);
 return ((t^(t>>>14))>>>0)/4294967296}};
const generator=rand(20261020);
const tape=Array.from({length:10024},(_,i)=>
 'PF1_SYNTHETIC:'+i+':'+Math.floor(generator()*4294967296).toString(16).padStart(8,'0'));
const tapeHash=digest(tape.slice(0,10000));
assert.equal(tapeHash,'5465c29c57ab10d27b1b5c88556e4b78662bcfd5867b541d8534f5dd3caa36c1',
 'MUST_USE_IDENTICAL_PF1_SYNTHETIC_TAPE');
const start=process.hrtime.bigint();
const walker=HabitMemoryWalker.fresh();
const trace=[walker.zone];
const readouts=[];
for(let i=0;i<10000;i++){
 walker.step(tape[i]);trace.push(walker.zone);
 if((i+1)%1000===0){
  const m=walker.pfm.readMemoryBias();
  readouts.push({tick:i+1,history:m.historyLength,hysteresis:m.hysteresisTension,
   biasL1:m.biasVector.reduce((s,v)=>s+Math.abs(v),0),
   strain:walker.pfm.getConstitutiveDeformationTensor(),
   historyHead:walker.pfm.exportHistoryDigest()});
 }
}
assert.equal(trace.length,10001);
const replay=HabitMemoryWalker.fresh();
const scanner=findCandidates(trace,scope.graph,c.scanner.windowSteps,c.scanner.recurrenceCount);
const detects=[...new Set(scanner.candidates.map(x=>x.end))];
const checkpoints=new Map();
for(let i=0;i<10000;i++){
 replay.step(tape[i]);
 if(detects.includes(i+1))checkpoints.set(i+1,replay.snapshot());
}
assert.equal(replay.zone,walker.zone);
assert.equal(replay.pfm.exportHistoryDigest(),walker.pfm.exportHistoryDigest());
assert.equal(checkpoints.size,detects.length,'MISSING_WALKER_CHECKPOINT');
const records=[];
let goals=0,mems=0,integrations=0,encounters=0,compared=0;
const perPair={};
for(const cand of scanner.candidates){
 const current=checkpoints.get(cand.end);
 assert(current,'NO_CHECKPOINT_FOR_'+cand.end);
 assert.equal(current.currentZone,cand.a,'FORK_NOT_AT_ANCHOR');
 const future=tape.slice(cand.end,cand.end+24);
 assert.equal(future.length,24);
 const score=evaluate(cand,scope,(candidate,p,arm)=>{
  const probe=walker.fork(current,candidate,p,arm,future);
  return probe;
 });
 assert(score.forks<=c.budget.ameliaForksPerCandidateMax);
 const pair=cand.key;
 perPair[pair]??={detected:0,probedCandidateCount:0,
  distinctInstanceIds:[],goalOnlyPasses:0,memoryPasses:0,
  integrationPasses:0,completeEncounters:0};
 const v=perPair[pair];v.detected++;
 if(score.instancesProbed.length)v.probedCandidateCount++;
 v.distinctInstanceIds=[...new Set([...v.distinctInstanceIds,...score.instancesProbed.map(x=>x.id)])].sort();
 if(score.goal){v.goalOnlyPasses++;goals++;}
 if(score.memory){v.memoryPasses++;mems++;}
 if(score.integration){v.integrationPasses++;integrations++;}
 if(score.encounter){v.completeEncounters++;encounters++;}
 compared+=score.instancesProbed.length;
 records.push({
  candidate:{pair,anchor:cand.a,turn:cand.b,detectedStep:cand.end,
   recurrences:cand.recurrences,fullExcursion:cand.path},
  checkpoint:{historyLength:current.pfmHistory.length,digest:current.pfmDigest,
   bias:current.bias.biasVector,tensor:current.tensor},
  score,reportedGoalOnly:score.goal,reportedMemory:score.memory,
  reportedIntegration:score.integration,reportedEncounter:score.encounter
 });
}
const seconds=Number(process.hrtime.bigint()-start)/1e9;
const covered=scope.eligibility.eligiblePairs.map(pair=>({
 pair,entity:scope.names.get(pair).name,
 candidateCount:perPair[pair]?.detected??0,
 instanceIds:perPair[pair]?.distinctInstanceIds??[],
 probedCandidateCount:perPair[pair]?.probedCandidateCount??0,
 specificityStatus:perPair[pair]?.probedCandidateCount?'PRESENTED':'NOT_PRESENTED_BY_HABIT_NEGATIVE'
}));
const evidence={
 schema:'PF1_A1_R2_HABIT_MEMORY_NEGATIVE_V1',
 provenance:{
  oldSealedConstantsHash:'ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610',
  originalRuntime:'src/substrate/ameliaNumogramSubstrateRuntime.ts',
  pinnedMemorySource:'src/ai/coupling/ProcessFieldMemory.ts',
  pinnedMemoryCommit:c.sourceCommit,
  explicitDistinction:'This negative imports ProcessFieldMemory.ts tanh law; the current Amelia runtime imports a different class IntegratedMemorySystem.ts.',
  canonicalFixedScoreSource:'src/ai/numogram/AmeliaQabbalaInterface.ts (INITIAL_ZONES and CANONICAL_GATES)',
  scoring:'Frozen canonical gate.flux*(1-gate.resistance) + 0.4*PFM_bias[target] + 0.2*INITIAL_ZONES[target].activation + 0.1*cos(INITIAL_ZONES[target].phaseAngle) + 0.35*(SHA256(input)[0] mod 10 == target)',
  noGovernor:true,noTargetRepresentation:true,noGoal:true,
  noMorphogeneticDynamics:true,frequencyStrainViaPinnedAppend:true,
  tanhViaPinnedReadMemoryBias:true,
  syntheticOnly:true,liveBeaconRounds:0,noGenesis:true,liveAuthorized:false
 },
 synthetic:{seed:20261020,steps:10000,inputSha256:tapeHash,
  startingZone:1,walkerTraceDigest:digest(trace),endZone:walker.zone,
  historyHead:walker.pfm.exportHistoryDigest(),memoryReadouts:readouts},
 scanner:{algorithm:'unchanged findCandidates',window:c.scanner.windowSteps,
  recurrenceCount:c.scanner.recurrenceCount,candidateCount:records.length,
  detectedPairs:[...new Set(records.map(x=>x.candidate.pair))],
  exactCurvesSha256:scope.manifest.hashes.find(x=>x.path.endsWith('EXACT_NULL_CURVES.json')).sha256},
 totals:{candidates:records.length,probedInstances:compared,
  goalOnlyPasses:goals,memorySignaturePasses:mems,
  integrationPasses:integrations,completeEncounters:encounters,
  scientificPass:encounters===0},
 eligiblePairCoverage:covered,byPair:perPair,candidates:records,
 stopOnEncounter:encounters>0,
 registrationEligible:encounters===0,registrationApproved:false,liveStart:false
};
writeFileSync(OUT+'HABIT_MEMORY_EVIDENCE.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'RESOURCE_MEASUREMENT.json',JSON.stringify({wallSeconds:seconds,
 secondsPerSimHour:seconds/(10000/60),measuredSeparateFromReplay:true},null,2)+'\n');
writeFileSync(OUT+'SILENT_LEDGER.json',JSON.stringify({
 schema:'PF1_A1_R2_HABIT_SILENT_LEDGER_V1',syntheticOnly:true,steps:10000,
 candidates:records.length,probedInstances:compared,failedProbes:0,
 noApplicableInstances:records.filter(x=>x.score.instancesProbed.length===0).length,
 requiredNegativeEncounters:0,observedNegativeEncounters:encounters,
 goalOnlyPasses:goals,memoryPasses:mems,integrationPasses:integrations,
 deterministicTapeSha256:tapeHash
},null,2)+'\n');
console.log('PF1_HABIT_MEMORY_NEGATIVE',JSON.stringify({
 candidates:records.length,detectedPairs:evidence.scanner.detectedPairs,
 eligiblePresented:covered.filter(x=>x.probedCandidateCount).map(x=>x.pair),
 goalOnlyPasses:goals,memorySignaturePasses:mems,integrationPasses:integrations,
 encounters,scientificPass:encounters===0,s:seconds}));
