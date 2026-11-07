/** Symmetric, cue-independent competition offset on matched Oracle copies. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
const clone=x=>structuredClone(x);
export const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
/** Runtime snapshot wall-clock timestamps do not drive passage and vary on replay. */
export function normalized(x){const y=clone(x);for(const s of y.runtime.snapshots??[])if('timestamp' in s)s.timestamp=0;return y;}
export function routeInfo(route){assert.ok(['warp','control'].includes(route));return route==='warp'?{p:3,d:6}:{p:2,d:7};}
export function newRoute(prepared,route){
 const a=new OracleAdapter({...clone(prepared),cueWeight:0.054});return route==='warp'?a:a.makeControl();
}
/** Install a reversible callback on the runtime, without changing its saved state. */
export function install(r,route,initial=0){
 const {p,d}=routeInfo(route),before=hash(r.fullState()),old=r.r.exitBonus;let value=initial;
 r.r.exitBonus=(x,y)=>old(x,y)+(x===p&&y===p?value/2:x===p&&y===d?-value/2:0);
 assert.equal(hash(r.fullState()),before,'Installing a score callback changed the saved state');
 return {set(x){assert.ok(Number.isFinite(x));value=x;},stateHash:before};
}
/** Counterfactual winner from a complete, identical pre-step state. */
export function forkWinner(state,route,offset,cue){
 const r=new OracleAdapter(state),ctl=install(r,route,offset),before=r.fullState();ctl.set(offset);
 const q=r.step(cue);assert.equal(hash(before),hash(state));
 assert.equal(q.snapshot.governor.hardLimitViolationCount,before.runtime.governorState.hardLimitViolations);
 return q.to;
}
export function winners(state,route,offset){
 const {p,d}=routeInfo(route),from=state.runtime.currentZone;
 if(from===d){
  const options=state.runtime.qabbalaGates.filter(g=>g.isOpen&&g.source===d);
  assert.equal(options.length,1);assert.equal(options[0].target,p);return [p,p];
 }
 assert.equal(from,p);return [forkWinner(state,route,offset,p),forkWinner(state,route,offset,d)];
}
/** Change the learner L only, retaining the host's PFM and all other state. */
export function swapHouse(host,donor){
 const a=clone(host),h=hash(host.L),d=hash(donor.L);a.L=clone(donor.L);
 const rawWithoutHouse=x=>{const y=clone(x);delete y.L;return hash(y)};
 assert.equal(rawWithoutHouse(a),rawWithoutHouse(host),'House swap changed another field');
 const remove=x=>{const y=normalized(x);delete y.L;return hash(y)};
 assert.equal(remove(a),remove(host));assert.equal(hash(a.L),d);
 return {state:a,hostForAudit:normalized(host),afterForAudit:normalized(a),check:{hostHouseHash:h,donorHouseHash:d,afterHouseHash:hash(a.L),hostOtherHash:remove(host),afterOtherHash:remove(a),changed:h!==d}};
}
