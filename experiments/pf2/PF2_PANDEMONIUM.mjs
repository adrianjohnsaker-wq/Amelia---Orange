/**
 * PF2 Pandemonium journal adapter around the UNCHANGED pinned PF1-A1 R2
 * detector/scorer and its exact graph-only null curves.
 * No interpretation of a "Mind" is added by this interface, and nothing
 * is a confirmed encounter until the unchanged evaluator returns encounter.
 * All outcomes are sealed in PF2's append-only batch journal, no notifications.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {pairKey,distance} from '../pf1/core.mjs';
import {load,evaluate,inputsForTick} from '../pf1/PF1_A1_R2_SCORER.mjs';
import {pf2InputForArm} from './PF2_REFERENCE_INPUT.mjs';
import {PF2ReceiverLineage,pf2FinalExcursion,pf2Refrain,PF2_ETA} from './PF2_RECEIVER_CORE.mjs';
import {pf2Step} from './PF2_EXIT_SCORE_OVERLAY.mjs';
const sha=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const ZERO=()=>({scannedSteps:0,candidatesDetected:0,eligibleCandidates:0,
 forkInstancesProbed:0,confirmedEncounters:0});
const freshTrack=()=>({lastSeenZones:{'0':0},excursionsByPair:{},
 lastDetectedByPair:{},probedByHour:{},lifeStep:0});
const pairId=(k,mode)=>'R'+String(k).padStart(2,'0')+'-'+mode;
export class PF2Pandemonium{
 constructor(state=null){
  this.scope=load(); // unchanged PF1 exact constants, scanner & naming-table SHA
  this.track=state?.track??Object.fromEntries(
   Array.from({length:9},(_,k)=>['learner','unchanged'].map(mode=>[pairId(k,mode),freshTrack()])).flat()
  );
  this.pending=state?.pending??[];
  this.history=state?.history??[];
  this.encounters=state?.encounters??[];
 }
 detector(event,receiverSnapshot){
  const id=pairId(event.k,event.mode),tracker=this.track[id];
  assert(tracker);
  if(event.death){this.track[id]=freshTrack();return null}
  const zones=receiverSnapshot.lifeZones;
  const step=zones.length-1;
  if(step!==tracker.lifeStep+1)throw Error('PF2_SCANNER_STEP_ALIGNMENT');
  tracker.lifeStep=step;
  const z=zones.at(-1),old=tracker.lastSeenZones[String(z)];
  tracker.lastSeenZones[String(z)]=step;
  if(old===undefined||step-old<2)return null;
  const path=zones.slice(old,step+1);
  let b=null,best=-1;
  for(const mid of path.slice(1,-1)){
   if(mid===z)continue;
   const d=distance(this.scope.graph,mid,z);
   if(Number.isFinite(d)&&d>best){best=d;b=mid}
  }
  if(b===null)return null;
  const key=pairKey(z,b);
  const recent=tracker.excursionsByPair[key]??[];
  recent.push(step);
  tracker.excursionsByPair[key]=recent.filter(t=>t>=step-this.scope.constants.scanner.windowSteps+1);
  const last=tracker.lastDetectedByPair[key];
  if(tracker.excursionsByPair[key].length<this.scope.constants.scanner.recurrenceCount||
      (last!==undefined&&step-last<this.scope.constants.scanner.windowSteps))return null;
  tracker.lastDetectedByPair[key]=step;
  return {a:z,b,key,end:step,start:old,path,
   recurrences:tracker.excursionsByPair[key].length,
   mostRecent:{a:z,b,key,start:old,end:step,path}};
 }
 onTick(verified,events,receivers){
  assert(events.length===18 && receivers.length===18);
  const tick=events[0].tick;
  assert(events.every(x=>x.tick===tick&&x.round===verified.round));
  const exposures={};
  const created=[];
  this.history.push({tick,round:verified.round,randomness:verified.randomness,
   perLineage:events.map(e=>({k:e.k,mode:e.mode,cue:e.cueZone,
      from:e.fromZone,to:e.toZone,choice:e.choicePoint,followed:e.followedCue}))});
  this.history=this.history.slice(-265); // includes 240 antecedent ticks plus 24 future
  for(let index=0;index<18;index++){
   const e=events[index],r=receivers[index],id=pairId(e.k,e.mode);
   const stats=ZERO();stats.scannedSteps=1;
   const cand=this.detector(e,r.exportState());
   if(cand){
    stats.candidatesDetected++;
    const definition=this.scope.rowByPair.get(cand.key);
    if(definition?.eligibleByGraphOnlyNull){
     stats.eligibleCandidates++;
     const hour=Math.floor(tick/60);
     const seen=this.track[id].probedByHour[String(hour)]??0;
     if(seen<2){
      const orientation=definition.orientations.find(x=>x.anchor===cand.a&&x.turn===cand.b);
      assert(orientation,'PF2_ELIGIBLE_PAIR_MISSING_ORIENTATION');
      this.track[id].probedByHour[String(hour)]=seen+1;
      const task={id:'PF2-'+id+'-'+tick+'-'+cand.key,
       k:e.k,mode:e.mode,detectionTick:tick,confirmationTick:tick+24,
       candidate:cand,checkpoint:r.exportState(),sourceRound:verified.round};
      assert(!this.pending.some(x=>x.id===task.id));
      this.pending.push(task);created.push(task.id);
     }
    }
   }
   exposures[id]=stats;
  }
  const confirmed=this.scoreReady(tick,exposures);
  return {exposures,createdForkIDs:created,confirmed};
 }
 scoreReady(tick,exposures){
  const completed=[],confirmed=[];
  for(const task of this.pending){
   if(task.confirmationTick>tick)continue;
   if(task.confirmationTick!==tick)throw Error('PF2_DETECTOR_MISSED_CONFIRMATION_TICK');
   const future=this.history.filter(x=>x.tick>task.detectionTick&&x.tick<=tick);
   assert.equal(future.length,24,'PF2_NO_24_VERIFIED_FUTURE_ROUNDS');
   for(let j=0;j<24;j++)assert.equal(future[j].tick,task.detectionTick+j+1);
   const tape=future.map(x=>pf2InputForArm(x.randomness,task.k));
   const runner=(candidate,p,condition)=>{
    const line=new PF2ReceiverLineage({armId:task.k===0?'C':'R'+String(task.k).padStart(2,'0'),
     k:task.k,mode:task.mode,state:task.checkpoint});
    const rt=line.runtime;
    if(condition==='reset')rt.getMemory().reset();
    if(condition==='suppress')
     rt.getQabbala().getZones()[candidate.b].activation*=
       this.scope.constants.encounter.selectiveSuppressionScale;
    if(p.kind==='displacement'){
     const c=rt.exportState();c.currentZone=p.startZone;rt.importState(c);
    }
    const zones=[rt.getCurrentZone()];
    assert.equal(zones[0],p.startZone);
    let absorbed=false;
    const history=p.kind==='displacement'?[p.startZone]:[...line.lifeZones];
    for(let t=1;t<=24;t++){
     const input=inputsForTick(p,t,tape);
     // After absorption, preserve PF1's 24-step absorbing dwell for the
     // Rung 1 null, rather than introducing rebirth into its fixed null.
     const to=pf2Step(rt,input).lastTransition.to;
     zones.push(to);
     if(absorbed)continue;
     history.push(to);
     if(to===5){
      absorbed=true;
      if(task.mode==='learner')for(const e of pf2FinalExcursion(history))
       line.V[e]+=PF2_ETA*(-1-line.V[e]);
     }else if(task.mode==='learner'){
      const i=history.length-1,u=i-24;
      if(u>=0){const edge=history[u]+'>'+history[u+1],v=pf2Refrain(history,u);
       if(edge in line.V)line.V[edge]+=PF2_ETA*(v-line.V[edge]);
      }
     }
    }
    return {zones,digest:sha(zones),
     stateDigest:sha({canonical:rt.exportState().memoryState,
      V:line.V}),schedule:p.kind==='inputDelay'?'L2':null};
   };
   const outcome=evaluate(task.candidate,this.scope,runner);
   assert(outcome.shamParity,'PF2_PF1_SHAM_PARITY_FAILURE');
   assert(outcome.forks<=this.scope.constants.budget.ameliaForksPerCandidateMax);
   const id=pairId(task.k,task.mode);
   exposures[id].forkInstancesProbed+=outcome.forks;
   if(outcome.encounter){
    exposures[id].confirmedEncounters++;
    const entity=this.scope.names.get(task.candidate.key);
    const preceding=this.history.filter(x=>
      x.tick>task.detectionTick-240&&x.tick<=task.detectionTick)
       .map(x=>({tick:x.tick,round:x.round,record:x.perLineage[2*task.k+
         (task.mode==='unchanged'?1:0)]}));
    const record={schema:'PF2_RUNG1_PANDEMONIUM_ENCOUNTER_V1',
     entity:entity?.name??'UNNAMED',armIndex:task.k,mode:task.mode,
     pair:task.candidate.key,detectionTick:task.detectionTick,
     confirmationTick:tick,checkpointSHA256:sha(task.checkpoint),
     assessment:outcome,prior240CuesAndChoices:preceding,
     notificationsSent:0,
     scientificInterpretation:'Operational PF1 A1 R2 encounter on PF2 lineage; not evidence of an external Mind.'};
    confirmed.push(record);this.encounters.push(record);
   }
   completed.push(task.id);
  }
  if(completed.length)this.pending=this.pending.filter(x=>!completed.includes(x.id));
  return confirmed;
 }
 exportState(){return {schema:'PF2_PANDEMONIUM_STATE_V1',
  track:this.track,pending:this.pending,history:this.history,encounters:this.encounters}}
}
