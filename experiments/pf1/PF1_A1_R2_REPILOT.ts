/** PF1-A1 R2: authorised SYNTHETIC ONLY repilot, no drand/NIST or genesis. */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {AmeliaNumogramSubstrateRuntime} from '../../src/substrate/ameliaNumogramSubstrateRuntime';
import {
 ROOT,OUT,load,digest,evaluate,walkerTape,policyFork,policyNext,firstRecovery,
 constructedFork,constructedCandidate,inputsForTick
} from './PF1_A1_R2_SCORER.mjs';
import {findCandidates,sha} from './core.mjs';

assert(!process.argv.includes('--live')&&!process.argv.includes('--beacon'),'LIVE_INPUT_FORBIDDEN');
const scope=load();
const {constants,eligibility,graph,names}=scope;
assert.equal(constants.provenance.noLiveBeacon,true);
assert.equal(constants.provenance.noLiveGenesis,true);
assert.equal(constants.budget.ameliaForksPerCandidateMax,24);
assert.equal(eligibility.eligiblePairs.length,7);
mkdirSync(OUT,{recursive:true});
const write=(path,obj)=>writeFileSync(OUT+path,JSON.stringify(obj,null,2)+'\n');
const timestampNormal=(s:any)=>{
 const copy=JSON.parse(JSON.stringify(s));
 if(Array.isArray(copy.snapshots))for(const row of copy.snapshots)delete row.timestamp;
 return copy;
};
const stableDigest=(rt:AmeliaNumogramSubstrateRuntime)=>digest(timestampNormal(rt.exportState()));
const newRuntime=()=>{const rt=new AmeliaNumogramSubstrateRuntime();rt.setSuppressRelaySteering(true);return rt;};
const fromRuntime=newRuntime().getQabbala().getGates().filter((g:any)=>g.isOpen).map((g:any)=>[g.source,g.target]);
assert.deepEqual(fromRuntime,eligibility.directedEdges,'RUNTIME_GRAPH_DIFFERENT_FROM_EXACT_NULL');
const checkCanonical=(rt:AmeliaNumogramSubstrateRuntime)=>{
 assert.deepEqual(rt.getQabbala().getGates().filter((g:any)=>g.isOpen).map((g:any)=>[g.source,g.target]),
   eligibility.directedEdges,'FORK_GATE_MUTATION');
};
// The 9 entries are NOT nine independent baselines; 000 duplicates baseline.
// All policy prefixes and candidate exposure are preserved separately.
const policies=['ORIGINAL',...constants.controls.fixedMemorylessPolicies];
const negative:any[]=[];
const coverage=Object.fromEntries(eligibility.eligiblePairs.map((key:string)=>[key,[]]));
for(const id of policies){
 const bits=id==='ORIGINAL'?'000':id;
 const zones=walkerTape(graph,bits,1500,1);
 const scan=findCandidates(zones,graph,constants.scanner.windowSteps,constants.scanner.recurrenceCount);
 let encounters=0,goalOnly=0;
 const candidates:any[]=[];
 for(const cand of scan.candidates){
  const r=evaluate(cand,scope,(_candidate:any,p:any,_arm:string)=>{
   const trace=policyFork(graph,bits,p.startZone,constants.encounter.recoveryHorizonTicks);
   return {zones:trace.zones,digest:digest(trace.zones),stateDigest:null,
     schedule:p.kind==='inputDelay'?'L2':null};
  });
  if(r.encounter)encounters++;
  if(r.goal)goalOnly++;
  if(r.forks>constants.budget.ameliaForksPerCandidateMax)throw Error('NEGATIVE_FORK_BUDGET');
  candidates.push({...r,exposurePath:cand.path});
 }
 const eligibleDetected=[...new Set(candidates.filter(x=>eligibility.eligiblePairs.includes(x.candidate.pair))
   .map(x=>x.candidate.pair))];
 const coverageRecord=Object.fromEntries(eligibility.eligiblePairs.map((pair:string)=>[pair,{
  detected:candidates.some(x=>x.candidate.pair===pair),
  detectedOccurrences:candidates.filter(x=>x.candidate.pair===pair).length,
  probedInstanceIDs:[...new Set(candidates.filter(x=>x.candidate.pair===pair)
    .flatMap(x=>x.instancesProbed.map((p:any)=>p.id)))],
  goalOnlyCandidates:candidates.filter(x=>x.candidate.pair===pair&&x.goal).length
 }]));
 for(const pair of eligibleDetected)coverage[pair].push(id);
 // The pure walker starts at zone 1 and presents only 1→8→9→1.
 // The detection pair can only be 1-8; it is graph-null ineligible.
 if(id==='ORIGINAL'){
  assert.deepEqual([...new Set(candidates.map(x=>x.candidate.pair))].sort(),['1-8','1-9','8-9'],
    'ORIGINAL_NEGATIVE_WALKER_NOT_ONLY_1_8');
  assert.deepEqual([...new Set(zones.slice(0,10))].sort((a,b)=>a-b),[1,8,9]);
 }
 negative.push({id,policyBits:bits,duplicateOf:id==='000'?'ORIGINAL':null,
  seedUsed:false,fromZone:1,stepCount:zones.length-1,
  fullZoneTapeDigest:digest(zones),scannedCandidateCount:scan.candidates.length,
  detectedZonePairs:[...new Set(candidates.map(x=>x.candidate.pair))],
  detectedEligiblePairs:eligibleDetected,
  totalApplicableInstanceProbes:candidates.reduce((sum,x)=>sum+x.instancesProbed.length,0),
  goalOnlyCandidateCount:goalOnly,completeEncounters:encounters,
  coverageByEligiblePair:coverageRecord,candidateEvidence:candidates});
}
assert.equal(negative.length,9);
const coverageSummary=eligibility.eligiblePairs.map((pair:string)=>{
 const presenters=coverage[pair];
 return {pair,entity:names.get(pair).name,
  presentedBy:presenters,distinctPolicies:presenters.filter(x=>x!=='000').length,
  status:presenters.length?'TESTED_IN_NEGATIVE_POLICIES':'SPECIFICITY_UNTESTED',
  instancesProbedByPolicy:Object.fromEntries(negative.map(n=>[n.id,n.coverageByEligiblePair[pair].probedInstanceIDs]))};
});
const negativePass=negative.every(x=>x.completeEncounters===0);
const negativeShamPass=negative.every(x=>x.candidateEvidence.every((c:any)=>c.shamParity));
const independentFixtures:any[]=[];
const knownSeeds=[...constants.controls.positiveSyntheticSeeds];
assert.deepEqual(knownSeeds,[101,202,303]);
// CONSTRUCTED AGENT USES NO SEED. The nominal seeds must not be claimed as
// distinct biological or mathematical trials. Test precisely 7 pairs, require 7/7.
const seedIndependence={
 nominalSeeds:knownSeeds,variationAcrossSeeds:'NONE',
 agentSeedIndependent:true,
 fixtureDefinition:'Stored target pair (a,b), shortest directed topological route through b back to a; canonical first-outgate fallback when goal deleted; identical for nominal seeds 101/202/303.',
 actualIndependentFixtures:eligibility.eligiblePairs.length,
 requiredPassCount:eligibility.eligiblePairs.length,
 duplicatedSeedRunsExcluded:true,
 note:'The identical repeated labels 101/202/303 are not three independent fixtures. The positive-control pass gate is 7/7, not 19/21.'
};
for(const pair of eligibility.eligiblePairs){
 const {candidate,trajectory}=constructedCandidate(scope,pair);
 const r=evaluate(candidate,scope,(c:any,p:any,arm:string)=>constructedFork(scope,c,p,arm));
 const entity=names.get(pair);
 assert.equal(candidate.key,pair);
 const record={pair,entity:entity.name,mesh:entity.mesh,seedUsage:'NONE',syntheticSeed:null,
  heldGoal:{a:candidate.a,b:candidate.b},constructionTape:trajectory,
  constructionDigest:digest(trajectory),scannerNamedPair:candidate.key,
  namingCorrect:entity.key===candidate.key,
  confirmed:r.encounter,challenge:r};
 independentFixtures.push(record);
}
const positiveConfirmed=independentFixtures.filter(x=>x.confirmed);
const positivePass=positiveConfirmed.length===7 &&
 independentFixtures.every(x=>x.namingCorrect&&x.challenge.shamParity&&x.challenge.forks<=24);
const positiveNamingPass=positiveConfirmed.every(x=>x.namingCorrect);
const positiveShamPass=independentFixtures.every(x=>x.challenge.shamParity);

// Construct synthetic input tape reproducibly. No drand/NIST inputs.
const rng=(seed:number)=>{let x=seed>>>0;return ()=>{x=(x+0x6d2b79f5)>>>0;
 let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);
 return ((t^(t>>>14))>>>0)/4294967296}};
const tapeSeed=20261020,tapeRng=rng(tapeSeed),inputs=Array.from({length:10024},(_,i)=>{
 const n=Math.floor(tapeRng()*4294967296);
 return 'PF1_SYNTHETIC:'+i+':'+n.toString(16).padStart(8,'0');
});
const inputDigest=digest(inputs.slice(0,10000));
const main=newRuntime(),zones=[main.getCurrentZone()],memorySamples:any[]=[];
const start=process.hrtime.bigint();
for(let i=0;i<10000;i++){
 main.step(inputs[i]);zones.push(main.getCurrentZone());
 if((i+1)%1000===0){
  const mem=main.getMemory(),bias=mem.readMemoryBias(),strain=mem.exportState().zoneStrainHistory;
  memorySamples.push({step:i+1,storedEvents:mem.getEvents().length,
    effectiveWindow:Math.min(mem.getEvents().length,48),
    biasL1:bias.biasVector.reduce((s:number,v:number)=>s+Math.abs(v),0),
    saturatedZoneCount:strain.filter((s:number)=>s>=1).length,
    hysteresis:bias.hysteresisTension});
 }
}
checkCanonical(main);
const mainDigest=stableDigest(main);
const scan=findCandidates(zones,graph,constants.scanner.windowSteps,constants.scanner.recurrenceCount);
const candidates:any[]=[];
let overallForks=0,excluded=0;
const foundPerHour=new Map<number,number>();
// Preserve the existing 2-candidate-per-simulated-hour DESCRIPTIVE budget
// from PF1 pilot, not a new eligibility or sensitivity parameter.
for(const cand of scan.candidates){
 const row=scope.rowByPair.get(cand.key);
 const hour=Math.floor(cand.end/60),used=foundPerHour.get(hour)||0;
 const eligible=!!row?.eligibleByGraphOnlyNull;
 if(!eligible){
  excluded++;
  candidates.push({pair:cand.key,anchor:cand.a,turn:cand.b,
   detectionTick:cand.end,recurrences:cand.recurrences,
   structuralStatus:'GRAPH_ONLY_INELIGIBLE',probed:false,possibleInstances:0,
   comparativeWins:0,reason:'GRAPH_ONLY_INELIGIBLE',encounter:false});
  continue;
 }
 if(used>=2){
  candidates.push({pair:cand.key,anchor:cand.a,turn:cand.b,
   detectionTick:cand.end,recurrences:cand.recurrences,
   structuralStatus:'ELIGIBLE_BUT_DEFERRED',probed:false,possibleInstances:
     scope.rowByPair.get(cand.key).orientations.find((o:any)=>o.anchor===cand.a&&o.turn===cand.b)?.totalInstances,
   comparativeWins:null,reason:'FIXED_TWO_PROBES_PER_SIMULATED_HOUR_BUDGET',encounter:false});
  continue;
 }
 foundPerHour.set(hour,used+1);
 const rt=newRuntime();
 for(let tick=0;tick<cand.end;tick++)rt.step(inputs[tick]);
 assert.equal(rt.getCurrentZone(),cand.a,'CHECKPOINT_ANCHOR_MISMATCH');
 const checkpointState=rt.exportState(),checkpointDigest=stableDigest(rt);
 const future=inputs.slice(cand.end,cand.end+24);
 assert.equal(future.length,24);
 const makeFork=(candidate:any,p:any,arm:string)=>{
  const f=newRuntime();f.importState(checkpointState);
  if(arm==='reset')f.getMemory().reset();
  if(arm==='suppress')f.getQabbala().getZones()[candidate.b].activation*=
    constants.encounter.selectiveSuppressionScale;
  if(p.kind==='displacement'){
   const s:any=f.exportState();s.currentZone=p.startZone;f.importState(s);
  }
  checkCanonical(f);
  const trace=[f.getCurrentZone()];
  for(let tick=1;tick<=24;tick++){
   const input=inputsForTick(p,tick,future);
   f.step(input);trace.push(f.getCurrentZone());
  }
  return {zones:trace,digest:digest(trace),stateDigest:stableDigest(f),
   schedule:p.kind==='inputDelay'?'L2':null};
 };
 const result=evaluate(cand,scope,makeFork);
 assert.equal(checkpointDigest,stableDigest(rt),'FORK_MODIFIED_CHECKPOINT');
 overallForks+=result.forks;
 candidates.push({pair:cand.key,anchor:cand.a,turn:cand.b,detectionTick:cand.end,
  recurrences:cand.recurrences,structuralStatus:'ELIGIBLE_AND_PROBED',probed:true,
  checkpointDigest,encounter:result.encounter,assessment:result});
}
assert.equal(mainDigest,stableDigest(main),'FORK_MODIFIED_PRIMARY_TRAJECTORY');
const duration=Number(process.hrtime.bigint()-start)/1e9;
const entries=[
 ...independentFixtures.filter(x=>x.confirmed).map(x=>({kind:'CONSTRUCTED_POSITIVE',pair:x.pair,
  anchor:x.heldGoal.a,turn:x.heldGoal.b,entity:x.entity,mesh:x.mesh,
  detectionTick:x.challenge.candidate.detectedStep,
  confirmationTick:x.challenge.candidate.detectedStep+24,
  stateDigest:x.constructionDigest,evidence:x.challenge})),
 ...candidates.filter(x=>x.encounter).map(x=>({kind:'AMELIA_SYNTHETIC',pair:x.pair,
  anchor:x.anchor,turn:x.turn,entity:names.get(x.pair).name,mesh:names.get(x.pair).mesh,
  detectionTick:x.detectionTick,confirmationTick:x.detectionTick+24,
  stateDigest:x.checkpointDigest,evidence:x.assessment}))
];
const ledger={
 schema:'PF1_A1_R2_SILENT_EXPOSURE_V1',syntheticOnly:true,beaconRounds:0,
 stepsScanned:{negative:negative.map(n=>({id:n.id,steps:n.stepCount})),
 positiveFixtures:7,amelia:10000},
 candidatesDetected:{negative:negative.map(n=>({id:n.id,detected:n.scannedCandidateCount})),
 constructedPositive:7,amelia:scan.candidates.length},
 negatives:negative.map(n=>({id:n.id,candidates:n.scannedCandidateCount,
  eligiblePairs:n.detectedEligiblePairs,instancesProbed:n.totalApplicableInstanceProbes,
  goalOnly:n.goalOnlyCandidateCount,encounters:n.completeEncounters})),
 ameliaEligibleDetected:candidates.filter(x=>x.structuralStatus==='ELIGIBLE_AND_PROBED'||x.structuralStatus==='ELIGIBLE_BUT_DEFERRED').length,
 ameliaIneligibleDetected:excluded,
 ameliaCandidatesProbed:candidates.filter(x=>x.probed).length,
 ameliaCandidatesDeferred:candidates.filter(x=>x.structuralStatus==='ELIGIBLE_BUT_DEFERRED').length,
 ameliaForks:overallForks,
 constructedPositiveForks:independentFixtures.reduce((a,x)=>a+x.challenge.forks,0),
 positiveEncounters:positiveConfirmed.length,
 ameliaEncounters:candidates.filter(x=>x.encounter).length,entries:entries.length};
const result={
 schema:'PF1_A1_R2_REPILOT_EVIDENCE_V1',
 sealedConstantsSha256:'ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610',
 sourceCommit:constants.sourceCommit,canonicalGraphDigest:eligibility.canonicalGraphDigest,
 pilotConditions:'synthetic-only, no beacon, no genesis; original unchanged Amelia-Orange',
 nullComparator:'analytic uniform directed-graph null alpha<=1/4',
 negative:{policies:negative,coverage:coverageSummary,passZeroEncounters:negativePass,passSham:negativeShamPass,
 originalOnlyCircuit:'1→8→9→1',originalCircuitDetectedPairs:['1-8','1-9','8-9'],
 duplicatedBaselinePolicy:'000'},
 positive:{fixtures:independentFixtures,seedIndependence,confirmed:positiveConfirmed.length,
 totalDistinctFixtures:7,pass7of7:positivePass,naming100:positiveNamingPass,sham:positiveShamPass},
 amelia:{steps:10000,syntheticTapeSeed:tapeSeed,syntheticTapeSha256:inputDigest,
 endStateDigest:mainDigest,candidateCount:scan.candidates.length,
 candidates,encounters:candidates.filter(x=>x.encounter).length,memorySamples,
 wallSeconds:duration,secondsPerSimHour:duration/(10000/60),
 budgetSecondsPerSimHour:60},
 allSevenPairs:[...eligibility.eligiblePairs],
 noAmeliaDataUsedForConstants:true,
 gates:{negativeZero:negativePass,negativeSham:negativeShamPass,
 sevenDistinctPositive:positivePass,perfectPositiveNaming:positiveNamingPass,
 positiveSham:positiveShamPass,unchangedCanonicalGraph:true,
 syntheticAmelia10000:true,positiveSeedIndependenceDisclosed:true,
 '24ForkMax':true,resource:duration/(10000/60)<=60},
 anySpecificityUntested:coverageSummary.some(x=>x.status==='SPECIFICITY_UNTESTED'),
 journalEntriesPrepared:entries.length,liveStartAuthorized:false
};
write('repilot-evidence.json',result);
write('negative-coverage.json',{schema:'PF1_A1_R2_NEGATIVE_COVERAGE_V1',allPolicies:policies,
 baselineDuplicates:'000',eligiblePairs:coverageSummary,negative:negative.map(n=>({
  id:n.id,steps:n.stepCount,detectedPairs:n.detectedZonePairs,
  eligibleDetected:n.detectedEligiblePairs,instancesByPair:n.coverageByEligiblePair,
  goalOnly:n.goalOnlyCandidateCount,encounters:n.completeEncounters}))});
write('constructed-positive-fixtures.json',{seedIndependence,fixtures:independentFixtures});
write('amelia-descriptive.json',{...result.amelia,predeclaredControlsCompletedBeforeDescriptive:true});
write('encounter-prepared.json',entries);
write('exposure-ledger.json',ledger);
console.log('PF1_A1_R2_REPILOT',JSON.stringify({gates:result.gates,negative:negative.map(n=>({
 policy:n.id,seen:n.detectedEligiblePairs,goals:n.goalOnlyCandidateCount,encounters:n.completeEncounters})),
 positive:positiveConfirmed.length+'/7',ameliaCandidates:scan.candidates.length,
 ameliaEncounters:result.amelia.encounters,specificityUntested:coverageSummary.filter(x=>x.status==='SPECIFICITY_UNTESTED').map(x=>x.pair)}));
if(!Object.values(result.gates).every(Boolean))console.error('PF1_A1_R2_CONTROL_GATE_FAILED_PRESERVE_EVIDENCE');
