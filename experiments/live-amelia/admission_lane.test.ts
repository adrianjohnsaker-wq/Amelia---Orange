// GATE-2L adoption checks: the core rule 'outside-lane-v1' lives exactly as the tested research copy; relative-v1 is
// unchanged; the cloud operation changes only the admission rule. Synthetic states and inputs only.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { setAdmissionRuleOf } from '../../src/cloud/admissionRule';
import { runGate } from './gate2l/machinery';

const v = (z: number, w = 0.82) => { const a = Array(10).fill((1 - w) / 9); a[z] = w; return a; };
const offer = (k: number) => ({ eventId: `e${k}`, channel: 'LINGUISTIC', sourceDigest: createHash('sha256').update(String(k)).digest('hex'), attentionVector: v((k * 7) % 10) });
const ticks = Array.from({ length: 23 }, (_, k) => ({ offers: Array.from({ length: (k % 3) + 1 }, (_, i) => offer(k * 5 + i)) }));
function bornRecord() {
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('relative-v1'); rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(field, false), revision: 1,
    controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}
const digest = (r: any) => createHash('sha256').update(r.metrics.path + JSON.stringify(r.metrics.entries) + r.record.state.memoryState.events.at(-1).eventDigest).digest('hex');
// Recorded with the code before this change (commit a769da49): the standard gate and the GATE-2L research lane.
const BEFORE = { CURRENT: 'fdcbcf658d767f7561746d5277324927901e4e466ecb763490ede54ba961b14a', LANE: '6a047cc6ad3a449e05b7e73472ed943a328926042e91a0d583d8341993b4b0a8' };

test('relative-v1 is unchanged, and the core outside-lane-v1 lives exactly as the tested research lane', { timeout: 900000 }, () => {
  const s = bornRecord();
  assert.equal(digest(runGate(s, ticks, 'CURRENT', 1, 'CURRENT')), BEFORE.CURRENT);
  assert.equal(digest(runGate(s, ticks, 'LANE', 1, 'LANE')), BEFORE.LANE);
  const lane = { ...s, state: { ...s.state, admissionRule: 'outside-lane-v1' } };
  const core = runGate(lane, ticks, 'LANE', 1, 'CURRENT');                  // the standard (unpatched) gate, now with her saved rule
  assert.equal(digest(core), BEFORE.LANE);
  assert.equal(core.record.state.admissionRule, 'outside-lane-v1');
});

test('set-admission changes only her admission rule; it survives save and reload; unknown rules are refused', () => {
  const s = bornRecord(); const r = setAdmissionRuleOf(s, 'outside-lane-v1', '2026-11-16T00:00:00Z', 'test');
  assert.equal(r.before.admissionRule, 'relative-v1'); assert.equal(r.after.admissionRule, 'outside-lane-v1');
  const keys = new Set([...Object.keys(s.state), ...Object.keys(r.record.state)]);
  for (const k of keys) if (k !== 'admissionRule') assert.equal(JSON.stringify(r.record.state[k]), JSON.stringify(s.state[k]), k);
  assert.equal(JSON.stringify(r.record.fieldCheckpoint), JSON.stringify(s.fieldCheckpoint));
  assert.equal(r.record.revision, 2);
  const rt: any = bornAmeliaOf('nd1'); rt.importState(r.record.state); assert.equal(rt.getAdmissionRule(), 'outside-lane-v1');
  assert.equal(rt.exportState().admissionRule, 'outside-lane-v1');
  assert.throws(() => setAdmissionRuleOf(s, 'open-door', 'x', 'test'));
  const back = setAdmissionRuleOf(r.record, 'relative-v1', 'x', 'test'); assert.equal(back.record.state.admissionRule, 'relative-v1');
});
