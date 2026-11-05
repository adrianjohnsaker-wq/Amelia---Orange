// SXI-1R shared definitions (see REGISTRATION.md): the touch, the shuffle, and the fast (unledgered) run.
import { createHash } from 'node:crypto';
import { observeField } from '../observer';
import { stepFieldWithPointer } from '../pointer';
import { createRepairedField } from '../sxi0c/repaired';
export const W = 12, H = 10;
const band = (i: number) => Math.floor(10 * (i % W) / W);
export const cellsOf = Array.from({ length: 10 }, (_, b) => Array.from({ length: W * H }, (_, i) => i).filter(i => band(i) === b));
export function touch(st: any, c: number, alpha: number) { if (alpha > 0) for (const i of cellsOf[c]) st.cells[i].B = Math.min(1, st.cells[i].B + alpha); }
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
export function shuffled(z: number[], label: string) {   // Fisher-Yates, mulberry32 seeded from SHA-256 of the label
  let st = parseInt(sha(`SXI1R-SHUFFLE|${label}`).slice(0, 8), 16) >>> 0;
  const rand = () => { st = (st + 0x6D2B79F5) >>> 0; let x = st; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  const s = z.slice(); for (let j = s.length - 1; j > 0; j--) { const q = Math.floor(rand() * (j + 1)); [s[j], s[q]] = [s[q], s[j]]; } return s;
}
export function streamFor(zones: number[], m: number, len: number, j: number, label: string) {
  if (zones.length < (m + 1) * len) throw new Error('stream too short');
  const seg = zones.slice(m * len, (m + 1) * len); return j === 0 ? seg : shuffled(seg, `${label}|${m}|${j}`);
}
export function run(zones: number[], seed: number, alpha: number, steps: number) {
  let st: any = createRepairedField({ width: W, height: H, preset: 'CORAL_REEF', seed, noiseAmp: 0.003 } as any);
  const path: number[] = [st.nativeRuntime.getCurrentZone()], body: number[] = [];
  for (let t = 0; t < steps; t++) {
    touch(st, zones[t], alpha);
    const rt = st.nativeRuntime, ob = observeField(st);
    body.push(ob.regionMeans.indexOf(Math.max(...ob.regionMeans)));
    if (ob.attentionVector) rt.queueSynthetic({ eventId: 'sxi1r:' + (st.stepCount + 1), channel: 'SYNTHETIC_FIELD', sourceDigest: ob.sourceDigest, attentionVector: ob.attentionVector });
    st = stepFieldWithPointer(st, { id: 'neutral', edges: [] });
    path.push(st.nativeRuntime.getCurrentZone());
  }
  return { path, body };
}
