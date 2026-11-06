/** Offline end-to-end check; all input files are read-only fixtures. */
import {mkdtempSync,copyFileSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {verifyRecoveryJournal} from '../../src/outside/OutsideRecoveryJournal.ts';

const [statePath,ledgerPath]=process.argv.slice(2);
if(!statePath||!ledgerPath)throw Error('Supply a saved state and the matching ledger.');
const state0=JSON.parse(readFileSync(statePath,'utf8')).runtimeState;
const ledger0=JSON.parse(readFileSync(ledgerPath,'utf8'));
const temp=mkdtempSync(join(tmpdir(),'amelia-recovery-integration-'));
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const state=join(temp,'state.json'),ledger=join(temp,'ledger.json'),journal=join(temp,'recovery-journal.jsonl');
const args=['--import','./experiments/outside/recovery-test-fetch.mjs','--import','./node_modules/tsx/dist/loader.mjs',
  './experiments/outside/continuous-runner.ts',temp];
function run(extra:Record<string,string>) {
  const env={...process.env,OUTSIDE_PRE_REVISION:'d11cac2ec2e087ab6c6ea368be3b9d11f3ac976e',...extra};
  return spawnSync(process.execPath,args,{cwd:process.cwd(),env,encoding:'utf8',timeout:120000});
}
try {
  copyFileSync(statePath,state);copyFileSync(ledgerPath,ledger);
  const before=hash(state),missing=run({RUN_ID:'test-no-archive',OUTSIDE_PRE_ARCHIVE:''});
  assert.notEqual(missing.status,0);assert.match(missing.stderr,/pre-recovery archive branch is required/);assert.equal(hash(state),before);
  const first=run({RUN_ID:'test-first',OUTSIDE_PRE_ARCHIVE:'outside-pre-test',OUTSIDE_TEST_FEED:'none'});
  assert.equal(first.status,0,first.stderr);
  const second=run({RUN_ID:'test-second',OUTSIDE_PRE_ARCHIVE:'',OUTSIDE_TEST_FEED:'one'});
  assert.equal(second.status,0,second.stderr);
  const saved=JSON.parse(readFileSync(state,'utf8')),outputLedger=JSON.parse(readFileSync(ledger,'utf8'));
  const rawJournal=readFileSync(journal,'utf8'), lines=rawJournal.trim().split('\n').map(line=>JSON.parse(line).event);
  const offers=lines.filter(e=>e.kind==='OFFER');
  assert.equal(offers.length,11);assert.ok(offers.every(e=>e.originalOffer.offerStep===e.step));
  const admissions=lines.filter(e=>e.kind==='ADMISSION'&&e.wasDeferred).slice(0,state0.deferredEncounters.length);
  assert.deepEqual(admissions.map(e=>e.eventId),state0.deferredEncounters.map((e:{eventId:string})=>e.eventId));
  for(const a of admissions){
    const original=ledger0.records.find((r:any)=>r.event.eventId===a.eventId&&r.runtimeSignalDigest===a.sourceDigest);
    assert.ok(original);assert.equal(a.originalOffer.capturedAt,original.event.capturedAt);
    assert.equal(a.originalOffer.offerStep,original.snapshotAfter.step);
  }
  assert.deepEqual(saved.runtimeState.memoryState.events.slice(0,state0.memoryState.events.length).map((e:any)=>e.eventDigest),
    state0.memoryState.events.map((e:any)=>e.eventDigest));
  assert.equal(saved.runtimeState.deferredEncounters.length,0);
  assert.equal(outputLedger.records.length,ledger0.records.length+11);
  assert.equal(verifyRecoveryJournal(rawJournal).head,saved.governorRecovery.journalHead);
  const beforeTamper=hash(state);writeFileSync(journal,rawJournal.replace('CYCLE_START','CYCLE_TAMPER'));
  const tampered=run({RUN_ID:'test-tamper',OUTSIDE_PRE_ARCHIVE:'',OUTSIDE_TEST_FEED:'none'});
  assert.notEqual(tampered.status,0);assert.match(tampered.stderr,/Recovery journal chain invalid/);assert.equal(hash(state),beforeTamper);
  console.log(JSON.stringify({cycles:2,originalQueue:state0.deferredEncounters.length,
    originalOffersMatched:admissions.length,oldHistoryPreserved:state0.memoryState.events.length,
    newSourceRecords:11,newOfferReceipts:offers.length,finalQueue:0,journalTamperRejected:true,missingArchiveRejected:true}));
} finally {rmSync(temp,{recursive:true,force:true});}
