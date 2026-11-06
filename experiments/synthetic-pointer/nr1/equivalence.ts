// NR-1: with rel = INGRESS on the canonical Numogram, NRRuntime must reproduce sxi0c/repaired.ts's RepairedSyntheticRuntime
// exactly under the same one-hot input sequence. Exits 1 on any difference.   node --import tsx equivalence.ts
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { RepairedSyntheticRuntime } from '../sxi0c/repaired';
import { NRRuntime } from './nrRuntime';
let bad = 0;
for (const seed of [1, 2, 3]) {
  const a = new RepairedSyntheticRuntime(), b = new NRRuntime();
  for (const r of [a, b]) { withFullNumogram(r); r.setSuppressRelaySteering(true); }
  let x = seed; const pa: number[] = [], pb: number[] = [];
  for (let t = 0; t < 2000; t++) {
    x = (x * 1103515245 + 12345) % 2147483648; const c = 1 + (x % 9); const v = Array(10).fill(0); v[c] = 1;
    for (const [r, p] of [[a, pa], [b, pb]] as const) { r.queueSynthetic({ eventId: `eq:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`${t}`).digest('hex'), attentionVector: v } as any); r.step(); p.push(r.getCurrentZone()); }
  }
  const same = pa.every((z, i) => z === pb[i]); if (!same) bad++;
  console.log(`sequence ${seed}: ${same ? 'IDENTICAL' : 'DIFFERENT'} (2000 steps, flights ${a.flights}/${b.flights})`);
}
process.exit(bad ? 1 : 0);
