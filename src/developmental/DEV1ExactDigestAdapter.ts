/**
 * DEV-1 assay-only performance wrapper. Never modifies a canonical source file.
 * Replaces only the runtime's linear-in-history digest rendering with an
 * incremental byte-identical SHA-256. The dynamic memory state and all
 * transition/selection calculations remain the ORIGINAL canon.
 *
 * For event digests d_i, canonical digest =
 * SHA256(JSON.stringify([d_0,...,d_n])).
 * Streaming a prefix with cloned hash state yields EXACTLY the same bytes.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import type {IntegratedMemorySystem} from '../substrate/IntegratedMemorySystem';

export function accelerateExactHistoryDigest(mem:IntegratedMemorySystem){
  const original=mem.exportHistoryDigest.bind(mem);
  const h=createHash('sha256');h.update('[');
  let processed=0;
  const accelerated=():string=>{
    const events=mem.getEvents();
    if(events.length<processed)throw Error('DEV1_HISTORY_RESET_REQUIRES_NEW_ADAPTER');
    for(;processed<events.length;processed++){
      if(processed)h.update(',');
      h.update(JSON.stringify(events[processed].eventDigest));
    }
    const cloned=h.copy();cloned.update(']');
    return cloned.digest('hex');
  };
  // Assert equality before any experiment steps.
  assert.equal(accelerated(),original());
  mem.exportHistoryDigest=accelerated;
  return {
    validateCanonical:()=>{
      const fast=accelerated();
      const exact=original();
      assert.equal(fast,exact,'DEV1_ACCELERATED_DIGEST_NOT_CANONICAL');
      return fast;
    }, processed:()=>processed
  };
}
