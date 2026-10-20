/**
 * PF-1 pre-live habit-memory NEGATIVE control.
 * Uses the PINNED, unmodified ProcessFieldMemory law directly:
 * src/ai/coupling/ProcessFieldMemory.ts at substrate pin b67ec92e....
 * Not IntegratedMemorySystem from the main runtime.
 *
 * No Governor, no target, no goal or destination variable in the selector.
 * Zone activations, phase angles, gates, flux and resistance are frozen
 * to INITIAL_ZONES and CANONICAL_GATES; the only historical effect
 * is the actual imported PFM tanh(strain * 1.8) * 0.35 readout.
 */
import assert from 'node:assert/strict';
import {INITIAL_ZONES,CANONICAL_GATES} from '../../src/ai/numogram/AmeliaQabbalaInterface';
import {ProcessFieldMemory} from '../../src/ai/coupling/ProcessFieldMemory';
import {canonicalSha256} from '../../src/lib/sha256';
import {digest,inputsForTick} from './PF1_A1_R2_SCORER.mjs';

export class HabitMemoryWalker {
 constructor(z=1,history=[],stepCount=0,suppressedZone=null,scale=1){
  this.zone=z;
  this.stepCount=stepCount;
  this.suppressedZone=suppressedZone;
  this.scale=scale;
  this.pfm=new ProcessFieldMemory();
  this.pfm.hydrate(history);
  this.fixedZones=INITIAL_ZONES;
  this.fixedGates=CANONICAL_GATES;
  assert(this.fixedGates.filter(x=>x.isOpen).length===11);
 }
 static fresh(){return new HabitMemoryWalker(1);}
 snapshot(){
  return {currentZone:this.zone,stepCount:this.stepCount,
   pfmHistory:this.pfm.getHistory().map(x=>({...x})),
   pfmDigest:this.pfm.exportHistoryDigest(),
   tensor:this.pfm.getConstitutiveDeformationTensor(),
   bias:this.pfm.readMemoryBias(),noGovernor:true,noGoal:true};
 }
 static fromCheckpoint(snapshot,condition,anchor,turn,startZone){
  const keep=condition!=='reset';
  const h=keep?snapshot.pfmHistory:[];
  const suppressedZone=condition==='suppress'?turn:null;
  const scale=condition==='suppress'?0.1:1;
  const walk=new HabitMemoryWalker(startZone,h,snapshot.stepCount,suppressedZone,scale);
  assert.equal(walk.pfm.getHistory().length,keep?snapshot.pfmHistory.length:0);
  return walk;
 }
 step(input){
  this.stepCount++;
  const from=this.zone;
  const bias=this.pfm.readMemoryBias().biasVector;
  const hash=input?.trim()?canonicalSha256(input.trim()):undefined;
  const inputZone=hash?parseInt(hash.slice(0,2),16)%10:undefined;
  const options=this.fixedGates.filter(g=>g.isOpen&&g.source===from);
  let to=from,best=-Infinity;
  for(const gate of options){
   const z=this.fixedZones[gate.target];
   const activation=z.activation*(this.suppressedZone===gate.target?this.scale:1);
   const score=gate.flux*(1-gate.resistance)
     +(bias[gate.target]||0)*0.4
     +activation*0.2+Math.cos(z.phaseAngle)*0.1
     +(inputZone===gate.target?0.35:0);
   if(score>best){best=score;to=gate.target;}
  }
  const source=this.fixedZones[from],target=this.fixedZones[to];
  const fluxDelta=Number(Math.max(0.005,
   Math.min(0.18,Math.abs(target.activation-source.activation)*0.12+0.025)).toFixed(6));
  const phaseCoherence=Number(Math.max(0.05,
   Math.min(1,(1+Math.cos(target.phaseAngle-source.phaseAngle))/2)).toFixed(6));
  const body={step:this.stepCount,from,to,fluxDelta,phaseCoherence,
   inputDigest:hash??null,inputZone:inputZone??null};
  const eventDigest=canonicalSha256(JSON.stringify(body));
  this.pfm.append({blockIndex:this.stepCount,depth:this.stepCount,
   targetZone:to,fluxDelta,phaseCoherence,strainRelaxation:0.025,
   eventDigest,timestamp:this.stepCount});
  this.zone=to;
  return {from,to,biasDigest:digest(bias),eventDigest};
 }
 fork(snapshot,candidate,instance,condition,future){
  const clone=HabitMemoryWalker.fromCheckpoint(snapshot,condition,candidate.a,candidate.b,instance.startZone);
  const zoneTrace=[clone.zone];
  const transitionEvidence=[];
  const consumed=[];
  for(let tick=1;tick<=24;tick++){
   const symbol=inputsForTick(instance,tick,future);
   const x=clone.step(symbol);
   transitionEvidence.push({...x,tick});
   consumed.push(symbol??null);
   zoneTrace.push(clone.zone);
  }
  assert(zoneTrace.length===25);
  return {zones:zoneTrace,digest:digest(zoneTrace),stateDigest:digest(clone.snapshot()),
   schedule:instance.kind==='inputDelay'?'L2':null,
   evidence:{inputDigest:digest(consumed),firstTransitions:transitionEvidence.slice(0,4),
    historyLength:clone.pfm.getHistory().length,
    tensor:clone.pfm.getConstitutiveDeformationTensor(),
    bias:clone.pfm.readMemoryBias().biasVector}};
 }
}
