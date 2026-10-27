import { randomBytes, createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const N = 512;
const STEPS = 30;
const seed = randomBytes(32);
const bytes = Buffer.from(seed.toString('hex') + '\n');
writeFileSync(new URL('./input-seed.txt', import.meta.url), bytes, { mode: 0o444 });
console.log(JSON.stringify({
  n: N,
  steps_per_tape: STEPS,
  seedSha256: createHash('sha256').update(seed).digest('hex')
}));
