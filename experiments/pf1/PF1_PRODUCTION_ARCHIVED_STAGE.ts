/** PF1 dry-run ONLY, persists unmodified Orange runtime states across independent hosted jobs.
 * Intake is archived, BLS-verified original C1 Quicknet receipts; NEVER fetch.
 * Every journal entry is labelled INTEGRATION_FIXTURE_NOT_SCIENTIFIC_ENCOUNTER.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync,renameSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {AmeliaNumogramSubstrateRuntime} from '../../src/substrate/ameliaNumogramSubstrateRuntime';
import {findCandidates} from './core.mjs';
import {load,firstRecovery,winAgainstNull,inputsForTick} from './PF1_A1_R2_SCORER.mjs';
const src='experiments/pf1/production-dry-run';
const out=src+'/output';mkdirSync(out,{recursive:true});
const verified=JSON.parse(readFileSync(src+'/ARCHIVED_VERIFIED_QUICKNET.json','utf8'));
const scope=load();
const sha=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
function jread(path){return JSON.parse(readFileSync(out+'/'+path,'utf8'))}
function put(name,body){const p=out+'/'+name;writeFileSync(p+'.new',JSON.stringify(body,null,2)+'\n');renameSync(p+'.new',p)}
function normal(rt){const s=JSON.parse(JSON.stringify(rt.exportState()));for(const q of s.snapshots||[])delete q.timestamp;return s;}
function runtime(state){const rt=new AmeliaNumogramSubstrateRuntime();rt.setSuppressRelaySteering(true);if(state)rt.importState(state);
 assert.deepEqual(rt.getQabbala().getGates().filter(e=>e.isOpen).map(e=>[e.source,e.target]),scope.eligibility.directedEdges);
 return rt;}
function signal(k,i){const v=verified.records[k].randomness;assert(/^[a-f0-9]{64}$/.test(v));if(i===0)return v;
 const prefix=Buffer.from('DRIFT-1A-C1-REF-'+i+'|','ascii');
 return createHash('sha256').update(Buffer.concat([prefix,Buffer.from(v,'hex')])).digest('hex');}
assert.equal(verified.realBLSVerification,'PASS_ALL_72');
assert.equal(verified.mode,'ARCHIVED_ONLY_NO_LIVE_ADMISSION');
assert.equal(verified.records.length,72);
assert.equal(scope.constants.provenance.liveStartAuthorized,false);
const cmd=process.argv[2];
function appendLedger(ledger,body){const prev=ledger.length?ledger.at(-1).digest:'0'.repeat(64);const x={...body,previous:prev};x.digest=sha(x);ledger.push(x);}
function init(){
 assert(!existsSync(out+'/STATE.json'),'INIT_REPEATED');
 const arms=Array.from({length:9},(_,i)=>{
  const rt=runtime();return {id:i===0?'BASELINE':'REF'+String(i).padStart(2,'0'),events:0,
    state:normal(rt),zones:[rt.getCurrentZone()]};
 });
 put('STATE.json',{schema:'PF1_ARCHIVED_INTEGRATED_NINE_ARMS_V1',tick:0,arms,
  activeForks:[],nextJournalIndex:0,actualBeaconRoundsAdmitted:0,liveGenesis:null,
  verifiedArchiveDigest:verified.archiveRecordDigest,
  sealedConstantsHash:'ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610'});
 put('LEDGER.json',{schema:'PF1_ARCHIVED_DEVELOPMENT_LEDGER_V1',rows:[]});
 put('JOURNAL.json',{schema:'PF1_SYNTHETIC_INTEGRATION_FIXTURE_JOURNAL_V1',entries:[]});
 console.log('PF1_PRODUCTION_INIT',{arms:9,archived:72,realLive:0});
}
function stage(end){
 const st=jread('STATE.json'),l=jread('LEDGER.json');
 assert([12,48,72].includes(end));assert(end>=st.tick);
 assert.equal(l.rows.length,st.tick);
 for(let k=st.tick;k<end;k++){
  const record=verified.records[k];assert(record.recordIndex===k);
  assert.equal(record.round,verified.genesisR0+20*k);
  st.arms=st.arms.map((a,i)=>{const rt=runtime(a.state);assert.equal(rt.getMemory().getEvents().length,k);
   rt.step(signal(k,i));const state=normal(rt);
   assert.equal(state.memoryState.events.length,k+1);
   return {...a,events:k+1,state,zones:[...a.zones,rt.getCurrentZone()]};
  });
  appendLedger(l.rows,{tick:k+1,archivedRound:record.round,
   archivedSignatureSha256:sha(record.signature),armDigests:st.arms.map(a=>sha(a.state)),
   noLive:true,admission:'ARCHIVED_C1_BLS_VERIFIED_OFFLINE'});
  st.tick=k+1;
 }
 if(end===12||end===48){
  const rt=runtime(st.arms[0].state);
  const id='PF1-TEST-FORK-'+end;
  if(!st.activeForks.some(x=>x.id===id))st.activeForks.push({
   id,status:'PENDING_FUTURE_ARCHIVED_RECEIPTS',
   checkpointTick:end,checkpoint:normal(rt),expiresAt:end+24,
   pairedAnchor:8,pairedTurn:9,
   syntheticTestFixture:true,neverJournalAsAmeliaEncounter:true});
 }
 put('STATE.json',st);put('LEDGER.json',l);
 console.log('PF1_PRODUCTION_STAGE',JSON.stringify({end,arms:st.arms.length,depth:st.arms[0].events,
  pending:st.activeForks.filter(x=>x.status.startsWith('PENDING')).map(x=>x.id)}));
}
function confirm(){
 const st=jread('STATE.json'),j=jread('JOURNAL.json');
 const pending=st.activeForks.filter(x=>x.status.startsWith('PENDING'));
 let processed=0;
 for(const p of pending){
  if(st.tick<p.expiresAt){continue;}
  // Read exactly the 24 already verified archived rounds that became
  // available in later workflow invocations. No speculative future tape.
  const upcoming=Array.from({length:24},(_,i)=>p.checkpointTick+i);
  assert(upcoming.every(k=>k<st.tick));
  const tape=upcoming.map(k=>signal(k,0));
  const branches={};
  for(const arm of ['intact','reset','suppress','sham']){
   const rt=runtime(p.checkpoint);
   if(arm==='reset')rt.getMemory().reset();
   if(arm==='suppress')rt.getQabbala().getZones()[p.pairedTurn].activation*=0.1;
   const trace=[rt.getCurrentZone()];
   for(let t=1;t<=24;t++){const str=inputsForTick({kind:'inputDelay'},t,tape);rt.step(str);trace.push(rt.getCurrentZone());}
   branches[arm]={zoneTrace:trace,terminalStateSha256:sha(normal(rt))};
  }
  assert.deepEqual(branches.intact,branches.sham);
  // Test fixture only. Do not award an encounter irrespective of measured trajectory.
  const predecessor=j.entries.length?j.entries.at(-1).digest:'0'.repeat(64);
  const body={schema:'PF1_TEST_JOURNAL_ENTRY_NOT_ENCOUNTER_V1',index:j.entries.length,
   previous:predecessor,fixtureId:p.id,checkpointTick:p.checkpointTick,
   confirmationTick:st.tick,archivedRounds:upcoming.map(k=>verified.records[k].round),
   sourceCheckpointDigest:sha(p.checkpoint),branchDigests:Object.fromEntries(Object.entries(branches).map(([k,v])=>[k,v.terminalStateSha256])),
   within24Ticks:true,shamParity:true,live:false,synthetic:true,scientificEncounter:false,
   effectiveSignatureMeasurement:{candidatePair:'8-9',nullRule:'sealed PF1-A1 R2; no discovery claim'},
   times:{detectedSyntheticMinute:p.checkpointTick,confirmedSyntheticMinute:st.tick,
    timestampTokenClock:'external at signing'}};
  j.entries.push({...body,digest:sha(body)});
  p.status='TEST_FIXTURE_CONFIRMED_PENDING_RFC3161';
  p.journalIndex=j.entries.length-1;
  processed++;
 }
 put('STATE.json',st);put('JOURNAL.json',j);
 console.log('PF1_PRODUCTION_CONFIRM',JSON.stringify({tick:st.tick,processed,entries:j.entries.length,
  stillPending:st.activeForks.filter(x=>x.status.startsWith('PENDING')).length}));
}
function verify(){
 const st=jread('STATE.json'),l=jread('LEDGER.json'),j=jread('JOURNAL.json');
 assert.equal(l.rows.length,st.tick);assert.equal(st.actualBeaconRoundsAdmitted,0);
 assert.equal(st.liveGenesis,null);assert.equal(st.arms.length,9);
 assert(st.arms.every(a=>a.events===st.tick&&a.state.memoryState.events.length===st.tick));
 let h='0'.repeat(64);
 for(const row of l.rows){assert.equal(row.previous,h);const {digest,...rest}=row;assert.equal(digest,sha(rest));h=digest}
 h='0'.repeat(64);
 for(const row of j.entries){assert.equal(row.previous,h);const {digest,...rest}=row;assert.equal(digest,sha(rest));h=digest;assert.equal(row.scientificEncounter,false)}
 assert(j.entries.length<=2);
 const proof={schema:'PF1_PRODUCTION_DRYRUN_CHECKPOINT_V1',tick:st.tick,armCount:st.arms.length,
  independentlyCarriedPFM:true,receiptCount:st.tick,
  inputKind:'ARCHIVED_VERIFIED_BLS_NOT_LIVE',liveRounds:0,
  ledgerHead:l.rows.at(-1)?.digest??null,journalHead:j.entries.at(-1)?.digest??null,
  entries:j.entries.length,checkpointSha256:sha(st),noGenesis:true,scientificConstantsUnchanged:true};
 put('VERIFY.json',proof);console.log('PF1_PRODUCTION_VERIFY',JSON.stringify(proof));
}
function replay(){
 const st=jread('STATE.json'),l=jread('LEDGER.json');
 const arms=Array.from({length:9},()=>runtime());
 const rowDigests=[];
 for(let k=0;k<st.tick;k++){
  for(let i=0;i<9;i++)arms[i].step(signal(k,i));
  rowDigests.push(arms.map(rt=>sha(normal(rt))));
 }
 assert.equal(rowDigests.length,st.tick);
 for(let k=0;k<st.tick;k++){
  assert.deepEqual(rowDigests[k],l.rows[k].armDigests,'INDEPENDENT_REPLAY_ROW_MISMATCH '+k);
 }
 for(let i=0;i<9;i++)assert.deepEqual(normal(arms[i]),st.arms[i].state,'STATE_REPLAY_MISMATCH '+i);
 const journal=jread('JOURNAL.json');
 assert.equal(journal.entries.length,2,'TWO_INDEPENDENT_PERSISTENT_FIXTURE_CONFIRMATIONS_REQUIRED');
 console.log('PF1_PRODUCTION_CROSS_JOB_INDEPENDENT_REPLAY',JSON.stringify({
  rows:l.rows.length,arms:9,allDigestsExact:true,testEntries:journal.entries.length,
  liveRounds:0}));
}

if(cmd==='init')init();
else if(cmd==='stage')stage(Number(process.argv[3]));
else if(cmd==='confirm')confirm();
else if(cmd==='verify')verify();
else if(cmd==='replay')replay();
else throw Error('usage init|stage 12/48/72|confirm|verify');
