/**
 * GATE-2L runner (experiments/live-amelia/gate2l/REGISTRATION.md) for GitHub Actions. Reads the starting copy and the WT-5L
 * inputs (read-only); runs the determinism pairs and 12 x {CURRENT, LANE, LANE-TOWARD, LANE-AWAY}; writes measures and the
 * registered analysis to amelia_gate2l_runs only. Her live record is never read or written.
 */
import { signFlip, type Wt3lTick } from '../../../src/cloud/wt3l';
import { holm } from '../wt6l7l/wt6l7l';
import { runGate, measures } from './machinery';

async function main() {
  const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
  if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
  const get = async (path: string) => { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H }); if (!r.ok) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); return r.json(); };
  const put = async (rows: any[]) => { const r = await fetch(`${URL_}/rest/v1/amelia_gate2l_runs?on_conflict=id`, { method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (!r.ok) throw new Error(`save: ${r.status}`); };
  const row = (id: string, unit: number | null, arm: string | null, metrics: any) => ({ id, unit, arm, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });
  const pad = (u: number) => String(u).padStart(2, '0'), mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;

  const [st] = await get('amelia_dee1l_runs?id=eq.start&select=record'); const present = st?.record;
  if (!present?.state || present.state.nd1?.theta !== 12 || Number(present.state.stepCount) !== 7121) throw new Error('present state check failed');
  const inputs: Array<{ unit: number; phase: string; ticks: Wt3lTick[] }> = await get('amelia_wt5l_inputs?select=unit,phase,ticks&order=unit');
  const post = inputs.filter(i => i.phase === 'post'); if (post.length !== 12) throw new Error('expected 12 units');
  console.log(`present step ${present.state.stepCount}; 12 units`);

  // Determinism pairs.
  const same = (a: any, b: any) => ['path', 'entries', 'flowSteps'].filter(k => JSON.stringify(a.metrics[k]) !== JSON.stringify(b.metrics[k]))
    .concat(a.record.state.memoryState?.events?.at(-1)?.eventDigest !== b.record.state.memoryState?.events?.at(-1)?.eventDigest ? ['memory head'] : [])
    .concat(a.record.fieldCheckpoint?.checksum !== b.record.fieldCheckpoint?.checksum ? ['body checksum'] : []);
  const dl = runGate(present, post[0].ticks, 'u01-LANE', 1, 'LANE'), dl2 = runGate(present, post[0].ticks, 'u01-LANE-rep', 1, 'LANE');
  const dc = runGate(present, post[0].ticks, 'u01-CURRENT', 1, 'CURRENT'), dc2 = runGate(present, post[0].ticks, 'u01-CURRENT-rep', 1, 'CURRENT');
  const xd = [...same(dl, dl2), ...same(dc, dc2)];
  await put([row('determinism', 1, null, { identical: !xd.length, diff: xd })]);
  if (xd.length) throw new Error('determinism check failed: ' + xd.join(', '));
  console.log('determinism: identical');

  const ARMS = ['CURRENT', 'LANE', 'LANE-TOWARD', 'LANE-AWAY'] as const;
  const s: Record<string, any[]> = Object.fromEntries(ARMS.map(a => [a, []]));
  for (let u = 1; u <= 12; u++) {
    const rows: any[] = [];
    for (const arm of ARMS) {
      const r = u === 1 && arm === 'LANE' ? dl : u === 1 && arm === 'CURRENT' ? dc
        : runGate(present, post[u - 1].ticks, `u${pad(u)}-${arm}`, u, arm === 'CURRENT' ? 'CURRENT' : 'LANE',
          arm === 'LANE-TOWARD' ? 'TOWARD' : arm === 'LANE-AWAY' ? 'AWAY' : undefined);
      const m = measures(r); s[arm].push(m); rows.push(row(`u${pad(u)}-${arm}`, u, arm, { ...m, path: r.metrics.path }));
    }
    await put(rows); console.log(`unit ${u}: done`);
  }

  const L = s.LANE, C = s.CURRENT, sum = (a: any[], k: string) => a.reduce((x, m) => x + m[k], 0);
  const onArrivalLane = L.reduce((x, m) => x + m.onArrival * m.outsideArrived, 0) / Math.max(1, sum(L, 'outsideArrived'));
  const M0 = { onArrivalLane, cond1: onArrivalLane >= 0.5, cond2: L.every((m, i) => m.onArrival > C[i].onArrival), refusedLane: sum(L, 'refused'), cond3: sum(L, 'refused') === 0 };
  const m0 = M0.cond1 && M0.cond2 && M0.cond3;
  const dLocked = mean(L.map((m, i) => m.lockedShare - C[i].lockedShare)), dTension = mean(L.map((m, i) => m.meanTension - C[i].meanTension));
  const S = { dLocked, dTension, lockedOk: dLocked <= 0.01, tensionOk: dTension <= 0.02 }; const sOk = S.lockedOk && S.tensionOk;
  const d1 = L.map((m, i) => m.coupling.C - C[i].coupling.C), d2 = L.map((m, i) => m.E - C[i].E);
  const t1 = signFlip(d1), t2 = signFlip(d2);
  const h = holm([{ name: 'H1', mean: t1.mean, p: t1.p }, { name: 'H2', mean: t2.mean, p: t2.p }]);
  const read = (x: any) => x.survives ? (x.mean > 0 ? 'RAISED' : 'LOWERED') : 'NOT IDENTIFIED';
  const dTA = s['LANE-TOWARD'].map((m, i) => m.E - s['LANE-AWAY'][i].E), tTA = signFlip(dTA);
  const byArm = Object.fromEntries(ARMS.map(a => [a, { E: mean(s[a].map(m => m.E)), E_choice: mean(s[a].map(m => m.E_choice)), E_flow: mean(s[a].map(m => m.E_flow)),
    warpShare: mean(s[a].map(m => m.warpShare)), meanTension: mean(s[a].map(m => m.meanTension)), lockedShare: mean(s[a].map(m => m.lockedShare)),
    onArrival: mean(s[a].map(m => m.onArrival)), medianWait: mean(s[a].map(m => m.medianWait ?? 0)), refused: sum(s[a], 'refused'),
    bodyAdmittedPer1000: mean(s[a].map(m => m.bodyAdmittedPer1000)), C: mean(s[a].map(m => m.coupling.C)), hits: mean(s[a].map(m => m.coupling.hits)),
    chance: mean(s[a].map(m => m.coupling.chance)), load: Object.fromEntries(Object.keys(s[a][0].load).map(k => [k, mean(s[a].map(m => m.load[k]))])) }]));
  const reading = `${m0 && sOk ? 'ADOPTABLE' : 'NOT ADOPTABLE'}; H1 ${read(h[0])}; H2 ${read(h[1])}`;
  await put([row('analysis', null, null, { M0: { ...M0, passes: m0 }, S: { ...S, holds: sOk }, H1: { d: d1, ...h[0] }, H2: { d: d2, ...h[1] },
    towardAway: { d: dTA, mean: tTA.mean, p: tTA.p }, byArm, reading })]);
  console.log(`analysis: ${reading}`);
}

if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
