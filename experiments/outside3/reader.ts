/** OUTSIDE-3 Stage 1: SYNTHETIC ONLY. No target parameter in this module.
 * All six lines and state traces are deterministic and target-blind.
 * Corpus and score are index bits, not King Wen numbering.
 */
import { createHash } from 'node:crypto';
import { AmeliaNumogramSubstrateRuntime } from '../../src/substrate/ameliaNumogramSubstrateRuntime';
import { INITIAL_ZONES } from '../../src/ai/numogram/AmeliaQabbalaInterface';
import type { NumogramGate, ZoneId } from '../../src/types/amelia';
export const ZONES = [1,2,4,8,7,5] as const;
export type CastValue = 6|7|8|9;
export type Cast = [CastValue,CastValue,CastValue,CastValue,CastValue,CastValue];
export type Constants = {delta:number;magnitude:number;steps:number;referenceSeed:number;rewireSeed:number;meanReference:number[]};
export function digest(v:unknown) { return createHash('sha256').update(JSON.stringify(v)).digest('hex'); }
export function rng(seed:number) {
  let x=seed>>>0; return ()=>{x=(x+0x6d2b79f5)>>>0;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}
export function randomCast(next:()=>number):Cast {
  const a:number[]=[]; for(let i=0;i<6;i++){const j=Math.floor(next()*8);a.push(j===0?6:j<=3?7:j<=6?8:9);}
  return a as Cast;
}
export function encode(cast:Cast) {
  if(!Array.isArray(cast)||cast.length!==6||cast.some(v=>![6,7,8,9].includes(v))) throw Error('CAST_INVALID');
  let primary=0,movingMask=0;
  for(let i=0;i<6;i++){if(cast[i]===7||cast[i]===9)primary|=1<<i;if(cast[i]===6||cast[i]===9)movingMask|=1<<i;}
  return { primary,movingMask,resulting:primary^movingMask,lines:[...cast] };
}
export function ranks(scores:number[]) {
  if(scores.length!==64||scores.some(v=>!Number.isFinite(v)))throw Error('SCORES_INVALID');
  const order=Array.from({length:64},(_,i)=>i).sort((a,b)=>scores[b]-scores[a]||a-b);
  const result=new Array<number>(64);
  for(let i=0;i<64;){let j=i+1;while(j<64&&scores[order[j]]===scores[order[i]])j++;
    const doubled=(i+1)+(j);for(let k=i;k<j;k++)result[order[k]]=doubled;i=j;}
  if(result.some(v=>!Number.isInteger(v)||v<2||v>128))throw Error('RANK_INVALID');
  return result;
}
export function rawRanks(resulting:number) {
  return ranks(Array.from({length:64},(_,h)=>6-Array.from({length:6},(_,i)=>((h>>i)&1)===((resulting>>i)&1)?0:1).reduce((s,n)=>s+n,0)));
}
export function rewire(gates:NumogramGate[],seed:number) {
  const edges=gates.map(x=>({...x}));const next=rng(seed);
  const old=edges.map(e=>[e.source,e.target]);
  let swaps=0;
  for(let i=0;i<300;i++){
    const a=Math.floor(next()*edges.length),b=Math.floor(next()*edges.length);
    if(a===b)continue;
    const x=edges[a],y=edges[b],t=x.target,u=y.target;
    if(t===u||x.source===u||y.source===t)continue;
    if(edges.some((e,k)=>k!==a&&k!==b&&((e.source===x.source&&e.target===u)||(e.source===y.source&&e.target===t))))continue;
    x.target=u;y.target=t;swaps++;
  }
  if(swaps<2)throw Error('REWIRE_FAILED');
  const indeg=(es:typeof edges)=>Array.from({length:10},(_,z)=>es.filter(x=>x.target===z).length);
  const outdeg=(es:typeof edges)=>Array.from({length:10},(_,z)=>es.filter(x=>x.source===z).length);
  if(digest(indeg(edges))!==digest(Array.from({length:10},(_,z)=>old.filter(x=>x[1]===z).length))||
    digest(outdeg(edges))!==digest(Array.from({length:10},(_,z)=>old.filter(x=>x[0]===z).length)))throw Error('DEGREE_MISMATCH');
  if(digest(edges.map(e=>[e.source,e.target]))===digest(old))throw Error('REWIRE_IDENTITY');
  return {edges,swaps,digest:digest(edges)};
}
/* Runtime snapshots include wall clock time. Exclude wall-clock-only fields from replay digest
 * while retaining all dynamics, PFM, gates, governor, phases and complete event history.
 */
export function canonicalState(runtime:AmeliaNumogramSubstrateRuntime) {
  const s=runtime.exportState() as Record<string,any>;
  if(Array.isArray(s.snapshots))s.snapshots=s.snapshots.map((x:any)=>{const {timestamp,...rest}=x;return rest;});
  return s;
}
export function newRuntime(rewired?:{edges:NumogramGate[]}) {
  const rt=new AmeliaNumogramSubstrateRuntime();
  if(rewired)rt.getQabbala().setGates(rewired.edges);
  rt.setSuppressRelaySteering(true);
  return rt;
}
export function importRuntime(s:Record<string,any>) {
  const r=newRuntime();r.importState(s);r.setSuppressRelaySteering(true);return r;
}
export function applyCast(runtime:AmeliaNumogramSubstrateRuntime,cast:Cast,config:Constants) {
  const encoded=encode(cast);
  const z=runtime.getQabbala().getZones();
  for(let i=0;i<6;i++)z[ZONES[i]].activation=Math.max(0.04,Math.min(0.98,
    INITIAL_ZONES[ZONES[i]].activation+((encoded.primary>>i)&1?config.delta:-config.delta)));
  const preEventCount=runtime.getMemory().getEvents().length;
  for(let i=0;i<6;i++) if((encoded.movingMask>>i)&1) {
    const at=runtime.getSnapshots().at(-1)?.step??0;
    const event={type:'OUTSIDE3_SYNTHETIC_MOVING_LINE',index:i+1,zone:ZONES[i],
      castValue:cast[i],step:at,fluxDelta:config.magnitude};
    runtime.getMemory().append({blockIndex:at,depth:at,targetZone:ZONES[i],
      fluxDelta:config.magnitude,phaseCoherence:0.95,strainRelaxation:0.025,
      eventDigest:digest(event),timestamp:at,kind:'OTHER',fromZone:runtime.getCurrentZone()});
  }
  let snap;
  for(let j=0;j<config.steps;j++)snap=runtime.step();
  if(!snap)throw Error('NO_DEVELOPMENT');
  const activation=ZONES.map(z=>snap!.zones[z].activation);
  const centered=activation.map((a,i)=>a-config.meanReference[i]);
  const scores=Array.from({length:64},(_,h)=>centered.reduce((s,v,i)=>s+(((h>>i)&1)?v:-v),0));
  return {encoding:encoded,ranks:ranks(scores),activation,centered,
    movingEvents:runtime.getMemory().getEvents().length-preEventCount,transition:runtime.getLastTransition()};
}
export type WorkRecord = {
  cast:Cast; primary:number;movingMask:number;resulting:number;
  rank2:{Raw:number[];C:number[];M:number[];G:number[]};
  state:{pre:{C:string;M:string;G:string};post:{C:string;M:string;G:string}};
  CActivation:number[]; MActivation:number[]; GActivation:number[];
  movingEvents:{C:number;M:number;G:number};
};
export class Outside3Reader {
  private C:AmeliaNumogramSubstrateRuntime;
  private G:AmeliaNumogramSubstrateRuntime;
  private readonly graph:{edges:NumogramGate[],swaps:number,digest:string};
  constructor(readonly config:Constants, saved?:{C:Record<string,any>,G:Record<string,any>}) {
    this.C=saved?importRuntime(saved.C):newRuntime();
    this.graph=rewire(newRuntime().getQabbala().getGates(),config.rewireSeed);
    this.G=saved?importRuntime(saved.G):newRuntime(this.graph);
  }
  export() {return {C:canonicalState(this.C),G:canonicalState(this.G)};}
  graphInfo(){return {swaps:this.graph.swaps,digest:this.graph.digest};}
  run(cast:Cast):WorkRecord {
    const enc=encode(cast);
    const M=importRuntime(canonicalState(this.C));M.getMemory().reset();
    const pre={C:digest(canonicalState(this.C)),M:digest(canonicalState(M)),G:digest(canonicalState(this.G))};
    const c=applyCast(this.C,cast,this.config),m=applyCast(M,cast,this.config),g=applyCast(this.G,cast,this.config);
    const post={C:digest(canonicalState(this.C)),M:digest(canonicalState(M)),G:digest(canonicalState(this.G))};
    return {cast:[...cast] as Cast,primary:enc.primary,movingMask:enc.movingMask,resulting:enc.resulting,
      rank2:{Raw:rawRanks(enc.resulting),C:c.ranks,M:m.ranks,G:g.ranks},
      state:{pre,post},CActivation:c.activation,MActivation:m.activation,GActivation:g.activation,
      movingEvents:{C:c.movingEvents,M:m.movingEvents,G:g.movingEvents}};
  }
}
