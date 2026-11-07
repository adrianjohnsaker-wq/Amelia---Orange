/** Experimental, matched one-dwell-per-27-transition temporal encoder. */
import assert from 'node:assert/strict';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
const clone=x=>structuredClone(x);
/** The adapter exports its complete state only to assert currentZone; avoid that clone. */
export function fastStep(r,cue){
 const runtime=r.r,original=runtime.exportState;
 runtime.exportState=function(){return {currentZone:this.currentZone};};
 try{return r.step(cue);}finally{runtime.exportState=original;}
}
export function makeRoute(prepared,route){
 assert.ok(route==='warp'||route==='matched');const r=new OracleAdapter({...clone(prepared),cueWeight:0.054});
 return route==='warp'?r:r.makeControl();
}
export function zones(route){return route==='warp'?{p:3,d:6}:{p:2,d:7};}
export function installQuota(r,route,fast=true){
 const {p,d}=zones(route),base=r.r.exitBonus;let desired=null,offset=0,maxAbsOffset=0;
 r.r.exitBonus=(from,to)=>{
  const direct=base(from,to);if(from!==p)return direct;
  assert.ok(desired===p||desired===d,'A proposal exit needs a fixed requested target');
  const gates=r.r.qabbala.getGates().filter(g=>g.isOpen&&g.source===p),zs=r.r.qabbala.getZones(),bias=r.r.getMemory().readMemoryBias().biasVector;
  assert.equal(gates.length,2);assert.deepEqual(new Set(gates.map(g=>g.target)),new Set([p,d]));
  const score=target=>{const gate=gates.find(g=>g.target===target),z=zs[target];return gate.flux*(1-gate.resistance)+(bias[target]||0)*0.4+z.activation*0.2+Math.cos(z.phaseAngle)*0.1+base(p,target);};
  offset=(desired===p?0.02:-0.02)-(score(p)-score(d));assert.ok(Number.isFinite(offset)&&Math.abs(offset)<=2,'Quota offset outside predeclared bound');maxAbsOffset=Math.max(maxAbsOffset,Math.abs(offset));
  return direct+(to===p?offset/2:to===d?-offset/2:0);
 };
 return {
  block(bit){
   assert.ok(bit===0||bit===1);const path=[],at=bit===0?7:14,limit=r.fullState().runtime.governorState.hardLimitViolations;let dwells=0;
   for(let i=1;i<=14;i++){
    assert.equal(r.z.at(-1),p);desired=i===at?p:d;const q=fast?fastStep(r,bit===0?p:d):r.step(bit===0?p:d);assert.equal(q.to,desired);assert.equal(q.snapshot.governor.hardLimitViolationCount,limit);path.push([q.from,q.to]);
    if(q.to===p)dwells++;else {desired=null;const x=fast?fastStep(r,null):r.step(null);assert.equal(x.from,d);assert.equal(x.to,p);assert.equal(x.snapshot.governor.hardLimitViolationCount,limit);path.push([x.from,x.to]);}
   }
   desired=null;assert.equal(path.length,27);assert.equal(dwells,1);assert.equal(r.z.at(-1),p);
   return {path,dwells,maxAbsOffset};
  }
 };
}
export function features(r,route,baseHouse,basePFM){
 const {p,d}=zones(route),edges=[`${p}>${p}`,`${p}>${d}`,`${d}>${p}`],house=[];
 for(const k of ['V','S','D'])for(const e of edges)house.push((r.L[k][e]??0)-(baseHouse[k][e]??0));
 const bias=r.r.getMemory().readMemoryBias(),zs=r.r.qabbala.getZones();
 const pfm=[bias.biasVector[p]-basePFM.biasVector[p],bias.biasVector[d]-basePFM.biasVector[d],bias.hysteresisTension-basePFM.hysteresisTension];
 const phase=[];for(const z of [zs[p],zs[d]])phase.push(z.activation,z.conductivity,z.deformationStress,Math.sin(z.phaseAngle),Math.cos(z.phaseAngle));
 return {house,pfm,phase};
}
