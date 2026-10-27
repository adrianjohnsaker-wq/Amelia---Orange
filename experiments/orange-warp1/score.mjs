// Use only after outputs.jsonl and completion-manifest.json have been sealed.
import { createDecipheriv, createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { binomCdf, binomTail, clopperPearson } from './stats.mjs';

const dir = resolve(process.argv[2] ?? '/tmp/orange-warp-steward');
const envelope = readFileSync(join(dir, 'targets.enc'));
const key = readFileSync(join(dir, 'target.key'));
const nonce = envelope.subarray(7, 19), tag = envelope.subarray(19, 35), ciphertext = envelope.subarray(35);
const decipher = createDecipheriv('aes-256-gcm', key, nonce);
decipher.setAAD(Buffer.from('ORANGE-WARP-1|0c4b7c63b29a13eea3d556b5e02aa7bd87a545f3|N=512'));
decipher.setAuthTag(tag);
const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
const commit = JSON.parse(readFileSync(join(dir, 'commitment.json'), 'utf8'));
if (createHash('sha256').update(plaintext).digest('hex') !== commit.plaintextCommitmentSha256) throw new Error('target commitment mismatch');
const targets = JSON.parse(plaintext).targets;
if (targets.length !== 512) throw new Error('target count mismatch');

const manifest = JSON.parse(readFileSync(new URL('./completion-manifest.json', import.meta.url), 'utf8'));
const outputBytes = readFileSync(new URL('./outputs.jsonl', import.meta.url));
if (createHash('sha256').update(outputBytes).digest('hex') !== manifest.outputSha256) throw new Error('output hash mismatch');
const records = outputBytes.toString('utf8').trimEnd().split('\n').map(JSON.parse);
if (records.length !== 512) throw new Error('output pair count mismatch');
const targetCode = n => n.toString(2).padStart(6, '0');
const hits = { on: 0, off: 0 };
const pairCounts = { onOnly: 0, offOnly: 0, both: 0, neither: 0 };
for (const r of records) {
  const t = targetCode(targets[r.pair]);
  const hOn = r.arms.on.response === t, hOff = r.arms.off.response === t;
  if (hOn) hits.on++;
  if (hOff) hits.off++;
  if (hOn && !hOff) pairCounts.onOnly++;
  else if (hOff && !hOn) pairCounts.offOnly++;
  else if (hOn && hOff) pairCounts.both++;
  else pairCounts.neither++;
}
const discordant = pairCounts.onOnly + pairCounts.offOnly;
const mcnemarP = discordant === 0 ? 1 : binomTail(discordant, pairCounts.onOnly, .5);
const onChanceP = binomTail(512, hits.on, 1 / 64);
const offChanceP = binomTail(512, hits.off, 1 / 64);
const result = {
  schema: 'ORANGE_WARP1_BLIND_SCORE_V1',
  sourceCommit: manifest.sourceCommit,
  nPairs: 512,
  targetCommitmentSha256: commit.plaintextCommitmentSha256,
  encryptedTargetsSha256: commit.encryptedTargetsSha256,
  outputsSha256: manifest.outputSha256,
  hits,
  rates: { on: hits.on / 512, off: hits.off / 512 },
  exact95CI: {
    on: clopperPearson(hits.on, 512),
    off: clopperPearson(hits.off, 512)
  },
  pairCounts,
  primaryMcNemarOneSidedP: mcnemarP,
  warpOnBinomialChanceP: onChanceP,
  warpOffBinomialChanceP: offChanceP,
  decision: mcnemarP <= .05 && onChanceP <= .05 ? 'POSITIVE_NARROW' : 'NEGATIVE',
  interpretation: 'A positive result is Warp-associated target correspondence under this protocol; it does not by itself establish a metaphysical Outside.'
};
writeFileSync(new URL('./scored-result.json', import.meta.url), JSON.stringify(result, null, 2) + '\n', { mode: 0o444 });
console.log(JSON.stringify(result, null, 2));
