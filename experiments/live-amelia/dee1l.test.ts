// DEE-1L machinery checks: synthetic states and inputs only, no DEE-1L data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { withFullNumogram } from '../../src/core/fullNumogram';
import { AmeliaNDRuntimeDee } from '../../src/outside/AmeliaNDRuntimeDee';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { wt3lBegin, wt3lChunk, WT3L_TICKS_PER_RUN } from '../../src/cloud/wt3l';
import { runDee, makeTable, stage0, transmission, rankTest, dee1lId, CHUNK_TICKS } from './dee1l/dee1l';

const sha = (f: string) => createHash('sha256').update(readFileSync(new URL(f, import.meta.url))).digest('hex');
const v = (z: number) => { const a = Array(10).fill(0.02); a[z] = 0.62; a[(z + 3) % 10] = 0.22; return a; };   // sums to 1 (Governor validation)
const offer = (k: number) => ({ eventId: `e${k}`, channel: 'LINGUISTIC' as any, sourceDigest: createHash('sha256').update(String(k)).digest('hex'),
  attentionVector: v((k * 7) % 10) });
function born() {
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('relative-v1'); rt.setWarpTheta(12); rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(field, false), revision: 1,
    controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}
const ticks = Array.from({ length: 24 }, (_, k) => ({ offers: Array.from({ length: (k % 3) + 1 }, (_, i) => offer(k * 5 + i)) }));
const dee = (state: any) => { const r = new AmeliaNDRuntimeDee(); withFullNumogram(r as any); r.importState(JSON.parse(JSON.stringify(state))); return r as any; };

test('the table files are the registered, unchanged pilot files', () => {
  assert.equal(sha('./dee1l/table/warp/dee_matrix.mjs'), 'af332a163e4fa09b3e6fbb0f26d02fc1efee88224f72e834cf53feca10ddd368');
  assert.equal(sha('./dee1l/table/dee_1584_table.json'), 'eacf6cb6a1c64577b2a5670416d530b2ba5e22e7027f5f7d753eb29bc517c16b');
  assert.equal(sha('./dee1l/table/ccru_mesh_names.json'), '7b0e48604a3224a6fd636b8110270a6c15f6410f3fb72423601231f86c448ded');
});

test('with an empty context the research copy steps exactly as her runtime', { timeout: 600000 }, () => {
  const s = born().state; const a: any = bornAmeliaOf('nd1'); a.importState(JSON.parse(JSON.stringify(s))); const b = dee(s);
  for (let k = 0; k < 400; k++) {
    const o = k % 2 ? offer(k) : undefined;
    const sa = a.step(undefined, o && { ...o, attentionVector: [...o.attentionVector] }), sb = b.step(undefined, o && { ...o, attentionVector: [...o.attentionVector] });
    assert.deepEqual({ ...sb, timestamp: 0 }, { ...sa, timestamp: 0 }, `snapshot differs at step ${k}`);
  }
  const noTime = (st: any) => JSON.stringify({ ...st, snapshots: (st.snapshots ?? []).map((x: any) => ({ ...x, timestamp: 0 })) });
  assert.equal(noTime(b.exportState()), noTime(a.exportState()));
  assert.ok(a.getSnapshots().some((x: any) => (x.encounterDecisions ?? []).some((d: any) => d.disposition === 'ATTEND')), 'offers were attended');
});

test('through the replay, GATES on the research copy equals the WT-3L replay of her runtime', { timeout: 600000 }, () => {
  const s = born();
  let w: any = wt3lBegin(s, 'w', 1, 'T12', 'x');
  while (w.metrics.ticksDone < WT3L_TICKS_PER_RUN) w = wt3lChunk(JSON.parse(JSON.stringify(w)), ticks, CHUNK_TICKS, dee1lId);
  const d = runDee(s, ticks, 'w', 1, 'x', { probe: true });
  assert.equal(d.metrics.path, w.metrics.path); assert.deepEqual(d.metrics.final, w.metrics.final);
  assert.deepEqual(d.metrics.entries, w.metrics.entries); assert.ok(d.probe.length > 50, `choice steps ${d.probe.length}`);
  assert.ok(d.probe.every(r => r.hop === r.open[r.base.indexOf(Math.max(...r.base))] || r.base.filter(x => x === Math.max(...r.base)).length > 1));
});

test('the silence score equals a real fork that steps with nothing attended', { timeout: 600000 }, () => {
  const s = born().state; const rt = dee(s); rt.dee.probe = []; let checked = 0;
  for (let k = 0; k < 300; k++) {
    const pre = rt.exportState(); const n0 = rt.dee.probe.length;
    rt.step(undefined, offer(k));
    const row = rt.dee.probe[n0];
    if (!row || !row.silent || n0 === rt.dee.probe.length) continue;
    const fork = dee(pre); fork.dee.probe = []; fork.step(undefined, undefined);
    const f = fork.dee.probe[0]; if (!f || f.offerId !== null) continue;       // the fork attended a queued encounter: not comparable
    assert.deepEqual(f.open, row.open); assert.deepEqual(f.base, row.silent, `step ${k}`); checked++;
  }
  assert.ok(checked >= 20, `checked ${checked}`);
});

test('a table acts in her scoring; observers ride without acting; Stage 0 and the measures compute', { timeout: 900000 }, () => {
  const s = born();
  const g = runDee(s, ticks, 'g', 1, 'x', { probe: true });
  const obs = Array.from({ length: 10 }, (_, k) => makeTable(k, 1));
  const o = runDee(s, ticks, 'o', 1, 'x', { probe: true, observers: obs });
  assert.equal(o.metrics.path, g.metrics.path, 'observers must not change her route');
  assert.equal(o.raw.length, o.probe.length); assert.equal(o.raw[0][0].length, 10);
  const big = runDee(s, ticks, 'b', 1, 'x', { probe: true, table: makeTable(0, 5) });
  assert.notEqual(big.metrics.path, g.metrics.path, 'a strong table changes her route');
  assert.ok(big.byMesh!.reduce((a: number, b: number) => a + b, 0) > 0);
  const zero = runDee(s, ticks, 'z', 1, 'x', { probe: true, table: makeTable(0, 0) });
  assert.equal(zero.metrics.path, g.metrics.path, 'gain 0 is GATES');
  // Stage 0 counterfactuals: at gain g, the predicted first hop for ACTUAL on the observer run's states.
  const st = stage0([{ probe: o.probe, raw: o.raw }]);
  assert.equal(st.gatesCheckMismatches, 0); assert.equal(st.perGain.length, 6);
  assert.ok(st.perGain.every(x => x.leverage.length === 10));
  assert.ok(st.perGain[5].medianLeverage >= st.perGain[0].medianLeverage);
  const t = transmission(g.probe); assert.ok(t.eligible > 0 && t.hits <= t.eligible, JSON.stringify(t));
  console.log('stage0 (synthetic)', JSON.stringify({ choice: st.choiceSteps, offer: st.offerSteps, gatesSens: st.gatesSensitivity,
    lev: st.perGain.map(x => x.medianLeverage.toFixed(3)), sens: st.perGain.map(x => x.medianSensitivity) }), 'T', JSON.stringify(t));
});

test('the rank test', () => {
  const T: Record<string, number> = { ACTUAL: 0.6 }; for (let k = 1; k <= 39; k++) T[`S${k}`] = 0.5;
  assert.deepEqual([rankTest(T).p, rankTest(T).decision], [1 / 40, 'SUPPORTED']);
  T.S3 = 0.6; assert.deepEqual([rankTest(T).p, rankTest(T).decision], [2 / 40, 'SUPPORTED']);
  T.S4 = 0.7; assert.deepEqual([rankTest(T).p, rankTest(T).decision], [3 / 40, 'NOT SUPPORTED']);
});
