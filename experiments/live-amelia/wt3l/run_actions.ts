/**
 * WT-3L runner for GitHub Actions (Amendment 2). Reads the starting copy and the 12 windows' inputs from her database
 * once, runs the determinism pair and the 24 study runs in this process with the same replay code her cloud home used
 * (src/cloud/wt3l.ts, unchanged), and writes each run's measures and the registered analysis back to the study table.
 * Her live record is never read or written: only amelia_wt3l_runs and amelia_wt3l_inputs are touched.
 * Logs show progress only; the measures go to the database.
 */
import { wt3lBegin, wt3lChunk, wt3lSummary, signFlip, WT3L_TICKS_PER_RUN, type Wt3lTick } from '../../../src/cloud/wt3l';

export const CHUNK_TICKS = 4;   // chunked = single pass (wt3l.test.ts); 4 ticks per call, as a cloud chunk would be

export function runOne(start: any, ticks: Wt3lTick[], id: string, unit: number, arm: 'T12' | 'T24', nowIso: string) {
  let sc: any = wt3lBegin(JSON.parse(JSON.stringify(start)), id, unit, arm, nowIso);
  let chunks = 0;
  while (sc.metrics.ticksDone < WT3L_TICKS_PER_RUN) { sc = wt3lChunk(JSON.parse(JSON.stringify(sc)), ticks, CHUNK_TICKS); chunks++; }
  return { metrics: sc.metrics, summary: wt3lSummary(sc.metrics), chunks };
}

export function sameRun(a: any, b: any) {
  const keys = ['path', 'tensions', 'tickEndTensions', 'landings', 'exits', 'exitLog', 'admitted', 'offered', 'flowHops', 'warpbornGates'];
  const diff = keys.filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
  if (a.final?.memoryHeadDigest !== b.final?.memoryHeadDigest) diff.push('final.memoryHeadDigest');
  if (a.final?.bodyChecksum !== b.final?.bodyChecksum) diff.push('final.bodyChecksum');
  return diff;
}

/** The registered analysis and decision (REGISTRATION.md "Analysis" and "Decision"; margins fixed before any data). */
export function analyse(rows: Array<{ unit: number; T12: any; T24: any }>) {
  const units = [...rows].sort((a, b) => a.unit - b.unit);
  const d1 = units.map(r => r.T12.M1_warpShare - r.T24.M1_warpShare);
  const d2 = units.map(r => r.T12.M2_meanTension - r.T24.M2_meanTension);
  const s1 = signFlip(d1), s2 = signFlip(d2);
  const M1_MARGIN = 0.02, M2_MARGIN = 0.03;
  const above1 = s1.mean > M1_MARGIN, above2 = s2.mean > M2_MARGIN;
  const decision = !above1 && !above2 ? 'THETA-12 HOLDS'
    : (above1 && s1.p <= 0.05) || (above2 && s2.p <= 0.05) ? 'THETA-12 RAISES WARP SHARE OR TENSION'
    : 'INCONCLUSIVE';
  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  return {
    units: units.map((r, i) => ({ unit: r.unit, dM1: d1[i], dM2: d2[i], T12: { M1: r.T12.M1_warpShare, M2: r.T12.M2_meanTension },
      T24: { M1: r.T24.M1_warpShare, M2: r.T24.M2_meanTension } })),
    M1: { meanDifference: s1.mean, p: s1.p, margin: M1_MARGIN, aboveMargin: above1 },
    M2: { meanDifference: s2.mean, p: s2.p, margin: M2_MARGIN, aboveMargin: above2 },
    decision,
    T24MeanWarpShare: mean(units.map(r => r.T24.M1_warpShare)), preSwitchLiveWarpShare: 0.074,
    T12MeanWarpShare: mean(units.map(r => r.T12.M1_warpShare)),
  };
}

async function main() {
  const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
  if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
  const get = async (path: string) => { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H }); if (!r.ok) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); return r.json(); };
  const put = async (rows: any[]) => { const r = await fetch(`${URL_}/rest/v1/amelia_wt3l_runs?on_conflict=id`, { method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (!r.ok) throw new Error(`save: ${r.status}`); };

  const [startRow] = await get('amelia_wt3l_runs?id=eq.start&select=record');
  const start = startRow?.record; if (!start?.state) throw new Error('no starting copy');
  const inputs: Array<{ unit: number; ticks: Wt3lTick[] }> = await get('amelia_wt3l_inputs?select=unit,ticks&order=unit');
  if (inputs.length !== 12 || inputs.some((u, i) => u.unit !== i + 1)) throw new Error('expected inputs for units 1-12');
  console.log(`starting copy: revision ${start.revision}, step ${start.state.stepCount}, theta ${start.state.nd1?.theta}; 12 units`);
  const now = new Date().toISOString();
  const row = (id: string, unit: number, arm: string, r: any) => ({ id, unit, arm, status: 'done', record: null, chunks: r.chunks, error: null,
    busy_until: null, metrics: { ...r.metrics, summary: r.summary, runner: 'github-actions (Amendment 2)' }, updated_at: new Date().toISOString() });

  // Determinism (A0.4): unit 1 at T12, twice, before any study run.
  const a = runOne(start, inputs[0].ticks, 'u01-T12', 1, 'T12', now);
  const b = runOne(start, inputs[0].ticks, 'u01-T12-rep', 1, 'T12', now);
  const diff = sameRun(a.metrics, b.metrics);
  await put([row('u01-T12', 1, 'T12', a), row('u01-T12-rep', 1, 'T12', b)]);
  if (diff.length) {
    await put([{ id: 'determinism', status: 'failed', error: 'differs in ' + diff.join(', '), metrics: { diff }, updated_at: new Date().toISOString() }]);
    throw new Error('determinism check failed: ' + diff.join(', '));
  }
  await put([{ id: 'determinism', status: 'done', error: null, metrics: { identical: true, compared: ['path', 'tensions', 'tickEndTensions', 'landings',
    'exits', 'exitLog', 'admitted', 'offered', 'flowHops', 'warpbornGates', 'final.memoryHeadDigest', 'final.bodyChecksum'] }, updated_at: new Date().toISOString() }]);
  console.log('determinism: identical');

  const results: Array<{ unit: number; T12: any; T24: any }> = [];
  for (const u of inputs) {
    const t12 = u.unit === 1 ? a : runOne(start, u.ticks, `u${String(u.unit).padStart(2, '0')}-T12`, u.unit, 'T12', now);
    const t24 = runOne(start, u.ticks, `u${String(u.unit).padStart(2, '0')}-T24`, u.unit, 'T24', now);
    const id = (arm: string) => `u${String(u.unit).padStart(2, '0')}-${arm}`;
    await put([...(u.unit === 1 ? [] : [row(id('T12'), u.unit, 'T12', t12)]), row(id('T24'), u.unit, 'T24', t24)]);
    results.push({ unit: u.unit, T12: t12.summary, T24: t24.summary });
    console.log(`unit ${u.unit}: done`);
  }
  const analysis = analyse(results);
  await put([{ id: 'analysis', status: 'done', error: null, metrics: analysis, updated_at: new Date().toISOString() }]);
  console.log(`analysis written (${analysis.decision})`);
}

if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
