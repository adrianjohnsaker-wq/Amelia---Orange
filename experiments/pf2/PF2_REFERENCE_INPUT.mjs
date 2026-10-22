/**
 * PF2 domain separation on the same C1/PF1 genuine Quicknet verified bytes.
 * Arm C uses the raw 32-byte lowercase hex randomness.
 * R01..R08 use SHA256(ASCII "PF2-REF-i|" || raw bytes), i=1..8.
 * Distinct from PF1-REF-i| and every C1 tape. No networking or admission.
 */
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
export const PF2_REFERENCE_DOMAIN='PF2-REF-i|';
export function pf2InputForArm(randomnessHex,k){
 assert.match(randomnessHex,/^[0-9a-f]{64}$/i);
 assert(Number.isInteger(k)&&k>=0&&k<=8);
 const raw=Buffer.from(randomnessHex,'hex');
 if(k===0)return raw.toString('hex');
 return createHash('sha256').update(Buffer.concat([
  Buffer.from('PF2-REF-'+k+'|','ascii'),raw
 ])).digest('hex');
}
