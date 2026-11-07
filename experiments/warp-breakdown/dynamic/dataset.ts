/** Fresh, switching-environment training and held-out histories. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {prepare} from './prepare.mjs';
import {sha,observations,grid,evaluate,LIGHT,HEAVY,houseFeatures,pfmFeatures} from './common.ts';
const [statePath,registrationPath,selectionPath,runPath,outDir]=process.argv.slice(2);assert.ok(outDir);
const raw=readFileSync(statePath),pb=readFileSync(registrationPath),sb=readFileSync(selectionPath),rb=readFileSync(runPath);
const p=JSON.parse(pb.toString()),selection=JSON.parse(sb.toString()),run=JSON.parse(rb.toString()),saved=JSON.parse(raw.toString()).amelias;
assert.equal(p.schema,'amelia.warp-dynamic-registration/v1');assert.equal(run.schema,'amelia.warp-dynamic-run/v1');
assert.equal(sha(raw),p.checkpointSha256);assert.equal(run.registrationSha256,sha(pb));assert.equal(run.selectionSha256,sha(sb));
assert.equal(run.pairsPerPartition,p.pairsPerPartition);assert.notEqual(run.experimentSeed,p.calibrationSeed);
assert.equal(selection.status,'FROZEN');assert.equal(selection.registrationSha256,sha(pb));assert.equal(sha(readFileSync(process.argv[1])),p.datasetSha256);
const index=Number(process.env.DYNAMIC_LINEAGE_INDEX),id=p.lineages[index];assert.ok(id&&saved[id]&&selection.lineages[id]);mkdirSync(outDir,{recursive:false});
const prep=prepare(saved[id]),episodes:any[]=[];
for(const partition of ['train','test'])for(let n=0;n<run.pairsPerPartition;n++)for(const flip of [0,1]){
 const x=observations(run.experimentSeed,id,partition,n,flip,p.steps),arms:any[]=[];
 for(const gain of p.cueWeights)for(const route of ['warp','control']){
  const proposal=route==='warp'?3:2,diagnostic=route==='warp'?6:7,a=new OracleAdapter({...prep.native,cueWeight:gain}),r=route==='warp'?a:a.makeControl();
  const baseL=structuredClone(r.L),basePFM=r.r.getMemory().readMemoryBias(),limit=r.fullState().runtime.governorState.hardLimitViolations,path:any[]=[],features:any[]=[];
  for(const v of x.observations){
   const q=r.step(v.ok?proposal:diagnostic);assert.equal(q.snapshot.governor.hardLimitViolationCount,limit);path.push([q.from,q.to]);
   const bias=r.r.getMemory().readMemoryBias();features.push({house:houseFeatures(r.L,baseL,proposal,diagnostic),pfm:pfmFeatures(bias,basePFM,proposal,diagnostic)});
  }
  arms.push({gain,route,path,features});
 }
 // Independent held-out grid batches are generated only after all four histories have been captured.
 const held:any[]=[],shocks:any[]=[];
 for(const v of x.observations){
  const grids=Array.from({length:p.heldoutCases},(_,j)=>grid(`${x.seed}:heldout:${v.t}:${j}`,v.mode));
  held.push({light:evaluate(LIGHT,grids).passed,heavy:evaluate(HEAVY,grids).passed});
  if(v.switched){
   const old=v.mode===1?3:1,incumbent=old===1?LIGHT:HEAVY;
   const before=Array.from({length:p.shockCases},(_,j)=>grid(`${x.seed}:shock:${v.t}:${j}`,old));
   const after=Array.from({length:p.shockCases},(_,j)=>grid(`${x.seed}:shock:${v.t}:${j}`,v.mode));
   const a=evaluate(incumbent,before).passed,b=evaluate(incumbent,after).passed;
   shocks.push({t:v.t,oldMode:old,newMode:v.mode,before:a,after:b,breakdown:a-b>=2});
  }
 }
 episodes.push({partition,index:n,flip,seedHash:sha(x.seed),observations:x.observations,arms,heldout:held,shocks});
}
const result={schema:'amelia.warp-dynamic-dataset/v1',status:'COMPLETE',lineage:id,index,registrationSha256:sha(pb),selectionSha256:sha(sb),runSha256:sha(rb),checkpointSha256:sha(raw),scriptSha256:sha(readFileSync(process.argv[1])),episodes};
writeFileSync(join(outDir,'result.json'),JSON.stringify(result)+'\n');console.log(JSON.stringify({status:'COMPLETE',lineage:id,episodes:episodes.length}));
