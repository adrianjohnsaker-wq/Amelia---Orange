/** Exact House learner readout immediately before a diagnostic gate decision. */
import assert from 'node:assert/strict';
const score=t=>.5*t[0]+.35*Math.tanh(t[1]+t[2]);
export function houseContrast(state,proposal,diagnostic){
 const L=state.L,selfEdge=`${proposal}>${proposal}`,diagnosticEdge=`${proposal}>${diagnostic}`,donorEdge='2>3';
 const trip=e=>['V','S','D'].map(k=>{assert.ok(e in L[k],`missing ${k} ${e}`);return L[k][e]});
 const self=trip(selfEdge),diagnosticValues=trip(diagnosticEdge),donor=trip(donorEdge);
 const live=score(self)-score(diagnosticValues),misaligned=score(donor)-score(diagnosticValues);
 assert.ok(Number.isFinite(live)&&Number.isFinite(misaligned));
 return {selfEdge,diagnosticEdge,donorEdge,self,diagnostic:diagnosticValues,donor,live,misaligned};
}
export function formatContrast(value){
 assert.ok(Number.isFinite(value)&&Math.abs(value)<10);
 return `${value<0?'-':'+'}${Math.abs(value).toFixed(4)}`;
}
export const maskedContrast='?0.????';
