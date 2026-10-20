/** D1 design-only aggregator: enforce precommitted nonzero and C–Raw/C–M floors. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='experiments/outside3/v2/d1-output';
const windows=[0,1,3,10,30],starts=[0,50,100,150];
const modes=['ACTIVATION','PFM_STRAIN'] as const;
const floors={meanCRaw:1,meanCM:0.5,changedCRaw:0.10,changedCM:0.10};
const files:any[]=[];
const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
for(const w of windows)for(const s of starts){
 const filename='D1_W'+w+'_S'+s+'.json';
 const raw=readFileSync(root+'/'+filename,'utf8'),x=JSON.parse(raw);
 assert.equal(x.schema,'OUTSIDE3_V2_D1_SYNTHETIC_DESIGN_SHARD_V1');
 assert.equal(x.window,w);assert.equal(x.start,s);assert.equal(x.count,50);
 assert.equal(x.realTargetGenerated,false);assert.equal(x.registrationClosed,true);
 assert.equal(x.series.length,50);
 assert(x.series.every((row:any,k:number)=>row.series===s+k&&row.workings.length===88));
 files.push({filename,sha256:sha(raw),data:x});
}
const candidates:any[]=[];
for(const w of windows){
 const subset=files.filter(x=>x.data.window===w);
 const series=subset.flatMap(x=>x.data.series).sort((a:any,b:any)=>a.series-b.series);
 assert.equal(series.length,200);
 assert.equal(new Set(series.map((x:any)=>x.series)).size,200);
 const rawHits=series.filter((x:any)=>x.outcomes.Raw.hit).length;
 for(const mode of modes){
  const good=series.every((x:any)=>!!x.outcomes[mode]);
  if(!good){
   assert(w===0&&mode==='ACTIVATION','UNEXPECTED_READOUT_INVALID');
   candidates.push({id:mode+'_W'+w,mode,window:w,eligible:false,reason:'ZERO_REFERENCE_SIGMA_AT_WINDOW_ZERO'});
   continue;
  }
  let dRaw=0,dM=0,nRaw=0,nM=0,targetSum=0,hits=0;
  for(const row of series){
   const x=row.outcomes[mode];
   hits+=Number(x.hit);targetSum+=x.meanTargetRank2;
   dRaw+=x.meanDisplacementRaw;nRaw+=x.nonIdenticalRaw;
   dM+=x.meanDisplacementM;nM+=x.nonIdenticalM;
  }
  const stats={
   hits,rawHits,relativeRaw:rawHits?hits/rawHits:null,
   meanTargetRank2:targetSum/200,
   meanDisplacementCRaw:dRaw/200,meanDisplacementCM:dM/200,
   fractionNonidenticalCRaw:nRaw/(200*88),
   fractionNonidenticalCM:nM/(200*88)
  };
  const contributionPassed=
   stats.meanDisplacementCRaw>=floors.meanCRaw&&
   stats.meanDisplacementCM>=floors.meanCM&&
   stats.fractionNonidenticalCRaw>=floors.changedCRaw&&
   stats.fractionNonidenticalCM>=floors.changedCM;
  const eligible=w>=1&&contributionPassed;
  candidates.push({id:mode+'_W'+w,mode,window:w,eligible,
   reason:w===0?'DIAGNOSTIC_WINDOW_ZERO':contributionPassed?'ELIGIBLE':'CONTRIBUTION_FLOOR_FAILED',
   contributionPassed,...stats,
   syntheticK3CalibrationTargetCheckOnly:{
    raw180:rawHits>=180,c50:hits>=50,relative2C:2*hits>=rawHits
   }});
 }
}
const order=(a:any,b:any)=>
 b.hits-a.hits ||
 b.relativeRaw-a.relativeRaw ||
 a.meanTargetRank2-b.meanTargetRank2 ||
 a.window-b.window ||
 (a.mode==='PFM_STRAIN'?-1:1)-(b.mode==='PFM_STRAIN'?-1:1) ||
 a.id.localeCompare(b.id);
const eligible=candidates.filter(x=>x.eligible).sort(order);
const selected=eligible.length?eligible[0]:null;
const report={
 schema:'OUTSIDE3_V2_D1_DESIGN_SELECTION_V1',calibration:false,registrationClosed:true,
 noRealTarget:true,sourceCommit:process.env.GITHUB_SHA||'LOCAL',
 floors,windows,seriesPerWindow:200,workingsPerSeries:88,
 P2Caveat:'Measurable difference from Raw does not establish P2 added predictive value.',
 selected,selection:'PROVISIONAL_SUBJECT_TO_G_ENGINEERING_AND_REVIEW',
 disposition:selected?'D1_PROVISIONAL_DESIGN_NOMINEE':'D1_NO_ELIGIBLE_CANDIDATE',
 candidates,files:files.map(({filename,sha256})=>({filename,sha256})),
 summaries:files.map(({data,filename})=>({
  filename,window:data.window,start:data.start,
  rawHits:data.rawHits,modes:data.summary,
  perSeries:data.series.map((r:any)=>({series:r.series,seed:r.seed,rawHit:r.outcomes.Raw.hit,
   C:Object.fromEntries(Object.entries(r.outcomes).filter(([k])=>k!=='Raw')
    .map(([k,v]:any)=>[k,{hit:v.hit,observed:v.observed,numerator:v.numerator,denominator:v.denominator}]))}))
 }))
};
const json=JSON.stringify(report,null,2)+'\n';
writeFileSync(root+'/D1_DESIGN_RESULT.json',json);
const lines=['# OUTSIDE-3 D1 synthetic-only design selection','',
'**No calibration or registration. Raw and full ranking traces retained in workflow artifacts.**','',
'Precommitted contribution floors: '+JSON.stringify(floors)+'.','',
'| Reader | Window | C hits/200 | Raw hits/200 | C/Raw | Mean C–Raw displacement | Mean C–M displacement | Nonidentical C–Raw | Nonidentical C–M | Eligibility |',
'|---|---:|---:|---:|---:|---:|---:|---:|---:|---|',
...candidates.map(c=>'| '+c.mode+' | '+c.window+' | '+(c.hits??'N/A')+
 ' | '+(c.rawHits??'N/A')+' | '+(c.relativeRaw??'N/A')+
 ' | '+(c.meanDisplacementCRaw??'N/A')+' | '+(c.meanDisplacementCM??'N/A')+
 ' | '+(c.fractionNonidenticalCRaw??'N/A')+' | '+(c.fractionNonidenticalCM??'N/A')+
 ' | '+c.reason+' |'),
'','Disposition: **'+report.disposition+'**.',
'Provisional nominee: '+(selected?selected.id:'NONE')+'.',
'Window 0 is never eligible. Sensitivity is maximized only *subject to* both contribution floors.',
'K3 rewards preservation; P2 measures added value. Differences from Raw/M are not evidence of P2 improvement.',
'G frozen-rewire replay must pass before considering this a design-stage engineering nominee.',
'Fixed future K3 calibration gates are unchanged: Raw >=180, C >=50 and 2C>=Raw on fresh 200-series calibration data.',
'No frozen parameters, no hidden targets, registration closed.',''];
writeFileSync(root+'/D1_DESIGN_RESULT.md',lines.join('\n')+'\n');
console.log('D1_DESIGN_AGGREGATED',JSON.stringify({disposition:report.disposition,selected:selected?.id??null,eligibleCount:eligible.length}));
