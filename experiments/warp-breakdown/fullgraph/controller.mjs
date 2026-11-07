/** Unforced full-graph decisions; the same four-transition decoder for every route. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {fastStep} from '../access/quota.mjs';
const copy=structuredClone,clip=x=>Math.max(-1,Math.min(1,x));
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const norm=x=>{const y=copy(x);for(const q of y.runtime.snapshots??[])q.timestamp=0;return y;};
class MatchedAdapter extends OracleAdapter{
 constructor(saved,graph){super(saved);this.experimentalResetGraph=copy(graph??saved.experimentalResetGraph??saved.runtime.qabbalaGates);}
 attach(fresh=false){super.attach(fresh);if(fresh&&this.experimentalResetGraph)this.r.qabbala.setGates(copy(this.experimentalResetGraph));}
}
export function initialize(prepared,route){
 assert.ok(['warp','native27','matched27'].includes(route));let state=copy(prepared),r;
 if(route==='warp')r=new OracleAdapter(state);
 else if(route==='native27'){state.runtime.currentZone=2;state.z[state.z.length-1]=2;r=new OracleAdapter(state);}
 else {const c=new OracleAdapter(state).makeControl().fullState();r=new MatchedAdapter(c,c.runtime.qabbalaGates);}
 return r;
}
export function restore(saved,route){return route==='matched27'?new MatchedAdapter(saved,saved.experimentalResetGraph??saved.runtime.qabbalaGates):new OracleAdapter(saved);}
export function decision(r){
 const path=[],limit=r.r.getGovernor().hardLimitViolationCount;let chosen=null;
 for(let k=0;k<4;k++){
  const from=r.z.at(-1),choices=r.r.qabbala.getGates().filter(g=>g.isOpen&&g.source===from).map(g=>g.target).sort((a,b)=>a-b);const q=fastStep(r,null);
  assert.equal(q.from,from);assert.equal(q.snapshot.governor.hardLimitViolationCount,limit);const rank=choices.indexOf(q.to);assert.ok(rank>=0||choices.length===0);
  path.push({from:q.from,to:q.to,rank,options:choices,postZone:r.z.at(-1),died:q.to===5});
  if(choices.length>=2)chosen={source:from,options:choices,rank,action:rank%2};
 }
 if(!chosen)chosen={source:path.at(-1).from,options:path.at(-1).options,rank:path.at(-1).rank,action:0};
 assert.ok(chosen.action===0||chosen.action===1);return {path,selected:chosen,action:chosen.action};
}
export function reward(r,result,score){
 assert.ok([0,1,2].includes(score));const {source,options,action}=result.selected,before=[],after=[];
 for(let j=0;j<options.length;j++){
  const edge=`${source}>${options[j]}`;assert.ok(edge in r.L.V,edge);const v=r.L.V[edge];before.push(v);
  r.L.V[edge]=clip(.75*v+(score-1)*((j%2)===action?1:-1));after.push(r.L.V[edge]);
 }
 return {source,options,before,after};
}

/** Optional readout: average the existing House V values by local gate-rank action. */
export function globalReadout(r){
 const gates=r.r.qabbala.getGates().filter(g=>g.isOpen),v=[[],[]];
 for(let source=0;source<=9;source++){const opts=gates.filter(g=>g.source===source).map(g=>g.target).sort((a,b)=>a-b);if(opts.length<2)continue;for(let j=0;j<opts.length;j++){const x=r.L.V[`${source}>${opts[j]}`];assert.ok(Number.isFinite(x));v[j%2].push(x);}}
 assert.ok(v[0].length&&v[1].length);const means=v.map(x=>x.reduce((a,b)=>a+b,0)/x.length);return {action:Number(means[1]>means[0]),means,counts:v.map(x=>x.length),values:v};
}
/** Restrict a state intervention to the V vector and/or the two location fields. */
export function branch(host,route,kind,baseline,donor,zone){
 const a=copy(host),before=copy(a);if(kind==='reset')a.L.V=copy(baseline);else if(kind==='donor')a.L.V=copy(donor);else assert.equal(kind,'retain');
 const stripV=x=>{const y=norm(x);delete y.L.V;return y;};const originalNonV=hash(stripV(before)),afterMemoryNonV=hash(stripV(a)),vHash=hash(a.L.V);assert.equal(afterMemoryNonV,originalNonV);
 const origin=a.runtime.currentZone;assert.equal(origin,a.z.at(-1));if(zone!==null){a.runtime.currentZone=zone;a.z[a.z.length-1]=zone;}
 const stripVLocation=x=>{const y=norm(x);delete y.L.V;delete y.runtime.currentZone;y.z[y.z.length-1]=-1;return y;};const originalOther=hash(stripVLocation(before)),afterShockOther=hash(stripVLocation(a));assert.equal(originalOther,afterShockOther);
 return {r:restore(a,route),originalZone:origin,shockZone:zone,proof:{originalNonV,afterMemoryNonV,originalOther,afterShockOther,vHash}};
}
