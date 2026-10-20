/** D1 synthetic-only substrate and score utilities, common to C, M and G. */
import assert from 'node:assert/strict';
import {AmeliaNumogramSubstrateRuntime} from '../../../src/substrate/ameliaNumogramSubstrateRuntime';
import {doubledMidRanks,rawCastReadout} from '../ejing';
import {encodeCastToPFM,bitsFromCast,LINE_ZONES_V2,type SixLineCast} from './castEncoding';
export const D1_PARAMS={yin:.008,yang:.040,movement:.012,phaseCoherence:.95,strainRelaxation:.025};
export const WINDOWS=[0,1,3,10,30] as const;
export type D1Mode='ACTIVATION'|'PFM_STRAIN';
export type Standard={mu:number[];sigma:number[]};
export function rng(seed:number){
 let x=seed>>>0;
 return ()=>{x=(x+0x6d2b79f5)>>>0;let t=x;t=Math.imul(t^(t>>>15),t|1);
 t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}
export function cast(next:()=>number):SixLineCast{
 return Array.from({length:6},()=>{
  const j=Math.floor(next()*8);return (j===0?6:j<4?7:j<7?8:9) as 6|7|8|9;
 }) as SixLineCast;
}
export function fresh(){
 const rt=new AmeliaNumogramSubstrateRuntime();
 rt.setSuppressRelaySteering(true);return rt;
}
export function clone(s:Record<string,unknown>){
 const rt=fresh();rt.importState(s);rt.setSuppressRelaySteering(true);return rt;
}
export function observe(rt:AmeliaNumogramSubstrateRuntime,mode:D1Mode):number[]{
 const all=mode==='ACTIVATION'?
  LINE_ZONES_V2.map(z=>rt.getQabbala().getZones()[z].activation):
  LINE_ZONES_V2.map(z=>rt.getMemory().exportState().zoneStrainHistory[z]);
 assert(all.every(Number.isFinite),'NONFINITE_D1_READOUT');return all;
}
export function enter(rt:AmeliaNumogramSubstrateRuntime,x:SixLineCast,window:number){
 const at=rt.exportState().stepCount as number;
 const events=encodeCastToPFM(x,D1_PARAMS,at);
 for(const ev of events)rt.getMemory().append(ev.event);
 for(let i=0;i<window;i++)rt.step();
 return events.length;
}
export function standardizedRank(v:number[],ref:Standard){
 const a=v.map((x,i)=>(x-ref.mu[i])/ref.sigma[i]);
 assert(a.every(Number.isFinite),'NONFINITE_STANDARDIZED_READOUT');
 return doubledMidRanks(Array.from({length:64},(_,h)=>
  a.reduce((sum,x,i)=>sum+((h&(1<<i))?x:-x),0)));
}
export function reference(window:number):Record<D1Mode,Standard>{
 const random=rng(9602001+window*10000);
 const modes:['ACTIVATION','PFM_STRAIN']=['ACTIVATION','PFM_STRAIN'];
 const samples:Record<D1Mode,number[][]>={ACTIVATION:[],PFM_STRAIN:[]};
 const start=fresh().exportState();
 for(let i=0;i<192;i++){
  const rt=clone(start);enter(rt,cast(random),window);
  for(const mode of modes)samples[mode].push(observe(rt,mode));
 }
 const output={} as Record<D1Mode,Standard>;
 for(const mode of modes){
  const rows=samples[mode];
  const mu=Array.from({length:6},(_,i)=>rows.reduce((s,v)=>s+v[i],0)/rows.length);
  const sigma=mu.map((x,i)=>Math.sqrt(rows.reduce((s,v)=>s+(v[i]-x)**2,0)/rows.length));
  output[mode]={mu,sigma};
 }
 return output;
}
export function makePlant(next:()=>number):{target:number;input:SixLineCast;resulting:number;line:number}{
 const target=Math.floor(next()*64),line=Math.floor(next()*6);
 const input=[...cast(next)] as SixLineCast;
 input[line]=((target>>line)&1)?7:8;
 const resulting=bitsFromCast(input).resulting;
 assert.equal((resulting>>line)&1,(target>>line)&1);
 assert(input[line]===7||input[line]===8);
 return {target,input,resulting,line};
}
export function raw(resulting:number){return rawCastReadout(resulting);}
export function displacement(a:number[],b:number[]){
 assert.equal(a.length,64);assert.equal(b.length,64);
 return a.reduce((sum,x,i)=>sum+Math.abs(x-b[i]),0)/128;
}
