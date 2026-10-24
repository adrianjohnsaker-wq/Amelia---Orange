/**
 * PF4 G3c — independent spot-check reconstruction from public frozen PF2.
 *
 * NO forecast, future beacon, or prospective test.
 * Input for one synthetic world is SHA256(UTF8("PF4-NULL|<seed>|<tick>"))
 * for t=1,...,20160; then exact pf2InputForArm for 9 lineages.
 * Results are diagnostic only and NOT a substitute for user's 900-row package.
 *
 * Compare static zero, Vstar, Vstar[k+1] and Vstar[k-1], because the
 * operator's shift direction has NOT yet been verified from their code.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {PF2_EDGES,PF2_ARMS,PF2ReceiverLineage} from '../pf2/PF2_RECEIVER_CORE.mjs';
import {pf2InputForArm} from '../pf2/PF2_REFERENCE_INPUT.mjs';
const H=x=>createHash('sha256').update(x).digest('hex');
const source='experiments/studio/outputs/loop/Vstar.json';
const raw=readFileSync(source);
const digest=H(raw);
assert.equal(digest,'de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925');
const vstar=JSON.parse(raw.toString('utf8'));
assert.equal(vstar.length,9);
const kinds=['vstar','vstar_shift_plus1','vstar_shift_minus1','zero'];
const F={};
for(const kind of kinds){
 F[kind]=PF2_ARMS.map((armId,k)=>{
  const L=new PF2ReceiverLineage({armId,k,mode:'learner'});
  const src=kind==='vstar'?k:kind==='vstar_shift_plus1'?(k+1)%9:
    kind==='vstar_shift_minus1'?(k+8)%9:-1;
  const initial=src<0?Object.fromEntries(PF2_EDGES.map(e=>[e,0])):vstar[src];
  assert.deepEqual(Object.keys(initial).sort(),[...PF2_EDGES].sort());
  L.V={...initial};
  return {L,initial:{...initial},visits4:0,deaths:0};
 });
}
const N=20160,seed=1000;
let inputDigest=createHash('sha256');
for(let t=1;t<=N;t++){
 const b=H('PF4-NULL|'+seed+'|'+t);
 inputDigest.update(b);
 const mapped=PF2_ARMS.map((_,k)=>pf2InputForArm(b,k));
 for(const kind of kinds){
  const entries=F[kind];
  for(let k=0;k<9;k++){
   const x=entries[k];
   const ev=x.L.process(mapped[k],t,t);
   x.visits4+=Number(ev.fromZone===4);
   x.deaths+=Number(!!ev.death);
  }
 }
 if(t%5040===0)console.log('PF4_G3C_SPOT_PROGRESS',t,N);
}
const report={
 schema:'PF4_G3C_OPERATOR_SPOT_RECONSTRUCTION_V1',
 source:'DETERMINISTIC_SYNTHETIC_SHA256_NOT_DRAND',
 seed,
 ticks:N,
 codeDigest:digest,
 inputDigest:inputDigest.digest('hex'),
 receiver:'FROZEN_PF2_RECEIVER_CORE',
 armInput:'FROZEN_PF2_REFERENCE_INPUT',
 prospective:false,
 results:{}
};
for(const kind of kinds){
 const arr=F[kind];
 const abs=[];
 for(let k=0;k<9;k++)for(const e of PF2_EDGES)
  abs.push(Math.abs(arr[k].L.V[e]-arr[k].initial[e]));
 const maxima=PF2_EDGES.map(e=>({
  edge:e,
  max:Math.max(...arr.map(x=>Math.abs(x.L.V[e]-x.initial[e])))
 }));
 report.results[kind]={
  R_all:Math.max(...abs),
  R_active:Math.max(...maxima.filter(x=>x.edge!=='3>6').map(x=>x.max)),
  deaths:arr.reduce((n,x)=>n+x.deaths,0),
  zone4Visits:arr.reduce((n,x)=>n+x.visits4,0),
  perEdgeMaxima:maxima,
  perLineageR:arr.map(x=>Math.max(...PF2_EDGES.map(e=>Math.abs(x.L.V[e]-x.initial[e])))),
  finalCodeDigest:H(JSON.stringify(arr.map(x=>x.L.V)))
 };
}
const expected={
 vstar:{R_all:.09772266196640947,deaths:3,zone4Visits:391},
 zero:{R_all:.487091064453125,deaths:31,zone4Visits:215}
};
report.operatorSpotChecks={};
for(const kind of ['vstar','zero']){
 const got=report.results[kind],want=expected[kind];
 report.operatorSpotChecks[kind]={
  provided:want,
  reproduced:{
   R_all:Object.is(got.R_all,want.R_all),
   deaths:got.deaths===want.deaths,
   zone4Visits:got.zone4Visits===want.zone4Visits
  }
 };
}
const dir=resolve(process.argv[2]||'/tmp/pf4-g3c');
assert(dir.startsWith('/tmp/')||dir.startsWith('/mnt/data/'));
mkdirSync(dir,{recursive:true});
writeFileSync(join(dir,'PF4_G3C_SPOT_SEED_1000.json'),JSON.stringify(report,null,2)+'\n');
console.log('PF4_G3C_SPOT_SEED_1000_RESULT',JSON.stringify({
 seed,details:report.operatorSpotChecks,
 values:Object.fromEntries(kinds.map(k=>[k,{
  R_all:report.results[k].R_all,deaths:report.results[k].deaths,zone4Visits:report.results[k].zone4Visits
 }])),
 notes:'A SHIFT direction matching user spot is diagnostic until operator source is reviewed'}));
