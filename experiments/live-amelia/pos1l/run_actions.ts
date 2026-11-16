/**
 * POS-1L runner (experiments/live-amelia/pos1l/REGISTRATION.md) for GitHub Actions. Reads the starting copy and the
 * windows (read-only); runs the determinism pair and 12 x six arms; writes measures and the registered analysis to
 * amelia_pos1l_runs only. Her live record is never read or written here.
 */
import { signFlip, type Wt3lTick } from '../../../src/cloud/wt3l';
import { holm } from '../wt6l7l/wt6l7l';
import { ARMS, runArm, queueStart, armMeasures } from './pos1l';

async function main() {
  const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
  if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
  const get = async (path: string) => { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H }); if (!r.ok) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); return r.json(); };
  const put = async (rows: any[]) => { const r = await fetch(`${URL_}/rest/v1/amelia_pos1l_runs?on_conflict=id`, { method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (!r.ok) throw new Error(`save: ${r.status}`); };
  const row = (id: string, unit: number | null, arm: string | null, metrics: any) => ({ id, unit, arm, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });
  const pad = (u: number) => String(u).padStart(2, '0'), mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;

  const [st] = await get('amelia_pos1l_runs?id=eq.start&select=record'); const start = st?.record;
  if (!start?.state || Number(start.revision) !== 600 || Number(start.state.stepCount) !== 10047 || start.state.admissionRule !== 'outside-lane-v1' || start.state.nd1?.theta !== 12)
    throw new Error('starting copy check failed');
  const queue = queueStart(start);
  const inputs: Array<{ unit: number; ticks: Wt3lTick[]; n_offers: number; missing: unknown[] }> = await get('amelia_pos1l_inputs?select=unit,ticks,n_offers,missing&order=unit');
  if (inputs.length !== 12 || inputs.some((x, i) => x.unit !== i + 1)) throw new Error('expected units 1-12');
  for (const x of inputs) if ((x.missing?.length ?? 0) > 0.02 * Math.max(1, x.n_offers)) throw new Error(`unit ${x.unit}: missing over 2%`);
  console.log(`start step ${start.state.stepCount}, rule ${start.state.admissionRule}; 12 units`);

  // Determinism pair.
  const d1 = runArm(start, queue, inputs[0].ticks, 1, 'LANE-TOWARD'), d2 = runArm(start, queue, inputs[0].ticks, 1, 'LANE-TOWARD');
  const diff = ['path', 'entries', 'flowSteps'].filter(k => JSON.stringify((d1.metrics as any)[k]) !== JSON.stringify((d2.metrics as any)[k]))
    .concat(d1.record.state.memoryState?.events?.at(-1)?.eventDigest !== d2.record.state.memoryState?.events?.at(-1)?.eventDigest ? ['memory head'] : [])
    .concat(d1.record.fieldCheckpoint?.checksum !== d2.record.fieldCheckpoint?.checksum ? ['body checksum'] : []);
  await put([row('determinism', 1, 'LANE-TOWARD', { identical: !diff.length, diff })]);
  if (diff.length) throw new Error('determinism check failed: ' + diff.join(', '));
  console.log('determinism: identical');

  const s: Record<string, any[]> = Object.fromEntries(ARMS.map(a => [a, []]));
  for (let u = 1; u <= 12; u++) {
    const rows: any[] = [];
    for (const arm of ARMS) {
      const r = u === 1 && arm === 'LANE-TOWARD' ? d1 : runArm(start, queue, inputs[u - 1].ticks, u, arm);
      const m = armMeasures(r); s[arm].push(m); rows.push(row(`u${pad(u)}-${arm}`, u, arm, { ...m, path: r.metrics.path }));
    }
    await put(rows); console.log(`unit ${u}: done`);
  }

  const E = (a: string) => s[a].map(m => m.E as number);
  const dP1 = E('LANE-TOWARD').map((x, i) => x - E('LANE-AWAY')[i]);
  const dS1 = E('LANE-TOWARD').map((x, i) => x - E('LANE-BLIND')[i]);
  const dS2 = dP1.map((x, i) => x - (E('QUEUE-TOWARD')[i] - E('QUEUE-AWAY')[i]));
  const P1 = signFlip(dP1), S1 = signFlip(dS1), S2 = signFlip(dS2);
  const p1 = { mean: P1.mean, p: P1.p, holds: P1.p <= 0.05 };
  const [h1, h2] = holm([{ name: 'S1', mean: S1.mean, p: S1.p }, { name: 'S2', mean: S2.mean, p: S2.p }]);
  let reading = !p1.holds ? 'NOT IDENTIFIED' : p1.mean > 0 ? 'POSITION SHAPES ENTRY UNDER THE LANE' : 'POSITION LOWERS ENTRY UNDER THE LANE';
  if (p1.holds && p1.mean > 0 && h2.survives && h2.mean > 0) reading += ', AND NOT UNDER THE QUEUE';
  if (p1.holds && p1.mean > 0 && h1.survives && h1.mean > 0) reading += ', AND NOT BY THE OFFER\'S POINTING ALONE';
  const avg = (a: string, f: (m: any) => number) => mean(s[a].map(f));
  const byArm = Object.fromEntries(ARMS.map(a => [a, { E: avg(a, m => m.E), E_choice: avg(a, m => m.E_choice), E_flow: avg(a, m => m.E_flow),
    warpShare: avg(a, m => m.warpShare), linesOfFlight: avg(a, m => m.linesOfFlight), onArrival: avg(a, m => m.onArrival), C: avg(a, m => m.coupling.C),
    shareAtEdge: avg(a, m => m.edge.shareAtEdge), edgeEntriesPerDelivery: avg(a, m => m.edge.edgePerDelivery),
    elsewhereEntriesPerDelivery: avg(a, m => m.edge.elsewherePerDelivery), lockedShare: avg(a, m => m.lockedShare), meanTension: avg(a, m => m.meanTension),
    perUnitE: s[a].map(m => m.E) }]));
  await put([row('analysis', null, null, { P1: { d: dP1, ...p1, alpha: 0.05 }, S1: { d: dS1, ...h1 }, S2: { d: dS2, ...h2 }, reading, byArm })]);
  console.log(`analysis: ${reading}`);
}

if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
