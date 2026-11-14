/**
 * DEE-1L runner (experiments/live-amelia/dee1l/REGISTRATION.md) for GitHub Actions.
 *   bun run_actions.ts stage0        Stage 0: determinism pair on the first calibration window, then one GATES run per
 *                                    calibration window with ACTUAL and S1-S9 riding at gain 1; writes the registered gain.
 *   bun run_actions.ts determinism   The test's determinism pair: ACTUAL on unit 1, twice.
 *   bun run_actions.ts unit <n>      The 41 arms on test window n.
 *   bun run_actions.ts analysis      T per arm, the rank test, secondary measures.
 * Reads the starting copy and inputs from amelia_dee1l_runs / amelia_dee1l_inputs; writes only amelia_dee1l_runs.
 * Her live record is never read or written. Logs show progress only; the measures go to the database.
 */
import { runDee, makeTable, stage0, transmission, rankTest, tableName, N_SHUFFLES, STAGE0_TABLES } from './dee1l';

const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
const H = () => { if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }; };
const get = async (path: string) => { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H() }); if (!r.ok) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); return r.json(); };
const put = async (rows: any[]) => { const r = await fetch(`${URL_}/rest/v1/amelia_dee1l_runs?on_conflict=id`, { method: 'POST',
  headers: { ...H(), Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (!r.ok) throw new Error(`save: ${r.status}`); };
const row = (id: string, unit: number | null, arm: string | null, metrics: any) => ({ id, unit, arm, status: 'done', record: null, error: null,
  metrics, updated_at: new Date().toISOString() });
export const ARMS = ['GATES', 'ACTUAL', ...Array.from({ length: N_SHUFFLES }, (_, i) => `S${i + 1}`)];
const tableIndex = (arm: string) => arm === 'ACTUAL' ? 0 : Number(arm.slice(1));

async function start() {
  const [s] = await get('amelia_dee1l_runs?id=eq.start&select=record,metrics'); if (!s?.record?.state) throw new Error('no starting copy');
  return s.record;
}
async function inputs(phase: 'calibration' | 'test') {
  const rows = await get(`amelia_dee1l_inputs?phase=eq.${phase}&select=unit,ticks,n_offers,missing&order=unit`);
  const want = phase === 'calibration' ? [101, 102, 103, 104, 105, 106] : Array.from({ length: 12 }, (_, i) => i + 1);
  if (rows.length !== want.length || rows.some((r: any, i: number) => r.unit !== want[i])) throw new Error(`expected ${phase} units ${want.join(',')}`);
  for (const r of rows) { const miss = (r.missing ?? []).length; if (miss > 0.02 * (r.n_offers + miss)) throw new Error(`unit ${r.unit}: ${miss} encounters lack content (> 2%)`); }
  return rows as Array<{ unit: number; ticks: any[] }>;
}
const same = (a: any, b: any) => {
  const d: string[] = [];
  if (a.metrics.path !== b.metrics.path) d.push('path');
  if (JSON.stringify(a.probe) !== JSON.stringify(b.probe)) d.push('probe');
  if (JSON.stringify(a.raw) !== JSON.stringify(b.raw)) d.push('raw');
  if (a.metrics.final?.memoryHeadDigest !== b.metrics.final?.memoryHeadDigest) d.push('final.memoryHeadDigest');
  if (a.metrics.final?.bodyChecksum !== b.metrics.final?.bodyChecksum) d.push('final.bodyChecksum');
  return d;
};
const measures = (r: any, extra: any = {}) => ({ summary: r.summary, transmission: transmission(r.probe), choiceSteps: r.choiceSteps,
  releases: r.releases, runtimeTicks: r.ticks, byMesh: r.byMesh, path: r.metrics.path, final: r.metrics.final, ...extra });

async function runStage0() {
  const st = await start(), win = await inputs('calibration'), now = new Date().toISOString();
  console.log(`starting copy: revision ${st.revision}, step ${st.state.stepCount}; ${win.length} calibration windows`);
  const observers = () => Array.from({ length: STAGE0_TABLES }, (_, k) => makeTable(k, 1));
  const a = runDee(st, win[0].ticks, 's0-u101', 101, now, { probe: true, observers: observers() });
  const b = runDee(st, win[0].ticks, 's0-u101-rep', 101, now, { probe: true, observers: observers() });
  const diff = same(a, b); await put([row('stage0-determinism', 101, 'GATES', { identical: diff.length === 0, diff })]);
  if (diff.length) throw new Error('Stage 0 determinism failed: ' + diff.join(', '));
  console.log('stage 0 determinism: identical');
  const out: Array<{ probe: any[]; raw: any[] }> = [];
  for (const w of win) {
    const r = w.unit === 101 ? a : runDee(st, w.ticks, `s0-u${w.unit}`, w.unit, now, { probe: true, observers: observers() });
    out.push({ probe: r.probe, raw: r.raw });
    await put([row(`s0-u${w.unit}`, w.unit, 'GATES+observers', measures(r, { probe: r.probe, raw: r.raw }))]);
    console.log(`calibration window ${w.unit}: done`);
  }
  const res = stage0(out);
  await put([row('stage0', null, null, { ...res, startRevision: st.revision, startStep: st.state.stepCount })]);
  console.log(`stage 0: ${res.decision}`);
}

async function registeredGain() {
  const [s] = await get('amelia_dee1l_runs?id=eq.stage0&select=metrics');
  const g = s?.metrics?.gain; if (typeof g !== 'number') throw new Error('Stage 0 gave no gain: the test does not run (' + (s?.metrics?.decision ?? 'no Stage 0') + ')');
  return g;
}

async function runDeterminism() {
  const st = await start(), win = await inputs('test'), gain = await registeredGain(), now = new Date().toISOString();
  console.log(`starting copy: revision ${st.revision}, step ${st.state.stepCount}; gain ${gain}`);
  const a = runDee(st, win[0].ticks, 'det-a', 1, now, { probe: true, table: makeTable(0, gain) });
  const b = runDee(st, win[0].ticks, 'det-b', 1, now, { probe: true, table: makeTable(0, gain) });
  const diff = same(a, b); await put([row('determinism', 1, 'ACTUAL', { identical: diff.length === 0, diff, gain })]);
  if (diff.length) throw new Error('determinism check failed: ' + diff.join(', '));
  console.log('determinism: identical');
}

async function runUnit(n: number) {
  const st = await start(), win = await inputs('test'), gain = await registeredGain(), now = new Date().toISOString();
  const [det] = await get('amelia_dee1l_runs?id=eq.determinism&select=metrics'); if (det?.metrics?.identical !== true) throw new Error('no passed determinism check');
  const w = win[n - 1]; let rows: any[] = [];
  for (const arm of ARMS) {
    const table = arm === 'GATES' ? null : makeTable(tableIndex(arm), gain);
    const r = runDee(st, w.ticks, `u${String(n).padStart(2, '0')}-${arm}`, n, now, { probe: true, table });
    rows.push(row(`u${String(n).padStart(2, '0')}-${arm}`, n, arm, measures(r, { gain })));
    if (rows.length >= 8) { await put(rows); rows = []; }
  }
  if (rows.length) await put(rows);
  console.log(`unit ${n}: ${ARMS.length} arms done`);
}

async function runAnalysis() {
  const all: any[] = await get('amelia_dee1l_runs?id=like.u*&select=id,unit,arm,metrics&order=id');
  const cells = new Map(all.map(r => [`${r.unit}|${r.arm}`, r.metrics]));
  for (let u = 1; u <= 12; u++) for (const arm of ARMS) if (!cells.has(`${u}|${arm}`)) throw new Error(`missing run unit ${u} arm ${arm}`);
  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const byArm: Record<string, any> = {}, T: Record<string, number> = {};
  for (const arm of ARMS) {
    const ms = Array.from({ length: 12 }, (_, i) => cells.get(`${i + 1}|${arm}`));
    const hits = ms.reduce((a, m) => a + m.transmission.hits, 0), eligible = ms.reduce((a, m) => a + m.transmission.eligible, 0);
    T[arm] = hits / eligible;
    byArm[arm] = { T: T[arm], hits, eligible, Tper: ms.map(m => m.transmission.T),
      warpShare: mean(ms.map(m => m.summary.M1_warpShare)), E: mean(ms.map(m => m.summary.E)), E_choice: mean(ms.map(m => m.summary.E_choice)),
      E_flow: mean(ms.map(m => m.summary.E_flow)), flowShare: mean(ms.map(m => m.summary.flowShare)), linesOfFlight: mean(ms.map(m => m.summary.linesOfFlight)),
      choiceSteps: ms.reduce((a, m) => a + m.choiceSteps, 0) };
  }
  const { GATES, ...tables } = T; void GATES;
  const test = rankTest(tables);
  const actualMesh = Array(45).fill(0); for (let u = 1; u <= 12; u++) cells.get(`${u}|ACTUAL`).byMesh.forEach((c: number, i: number) => actualMesh[i] += c);
  await put([row('analysis', null, null, { test, byArm, actualMesh, gain: cells.get('1|ACTUAL').gain })]);
  console.log(`analysis written: ${test.decision}`);
}

if (import.meta.main) {
  const [mode, arg] = process.argv.slice(2);
  const job = mode === 'stage0' ? runStage0() : mode === 'determinism' ? runDeterminism() : mode === 'unit' ? runUnit(Number(arg))
    : mode === 'analysis' ? runAnalysis() : Promise.reject(new Error('mode: stage0 | determinism | unit <n> | analysis'));
  job.catch(e => { console.error(String(e)); process.exit(1); });
}
void tableName;
