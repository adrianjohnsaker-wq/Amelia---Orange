/** PF-1 reference-tape domain separation. Never uses the C1 REF prefix.
 * The baseline C arm receives the original verified 32-byte randomness
 * (lowercase hex). Each R01..R08 arm receives SHA256(ASCII "PF1-REF-i|"
 * concatenated with the actual 32 randomness bytes), i = 1...8.
 * This file does not fetch or admit a beacon round.
 */
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
export const PF1_REFERENCE_DOMAIN = 'PF1-REF-';
export const PF1_REFERENCE_COUNT = 8;
export function pf1InputForArm(randomnessHex, armIndex) {
  assert.match(randomnessHex,/^[0-9a-f]{64}$/i,'VERIFIED_RANDOMNESS_MUST_BE_32_BYTE_HEX');
  assert(Number.isInteger(armIndex)&&armIndex>=0&&armIndex<=8,'ARM_MUST_BE_C_OR_1_TO_8');
  const bytes = Buffer.from(randomnessHex,'hex');
  if (armIndex===0) return bytes.toString('hex');
  return createHash('sha256')
    .update(Buffer.concat([Buffer.from('PF1-REF-'+armIndex+'|','ascii'),bytes]))
    .digest('hex');
}
