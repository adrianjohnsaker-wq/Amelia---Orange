/**
 * OUTSIDE-3 v2 PRE-SELECTION saturation/margin diagnostic; synthetic only.
 * Preregistered measurement plan: v2/PRESELECTION_MARGIN_PLAN.md.
 * Fixture magnitudes ARE NOT selected parameters. Does not run K1-K5.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {AmeliaNumogramSubstrateRuntime} from '../../../src/substrate/ameliaNumogramSubstrateRuntime';
import {
 castFromPrimaryAndMoving,encodeCastToPFM,LINE_ZONES_V2,
 type PFMEncodingMagnitudes,type SixLineCast
} from './castEncoding';

const ROOT='experiments/outside3/v2';
const PLAN=readFileSync(ROOT+'/D0_DESIGN_GRID.json','utf8');
const DESIGN=JSON.parse(PLAN);
assert.equal(DESIGN.schema,'OUTSIDE3_V2_D0_SYNTHETIC_DESIGN_GRID_V1');
const candidateId=process.argv[2];
const candidate=DESIGN.candidates.find((c:any)=>c.id===candidateId);
if(!candidate)throw Error('UNKNOWN_D0_CANDIDATE '+candidateId);
const preliminary=JSON.parse(readFileSync(ROOT+'/preselection-output/MARGIN_PROBE.json','utf8'));
assert.equal(preliminary.schema,'OUTSIDE3_V2_PRESELECTION_MARGIN_PROBE_V1');
assert.equal(preliminary.fixtureCriterionSatisfied,false,'unexpected feasibility revision');
const SHA=(s:string)=>createHash('sha256').update(s).digest('hex');
const FIXTURE:PFMEncodingMagnitudes={
 yin:candidate.yin,yang:candidate.yang,movement:candidate.movement,
 phaseCoherence:candidate.phaseCoherence,strainRelaxation:candidate.strainRelaxation
};
const WINDOWS=DESIGN.windows as number[];
const MASKS=DESIGN.masks as number[];
const REF_SEED=DESIGN.seeds.reference,HISTORY_SEED=DESIGN.seeds.history;
const REF_COUNT=DESIGN.referenceCount;
const MIN_MARGIN_RATIO=DESIGN.minimumStandardizedMarginFactor;
const BIT_EDGE_COUNT=192;
function mulberry32(seed:number) {
 let x=seed>>>0;
 return ()=>{
  x=(x+0x6d2b79f5)>>>0;
  let z=x;
  z=Math.imul(z^(z>>>15),z|1);
  z^=z+Math.imul(z^(z>>>7),z|61);
  return ((z^(z>>>14))>>>0)/4294967296;
 };
}
function castSynthetic(r:()=>number):SixLineCast {
 return Array.from({length:6},()=>{
  let three=0;
  for(let i=0;i<3;i++)three+=(r()<0.5?0:1);
  return (6+three) as 6|7|8|9;
 }) as SixLineCast;
}
function createRuntime():AmeliaNumogramSubstrateRuntime{
 const r=new AmeliaNumogramSubstrateRuntime();
 r.setSuppressRelaySteering(true);
 return r;
}
function cloneState(state:Record<string,unknown>):AmeliaNumogramSubstrateRuntime {
 const r=createRuntime();
 r.importState(state);
 return r;
}
function state(rt:AmeliaNumogramSubstrateRuntime) {
 // Snapshots contain process Date.now timestamps but not dynamical randomness.
 return rt.exportState();
}
function applyAndAdvance(
  initial:Record<string,unknown>,cast:SixLineCast,window:number,
  p:PFMEncodingMagnitudes
):number[]{
 const rt=cloneState(initial);
 const step=rt.getSnapshots().at(-1)?.step??0;
 const events=encodeCastToPFM(cast,p,step);
 for(const e of events)rt.getMemory().append(e.event);
 for(let i=0;i<window;i++)rt.step();
 return LINE_ZONES_V2.map(z=>rt.getQabbala().getZones()[z].activation);
}
function standardize(a:number[],mu:number[],sigma:number[]) {
 return a.map((v,i)=>(v-mu[i])/sigma[i]);
}
function moments(samples:number[][]) {
 const mu=Array.from({length:6},(_,i)=>samples.reduce((s,v)=>s+v[i],0)/samples.length);
 const sigma=Array.from({length:6},(_,i)=>Math.sqrt(samples.reduce(
  (s,v)=>s+(v[i]-mu[i])**2,0)/samples.length));
 assert(sigma.every(x=>Number.isFinite(x)&&x>0),'ZERO_REFERENCE_SIGMA');
 return {mu,sigma};
}
function produceReference(window:number){
 const gen=mulberry32(REF_SEED+window*1000);
 const fresh=state(createRuntime());
 const observations=Array.from({length:REF_COUNT},()=>applyAndAdvance(
  fresh,castSynthetic(gen),window,FIXTURE));
 return moments(observations);
}
const historyGenerator=mulberry32(HISTORY_SEED);
const historyRt=createRuntime();
const historical:{label:string;working:number;state:Record<string,unknown>}[]=[
 {label:'FRESH',working:0,state:state(historyRt)}
];
for(let w=1;w<=88;w++){
 const cast=castSynthetic(historyGenerator);
 const events=encodeCastToPFM(cast,FIXTURE,w);
 for(const e of events)historyRt.getMemory().append(e.event);
 for(let i=0;i<10;i++)historyRt.step();
 if([1,10,44,88].includes(w)){
  historical.push({label:'W'+w,working:w,state:state(historyRt)});
 }
}
const saturate=createRuntime();
const satRng=mulberry32(HISTORY_SEED+9090);
for(let k=0;k<220;k++) {
 // deliberately build high 10-zone strain, never change the core substrate.
 const events=encodeCastToPFM(castSynthetic(satRng),FIXTURE,k);
 for(const e of events)saturate.getMemory().append(e.event);
}
historical.push({label:'SATURATION_FIXTURE',working:88,state:state(saturate)});
assert.equal(historical.length,6);
const output=[];
for(const win of WINDOWS){
 const norm=produceReference(win);
 console.log('OUTSIDE3_MARGIN_REFERENCE',win,JSON.stringify(norm));
 for(const past of historical){
  const preState=past.state;
  const scenarios=[];
  for(const mask of MASKS){
   let n=0,minimumInput=Infinity,minimumMaxInput=Infinity,minimumWithin=Infinity;
   let worstInput:any=null,worstWithin:any=null,tiedOutputs=0;
   for(let bit=0;bit<6;bit++)for(let h=0;h<64;h++){
    if(h&(1<<bit))continue; // exactly 32*6=192 undirected edges
    const a=castFromPrimaryAndMoving(h^mask,mask);
    const b=castFromPrimaryAndMoving((h^(1<<bit))^mask,mask);
    const aRead=standardize(applyAndAdvance(preState,a,win,FIXTURE),norm.mu,norm.sigma);
    const bRead=standardize(applyAndAdvance(preState,b,win,FIXTURE),norm.mu,norm.sigma);
    const changed=Math.abs(aRead[bit]-bRead[bit]);
    const max=Math.max(...aRead.map((x,i)=>Math.abs(x-bRead[i])));
    if(changed<minimumInput){minimumInput=changed;worstInput={h,bit:bit+1,mask,margin:changed,a:aRead,b:bRead};}
    if(max<minimumMaxInput)minimumMaxInput=max;
    for(const [role,vector] of [['lower',aRead],['upper',bRead]] as const){
     // Every Hamming-1 score edge has abs difference 2*abs(a_i),
     // so exhaustively checking all 192 score edges reduces to min_i.
     const margin=2*Math.min(...vector.map(x=>Math.abs(x)));
     if(margin<minimumWithin){minimumWithin=margin;worstWithin={h,bit:bit+1,mask,role,margin,vector};}
     if(margin===0)tiedOutputs++;
    }
    n++;
   }
   assert.equal(n,BIT_EDGE_COUNT);
   scenarios.push({
    mask,pairs:n,
    minimumChangedZoneResponseStandardized:minimumInput,
    minimumMaxZoneResponseStandardized:minimumMaxInput,
    minimumWithinOutputHamming1ScoreMargin:minimumWithin,
    variabilityDenominator:1,
    changedZoneMarginToVariability:minimumInput/1,
    tiedOutputs,
    worstInput,worstWithin
   });
  }
  const minimum=Math.min(...scenarios.map(x=>x.minimumChangedZoneResponseStandardized));
  const minimumRanking=Math.min(...scenarios.map(x=>x.minimumWithinOutputHamming1ScoreMargin));
  const result={
    developmentWindow:win,history:past.label,working:past.working,
    eventCount:(preState.memoryState as any)?.events?.length??0,
    reference:{referenceSeed:REF_SEED+win*1000,count:REF_COUNT,means:norm.mu,sigma:norm.sigma},
    scenarios,
    overallMinChangedZoneMargin:minimum,
    overallMinScoreMargin:minimumRanking,
    criterion:MIN_MARGIN_RATIO,
    provisionalFeasibility:minimum>=MIN_MARGIN_RATIO&&minimumRanking>0?'MEETS_FIXTURE_MARGIN':'DOES_NOT_MEET_FIXTURE_MARGIN'
  };
  output.push(result);
  console.log('OUTSIDE3_MARGIN_GROUP',JSON.stringify({
    window:win,history:past.label,minimumChangedZoneMargin:minimum,
    minimumWithinScoreMargin:minimumRanking,verdict:result.provisionalFeasibility
  }));
 }
}
const minima=output.reduce((v,x)=>Math.min(v,x.overallMinChangedZoneMargin),Infinity);
const scoreMin=output.reduce((v,x)=>Math.min(v,x.overallMinScoreMargin),Infinity);
const result={
 schema:'OUTSIDE3_V2_D0_PARAMETER_DESIGN_CANDIDATE_V1',
 candidateId:candidate.id,
 manifestSha256:SHA(PLAN),
 scope:'Synthetic D0 design grid candidate, NOT frozen parameters or K1-K5 calibration',
 planSha256:SHA(PLAN),
 fixture:FIXTURE,
 designOnly:true,
 notSelected:true,
 diagnosticWindows:WINDOWS,
 masks:MASKS,
 historyWorkingCount:88,
 groups:historical.map(x=>x.label),
 all192EdgesPerGroupMask:true,
 referenceCountPerWindow:REF_COUNT,
 minimumMarginFactorPredeclared:MIN_MARGIN_RATIO,
 globalMinimumChangedZoneStandardizedMargin:minima,
 globalMinimumWithinOutputStandardizedScoreMargin:scoreMin,
 fixtureCriterionSatisfied:output.every(x=>x.provisionalFeasibility==='MEETS_FIXTURE_MARGIN'),
 noRealTarget:true,registrationClosed:true,v2Frozen:false,calibrationExecuted:false,
 groupsOfResults:output
};
const folder=ROOT+'/design-grid/output/'+candidate.id;
mkdirSync(folder,{recursive:true});
const json=JSON.stringify(result,null,2)+'\n';
writeFileSync(folder+'/D0_CANDIDATE.json',json);
const lines=[
 '# OUTSIDE-3 v2 D0 design candidate '+candidate.id,
 '',
 '**Synthetic-only DESIGN run; candidate parameters NOT frozen. No K calibration, no real target, registration closed.**',
 '',
 'Plan SHA-256: '+result.planSha256,
 'Fixture magnitudes: '+JSON.stringify(FIXTURE)+' (NOT frozen v2 constants).',
 'Reference seed '+REF_SEED+', history seed '+HISTORY_SEED+', '+REF_COUNT+' fresh reference casts per window.',
 'Windows: '+WINDOWS.join(', ')+'. Masks: '+MASKS.join(', ')+'. 192 Hamming-1 pairs per mask, per group.',
 '',
 '| Window | History | Events | Minimum changed-zone standardized response | Minimum Hamming-1 score margin | Meets fixture ≥'+MIN_MARGIN_RATIO+'σ? |',
 '|---:|---|---:|---:|---:|---|',
 ...output.map(o=>'| '+o.developmentWindow+' | '+o.history+' | '+o.eventCount+' | '+
  o.overallMinChangedZoneMargin.toPrecision(7)+' | '+o.overallMinScoreMargin.toPrecision(7)+
  ' | '+o.provisionalFeasibility+' |'),
 '',
 'Global minimum changed-zone standardized response: '+minima+'.',
 'Global minimum within-output Hamming-1 standardized score margin: '+scoreMin+'.',
 '',
 'Variability denominator is 1 standardized reference-population SD of naturally input-varied readouts. This is NOT random noise, not a p-value, and does not imply statistical precision.',
 'Input-response margin is tested by matched forks differing in exactly one resulting bit, from identical pre-working histories; the within-output score margin tests adjacent ranked hypotheses within the same readout. Both are reported because these quantities are not interchangeable.',
 'The saturated fixture is synthetic and constructed separately from the sequential W88 history. A failure of this *one fixture* is an input to separately planned parameter design, NOT grounds for retroactive constant or threshold changes.',
 'Original v1 K3/K4 failures are preserved. No hidden target draw, no calibration, no freeze, no registration.',
 ''
].join('\n');
writeFileSync(folder+'/D0_CANDIDATE.md',lines);
writeFileSync(folder+'/SHA256SUMS.txt',
 SHA(json)+'  D0_CANDIDATE.json\n'+SHA(lines)+'  D0_CANDIDATE.md\n');
console.log('OUTSIDE3_D0_DESIGN_CANDIDATE_DONE',JSON.stringify({
 fixtureCriterionSatisfied:result.fixtureCriterionSatisfied,
 minInputMargin:minima,minOutputMargin:scoreMin,groups:output.length
}));
