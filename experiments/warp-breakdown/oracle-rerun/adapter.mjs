/**
 * Adapter for the exact Oracle implementation at 6a8becd.
 * Native mode preserves the saved substrate, s05c/House learner and transition rule.
 * Optional control adaptation is explicit and is used only in experimental copies.
 */
import {pathToFileURL} from 'node:url';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(process.env.ORACLE_CODE_ROOT??'oracle_wbd4_source');
const mod=async p=>import(pathToFileURL(join(root,p)).href);
const {AmeliaNumogramSubstrateRuntime:R}=await mod('experiments/studio/runtime_mirror/substrate/ameliaNumogramSubstrateRuntime.ts');
const {CANONICAL_GATES}=await mod('experiments/studio/runtime_mirror/ai/numogram/AmeliaQabbalaInterface.ts');
const {fullNumogramGates}=await mod('experiments/numogram/CCRUNumogram.ts');
const FULL=fullNumogramGates(CANONICAL_GATES),BASE_EDGES=FULL.map(g=>`${g.source}>${g.target}`);
const key=(x,y)=>`${x}>${y}`,H=24,clone=x=>structuredClone(x);
function finalExcursion(z){
 const ta=z.length-1;
 for(let t=Math.max(0,ta-H);t<ta;t++){
  const th=new Set(t>0?z.slice(Math.max(0,t-H),t):[z[0]]);if(th.has(z[t+1]))continue;
  let ok=true;for(let s=t+1;s<=ta;s++)if(th.has(z[s])){ok=false;break;}
  if(ok){const e=new Set();for(let s=t;s<ta;s++)e.add(key(z[s],z[s+1]));return [...e];}
 }
 return [key(z[ta-1],z[ta])];
}
function refrain(z,t){
 const th=new Set(t>0?z.slice(Math.max(0,t-H),t):[z[0]]);if(th.has(z[t+1]))return 0;
 for(let s=t+2;s<=t+H;s++)if(th.has(z[s])){
  const prev=new Set(),exc=new Set();for(let u=Math.max(0,t-H);u<t;u++)prev.add(key(z[u],z[u+1]));
  for(let u=t;u<s;u++)exc.add(key(z[u],z[u+1]));let n=0;for(const e of exc)if(!prev.has(e))n++;
  return n/11;
 }
 return 0;
}
export class OracleAdapter {
 constructor(saved){Object.assign(this,clone(saved));this.extraEdges=this.extraEdges??[];this.cueWeight=this.cueWeight??0.35;this.attach();}
 attach(fresh=false){
  const L=this.L;this.r=new R();this.r.qabbala.setGates(FULL);
  if(!fresh&&this.runtime)this.r.importState(this.runtime);
  this.r.exitBonus=(x,y)=>{const e=key(x,y);return 0.5*(L.V[e]??0)+0.35*Math.tanh((L.S[e]??0)+(L.D[e]??0))+(this.coded===y?this.cueWeight:0);};
 }
 step(zone=null){
  this.coded=zone;const L=this.L,from=this.z.at(-1);assert.equal(this.r.exportState().currentZone,from);
  const snapshot=this.r.step(),to=snapshot.lastTransition.to;this.z.push(to);this.i++;this.ticks++;
  const e=key(from,to);if(e in L.S)L.S[e]+=0.01;
  for(const f of [...BASE_EDGES,...this.extraEdges]){
   const v=L.S[f];L.S[f]=v*(1-0.002);L.D[f]=L.D[f]+0.0005*v-0.00005*L.D[f];
  }
  this.lastEdge=e;
  if(to===5){
   for(const f of finalExcursion(this.z)){L.S[f]+=1;L.V[f]+=(1/8)*(-1-L.V[f]);}
   this.deaths++;this.z=[0];this.i=0;this.runtime=null;this.attach(true);return {from,to,snapshot};
  }
  const t=this.i-H;
  if(t>=0){const ek=key(this.z[t],this.z[t+1]);if(ek in L.V)L.V[ek]+=(1/8)*(refrain(this.z,t)-L.V[ek]);}
  if(this.z.length>4*H){this.z=this.z.slice(-2*H);this.i=this.z.length-1;}
  if(this.ticks%1000===0){const ev=this.r.getMemory().getEvents();if(ev.length>48)ev.splice(0,ev.length-48);}
  return {from,to,snapshot};
 }
 fullState(){const {r,coded,...rest}=this;return {...clone(rest),runtime:r.exportState()};}
 officialState(){const s=this.fullState(),rt=s.runtime;delete s.extraEdges;delete s.cueWeight;
  rt.memoryState.events=rt.memoryState.events.slice(-48);rt.traitEvolutionHistory=(rt.traitEvolutionHistory||[]).slice(-1);
  rt.snapshots=(rt.snapshots||[]).slice(-1);rt.memoryConsumptionLog=[];return s;
 }
 /** Explicit matched control: alter only the experimental copy, log every change. */
 makeControl(){
  const state=this.fullState();assert.equal(state.runtime.currentZone,3);
  const g=state.runtime.qabbalaGates,w33=g.find(x=>x.source===3&&x.target===3),
        w36=g.find(x=>x.source===3&&x.target===6),w63=g.find(x=>x.source===6&&x.target===3);
  assert.ok(w33&&w36&&w63);state.runtime.qabbalaGates=[...g.filter(x=>x.source!==2&&x.source!==7),
   {...w33,id:'oracle-control-2-2',source:2,target:2},
   {...w36,id:'oracle-control-2-7',source:2,target:7},
   {...w63,id:'oracle-control-7-2',source:7,target:2}];
  for(const [dest,source] of [['2>2','3>3'],['2>7','3>6'],['7>2','6>3']])for(const f of ['V','S','D'])state.L[f][dest]=state.L[f][source]??0;
  state.extraEdges=['2>2'];state.runtime.currentZone=2;state.z[state.z.length-1]=2;
  return new OracleAdapter(state);
 }
}
export const ORACLE_BASE_EDGES=BASE_EDGES;
