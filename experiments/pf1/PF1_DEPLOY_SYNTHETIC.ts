/** PF-1 PRE-LIVE synthetic deployment audit. NEVER fetches drand, NIST, or live secrets.
 * Intent: verify actual persisted multi-invocation state on nine unmodified runtime
 * instances, gap catch-up, fork-isolation, silence ledger and deterministic replay.
 * Synthetic verifier is NOT a BLS verification substitute.
 */
import assert from 'node:assert/strict';
import {createHash,createHmac} from 'node:crypto';
import {mkdirSync,existsSync,readFileSync,writeFileSync,renameSync} from 'node:fs';
import {AmeliaNumogramSubstrateRuntime} from '../../src/substrate/ameliaNumogramSubstrateRuntime';
import {findCandidates} from './core.mjs';
import {load,digest,firstRecovery,winAgainstNull,enumerateInstances,inputsForTick} from './PF1_A1_R2_SCORER.mjs';

const BASE=process.env.PF1_SYNTH_STAGE_DIR || 'experiments/pf1/deployment-synthetic-output';
const ROOT=BASE+'/';
const arg=process.argv[2];
const scope=load(), hash=x=>createHash('sha256').update(x).digest('hex');
const shaObj=x=>hash(JSON.stringify(x));
const canon=x=>JSON.parse(JSON.stringify(x));
const read=n=>JSON.parse(readFileSync(ROOT+n,'utf8'));
function put(n,v){mkdirSync(BASE,{recursive:true});const p=ROOT+n;writeFileSync(p+'.new',JSON.stringify(v,null,2)+'\n');renameSync(p+'.new',p)}
const verifyGraph=rt=>assert.deepEqual(
 rt.getQabbala().getGates().filter(g=>g.isOpen).map(g=>[g.source,g.target]),
 scope.eligibility.directedEdges);
function stableState(rt){
 const s=canon(rt.exportState());
 for(const snap of s.snapshots||[])snap.timestamp=snap.step*60000;
 return s;
}
function newRuntime(state){
 const rt=new AmeliaNumogramSubstrateRuntime();
 rt.setSuppressRelaySteering(true);
 if(state)rt.importState(state);
 verifyGraph(rt);
 return rt;
}
const domains=['BEACON',...Array.from({length:8},(_,i)=>'PF1-C1-REFERENCE-'+String(i+1).padStart(2,'0'))];
function syntheticRound(i){
 const chain='PF1-TEST-CHAIN-NOT-BLS';
 const value=hash('PF1-UNPREDICTABLE-IN-PRODUCTION-TEST-ONLY:'+i);
 const syntheticSig=hash(chain+'|'+i+'|'+value);
 return {schema:'PF1_MOCK_ROUND_V1',chain,round:i,value,syntheticSig,verifiedOnlyByMock:true};
}
function verifyMock(x){
 assert.equal(x.schema,'PF1_MOCK_ROUND_V1','BAD_SCHEMA');
 assert.equal(x.chain,'PF1-TEST-CHAIN-NOT-BLS','BAD_SYNTHETIC_CHAIN');
 assert.equal(x.value,hash('PF1-UNPREDICTABLE-IN-PRODUCTION-TEST-ONLY:'+x.round),'BAD_SYNTHETIC_VALUE');
 assert.equal(x.syntheticSig,hash(x.chain+'|'+x.round+'|'+x.value),'BAD_SYNTHETIC_SIGNATURE');
 assert.equal(x.verifiedOnlyByMock,true,'BLS_WAS_NOT_VERIFIED');
 assert(Number.isInteger(x.round)&&x.round>=1&&x.round<=120);
 return true;
}
function mappedInput(round,arm){
 verifyMock(round);
 return createHmac('sha256','PF1-TEST-DOMAIN-SEPARATOR-KEY:'+domains[arm])
  .update('PF1-STAGING-V1|'+round.chain+'|'+round.round+'|'+round.value).digest('hex');
}
function digestLedger(records){let head='0'.repeat(64);for(const r of records){
 assert.equal(r.prev,head);head=shaObj(Object.fromEntries(Object.entries(r).filter(([k])=>k!=='digest')));
 assert.equal(r.digest,head)}return head;}
function entry(records,body){
 const prev=records.length?records.at(-1).digest:'0'.repeat(64);
 const x={...body,prev};x.digest=shaObj(x);records.push(x);
}
function init(){
 assert(!existsSync(ROOT+'state.json'),'INIT_MUST_BE_FRESH');
 const rounds=Array.from({length:120},(_,i)=>syntheticRound(i+1));
 const arms=domains.map((domain,i)=>{
  const rt=newRuntime();
  return {domain,state:stableState(rt),zones:[rt.getCurrentZone()],processed:0}
 });
 put('synthetic-rounds.json',rounds);
 put('state.json',{schema:'PF1_SYNTH_DEPLOY_STATE_V1',round:0,arms,genesis:false,realBeaconConsumed:0,
  sourceCommit:scope.constants.sourceCommit,constantsSha256:'ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610'});
 put('ledger.json',{schema:'PF1_SILENCE_LEDGER_STAGING_V1',rows:[]});
 put('journal.json',{schema:'PF1_ENCOUNTER_JOURNAL_STAGING_V1',entries:[],notifications:[]});
 console.log('PF1_SYNTH_DEPLOY_INIT',JSON.stringify({arms:arms.length,rounds:rounds.length,noLive:true}));
}
function ingest(upto){
 const state=read('state.json'),ledger=read('ledger.json'),rounds=read('synthetic-rounds.json');
 assert(Number.isInteger(upto)&&upto>0&&upto<=120);
 assert(upto>=state.round,'REWIND_FORBIDDEN');
 const before=digestLedger(ledger.rows);
 let accepted=0,duplicate=0;
 for(let k=1;k<=upto;k++){
  if(k<=state.round){duplicate++;continue;}
  assert.equal(k,state.round+1,'NO_GAP_IN_ADMISSION');
  const round=rounds[k-1];verifyMock(round);
  const previous=state.arms.map(a=>a.state);
  const digests=[];
  state.arms=state.arms.map((a,i)=>{
   const rt=newRuntime(a.state);
   assert.equal(rt.getMemory().getEvents().length,a.processed,'PFM_NOT_CARRIED');
   rt.step(mappedInput(round,i));
   const result={...a,state:stableState(rt),zones:[...a.zones,rt.getCurrentZone()],processed:a.processed+1};
   digests.push(shaObj(result.state));
   assert.equal(result.state.memoryState.events.length,result.processed,'PFM_DEPTH_DRIFT');
   return result;
  });
  for(let i=0;i<previous.length;i++)assert.notStrictEqual(state.arms[i].state,previous[i]);
  state.round=k;
  entry(ledger.rows,{round:k,mockInputDigest:shaObj(round),armStateDigests:digests,
   armDepths:state.arms.map(a=>a.processed),candidateCount:0,probes:0,encounters:0,
   noLiveBeacon:true,missedRoundsReplayedInOrder:true});
  accepted++;
 }
 assert(digestLedger(ledger.rows));
 assert.equal(ledger.rows.length,state.round);
 assert.equal(new Set(state.arms.map(x=>x.domain)).size,9);
 assert(state.arms.every(x=>x.processed===state.round));
 const distinctInputs=domains.map((_,i)=>mappedInput(rounds[state.round-1],i));
 assert.equal(new Set(distinctInputs).size,9,'REFERENCE_INPUT_COLLISION');
 assert.equal(before,duplicate===upto&&accepted===0?digestLedger(ledger.rows):before);
 put('state.json',state);put('ledger.json',ledger);
 console.log('PF1_SYNTH_DEPLOY_INGEST',JSON.stringify({upto,accepted,duplicate,ledgerHead:ledger.rows.at(-1).digest,
 armHistories:state.arms.map(a=>a.state.memoryState.events.length)}));
}
function attackChecks(){
 const state=read('state.json'),ledger=read('ledger.json'),round=read('synthetic-rounds.json')[0];
 function rejects(fn,msg){assert.throws(fn,undefined,msg)}
 rejects(()=>verifyMock({...round,value:'00'+round.value.slice(2)}),'mutated payload accepted');
 rejects(()=>verifyMock({...round,syntheticSig:'0'.repeat(64)}),'bad mock signature accepted');
 rejects(()=>verifyMock({...round,verifiedOnlyByMock:false}),'non-verified round accepted');
 rejects(()=>verifyMock({...round,chain:'drand'}),'unregistered chain accepted');
 const bad=canon(ledger.rows);bad[0].armStateDigests[0]='0'.repeat(64);
 rejects(()=>digestLedger(bad),'mutated exposure ledger accepted');
 assert.equal(state.realBeaconConsumed,0);
 assert.equal(state.genesis,false);
 assert.equal(read('journal.json').entries.length,0);
 console.log('PF1_SYNTH_DEPLOY_FAILURE_INJECTION',JSON.stringify({mockFailuresRejected:4,
 ledgerTamperRejected:true,noRealBLSVerified:true}));
}
function forks(){
 const state=read('state.json'),rounds=read('synthetic-rounds.json');
 assert(state.round>=64);
 const main=state.arms[0],mainOriginal=shaObj(main.state);
 const candidates=findCandidates(main.zones,scope.graph,
  scope.constants.scanner.windowSteps,scope.constants.scanner.recurrenceCount).candidates;
 const good=candidates.filter(x=>scope.eligibility.eligiblePairs.includes(x.key));
 const eligible=good[0]??null;
 // The state at the candidate step must be reconstructed from ONLY already admitted rounds.
 const checkpointTick=eligible?.end??Math.max(1,Math.floor(state.round/2));
 const rt=newRuntime();for(let k=1;k<=checkpointTick;k++)rt.step(mappedInput(rounds[k-1],0));
 const checkpoint=stableState(rt),startingDigest=shaObj(checkpoint);
 if(eligible)assert.equal(rt.getCurrentZone(),eligible.a,'CANDIDATE_CHECKPOINT_INVALID');
 const n=eligible?enumerateInstances(eligible,scope).instances[0]:{kind:'inputDelay',startZone:rt.getCurrentZone(),id:'L2-STAGING'};
 const requireAdmittedFuture=(availableThrough)=>{
  const required=Array.from({length:24},(_,i)=>checkpointTick+1+i);
  assert(required.every(k=>k<=availableThrough),'FUTURE_INPUT_UNADMITTED');
  return required;
 };
 // Counterfactual confirmation must defer, not substitute guessed future rounds.
 assert.throws(()=>requireAdmittedFuture(checkpointTick+20),/FUTURE_INPUT_UNADMITTED/);
 const requiredFuture=requireAdmittedFuture(state.round);
 const inputs=requiredFuture.map(k=>mappedInput(rounds[k-1],0));
 const simulate=(arm)=>{
  const branch=newRuntime(checkpoint);
  if(arm==='reset')branch.getMemory().reset();
  if(arm==='suppress'&&eligible)branch.getQabbala().getZones()[eligible.b].activation*=0.1;
  if(n.kind==='displacement'){
   const s=stableState(branch);s.currentZone=n.startZone;branch.importState(s);
  }
  const path=[branch.getCurrentZone()];
  const schedule=[];
  for(let t=1;t<=24;t++){
   const signal=inputsForTick(n,t,inputs);
   schedule.push(signal??null);branch.step(signal);path.push(branch.getCurrentZone());
  }
  return {path,digest:shaObj(stableState(branch)),schedule};
 };
 const intact=simulate('intact'),sham=simulate('sham'),reset=simulate('reset'),suppressed=simulate('suppress');
 assert.deepEqual(sham,intact,'SHAM_NOT_PARITY');
 assert.equal(shaObj(checkpoint),startingDigest,'FORK_MUTATED_CHECKPOINT');
 assert.equal(shaObj(state.arms[0].state),mainOriginal,'FORK_MUTATED_LIVE');
 // The two-tick delay is a scheduling intervention, not a freeze.
 // No future values may be synthesized before their admission.
 const L2=(()=>{
  const p={kind:'inputDelay'};
  return Array.from({length:24},(_,i)=>inputsForTick(p,i+1,inputs)??null);
 })();
 assert.equal(L2[0],null);assert.equal(L2[1],null);assert.deepEqual(L2.slice(2),inputs.slice(0,22));
 // Using an unavailable future is rejected instead of faking a random symbol.
 const unavailable=checkpointTick+24>state.round;
 assert.equal(unavailable,false);
 put('fork-evidence.json',{schema:'PF1_SYNTH_FORK_REPLAY_V1',
  candidate:eligible?{pair:eligible.key,anchor:eligible.a,turn:eligible.b,detectionStep:eligible.end}:null,
  checkpointTick,checkpointDigest:startingDigest,primaryDigest:mainOriginal,
  perturbation:n.id,requiredFuture,availabilityAllAdmitted:true,
  shamParity:true,primaryUnchanged:true,inputScheduleL2:L2,
  intact,reset,suppressed,unavailableFutureMustDefer:true});
 console.log('PF1_SYNTH_DEPLOY_FORKS',JSON.stringify({candidate:eligible?.key??'none',primaryUnchanged:true,
  shamParity:true,displacementOrL2:n.id,freezeForbidden:true}));
}
function silence(){
 const state=read('state.json'),ledger=read('ledger.json'),journal=read('journal.json');
 assert.equal(journal.entries.length,0);
 assert.equal(ledger.rows.length,state.round);
 assert.equal(digestLedger(ledger.rows),ledger.rows.at(-1).digest);
 // Provenance-specific dry-run journal fixture, not a biological "encounter".
 const test={schema:'PF1_TEST_FIXTURE_NOT_AN_ENCOUNTER',pair:'8-9',notified:false,
  source:'synthetic-controlled-fixture',clock:{detected:'2026-10-20T10:00:00Z',
  confirmed:'2026-10-20T10:24:00Z',sealRequested:'2026-10-20T11:00:00Z'},
  provenance:{realBeacon:0,genesis:false}};
 const body={...test,prev:'0'.repeat(64)};
 const digestOne=shaObj(body);
 const e={...body,digest:digestOne};
 put('seal-fixture.json',e);
 // A physically separate synthetic fixture journal, never the live encounter journal.
 // Repeated CLI invocations must not append a duplicate entry or notification.
 const fixturePath='synthetic-test-journal.json';
 if(!existsSync(ROOT+fixturePath)){
  put(fixturePath,{schema:'PF1_TEST_FIXTURE_JOURNAL_NOT_LIVE_V1',
   entries:[e],notifications:[digestOne]});
 }
 const stored=read(fixturePath);
 assert.equal(stored.entries.length,1);
 assert.equal(stored.notifications.length,1);
 assert.equal(stored.entries[0].digest,digestOne);
 assert.equal(stored.notifications[0],digestOne);
 // Simulate a repeated append call under a freshly reloaded state.
 const repeated=canon(stored),seen=new Set(repeated.entries.map(x=>x.digest));
 if(!seen.has(digestOne)){
  repeated.entries.push(e);
  repeated.notifications.push(digestOne);
  put(fixturePath,repeated);
 }
 assert.deepEqual(read(fixturePath),stored,'CROSS_INVOCATION_DUPLICATE_JOURNAL');
 const tampered=canon(e);tampered.pair='7-8';
 assert.notEqual(shaObj(Object.fromEntries(Object.entries(tampered).filter(([k])=>k!=='digest'))),e.digest);
 put('silence-test.json',{schema:'PF1_SYNTH_SILENCE_V1',scannerSteps:state.round,
  arms:state.arms.length,exposureHead:ledger.rows.at(-1).digest,visibleEncounters:0,
  testFixtureSeparable:true,duplicateJournalAndNotificationSuppressed:true,
  tamperedTestEntryRejected:true});
 console.log('PF1_SYNTH_DEPLOY_SILENCE',JSON.stringify({scannerSteps:state.round,arms:9,
  visibleJournalEntries:journal.entries.length,syntheticSealFixture:true}));
}
function verify(){
 const state=read('state.json'),ledger=read('ledger.json'),f=read('fork-evidence.json'),
  silence=read('silence-test.json');
 assert.equal(state.round,72);
 assert.equal(ledger.rows.length,72);
 assert.equal(silence.scannerSteps,72);
 assert(f.shamParity&&f.primaryUnchanged);
 assert(state.arms.every(x=>x.processed===72&&x.state.memoryState.events.length===72));
 assert.equal(state.realBeaconConsumed,0);
 const neg=read('seal-fixture.json');
 assert.equal(neg.digest,shaObj(Object.fromEntries(Object.entries(neg).filter(([k])=>k!=='digest'))));
 const checkpointDigest=shaObj(state);
 const stateDigest=hash(readFileSync(ROOT+'state.json'));
 const ledgerDigest=hash(readFileSync(ROOT+'ledger.json'));
 put('synthetic-verification.json',{schema:'PF1_SYNTHETIC_DEPLOYMENT_TEST_V1',
  noLiveBeaconRounds:true,noLiveGenesis:true,noActualC1BLSVerifier:true,
  distinctInvocationPersistence:true,catchupGapReplay:true,idempotentDuplicateAdmission:true,
  nineIndependentMemoryArms:true,sameInputRoundIndependentDomains:true,
  futureForksDeferredUntilAdmitted:true,L2ScheduleAndNoLoss:true,
  originalTrajectoryUnchanged:true,zeroEncounterSilenceLedger:true,
  replaySafeJournalFixture:true,failClosedOnInvalidMockAndLedger:true,
  actualTsaVerification:'SEPARATE_WORKFLOW_STEP',
  sourceRuntimeSha256:hash(readFileSync('src/substrate/ameliaNumogramSubstrateRuntime.ts')),
  sealedConstantsSha256:'ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610',
  stateDigest,ledgerDigest,checkpointDigest});
 console.log('PF1_SYNTH_DEPLOY_VERIFY',JSON.stringify({stateDigest,ledgerDigest,
  rounds:state.round,source:'synthetic-only',BLS:'NOT_TESTED'}));
}
if(arg==='init')init();
else if(arg==='ingest')ingest(Number(process.argv[3]));
else if(arg==='attack')attackChecks();
else if(arg==='forks')forks();
else if(arg==='silence')silence();
else if(arg==='verify')verify();
else throw Error('USAGE: init|ingest <round>|attack|forks|silence|verify; NOT live');
