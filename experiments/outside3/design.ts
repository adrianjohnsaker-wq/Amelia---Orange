/* Stage 1 synthetic DESIGN ONLY.
 * No target, no K1-K5 calibration, no live beacon. Freeze constants in next commit.
 */
import { writeFileSync,mkdirSync } from 'node:fs';
import { Outside3Reader,newRuntime,applyCast,randomCast,rng,digest,type Constants } from './reader';
import { INITIAL_ZONES } from '../../src/ai/numogram/AmeliaQabbalaInterface';
const seed=1337;
const lineZones=[1,2,4,8,7,5] as const;
const casts=Array.from({length:48},()=>randomCast(rng(0))); // revised below with advancing RNG
const next=rng(seed+100);for(let i=0;i<casts.length;i++)casts[i]=randomCast(next);
const baseline:Constants={delta:0,magnitude:0,steps:30,referenceSeed:1337,rewireSeed:2609,
  meanReference:lineZones.map(z=>INITIAL_ZONES[z].activation)};
const grid: {delta:number;magnitude:number;diversity:number;spread:number;memoryResponse:number}[]=[];
for(const delta of [.06,.10,.14]){
 for(const magnitude of [.015,.035,.065]){
  const conf={...baseline,delta,magnitude};
  const unique=new Set<string>(),values:number[][]=[];
  for(const cast of casts){
    const a=newRuntime();
    const x=applyCast(a,cast,conf);
    unique.add(digest(x.ranks));values.push(x.activation);
  }
  const means=lineZones.map((_,i)=>values.reduce((s,x)=>s+x[i],0)/values.length);
  const spread=values.reduce((s,x)=>s+x.reduce((t,v,i)=>t+Math.abs(v-means[i]),0),0)/values.length;
  const a=newRuntime(),b=newRuntime();
  const cast=casts[0];
  const withM=applyCast(a,cast,conf);
  const zero=applyCast(b,cast,{...conf,magnitude:0});
  const memoryResponse=withM.activation.reduce((sum,v,i)=>sum+Math.abs(v-zero.activation[i]),0);
  grid.push({delta,magnitude,diversity:unique.size,spread,memoryResponse});
 }
}
grid.sort((a,b)=> (b.diversity-a.diversity)|| (b.memoryResponse-a.memoryResponse)||a.delta-b.delta);
const winner=grid[0];
const params={...baseline,delta:winner.delta,magnitude:winner.magnitude};
const mean=Array(6).fill(0);
const referenceNext=rng(seed);
for(let i=0;i<1000;i++){
 const c=randomCast(referenceNext),x=applyCast(newRuntime(),c,params);
 for(let k=0;k<6;k++)mean[k]+=x.activation[k]/1000;
}
const frozen={
 schema:'OUTSIDE3_DESIGN_FROZEN_V1',targetSource:'NONE — SYNTHETIC ONLY',
 constants:{...params,meanReference:mean},referenceCastCount:1000,
 designCastCount:casts.length,designGrid:grid,selected:winner,
 syntheticSeeds:{reference:seed,design:seed+100,k1:43101,k2:43102,k3:43103,k4:43104,k5:43105,curve:43106},
 thresholds:{
  K1:{minDistinctCRankings:2,minNonzeroScoreVariance:1e-10,maximumTieFraction:0.90},
  K2:{maxNullRejectionRate:0.065,series:1000},
  K3:{minCDetectionRate:0.25,series:200},
  K4:{minCDetectionRate:0.25,maxMDetectionRate:0.065,series:200},
  K5:{minMeanRankDifference:0.000001,checkpoints:[10,44,88]},
 },
 nullTests:{alpha:0.05,oneSided:true,workingCount:88,
  primaryStatistic:'SUM_DOUBLED_MIDRANK_C',
  addedValueStatistic:'SUM_DOUBLED_MIDRANK_RAW_MINUS_C',
  method:'Finite-support convolution; numerically evaluated exact finite-distribution null, no Gaussian approximation'},
 freezeDigest:'COMPUTED_WITH_SEPARATE_SHA256SUMS',
 note:'Thresholds chosen during design stage; calibration has not yet run.'
};
mkdirSync('experiments/outside3/design-output',{recursive:true});
writeFileSync('experiments/outside3/design-output/constants.frozen.json',JSON.stringify(frozen,null,2)+'\n');
writeFileSync('experiments/outside3/design-output/DESIGN_REPORT.md',
 '# OUTSIDE-3 synthetic-only design\n\nNo real targets, workings or calibration K-checks.\n\n'+
 'Selected delta='+winner.delta+', magnitude='+winner.magnitude+
 ' by lexicographic cast rank-diversity and history-response criterion.\n\n'+
 'Reference mean: '+JSON.stringify(mean)+'\n\n'+
 'Grid: \n\n'+grid.map(r=>JSON.stringify(r)).join('\n')+'\n\n'+
 'Thresholds frozen before K1-K5: '+JSON.stringify(frozen.thresholds)+'\n');
console.log('DESIGN_COMPLETE',JSON.stringify({selected:winner,mu:mean,thresholds:frozen.thresholds}));
