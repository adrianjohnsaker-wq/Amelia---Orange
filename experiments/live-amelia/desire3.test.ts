// DESIRE-3 machinery checks: synthetic only, no DESIRE-3 data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { DesireMotor, ND1D } from './long1/motor';
import { d3Run, CFG } from './desire3/desire3';
import { analyse } from './desire3/analyse';

const kept = () => [{ id: 'gate-1-8', source: 1, target: 8, flux: 0.9, permeability: 0.9, isOpen: true, resistance: 0.1 },
  { id: 'desire-0-1-5', source: 1, target: 5, flux: 0.55, permeability: 0.5, isOpen: true, resistance: 0.2 }] as any[];
const run = (cfg: any, steps: number, mark: number) => { const m = new DesireMotor(cfg, 1) as any, gates = kept();
  m.born.set('desire-0-1-5', { birth: 0, uses: [1, 2, 3, 4, 5], rule: 'hebb', src: 1, tgt: 5, integrated: true }); m.gamma = 0;
  for (let t = 0; t < steps; t++) { m.T[15] = mark; m.route = []; m.synthesis(t, -1, gates, 1); } return gates; };

test('the half-life sets how long an unused connection lives', () => {
  assert.equal(run(CFG.D2, 5000, 0).length, 1);                        // 1,000 steps: gone within 5,000
  assert.equal(run(CFG.H3, 5000, 0).length, 2);                        // 3,000 steps: still there at 5,000
  assert.equal(run(CFG.H3, 15000, 0).length, 1);                       // and gone by 15,000
  assert.equal(run(CFG.H10, 15000, 0).length, 2);                      // 10,000 steps: still there at 15,000
  assert.equal(run(CFG.D2g, 50000, 0).length, 2);                      // the guard alone: never fades
});
test('renewal by the trace: only at or above the threshold', () => {
  assert.equal(run(CFG.D3, 20000, 0.2).length, 2);                     // the Outside keeps passing: it stays
  assert.equal(run(CFG.D3, 5000, 0.04).length, 1);                     // below 0.05: it fades as D2
});
test('the six arms run and the analysis judges four candidates (two synthetic copies, one day)', () => {
  const mk = (seed: number) => { const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('relative-v1'); rt.setWarpTheta(12); rt.step();
    const f: any = setLiveSourceEnabled(createLiveField(rt, { seed, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
    return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(f, false), revision: 1, controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any; };
  const ticks = Array.from({ length: 96 }, (_, k) => ({ offers: Array.from({ length: k % 3 }, (_, i) => { const v = Array(10).fill(0.02); v[(k + i) % 10] = 0.8;
    return { eventId: `e${k}-${i}`, channel: 'LINGUISTIC', sourceDigest: createHash('sha256').update(`${k}:${i}`).digest('hex'), attentionVector: v }; }) }));
  const runs: any[] = []; for (const c of [1, 2]) { const s = mk(100 + c); for (const a of ['N', 'D2g', 'H10', 'H3', 'D2', 'D3'] as const) runs.push(d3Run(s, ticks, a, c, 1)); }
  const out = analyse(runs); assert.deepEqual(Object.keys(out.candidates), ['H10', 'H3', 'D3', 'D2']);
  for (const c of Object.values(out.candidates) as any[]) assert.equal(c.claims.length, 6);
});
