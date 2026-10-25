/**
 * Studio 08 — engineering crosswalk for the OPERATOR-DESCRIBED Studio 07b smooth sensor.
 *
 * NOT THE ORIGINAL STUDIO07B SOURCE. NO SCIENTIFIC REPLAY.
 * The user described the sensor as the destination of the single edge
 * whose house SURFACE layer S declined most across the previous 24 ticks.
 * This differs from Studio08's own new houseChangeCue: that one uses
 * SUM of absolute surface+deep deltas per destination.
 *
 * Ties, ordering and numerical threshold were not given in the user
 * summary, so DO NOT INVENT their original implementation. This helper
 * returns AMBIGUOUS_TIE or NO_DECLINE explicitly. It is an instrumentation
 * crosswalk, not a replacement choice rule. Inputs must be the full
 * pre-choice 24-tick history, never a lookahead.
 */
import {EDGES} from './endogenous_cues.mjs';
export function operatorDescribedSurfaceDecline24(houseHistory) {
  if(!Array.isArray(houseHistory)||houseHistory.length!==25)
    throw Error('25 pre-choice surface snapshots at t-24..t required');
  const first=houseHistory[0],last=houseHistory[24];
  if(!first||!last||typeof first!=='object'||typeof last!=='object')
    throw Error('missing surface snapshot');
  let greatest=0,winning=[];
  const declines={};
  for(const edge of EDGES){
    const previous=first[edge],now=last[edge];
    if(!Number.isFinite(previous)||!Number.isFinite(now))
      throw Error('missing surface value: '+edge);
    const fall=previous-now;
    declines[edge]=fall;
    if(fall>greatest){greatest=fall;winning=[edge]}
    else if(fall===greatest && fall>0)winning.push(edge);
  }
  if(greatest<=0)return {status:'NO_DECLINE',target:null,edge:null,declines};
  if(winning.length!==1)return {status:'AMBIGUOUS_TIE',target:null,
    candidateEdges:winning,declines};
  const edge=winning[0];
  return {status:'SINGLE_DECLINING_EDGE',edge,
    target:Number(edge.split('>')[1]),decline:greatest,declines};
}
