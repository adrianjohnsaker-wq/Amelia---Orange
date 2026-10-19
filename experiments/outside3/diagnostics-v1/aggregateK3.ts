/** OUTSIDE-3 v1 K3 synthetic-only explanatory aggregation. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='experiments/outside3',out=root+'/diagnostics-v1/output';
const sha=(b:string)=>createHash('sha256').update(b).digest('hex');
const shards=[0,1].map(i=>{
  const bytes=readFileSync(out+'/K3-DIAG-00'+i+'.json','utf8');
  const x=JSON.parse(bytes);
  assert.equal(x.schema,'OUTSIDE3_V1_K3_SUPPLEMENT_2026_10_19');
  assert.equal(x.aggregate.series,100);
  assert.equal(x.aggregate.shard,i);
  return {data:x,sha256:sha(bytes)};
});
const rows=shards.flatMap(x=>x.data.series);
assert.equal(rows.length,200);
assert.equal(new Set(rows.map(x=>x.seriesSeed)).size,200);
assert(rows.every(x=>x.originalK3Replayed));
const hits=(arm:'Raw'|'C0'|'C30')=>rows.filter(x=>x.outcomes[arm].reject).length;
const mean=(f:(x:any)=>number)=>rows.reduce((sum,x)=>sum+f(x),0)/rows.length;
const raw=hits('Raw'),before=hits('C0'),after=hits('C30');
assert.equal(after,11,'Original v1 K3 result must be 11/200');
assert.equal(shards[0].data.originalFrozenConstantsSha256,shards[1].data.originalFrozenConstantsSha256);
const report={
  schema:'OUTSIDE3_V1_POSTCALIBRATION_K3_SUPPLEMENT',
  status:'DIAGNOSTIC_ONLY_NO_REVISED_GATE',
  sourceCommit:process.env.GITHUB_SHA||'LOCAL',
  frozenConstantsSha256:shards[0].data.originalFrozenConstantsSha256,
  allOriginalK3RowsReproduced:true,
  series:200,workings:17600,
  detection:{
    Raw:{hits:raw,rate:raw/200,meanTargetRank:mean(x=>x.outcomes.Raw.meanTargetRank)},
    CStep0:{hits:before,rate:before/200,meanTargetRank:mean(x=>x.outcomes.C0.meanTargetRank)},
    CStep30:{hits:after,rate:after/200,meanTargetRank:mean(x=>x.outcomes.C30.meanTargetRank)}
  },
  difference:{
    meanAbsoluteFullRankingChange:mean(x=>x.meanAbsRankChange),
    meanTargetRankShift30Minus0:mean(x=>x.targetRankShift),
    zeroBetterWorkingCount:rows.reduce((a,x)=>a+x.rank0BetterCount,0),
    thirtyBetterWorkingCount:rows.reduce((a,x)=>a+x.rank30BetterCount,0)
  },
  shardSha256:shards.map(x=>x.sha256),
  v1K3:'FAIL_0.055_VS_0.25',v1K4:'FAIL_0.200_VS_0.25',
  realTargetGenerated:false,registrationOpen:false,
  perSeries:rows.map(x=>({
    seed:x.seriesSeed,pRaw:x.outcomes.Raw.p1,
    pC0:x.outcomes.C0.p1,pC30:x.outcomes.C30.p1,
    meanRankRaw:x.outcomes.Raw.meanTargetRank,
    meanRankC0:x.outcomes.C0.meanTargetRank,
    meanRankC30:x.outcomes.C30.meanTargetRank,
    meanAbsoluteRankingChange:x.meanAbsRankChange,
    meanTargetRankShift30Minus0:x.targetRankShift
  }))
};
const dir=root+'/diagnostics-v1';
mkdirSync(dir,{recursive:true});
const data=JSON.stringify(report,null,2)+'\n';
writeFileSync(dir+'/K3_DIAGNOSTIC_RESULTS.json',data);
const md=[
 '# OUTSIDE-3 Stage 1 v1 K3 supplementary diagnostics',
 '',
 'Post-calibration explanation only. Predeclared K3 and K4 failures are unchanged; NO RETUNING. No real target generated; registration remains closed.',
 '',
 '## Same original 200 K3 synthetic series',
 'Exactly the original planted casts, target draws and PRNG streams were used. Every recomputed C step-30 p-value and rejection flag was checked against the archived original K3 observations.',
 '',
 '| Arm/readout | Rejections / 200 | Rate | Mean target mid-rank |',
 '|---|---:|---:|---:|',
 ...(['Raw','CStep0','CStep30'] as const).map(a=>{
  const x=report.detection[a];return '| '+a+' | '+x.hits+'/200 | '+x.rate.toFixed(4)+' | '+x.meanTargetRank.toFixed(4)+' |';
 }),
 '',
 'Step 0 means immediately after v1 cast entry but before endogenous development. V1 moving-line event append does not immediately update zone activations, so its step-0 ranking is calculated from the exact initial polarity orientation and the frozen six reference activations. C step 30 is the original carried-memory output.',
 '',
 'Mean absolute all-64-rank change from step 0 to 30: '+report.difference.meanAbsoluteFullRankingChange.toFixed(6)+' ordinary rank units.',
 'Mean target rank shift (step 30 minus step 0; positive = deterioration): '+report.difference.meanTargetRankShift30Minus0.toFixed(6)+' ordinary rank units.',
 'Working-level comparisons with step 0 better: '+report.difference.zeroBetterWorkingCount+' / 17,600; step 30 better: '+report.difference.thirtyBetterWorkingCount+' / 17,600.',
 '',
 '## Constraints',
 'The original floating-FFT v1 finite-support p-value calculation was reused for strict comparability. Diagnostic rates are post hoc; they do not substitute for preregistered thresholds or genuine hidden-target access. All 200 per-series values are archived in K3_DIAGNOSTIC_RESULTS.json; full working records are in the associated GitHub Actions artifacts.',
 'V1 remains FAILED at K3 (5.5% vs required 25%) and K4 (20% C vs required 25%).',
 '',
 'Frozen v1 constants SHA-256: '+report.frozenConstantsSha256,
 'Shard input SHA-256: '+report.shardSha256.join(' / '),
 '',
 '**Decision: v1 FAILED; future v2 work requires independent design and calibration.**',
 ''
].join('\n');
writeFileSync(dir+'/STAGE1_K3_SUPPLEMENT.md',md);
writeFileSync(dir+'/SHA256SUMS.txt',sha(data)+'  K3_DIAGNOSTIC_RESULTS.json\n'+sha(md)+'  STAGE1_K3_SUPPLEMENT.md\n');
console.log('V1_K3_SUPPLEMENT_AGGREGATED',JSON.stringify(report.detection),JSON.stringify(report.difference));
