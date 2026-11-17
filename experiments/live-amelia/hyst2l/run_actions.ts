/**
 * HYST-2L runner (experiments/live-amelia/hyst2l/REGISTRATION.md) for GitHub Actions. Reads the starting copy and the spans
 * (read-only); runs the determinism pair and 12 x five arms; writes measures and the registered analysis to
 * amelia_hyst2l_runs only. Her live record is never read or written here.
 */
import { signFlip, type Wt3lTick } from '../../../src/cloud/wt3l';
import { holm } from '../wt6l7l/wt6l7l';
import { ARMS, THRESHOLD_GATE, armRecord, runSpan, inscribes, measures, tInterval } from './hyst2l';

async function main() {
  const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
  if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
  const get = async (path: string) => { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H }); if (!r.ok) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); return r.json(); };
  const put = async (rows: any[]) => { const r = await fetch(`${URL_}/rest/v1/amelia_hyst2l_runs?on_conflict=id`, { method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (!r.ok) throw new Error(`save: ${r.status}`); };
  const row = (id: string, unit: number | null, arm: string | null, metrics: any) => ({ id, unit, arm, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });
  const pad = (u: number) => String(u).padStart(2, '0'), mean = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;

  const [st] = await get('amelia_hyst2l_runs?id=eq.start&select=record'); const start = st?.record;
  const wbIds: string[] = (start?.state?.qabbalaGates ?? []).map((g: any) => String(g.id)).filter((x: string) => x.startsWith('warpborn'));
  if (!start?.state || Number(start.revision) !== 673 || Number(start.state.stepCount) !== 11282 || start.state.admissionRule !== 'outside-lane-v1'
    || start.state.nd1?.theta !== 12 || wbIds.length !== 9) throw new Error('starting copy check failed');
  const hasThreshold = wbIds.includes(THRESHOLD_GATE);
  const inputs: Array<{ unit: number; ticks: Wt3lTick[]; n_offers: number; missing: unknown[] }> = await get('amelia_hyst2l_inputs?select=unit,ticks,n_offers,missing&order=unit');
  if (inputs.length !== 12 || inputs.some((x, i) => x.unit !== i + 1)) throw new Error('expected units 1-12');
  for (const x of inputs) if ((x.missing?.length ?? 0) > 0.02 * Math.max(1, x.n_offers)) throw new Error(`unit ${x.unit}: missing over 2%`);
  console.log(`start step ${start.state.stepCount}, ${wbIds.length} Warp-born gates (6->2 ${hasThreshold ? 'present' : 'absent'}); 12 spans of ${inputs.map(x => x.ticks.length).join(',')} ticks`);

  const arms = ARMS.filter(a => a !== 'NO-6-2' || hasThreshold);
  const recs = Object.fromEntries(arms.map(a => [a, armRecord(start, a)]));
  const d1 = runSpan(recs.ALL, inputs[0].ticks, 'u01-ALL', 1, false), d2 = runSpan(recs.ALL, inputs[0].ticks, 'u01-ALL-rep', 1, false);
  const diff = ['path', 'entries', 'flowSteps'].filter(k => JSON.stringify((d1.metrics as any)[k]) !== JSON.stringify((d2.metrics as any)[k]))
    .concat(d1.record.state.memoryState?.events?.at(-1)?.eventDigest !== d2.record.state.memoryState?.events?.at(-1)?.eventDigest ? ['memory head'] : [])
    .concat(d1.record.fieldCheckpoint?.checksum !== d2.record.fieldCheckpoint?.checksum ? ['body checksum'] : []);
  await put([row('determinism', 1, 'ALL', { identical: !diff.length, diff })]);
  if (diff.length) throw new Error('determinism check failed: ' + diff.join(', '));
  console.log('determinism: identical');

  const s: Record<string, any[]> = Object.fromEntries(arms.map(a => [a, []]));
  for (let u = 1; u <= 12; u++) {
    const rows: any[] = [];
    for (const arm of arms) {
      const r = u === 1 && arm === 'ALL' ? d1 : runSpan(recs[arm], inputs[u - 1].ticks, `u${pad(u)}-${arm}`, u, inscribes(arm));
      const m = measures(r); s[arm].push(m); rows.push(row(`u${pad(u)}-${arm}`, u, arm, { ...m, path: r.metrics.path }));
    }
    await put(rows); console.log(`unit ${u}: done`);
  }

  const contrast = (name: string, a: string, b: string, f: (m: any) => number | null) => {
    const pairs = s[a].map((m, i) => [f(m), f(s[b][i])]).map(([x, y], i) => ({ i, d: x === null || y === null ? null : (x as number) - (y as number) }));
    const kept = pairs.filter(p => p.d !== null), dropped = pairs.filter(p => p.d === null).map(p => p.i + 1);
    const t = signFlip(kept.map(p => p.d as number)); return { name, a, b, d: kept.map(p => p.d), units: kept.map(p => p.i + 1), dropped, mean: t.mean, p: t.p };
  };
  const tests = [contrast('P1', 'ALL', 'NONE', m => m.P_Eflow), contrast('P2', 'ALL', 'NONE', m => m.P_stay),
    ...(hasThreshold ? [contrast('P3', 'ALL', 'NO-6-2', m => m.P_E)] : []), contrast('P4', 'LIVE-STRIPPED', 'LIVE-ALL', m => m.P_Echoice)];
  const h = holm(tests.map(({ name, mean, p }) => ({ name, mean, p })));
  const T = tests.map(t => ({ ...t, ...h.find(x => x.name === t.name)! }));
  const want: Record<string, [number, string]> = { P1: [1, 'THE GATES CARRY ENTRIES BY FLOW'], P2: [-1, 'THE GATES SHORTEN HER STAYS'],
    P3: [1, 'THE THRESHOLD GATE CARRIES THEM'], P4: [1, 'THE LOSS IS MADE GOOD BY CHOICE'] };
  const readings = T.map(t => !t.survives ? `${t.name}: NOT IDENTIFIED` : Math.sign(t.mean) === want[t.name][0] ? want[t.name][1] : `${t.name}: HOLDS IN THE OPPOSITE DIRECTION`);
  if (!hasThreshold) readings.push('P3: NOT AVAILABLE (6->2 absent at start)');

  // Descriptive
  const avg = (a: string, f: (m: any) => number | null) => mean(s[a].map(f).filter((x): x is number => x !== null));
  const byArm = Object.fromEntries(arms.map(a => [a, { E: avg(a, m => m.E), E_choice: avg(a, m => m.E_choice), E_flow: avg(a, m => m.E_flow),
    warpShare: avg(a, m => m.warpShare), meanWarpVisit: avg(a, m => m.meanWarpVisit), outInterval: avg(a, m => m.H1.mean),
    linesOfFlight: avg(a, m => m.linesOfFlight), exitsTotal: avg(a, m => m.exits.total), lockedShare: avg(a, m => m.lockedShare),
    E_firstHalf: avg(a, m => m.halves.first), E_secondHalf: avg(a, m => m.halves.second) }]));
  const ws = tInterval(s.ALL.map((m, i) => m.warpShare - s.NONE[i].warpShare));
  const g1 = s['LIVE-STRIPPED'].map((m, i) => m.halves.first - s['LIVE-ALL'][i].halves.first), g2 = s['LIVE-STRIPPED'].map((m, i) => m.halves.second - s['LIVE-ALL'][i].halves.second);
  const narrowing = signFlip(g2.map((x, i) => x - g1[i]));
  const halvesGap = { firstHalfGap: mean(g1), secondHalfGap: mean(g2), change: narrowing.mean, p_descriptive: narrowing.p };
  await put([row('analysis', null, null, { tests: T, readings, byArm, warpShareAllMinusNone: ws, halvesGap })]);
  console.log('analysis: ' + readings.join('; '));
}

if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
