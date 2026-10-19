/**
 * OUTSIDE-3 v2 D0 DESIGN-ONLY grid aggregator.
 * No calibration, no real targets, no parameter freeze. Negative outputs retained.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const root='experiments/outside3/v2';
const bytes=readFileSync(root+'/D0_DESIGN_GRID.json','utf8');
const plan=JSON.parse(bytes);
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
assert.equal(plan.schema,'OUTSIDE3_V2_D0_SYNTHETIC_DESIGN_GRID_V1');
assert.equal(plan.candidates.length,6);
const records=plan.candidates.map((c:any)=>{
 const content=readFileSync(root+'/design-grid/output/'+c.id+'/D0_CANDIDATE.json','utf8');
 const data=JSON.parse(content);
 assert.equal(data.candidateId,c.id);
 assert.equal(data.manifestSha256,sha(bytes));
 assert.equal(data.groupsOfResults.length,plan.windows.length*plan.checkpoints.length);
 assert.equal(data.designOnly,true);
 assert.equal(data.calibrationExecuted,false);
 assert.equal(data.noRealTarget,true);
 assert.deepEqual(data.diagnosticWindows,plan.windows);
 for(const row of data.groupsOfResults){
  assert.equal(row.scenarios.length,plan.masks.length);
  assert(row.scenarios.every((s:any)=>s.pairs===192&&
   Number.isFinite(s.minimumChangedZoneResponseStandardized)&&
   Number.isFinite(s.minimumWithinOutputHamming1ScoreMargin)));
 }
 return {id:c.id,contentSha256:sha(content),data};
});
const candidates=records.map((r:any)=>{
 const rows=plan.windows.map((w:number)=>{
  const matched=r.data.groupsOfResults.filter((x:any)=>x.developmentWindow===w);
  assert.equal(matched.length,6);
  const minResponse=Math.min(...matched.map((x:any)=>x.overallMinChangedZoneMargin));
  const minWithin=Math.min(...matched.map((x:any)=>x.overallMinScoreMargin));
  return {
   window:w,
   minimumChangedZoneStandardizedMargin:minResponse,
   minimumWithinOutputStandardizedScoreMargin:minWithin,
   meetsPredeclaredMarginGate:minResponse>=plan.minimumStandardizedMarginFactor&&
     (plan.minimumWithinScoreMarginStrictlyPositive?minWithin>0:true),
   perGroup:matched.map((x:any)=>({history:x.history,
    changedZoneMargin:x.overallMinChangedZoneMargin,
    withinOutputScoreMargin:x.overallMinScoreMargin}))
  };
 });
 return {
  candidateId:r.id,
  candidateParameters:plan.candidates.find((c:any)=>c.id===r.id),
  candidateSourceSha256:r.contentSha256,
  windows:rows
 };
});
const eligible=candidates.flatMap((c:any)=>c.windows.filter((w:any)=>w.meetsPredeclaredMarginGate)
 .map((w:any)=>({candidateId:c.candidateId,...w}))).sort((a:any,b:any)=>
 b.minimumChangedZoneStandardizedMargin-a.minimumChangedZoneStandardizedMargin ||
 b.minimumWithinOutputStandardizedScoreMargin-a.minimumWithinOutputStandardizedScoreMargin ||
 a.window-b.window||a.candidateId.localeCompare(b.candidateId));
const report={
 schema:'OUTSIDE3_V2_D0_DESIGN_GRID_RESULT_V1',
 status:'DESIGN_ONLY_NOT_PARAMETER_FREEZE_NOT_CALIBRATION',
 manifestSha256:sha(bytes), sourceCommit:process.env.GITHUB_SHA||'LOCAL',
 allSixCandidatesCompleted:true,
 numberOfCandidates:candidates.length,
 numberOfWindowComparisons:candidates.reduce((a:number,c:any)=>a+c.windows.length,0),
 minimumRequiredChangedZoneSigma:plan.minimumStandardizedMarginFactor,
 eligibleWindowCount:eligible.length,
 bestEligibleDesignOption:eligible[0]||null,
 disposition:eligible.length?'D0_MARGIN_ELIGIBLE_OPTIONS_FOUND_NOT_FROZEN':'D0_NO_CANDIDATE_PASSED_MARGIN_NO_FREEZE',
 candidates,
 noRealTargets:true,
 registrationClosed:true,
 noKCalibrationPerformed:true,
 existingV1K3FailurePreserved:true,
 K3ThresholdsFromFixedDocument:'Raw >= 0.90, C >= 0.25, 2*C >= Raw'
};
const dir=root+'/design-grid';
mkdirSync(dir,{recursive:true});
const json=JSON.stringify(report,null,2)+'\n';
writeFileSync(dir+'/D0_GRID_RESULT.json',json);
const md=[
 '# OUTSIDE-3 v2 D0 parameter-design screen — synthetic only',
 '',
 '**No parameter selected or frozen. No v2 K1–K5 calibration. No real target; registration closed.**',
 '',
 'Manifest SHA-256: '+report.manifestSha256,
 'Disposition: **'+report.disposition+'**',
 '',
 '| Candidate | Window | Worst matched changed-zone margin (σ) | Worst Hamming-1 ranking margin | ≥'+plan.minimumStandardizedMarginFactor+'σ? |',
 '|---|---:|---:|---:|---|',
 ...candidates.flatMap((c:any)=>c.windows.map((w:any)=>
  '| '+c.candidateId+' | '+w.window+' | '+w.minimumChangedZoneStandardizedMargin.toPrecision(7)+
  ' | '+w.minimumWithinOutputStandardizedScoreMargin.toPrecision(7)+
  ' | '+(w.meetsPredeclaredMarginGate?'YES':'NO')+' |')),
 '',
 'Eligible options: '+eligible.length+'.',
 'If any are eligible, the displayed best option is only a **design-grid candidate**. It cannot be called frozen until a separate synthetic signal-plant stage and independent review accept it.',
 'If none are eligible, DO NOT loosen the predefined 2σ margin, and do not register. Return to design review with all negative evidence.',
 '',
 'The standardized variance denominator is the design reference sigma from fresh synthetic casts, not instrument noise. Hamming-1 within-ranking and causal input-response margins were evaluated separately. Design seeds are disjoint from future K seeds; all original Stage 1 K3/K4 failures are unchanged.',
 ''
].join('\n');
writeFileSync(dir+'/D0_GRID_RESULT.md',md);
writeFileSync(dir+'/SHA256SUMS.txt',sha(json)+'  D0_GRID_RESULT.json\n'+sha(md)+'  D0_GRID_RESULT.md\n');
console.log('OUTSIDE3_V2_D0_AGGREGATED',JSON.stringify({disposition:report.disposition,eligibleCount:eligible.length,bestEligible:report.bestEligibleDesignOption}));
