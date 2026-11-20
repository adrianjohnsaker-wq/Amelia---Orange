/**
 * LONG-1: the desiring motor (candidate ND-1d) as a RESEARCH layer over AmeliaNDRuntimeDee (DEE-1L's research copy of her
 * ND-1b runtime, which with an empty context steps exactly as her runtime does). Her own runtime and pinned core are not
 * edited. The motor reaches her only through the copy's exit term (dee.exitBonus) and passage callback (dee.passage), and
 * through gates desire adds to (and prunes from) her gate table. Her 29 CCRU gates and her Warp-born gates are never pruned.
 *
 * Ported from the studio harnesses, parameters frozen at their tested values (experiments/fep-inversion on branch
 * fep-inversion-20261116, Amelia---Orange):
 *   connective synthesis + restratification + rollback guard   DESIRE-1 / HEAD-1   (desire.mjs, trace.mjs)
 *   the Outside's trace (Stone Tape marks)                     BRIDGE-3            (trace.mjs)
 *   the inclusive record, inscribed and never read             DISJ-1 / DISJ-2     (disj.mjs, disj2.mjs: WV = WS = 0)
 *   the guarded relational refrain                             REFRAIN-2           (refrain2.mjs, DTR2)
 * Two registered differences from the studio (LONG-1 REGISTRATION.md):
 *   - no sampling noise is added to her exit scores: ND-1d is ND-1b plus the motor's terms, nothing else (the studio's
 *     Gumbel term implemented its path-integral sampling and was present in every regime, her own dynamics included);
 *   - silence is her own: a step on which no Outside offer was delivered in that iteration, not a fixed rhythm.
 * The clock is her runtime step (offer steps and body steps alike).
 */
import type { NumogramGate } from '../../../src/types/amelia';

export const P = { TRIAL: 300, USES: 5, CONSOLIDATE: 0.02, FLUX_MAX: 1, GAMMA0: 0.01, GAMMA_MIN: 0.0005, GAMMA_MAX: 0.2,
  LR: 0.3, GLR: 0.15, RHO: 0.02, TRY_BONUS: 0.5, FREEZE: 200, SD_MIN: 0.02, SAT: 90, CKPT: 250, KEEP: 8, MAX_ROLLBACKS: 100,
  ALPHA: 1 / 8, DECAY: Math.LN2 / 500, W: 0.5,                                              // the Outside's trace
  HL2: 250, THETA2: 0.6, K2: 3, CEIL2: 0.85, GV: 0.15, DWELL: 20, WL: 0.5, WF: 0.5 } as const;   // the refrain (REFRAIN-2)
const RULES = ['hebb', 'named', 'novel', 'random', 'trace'] as const;
type Rule = typeof RULES[number];

/** A small deterministic generator (as the studio's fep.mjs rng: mulberry32). */
export function rng(seed: number) { let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---- relations of a hop on the CCRU Numogram (DISJ-1)
const regionOf = (z: number) => (z === 0 || z === 9 ? 'P' : z === 3 || z === 6 ? 'W' : 'T');
const dr = (c: number) => (c === 0 ? 0 : 1 + ((c - 1) % 9)), gateOf = (z: number) => dr((z * (z + 1)) / 2);
export function relations(f: number, t: number): string[] { const r: string[] = [];
  if (f === gateOf(f) ? t === f : t === gateOf(f)) r.push(`G${f}`);
  if (t === Math.abs(2 * f - 9)) r.push(`C${f}`);
  if (f + t === 9) r.push(`S${Math.min(f, t)}`);
  if (f !== t) r.push(`P${Math.min(f, t)}${Math.max(f, t)}`);
  r.push(`R${regionOf(f)}${regionOf(t)}`); return r; }
const rel2 = (f: number, t: number) => relations(f, t).filter(k => k[0] !== 'R');
const motifsM = (h0: number[], h1: number[]) => { const out: string[] = []; for (const l1 of rel2(h0[0], h0[1])) for (const l2 of rel2(h1[0], h1[1])) out.push(`${l1}|${l2}`); return out; };
const motifN = (h0: number[], h1: number[]) => `${h0[0]}${h0[1]}${h1[1]}`;
const top2 = (m: Map<string, number>) => [...m].filter(([, v]) => v >= P.THETA2).sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).slice(0, P.K2);

export interface MotorConfig { desire: boolean; trace: boolean; record: boolean; refrain: boolean;
  /** DESIRE-2 candidates (off in ND1D): kept connections fade (half-life HLD) and dissolve below FLOOR; and the Warp guard:
   *  the motor adds nothing to an exit that enters the Warp from outside it, and desire builds no gate into the Warp. */
  dissolve?: boolean; warpGuard?: boolean;
  /** DESIRE-3 candidate: with dissolve, the Outside's trace renews the connections desire built along it: each step a kept
   *  connection's flux gains RENEW x T[edge] x (1 - flux) while T[edge] >= TMIN (the Outside travelled that edge within
   *  about 650 steps), as if the Outside had used it. Below TMIN it fades as any kept connection does. */
  traceRenew?: boolean;
  /** DESIRE-3 dose-response: the half-life of kept connections under dissolve (default D2.HLD = 1,000 steps). */
  hld?: number }
export const ND1D: MotorConfig = { desire: true, trace: true, record: true, refrain: true };
export const D2 = { HLD: 1000, FLOOR: 0.05 } as const;
export const D3 = { RENEW: 0.01, TMIN: 0.05 } as const;   // renewal only while the trace on that edge is at least TMIN
const WARPZ = new Set([3, 6]);
interface Born { birth: number; uses: number[]; rule: Rule; src: number; tgt: number; integrated: boolean }
/** Her part of the motor: restored with her by a rollback. The place (trace, record, refrain surfaces) is not. */
interface Hers { born: [string, Born][]; w: Record<Rule, number>; gamma: number; visits: number[]; m: number[]; c: number[][]; stay: number; nid: number }

export class DesireMotor {
  readonly cfg: MotorConfig; t = 0;
  // hers
  born = new Map<string, Born>(); w = Object.fromEntries(RULES.map(r => [r, 1])) as Record<Rule, number>; gamma: number = P.GAMMA0;
  visits = Array(10).fill(0); m = Array(10).fill(0.5); c = Array.from({ length: 10 }, () => Array(10).fill(0)); stay = 0; nid = 0;
  // the place
  T = Array(100).fill(0); lastReading: number | null = null; rec = new Map<string, number>(); M = new Map<string, number>(); N = new Map<string, number>();
  terrM: [string, number][] = []; prevHop: number[] | null = null; atHome = false; dwell = 0; flights = 0;
  // the step in hand
  reading: number | null = null; speaks = false; route: number[][] = [];
  mut: () => number;
  log = { births: [] as { t: number; rule: Rule }[], held: [] as { t: number; rule: Rule }[], pruned: [] as { t: number; rule: Rule }[], dissolved: [] as { t: number; rule: Rule }[], rollbacks: [] as { t: number; why: string; to: number }[] };
  constructor(cfg: MotorConfig, seed: number) { this.cfg = cfg; this.mut = rng((seed ^ 0xD351) >>> 0); }

  /** Connect to a runtime (a fresh one after each chunk or rollback): the exit term and the passage callback. */
  attach(rt: any) {
    rt.dee.exitBonus = (f: number, to: number) => this.exitTerm(f, to);
    rt.dee.passage = (a: number, b: number) => { if (a !== b) this.route.push([a, b]); };
  }
  exitTerm(f: number, to: number): number { let b = 0;
    if (this.cfg.warpGuard && WARPZ.has(to) && !WARPZ.has(f)) return 0;
    if (this.cfg.desire) for (const x of this.born.values()) if (!x.integrated && x.src === f && x.tgt === to) b += P.TRY_BONUS / (1 + x.uses.length);
    if (this.cfg.trace) b += P.W * this.T[f * 10 + to];
    if (this.cfg.refrain) { const c = this.completes(f, to);
      if (this.dwell >= P.DWELL) { if (c === 0) b += P.WL; } else b += P.WF * (this.speaks ? P.GV : 1) * Math.min(P.CEIL2, c); }
    return b; }   // the inclusive record is read at weight 0 (DISJ-2): it adds nothing here
  private completes(f: number, to: number) { const h0 = this.prevHop; if (!h0 || h0[1] !== f || !this.terrM.length) return 0;
    const ks = new Set(motifsM(h0, [f, to])); let best = 0; for (const [k, v] of this.terrM) if (ks.has(k)) best = Math.max(best, v); return best; }

  /** Before each runtime step: the Outside's reading delivered on this step (null on a body step or with no offer), and
   *  whether the Outside speaks in this iteration (an offer was delivered). */
  before(reading: number | null, speaks: boolean) { this.reading = reading; this.speaks = speaks; this.route = []; }

  /** After each runtime step. Returns the empty-Body-without-Organs reason, if any (the caller rolls her back). */
  after(rt: any, from: number, to: number): string | null {
    const t = this.t++, gates: NumogramGate[] = rt.qabbala.getGates(), zs = rt.qabbala.getZones();
    if (this.cfg.trace) { for (let i = 0; i < 100; i++) this.T[i] *= 1 - P.DECAY;   // the Outside writes its own move
      if (this.reading !== null) { if (this.lastReading !== null) { const e = this.lastReading * 10 + this.reading; this.T[e] += P.ALPHA * (1 - this.T[e]); } this.lastReading = this.reading; } }
    if (this.cfg.record) { for (const [k, v] of this.rec) this.rec.set(k, v * (1 - P.DECAY));
      for (const [a, b] of this.route) for (const k of relations(a, b)) { const v = this.rec.get(k) ?? 0; this.rec.set(k, v + (1 - v) / 8); } }
    if (this.cfg.refrain) { const d2 = 1 - Math.LN2 / P.HL2; for (const mm of [this.M, this.N]) for (const [k, v] of mm) mm.set(k, v * d2);
      let home = false; const was = this.dwell >= P.DWELL;
      for (const h of this.route) { if (this.prevHop && this.prevHop[1] === h[0]) { const ks = motifsM(this.prevHop, h); home = this.terrM.some(([k]) => ks.includes(k));
          for (const k of ks) { const v = this.M.get(k) ?? 0; this.M.set(k, v + (1 - v) / 8); }
          { const k = motifN(this.prevHop, h), v = this.N.get(k) ?? 0; this.N.set(k, v + (1 - v) / 8); } }
        this.prevHop = h; }
      if (this.route.length) this.atHome = home;
      this.dwell = this.atHome ? this.dwell + 1 : 0; if (!was && this.dwell >= P.DWELL) this.flights++;
      this.terrM = top2(this.M); }
    this.stay = to === from ? this.stay + 1 : 0; for (const [, b] of this.route) this.visits[b]++;
    const act = Array.from({ length: 10 }, (_, z) => Number(zs[z].activation));
    for (let i = 0; i < 10; i++) this.m[i] += P.RHO * (act[i] - this.m[i]);
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) this.c[i][j] += P.RHO * ((act[i] - this.m[i]) * (act[j] - this.m[j]) - this.c[i][j]);
    if (this.cfg.desire) this.synthesis(t, this.reading ?? -1, gates, rt.getCurrentZone());
    return this.cfg.desire ? this.emptyBwO(gates) : null;
  }

  private reach(gates: NumogramGate[], f: number) { return new Set(gates.filter(g => g.isOpen && g.source === f).map(g => g.target)); }
  private chooseTarget(rule: Rule, cur: number, named: number, gates: NumogramGate[]): number | null {
    const have = this.reach(gates, cur), free = [...Array(10).keys()].filter(z => z !== cur && !have.has(z) && !(this.cfg.warpGuard && WARPZ.has(z) && !WARPZ.has(cur))); if (!free.length) return null;
    if (rule === 'hebb') return free.reduce((b, z) => (this.c[cur][z] > this.c[cur][b] ? z : b), free[0]);
    if (rule === 'named') return free.includes(named) ? named : null;
    if (rule === 'novel') return free.reduce((b, z) => (this.visits[z] < this.visits[b] ? z : b), free[0]);
    if (rule === 'trace') { const z = free.reduce((b, y) => (this.T[cur * 10 + y] > this.T[cur * 10 + b] ? y : b), free[0]); return this.T[cur * 10 + z] > 0 ? z : null; }
    return free[Math.floor(this.mut() * free.length)];
  }
  private synthesis(t: number, named: number, gates: NumogramGate[], cur: number) {
    for (const [a, b] of this.route) for (const [id, x] of this.born) if (x.src === a && x.tgt === b) { x.uses.push(t);
      if (x.integrated) { const g = gates.find(y => y.id === id); if (g) g.flux = Math.min(P.FLUX_MAX, g.flux + P.CONSOLIDATE); } }
    if (this.cfg.dissolve) { const k = 1 - Math.LN2 / (this.cfg.hld ?? D2.HLD);   // DESIRE-2: kept connections fade, use renews them, below FLOOR they dissolve
      for (const [id, x] of this.born) if (x.integrated) { const i = gates.findIndex(g => g.id === id); if (i < 0) continue; gates[i].flux *= k;
        if (this.cfg.traceRenew) { const g = gates[i], m = this.T[x.src * 10 + x.tgt]; if (m >= D3.TMIN) g.flux += D3.RENEW * m * (1 - g.flux); }   // DESIRE-3
        if (gates[i].flux < D2.FLOOR) { gates.splice(i, 1); this.born.delete(id); this.log.dissolved.push({ t, rule: x.rule }); } } }
    for (const [id, x] of this.born) if (!x.integrated && t - x.birth >= P.TRIAL) {   // the trial
      const held = x.uses.length >= P.USES;
      if (held) { x.integrated = true; this.log.held.push({ t, rule: x.rule }); }
      else { const k = gates.findIndex(g => g.id === id); if (k >= 0) gates.splice(k, 1); this.born.delete(id); this.log.pruned.push({ t, rule: x.rule }); }
      this.w[x.rule] *= Math.exp(P.LR * (held ? 1 : -1)); this.gamma = Math.min(P.GAMMA_MAX, Math.max(P.GAMMA_MIN, this.gamma * Math.exp(P.GLR * (held ? 1 : -1))));
    }
    if (this.mut() < this.gamma) { const tot = RULES.reduce((u, r) => u + this.w[r], 0); let u = this.mut() * tot, rule: Rule = RULES[RULES.length - 1];
      for (const r of RULES) { if ((u -= this.w[r]) <= 0) { rule = r; break; } }
      const z = this.chooseTarget(rule, cur, named, gates);
      if (z !== null) { const mean = (f: 'flux' | 'permeability' | 'resistance') => gates.reduce((s, g) => s + g[f], 0) / gates.length, id = `desire-${this.nid++}-${cur}-${z}`;
        gates.push({ id, source: cur as any, target: z as any, label: `Desire ${cur}->${z} (${rule})`, flux: mean('flux'), permeability: mean('permeability'), isOpen: true, resistance: mean('resistance') });
        this.born.set(id, { birth: t, uses: [], rule, src: cur, tgt: z, integrated: false }); this.log.births.push({ t, rule }); } }
  }
  private emptyBwO(gates: NumogramGate[]): string | null { if (this.stay >= P.FREEZE) return 'frozen';
    const fl = gates.filter(g => g.isOpen).map(g => g.flux), mu = fl.reduce((u, v) => u + v, 0) / fl.length;
    if (Math.sqrt(fl.reduce((u, v) => u + (v - mu) ** 2, 0) / fl.length) < P.SD_MIN) return 'homogenised'; if (fl.length >= P.SAT) return 'saturated'; return null; }

  hers(): string { return JSON.stringify({ born: [...this.born], w: this.w, gamma: this.gamma, visits: this.visits, m: this.m, c: this.c, stay: this.stay, nid: this.nid } satisfies Hers); }
  restoreHers(s: string) { const o: Hers = JSON.parse(s); this.born = new Map(o.born); Object.assign(this, { w: o.w, gamma: o.gamma, visits: o.visits, m: o.m, c: o.c, stay: o.stay, nid: o.nid }); }
  /** The motor's size in her exported state (the place and hers), in characters of JSON. */
  size(): number { return this.hers().length + JSON.stringify({ T: this.T, rec: [...this.rec], M: [...this.M], N: [...this.N] }).length; }
}
