/** Fast retrospective K3 diagnostic from archived C30 records, exact v1 synthetic casts.
 * No re-execution of C30: C30 p-values and mean rank remain the archived numbers.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {rng,randomCast,ranks,rawRanks,type Cast} from '../reader';
import {INITIAL_ZONES} from '../../../src/ai/numogram/AmeliaQabbalaInterface';
import {pValues} from '../exact';
const root='experiments/outside3';
const frozen=JSON.parse(readFileSync(root+'/design-output/constants.frozen.json','utf8'));
assert.equal(frozen.schema,'OUTSIDE3_DESIGN_FROZEN_V1');
assert.equal(frozen.constants.steps,30);
const zones=[1,2,4,8,7,5] as const;
const centering=frozen.constants.meanReference;
function readAt0(cast:Cast) {
 const active=cast.map((v,i)=>Math.max(.04,Math.min(.98,INITIAL_ZONES[zones[i]].activation+
  ((v===7||v===9)?frozen.constants.delta:-frozen.constants.delta))));
 const centered=active.map((v,i)=>v-centering[i]);
 return ranks(Array.from({length:64},(_,h)=>centered.reduce(
  (sum,v,i)=>sum+((h>>i)&1?1:-1)*v,0)));
}
const archived=[0,1].flatMap(shard=>{
 const x=JSON.parse(readFileSync(root+'/calibration-output/K3-'+String(shard).padStart(3,'0')+'.json','utf8'));
 assert.equal(x.mode,'K3');
 assert.equal(x.result.series.length,100);
 return x.result.series;
});
assert.equal(archived.length,200);
const rows=[];
for(const old of archived) {
 const seed=old.series;
 const cr=rng(seed*397+11),targets=rng(seed*397+29),pc=rng(seed*397+37);
 const zero=[],raw=[];
 let zeroSum=0,rawSum=0;
 for(let w=0;w<88;w++){
  const target=Math.floor(targets()*64);
  const cast=randomCast(cr);
  assert(pc()<1);
  const line=Math.floor(pc()*6);
  cast[line]=((target>>line)&1)?7:8;
  const z=readAt0(cast),r=rawRanks(cast.reduce((sum,v,i)=>{
    const bit=v===7||v===9?1:0,moving=v===6||v===9?1:0;
    return sum|((bit^moving)<<i);
  },0));
  zero.push({target,rank2:{C:z,Raw:r}});
  raw.push({target,rank2:{C:r,Raw:r}});
  zeroSum+=z[target]/2;rawSum+=r[target]/2;
 }
 const z=pValues(zero),r=pValues(raw);
 assert(Math.abs(z.meanRankC-zeroSum/88)<1e-9);
 assert(Math.abs(r.meanRankC-rawSum/88)<1e-9);
 rows.push({seed,pRaw:r.p1,pC0:z.p1,pC30Archived:old.p1,
  meanRankRaw:r.meanRankC,meanRankC0:z.meanRankC,meanRankC30Archived:old.meanC,
  rawReject:r.p1<=.05,C0Reject:z.p1<=.05,C30Reject:old.rejectC});
}
assert.equal(rows.filter(x=>x.C30Reject).length,11);
const hits=(key:'rawReject'|'C0Reject'|'C30Reject')=>rows.filter(x=>x[key]).length;
const mean=(f:(x:any)=>number)=>rows.reduce((sum,x)=>sum+f(x),0)/rows.length;
const results={
 schema:'OUTSIDE3_V1_K3_FAST_RETROSPECTIVE_DIAGNOSTIC',
 scope:'Raw and step0 deterministic reconstruction, C30 read from immutable original K3 calibration',
 realTargetGenerated:false,registrationOpen:false,frozenConstantsUnchanged:true,
 originalK3C30Rejections:11,
 detection:{
  Raw:{hits:hits('rawReject'),rate:hits('rawReject')/200,meanTargetRank:mean(x=>x.meanRankRaw)},
  CStep0:{hits:hits('C0Reject'),rate:hits('C0Reject')/200,meanTargetRank:mean(x=>x.meanRankC0)},
  CStep30_Original:{hits:hits('C30Reject'),rate:hits('C30Reject')/200,meanTargetRank:mean(x=>x.meanRankC30Archived)}
 },
 pairedSeries:{meanTargetRankShift30Minus0:mean(x=>x.meanRankC30Archived-x.meanRankC0),
  meanTargetRankShift30MinusRaw:mean(x=>x.meanRankC30Archived-x.meanRankRaw)},
 rows
};
const dir=root+'/diagnostics-v1/fast-output';
mkdirSync(dir,{recursive:true});
writeFileSync(dir+'/FAST_K3_RESULTS.json',JSON.stringify(results,null,2)+'\n');
const md=[
 '# OUTSIDE-3 v1 K3 supplementary fast diagnostic',
 '',
 'Post-calibration explanation, no revised gate. All 200 original synthetic K3 series. Raw and C step 0 recalculated from frozen v1 cast entry; C step 30 results read unchanged from the original archived K3-000 and K3-001 outputs. This is NOT an independent C30 replay.',
 '',
 '| Readout | Rejections / 200 | Rate | Mean planted-target rank |',
 '|---|---:|---:|---:|',
 ...Object.entries(results.detection).map(([key,v])=>'| '+key+' | '+v.hits+'/200 | '+v.rate.toFixed(4)+' | '+v.meanTargetRank.toFixed(4)+' |'),
 '',
 'Mean planted-target rank difference (C30 minus C0; positive means the target fell in rank): '+results.pairedSeries.meanTargetRankShift30Minus0.toFixed(4)+'.',
 '',
 'This comparison uses the same v1 floating FFT null calculation and same synthetic seeds and plant RNG; step 0 precedes substrate development. Full paired 64-hexagram rank trajectories require replay and are not inferred here.',
 '',
 'Original v1 K3: FAIL 11/200 = 0.055, threshold 0.25. Original v1 K4: FAIL C 0.200 vs 0.25. No retuning. No real target generated; OUTSIDE-3 registration remains CLOSED.',
 ''
].join('\n');
writeFileSync(dir+'/FAST_K3_REPORT.md',md);
console.log('OUTSIDE3_V1_K3_FAST_SUPPLEMENT',JSON.stringify(results.detection),JSON.stringify(results.pairedSeries));
