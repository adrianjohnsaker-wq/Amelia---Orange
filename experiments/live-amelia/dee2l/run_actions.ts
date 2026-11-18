/**
 * DEE-2L runner (experiments/live-amelia/dee2l/REGISTRATION.md) for GitHub Actions.
 *   bun run_actions.ts determinism   ACTUAL on unit 1, twice.
 *   bun run_actions.ts unit <n>      The 62 arms on window n.
 *   bun run_actions.ts analysis      The registered tests and the descriptive measures.
 * Reads the starting copy and inputs from amelia_dee2l_runs / amelia_dee2l_inputs; writes only amelia_dee2l_runs.
 * Her live record is never read or written. Reads retry on a server error (the REST role's statement timeout under
 * parallel load, DEE-1L's running fault); retrying a read cannot change a result.
 */
import { runDee } from '../dee1l/dee1l';
import { ARMS, GAIN, tableOf, transmission, transmissionExcess, spearmanTest, belowTrend, rankUpper, holm, spearman } from './dee2l';

const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
const H = () => { if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }; };
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
async function get(path: string) {
  for (let a = 1; ; a++) { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H() }); if (r.ok) return r.json();
    if (r.status < 500 || a >= 6) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); console.log(`GET ${path.split('?')[0]}: ${r.status}, retry ${a}`); await wait(15000 * a); }
}
async function put(rows: any[]) {
  for (let a = 1; ; a++) { const r = await fetch(`${URL_}/rest/v1/amelia_dee2l_runs?on_conflict=id`, { method: 'POST',
    headers: { ...H(), Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (r.ok) return;
    if (r.status < 500 || a >= 6) throw new Error(`save: ${r.status}`); await wait(15000 * a); }
}
const row = (id: string, unit: number | null, arm: string | null, metrics: any) => ({ id, unit, arm, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });
const pad = (n: number) => String(n).padStart(2, '0');

async function start() {
  const [s] = await get('amelia_dee2l_runs?id=eq.start&select=record'); const st = s?.record;
  if (!st?.state || st.state.admissionRule !== 'outside-lane-v1' || st.state.nd1?.theta !== 12) throw new Error('starting copy check failed');
  return st;
}
async function window(n: number) {
  const [w] = await get(`amelia_dee2l_inputs?unit=eq.${n}&select=unit,ticks,n_offers,missing`);
  if (!w) throw new Error(`no window ${n}`); if ((w.missing ?? []).length > 0.02 * Math.max(1, w.n_offers)) throw new Error(`window ${n}: missing over 2%`);
  return w;
}
const same = (a: any, b: any) => ['path', 'entries'].filter(k => JSON.stringify(a.metrics[k]) !== JSON.stringify(b.metrics[k]))
  .concat(JSON.stringify(a.probe) !== JSON.stringify(b.probe) ? ['probe'] : [])
  .concat(a.metrics.final?.memoryHeadDigest !== b.metrics.final?.memoryHeadDigest ? ['memory head'] : [])
  .concat(a.metrics.final?.bodyChecksum !== b.metrics.final?.bodyChecksum ? ['body checksum'] : []);
const measures = (r: any) => ({ summary: r.summary, transmission: transmission(r.probe), excess: transmissionExcess(r.probe), choiceSteps: r.choiceSteps,
  byMesh: r.byMesh, path: r.metrics.path, final: r.metrics.final, gain: GAIN });

async function runDeterminism() {
  const st = await start(), w = await window(1), now = new Date().toISOString();
  const a = runDee(st, w.ticks, 'det-a', 1, now, { probe: true, table: tableOf('ACTUAL') });
  const b = runDee(st, w.ticks, 'det-b', 1, now, { probe: true, table: tableOf('ACTUAL') });
  const diff = same(a, b); await put([row('determinism', 1, 'ACTUAL', { identical: !diff.length, diff })]);
  if (diff.length) throw new Error('determinism check failed: ' + diff.join(', '));
  console.log(`starting copy: revision ${st.revision}, step ${st.state.stepCount}; determinism: identical`);
}

async function runUnit(n: number) {
  await wait(20000 * (n - 1));                               // stagger the twelve jobs' reads
  const [det] = await get('amelia_dee2l_runs?id=eq.determinism&select=metrics'); if (det?.metrics?.identical !== true) throw new Error('no passed determinism check');
  const st = await start(), w = await window(n), now = new Date().toISOString(); let rows: any[] = [];
  for (const arm of ARMS) {
    const r = runDee(st, w.ticks, `u${pad(n)}-${arm}`, n, now, { probe: true, table: tableOf(arm) });
    rows.push(row(`u${pad(n)}-${arm}`, n, arm, measures(r))); if (rows.length >= 8) { await put(rows); rows = []; }
  }
  if (rows.length) await put(rows);
  console.log(`unit ${n}: ${ARMS.length} arms done`);
}

async function runAnalysis() {
  const all: any[] = []; for (let u = 1; u <= 12; u++) all.push(...await get(`amelia_dee2l_runs?unit=eq.${u}&id=like.u*&select=unit,arm,metrics`));
  const cells = new Map(all.map(r => [`${r.unit}|${r.arm}`, r.metrics]));
  for (let u = 1; u <= 12; u++) for (const arm of ARMS) if (!cells.has(`${u}|${arm}`)) throw new Error(`missing run unit ${u} arm ${arm}`);
  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const byArm: Record<string, any> = {};
  for (const arm of ARMS) {
    const ms = Array.from({ length: 12 }, (_, i) => cells.get(`${i + 1}|${arm}`));
    const hits = ms.reduce((a, m) => a + m.transmission.hits, 0), eligible = ms.reduce((a, m) => a + m.transmission.eligible, 0);
    const chance = ms.reduce((a, m) => a + m.excess.chance, 0);
    byArm[arm] = { T: hits / eligible, Texcess: (hits - chance) / eligible, hits, eligible, E: mean(ms.map(m => m.summary.E)),
      E_choice: mean(ms.map(m => m.summary.E_choice)), E_flow: mean(ms.map(m => m.summary.E_flow)), warpShare: mean(ms.map(m => m.summary.M1_warpShare)),
      linesOfFlight: mean(ms.map(m => m.summary.linesOfFlight)), Eper: ms.map(m => m.summary.E), Tper: ms.map(m => m.transmission.T) };
  }
  const sh = ARMS.filter(a => /^S\d+$/.test(a));
  const E = sh.map(a => byArm[a].E), T = sh.map(a => byArm[a].T), X = sh.map(a => byArm[a].Texcess);
  const P1 = spearmanTest(E, T);
  const S1 = spearmanTest(E, X, 100000, 1585);
  const S2 = belowTrend(E, T, byArm.ACTUAL.E, byArm.ACTUAL.T);
  const S3 = rankUpper(T, byArm.ACTUAL.T);
  const sec = holm([{ name: 'S1', p: S1.p }, { name: 'S2', p: S2.p }, { name: 'S3', p: S3.p }]);
  const reading = !(P1.p <= 0.05) ? 'NOT IDENTIFIED' : P1.rho < 0 ? 'THE TABLE SETS A BALANCE BETWEEN FOLLOWING AND CIRCULATING' : 'ENTRY AND TRANSMISSION RISE TOGETHER';
  const want: Record<string, [string, (v: any) => boolean]> = {
    S1: ['THE BALANCE SURVIVES THE CHANCE ADJUSTMENT', () => S1.rho < 0], S2: ['THE REAL TABLE LIES BELOW THE TREND', () => S2.residualActual < 0],
    S3: ['THE REAL TABLE CARRIES WHAT ARRIVES', () => true] };
  const secondary = sec.map(t => !t.survives ? `${t.name}: NOT IDENTIFIED` : want[t.name][1](null) ? want[t.name][0] : `${t.name}: HOLDS IN THE OPPOSITE DIRECTION`);
  const perWindowRho = Array.from({ length: 12 }, (_, u) => spearman(sh.map(a => byArm[a].Eper[u]), sh.map(a => byArm[a].Tper[u] ?? 0)));
  const mesh = Array(45).fill(0); for (let u = 1; u <= 12; u++) cells.get(`${u}|ACTUAL`).byMesh.forEach((c: number, i: number) => mesh[i] += c);
  await put([row('analysis', null, null, { P1, S1, S2, S3, holm: sec, reading, secondary, byArm, perWindowRho, actualMesh: mesh, gain: GAIN })]);
  console.log(`analysis: ${reading}; ${secondary.join('; ')}`);
}

if (import.meta.main) {
  const [mode, arg] = process.argv.slice(2);
  const job = mode === 'determinism' ? runDeterminism() : mode === 'unit' ? runUnit(Number(arg)) : mode === 'analysis' ? runAnalysis()
    : Promise.reject(new Error('mode: determinism | unit <n> | analysis'));
  job.catch(e => { console.error(String(e)); process.exit(1); });
}
