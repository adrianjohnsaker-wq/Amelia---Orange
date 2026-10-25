/**
 * Studio08 S1 - NEW designer-authored, non-hash pre-choice candidate sensors.
 * ENGINEERING ONLY until original Studio07 source and trial precommit are admitted.
 *
 * history must contain EXACTLY 25 already-committed pre-choice snapshots,
 * representing ticks t-24 ... t, with t strictly before the next choice.
 * Only HOUSE {surface, deep}, CODE {V} fields are examined. Other properties,
 * including raw input/eventDigest, are deliberately not read.
 *
 * All sensors propose a zone in 0..9 or null; NO resampling if it is not an
 * open exit. Caller applies at most +0.35, with one sensor active.
 */
import {EDGES} from './endogenous_cues.mjs';

export const SENSOR_IDS=Object.freeze([
  'surface_decline24','house_flux24','code_drift24'
]);
const EPS=1e-14;
function require(ok,message){if(!ok)throw new Error(message)}
function arraysAndBounds(history){
  require(Array.isArray(history)&&history.length===25,
    '25 committed pre-choice snapshots are required (t-24..t)');
  for(let k=0;k<25;k++){
    const item=history[k];
    require(item&&typeof item==='object'&&item.house&&item.house.surface&&
      item.house.deep&&item.code&&item.code.V,
      'missing pre-choice house or code snapshot at '+k);
    for(const edge of EDGES){
      for(const [label,value] of [
        ['surface',item.house.surface[edge]],
        ['deep',item.house.deep[edge]],
        ['V',item.code.V[edge]]
      ])require(typeof value==='number'&&Number.isFinite(value),
        'invalid '+label+' for '+edge+' at '+k);
    }
  }
  return [history[0],history[24]];
}
function targetByAccumulatedChange(before,after,field){
  const totals=Array(10).fill(0);
  for(const edge of EDGES){
    const destination=Number(edge.split('>')[1]);
    const old=field(before,edge),now=field(after,edge);
    const delta=Math.abs(now-old);
    require(Number.isFinite(delta),'arithmetic overflow on '+edge);
    totals[destination]+=delta;
  }
  const highest=Math.max(...totals);
  if(highest<=EPS)return null;
  const target=totals.findIndex(v=>v===highest); // lowest numeric zone
  return target;
}
export function closedCircuitSensorCandidates(history){
  const [before,after]=arraysAndBounds(history);
  // Highest falling SINGLE surface edge; lexical tie resolution is NEW S1.
  let maxFall=EPS;
  let candidateEdges=[];
  for(const edge of EDGES){
    const decline=before.house.surface[edge]-after.house.surface[edge];
    require(Number.isFinite(decline),'surface arithmetic overflow');
    if(decline>maxFall){
      maxFall=decline;
      candidateEdges=[edge];
    }else if(decline===maxFall && decline>EPS){
      candidateEdges.push(edge);
    }
  }
  const surfaceEdge=candidateEdges.length>0?
    candidateEdges.sort()[0]:null;
  const surface=surfaceEdge===null?null:Number(surfaceEdge.split('>')[1]);

  const house=targetByAccumulatedChange(before,after,
    (x,e)=>x.house.surface[e]+x.house.deep[e]);
  const code=targetByAccumulatedChange(before,after,
    (x,e)=>x.code.V[e]);
  return Object.freeze([
    Object.freeze({id:SENSOR_IDS[0],target:surface}),
    Object.freeze({id:SENSOR_IDS[1],target:house}),
    Object.freeze({id:SENSOR_IDS[2],target:code})
  ]);
}
