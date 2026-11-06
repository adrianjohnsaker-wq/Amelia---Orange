// AG-1 / RC-1 live Amelia (REGISTRATION.md). The validated body route of SXI-1R: the repaired runtime (beta 2, Theta 24),
// full 29-gate Numogram, CORAL_REEF body 12 x 10, each world datum (zone) touched into its band at alpha = 0.1.
// Candidate k starts from body seed 7000 + k (k = 0..99); the live candidate is chosen by the drand beacon (epoch.py).
// Epochs: log entry e has time T_e. Before entry e is decided, the data first seen in (T_{e-1}, T_e] (D_{e-1}) are fed;
// her zone then is zPre(e). Entry e's intervention follows: APPLY moves her to zone X_e at once; SHAM leaves her unchanged.
//   node --import tsx live.ts <items.json> <log.json> <candidate> <cutISO|-> <out.json>
// items.json: [{seenAt, zone}] in arrival order. With cutISO, a pending epoch is evaluated: data in (T_last, cut] are fed and
// its zPre is reported (no intervention). Output: per-epoch {e, zPre, zPost, fed, digest}.
import { readFileSync, writeFileSync } from 'node:fs';
import { observeField } from '../synthetic-pointer/observer';
import { stepFieldWithPointer } from '../synthetic-pointer/pointer';
import { createRepairedField } from '../synthetic-pointer/sxi0c/repaired';
import { touch } from '../synthetic-pointer/sxi1r/touch';
export const ALPHA = 0.1;
export type Item = { seenAt: string; zone: number };
export type Entry = { e: number; T: string; X: number; arm: 'APPLY' | 'SHAM' };
export function replay(items: Item[], log: Entry[], k: number, cut: string | null, plant?: { frac: number; seed: string; used: number[] }) {
  // plant (CALIBRATION ONLY, never in the live run): each datum fed in epoch e is replaced, with probability frac, by this
  // candidate's own zPre(e) - a world that "answers" her state. The data actually fed are recorded in plant.used.
  let ps = 0; for (const ch of (plant?.seed ?? '')) ps = (Math.imul(ps, 31) + ch.charCodeAt(0)) >>> 0;
  const prand = () => { ps = (ps + 0x6D2B79F5) >>> 0; let x = ps; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  let zAnswer = 0;
  let st: any = createRepairedField({ width: 12, height: 10, preset: 'CORAL_REEF', seed: 7000 + k, noiseAmp: 0.003 } as any);
  const feed = (z: number) => {
    touch(st, z, ALPHA);
    const ob = observeField(st);
    if (ob.attentionVector) st.nativeRuntime.queueSynthetic({ eventId: 'ag1:' + (st.stepCount + 1), channel: 'SYNTHETIC_FIELD', sourceDigest: ob.sourceDigest, attentionVector: ob.attentionVector });
    st = stepFieldWithPointer(st, { id: 'neutral', edges: [] });
  };
  const out: any[] = []; let i = 0;
  const feedUntil = (T: string) => { let n = 0; while (i < items.length && items[i].seenAt <= T) {
    const z = plant && prand() < plant.frac ? zAnswer : items[i].zone; if (plant) plant.used.push(z); feed(z); i++; n++; } return n; };
  for (const en of log) {
    const fed = en.e === 0 ? 0 : feedUntil(en.T);   // D_{e-1}; nothing precedes epoch 0
    if (en.e === 0) while (i < items.length && items[i].seenAt <= en.T) { if (plant) plant.used.push(items[i].zone); i++; }   // data before the first epoch are not part of the study
    const zPre = st.nativeRuntime.getCurrentZone(), digest = st.nativeRuntime.getMemory().exportHistoryDigest();
    if (en.arm === 'APPLY') (st.nativeRuntime as any).currentZone = en.X;
    out.push({ e: en.e, zPre, zPost: st.nativeRuntime.getCurrentZone(), fed, digest }); zAnswer = zPre;
  }
  if (cut) { const fed = log.length ? feedUntil(cut) : 0; out.push({ e: log.length, pending: true, zPre: st.nativeRuntime.getCurrentZone(), fed, digest: st.nativeRuntime.getMemory().exportHistoryDigest() }); }
  return out;
}
if (/agentic\/live\.ts$/.test(process.argv[1] ?? '')) {
  const [ITEMS, LOG, K, CUT, OUT] = process.argv.slice(2);
  writeFileSync(OUT, JSON.stringify(replay(JSON.parse(readFileSync(ITEMS, 'utf8')), JSON.parse(readFileSync(LOG, 'utf8')), Number(K), CUT === '-' ? null : CUT)));
}
