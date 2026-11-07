/** Actual Oracle trajectories under an explicitly engineered occupancy-matched encoder. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {prepare} from '../dynamic/prepare.mjs';
import {sha} from '../dynamic/common.ts';
import {task,FAMILIES} from './tasks.ts';
import {makeRoute,installQuota,features,zones} from './quota.mjs';
const [statePath,planPath,runPath,outDir]=process.argv.slice(2);assert.ok(outDir);
const raw=readFileSync(statePath),pb=readFileSync(planPath),rb=readFileSync(runPath),p=JSON.parse(pb.toString()),run=JSON.parse(rb.toString()),saved=JSON.parse(raw.toString()).amelias;
assert.equal(p.schema,'amelia.warp-access-registration/v1');assert.equal(run.schema,'amelia.warp-access-run/v1');assert.equal(run.registrationSha256,sha(pb));
assert.equal(run.pairsPerPartition,p.pairsPerPartition);assert.equal(sha(raw),p.checkpointSha256);assert.equal(sha(readFileSync(process.argv[1])),p.datasetSha256);
const index=Number(process.env.ACCESS_LINEAGE_INDEX),id=p.lineages[index];assert.ok(id&&saved[id]);mkdirSync(outDir,{recursive:false});
const prepared=prepare(saved[id]).native,episodes:any[]=[];
for(const family of FAMILIES)for(const partition of ['train','test'])for(let n=0;n<p.pairsPerPartition;n++)for(const flip of [0,1]){
 const x=task(run.experimentSeed,id,family,partition,n,flip,p.rounds),y=task(run.experimentSeed,id,family,`yoked:${partition}`,n,flip,p.rounds),arms:any[]=[];
 for(const route of ['warp','matched'])for(const kind of ['real','yoked']){
  const r=makeRoute(prepared,route),z=zones(route),baseL=structuredClone(r.L),basePFM=r.r.getMemory().readMemoryBias(),control=installQuota(r,route),rounds:any[]=[];
  for(let t=0;t<p.rounds;t++){
   const a=control.block(x.observations[t].event),b=control.block((kind==='real'?x:y).observations[t].feedback);
   rounds.push({eventPath:a.path,feedbackPath:b.path,features:features(r,route,baseL,basePFM),maxAbsOffset:b.maxAbsOffset});
  }
  arms.push({route,kind,rounds});
 }
 const arm=(route:string,kind:string)=>arms.find(a=>a.route===route&&a.kind===kind),norm=(p:number[][],z:number)=>p.map(([a,b])=>[a===z?0:1,b===z?0:1]);
 for(let t=0;t<p.rounds;t++)for(const kind of ['real','yoked'])for(const field of ['eventPath','feedbackPath'])assert.deepEqual(norm(arm('warp',kind).rounds[t][field],3),norm(arm('matched',kind).rounds[t][field],2));
 episodes.push({family,partition,index:n,flip,seedHash:sha(x.seed),switches:[x.first,x.second],observations:x.observations,yoked:{seedHash:sha(y.seed),observations:y.observations},arms});
}
const result={schema:'amelia.warp-access-dataset/v1',status:'COMPLETE',lineage:id,index,checkpointSha256:sha(raw),registrationSha256:sha(pb),runSha256:sha(rb),scriptSha256:sha(readFileSync(process.argv[1])),episodes};
writeFileSync(join(outDir,'result.json'),JSON.stringify(result)+'\n');console.log(JSON.stringify({lineage:id,status:'COMPLETE',episodes:episodes.length}));
