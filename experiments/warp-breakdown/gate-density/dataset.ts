/** Fresh density-grid test; masks applied after common original sequence and displacement. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {sha,randi} from '../dynamic/common.ts';
import {prepare} from '../dynamic/prepare.mjs';
import {setup,inputEvent as originalInput,shock,memory,variant,DirectRecurrent} from '../ordered-binding/pipeline.mjs';
import {applyMask,wrap,inputEvent,probe} from './model.mjs';
const [checkpoint,regPath,runPath,masksPath,outDir]=process.argv.slice(2);assert.ok(outDir);const db=readFileSync(checkpoint),pb=readFileSync(regPath),rb=readFileSync(runPath),mb=readFileSync(masksPath),p=JSON.parse(pb.toString()),run=JSON.parse(rb.toString()),masks=JSON.parse(mb.toString());
assert.equal(p.schema,'amelia.density-registration/v1');assert.equal(run.schema,'amelia.density-run/v1');assert.equal(run.registrationSha256,sha(pb));assert.equal(sha(db),p.checkpointSha256);assert.equal(sha(mb),p.scripts['masks.json']);assert.equal(sha(readFileSync(process.argv[1])),p.scripts['dataset.ts']);
const i=Number(process.env.WARP_DENSITY_ORIGIN),id=p.lineages[i],source=JSON.parse(db.toString()).amelias[id];assert.ok(source);const pre=prepare(source).native,episodes:any[]=[];mkdirSync(outDir,{recursive:false});
const configs=['sham29','A','B','C','D','matched27','direct_host'];
const mask=(c:string)=>['A','B','C','D'].includes(c)?masks[c]:[];
const route=(c:string)=>c==='matched27'?'matched27':c==='direct_host'?'direct_host':'warp';
for(let n=0;n<p.pairs;n++){
 const seed=sha(`${run.seed}:${id}:${run.phase}:${n}`),anchor=randi(`${seed}:anchor`,3),pair=[0,1,2].filter(x=>x!==anchor).sort((a,b)=>a-b),seqs=[[anchor,...pair],[anchor,...pair.slice().reverse()]],groups:any={};
 for(const oldFlip of [0,1]){
  const initial:any={};for(const rt of ['warp','matched27','direct_host']){
   const r=setup(pre,rt),s=r.fullState(),capacities={zones:Object.keys(s.runtime.qabbalaZones).length,house:Object.fromEntries(['V','S','D'].map(k=>[k,Object.keys(s.L[k]).length])),gates:s.runtime.qabbalaGates.length,openGates:s.runtime.qabbalaGates.filter((g:any)=>g.isOpen).length,taskSlots:6,taskNodes:2};
   const first=seqs[oldFlip].map(t=>originalInput(r,rt,t)),host=r.fullState();assert.ok(![1,4,8].includes(host.runtime.currentZone));initial[rt]={first,host,capacities};
  }
  for(const newFlip of [0,1]){
   const old=seqs[oldFlip],next=seqs[newFlip],runs:any={},standalone:any={};
   for(const config of configs)for(const zone of [1,4,8]){
    const rt=route(config),z=initial[rt],noise=Array.from({length:6},(_,j)=>(randi(`${seed}:noise:${zone}:${j}`,9)-4)*.06),b=shock(z.host,rt,zone,noise);let r=b.r,maskProof=null;
    if(rt==='warp'){const v=applyMask(r.fullState(),mask(config));r=v.r;maskProof=v.proof;}
    const afterMask=r.fullState(),openGates=afterMask.runtime.qabbalaGates.filter((g:any)=>g.isOpen).length;assert.equal(openGates,config==='sham29'||config==='direct_host'?29:24);
    const second=next.map(token=>inputEvent(r,rt,mask(config),token)),post=r.fullState();runs[`${config}:${zone}`]={config,route:rt,zone,noise,capacities:z.capacities,openGates,origin:z.host.runtime.currentZone,first:z.first,shockProof:b.proof,shockBefore:b.before,shockAfter:b.after,maskProof,second,postMemory:memory(r,rt),state:post};
   }
   for(const zone of [1,4,8]){
    const noise=Array.from({length:6},(_,j)=>(randi(`${seed}:noise:${zone}:${j}`,9)-4)*.06),r=new DirectRecurrent(),first=old.map(t=>r.input(t)),disturbance=r.disturb(noise),second=next.map(t=>r.input(t));standalone[String(zone)]={noise,first,disturbance,second,postMemory:[...r.v]};
   }
   groups[`${oldFlip}:${newFlip}`]={oldFlip,newFlip,old,next,runs,standalone};
  }
 }
 for(const oldFlip of [0,1])for(const newFlip of [0,1]){
  const g=groups[`${oldFlip}:${newFlip}`],donor=groups[`${1-oldFlip}:${newFlip}`],arms:any[]=[];
  for(const config of configs)for(const zone of [1,4,8]){
   const x=g.runs[`${config}:${zone}`],donorMemory=donor.runs[`${config}:${zone}`].postMemory,results:any[]=[],directResults:any[]=[];
   for(const kind of ['retain','reset','donor']){
    const z=variant(x.state,x.route,kind,donorMemory),host=wrap(z.r.fullState(),x.route,mask(config)).fullState(),probes:any[]=[],directProbes:any[]=[];
    for(const context of ['old','new'])for(const opts of [pair,pair.slice().reverse()]){
     const q=probe(host,x.route,mask(config),context,opts[0],opts[1],config==='direct_host'?'direct':'gate'),seq=context==='old'?g.old:g.next,target=Number(seq.indexOf(opts[0])>seq.indexOf(opts[1]));probes.push({...q,target,correct:Number(q.action===target)});
     if(['A','B','C','D'].includes(config)){const direct=probe(host,x.route,mask(config),context,opts[0],opts[1],'direct');directProbes.push({...direct,target,correct:Number(direct.action===target)});}
    }
    results.push({kind,proof:z.proof,probes});
    if(directProbes.length)directResults.push({kind,proof:z.proof,probes:directProbes});
   }
   const {state,...safe}=x;arms.push({...safe,results});
   if(directResults.length)arms.push({...safe,config:`${config}_direct`,results:directResults});
  }
  const direct:any[]=[];for(const zone of [1,4,8]){
   const x=g.standalone[String(zone)],donorMemory=donor.standalone[String(zone)].postMemory,results:any[]=[];
   for(const kind of ['retain','reset','donor']){
    const v=kind==='retain'?x.postMemory:kind==='reset'?[0,0,0,0,0,0]:donorMemory,r=new DirectRecurrent(v),probes:any[]=[];
    for(const context of ['old','new'])for(const opts of [pair,pair.slice().reverse()]){const q=r.probe(context,opts[0],opts[1]),seq=context==='old'?g.old:g.next,target=Number(seq.indexOf(opts[0])>seq.indexOf(opts[1]));probes.push({...q,target,correct:Number(q.action===target)});}
    results.push({kind,probes});
   }
   direct.push({zone,...x,results});
  }
  episodes.push({n,oldFlip,newFlip,switched:oldFlip!==newFlip,anchor,pair,old:g.old,next:g.next,seedHash:sha(seed),arms,direct});
 }
}
const out={schema:'amelia.density-dataset/v1',status:'COMPLETE',lineage:id,index:i,checkpointSha256:sha(db),registrationSha256:sha(pb),runSha256:sha(rb),masksSha256:sha(mb),episodes};writeFileSync(join(outDir,'result.json'),JSON.stringify(out)+'\n');console.log(JSON.stringify({lineage:id,episodes:episodes.length,phase:run.phase}));
