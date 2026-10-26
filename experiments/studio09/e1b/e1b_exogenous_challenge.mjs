/**
 * E1B — fixed externally imposed SOURCE challenge, independent of the model.
 * Every 5,000 encounter inputs hashes under the source Numogram's unchanged
 * SHA256(input.trim()) rule to cue zone 5. A generator counter fixes the
 * chosen bytes BEFORE model choice; neither Numogram state nor learner state
 * are read by this file. This is a strong adverse challenge, not a claim
 * about intelligent drand signals or naturally sampled beacons.
 */
import {createHash} from 'node:crypto';
import {e1EncounterInput} from '../code/e1_outside_tapes.mjs';
const sha=s=>createHash('sha256').update(s).digest('hex');
export function e1bEncounterSource(seed,season,tick,regime='sink-challenge'){
 if(regime==='ordered')return e1EncounterInput(seed,season,tick,'ordered');
 if(regime!=='sink-challenge')throw Error('E1B_SOURCE: invalid regime');
 if(typeof seed!=='string'||!/^[0-9a-f]{64}$/.test(seed)||
   !Number.isInteger(season)||season<1||season>2||
   !Number.isInteger(tick)||tick<1||tick>5000)
   throw Error('E1B_SOURCE: invalid seed/time');
 const prefix='STUDIO09-E1B-EXOGENOUS-CHALLENGE-V1|'+seed+'|'+season+'|'+tick+'|';
 for(let nonce=0;nonce<128;nonce++){
   const source=prefix+nonce;
   const zone=parseInt(sha(source).slice(0,2),16)%10;
   if(zone===5)return source;
 }
 throw Error('E1B_SOURCE: nonce budget exhausted');
}
