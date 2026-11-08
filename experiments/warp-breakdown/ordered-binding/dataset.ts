/** Balanced held-out sequence-binding histories on actual Oracle copies. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {sha,randi} from '../dynamic/common.ts';
import {prepare} from '../dynamic/prepare.mjs';
import {restore} from '../fullgraph/controller.mjs';
import {setup,inputEvent,shock,memory,variant,probe,hostRoute,DirectRecurrent} from './pipeline.mjs';
const [checkpoint,regPath,runPath,outDir]=process.argv.slice(2);assert.ok(outDir);const db=readFileSync(checkpoint),pb=readFileSync(regPath),rb=readFileSync(runPath),p=JSON.parse(pb.toString()),run=JSON.parse(rb.toString());
assert.equal(p.schema,'amelia.order-registration/v1');assert.equal(run.schema,'amelia.order-run/v1');assert.equal(run.registrationSha256,sha(pb));assert.equal(sha(db),p.checkpointSha256);assert.equal(sha(readFileSync(process.argv[1])),p.scripts['dataset.ts']);
const i=Number(process.env.WARP_ORDER_ORIGIN),id=p.lineages[i],source=JSON.parse(db.toString()).amelias[id];assert.ok(source);const pre=prepare(source).native,episodes:any[]=[];mkdirSync(outDir,{recursive:false});
for(let n=0;n<p.pairs;n++){
 const seed=sha(`${run.seed}:${id}:${run.phase}:${n}`),anchor=randi(`${seed}:anchor`,3),pair=[0,1,2].filter(x=>x!==anchor).sort((a,b)=>a-b),sequences=[[anchor,...pair],[anchor,...pair.slice().reverse()]],groups:any={};
 for(const oldFlip of [0,1])for(const newFlip of [0,1]){
  const old=sequences[oldFlip],next=sequences[newFlip],key=`${oldFlip}:${newFlip}`,runs:any={};
  for(const route of ['warp','matched27','direct_host']){
   const r=setup(pre,route),initial=r.fullState(),capacities={zones:Object.keys(initial.runtime.qabbalaZones).length,house:Object.fromEntries(['V','S','D'].map(k=>[k,Object.keys(initial.L[k]).length])),gates:initial.runtime.qabbalaGates.length,openGates:initial.runtime.qabbalaGates.filter((g:any)=>g.isOpen).length,taskSlots:6,taskNodes:2};
   const first=old.map(token=>inputEvent(r,route,token)),host=r.fullState();assert.ok(![1,4,8].includes(host.runtime.currentZone));
   for(const zone of [1,4,8]){
    const noise=Array.from({length:6},(_,j)=>(randi(`${seed}:noise:${zone}:${j}`,9)-4)*.06),b=shock(host,route,zone,noise),second=next.map(token=>inputEvent(b.r,route,token)),post=b.r.fullState();
    runs[`${route}:${zone}`]={route,zone,noise,capacities,origin:host.runtime.currentZone,first,shockProof:b.proof,shockBefore:b.before,shockAfter:b.after,second,postMemory:memory(b.r,route),state:post};
   }
  }
  const standalone:any={};for(const zone of [1,4,8]){
   const noise=Array.from({length:6},(_,j)=>(randi(`${seed}:noise:${zone}:${j}`,9)-4)*.06),d=new DirectRecurrent(),first=old.map(t=>d.input(t)),disturbance=d.disturb(noise),second=next.map(t=>d.input(t));standalone[String(zone)]={noise,first,disturbance,second,postMemory:[...d.v]};
  }
  groups[key]={oldFlip,newFlip,old,next,runs,standalone};
 }
 for(const oldFlip of [0,1])for(const newFlip of [0,1]){
  const key=`${oldFlip}:${newFlip}`,g=groups[key],donor=groups[`${1-oldFlip}:${newFlip}`],arms:any[]=[];
  for(const route of ['warp','matched27','direct_host'])for(const zone of [1,4,8]){
   const x=g.runs[`${route}:${zone}`],donorMemory=donor.runs[`${route}:${zone}`].postMemory,results:any=[];
   for(const kind of ['retain','reset','donor']){
    const v=variant(x.state,route,kind,donorMemory),host=v.r.fullState(),probes:any[]=[];
    for(const context of ['old','new'])for(const options of [pair,pair.slice().reverse()]){
     const q=probe(host,route,context,options[0],options[1],route==='direct_host'?'direct':'gate'),seq=context==='old'?g.old:g.next,target=Number(seq.indexOf(options[0])>seq.indexOf(options[1]));
     probes.push({...q,target,correct:Number(q.action===target)});
    }
    results.push({kind,proof:v.proof,probes});
   }
   const {state,...safe}=x;arms.push({...safe,results});
  }
  const direct:any[]=[];for(const zone of [1,4,8]){
   const x=g.standalone[String(zone)],donorMemory=donor.standalone[String(zone)].postMemory,results:any=[];
   for(const kind of ['retain','reset','donor']){
    const v=kind==='retain'?x.postMemory:kind==='reset'?[0,0,0,0,0,0]:donorMemory,d=new DirectRecurrent(v),probes:any[]=[];
    for(const context of ['old','new'])for(const options of [pair,pair.slice().reverse()]){
     const q=d.probe(context,options[0],options[1]),seq=context==='old'?g.old:g.next,target=Number(seq.indexOf(options[0])>seq.indexOf(options[1]));probes.push({...q,target,correct:Number(q.action===target)});
    }
    results.push({kind,probes});
   }
   direct.push({zone,...x,results});
  }
  episodes.push({n,oldFlip,newFlip,switched:oldFlip!==newFlip,anchor,pair,old:g.old,next:g.next,seedHash:sha(seed),arms,direct});
 }
}
const out={schema:'amelia.order-dataset/v1',status:'COMPLETE',lineage:id,index:i,checkpointSha256:sha(db),registrationSha256:sha(pb),runSha256:sha(rb),episodes};writeFileSync(join(outDir,'result.json'),JSON.stringify(out)+'\n');console.log(JSON.stringify({lineage:id,episodes:episodes.length,phase:run.phase}));
