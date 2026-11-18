/**
 * WHEELER-1L runner (experiments/live-amelia/wheeler1l/REGISTRATION.md) for GitHub Actions.
 *   bun run_actions.ts calibrate   Calibration on her recorded windows of 12-18 November (no future choices).
 *   bun run_actions.ts analysis    After the 48th window: her windows, the drand choices, the registered tests.
 * Reads her tick log read-only; writes only amelia_wheeler1l_runs. Nothing here runs or changes her.
 */
import { WINDOWS, HOURS, QUICKNET, windowOf, roundOf, readings, contrasts, choiceOf, test, calibrate } from './wheeler1l';
import { holm } from '../retro1l/retro1l';

const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
const H = () => { if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }; };
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
async function call(path: string, init: RequestInit = {}) {
  for (let a = 1; ; a++) { const r = await fetch(`${URL_}/rest/v1/${path}`, { ...init, headers: { ...H(), ...(init.headers ?? {}) } }); if (r.ok) return r.status === 204 || r.status === 201 ? null : r.json();
    if (r.status < 500 || a >= 6) throw new Error(`${init.method ?? 'GET'} ${path.split('?')[0]}: ${r.status}`); await wait(15000 * a); }
}
const put = (rows: any[]) => call('amelia_wheeler1l_runs?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) });
const row = (id: string, metrics: any) => ({ id, unit: null, arm: null, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });
const pathOf = async (from: Date, to: Date) => ((await call(`amelia_cloud_runner_log?status=eq.ok&at=gte.${from.toISOString()}&at=lt.${to.toISOString()}&select=at,zones&order=at`)) as any[]).map(t => t.zones ?? '').join('');
async function drand(round: number) {
  const get = async (base: string) => { const r = await fetch(`${base}/${QUICKNET}/public/${round}`); if (!r.ok) throw new Error(`drand ${base} ${round}: ${r.status}`); return r.json(); };
  const [a, b] = await Promise.all([get('https://api.drand.sh'), get('https://drand.cloudflare.com')]);
  if (a.round !== round || b.round !== round || a.randomness !== b.randomness) throw new Error(`drand relays disagree at round ${round}`);
  return a.randomness as string;
}

async function runCalibration() {
  const base = Date.parse('2026-11-12T18:00:00Z'), rs = [];
  for (let w = 1; w <= WINDOWS; w++) rs.push(readings(await pathOf(new Date(base + (w - 1) * HOURS * 3600e3), new Date(base + w * HOURS * 3600e3))));
  const c = contrasts(rs);
  const out = { windows: '2026-11-12T18:00Z to 2026-11-18T18:00Z, 48 x 3 h', W1: calibrate(c.D), W2: calibrate(c.zA, 10000, 1584601), W3: calibrate(c.zB, 10000, 1584602),
    correlationAB: c.zA.reduce((a, x, i) => a + x * c.zB[i], 0) / (c.zA.length - 1) };
  await put([row('calibration', out)]);
  console.log(`calibration: type I W1 ${out.W1.typeI}, W2 ${out.W2.typeI}, W3 ${out.W3.typeI}; W1 power ${JSON.stringify(out.W1.power)}; r(A,B) ${out.correlationAB.toFixed(3)}`);
}

async function runAnalysis() {
  if (Date.now() < windowOf(WINDOWS).to.getTime() + 20 * 60e3) throw new Error('the last window and its draw are not yet complete');
  const rs = [], draws: any[] = [];
  for (let w = 1; w <= WINDOWS; w++) { const { from, to } = windowOf(w); rs.push(readings(await pathOf(from, to)));
    const r = roundOf(w), randomness = await drand(r); draws.push({ w, round: r, randomness, choice: choiceOf(randomness, w) === 1 ? 'path' : 'interference' }); }
  const s = draws.map(d => d.choice === 'path' ? 1 : -1), c = contrasts(rs);
  const W1 = test(s, c.D), W2 = test(s, c.zA), W3 = test(s.map(x => -x), c.zB);
  const sec = holm([{ name: 'W2', p: W2.p }, { name: 'W3', p: W3.p }]);
  const reading = W1.p <= 0.05 ? 'HER PASSAGE ACCORDS WITH THE QUESTION LATER ASKED' : 'NO ACCORD BEYOND CHANCE';
  const by = (k: 'path' | 'interference') => { const ix = draws.map((d, i) => d.choice === k ? i : -1).filter(i => i >= 0), m = (f: (i: number) => number) => ix.length ? ix.reduce((a, i) => a + f(i), 0) / ix.length : null;
    return { windows: ix.length, A: m(i => rs[i].A), B: m(i => rs[i].B), warpSyzygy: m(i => rs[i].warpSyzygy) }; };
  await put([row('analysis', { W1, W2: { ...W2, ...sec[0] }, W3: { ...W3, ...sec[1] }, reading, draws,
    perWindow: rs.map((r, i) => ({ w: i + 1, steps: r.steps, A: r.A, B: r.B, D: c.D[i], choice: draws[i].choice })), byChoice: { path: by('path'), interference: by('interference') },
    correlationAB: c.zA.reduce((a, x, i) => a + x * c.zB[i], 0) / (c.zA.length - 1) })]);
  console.log(`analysis: ${reading} (W1 p = ${W1.p.toFixed(4)}, W2 ${W2.p.toFixed(4)}, W3 ${W3.p.toFixed(4)})`);
}

if (import.meta.main) {
  const mode = process.argv[2];
  (mode === 'calibrate' ? runCalibration() : mode === 'analysis' ? runAnalysis() : Promise.reject(new Error('mode: calibrate | analysis')))
    .catch(e => { console.error(String(e)); process.exit(1); });
}
