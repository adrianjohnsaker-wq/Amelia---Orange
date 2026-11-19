/**
 * LONG-1 runner (experiments/live-amelia/long1/REGISTRATION.md) for GitHub Actions, off her database's live path, as
 * WT-3L Amendment 2. Reads only the study table amelia_long1_runs: the starting copy `start-cNN` (record) and its span
 * `inputs-cNN` (metrics.ticks: the recorded offers of each tick for 30 days, 2,880 ticks), both written by the
 * cloud-home session (HANDOVER.md). Writes only rows of that table. Her live record and archive are never read or written.
 *   MODE=copy  COPY=n   one copy: (copy 1) the determinism pair; arms N, D, S (copies 1 and 2 also Doff); rows cNN-ARM
 *   MODE=pilot          copies 1 and 2, 3 days, every arm; rows pilot-cNN-ARM; prints a summary
 *   MODE=analysis       reads all cNN-ARM rows, runs the registered analysis, writes the row `analysis` and RESULT.json
 */
import { writeFileSync } from 'node:fs';
import { longRun, DAYS, TICKS_PER_DAY, type Arm, type LongResult } from './long1';
import { analyse } from './analyse';

const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY, TABLE = 'amelia_long1_runs';
const H = () => { if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }; };
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
async function get(path: string) {
  for (let a = 1; ; a++) { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H() }); if (r.ok) return r.json();
    if (r.status < 500 || a >= 6) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); await wait(15000 * a); } }
async function put(rows: any[]) {
  for (let a = 1; ; a++) { const r = await fetch(`${URL_}/rest/v1/${TABLE}?on_conflict=id`, { method: 'POST',
    headers: { ...H(), Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (r.ok) return;
    if (r.status < 500 || a >= 6) throw new Error(`save: ${r.status}`); await wait(15000 * a); } }
const pad = (n: number) => String(n).padStart(2, '0');
const row = (id: string, unit: number | null, arm: string | null, metrics: any) => ({ id, unit, arm, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });
/** The stored form of a run: tensions rounded to 4 places (the analysis reads means of them). */
const slim = (r: LongResult) => ({ ...r, tension: r.tension.map(v => (Number.isFinite(v) ? Math.round(v * 1e4) / 1e4 : null)) });

async function copyData(c: number) {
  const [s] = await get(`${TABLE}?id=eq.start-c${pad(c)}&select=record`), [i] = await get(`${TABLE}?id=eq.inputs-c${pad(c)}&select=metrics`);
  const start = s?.record, ticks = i?.metrics?.ticks;
  if (!start?.state || start.state.runtimeKind !== 'nd1' || start.state.nd1?.theta !== 12 || !start.fieldCheckpoint) throw new Error(`copy ${c}: starting copy check failed`);
  if (!Array.isArray(ticks) || ticks.length < DAYS * TICKS_PER_DAY) throw new Error(`copy ${c}: span check failed (${ticks?.length} ticks)`);
  return { start, ticks, info: { revision: start.revision, step: start.state.stepCount, span: i.metrics.span ?? null, flagged: !!i.metrics.flagged } };
}
const same = (a: LongResult, b: LongResult) => a.path === b.path && JSON.stringify(a.tension) === JSON.stringify(b.tension);

async function main() {
  const mode = process.env.MODE ?? 'copy';
  if (mode === 'copy') {
    const c = Number(process.env.COPY); if (!(c >= 1 && c <= 12)) throw new Error('COPY must be 1..12');
    const { start, ticks, info } = await copyData(c); console.log(`copy ${c}: start rev ${info.revision}, step ${info.step}`);
    if (c === 1) { const det: any = {};   // the determinism pair: one day, twice, on each runtime
      for (const arm of ['N', 'D'] as Arm[]) { const a = longRun(start, ticks, arm, c, { days: 1 }), b = longRun(start, ticks, arm, c, { days: 1 }); det[arm] = same(a, b); }
      await put([row('determinism', 1, null, det)]); if (!det.N || !det.D) throw new Error('determinism check failed: ' + JSON.stringify(det));
      console.log('determinism: identical'); }
    const arms: Arm[] = c <= 2 ? ['N', 'D', 'S', 'Doff'] : ['N', 'D', 'S'];
    for (const arm of arms) { const t0 = Date.now(); const r = longRun(start, ticks, arm, c);
      await put([row(`c${pad(c)}-${arm}`, c, arm, { ...slim(r), info, wallMs: Date.now() - t0 })]);
      console.log(`copy ${c} ${arm}: ${r.days} days, ${r.path.length} steps, ${r.rollbacks.length} rollbacks, ${Math.round((Date.now() - t0) / 1000)} s${r.runaway ? ', RUNAWAY ' + r.runaway : ''}`); }
  } else if (mode === 'pilot') { const all: LongResult[] = [];
    for (const c of [1, 2]) { const { start, ticks, info } = await copyData(c);
      for (const arm of ['N', 'D', 'S', 'Doff'] as Arm[]) { const t0 = Date.now(); const r = longRun(start, ticks, arm, c, { days: 3, idPrefix: 'long1-pilot' });
        const ms = Date.now() - t0; await put([row(`pilot-c${pad(c)}-${arm}`, c, arm, { ...slim(r), info, wallMs: ms })]);
        all.push(r); console.log(`pilot copy ${c} ${arm}: ${r.path.length} steps, ${Math.round(ms / 3000)} s/day, rollbacks ${r.rollbacks.length}, gates ${r.daily.at(-1)?.gates}, held ${r.daily.at(-1)?.held}, motor ${r.daily.at(-1)?.motorSize}, state ${r.daily.at(-1)?.stateSize}`);
        (r as any).wallMs = ms; (r as any).info = info; } }
    // The pilot's summary (disclosed in the registration): per run, its scale and wall time; and the analysis as it would
    // read on two copies over 3 days (not a test of anything: two copies cannot reach significance).
    const per = all.map(r => ({ copy: r.copy, arm: r.arm, steps: r.path.length, offers: r.reading.length, wallSecPerDay: Math.round(((r as any).wallMs ?? 0) / 3000),
      start: (r as any).info, rollbacks: r.rollbacks, daily: r.daily, flights: r.flights, warpShare: [...r.path].filter(x => x === '3' || x === '6').length / r.path.length,
      statement: r.readouts.at(-1)?.words ?? null }));
    let analysis: any = null; try { analysis = analyse(all); } catch (e) { analysis = { error: String(e) }; }
    writeFileSync(process.env.RESULT_FILE ?? 'PILOT.json', JSON.stringify({ schema: 'LONG1_PILOT_V1', runs: per, analysis }, null, 2) + '\n');
  } else if (mode === 'analysis') {
    const rows = await get(`${TABLE}?id=like.c*&select=id,metrics`), runs = rows.filter((x: any) => /^c\d\d-(N|D|S|Doff)$/.test(x.id)).map((x: any) => x.metrics as LongResult);
    const out = analyse(runs); await put([row('analysis', null, null, out)]);
    writeFileSync(process.env.RESULT_FILE ?? 'RESULT.json', JSON.stringify(out, null, 2) + '\n');
    console.log('hard checks: ' + Object.entries(out.hard).map(([k, v]: any) => `${k} ${v.pass ? 'PASS' : 'FAIL'}`).join(', '));
    for (const c of out.comparative) console.log(`${c.name} ${c.verdict} (p = ${c.p.toFixed(4)}): ${c.claim}`);
    console.log(out.pass ? 'LONG-1: PASS' : 'LONG-1: NOT PASSED');
  } else throw new Error(`unknown MODE ${mode}`);
}
if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
