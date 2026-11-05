/** Independently open every private session checkpoint and validate its stored state. */
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { bornAmelia } from '../../src/core/fullNumogram';
import { captureLiveField, restoreLiveField } from '../../src/outside/LiveFieldLoop';
import { getLiveSourceSession } from '../../src/outside/LiveSyntheticSourceSession';
import { canonicalJson } from '../../src/substrate/AmeliaMorphogeneticSubstrate';

const dir = process.argv[2];
if (!dir) throw Error('Supply the completed private run directory');
const rows = readFileSync(dir + '/trace.jsonl', 'utf8').trim().split('\n').map(line => JSON.parse(line));
let checked = 0;
for (const arm of ['live', 'shuffled', 'uniform', 'ordinary']) for (const time of [20, 55]) {
  const capsule = JSON.parse(gunzipSync(readFileSync(`${dir}/checkpoints/${arm}-t${time}.json.gz`)).toString('utf8'));
  const runtime = bornAmelia();
  runtime.importState(capsule.runtimeState);
  const body = restoreLiveField(capsule.field, runtime);
  const row = rows.find(r => r.arm === arm && r.time === time);
  assert.equal(captureLiveField(body, false).checksum, capsule.field.checksum);
  assert.equal(runtime.getMemory().exportHistoryDigest(), row.memoryHead);
  assert.equal(runtime.getSnapshots().at(-1)?.step, 50 + time);
  assert.equal(body.stepCount, 49 + time);
  const source = getLiveSourceSession(body);
  assert.ok(source);
  assert.equal(source.enabled, arm !== 'ordinary' && time === 20);
  assert.equal(source.sourceState.step, arm === 'ordinary' ? 0 : Math.min(time, 40));
  if (arm !== 'ordinary') {
    const lastSource = rows.find(r => r.arm === arm && r.time === Math.min(time, 40)).source.after;
    assert.equal(canonicalJson(source.sourceState), canonicalJson(lastSource));
  }
  checked++;
}
console.log(JSON.stringify({ status: 'PASS', independentlyRestoredCheckpoints: checked }));
