/**
 * DEV1 AM4 literal (operator-approved text) FINAL DEPARTURE reader.
 * Pure engineering diagnostic only: no cohort/lineage execution.
 * AM4 exact last-new-zone rule contradicts tests 1/2 because sink 5 is new.
 * Fail closed; do not replace "last" with "first" or infer a new search.
 */
import {territoryAt} from './DEV1AM3Refrain';
import {D1_CANONICAL_EDGES,d1EdgeKey} from './DEV1D1EdgeSelector';
import {updateEdgeValue} from './DEV1Mechanisms';
import {blankStoneMarks} from './DEV1StoneTape';

export const AM4_H=24;
export type AM4Excursion={
  absorptionStep:number;lastQualifyingDeparture:number;
  finalExcursionEdges:string[];eligibleEdgeIds:string[];
  eligibleBeforeTerminal:number[];
};
export function am4LiteralFinalExcursion(zones:readonly number[]):AM4Excursion{
 if(zones.length<2||zones[0]!==0||zones[zones.length-1]!==5||
    zones.slice(0,-1).includes(5))throw Error('AM4_REQUIRES_FIRST_TERMINAL_ABSORPTION');
 const ta=zones.length-1;
 const from=Math.max(0,ta-AM4_H);
 const qualifying:number[]=[];
 for(let t=from;t<ta;t++){
  const th=territoryAt(zones,t);
  if(!th.has(zones[t+1]))qualifying.push(t);
 }
 const tStar=qualifying.length?qualifying[qualifying.length-1]:ta-1;
 const final=new Set<string>();
 for(let t=tStar;t<ta;t++){
  const edge=d1EdgeKey(zones[t],zones[t+1]);
  if(!D1_CANONICAL_EDGES.includes(edge))throw Error('AM4_NONCANONICAL_PATH');
  final.add(edge);
 }
 const selected=[...final];
 return {absorptionStep:ta,lastQualifyingDeparture:tStar,
  finalExcursionEdges:selected,
  eligibleEdgeIds:selected.map(x=>'gate-'+x.replace('->','-')),
  eligibleBeforeTerminal:qualifying};
}
/** One distinct gate update per observed terminal excursion, same for V or T.
 * Other unresolved last24 consequences neutral. It is NOT used by within-life
 * runs, as only lineage would use inherited terminal marks. */
export function am4TerminalMarks(zones:readonly number[]){
 const excursion=am4LiteralFinalExcursion(zones);
 const V:Object=Object.fromEntries(D1_CANONICAL_EDGES.map(x=>[x,0]));
 const T=blankStoneMarks();
 for(const e of excursion.finalExcursionEdges){
  (V as Record<string,number>)[e]=updateEdgeValue((V as Record<string,number>)[e],-1);
  const id='gate-'+e.replace('->','-');
  if(!(id in T))throw Error('AM4_MARK_ID_MISSING');
  T[id]=updateEdgeValue(T[id],-1);
 }
 return {excursion,V:V as Record<string,number>,T};
}
