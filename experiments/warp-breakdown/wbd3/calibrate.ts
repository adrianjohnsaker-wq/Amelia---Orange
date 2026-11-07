/** WBD-3 exploratory calibration on an isolated copy of a saved runtime. */
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {OutsideRecoveryRuntime} from '../../../src/outside/OutsideRecoveryRuntime.ts';
import {fullNumogramGates} from '../../../src/core/fullNumogram.ts';

const [input,output]=process.argv.slice(2);
assert.ok(input&&output,'Usage: calibrate.ts CHECKPOINT OUTPUT');
const H=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex');
const clone=<T>(s:T):T=>structuredClone(s);
const raw=readFileSync(input), root=JSON.parse(raw.toString()), saved=clone(root.runtimeState??root.state);
assert.ok(saved.memoryState&&saved.governorState&&Array.isArray(saved.qabbalaGates));
assert.equal(saved.deferredEncounters.length,0,'Calibration requires a saved empty queue');
function runtime(s:any){const r=new OutsideRecoveryRuntime();r.importState(clone(s));return r;}
const onehot=(z:number)=>Array.from({length:10},(_,i)=>Number(i===z));
const offer=(id:string,v:number[])=>({eventId:id,channel:'SYNTHETIC_FIELD' as const,sourceDigest:H(id),attentionVector:v});
function scored(r:OutsideRecoveryRuntime, input?:ReturnType<typeof offer>){
 const snap:any=r.step(undefined,input),from=snap.lastTransition.from;
 const admitted=snap.encounterDecisions.find((d:any)=>d.disposition==='ATTEND'&&d.applied);
 const bias=r.getMemoryConsumptionLog().at(-1)?.appliedBiasVector;assert.ok(bias);
 const zones=r.getQabbala().getZones();
 const candidates=r.getQabbala().getGates().filter(g=>g.isOpen&&g.source===from).map(g=>{
  const z=zones[g.target],base=g.flux*(1-g.resistance)+(bias[g.target]||0)*0.4+z.activation*0.2+Math.cos(z.phaseAngle)*0.1;
  const attention=(admitted?.attentionVector[g.target]??0)*0.9;
  return {id:g.id,target:g.target,base,attention,total:base+attention};
 });
 const winner=(key:'base'|'total')=>candidates.length?candidates.reduce((a,b)=>b[key]>a[key]?b:a).target:from;
 const actual=winner('total'),noAttention=winner('base');assert.equal(actual,snap.lastTransition.to);
 return {step:snap.step,from,to:actual,withoutAttention:noAttention,pivotal:!!admitted&&actual!==noAttention,
  decisions:snap.encounterDecisions,candidates,queue:r.getDeferredInputs().length};
}
function baseline(s:any,steps:number){const r=runtime(s),path:number[]=[s.currentZone];for(let i=0;i<steps;i++)path.push(scored(r).to);return path;}
const originalEdges=saved.qabbalaGates.map((g:any)=>[g.source,g.target]);
const extended=clone(saved);extended.qabbalaGates=fullNumogramGates(extended.qabbalaGates);
const addedEdges=extended.qabbalaGates.filter((g:any)=>!originalEdges.some((e:number[])=>e[0]===g.source&&e[1]===g.target)).map((g:any)=>[g.source,g.target]);
assert.equal(extended.qabbalaGates.length,29);
const originalBaseline=baseline(saved,24),fullBaseline=baseline(extended,24);
const entry=runtime(extended),entryTrace:any[]=[];
if((entry.exportState() as any).currentZone===9){entryTrace.push(scored(entry));}
if((entry.exportState() as any).currentZone===1){
 for(const [i,z] of [2,3].entries()){
  const row=scored(entry,offer(`wbd3-calibration-entry-${i}-${z}`,onehot(z)));entryTrace.push(row);
  assert.equal(row.to,z,'Entry cue failed');
  assert.ok(row.decisions.some((x:any)=>x.disposition==='ATTEND'&&x.applied),'Entry cue was not admitted');
 }
}
const founder=entry.exportState() as any;assert.equal(founder.currentZone,3,'Expected entry into zone 3');assert.equal(founder.deferredEncounters.length,0);
const weights=[0.235,0.185,0.145,0.115,0.095,0.075,0.055,0.045,0.03,0.02];
const rand=(seed:string,label:string,n:number)=>parseInt(H(seed+':'+label).slice(0,8),16)%n;
function profiles(seed:string,t:number){
 const rest=weights.filter((_,i)=>i!==3&&i!==6).map(w=>w);
 for(let i=rest.length-1;i>0;i--){const j=rand(seed,`${t}:${i}`,i+1);[rest[i],rest[j]]=[rest[j],rest[i]];}
 const a=Array(10).fill(0);a[3]=0.115;a[6]=0.055;[0,1,2,4,5,7,8,9].forEach((z,i)=>a[z]=rest[i]);
 const b=[...a];[b[3],b[6]]=[b[6],b[3]];return {target3:a,target6:b};
}
function drain(r:OutsideRecoveryRuntime,trace:any[]){let n=0;while(r.getDeferredInputs().length){trace.push(scored(r));if(++n>128)throw Error('Queue did not drain');}}
function follow(background:any,memory:any){
 const s=clone(background);s.memoryState=clone(memory);
 const minus=(x:any)=>{let y=clone(x);delete y.memoryState;return H(JSON.stringify(y));};
 assert.equal(minus(s),minus(background));const r=runtime(s);let dwell=0,cross=0;
 for(let t=0;t<12;t++){const x=scored(r);if(x.from===3&&x.to===3)dwell++;if(x.from===3&&x.to===6)cross++;}
 return {dwell,cross,nonMemorySha256:minus(s)};
}
const histories=[];
for(let h=0;h<8;h++){
 const seed=H(`wbd3-calibration-not-study:${H(raw)}:${h}`),r=runtime(founder),burn:any[]=[];
 for(let t=0;t<8;t++){drain(r,burn);let p=profiles(seed,100+t);burn.push(scored(r,offer(`burn-${h}-${t}`,rand(seed,`burn${t}`,2)?p.target3:p.target6)));}
 drain(r,burn);const prepared=r.exportState() as any,runs:any={};
 for(const arm of ['target3','target6'] as const){
  const q=runtime(prepared),trace:any[]=[];
  for(let t=0;t<16;t++){drain(q,trace);trace.push(scored(q,offer(`plant-${h}-${arm}-${t}`,profiles(seed,t)[arm])));}
  drain(q,trace);const final=q.exportState() as any;
  const plant=trace.filter(x=>x.decisions.some((d:any)=>d.eventId.startsWith(`plant-${h}-${arm}-`)&&d.disposition==='ATTEND'&&d.applied));
  runs[arm]={state:final,summary:{offered:16,admitted:plant.length,pivotal:plant.filter(x=>x.pivotal).length,trace}};
 }
 const a=runs.target3.state,b=runs.target6.state;
 const aa=follow(a,a.memoryState),ab=follow(a,b.memoryState),ba=follow(b,a.memoryState),bb=follow(b,b.memoryState);
 histories.push({id:h+1,burn,arms:{target3:runs.target3.summary,target6:runs.target6.summary},memorySwap:{aa,ab,ba,bb}});
}
const stress=clone(founder),pre=offer('wbd3-preloaded',Array(10).fill(0.1));stress.deferredEncounters=[pre];
const sr=runtime(stress),delayed:any[]=[];delayed.push(scored(sr,offer('wbd3-queued-offer',profiles('queue-test',0).target3)));drain(sr,delayed);
const result={schema:'amelia.wbd3-calibration/v1',status:'COMPLETE',checkpointSha256:H(raw),initialStep:saved.stepCount,
 initialZone:saved.currentZone,initialGates:originalEdges.length,fullGates:extended.qabbalaGates.length,addedEdges,
 originalBaseline,fullBaseline,entryTrace,founderStep:founder.stepCount,founderZone:founder.currentZone,
 histories,artificialQueuedProbe:delayed,note:'Synthetic matched-contrast calibration on an isolated saved-state copy; not a world input or WBD-3 outcome.'};
writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,sha256:H(raw),initialStep:result.initialStep,initialZone:result.initialZone,initialGates:result.initialGates,addedEdges:addedEdges.length,founderStep:result.founderStep,
 admitted3:histories.reduce((n,h)=>n+h.arms.target3.admitted,0),admitted6:histories.reduce((n,h)=>n+h.arms.target6.admitted,0),
 pivotal3:histories.reduce((n,h)=>n+h.arms.target3.pivotal,0),pivotal6:histories.reduce((n,h)=>n+h.arms.target6.pivotal,0),
 queued:delayed.map(x=>({step:x.step,decisions:x.decisions.map((d:any)=>({eventId:d.eventId,disposition:d.disposition,applied:d.applied}))}))}));
