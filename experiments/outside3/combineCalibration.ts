/** OUTSIDE-3 synthetic Stage 1 calibration consolidation, with fixed thresholds. */
import {readFileSync,writeFileSync,readdirSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='experiments/outside3',dir=root+'/calibration-output';
const bPath=root+'/TLOCK_FEASIBILITY.md';
const bVerified=existsSync(bPath)&&readFileSync(bPath,'utf8').includes('Gate outcome: PASS (software demonstration)');
const frozenBytes=readFileSync(root+'/design-output/constants.frozen.json');
const frozen=JSON.parse(frozenBytes.toString());
const files=readdirSync(dir).filter(x=>/^(K[1-5]|CURVE)-[0-9]+\.json$/.test(x));
const parsed=files.map(name=>JSON.parse(readFileSync(dir+'/'+name,'utf8')));
const get=(key:string)=>parsed.filter(x=>x.mode===key).sort((a,b)=>a.shard-b.shard);
for(const kind of ['K1','K2','K3','K4','K5','CURVE'])if(!get(kind).length)throw Error('MISSING_'+kind);
const flat=(mode:string)=>get(mode).flatMap((x:any)=>x.result.series??[]);
const k1=get('K1')[0].result.checks,k2=flat('K2'),k3=flat('K3'),k4=flat('K4'),k5=flat('K5');
if(k1[0].casts!==1000||k2.length!==1000||k3.length!==200||k4.length!==200||k5.length<1)
 throw Error('SHARD_COUNT_FAILURE '+JSON.stringify({k2:k2.length,k3:k3.length,k4:k4.length,k5:k5.length}));
const frequency=(rows:any[],prop:string)=>rows.filter(x=>!!x[prop]).length/rows.length;
const thresholds=frozen.thresholds;
const outcome:any={
 K1:{status:k1.every((c:any)=>c.distinctRankings>=thresholds.K1.minDistinctCRankings&&
   c.tieCastRate<=thresholds.K1.maximumTieFraction&&c.rankBandEntropy>0)?'PASS':'FAIL',steps:k1},
 K2:{p1Rate:frequency(k2,'rejectP1'),p2Rate:frequency(k2,'rejectP2'),series:k2.length},
 K3:{cRate:frequency(k3,'rejectC'),series:k3.length},
 K4:{cRate:frequency(k4,'rejectC'),mRate:frequency(k4,'rejectM'),series:k4.length},
 K5:{series:k5.length,checkpoints:thresholds.K5.checkpoints.map((w:number)=>({
   working:w,
   perturbationMeanRankDifference:k5.reduce((s:number,x:any)=>
     s+x.checks.find((y:any)=>y.working===w).perturbationRankDifference,0)/k5.length,
   meanCMRankDifference:k5.reduce((s:number,x:any)=>
     s+x.cmAtCheckpoints.find((y:any)=>y.w===w).cm,0)/k5.length
 }))},
 curve:get('CURVE').flatMap((x:any)=>x.result.curve)
};
outcome.K2.status=outcome.K2.p1Rate<=thresholds.K2.maxNullRejectionRate&&
  outcome.K2.p2Rate<=thresholds.K2.maxNullRejectionRate?'PASS':'FAIL';
outcome.K3.status=outcome.K3.cRate>=thresholds.K3.minCDetectionRate?'PASS':'FAIL';
outcome.K4.status=outcome.K4.cRate>=thresholds.K4.minCDetectionRate&&
  outcome.K4.mRate<=thresholds.K4.maxMDetectionRate?'PASS':'FAIL';
outcome.K5.status=outcome.K5.checkpoints.every((x:any)=>
  x.perturbationMeanRankDifference>=thresholds.K5.minMeanRankDifference)?'PASS':'FAIL';
const outcomeStatus=['K1','K2','K3','K4','K5'].every(k=>outcome[k].status==='PASS');
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex');
const result={
 schema:'OUTSIDE3_STAGE1_SYNTHETIC_REPORT_V1',
 workOrderSha256:'1b1b0b74b385d607aa5a77a4462bf0809aadb6f26f2f8bd3f8170e4ead0a01ac',
 status:'CALIBRATION_ONLY_NOT_REGISTRATION',realTargetGenerated:false,realWorkingOpened:false,
 frozenDesignSha256:sha(frozenBytes),codeCommit:process.env.OUTSIDE3_CALIBRATION_SHA??process.env.GITHUB_SHA??'UNKNOWN',
 outcome,allKPassed:outcomeStatus,B_gate:bVerified?'PASS_GO_JS_SYNTHETIC_QUICKNET_RUN_39304200180':'NOT_VERIFIED',
 note:'Synthetic implants do not demonstrate hidden-target information access.'
};
mkdirSync(root+'/report-output',{recursive:true});
writeFileSync(root+'/report-output/CALIBRATION.json',JSON.stringify(result,null,2)+'\n');
const lines=[
'# OUTSIDE-3 Stage 1 report — synthetic calibration',
'',
'NO REAL TARGET GENERATED. NO REAL WORKING OPENED. REGISTRATION REMAINS CLOSED.',
'',
'Run source SHA: '+result.codeCommit,
'Fixed design SHA-256: '+result.frozenDesignSha256,
'Unchanged work order SHA-256: '+result.workOrderSha256,
'',
'## A — Reader and four arms',
'All four arms receive identical six-line casts. C carries PFM, M resets only PFM once per working, G uses a fixed degree-preserving rewire, Raw ranks by resulting-hexagram agreement. Thirty unguided steps, 64 doubled mid-ranks. The replay smoke must pass independently.',
'',
'## B — Time-lock gate',
'Time-lock gate status: '+(bVerified?'PASS — synthetic Go/TS Quicknet crossover, ciphertext + secret-salt commitment evidence; see TLOCK_FEASIBILITY.md and run #39304200180.':'NOT VERIFIED — registration prohibited.'),
'',
'## C — Pre-frozen constants',
'delta '+frozen.constants.delta+', magnitude '+frozen.constants.magnitude+', steps '+frozen.constants.steps+
', reference seed '+frozen.constants.referenceSeed+', rewiring seed '+frozen.constants.rewireSeed,
'Reference activation means: '+JSON.stringify(frozen.constants.meanReference),
'All thresholds were frozen before these K-checks:',
JSON.stringify(thresholds,null,2),
'',
'K1 automated status checks frozen diversity, tie rate and entropy only. Hexagram-specific rank-band balance is reported descriptively but has no frozen per-band tolerance; do not claim full K1 uniform coverage or approve registration solely from this PASS.',
'',
'## K gate outcomes',
'| Gate | Verdict | Measurements |',
'|---|---|---|',
'| K1 | '+outcome.K1.status+' | '+k1.map((x:any)=>x.step+': '+x.distinctRankings+' rankings; entropy '+x.rankBandEntropy.toFixed(3)).join('; ')+' |',
'| K2 | '+outcome.K2.status+' | P1 rate '+outcome.K2.p1Rate.toFixed(4)+'; P2 rate '+outcome.K2.p2Rate.toFixed(4)+'; 1000 null series |',
'| K3 | '+outcome.K3.status+' | C detection '+outcome.K3.cRate.toFixed(4)+'; 200 series |',
'| K4 | '+outcome.K4.status+' | C detection '+outcome.K4.cRate.toFixed(4)+'; M detection '+outcome.K4.mRate.toFixed(4)+'; 200 series |',
'| K5 | '+outcome.K5.status+' | '+outcome.K5.checkpoints.map((x:any)=>'W'+x.working+' difference '+x.perturbationMeanRankDifference.toPrecision(4)).join('; ')+' |',
'',
'## Descriptive share-of-workings signal plant',
...outcome.curve.map((x:any)=>'- proportion '+x.fraction+': '+x.rejections+'/'+x.series+' rejection, rate '+x.rate.toFixed(4)),
'',
'## Decision',
outcomeStatus?'K1–K5 meet frozen software thresholds.':'At least one predeclared K-check FAILED. DO NOT RETUNE under this calibration.',
'',
'Numerical null: each ranking supplies all 64 conditional doubled mid-rank scores; finite-support null convolution is evaluated using floating FFT. No Gaussian approximation. An independent exact arithmetic or numerical error-bound audit is required for registration.',
'',
'This is a deterministic synthetic software calibration, not evidence of access to a hidden existing target.',
'Both operator and reviewer must accept a completed B gate and Stage 1 report before any registration.',
''
];
writeFileSync(root+'/report-output/STAGE1_REPORT.md',lines.join('\n'));
writeFileSync(root+'/STAGE1_REPORT.md',lines.join('\n'));
for(const f of ['CALIBRATION.json','STAGE1_REPORT.md']){
  const bytes=readFileSync(root+'/report-output/'+f);
  writeFileSync(root+'/report-output/'+f+'.sha256',sha(bytes)+'  '+f+'\n');
}
console.log('STAGE1_SYNTHETIC_GATE',JSON.stringify({allKPassed:outcomeStatus,k1:outcome.K1.status,
 k2:outcome.K2.status,k3:outcome.K3.status,k4:outcome.K4.status,k5:outcome.K5.status}));
