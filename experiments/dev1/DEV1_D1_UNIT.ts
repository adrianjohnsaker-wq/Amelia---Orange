/** Mandatory D1 activation gate. Executes NO 32-tape developmental arm. */
import assert from 'node:assert/strict';
import {CANONICAL_GATES} from '../../src/ai/numogram/AmeliaQabbalaInterface';
import {AmeliaNumogramSubstrateRuntime} from '../../src/substrate/ameliaNumogramSubstrateRuntime';
import {d1ChooseExit,d1GateSelectorOverlay,d1GateScore,D1_CANONICAL_EDGES,D1_W_VALUE} from '../../src/developmental/DEV1D1EdgeSelector';

assert.equal(D1_W_VALUE,0.5);
assert.equal(D1_CANONICAL_EDGES.length,11);
const exit5=CANONICAL_GATES.find(g=>g.source===4&&g.target===5)!;
const exit7=CANONICAL_GATES.find(g=>g.source===4&&g.target===7)!;
assert(exit5&&exit7);
const base5=exit5.flux*(1-exit5.resistance);
const base7=exit7.flux*(1-exit7.resistance);
const gap=base5-base7; // 0.0093
const V=0.1;
const weighted=Math.abs(D1_W_VALUE*V);
assert(gap>0 && gap<weighted,'UNIT_PRECONDITION_FLUX_GAP_SMALLER_THAN_EDGE_BONUS');
// Identical target act, phase and PFM bias; only V differs.
const zones:Record<number,{activation:number;phaseAngle:number}> = {
 5:{activation:0.5,phaseAngle:Math.PI/2},
 7:{activation:0.5,phaseAngle:Math.PI/2}
};
const noBias=Array(10).fill(0);
const baseline=d1ChooseExit(4,[exit5,exit7],zones,noBias,null,{},true,true);
const withEdge=d1ChooseExit(4,[exit5,exit7],zones,noBias,null,{'4->7':V},true,true);
assert.equal(baseline,5);
assert.equal(withEdge,7,'NONZERO_EDGE_VALUE_MUST_FLIP_EXIT');
const score5=d1GateScore(exit5,.5,0,0,null,0);
const score7=d1GateScore(exit7,.5,0,0,null,V);
assert(score7>score5);
assert.equal(d1ChooseExit(4,[exit5,exit7],zones,noBias,null,{'4->7':0},true,true),5);
console.log('DEV1_D1_EDGE_VALUE_UNIT_PASS',JSON.stringify({fromZone:4,basePreferredExit:5,
  valuedPreferredExit:7,canonicalFluxGap:gap,wV:D1_W_VALUE,nonzeroValue:V,
  weightedEdgeBonus:weighted,didFlip:baseline!==withEdge}));

// Actual unchanged runtime integration: 2 identical fresh lineages, canonical
// evolving phase/flux; overlay modifies ONLY scoring while retaining
// all canonical gate permeability writes and all other state side effects.
function freshAtZone4(){
 const rt=new AmeliaNumogramSubstrateRuntime();
 rt.setSuppressRelaySteering(true);
 const snap=rt.exportState();snap.currentZone=4;
 rt.importState(snap);return rt;
}
const a=freshAtZone4(),b=freshAtZone4();
const first=a.step('DEV1-UNIT-STEP');
const defaultExit=a.getCurrentZone();
assert([5,7].includes(defaultExit));
const opposite=defaultExit===5?7:5;
const values:Record<string,number>={'4->5':defaultExit===5?-1:1,
 '4->7':defaultExit===7?-1:1};
const beforeBias=b.getMemory().readMemoryBias().biasVector;
const observed=d1GateSelectorOverlay(b.getQabbala(),values,()=>b.step('DEV1-UNIT-STEP'));
const selected=b.getCurrentZone();
assert.equal(selected,opposite,'D1_EDGE_OVERLAY_MUST_CHANGE_REAL_RUNTIME_EXIT');
assert.equal(b.getQabbala().getGates().find(g=>g.source===4&&g.target===5)?.flux,exit5.flux);
assert.equal(b.getQabbala().getGates().find(g=>g.source===4&&g.target===7)?.flux,exit7.flux);
assert.equal(b.getMemory().getEvents().length,1);
assert.equal(b.getCurrentZone(),observed.lastTransition.to);
assert.equal(a.getMemory().getEvents().length,1);
console.log('DEV1_D1_CANONICAL_WRAP_UNIT_PASS',JSON.stringify({
  baseExit:defaultExit,afterVExit:selected,underlyingGateFluxIdentical:true,
  armBMemoryEvents:1,armD1MemoryEvents:1}));
