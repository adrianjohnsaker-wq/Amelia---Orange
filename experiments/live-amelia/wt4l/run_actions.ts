/**
 * WT-4L runner (experiments/live-amelia/wt4l/REGISTRATION.md) for GitHub Actions. Reads the starting copy, her
 * pre-theta12-backup (step 1,981) and the 12 windows' inputs once; builds the four arms; runs the determinism pair and the
 * 48 runs with the WT-3L replay (src/cloud/wt3l.ts); writes measures and the registered analysis to amelia_wt4l_runs only.
 * Her live record is never read or written. Logs show progress only.
 */
import { setWarpThreshold } from '../../../src/cloud/warpTheta';
import { signFlip, type Wt3lTick } from '../../../src/cloud/wt3l';
import { runOne, sameRun } from '../wt3l/run_actions';

export const ARMS = ['BASE', 'NO-WB', 'BASELINE-1981', 'STATE-1981'] as const;
export type Arm = typeof ARMS[number];
const clone = (x: any) => JSON.parse(JSON.stringify(x));
const without = (state: any, path: 'gates' | 'baseline') => JSON.stringify({ ...state,
  ...(path === 'gates' ? { qabbalaGates: undefined } : { nd1: { ...state.nd1, baseline: undefined } }) });

/** The registered arms. NO-WB and BASELINE-1981 must differ from BASE only in what they change. */
export function armRecord(start: any, backup: any, arm: Arm) {
  if (arm === 'BASE') return clone(start);
  if (arm === 'NO-WB') {
    const r = clone(start); r.state.qabbalaGates = r.state.qabbalaGates.filter((g: any) => !String(g.id).startsWith('warpborn'));
    if (without(r.state, 'gates') !== without(start.state, 'gates')) throw new Error('NO-WB changed more than its gates');
    return r;
  }
  if (arm === 'BASELINE-1981') {
    const b = backup?.state?.nd1?.baseline;
    if (!Array.isArray(b) || b.length !== 10) throw new Error('backup has no ND-1b baseline');
    const r = clone(start); r.state.nd1 = { ...r.state.nd1, baseline: [...b] };
    if (without(r.state, 'baseline') !== without(start.state, 'baseline')) throw new Error('BASELINE-1981 changed more than the baseline');
    return r;
  }
  const r = setWarpThreshold(clone(backup), 12, new Date().toISOString(), 'wt4l-scratch').record;   // STATE-1981
  if (r.state.nd1.theta !== 12) throw new Error('STATE-1981 must have Θ = 12');
  return r;
}

/** Holm over the manipulated arms at α; an arm "lowers E" if its mean d < 0 and it survives Holm. */
export function holm(tests: Array<{ arm: string; mean: number; p: number }>, alpha = 0.05) {
  const order = [...tests].sort((a, b) => a.p - b.p); let stop = false;
  const out = new Map<string, { survives: boolean; threshold: number }>();
  order.forEach((t, i) => { const threshold = alpha / (order.length - i); const ok = !stop && t.p <= threshold; if (!ok) stop = true;
    out.set(t.arm, { survives: ok, threshold }); });
  return tests.map(t => ({ ...t, ...out.get(t.arm)!, lowersE: out.get(t.arm)!.survives && t.mean < 0 }));
}

export function analyse(summaries: Record<Arm, any[]>) {
  const units = summaries.BASE.map((s: any) => s.unit);
  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const tests = (['NO-WB', 'BASELINE-1981', 'STATE-1981'] as const).map(arm => {
    const d = units.map((u: number, i: number) => summaries[arm][i].E - summaries.BASE[i].E);
    const s = signFlip(d); return { arm, mean: s.mean, p: s.p, d };
  });
  const byArm = Object.fromEntries(ARMS.map(arm => [arm, {
    E: mean(summaries[arm].map(s => s.E)), E_choice: mean(summaries[arm].map(s => s.E_choice)), E_flow: mean(summaries[arm].map(s => s.E_flow)),
    flowShare: mean(summaries[arm].map(s => s.flowShare)), warpShare: mean(summaries[arm].map(s => s.M1_warpShare)),
    tension: mean(summaries[arm].map(s => s.M2_meanTension)), linesOfFlight: mean(summaries[arm].map(s => s.linesOfFlight)),
    exits: ['flight', 'warpborn', 'preexisting'].reduce((o: any, k) => (o[k] = summaries[arm].reduce((a, s) => a + s.warpExits[k], 0), o), {}),
    warpbornAtStart: summaries[arm][0].warpbornAtStart, warpbornAtEnd: [Math.min(...summaries[arm].map(s => s.warpbornAtEnd)), Math.max(...summaries[arm].map(s => s.warpbornAtEnd))],
  }]));
  const h = holm(tests.map(({ arm, mean, p }) => ({ arm, mean, p })));
  return { tests: tests.map(t => ({ ...t, ...h.find(x => x.arm === t.arm)! })), byArm,
    identified: h.filter(x => x.lowersE).map(x => x.arm),
    perUnit: units.map((u: number, i: number) => ({ unit: u, ...Object.fromEntries(ARMS.map(a => [a, { E: summaries[a][i].E,
      E_choice: summaries[a][i].E_choice, E_flow: summaries[a][i].E_flow }])) })) };
}

async function main() {
  const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
  if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
  const get = async (path: string) => { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H }); if (!r.ok) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); return r.json(); };
  const put = async (rows: any[]) => { const r = await fetch(`${URL_}/rest/v1/amelia_wt4l_runs?on_conflict=id`, { method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (!r.ok) throw new Error(`save: ${r.status}`); };

  const [st] = await get('amelia_wt4l_runs?id=eq.start&select=record'); const start = st?.record;
  const [bk] = await get('amelia_cloud_dryrun?id=eq.pre-theta12-backup&select=record'); const backup = bk?.record;
  if (!start?.state || !backup?.state) throw new Error('missing starting copy or backup');
  const inputs: Array<{ unit: number; ticks: Wt3lTick[] }> = await get('amelia_wt4l_inputs?select=unit,ticks&order=unit');
  if (inputs.length !== 12 || inputs.some((u, i) => u.unit !== i + 1)) throw new Error('expected inputs for units 1-12');
  const recs = Object.fromEntries(ARMS.map(a => [a, armRecord(start, backup, a)])) as Record<Arm, any>;
  console.log(`starting copy: revision ${start.revision}, step ${start.state.stepCount}; backup step ${backup.state.stepCount}; 12 units, 4 arms`);
  const now = new Date().toISOString(), uid = (u: number, a: string) => `u${String(u).padStart(2, '0')}-${a}`;
  const row = (id: string, unit: number | null, arm: string | null, r: any) => ({ id, unit, arm, status: 'done', record: null, error: null,
    metrics: r.metrics ? { ...r.metrics, summary: r.summary } : r, updated_at: new Date().toISOString() });

  const a = runOne(recs.BASE, inputs[0].ticks, uid(1, 'BASE'), 1, 'T12', now);
  const b = runOne(recs.BASE, inputs[0].ticks, uid(1, 'BASE') + '-rep', 1, 'T12', now);
  const diff = sameRun(a.metrics, b.metrics);
  if (JSON.stringify(a.metrics.entries) !== JSON.stringify(b.metrics.entries) || a.metrics.flowSteps !== b.metrics.flowSteps) diff.push('entries');
  await put([row(uid(1, 'BASE'), 1, 'BASE', a), row(uid(1, 'BASE') + '-rep', 1, 'BASE', b)]);
  await put([row('determinism', null, null, { identical: diff.length === 0, diff })]);
  if (diff.length) throw new Error('determinism check failed: ' + diff.join(', '));
  console.log('determinism: identical');

  const sums: Record<Arm, any[]> = { BASE: [], 'NO-WB': [], 'BASELINE-1981': [], 'STATE-1981': [] };
  for (const u of inputs) {
    const rows: any[] = [];
    for (const arm of ARMS) {
      const r = arm === 'BASE' && u.unit === 1 ? a : runOne(recs[arm], u.ticks, uid(u.unit, arm), u.unit, 'T12', now);
      sums[arm].push(r.summary); if (!(arm === 'BASE' && u.unit === 1)) rows.push(row(uid(u.unit, arm), u.unit, arm, r));
    }
    await put(rows); console.log(`unit ${u.unit}: done`);
  }
  const analysis = analyse(sums);
  await put([row('analysis', null, null, analysis)]);
  console.log(`analysis written (identified: ${analysis.identified.join(', ') || 'none'})`);
}

if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
