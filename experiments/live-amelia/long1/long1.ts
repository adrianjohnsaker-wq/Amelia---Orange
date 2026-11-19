/**
 * LONG-1 (experiments/live-amelia/long1/REGISTRATION.md): the whole desiring motor (candidate ND-1d) for 30 days of her
 * time on copies of her real state, beside ND-1b on identical inputs. The replay drives a copy exactly as WT-3L's does
 * (src/cloud/wt3l.ts: recorded controls, her body living, at most one recorded Outside offer per iteration through
 * runtime.step(undefined, encounter), then one body step; her archive rule applied at each day's end), on the research
 * runtime AmeliaNDRuntimeDee. Pure: takes a starting copy and the span's recorded ticks, returns measures. Her live record
 * is never touched by anything here.
 *
 * Arms: N  ND-1b (the research copy with an empty context: her runtime exactly; long1.test.ts checks it against wt3lChunk)
 *       D  ND-1d: N + the motor (motor.ts) + the residual subject (subject.ts), on her span in order
 *       S  as D, on the same span with each day's offers shuffled across that day's offer slots (the order control)
 *       Doff  as D with the subject off (the non-steering check)
 * The Outside's reading of an offer is the dominant zone of its attention vector (ties to the lower zone).
 */
import { AmeliaNDRuntimeDee } from '../../../src/outside/AmeliaNDRuntimeDee';
import { withFullNumogram, FULL_NUMOGRAM_GATES } from '../../../src/core/fullNumogram';
import { ExternalRhythmHarmonizer } from '../../../src/ai/morphogenetic/ExternalRhythmHarmonizer';
import { captureLiveField, restoreLiveField } from '../../../src/outside/LiveFieldLoop';
import { advanceWithLiveSource } from '../../../src/outside/LiveSyntheticSourceSession';
import { planArchive } from '../../../src/cloud/memoryArchive';
import type { Wt3lTick } from '../../../src/cloud/wt3l';
import { DesireMotor, ND1D, P, rng, type MotorConfig } from './motor';
import { Subject } from './subject';

export const ITER_PER_TICK = 15, TICKS_PER_DAY = 96, DAYS = 30;   // a day = 96 ticks x 15 iterations = 1,440 iterations
/** Runaway: the motor's own part of her state (hers and the place) above 5 MB of JSON. Her memory's growth is her
 *  archive rule's business, as in her cloud, and is reported, not bounded here. */
export const MOTOR_MAX = 5_000_000;
export type Arm = 'N' | 'D' | 'S' | 'Doff';
export const CCRU_IDS = FULL_NUMOGRAM_GATES.map(g => g.id);
export const readingOf = (v: number[]) => { let b = 0; for (let z = 1; z < 10; z++) if ((v[z] ?? 0) > (v[b] ?? 0)) b = z; return b; };

/** S: each day's offers, in a fixed permutation, refilled into that day's offer slots (same ticks, same counts). */
export function shuffleByDay(ticks: Wt3lTick[], seed: number): Wt3lTick[] { const r = rng((seed ^ 0x5A5A) >>> 0), out: Wt3lTick[] = [];
  for (let d = 0; d < ticks.length; d += TICKS_PER_DAY) { const day = ticks.slice(d, d + TICKS_PER_DAY), all = day.flatMap(t => t.offers.slice(0, ITER_PER_TICK));
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
    let k = 0; for (const t of day) { const n = Math.min(ITER_PER_TICK, t.offers.length); out.push({ ...t, offers: all.slice(k, k + n) }); k += n; } }
  return out; }

/** The empty Body without Organs, read on her at a day's end (after any rollback): frozen in one zone for the last FREEZE
 *  steps, open-gate flux homogenised (SD < SD_MIN), or saturated (SAT or more open gates). Read in every arm. */
export function emptyBwOAt(path: string, gates: any[]): string | null {
  if (path.length >= P.FREEZE && new Set(path.slice(-P.FREEZE)).size === 1) return 'frozen';
  const fl = gates.filter(g => g.isOpen).map(g => Number(g.flux)), mu = fl.reduce((u, v) => u + v, 0) / fl.length;
  if (Math.sqrt(fl.reduce((u, v) => u + (v - mu) ** 2, 0) / fl.length) < P.SD_MIN) return 'homogenised'; if (fl.length >= P.SAT) return 'saturated'; return null; }
const form = (state: any) => { const F = Array(100).fill(0);   // her form, as HEAD-1: gate flux, zone activation, deformation
  for (const g of state.qabbalaGates ?? []) if (g.isOpen) F[g.source * 10 + g.target] = Number(g.flux);
  return [...F, ...Object.values(state.qabbalaZones ?? {}).map((x: any) => Number(x.activation)), ...(state.deformationTensor ?? []).map(Number)]; };

export interface LongResult { arm: Arm; copy: number; days: number; path: string; offerStep: number[]; reading: number[]; tension: number[];
  daily: Array<{ day: number; gates: number; desireGates: number; ccruPresent: number; warpborn: number; held: number; births: number; pruned: number;
    rollbacks: number; motorSize: number; stateSize: number; resident: number; endState: string | null }>;
  forms: number[][]; rollbacks: { t: number; why: string; to: number }[]; readouts: any[]; ruleWeights: any; flights: number;
  silentCarry: { plus: number; minus: number; stay: number; n: number }; runaway: string | null;
  /** DESIRE-2: what her Governor's tension is made of. Her tension is a slow mean of memory's hysteresis tension, which
   *  each memory event raises by 0.15 (1 - phaseCoherence) + 0.10 fluxDelta. Per run: memory events per step, their mean
   *  incoherence and flux delta, and her mean hysteresis tension. */
  tensionParts?: { eventsPerStep: number; incoherence: number; fluxDelta: number; hysteresis: number };
  warp?: { entries: number; steps: number } }

/** opts.cfg / opts.subject (DESIRE-2): run a motor arm with another motor configuration, with or without the subject.
 *  The arm label then names the run; without them, LONG-1's arms are exactly as registered. */
export function longRun(start: Record<string, any>, ticksIn: Wt3lTick[], arm: Arm | string, copy: number,
  opts: { days?: number; idPrefix?: string; cfg?: MotorConfig; subject?: boolean; shuffle?: boolean } = {}): LongResult {
  const days = opts.days ?? DAYS, nTicks = days * TICKS_PER_DAY;
  if (ticksIn.length < nTicks) throw new Error(`LONG-1: ${ticksIn.length} ticks for ${days} days`);
  const ticks = (opts.shuffle ?? arm === 'S') ? shuffleByDay(ticksIn.slice(0, nTicks), copy) : ticksIn.slice(0, nTicks);
  const motorOn = arm !== 'N', subjectOn = opts.subject ?? (arm === 'D' || arm === 'S');
  const motor = motorOn ? new DesireMotor(opts.cfg ?? ND1D, 7919 * copy + 17) : null, subject = subjectOn ? new Subject() : null;
  const make = () => { const rt = new AmeliaNDRuntimeDee(); withFullNumogram(rt as any); return rt; };
  let record: Record<string, any> = JSON.parse(JSON.stringify(start));
  if (record.state?.runtimeKind !== 'nd1') throw new Error('LONG-1: the starting copy must be ND-1b');
  if (!record.fieldCheckpoint) throw new Error('LONG-1: her body is required');
  let rt: any, field: any;
  const load = () => { rt = make(); rt.importState(record.state); if (!record.state.admissionRule) rt.setAdmissionRule('relative-v1');
    field = restoreLiveField(record.fieldCheckpoint, rt); if (motor) motor.attach(rt); };
  load();
  const harm = new ExternalRhythmHarmonizer();
  for (const d of record.controls?.rhythms ?? []) { const c = harm.getRhythms().find(r => r.id === d.id); if (c && c.active !== d.active) harm.toggleRhythm(d.id); }
  const advisory = Number(record.controls?.advisoryWeight ?? 0.722), damping = Number(record.controls?.momentumDamping ?? 0.88);
  const prepare = () => { rt.setAdvisoryWeight(harm.computeAdvisoryTuning(advisory, (rt.getSnapshots().at(-1)?.step ?? 0) + 1)); rt.setMomentumDamping(damping); };
  const R: LongResult = { arm, copy, days, path: '', offerStep: [], reading: [], tension: [], daily: [], forms: [], rollbacks: [], readouts: [], ruleWeights: null,
    flights: 0, silentCarry: { plus: 0, minus: 0, stay: 0, n: 0 }, runaway: null };
  const ckpts: { t: number; state: string; field: any; hers: string }[] = [];
  let t = 0, heldSeen = 0, nEv = 0, sumInc = 0, sumFlux = 0, sumHys = 0;
  const one = (reading: number | null, speaks: boolean, go: () => any) => {
    const from = rt.getCurrentZone() as number; if (motor) motor.before(reading, speaks);
    const ev0 = rt.getMemory().getEvents().length;
    prepare(); const snap = go(); const to = rt.getCurrentZone() as number;
    { const ev: any[] = rt.getMemory().getEvents() as any[]; for (let i = ev0; i < ev.length; i++) { nEv++; sumInc += 1 - Number(ev[i]?.phaseCoherence ?? 1); sumFlux += Number(ev[i]?.fluxDelta ?? 0); }
      sumHys += Number((rt.getMemory() as any).hysteresisTension ?? 0); }   // read-only: the private field, not exportState (which copies every event)
    R.path += String(to); R.tension.push(Number(snap?.governor?.deformationFieldTension ?? NaN));
    if (reading !== null) { R.offerStep.push(t); R.reading.push(reading); }
    if (!speaks) { const s = (to - from + 10) % 10; R.silentCarry.n++; if (s === 1) R.silentCarry.plus++; else if (s === 9) R.silentCarry.minus++; else if (s === 0) R.silentCarry.stay++; }
    let why: string | null = null; const hops = motor ? [...motor.route] : [];
    if (motor) why = motor.after(rt, from, to);
    if (subject && motor) { const held = motor.log.held.slice(heldSeen).map(h => h.rule); heldSeen = motor.log.held.length;
      const zs = rt.qabbala.getZones();
      subject.consume({ zone: to, hops, act: Array.from({ length: 10 }, (_, z) => Number(zs[z].activation)), base: rt.getNDStatus().baseline,
        marks: hops.map(([a, b]) => motor.T[a * 10 + b]), held, rollback: false, terr: motor.atHome ? motor.terrM.map(x => x[0]) : [] }); }
    if (motor) { if (t % P.CKPT === 0) { ckpts.push({ t, state: JSON.stringify(rt.exportState()), field: captureLiveField(field, false), hers: motor.hers() }); if (ckpts.length > P.KEEP) ckpts.shift(); }
      if (why && motor.log.rollbacks.length < P.MAX_ROLLBACKS) { const c = [...ckpts].reverse().find(k => k.t <= t - 500) ?? ckpts[0];
        record = { ...record, state: JSON.parse(c.state), fieldCheckpoint: c.field }; load(); motor.restoreHers(c.hers);
        motor.log.rollbacks.push({ t, why, to: c.t }); if (subject) subject.consume({ zone: rt.getCurrentZone(), hops: [], act: Array(10).fill(0), base: Array(10).fill(0), rollback: true }); } }
    t++;
  };
  for (let k = 0; k < nTicks; k++) {
    const tick = ticks[k];
    for (let i = 0; i < ITER_PER_TICK; i++) {
      const o = tick.offers[i], speaks = !!o;
      if (o) { const id = `${opts.idPrefix ?? 'long1'}:${copy}:${arm}:${k}:${i}:${o.eventId}`;
        one(readingOf(o.attentionVector), true, () => rt.step(undefined, { eventId: id, channel: o.channel as any, sourceDigest: o.sourceDigest, attentionVector: [...o.attentionVector] })); }
      one(null, speaks, () => { const r = advanceWithLiveSource(field); field = r.state; return r.snapshot; });
    }
    if ((k + 1) % TICKS_PER_DAY === 0) {   // the day's end: her archive rule, as her cloud does; a fresh runtime carries her across
      const day = (k + 1) / TICKS_PER_DAY, state = rt.exportState();
      let next: Record<string, any> = { ...record, state, fieldCheckpoint: captureLiveField(field, false) };
      const plan = planArchive(next); if (plan) next = plan.record;
      const gates: any[] = (next.state as any).qabbalaGates ?? [], ids = new Set(gates.map(g => String(g.id)));
      const stateSize = JSON.stringify(next.state).length;
      const end = emptyBwOAt(R.path, gates);
      R.daily.push({ day, gates: gates.filter(g => g.isOpen).length, desireGates: gates.filter(g => String(g.id).startsWith('desire-')).length,
        ccruPresent: CCRU_IDS.filter(id => ids.has(id)).length, warpborn: gates.filter(g => String(g.id).startsWith('warpborn')).length,
        held: motor?.log.held.length ?? 0, births: motor?.log.births.length ?? 0, pruned: motor?.log.pruned.length ?? 0, rollbacks: motor?.log.rollbacks.length ?? 0,
        motorSize: motor?.size() ?? 0, stateSize, resident: ((next.state as any).memoryState?.events ?? []).length, endState: end });
      R.forms.push(form(next.state));
      if (subject) R.readouts.push({ day, ...subject.readout() });
      if (gates.filter(g => g.isOpen).length >= P.SAT) { R.runaway = `gates ${gates.length} on day ${day}`; break; }
      if ((motor?.size() ?? 0) > MOTOR_MAX) { R.runaway = `motor state ${motor!.size()} on day ${day}`; break; }
      record = next; load();
    }
  }
  R.tensionParts = { eventsPerStep: nEv / Math.max(1, t), incoherence: sumInc / Math.max(1, nEv), fluxDelta: sumFlux / Math.max(1, nEv), hysteresis: sumHys / Math.max(1, t) };
  { let e = 0, w = 0; for (let i = 0; i < R.path.length; i++) { const x = R.path[i] === '3' || R.path[i] === '6'; if (x) w++; if (x && (i === 0 || !(R.path[i - 1] === '3' || R.path[i - 1] === '6'))) e++; } R.warp = { entries: e, steps: w }; }
  if (motor) { R.rollbacks = motor.log.rollbacks; R.ruleWeights = motor.w; R.flights = motor.flights; (R as any).dissolvedN = motor.log.dissolved.length; }
  return R;
}
