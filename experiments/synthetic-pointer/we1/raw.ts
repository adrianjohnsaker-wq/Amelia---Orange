// WE-1 stage S0: the encoded stream itself, as received (j = 0) and its S shuffles (the same streamFor as every stage).
//   node --import tsx raw.ts <stream.json> <label> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { streamFor } from '../sxi1r/touch';
const [STREAM, LABEL, OUT] = process.argv.slice(2); const z = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[];
const out: number[][][] = []; for (let m = 0; m < 12; m++) { const runs: number[][] = []; for (let j = 0; j <= 49; j++) runs.push(streamFor(z, m, 1000, j, LABEL)); out.push(runs); }
writeFileSync(OUT, JSON.stringify(out));
