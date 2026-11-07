/** Run feedback-driven gate choices on real, yoked, and frozen experimental copies. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {prepare} from '../dynamic/prepare.mjs';
import {sha} from '../dynamic/common.ts';
import {generate} from './environment.ts';
import {create,probe} from './controller.mjs';
const [checkpoint,regPath,runPath,outDir]=process.argv.slice(2);assert.ok(outDir);
const db=readFileSync(checkpoint),pb=readFileSync(regPath),rb=readFileSync(runPath),p=JSON.parse(pb.toString()),run=JSON.parse(rb.toString());
assert.equal(p.schema,'amelia.warp-feedback-registration/v1');assert.equal(run.schema,'amelia.warp-feedback-run/v1');assert.equal(run.registrationSha256,sha(pb));assert.equal(sha(db),p.checkpointSha256);assert.equal(sha(readFileSync(process.argv[1])),p.scripts['dataset.ts']);assert.ok(['calibration','evaluation'].includes(run.phase));
const i=Number(process.env.WARP_FEEDBACK_ORIGIN),id=p.lineages[i],state=JSON.parse(db.toString()).amelias[id];assert.ok(state);const pre=prepare(state).native,episodes:any[]=[];mkdirSync(outDir,{recursive:false});
const etas=run.phase==='calibration'?p.candidateEta:[run.eta],pairs=run.phase==='calibration'?p.calibrationPairs:p.evaluationPairs;
for(let n=0;n<pairs;n++)for(const flip of [0,1]){
 const real=generate(run.seed,id,run.phase,n,flip,p.rounds,'real'),yoked=generate(run.seed,id,run.phase,n,flip,p.rounds,'yoked'),arms:any[]=[];
 for(const eta of etas)for(const route of ['warp','matched']){
  const agents=['real','yoked','frozen'].map(k=>create(pre,route,eta,k));const tracks=agents.map(a=>({eta,route,kind:a.kind,steps:[] as any[]}));const probes:any[]=[];
  for(let t=0;t<p.rounds;t++){
   const paths=agents.map(a=>a.prepare());let pr:any=null;if(run.phase==='evaluation'&&t%4===0)pr=probe(agents[0],agents[1]);
   const choices=agents.map((a,j)=>a.decide(paths[j]));if(pr){assert.equal(pr.realAction,choices[0].action);probes.push({t,...pr});}
   for(let j=0;j<agents.length;j++){
    const c=choices[j],actual=real.rows[t].payoffs[c.action],feedback=(agents[j].kind==='yoked'?yoked:real).rows[t].payoffs[c.action],vAfter=agents[j].update(c.action,feedback);
    tracks[j].steps.push({...c,actualPayoff:actual,feedback:agents[j].kind==='frozen'?null:feedback,vAfter});
   }
  }
  for(const x of tracks)arms.push(x);if(probes.length)arms.push({eta,route,kind:'sameStateHouseProbe',probes});
 }
 episodes.push({n,flip,real,yoked,arms});
}
const out={schema:'amelia.warp-feedback-dataset/v1',status:'COMPLETE',lineage:id,index:i,phase:run.phase,checkpointSha256:sha(db),registrationSha256:sha(pb),runSha256:sha(rb),episodes};writeFileSync(join(outDir,'result.json'),JSON.stringify(out)+'\n');console.log(JSON.stringify({phase:run.phase,lineage:id,episodes:episodes.length}));
