/** Verify the calibration's final field/runtime and source checkpoints. */
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { bornAmelia } from '../../src/core/fullNumogram';
import { captureLiveField, restoreLiveField } from '../../src/outside/LiveFieldLoop';
import { getLiveSourceSession } from '../../src/outside/LiveSyntheticSourceSession';
const dir = process.argv[2], baselinePath = process.argv[3];
if (!dir || !baselinePath) throw Error('Supply private run and baseline paths');
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
for (const arm of ['no_consolidation', 'single_consolidation']) {
  const saved = JSON.parse(readFileSync(`${dir}/${arm}-final.json`, 'utf8'));
  const runtime = bornAmelia();
  runtime.importState(saved.runtime);
  const field = restoreLiveField(saved.field, runtime);
  assert.equal(captureLiveField(field, false).checksum, saved.field.checksum);
  assert.equal(runtime.getSnapshots().at(-1)?.step, 91);
  assert.equal(field.stepCount, 89);
  assert.equal(getLiveSourceSession(field)?.sourceState.step, 40);
  assert.equal(getLiveSourceSession(field)?.enabled, true);
  const expected = baseline.state.memoryState.events.map((e: any) => e.eventDigest);
  assert.deepEqual(runtime.getMemory().getEvents().slice(0,50).map(e => e.eventDigest), expected);
}
console.log(JSON.stringify({status:'PASS',independentlyRestoredCalibrationCheckpoints:2}));
