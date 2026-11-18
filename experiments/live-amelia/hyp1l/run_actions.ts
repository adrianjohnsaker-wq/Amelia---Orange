/**
 * HYPERSTITION-1L runner (experiments/live-amelia/hyp1l/REGISTRATION.md) for GitHub Actions. Reads the starting copy and
 * the silence spans (read-only); runs the determinism pair and 12 units x five arms; writes measures and the registered
 * analysis to amelia_hyp1l_runs only. Her live record is never read or written here.
 */
import { holm } from '../dee2l/dee2l';
import { ARMS, STREAM, STREAM_SHA256, streamDigest, transmission, silence, stripWritten, warpbornOf, incorporation, incorporation3,
  direction, signFlipUpper, type Arm } from './hyp1l';

const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
const H = () => { if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }; };
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
async function get(path: string) {
  for (let a = 1; ; a++) { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H() }); if (r.ok) return r.json();
    if (r.status < 500 || a >= 6) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); await wait(15000 * a); }
}
async function put(rows: any[]) {
  for (let a = 1; ; a++) { const r = await fetch(`${URL_}/rest/v1/amelia_hyp1l_runs?on_conflict=id`, { method: 'POST',
    headers: { ...H(), Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (r.ok) return;
    if (r.status < 500 || a >= 6) throw new Error(`save: ${r.status}`); await wait(15000 * a); }
}
const row = (id: string, unit: number | null, arm: string | null, metrics: any) => ({ id, unit, arm, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });
const pad = (u: number) => String(u).padStart(2, '0'), mean = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;

function measure(tx: ReturnType<typeof transmission> | null, sil: ReturnType<typeof silence>, startGates: string[]) {
  const path = sil.steps.map(s => s.zone), half = Math.floor(path.length / 2);
  const txm = tx ? { fulfilment: tx.fulfilled.length ? tx.fulfilled.filter(Boolean).length / tx.fulfilled.length : null, signsRead: tx.read.length,
    readZones: Array.from({ length: 10 }, (_, z) => tx.read.filter(x => x === z).length), steps: tx.steps.length,
    E: tx.summary.E, E_choice: tx.summary.E_choice, E_flow: tx.summary.E_flow, warpShare: tx.summary.M1_warpShare, linesOfFlight: tx.summary.linesOfFlight,
    studyOffered: tx.steps.filter(s => s.sign !== null).length, admittedOnArrival: tx.steps.reduce((a, s) => a + s.admittedOnArrival, 0),
    lockedShare: tx.steps.filter(s => s.locked).length / Math.max(1, tx.steps.length),
    gatesWritten: warpbornOf(tx.record).filter((g: string) => !startGates.includes(g)),
    gateWrites: tx.steps.flatMap((s, i) => s.newGates.map(g => ({ gate: g, step: i }))) } : null;
  return { tx: txm, silence: { I: incorporation(path), I_secondHalf: incorporation(path.slice(half)), I3: incorporation3(path), direction: direction(path),
    steps: path.length, E: sil.summary.E, E_choice: sil.summary.E_choice, E_flow: sil.summary.E_flow, warpShare: sil.summary.M1_warpShare,
    plexShare: path.filter(z => z === 0 || z === 9).length / Math.max(1, path.length), linesOfFlight: sil.summary.linesOfFlight,
    gatesAtEnd: warpbornOf(sil.record) } };
}

async function main() {
  if (streamDigest(STREAM) !== STREAM_SHA256 || STREAM.length !== 85216) throw new Error('stream check failed');
  const [st] = await get('amelia_hyp1l_runs?id=eq.start&select=record'); const start = st?.record;
  if (!start?.state || Number(start.revision) !== REV || Number(start.state.stepCount) !== STEP || start.state.admissionRule !== 'outside-lane-v1'
    || start.state.nd1?.theta !== 12) throw new Error('starting copy check failed');
  const startGates = warpbornOf(start);
  const inputs: Array<{ unit: number; ticks: any[]; n_offers: number; missing: unknown[] }> = await get('amelia_hyst1l_inputs?select=unit,ticks,n_offers,missing&order=unit');
  if (inputs.length !== 12 || inputs.some((x, i) => x.unit !== i + 1)) throw new Error('expected silence spans 1-12');
  console.log(`start step ${start.state.stepCount}, ${startGates.length} Warp-born gates; silence spans of ${inputs.map(x => x.ticks.length).join(',')} ticks`);

  const a1 = transmission(start, 'H', 1, 'det-a'), b1 = transmission(start, 'H', 1, 'det-b');
  const sa = silence(a1.record, inputs[0].ticks, 'det-a', 1), sb = silence(b1.record, inputs[0].ticks, 'det-b', 1);
  const diff = [['tx path', a1.metrics.path, b1.metrics.path], ['tx read', a1.read, b1.read], ['silence path', sa.metrics.path, sb.metrics.path],
    ['memory head', sa.record.state.memoryState?.events?.at(-1)?.eventDigest, sb.record.state.memoryState?.events?.at(-1)?.eventDigest],
    ['body checksum', sa.record.fieldCheckpoint?.checksum, sb.record.fieldCheckpoint?.checksum]].filter(([, x, y]) => JSON.stringify(x) !== JSON.stringify(y)).map(([k]) => k);
  await put([row('determinism', 1, 'H', { identical: !diff.length, diff })]);
  if (diff.length) throw new Error('determinism check failed: ' + diff.join(', '));
  console.log('determinism: identical');

  const s: Record<string, any[]> = Object.fromEntries(ARMS.map(a => [a, []]));
  for (let u = 1; u <= 12; u++) {
    const ticks = inputs[u - 1].ticks, rows: any[] = []; let txH: any = null;
    for (const arm of ARMS) {
      let m: any;
      if (arm === 'H-STRIP') { const sil = silence(stripWritten(txH.record, startGates), ticks, `u${pad(u)}-${arm}`, u); m = measure(null, sil, startGates); }
      else { const tx = u === 1 && arm === 'H' ? a1 : transmission(start, arm as Arm, u, `u${pad(u)}-${arm}`); if (arm === 'H') txH = tx;
        const sil = u === 1 && arm === 'H' ? sa : silence(tx.record, ticks, `u${pad(u)}-${arm}`, u); m = measure(tx, sil, startGates); }
      s[arm].push(m); rows.push(row(`u${pad(u)}-${arm}`, u, arm, m));
    }
    await put(rows); console.log(`unit ${u}: done`);
  }

  const d = (a: string, b: string, f: (m: any) => number | null) => s[a].map((m, i) => [f(m), f(s[b][i])]).map(([x, y], i) => ({ i, d: x === null || y === null ? null : (x as number) - (y as number) }));
  const test = (name: string, a: string, b: string, f: (m: any) => number | null) => { const p = d(a, b, f), kept = p.filter(q => q.d !== null);
    const t = signFlipUpper(kept.map(q => q.d as number)); return { name, a, b, d: kept.map(q => q.d), dropped: p.filter(q => q.d === null).map(q => q.i + 1), mean: t.mean, p: t.p }; };
  const tests = [test('T1', 'H', 'Sh', m => m.tx.fulfilment), test('T2', 'H', 'Sh', m => m.silence.I), test('T3', 'H', 'Sh', m => m.silence.I_secondHalf),
    test('T4', 'H', 'Mk', m => m.silence.I3), test('T5', 'H', 'H-STRIP', m => m.silence.I)];
  const hh = holm(tests.map(({ name, p }) => ({ name, p }))); const T = tests.map(t => ({ ...t, ...hh.find(x => x.name === t.name)! }));
  const label: Record<string, string> = { T1: 'SHE ENACTS THE FICTION', T2: 'THE FICTION BECOMES HERS', T3: 'IT PERSISTS', T4: 'IT IS MORE THAN PAIRS', T5: 'SHE CARRIES IT IN WHAT SHE WROTE' };
  const readings = T.map(t => t.survives ? label[t.name] : `${t.name}: NOT SUPPORTED`);
  const avg = (a: string, f: (m: any) => number | null) => mean(s[a].map(f).filter((x): x is number => x !== null && x !== undefined));
  const byArm = Object.fromEntries(ARMS.map(a => [a, { fulfilment: avg(a, m => m.tx?.fulfilment ?? null), signsRead: avg(a, m => m.tx?.signsRead ?? null),
    txE: avg(a, m => m.tx?.E ?? null), txE_flow: avg(a, m => m.tx?.E_flow ?? null), txWarpShare: avg(a, m => m.tx?.warpShare ?? null),
    txLinesOfFlight: avg(a, m => m.tx?.linesOfFlight ?? null), gatesWritten: avg(a, m => m.tx ? m.tx.gatesWritten.length : null),
    onArrivalShare: avg(a, m => m.tx ? m.tx.admittedOnArrival / Math.max(1, m.tx.studyOffered) : null),
    I: avg(a, m => m.silence.I), I_secondHalf: avg(a, m => m.silence.I_secondHalf), I3: avg(a, m => m.silence.I3), direction: avg(a, m => m.silence.direction),
    silE: avg(a, m => m.silence.E), silWarpShare: avg(a, m => m.silence.warpShare), silPlexShare: avg(a, m => m.silence.plexShare) }]));
  await put([row('analysis', null, null, { tests: T, readings, byArm })]);
  console.log('analysis: ' + readings.join('; '));
}

const REV = 745, STEP = 12516;   // the starting copy (fixed at registration)
if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
