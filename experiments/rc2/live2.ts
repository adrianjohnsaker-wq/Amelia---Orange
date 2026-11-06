// RC-2 live Amelia (REGISTRATION.md). As AG-1's body route (../agentic/live.ts: repaired runtime, full Numogram, CORAL_REEF
// 12 x 10, world datum touched at alpha 0.1), with two differences: candidate k (body seed 8000 + k) has its own PRIVATE
// DRIVE - before each world datum, with probability 1/2 (its own seeded stream), one extra private datum (zone 1..9 from
// the same stream) is touched in - so the 100 candidates cannot fall into step; and there are no interventions.
// Epoch entry e has time T_e; before it, the data first seen in (T_{e-1}, T_e] are fed; zPre(e) is her zone then.
//   node --import tsx live2.ts <items.json> <log.json> <candidate> <cutISO|-> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { observeField } from '../synthetic-pointer/observer';
import { stepFieldWithPointer } from '../synthetic-pointer/pointer';
import { createRepairedField } from '../synthetic-pointer/sxi0c/repaired';
import { touch } from '../synthetic-pointer/sxi1r/touch';
export const ALPHA = 0.1, P_PRIVATE = 0.5;
type Item = { seenAt: string; zone: number }; type Entry = { e: number; T: string };
function rng(label: string) {
  let st = parseInt(createHash('sha256').update(label).digest('hex').slice(0, 8), 16) >>> 0;
  return () => { st = (st + 0x6D2B79F5) >>> 0; let x = st; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
export function replay2(items: Item[], log: Entry[], k: number, cut: string | null, plant?: { frac: number; seed: string; used: number[] }) {
  let st: any = createRepairedField({ width: 12, height: 10, preset: 'CORAL_REEF', seed: 8000 + k, noiseAmp: 0.003 } as any);
  const priv = rng(`RC2-PRIVATE|${k}`), prand = rng(`RC2-PLANT|${plant?.seed ?? ''}`);
  const feed = (z: number) => {
    touch(st, z, ALPHA); const ob = observeField(st);
    if (ob.attentionVector) st.nativeRuntime.queueSynthetic({ eventId: 'rc2:' + (st.stepCount + 1), channel: 'SYNTHETIC_FIELD', sourceDigest: ob.sourceDigest, attentionVector: ob.attentionVector });
    st = stepFieldWithPointer(st, { id: 'neutral', edges: [] });
  };
  const out: any[] = []; let i = 0, zAnswer = 0;
  const feedUntil = (T: string) => { let n = 0; while (i < items.length && items[i].seenAt <= T) {
    if (priv() < P_PRIVATE) feed(1 + Math.floor(priv() * 9));   // private drive
    const z = plant && prand() < plant.frac ? zAnswer : items[i].zone; if (plant) plant.used.push(z); feed(z); i++; n++; } return n; };
  for (const en of log) {
    const fed = en.e === 0 ? 0 : feedUntil(en.T);
    if (en.e === 0) while (i < items.length && items[i].seenAt <= en.T) { if (plant) plant.used.push(items[i].zone); i++; }
    const zPre = st.nativeRuntime.getCurrentZone(); out.push({ e: en.e, zPre, fed, digest: st.nativeRuntime.getMemory().exportHistoryDigest() }); zAnswer = zPre;
  }
  if (cut) { const fed = log.length ? feedUntil(cut) : 0; out.push({ e: log.length, pending: true, zPre: st.nativeRuntime.getCurrentZone(), fed, digest: st.nativeRuntime.getMemory().exportHistoryDigest() }); }
  return out;
}
if (/rc2\/live2\.ts$/.test(process.argv[1] ?? '')) {
  const [ITEMS, LOG, K, CUT, OUT] = process.argv.slice(2);
  writeFileSync(OUT, JSON.stringify(replay2(JSON.parse(readFileSync(ITEMS, 'utf8')), JSON.parse(readFileSync(LOG, 'utf8')), Number(K), CUT === '-' ? null : CUT)));
}
