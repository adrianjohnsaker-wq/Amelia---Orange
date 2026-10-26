/** Studio09 E1 engineering tests. No E1 registered-world science run. */
import assert from 'node:assert/strict';
import {EDGES} from '../../studio08/code/endogenous_cues.mjs';
import {SENSOR_IDS,closedCircuitSensorCandidates} from '../../studio08/code/closed_circuit_sensors.mjs';
import {e1StructuralVariants,E1PlasticReceptor,e1ExtraCueBonus} from './e1_receptor_plasticity.mjs';
import {e1WorldSeed,e1EncounterInput,e1TransferInput,E1_ENCOUNTER_BLOCK}
  from './e1_outside_tapes.mjs';
const zero=()=>Object.fromEntries(EDGES.map(e=>[e,0]));
function snapshot(){return {house:{surface:zero(),deep:zero()},code:{V:zero()}}}
function history(start,end){
  return Array.from({length:25},(_,i)=>i===24?structuredClone(end):structuredClone(start));
}
let checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
const throws=(f,m)=>{assert.throws(f,m);checks++};
const a=snapshot(),b=snapshot();
b.house.surface['1>2']=-0.5;
b.house.surface['4>5']=-0.2;
b.house.deep['7>8']=0.8;
b.code.V['2>7']=0.6;
b.code.V['1>8']=0.2;
const h=history(a,b);
const base=closedCircuitSensorCandidates(h);
const pairs=e1StructuralVariants(h);
eq(pairs.map(p=>p.id),SENSOR_IDS);
eq(pairs.map(p=>p.baseTarget),base.map(s=>s.target));
eq(pairs[0].alternateTarget,5);
eq(pairs[1].baseTarget,8);
eq(pairs[1].alternateTarget,2);
eq(pairs[2].baseTarget,7);
eq(pairs[2].alternateTarget,8);
const aH=history(a,b);aH[24].rawInput='SECRET';
aH[0].inputDigest='f'.repeat(64);
eq(e1StructuralVariants(aH),pairs);
eq(e1StructuralVariants(history(a,a)).map(p=>p.alternateTarget),
 [null,null,null]);
throws(()=>e1StructuralVariants(h.slice(2)),/25 committed/);
eq(e1ExtraCueBonus(5,5),0.35);
eq(e1ExtraCueBonus(5,2),0);
eq(e1ExtraCueBonus(null,5),0);
throws(()=>e1ExtraCueBonus(11,5),/bad proposal/);

const receptor=new E1PlasticReceptor();
eq(receptor.propose(h).map(x=>x.target),base.map(x=>x.target));
const sensor=SENSOR_IDS[0];
for(let i=0;i<7;i++){
  const token='t'+i;
  receptor.bindChoice(token,sensor);
  eq(receptor.onSettled({token,sensor,reward:-1}),null);
}
eq(receptor.wiring[sensor],0);
receptor.bindChoice('t7',sensor);
const firstChange=receptor.onSettled({token:'t7',sensor,reward:-1});
eq(firstChange.from,0);
eq(firstChange.to,1);
eq(receptor.wiring[sensor],1);
eq(receptor.propose(h)[0].target,5);
throws(()=>receptor.onSettled({token:'t7',sensor,reward:-1}),/unregistered/);

// Delayed feedback recorded under the previous wiring cannot mutate new wiring.
const stray=new E1PlasticReceptor();
stray.bindChoice('old',sensor);
for(let i=0;i<8;i++){
  const token='new'+i;
  stray.bindChoice(token,sensor);
  stray.onSettled({token,sensor,reward:-1});
}
eq(stray.wiring[sensor],1);
eq(stray.onSettled({token:'old',sensor,reward:-1}),null);
eq(stray.wiring[sensor],1);

const exported=receptor.exportState();
const clone=new E1PlasticReceptor().importState(exported);
eq(clone.exportState(),exported);
clone.freezeTransfer();
const retained=new E1PlasticReceptor().importState(clone.exportState());
const reset=new E1PlasticReceptor().importState(clone.exportState());
eq(retained.exportState(),reset.exportState()); // exact fork before intervention
const damage=reset.resetWiring();
eq(damage.before[sensor],1);
eq(damage.after[sensor],0);
eq(retained.wiring[sensor],1);
eq(reset.propose(h)[0].target,2);
eq(retained.propose(h)[0].target,5);
throws(()=>receptor.resetWiring(),/freeze/);
const fixed=new E1PlasticReceptor('fixed');
for(let i=0;i<10;i++) {
  const token='f'+i;fixed.bindChoice(token,sensor);
  eq(fixed.onSettled({token,sensor,reward:-1}),null);
}
eq(fixed.wiring[sensor],0);
throws(()=>new E1PlasticReceptor('unbounded'),/invalid mode/);

const seed=e1WorldSeed('E1-P0'),seed2=e1WorldSeed('E1-W00');
assert.notEqual(seed,seed2);checks++;
const eOrdered=Array.from({length:E1_ENCOUNTER_BLOCK},
  (_,i)=>e1EncounterInput(seed,1,i+1,'ordered'));
const ePermuted=Array.from({length:E1_ENCOUNTER_BLOCK},
  (_,i)=>e1EncounterInput(seed,1,i+1,'permuted'));
eq(new Set(eOrdered).size,5000);
eq(new Set(ePermuted).size,5000);
eq([...eOrdered].sort(),[...ePermuted].sort());
assert.notDeepEqual(eOrdered,ePermuted);checks++;
assert.notEqual(e1EncounterInput(seed,1,1,'ordered'),
 e1EncounterInput(seed,2,1,'ordered'));checks++;
assert.notEqual(e1TransferInput(seed,1,1),e1TransferInput(seed,2,1));checks++;
throws(()=>e1WorldSeed('META1-W00'),/not registered/);
throws(()=>e1TransferInput(seed,3,1),/held-out/);
throws(()=>e1EncounterInput(seed,1,5001,'ordered'),/out of range/);
console.log(JSON.stringify({
  status:'STUDIO09_E1_STRUCTURAL_RECEPTOR_AND_OUTSIDE_TAPES_QA_PASS_NOT_SCIENCE',
  assertions:checks,
  structuralMutationAfterSettledCredit:true,
  bitwiseSerializableState:true,
  exactCarryResetCausalFork:true,
  metadataExcluded:true,
  orderedAndPermutedSourceMultisetsIdentical:true,
  sourceTapeSize:5000,
  originalMeta1ScientificCodeUnchanged:true,
  scientificWorldsExecuted:0
}));
