/** Controlled House permutation and fixed, route-yoked prompt tapes. */
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
const clone=x=>structuredClone(x),hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const edgeA='3>3',edgeB='2>3';
export function houseBonus(L,e){return .5*(L.V[e]??0)+.35*Math.tanh((L.S[e]??0)+(L.D[e]??0));}
export function permuteHouse(state){
 const out=clone(state),original=clone(state.L);
 for(const k of ['V','S','D']){assert.ok(edgeA in out.L[k]&&edgeB in out.L[k]);[out.L[k][edgeA],out.L[k][edgeB]]=[out.L[k][edgeB],out.L[k][edgeA]];}
 const without=x=>{let q=clone(x);delete q.L;return hash(q)};
 assert.equal(without(out),without(state));assert.notEqual(hash(original),hash(out.L));
 const triples=L=>Object.keys(L.V).sort().map(e=>JSON.stringify([L.V[e],L.S[e],L.D[e]])).sort();
 assert.deepEqual(triples(out.L),triples(original),'House edge-value multiset changed');
 return {state:out,nativeHash:hash(original),permutedHash:hash(out.L),otherHash:without(out),
  nativeGap:houseBonus(original,'3>3')-houseBonus(original,'3>6'),
  permutedGap:houseBonus(out.L,'3>3')-houseBonus(out.L,'3>6')};
}
export function prepare(source){
 const a=new OracleAdapter({...source,cueWeight:0.054}),entry=[];
 if(a.fullState().runtime.currentZone===6){let q=a.step(null);entry.push([q.from,q.to]);}
 assert.equal(a.fullState().runtime.currentZone,3);
 const burn=[];for(let t=0;t<8;t++){const cue=t%2?6:3,q=a.step(cue);burn.push({cue,from:q.from,to:q.to});}
 if(a.fullState().runtime.currentZone===6){const q=a.step(null);burn.push({cue:null,from:q.from,to:q.to});}
 const native=a.fullState();assert.equal(native.runtime.currentZone,3);
 const changed=permuteHouse(native);assert.ok(Math.abs(changed.nativeGap-changed.permutedGap)>=0.1,'House contrast is not functional');
 const controlNative=new OracleAdapter(native).makeControl().fullState(),controlPermuted=new OracleAdapter(changed.state).makeControl().fullState();
 const withoutHouse=x=>{const y=clone(x);delete y.L;return hash(y)};
 assert.equal(withoutHouse(controlNative),withoutHouse(controlPermuted),'Control states differ outside House');
 assert.notEqual(hash(controlNative.L),hash(controlPermuted.L),'Control House intervention disappeared');
 const donorW=new OracleAdapter(native),donorC=new OracleAdapter(native).makeControl();
 function tape(r,p,d){const pairs=[],path=[];
  for(let t=0;t<6;t++){const q=r.step(null);path.push([q.from,q.to]);if(t%2===1){const v=r.r.getMemory().readMemoryBias().biasVector;pairs.push([Number(v[p].toFixed(4)),Number(v[d].toFixed(4))]);}}
  return {pairs,path};}
 const promptWarp=tape(donorW,3,6),promptControl=tape(donorC,2,7);
 for(let i=0;i<3;i++)assert.notDeepEqual(promptWarp.pairs[i],promptControl.pairs[i],'Prompt tapes coincide');
 return {native,permuted:changed.state,entry,burn,house:{nativeHash:changed.nativeHash,permutedHash:changed.permutedHash,otherHash:changed.otherHash,controlOtherHash:withoutHouse(controlNative),controlNativeHash:hash(controlNative.L),controlPermutedHash:hash(controlPermuted.L),nativeGap:changed.nativeGap,permutedGap:changed.permutedGap},
  promptWarp,promptControl};
}
