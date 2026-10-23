/**
 * PF3 A1 ENGINEERING FIXTURE: selective EncounterHistory H (synthetic ONLY).
 * This is NOT sealed PF3, PF2 science, external agency, or a demonstration
 * of autonomous Will. It imports frozen runtime via unchanged PF2 receiver and
 * last-term hook but instantiates FRESH synthetic receivers, with V DISABLED.
 * No internet, no live signal, no file writes, no new beacon rounds.
 *
 * Run: npx tsx experiments/pf3/PF3_A1_SYNTHETIC_ENGINEERING.mjs
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {PF2ReceiverLineage,PF2_OPEN,cueOf} from '../pf2/PF2_RECEIVER_CORE.mjs';

const sha=x=>createHash('sha256').update(x).digest('hex');
const MAX_H=12, W_H=0.18, N=2048, SEEDS=[11,19,29];
const synthetic=(seed,i)=>sha('PF3-A1-SYNTHETIC-ONLY|'+seed+'|'+i);
const sourceEvent=(seed,tick,input,previousCue,from,zones)=>{
 const cue=cueOf(input);
 if(previousCue===null||!PF2_OPEN[from].includes(cue))return null;
 const salience=(1-zones[cue].activation)+0.03*(from===1?1:0);
 return {
  id:sha('H|'+seed+'|'+tick+'|'+input),
  sourceSyntheticTick:tick,syntheticHex:input,sourceCue:cue,
  priorCue:previousCue,fromZone:from,targetZone:cue,
  salience,provenance:'SYNTHETIC_NOT_QUICKNET',sourceDigest:sha(input)
 };
};
class HRegister {
 constructor(policy){
  assert(['selective','fifo','yoked','reset'].includes(policy));
  this.policy=policy;this.items=[];this.accepted=0;this.evicted=0;this.eligible=0;
 }
 // Retention policy is EXPLICITLY DESIGNER SPECIFIED and NOT a learned will.
 observe(record){
  if(!record)return;
  this.eligible++;
  if(this.policy==='reset')return;
  // Keep source-evidence items. Equal 12-item capacity; yoked uses an
  // unrelated deterministic eviction score rather than recipient salience.
  this.items.push(record);this.accepted++;
  if(this.items.length>MAX_H){
   let idx=0;
   if(this.policy==='fifo')idx=0;
   else {
    const score=x=>this.policy==='selective'?x.salience:
      parseInt(sha('YOKED-INDEPENDENT-PRIORITY|'+x.sourceSyntheticTick).slice(0,8),16)/2**32;
    for(let j=1;j<this.items.length;j++)if(score(this.items[j])<score(this.items[idx]))idx=j;
   }
   this.items.splice(idx,1);this.evicted++;
  }
 }
 bonus(from,to,previousCue){
  if(previousCue===null||this.policy==='reset')return 0;
  const relevant=this.items.filter(x=>x.fromZone===from&&x.priorCue===previousCue);
  if(!relevant.length)return 0;
  const count=relevant.filter(x=>x.targetZone===to).length;
  return W_H*count/relevant.length;
 }
 export(){
  return {policy:this.policy,items:this.items.map(x=>({...x})),
   eligible:this.eligible,accepted:this.accepted,evicted:this.evicted};
 }
}
const clone=x=>JSON.parse(JSON.stringify(x));
function fixtureLife(seed,policy){
 const lineage=new PF2ReceiverLineage({armId:'C',k:0,mode:'unchanged'});
 const H=new HRegister(policy);
 let prevCue=null,trace=[],eligibleReadouts=0,hPivotal=0,rebirths=0;
 let differencesAtSameState=0,sourceLinksFail=0;
 for(let step=1;step<=N;step++){
  const input=synthetic(seed,step),cue=cueOf(input);
  const from=lineage.runtime.getCurrentZone();
  const beforeZones=clone(lineage.runtime.getQabbala().getZones());
  const vals=H.items.map(x=>x.sourceSyntheticTick);
  assert(vals.every(t=>t<step),'FUTURE_HISTORY_LEAKAGE');
  const available=PF2_OPEN[from]||[];
  const HContrib=Object.fromEntries(available.map(target=>[target,H.bonus(from,target,prevCue)]));
  const active=available.some(t=>HContrib[t]>0);
  // The 11 canonical edge-V values are all ZERO; isolate historical influence.
  assert(Object.values(lineage.V).every(v=>v===0),'PF3_A1_V_DISABLED');
  let localCounterfactual=null;
  if(active&&available.length>1){
   const state=clone(lineage.exportState());
   const fork=new PF2ReceiverLineage({armId:'C',k:0,mode:'unchanged',state});
   fork.runtime.exitBonus=()=>0;
   const ablated=fork.process(input,step,800000+step);
   localCounterfactual=ablated.toZone;
  }
  const beforePath=[...lineage.lifeZones];
  lineage.runtime.exitBonus=(a,b)=>H.bonus(a,b,prevCue);
  const e=lineage.process(input,step,800000+step);
  assert.equal(e.cueZone,cue,'CUE_MAPPER_DRIFT');
  assert.equal(e.fromZone,from,'SOURCE_ZONE_DRIFT');
  assert.equal(e.round,800000+step);
  if(e.death)rebirths++;
  if(active)eligibleReadouts++;
  if(localCounterfactual!==null){
   differencesAtSameState++;
   if(e.toZone!==localCounterfactual)hPivotal++;
  }
  // Credit a source history ONLY AFTER the actual event. No current-cue
  // can enter H before its own selection.
  const record=sourceEvent(seed,step,input,prevCue,from,beforeZones);
  H.observe(record);
  prevCue=cue;
  trace.push({step,syntheticSourceDigest:sha(input),cue,from,to:e.toZone,
   hActive:active,hPivotal:localCounterfactual!==null&&e.toZone!==localCounterfactual,
   counterfactualNoH:localCounterfactual,recordedHistory:record?.id??null,
   retainedCount:H.items.length,birthReset:!!e.death});
  assert(H.items.length<=MAX_H,'H_CAPACITY_EXCEEDED');
  assert(H.items.every(x=>x.provenance==='SYNTHETIC_NOT_QUICKNET'&&x.sourceSyntheticTick<=step),
    'UNSOURCED_HISTORY_FOUND');
 }
 return {seed,policy,steps:N,historyEligible:H.eligible,
  retained:H.items.length,accepted:H.accepted,evicted:H.evicted,
  activeReadouts:eligibleReadouts,localMatchedHChallenges:differencesAtSameState,
  hPivotal,rebirths,trajectoryDigest:sha(trace.map(x=>x.step+':'+x.to).join(';')),
  eventDigest:sha(JSON.stringify(trace)),finalSourceHistoryDigest:sha(JSON.stringify(H.export())),
  // Details deliberately reported as source-linked synthetic ENGINEERING, not science
  examplePivotal:trace.find(x=>x.hPivotal)??null};
}
const results=[];
for(const seed of SEEDS)for(const policy of ['selective','fifo','yoked','reset']){
 const x=fixtureLife(seed,policy);
 const y=fixtureLife(seed,policy);
 assert.deepEqual(x,y,'NONDETERMINISTIC_SYNTHETIC_REPLAY_'+policy+seed);
 if(policy==='reset')assert.equal(x.hPivotal,0);
 results.push(x);
}
const bySeed=SEEDS.map(seed=>{
 const arr=results.filter(x=>x.seed===seed);
 return {
  seed,policyDigest:Object.fromEntries(arr.map(x=>[x.policy,x.trajectoryDigest])),
  pivotal:Object.fromEntries(arr.map(x=>[x.policy,x.hPivotal])),
  active:Object.fromEntries(arr.map(x=>[x.policy,x.activeReadouts])),
  rebirths:Object.fromEntries(arr.map(x=>[x.policy,x.rebirths])),
 };
});
const summary={schema:'PF3_A1_SYNTHETIC_ENGINEERING_ONLY_V1',status:'UNREGISTERED_SYNTHETIC_PREFLIGHT',
 source:'sha256 synthetic strings, NOT quicknet, NEVER live',
 constants:{capacity:MAX_H,hWeight:W_H,steps:N,seeds:SEEDS},
 design:{
  H:'prior-cue/current-cue/from-zone source histories; bounded 12, order-sensitive',
  selective:'designer-fixed preference for lower pre-event target activation; NOT learned autonomous will',
  fifo:'keeps last 12 eligible past histories',
  yoked:'independent seed-free priority of past-event indices; NOT a true matched independent-donor mask',
  reset:'no H',
  V:'disabled so the new H readout can be isolated at feasibility stage',
  intervention:'export identical receiver state before cue, compare with H=0 on exact same synthetic input',
  noAgencyClaim:true,noDevelopmentBenefitClaim:true,noP2Claims:true,
  nextGate:'independently signed design with actual yoked masks, time permutation, H+V+PFM and held-out outcome'},
 results,bySeed,
 engineering:{
  determinismPASS:true,strictlyPastHOnly:true,historyCapacityPASS:true,
  resetNoHReadoutPASS:results.filter(x=>x.policy==='reset').every(x=>x.activeReadouts===0&&x.hPivotal===0),
  atLeastOneSameStateHInfluence:results.some(x=>x.policy!=='reset'&&x.hPivotal>0)
 }};
assert(summary.engineering.resetNoHReadoutPASS);
console.log('PF3_A1_SYNTHETIC_ENGINEERING_PASS '+JSON.stringify(summary));
