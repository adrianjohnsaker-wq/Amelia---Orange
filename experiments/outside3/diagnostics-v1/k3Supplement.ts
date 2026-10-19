/**
 * OUTSIDE-3 v1 retrospective diagnostics, SYNTHETIC ONLY.
 * NO modification to original v1 reader, frozen constants or K3 observations.
 *
 * Uses the exact archived K3 seeds/cast-plant generation procedure.
 * A checkpoint under the frozen calibration is mandatory: every recomputed C p1
 * must match the archived K3 record. A mismatch fails the entire diagnostic.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Outside3Reader, rng, randomCast, ranks, type Cast, type Constants } from '../reader';
import { INITIAL_ZONES } from '../../../src/ai/numogram/AmeliaQabbalaInterface';
import { pValues } from '../exact';

const root = 'experiments/outside3';
const original = JSON.parse(readFileSync(root+'/design-output/constants.frozen.json','utf8')) as {
  schema: string; constants: Constants; syntheticSeeds: Record<string, number>;
  thresholds: Record<string,unknown>
};
assert.equal(original.schema,'OUTSIDE3_DESIGN_FROZEN_V1');
assert.equal(original.constants.steps,30);
assert.equal(original.syntheticSeeds.k3,43103);
const shard=Number(process.argv[2]), count=Number(process.argv[3]);
if(!Number.isInteger(shard)||![0,1].includes(shard)||count!==100) throw Error('V1_DIAGNOSTIC_REQUIRES_SHARD_0_OR_1_AND_COUNT_100');
const digest = (text:string)=>createHash('sha256').update(text).digest('hex');
const frozenBytes=readFileSync(root+'/design-output/constants.frozen.json');
const archived=JSON.parse(readFileSync(root+'/calibration-output/K3-'+String(shard).padStart(3,'0')+'.json','utf8'));
assert.equal(archived.mode,'K3');
assert.equal(archived.result.series.length,count);
const archivedBySeed=new Map<number,any>(archived.result.series.map((x:any)=>[x.series,x]));
assert.equal(archivedBySeed.size,count);

type RecordWithTarget = {target:number;rank2:{C:number[];Raw:number[]}};
function readAtZero(cast:Cast, config:Constants):number[] {
  // v1 applyCast first replaces six activations with canonical ±delta. The
  // subsequently appended moving-line PFM events do not mutate activations,
  // so this is the exact state after entry and before the first step().
  const activated = cast.map((v,i)=>{
    const zone=[1,2,4,8,7,5][i];
    const yang=v===7||v===9;
    return Math.max(0.04,Math.min(0.98,INITIAL_ZONES[zone].activation+(yang?config.delta:-config.delta)));
  });
  const centered=activated.map((v,i)=>v-config.meanReference[i]);
  const scores=Array.from({length:64},(_,h)=>
    centered.reduce((sum,v,i)=>sum+((h>>i)&1?1:-1)*v,0));
  return ranks(scores);
}
function oneSeries(seriesSeed:number) {
  const cr=rng(seriesSeed*397+11);
  const targets=rng(seriesSeed*397+29);
  const plantChoice=rng(seriesSeed*397+37);
  const reader=new Outside3Reader(original.constants);
  const at0:RecordWithTarget[]=[],at30:RecordWithTarget[]=[],raw:RecordWithTarget[]=[];
  const workingMetrics: {
    working:number;target:number;line:number;cast:Cast;
    rank0:number;rank30:number;rankRaw:number;
    meanAbsRankingChange:number;
  }[]=[];
  for(let w=0;w<88;w++) {
    const target=Math.floor(targets()*64);
    const cast=randomCast(cr);
    // Match v1 calibration.ts EXACTLY, including the first RNG consumption.
    const plant=plantChoice()<1;
    assert(plant);
    const line=Math.floor(plantChoice()*6);
    const bit=(target>>line)&1;
    cast[line]=bit?7:8; // non-moving, controlled synthetic plant
    const before=reader.export();
    assert(before.C && before.G);
    const zero=readAtZero(cast,original.constants);
    const end=reader.run(cast);
    const changed=end.rank2.C.reduce((s,r,h)=>s+Math.abs(r-zero[h]),0)/64/2;
    const sample={target,rank2:{C:end.rank2.C,Raw:end.rank2.Raw}};
    at30.push(sample);
    at0.push({target,rank2:{C:zero,Raw:end.rank2.Raw}});
    raw.push({target,rank2:{C:end.rank2.Raw,Raw:end.rank2.Raw}});
    workingMetrics.push({working:w+1,target,line:line+1,cast:[...cast] as Cast,
      rank0:zero[target],rank30:end.rank2.C[target],rankRaw:end.rank2.Raw[target],
      meanAbsRankingChange:changed});
  }
  const p30=pValues(at30),p0=pValues(at0),pRaw=pValues(raw);
  const expected=archivedBySeed.get(seriesSeed);
  assert(expected, 'ARCHIVED_K3_SEED_MISSING '+seriesSeed);
  assert(Math.abs(p30.p1-expected.p1)<1e-9,
    'K3_REPLAY_P1_MISMATCH '+seriesSeed+' '+p30.p1+' '+expected.p1);
  assert.equal(p30.p1<=.05,expected.rejectC,'K3_REPLAY_DECISION_MISMATCH '+seriesSeed);
  return {
    seriesSeed, originalK3Replayed:true,
    outcomes:{
      C0:{p1:p0.p1,reject:p0.p1<=.05,meanTargetRank:p0.meanRankC},
      C30:{p1:p30.p1,reject:p30.p1<=.05,meanTargetRank:p30.meanRankC},
      Raw:{p1:pRaw.p1,reject:pRaw.p1<=.05,meanTargetRank:pRaw.meanRankC}
    },
    meanAbsRankChange:workingMetrics.reduce((sum,x)=>sum+x.meanAbsRankingChange,0)/88,
    targetRankShift:workingMetrics.reduce((sum,x)=>sum+(x.rank30-x.rank0),0)/88/2,
    rank0BetterCount:workingMetrics.filter(x=>x.rank0<x.rank30).length,
    rank30BetterCount:workingMetrics.filter(x=>x.rank30<x.rank0).length,
    workingMetrics
  };
}
const records=[];
for(let i=0;i<count;i++) {
  const seed=original.syntheticSeeds.k3+shard*count+i;
  records.push(oneSeries(seed));
  if((i+1)%10===0) console.log('V1_K3_DIAGNOSTIC_PROGRESS',shard,i+1);
}
assert(records.every(r=>r.originalK3Replayed));
const aggregate={
  shard,series:records.length,workings:records.length*88,
  originalC30RejectionRate:records.filter(x=>x.outcomes.C30.reject).length/count,
  rawRejectionRate:records.filter(x=>x.outcomes.Raw.reject).length/count,
  zeroStepRejectionRate:records.filter(x=>x.outcomes.C0.reject).length/count,
  meanTargetRank:{C0:records.reduce((a,x)=>a+x.outcomes.C0.meanTargetRank,0)/count,
    C30:records.reduce((a,x)=>a+x.outcomes.C30.meanTargetRank,0)/count,
    Raw:records.reduce((a,x)=>a+x.outcomes.Raw.meanTargetRank,0)/count},
  meanAbsRankChange:records.reduce((a,x)=>a+x.meanAbsRankChange,0)/count,
  meanTargetRankShift30Minus0:records.reduce((a,x)=>a+x.targetRankShift,0)/count,
  rank0BetterWorkings:records.reduce((a,x)=>a+x.rank0BetterCount,0),
  rank30BetterWorkings:records.reduce((a,x)=>a+x.rank30BetterCount,0)
};
const output={
  schema:'OUTSIDE3_V1_K3_SUPPLEMENT_2026_10_19',classification:'POST_CALIBRATION_DIAGNOSTIC_NOT_GATE',
  realTargetGenerated:false,registrationOpen:false,
  originalFrozenConstantsSha256:digest(frozenBytes.toString()),
  originalCalibrationArtifact:'experiments/outside3/calibration-output/K3-'+String(shard).padStart(3,'0')+'.json',
  sourceCommit:process.env.GITHUB_SHA||'LOCAL',
  series:records,
  aggregate
};
const dest=root+'/diagnostics-v1/output';
mkdirSync(dest,{recursive:true});
const path=dest+'/K3-DIAG-'+String(shard).padStart(3,'0')+'.json';
writeFileSync(path,JSON.stringify(output,null,2)+'\n');
console.log('V1_K3_DIAGNOSTIC_COMPLETE',JSON.stringify(aggregate));
