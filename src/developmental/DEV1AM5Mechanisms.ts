/**
 * DEV1 AM5 selector-only fast/slow traces and future-arm pure testable
 * mechanisms. NO changes to canonical runtime, original AM3, AM4 or C1.
 * Only D2 is authorised; D3 generator identity is UNRESOLVED and no D3
 * production arm is provided or executable here.
 */
import {createHash} from 'node:crypto';
import {AmeliaNumogramSubstrateRuntime} from '../substrate/ameliaNumogramSubstrateRuntime';
import {d1EdgeKey} from './DEV1D1EdgeSelector';
import {WeightSet,homeostat} from './DEV1Mechanisms';
export const AM5_ALPHA_F=1-Math.exp(-1/48);
export const AM5_ALPHA_S=1-Math.exp(-1/2400);
export const AM5_CANONICAL_WEIGHTS:WeightSet={w_bias:0.4,w_act:0.2,w_phase:0.1,w_input:0.35,w_V:0.5};
export class AM5SelectorTraces{
 readonly fast:number[]=Array(10).fill(0);
 readonly slow:number[]=Array(10).fill(0);
 steps=0;
 private norm(trace:readonly number[]):number[]{
  const total=trace.reduce((a,b)=>a+b,0);
  return total>0?trace.map(x=>x/total):Array(10).fill(0);
 }
 normalized(){return {F:this.norm(this.fast),S:this.norm(this.slow)}}
 selectorBias(){
  const {F,S}=this.normalized();
  return F.map((v,i)=>(v+S[i])/2);
 }
 observe(z:number){
  if(!Number.isInteger(z)||z<0||z>9)throw Error('AM5_TRACE_BAD_ZONE');
  for(let i=0;i<10;i++){
   this.fast[i]=(1-AM5_ALPHA_F)*this.fast[i]+AM5_ALPHA_F*(i===z?1:0);
   this.slow[i]=(1-AM5_ALPHA_S)*this.slow[i]+AM5_ALPHA_S*(i===z?1:0);
  }
  this.steps++;
 }
 snapshot(){return {fast:[...this.fast],slow:[...this.slow],steps:this.steps}}
}
/** Adds exactly .4*(traceBias - canonicalPFMBias)+.5*V to the
 * original selector score. The actual memory read used by TraitEvolution
 * remains untouched; the original runtime.getGates/real flux are restored.
 * The first trait evolution and selector in rt.step share the original
 * PFM bias, and all trace operations occur outside the canonical classes.
 */
export function am5D2SelectorStep<T>(
 rt:AmeliaNumogramSubstrateRuntime,
 traces:AM5SelectorTraces,
 values:Readonly<Record<string,number>>,invokeStep:()=>T
):T{
 const q=rt.getQabbala();
 const canonical=rt.getMemory().readMemoryBias().biasVector;
 const replacement=traces.selectorBias();
 const original=q.getGates;
 const gates=original.call(q);
 q.getGates=()=>{
  return gates.map(g=>new Proxy(g,{
   get(target,prop,receiver){
    if(prop==='flux'){
     const v=values[d1EdgeKey(target.source,target.target)]??0;
     if(!Number.isFinite(v)||v<-1||v>1)throw Error('AM5_D2_V_RANGE');
     const delta=AM5_CANONICAL_WEIGHTS.w_bias*
        (replacement[target.target]-canonical[target.target])+
        AM5_CANONICAL_WEIGHTS.w_V*v;
     if(target.resistance>=1||target.resistance<0)throw Error('AM5_D2_RESISTANCE');
     return target.flux+delta/(1-target.resistance);
    }
    return Reflect.get(target,prop,receiver);
   },
   set(target,prop,value,receiver){return Reflect.set(target,prop,value,receiver)}
  }));
 };
 try{return invokeStep()}finally{q.getGates=original}
}
export function am5ConsolidationBoundary(rt:AmeliaNumogramSubstrateRuntime,step:number):boolean{
 if(!Number.isInteger(step)||step<1)throw Error('AM5_INVALID_CONSOLIDATION_STEP');
 if(step%48!==0)return false;
 rt.getMemory().consolidateStrain();
 return true;
}
export function am5D2Step(
 rt:AmeliaNumogramSubstrateRuntime,traces:AM5SelectorTraces,
 values:Readonly<Record<string,number>>,input:string
){
 const before=rt.getCurrentZone();
 const inputMemory=rt.getMemory().readMemoryBias().biasVector;
 const selectorBias=traces.selectorBias();
 const result=am5D2SelectorStep(rt,traces,values,()=>rt.step(input));
 const to=rt.getCurrentZone();
 traces.observe(to);
 const step=result.step;
 if(step!==traces.steps)throw Error('AM5_D2_TRACE_STEP_OUT_OF_SYNC');
 const consolidate=am5ConsolidationBoundary(rt,step);
 return {result,before,to,inputMemory,selectorBias,consolidated:consolidate};
}
export type AM5Bounds={E1Below:boolean;E2Outside:boolean};
export class AM5SecondOrderMonitor{
 private E1Bad=0;private E2Bad=0;private lastRedraw:number|null=null;
 observe(step:number,e1Distinct:number|null,tension:number,weights:WeightSet,draw:()=>number){
  if(!Number.isInteger(step)||step<1||!Number.isFinite(tension))throw Error('AM5_MONITOR_INPUT');
  this.E1Bad=e1Distinct!==null&&e1Distinct<3?this.E1Bad+1:0;
  this.E2Bad=tension<0.14||tension>0.65?this.E2Bad+1:0;
  const trigger=this.E1Bad>=24?'E1':this.E2Bad>=24?'E2':null;
  const refractory=this.lastRedraw!==null&&step-this.lastRedraw<=24;
  if(!trigger||refractory)return {redraw:false,trigger,refractory,weights};
  const next={w_bias:0.8*draw(),w_act:0.4*draw(),w_phase:0.2*draw(),
    w_input:0.7*draw(),w_V:weights.w_V};
  for(const [k,v] of Object.entries(next))
   if(!Number.isFinite(v)||v<0||v>2*(AM5_CANONICAL_WEIGHTS as any)[k])
    throw Error('AM5_REDRAW_RANGE_'+k);
  this.lastRedraw=step;
  return {redraw:true,trigger,refractory:false,oldWeights:{...weights},weights:next};
 }
}
export function am5HomeostatStep(rt:AmeliaNumogramSubstrateRuntime,tension:number):number{
 const old=rt.getGovernor().momentumDampingFactor;
 const next=homeostat(old,tension);
 rt.setMomentumDamping(next);
 return rt.getGovernor().momentumDampingFactor;
}
/** Fixture-only PRNG stream: SHA256 counter, seeded from approved first 8 bytes.
 * The operator refers to a 'pinned deterministic generator' for D3, which
 * does not exist as an identified implementation in the supplied Stage1
 * source. This standalone fixture stream is NOT authorisation to run D3.
 */
export function am5FixtureDeterministicDraw(tapeK:number):()=>number {
 const seed=createHash('sha256').update('DEV1-D3-DRAW-'+tapeK).digest().subarray(0,8);
 let n=0;
 return ()=>{
  const hash=createHash('sha256').update(seed).update(String(n++)).digest();
  return hash.readUInt32BE(0)/4294967296;
 };
}
export function am5YokedOutcomeAt(
 stepIndex:number,partnerOutcomeByStep:Readonly<Record<number,number>>,
 partnerAbsorptionStep:number
):number{
 if(!Number.isInteger(stepIndex)||stepIndex<0||!Number.isInteger(partnerAbsorptionStep))
  throw Error('AM5_YOKE_STEP');
 if(stepIndex>=partnerAbsorptionStep)return 0;
 const val=partnerOutcomeByStep[stepIndex];
 if(val===undefined)throw Error('AM5_YOKE_UNRESOLVED_PARTNER_STEP');
 if(!Number.isFinite(val)||val< -1||val>1)throw Error('AM5_YOKE_OUT_OF_RANGE');
 return val;
}
