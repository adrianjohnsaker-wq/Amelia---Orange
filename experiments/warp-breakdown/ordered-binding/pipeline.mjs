/** Ordered input -> actual Oracle House -> gate output. Experimental copies only. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {initialize,restore,decision as naturalDecision,branch} from '../fullgraph/controller.mjs';
import {fastStep} from '../access/quota.mjs';
export const SLOW=.75,FAST=.25,INPUT=.5,GAIN=.75;
const H=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fields=['V','D'];
export function edges(route){return route==='matched27'?['2>2','2>7','7>2']:['3>3','3>6','6>3'];}
export function hostRoute(route){return route==='matched27'?'matched27':'warp';}
export function setup(pre,route){
 const r=initialize(pre,hostRoute(route));
 // Equalize the 2>2 House key present in the adapted 2/7 implementation.
 for(const field of ['V','S','D'])if(!('2>2' in r.L[field]))r.L[field]['2>2']=0;
 if(!(r.extraEdges??[]).includes('2>2'))r.extraEdges=[...(r.extraEdges??[]),'2>2'];
 for(const f of fields)for(const e of edges(route))r.L[f][e]=0;
 assert.deepEqual(['V','S','D'].map(x=>Object.keys(r.L[x]).length),[30,30,30]);assert.equal(Object.keys(r.r.qabbala.getZones()).length,10);
 return r;
}
export function memory(r,route){const E=edges(route);return fields.flatMap(f=>E.map(e=>r.L[f][e]));}
export function setMemory(r,route,v){assert.equal(v.length,6);const E=edges(route);for(let i=0;i<6;i++){assert.ok(Number.isFinite(v[i]));r.L[fields[Math.floor(i/3)]][E[i%3]]=v[i];}}
export function transition(v,token){assert.equal(v.length,6);assert.ok([0,1,2].includes(token));return v.map((x,i)=>(i<3?SLOW:FAST)*x+(i%3===token?INPUT:0));}
export function inputEvent(r,route,token){
 const before=memory(r,route),written=transition(before,token);setMemory(r,route,written);const d=naturalDecision(r);return {token,before,written,after:memory(r,route),path:d.path,selected:d.selected,action:d.action};
}
export function shock(host,route,zone,noise){
 const b=branch(host,hostRoute(route),'retain',host.L.V,host.L.V,zone),before=memory(b.r,route),after=before.map((x,i)=>x+noise[i]);setMemory(b.r,route,after);
 return {r:b.r,proof:b.proof,before,after};
}
/** Invert the two time-scale traces without seeing prior events or target labels. */
export function decode(v,context,left,right){
 assert.ok(context==='old'||context==='new');assert.ok([0,1,2].includes(left)&&[0,1,2].includes(right)&&left!==right);
 const sv=v[left]-v[right],fv=v[3+left]-v[3+right],oldS=INPUT*(SLOW**4-SLOW**3),newS=INPUT*(SLOW-1),oldF=INPUT*(FAST**4-FAST**3),newF=INPUT*(FAST-1),det=oldS*newF-oldF*newS;
 const estimate=context==='old'?(sv*newF-fv*newS)/det:(oldS*fv-oldF*sv)/det;assert.ok(Number.isFinite(estimate));return {estimate,action:estimate>=0?0:1,slowDifference:sv,fastDifference:fv};
}
export function variant(host,route,kind,donor=null){
 const r=restore(structuredClone(host),hostRoute(route)),before=r.fullState(),old=memory(r,route);if(kind==='reset')setMemory(r,route,[0,0,0,0,0,0]);else if(kind==='donor'){assert.ok(donor);setMemory(r,route,donor);}else assert.equal(kind,'retain');
 function strip(x){let a=structuredClone(x),E=edges(route);for(const f of fields)for(const e of E)delete a.L[f][e];for(const s of a.runtime.snapshots??[])s.timestamp=0;return a;}
 const otherBefore=H(strip(before)),otherAfter=H(strip(r.fullState()));assert.equal(otherBefore,otherAfter);return {r,proof:{otherBefore,otherAfter,beforeMemory:old,afterMemory:memory(r,route)}};
}
export function probe(host,route,context,left,right,mode='gate'){
 const r=restore(structuredClone(host),hostRoute(route)),m=memory(r,route),d=decode(m,context,left,right);assert.ok(mode==='gate'||mode==='direct');
 if(mode==='direct'){const path=naturalDecision(r);return {context,left,right,memory:m,readout:d,action:d.action,path:path.path,selected:path.selected,gateAction:path.action,mode};}
 const path=[],limit=r.r.getGovernor().hardLimitViolationCount;let selected=null;const signal=d.action===1?1:-1;
 for(let k=0;k<4;k++){
  const runtime=r.r,from=r.z.at(-1),opts=runtime.qabbala.getGates().filter(g=>g.isOpen&&g.source===from).map(g=>g.target).sort((a,b)=>a-b),base=runtime.exitBonus;
  runtime.exitBonus=(a,b)=>{let v=base?base(a,b):0;if(a!==from||opts.length<2)return v;const rank=opts.indexOf(b);return v+(rank%2?1:-1)*GAIN*signal;};
  let q;try{q=fastStep(r,null);}finally{runtime.exitBonus=base;}
  assert.equal(q.from,from);assert.equal(q.snapshot.governor.hardLimitViolationCount,limit);const rank=opts.indexOf(q.to);assert.ok(rank>=0||opts.length===0);path.push({from:q.from,to:q.to,postZone:r.z.at(-1),rank,options:opts,died:q.to===5});if(opts.length>=2)selected={source:from,options:opts,rank,action:rank%2};
 }
 if(!selected){const q=path.at(-1);selected={source:q.from,options:q.options,rank:q.rank,action:0};}
 return {context,left,right,memory:m,readout:d,action:selected.action,path,selected,gateAction:selected.action,mode};
}
/** Two-node six-scalar direct recurrence; receives the identical event/noise stream. */
export class DirectRecurrent{
 constructor(v=[0,0,0,0,0,0]){this.v=[...v];}
 input(token){const before=[...this.v];this.v=transition(this.v,token);return {token,before,after:[...this.v]};}
 disturb(noise){const before=[...this.v];this.v=this.v.map((x,i)=>x+noise[i]);return {before,after:[...this.v]};}
 probe(context,left,right){const readout=decode(this.v,context,left,right);return {context,left,right,memory:[...this.v],readout,action:readout.action};}
}
