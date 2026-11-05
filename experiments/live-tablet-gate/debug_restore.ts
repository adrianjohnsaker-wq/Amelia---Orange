/** Inspect the retained failed checkpoint without advancing it. */
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { bornAmelia } from '../../src/core/fullNumogram';
import { captureLiveField, restoreLiveField } from '../../src/outside/LiveFieldLoop';
import { getLiveSourceSession } from '../../src/outside/LiveSyntheticSourceSession';
import { canonicalJson } from '../../src/substrate/AmeliaMorphogeneticSubstrate';

const folder = process.argv[2];
if (!folder) throw Error('Supply the private failed-run directory');
const capsule = JSON.parse(gunzipSync(readFileSync(folder + '/checkpoints/live-t20.json.gz')).toString('utf8'));
const rows = readFileSync(folder + '/trace.jsonl', 'utf8').trim().split('\n').map(line => JSON.parse(line));
const last = rows.at(-1);
const runtime = bornAmelia();
runtime.importState(capsule.runtimeState);
const field = restoreLiveField(capsule.field, runtime);
const session = getLiveSourceSession(field);
console.log(JSON.stringify({rows:rows.length, fieldChecksumMatches:captureLiveField(field,false).checksum===capsule.field.checksum,
  memoryHeadMatches:runtime.getMemory().exportHistoryDigest()===last.memoryHead,
  sourceEnabled:session?.enabled, restoredSource:session?.sourceState, traceSource:last.source?.after,
  rawObjectComparisonMatches:JSON.stringify(session?.sourceState)===JSON.stringify(last.source?.after),
  canonicalComparisonMatches:canonicalJson(session?.sourceState)===canonicalJson(last.source?.after)},null,2));
