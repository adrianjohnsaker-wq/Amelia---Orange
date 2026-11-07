/** Sealed same-prestate gate sensitivity calibration, before held-out seed exists. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {prepare} from './prepare.mjs';
import {sha,observations} from './common.ts';
const [statePath,planPath,outDir]=process.argv.slice(2);assert.ok(outDir);
const raw=readFileSync(statePath),pb=readFileSync(planPath),plan=JSON.parse(pb.toString()),saved=JSON.parse(raw.toString()).amelias;
assert.equal(plan.schema,'amelia.warp-dynamic-registration/v1');assert.equal(sha(raw),plan.checkpointSha256);assert.equal(sha(readFileSync(process.argv[1])),plan.calibrateSha256);
const index=Number(process.env.DYNAMIC_LINEAGE_INDEX),id=plan.lineages[index];assert.ok(id&&saved[id]);mkdirSync(outDir,{recursive:false});
const p=prepare(saved[id]),episodes:any[]=[],counts:any={};
for(let n=0;n<plan.calibrationPairs;n++)for(const flip of [0,1]){
 const x=observations(plan.calibrationSeed,id,'calibration',n,flip,plan.steps),arms:any[]=[];
 for(const gain of plan.cueWeights)for(const route of ['warp','control']){
  const proposal=route==='warp'?3:2,diagnostic=route==='warp'?6:7,a=new OracleAdapter({...p.native,cueWeight:gain}),r=route==='warp'?a:a.makeControl(),path:any[]=[];
  let sensitive=0,pivotal=0;
  for(const v of x.observations){
   const before=r.fullState(),yes=new OracleAdapter(before).step(proposal),no=new OracleAdapter(before).step(diagnostic),neutral=new OracleAdapter(before).step(null),q=r.step(v.ok?proposal:diagnostic);
   assert.equal(q.to,v.ok?yes.to:no.to);assert.equal(q.snapshot.governor.hardLimitViolationCount,before.runtime.governorState.hardLimitViolations);
   sensitive+=Number(yes.to!==no.to);pivotal+=Number(q.to!==neutral.to);path.push([q.from,q.to]);
  }
  const key=`${gain}:${route}`;counts[key]??={steps:0,sensitive:0,pivotal:0};counts[key].steps+=x.observations.length;counts[key].sensitive+=sensitive;counts[key].pivotal+=pivotal;
  arms.push({gain,route,sensitive,pivotal,path});
 }
 episodes.push({index:n,flip,seedHash:sha(x.seed),observations:x.observations,arms});
}
const selected:any={};for(const gain of plan.cueWeights){const a=counts[`${gain}:warp`],b=counts[`${gain}:control`];assert.equal(a.steps,b.steps);selected[gain]=a.sensitive>b.sensitive?'warp':'control';}
const result={schema:'amelia.warp-dynamic-calibration-shard/v1',status:'COMPLETE',lineage:id,index,registrationSha256:sha(pb),checkpointSha256:sha(raw),scriptSha256:sha(readFileSync(process.argv[1])),counts,selected,episodes};
writeFileSync(join(outDir,'calibration.json'),JSON.stringify(result)+'\n');console.log(JSON.stringify({lineage:id,status:'COMPLETE',counts,selected}));
