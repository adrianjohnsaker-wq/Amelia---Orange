/** Studio 08 S1 candidate sensor QA: synthetic fixtures only. */
import assert from 'node:assert/strict';
import {EDGES} from './endogenous_cues.mjs';
import {SENSOR_IDS,closedCircuitSensorCandidates as sense}
  from './closed_circuit_sensors.mjs';
const fields=()=>Object.fromEntries(EDGES.map(e=>[e,0]));
const snapshot=()=>({house:{surface:fields(),deep:fields()},code:{V:fields()}});
const build=(initial,final)=>Array.from({length:25},(_,i)=>i===24?final:snapshotFrom(initial));
function snapshotFrom(obj){
  return {house:{surface:{...obj.house.surface},deep:{...obj.house.deep}},
    code:{V:{...obj.code.V}}};
}
const a=snapshot(),b=snapshot();
let x=sense(build(a,b));
assert.deepEqual(x.map(z=>z.id),SENSOR_IDS);
assert.deepEqual(x.map(z=>z.target),[null,null,null]);
b.house.surface['1>2']=-0.5;
x=sense(build(a,b));
assert.equal(x[0].target,2);assert.equal(x[1].target,2);
assert.equal(x[2].target,null);

b.house.deep['7>8']=0.8;
x=sense(build(a,b));
assert.equal(x[1].target,8);
b.code.V['2>7']=0.2;
x=sense(build(a,b));
assert.equal(x[2].target,7);
b.house.surface['4>5']=-0.5; // Equal surface fall, lexical tie -> 1>2
x=sense(build(a,b));assert.equal(x[0].target,2);
assert.equal(x[1].target,8);
const n=sense(build(a,b));
assert(Object.isFrozen(n)&&Object.isFrozen(n[0]));

const c=snapshotFrom(b);
c.inputDigest='a'.repeat(64);c.eventDigest='b'.repeat(64);
c.house.inputZone=7;
assert.deepEqual(sense(build(a,c)),sense(build(a,b)),
  'external metadata must never enter a candidate sensor');

assert.throws(()=>sense(build(a,b).slice(1)),/25 committed/);
const bad=snapshotFrom(b);delete bad.house.surface['1>2'];
assert.throws(()=>sense(build(a,bad)),/invalid surface/);
assert.deepEqual(a,snapshot(),'sensors must not mutate earlier house/code');
console.log(JSON.stringify({status:'STUDIO08_S1_THREE_NONHASH_SENSORS_QA_PASS',
  assertions:14,candidates:SENSOR_IDS,notStudio07bOriginal:true,
  syntheticOnly:true,notScientificResult:true}));
