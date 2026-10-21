/** DEV1 unit tests; no developmental arm run and no live inflow. */
import assert from 'node:assert/strict';
import {updateEdgeValue,consequenceOutcome,exponentiallyUpdateTrace,traceBias,
e1WithinBounds,e2WithinBounds,homeostat,secondOrderRedraw,lineageInheritance}
from '../../src/developmental/DEV1Mechanisms';
assert.equal(updateEdgeValue(0,-1),-0.125);
assert.equal(updateEdgeValue(1,1),1);
assert.throws(()=>updateEdgeValue(2,0));
assert.equal(consequenceOutcome(true,4,10),-1);
assert.equal(consequenceOutcome(false,4,10),6/11);
const tr=exponentiallyUpdateTrace(Array(10).fill(0),3,48);
assert(Math.abs(tr.reduce((a,b)=>a+b,0)-1)<1e-12);
const slow=exponentiallyUpdateTrace(Array(10).fill(0),4,2400);
assert(Math.abs(traceBias(tr,slow).reduce((a,b)=>a+b,0)-0.4)<1e-12);
assert.equal(e1WithinBounds(['1-2','2-4','4-7']),true);
assert.equal(e1WithinBounds(['1-2','1-2','2-4']),false);
assert.equal(e2WithinBounds(0.14),true);
assert.equal(e2WithinBounds(0.651),false);
assert.equal(homeostat(0.88,0.13),0.89);
assert.equal(homeostat(0.88,0.66),0.87);
let v=0;
const redraw=secondOrderRedraw({w_bias:0.4,w_act:0.2,w_phase:0.1,w_input:0.35,w_V:0.5},()=>{v+=0.1;return v});
assert.equal(redraw.w_V,0.5);
assert.equal(redraw.w_bias,0.08000000000000002);
const inh=lineageInheritance({'1->2':0.15},slow);
assert.equal(inh.zone,0);
assert.deepEqual(inh.fast,Array(10).fill(0));
assert.equal(inh.values['1->2'],0.15);
console.log('DEV1_STAGE1_PURE_MECHANISM_UNIT_TESTS_PASS');
