/** DEV1 AM5 registered prospective final non-returning-excursion definition.
 * Lineage credit only. Original AM4 literal reader and registered failure untouched.
 * No lineage cohort execution. */
import {territoryAt} from './DEV1AM3Refrain';
import {D1_CANONICAL_EDGES,d1EdgeKey} from './DEV1D1EdgeSelector';
import {applyAM4DistinctMarks} from './DEV1AM4LiteralLineage';
export const AM5_H=24;
export function am5EarliestNonreturningExcursion(zones:readonly number[]){
 if(zones.length<2||zones[0]!==0||zones[zones.length-1]!==5||
   zones.slice(0,-1).includes(5))throw Error('AM5_NEEDS_FIRST_SINK_ARRIVAL');
 const ta=zones.length-1;
 const candidates:number[]=[];
 for(let t=Math.max(0,ta-AM5_H);t<ta;t++){
  const th=territoryAt(zones,t,AM5_H);
  if(th.has(zones[t+1]))continue;
  let laterReturn=false;
  for(let s=t+1;s<=ta;s++){
    if(th.has(zones[s])){laterReturn=true;break;}
  }
  if(!laterReturn)candidates.push(t);
 }
 if(!candidates.length||candidates[candidates.length-1]!==ta-1)
  throw Error('AM5_MISSING_TERMINAL_QUALIFYING_STEP');
 const tStar=candidates[0];
 const edges:string[]=[];
 for(let t=tStar;t<ta;t++){
  const e=d1EdgeKey(zones[t],zones[t+1]);
  if(!D1_CANONICAL_EDGES.includes(e))throw Error('AM5_NONCANONICAL_EDGE');
  edges.push(e);
 }
 const finalExcursionDistinctEdges=[...new Set(edges)];
 return {absorptionStep:ta,tStar,qualifyingSteps:candidates,
    finalExcursionEdges:edges,distinctFinalExcursionEdges:finalExcursionDistinctEdges,
    excludedCircuitEdges:['1->8','8->9','9->1'].filter(x=>!finalExcursionDistinctEdges.includes(x))};
}
export function am5TerminalMarks(zones:readonly number[]){
 const departure=am5EarliestNonreturningExcursion(zones);
 return {...departure,...applyAM4DistinctMarks(departure.distinctFinalExcursionEdges)};
}
