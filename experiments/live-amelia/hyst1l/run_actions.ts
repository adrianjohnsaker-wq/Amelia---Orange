/**
 * HYST-1L runner (experiments/live-amelia/hyst1l/REGISTRATION.md) for GitHub Actions. Reads the starting copy and the
 * spans (read-only); runs the determinism pair and 12 x five arms; writes measures and the registered analysis to
 * amelia_hyst1l_runs only. Her live record is never read or written here.
 */
import { signFlip, type Wt3lTick } from '../../../src/cloud/wt3l';
import { holm } from '../wt6l7l/wt6l7l';
import { ARMS, armRecord, runSpan, inscribes, h1, h2, h3, describe } from './hyst1l';

async function main() {
  const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
  if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
  const get = async (path: string) => { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H }); if (!r.ok) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); return r.json(); };
  const put = async (rows: any[]) => { const r = await fetch(`${URL_}/rest/v1/amelia_hyst1l_runs?on_conflict=id`, { method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (!r.ok) throw new Error(`save: ${r.status}`); };
  const row = (id: string, unit: number | null, arm: string | null, metrics: any) => ({ id, unit, arm, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });
  const pad = (u: number) => String(u).padStart(2, '0'), mean = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;

  const [st] = await get('amelia_hyst1l_runs?id=eq.start&select=record'); const start = st?.record;
  const wb = (start?.state?.qabbalaGates ?? []).filter((g: any) => String(g.id).startsWith('warpborn')).length;
  if (!start?.state || Number(start.revision) !== 673 || Number(start.state.stepCount) !== 11282 || start.state.admissionRule !== 'outside-lane-v1'
    || start.state.nd1?.theta !== 12 || wb !== 9) throw new Error('starting copy check failed');
  const inputs: Array<{ unit: number; ticks: Wt3lTick[]; n_offers: number; missing: unknown[] }> = await get('amelia_hyst1l_inputs?select=unit,ticks,n_offers,missing&order=unit');
  if (inputs.length !== 12 || inputs.some((x, i) => x.unit !== i + 1)) throw new Error('expected units 1-12');
  for (const x of inputs) if ((x.missing?.length ?? 0) > 0.02 * Math.max(1, x.n_offers)) throw new Error(`unit ${x.unit}: missing over 2%`);
  console.log(`start step ${start.state.stepCount}, ${wb} Warp-born gates; 12 spans of ${inputs.map(x => x.ticks.length).join(',')} ticks`);

  const recs = Object.fromEntries(ARMS.map(a => [a, armRecord(start, a)]));
  const d1 = runSpan(recs.ALL, inputs[0].ticks, 'u01-ALL', 1, false), d2 = runSpan(recs.ALL, inputs[0].ticks, 'u01-ALL-rep', 1, false);
  const diff = ['path', 'entries', 'flowSteps'].filter(k => JSON.stringify((d1.metrics as any)[k]) !== JSON.stringify((d2.metrics as any)[k]))
    .concat(d1.record.state.memoryState?.events?.at(-1)?.eventDigest !== d2.record.state.memoryState?.events?.at(-1)?.eventDigest ? ['memory head'] : [])
    .concat(d1.record.fieldCheckpoint?.checksum !== d2.record.fieldCheckpoint?.checksum ? ['body checksum'] : []);
  await put([row('determinism', 1, 'ALL', { identical: !diff.length, diff })]);
  if (diff.length) throw new Error('determinism check failed: ' + diff.join(', '));
  console.log('determinism: identical');

  const s: Record<string, any[]> = Object.fromEntries(ARMS.map(a => [a, []]));
  for (let u = 1; u <= 12; u++) {
    const rows: any[] = [];
    for (const arm of ARMS) {
      const r = u === 1 && arm === 'ALL' ? d1 : runSpan(recs[arm], inputs[u - 1].ticks, `u${pad(u)}-${arm}`, u, inscribes(arm));
      const zones = r.steps.map(x => x.zone);
      const m = { H1: h1(zones), H2: h2(r.steps.map(x => x.tension)), H3: h3(r.steps), ...describe(r) };
      s[arm].push(m); rows.push(row(`u${pad(u)}-${arm}`, u, arm, { ...m, path: r.metrics.path }));
    }
    await put(rows); console.log(`unit ${u}: done`);
  }

  const contrast = (name: string, a: string, b: string, f: (m: any) => number | null) => {
    const pairs = s[a].map((m, i) => [f(m), f(s[b][i])]).map(([x, y], i) => ({ i, d: x === null || y === null ? null : (x as number) - (y as number) }));
    const kept = pairs.filter(p => p.d !== null), dropped = pairs.filter(p => p.d === null).map(p => p.i + 1);
    const t = signFlip(kept.map(p => p.d as number)); return { name, a, b, d: kept.map(p => p.d), units: kept.map(p => p.i + 1), dropped, mean: t.mean, p: t.p };
  };
  const tests = [contrast('H1-ALL-NONE', 'ALL', 'NONE', m => m.H1.mean), contrast('H1-ALL-NOPLEX', 'ALL', 'NO-PLEX', m => m.H1.mean),
    contrast('H2-ALL-NONE', 'ALL', 'NONE', m => m.H2.median), contrast('H3-ALL-NONE', 'ALL', 'NONE', m => m.H3.Texcess)];
  const h = holm(tests.map(({ name, mean, p }) => ({ name, mean, p })));
  const T = tests.map(t => ({ ...t, ...h.find(x => x.name === t.name)! }));
  const want: Record<string, [number, string]> = { 'H1-ALL-NONE': [1, 'THE GATES KEEP HER OUT'], 'H1-ALL-NOPLEX': [1, 'THE PLEX GATES ARE VALVES'],
    'H2-ALL-NONE': [-1, 'THE GATES SPEED RECOVERY'], 'H3-ALL-NONE': [1, 'THE GATES CARRY THE OUTSIDE'] };
  const readings = T.map(t => !t.survives ? `${t.name}: NOT IDENTIFIED` : Math.sign(t.mean) === want[t.name][0] ? want[t.name][1] : `${t.name}: HOLDS IN THE OPPOSITE DIRECTION`);
  const avg = (a: string, f: (m: any) => number | null) => mean(s[a].map(f).filter((x): x is number => x !== null));
  const byArm = Object.fromEntries(ARMS.map(a => [a, { outInterval: avg(a, m => m.H1.mean), exits: avg(a, m => m.H1.exits), recoveryMedian: avg(a, m => m.H2.median),
    spikes: avg(a, m => m.H2.spikes), Texcess: avg(a, m => m.H3.Texcess), T: avg(a, m => m.H3.T), eligible: avg(a, m => m.H3.eligible),
    E: avg(a, m => m.E), E_choice: avg(a, m => m.E_choice), E_flow: avg(a, m => m.E_flow), warpShare: avg(a, m => m.warpShare), meanWarpVisit: avg(a, m => m.meanWarpVisit),
    linesOfFlight: avg(a, m => m.linesOfFlight), plexShare: avg(a, m => m.plexShare), lockedShare: avg(a, m => m.lockedShare), meanTension: avg(a, m => m.meanTension),
    exitsByFlight: avg(a, m => m.exits.byFlight), exitsToPlex: avg(a, m => m.exits.toPlex), exitsTotal: avg(a, m => m.exits.total), coupling: avg(a, m => m.coupling) }]));
  await put([row('analysis', null, null, { tests: T, readings, byArm })]);
  console.log('analysis: ' + readings.join('; '));
}

if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
