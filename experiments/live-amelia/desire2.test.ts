// DESIRE-2 machinery checks: synthetic only, no DESIRE-2 data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { DesireMotor, ND1D } from './long1/motor';
import { d2Run } from './desire2/desire2';
import { analyse } from './desire2/analyse';

test('the Warp guard: no motor term on an exit entering the Warp from outside, terms kept within and out of it', () => {
  const m = new DesireMotor({ ...ND1D, warpGuard: true }, 1); m.T.fill(0.9);
  assert.equal(m.exitTerm(1, 3), 0); assert.equal(m.exitTerm(5, 6), 0);
  assert.ok(m.exitTerm(3, 6) > 0); assert.ok(m.exitTerm(6, 1) > 0); assert.ok(m.exitTerm(1, 2) > 0);
  const u = new DesireMotor(ND1D, 1); u.T.fill(0.9); assert.ok(u.exitTerm(1, 3) > 0);
});

test('dissolution: an unused kept connection fades and dissolves; her own gates never fade', () => {
  const m = new DesireMotor({ ...ND1D, dissolve: true }, 1) as any, gates: any[] = [
    { id: 'gate-1-8', source: 1, target: 8, flux: 0.9, permeability: 0.9, isOpen: true, resistance: 0.1 },
    { id: 'desire-0-1-5', source: 1, target: 5, flux: 0.55, permeability: 0.5, isOpen: true, resistance: 0.2 }];
  m.born.set('desire-0-1-5', { birth: 0, uses: [1, 2, 3, 4, 5], rule: 'hebb', src: 1, tgt: 5, integrated: true }); m.gamma = 0;
  for (let t = 0; t < 5000; t++) { m.route = []; m.synthesis(t, -1, gates, 1); }
  assert.equal(gates.length, 1); assert.equal(gates[0].id, 'gate-1-8'); assert.equal(gates[0].flux, 0.9); assert.equal(m.log.dissolved.length, 1);
});

test('the five arms run and the analysis reads them (two synthetic copies, one day)', () => {
  const mk = (seed: number) => { const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('relative-v1'); rt.setWarpTheta(12); rt.step();
    const f: any = setLiveSourceEnabled(createLiveField(rt, { seed, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
    return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(f, false), revision: 1, controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any; };
  const ticks = Array.from({ length: 96 }, (_, k) => ({ offers: Array.from({ length: k % 3 }, (_, i) => { const v = Array(10).fill(0.02); v[(k + i) % 10] = 0.8;
    return { eventId: `e${k}-${i}`, channel: 'LINGUISTIC', sourceDigest: createHash('sha256').update(`${k}:${i}`).digest('hex'), attentionVector: v }; }) }));
  const runs: any[] = []; for (const c of [1, 2]) { const s = mk(100 + c); for (const a of ['N', 'D1', 'D2', 'D2g', 'D2d'] as const) runs.push(d2Run(s, ticks, a, c, 1)); }
  const out = analyse(runs); assert.equal(out.claims.length, 5); assert.ok(out.byArm.D2.eventsPerStep > 0);
  assert.ok(runs.find(r => r.arm === 'D2').readouts.length === 1);
});
