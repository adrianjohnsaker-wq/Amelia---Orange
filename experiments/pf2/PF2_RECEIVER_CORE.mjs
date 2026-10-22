/**
 * PF2 "The Receiver" — deterministic, stateful tick-level 18-arm engine.
 * Normative behavioural authority: receiver.mjs + four verified GOLD digests.
 * This code creates NO genesis, opens NO network connection and sends NO
 * notifications. Input is a verified 32-byte randomness supplied by an
 * independent, separately authorised admission service.
 *
 * Each of 9 arms has two independently reborn lineages with IDENTICAL input.
 * V is carried across deaths ONLY in learner. Control never reads/writes V.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {AmeliaNumogramSubstrateRuntime} from '../../src/substrate/ameliaNumogramSubstrateRuntime.ts';
import {accelerateExactHistoryDigest} from '../../src/developmental/DEV1ExactDigestAdapter.ts';
import {pf2Step} from './PF2_EXIT_SCORE_OVERLAY.mjs';
import {pf2InputForArm} from './PF2_REFERENCE_INPUT.mjs';
export const PF2_EDGES=['0>9','1>8','2>7','3>6','4>5','1>2','2>4','4>7','7>8','8>9','9>1'];
export const PF2_ARMS=['C','R01','R02','R03','R04','R05','R06','R07','R08'];
export const PF2_W_V=0.5,PF2_H=24,PF2_ETA=1/8;
export const PF2_OPEN={0:[9],1:[8,2],2:[7,4],3:[6],4:[5,7],5:[],6:[],7:[8],8:[9],9:[1]};
export const PF2_PIT={1:2,2:4,4:5};
const key=(x,y)=>x+'>'+y;
const hash=s=>createHash('sha256').update(s).digest('hex');
export const cueOf=s=>parseInt(hash(s.trim()).slice(0,2),16)%10;

export function pf2FinalExcursion(z) {
 const ta=z.length-1;
 for(let t=Math.max(0,ta-PF2_H);t<ta;t++){
  const th=new Set(t>0?z.slice(Math.max(0,t-PF2_H),t):[z[0]]);
  if(th.has(z[t+1]))continue;
  let noReturn=true;
  for(let s=t+1;s<=ta;s++)if(th.has(z[s])){noReturn=false;break}
  if(noReturn){const edges=new Set();for(let s=t;s<ta;s++)edges.add(key(z[s],z[s+1]));return [...edges]}
 }
 return [key(z[ta-1],z[ta])];
}
export function pf2Refrain(z,t) {
 const th=new Set(t>0?z.slice(Math.max(0,t-PF2_H),t):[z[0]]);
 if(th.has(z[t+1]))return 0;
 for(let s=t+2;s<=t+PF2_H;s++)if(th.has(z[s])){
  const prev=new Set();for(let u=Math.max(0,t-PF2_H);u<t;u++)prev.add(key(z[u],z[u+1]));
  const exc=new Set();for(let u=t;u<s;u++)exc.add(key(z[u],z[u+1]));
  let n=0;for(const edge of exc)if(!prev.has(edge))n++;
  return n/11;
 }
 return 0;
}
const emptyChoices=()=>({1:{cuedPit:0,followPit:0,cuedOther:0,followOther:0},
 2:{cuedPit:0,followPit:0,cuedOther:0,followOther:0},
 4:{cuedPit:0,followPit:0,cuedOther:0,followOther:0,uncued:0,uncuedPit:0}});
const zeroV=()=>Object.fromEntries(PF2_EDGES.map(x=>[x,0]));

export class PF2ReceiverLineage{
 constructor({armId,k,mode,state=null}){
  assert(PF2_ARMS.includes(armId));
  assert(Number.isInteger(k)&&k>=0&&k<=8);
  assert(mode==='learner'||mode==='unchanged');
  this.armId=armId;this.k=k;this.mode=mode;
  this.V=zeroV();this.birthTick=0;this.lastTick=0;this.lifeZones=[];
  this.lives=[];this.choices=emptyChoices();
  this.traceHead=''; // full transition logs and ledger are archived per tick outside runtime
  this.runtime=null;
  if(state)this.importState(state);else this.birth(0);
 }
 birth(tick){
  this.runtime=new AmeliaNumogramSubstrateRuntime();
  accelerateExactHistoryDigest(this.runtime.getMemory());
  if(this.mode==='learner')this.runtime.exitBonus=(x,y)=>PF2_W_V*this.V[key(x,y)];
  this.lifeZones=[this.runtime.getCurrentZone()];
  this.birthTick=tick;
 }
 process(input,tick,round){
  assert(typeof input==='string'&&input.length>0);
  assert(Number.isInteger(tick)&&tick===this.lastTick+1,'PF2_TICK_OUT_OF_ORDER');
  const cue=cueOf(input),from=this.lifeZones.at(-1);
  const vAtChoice=this.mode==='learner'
     ?Object.fromEntries((PF2_OPEN[from]||[]).map(target=>[key(from,target),PF2_W_V*this.V[key(from,target)]]))
     :{};
  const to=pf2Step(this.runtime,input).lastTransition.to;
  assert(PF2_OPEN[from].includes(to),'PF2_NONCANONICAL_EXIT');
  this.lifeZones.push(to);
  const pit=PF2_PIT[from];
  const isChoice=pit!==undefined;
  const among=isChoice?PF2_OPEN[from].includes(cue):false;
  const followed=among&&cue===to;
  if(isChoice){
   const c=this.choices[from];
   if(among){
    if(cue===pit){c.cuedPit++;if(to===pit)c.followPit++}
    else{c.cuedOther++;if(to===cue)c.followOther++}
   }else if(from===4){c.uncued++;if(to===pit)c.uncuedPit++}
  }
  let death=null,refrainOutcome=null;
  if(to===5){
   const fin=pf2FinalExcursion(this.lifeZones);
   if(this.mode==='learner')for(const edge of fin)this.V[edge]+=PF2_ETA*(-1-this.V[edge]);
   death={bornTick:this.birthTick,length:tick-this.birthTick,cuedIntoSink:cue===5,
      cueAtDeath:cue,round,finalExcursion:fin,finalV:{...this.V},
      distinctDirectedEdges:new Set(this.lifeZones.slice(1).map((z,i)=>key(this.lifeZones[i],z))).size};
   this.lives.push({bornTick:death.bornTick,length:death.length,
      cuedIntoSink:death.cuedIntoSink,finalExcursion:fin});
  }else if(this.mode==='learner'){
   const i=this.lifeZones.length-1,t=i-PF2_H;
   if(t>=0){
    const ek=key(this.lifeZones[t],this.lifeZones[t+1]);
    const o=pf2Refrain(this.lifeZones,t);
    if(ek in this.V)this.V[ek]+=PF2_ETA*(o-this.V[ek]);
    refrainOutcome={settledStep:t,outcome:o,edge:ek};
   }
  }
  const event={
   armId:this.armId,mode:this.mode,k:this.k,tick,round,cueZone:cue,fromZone:from,toZone:to,
   choicePoint:isChoice,cueAmongOpenExits:among,followedCue:followed,
   valueTerms:vAtChoice,death,refrainOutcome
  };
  this.lastTick=tick;
  if(death)this.birth(tick); // successor receives V, but no canonical individual state
  return event;
 }
 exportState(){
  const state=this.runtime.exportState();
  // Snapshots include Date.now but never govern development: omit from
  // persistent scientific state so byte-for-byte replay is reproducible.
  state.snapshots=[];state.memoryConsumptionLog=[];
  return {
   schema:'PF2_LINEAGE_STATE_V1',armId:this.armId,k:this.k,mode:this.mode,
   V:{...this.V},birthTick:this.birthTick,lastTick:this.lastTick,
   lifeZones:[...this.lifeZones],lives:this.lives,choices:this.choices,
   canonicalState:state,
  };
 }
 importState(s){
  assert(s.schema==='PF2_LINEAGE_STATE_V1');
  assert(s.armId===this.armId&&s.k===this.k&&s.mode===this.mode);
  assert(Array.isArray(s.lifeZones)&&s.lifeZones.length>=1);
  assert(Object.keys(s.V).length===11);
  this.V={...s.V};this.birthTick=s.birthTick;this.lastTick=s.lastTick;
  this.lifeZones=[...s.lifeZones];this.lives=s.lives;this.choices=s.choices;
  this.runtime=new AmeliaNumogramSubstrateRuntime();
  this.runtime.importState(s.canonicalState);
  accelerateExactHistoryDigest(this.runtime.getMemory());
  if(this.mode==='learner')this.runtime.exitBonus=(x,y)=>PF2_W_V*this.V[key(x,y)];
  assert(this.runtime.getCurrentZone()===this.lifeZones.at(-1),'PF2_RECOVERY_ZONE_MISMATCH');
 }
}
export class PF2NinePairs{
 constructor(s=null){
  this.tick=0;
  this.receivers=[];
  if(s){
   assert(s.schema==='PF2_NINE_PAIR_STATE_V1');
   this.tick=s.tick;
   this.receivers=s.receivers.map(x=>new PF2ReceiverLineage({armId:x.armId,k:x.k,mode:x.mode,state:x}));
  }else{
   for(let k=0;k<9;k++)for(const mode of ['learner','unchanged'])
    this.receivers.push(new PF2ReceiverLineage({armId:PF2_ARMS[k],k,mode}));
  }
  assert(this.receivers.length===18);
 }
 processVerified(round,randomness){
  assert(Number.isInteger(round)&&round>0);
  assert(/^[0-9a-f]{64}$/i.test(randomness));
  const tick=this.tick+1;
  const events=[];
  for(let k=0;k<9;k++){
   const input=pf2InputForArm(randomness,k);
   for(const mode of ['learner','unchanged']){
    const r=this.receivers[2*k+(mode==='unchanged'?1:0)];
    events.push(r.process(input,tick,round));
   }
  }
  assert(events.length===18);
  for(let k=0;k<9;k++){
   const a=events[2*k],b=events[2*k+1];
   assert(a.cueZone===b.cueZone,'PF2_PAIR_INPUT_DIFFERENT');
  }
  this.tick=tick;
  return {tick,round,events};
 }
 exportState(){return {schema:'PF2_NINE_PAIR_STATE_V1',tick:this.tick,
   receivers:this.receivers.map(x=>x.exportState())}}
}
