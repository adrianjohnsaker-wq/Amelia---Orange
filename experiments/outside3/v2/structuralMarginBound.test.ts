/**
 * OUTSIDE-3 v2 executable certificate: population 2σ ceiling for balanced
 * one-bit contrasts. Synthetic mathematical audit only.
 * This does not edit the frozen D0 gate and does not test hidden targets.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root='experiments/outside3/v2';
const d0=JSON.parse(readFileSync(root+'/design-grid/D0_GRID_RESULT.json','utf8'));
assert.equal(d0.disposition,'D0_NO_CANDIDATE_PASSED_MARGIN_NO_FREEZE');
assert.equal(d0.eligibleWindowCount,0);
assert.equal(d0.numberOfWindowComparisons,18);
const grid=JSON.parse(readFileSync(root+'/D0_DESIGN_GRID.json','utf8'));
assert.equal(grid.minimumStandardizedMarginFactor,2);
const gate=JSON.parse(readFileSync(root+'/K3_GATE_FIXED.json','utf8'));
assert.equal(gate.successConditions.rawHitsAtLeast,180);
assert.equal(gate.successConditions.cHitsAtLeast,50);
assert.equal(gate.successConditions.twiceCHitsAtLeastRawHits,true);

const mean=(v:number[])=>v.reduce((s,x)=>s+x,0)/v.length;
const variance=(v:number[])=>{
 const m=mean(v);
 return mean(v.map(x=>(x-m)**2));
};
function audit(f:(hexagram:number)=>number,bit:number) {
 const samples=Array.from({length:64},(_,h)=>f(h));
 const mid:number[]=[],deltas:number[]=[];
 for(let base=0;base<64;base++){
  if(base&(1<<bit))continue;
  const y0=f(base),y1=f(base|(1<<bit));
  mid.push((y0+y1)/2);
  deltas.push(y1-y0);
 }
 assert.equal(mid.length,32);
 const v=variance(samples);
 const decomposition=variance(mid)+mean(deltas.map(d=>d*d))/4;
 assert(Math.abs(v-decomposition)<1e-10,'TOTAL_VARIANCE_IDENTITY_FAILURE');
 const sigma=Math.sqrt(v);
 assert(sigma>0);
 const dmin=Math.min(...deltas.map(Math.abs));
 const ratio=dmin/sigma;
 assert(ratio<=2+1e-10,'CONTRADICTS_BALANCED_BINARY_VARIANCE_BOUND');
 return {bit:bit+1,dmin,sigma,ratio,
   variance:v,midpointVariance:variance(mid),
   deltaSquaredMean:mean(deltas.map(d=>d*d))};
}
// Equality is attainable only for a perfectly isolated binary component.
const ideal=audit(h=>((h&1)?1:-1),0);
assert(Math.abs(ideal.ratio-2)<1e-12);
assert.equal(ideal.midpointVariance,0);
// Any independent other-line contribution forces a ratio strictly below 2.
const nuisance=audit(h=>((h&1)?1:-1)+((h&2)?0.25:-0.25),0);
assert(nuisance.ratio<2);
assert(nuisance.midpointVariance>0);
// Nonlinear interactions can vary the binary contrast, likewise reducing min.
const nonlinear=audit(h=>((h&1)?1:-1)*(1+((h&2)?0.1:0))+((h&4)?0.08:0),0);
assert(nonlinear.ratio<2);
const crossed=Array.from({length:6},(_,i)=>audit(h=>
  Array.from({length:6},(_,k)=>((h&(1<<k))?1:-1)*(0.2+0.1*k)).reduce((s,v)=>s+v,0),i));
assert(crossed.every(x=>x.ratio<2));
const k3Condition=(raw:number,c:number)=>raw>=180&&c>=50&&2*c>=raw;
assert.equal(k3Condition(200,99),false);
assert.equal(k3Condition(180,90),true);
assert.equal(k3Condition(179,100),false);
assert.equal(k3Condition(180,49),false);
assert.equal(k3Condition(200,100),true);
const worst=Math.max(...d0.candidates.flatMap((c:any)=>c.windows.map((x:any)=>
  x.minimumChangedZoneStandardizedMargin)));
assert(worst<2);
console.log('OUTSIDE3_V2_STRUCTURAL_MARGIN_CERTIFICATE_PASS '+JSON.stringify({
 identity:'Var(Y)=Var(midpoint)+E[delta^2]/4 for fair independent binary bit',
 idealCeiling:ideal.ratio,
 nuisanceRatio:nuisance.ratio,
 nonlinearRatio:nonlinear.ratio,
 worstObservedD0:worst,
 D0Eligible:0,
 K3RawAtLeast:180,K3CAtLeast:50,K3TwiceCAtLeastRaw:true,
 qualification:'Finite random standardization is not identical to balanced population standardization',
 noParameterChange:true,noRealTarget:true,registrationClosed:true
}));
