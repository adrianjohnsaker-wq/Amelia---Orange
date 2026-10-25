/**
 * Studio08 S1: a deterministic receiver that can learn WHICH PREDEFINED
 * non-hash endogenous signal to amplify.
 *
 * ENGINEERING COMPONENT ONLY; NOT an original Studio07/07b runner, and no
 * learner-house result until original sources/checkpoints are imported.
 *
 * The candidate array is computed before the next action by the distinct
 * closed_circuit_sensors module. This gate has no access to PFM hashes,
 * source strings, raw beacon values, secrets, clocks, DOM, or randomness.
 *
 * Two modes:
 *  - adaptive: fixed deterministic UCB selection using only SETTLED
 *    previous rewards (delayed 24 transitions);
 *  - round_robin: equal-schedule no-learning comparator.
 *
 * An expert yielding a valid zone not currently an open exit may still be
 * selected; caller MUST NOT remap it or compensate the +0.35 advantage.
 */
import {SENSOR_IDS} from './closed_circuit_sensors.mjs';
export const S1_CUE_STRENGTH=0.35;
export const S1_REWARD_WINDOW=24;
export const S1_UCB_COEFFICIENT=0.20;

function ensure(ok,message){if(!ok)throw new Error(message)}
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const copy=x=>JSON.parse(JSON.stringify(x));

export function registeredS1Reward(distinctEdgesAfterChoice,deathWithin24) {
  ensure(Number.isInteger(distinctEdgesAfterChoice)&&
    distinctEdgesAfterChoice>=0&&distinctEdgesAfterChoice<=11,
    'distinct edge count must be integer 0..11');
  ensure(typeof deathWithin24==='boolean','death flag must be boolean');
  const novelty=Math.max(0,Math.min(1,(distinctEdgesAfterChoice-4)/7));
  return novelty-(deathWithin24?1:0);
}
export function s1CueBonus(target,selectedTarget) {
  if(selectedTarget===null)return 0;
  ensure(Number.isInteger(selectedTarget)&&
         selectedTarget>=0&&selectedTarget<=9,'invalid chosen zone');
  return target===selectedTarget ? S1_CUE_STRENGTH : 0;
}

export class S1LearningCueGate {
  constructor(mode='adaptive') {
    ensure(['adaptive','round_robin'].includes(mode),'invalid mode');
    this.mode=mode;
    this.tick=0;
    this.nSelected=Object.fromEntries(SENSOR_IDS.map(s=>[s,0]));
    this.nSettled=Object.fromEntries(SENSOR_IDS.map(s=>[s,0]));
    this.rewardSums=Object.fromEntries(SENSOR_IDS.map(s=>[s,0]));
    this.pending={};
    this.settledTokens={};
  }
  choose(candidates) {
    ensure(Array.isArray(candidates)&&candidates.length===SENSOR_IDS.length,
      'one candidate for every registered sensor is required');
    for(let i=0;i<SENSOR_IDS.length;i++) {
      const x=candidates[i];
      ensure(x&&typeof x==='object'&&
        Object.keys(x).sort().join(',')==='id,target' &&
        x.id===SENSOR_IDS[i] &&
        (x.target===null ||
         (Number.isInteger(x.target)&&x.target>=0&&x.target<=9)),
         'unexpected candidate, extraneous input, or invalid target');
    }
    this.tick++;
    const nonnull=candidates.filter(x=>x.target!==null);
    if(nonnull.length===0){
      return Object.freeze({tick:this.tick,token:null,sensor:null,target:null,
        available:0,bonusMagnitude:0});
    }
    let winner;
    if(this.mode==='round_robin') {
      winner=nonnull[(this.tick-1)%nonnull.length];
    }else{
      let best=-Infinity;
      for(const candidate of nonnull){
        const id=candidate.id;
        const mean=this.rewardSums[id]/Math.max(1,this.nSettled[id]);
        const exploration=S1_UCB_COEFFICIENT*
          Math.sqrt(2*Math.log(1+this.tick)/(1+this.nSelected[id]));
        const score=mean+exploration;
        // stable ties preserve the declared SENSOR_IDS ordering
        if(score>best){best=score;winner=candidate}
      }
    }
    const token='S1-'+this.tick;
    ensure(!(token in this.pending)&&!(token in this.settledTokens),
      'duplicate decision token');
    this.nSelected[winner.id]++;
    this.pending[token]={sensor:winner.id,decisionTick:this.tick,
      target:winner.target};
    return Object.freeze({tick:this.tick,token,sensor:winner.id,
      target:winner.target,available:nonnull.length,
      bonusMagnitude:S1_CUE_STRENGTH});
  }
  settle(token,{observedAt,distinctEdges,deathWithin24}) {
    ensure(typeof token==='string'&&
      Object.prototype.hasOwnProperty.call(this.pending,token),
      'unknown, null or already-settled decision token');
    const prior=this.pending[token];
    ensure(Number.isInteger(observedAt)&&observedAt>prior.decisionTick&&
      observedAt<=this.tick,'future or invalid observation tick');
    ensure(typeof deathWithin24==='boolean','invalid deathWithin24');
    if(deathWithin24){
      ensure(observedAt<=prior.decisionTick+S1_REWARD_WINDOW,
        'death credited outside the 24-step horizon');
    }else{
      ensure(observedAt===prior.decisionTick+S1_REWARD_WINDOW,
        'nondeath delayed reward cannot settle before/after 24 steps');
    }
    const reward=registeredS1Reward(distinctEdges,deathWithin24);
    this.nSettled[prior.sensor]++;
    this.rewardSums[prior.sensor]+=reward;
    delete this.pending[token];
    this.settledTokens[token]=1;
    return Object.freeze({token,sensor:prior.sensor,reward,
      observedAt,decisionTick:prior.decisionTick,
      deathWithin24});
  }
  exportState() {
    return copy({schema:'STUDIO08_S1_LEARNED_RECEIVER_STATE_V1',
      mode:this.mode,tick:this.tick,nSelected:this.nSelected,
      nSettled:this.nSettled,rewardSums:this.rewardSums,
      pending:this.pending,settledTokens:this.settledTokens});
  }
  importState(state) {
    ensure(state&&state.schema==='STUDIO08_S1_LEARNED_RECEIVER_STATE_V1'&&
      state.mode===this.mode&&Number.isInteger(state.tick)&&state.tick>=0,
      'invalid receptor state schema or mode');
    for(const field of ['nSelected','nSettled','rewardSums']){
      ensure(state[field]&&Object.keys(state[field]).sort().join(',')===
        [...SENSOR_IDS].sort().join(','),
        'missing/unknown learning stats: '+field);
      for(const id of SENSOR_IDS)
        ensure(finite(state[field][id]) &&
          (field==='rewardSums'||(Number.isInteger(state[field][id])&&
            state[field][id]>=0)),'invalid learning count/value');
    }
    ensure(state.pending&&state.settledTokens,'missing ticket ledger');
    this.tick=state.tick;
    this.nSelected=copy(state.nSelected);
    this.nSettled=copy(state.nSettled);
    this.rewardSums=copy(state.rewardSums);
    this.pending=copy(state.pending);
    this.settledTokens=copy(state.settledTokens);
    return this;
  }
}
