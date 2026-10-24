/**
 * PF4 G2: independently implemented studio-mode nine-lineage replay of all
 * ALREADY PUBLISHED, signed-and-admitted PF2 Quicknet chunks at the checkout.
 * Never calls the live endpoint, never writes to experiments/pf2 or studio.
 *
 * Runs against the studio runtime_mirror (its separate exitBonus hook)
 * and source-derived independent domain separation / V update logic.
 * Also cross-checks independently derived input with normative pf2InputForArm.
 *
 * Usage: node --experimental-strip-types --no-warnings
 *   experiments/pf4/PF4_G2_STUDIO_PREFIX_PARITY.mjs /tmp/pf4-g2
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {pf2InputForArm} from '../pf2/PF2_REFERENCE_INPUT.mjs';

const ROOT='experiments/pf2/live/';
const EDGES=['0>9','1>8','2>7','3>6','4>5','1>2','2>4','4>7','7>8','8>9','9>1'];
const OPEN={0:[9],1:[8,2],2:[7,4],3:[6],4:[5,7],5:[],6:[],7:[8],8:[9],9:[1]};
const H=24,ETA=1/8,WV=.5;
const key=(x,y)=>x+'>'+y,hash=b=>createHash('sha256').update(b).digest('hex');
const cue=x=>parseInt(hash(x.trim()).slice(0,2),16)%10;
const input=(hex,k)=> {
 assert.match(hex,/^[0-9a-f]{64}$/i);
 const raw=Buffer.from(hex,'hex');
 if(k===0)return raw.toString('hex');
 const h=createHash('sha256');h.update(Buffer.from('PF2-REF-'+k+'|','ascii'));h.update(raw);
 return h.digest('hex');
};
const f=path=>JSON.parse(readFileSync(path,'utf8'));
const zero=()=>Object.fromEntries(EDGES.map(x=>[x,0]));
const {AmeliaNumogramSubstrateRuntime}=await import(
  pathToFileURL(resolve('experiments/studio/runtime_mirror/substrate/ameliaNumogramSubstrateRuntime.ts')).href);

function finalExcursion(z){
 const ta=z.length-1;
 for(let t=Math.max(0,ta-H);t<ta;t++){
  const th=new Set(t>0?z.slice(Math.max(0,t-H),t):[z[0]]);
  if(th.has(z[t+1]))continue;
  let ok=true;for(let s=t+1;s<=ta;s++)if(th.has(z[s])){ok=false;break;}
  if(ok){const e=new Set();for(let s=t;s<ta;s++)e.add(key(z[s],z[s+1]));return [...e];}
 }
 return [key(z[ta-1],z[ta])];
}
function refrain(z,t){
 const th=new Set(t>0?z.slice(Math.max(0,t-H),t):[z[0]]);
 if(th.has(z[t+1]))return 0;
 for(let s=t+2;s<=t+H;s++)if(th.has(z[s])){
  const prev=new Set();
  for(let u=Math.max(0,t-H);u<t;u++)prev.add(key(z[u],z[u+1]));
  const exc=new Set();
  for(let u=t;u<s;u++)exc.add(key(z[u],z[u+1]));
  let n=0;for(const e of exc)if(!prev.has(e))n++;
  return n/11;
 }
 return 0;
}
function createLineage(k){
 const ob={k,V:zero(),z:[],birthTick:0,lives:[],lastTick:0,
          trace:createHash('sha256'),deaths:0,pitFollowCount:0,r:null};
 const birth=tick=>{
  ob.r=new AmeliaNumogramSubstrateRuntime();
  ob.r.exitBonus=(x,y)=>WV*ob.V[key(x,y)];
  ob.z=[ob.r.getCurrentZone()];
  ob.birthTick=tick;
 };
 birth(0);ob.birth=birth;
 return ob;
}
function apply(ob,inputText,tick,round,signed){
 const from=ob.z.at(-1),t0=ob.birthTick,k=ob.k;
 const Vbefore={...ob.V};
 const terms=Object.fromEntries(OPEN[from].map(t=>[key(from,t),WV*Vbefore[key(from,t)]]));
 assert.deepEqual(terms,signed.valueTerms,'VALUE_TERMS_DIFF_K'+k+'_T'+tick);
 const c=cue(inputText),to=ob.r.step(inputText).lastTransition.to;
 assert.equal(to,signed.toZone,'STUDIO_TO_ZONE_DIFF_K'+k+'_T'+tick);
 assert.equal(from,signed.fromZone,'STUDIO_FROM_ZONE_DIFF_K'+k+'_T'+tick);
 assert.equal(c,signed.cueZone,'STUDIO_CUE_ZONE_DIFF_K'+k+'_T'+tick);
 assert.equal(signed.tick,tick);assert.equal(signed.round,round);
 assert.equal(signed.armId,k===0?'C':'R'+String(k).padStart(2,'0'));
 assert.equal(signed.mode,'learner');assert.equal(signed.k,k);
 assert.equal(signed.choicePoint,[1,2,4].includes(from));
 assert(OPEN[from].includes(to));
 ob.z.push(to);ob.trace.update(tick+':'+to+';');
 if(to===5){
  const fin=finalExcursion(ob.z);
  assert.deepEqual(fin,signed.death.finalExcursion,
   'SCAR_FINAL_EXCURSION_DIFF_K'+k+'_T'+tick);
  for(const e of fin)ob.V[e]+=ETA*(-1-ob.V[e]);
  assert.deepEqual(ob.V,signed.death.finalV,
   'SCAR_PENALTY_V_DIFF_K'+k+'_T'+tick);
  assert.equal(signed.death.bornTick,t0);
  assert.equal(signed.death.length,tick-t0);
  assert.equal(signed.refrainOutcome,null);
  ob.deaths++;ob.birth(tick);
 }else{
  assert.equal(signed.death,null);
  const i=ob.z.length-1,t=i-H;
  if(t>=0){
   const e=key(ob.z[t],ob.z[t+1]),o=refrain(ob.z,t);
   if(e in ob.V)ob.V[e]+=ETA*(o-ob.V[e]);
   assert.deepEqual(signed.refrainOutcome,{settledStep:t,outcome:o,edge:e},
    'DELAYED_UPDATE_DIFF_K'+k+'_T'+tick);
  }else assert.equal(signed.refrainOutcome,null);
 }
 ob.lastTick=tick;
}

const output=resolve(process.argv[2]||'/tmp/pf4-g2');
assert(output.startsWith('/tmp/')||output.startsWith('/mnt/data/'));
const genesis=f(ROOT+'GENESIS.json'),saved=f(ROOT+'STATE.json');
assert.equal(genesis.schema,'PF2_LIVE_GENESIS_V1');
assert.equal(genesis.referenceDomain,'PF2-REF-i|');
const files=readdirSync(ROOT+'chunks').filter(n=>/^\d{8}\.json$/.test(n)).sort();
assert(files.length>0);
const lineages=Array.from({length:9},(_,k)=>createLineage(k));
let expected=0,prev=genesis.genesisDigest,rawDigest=createHash('sha256');
for(const filename of files){
 const block=f(ROOT+'chunks/'+filename);
 assert.equal(block.schema,'PF2_PENDING_VERIFIED_BATCH_V1');
 assert.equal(block.verifiedStatus,'PASS');
 assert.equal(block.startTick,expected);
 assert.equal(block.previousHead,prev);
 assert.equal(block.count,block.rows.length);
 for(const row of block.rows){
  const tick=expected+1;
  assert.equal(row.tick,expected);
  assert.equal(row.round,genesis.R0+20*expected);
  assert.equal(row.previous,prev);
  assert.equal(row.verification,'REAL_QUICKNET_BLS_VERIFIED_WITH_PINNED_C1_PF1');
  assert.equal(hash(Buffer.from(row.signature,'hex')),row.randomness);
  assert.equal(row.armEvents.length,18);
  rawDigest.update(row.randomness+'\n');
  for(let k=0;k<9;k++){
   const txt=input(row.randomness,k);
   assert.equal(txt,pf2InputForArm(row.randomness,k),'PF2_DOMAIN_MISMATCH_'+k);
   apply(lineages[k],txt,tick,row.round,row.armEvents[2*k]);
  }
  expected++;prev=row.digest;
 }
 assert.equal(prev,block.finalHead);
}
assert.equal(expected,saved.admittedTicks,'CHECKOUT_REPO_PREFIX_CHANGED');
assert.equal(prev,saved.headDigest);
assert.equal(saved.engine.tick,expected);
const data=lineages.map(({k,V,trace,deaths,lastTick,birthTick})=>{
 const b=saved.engine.receivers[2*k];
 assert.equal(b.mode,'learner');assert.equal(b.k,k);
 assert.equal(lastTick,b.lastTick);assert.equal(birthTick,b.birthTick);
 // Strict JSON-deep equality requires bit-for-bit identical double values.
 assert.deepEqual(V,b.V,'99_VALUE_STUDIO_VS_LIVE_MISMATCH_ARM_'+k);
 return {k,deathCount:deaths,finalV:V,
  codeSha256:hash(Buffer.from(JSON.stringify(V),'utf8')),
  traceDigest:trace.digest('hex')};
});
const snapshot={
 schema:'PF4_G2_STUDIO_LIVE_PREFIX_INDEPENDENT_PARITY_V1',
 status:'ENGINEERING_PASS_PUBLISHED_ONLY_NOT_FUTURE_TEST',
 sourceCommit:process.env.GITHUB_SHA??'local',
 countTicks:expected,checkedArmTicks:expected*9,
 finalRound:genesis.R0+20*(expected-1),chunkCount:files.length,
 referenceDomain:'PF2-REF-i|',inputAdapterIndependent:true,
 studioRuntimeMirror:true,all99VExact:true,
 sourceSignatureSHA256Check:true,
 sourceBLSAlreadyPreverifiedByPF2:true,independentlyReverifiedBLS:false,
 noLiveFetch:true,PF2StateMutated:false,
 publishedRandomnessTapeSHA256:rawDigest.digest('hex'),
 lineages:data
};
mkdirSync(output,{recursive:true});
writeFileSync(join(output,'PF4_G2_PUBLISHED_PREFIX_PARITY.json'),JSON.stringify(snapshot,null,2)+'\n');
console.log('PF4_G2_INDEPENDENT_STUDIO_INPUT_PARITY_PASS '+JSON.stringify({
 ticks:expected,armTicks:expected*9,chunks:files.length,
 all99VExact:true,finalRound:snapshot.finalRound,
 sourceSha:snapshot.sourceCommit,noNewBeacons:true}));
