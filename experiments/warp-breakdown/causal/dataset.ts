/** Factorial same-checkpoint gate interventions and House-only crossover. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {prepare} from '../dynamic/prepare.mjs';
import {sha,observations,grid,evaluate,LIGHT,HEAVY,houseFeatures,pfmFeatures} from '../dynamic/common.ts';
import {newRoute,routeInfo,winners,install,swapHouse,hash} from './intervention.mjs';
const [statePath,planPath,choicePath,runPath,outDir]=process.argv.slice(2);assert.ok(outDir);
const raw=readFileSync(statePath),pb=readFileSync(planPath),cb=readFileSync(choicePath),rb=readFileSync(runPath);
const p=JSON.parse(pb.toString()),choice=JSON.parse(cb.toString()),run=JSON.parse(rb.toString()),saved=JSON.parse(raw.toString()).amelias;
assert.equal(p.schema,'amelia.warp-gate-causal-registration/v1');assert.equal(run.schema,'amelia.warp-gate-causal-run/v1');
assert.equal(sha(raw),p.checkpointSha256);assert.equal(run.registrationSha256,sha(pb));assert.equal(run.choiceSha256,sha(cb));assert.equal(choice.status,'FROZEN');
assert.equal(choice.registrationSha256,sha(pb));assert.equal(run.pairsPerPartition,p.pairsPerPartition);assert.notEqual(run.experimentSeed,p.calibrationSeed);
assert.equal(sha(readFileSync(process.argv[1])),p.datasetSha256);
const index=Number(process.env.CAUSAL_LINEAGE_INDEX),id=p.lineages[index];assert.ok(id&&saved[id]&&choice.lineages[id]);mkdirSync(outDir,{recursive:false});
const prepared=prepare(saved[id]).native,episodes:any[]=[];
for(const partition of ['train','test'])for(let n=0;n<p.pairsPerPartition;n++)for(const flip of [0,1]){
 const x=observations(run.experimentSeed,id,partition,n,flip,p.steps),y=observations(run.experimentSeed,id,`causal-yoked:${partition}`,n,flip,p.steps),arms:any[]=[],swapChecks:any[]=[],orders:any={};
 for(const route of ['warp','control']){
  const {p:pr,d:di}=routeInfo(route),offset=choice.lineages[id].chosen[route];assert.ok(p.offsets.includes(offset.low)&&p.offsets.includes(offset.high));
  const initial=newRoute(prepared,route).fullState(),baseL=structuredClone(initial.L),init=new OracleAdapter(initial),basePFM=init.r.getMemory().readMemoryBias();
  function execute(startState:any,name:string,start:number,probe:boolean){
   const r=new OracleAdapter(startState),ctl=install(r,route,0),path:any[]=[],features:any[]=[],probes:any[]=[];let stateAtMid:any=null;
   const limit=r.fullState().runtime.governorState.hardLimitViolations;
   for(let t=start;t<p.steps;t++){
    const b=name==='sham'?0:(name==='low'||name==='lowYoked'||name==='lowHouseFromHigh')?offset.low:name==='release'?(t<p.releaseAt?offset.high:0):name==='reverse'?(t<p.releaseAt?offset.high:offset.low):offset.high;
    const before=r.fullState();
    if(probe){const a=winners(before,route,offset.low),z=winners(before,route,offset.high);probes.push([before.runtime.currentZone,...a,...z]);}
    ctl.set(b);const v=(name.endsWith('Yoked')?y:x).observations[t],q=r.step(v.ok?pr:di);assert.equal(q.snapshot.governor.hardLimitViolationCount,limit);path.push([q.from,q.to]);
    features.push({house:houseFeatures(r.L,baseL,pr,di),pfm:pfmFeatures(r.r.getMemory().readMemoryBias(),basePFM,pr,di)});
    if(t===p.releaseAt-1)stateAtMid=r.fullState();
   }
   return {name,start,path,features,probes,stateAtMid};
  }
  const names=['sham','low','high','reverse','release','lowYoked','highYoked'].sort((a,b)=>{const h=sha(`${x.seed}:${route}:order:${a}`),k=sha(`${x.seed}:${route}:order:${b}`);return h<k?-1:h>k?1:0;});
  orders[route]=names;const normal:any={};for(const name of names)normal[name]=execute(initial,name,0,partition==='test'&&(name==='low'||name==='high'));
  for(const name of ['release','reverse'])for(let t=0;t<p.releaseAt;t++){assert.deepEqual(normal[name].path[t],normal.high.path[t]);assert.deepEqual(normal[name].features[t],normal.high.features[t]);}
  for(const name of ['sham','low','high','reverse','release','lowYoked','highYoked']){const {stateAtMid,...out}=normal[name];arms.push({route,...out});}
  for(const [host,donor,name] of [['high','low','highHouseFromLow'],['low','high','lowHouseFromHigh']]){
   const h=normal[host].stateAtMid,d=normal[donor].stateAtMid;assert.ok(h&&d);const swapped=swapHouse(h,d);
   // Host offset stays fixed: this is a swap of House only, not of treatment.
   const {stateAtMid,...out}=execute(swapped.state,name,p.releaseAt,false);
   arms.push({route,...out});
   const witness=partition==='test'&&n===0&&flip===0?{host:swapped.hostForAudit,donorHouse:d.L,after:swapped.afterForAudit}:null;
   swapChecks.push({route,name,host,donor,...swapped.check,witness});
  }
 }
 const held:any[]=[],shocks:any[]=[];
 for(const v of x.observations){
  const gs=Array.from({length:p.heldoutCases},(_,j)=>grid(`${x.seed}:heldout:${v.t}:${j}`,v.mode));
  held.push({light:evaluate(LIGHT,gs).passed,heavy:evaluate(HEAVY,gs).passed});
  if(v.switched){const old=v.mode===1?3:1,incumbent=old===1?LIGHT:HEAVY;
   const a=evaluate(incumbent,Array.from({length:p.shockCases},(_,j)=>grid(`${x.seed}:shock:${v.t}:${j}`,old))).passed;
   const b=evaluate(incumbent,Array.from({length:p.shockCases},(_,j)=>grid(`${x.seed}:shock:${v.t}:${j}`,v.mode))).passed;
   shocks.push({t:v.t,oldMode:old,newMode:v.mode,before:a,after:b,breakdown:a-b>=2});}
 }
 episodes.push({partition,index:n,flip,seedHash:sha(x.seed),observations:x.observations,yoked:{seedHash:sha(y.seed),observations:y.observations},orders,arms,swapChecks,heldout:held,shocks});
}
const result={schema:'amelia.warp-gate-causal-dataset/v1',status:'COMPLETE',lineage:id,index,registrationSha256:sha(pb),choiceSha256:sha(cb),runSha256:sha(rb),checkpointSha256:sha(raw),scriptSha256:sha(readFileSync(process.argv[1])),episodes};
writeFileSync(join(outDir,'result.json'),JSON.stringify(result)+'\n');console.log(JSON.stringify({status:'COMPLETE',lineage:id,episodes:episodes.length}));
