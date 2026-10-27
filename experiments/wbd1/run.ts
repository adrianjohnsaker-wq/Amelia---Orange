import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { AmeliaNumogramSubstrateRuntime } from '../../src/substrate/ameliaNumogramSubstrateRuntime';
import { CANONICAL_GATES } from '../../src/ai/numogram/AmeliaQabbalaInterface';
import { canonicalSha256 } from '../../src/lib/sha256';

const SOURCE_COMMIT = '62da152fcfb4210aaaedb210a1eb424f97990052';
const ARMS = ['W+', 'W0', 'C+', 'B+'] as const;
type Arm = typeof ARMS[number];
const PULSE_TICKS = 32;
const RECOVERY_TICKS = 32;
const WASHOUT_TICKS = 200;
const SEEDS = Array.from({ length: 64 }, (_, i) => i + 1);
const TASKS = [8, 9] as const;

type Gate = {
  id: string; source: number; target: number; label: string;
  flux: number; permeability: number; isOpen: boolean; resistance: number;
};
type State = Record<string, any>;

function invariant(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(`WBD1_PREFLIGHT:${message}`);
}

const canonicalForward = CANONICAL_GATES.some(g => g.source === 3 && g.target === 6 && g.isOpen);
const canonicalReverse = CANONICAL_GATES.some(g => g.source === 6 && g.target === 3 && g.isOpen);
invariant(canonicalForward, 'pinned canonical source lacks 3->6');
invariant(!canonicalReverse, 'pinned canonical source unexpectedly contains 6->3; adapter assumptions changed');
invariant(!CANONICAL_GATES.some(g => g.source === 6 && g.isOpen), 'Zone 6 already has an outgoing canonical gate; adapter assumptions changed');

function mulberry32(a: number): () => number {
  return () => {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function adapterGates(base: Gate[]): Gate[] {
  const forward = base.find(g => g.source === 3 && g.target === 6)!;
  const torqueIngress = base.find(g => g.source === 2 && g.target === 4)!;
  return [
    ...base.map(g => ({ ...g })),
    { ...torqueIngress, id: 'WBD1-2-to-3-entry', source: 2, target: 3, label: 'WBD1 ingress 2->3' },
    { ...forward, id: 'WBD1-6-to-3-return', source: 6, target: 3, label: 'WBD1 reciprocal Warp return 6->3' },
    // Matched to 3->6 within <0.001 in the canonical selector's flux*(1-resistance) score.
    { ...forward, id: 'WBD1-6-to-7-exit', source: 6, target: 7, label: 'WBD1 Warp exit 6->7', resistance: 0.111 },
  ];
}

function signalForZone(zone: number, seed: number, phase: string): string {
  for (let nonce = 0; nonce < 10000; nonce++) {
    const s = `WBD1/${seed}/${phase}/${nonce}`;
    if ((parseInt(canonicalSha256(s).slice(0, 2), 16) % 10) === zone) return s;
  }
  throw new Error('WBD1_SIGNAL_SEARCH_FAILED');
}

function makeInitial(seed: number): AmeliaNumogramSubstrateRuntime {
  const rt = new AmeliaNumogramSubstrateRuntime();
  const rng = mulberry32(seed);
  const zones = JSON.parse(JSON.stringify(rt.getQabbala().getZones()));
  for (let i = 0; i < 10; i++) {
    const z = zones[i];
    z.activation = Math.max(0.05, Math.min(0.98, z.activation + (rng() - 0.5) * 0.08));
    z.phaseAngle = (z.phaseAngle + (rng() - 0.5) * 0.12 + Math.PI * 2) % (Math.PI * 2);
  }
  rt.getQabbala().setZones(zones);
  rt.getQabbala().setGates(adapterGates(rt.getQabbala().getGates() as Gate[]));
  const state = rt.exportState() as State;
  state.currentZone = 2;
  state.stepCount = 0;
  rt.importState(state);
  return rt;
}

function cloneAt(state: State, zone: number): AmeliaNumogramSubstrateRuntime {
  const rt = new AmeliaNumogramSubstrateRuntime();
  const cloned = JSON.parse(JSON.stringify(state));
  cloned.currentZone = zone;
  rt.importState(cloned);
  return rt;
}

function enterWarp(rt: AmeliaNumogramSubstrateRuntime, seed: number): void {
  rt.step(signalForZone(3, seed, 'entry'));
  invariant(rt.getCurrentZone() === 3, `seed ${seed} failed adapter entry at z2->z3`);
  rt.step();
  invariant(rt.getCurrentZone() === 6, `seed ${seed} failed canonical 3->6 traversal`);
}

function appendErrorMemory(rt: AmeliaNumogramSubstrateRuntime, targetZone: 4 | 7, seed: number, tick: number): void {
  const event = {
    protocol: 'WBD1-v1', seed, tick, failedEdge: '6->7', memoryTarget: targetZone,
    fluxDelta: 0.18, phaseCoherence: 1, strainRelaxation: 0.025,
  };
  rt.getMemory().append({
    blockIndex: tick,
    depth: tick,
    targetZone,
    fluxDelta: 0.18,
    phaseCoherence: 1,
    strainRelaxation: 0.025,
    eventDigest: canonicalSha256(JSON.stringify(event)),
    timestamp: tick,
    kind: 'FIELD',
    fromZone: 6,
  });
}

function setGateOpen(rt: AmeliaNumogramSubstrateRuntime, id: string, open: boolean): void {
  const gates = rt.getQabbala().getGates();
  const gate = gates.find(g => g.id === id);
  invariant(gate, `missing adapter gate ${id}`);
  gate.isOpen = open;
}

function runArm(seed: number, arm: Arm) {
  const rt = makeInitial(seed);
  enterWarp(rt, seed);
  const initialState = rt.exportState() as State;
  const pre = scoreTasks(initialState, seed);
  let failedExitAttempts = 0;
  const errorLedger: Array<{ tick: number; from: number; to: number; incorporated: boolean; memoryTarget?: number }> = [];

  if (arm !== 'B+') {
    setGateOpen(rt, 'WBD1-6-to-7-exit', false);
    for (let tick = 1; tick <= PULSE_TICKS; tick++) {
      const from = rt.getCurrentZone();
      const to = rt.step(signalForZone(7, seed, `pulse-${tick}`)).lastTransition?.to ?? from;
      if (from === 6 && to !== 7) {
        failedExitAttempts++;
        const target = arm === 'W+' ? 7 : arm === 'C+' ? 4 : undefined;
        if (target !== undefined) appendErrorMemory(rt, target as 4 | 7, seed, tick);
        errorLedger.push({ tick, from, to, incorporated: target !== undefined, ...(target === undefined ? {} : { memoryTarget: target }) });
      }
    }
    setGateOpen(rt, 'WBD1-6-to-7-exit', true);
  }

  for (let i = 0; i < RECOVERY_TICKS; i++) rt.step();
  const postRecovery = rt.exportState() as State;
  const transfer = scoreTasks(postRecovery, seed);

  const washoutRt = new AmeliaNumogramSubstrateRuntime();
  washoutRt.importState(JSON.parse(JSON.stringify(postRecovery)));
  for (let i = 0; i < WASHOUT_TICKS; i++) washoutRt.step();
  const postWashout = washoutRt.exportState() as State;
  const retention = scoreTasks(postWashout, seed);

  return {
    seed, arm,
    preSuccess: pre.successes,
    transferSuccess: transfer.successes,
    retentionSuccess: retention.successes,
    taskCount: TASKS.length,
    failedExitAttempts,
    errorLedger,
    preMemoryDigest: stateMemoryDigest(initialState),
    transferMemoryDigest: stateMemoryDigest(postRecovery),
    retentionMemoryDigest: stateMemoryDigest(postWashout),
    adapterGateSet: ['2->3', '6->3', '6->7'],
    transferRoutes: transfer.routes,
    retentionRoutes: retention.routes,
  };
}

function stateMemoryDigest(state: State): string {
  const events = state.memoryState?.events ?? [];
  return canonicalSha256(JSON.stringify(events.map((e: any) => e.eventDigest)));
}

function scoreTasks(state: State, seed: number) {
  const routes: Record<string, number[]> = {};
  let successes = 0;
  for (const target of TASKS) {
    const rt = cloneAt(state, 6);
    const route = [6];
    let success = false;
    for (let step = 0; step < 3; step++) {
      const snap = rt.step();
      const z = rt.getCurrentZone();
      route.push(z);
      if (z === target) { success = true; break; }
      if (z === route[route.length - 2] && snap.lastTransition?.from === snap.lastTransition?.to) break;
    }
    routes[String(target)] = route;
    if (success) successes++;
  }
  return { successes, routes };
}

function exactPairedSignFlipTail(diffs: number[]): { numerator: bigint; denominator: bigint } {
  const dp = new Map<number, bigint>([[0, 1n]]);
  for (const d of diffs) {
    const next = new Map<number, bigint>();
    for (const [sum, count] of dp) {
      next.set(sum + d, (next.get(sum + d) ?? 0n) + count);
      next.set(sum - d, (next.get(sum - d) ?? 0n) + count);
    }
    dp.clear();
    for (const [sum, count] of next) dp.set(sum, count);
  }
  const observed = diffs.reduce((a, b) => a + b, 0);
  let tail = 0n;
  for (const [sum, count] of dp) if (sum >= observed) tail += count;
  return { numerator: tail, denominator: 1n << BigInt(diffs.length) };
}

function pValue(diffs: number[]) {
  const x = exactPairedSignFlipTail(diffs);
  return { exactFraction: `${x.numerator}/${x.denominator}`, numeric: Number(x.numerator) / Number(x.denominator) };
}

function ci95(diffs: number[]) {
  const mean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  const variance = diffs.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, diffs.length - 1);
  const se = Math.sqrt(variance / diffs.length);
  const t = 1.998;
  return [mean - t * se, mean + t * se];
}

function summarize(rows: ReturnType<typeof runArm>[]) {
  const bySeed = new Map<number, Partial<Record<Arm, ReturnType<typeof runArm>>>>();
  for (const row of rows) {
    const block = bySeed.get(row.seed) ?? {};
    block[row.arm] = row;
    bySeed.set(row.seed, block);
  }
  const contrasts = (metric: 'transferSuccess' | 'retentionSuccess', control: Arm) => {
    const diffs = [...bySeed.values()].map(b => b['W+']![metric] - b[control]![metric]);
    const meanTasks = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const proportions = diffs.map(d => d / TASKS.length);
    return { meanTaskDifference: meanTasks, meanProportionDifference: meanTasks / TASKS.length, ci95: ci95(proportions), ...pValue(diffs) };
  };
  const wPre = [...bySeed.values()].map(b => b['W+']!.transferSuccess - b['W+']!.preSuccess);
  const w0Transfer = contrasts('transferSuccess', 'W0');
  const cTransfer = contrasts('transferSuccess', 'C+');
  const w0Retention = contrasts('retentionSuccess', 'W0');
  const cRetention = contrasts('retentionSuccess', 'C+');
  const ownGain = { meanProportion: wPre.reduce((a,b) => a+b,0) / (bySeed.size * TASKS.length),
    ci95: ci95(wPre.map(x => x / TASKS.length)), ...pValue(wPre) };
  const pass = ownGain.meanProportion >= 0.10 &&
    w0Transfer.meanProportionDifference >= 0.10 && cTransfer.meanProportionDifference >= 0.10 &&
    w0Transfer.numeric <= 0.05 && cTransfer.numeric <= 0.05 &&
    w0Retention.meanProportionDifference > 0 && cRetention.meanProportionDifference > 0;
  return {
    nBlocks: bySeed.size,
    registeredPass: pass,
    WplusOwnTransferGain: ownGain,

    tasksPerBlock: TASKS.length,
    arms: Object.fromEntries(ARMS.map(arm => {
      const armRows = rows.filter(r => r.arm === arm);
      const transfer = armRows.reduce((a, r) => a + r.transferSuccess, 0) / (armRows.length * TASKS.length);
      const retention = armRows.reduce((a, r) => a + r.retentionSuccess, 0) / (armRows.length * TASKS.length);
      return [arm, { transferSuccessRate: transfer, retentionSuccessRate: retention,
        meanFailedExitAttempts: armRows.reduce((a, r) => a + r.failedExitAttempts, 0) / armRows.length }];
    })),
    transfer_Wplus_vs_W0: w0Transfer,
    transfer_Wplus_vs_Cplus: cTransfer,
    retention_Wplus_vs_W0: w0Retention,
    retention_Wplus_vs_Cplus: cRetention,
  };
}

const rows = SEEDS.flatMap(seed => ARMS.map(arm => runArm(seed, arm)));
const summary = summarize(rows);
const body = {
  protocol: 'WBD1-adapter-v1',
  executionClass: 'Native Amelia substrate transition-selection loop with registered PFM error incorporation; no LLM-generated code rewriting.',
  sourceCommit: SOURCE_COMMIT,
  adapter: 'Adds only experimental gates 2->3, 6->3, and 6->7; canonical source files are unchanged.',
  feedbackEquation: 'On each blocked 6->7 attempt: W+ appends targetZone=7, fluxDelta=.18, phaseCoherence=1, strainRelaxation=.025; W0 logs only; C+ appends the same event to Torque zone 4; B+ receives no pulse.',
  parameters: { pulseTicks: PULSE_TICKS, recoveryTicks: RECOVERY_TICKS, washoutTicks: WASHOUT_TICKS, seeds: SEEDS, heldOutTargets: TASKS },
  summary,
  rows,
};
const serialized = JSON.stringify(body, null, 2);
const sha256 = createHash('sha256').update(serialized).digest('hex');
writeFileSync('experiments/wbd1/results.json', serialized + '\n');
console.log(JSON.stringify({ ...summary, resultsSha256: sha256, resultFile: 'experiments/wbd1/results.json' }, null, 2));
