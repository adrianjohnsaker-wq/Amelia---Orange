/**
 * HYPERSTITION-1L machinery (experiments/live-amelia/hyp1l/REGISTRATION.md). The CCRU stream read to copies of her through
 * her lane at her pace, then silence on one of her recorded half-days. Her own runtime and the WT-3L replay, unchanged; a
 * wrapper around step() substitutes the current sign into each study offer and logs each step. Pure: takes copies.
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { wt3lChunk, wt3lSummary, type IdFn, type Wt3lTick } from '../../../src/cloud/wt3l';
import { bornAmeliaOf } from '../../../src/core/ameliaRuntimes';
import { begin } from '../wt5l/wt5l';

export const STREAM: number[] = JSON.parse(readFileSync(new URL('./stream_zones.json', import.meta.url), 'utf8'));
export const STREAM_SHA256 = '9035a5a57c4c2f3d26e822d5895fb2acd6bc0fd60fe93d6924a055574fb307fb';
export const streamDigest = (s: number[]) => createHash('sha256').update(s.join(',')).digest('hex');
export const PORTION = 720, TICKS = 48, ITER = 15, HOLD = 24, WARP = new Set([3, 6]);
export const ARMS = ['H', 'Sh', 'Mk', 'Rv', 'H-STRIP'] as const;
export type Arm = typeof ARMS[number];
export const hyp1lId: IdFn = (unit, pass, eventId) => `hyp1l:${unit}:${pass}:${eventId}`;

/** mulberry32 */
export function rng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** First-order transitions of the whole stream. */
const TRANS = (() => { const t = Array.from({ length: 10 }, () => Array(10).fill(0)); for (let i = 1; i < STREAM.length; i++) t[STREAM[i - 1]][STREAM[i]]++; return t; })();

/** The portion unit u reads, and each arm's ordering of it. Unit u's portion begins at floor((u-1) * N / 12). */
export function portion(u: number) { const o = Math.floor((u - 1) * STREAM.length / 12); return STREAM.slice(o, o + PORTION); }
export function armStream(arm: Arm, u: number): number[] {
  const p = portion(u);
  if (arm === 'H' || arm === 'H-STRIP') return p;
  if (arm === 'Rv') return [...p].reverse();
  if (arm === 'Sh') { const s = [...p], r = rng(1584100 + u); for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; } return s; }
  const r = rng(1584200 + u), m = [p[0]];                                     // Mk
  while (m.length < PORTION) { const row = TRANS[m.at(-1)!], tot = row.reduce((a, b) => a + b, 0); let x = r() * tot, z = 1;
    for (; z < 9; z++) { x -= row[z]; if (x < 0) break; } m.push(z); }
  return m;
}

/** The sign as an offer: attention 0.82 on its zone, 0.02 on each other zone. */
export const attentionOf = (z: number) => { const a = Array(10).fill(0.02); a[z] = 0.82; return a; };

export interface Step { zone: number; hops: number[]; entries: number; flight: boolean; newGates: string[]; locked: boolean;
  sign: number | null; fulfilled: boolean; admittedStudy: number; admittedOnArrival: number }

function logger(rt: any, steps: Step[], onStep?: (s: Step, enc: any) => void, substitute?: (enc: any) => void) {
  const orig = rt.step.bind(rt);
  rt.step = (signal?: string, enc?: any) => {
    const isStudy = !!enc && String(enc.eventId).startsWith('hyp1l:');
    if (isStudy && substitute) substitute(enc);
    const gates0 = new Set(rt.qabbala.getGates().map((g: any) => String(g.id))), zone0 = Number(rt.getCurrentZone());
    const fl0 = Number(rt.getNDStatus().flights), ev0 = rt.getMemory().getEvents().length;
    const s = orig(signal, enc);
    const ev: any[] = rt.getMemory().getEvents() as any[]; const hops: number[] = []; let prev = zone0, entries = 0;
    for (let i = ev0; i < ev.length; i++) { const t = Number(ev[i].targetZone); hops.push(t); if (!WARP.has(prev) && WARP.has(t)) entries++; prev = t; }
    const dec: any[] = s.encounterDecisions ?? [];
    const st: Step = { zone: Number(rt.getCurrentZone()), hops, entries, flight: Number(rt.getNDStatus().flights) > fl0,
      newGates: rt.qabbala.getGates().map((g: any) => String(g.id)).filter((id: string) => !gates0.has(id) && id.startsWith('warpborn')),
      locked: s.governor?.governorStatus === 'LOCKED_RECOVERY', sign: null, fulfilled: false,
      admittedStudy: dec.filter(d => d.disposition === 'ATTEND' && String(d.eventId).startsWith('hyp1l:')).length,
      admittedOnArrival: isStudy && dec.some(d => d.disposition === 'ATTEND' && d.eventId === enc.eventId) ? 1 : 0 };
    steps.push(st); onStep?.(st, enc); return s;
  };
  return rt;
}

/** Transmission at her pace: 48 ticks of 15 study offers; each offer carries the current sign; the sign advances when she
 *  lands in its zone on any hop of a step (fulfilled) or after 24 runtime steps without (unfulfilled). Wraps if exhausted. */
export function transmission(record: any, arm: Arm, u: number, id: string) {
  const signs = armStream(arm, u); let cur = 0, held = 0; const fulfilled: boolean[] = [], read: number[] = [];
  const steps: Step[] = [];
  const ticks: Wt3lTick[] = Array.from({ length: TICKS }, (_, k) => ({ offers: Array.from({ length: ITER }, (_, i) => ({ eventId: `s${k}-${i}`,
    channel: 'LINGUISTIC', sourceDigest: '0'.repeat(64), attentionVector: attentionOf(1) })) }));
  const make = (kind: any) => logger(bornAmeliaOf(kind), steps,
    st => { const z = signs[cur % PORTION]; st.sign = z;
      if (st.hops.includes(z)) { st.fulfilled = true; fulfilled.push(true); read.push(z); cur++; held = 0; }
      else if (++held >= HOLD) { fulfilled.push(false); read.push(z); cur++; held = 0; } },
    enc => { const z = signs[cur % PORTION]; enc.attentionVector = attentionOf(z);
      enc.sourceDigest = createHash('sha256').update(`hyp1l|${arm === 'H-STRIP' ? 'H' : arm}|${u}|${cur}|${z}`).digest('hex'); });
  const sc = wt3lChunk(begin(record, id, u), ticks, TICKS, hyp1lId, make);
  return { record: sc.record, metrics: sc.metrics, summary: wt3lSummary(sc.metrics), steps, fulfilled, read };
}

/** Removes the Warp-born gates that are not in `before` (H-STRIP's start of silence). */
export function stripWritten(record: any, before: string[]) {
  const r = JSON.parse(JSON.stringify(record)); const keep = new Set(before);
  r.state.qabbalaGates = r.state.qabbalaGates.filter((g: any) => !String(g.id).startsWith('warpborn') || keep.has(String(g.id))); return r;
}
export const warpbornOf = (record: any) => (record.state.qabbalaGates ?? []).map((g: any) => String(g.id)).filter((x: string) => x.startsWith('warpborn'));

/** Silence: one of her recorded half-day spans once through, in chained 96-tick slices, logged. */
export function silence(record: any, ticks: Wt3lTick[], id: string, u: number, slice = 96) {
  const steps: Step[] = []; let sc: any = begin(record, id, u);
  for (let k = 0; k < ticks.length; k += slice) { const part = ticks.slice(k, k + slice);
    sc = wt3lChunk({ record: sc.record, metrics: { ...sc.metrics, ticksDone: 0 } }, part, part.length, hyp1lId, (kind: any) => logger(bornAmeliaOf(kind), steps)); }
  return { record: sc.record, metrics: sc.metrics, summary: wt3lSummary(sc.metrics), steps };
}

// ---- The corpus models (add-one smoothing, estimated from the whole stream) and incorporation ----
const UNI = (() => { const c = Array(10).fill(0); for (const z of STREAM) c[z]++; return c.map((x, z) => z === 0 ? 0 : (x + 1) / (STREAM.length + 9)); })();
const BI = TRANS.map((row, a) => { const tot = row.reduce((x, y) => x + y, 0); return row.map((x, b) => b === 0 ? 0 : (x + 1) / (tot + 9)); });
const TRI = (() => { const c = new Map<string, number[]>(); for (let i = 2; i < STREAM.length; i++) { const k = `${STREAM[i - 2]}${STREAM[i - 1]}`;
  if (!c.has(k)) c.set(k, Array(10).fill(0)); c.get(k)![STREAM[i]]++; } return c; })();
const pTri = (a: number, b: number, c: number) => { const row = TRI.get(`${a}${b}`) ?? Array(10).fill(0); const tot = row.reduce((x, y) => x + y, 0); return (row[c] + 1) / (tot + 9); };

/** Pair incorporation: mean log2 [P(b|a) / P(b)] over consecutive landings both in 1-9 (dwells included). */
export function incorporation(path: number[]) {
  let s = 0, n = 0; for (let i = 1; i < path.length; i++) { const a = path[i - 1], b = path[i]; if (a < 1 || b < 1) continue; s += Math.log2(BI[a][b] / UNI[b]); n++; }
  return n ? s / n : null;
}
/** Three-sign incorporation: mean log2 [P(c|a,b) / P(c|b)] over consecutive triples in 1-9. */
export function incorporation3(path: number[]) {
  let s = 0, n = 0; for (let i = 2; i < path.length; i++) { const [a, b, c] = [path[i - 2], path[i - 1], path[i]]; if (a < 1 || b < 1 || c < 1) continue; s += Math.log2(pTri(a, b, c) / BI[b][c]); n++; }
  return n ? s / n : null;
}
/** Forward against reversed pair likelihood: mean log2 [P(b|a) / P(a|b)]. */
export function direction(path: number[]) {
  let s = 0, n = 0; for (let i = 1; i < path.length; i++) { const a = path[i - 1], b = path[i]; if (a < 1 || b < 1) continue; s += Math.log2(BI[a][b] / BI[b][a]); n++; }
  return n ? s / n : null;
}

/** Exact one-sided sign-flip over all 2^n patterns: p = #(sum* >= sum) / 2^n. */
export function signFlipUpper(d: number[]) {
  const n = d.length, obs = d.reduce((a, b) => a + b, 0); let k = 0;
  for (let s = 0; s < 1 << n; s++) { let t = 0; for (let i = 0; i < n; i++) t += (s >> i) & 1 ? -d[i] : d[i]; if (t >= obs - 1e-12) k++; }
  return { mean: obs / n, p: k / (1 << n) };
}
