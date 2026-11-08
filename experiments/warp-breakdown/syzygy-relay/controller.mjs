/** Experimental remote signals and transient one-step synthetic entries. */
import assert from 'node:assert/strict';
import {fastStep} from '../access/quota.mjs';
import {globalReadout} from '../fullgraph/controller.mjs';
const turn=2*Math.PI,wrap=x=>((x%turn)+turn)%turn;
export const TYPES=['natural','global','focus_plain','focus_phase','phase_yoked','entry','sham_entry'];
function focus(r,route){
 const pair=route==='warp'?[3,6]:[2,7],gate=r.r.qabbala.getGates().filter(x=>x.isOpen),group=[[],[]];
 for(const source of pair){const opts=gate.filter(g=>g.source===source).map(g=>g.target).sort((a,b)=>a-b);if(opts.length<2)continue;for(let j=0;j<opts.length;j++)group[j%2].push(r.L.V[`${source}>${opts[j]}`]);}
 assert.ok(group[0].length&&group[1].length&&group.flat().every(Number.isFinite));const means=group.map(x=>x.reduce((a,b)=>a+b,0)/x.length),bit=Math.sign(means[1]-means[0]),z=r.r.qabbala.getZones(),phaseDifference=z[pair[1]].phaseAngle-z[pair[0]].phaseAngle,weight=.75+.25*Math.cos(phaseDifference);
 return {pair,means,counts:group.map(x=>x.length),bit,phaseDifference,weight};
}
export function decision(r,route,type,gain,initialVirtualTarget=null){
 assert.ok(TYPES.includes(type));const path=[],limit=r.r.getGovernor().hardLimitViolationCount;let selected=null;
 for(let k=0;k<4;k++){
  const runtime=r.r,from=r.z.at(-1),before=runtime.qabbala.getGates().map(x=>({...x})),gs=globalReadout(r),globalBit=Math.sign(gs.means[1]-gs.means[0]),z=runtime.qabbala.getZones();let fs=focus(r,route),pulse=null,ghost=null,wasNative=false;
  if(type==='focus_phase'||type==='phase_yoked'){const pair=type==='focus_phase'?fs.pair:[1,8],phases=pair.map(v=>z[v].phaseAngle),delta=.08*fs.bit;z[pair[0]].phaseAngle=wrap(phases[0]+delta);z[pair[1]].phaseAngle=wrap(phases[1]-delta);pulse={pair,delta,before:phases,after:pair.map(v=>z[v].phaseAngle)};fs=focus(r,route);}
  const yokedPhaseDifference=z[8].phaseAngle-z[1].phaseAngle,yokedPhaseWeight=.75+.25*Math.cos(yokedPhaseDifference);
  if(k===0&&initialVirtualTarget!==null){
   assert.ok(['entry','sham_entry'].includes(type));wasNative=before.some(g=>g.isOpen&&g.source===from&&g.target===initialVirtualTarget);
   assert.ok(!before.some(x=>x.id==='experimental-syzygy-relay-edge'));ghost={id:'experimental-syzygy-relay-edge',source:from,target:initialVirtualTarget,label:'Experimental one-step entry',flux:.5,permeability:.5,isOpen:true,resistance:.2};runtime.qabbala.setGates([...before,ghost]);
  }
  const opts=runtime.qabbala.getGates().filter(g=>g.isOpen&&g.source===from).map(g=>g.target).sort((a,b)=>a-b);
  let signal=0;
  if(type==='global')signal=.75*globalBit;else if(type==='focus_plain')signal=.75*fs.bit;else if(type==='focus_phase')signal=fs.weight*fs.bit;else if(type==='phase_yoked')signal=yokedPhaseWeight*fs.bit;
  const base=runtime.exitBonus;runtime.exitBonus=(a,b)=>{
   const ordinary=base?base(a,b):0;if(ghost&&a===from&&b===initialVirtualTarget)return ordinary+100;
   if(!signal||a!==from||opts.length<2)return ordinary;const rank=opts.indexOf(b);return ordinary+(rank%2?1:-1)*gain*signal;
  };
  let q;try{q=fastStep(r,null);}finally{runtime.exitBonus=base;if(ghost){const after=runtime.qabbala.getGates().filter(g=>g.id!==ghost.id);assert.equal(after.length,before.length);runtime.qabbala.setGates(after);}}
  assert.equal(q.from,from);assert.equal(q.snapshot.governor.hardLimitViolationCount,limit);const rank=opts.indexOf(q.to);assert.ok(rank>=0||opts.length===0);if(ghost)assert.equal(q.to,initialVirtualTarget);
  path.push({from:q.from,to:q.to,postZone:r.z.at(-1),died:q.to===5,rank,options:opts,virtual:!!ghost,wasNative,focusBit:fs.bit,focusMeans:fs.means,focusCounts:fs.counts,phaseDifference:fs.phaseDifference,phaseWeight:fs.weight,yokedPhaseDifference,yokedPhaseWeight,pulse,globalBit,globalMeans:gs.means,globalCounts:gs.counts,appliedSignal:signal});
  if(!ghost&&opts.length>=2)selected={source:from,options:opts,rank,action:rank%2};
 }
 if(!selected){const q=path.at(-1);selected={source:q.from,options:q.options,rank:q.rank,action:0};}
 return {path,selected,action:selected.action};
}
export function focusSignal(r,route){return focus(r,route);}
