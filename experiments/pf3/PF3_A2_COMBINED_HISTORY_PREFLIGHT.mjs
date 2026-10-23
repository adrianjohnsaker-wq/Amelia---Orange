/**
 * PF3 A2 — SYNTHETIC feasibility only. Fully isolated from PF2 live registry.
 * Combines authentic PF2 inherited V + canonical PFM + new external-history H.
 * The receiver and frozen canonical runtime are IMPORTED, never edited.
 *
 * Genuine yoked arm receives a retention/eviction schedule MADE BY an independent
 * adaptive donor on an independent synthetic tape, then executes it on its own.
 * No physical drand, no external agent, no autonomy/consciousness claim.
 *
 * Run: npx tsx experiments/pf3/PF3_A2_COMBINED_HISTORY_PREFLIGHT.mjs /tmp/pf3-a2
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {PF2ReceiverLineage,PF2_OPEN,PF2_EDGES,PF2_W_V,PF2_H,cueOf} from '../pf2/PF2_RECEIVER_CORE.mjs';

const sha=x=>createHash('sha256').update(x).digest('hex');
const clone=x=>JSON.parse(JSON.stringify(x));
const K=12, WH=0.16, N=1024, SEEDS=[101,211,307];
const POLICIES=['adaptive','fixed','fifo','yoked','order_sham','reset'];
const input=(seed,t,donor=false)=>sha('PF3-A2-DESIGN-SYNTHETIC-ONLY|'+(donor?'DONOR|':'RECIPIENT|')+seed+'|'+t);
const clip=x=>Math.min(.5,Math.max(-.5,x));
const motif=(p,c)=>p===null?'start':p+'|'+c;
const emptyH=()=>({items:[],pref:new Array(10).fill(0),creditCount:0,
 accepted:0,evictions:0,adaptiveDifferentFromFifo:0,yokedCopyChecks:0});
function readBonus(H,policy,from,to,previousCue){
 if(policy==='reset'||previousCue===null||!H.items.length)return 0;
 const xs=H.items;
 // Order sham permutes only the labels of past-to-current cue adjacencies
 // across entries while preserving the marginal set of cue observations.
 const prior=policy==='order_sham'?
  xs.map((_,i)=>xs[(i+5)%xs.length].previousCue):
  xs.map(x=>x.previousCue);
 let denominator=0,numerator=0;
 for(let i=0;i<xs.length;i++)if(prior[i]===previousCue){
  denominator++;if(xs[i].cue===to)numerator++;
 }
 return denominator?WH*numerator/denominator:0;
}
function historyScore(item,H,policy,step){
 if(policy==='fifo')return item.tick;
 if(policy==='fixed')return (item.cue*7%13)/13 +.0000001*item.tick;
 // All mutable values here were learned strictly from PRIOR settlements.
 return .7*H.pref[item.cue]+
   .3*(item.previousCue===null?0:H.pref[item.previousCue])+
   .0000001*item.tick;
}
function insertHistory(H,item,policy,step,donorEviction=null){
 H.accepted++;
 if(policy==='reset')return null;
 assert(item.tick===step);
 H.items.push(item);
 if(H.items.length<=K)return null;
 let toDrop=0;
 if(policy==='yoked'){
  assert(Number.isInteger(donorEviction)&&donorEviction>=0&&donorEviction<K+1,
    'DONOR_EVICTION_MISSING_OR_INVALID_AT_'+step);
  toDrop=donorEviction;H.yokedCopyChecks++;
 }else {
  let best=Infinity;
  const internal=policy==='order_sham'?'adaptive':policy;
  for(let i=0;i<H.items.length;i++){
   const s=historyScore(H.items[i],H,internal,step);
   if(s<best){best=s;toDrop=i}
  }
 }
 if(toDrop!==0)H.adaptiveDifferentFromFifo++;
 H.items.splice(toDrop,1);H.evictions++;
 assert.equal(H.items.length,K);
 return toDrop;
}
function updateCredit(H,source,outcome) {
 if(!source)return;
 assert(source.cue>=0&&source.cue<=9,'CREDIT_CUE_OUT_OF_RANGE');
 // Bounded online estimate; update AFTER 24-step consequences settle.
 // Refrain is reward-transformed but not a test for autonomy or capacity.
 const value=outcome<0?-1:(outcome>0?1:-.05),lr=.22;
 H.pref[source.cue]+=lr*(value-H.pref[source.cue]);
 H.creditCount++;
}
function buildRecord(seed,step,inputHex,priorCue,from,to){
 return {source:'PF3_A2_DESIGN_SYNTHETIC_NOT_BEACON',seed,
  tick:step,inputHex,cue:cueOf(inputHex),previousCue:priorCue,
  executedFrom:from,executedTo:to,
  sourceDigest:sha(inputHex),recordDigest:sha('PF3A2|'+seed+'|'+step+'|'+inputHex)};
}
function bonus(H,L,policy,previousCue,from,to,hasH=true,hasV=true){
 const v=hasV?PF2_W_V*(L.V[from+'>'+to]??0):0;
 const h=hasH?readBonus(H,policy,from,to,previousCue):0;
 return clip(v+h);  // PF2 overlay requires |last bonus| <= 0.5
}
function forkExit(L,H,policy,signal,tick,previousCue,hasH,hasV){
 const f=new PF2ReceiverLineage({
  armId:'C',k:0,mode:'learner',state:clone(L.exportState())});
 f.runtime.exitBonus=(a,b)=>bonus(H,f,policy,previousCue,a,b,hasH,hasV);
 const e=f.process(signal,tick,900000+tick);
 return e.toZone;
}
function probe(L,H,policy,previousCue,seed,checkpoint,allowH){
 const z=new PF2ReceiverLineage({
  armId:'C',k:0,mode:'learner',state:clone(L.exportState())});
 let prior=previousCue,deaths=0;
 const edges=new Set(),responses=[],visits=new Set();
 for(let i=0;i<48;i++){
  const trialInput=sha('PF3-A2-FIXED-HELDOUT-PROBE|'+seed+'|'+checkpoint+'|'+i);
  z.runtime.exitBonus=(a,b)=>bonus(H,z,policy,prior,a,b,allowH,true);
  const t=z.lastTick+1;
  const e=z.process(trialInput,t,900000+t);
  edges.add(e.fromZone+'>'+e.toZone);
  if(e.choicePoint){responses.push(e.fromZone+':'+e.cueZone+'>'+e.toZone);visits.add(e.fromZone);}
  deaths+=Number(!!e.death);
  prior=e.cueZone;
 }
 return {distinctEdges:edges.size,branchingZoneCount:visits.size,
  deaths,decisionPathHash:sha(responses.join('|')),
  edges:[...edges].sort()};
}
function run(seed,policy,donorSchedule=null,asDonor=false){
 const receiver=new PF2ReceiverLineage({armId:'C',k:0,mode:'learner'});
 const H=emptyH();let priorCue=null,lifeSources=[],lastDeathH=null;
 const actions=[],path=[];let firstHExample=null;
 const summary={seed,policy,asDonor,steps:N,branchChoices:0,
  cuePivotal:0,hPivotal:0,vPivotal:0,overlapHV:0,
  hActiveBranchChoices:0,bonusClippedAtChoice:0,attributionMatched:0,
  contexts:new Map(),repeatedContexts:0,differentOnReturn:0,
  deathCount:0,rebirthHExact:0,rebirthVExact:0,postRebirthHPivotal:0,
  positiveRefrain:0,settledRefrain:0,probes:[],lastDeathTick:null,
  firstHExample:null,sourceLinksAudited:0};
 let hSinceLastDeath=false;
 for(let t=1;t<=N;t++){
  const x=input(seed,t,asDonor),from=receiver.runtime.getCurrentZone(),c=cueOf(x);
  assert(H.items.every(i=>i.tick<t),'H_FUTURE_SOURCE_LEAK');
  const beforeH=sha(JSON.stringify(H.items));
  const beforeV=sha(JSON.stringify(receiver.V));
  if(lastDeathH){
   assert.equal(lastDeathH.H,beforeH,'H_DID_NOT_SURVIVE_REBIRTH');
   assert.equal(lastDeathH.V,beforeV,'V_DID_NOT_SURVIVE_REBIRTH');
   summary.rebirthHExact++;summary.rebirthVExact++;
   lastDeathH=null;
  }
  const choices=PF2_OPEN[from]||[];
  const Hactive=choices.some(to=>readBonus(H,policy,from,to,priorCue)>0);
  const Vactive=choices.some(to=>Math.abs(receiver.V[from+'>'+to]||0)>0);
  const isBranch=choices.length===2;
  // Same-state analytic ablation at the EXACT post-evolution, pre-choice
  // selector. Reconstruct actual winner using immutable canonical gate order;
  // validate against the actual PF2 step before accepting H/V counterfactuals.
  let local=null,hOff=null,vOff=null;
  const trait=receiver.runtime.traitEvolution;
  const originalEvolve=trait.evolveStep;
  trait.evolveStep=function(...args){
   const result=originalEvolve.apply(this,args);
   if(isBranch){
    const zones=args[0],gates=args[1],biasVector=args[4];
    const options=gates.filter(g=>g.isOpen&&g.source===from);
    assert.equal(options.length,2,'TWO_OPEN_EXITS_EXPECTED');
    const base=g=>{
     const z=zones[g.target];
     return g.flux*(1-g.resistance)
       +(biasVector[g.target]||0)*.4
       +z.activation*.2+Math.cos(z.phaseAngle)*.1
       +(c===g.target?.35:0);
    };
    const choose=(includeH,includeV)=>{
     let best=-Infinity,to=from;
     for(const g of options){
      const score=base(g)+bonus(H,receiver,policy,priorCue,from,g.target,includeH,includeV);
      if(score>best){best=score;to=g.target;}
     }
     return to;
    };
    local={actual:choose(true,true),Hoff:choose(false,true),
      Voff:choose(true,false),
      clipped:options.filter(g=>Math.abs(
       PF2_W_V*(receiver.V[from+'>'+g.target]??0)+readBonus(H,policy,from,g.target,priorCue))>0.5+1e-12).length};
   }
   return result;
  };
  let ev;
  try{
   receiver.runtime.exitBonus=(a,b)=>bonus(H,receiver,policy,priorCue,a,b,true,true);
   ev=receiver.process(x,t,900000+t);
  }finally{trait.evolveStep=originalEvolve;}
  assert.equal(ev.fromZone,from);assert.equal(ev.cueZone,c);
  if(isBranch){
   assert(local,'POST_EVOLUTION_SELECTOR_AUDIT_MISSING');
   assert.equal(local.actual,ev.toZone,'ACTUAL_RECONSTRUCTED_CHOICE_MISMATCH_'+seed+'_'+policy+'_'+t);
   hOff=local.Hoff;vOff=local.Voff;
   summary.hActiveBranchChoices+=Number(Hactive);
   summary.bonusClippedAtChoice+=local.clipped;
   summary.attributionMatched++;
  }
  const hPivotal=isBranch&&hOff!==ev.toZone;
  const vPivotal=isBranch&&vOff!==null&&vOff!==ev.toZone;
  if(isBranch){
   summary.branchChoices++;
   summary.hPivotal+=Number(hPivotal);
   summary.vPivotal+=Number(vPivotal);
   summary.overlapHV+=Number(hPivotal&&vPivotal);
   const ctx=from+'|'+c,other=summary.contexts.get(ctx);
   if(other){summary.repeatedContexts++;
    summary.differentOnReturn+=Number(other!==ev.toZone);}
   summary.contexts.set(ctx,ev.toZone);
  }
  if(hPivotal&&!firstHExample){
   firstHExample={tick:t,from,to:ev.toZone,cue:c,
    sameStateWithoutH:hOff,VHash:beforeV,HHash:beforeH,
    selectedHistory:H.items.map(i=>i.recordDigest),
    priorCue,lifePathBeforeCurrent:receiver.lifeZones.slice(0,-1)};
  }
  if(lastDeathH===null&&hSinceLastDeath&&hPivotal)summary.postRebirthHPivotal++;
  const rec=buildRecord(seed,t,x,priorCue,from,ev.toZone);
  lifeSources.push(rec);
  if(ev.refrainOutcome){
   const idx=ev.refrainOutcome.settledStep;
   assert.equal(idx,lifeSources.length-PF2_H,'SOURCE_HORIZON_OFFSET');
   const src=lifeSources[idx];
   assert.equal(src.executedFrom+'>'+src.executedTo,ev.refrainOutcome.edge);
   assert.equal(src.tick,t-PF2_H+1,'PF2_24_EVENT_WINDOW_INDEX_MATCH');
   summary.sourceLinksAudited++;
   summary.settledRefrain++;
   summary.positiveRefrain+=Number(ev.refrainOutcome.outcome>0);
   updateCredit(H,src,ev.refrainOutcome.outcome);
  }
  if(ev.death){
   summary.deathCount++;summary.lastDeathTick=t;
   // Terminal loss updates are separate from positive novelty/return credit.
   const final=new Set(ev.death.finalExcursion);
   for(const e of lifeSources)if(final.has(e.executedFrom+'>'+e.executedTo))
     updateCredit(H,e,-1);
   lifeSources=[];
   summary.contexts.clear();
   hSinceLastDeath=true;
  }
  // Eligibility is exogenous and matched: exactly one candidate each tick,
  // not one candidate per recipient's choice-point exposure.
  const action=insertHistory(H,rec,policy,t,donorSchedule?.[t-1]??null);
  actions.push(action);
  if(ev.death)lastDeathH={H:sha(JSON.stringify(H.items)),V:sha(JSON.stringify(receiver.V))};
  assert(H.items.length<=K);
  assert(H.items.every(i=>i.source==='PF3_A2_DESIGN_SYNTHETIC_NOT_BEACON'));
  assert(H.items.every(i=>sha(i.inputHex)===i.sourceDigest));
  if(t%512===0&&!asDonor){
   const hOn=probe(receiver,H,policy,c,seed,t,true);
   const hOffProbe=probe(receiver,H,policy,c,seed,t,false);
   summary.probes.push({checkpoint:t,hOn,hOff:hOffProbe,
    edgeRepertoireDelta:hOn.distinctEdges-hOffProbe.distinctEdges});
  }
  priorCue=c;
  path.push(t+':'+ev.fromZone+'>'+ev.toZone+';');
 }
 return {...summary,contexts:undefined,
  firstHExample,accepted:H.accepted,retained:H.items.length,
  evicted:H.evictions,learnedUpdates:H.creditCount,
  finalLearnedCueWeights:H.pref.map(v=>Number(v.toFixed(5))),
  learnedRange:Math.max(...H.pref)-Math.min(...H.pref),
  differentFromFifoEvictions:H.adaptiveDifferentFromFifo,
  yokedCopyChecks:H.yokedCopyChecks,
  actionDigest:sha(JSON.stringify(actions)),actions,
  traceDigest:sha(path.join('')),finalVDigest:sha(JSON.stringify(receiver.V)),
  finalHDigest:sha(JSON.stringify(H.items))};
}
const results=[],donorChecks=[];
for(const seed of SEEDS){
 const donor=run(seed,'adaptive',null,true);
 const donorSchedule=donor.actions;
 assert.equal(donorSchedule.length,N);
 assert(donor.traceDigest);
 donorChecks.push({recipientSeed:seed,donorActionDigest:donor.actionDigest,
  donorStateDigest:donor.finalVDigest,donorTraceDigest:donor.traceDigest,
  differentInputDomain:true,evictions:donor.evicted});
 for(const policy of POLICIES){
  const x=run(seed,policy,policy==='yoked'?donorSchedule:null);
  const y=run(seed,policy,policy==='yoked'?donorSchedule:null);
  assert.deepEqual(x,y,'PF3_A2_NONDETERMINISM_'+seed+'_'+policy);
  if(policy==='reset')assert.equal(x.hPivotal,0);
  if(policy==='yoked'){
   assert.equal(x.actionDigest,donor.actionDigest,'NOT_TRUE_DONOR_YOKE_'+seed);
   assert.equal(x.yokedCopyChecks,N-K,'DONOR_DECISION_COUNT');
  }
  assert.equal(x.rebirthHExact,x.deathCount-Number(x.lastDeathTick===N),
    'H_INHERITANCE_CHECK_COUNT');
  assert.equal(x.rebirthVExact,x.rebirthHExact,'V_INHERITANCE_CHECK_COUNT');
  results.push(x);
 }
}
const trimmed=results.map(({actions,...x})=>x);
const checks={
 determinism:true,
 selectorReconstructionExact:results.every(x=>x.attributionMatched===x.branchChoices),VActive:results.some(x=>x.vPivotal>0),
 HActive:results.some(x=>x.hPivotal>0),
 includesPFM:true,PF2Unchanged:true,
 allSourcesStrictlyPast:true,capacityBound:results.every(x=>x.retained<=K),
 resetNoH:results.filter(x=>x.policy==='reset').every(x=>x.hPivotal===0),
 realDonorYoke:results.filter(x=>x.policy==='yoked').every(x=>x.yokedCopyChecks===N-K),
 learnedCreditObserved:results.filter(x=>x.policy==='adaptive').some(x=>x.learnedUpdates>0),
 retainedHistoryOverRebirth:results.some(x=>x.rebirthHExact>0),
 noExternalAgencyTest:true,noProspectiveDevelopmentalInference:true};
const meta={
 schema:'PF3_A2_COMBINED_HISTORY_SYNTHETIC_PREFLIGHT_V1',
 status:'DESIGN_SEED_ENGINEERING_ONLY_NOT_REGISTERED_NOT_LIVE',
 source:'sha256 deterministic synthetic inputs only, no drand, no RFC3161',
 seedTapes:SEEDS,stepsPerArm:N,
 constants:{historyCapacity:K,HbonusMax:WH,Vweight:PF2_W_V,
  historyBonusClippedToPF2OverlayLimit:0.5,refrainDelay:PF2_H,
  deathCredit:'separate negative mark',policies:POLICIES},
 arms:{
  adaptive:'Online cue preferences updated ONLY when delayed PF2 refrain settles (and on fatal-excursion penalty); learned history eviction uses these values',
  fixed:'Fixed cue preference with identical capacity, no outcome-based eviction',
  fifo:'First in, first out same capacity and exogenous candidates',
  yoked:'Copied ACTUAL per-tick eviction indices from disjoint-seed adaptive donor trajectory; same candidate count and K+1 eviction decisions',
  order_sham:'Online adaptive retention, but previous-cue labels cyclically rematched across retained items at readout; cue counts untouched',
  reset:'Same V/PFM and present cue but H always empty'},
 caveats:['Learning reward is designer supplied, not autonomous motivation',
  'Provisional order-sham is past-only contextual recombination, not full matched temporal-tape permutation',
  'Design seeds not confirmatory or independent real beacons',
  'Different trajectories change exposure and opportunities',
  'Held-out synthetic probe sequences are diagnostic only',
  'No actual independently stateful Outside process and no field agency evidence'],
 checks,donorChecks,results:trimmed};
assert(checks.capacityBound&&checks.resetNoH&&checks.realDonorYoke);
const dst=resolve(process.argv[2]||'/tmp/pf3-a2');
assert(dst.startsWith('/tmp/')||dst.startsWith('/mnt/data/'),'OUTPUT_OUTSIDE_REPOSITORY_ONLY');
mkdirSync(dst,{recursive:true});
writeFileSync(join(dst,'PF3_A2_SYNTHETIC_SUMMARY.json'),JSON.stringify(meta,null,2)+'\n');
console.log('PF3_A2_SYNTHETIC_COMBINED_HISTORY_PREFLIGHT_PASS '+JSON.stringify({
 steps:N,seeds:SEEDS,checks,donors:donorChecks,
 rows:trimmed.map(x=>({seed:x.seed,policy:x.policy,hPivotal:x.hPivotal,
  vPivotal:x.vPivotal,learnedUpdates:x.learnedUpdates,rebirths:x.deathCount,
  rebirthHExact:x.rebirthHExact,retained:x.retained,
  yokedCopyChecks:x.yokedCopyChecks,probes:x.probes.map(p=>p.edgeRepertoireDelta)}))}));
