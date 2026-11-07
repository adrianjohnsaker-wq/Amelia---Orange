/** Synthetic exploratory calibration of each saved Oracle-native lineage. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {OracleAdapter} from './adapter.mjs';
const [input,output]=process.argv.slice(2),raw=readFileSync(input),saved=JSON.parse(raw).amelias;
const cueWeight=Number(process.env.ORACLE_CUE_WEIGHT??0.35);assert.ok(cueWeight>=0&&cueWeight<=0.35);
const hash=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
function current(a){return a.fullState().runtime.currentZone;}
function fullHash(s){return hash(s)}
function follow(state,steps=24){const a=new OracleAdapter(state),path=[current(a)];let dwell=0,cross=0;
 for(let t=0;t<steps;t++){const q=a.step(null);path.push(q.to);if(q.from===3&&q.to===3)dwell++;if(q.from===3&&q.to===6)cross++;}
 return {path,dwell,cross};}
const lineages=[];
for(const [id,source] of Object.entries(saved)){
 const a=new OracleAdapter({...source,cueWeight}),entry=[];assert.equal(source.runtime.qabbalaGates.length,29);
 if(current(a)===6)entry.push(a.step(null));assert.equal(current(a),3);
 const start=a.fullState(),sequence=[];
 for(let t=0;t<32;t++){
  const pre=a.fullState(),without=new OracleAdapter(pre).step(null),t3=new OracleAdapter(pre).step(3),t6=new OracleAdapter(pre).step(6);
  const zero=structuredClone(pre);for(const f of ['V','S','D'])for(const k of Object.keys(zero.L[f]))zero.L[f][k]=0;
  const noHouse=new OracleAdapter(zero).step(null);
  const coded=t%2===0?3:6,actual=a.step(coded);
  assert.equal(actual.to,coded===3?t3.to:t6.to);
  sequence.push({t,from:without.from,without:without.to,target3:t3.to,target6:t6.to,
   target3Pivotal:t3.to!==without.to,target6Pivotal:t6.to!==without.to,
   houseAblated:noHouse.to,housePivotal:noHouse.to!==without.to,applied:coded,actual:actual.to});
 }
 const donor3=new OracleAdapter(start),donor6=new OracleAdapter(start);
 for(let t=0;t<24;t++){donor3.step(3);donor6.step(6);}
 const s3=donor3.fullState(),s6=donor6.fullState(),swaps={};
 for(const [background,base] of [['3',s3],['6',s6]])for(const component of ['house','pfm'])for(const [donor,don] of [['3',s3],['6',s6]]){
  const s=structuredClone(base);
  if(component==='house')s.L=structuredClone(don.L);else s.runtime.memoryState=structuredClone(don.runtime.memoryState);
  const stripped=x=>{const z=structuredClone(x);if(component==='house')delete z.L;else delete z.runtime.memoryState;return fullHash(z);};
  assert.equal(stripped(s),stripped(base),'A non-target component changed');
  swaps[`${component}:${background}:${donor}`]={nonComponentHash:stripped(s),donorHash:hash(component==='house'?don.L:don.runtime.memoryState),...follow(s)};
 }
 lineages.push({id,step:source.runtime.stepCount,initialZone:source.runtime.currentZone,entry:entry.map(x=>({from:x.from,to:x.to})),
  retainedEvents:source.runtime.memoryState.events.length,sequence,swaps});
}
const res={schema:'amelia.oracle-warp-calibration/v1',snapshotSha256:hash(raw.toString()),cueWeight,lineages,
 note:'Synthetic Oracle coded-zone cues; no Outside receiver admission queue is involved. Counterfactuals replay identical full pre-step states.'};
writeFileSync(output,JSON.stringify(res,null,2)+'\n');
console.log(JSON.stringify(lineages.map(l=>({id:l.id,entries:l.entry,target3Pivotal:l.sequence.filter(x=>x.target3Pivotal).length,
 target6Pivotal:l.sequence.filter(x=>x.target6Pivotal).length,housePivotal:l.sequence.filter(x=>x.housePivotal).length,
 swapHouseDwell:l.swaps['house:3:3'].dwell-l.swaps['house:3:6'].dwell,
 swapPfmDwell:l.swaps['pfm:3:3'].dwell-l.swaps['pfm:3:6'].dwell}))));
