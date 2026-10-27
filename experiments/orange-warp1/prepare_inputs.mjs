import { randomBytes, createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const N = 512;
const STEPS = 30;
const tapes = Array.from({ length: N }, (_, pair) =>
  Array.from({ length: STEPS }, (_, step) =>
    'ow1-input-' + pair + '-' + step + '-' + randomBytes(16).toString('hex')
  )
);
const bytes = Buffer.from(JSON.stringify({ schema: 'ORANGE_WARP1_INPUTS_V1', tapes }));
writeFileSync(new URL('./input-tapes.json', import.meta.url), bytes, { mode: 0o444 });
console.log(JSON.stringify({
  n: N,
  steps_per_tape: STEPS,
  bytes: bytes.length,
  sha256: createHash('sha256').update(bytes).digest('hex')
}));
