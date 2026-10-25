/** Deterministic unit tests for Studio 08 smooth-cue engineering, NOT studio results. */
import assert from 'node:assert/strict';
import {EDGES,houseChangeCue,cueBonus} from './endogenous_cues.mjs';
const empty = () => Object.fromEntries(EDGES.map(k=>[k,0]));
const house = () => ({surface:empty(),deep:empty()});

const a=house(), b=house();
assert.equal(houseChangeCue(a,b),null);
assert.equal(cueBonus(2,null),0);
b.surface['1>2']=0.4;
assert.equal(houseChangeCue(a,b),2);
assert.equal(cueBonus(2,2),0.35);
assert.equal(cueBonus(7,2),0);
b.deep['7>8']=0.6;
assert.equal(houseChangeCue(a,b),8);

const before=house(), after=house();
after.surface['2>7']=0.3;
after.deep['4>5']=0.3;
assert.equal(houseChangeCue(before,after),5,'ties must resolve numerically');
assert.deepEqual(before,house(),'pure readout must not mutate previous snapshot');
assert.deepEqual(a,house(),'pure readout must not mutate house');
assert.throws(()=>houseChangeCue(a,{surface:{},deep:{}}),/missing or not finite/);
assert.throws(()=>cueBonus(0,10),/Invalid cue zone/);
console.log(JSON.stringify({
 status:'STUDIO08_SMOOTH_HOUSE_READOUT_UNIT_PASS', tests:9,
 syntheticOnly:true, readsCompletedPreChoiceSnapshots:true,
 predeclaredTieRule:'lowest_target_zone', noScienceOutcome:true
}));
