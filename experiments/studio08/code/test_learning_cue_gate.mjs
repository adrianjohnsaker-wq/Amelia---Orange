/** Studio 08 S1 learned-receiver engineering: NO science outcomes. */
import assert from 'node:assert/strict';
import {SENSOR_IDS} from './closed_circuit_sensors.mjs';
import {S1LearningCueGate as Gate,registeredS1Reward as reward,
        s1CueBonus as bonus} from './learning_cue_gate.mjs';

const candidates=()=>SENSOR_IDS.map((id,i)=>({id,target:i+2}));
let assertions=0;
function eq(a,b){assert.deepEqual(a,b);assertions++}
function throws(fn,pattern){assert.throws(fn,pattern);assertions++}
eq(reward(4,false),0);
eq(reward(11,false),1);
eq(reward(4,true),-1);
eq(reward(11,true),-1);
eq(bonus(2,2),0.35);
eq(bonus(7,2),0);
eq(bonus(7,null),0);
throws(()=>reward(12,false),/distinct edge/);
throws(()=>reward(2,1),/death flag/);
throws(()=>bonus(0,11),/invalid chosen/);

const a=new Gate('adaptive'),b=new Gate('adaptive');
const rr=new Gate('round_robin');
const tokens=[];
for(let i=0;i<25;i++){
  const ca=a.choose(candidates()),cb=b.choose(candidates());
  eq(ca.sensor,cb.sensor);tokens.push(ca.token);
  eq(rr.choose(candidates()).sensor,SENSOR_IDS[i%3]);
}
eq(a.exportState().tick,25);
throws(()=>a.settle(tokens[0],{observedAt:24,distinctEdges:11,deathWithin24:false}),/before\/after/);
throws(()=>a.settle(tokens[0],{observedAt:26,distinctEdges:11,deathWithin24:false}),/future/);

const won=a.settle(tokens[0],{observedAt:25,distinctEdges:11,deathWithin24:false});
const lost=b.settle(tokens[0],{observedAt:25,distinctEdges:4,deathWithin24:true});
eq(won.reward,1);eq(lost.reward,-1);
throws(()=>a.settle(tokens[0],{observedAt:25,distinctEdges:11,deathWithin24:false}),/already-settled/);

const cloned=new Gate('adaptive').importState(a.exportState());
eq(cloned.exportState(),a.exportState());
eq(cloned.choose(candidates()),a.choose(candidates()));
const changed=b.choose(candidates());
assert.notEqual(changed.sensor,a.exportState().pending['S1-26'].sensor,
  'settled historical experience must affect advisor selection');assertions++;

const nullPolicy=new Gate();
const nullDecision=nullPolicy.choose(SENSOR_IDS.map(id=>({id,target:null})));
eq(nullDecision.target,null);eq(nullDecision.token,null);
eq(nullDecision.bonusMagnitude,0);
throws(()=>nullPolicy.settle('S1-1',{observedAt:2,distinctEdges:2,deathWithin24:false}),/unknown/);
throws(()=>nullPolicy.choose([{id:SENSOR_IDS[0],target:0}]),/one candidate/);
const bad=candidates();bad[1].externalInput='leaked';
throws(()=>nullPolicy.choose(bad),/extraneous input/);
throws(()=>new Gate('variable'),/invalid mode/);
throws(()=>new Gate().importState({}),/invalid receptor state/);
eq(a.exportState().pending['S1-26'].target,2); // first advisor, S1 candidate unchanged
console.log(JSON.stringify({
 status:'STUDIO08_S1_DETERMINISTIC_SENSOR_SELECTION_QA_PASS',
 assertions, modes:['adaptive','round_robin'],
 delayedHorizon:24, fixedMagnitude:0.35,
 clonedStateExact:true, delayedCreditNoLookahead:true,
 learnedChoiceRespondedToReward:true,syntheticOnly:true,
 originalStudioRunnerAbsent:true,scienceRun:false
}));
