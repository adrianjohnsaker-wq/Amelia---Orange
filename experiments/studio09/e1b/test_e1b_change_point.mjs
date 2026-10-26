/** E1B QA: compare change-point sensitivity under immutable -0.25/8 rule. */
import assert from 'node:assert/strict';
import {SENSOR_IDS} from '../../studio08/code/closed_circuit_sensors.mjs';
import {E1PlasticReceptor} from '../code/e1_receptor_plasticity.mjs';
import {E1BRecencyReceptor} from './e1b_recency_receptor.mjs';
import {e1bEncounterSource} from './e1b_exogenous_challenge.mjs';
import {e1WorldSeed} from '../code/e1_outside_tapes.mjs';
import {createHash} from 'node:crypto';
const id=SENSOR_IDS[0];
const original=new E1PlasticReceptor();
const revised=new E1BRecencyReceptor();
let count=0;
for(let i=0;i<48;i++){
 const token='q'+i;
 const reward=i<40?0:-1;
 original.bindChoice(token,id);revised.bindChoice(token,id);
 const receipt={token,sensor:id,reward};
 const old=original.onSettled(receipt),now=revised.onSettled(receipt);
 if(now)count++;
 if(i<42)assert.equal(now,null);
 if(i===42)assert.equal(now?.triggeringToken,'q42');
 assert.equal(old,null);
}
assert.equal(count,1);
assert.equal(original.wiring[id],0);
assert.equal(revised.wiring[id],1);
assert.equal(original.window[id].n,48);
assert.equal(revised.window[id].n,5,'rolling window restarts at switch; five later credits remain');
assert.equal(revised.switches[id],1);
const transfer=new E1BRecencyReceptor().importState(revised.exportState());
transfer.freezeTransfer();
const carry=new E1BRecencyReceptor().importState(transfer.exportState());
const reset=new E1BRecencyReceptor().importState(transfer.exportState());
assert.deepEqual(carry.exportState(),reset.exportState());
reset.resetWiring();
assert.equal(carry.wiring[id],1);
assert.equal(reset.wiring[id],0);
assert.throws(()=>revised.onSettled({token:'q47',sensor:id,reward:-1}),/unregistered/);
assert.throws(()=>revised.bindChoice('q47','SOURCE_INPUT'),/unknown sensor/);
const seed=e1WorldSeed('E1-P0');
for(let season=1;season<=2;season++)for(let tick=1;tick<=5000;tick++){
 const src=e1bEncounterSource(seed,season,tick);
 const h=createHash('sha256').update(src.trim()).digest('hex');
 assert.equal(parseInt(h.slice(0,2),16)%10,5);
 assert(src.includes('STUDIO09-E1B-EXOGENOUS-CHALLENGE-V1'));
}
assert.notEqual(e1bEncounterSource(seed,1,1),e1bEncounterSource(seed,1,2));
assert.throws(()=>e1bEncounterSource(seed,1,5001),/invalid seed\/time/);
console.log(JSON.stringify({
 status:'STUDIO09_E1B_RECENCY_RECEPTOR_AND_SINK_SOURCE_ENGINEERING_QA_PASS',
 pilotOnly:true,syntheticCredits:48,syntheticOldSwitches:0,
 syntheticNewSwitches:1,realSourceModelMutationNotImplied:true,
 fixedThreshold:-0.25,fixedWindow:8,cueMagnitude:0.35,
 verifiedExogenousSourceTicks:10000,sourceZone:5,scientificWorldsExecuted:0
}));
