/** Fresh, bounded repeated-reversal experiment on copied Amelia Oracle states. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {sha,randi} from '../dynamic/common.ts';
import {prepare} from '../dynamic/prepare.mjs';
import {generate} from '../fullgraph/environment.ts';
import {initialize,decision as naturalDecision,reward,branch} from '../fullgraph/controller.mjs';
import {decision} from '../syzygy-relay/controller.mjs';
import {ROUTES,MODES,feedback} from './channel.mjs';
const [checkpoint,regPath,runPath,outDir]=process.argv.slice(2);assert.ok(outDir);const db=readFileSync(checkpoint),pb=readFileSync(regPath),rb=readFileSync(runPath),p=JSON.parse(pb.toString()),run=JSON.parse(rb.toString());
assert.equal(p.schema,'amelia.bidir-registration/v1');assert.equal(run.schema,'amelia.bidir-run/v1');assert.equal(run.registrationSha256,sha(pb));assert.equal(sha(db),p.checkpointSha256);assert.equal(sha(readFileSync(process.argv[1])),p.scripts['dataset.ts']);
const i=Number(process.env.WARP_BIDIR_ORIGIN),id=p.lineages[i],state=JSON.parse(db.toString()).amelias[id];assert.ok(state);const pre=prepare(state).native,episodes:any[]=[];mkdirSync(outDir,{recursive:false});
const clip=(x:number)=>Math.max(-1,Math.min(1,x));
for(let n=0;n<p.pairs;n++)for(const flip of [0,1]){
 const env=generate(run.seed,id,run.phase,n,flip,p.trainRounds,p.maxPostRounds);
 const lengths=Array.from({length:p.reversals},(_,k)=>p.minSegment+randi(`${env.seedHash}:bidir-segment:${k}`,p.maxSegment-p.minSegment+1));
 const boundaries:number[]=[];let total=0;for(const length of lengths){boundaries.push(total);total+=length;}assert.ok(total<=env.postRows.length);
 const train:any={},states:any={};
 for(const route of ROUTES){
  const r=initialize(pre,route),baseV=structuredClone(r.L.V),graph=r.fullState().runtime.qabbalaGates.map((g:any)=>`${g.source}>${g.target}`).sort(),track:any[]=[];assert.equal(graph.length,route==='warp'?29:24);
  for(const row of env.trainRows){const d=naturalDecision(r),score=row.real[d.action],change=reward(r,d,score);track.push({...d,score,change});}
  const host=r.fullState();states[route]=host;train[route]={baseVHash:sha(JSON.stringify(baseV)),realVHash:sha(JSON.stringify(host.L.V)),graph,track,origin:host.runtime.currentZone};
 }
 const origins=Object.fromEntries(ROUTES.map(route=>[route,train[route].origin]));const z=[1,4,8],ordered=z.slice(env.shockOffset).concat(z.slice(0,env.shockOffset)),shocks=ordered.filter(x=>!Object.values(origins).includes(x));assert.ok(shocks.length);
 const post:any[]=[];
 for(const route of ROUTES)for(const shock of shocks)for(const mode of MODES){
  const host=states[route],b=branch(host,route,'retain',host.L.V,host.L.V,shock),steps:any[]=[];let segment=0;
  for(let t=0;t<total;t++){
   if(segment+1<boundaries.length&&t===boundaries[segment+1])segment++;const scen=segment%2===0?'reversed':'same',row=env.postRows[t];
   const typ=mode==='natural'?'natural':mode==='global'?'global':mode==='entry'?'entry':'focus_phase';
   const target=mode==='entry'&&t===0?(route==='warp'?3:2):null,d=decision(b.r,route,typ,p.gain,target),score=row[scen][d.action],change=feedback(b.r,d,score,route,mode);
   steps.push({...d,t,segment,lag:t-boundaries[segment]+1,score,change});
  }
  post.push({route,shock,mode,preZone:b.originalZone,boundaryProof:b.proof,steps});
 }
 let q=[0,0],trainDirect:any[]=[];
 for(const row of env.trainRows){const action=Number(q[1]>q[0]),score=row.real[action],before=[...q];q=q.map((v,j)=>clip(.75*v+(score-1)*(j===action?1:-1)));trainDirect.push({action,score,before,after:[...q]});}
 const directTrainQ=[...q],direct:any[]=[];let segment=0;
 for(let t=0;t<total;t++){
  if(segment+1<boundaries.length&&t===boundaries[segment+1])segment++;const scen=segment%2===0?'reversed':'same',row=env.postRows[t],action=Number(q[1]>q[0]),score=row[scen][action],before=[...q];
  q=q.map((v,j)=>clip(.75*v+(score-1)*(j===action?1:-1)));direct.push({t,segment,lag:t-boundaries[segment]+1,action,score,before,after:[...q]});
 }
 episodes.push({n,flip,env,lengths,boundaries,origins,shocks,train,post,directTrainQ,trainDirect,direct});
}
const out={schema:'amelia.bidir-dataset/v1',status:'COMPLETE',lineage:id,index:i,checkpointSha256:sha(db),registrationSha256:sha(pb),runSha256:sha(rb),episodes};writeFileSync(join(outDir,'result.json'),JSON.stringify(out)+'\n');console.log(JSON.stringify({lineage:id,episodes:episodes.length,phase:run.phase}));
