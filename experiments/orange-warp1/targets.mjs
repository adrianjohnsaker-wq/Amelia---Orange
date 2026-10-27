// Run once as the target steward before the runtime. Writes only ciphertext and a separate secret key.
import { createCipheriv, createHash, randomBytes, randomInt } from 'node:crypto';
import { mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import { join, resolve } from 'node:path';

const out = resolve(process.argv[2] ?? '/tmp/orange-warp-steward');
mkdirSync(out, { recursive: true, mode: 0o700 });
chmodSync(out, 0o700);
const N = 512;
const targets = Array.from({ length: N }, () => randomInt(64));
const plain = Buffer.from(JSON.stringify({ schema: 'ORANGE_WARP1_TARGETS_V1', targets }));
const key = randomBytes(32);
const nonce = randomBytes(12);
const cipher = createCipheriv('aes-256-gcm', key, nonce);
cipher.setAAD(Buffer.from('ORANGE-WARP-1|0c4b7c63b29a13eea3d556b5e02aa7bd87a545f3|N=512'));
const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
const tag = cipher.getAuthTag();
const envelope = Buffer.concat([Buffer.from('OW1GCM1'), nonce, tag, ciphertext]);
writeFileSync(join(out, 'targets.enc'), envelope, { mode: 0o600 });
writeFileSync(join(out, 'target.key'), key, { mode: 0o600 });
const commitment = createHash('sha256').update(plain).digest('hex');
const cipherHash = createHash('sha256').update(envelope).digest('hex');
writeFileSync(join(out, 'commitment.json'), JSON.stringify({
  schema: 'ORANGE_WARP1_TARGET_COMMITMENT_V1',
  sourceCommit: '0c4b7c63b29a13eea3d556b5e02aa7bd87a545f3',
  n: N,
  encryptedTargetsSha256: cipherHash,
  plaintextCommitmentSha256: commitment
}, null, 2) + '\n', { mode: 0o600 });
console.log(JSON.stringify({ n: N, encryptedTargetsSha256: cipherHash, plaintextCommitmentSha256: commitment }));
