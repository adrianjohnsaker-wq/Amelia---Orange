/**
 * HYPERSTITION-2L runner (experiments/live-amelia/hyp2l/REGISTRATION.md) for GitHub Actions. Reads the starting copy
 * (read-only); runs the determinism pair and 24 units x four arms; writes measures and the registered analysis to
 * amelia_hyp2l_runs only. Her live record is never read or written here.
 */
import { holm } from '../dee2l/dee2l';
import { ARMS, UNITS, SIGNS, STREAM, STREAM_SHA256, streamDigest, transmission, windows, fulfilment, adjacency, signFlipUpper, type Arm } from './hyp2l';

const REV = 750, STEP = 12599;   // the starting copy, fixed at registration
const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
const H = () => { if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }; };
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
async function get(path: string) {
  for (let a = 1; ; a++) { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H() }); if (r.ok) return r.json();
    if (r.status < 500 || a >= 6) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); await wait(15000 * a); }
}
async function put(rows: any[]) {
  for (let a = 1; ; a++) { const r = await fetch(`${URL_}/rest/v1/amelia_hyp2l_runs?on_conflict=id`, { method: 'POST',
    headers: { ...H(), Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (r.ok) return;
    if (r.status < 500 || a >= 6) throw new Error(`save: ${r.status}`); await wait(15000 * a); }
}
const row = (id: string, unit: number | null, arm: string | null, metrics: any) => ({ id, unit, arm, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });
const pad = (u: number) => String(u).padStart(2, '0'), mean = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const warpbornOf = (r: any) => (r.state.qabbalaGates ?? []).map((g: any) => String(g.id)).filter((x: string) => x.startsWith('warpborn'));

async function main() {
  if (streamDigest(STREAM) !== STREAM_SHA256 || STREAM.length !== 85216) throw new Error('stream check failed');
  const [st] = await get('amelia_hyp2l_runs?id=eq.start&select=record'); const start = st?.record;
  if (!start?.state || Number(start.revision) !== REV || Number(start.state.stepCount) !== STEP || start.state.admissionRule !== 'outside-lane-v1'
    || start.state.nd1?.theta !== 12) throw new Error('starting copy check failed');
  const gates0 = warpbornOf(start); console.log(`start step ${start.state.stepCount}, ${gates0.length} Warp-born gates`);

  const a = transmission(start, 'H', 1, 'det-a'), b = transmission(start, 'H', 1, 'det-b');
  const diff = [['path', a.metrics.path, b.metrics.path], ['entries', a.metrics.entries, b.metrics.entries],
    ['memory head', a.record.state.memoryState?.events?.at(-1)?.eventDigest, b.record.state.memoryState?.events?.at(-1)?.eventDigest],
    ['body checksum', a.record.fieldCheckpoint?.checksum, b.record.fieldCheckpoint?.checksum]].filter(([, x, y]) => JSON.stringify(x) !== JSON.stringify(y)).map(([k]) => k);
  await put([row('determinism', 1, 'H', { identical: !diff.length, diff, steps: a.steps.length })]);
  if (diff.length) throw new Error('determinism check failed: ' + diff.join(', '));
  console.log(`determinism: identical (${a.steps.length} steps)`);

  const s: Record<string, any[]> = Object.fromEntries(ARMS.map(x => [x, []])); const chance: number[] = [];
  for (let u = 1; u <= UNITS; u++) {
    const rows: any[] = []; const runs: Record<string, any> = {};
    for (const arm of ARMS) {
      const r = u === 1 && arm === 'H' ? a : transmission(start, arm as Arm, u, `u${pad(u)}-${arm}`); runs[arm] = r;
      if (r.steps.length !== 2 * 48 * 15) throw new Error(`unit ${u} ${arm}: ${r.steps.length} steps`);
      const win = windows(r.steps), studies = r.steps.filter(x => x.study);
      const m = { F: fulfilment(r.signs, win), E: r.summary.E, E_choice: r.summary.E_choice, E_flow: r.summary.E_flow, warpShare: r.summary.M1_warpShare,
        linesOfFlight: r.summary.linesOfFlight, onArrival: studies.filter(x => x.onArrival).length / Math.max(1, studies.length),
        lockedShare: r.steps.filter(x => x.locked).length / r.steps.length, adjacency: adjacency(r.signs, start),
        signZones: Array.from({ length: 10 }, (_, z) => r.signs.filter(x => x === z).length),
        gatesWritten: warpbornOf(r.record).filter((g: string) => !gates0.includes(g)), path: r.metrics.path };
      s[arm].push(m); rows.push(row(`u${pad(u)}-${arm}`, u, arm, m));
    }
    chance.push(fulfilment(runs.Sh.signs, windows(runs.H.steps)));   // H's path, Sh's signs: fulfilment by chance
    await put(rows); console.log(`unit ${u}: done`);
  }

  const test = (name: string, x: string, y: string, k: 'F' | 'E') => { const d = s[x].map((m, i) => m[k] - s[y][i][k]); const t = signFlipUpper(d);
    return { name, a: x, b: y, measure: k, d, mean: t.mean, p: t.p, positive: d.filter(v => v > 0).length, negative: d.filter(v => v < 0).length }; };
  const prim = [test('P1', 'H', 'Sh', 'F'), test('P2', 'H', 'Sh', 'E')];
  const sec = [test('S1', 'H', 'Rv', 'F'), test('S2', 'H', 'Rv', 'E'), test('S3', 'H', 'Mk', 'F'), test('S4', 'H', 'Mk', 'E')];
  const hp = holm(prim.map(({ name, p }) => ({ name, p }))), hs = holm(sec.map(({ name, p }) => ({ name, p })));
  const P = prim.map(t => ({ ...t, ...hp.find(x => x.name === t.name)! })), S = sec.map(t => ({ ...t, ...hs.find(x => x.name === t.name)! }));
  const label: Record<string, string> = { P1: 'THE ORDER OF THE FICTION IS ENACTED', P2: 'THE ORDER OF THE FICTION DRAWS HER INTO THE WARP',
    S1: 'ENACTED MORE THAN ITS REVERSAL', S2: 'DRAWS HER IN MORE THAN ITS REVERSAL', S3: 'ENACTED MORE THAN ITS PAIRS', S4: 'DRAWS HER IN MORE THAN ITS PAIRS' };
  const readings = [...P, ...S].map(t => t.survives ? label[t.name] : `${t.name}: NOT CONFIRMED`);
  const avg = (x: string, f: (m: any) => number | null) => mean(s[x].map(f).filter((v): v is number => v !== null));
  const byArm = Object.fromEntries(ARMS.map(x => [x, { F: avg(x, m => m.F), E: avg(x, m => m.E), E_choice: avg(x, m => m.E_choice), E_flow: avg(x, m => m.E_flow),
    warpShare: avg(x, m => m.warpShare), linesOfFlight: avg(x, m => m.linesOfFlight), onArrival: avg(x, m => m.onArrival), lockedShare: avg(x, m => m.lockedShare),
    adjacencyJoined: avg(x, m => m.adjacency.joined), repeats: avg(x, m => m.adjacency.repeats), unitsWithNewGates: s[x].filter(m => m.gatesWritten.length).length }]));
  await put([row('analysis', null, null, { primary: P, secondary: S, readings, byArm, chanceF: { perUnit: chance, mean: mean(chance) }, signsPerUnit: SIGNS })]);
  console.log('analysis: ' + readings.join('; '));
}

if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
