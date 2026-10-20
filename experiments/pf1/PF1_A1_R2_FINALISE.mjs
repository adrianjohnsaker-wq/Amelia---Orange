/** PF1-A1 R2 append-only style hash-chain assembly, repeatable with saved request clock. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {digest,OUT} from './PF1_A1_R2_SCORER.mjs';
const read=n=>JSON.parse(readFileSync(OUT+n,'utf8'));
const entries=read('encounter-prepared.json'),ledger=read('exposure-ledger.json');
assert.equal(ledger.syntheticOnly,true);
mkdirSync(OUT+'entries',{recursive:true});
const clockFile=OUT+'seal-clock.json';
const clock=existsSync(clockFile)?JSON.parse(readFileSync(clockFile,'utf8')):{
 schema:'PF1_A1_R2_REAL_SEAL_CLOCK_V1',
 times:entries.map((_,i)=>new Date(Date.now()+i).toISOString())
};
assert.equal(clock.times.length,entries.length,'PREPARED_ENTRIES_CHANGED_AFTER_SEAL_CLOCK');
if(!existsSync(clockFile))writeFileSync(clockFile,JSON.stringify(clock,null,2)+'\n');
let prev='0'.repeat(64);
const journal=[];
for(let i=0;i<entries.length;i++){
 const e=entries[i];
 const body={
  schema:'PF1_A1_R2_SYNTHETIC_ENCOUNTER_V1',index:i+1,previousDigest:prev,
  source:e.kind,entity:{name:e.entity,mesh:e.mesh,pair:e.pair,anchor:e.anchor,turn:e.turn},
  times:{detectionSyntheticUTC:new Date(Date.parse('2026-10-20T00:00:00.000Z')+e.detectionTick*60000).toISOString(),
   confirmationSyntheticUTC:new Date(Date.parse('2026-10-20T00:00:00.000Z')+e.confirmationTick*60000).toISOString(),
   sealRequestedRealUTC:clock.times[i]},
  stateDigest:e.stateDigest,measurements:e.evidence,
  provenance:{syntheticOnly:true,beaconRoundsConsumed:0,liveGenesis:false,
   constantsSha256:'ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610'}
 };
 const entryDigest=digest(JSON.stringify(body));
 const row={...body,entryDigest};
 writeFileSync(OUT+'entries/entry-'+String(i+1).padStart(3,'0')+'.json',JSON.stringify(row)+'\n');
 journal.push(row);prev=entryDigest;
}
let p='0'.repeat(64);
for(const row of journal){assert.equal(row.previousDigest,p);const {entryDigest,...body}=row;assert.equal(digest(JSON.stringify(body)),entryDigest);p=entryDigest}
writeFileSync(OUT+'journal.jsonl',journal.map(x=>JSON.stringify(x)).join('\n')+(journal.length?'\n':''));
const hashInfo={schema:'PF1_A1_R2_CHAIN_HEAD_V1',entries:journal.length,headDigest:prev,
 journalSha256:digest(readFileSync(OUT+'journal.jsonl')),ledgerSha256:digest(readFileSync(OUT+'exposure-ledger.json'))};
writeFileSync(OUT+'journal-head.json',JSON.stringify(hashInfo,null,2)+'\n');
console.log('PF1_A1_R2_JOURNAL',JSON.stringify(hashInfo));
