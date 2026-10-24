/**
 * PF4 G2 — independent Studio-mirror input adapter and source replay.
 * Existing VERIFIED PF2 chunks only. No network, no new admission, no schedule,
 * no live state/lease/source modification. The original studio runtime and PF2
 * source are IMPORTED unchanged. Runs Studio-style V updates independently.
 *
 * Run: node --experimental-strip-types --no-warnings
 *   experiments/pf4/PF4_G2_ARCHIVED_PREFIX_PARITY.mjs /tmp/pf4-g2
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {AmeliaNumogramSubstrateRuntime} from '../studio/runtime_mirror/substrate/ameliaNumogramSubstrateRuntime.ts';
import {PF2NinePairs,PF2_EDGES} from '../pf2/PF2_RECEIVER_CORE.mjs';
import {pf2InputForArm} from '../pf2/PF2_REFERENCE_INPUT.mjs';

const root='experiments/pf2/live/';
const sha=x=>createHash('sha256').update(x).digest('hex');
const read=x=>JSON.parse(readFileSync(x,'utf8'));
const W=.5,H=24,ETA=1/8,K=9;
const key=(a,b)=>a+'>'+b;
const cue=s=>parseInt(sha(s.trim()).slice(0,2),16)%10;
function independentlyMappedInput(raw,k){
 assert.match(raw,/^[0-9a-f]{64}$/);
 if(k===0)return raw;
 return sha(Buffer.concat([
  Buffer.from('PF2-REF-'+k+'|','ascii'), Buffer.from(raw,'hex')]));
}
function finalExcursion(z){
 const last=z.length-1;
 for(let t=Math.max(0,last-H);t<last;t++){
  const was=new Set(t>0?z.slice(Math.max(0,t-H),t):[z[0]]);
  if(was.has(z[t+1]))continue;
  if(z.slice(t+1,last+1).some(x=>was.has(x)))continue;
  return [...new Set(Array.from({length:last-t},(_,i)=>key(z[t+i],z[t+i+1])))];
 }
 return [key(z[last-1],z[last])];
}
function refrain(z,t){
 const context=new Set(t>0?z.slice(Math.max(0,t-H),t):[z[0]]);
 if(context.has(z[t+1]))return 0;
 for(let stop=t+2;stop<=t+H;stop++){
  if(!context.has(z[stop]))continue;
  const prior=new Set();
  for(let u=Math.max(0,t-H);u<t;u++)prior.add(key(z[u],z[u+1]));
  const excursion=new Set();
  for(let u=t;u<stop;u++)excursion.add(key(z[u],z[u+1]));
  let newEdges=0;
  for(const e of excursion)if(!prior.has(e))newEdges++;
  return newEdges/11;
 }
 return 0;
}
function lineage(){
 const l={V:Object.fromEntries(PF2_EDGES.map(e=>[e,0])),runtime:null,z:null,
 deaths:0,trace:createHash('sha256'),lifeStart:0};
 l.birth=(tick)=>{
  l.runtime=new AmeliaNumogramSubstrateRuntime();
  l.runtime.exitBonus=(a,b)=>W*l.V[key(a,b)];
  l.z=[l.runtime.getCurrentZone()];l.lifeStart=tick;
 };
 l.birth(0);
 return l;
}
const g=read(root+'GENESIS.json'),state=read(root+'STATE.json');
assert.equal(g.schema,'PF2_LIVE_GENESIS_V1');
assert.equal(state.schema,'PF2_LIVE_STATE_V1'); // exact status schema gate
assert(state.admittedTicks>0);
assert.equal(state.engine.tick,state.admittedTicks);
const names=readdirSync(root+'chunks').filter(x=>/^\d{8}\.json$/.test(x)).sort();
assert(names.length>0,'NO_PUBLISHED_ADMITTED_CHUNKS');
const canonical=new PF2NinePairs(),independent=Array.from({length:K},()=>lineage());
let ticks=0,correctedTransitions=0,strictFloatCells=0,deathCount=0,mapChecks=0;
let previous=g.genesisDigest;
for(const name of names){
 const chunk=read(root+'chunks/'+name);
 assert.equal(chunk.startTick,ticks,'CHUNK_START_NOT_CONTIGUOUS_'+name);
 assert.equal(chunk.previousHead,previous,'CHUNK_PREVIOUS_HEAD_MISMATCH_'+name);
 for(const row of chunk.rows){
  assert.equal(row.tick,ticks,'TICK_NOT_CONTIGUOUS');
  assert.equal(row.round,g.R0+20*ticks,'ROUND_NOT_STRIDE_ALIGNED');
  assert.match(row.randomness,/^[0-9a-f]{64}$/,'INVALID_PUBLIC_RANDOMNESS');
  assert.equal(sha(Buffer.from(row.signature,'hex')),row.randomness,'SIGNATURE_HASH_MISMATCH');
  assert.equal(row.previous,previous);
  // Read-only exact live PF2 replay for an independent cross-check.
  const replay=canonical.processVerified(row.round,row.randomness);
  assert.deepEqual(replay.events,row.armEvents,'LEDGER_REPLAY_EVENT_MISMATCH_'+ticks);
  for(let k=0;k<K;k++){
   const l=independent[k],event=row.armEvents[2*k];
   const input=independentlyMappedInput(row.randomness,k);
   assert.equal(input,pf2InputForArm(row.randomness,k),'ARM_INPUT_MAPPING_MISMATCH');
   mapChecks++;
   const from=l.z.at(-1),actualCue=cue(input);
   assert.equal(event.fromZone,from,'FROM_ZONE_PARITY_FAILED');
   assert.equal(event.cueZone,actualCue,'CUE_PARITY_FAILED');
   const to=l.runtime.step(input).lastTransition.to;
   l.z.push(to);l.trace.update((ticks+1)+':'+to+';');
   assert.equal(to,event.toZone,'INDEPENDENT_STUDIO_TRANSITION_MISMATCH_T'+ticks+'_K'+k);
   correctedTransitions++;
   if(to===5){
    assert(event.death!==null,'MISSING_DEATH_RECEIPT');
    const final=finalExcursion(l.z);
    assert.deepEqual(final,event.death.finalExcursion,'FATAL_EXCURSION_MISMATCH');
    for(const e of final)l.V[e]+=ETA*(-1-l.V[e]);
    l.deaths++;deathCount++;l.birth(ticks+1);
    assert.equal(event.refrainOutcome,null,'REFRAIN_AFTER_DEATH_NOT_ALLOWED');
   }else{
    assert.equal(event.death,null);
    const i=l.z.length-1,t=i-H;
    if(t>=0){
     const edge=key(l.z[t],l.z[t+1]);
     const outcome=refrain(l.z,t);
     if(PF2_EDGES.includes(edge))l.V[edge]+=ETA*(outcome-l.V[edge]);
     assert(event.refrainOutcome,'PENDING_REFRAIN_RECEIPT_MISSING');
     assert.equal(event.refrainOutcome.edge,edge);
     assert.equal(event.refrainOutcome.outcome,outcome);
     assert.equal(event.refrainOutcome.settledStep,t);
    }else assert.equal(event.refrainOutcome,null,'EARLY_REFRAIN_OUTCOME');
   }
   for(const e of PF2_EDGES){
    const expected=canonical.receivers[2*k].V[e];
    assert(Object.is(l.V[e],expected),'FLOAT64_V_PARITY_FAILED_T'+ticks+'_K'+k+'_E'+e+
     '_actual='+l.V[e]+'_expected='+expected);
    strictFloatCells++;
   }
  }
  previous=row.digest;ticks++;
 }
 assert.equal(previous,chunk.finalHead,'CHUNK_FINAL_HEAD_MISMATCH');
}
assert.equal(ticks,state.admittedTicks,'LIVE_STATE_TICK_COUNT_MISMATCH');
assert.equal(previous,state.headDigest,'LIVE_STATE_HEAD_MISMATCH');
const results=independent.map((l,k)=>{
 const original=state.engine.receivers[2*k];
 assert.equal(original.mode,'learner');
 assert.deepEqual(l.V,original.V,'FINAL_ARCHIVED_V_PARITY_FAILED_K'+k);
 assert.equal(l.deaths,original.lives.length);
 const digest=l.trace.digest('hex');
 return {k,armId:original.armId,code:l.V,codeSha256:sha(JSON.stringify(l.V)),
  traceSha256:digest,deaths:l.deaths,lastZone:l.z.at(-1)};
});
const out=resolve(process.argv[2]||'/tmp/pf4-g2');
assert(out.startsWith('/tmp/')||out.startsWith('/mnt/data/'),
 'OUTPUT_MUST_BE_OUTSIDE_REPOSITORY');
mkdirSync(out,{recursive:true});
const evidence={
 schema:'PF4_G2_PUBLISHED_ARCHIVE_STUDIO_PARITY_V1',
 status:'ENGINEERING_REPLAY_OF_ALREADY_PUBLISHED_AND_ADMITTED_ROUNDS_ONLY',
 repositorySourceCommit:process.env.GITHUB_SHA||null,
 sourceGenesisDigest:g.genesisDigest,
 sourceFinalHead:state.headDigest,
 ticks,firstRound:g.R0,lastRound:g.R0+20*(ticks-1),
 exactMappedInputChecks:mapChecks,
 exactIndependentTransitionChecks:correctedTransitions,
 float64VValueChecks:strictFloatCells,
 expectedFloatCellChecks:ticks*K*PF2_EDGES.length,
 deathCount,outputs:results,
 sourceAuthenticity:'REPLAY_ASSUMES_PREVIOUS_PF2_BLS_AND_RFC3161_VERIFIER',
 noPhysicalFutureBeaconRead:true,
 noScientificFilesWritten:true,
 noStatisticalOrTemporalClaims:true
};
writeFileSync(join(out,'PF4_G2_PUBLISHED_PREFIX_PARITY.json'),JSON.stringify(evidence,null,2)+'\n');
console.log('PF4_G2_INDEPENDENT_STUDIO_MIRROR_PUBLISHED_PREFIX_PARITY_PASS '+
 JSON.stringify({ticks,mapChecks,correctedTransitions,strictFloatCells,
 deathCount,genesis:g.genesisDigest,head:state.headDigest,
 noFutureFetch:true}));
