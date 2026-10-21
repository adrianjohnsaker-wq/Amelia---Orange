/** DEV-1 AM3 registered REFRAIN signal o″ (only new corrected-branch mechanism).
 * Exact, bounded, non-anticipating evaluation of one prior edge e_t using
 * observed (never future) zone history, with abolition taking precedence.
 * No changes to canonical Amelia, original D1 or sealed work-order source.
 */
export const AM3_H=24,AM3_EDGE_COUNT=11,AM3_W_V=0.5;
export type RefrainKind='abolition'|'refrain'|'otherwise';
export type RefrainOutcome={kind:RefrainKind;value:number;
 firstReturnStep:number|null;newExcursionEdges:string[];territoryZones:number[]};
export function directedKey(a:number,b:number):string{return a+'->'+b}
export function territoryAt(zones:readonly number[],t:number,H:number=AM3_H):Set<number>{
 if(H!==AM3_H||!Number.isInteger(t)||t<0||t>=zones.length)
  throw Error('AM3_TERRITORY_INVALID_T');
 // t=0 is exceptional: birth zone 0 already occupies the initial territory.
 const from=Math.max(0,t-H),stop=t===0?1:t;
 return new Set(zones.slice(from,stop));
}
export function evaluateRefrain(
 zones:readonly number[],t:number,absorbed:boolean
):RefrainOutcome {
 if(!Number.isInteger(t)||t<0||zones.length<t+2)
  throw Error('AM3_MISSING_EDGE_OR_BAD_T');
 if(zones.some(z=>!Number.isInteger(z)||z<0||z>9))
  throw Error('AM3_ZONE_INVALID');
 const last=zones.length-1;
 if(last>t+AM3_H)throw Error('AM3_EVALUATION_TOO_LATE');
 if(absorbed){
  if(zones[last]!==5||last>t+AM3_H)
   throw Error('AM3_ABSORPTION_MUST_BE_TERMINAL_WITHIN_HORIZON');
 }else if(last<t+AM3_H){
  throw Error('AM3_FORBID_UNRESOLVED_FUTURE');
 }else if(zones.slice(t+1,t+AM3_H+1).includes(5)){
  throw Error('AM3_TERMINAL_ENTRY_MISCLASSIFIED');
 }
 const theta=territoryAt(zones,t);
 const neutral=(kind:RefrainKind,value:number,step:number|null=null,newEdges:string[]=[]):RefrainOutcome=>
  ({kind,value,firstReturnStep:step,newExcursionEdges:newEdges,
    territoryZones:[...theta].sort((a,b)=>a-b)});
 if(absorbed)return neutral('abolition',-1);
 // If the departure does not leave the territory, it is not a refrain.
 if(theta.has(zones[t+1]))return neutral('otherwise',0);
 let first=-1;
 for(let index=t+2;index<=t+AM3_H;index++){
  if(theta.has(zones[index])){first=index;break;}
 }
 if(first===-1)return neutral('otherwise',0);
 const prior=new Set<string>();
 for(let i=Math.max(0,t-AM3_H);i<t;i++)
  prior.add(directedKey(zones[i],zones[i+1]));
 const excursion=new Set<string>();
 for(let i=t;i<first;i++)
  excursion.add(directedKey(zones[i],zones[i+1]));
 const fresh=[...excursion].filter(e=>!prior.has(e)).sort();
 const r=fresh.length/AM3_EDGE_COUNT;
 if(!Number.isFinite(r)||r<0||r>1)throw Error('AM3_INVALID_REFRAIN_REWARD');
 return neutral('refrain',r,first,fresh);
}
/** All pending consequences use only observed trajectory events. */
export class RefrainQueue{
 private readonly pending:{t:number;edge:string}[]=[];
 private outcomeCount=0;private extinctionCount=0;
 addEdge(t:number,edge:string):void {
  if(!Number.isInteger(t)||t<0||this.pending.some(p=>p.t===t))
   throw Error('AM3_DUPLICATE_OR_INVALID_PENDING');
  this.pending.push({t,edge});
 }
 resolve(zones:readonly number[],absorbed:boolean):{
   t:number;edge:string;result:RefrainOutcome
 }[]{
  const last=zones.length-1;
  const ready: {t:number;edge:string;result:RefrainOutcome}[]=[];
  for(let j=this.pending.length-1;j>=0;j--){
   const p=this.pending[j];
   if(absorbed||last>=p.t+AM3_H){
    const result=evaluateRefrain(
     zones.slice(0,Math.min(last,p.t+AM3_H)+1),p.t,absorbed);
    ready.push({...p,result});
    this.pending.splice(j,1);
    this.outcomeCount++;
    if(result.kind==='abolition')this.extinctionCount++;
   }
  }
  return ready.sort((a,b)=>a.t-b.t);
 }
 unfinished():number{return this.pending.length}
 completed():number{return this.outcomeCount}
 abolitionUpdates():number{return this.extinctionCount}
}
