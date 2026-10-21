/**
 * AM1 SEALED CONSTANTS UNIT GATE ONLY.
 * Runs fixture births and choices: NO full generation rollout, no registered
 * lineage arm, and no lineage experimental output files.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CANONICAL_GATES} from '../../src/ai/numogram/AmeliaQabbalaInterface';
import {AmeliaNumogramSubstrateRuntime} from '../../src/substrate/ameliaNumogramSubstrateRuntime';
import {blankStoneMarks,StoneTapePlaceMemory,stoneTapeChooseExit,
 stoneTapeSelectorOverlay,AM1_IDS,AM1_W_T,AM1_H,terminalStoneUpdate}
 from '../../src/developmental/DEV1StoneTape';
import {newStoneLineagePlace,beginLSGeneration,beginLSYGeneration,
 lsWrongDeathDonor,freezeAgeMatchedDonors,enforceStoneLineageLimits}
 from '../../src/developmental/DEV1StoneLineage';

const base=JSON.parse(readFileSync('experiments/dev1/DEV1_CONSTANTS.json','utf8'));
const am=JSON.parse(readFileSync('experiments/dev1/amendments/am1/AM1_CONSTANTS.json','utf8'));
const manifest=JSON.parse(readFileSync('experiments/dev1/DEV1_CONSTANTS_MANIFEST.json','utf8'));
assert.equal(am.schema,'DEV1_AM1_STONE_TAPE_CONSTANTS_V1');
assert.equal(manifest.schema,'DEV1_CONSTANTS_MANIFEST_V2_ADDENDUM_AM1');
assert.equal(base.mechanisms.consequenceHorizon.value,AM1_H);
assert.equal(am.additions.placeRecord.writeWindowTransitions,AM1_H);
assert.equal(am.additions.read.w_T,AM1_W_T);
assert.equal(base.mechanisms.consequenceWeight.value,AM1_W_T);
assert.deepEqual(am.additions.arms,['LS','LSY']);
assert.equal(AM1_IDS.length,11);
assert.equal(new Set(AM1_IDS).size,11);

const route:[[number,number],...[number,number][]]=[
 [0,9],[9,1],[1,8],[8,9],[9,1],[1,2],[2,4],[4,5]
];
const place=newStoneLineagePlace();
const birth=beginLSGeneration(1,1,place);
assert.equal(birth.runtime.getCurrentZone(),0);
assert.equal(birth.runtime.getMemory().getEvents().length,0);
assert.equal(birth.runtime.getGovernor().momentumDampingFactor,0.88);
assert.equal(birth.personalV['4->5'],0);
assert.equal(birth.fastTrace.reduce((a,b)=>a+b),0);
assert.equal(birth.slowTrace.reduce((a,b)=>a+b),0);
assert(Object.values(place.snapshot()).every(v=>v===0));
assert.equal(place.deathCount(),0);
for(let i=0;i<route.length-1;i++){
 const [from,to]=route[i];
 birth.life.observeTransition(from,to);
 assert.deepEqual(place.snapshot(),blankStoneMarks(),'T MUST NOT BE WRITTEN WHILE ALIVE');
 assert.equal(place.deathCount(),0);
 assert.equal(birth.life.hasAbsorbed(),false);
}
assert.deepEqual(birth.life.final24GateIds(),[
 'gate-0-9','gate-9-1','gate-1-8','gate-8-9','gate-9-1','gate-1-2','gate-2-4']);
const [from,to]=route.at(-1)!;
birth.life.observeTransition(from,to);
assert.equal(birth.life.hasAbsorbed(),true);
assert.equal(place.deathCount(),1);
const distinct=new Set(['gate-0-9','gate-9-1','gate-1-8','gate-8-9','gate-1-2','gate-2-4','gate-4-5']);
assert.equal(birth.life.writtenGateCount(),distinct.size);
assert.equal(place.getMark('gate-9-1'),-1/8,'repeated gate updated ONCE, not twice');
for(const gateId of AM1_IDS){
 assert.equal(place.getMark(gateId),distinct.has(gateId)?-0.125:0,gateId);
}
assert.throws(()=>birth.life.observeTransition(5,5),/TRANSITION_AFTER_DEATH/);
assert.throws(()=>place.writeAtAbsorption([...birth.life.final24GateIds()],birth.life),/WRITE_ONLY/);
assert.equal(terminalStoneUpdate(-0.125),-0.234375);
console.log('DEV1_AM1_TERMINAL_ONLY_WRITE_PASS',JSON.stringify({
 terminalStep:route.length,uniqueWrittenGateIDs:[...distinct],
 H:AM1_H,repeatGateMark:place.getMark('gate-9-1'),
 writesDuringLife:0,writesAtAbsorption:7,postmortemDoubleWriteRejected:true}));

// Fresh successor inherits PLACE T and none of previous individual life:
birth.personalV['4->5']=0.75;
birth.fastTrace[0]=.8;birth.slowTrace[0]=.9;
const child=beginLSGeneration(1,2,place);
assert.equal(child.place.getMark('gate-4-5'),-0.125);
assert.equal(child.personalV['4->5'],0);
assert(child.fastTrace.every(x=>x===0));
assert(child.slowTrace.every(x=>x===0));
assert.equal(child.runtime.getMemory().getEvents().length,0);
assert.equal(child.runtime.getCurrentZone(),0);
assert.equal(child.runtime.getGovernor().momentumDampingFactor,0.88);
assert.equal(child.inheritedPersonalMemory,false);
assert.notEqual(child.runtime,birth.runtime);
console.log('DEV1_AM1_SUCCESSOR_PLACE_ONLY_INHERITANCE_PASS');

// Exact sealed negative T on 4->5 offsets the 0.0093 canonical flux gap.
// Equalise other selector contributions to isolate the gate-value term.
const gates=CANONICAL_GATES.filter(g=>g.source===4&&g.isOpen);
const g5=gates.find(g=>g.target===5)!,g7=gates.find(g=>g.target===7)!;
const gap=g5.flux*(1-g5.resistance)-g7.flux*(1-g7.resistance);
const penalty=Math.abs(AM1_W_T*place.getMark('gate-4-5'));
assert(gap>0 && gap<penalty,'T_BONUS_MUST_EXCEED_CANONICAL_GAP');
const equalZones:{[k:number]:{activation:number;phaseAngle:number}}={
 5:{activation:0.5,phaseAngle:Math.PI/2},
 7:{activation:0.5,phaseAngle:Math.PI/2}};
const biased=Array(10).fill(0),values={};
const before=stoneTapeChooseExit(4,gates,equalZones,biased,null,values,place.snapshot(),false);
const after=stoneTapeChooseExit(4,gates,equalZones,biased,null,values,place.snapshot(),true);
assert.equal(before,5);
assert.equal(after,7);
assert.equal(stoneTapeChooseExit(4,gates,equalZones,biased,null,values,blankStoneMarks(),true),5);
console.log('DEV1_AM1_STONE_TAPE_CHOICE_FLIP_PASS',JSON.stringify({
 initialChoice:before,markedChoice:after,fluxGap:gap,
 observedMark:place.getMark('gate-4-5'),wT:AM1_W_T,
 absoluteMarkPenalty:penalty,didFlip:true}));

// Real ORIGINAL canonical runtime integration, checking that gate objects
// remain identical (though its selector now sees a read-only proxy).
function atZone4(){
 const rt=new AmeliaNumogramSubstrateRuntime();rt.setSuppressRelaySteering(true);
 const s=rt.exportState();s.currentZone=4;rt.importState(s);return rt;
}
const canonical=atZone4(),withT=atZone4();
canonical.step('AM1 STONE TAPE UNIT CHOICE');const originalTarget=canonical.getCurrentZone();
assert([5,7].includes(originalTarget));
const t:Record<string,number>=blankStoneMarks();
const originalExit=CANONICAL_GATES.find(g=>g.source===4&&g.target===originalTarget)!;
t[originalExit.id]=-1;
stoneTapeSelectorOverlay(withT.getQabbala(),{},t,()=>withT.step('AM1 STONE TAPE UNIT CHOICE'));
assert.notEqual(withT.getCurrentZone(),originalTarget,'ORIGINAL_RUNTIME_T_WRAPPER_DID_NOT_CHANGE_EXIT');
assert.deepEqual(withT.getQabbala().getGates(),canonical.getQabbala().getGates(),
 'T_OVERLAY_MUST_NOT_WRITE_CANONICAL_GATE_PROPERTIES');
assert.equal(withT.getMemory().getEvents().length,1);
assert.equal(canonical.getMemory().getEvents().length,1);
console.log('DEV1_AM1_CANONICAL_GATE_IMMUTABILITY_PASS',JSON.stringify({
 originalExit:originalTarget,markedExit:withT.getCurrentZone(),
 originalGatePropertiesEqualAfterBothSteps:true}));

// 32 age-matched snapshot donors, one-based 1->2,..32->1.
// Synthetic fixtures only; no lifespan trajectories or outcomes generated.
const donors:Record<number,Record<string,number>[]>={};
for(let k=1;k<=32;k++){
 const old=blankStoneMarks();
 const sameGeneration=blankStoneMarks();
 sameGeneration['gate-4-5']=-k/64;
 donors[k]=[old,sameGeneration];
}
const frozen=freezeAgeMatchedDonors(2,donors);
assert.equal(lsWrongDeathDonor(1),2);
assert.equal(lsWrongDeathDonor(31),32);
assert.equal(lsWrongDeathDonor(32),1);
const mismatched=beginLSYGeneration(1,2,frozen);
assert.equal(mismatched.donorLineage,2);
assert.equal(mismatched.place.getMark('gate-4-5'),-2/64);
assert.notEqual(mismatched.place.getMark('gate-4-5'),-1/64);
assert.equal(mismatched.personalV['4->5'],0);
assert.equal(mismatched.runtime.getMemory().getEvents().length,0);
assert(mismatched.fastTrace.every(x=>x===0));
assert(mismatched.slowTrace.every(x=>x===0));
const wrapped=beginLSYGeneration(32,2,frozen);
assert.equal(wrapped.donorLineage,1);
assert.equal(wrapped.place.getMark('gate-4-5'),-1/64);
// Local absorption cannot mutate donor record or a future successor copy.
for(const [a,b] of route)mismatched.life.observeTransition(a,b);
assert.equal(frozen[2]['gate-4-5'],-2/64);
assert.equal(donors[2][1]['gate-4-5'],-2/64);
const nextDonors:Record<number,Record<string,number>[]>={};
for(let k=1;k<=32;k++)nextDonors[k]=[donors[k][0],donors[k][1],blankStoneMarks()];
const gen3=freezeAgeMatchedDonors(3,nextDonors);
const next=beginLSYGeneration(1,3,gen3);
assert.equal(next.place.getMark('gate-4-5'),0,
 'LSY next generation MUST replace local marked place with donor snapshot');
assert.throws(()=>freezeAgeMatchedDonors(4,nextDonors),/DONOR_GENERATION_NOT_READY/);
assert.throws(()=>enforceStoneLineageLimits(1,51,0),/GENERATION_CAP/);
assert.throws(()=>enforceStoneLineageLimits(1,1,100001),/STEPS_CAP/);
console.log('DEV1_AM1_LSY_AGE_MATCH_DONOR_ISOLATION_PASS',JSON.stringify({
 example:'1->2',wrap:'32->1',donorGeneration:2,
 frozenCopy:true,localRecordCannotAffectDonor:true,
 nextGenerationReplacedLocalMarks:true}));
console.log('DEV1_AM1_ALL_UNIT_TESTS_PASS_NO_LINEAGE_COHORT_RUN');
