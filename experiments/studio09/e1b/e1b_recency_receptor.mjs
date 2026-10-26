/**
 * STUDIO09 E1B — transparent, bounded structural receptor variation.
 * Engineering candidate. Not a scientific outcome and not a self-created
 * sense organ: grammar and variation rule are supplied by the experimenter.
 *
 * The normal committed META1 three sensors are unchanged. Each receives a
 * new "counterpoint" form: SECOND-highest distinct output zone from the
 * same pre-choice, past-only S/D/V measurements. Receptor wiring stores
 * one bit per sensor and may change from SETTLED previous feedback only.
 *
 * No direct input, hashes of external input, raw source strings, walls clocks
 * or post-choice observations can enter this file.
 */
import { EDGES } from '../../studio08/code/endogenous_cues.mjs';
import {SENSOR_IDS,closedCircuitSensorCandidates} from
  '../../studio08/code/closed_circuit_sensors.mjs';
import { S1_CUE_STRENGTH } from '../../studio08/code/learning_cue_gate.mjs';

const EPS=1e-14;
const clone=x=>JSON.parse(JSON.stringify(x));
const need=(ok,msg)=>{if(!ok)throw Error('E1_RECEPTOR_CONTRACT: '+msg)};
const zoneOf=edge=>Number(edge.split('>')[1]);

function runnerUpZone(entries,minimum=EPS) {
  // Entries {zone,magnitude,lex}; deterministic magnitude descending, zone
  // ascending, edge lex ascending, one distinct target per zone.
  const ranked=entries.filter(x=>Number.isFinite(x.magnitude)&&x.magnitude>minimum)
    .sort((a,b)=>b.magnitude-a.magnitude||a.zone-b.zone||
      a.lex.localeCompare(b.lex));
  const distinct=[];
  for(const x of ranked)if(!distinct.includes(x.zone))distinct.push(x.zone);
  return distinct.length>=2?distinct[1]:null;
}
function perTargetDeltas(before,after,reader) {
  const totals=Array(10).fill(0);
  for(const edge of EDGES){
    const d=Math.abs(reader(after,edge)-reader(before,edge));
    need(Number.isFinite(d),'non-finite delta '+edge);
    totals[zoneOf(edge)]+=d;
  }
  return totals.map((magnitude,zone)=>({zone,magnitude,lex:String(zone)}));
}

/** Returns exact base targets plus different structural mapping proposals.
 * Accesses only snapshots 0 and 24 through the source-authenticated sensors.
 */
export function e1StructuralVariants(history) {
  const baseline=closedCircuitSensorCandidates(history);
  const first=history[0],last=history[24];
  const declines=EDGES.map(edge=>({
    zone:zoneOf(edge),
    magnitude:first.house.surface[edge]-last.house.surface[edge],
    lex:edge
  }));
  const house=perTargetDeltas(first,last,
    (s,e)=>s.house.surface[e]+s.house.deep[e]);
  const code=perTargetDeltas(first,last,(s,e)=>s.code.V[e]);
  const alternative=[
    runnerUpZone(declines),
    runnerUpZone(house),
    runnerUpZone(code)
  ];
  return Object.freeze(baseline.map((base,i)=>Object.freeze({
    id:base.id,baseTarget:base.target,alternateTarget:alternative[i]
  })));
}

export class E1BRecencyReceptor {
  constructor(mode='feedback'){
    need(mode==='feedback'||mode==='fixed','invalid mode');
    this.mode=mode;
    this.wiring=Object.fromEntries(SENSOR_IDS.map(s=>[s,0]));
    this.switches=Object.fromEntries(SENSOR_IDS.map(s=>[s,0]));
    // A fixed eight-event RECENCY window, not the lifetime cumulative mean.
    // This is a NEW E1B variant; E1's original negative P0 is untouched.
    this.window=Object.fromEntries(SENSOR_IDS.map(s=>[s,{sum:0,n:0,values:[]}]));
    this.sinceFlip=Object.fromEntries(SENSOR_IDS.map(s=>[s,24]));
    this.pending={};
    this.events=[];
    this.frozen=false;
    this.nextEvent=0;
  }
  /** Choose ONE available encoding per fixed META1 sensor, before transition. */
  propose(history) {
    const v=e1StructuralVariants(history);
    return Object.freeze(v.map(x=>Object.freeze({
      id:x.id,target:this.wiring[x.id]===0?x.baseTarget:x.alternateTarget
    })));
  }
  bindChoice(token,sensor){
    if(token===null)return;
    need(typeof token==='string'&&token.length>0,'invalid decision token');
    need(SENSOR_IDS.includes(sensor),'unknown sensor');
    need(!Object.hasOwn(this.pending,token),'duplicate token');
    this.pending[token]={sensor,encoding:this.wiring[sensor]};
  }
  /** Call ONLY after S1LearningCueGate.settle() has returned. */
  onSettled(receipt){
    need(receipt&&typeof receipt.token==='string'&&
      Object.hasOwn(this.pending,receipt.token),'unregistered settled credit');
    need(SENSOR_IDS.includes(receipt.sensor)&&
      receipt.sensor===this.pending[receipt.token].sensor,'credit sensor mismatch');
    need(typeof receipt.reward==='number'&&Number.isFinite(receipt.reward)&&
      receipt.reward>=-1&&receipt.reward<=1,'reward bounds');
    const {sensor,encoding}=this.pending[receipt.token];
    delete this.pending[receipt.token];
    // Transfer structure is frozen; the two transferred arms still consume
    // exactly the same feedback bookkeeping, but do not mutate wiring.
    if(this.frozen||this.mode==='fixed')return null;
    // A late credit after a prior switch cannot rewrite the CURRENT wiring.
    if(encoding!==this.wiring[sensor])return null;
    const tally=this.window[sensor];
    tally.values.push(receipt.reward);
    if(tally.values.length>8)tally.values.shift();
    tally.n=tally.values.length;
    tally.sum=tally.values.reduce((a,b)=>a+b,0);
    this.sinceFlip[sensor]++;
    if(tally.n>=8&&tally.sum/tally.n< -0.25 &&
      this.switches[sensor]<4&&this.sinceFlip[sensor]>=24) {
      const old=this.wiring[sensor];
      this.wiring[sensor]=1-old;
      this.switches[sensor]++;
      this.sinceFlip[sensor]=0;
      this.window[sensor]={sum:0,n:0,values:[]};
      const event=Object.freeze({
        sequence:++this.nextEvent,sensor,from:old,to:1-old,
        triggeringToken:receipt.token,settledMean:tally.sum/tally.n
      });
      this.events.push(event);
      return event;
    }
    return null;
  }
  /** Structural-only lesion at exact matched transfer fork. */
  resetWiring(){
    need(this.frozen,'reset only allowed after transfer freeze');
    const previous={...this.wiring};
    for(const id of SENSOR_IDS)this.wiring[id]=0;
    return Object.freeze({before:previous,after:{...this.wiring}});
  }
  freezeTransfer(){
    this.frozen=true;
    return this;
  }
  exportState(){
    return clone({
      schema:'STUDIO09_E1B_RECEPTOR_V1',mode:this.mode,wiring:this.wiring,
      switches:this.switches,window:this.window,sinceFlip:this.sinceFlip,
      pending:this.pending,events:this.events,frozen:this.frozen,
      nextEvent:this.nextEvent
    });
  }
  importState(state){
    need(state&&state.schema==='STUDIO09_E1B_RECEPTOR_V1'&&
      state.mode===this.mode,'schema or mode mismatch');
    need(state.wiring&&state.switches&&state.window&&state.sinceFlip&&
      state.pending&&state.events,'missing receptor fields');
    for(const id of SENSOR_IDS){
      need(state.wiring[id]===0||state.wiring[id]===1,'invalid wiring '+id);
      need(Number.isInteger(state.switches[id])&&
        state.switches[id]>=0&&state.switches[id]<=4,'bad switch count '+id);
      need(Number.isFinite(state.window[id]?.sum)&&
        Number.isInteger(state.window[id]?.n)&&state.window[id].n>=0&&
        state.window[id].n<=8&&Array.isArray(state.window[id].values)&&
        state.window[id].values.length===state.window[id].n&&
        state.window[id].values.every(v=>Number.isFinite(v)&&v>=-1&&v<=1)&&
        Math.abs(state.window[id].sum-
          state.window[id].values.reduce((a,b)=>a+b,0))<1e-12,
        'invalid eight-event rolling feedback window');
      need(Number.isInteger(state.sinceFlip[id])&&
        state.sinceFlip[id]>=0,'invalid cooldown');
    }
    need(Array.isArray(state.events)&&typeof state.frozen==='boolean'&&
      Number.isInteger(state.nextEvent),'invalid event bookkeeping');
    const copy=clone(state);
    Object.assign(this,{
      wiring:copy.wiring,switches:copy.switches,window:copy.window,
      sinceFlip:copy.sinceFlip,pending:copy.pending,events:copy.events,
      frozen:copy.frozen,nextEvent:copy.nextEvent
    });
    return this;
  }
}

/** Bounded extra bonus. Does not change any canonical gate or source cue. */
export function e1ExtraCueBonus(chosenTarget,target) {
  need(chosenTarget===null||(Number.isInteger(chosenTarget)&&
    chosenTarget>=0&&chosenTarget<=9),'bad proposal zone');
  return chosenTarget!==null&&chosenTarget===target?S1_CUE_STRENGTH:0;
}
