/** OUTSIDE-3 v2 D1 design-seed sensitivity: 50-series shard. No calibration. */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {exactP1,assertExactTinyCases} from './d1Exact';
import {WINDOWS,rng,fresh,clone,enter,observe,reference,makePlant,raw,standardizedRank,displacement,type D1Mode} from './d1Core';
const window=Number(process.argv[2]),start=Number(process.argv[3]),count=Number(process.argv[4]);
assert(WINDOWS.some(x=>x===window),'UNREGISTERED_WINDOW');
assert(Number.isInteger(start)&&start>=0&&start<=150&&start%50===0,'BAD_SHARD_START');
assert.equal(count,50);assertExactTinyCases();
const ref=reference(window);
const modes:['ACTIVATION','PFM_STRAIN']=['ACTIVATION','PFM_STRAIN'];
const valid=modes.filter(m=>ref[m].sigma.every(x=>x>0&&Number.isFinite(x)));
if(window!==0)assert.equal(valid.length,2,'REFERENCE_DEGENERACY');
const evidence:any[]=[];
for(let n=start;n<start+count;n++){
 const seed=9601001+n*1009,random=rng(seed),C=fresh();
 const targets:number[]=[],rawRows:number[][]=[];
 const ranks:Record<string,number[][]>={};
 for(const m of valid){ranks['C_'+m]=[];ranks['M_'+m]=[];}
 const workings:any[]=[];
 for(let w=0;w<88;w++){
  const {target,input,resulting,line}=makePlant(random);
  const M=clone(C.exportState());
  M.getMemory().reset();
  const rawRank=raw(resulting);
  const preCEvents=C.getMemory().getEvents().length;
  const preMEvents=M.getMemory().getEvents().length;
  assert.equal(preMEvents,0);
  enter(C,input,window);enter(M,input,window);
  const row:any={working:w+1,target,resulting,plantedLine:line+1,cast:input,raw:rawRank,C:{},M:{},
    preCEvents,postCEvents:C.getMemory().getEvents().length,
    postMEvents:M.getMemory().getEvents().length};
  for(const mode of valid){
   const c=standardizedRank(observe(C,mode),ref[mode]);
   const m=standardizedRank(observe(M,mode),ref[mode]);
   row.C[mode]=c;row.M[mode]=m;
   ranks['C_'+mode].push(c);ranks['M_'+mode].push(m);
  }
  targets.push(target);rawRows.push(rawRank);workings.push(row);
 }
 const r=exactP1(rawRows,targets);
 const outcomes:any={Raw:{...r,meanTargetRank2:r.observed/88}};
 for(const mode of valid){
  const rows=ranks['C_'+mode],mRows=ranks['M_'+mode],p=exactP1(rows,targets);
  let dRaw=0,dM=0,nonRaw=0,nonM=0;
  for(let w=0;w<88;w++){
   const dc=displacement(rows[w],rawRows[w]),dm=displacement(rows[w],mRows[w]);
   dRaw+=dc;dM+=dm;if(dc>0)nonRaw++;if(dm>0)nonM++;
  }
  outcomes[mode]={...p,meanTargetRank2:p.observed/88,
   meanDisplacementRaw:dRaw/88,meanDisplacementM:dM/88,
   nonIdenticalRaw:nonRaw,nonIdenticalM:nonM};
 }
 evidence.push({series:n,seed,targets,workings,outcomes});
 console.log('D1_DESIGN_SHARD_PROGRESS',window,start,n-start+1);
}
const sum:any={};
for(const mode of valid){
 sum[mode]={
  hits:evidence.filter(s=>s.outcomes[mode].hit).length,
  meanTargetRank2:evidence.reduce((a,s)=>a+s.outcomes[mode].meanTargetRank2,0)/count,
  displacementRaw:evidence.reduce((a,s)=>a+s.outcomes[mode].meanDisplacementRaw,0)/count,
  displacementM:evidence.reduce((a,s)=>a+s.outcomes[mode].meanDisplacementM,0)/count,
  nonIdenticalRaw:evidence.reduce((a,s)=>a+s.outcomes[mode].nonIdenticalRaw,0)/(count*88),
  nonIdenticalM:evidence.reduce((a,s)=>a+s.outcomes[mode].nonIdenticalM,0)/(count*88)
 };
}
const report={schema:'OUTSIDE3_V2_D1_SYNTHETIC_DESIGN_SHARD_V1',
 window,start,count,sourceCommit:process.env.GITHUB_SHA||'LOCAL',
 noCalibration:true,realTargetGenerated:false,registrationClosed:true,
 reference:ref,validModes:valid,rawHits:evidence.filter(s=>s.outcomes.Raw.hit).length,
 summary:sum,series:evidence};
const dir='experiments/outside3/v2/d1-output';
mkdirSync(dir,{recursive:true});
const fname='D1_W'+window+'_S'+start+'.json';
const json=JSON.stringify(report)+'\n';
writeFileSync(dir+'/'+fname,json);
writeFileSync(dir+'/'+fname+'.sha256',createHash('sha256').update(json).digest('hex')+'  '+fname+'\n');
console.log('D1_DESIGN_SHARD_DONE',JSON.stringify({window,start,count,rawHits:report.rawHits,readouts:sum}));
