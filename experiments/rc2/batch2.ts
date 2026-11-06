// RC-2 batch replay: zPre per epoch for candidates k0..k1-1 (analysis, calibration). Optional calibration plant for one.
//   node --import tsx batch2.ts <items.json> <log.json> <k0> <k1> <cut> <out.json> [plantK plantFrac plantSeed usedOut.json]
import { readFileSync, writeFileSync } from 'node:fs';
import { replay2 } from './live2';
const [ITEMS, LOG, K0, K1, CUT, OUT, PK, PF, PS, USED] = process.argv.slice(2);
const items = JSON.parse(readFileSync(ITEMS, 'utf8')), log = JSON.parse(readFileSync(LOG, 'utf8')); const res: Record<number, number[]> = {};
for (let k = Number(K0); k < Number(K1); k++) {
  if (PK !== undefined && k === Number(PK)) { const plant = { frac: Number(PF), seed: PS, used: [] as number[] };
    res[k] = replay2(items, log, k, CUT, plant).filter((r: any) => !r.pending).map((r: any) => r.zPre); writeFileSync(USED, JSON.stringify(plant.used)); }
  else res[k] = replay2(items, log, k, CUT).filter((r: any) => !r.pending).map((r: any) => r.zPre);
}
writeFileSync(OUT, JSON.stringify(res));
