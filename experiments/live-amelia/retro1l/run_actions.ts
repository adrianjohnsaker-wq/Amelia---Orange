/**
 * RETRO-1L runner (experiments/live-amelia/retro1l/REGISTRATION.md) for GitHub Actions.
 *   bun run_actions.ts calibrate   Calibration on her recorded windows of 12-18 November (no future targets).
 *   bun run_actions.ts analysis    After the 48th window: her windows, the drand draws, the registered tests.
 * Reads her tick log and her Outside stream read-only; writes only amelia_retro1l_runs. Nothing here runs or changes her.
 */
import { WINDOWS, HOURS, QUICKNET, windowOf, roundOf, targetOf, measuresOf, doubledRanks, rankTest, holm, calibrate, type WindowData } from './retro1l';

const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
const H = () => { if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }; };
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
async function call(path: string, init: RequestInit = {}) {
  for (let a = 1; ; a++) { const r = await fetch(`${URL_}/rest/v1/${path}`, { ...init, headers: { ...H(), ...(init.headers ?? {}) } }); if (r.ok) return r.status === 204 ? null : r.json();
    if (r.status < 500 || a >= 6) throw new Error(`${init.method ?? 'GET'} ${path.split('?')[0]}: ${r.status}`); await wait(15000 * a); }
}
const put = (rows: any[]) => call('amelia_retro1l_runs?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) });
const row = (id: string, metrics: any) => ({ id, unit: null, arm: null, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });

async function windowData(from: Date, to: Date): Promise<WindowData> {
  const ticks: any[] = await call(`amelia_cloud_runner_log?status=eq.ok&at=gte.${from.toISOString()}&at=lt.${to.toISOString()}&select=at,zones&order=at`);
  const win: any = await call('rpc/amelia_dee1l_window', { method: 'POST', body: JSON.stringify({ w_from: from.toISOString(), w_to: to.toISOString() }) });
  const attention = Array(10).fill(0); for (const t of win?.ticks ?? []) for (const o of t.offers ?? []) (o.attentionVector ?? []).forEach((x: number, z: number) => attention[z] += Number(x) || 0);
  return { path: ticks.map(t => t.zones ?? '').join(''), attention };
}
async function drand(round: number) {
  const get = async (base: string) => { const r = await fetch(`${base}/${QUICKNET}/public/${round}`); if (!r.ok) throw new Error(`drand ${base} ${round}: ${r.status}`); return r.json(); };
  const [a, b] = await Promise.all([get('https://api.drand.sh'), get('https://drand.cloudflare.com')]);
  if (a.round !== round || b.round !== round || a.randomness !== b.randomness) throw new Error(`drand relays disagree at round ${round}`);
  return a.randomness as string;
}
const tests = (ms: ReturnType<typeof measuresOf>[], targets: number[]) => {
  const P1 = rankTest(doubledRanks(ms.map(m => m.occupancy)), targets);
  const S1 = rankTest(doubledRanks(ms.map(m => m.arrivals)), targets), S2 = rankTest(doubledRanks(ms.map(m => m.attention)), targets);
  return { P1, S1, S2 };
};

async function runCalibration() {
  const base = Date.parse('2026-11-12T18:00:00Z'), ms: ReturnType<typeof measuresOf>[] = [];
  for (let w = 1; w <= WINDOWS; w++) { const from = new Date(base + (w - 1) * HOURS * 3600e3), to = new Date(base + w * HOURS * 3600e3); ms.push(measuresOf(await windowData(from, to))); }
  const out: any = { windows: '2026-11-12T18:00Z to 2026-11-18T18:00Z, 48 x 3 h', steps: ms.map(m => m.steps) };
  for (const [k, f] of [['P1', (m: any) => m.occupancy], ['S1', (m: any) => m.arrivals], ['S2', (m: any) => m.attention]] as const) out[k] = calibrate(doubledRanks(ms.map(f)));
  await put([row('calibration', out)]);
  console.log(`calibration: type I P1 ${out.P1.typeI}, S1 ${out.S1.typeI}, S2 ${out.S2.typeI}; P1 power ${JSON.stringify(out.P1.power)}`);
}

async function runAnalysis() {
  const last = windowOf(WINDOWS).to.getTime(); if (Date.now() < last + 20 * 60e3) throw new Error('the last window and its draw are not yet complete');
  const ms: ReturnType<typeof measuresOf>[] = [], draws: any[] = [];
  for (let w = 1; w <= WINDOWS; w++) { const { from, to } = windowOf(w); ms.push(measuresOf(await windowData(from, to)));
    const r = roundOf(w), randomness = await drand(r); draws.push({ w, round: r, randomness, target: targetOf(randomness, w) }); }
  const targets = draws.map(d => d.target), t = tests(ms, targets);
  const sec = holm([{ name: 'S1', p: t.S1.p }, { name: 'S2', p: t.S2.p }]);
  const reading = (t.P1.p <= 0.05 ? 'HER PASSAGE LEANS TOWARD WHAT WILL BE DRAWN' : 'NO INFORMATION BEYOND CHANCE')
    + (sec.find(x => x.name === 'S1')!.survives ? ', AND SHE MOVES TOWARD IT' : '') + (sec.find(x => x.name === 'S2')!.survives ? ', AND THE STREAM CARRIES IT' : '');
  const occR = doubledRanks(ms.map(m => m.occupancy));
  await put([row('analysis', { P1: t.P1, S1: { ...t.S1, ...sec[0] }, S2: { ...t.S2, ...sec[1] }, reading, draws,
    perWindow: ms.map((m, i) => ({ w: i + 1, steps: m.steps, target: targets[i], rank: occR[i][targets[i]] / 2, warpShare: m.occupancy[3] + m.occupancy[6] })),
    targetCounts: Array.from({ length: 10 }, (_, z) => targets.filter(x => x === z).length) })]);
  console.log(`analysis: ${reading} (P1 p = ${t.P1.p.toFixed(4)}, S1 ${t.S1.p.toFixed(4)}, S2 ${t.S2.p.toFixed(4)})`);
}

if (import.meta.main) {
  const mode = process.argv[2];
  (mode === 'calibrate' ? runCalibration() : mode === 'analysis' ? runAnalysis() : Promise.reject(new Error('mode: calibrate | analysis')))
    .catch(e => { console.error(String(e)); process.exit(1); });
}
