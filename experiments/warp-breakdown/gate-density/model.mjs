/** Gate closures for Oracle copies, retained across clone and Zone-5 resets. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {restore} from '../fullgraph/controller.mjs';
import {fastStep} from '../access/quota.mjs';
import {memory,setMemory,transition,decode,hostRoute,GAIN} from '../ordered-binding/pipeline.mjs';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex'),key=(a,b)=>`${a}>${b}`;
export class MaskedOracle extends OracleAdapter{
 constructor(saved,mask){super({...structuredClone(saved),experimentalGateMask:structuredClone(mask)});}
 attach(fresh=false){super.attach(fresh);if(this.experimentalGateMask){const mask=new Set(this.experimentalGateMask.map(x=>key(...x))),gs=this.r.qabbala.getGates().map(g=>({...g,isOpen:mask.has(key(g.source,g.target))?false:g.isOpen}));assert.equal(gs.length,29);assert.equal(gs.filter(g=>g.isOpen).length,29-mask.size);this.r.qabbala.setGates(gs);}}
}
export function applyMask(host,mask){
 const before=structuredClone(host),r=new MaskedOracle(host,mask),after=r.fullState();
 function strip(x){const y=structuredClone(x);delete y.experimentalGateMask;for(const g of y.runtime.qabbalaGates)delete g.isOpen;for(const q of y.runtime.snapshots??[])q.timestamp=0;return y;}
 const beforeOther=hash(strip(before)),afterOther=hash(strip(after));assert.equal(beforeOther,afterOther);return {r,proof:{beforeOther,afterOther,closed:structuredClone(mask)}};
}
function checkGraph(r,route,mask){
 const gates=r.r.qabbala.getGates(),open=gates.filter(g=>g.isOpen),expected=route==='matched27'?24:29-mask.length;assert.equal(open.length,expected);
 for(const [a,b] of mask){const z=gates.filter(g=>g.source===a&&g.target===b);assert.equal(z.length,1);assert.equal(z[0].isOpen,false);}
 return {openCount:open.length,closedCount:gates.length-open.length};
}
export function wrap(saved,route,mask){return route==='warp'?new MaskedOracle(saved,mask):restore(saved,hostRoute(route));}
export function decision(r,route,mask,signal=null){
 const path=[],limit=r.r.getGovernor().hardLimitViolationCount;let selected=null;
 for(let k=0;k<4;k++){
  const runtime=r.r,from=r.z.at(-1),opts=runtime.qabbala.getGates().filter(g=>g.isOpen&&g.source===from).map(g=>g.target).sort((a,b)=>a-b),base=runtime.exitBonus;
  if(signal!==null)runtime.exitBonus=(a,b)=>{let v=base?base(a,b):0;if(a!==from||opts.length<2)return v;const rank=opts.indexOf(b);return v+(rank%2?1:-1)*GAIN*signal;};
  let q;try{q=fastStep(r,null);}finally{runtime.exitBonus=base;}
  assert.equal(q.from,from);assert.equal(q.snapshot.governor.hardLimitViolationCount,limit);const rank=opts.indexOf(q.to);assert.ok(rank>=0||opts.length===0);const graph=checkGraph(r,route,mask);path.push({from:q.from,to:q.to,postZone:r.z.at(-1),rank,options:opts,died:q.to===5,...graph});if(opts.length>=2)selected={source:from,options:opts,rank,action:rank%2};
 }
 if(!selected){const q=path.at(-1);selected={source:q.from,options:q.options,rank:q.rank,action:0};}return {path,selected,action:selected.action};
}
export function inputEvent(r,route,mask,token){const before=memory(r,route),written=transition(before,token);setMemory(r,route,written);const d=decision(r,route,mask);return {token,before,written,after:memory(r,route),...d};}
export function probe(host,route,mask,context,left,right,mode='gate'){
 const r=wrap(structuredClone(host),route,mask),m=memory(r,route),readout=decode(m,context,left,right);assert.ok(mode==='gate'||mode==='direct');const signal=mode==='gate'?(readout.action===1?1:-1):null,step=decision(r,route,mask,signal);return {context,left,right,memory:m,readout,action:mode==='gate'?step.action:readout.action,path:step.path,selected:step.selected,gateAction:step.action,mode};
}
