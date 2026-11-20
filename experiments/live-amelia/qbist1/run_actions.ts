/**
 * QBIST-1 runner (experiments/live-amelia/qbist1/REGISTRATION.md) for GitHub Actions.
 *   bun run_actions.ts stage0   The structure check and the settings, on the calibration windows (units 101-108).
 *   bun run_actions.ts test     The determinism pair, 12 windows x three arms, and the registered analysis.
 * Reads the starting copy and the windows from amelia_qbist1_runs / amelia_qbist1_inputs; writes only amelia_qbist1_runs.
 * Large reads wait for a slot clear of her ticks (:05, :20, :35, :50, +- 90 s) and are made one at a time.
 */
import { LADDER, ARMS, runQb, measures, structure, signFlip, holm, type Arm } from './qbist1';

const START_REVISION = 941, START_STEP = 15877;   // the starting copy, fixed at registration
const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
const H = () => { if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }; };
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
/** Wait until at least 90 s from any of her tick minutes (:05, :20, :35, :50). */
async function clearOfTicks() { for (;;) { const t = Math.floor(Date.now() / 1000) % 900, d = (t - 300 + 900) % 900; if (d > 90 && d < 810) return; await wait(10000); } }
async function get(path: string) {
  for (let a = 1; ; a++) { await clearOfTicks(); const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H() }); if (r.ok) return r.json();
    if (r.status < 500 || a >= 6) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); await wait(120000); }
}
async function put(rows: any[]) {
  for (let a = 1; ; a++) { await clearOfTicks(); const r = await fetch(`${URL_}/rest/v1/amelia_qbist1_runs?on_conflict=id`, { method: 'POST',
    headers: { ...H(), Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (r.ok) return;
    if (r.status < 500 || a >= 6) throw new Error(`save: ${r.status}`); await wait(120000); }
}
const row = (id: string, unit: number | null, arm: string | null, metrics: any) => ({ id, unit, arm, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });
const pad = (u: number) => String(u).padStart(2, '0'), mean = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;

async function start() {
  const [s] = await get('amelia_qbist1_runs?id=eq.start&select=record'); const st = s?.record;
  if (!st?.state || Number(st.revision) !== START_REVISION || Number(st.state.stepCount) !== START_STEP || st.state.admissionRule !== 'outside-lane-v1' || st.state.nd1?.theta !== 12)
    throw new Error('starting copy check failed');
  return st;
}
async function windows(units: number[]) {
  const out: any[] = [];
  for (const u of units) { const [w] = await get(`amelia_qbist1_inputs?unit=eq.${u}&select=unit,ticks,n_offers,missing`);
    if (!w) throw new Error(`no window ${u}`); if ((w.missing ?? []).length > 0.02 * Math.max(1, w.n_offers)) throw new Error(`window ${u}: missing over 2%`); out.push(w); }
  return out;
}

async function runStage0() {
  const st = await start(), win = await windows([101, 102, 103, 104, 105, 106, 107, 108]), now = new Date().toISOString();
  const nd: any[] = []; for (const w of win) nd.push(measures(runQb(st, w.ticks, `s0-u${w.unit}-ND1B`, w.unit, now, 'ND1B', LADDER[0])));
  const ndLocked = mean(nd.map(m => m.lockedShare))!;
  const tried: any[] = []; let chosen: any = null;
  for (const setting of LADDER) {
    const ms: any[] = []; for (const w of win) ms.push(measures(runQb(st, w.ticks, `s0-u${w.unit}-QB-${setting.lambda}-${setting.gamma}`, w.unit, now, 'QB', setting)));
    const zones = mean(ms.map(m => m.zonesVisited))!, locked = mean(ms.map(m => m.lockedShare))!, coh = mean(ms.map(m => m.meanCoherence))!, steer = mean(ms.map(m => m.differsFromHer))!;
    const ok = { viable: zones >= 8 && locked <= Math.max(2 * ndLocked, 0.01), coherence: coh >= 0.1, steers: steer >= 0.10 };
    tried.push({ ...setting, zones, locked, coherence: coh, steers: steer, ...ok }); console.log(`setting ${JSON.stringify(setting)}: ${JSON.stringify(ok)}`);
    if (ok.viable && ok.coherence && ok.steers) { chosen = setting; break; }
  }
  let check: any = null;
  if (chosen) { const q = runQb(st, win[0].ticks, 's0-structure-QB', 101, now, 'QB', chosen, 30), d = runQb(st, win[0].ticks, 's0-structure-DEC', 101, now, 'DEC', chosen, 30);
    check = structure(q.states, d.states);
    const r2 = runQb(st, win[0].ticks, 's0-structure-QB', 101, now, 'QB', chosen); check.determinism = r2.metrics.path === q.metrics.path; check.pass = check.pass && check.determinism; }
  const decision = !chosen ? 'STOP: NO SETTING PASSES' : !check.pass ? 'STOP: THE STRUCTURE CHECK FAILS' : `SETTING lambda ${chosen.lambda}, gamma ${chosen.gamma}`;
  await put([row('stage0', null, null, { decision, setting: chosen && check.pass ? chosen : null, tried, ndLocked, structure: check })]);
  console.log(`stage 0: ${decision}`);
}

async function runTest() {
  const [s0] = await get('amelia_qbist1_runs?id=eq.stage0&select=metrics'); const setting = s0?.metrics?.setting;
  if (!setting) throw new Error('Stage 0 gave no setting: the test does not run (' + (s0?.metrics?.decision ?? 'no Stage 0') + ')');
  const st = await start(), win = await windows(Array.from({ length: 12 }, (_, i) => i + 1)), now = new Date().toISOString();
  const a = runQb(st, win[0].ticks, 'det-u01-QB', 1, now, 'QB', setting), b = runQb(st, win[0].ticks, 'det-u01-QB', 1, now, 'QB', setting);
  const diff = ['path', 'entries'].filter(k => JSON.stringify((a.metrics as any)[k]) !== JSON.stringify((b.metrics as any)[k]))
    .concat(a.metrics.final?.memoryHeadDigest !== b.metrics.final?.memoryHeadDigest ? ['memory head'] : []).concat(a.metrics.final?.bodyChecksum !== b.metrics.final?.bodyChecksum ? ['body checksum'] : []);
  await put([row('determinism', 1, 'QB', { identical: !diff.length, diff })]); if (diff.length) throw new Error('determinism check failed: ' + diff.join(', '));
  console.log('determinism: identical');
  const s: Record<Arm, any[]> = { QB: [], DEC: [], ND1B: [] };
  for (const w of win) { const rows: any[] = [];
    for (const arm of ARMS) { const m = measures(runQb(st, w.ticks, `u${pad(w.unit)}-${arm}`, w.unit, now, arm, setting)); s[arm].push(m); rows.push(row(`u${pad(w.unit)}-${arm}`, w.unit, arm, m)); }
    await put(rows); console.log(`window ${w.unit}: done`); }
  const test = (name: string, x: Arm, y: Arm, f: (m: any) => number | null) => { const pairs = s[x].map((m, i) => [f(m), f(s[y][i])]);
    const d = pairs.filter(([p, q]) => p !== null && q !== null).map(([p, q]) => (p as number) - (q as number)), t = signFlip(d);
    return { name, a: x, b: y, d, dropped: pairs.length - d.length, mean: t.mean, p: t.p }; };
  const P1 = test('P1', 'QB', 'DEC', m => m.T_excess);
  const sec = [test('S1', 'QB', 'DEC', m => m.novelty), test('S2', 'QB', 'DEC', m => m.E), test('S3', 'QB', 'ND1B', m => m.lockedShare)];
  const hs = holm(sec.map(({ name, p }) => ({ name, p }))); const S = sec.map(t => ({ ...t, ...hs.find(x => x.name === t.name)! }));
  const reading = !(P1.p <= 0.05) ? 'NOT IDENTIFIED' : P1.mean > 0 ? 'THE VIRTUAL CARRIES WHAT ARRIVES MORE CLEARLY' : 'THE VIRTUAL CARRIES WHAT ARRIVES LESS CLEARLY';
  const keys = ['T_excess', 'novelty', 'E', 'E_choice', 'E_flow', 'warpShare', 'linesOfFlight', 'zonesVisited', 'lockedShare', 'differsFromHer', 'precursorDecided', 'interference', 'meanCoherence'];
  const byArm = Object.fromEntries(ARMS.map(x => [x, Object.fromEntries(keys.map(k => [k, mean(s[x].map(m => m[k]).filter((v: any) => v !== null))]))]));
  await put([row('analysis', null, null, { setting, P1, secondary: S, reading, byArm })]);
  console.log(`analysis: ${reading}; P1 p = ${P1.p}; ${S.map(t => `${t.name} ${t.survives ? 'holds' : 'not identified'}`).join(', ')}`);
}

if (import.meta.main) {
  const mode = process.argv[2];
  (mode === 'stage0' ? runStage0() : mode === 'test' ? runTest() : Promise.reject(new Error('mode: stage0 | test'))).catch(e => { console.error(String(e)); process.exit(1); });
}
