import { createHash, createHmac, randomInt } from 'node:crypto';
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { AmeliaNumogramSubstrateRuntime } from '../../src/substrate/ameliaNumogramSubstrateRuntime.ts';
import { CANONICAL_GATES, INITIAL_ZONES } from '../../src/ai/numogram/AmeliaQabbalaInterface.ts';

const baseDir = new URL('.', import.meta.url);
const seedBytes = Buffer.from(readFileSync(new URL('./input-seed.txt', baseDir), 'utf8').trim(), 'hex');
if (seedBytes.length !== 32) throw new Error('invalid frozen input seed');
const tapes = Array.from({ length: 512 }, (_, pair) =>
  Array.from({ length: 30 }, (_, step) =>
    'ow1-input-' + createHmac('sha256', seedBytes).update(pair + ':' + step).digest().subarray(0, 16).toString('hex')
  )
);
const inputBytes = Buffer.from(JSON.stringify(tapes));
const sourceCommit = '0c4b7c63b29a13eea3d556b5e02aa7bd87a545f3';
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const mergeBase = execFileSync('git', ['merge-base', sourceCommit, head], { encoding: 'utf8' }).trim();
if (mergeBase !== sourceCommit) throw new Error('pinned core commit is not the study branch base');
const sourceDiff = execFileSync('git', ['diff', '--name-only', sourceCommit, '--', 'src/'], { encoding: 'utf8' }).trim();
if (sourceDiff) throw new Error('source core differs from pinned commit');
const key = g => String(g.source) + '>' + String(g.target);
const ingress = ['2>3', '5>6'];
for (const edge of ingress) if (!CANONICAL_GATES.some(g => key(g) === edge)) throw new Error('missing ingress ' + edge);
const warpOffGates = CANONICAL_GATES.filter(g => !ingress.includes(key(g)));

function reachesWarp(gates) {
  const seen = new Set([0]), q = [0];
  while (q.length) {
    const at = q.shift();
    for (const g of gates) if (g.source === at && !seen.has(g.target)) {
      seen.add(g.target);
      q.push(g.target);
    }
  }
  return seen.has(3) || seen.has(6);
}
if (!reachesWarp(CANONICAL_GATES) || reachesWarp(warpOffGates)) throw new Error('condition reachability check failed');

const lineZones = [1, 2, 4, 8, 7, 5];
const initialActivation = lineZones.map(z => INITIAL_ZONES[z].activation);
function runArm(gates, tape) {
  const runtime = new AmeliaNumogramSubstrateRuntime();
  runtime.getQabbala().setGates(gates);
  const trace = [];
  let response = null;
  for (let i = 0; i < 30; i++) {
    const snap = runtime.step(tape[i]);
    const activations = lineZones.map(z => snap.zones[z].activation);
    trace.push({
      step: i + 1,
      inputToken: tape[i],
      from: snap.lastTransition.from,
      to: snap.lastTransition.to,
      transitionDigest: snap.lastTransition.digest,
      lineActivations: activations,
      memoryHistoryLength: snap.memoryHistoryLength,
      memoryHeadDigest: snap.memoryHeadDigest
    });
    if (i === 29) response = activations.map((a, j) => a >= initialActivation[j] ? 1 : 0).join('');
  }
  return { response, trace, warpVisited: trace.some(x => [3, 6].includes(x.from) || [3, 6].includes(x.to)) };
}

// Pre-run determinism audit on a fixed target-independent tape.
for (const [name, gates] of [['on', CANONICAL_GATES], ['off', warpOffGates]]) {
  const first = runArm(gates, tapes[0]);
  const replay = runArm(gates, tapes[0]);
  if (JSON.stringify(first) !== JSON.stringify(replay)) throw new Error(name + ' replay mismatch');
}

const records = [];
for (let pair = 0; pair < 512; pair++) {
  const order = randomInt(2) === 0 ? ['on', 'off'] : ['off', 'on'];
  const arms = {};
  for (const arm of order) arms[arm] = runArm(arm === 'on' ? CANONICAL_GATES : warpOffGates, tapes[pair]);
  records.push({ pair, order, arms });
  if ((pair + 1) % 32 === 0) console.log('completed ' + (pair + 1) + '/512 pairs');
}
const bytes = Buffer.from(records.map(x => JSON.stringify(x)).join('\n') + '\n');
const outputPath = new URL('./outputs.jsonl', baseDir);
const tempPath = new URL('./outputs.jsonl.tmp', baseDir);
writeFileSync(tempPath, bytes, { mode: 0o444 });
renameSync(tempPath, outputPath);
const outputSha256 = createHash('sha256').update(bytes).digest('hex');
const manifest = {
  schema: 'ORANGE_WARP1_RUN_MANIFEST_V1',
  sourceCommit,
  studyCommit: head,
  nPairs: 512,
  stepsPerArm: 30,
  inputSeedSha256: createHash('sha256').update(seedBytes).digest('hex'),
  inputTapesSha256: createHash('sha256').update(inputBytes).digest('hex'),
  responseMap: 'zones=[1,2,4,8,7,5], bit=finalActivation>=INITIAL_ZONES.activation after 30 steps',
  warpOffRemovedEdges: ingress,
  outputSha256
};
const manifestBytes = Buffer.from(JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(new URL('./completion-manifest.json', baseDir), manifestBytes, { mode: 0o444 });
console.log(JSON.stringify({ nPairs: records.length, outputSha256, manifestSha256: createHash('sha256').update(manifestBytes).digest('hex') }));
