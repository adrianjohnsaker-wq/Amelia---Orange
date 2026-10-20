/**
 * PF1-A1 R2: EXACT GRAPH-ONLY null analysis, no Amelia runtime or observations.
 * Usage: node experiments/pf1/PF1_A1_R2_EXACT_NULL.mjs
 * Pure canonical topology arithmetic, with dyadic-integer DP (exact fractions).
 * Writes pre-review graph eligibility and all 0..24 step CDFs. NO re-pilot.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';

const prefix='experiments/pf1/';
const frozen=JSON.parse(readFileSync(prefix+'PF1_A1_R2_CONSTANTS.json','utf8'));
assert.equal(frozen.provenance.rePilotAuthorized,false);
assert.equal(frozen.provenance.liveStartAuthorized,false);
assert.equal(frozen.perturbation.noFreeze,true);
assert.equal(frozen.perturbation.delayTicks,2);
assert.equal(frozen.null.alphaNumerator,1);
assert.equal(frozen.null.alphaDenominator,4);
assert.equal(frozen.encounter.atLeastIntactNullWins,3);
assert.equal(frozen.encounter.recoveryHorizonTicks,24);
assert.equal(frozen.budget.ameliaForksPerCandidateMax,24);

const sha=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const source=readFileSync(frozen.canonicalGraphSource,'utf8');
const section=source.split('export const CANONICAL_GATES')[1]?.split('];')[0];
assert(section,'CANONICAL_GATE_SOURCE_NOT_FOUND');
const rx=/\{\s*id:\s*'([^']+)',\s*source:\s*(\d+),\s*target:\s*(\d+),[^\n]*isOpen:\s*(true|false)/g;
const graph=[];
let m;
while((m=rx.exec(section))!==null){
 if(m[4]==='true')graph.push({source:+m[2],target:+m[3],id:m[1]});
}
assert.equal(graph.length,frozen.canonicalOpenDirectedEdgeCount);
assert.equal(sha(graph),frozen.canonicalGraphSha256,'FROZEN_CANONICAL_GRAPH_HASH_MISMATCH');
const adj=Array.from({length:10},(_,z)=>graph.filter(e=>e.source===z).map(e=>e.target));
assert(adj.every(x=>x.length<=2),'DYADIC_EXACT_DP_REQUIRES_AT_MOST_TWO_EXITS');
const dist=(from,to)=>{
 if(from===to)return 0;
 const q=[[from,0]],seen=new Set([from]);
 for(let i=0;i<q.length;i++){
  const [z,d]=q[i];
  for(const next of adj[z]){
   if(next===to)return d+1;
   if(!seen.has(next)){seen.add(next);q.push([next,d+1]);}
  }
 }
 return Infinity;
};
const cycles=[];
for(let a=0;a<10;a++){
 function visit(path){
  const z=path.at(-1);
  for(const w of adj[z]){
   if(w===a){
    if(path.length<2)continue;
    const trace=[...path,a];
    const ins=trace.slice(1,-1);
    let b=null,best=-1;
    for(const v of ins){
     const d=dist(v,a);
     if(Number.isFinite(d)&&d>best){best=d;b=v;}
    }
    assert.notEqual(b,null);
    cycles.push({anchor:a,turn:b,unorderedPair:[a,b].sort((x,y)=>x-y).join('-'),trace});
   }else if(path.length<10&&!path.includes(w))visit([...path,w]);
  }
 }
 visit([a]);
}
assert.equal(cycles.length,14,'CANONICAL_SIMPLE_CYCLE_COUNT_DIFFERENT');
const names=JSON.parse(readFileSync(frozen.nameTable,'utf8')).entries;
assert.equal(names.length,45);
const byPair=new Map(names.map(x=>[x.key,x]));
assert.equal(byPair.size,45);
const gcd=(a,b)=>b===0?a:gcd(b,a%b);
function rational(num,den){
 if(num===0)return '0/1';
 const g=gcd(num,den);return (num/g)+'/'+(den/g);
}
/**
 * State (z, seenB) tracks a post-intervention b visit.
 * Initial displacement to b DOES NOT set seenB.
 * Every new step is one tick; after visiting b, the FIRST later visit to a
 * is absorbed and the probability added to CDF.
 * Outdegree zero implements absorbing dwell. No input-dependent bonus.
 * DP integer units denominator 2^t, valid because all open degrees are <=2.
 */
function exactNullCurve(start,a,b,horizon){
 let states=new Map([[start+':0',1]]);
 let completed=0;
 const curve=[{t:0,cdf:'0/1',cdfNumerator:0,cdfDenominator:1,
  newRecovery:'0/1',newRecoveryNumerator:0,probability:0}];
 for(let t=1;t<=horizon;t++){
  let newly=0;
  const next=new Map();
  for(const [key,count] of states){
   const [zString,seenString]=key.split(':');
   const z=Number(zString),seen=seenString==='1';
   const outs=adj[z].length?adj[z]:[z];
   const mult=2/outs.length;
   assert(Number.isInteger(mult));
   for(const w of outs){
    const portion=count*mult;
    const touched=seen||w===b;
    if(w===a&&touched)newly+=portion;
    else{
     const state=w+':'+(touched?1:0);
     next.set(state,(next.get(state)||0)+portion);
    }
   }
  }
  const current=completed*2+newly,denom=2**t;
  assert(Number.isSafeInteger(current)&&current<=denom);
  completed=current;states=next;
  const mass=Array.from(states.values()).reduce((s,x)=>s+x,0);
  assert.equal(mass+completed,denom,'MASS_NOT_CONSERVED');
  curve.push({t,cdf:rational(completed,denom),cdfNumerator:completed,
   cdfDenominator:denom,newRecovery:rational(newly,denom),
   newRecoveryNumerator:newly,probability:completed/denom});
 }
 return curve;
}
const rows=[],nullCurves=[],pairsAllowed=[];
for(let a=0;a<10;a++)for(let b=a+1;b<10;b++){
 const key=a+'-'+b,entity=byPair.get(key);
 assert(entity,'PAIR_NOT_IN_CCRU_TABLE '+key);
 const excursions=cycles.filter(x=>x.unorderedPair===key);
 const anchors=[...new Set(excursions.map(x=>x.anchor))].sort((x,y)=>x-y);
 const orientationResults=[];
 for(const anchor of anchors){
  const turn=excursions.find(x=>x.anchor===anchor).turn;
  const instances=[];
  for(let d=0;d<10;d++){
   if(d===anchor||!Number.isFinite(dist(anchor,d))||dist(anchor,d)<2||!Number.isFinite(dist(d,anchor)))continue;
   instances.push({id:'D-'+anchor+'-'+d,kind:'displacement',anchor,turn,startZone:d,
    displacedTo:d,distAnchorToStart:dist(anchor,d),distStartToAnchor:dist(d,anchor)});
  }
  instances.push({id:'L2-'+anchor,kind:'inputDelay',anchor,turn,startZone:anchor,
   delayTicks:frozen.perturbation.delayTicks,walkerInputSensitivity:'none'});
  let qualifying=0;
  for(const x of instances){
   const curve=exactNullCurve(x.startZone,anchor,turn,frozen.encounter.recoveryHorizonTicks);
   const qualifyingTicks=curve.slice(1).filter(r=>r.newRecoveryNumerator>0&&
     r.cdfNumerator*frozen.null.alphaDenominator<=
       r.cdfDenominator*frozen.null.alphaNumerator).map(r=>r.t);
   const first=qualifyingTicks.length?qualifyingTicks[0]:null;
   const tickInfo=first===null?null:curve[first];
   x.nullQualifyingTicks=qualifyingTicks;
   x.firstNullQualifyingTick=first;
   x.firstNullQualifyingCdf=first===null?null:tickInfo.cdf;
   x.graphOnlyWinPossible=first!==null;
   x.p24=curve.at(-1).cdf;
   if(x.graphOnlyWinPossible)qualifying++;
   nullCurves.push({pair:key,entity:entity.name,mesh:entity.mesh,orientation:{anchor,turn},
    instance:x.id,kind:x.kind,startZone:x.startZone,nullPolicy:frozen.null.kind,
    schedule:x.kind==='inputDelay'?'L2, two null-input transition ticks followed by original queue':'immediate resumed state',
    curve});
  }
  const minWins=frozen.encounter.atLeastIntactNullWins;
  orientationResults.push({anchor,turn,excursions:excursions.filter(x=>x.anchor===anchor).map(x=>x.trace),
   totalInstances:instances.length,nullQualifyingInstances:qualifying,
   requiredMemoryWinCountDifference:Math.ceil(instances.length*0.25),
   possiblyMeetsGoal:qualifying>=minWins,instances});
 }
 const potential=orientationResults.some(x=>x.possiblyMeetsGoal);
 if(potential)pairsAllowed.push(key);
 rows.push({key,entity:entity.name,mesh:entity.mesh,scannerValidExcursions:excursions.length,
  anchors,orientations:orientationResults,eligibleByGraphOnlyNull:potential,
  reason:!excursions.length?'NO_SCANNER_VALID_EXCURSION':
   potential?'AT_LEAST_THREE_NULL_QUALIFYING_DISTINCT_INSTANCES':'FEWER_THAN_THREE_NULL_QUALIFYING_INSTANCES'});
}
assert.equal(rows.length,45);
assert.equal(nullCurves.length,rows.reduce((s,x)=>s+x.orientations.reduce((p,o)=>p+o.instances.length,0),0));
assert.deepEqual(pairsAllowed,frozen.controls.positiveEligiblePairsExpected,
 'GRAPH_ONLY_ELIGIBILITY_DISAGREES_WITH_OPERATOR_EXPECTATION');
for(const pair of ['1-8','1-9'])assert(!pairsAllowed.includes(pair));
const expectedFixtures=pairsAllowed.length*frozen.controls.positiveSyntheticSeeds.length;
assert.equal(expectedFixtures,21);
const out={
 schema:'PF1_A1_R2_EXACT_GRAPH_NULL_ELIGIBILITY_V1',status:'MATH_ONLY_NO_AMELIA_RUN',
 frozenConstantsSource:prefix+'PF1_A1_R2_CONSTANTS.json',
 frozenConstantsSha256:sha(readFileSync(prefix+'PF1_A1_R2_CONSTANTS.json')),
 canonicalSource:frozen.canonicalGraphSource,canonicalSourceSha256:sha(source),
 canonicalGraphDigest:sha(graph),directedEdges:graph.map(x=>[x.source,x.target]),
 nullLaw:frozen.null,alpha:'1/4',horizon:frozen.encounter.recoveryHorizonTicks,
 tableSource:frozen.nameTable,allPairs:45,totalCurves:nullCurves.length,cycleCount:cycles.length,
 scannerValidPairCount:rows.filter(x=>x.scannerValidExcursions>0).length,
 eligiblePairs:pairsAllowed,eligiblePairCount:pairsAllowed.length,
 excludedAmbiguousPairs:['1-8','1-9'],positiveFixtureCount:expectedFixtures,
 positiveSeeds:frozen.controls.positiveSyntheticSeeds,
 positivePassCountMinimum:frozen.controls.confirmationMinimumCount,
 rows,noAmeliaDataUsed:true,noExperimentalRun:true,noLiveInput:true,liveAuthorized:false
};
const curves={
 schema:'PF1_A1_R2_EXACT_NULL_CURVES_V1',source:frozen.canonicalGraphSource,
 graphDigest:sha(graph),nullLaw:frozen.null,alpha:'1/4',
 horizon:24,representation:'exact dyadic rational (numerator / denominator = 2^t)',
 allCurves:nullCurves,noAmeliaDataUsed:true
};
mkdirSync(prefix+'a1-r2-graph-only',{recursive:true});
const path1=prefix+'a1-r2-graph-only/ELIGIBILITY_45.json';
const path2=prefix+'a1-r2-graph-only/EXACT_NULL_CURVES.json';
writeFileSync(path1,JSON.stringify(out,null,2)+'\n');
writeFileSync(path2,JSON.stringify(curves,null,2)+'\n');
const fmt=x=>x.orientations.flatMap(o=>o.instances.filter(i=>i.graphOnlyWinPossible)
 .map(i=>i.id+' (t='+i.firstNullQualifyingTick+', P='+i.firstNullQualifyingCdf+')')).join('; ');
const lines=[
 '# PF1-A1 R2 — Exact topological-null graph-only eligibility','',
 '**Mathematical calculation only. No Amelia data, no re-pilot, no live start.**','',
 '- Canonical directed-graph digest: '+out.canonicalGraphDigest,
 '- Frozen constants SHA-256: '+out.frozenConstantsSha256,
 '- 45 unordered pairs; '+cycles.length+' elementary directed excursions; '+out.scannerValidPairCount+' scannable pairs.',
 '- Exact null: uniform choice over open outgoing edges; sink dwell absorbing. Inputs do not change null transitions.',
 '- Via-b recovery requires b after perturbation followed by a (even when displaced initially to b).',
 '- Comparator P(T<=t) computed for all ticks 0..24 by exact dyadic dynamic programming, not Monte Carlo.',
 '- Null-qualified instance iff there exists t<=24 with positive first-recovery mass and cumulative P<=1/4.',
 '- No route-diversity threshold; three different null-qualified perturbation instances required.',
 '','| Pair | Entity | Instance count | Null-qualified | Memory delta count | Graph-only eligible |',
 '|---|---|---:|---:|---:|:---:|',
 ...rows.map(x=>{
  const instances=x.orientations.reduce((s,o)=>s+o.totalInstances,0);
  const winners=x.orientations.reduce((s,o)=>s+o.nullQualifyingInstances,0);
  const thresholds=x.orientations.map(o=>o.requiredMemoryWinCountDifference).join('/');
  return '| '+x.key+' | '+x.entity+' | '+instances+' | '+winners+' | '+(instances?thresholds:'—')+
   ' | '+(x.eligibleByGraphOnlyNull?'YES':'NO')+' |';
 }),
 '','## Null-qualified perturbation instances (witness probabilities)','',
 ...rows.filter(x=>x.scannerValidExcursions>0).map(x=>'- **'+x.key+' '+x.entity+'**: '+(fmt(x)||'none')),
 '','Eligible pairs: '+pairsAllowed.join(', ')+'.',
 'The curves in EXACT_NULL_CURVES.json include all 0..24 tick numerator/denominator values for every intervention instance, not only winning ones.',
 '','## Important limits','',
 '- These are mathematically feasible win times under the fixed uniform null, not Amelia recoveries.',
 '- A successful goal signature still requires three *observed* matched-instance wins, a memory or integration signature, and sham parity.',
 '- Re-pilot and live start remain unauthorised until independent operator review of the sealed constants.',''
];
writeFileSync(prefix+'a1-r2-graph-only/ELIGIBILITY_REPORT.md',lines.join('\n'));
console.log('PF1_A1_R2_GRAPH_ONLY',JSON.stringify({
 allPairs:45,scannable:out.scannerValidPairCount,curves:nullCurves.length,
 eligible:pairsAllowed,counts:rows.filter(x=>x.scannerValidExcursions>0).map(x=>({pair:x.key,
 n:x.orientations.map(o=>o.totalInstances),qualify:x.orientations.map(o=>o.nullQualifyingInstances)})),
 constantsSha256:out.frozenConstantsSha256,graphDigest:out.canonicalGraphDigest}));
