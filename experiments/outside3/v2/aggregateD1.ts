/** D1 design aggregation, independent of v1/D0. No calibration. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const root='experiments/outside3/v2';
const manifestBytes=readFileSync(root+'/D1_MANIFEST.json','utf8');
const manifest=JSON.parse(manifestBytes);
assert.equal(manifest.schema,'OUTSIDE3_V2_D1_DESIGN_MANIFEST_V1');
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const mf=sha(manifestBytes);
const data:any[]=[];
const rawDigests:any[]=[];
for(const candidate of manifest.candidates)for(const window of manifest.windows){
 const prefix='D1_'+candidate+'_W'+window;
 const summaryPath=root+'/d1/output/'+prefix+'.json';
 const rawPath=root+'/d1/output/'+prefix+'.jsonl';
 const digestPath=root+'/d1/output/'+prefix+'.sha256.json';
 const bytes=readFileSync(summaryPath,'utf8');
 const detailBytes=readFileSync(rawPath,'utf8');
 const stored=JSON.parse(readFileSync(digestPath,'utf8'));
 assert.equal(stored.manifestSha256,mf);
 assert.equal(stored.summarySha256,sha(bytes));
 assert.equal(stored.rawJsonlSha256,sha(detailBytes));
 const d=JSON.parse(bytes);
 assert.equal(d.schema,'OUTSIDE3_V2_D1_DESIGN_OPTION_V1');
 assert.equal(d.status,'DESIGN_ONLY_NOT_CALIBRATION_NOT_PARAMETER_FREEZE');
 assert.equal(d.manifestSha256,mf);
 assert.equal(d.candidateId,candidate);
 assert.equal(d.window,window);
 assert.equal(d.noKCalibration,true);
 assert.equal(d.registrationClosed,true);
 assert.equal(d.noRealTargetGenerated,true);
 assert.equal(d.summary.SELECTION.seriesCount,manifest.plantedSignal.cohorts.selection);
 assert.equal(d.summary.HELDOUT_DESIGN.seriesCount,manifest.plantedSignal.cohorts.heldOutDesign);
 assert.equal(d.perSeries.length,manifest.plantedSignal.cohorts.selection+
  manifest.plantedSignal.cohorts.heldOutDesign);
 assert.equal(detailBytes.trim().split('\n').length,d.perSeries.length);
 assert.equal(d.reference.ACTIVATION.mean.length,6);
 assert.equal(d.reference.PFM_STRAIN.sigma.length,6);
 assert(d.reference.ACTIVATION.sigma.every((x:number)=>x>0&&Number.isFinite(x)));
 assert(d.reference.PFM_STRAIN.sigma.every((x:number)=>x>0&&Number.isFinite(x)));
 data.push(d);
 rawDigests.push({candidateId:candidate,window,rawSHA256:sha(detailBytes),summarySHA256:sha(bytes)});
}
assert.equal(data.length,manifest.candidates.length*manifest.windows.length);
for(const cohort of ['SELECTION','HELDOUT_DESIGN']){
 const reference=data[0].perSeries.filter((s:any)=>s.cohort===cohort);
 const rawFirst=data[0].summary[cohort].raw;
 for(const row of data){
  const here=row.perSeries.filter((s:any)=>s.cohort===cohort);
  assert.deepEqual(here.map((s:any)=>[s.seed,s.tapeSha256]),reference.map((s:any)=>[s.seed,s.tapeSha256]),
   'D1_TAPE_DIFFERENCE_BETWEEN_OPTIONS');
  assert.deepEqual(row.summary[cohort].raw,rawFirst,
   'D1_RAW_ARM_MUST_BE_IDENTICAL_ACROSS_OPTIONS');
 }
}
const ranked:any[]=[];
for(const row of data){
 for(const readout of manifest.readouts){
  const selection=row.summary.SELECTION.arms[readout];
  const heldout=row.summary.HELDOUT_DESIGN.arms[readout];
  const margin=row.descriptiveMargins[readout];
  assert(selection&&heldout&&margin);
  ranked.push({
   candidateId:row.candidateId,window:row.window,readout,
   selection:{
    hits:selection.hits,rate:selection.rate,meanTargetRank:selection.meanTargetRank,
    rawHits:row.summary.SELECTION.raw.hits,
    rawRate:row.summary.SELECTION.raw.rate,
    ratioToRaw:selection.ratioToRaw
   },
   heldOutDesign:{
    hits:heldout.hits,rate:heldout.rate,meanTargetRank:heldout.meanTargetRank,
    rawHits:row.summary.HELDOUT_DESIGN.raw.hits,
    rawRate:row.summary.HELDOUT_DESIGN.raw.rate
   },
   descriptiveMargin:{
    minChangedZoneResponse:margin.minChangedZoneResponse,
    minWithinOutputScoreMargin:margin.minWithinOutputScoreMargin,
    zeroResponsePairs:margin.zeroResponsePairs
   }
  });
 }
}
ranked.sort((a,b)=> b.selection.hits-a.selection.hits ||
 a.selection.meanTargetRank-b.selection.meanTargetRank ||
 b.descriptiveMargin.minChangedZoneResponse-a.descriptiveMargin.minChangedZoneResponse ||
 a.window-b.window ||
 a.candidateId.localeCompare(b.candidateId) ||
 a.readout.localeCompare(b.readout));
const best=ranked[0];
assert(best);
const report={
 schema:'OUTSIDE3_V2_D1_DESIGN_RESULT_V1',
 status:'DESIGN_ONLY_PROVISIONAL_CHOICE_NOT_FROZEN_NOT_CALIBRATION',
 manifestSha256:mf,sourceCommit:process.env.GITHUB_SHA??'LOCAL',
 candidates:manifest.candidates.length,windows:manifest.windows.length,
 readouts:manifest.readouts.length,conditions:ranked.length,
 designSelectionSeriesPerOption:manifest.plantedSignal.cohorts.selection,
 heldOutDesignSeriesPerOption:manifest.plantedSignal.cohorts.heldOutDesign,
 selectionMethod:'Selection designs ONLY: hits desc, mean rank asc, descriptive margin desc, window asc, candidate id asc, readout id asc',
 bestProvisionalDesignOption:best,
 allOptions:ranked,
 rawEvidenceDigests:rawDigests,
 noRealTargetGenerated:true,registrationClosed:true,
 v1CalibrationsPreservedFailed:true,
 D0NegativeDesignPreserved:true,
 retired2SigmaDescriptiveOnly:true,
 futureK3Still:{rawHitsAtLeast:180,cHitsAtLeast:50,twiceCHitsAtLeastRaw:true,series:200},
 futureWork:'Independent design review and fresh versioned freeze required before any v2 K1-K5 calibration. This design run cannot validate access to hidden targets.'
};
const dir=root+'/d1';
mkdirSync(dir,{recursive:true});
const json=JSON.stringify(report,null,2)+'\n';
writeFileSync(dir+'/D1_RESULT.json',json);
const tab=[
 '| Candidate | Window | Readout | C detections / 24 | Raw / 24 | C mean target rank | Held-out C / 12 | Worst descriptive Hamming-1 input margin (σ) |',
 '|---|---:|---|---:|---:|---:|---:|---:|',
 ...ranked.map(x=>'| '+x.candidateId+' | '+x.window+' | '+x.readout+
 ' | '+x.selection.hits+'/24 | '+x.selection.rawHits+'/24 | '+
 x.selection.meanTargetRank.toFixed(4)+' | '+x.heldOutDesign.hits+'/12 | '+
 x.descriptiveMargin.minChangedZoneResponse.toPrecision(6)+' |')
];
const md=[
 '# OUTSIDE-3 reader v2 — D1 synthetic sensitivity design report',
 '',
 '> DESIGN ONLY. Not a calibration, parameter freeze, hidden-target trial or registration.',
 '',
 'Design manifest SHA-256: '+mf+'.',
 'Conditions: '+ranked.length+' (six magnitudes × three windows × two parallel readouts). Each option uses 24 shared 88-working selection-design series and 12 disjoint held-out design series.',
 '',
 '## Precommitted design preference (not frozen)',
 '',
 '**'+best.candidateId+' / '+best.window+' steps / '+best.readout+'** is the highest-scoring design-only option under the published lexicographic objective.',
 'Primary count C: '+best.selection.hits+'/24; paired Raw: '+best.selection.rawHits+'/24.',
 'Held-out (not used to select): C '+best.heldOutDesign.hits+'/12, paired Raw '+best.heldOutDesign.rawHits+'/12.',
 '',
 '## All options, including weak and negative results',
 '',
 ...tab,
 '',
 '## Scientific interpretation',
 '',
 'The original D0 ≥2σ worst-case criterion is retired as D1 eligibility by a prior committed design rationale. Both within-output Hamming-1 score margin and between-input standardized feature margin remain in the per-condition evidence as descriptive measurements, including zero or saturated responses.',
 'The planted target is synthetic and intentionally leaked into one cast line by the design generator; success is apparatus sensitivity, never hidden target access.',
 'All p-value decisions are exact integer-frequency BigInt finite-null calculations. Numerator and denominator appear per series; decisions do not depend on floating display rounding.',
 'The raw comparator remains the resulting hexagram. C carries PFM through each 88-working series. Activation and PFM strain are alternate readouts of the same state trajectory, not separate dynamical arms.',
 'Held-out DESIGN values were reported only after selection was calculated from the selection cohort; they cannot change the selection.',
 'Later K3 calibration gates remain Raw≥180/200, C≥50/200, 2*C≥Raw. None have been evaluated here. Earlier v1 K3/K4 failures and the D0 negative design result remain unchanged.',
 '',
 '## Evidentiary limits',
 '',
 'Only six D0 magnitudes and three windows were considered. Pairwise margins used fresh and W88 histories and movement masks 0 and 21, not every possible long-historical state. A design-preferred option is not eligible for real-target use until independent review accepts a new freeze and the complete K1–K5 calibration passes.',
 'No real target generated. Registration closed.',
 ''
].join('\n');
writeFileSync(dir+'/D1_REPORT.md',md);
writeFileSync(dir+'/SHA256SUMS.txt',sha(json)+'  D1_RESULT.json\n'+sha(md)+'  D1_REPORT.md\n');
console.log('OUTSIDE3_D1_GRID_AGGREGATED',JSON.stringify({
 manifestSha256:mf,conditions:ranked.length,best,
 registrationOpen:false,calibration:false
}));
