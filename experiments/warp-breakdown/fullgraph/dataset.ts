/** Full native graph, matched loop, common displacement, and memory interventions. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {sha} from '../dynamic/common.ts';
import {prepare} from '../dynamic/prepare.mjs';
import {generate} from './environment.ts';
import {initialize,restore,decision,reward,branch,globalReadout} from './controller.mjs';
const [checkpoint,regPath,runPath,outDir]=process.argv.slice(2);assert.ok(outDir);
const db=readFileSync(checkpoint),pb=readFileSync(regPath),rb=readFileSync(runPath),p=JSON.parse(pb.toString()),run=JSON.parse(rb.toString());assert.equal(p.schema,'amelia.fullgraph-registration/v1');assert.equal(run.schema,'amelia.fullgraph-run/v1');assert.equal(run.registrationSha256,sha(pb));assert.equal(sha(db),p.checkpointSha256);assert.equal(sha(readFileSync(process.argv[1])),p.scripts['dataset.ts']);
const i=Number(process.env.WARP_FULLGRAPH_ORIGIN),id=p.lineages[i],state=JSON.parse(db.toString()).amelias[id];assert.ok(state);const pre=prepare(state).native,episodes:any[]=[];mkdirSync(outDir,{recursive:false});
const clip=(x:number)=>Math.max(-1,Math.min(1,x));
for(let n=0;n<p.pairs;n++)for(const flip of [0,1]){
 const env=generate(run.seed,id,run.phase,n,flip,p.trainRounds,p.postRounds),training:any={},post:any[]=[],directTraining:any={};
 for(const route of ['warp','native27','matched27']){
  const real=initialize(pre,route),donor=initialize(pre,route),baseV=structuredClone(real.L.V);assert.deepEqual(baseV,donor.L.V);
  const graph=real.fullState().runtime.qabbalaGates.map((g:any)=>`${g.source}>${g.target}`).sort();assert.equal(graph.length,route==='matched27'?24:29);
  let tracks:any={real:[],donor:[]};
  for(const row of env.trainRows)for(const [name,r] of [['real',real],['donor',donor]] as const){
   const d=decision(r),score=row[name][d.action],change=reward(r,d,score);tracks[name].push({...d,score,change});
  }
  const realState=real.fullState(),donorState=donor.fullState();training[route]={baseV,graph,tracks,baseVHash:sha(JSON.stringify(baseV)),realVHash:sha(JSON.stringify(realState.L.V)),donorVHash:sha(JSON.stringify(donorState.L.V)),realState,donorState};
 }
 const origins=Object.fromEntries(Object.entries(training).map(([route,v]:any)=>[route,v.realState.runtime.currentZone]));
 const neutral=[1,4,8],ordered=neutral.slice(env.shockOffset).concat(neutral.slice(0,env.shockOffset)),shocks=ordered.filter(z=>!Object.values(origins).includes(z));assert.ok(shocks.length>=1);assert.ok(shocks.every(z=>!Object.values(origins).includes(z)));
 for(const route of ['warp','native27','matched27'])for(const shock of [null,...shocks])for(const memory of ['retain','reset','donor'])for(const scenario of ['same','reversed']){
  const displacement=shock===null?'sham':'displaced';
  const info=training[route],x=branch(info.realState,route,memory,info.baseV,info.donorState.L.V,shock),steps:any[]=[];
  for(const row of env.postRows){const d=decision(x.r),score=row[scenario][d.action],global=row.t<p.withholdRounds?globalReadout(x.r):null,globalScore=global===null?null:row[scenario][global.action],change=row.t>=p.withholdRounds?reward(x.r,d,score):null;steps.push({...d,score,global,globalScore,change});}
  post.push({route,displacement,memory,scenario,preZone:x.originalZone,shockZone:x.shockZone,boundaryProof:x.proof,steps});
 }
 for(const trainingKind of ['real','donor']){
  let q=[0,0];const steps=[];for(const row of env.trainRows){const action=Number(q[1]>q[0]),score=row[trainingKind][action],before=[...q];q=q.map((v,j)=>clip(.75*v+(score-1)*(j===action?1:-1)));steps.push({action,score,before,after:[...q]});}
  directTraining[trainingKind]={q,steps};
 }
 const directPost:any[]=[];
 for(const memory of ['retain','reset','donor'])for(const scenario of ['same','reversed']){
  let q=memory==='reset'?[0,0]:[...directTraining[memory==='donor'?'donor':'real'].q],steps=[];
  for(const row of env.postRows){const action=Number(q[1]>q[0]),score=row[scenario][action],before=[...q];if(row.t>=p.withholdRounds)q=q.map((v,j)=>clip(.75*v+(score-1)*(j===action?1:-1)));steps.push({action,score,before,after:[...q]});}
  directPost.push({memory,scenario,steps});
 }
 // Branch invariants were checked on exact clones; future grid values were never supplied to a decision.
 for(const route of Object.keys(training)){delete training[route].realState;delete training[route].donorState;}
 episodes.push({n,flip,env,shocks,origins,training,post,directTraining,directPost});
}
const out={schema:'amelia.fullgraph-dataset/v1',status:'COMPLETE',lineage:id,index:i,checkpointSha256:sha(db),registrationSha256:sha(pb),runSha256:sha(rb),episodes};writeFileSync(join(outDir,'result.json'),JSON.stringify(out)+'\n');console.log(JSON.stringify({lineage:id,episodes:episodes.length,phase:run.phase}));
