/**
 * HYPERSTITION-2L machinery (experiments/live-amelia/hyp2l/REGISTRATION.md). HYPERSTITION-1L's stream and offers, at a
 * fixed pace: each sign is held for exactly 6 runtime steps. Her own runtime and the WT-3L replay, unchanged; a wrapper
 * around step() substitutes the current sign into each study offer and logs each step. Pure: takes copies.
 */
import { createHash } from 'node:crypto';
import { wt3lChunk, wt3lSummary, type IdFn, type Wt3lTick } from '../../../src/cloud/wt3l';
import { bornAmeliaOf } from '../../../src/core/ameliaRuntimes';
import { begin } from '../wt5l/wt5l';
import { STREAM, STREAM_SHA256, streamDigest, rng, attentionOf } from '../hyp1l/hyp1l';

export { STREAM, STREAM_SHA256, streamDigest };
export const HOLD = 6, TICKS = 48, ITER = 15, STEPS = 2 * TICKS * ITER, SIGNS = STEPS / HOLD, UNITS = 24, WARP = new Set([3, 6]);
export const ARMS = ['H', 'Sh', 'Rv', 'Mk'] as const;
export type Arm = typeof ARMS[number];
export const hyp2lId: IdFn = (unit, pass, eventId) => `hyp2l:${unit}:${pass}:${eventId}`;

const TRANS = (() => { const t = Array.from({ length: 10 }, () => Array(10).fill(0)); for (let i = 1; i < STREAM.length; i++) t[STREAM[i - 1]][STREAM[i]]++; return t; })();

/** Unit u's portion: the 240 signs from floor((u - 1/2) * N / 24). */
export const offset = (u: number) => Math.floor((u - 0.5) * STREAM.length / UNITS);
export const portion = (u: number) => STREAM.slice(offset(u), offset(u) + SIGNS);
export function armStream(arm: Arm, u: number): number[] {
  const p = portion(u);
  if (arm === 'H') return p;
  if (arm === 'Rv') return [...p].reverse();
  if (arm === 'Sh') { const s = [...p], r = rng(1584300 + u); for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; } return s; }
  const r = rng(1584400 + u), m = [p[0]];
  while (m.length < SIGNS) { const row = TRANS[m.at(-1)!], tot = row.reduce((a, b) => a + b, 0); let x = r() * tot, z = 1;
    for (; z < 9; z++) { x -= row[z]; if (x < 0) break; } m.push(z); }
  return m;
}

export interface Step { zone: number; hops: number[]; entries: number; flight: boolean; newGates: string[]; locked: boolean; sign: number; study: boolean; onArrival: boolean }

/** Transmission at the fixed pace: sign k is current for runtime steps 6k .. 6k+5, whatever she does. */
export function transmission(record: any, arm: Arm, u: number, id: string) {
  const signs = armStream(arm, u), steps: Step[] = [];
  const ticks: Wt3lTick[] = Array.from({ length: TICKS }, (_, k) => ({ offers: Array.from({ length: ITER }, (_, i) => ({ eventId: `s${k}-${i}`,
    channel: 'LINGUISTIC', sourceDigest: '0'.repeat(64), attentionVector: attentionOf(1) })) }));
  const make = (kind: any) => {
    const rt: any = bornAmeliaOf(kind); const orig = rt.step.bind(rt);
    rt.step = (signal?: string, enc?: any) => {
      const k = Math.min(SIGNS - 1, Math.floor(steps.length / HOLD)), z = signs[k];
      const study = !!enc && String(enc.eventId).startsWith('hyp2l:');
      if (study) { enc.attentionVector = attentionOf(z); enc.sourceDigest = createHash('sha256').update(`hyp2l|${arm}|${u}|${k}|${z}`).digest('hex'); }
      const g0 = new Set(rt.qabbala.getGates().map((g: any) => String(g.id))), zone0 = Number(rt.getCurrentZone());
      const fl0 = Number(rt.getNDStatus().flights), ev0 = rt.getMemory().getEvents().length;
      const s = orig(signal, enc);
      const ev: any[] = rt.getMemory().getEvents() as any[]; const hops: number[] = []; let prev = zone0, entries = 0;
      for (let i = ev0; i < ev.length; i++) { const t = Number(ev[i].targetZone); hops.push(t); if (!WARP.has(prev) && WARP.has(t)) entries++; prev = t; }
      steps.push({ zone: Number(rt.getCurrentZone()), hops, entries, flight: Number(rt.getNDStatus().flights) > fl0,
        newGates: rt.qabbala.getGates().map((g: any) => String(g.id)).filter((x: string) => !g0.has(x) && x.startsWith('warpborn')),
        locked: s.governor?.governorStatus === 'LOCKED_RECOVERY', sign: k, study,
        onArrival: study && (s.encounterDecisions ?? []).some((d: any) => d.disposition === 'ATTEND' && d.eventId === enc.eventId) });
      return s;
    };
    return rt;
  };
  const sc = wt3lChunk(begin(record, id, u), ticks, TICKS, hyp2lId, make);
  return { record: sc.record, metrics: sc.metrics, summary: wt3lSummary(sc.metrics), steps, signs };
}

/** The zones she landed in on any hop during each sign's 6 steps. */
export const windows = (steps: Step[]) => Array.from({ length: SIGNS }, (_, k) => new Set(steps.slice(k * HOLD, (k + 1) * HOLD).flatMap(s => s.hops)));
/** Fulfilment: the share of signs whose zone she landed in during the sign's own 6 steps. */
export const fulfilment = (signs: number[], win: Set<number>[]) => signs.filter((z, k) => win[k]?.has(z)).length / signs.length;

/** Adjacency: the share of consecutive distinct sign pairs a -> b joined by an open gate in her starting graph; and of repeats. */
export function adjacency(signs: number[], start: any) {
  const open = new Set((start.state.qabbalaGates ?? []).filter((g: any) => g.isOpen).map((g: any) => `${g.source}>${g.target}`));
  let pairs = 0, joined = 0, repeats = 0;
  for (let i = 1; i < signs.length; i++) { if (signs[i] === signs[i - 1]) { repeats++; continue; } pairs++; if (open.has(`${signs[i - 1]}>${signs[i]}`)) joined++; }
  return { joined: pairs ? joined / pairs : null, repeats: repeats / (signs.length - 1) };
}

/** Exact one-sided sign-flip over all 2^n patterns: p = #(sum* >= sum) / 2^n. Gray-code enumeration, so 2^24 is quick. */
export function signFlipUpper(d: number[]) {
  const n = d.length, obs = d.reduce((a, b) => a + b, 0); let t = obs, k = 1; const sgn = Array(n).fill(1);
  for (let g = 1; g < 2 ** n; g++) { let b = 0; while (((g >> b) & 1) === 0) b++; t -= 2 * sgn[b] * d[b]; sgn[b] = -sgn[b]; if (t >= obs - 1e-9) k++; }
  return { mean: obs / n, p: k / 2 ** n, patterns: 2 ** n };
}
