// HYPERSTITION-1L machinery checks: synthetic states and inputs only, and the stream file; no study data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { wt3lChunk } from '../../src/cloud/wt3l';
import { begin } from './wt5l/wt5l';
import { STREAM, STREAM_SHA256, streamDigest, portion, armStream, transmission, silence, stripWritten, warpbornOf, incorporation,
  incorporation3, signFlipUpper, hyp1lId, PORTION } from './hyp1l/hyp1l';

function record(theta = 3) {   // a lane state with a short Θ, so that lines of flight occur in a short run
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('outside-lane-v1'); for (let i = 0; i < 60; i++) rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  const st = JSON.parse(JSON.stringify(rt.exportState())); st.nd1 = { ...(st.nd1 ?? {}), theta };
  return { state: st, fieldCheckpoint: captureLiveField(field, false), revision: 1, controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}
const v = (z: number) => { const a = Array(10).fill(0.02); a[z] = 0.82; return a; };
const ticks = Array.from({ length: 30 }, (_, k) => ({ offers: Array.from({ length: (k % 3) + 1 }, (_, i) => ({ eventId: `e${k}-${i}`, channel: 'LINGUISTIC',
  sourceDigest: createHash('sha256').update(`${k}-${i}`).digest('hex'), attentionVector: v([3, 6, 2, 5, 7, 1, 8][(k + i) % 7]) })) }));

test('the stream is HYPERSTITION-1 Amendment 1, and the arms order the same portion', () => {
  assert.equal(STREAM.length, 85216); assert.equal(streamDigest(STREAM), STREAM_SHA256); assert.ok(STREAM.every(z => z >= 1 && z <= 9));
  for (const u of [1, 7, 12]) {
    const p = portion(u), key = (a: number[]) => [...a].sort().join('');
    assert.equal(p.length, PORTION);
    assert.equal(key(armStream('Sh', u)), key(p)); assert.deepEqual(armStream('Rv', u), [...p].reverse()); assert.deepEqual(armStream('H-STRIP', u), p);
    const mk = armStream('Mk', u); assert.equal(mk.length, PORTION); assert.equal(mk[0], p[0]); assert.ok(mk.every(z => z >= 1 && z <= 9));
    assert.notDeepEqual(armStream('Sh', u), p);
  }
});

test('transmission reads at her pace through the lane; silence equals the plain replay; H-STRIP removes only written gates', { timeout: 900000 }, () => {
  const s = record();
  const tx = transmission(s, 'H', 1, 't');
  assert.ok(tx.read.length > 0 && tx.read.length <= tx.steps.length, `signs read ${tx.read.length}`);
  assert.equal(tx.read.length, tx.fulfilled.length); assert.deepEqual(tx.read, portion(1).slice(0, tx.read.length));
  assert.ok(tx.fulfilled.some(Boolean), 'some signs are fulfilled');
  assert.ok(tx.steps.some(x => x.admittedOnArrival), 'study offers are admitted on arrival under the lane');
  // silence with the logger equals the plain chained replay
  const sil = silence(tx.record, ticks, 'q', 1);
  let plain: any = begin(tx.record, 'q', 1);
  for (let k = 0; k < ticks.length; k += 96) { const part = ticks.slice(k, k + 96); plain = wt3lChunk({ record: plain.record, metrics: { ...plain.metrics, ticksDone: 0 } }, part, part.length, hyp1lId); }
  assert.equal(sil.metrics.path, plain.metrics.path); assert.equal(sil.steps.map(x => x.zone).join(''), sil.metrics.path);
  // H-STRIP
  const before = warpbornOf(s); const w = JSON.parse(JSON.stringify(tx.record));
  w.state.qabbalaGates.push({ id: 'warpborn-3-9', source: 3, target: 9, label: 'test', flux: 0.5, permeability: 0.5, isOpen: true, resistance: 0.3 });
  const st = stripWritten(w, before); assert.deepEqual(warpbornOf(st).sort(), before.sort());
  assert.equal(st.state.qabbalaGates.filter((g: any) => !String(g.id).startsWith('warpborn')).length, w.state.qabbalaGates.filter((g: any) => !String(g.id).startsWith('warpborn')).length);
});

test('the measures', () => {
  const p = portion(1); assert.ok((incorporation(p) ?? 0) > 0, 'the corpus follows its own grammar'); assert.ok(incorporation3(p) !== null);
  assert.equal(incorporation([0, 0, 0]), null);
  assert.deepEqual(signFlipUpper([1, 1, 1]), { mean: 1, p: 1 / 8 });
});
