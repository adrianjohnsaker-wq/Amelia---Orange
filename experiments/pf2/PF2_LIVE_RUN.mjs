/** PF2 approved-only live BLS inbox staging: no irreversible writes until
 * independently signed batch receipt. No fetch, no lease acquisition, no email.
 * Reuses C1/PF1 verified receipt format; scientific engine is gold-faithful.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PF2NinePairs} from './PF2_RECEIVER_CORE.mjs';
import {PF2Pandemonium} from './PF2_PANDEMONIUM.mjs';
const root='experiments/pf2/live/';
const sha=x=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
const get=n=>JSON.parse(readFileSync(root+n,'utf8'));
assert.equal(process.env.PF2_GENESIS_OPERATOR_APPROVED,'true','PF2_GENESIS_MISSING_AUTH');
assert.equal(process.env.PF2_LIVE_ADMISSION_OPERATOR_AUTHORISED,'true','PF2_LIVE_OPERATOR_AUTH_MISSING');
assert.equal(process.env.PF2_REMOTE_SHARED_LEASE_ACKNOWLEDGED,'true','PF2_SHARED_LEASE_MISSING');
assert.equal(process.env.DRIFT_C1_ENABLE_LIVE,'false','C1_MUST_REMAIN_UNMODIFIED');
const genesis=get('GENESIS.json'),state=get('STATE.json');
const inbox=JSON.parse(readFileSync(process.env.PF2_LIVE_INBOX,'utf8'));
assert.equal(genesis.schema,'PF2_LIVE_GENESIS_V1');
assert.equal(state.status,'running');
assert.equal(genesis.genesisDigest,state.genesisDigest);
assert.equal(inbox.genesisDigest,genesis.genesisDigest);
assert.equal(inbox.schema,'PF2_TRANSIENT_VERIFIED_INBOX_V1');
assert.equal(inbox.liveVerified,true);
assert.equal(inbox.noNotifications,true);
assert.equal(inbox.startingTick,state.admittedTicks);
assert(inbox.count>=0&&inbox.count<=20);
assert.equal(inbox.receipts.length,inbox.count);
assert.equal(state.engine.tick,state.admittedTicks);
const engine=new PF2NinePairs(state.engine);
const pandemonium=new PF2Pandemonium(state.pandemonium);
let previous=state.headDigest;
const rows=[];
for(let j=0;j<inbox.count;j++){
 const r=inbox.receipts[j],tick=state.admittedTicks+j;
 assert.equal(r.tick,tick);
 assert.equal(r.round,genesis.R0+20*tick);
 assert.equal(r.source,'C1_PF1_PINNED_QUICKNET_BLS_VERIFIED');
 assert.match(r.randomness,/^[0-9a-f]{64}$/);
 assert.match(r.signature,/^[0-9a-f]+$/i);
 assert.equal(sha(Buffer.from(r.signature,'hex')),r.randomness);
 const processed=engine.processVerified(r.round,r.randomness);
 const det=pandemonium.onTick(r,processed.events,engine.receivers);
 assert.equal(processed.tick,tick+1);
 assert.equal(processed.events.length,18);
 const body={tick,round:r.round,randomness:r.randomness,
  signature:r.signature,roundTime:r.roundTime,
  verification:'REAL_QUICKNET_BLS_VERIFIED_WITH_PINNED_C1_PF1',
  armEvents:processed.events,pandemoniumExposure:det.exposures,
  createdForkIDs:det.createdForkIDs,confirmedEncounters:det.confirmed,previous};
 const digest=sha(body);
 rows.push({...body,digest});
 previous=digest;
}
const next={...state,engine:engine.exportState(),pandemonium:pandemonium.exportState(),
 admittedTicks:state.admittedTicks+inbox.count,
 lastAdmittedRound:inbox.count?inbox.receipts.at(-1).round:state.lastAdmittedRound,
 headDigest:previous,
 sealedBatchCount:state.sealedBatchCount+(inbox.count?1:0)};
assert.equal(next.engine.tick,next.admittedTicks);
const pending={schema:'PF2_PENDING_VERIFIED_BATCH_V1',
 genesisDigest:genesis.genesisDigest,
 startTick:state.admittedTicks,count:inbox.count,previousHead:state.headDigest,
 finalHead:previous,rows,proposedNextState:next,
 noNotifications:true,PF1StateMutated:false,C1StateMutated:false};
writeFileSync(process.env.PF2_PENDING_BATCH,JSON.stringify(pending,null,2)+'\n');
console.log('PF2_STAGED_VERIFIED_18_LINEAGE_BATCH_NOT_YET_ADMITTED',
 JSON.stringify({startTick:state.admittedTicks,count:inbox.count,
  nextTick:next.admittedTicks,head:previous,
  zeroNewEventsMeansNoStateChange:inbox.count===0}));
