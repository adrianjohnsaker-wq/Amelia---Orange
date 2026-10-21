/** Exactly the seven prospective DEV1 AM3 §5 units on constructed traces only.
 * Does not execute B/D1″ cohort, no real outcomes, signed manifest first.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateRefrain,territoryAt,AM3_H,AM3_EDGE_COUNT} from '../../../../src/developmental/DEV1AM3Refrain';
import {d1ChooseExit} from '../../../../src/developmental/DEV1D1EdgeSelector';
import {CANONICAL_GATES} from '../../../../src/ai/numogram/AmeliaQabbalaInterface';

const m=JSON.parse(readFileSync('experiments/dev1/DEV1_CONSTANTS_MANIFEST_AM3.json','utf8'));
const receipt=JSON.parse(readFileSync('experiments/dev1/amendments/am3/seal/receipt.json','utf8'));
assert.equal(receipt.status,'PASS');
assert.equal(receipt.onlyPreviousCohortsBAndD1AtSeal,true);
assert.equal(m.schema,'DEV1_AM3_ADDITIVE_CONSTANTS_MANIFEST_V3');
assert.equal(m.signal.horizon,AM3_H);
assert.equal(AM3_H,24);
assert.equal(AM3_EDGE_COUNT,11);
assert.equal(m.signal.wV,0.5);
assert.equal(m.unitTests.length,7);
function cycle(zones:number[],n:number):void{
 for(let j=0;j<n;j++)zones.push(8,9,1);
}
// 1 Repeated territory: establish >24 prior states so all targets belong.
{
 const z=[1];cycle(z,22);
 let tested=0;
 for(let t=26;t+24<z.length;t++){
  const o=evaluateRefrain(z.slice(0,t+25),t,false);
  assert.equal(o.value,0,'AM3_1_REPEATED_CIRCUIT_MUST_BE_NEUTRAL');
  tested++;
 }
 assert(tested>10);
 console.log('AM3_UNIT_1_REPETITION_PASS',JSON.stringify({tested,zeroEveryEdge:true}));
}
// 2 Returning novel excursion: prior history includes 1,8,9, but not 2,7.
const base=[1];cycle(base,13);
const t=base.length-1;
const excursion=[...base,2,7,8,9,1];
cycle(excursion,10);
{
 const a=evaluateRefrain(excursion.slice(0,t+25),t,false);
 const b=evaluateRefrain(excursion.slice(0,t+26),t+1,false);
 const c=evaluateRefrain(excursion.slice(0,t+27),t+2,false);
 assert.equal(a.kind,'refrain');assert.equal(b.kind,'refrain');
 assert.equal(a.value,3/11);
 assert.equal(b.value,2/11);
 assert(a.value>0&&b.value>0);
 assert.equal(c.value,0,'AM3_2_RETURN_EDGE_ALREADY_IN_TERRITORY');
 console.log('AM3_UNIT_2_RETURNING_EXCURSION_PASS',JSON.stringify({
  o12:a.value,o27:b.value,o78:c.value,firstReturn:a.firstReturnStep}));
}
// 3 An identical refrain repeated inside 24 has no NEW edge reward.
{
 const repeat=[...base,2,7,8,9,1,2,7,8,9,1];cycle(repeat,10);
 const second=base.length+4;
 const a=evaluateRefrain(repeat.slice(0,second+25),second,false);
 const b=evaluateRefrain(repeat.slice(0,second+26),second+1,false);
 assert.equal(a.value,0);assert.equal(b.value,0);
 console.log('AM3_UNIT_3_REPEATED_REFRAIN_PASS',JSON.stringify({
  o12:a.value,o27:b.value,sameEdgesNoNoveltyReward:true}));
}
// 4 Abolition: every edge in the preceding horizon receives -1, terminal
// edge itself included, even if an earlier departure looked like a refrain.
{
 const z=[1];cycle(z,12);z.push(2,4,5);
 const terminal=z.length-1;
 for(let index=Math.max(0,terminal-AM3_H);index<terminal;index++){
  const a=evaluateRefrain(z.slice(0,terminal+1),index,true);
  assert.equal(a.kind,'abolition');
  assert.equal(a.value,-1);
 }
 console.log('AM3_UNIT_4_ABOLITION_PASS',JSON.stringify({
  absorbedAt:terminal,negativeUpdates:Math.min(AM3_H,terminal),terminalEdgeIncluded:true}));
}
// 5 No-return departure at birth from 0 is neutral through 24 ticks.
{
 const z=[0,9,1];cycle(z,9);
 const out=evaluateRefrain(z.slice(0,25),0,false);
 assert.equal(out.kind,'otherwise');
 assert.equal(out.value,0);
 console.log('AM3_UNIT_5_NO_RETURN_PASS',JSON.stringify({t:0,o:out.value}));
}
// 6 Early territory truncation must never use future or current except t0.
{
 const z=[0,9,1,8,9,1,2,7,8,9,1];
 const expectTheta=[[0],[0],[0,9],[0,9,1],[0,9,1,8]];
 for(let t=0;t<expectTheta.length;t++)
  assert.deepEqual([...territoryAt(z,t)].sort(),expectTheta[t].sort());
 assert.deepEqual([...territoryAt(z,10)].sort(),[0,1,2,7,8,9]);
 console.log('AM3_UNIT_6_EARLY_TERRITORY_PASS',JSON.stringify({
  thetaAt0:[...territoryAt(z,0)],thetaAt4:[...territoryAt(z,4)]}));
}
// 7 Existing canonical zone-4 exits: -1/8 is sufficient to redirect from
// 4->5 to 4->7 in controlled otherwise-equal selector state.
{
 const gates=CANONICAL_GATES.filter(g=>g.isOpen&&g.source===4);
 const z={5:{activation:0.5,phaseAngle:Math.PI/2},
   7:{activation:0.5,phaseAngle:Math.PI/2}};
 const biases=Array(10).fill(0);
 const gap=gates.find(g=>g.target===5)!.flux*(1-gates.find(g=>g.target===5)!.resistance)
     -gates.find(g=>g.target===7)!.flux*(1-gates.find(g=>g.target===7)!.resistance);
 assert(gap>0&&gap<0.5*0.125);
 const b=d1ChooseExit(4,gates,z,biases,null,{});
 const alt=d1ChooseExit(4,gates,z,biases,null,{'4->5':-0.125});
 assert.equal(b,5);assert.equal(alt,7);
 console.log('AM3_UNIT_7_EXIT_CHOICE_PASS',JSON.stringify({
  base:b,marked:alt,gap,value:-0.125,weightedBonus:0.0625}));
}
console.log('AM3_ALL_SEVEN_CONSTRUCTED_UNIT_TESTS_PASS_NO_CORRECTED_ARM_EXECUTED');
