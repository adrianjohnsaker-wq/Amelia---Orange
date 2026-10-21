/**
 * DEV-1 AM1 — stone-tape PLACE memory, not personal developmental memory.
 *
 * All constants taken from RFC3161-sealed DEV1 AM1 manifest.
 * Contains the complete place-mark transition/writer and readout integration
 * hooks; DOES NOT launch or simulate an experimental lineage cohort.
 * Canonical/PF1 files are imported only. No global state or Math.random().
 */
import {CANONICAL_GATES} from '../ai/numogram/AmeliaQabbalaInterface';
import {d1EdgeKey,d1GateScore,d1EdgeBonus} from './DEV1D1EdgeSelector';

export const AM1_H=24;
export const AM1_W_T=0.5;
export const AM1_RATE_DENOMINATOR=8;
export const AM1_IDS=Object.freeze(CANONICAL_GATES.filter(g=>g.isOpen).map(g=>g.id));
export type StoneGateId=string;
export type StoneMarks=Record<string,number>;
const GATE_BY_KEY=new Map(CANONICAL_GATES.filter(g=>g.isOpen).map(g=>[d1EdgeKey(g.source,g.target),g]));
const AM1_ALL_IDS=new Set(AM1_IDS);
if(AM1_IDS.length!==11)throw Error('AM1_CANONICAL_GATE_COUNT_NOT_11');
if(new Set(AM1_IDS).size!==AM1_IDS.length)throw Error('AM1_DUPLICATE_GATE_ID');
export function blankStoneMarks():StoneMarks{
 return Object.fromEntries(AM1_IDS.map(id=>[id,0]));
}
export function validateStoneMarks(m:StoneMarks):void{
 if(Object.keys(m).length!==11 || !AM1_IDS.every(id=>Object.prototype.hasOwnProperty.call(m,id)))
  throw Error('AM1_MARK_KEYSET_MUST_MATCH_CANONICAL_11_GATES');
 for(const id of AM1_IDS){
  const v=m[id];if(!Number.isFinite(v)||v< -1||v>0)throw Error('AM1_MARK_OUTSIDE_MINUS1_ZERO');
 }
}
export function readStoneMark(m:StoneMarks,gateId:string):number{
 if(!AM1_ALL_IDS.has(gateId))throw Error('AM1_UNKNOWN_CANONICAL_GATE_ID');
 validateStoneMarks(m);
 return m[gateId];
}
export function terminalStoneUpdate(oldValue:number):number{
 if(!Number.isFinite(oldValue)||oldValue< -1||oldValue>0)throw Error('AM1_TERMINAL_VALUE_OUT_OF_BOUNDS');
 // Exactly same one-time terminal -1 update as original V(e).
 return oldValue+(-1-oldValue)/AM1_RATE_DENOMINATOR;
}
export function gateIdForTraversal(from:number,to:number):StoneGateId{
 const g=GATE_BY_KEY.get(d1EdgeKey(from,to));
 if(!g)throw Error('AM1_NONCANONICAL_TRAVERSAL');
 return g.id;
}
/**
 * One life-specific recorder. It cannot write terminal marks until the
 * transition INTO the canonical terminal zone 5 has actually occurred.
 * Store at most final 24 ordered IDs, including absorbing last edge.
 * Each distinct ID is updated at most once per individual death.
 */
export class StoneTapeLife {
 private recent:StoneGateId[]=[];
 private absorbed=false;
 private writes=0;
 constructor(private readonly place:StoneTapePlaceMemory){}
 observeTransition(from:number,to:number):void{
  if(this.absorbed)throw Error('AM1_TRANSITION_AFTER_DEATH');
  const id=gateIdForTraversal(from,to);
  this.recent.push(id);
  if(this.recent.length>AM1_H)this.recent.shift();
  const terminal=to===5 && !CANONICAL_GATES.some(g=>g.isOpen&&g.source===5);
  if(terminal){
   this.absorbed=true;
   this.writes=this.place.writeAtAbsorption([...this.recent],this);
  }
 }
 final24GateIds():readonly StoneGateId[]{return [...this.recent]}
 hasAbsorbed(){return this.absorbed}
 writtenGateCount(){return this.writes}
}
export class StoneTapePlaceMemory {
 private marks:StoneMarks;
 private deaths=0;
 constructor(snapshot:StoneMarks=blankStoneMarks()){
  validateStoneMarks(snapshot);
  this.marks={...snapshot};
 }
 snapshot():StoneMarks{return {...this.marks}}
 deathCount():number{return this.deaths}
 beginLife():StoneTapeLife{return new StoneTapeLife(this)}
 getMark(id:string):number{return readStoneMark(this.marks,id)}
 /**
  * Only callable by a terminally absorbed StoneTapeLife. The life argument
  * is checked to prevent arbitrary callers forging mid-life writes.
  */
 writeAtAbsorption(final24:readonly StoneGateId[],life:StoneTapeLife):number{
  if(!life.hasAbsorbed()||life.final24GateIds().join('|')!==final24.join('|'))
   throw Error('AM1_WRITE_ONLY_AFTER_CONFIRMED_ABSORPTION');
  if(final24.length===0||final24.length>AM1_H)throw Error('AM1_INVALID_FINAL24_COUNT');
  const distinct=new Set(final24);
  for(const id of distinct){
   if(!AM1_ALL_IDS.has(id))throw Error('AM1_UNKNOWN_GATE_IN_ABSORPTION');
  }
  for(const id of distinct)this.marks[id]=terminalStoneUpdate(this.marks[id]);
  this.deaths++;
  return distinct.size;
 }
}
/** Read wrapper around ORIGINAL canonical selector; no physical gate write. */
export function stoneTapeSelectorOverlay<T>(
 qabbala:{getGates:()=>any[]},
 personalV:Record<string,number>, placeMarks:StoneMarks, body:()=>T
):T {
 validateStoneMarks(placeMarks);
 const old=qabbala.getGates;
 const real=old.call(qabbala);
 qabbala.getGates=()=>real.map(g=>new Proxy(g,{
  get(target,prop,receiver){
   if(prop==='flux'){
    const v=personalV[d1EdgeKey(target.source,target.target)]??0;
    const t=readStoneMark(placeMarks,target.id);
    if(!Number.isFinite(target.resistance)||target.resistance>=1||target.resistance<0)
     throw Error('AM1_GATE_RESISTANCE_INVALID');
    return target.flux+(d1EdgeBonus(v)+AM1_W_T*t)/(1-target.resistance);
   }
   return Reflect.get(target,prop,receiver);
  },
  set(target,prop,value,receiver){return Reflect.set(target,prop,value,receiver)}
 }));
 try{return body()}finally{qabbala.getGates=old}
}
/** Same-state selector-only analytical comparator for O2-T, no rollout. */
export function stoneTapeChooseExit(
 from:number,gates:readonly {id:string;source:number;target:number;flux:number;resistance:number;isOpen:boolean}[],
 zones:Record<number,{activation:number;phaseAngle:number}>,
 bias:readonly number[],inputZone:number|null,
 personalV:Record<string,number>,marks:StoneMarks,
 includeT=true
):number{
 validateStoneMarks(marks);
 let chosen=from,best=-Infinity;
 for(const gate of gates){
  if(!gate.isOpen||gate.source!==from)continue;
  const z=zones[gate.target];if(!z)throw Error('AM1_MISSING_TARGET');
  const score=d1GateScore(gate,z.activation,Math.cos(z.phaseAngle),bias[gate.target]??0,
    inputZone,personalV[d1EdgeKey(gate.source,gate.target)]??0)
    +(includeT?AM1_W_T*readStoneMark(marks,gate.id):0);
  if(score>best){best=score;chosen=gate.target}
 }
 return chosen;
}
