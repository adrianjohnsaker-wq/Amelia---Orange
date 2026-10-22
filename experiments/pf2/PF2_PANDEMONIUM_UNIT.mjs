/** Offline-only PF2/PF1 detector integration; no genuine beacon, no genesis. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {PF2NinePairs} from './PF2_RECEIVER_CORE.mjs';
import {PF2Pandemonium} from './PF2_PANDEMONIUM.mjs';
const sha=s=>createHash('sha256').update(s).digest('hex');
const inputs=Array.from({length:120},(_,i)=>sha('PF2-SYNTHETIC-PANDEMONIUM-UNIT-'+i));
const round=i=>33158540+20*i;
const a=new PF2NinePairs(),pa=new PF2Pandemonium();
const b=new PF2NinePairs(),pb=new PF2Pandemonium();
for(let i=0;i<120;i++){
 const randomness=inputs[i],r=round(i);
 const ea=a.processVerified(r,randomness);
 const da=pa.onTick({tick:i,round:r,randomness},ea.events,a.receivers);
 assert.equal(Object.keys(da.exposures).length,18);
 if(i<60){
  const eb=b.processVerified(r,randomness);
  const db=pb.onTick({tick:i,round:r,randomness},eb.events,b.receivers);
  assert.deepEqual(da,db);
 }
}
const bb=new PF2NinePairs(b.exportState());
const qb=new PF2Pandemonium(pb.exportState());
for(let i=60;i<120;i++){
 const randomness=inputs[i],r=round(i);
 const eb=bb.processVerified(r,randomness);
 const db=qb.onTick({tick:i,round:r,randomness},eb.events,bb.receivers);
 assert.equal(Object.keys(db.exposures).length,18);
}
assert.deepEqual(bb.exportState(),a.exportState());
assert.deepEqual(qb.exportState(),pa.exportState());
assert.equal(pa.exportState().schema,'PF2_PANDEMONIUM_STATE_V1');
assert(pa.exportState().encounters.every(x=>x.notificationsSent===0));
console.log('PF2_PF1_SCANNER_AND_18_PAIR_RESTART_REPLAY_PASS',
 JSON.stringify({ticks:120,receiverEvents:2160,confirmed:pa.encounters.length,
  retainedHistory:pa.history.length,noNotifications:true,source:'synthetic fixture only'}));
