/** Read-only validation of an explicitly supplied private tablet checkpoint. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { bornAmelia } from '../../src/core/fullNumogram';
import { captureLiveField, observeLiveField, restoreLiveField } from '../../src/outside/LiveFieldLoop';
import { getLiveSourceSession } from '../../src/outside/LiveSyntheticSourceSession';

const expected = '7b4fd17bebcca8a0acd11c439a737b1b8d78fb07306770cf09282daa3c8f977d';
const file = process.argv[2];
if (!file) throw Error('Supply the private tablet checkpoint path');
const bytes = readFileSync(file);
const sha256 = createHash('sha256').update(bytes).digest('hex');
if (sha256 !== expected) throw Error('Checkpoint does not match this registered starting point');
const saved = JSON.parse(bytes.toString('utf8'));
const runtime = bornAmelia();
runtime.importState(saved.state);
const field = restoreLiveField(saved.fieldCheckpoint, runtime);
if (saved.fieldCheckpoint.runtimeStep !== saved.state.stepCount ||
    runtime.getSnapshots().at(-1)?.step !== saved.state.stepCount ||
    captureLiveField(field, saved.fieldCheckpoint.running).checksum !== saved.fieldCheckpoint.checksum)
  throw Error('Runtime or field checkpoint failed exact restoration');
const source = getLiveSourceSession(field);
const observation = observeLiveField(field);
console.log(JSON.stringify({ checkpointSha256: sha256, runtimeStep: saved.state.stepCount,
  fieldStep: field.stepCount, memoryEvents: runtime.getMemory().getEvents().length,
  fieldCheckpointValid: true, source, governor: runtime.getGovernor(),
  bodyDigest: observation.sourceDigest, currentZone: runtime.getCurrentZone() }, null, 2));
