// ND-1: NDRuntime with nd, warpRelease off and fieldWeight 0.2 must reproduce NRRuntime exactly.
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { NRRuntime, IDENTITY } from '../nr1/nrRuntime';
import { NDRuntime } from './ndRuntime';
let bad = 0;
for (const seed of [1, 2, 3]) {
  const a = new NRRuntime(), b = new NDRuntime();
  for (const r of [a, b] as any[]) { withFullNumogram(r); r.setSuppressRelaySteering(true); r.rel = IDENTITY; }
  let x = seed; const pa: number[] = [], pb: number[] = [];
  for (let t = 0; t < 2000; t++) {
    x = (x * 1103515245 + 12345) % 2147483648; const c = 1 + (x % 9); const v = Array(10).fill(0); v[c] = 1;
    for (const [r, p] of [[a, pa], [b, pb]] as any[]) { r.queueSynthetic({ eventId: `eq:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`${t}`).digest('hex'), attentionVector: v }); r.step(); p.push(r.getCurrentZone()); }
  }
  const same = pa.every((z, i) => z === pb[i]); if (!same) bad++;
  console.log(`sequence ${seed}: ${same ? 'IDENTICAL' : 'DIFFERENT'} (2000 steps)`);
}
process.exit(bad ? 1 : 0);
