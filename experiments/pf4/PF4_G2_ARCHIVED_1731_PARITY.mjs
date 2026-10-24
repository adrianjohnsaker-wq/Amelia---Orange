/**
 * PF4 G2: read-only independent parity on the FROZEN 1,731 committed PF2
 * Quicknet ticks present on PF4 design branch. NO NETWORK, NO FUTURE ROUNDS.
 * Uses a separately implemented arm input mapping and independently
 * implemented V update with the Studio runtime_mirror.
 * Separately compares to PF2NinePairs replay and each original archived event.
 *
 * Limitation: this checks deterministic parity/provenance against committed
 * archives, not independent BLS verification or the uncommitted operator
 * adapter/calibration package. The PF2 live verifier owns the BLS receipts.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {PF2NinePairs,PF2_ARMS,PF2_EDGES} from '../pf2/PF2_RECEIVER_CORE.mjs';
import {pf2InputForArm} from '../pf2/PF2_REFERENCE_INPUT.mjs';
import {AmeliaNumogramSubstrateRuntime as StudioRuntime}
 from '../studio/runtime_mirror/substrate/ameliaNumogramSubstrateRuntime.ts';

const sha=b=>createHash('sha256').update(b).digest('hex');
const A='experiments/pf2/live/';
const G=JSON.parse(readFileSync(A+'GENESIS.json','utf8'));
const N=1731, H=24, ETA=1/8, WV=.5, EDGES=PF2_EDGES;
const zero=()=>Object.fromEntries(EDGES.map(e=>[e,0]));
const key=(a,b)=>a+'>'+b;
const independentArm=(random,k)=>{
 assert(/^[0-9a-f]{64}$/i.test(random)&&Number.isInteger(k)&&k>=0&&k<=8);
 const bytes=Buffer.from(random,'hex');
 if(k===0)return Buffer.from(bytes).toString('hex');
 const prefix=Buffer.from('PF2-REF-'+k+'|','ascii');
 return sha(Buffer.concat([prefix,bytes]));
};
const cueOf=x=>parseInt(sha(x.trim()).slice(0,2),16)%10;
function finalExcursion(z){
 const ta=z.length-1;
 for(let t=Math.max(0,ta-H);t<ta;t++){
  const th=new Set(t>0?z.slice(Math.max(0,t-H),t):[z[0]]);
  if(th.has(z[t+1]))continue;
  let ok=true;
  for(let u=t+1;u<=ta;u++)if(th.has(z[u])){ok=false;break}
  if(ok){const e=new Set();for(let u=t;u<ta;u++)e.add(key(z[u],z[u+1]));return [...e]}
 }
 return [key(z[ta-1],z[ta])];
}
function refrain(z,t){
 const th=new Set(t>0?z.slice(Math.max(0,t-H),t):[z[0]]);
 if(th.has(z[t+1]))return 0;
 for(let s=t+2;s<=t+H;s++)if(th.has(z[s])){
  const prev=new Set();
  for(let u=Math.max(0,t-H);u<t;u++)prev.add(key(z[u],z[u+1]));
  const exc=new Set();for(let u=t;u<s;u++)exc.add(key(z[u],z[u+1]));
  let n=0;for(const e of exc)if(!prev.has(e))n++;
  return n/11;
 }
 return 0;
}
const names=readdirSync(A+'chunks').filter(x=>/^\d{8}\.json$/.test(x)).sort();
let rows=[],previous=G.genesisDigest,chunkCount=0;
for(const name of names){
 if(rows.length===N)break;
 const c=JSON.parse(readFileSync(A+'chunks/'+name,'utf8'));
 assert.equal(c.startTick,rows.length,'CONTIGUOUS_ARCHIVE_CHUNKS');
 assert.equal(c.previousHead,previous,'CHUNK_HEAD_LINK_MISMATCH');
 if(rows.length+c.rows.length>N)throw Error('HISTORICAL_PREFIX_CUTS_CHUNK: need exact 1731 prefix');
 for(const row of c.rows){
  assert.equal(row.tick,rows.length,'NONCONTIGUOUS_ARCHIVE_TICK');
  assert.equal(row.round,G.R0+20*row.tick,'WRONG_QUICKNET_STRIDE');
  assert.equal(row.previous,previous,'ROW_CHAIN_BROKEN');
  assert.match(row.randomness,/^[0-9a-f]{64}$/i);
  assert.equal(row.armEvents.length,18,'WRONG_NUMBER_OF_EVENTS');
  for(let k=0;k<9;k++){
   assert.equal(row.armEvents[2*k].armId,PF2_ARMS[k]);
   assert.equal(row.armEvents[2*k].mode,'learner');
   assert.equal(row.armEvents[2*k+1].mode,'unchanged');
  }
  previous=row.digest;rows.push(row);
 }
 assert.equal(previous,c.finalHead);
 chunkCount++;
}
assert.equal(rows.length,N,'PREFIX_NOT_FULLY_ARCHIVED');
assert.equal(names.filter(x=>/^\d{8}\.json$/.test(x)).length,95,
 'FROZEN_BRANCH_CHANGED_PREFIX_CHUNK_COUNT');
const archivedPrefixDigest=sha(rows.map(r=>r.round+'|'+r.randomness+'|'+r.digest).join('\n'));
const norm=new PF2NinePairs();
for(const row of rows){
 const e=norm.processVerified(row.round,row.randomness);
 assert.deepEqual(e.events,row.armEvents,'ARCHIVED_PF2_REPLAY_EVENT_MISMATCH_TICK_'+row.tick);
}
const independent=[];
let parityEvents=0,mappingChecks=0,bitChecks=0;
for(let k=0;k<9;k++){
 let V=zero(),r,z,born=0,deaths=0;
 const trace=createHash('sha256');
 const birth=t=>{
  r=new StudioRuntime();
  r.exitBonus=(a,b)=>WV*V[key(a,b)];
  z=[r.getCurrentZone()];born=t;
 };
 birth(0);
 for(const row of rows){
  const tick=row.tick+1,input=independentArm(row.randomness,k);
  assert.equal(input,pf2InputForArm(row.randomness,k),
   'ARM_MAPPING_DISAGREEMENT_'+k+'_'+tick);
  mappingChecks++;
  const original=row.armEvents[2*k],from=z.at(-1);
  assert.equal(original.cueZone,cueOf(input),'CUE_DISAGREEMENT');
  assert.equal(original.fromZone,from,'STUDIO_FROM_DISAGREEMENT');
  const to=r.step(input).lastTransition.to;
  assert.equal(to,original.toZone,
   'STUDIO_TO_DISAGREEMENT_k'+k+'_tick'+tick);
  z.push(to);
  trace.update(tick+':'+to+';');
  if(to===5){
   const fin=finalExcursion(z);
   assert.deepEqual(fin,original.death.finalExcursion,'FATAL_EXCURSION_DISAGREEMENT');
   for(const e of fin)V[e]+=ETA*(-1-V[e]);
   deaths++;birth(tick);
  }else{
   const i=z.length-1,t=i-H;
   if(t>=0){
    const e=key(z[t],z[t+1]);
    const o=refrain(z,t);
    assert.equal(original.refrainOutcome?.settledStep,t,
     'SETTLEMENT_OFFSET_MISMATCH');
    assert.equal(original.refrainOutcome?.outcome,o,
     'SETTLEMENT_VALUE_MISMATCH');
    if(e in V)V[e]+=ETA*(o-V[e]);
   }
  }
  parityEvents++;
 }
 const reference=norm.receivers[2*k];
 const values=[];
 for(const edge of EDGES){
  // Exact equality of doubles includes signed zero, not just string formatting.
  assert(Object.is(V[edge],reference.V[edge]),
   'FULL_IEEE754_VALUE_MISMATCH_'+k+'_'+edge+':'+V[edge]+'!='+reference.V[edge]);
  const raw=Buffer.allocUnsafe(8),expected=Buffer.allocUnsafe(8);
  raw.writeDoubleLE(V[edge]);expected.writeDoubleLE(reference.V[edge]);
  assert.deepEqual(raw,expected,'BITWISE_FLOAT_MISMATCH_'+k+'_'+edge);
  bitChecks++;
  values.push(raw.toString('hex'));
 }
 const liveDeaths=reference.lives.length;
 assert.equal(deaths,liveDeaths,'LINEAGE_DEATHS_MISMATCH_'+k);
 // PF2 stores trace per archived individual event; studio SHA of path must be
 // computed independently but not compared to PF2's different trace convention.
 independent.push({arm:PF2_ARMS[k],k,deathCount:deaths,
   codeBitDigest:sha(values.join('|')),code:V,studioTraceSha256:trace.digest('hex')});
}
assert.equal(bitChecks,99);
const result={schema:'PF4_G2_ARCHIVED_1731_BITWISE_PARITY_V1',
 status:'PASS_ARCHIVED_PREFIX_ONLY_NOT_NEW_OPERATOR_PACKAGE_NOT_PF4_SEAL',
 base:'PF4 DESIGN BRANCH WITH EXACTLY 1731 COMMITTED TICKS',
 G, // OMIT BEFORE WRITING - genesis is already public, but report compact only
 records:{verifiedPublishedTicks:rows.length,chunks:chunkCount,
  independentArmMapChecks:mappingChecks,
  studioComparedEvents:parityEvents,wholeIEEE754Checks:bitChecks,
  normativeEventChecks:rows.length*18,
  firstRound:rows[0].round,lastRound:rows.at(-1).round,
  archivedPrefixDigest},
 code:independent,provenance:{
  bLSVerifiedAgainInThisTest:false,requiresOriginalPF2Verifier:true,
  touchedLivePF2:false,usesOnlyCommittedPastRounds:true,
  readsFutureRounds:false,
  source:'experiments/pf2/live/chunks/*.json'}};delete result.G;
const dest=resolve(process.argv[2]||'/tmp/pf4-g2');
assert(dest.startsWith('/tmp/')||dest.startsWith('/mnt/data/'));
mkdirSync(dest,{recursive:true});
writeFileSync(join(dest,'PF4_G2_1731_PARITY.json'),JSON.stringify(result,null,2)+'\n');
console.log('PF4_G2_PUBLISHED_1731_BITWISE_PARITY_PASS '+JSON.stringify({
 ...result.records,status:result.status,
 codes:independent.map(x=>({k:x.k,codeBitDigest:x.codeBitDigest,deaths:x.deathCount}))}));
