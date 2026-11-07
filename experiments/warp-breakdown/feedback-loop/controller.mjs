/** Feedback updates the actual Oracle House V entries which influence its gates. */
import assert from 'node:assert/strict';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {makeRoute,zones,fastStep} from '../access/quota.mjs';
const copy=structuredClone,clip=x=>Math.max(-1,Math.min(1,x));
export function create(prepared,route,eta,kind){
 assert.ok(['real','yoked','frozen'].includes(kind));const r=makeRoute(prepared,route),{p,d}=zones(route),edges=[`${p}>${p}`,`${p}>${d}`],limit=r.fullState().runtime.governorState.hardLimitViolations;
 const check=q=>assert.equal(q.snapshot.governor.hardLimitViolationCount,limit);
 return {r,route,eta,kind,p,d,edges,
  prepare(){const path=[];if(r.z.at(-1)===d){const q=fastStep(r,null);check(q);assert.deepEqual([q.from,q.to],[d,p]);path.push([q.from,q.to]);}assert.equal(r.z.at(-1),p);return path;},
  decide(path){const vBefore=edges.map(e=>r.L.V[e]),q=fastStep(r,null);check(q);assert.equal(q.from,p);assert.ok(q.to===p||q.to===d);path.push([q.from,q.to]);return {action:Number(q.to===d),path,vBefore,vAfterDecision:edges.map(e=>r.L.V[e])};},
  update(action,reward){assert.ok([0,1,2].includes(reward));if(kind==='frozen')return edges.map(e=>r.L.V[e]);const signed=reward-1; // -1, 0, +1 for two cases
   for(let j=0;j<2;j++)r.L.V[edges[j]]=clip(.75*(r.L.V[edges[j]]??0)+eta*signed*(j===action?1:-1));
   return edges.map(e=>r.L.V[e]);
  }
 };
}
/** Swap only the donor's two V entries into a same-state cloned host. */
export function probe(host,donor){
 assert.equal(host.p,donor.p);assert.equal(host.r.z.at(-1),host.p);assert.equal(donor.r.z.at(-1),donor.p);
 const initial=host.r.fullState(),altered=copy(initial),before=host.edges.map(e=>initial.L.V[e]),donated=host.edges.map(e=>donor.r.L.V[e]);
 for(let j=0;j<2;j++)altered.L.V[host.edges[j]]=donated[j];
 const a=new OracleAdapter(initial),b=new OracleAdapter(altered),x=fastStep(a,null),y=fastStep(b,null);assert.equal(x.from,host.p);assert.equal(y.from,host.p);
 return {vBefore:before,vDonor:donated,realAction:Number(x.to===host.d),donorAction:Number(y.to===host.d)};
}
