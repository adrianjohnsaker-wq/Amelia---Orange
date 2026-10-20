/** PF-1 journal assembly. Replay reuses sealed request times, not a new clock. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {sha,checkHashChain,simulatedAt} from './core.mjs';
const root='experiments/pf1/output';
const prepared=JSON.parse(readFileSync(root+'/encounter-prepared.json','utf8'));
const ledger=JSON.parse(readFileSync(root+'/exposure-ledger.json','utf8'));
assert(ledger.syntheticOnly);
const clockPath=root+'/seal-clock.json';
const clock=existsSync(clockPath)?JSON.parse(readFileSync(clockPath,'utf8')):
 {schema:'PF1_FIXED_SEAL_REQUEST_CLOCK_V1',
  times:prepared.map((_,i)=>new Date(Date.now()+i).toISOString())};
assert.equal(clock.times.length,prepared.length,'REPLAY_EVENT_COUNT_DRIFT');
if(!existsSync(clockPath))writeFileSync(clockPath,JSON.stringify(clock,null,2)+'\n');
mkdirSync(root+'/entries',{recursive:true});
let previousDigest='0'.repeat(64);
const rows=[];
for(let i=0;i<prepared.length;i++){
 const p=prepared[i];
 const body={
  schema:'PF1_ENCOUNTER_JOURNAL_V1',sequence:i+1,previousDigest,
  mode:p.arm,entity:p.entity,stepRange:p.stepRange,
  signatures:p.signatures,forkEvidence:p.forkEvidence,stateDigest:p.stateDigest,
  times:{candidateDetectedSyntheticUTC:simulatedAt(p.detectionStep),
   encounterConfirmedSyntheticUTC:simulatedAt(p.confirmationStep),
   sealRequestedRealUTC:clock.times[i]},
  provenance:{synthetic:true,realBeaconRoundsConsumed:0,liveGenesis:false}
 };
 const entryDigest=sha(JSON.stringify(body));
 const entry={...body,entryDigest};
 const line=JSON.stringify(entry)+'\n';
 writeFileSync(root+'/entries/entry-'+String(i+1).padStart(3,'0')+'.json',line);
 rows.push(entry);
 previousDigest=entryDigest;
}
checkHashChain(rows);
writeFileSync(root+'/journal.jsonl',rows.map(x=>JSON.stringify(x)).join('\n')+(rows.length?'\n':''));
writeFileSync(root+'/journal-head.json',JSON.stringify({entries:rows.length,lastDigest:previousDigest,
 journalSHA256:sha(readFileSync(root+'/journal.jsonl','utf8')),
 exposureLedgerSHA256:sha(readFileSync(root+'/exposure-ledger.json','utf8'))},null,2)+'\n');
console.log('PF1_JOURNAL_ASSEMBLED',rows.length,previousDigest);
