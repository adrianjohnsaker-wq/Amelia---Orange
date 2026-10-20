/**
 * OUTSIDE-3 v2 D1: synthetic-only, manifest-pinned paired design sensitivity.
 *
 * - Six Option A PFM events enter before unguided development.
 * - Same running substrate yields BOTH activation and strain readouts.
 * - One synthetic target line is planted in the cast; targets are NEVER passed
 *   to the target-blind reader or PFM code.
 * - Exact BigInt P1, 88 workings, original K3 calibration thresholds untouched.
 * - D1 is DESIGN ONLY; data may select a candidate, not validate hidden access.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {rng,randomCast} from '../reader';
import {bitsFromCast,castFromPrimaryAndMoving,encodeCastToPFM,
 type SixLineCast,type PFMEncodingMagnitudes} from './castEncoding';
import {exactP1LowerTail} from './exactIntegerNull';
import {freshRuntime,runtimeClone,appendAndDevelop,observable,moments,
 rankingFromState,rawRanksForCast,standardized,
 type ReadoutName,type Standardization,type SixVector} from './d1DualReader';
import type {AmeliaNumogramSubstrateRuntime} from '../../../src/substrate/ameliaNumogramSubstrateRuntime';

const ROOT='experiments/outside3/v2';
const manifestBytes=readFileSync(ROOT+'/D1_MANIFEST.json','utf8');
const manifest=JSON.parse(manifestBytes);
assert.equal(manifest.schema,'OUTSIDE3_V2_D1_DESIGN_MANIFEST_V1');
const prior=JSON.parse(readFileSync(ROOT+'/D0_DESIGN_GRID.json','utf8'));
const immutable=JSON.parse(readFileSync(ROOT+'/K3_GATE_FIXED.json','utf8'));
assert.equal(immutable.successConditions.rawHitsAtLeast,180);
assert.equal(immutable.successConditions.cHitsAtLeast,50);
assert.equal(immutable.successConditions.twiceCHitsAtLeastRawHits,true);
assert.equal(prior.candidates.length,6);
const sha=(text:string)=>createHash('sha256').update(text).digest('hex');
const candidateId=process.argv[2];
const window=Number(process.argv[3]);
if(!manifest.candidates.includes(candidateId)||!manifest.windows.includes(window))
 throw Error('D1_MANIFEST_ONLY_CANDIDATE_AND_WINDOW');
const candidateRecord=prior.candidates.find((c:any)=>c.id===candidateId);
assert(candidateRecord);
const params:PFMEncodingMagnitudes={
 yin:candidateRecord.yin,yang:candidateRecord.yang,movement:candidateRecord.movement,
 phaseCoherence:candidateRecord.phaseCoherence,strainRelaxation:candidateRecord.strainRelaxation
};
const names:ReadoutName[]=['ACTIVATION','PFM_STRAIN'];
const referenceSeed=manifest.reference.seed+window*104729;
const rr=rng(referenceSeed);
const refs:{ACTIVATION:SixVector[];PFM_STRAIN:SixVector[]}={ACTIVATION:[],PFM_STRAIN:[]};
for(let k=0;k<manifest.reference.sampleCountPerCandidateWindow;k++){
 const rt=freshRuntime();
 appendAndDevelop(rt,randomCast(rr) as SixLineCast,params,window);
 refs.ACTIVATION.push(observable(rt,'ACTIVATION'));
 refs.PFM_STRAIN.push(observable(rt,'PFM_STRAIN'));
}
const norms:Record<ReadoutName,Standardization>={
 ACTIVATION:moments(refs.ACTIVATION),
 PFM_STRAIN:moments(refs.PFM_STRAIN)
};

function generateTape(seed:number){
 const castsRng=rng((Math.imul(seed,397)+11)>>>0);
 const targetsRng=rng((Math.imul(seed,397)+29)>>>0);
 const plantRng=rng((Math.imul(seed,397)+37)>>>0);
 const rows:{cast:SixLineCast;target:number;plantedLine:number}[]=[];
 for(let w=0;w<manifest.plantedSignal.workingsPerSeries;w++){
  const target=Math.floor(targetsRng()*64);
  const plantedLine=Math.floor(plantRng()*6);
  const cast=randomCast(castsRng) as SixLineCast;
  // The synthetic generator alone knows the target. The reader receives only
  // the resulting edited cast with one non-moving polarity plant (7 or 8).
  const changed=[...cast] as number[];
  changed[plantedLine]=(target&(1<<plantedLine))?7:8;
  rows.push({cast:changed as unknown as SixLineCast,target,plantedLine:plantedLine+1});
 }
 return rows;
}
type CompletedSeries=ReturnType<typeof runSeries>;
function runSeries(seed:number,cohort:'SELECTION'|'HELDOUT_DESIGN'){
 const tape=generateTape(seed);
 const rt=freshRuntime();
 const profiles:Record<ReadoutName,number[][]>={ACTIVATION:[],PFM_STRAIN:[]};
 const rawProfiles:number[][]=[];
 const targetRanks:Record<ReadoutName,number[]>={ACTIVATION:[],PFM_STRAIN:[]};
 let saturatedWorkings=0;
 const rawRows:any[]=[];
 const trace=[];
 for(let w=0;w<tape.length;w++){
  const entry=tape[w];
  const encoded=bitsFromCast(entry.cast);
  assert.equal((encoded.resulting>>(entry.plantedLine-1))&1,
    (entry.target>>(entry.plantedLine-1))&1,'PLANTED_LINE_RESULT_POLARITY_MISMATCH');
  appendAndDevelop(rt,entry.cast,params,window);
  const ranks:Record<ReadoutName,number[]>={} as any;
  const tieCounts:Record<ReadoutName,number>={} as any;
  for(const name of names){
   const o=rankingFromState(rt,name,norms[name]);
   profiles[name].push(o.rank2);
   targetRanks[name].push(o.rank2[entry.target]);
   ranks[name]=o.rank2;
   tieCounts[name]=o.ties;
  }
  const raw=rawRanksForCast(entry.cast);
  rawProfiles.push(raw);
  if(rt.getMemory().exportState().zoneStrainHistory.some(x=>x>=1))saturatedWorkings++;
  rawRows.push(raw[entry.target]);
  trace.push({
   working:w+1,
   syntheticTarget:entry.target,
   plantedLine:entry.plantedLine,
   cast:entry.cast,
   resulting:encoded.resulting,
   rank2Raw:raw,
   rank2Activation:ranks.ACTIVATION,
   rank2PFMStrain:ranks.PFM_STRAIN,
   rank2AtTarget:{
    Raw:raw[entry.target],
    ACTIVATION:ranks.ACTIVATION[entry.target],
    PFM_STRAIN:ranks.PFM_STRAIN[entry.target]
   },
   scoreTies:tieCounts,
   pfmEventCount:rt.getMemory().getEvents().length
  });
 }
 const rawP=exactP1LowerTail(rawProfiles,rawRows);
 const scored=Object.fromEntries(names.map(name=>{
  const out=exactP1LowerTail(profiles[name],targetRanks[name]);
  return [name,{...out,meanTargetRank:targetRanks[name].reduce((a,b)=>a+b,0)/2/tape.length}];
 })) as Record<ReadoutName,ReturnType<typeof exactP1LowerTail>&{meanTargetRank:number}>;
 const transcript=JSON.stringify(tape);
 return {
  seed,cohort,workings:tape.length,tapeSha256:sha(transcript),
  raw:{...rawP,meanTargetRank:rawRows.reduce((a,b)=>a+b,0)/2/tape.length},
  scored,saturatedWorkings,
  historyLength:rt.getMemory().getEvents().length,
  memoryHeadDigest:rt.getMemory().exportHistoryDigest(),
  trace
 };
}
/**
 * D1 margin repeats all 192 resulting-bit Hamming-1 edges at each mask,
 * for both readouts on fresh state and after a carried 88-working history.
 * Descriptive only, NOT a threshold or eligibility condition.
 */
function margins(){
 const historyRt=freshRuntime();
 const historical=[
  {name:'FRESH',state:historyRt.exportState()}
 ];
 const historyRng=rng(manifest.margin.historySeed);
 for(let i=1;i<=88;i++){
  appendAndDevelop(historyRt,randomCast(historyRng) as SixLineCast,params,
    manifest.margin.historyStepsPerWorking);
 }
 historical.push({name:'W88',state:historyRt.exportState()});
 const results:any[]=[];
 for(const h of historical)for(const mask of manifest.margin.masks){
  const metrics:Record<ReadoutName,any>={
   ACTIVATION:{minChanged:Infinity,minWithin:Infinity,zeroResponses:0,minVectorMax:Infinity,worstInput:null},
   PFM_STRAIN:{minChanged:Infinity,minWithin:Infinity,zeroResponses:0,minVectorMax:Infinity,worstInput:null}
  };
  let n=0;
  for(let line=0;line<6;line++)for(let low=0;low<64;low++){
   if(low&(1<<line))continue;
   const higher=low^(1<<line);
   const c0=castFromPrimaryAndMoving(low^mask,mask);
   const c1=castFromPrimaryAndMoving(higher^mask,mask);
   const r0=runtimeClone(h.state),r1=runtimeClone(h.state);
   appendAndDevelop(r0,c0,params,window);
   appendAndDevelop(r1,c1,params,window);
   for(const name of names){
    const a=rankingFromState(r0,name,norms[name]);
    const b=rankingFromState(r1,name,norms[name]);
    const changed=Math.abs(a.standardized[line]-b.standardized[line]);
    const max=Math.max(...a.standardized.map((v,i)=>Math.abs(v-b.standardized[i])));
    const outputMargin=Math.min(a.minHamming1ScoreMargin,b.minHamming1ScoreMargin);
    const m=metrics[name];
    if(changed<m.minChanged){
     m.minChanged=changed;
     m.worstInput={low,higher,line:line+1,mask,
       rawFeatureA:a.feature[line],rawFeatureB:b.feature[line],
       normalizedA:a.standardized[line],normalizedB:b.standardized[line]};
    }
    if(max<m.minVectorMax)m.minVectorMax=max;
    if(outputMargin<m.minWithin)m.minWithin=outputMargin;
    if(changed===0)m.zeroResponses++;
   }
   n++;
  }
  assert.equal(n,192);
  results.push({history:h.name,mask,pairs:n,readouts:metrics});
 }
 return results;
}
const series:any[]=[];
const cohorts=[
 {label:'SELECTION' as const,count:manifest.plantedSignal.cohorts.selection,base:manifest.plantedSignal.selectionSeriesSeedBase},
 {label:'HELDOUT_DESIGN' as const,count:manifest.plantedSignal.cohorts.heldOutDesign,base:manifest.plantedSignal.heldOutSeriesSeedBase}
];
for(const c of cohorts){
 for(let i=0;i<c.count;i++){
  const seed=c.base+i*manifest.plantedSignal.seriesSeedStride;
  const result=runSeries(seed,c.label);
  series.push(result);
  console.log('OUTSIDE3_D1_SERIES',JSON.stringify({
   candidateId,window,cohort:c.label,completed:i+1,
   seed,
   rawReject:result.raw.rejectAt005,
   activationReject:result.scored.ACTIVATION.rejectAt005,
   pfmReject:result.scored.PFM_STRAIN.rejectAt005
  }));
 }
}
const diagnosticMargin=margins();
const summary:Record<string,any>={};
for(const cohort of ['SELECTION','HELDOUT_DESIGN'] as const){
 const rows=series.filter(s=>s.cohort===cohort);
 const base=rows[0];
 const rawHits=rows.filter(s=>s.raw.rejectAt005).length;
 const rawMean=rows.reduce((sum,s)=>sum+s.raw.meanTargetRank,0)/rows.length;
 const arms:Record<ReadoutName,any>={} as any;
 for(const name of names){
  const hits=rows.filter(s=>s.scored[name].rejectAt005).length;
  arms[name]={
   hits,rate:hits/rows.length,
   meanTargetRank:rows.reduce((sum,s)=>sum+s.scored[name].meanTargetRank,0)/rows.length,
   pairedRawRate:rawHits/rows.length,
   ratioToRaw:rawHits?hits/rawHits:null,
   meanRankDeltaVsRaw:rows.reduce((sum,s)=>sum+s.scored[name].meanTargetRank-s.raw.meanTargetRank,0)/rows.length,
   meanSaturatedWorkings:rows.reduce((sum,s)=>sum+s.saturatedWorkings,0)/rows.length
  };
 }
 summary[cohort]={seriesCount:rows.length,raw:{hits:rawHits,rate:rawHits/rows.length,
  meanTargetRank:rawMean},arms};
}
const overallMargins:Object=Object.fromEntries(names.map(name=>[
 name,{
  minChangedZoneResponse:Math.min(...diagnosticMargin.map(x=>x.readouts[name].minChanged)),
  minWithinOutputScoreMargin:Math.min(...diagnosticMargin.map(x=>x.readouts[name].minWithin)),
  zeroResponsePairs:diagnosticMargin.reduce((sum,x)=>sum+x.readouts[name].zeroResponses,0)
 }
]));
const record={
 schema:'OUTSIDE3_V2_D1_DESIGN_OPTION_V1',
 status:'DESIGN_ONLY_NOT_CALIBRATION_NOT_PARAMETER_FREEZE',
 manifestSha256:sha(manifestBytes),sourceCommit:process.env.GITHUB_SHA||'LOCAL',
 candidateId,window,params,
 reference:{
  seed:referenceSeed,
  sampleCount:manifest.reference.sampleCountPerCandidateWindow,
  ACTIVATION:norms.ACTIVATION,PFM_STRAIN:norms.PFM_STRAIN
 },
 summary,margin:diagnosticMargin,descriptiveMargins:overallMargins,
 perSeries:series.map(s=>({
  seed:s.seed,cohort:s.cohort,workings:s.workings,
  tapeSha256:s.tapeSha256,
  raw:s.raw,scored:s.scored,
  saturatedWorkings:s.saturatedWorkings,
  historyLength:s.historyLength,memoryHeadDigest:s.memoryHeadDigest
 })),
 noRealTargetGenerated:true,noKCalibration:true,registrationClosed:true
};
const dir=ROOT+'/d1/output';
mkdirSync(dir,{recursive:true});
const basename='D1_'+candidateId+'_W'+window;
const overview=JSON.stringify(record,null,2)+'\n';
const raw=series.map(s=>JSON.stringify({
 candidateId,window,seed:s.seed,cohort:s.cohort,
 tapeSha256:s.tapeSha256,trace:s.trace
})).join('\n')+'\n';
writeFileSync(dir+'/'+basename+'.json',overview);
writeFileSync(dir+'/'+basename+'.jsonl',raw);
const shaResult={
 summarySha256:sha(overview),rawJsonlSha256:sha(raw),
 manifestSha256:sha(manifestBytes),candidateId,window
};
writeFileSync(dir+'/'+basename+'.sha256.json',JSON.stringify(shaResult,null,2)+'\n');
console.log('OUTSIDE3_V2_D1_OPTION_COMPLETE',JSON.stringify({
 candidateId,window,
 manifestSha256:sha(manifestBytes),
 selection:summary.SELECTION,
 heldOut:summary.HELDOUT_DESIGN,
 descriptiveMargins:overallMargins,
 rawSha256:shaResult.rawJsonlSha256,
 noCalibration:true
}));
