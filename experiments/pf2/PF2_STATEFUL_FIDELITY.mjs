/** PF2 independent STATEFUL implementation fidelity, not live inflow.
 * Verifies golden normative output for both modes and k=0,1 at 20k,
 * plus nine-pair deterministic state export/import and PF2 domain mapping.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PF2ReceiverLineage,PF2NinePairs} from './PF2_RECEIVER_CORE.mjs';
import {pf2InputForArm} from './PF2_REFERENCE_INPUT.mjs';
const sha=s=>createHash('sha256').update(s).digest('hex');
const summary=[];
for(const mode of ['learner','unchanged']){
 const expect=JSON.parse(readFileSync('experiments/pf2/gold_'+mode+'.json','utf8'));
 for(const k of [0,1]){
  const l=new PF2ReceiverLineage({armId:k===0?'C':'R01',k,mode});
  const trace=createHash('sha256');
  for(let tick=1;tick<=20000;tick++){
   const e=l.process('GOLD|'+k+'|'+tick,tick,1000000+tick);
   trace.update(tick+':'+e.toZone+';');
  }
  const digest=trace.digest('hex'),gold=expect.lineages[k];
  assert.equal(digest,gold.traceSha256,'PF2_CORE_GOLD_DIGEST_MISMATCH_'+mode+'_'+k);
  assert.deepEqual(l.lives,gold.lives,'PF2_CORE_GOLD_LIVES_MISMATCH');
  assert.deepEqual(l.choices,gold.choice,'PF2_CORE_GOLD_CHOICES_MISMATCH');
  assert.equal(20000-l.birthTick,gold.openLife);
  const v=Object.fromEntries(Object.entries(l.V).map(([e,x])=>[e,Number(x.toFixed(6))]));
  assert.deepEqual(v,gold.finalV,'PF2_CORE_FINAL_V_MISMATCH');
  summary.push({mode,k,digest,finalV:k===0&&mode==='learner'?v:undefined,
    deaths:l.lives.length});
  console.log('PF2_STATEFUL_CORE_GOLD',mode,k,'PASS',digest);
 }
}
assert.equal(summary.length,4);
const rnd=sha('PF2-SYNTHETIC-ONLY-NO-BEACON');
const a=new PF2NinePairs(),b=new PF2NinePairs();
const inputs=Array.from({length:120},(_,i)=>sha('PF2-RESTART-SYNTHETIC-'+i));
for(let i=0;i<120;i++){
 const x=a.processVerified(32000000+i*20,inputs[i]);
 if(i<60)b.processVerified(32000000+i*20,inputs[i]);
}
const saved=b.exportState();
const restored=new PF2NinePairs(saved);
for(let i=60;i<120;i++)restored.processVerified(32000000+i*20,inputs[i]);
assert.deepEqual(restored.exportState(),a.exportState(),
 'PF2_18_LINEAGES_REPLAY_RECOVERY_NOT_BYTE_IDENTICAL');
for(let k=0;k<9;k++){
 const a1=a.receivers[2*k],c=a.receivers[2*k+1];
 assert.equal(a1.lastTick,120);assert.equal(c.lastTick,120);
 assert(a1.V&&Object.keys(a1.V).length===11);
 assert(Object.values(c.V).every(x=>x===0));
 const x=pf2InputForArm(rnd,k);
 assert.match(x,/^[0-9a-f]{64}$/);
 if(k===0)assert.equal(x,rnd);
 else assert.notEqual(x,rnd);
}
console.log('PF2_STATE_RESTORE_18_LINEAGES_EXACT_PASS',{ticks:120,arms:9});
console.log('PF2_FIDELITY_GATE_CORE_PASS_ALL_FOUR_REFERENCE_DIGESTS_EXACT_V_AND_18_RECEIVER_REPLAY');
