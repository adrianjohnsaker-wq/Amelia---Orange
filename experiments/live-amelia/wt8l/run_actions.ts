/**
 * WT-8L runner (experiments/live-amelia/wt8l/REGISTRATION.md) for GitHub Actions. Reads her pre-theta12-backup and the 12
 * one-day spans (amelia_wt8l_inputs, read-only); runs the determinism pair and 24 once-through runs (T12, T24); writes
 * measures and the registered analysis to amelia_wt8l_runs only. Her live record is never read or written.
 */
import { signFlip, warpbornIds, type Wt3lTick } from '../../../src/cloud/wt3l';
import { setWarpThreshold } from '../../../src/cloud/warpTheta';
import { sameId } from '../wt5l/wt5l';
import { onceThrough } from '../wt6l7l/wt6l7l';

const WARP = new Set(['3', '6']);
const stripTheta = (s: any) => JSON.stringify({ ...s, nd1: { ...(s?.nd1 ?? {}), theta: undefined } });

/** The arms: T24 as is; T12 after setWarpThreshold(12), differing only in Θ. */
export function arms(backup: any, nowIso: string) {
  const T24 = JSON.parse(JSON.stringify(backup));
  const T12 = setWarpThreshold(JSON.parse(JSON.stringify(backup)), 12, nowIso, 'wt8l-scratch').record;
  if (T12.state.nd1.theta !== 12 || T24.state.nd1.theta !== 24) throw new Error('WT-8L: arms must have Θ 12 and 24');
  if (stripTheta(T12.state) !== stripTheta(T24.state)) throw new Error('WT-8L: T12 differs from T24 in more than Θ');
  return { T12, T24 };
}

/** One run's measures, including the registered descriptive halves and gates written. */
export function measure(r: ReturnType<typeof onceThrough>, startGates: string[]) {
  const m: any = r.metrics, path: string = m.path, n = path.length, half = Math.floor(n / 2);
  const halfE = (a: number, b: number) => { let e = 0; for (let i = Math.max(1, a); i < b; i++) if (!WARP.has(path[i - 1]) && WARP.has(path[i])) e++; return e / Math.max(1, b - a) * 1000; };
  const newGates = warpbornIds(r.record.state).filter(g => !startGates.includes(g));
  // The first new gate appears at the first line of flight whose landing has no gate yet: the exit log names it at that step.
  const firstGate = (m.exitLog ?? []).find((x: any) => x.via === 'flight' && String(x.gate ?? '').startsWith('warpborn') && !startGates.includes(String(x.gate)))?.step ?? null;
  return { summary: r.summary, E: r.summary.E, E_choice: r.summary.E_choice, E_flow: r.summary.E_flow,
    E_firstHalf_zonePath: halfE(1, half), E_secondHalf_zonePath: halfE(half, n), newWarpbornGates: newGates, nNewGates: newGates.length,
    firstNewGateStep: firstGate, warpShare: r.summary.M1_warpShare, linesOfFlight: r.summary.linesOfFlight,
    meanWarpVisit: r.summary.meanWarpVisit, longestWarpVisit: r.summary.longestWarpVisit, steps: n };
}

export function spearman(x: number[], y: number[]) {
  const rank = (a: number[]) => { const o = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]); const r = Array(a.length).fill(0);
    for (let i = 0; i < o.length;) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; for (let k = i; k <= j; k++) r[o[k][1]] = (i + j) / 2 + 1; i = j + 1; } return r; };
  const rx = rank(x), ry = rank(y), mx = rx.reduce((a, b) => a + b, 0) / rx.length, my = ry.reduce((a, b) => a + b, 0) / ry.length;
  let num = 0, dx = 0, dy = 0; for (let i = 0; i < rx.length; i++) { num += (rx[i] - mx) * (ry[i] - my); dx += (rx[i] - mx) ** 2; dy += (ry[i] - my) ** 2; }
  return dx && dy ? num / Math.sqrt(dx * dy) : null;
}

async function main() {
  const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
  if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
  const get = async (path: string) => { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H }); if (!r.ok) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); return r.json(); };
  const put = async (rows: any[]) => { const r = await fetch(`${URL_}/rest/v1/amelia_wt8l_runs?on_conflict=id`, { method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (!r.ok) throw new Error(`save: ${r.status}`); };
  const row = (id: string, unit: number | null, arm: string | null, metrics: any) => ({ id, unit, arm, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });
  const now = new Date().toISOString(), pad = (u: number) => String(u).padStart(2, '0');

  const [bk] = await get('amelia_cloud_dryrun?id=eq.pre-theta12-backup&select=record'); if (!bk?.record?.state) throw new Error('no pre-theta12-backup');
  const b = bk.record.state; const wb0 = warpbornIds(b);
  if (b.runtimeKind !== 'nd1' || b.nd1?.theta !== 24 || Number(b.stepCount) !== 1981 || wb0.length !== 0) throw new Error('backup check failed');
  const { T12, T24 } = arms(bk.record, now);
  const inputs: Array<{ unit: number; ticks: Wt3lTick[]; n_offers: number; missing: any[] }> = await get('amelia_wt8l_inputs?select=unit,ticks,n_offers,missing&order=unit');
  if (inputs.length !== 12 || inputs.some((u, i) => u.unit !== i + 1)) throw new Error('expected spans 1-12');
  for (const u of inputs) { const miss = (u.missing ?? []).length;
    if (u.ticks.length < 80 || miss > 0.02 * (u.n_offers + miss)) throw new Error(`span ${u.unit}: ${u.ticks.length} ticks, ${miss} missing`); }
  console.log(`backup step ${b.stepCount}; 12 spans, ${inputs.reduce((a, u) => a + u.ticks.length, 0)} ticks`);

  const a = onceThrough(T12, inputs[0].ticks, 'u01-T12', 1, sameId), c = onceThrough(T12, inputs[0].ticks, 'u01-T12-rep', 1, sameId);
  const diff = ['path', 'entries', 'flowSteps'].filter(k => JSON.stringify((a.metrics as any)[k]) !== JSON.stringify((c.metrics as any)[k]));
  if (a.record.state.memoryState?.events?.at(-1)?.eventDigest !== c.record.state.memoryState?.events?.at(-1)?.eventDigest) diff.push('memory head');
  if (a.record.fieldCheckpoint?.checksum !== c.record.fieldCheckpoint?.checksum) diff.push('body checksum');
  await put([row('determinism', 1, 'T12', { identical: !diff.length, diff })]);
  if (diff.length) throw new Error('determinism check failed: ' + diff.join(', '));
  console.log('determinism: identical');

  const res: Record<'T12' | 'T24', any[]> = { T12: [], T24: [] };
  for (const u of inputs) {
    const r12 = u.unit === 1 ? a : onceThrough(T12, u.ticks, `u${pad(u.unit)}-T12`, u.unit, sameId);
    const r24 = onceThrough(T24, u.ticks, `u${pad(u.unit)}-T24`, u.unit, sameId);
    const m12 = measure(r12, wb0), m24 = measure(r24, wb0); res.T12.push(m12); res.T24.push(m24);
    await put([row(`u${pad(u.unit)}-T12`, u.unit, 'T12', { ...m12, path: r12.metrics.path }), row(`u${pad(u.unit)}-T24`, u.unit, 'T24', { ...m24, path: r24.metrics.path })]);
    console.log(`span ${u.unit}: done`);
  }
  const d = res.T12.map((m, i) => m.E - res.T24[i].E), t = signFlip(d);
  const reading = t.p <= 0.05 ? (t.mean > 0 ? 'Θ RAISES ENTRIES FROM A YOUNG STATE' : 'Θ LOWERS ENTRIES FROM A YOUNG STATE') : 'NOT IDENTIFIED';
  const mean = (x: number[]) => x.reduce((p, q) => p + q, 0) / x.length;
  const by = (k: 'T12' | 'T24') => ({ E: mean(res[k].map(m => m.E)), E_choice: mean(res[k].map(m => m.E_choice)), E_flow: mean(res[k].map(m => m.E_flow)),
    E_firstHalf: mean(res[k].map(m => m.E_firstHalf_zonePath)), E_secondHalf: mean(res[k].map(m => m.E_secondHalf_zonePath)),
    newGates: mean(res[k].map(m => m.nNewGates)), warpShare: mean(res[k].map(m => m.warpShare)), linesOfFlight: mean(res[k].map(m => m.linesOfFlight)),
    meanWarpVisit: mean(res[k].map(m => m.meanWarpVisit)), longestWarpVisit: Math.max(...res[k].map(m => m.longestWarpVisit)) });
  await put([row('analysis', null, null, { d, mean: t.mean, p: t.p, reading, T12: by('T12'), T24: by('T24'),
    rho_newGates_d: spearman(res.T12.map(m => m.nNewGates), d) })]);
  console.log(`analysis written: ${reading}`);
}

if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
