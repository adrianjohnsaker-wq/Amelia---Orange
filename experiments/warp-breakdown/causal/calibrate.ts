/** Find matched fixed competition adjustments using same-prestate calibration only. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {prepare} from '../dynamic/prepare.mjs';
import {observations,sha} from '../dynamic/common.ts';
import {newRoute,routeInfo,winners} from './intervention.mjs';
const [statePath,planPath,outDir]=process.argv.slice(2);assert.ok(outDir);
const raw=readFileSync(statePath),pb=readFileSync(planPath),p=JSON.parse(pb.toString()),saved=JSON.parse(raw.toString()).amelias;
assert.equal(p.schema,'amelia.warp-gate-causal-registration/v1');assert.equal(sha(raw),p.checkpointSha256);assert.equal(sha(readFileSync(process.argv[1])),p.calibrateSha256);
const index=Number(process.env.CAUSAL_LINEAGE_INDEX),id=p.lineages[index];assert.ok(saved[id]);mkdirSync(outDir,{recursive:false});
const base=prepare(saved[id]).native,episodes:any[]=[],counts:any={warp:{},control:{}};
for(const route of ['warp','control'])for(const b of p.offsets)counts[route][String(b)]={steps:0,sensitive:0};
for(let n=0;n<p.calibrationPairs;n++)for(const flip of [0,1]){
 const x=observations(p.calibrationSeed,id,'causal-calibration',n,flip,p.steps),arms:any[]=[];
 for(const route of ['warp','control']){
  const r=newRoute(base,route),{p:pr,d:di}=routeInfo(route),path:any[]=[],cs:any={};for(const b of p.offsets)cs[String(b)]=0;
  for(const v of x.observations){
   const before=r.fullState();for(const b of p.offsets){const [a,c]=winners(before,route,b);cs[String(b)]+=Number(a!==c);}
   const q=r.step(v.ok?pr:di);assert.equal(q.snapshot.governor.hardLimitViolationCount,before.runtime.governorState.hardLimitViolations);path.push([q.from,q.to]);
  }
  for(const b of p.offsets){const q=counts[route][String(b)];q.steps+=p.steps;q.sensitive+=cs[String(b)];}
  arms.push({route,path,sensitive:cs});
 }
 episodes.push({index:n,flip,seedHash:sha(x.seed),observations:x.observations,arms});
}
const n=2*p.calibrationPairs*p.steps,combos:any[]=[];
for(const wl of p.offsets)for(const wh of p.offsets)for(const cl of p.offsets)for(const ch of p.offsets){
 const dw=counts.warp[String(wh)].sensitive-counts.warp[String(wl)].sensitive,dc=counts.control[String(ch)].sensitive-counts.control[String(cl)].sensitive;
 if(dw<0||dc<0)continue;
 combos.push({warp:{low:wl,high:wh},control:{low:cl,high:ch},warpGain:dw/n,controlGain:dc/n,minGain:Math.min(dw,dc),gap:Math.abs(dw-dc),cost:Math.abs(wl)+Math.abs(wh)+Math.abs(cl)+Math.abs(ch)});
}
combos.sort((a,b)=>b.minGain-a.minGain||a.gap-b.gap||a.cost-b.cost||a.warp.low-b.warp.low||a.warp.high-b.warp.high||a.control.low-b.control.low||a.control.high-b.control.high);
const chosen=combos[0],result={schema:'amelia.warp-gate-causal-calibration/v1',status:'COMPLETE',lineage:id,index,registrationSha256:sha(pb),checkpointSha256:sha(raw),scriptSha256:sha(readFileSync(process.argv[1])),counts,chosen,episodes};
writeFileSync(join(outDir,'calibration.json'),JSON.stringify(result)+'\n');console.log(JSON.stringify({status:'COMPLETE',lineage:id,chosen}));
