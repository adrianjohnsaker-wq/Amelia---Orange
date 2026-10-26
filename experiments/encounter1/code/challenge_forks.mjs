/** ENCOUNTER-1 post-washout selective reset contract. Engineering only.
 * The actual simulator adapter must verify complete export/import fidelity first.
 */
const clone=x=>structuredClone(x);
const KEYS=['receiver','house','code','substrate'];
export function makeChallengeFork(postWashout,preEncounter,kind){
 if(!['carry','receiver_reset','house_code_reset','double_reset'].includes(kind))throw Error('unknown reset');
 for(const s of [postWashout,preEncounter]){
  if(!s||typeof s!=='object'||KEYS.some(k=>!Object.prototype.hasOwnProperty.call(s,k)))throw Error('incomplete checkpoint');
 }
 const out=clone(postWashout);
 if(kind==='receiver_reset'||kind==='double_reset')out.receiver=clone(preEncounter.receiver);
 if(kind==='house_code_reset'||kind==='double_reset'){out.house=clone(preEncounter.house);out.code=clone(preEncounter.code);}
 return out;
}
