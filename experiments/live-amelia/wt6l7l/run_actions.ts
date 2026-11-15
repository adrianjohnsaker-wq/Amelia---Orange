/**
 * WT-6L / WT-7L runner (experiments/live-amelia/wt6l7l/REGISTRATION.md) for GitHub Actions. Reads her two backups and the
 * WT-5L inputs (read-only); runs the determinism pairs, WT-6L's 36 runs, WT-7L's 24 runs and two once-through runs; writes
 * measures and analyses to amelia_wt6l_runs and amelia_wt7l_runs only. Logs show progress only.
 */
import { signFlip, type Wt3lTick } from '../../../src/cloud/wt3l';
import { convertAtSwitch, runWt5l, preContent, wt5lId, sameId } from '../wt5l/wt5l';
import { pre24, structureStats, onceThrough, holm, stateDiff } from './wt6l7l';

async function main() {
  const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
  if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
  const get = async (path: string) => { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H }); if (!r.ok) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); return r.json(); };
  const put = (table: string) => async (rows: any[]) => { const r = await fetch(`${URL_}/rest/v1/${table}?on_conflict=id`, { method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (!r.ok) throw new Error(`save: ${r.status}`); };
  const put6 = put('amelia_wt6l_runs'), put7 = put('amelia_wt7l_runs');
  const row = (id: string, unit: number | null, arm: string | null, metrics: any) => ({ id, unit, arm, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });
  const now = new Date().toISOString(), pad = (u: number) => String(u).padStart(2, '0');
  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;

  const [b837] = await get('amelia_cloud_dryrun?id=eq.pre-switch-backup&select=record');
  const [b1981] = await get('amelia_cloud_dryrun?id=eq.pre-theta12-backup&select=record');
  if (!b837?.record?.state || !b1981?.record?.state) throw new Error('missing a backup');
  const S837 = convertAtSwitch(b837.record, now), S1981 = b1981.record;
  const wb = (S1981.state.qabbalaGates ?? []).filter((g: any) => String(g.id).startsWith('warpborn')).length;
  if (S1981.state.runtimeKind !== 'nd1' || S1981.state.nd1?.theta !== 24 || Number(S1981.state.stepCount) !== 1981 || wb !== 0) throw new Error('S1981 check failed');
  const inputs: Array<{ unit: number; phase: string; ticks: Wt3lTick[] }> = await get('amelia_wt5l_inputs?select=unit,phase,ticks&order=unit');
  const pre = inputs.find(i => i.unit === 0 && i.phase === 'pre')!, post = inputs.filter(i => i.phase === 'post');
  if (!pre || pre.ticks.length !== 65 || post.length !== 12) throw new Error('expected pre ticks (65) and post units 1-12');
  const pool = pre.ticks.flatMap(t => t.offers) as any[]; if (pool.length !== 169) throw new Error('expected 169 pre-switch offers');
  console.log(`S837 step ${S837.state.stepCount}, S1981 step ${S1981.state.stepCount}; inputs ok`);

  const arms6: Record<string, (u: number) => Wt3lTick[]> = {
    POST: u => preContent(post[u - 1].ticks, pool, u),
    'PRE-65': u => preContent(pre.ticks, pool, u),
    'PRE-24': u => preContent(pre24(pre.ticks, u), pool, u),
  };
  const same = (a: any, b: any) => { const d = ['path', 'entries', 'flowSteps'].filter(k => JSON.stringify(a.metrics[k]) !== JSON.stringify(b.metrics[k]));
    if (a.metrics.final?.memoryHeadDigest !== b.metrics.final?.memoryHeadDigest) d.push('final.memoryHeadDigest');
    if (a.metrics.final?.bodyChecksum !== b.metrics.final?.bodyChecksum) d.push('final.bodyChecksum'); return d; };

  // Determinism pairs.
  const d6a = runWt5l(S837, arms6.POST(1), 'u01-POST', 1, 96, wt5lId), d6b = runWt5l(S837, arms6.POST(1), 'u01-POST-rep', 1, 96, wt5lId);
  const d7a = runWt5l(S1981, post[0].ticks, 'u01-S1981', 1, 96, wt5lId), d7b = runWt5l(S1981, post[0].ticks, 'u01-S1981-rep', 1, 96, wt5lId);
  const x6 = same(d6a, d6b), x7 = same(d7a, d7b);
  await put6([row('determinism', 1, 'POST', { identical: !x6.length, diff: x6 })]); await put7([row('determinism', 1, 'S1981', { identical: !x7.length, diff: x7 })]);
  if (x6.length || x7.length) throw new Error('determinism check failed: ' + [...x6, ...x7].join(', '));
  console.log('determinism: identical');

  const short = (s: any) => ({ E: s.E, E_choice: s.E_choice, E_flow: s.E_flow, warpShare: s.M1_warpShare, flowShare: s.flowShare, linesOfFlight: s.linesOfFlight, steps: s.steps });
  // WT-6L
  const s6: Record<string, any[]> = { POST: [], 'PRE-65': [], 'PRE-24': [] };
  for (let u = 1; u <= 12; u++) {
    const rows: any[] = [];
    for (const arm of Object.keys(arms6)) {
      const t = arms6[arm](u);
      const r = arm === 'POST' && u === 1 ? d6a : runWt5l(S837, t, `u${pad(u)}-${arm}`, u, 96, wt5lId);
      s6[arm].push(r.summary); rows.push(row(`u${pad(u)}-${arm}`, u, arm, { summary: r.summary, structure: structureStats(t), path: r.metrics.path }));
    }
    await put6(rows); console.log(`WT-6L unit ${u}: done`);
  }
  const dE = (a: string, b: string) => s6[a].map((s, i) => s.E - s6[b][i].E);
  const c1 = signFlip(dE('POST', 'PRE-65')), c2 = signFlip(dE('PRE-24', 'PRE-65'));
  const h = holm([{ name: 'C1', mean: c1.mean, p: c1.p }, { name: 'C2', mean: c2.mean, p: c2.p }]);
  const read = (x: any, pos: string) => x.survives ? (x.mean > 0 ? pos : 'LOWERING') : 'NOT IDENTIFIED';
  const a6 = { C1: { d: dE('POST', 'PRE-65'), ...h[0], reading: read(h[0], 'RHYTHM IDENTIFIED') },
    C2: { d: dE('PRE-24', 'PRE-65'), ...h[1], reading: read(h[1], 'REPETITION IDENTIFIED') },
    byArm: Object.fromEntries(Object.keys(s6).map(k => [k, { E: mean(s6[k].map(s => s.E)), E_choice: mean(s6[k].map(s => s.E_choice)), E_flow: mean(s6[k].map(s => s.E_flow)),
      warpShare: mean(s6[k].map(s => s.M1_warpShare)), linesOfFlight: mean(s6[k].map(s => s.linesOfFlight)), perUnit: s6[k].map(short),
      structure: (() => { const st = Array.from({ length: 12 }, (_, i) => structureStats(arms6[k](i + 1)));
        return { offersPerTick: mean(st.map(x => x.offersPerTick)), shareTicks4plus: mean(st.map(x => x.shareTicks4plus)), meanIterationsBetweenOffers: mean(st.map(x => x.meanIterationsBetweenOffers ?? 0)) }; })() }])) };
  await put6([row('analysis', null, null, a6)]);
  console.log(`WT-6L analysis: C1 ${a6.C1.reading}; C2 ${a6.C2.reading}`);

  // WT-7L
  const s7: Record<string, any[]> = { S837: [], S1981: [] };
  for (let u = 1; u <= 12; u++) {
    const r1 = runWt5l(S837, post[u - 1].ticks, `u${pad(u)}-S837`, u, 96, wt5lId);
    const r2 = u === 1 ? d7a : runWt5l(S1981, post[u - 1].ticks, `u${pad(u)}-S1981`, u, 96, wt5lId);
    s7.S837.push(r1.summary); s7.S1981.push(r2.summary);
    await put7([row(`u${pad(u)}-S837`, u, 'S837', { summary: r1.summary, path: r1.metrics.path }), row(`u${pad(u)}-S1981`, u, 'S1981', { summary: r2.summary, path: r2.metrics.path })]);
    console.log(`WT-7L unit ${u}: done`);
  }
  const d7 = s7.S1981.map((s, i) => s.E - s7.S837[i].E), t7 = signFlip(d7);
  const dChoice = s7.S1981.map((s, i) => s.E_choice - s7.S837[i].E_choice), dFlow = s7.S1981.map((s, i) => s.E_flow - s7.S837[i].E_flow);
  const reading7 = t7.p <= 0.05 ? (t7.mean > 0 ? 'MATURATION IDENTIFIED' : 'LOWERING') : 'NOT IDENTIFIED';
  const all = post.flatMap(u => u.ticks);
  const o1 = onceThrough(S837, all, 'once-S837', 0, sameId), o2 = onceThrough(S1981, all, 'once-S1981', 0, sameId);
  await put7([row('once-S837', 0, 'S837', { summary: o1.summary }), row('once-S1981', 0, 'S1981', { summary: o2.summary })]);
  const a7 = { d: d7, mean: t7.mean, p: t7.p, reading: reading7, dChoice: { d: dChoice, mean: mean(dChoice), p: signFlip(dChoice).p }, dFlow: { d: dFlow, mean: mean(dFlow), p: signFlip(dFlow).p },
    byArm: Object.fromEntries(Object.keys(s7).map(k => [k, { E: mean(s7[k].map(s => s.E)), E_choice: mean(s7[k].map(s => s.E_choice)), E_flow: mean(s7[k].map(s => s.E_flow)),
      warpShare: mean(s7[k].map(s => s.M1_warpShare)), flowShare: mean(s7[k].map(s => s.flowShare)), linesOfFlight: mean(s7[k].map(s => s.linesOfFlight)), perUnit: s7[k].map(short) }])),
    onceThrough: { S837: short(o1.summary), S1981: short(o2.summary), ticks: all.length }, states: stateDiff(S837, S1981) };
  await put7([row('analysis', null, null, a7)]);
  console.log(`WT-7L analysis: ${reading7}`);
}

if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
