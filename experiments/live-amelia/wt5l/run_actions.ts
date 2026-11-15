/**
 * WT-5L runner (experiments/live-amelia/wt5l/REGISTRATION.md) for GitHub Actions. Reads her pre-switch backup, her archived
 * memory (read-only, for her live record of steps 838-1,981) and the inputs; runs determinism, A1, A2 and B; writes measures
 * and the registered analysis to amelia_wt5l_runs only. Her live record and archive are never written. Logs show progress only.
 */
import { signFlip } from '../../../src/cloud/wt3l';
import { convertAtSwitch, runWt5l, preContent, liveSpan, fidelity, a1Reading, poolProfile, sameId, wt5lId, TOL_E } from './wt5l';

const LIVE_FROM = 838, LIVE_TO = 1981;

async function main() {
  const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
  if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
  const get = async (path: string) => { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H }); if (!r.ok) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); return r.json(); };
  const put = async (rows: any[]) => { const r = await fetch(`${URL_}/rest/v1/amelia_wt5l_runs?on_conflict=id`, { method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (!r.ok) throw new Error(`save: ${r.status}`); };
  const row = (id: string, unit: number | null, arm: string | null, metrics: any) => ({ id, unit, arm, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });
  const now = new Date().toISOString();

  const [bk] = await get('amelia_cloud_dryrun?id=eq.pre-switch-backup&select=record'); if (!bk?.record?.state) throw new Error('no pre-switch backup');
  const start = convertAtSwitch(bk.record, now);
  const inputs: Array<{ unit: number; phase: string; ticks: any[] }> = await get('amelia_wt5l_inputs?select=unit,phase,ticks&order=unit');
  const pre = inputs.find(i => i.unit === 0 && i.phase === 'pre'); const post = inputs.filter(i => i.phase === 'post');
  if (!pre || pre.ticks.length !== 65 || post.length !== 12 || post.some((u, i) => u.unit !== i + 1)) throw new Error('expected pre ticks (65) and post units 1-12');
  const pool = pre.ticks.flatMap((t: any) => t.offers); if (pool.length !== 169) throw new Error(`expected 169 pre-switch offers, got ${pool.length}`);
  console.log(`start: converted at step ${start.state.stepCount}, Θ ${start.state.nd1.theta}; pre ticks ${pre.ticks.length}, offers ${pool.length}; post units ${post.length}`);

  // Her live record, steps 838-1,981, from her archived memory (read-only).
  const segs: any[] = await get('amelia_memory_archive?select=segment_no,events&order=segment_no&segment_no=lte.6');
  const events = segs.flatMap(s => s.events);
  const live = liveSpan(events, LIVE_FROM, LIVE_TO, Number(bk.record.state.currentZone));
  console.log(`live record: ${live.n} steps`);

  // Determinism: unit 1 POST twice.
  const a = runWt5l(start, post[0].ticks, 'u01-POST', 1, 96, wt5lId), b = runWt5l(start, post[0].ticks, 'u01-POST-rep', 1, 96, wt5lId);
  const diff = ['path', 'entries', 'flowSteps'].filter(k => JSON.stringify((a.metrics as any)[k]) !== JSON.stringify((b.metrics as any)[k]));
  if (a.metrics.final?.memoryHeadDigest !== b.metrics.final?.memoryHeadDigest) diff.push('final.memoryHeadDigest');
  if (a.metrics.final?.bodyChecksum !== b.metrics.final?.bodyChecksum) diff.push('final.bodyChecksum');
  await put([row('determinism', 1, 'POST', { identical: diff.length === 0, diff })]);
  if (diff.length) throw new Error('determinism check failed: ' + diff.join(', '));
  console.log('determinism: identical');

  // A1: once through, original ids.
  const a1 = runWt5l(start, pre.ticks, 'A1', 0, pre.ticks.length, sameId);
  const f = fidelity(a1.log, live.steps);
  const firstDiv = f.firstZoneDivergence;
  const at = firstDiv === null ? null : { step: firstDiv, live: live.steps.find(s => s.step === firstDiv), replay: a1.log.find(s => s.step === firstDiv),
    replayPrev: a1.log.find(s => s.step === firstDiv - 1), livePrev: live.steps.find(s => s.step === firstDiv - 1),
    liveRecords: events.filter((e: any) => Number(e.blockIndex) === firstDiv).map((e: any) => ({ targetZone: e.targetZone, fromZone: e.fromZone, eventDigest: e.eventDigest, encounters: e.encounters })),
    replayRecords: (a1.record.state.memoryState.events as any[]).filter(e => Number(e.blockIndex) === firstDiv).map(e => ({ targetZone: e.targetZone, fromZone: e.fromZone, eventDigest: e.eventDigest, encounters: e.encounters })) };
  const repA1 = { E: a1.summary.E!, E_choice: a1.summary.E_choice!, E_flow: a1.summary.E_flow!, warpShare: a1.summary.M1_warpShare, entries: a1.metrics.entries, steps: a1.summary.steps };
  const reading = a1Reading(f, repA1, live);
  await put([row('A1', 0, 'A1', { fidelity: f, reading, replay: repA1, live: { E: live.E, E_choice: live.E_choice, E_flow: live.E_flow, warpShare: live.warpShare, entries: live.entries, flowSteps: live.flowSteps, n: live.n },
    divergence: at, summary: a1.summary, path: a1.metrics.path })]);
  console.log(`A1: ${reading}`);

  // A2: the same ticks in the WT protocol.
  const a2 = runWt5l(start, pre.ticks, 'A2', 0, 96, wt5lId);
  await put([row('A2', 0, 'A2', { summary: a2.summary, E: a2.summary.E, warpShare: a2.summary.M1_warpShare, minusA1: a2.summary.E! - repA1.E,
    protocolRaisesRate: a2.summary.E! - repA1.E > TOL_E, path: a2.metrics.path })]);
  console.log('A2: done');

  // B: 12 windows x {POST, PRE-CONTENT}.
  const sums: Record<string, any[]> = { POST: [], 'PRE-CONTENT': [] };
  for (const u of post) {
    const r1 = u.unit === 1 ? a : runWt5l(start, u.ticks, `u${String(u.unit).padStart(2, '0')}-POST`, u.unit, 96, wt5lId);
    const r2 = runWt5l(start, preContent(u.ticks, pool, u.unit), `u${String(u.unit).padStart(2, '0')}-PRE-CONTENT`, u.unit, 96, wt5lId);
    sums.POST.push(r1.summary); sums['PRE-CONTENT'].push(r2.summary);
    await put([row(`u${String(u.unit).padStart(2, '0')}-POST`, u.unit, 'POST', { summary: r1.summary, path: r1.metrics.path }),
      row(`u${String(u.unit).padStart(2, '0')}-PRE-CONTENT`, u.unit, 'PRE-CONTENT', { summary: r2.summary, path: r2.metrics.path })]);
    console.log(`unit ${u.unit}: done`);
  }
  const d = sums.POST.map((s, i) => s.E - sums['PRE-CONTENT'][i].E), t = signFlip(d);
  const decision = t.p <= 0.05 && t.mean > 0 ? 'INPUTS IDENTIFIED' : t.p <= 0.05 && t.mean < 0 ? 'INPUTS DRAW LESS' : 'NOT IDENTIFIED';
  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const arm = (k: string) => ({ E: mean(sums[k].map(s => s.E)), E_choice: mean(sums[k].map(s => s.E_choice)), E_flow: mean(sums[k].map(s => s.E_flow)),
    warpShare: mean(sums[k].map(s => s.M1_warpShare)), flowShare: mean(sums[k].map(s => s.flowShare)), linesOfFlight: mean(sums[k].map(s => s.linesOfFlight)),
    perUnit: sums[k].map(s => ({ unit: s.unit, E: s.E, E_choice: s.E_choice, E_flow: s.E_flow, warpShare: s.M1_warpShare })) });
  const postPool = post.flatMap(u => u.ticks.flatMap((x: any) => x.offers));
  await put([row('analysis', null, null, { A1: { reading, fidelity: f, replay: repA1, live: { E: live.E, warpShare: live.warpShare, entries: live.entries } },
    A2: { E: a2.summary.E, warpShare: a2.summary.M1_warpShare, minusA1: a2.summary.E! - repA1.E, protocolRaisesRate: a2.summary.E! - repA1.E > TOL_E },
    B: { d, mean: t.mean, p: t.p, decision, POST: arm('POST'), PRE_CONTENT: arm('PRE-CONTENT'), linkedToLiveRise: reading !== 'NOT FAITHFUL' },
    pools: { pre: poolProfile(pool), post: poolProfile(postPool) } })]);
  console.log(`analysis written: A1 ${reading}; B ${decision}`);
}

if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
