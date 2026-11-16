/**
 * WT-9L / WT-10L runner (experiments/live-amelia/wt9l10l/REGISTRATION.md) for GitHub Actions. Reads the starting copies
 * and the WT-5L inputs (read-only); runs the determinism pairs, WT-9L's 48 runs and WT-10L's 84; writes measures and the
 * registered analyses to amelia_wt9l_runs and amelia_wt10l_runs only. Her live record is never read or written.
 */
import { signFlip, type Wt3lTick } from '../../../src/cloud/wt3l';
import { convertAtSwitch, wt5lId } from '../wt5l/wt5l';
import { holm } from '../wt6l7l/wt6l7l';
import { runLogged, wt9lId, precededEntries, slotStats, choiceFirst, swap, partitionCheck, PARTS, type Rule, type Part } from './machinery';

async function main() {
  const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
  if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
  const get = async (path: string) => { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H }); if (!r.ok) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); return r.json(); };
  const put = (table: string) => async (rows: any[]) => { const r = await fetch(`${URL_}/rest/v1/${table}?on_conflict=id`, { method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (!r.ok) throw new Error(`save: ${r.status}`); };
  const put9 = put('amelia_wt9l_runs'), put10 = put('amelia_wt10l_runs');
  const row = (id: string, unit: number | null, arm: string | null, metrics: any) => ({ id, unit, arm, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });
  const now = new Date().toISOString(), pad = (u: number) => String(u).padStart(2, '0');
  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const same = (a: any, b: any) => { const d = ['path', 'entries', 'flowSteps'].filter(k => JSON.stringify(a.metrics[k]) !== JSON.stringify(b.metrics[k]));
    if (a.record.state.memoryState?.events?.at(-1)?.eventDigest !== b.record.state.memoryState?.events?.at(-1)?.eventDigest) d.push('memory head');
    if (a.record.fieldCheckpoint?.checksum !== b.record.fieldCheckpoint?.checksum) d.push('body checksum'); return d; };
  const short = (r: any) => ({ E: r.summary.E, E_choice: r.summary.E_choice, E_flow: r.summary.E_flow, warpShare: r.summary.M1_warpShare,
    linesOfFlight: r.summary.linesOfFlight, steps: r.summary.steps });

  const [st] = await get('amelia_dee1l_runs?id=eq.start&select=record'); const present = st?.record;
  const [b837] = await get('amelia_cloud_dryrun?id=eq.pre-switch-backup&select=record');
  const [b1981] = await get('amelia_cloud_dryrun?id=eq.pre-theta12-backup&select=record');
  if (!present?.state || !b837?.record?.state || !b1981?.record?.state) throw new Error('missing a starting state');
  if (present.state.nd1?.theta !== 12 || Number(present.state.stepCount) !== 7121) throw new Error('present state check failed');
  const S837 = convertAtSwitch(b837.record, now), S1981 = b1981.record;
  const check = partitionCheck(S837, S1981);
  await put10([row('partition-check', null, null, check)]);
  if (!check.ok) throw new Error(`WT-10L partition check failed: shared ${check.sharedDiffer.join(',')}; partition ${check.partitionDiffer.join(',')}`);
  const inputs: Array<{ unit: number; phase: string; ticks: Wt3lTick[] }> = await get('amelia_wt5l_inputs?select=unit,phase,ticks&order=unit');
  const post = inputs.filter(i => i.phase === 'post'); if (post.length !== 12) throw new Error('expected 12 units');
  console.log(`present step ${present.state.stepCount}; S837/S1981 partition ok; 12 units`);

  // Determinism pairs.
  const d9a = runLogged(present, post[0].ticks, 'u01-TOWARD', 1, wt9lId, 'TOWARD'), d9b = runLogged(present, post[0].ticks, 'u01-TOWARD-rep', 1, wt9lId, 'TOWARD');
  const d10a = runLogged(S1981, post[0].ticks, 'u01-S1981', 1, wt5lId), d10b = runLogged(S1981, post[0].ticks, 'u01-S1981-rep', 1, wt5lId);
  const x9 = same(d9a, d9b), x10 = same(d10a, d10b);
  await put9([row('determinism', 1, 'TOWARD', { identical: !x9.length, diff: x9 })]); await put10([row('determinism', 1, 'S1981', { identical: !x10.length, diff: x10 })]);
  if (x9.length || x10.length) throw new Error('determinism check failed: ' + [...x9, ...x10].join(', '));
  console.log('determinism: identical');

  // WT-9L
  const RULES: Rule[] = ['RECORDED', 'TOWARD', 'AWAY', 'BLIND'];
  const s9: Record<string, any[]> = Object.fromEntries(RULES.map(r => [r, []]));
  const preceded: any[] = [];
  for (let u = 1; u <= 12; u++) {
    const rows: any[] = [];
    for (const rule of RULES) {
      const r = rule === 'TOWARD' && u === 1 ? d9a : runLogged(present, post[u - 1].ticks, `u${pad(u)}-${rule}`, u, wt9lId, rule);
      const m = { ...short(r), slots: slotStats(r.steps), ...(rule === 'RECORDED' ? { preceded: precededEntries(r.steps) } : {}) };
      if (rule === 'RECORDED') preceded.push(...m.preceded!.map((e: any) => ({ unit: u, ...e })));
      s9[rule].push(m); rows.push(row(`u${pad(u)}-${rule}`, u, rule, { ...m, path: r.metrics.path }));
    }
    await put9(rows); console.log(`WT-9L unit ${u}: done`);
  }
  const dE = (a: string, b: string) => s9[a].map((m, i) => m.E - s9[b][i].E);
  const c1 = signFlip(dE('TOWARD', 'AWAY')), c2 = signFlip(dE('TOWARD', 'BLIND'));
  const h9 = holm([{ name: 'C1', mean: c1.mean, p: c1.p }, { name: 'C2', mean: c2.mean, p: c2.p }]);
  const surv = (x: any) => x.survives ? (x.mean > 0 ? 'up' : 'down') : 'none';
  const [h1, h2] = h9; const reading9 = surv(h1) === 'up' && surv(h2) === 'up' ? 'ORDER ACTS THROUGH HER POSITION'
    : surv(h1) === 'up' ? 'ORDER ACTS, NOT THROUGH POSITION' : (surv(h1) === 'down' || surv(h2) === 'down') ? 'LOWERING (see contrasts)' : 'NOT IDENTIFIED';
  const near = preceded.filter(e => e.lastAdmittedZone !== null);
  await put9([row('analysis', null, null, { C1: { d: dE('TOWARD', 'AWAY'), ...h1 }, C2: { d: dE('TOWARD', 'BLIND'), ...h2 }, reading: reading9,
    byArm: Object.fromEntries(RULES.map(r => [r, { E: mean(s9[r].map(m => m.E)), E_choice: mean(s9[r].map(m => m.E_choice)), E_flow: mean(s9[r].map(m => m.E_flow)),
      warpShare: mean(s9[r].map(m => m.warpShare)), atEdge: mean(s9[r].map(m => m.slots.atEdge)), admittedAtDelivery: mean(s9[r].map(m => m.slots.admittedAtDelivery)),
      perUnit: s9[r].map(m => m.E) }])),
    preceded: { entries: preceded.length, zonesBefore: preceded.reduce((o: any, e) => (o[e.zonesBefore.join('')] = (o[e.zonesBefore.join('')] ?? 0) + 1, o), {}),
      lastAdmittedZone: near.reduce((o: any, e) => (o[e.lastAdmittedZone] = (o[e.lastAdmittedZone] ?? 0) + 1, o), {}),
      meanAheadSum: near.length ? mean(near.map(e => e.lastAdmittedAheadSum)) : null, medianStepsSince: near.length ? near.map(e => e.stepsSince).sort((a, b) => a - b)[Math.floor(near.length / 2)] : null } })]);
  console.log(`WT-9L analysis: ${reading9}`);

  // WT-10L
  const parts = Object.keys(PARTS) as Part[];
  const arms10: Record<string, any> = { S837, S1981, ...Object.fromEntries(parts.map(p => [p, swap(S837, S1981, [p])])) };
  const s10: Record<string, any[]> = Object.fromEntries(Object.keys(arms10).map(a => [a, []]));
  for (let u = 1; u <= 12; u++) {
    const rows: any[] = [];
    for (const arm of Object.keys(arms10)) {
      const r = arm === 'S1981' && u === 1 ? d10a : runLogged(arms10[arm], post[u - 1].ticks, `u${pad(u)}-${arm}`, u, wt5lId);
      const m = { ...short(r), choiceFirst200: choiceFirst(r.steps, 200),
        first50: r.steps.slice(0, 50).map(s => ({ zone: s.zone, change2: s.change2, change5: s.change5, tension: s.tension })) };
      s10[arm].push(m); rows.push(row(`u${pad(u)}-${arm}`, u, arm, { ...m, path: r.metrics.path }));
    }
    await put10(rows); console.log(`WT-10L unit ${u}: done`);
  }
  const dC = (a: string) => s10[a].map((m, i) => m.E_choice - s10.S837[i].E_choice);
  const R = signFlip(dC('S1981')); const replicated = R.p <= 0.05 && R.mean < 0;
  const tests = parts.map(p => { const t = signFlip(dC(p)); return { name: p, mean: t.mean, p: t.p, d: dC(p) }; });
  const h10 = holm(tests.map(({ name, mean, p }) => ({ name, mean, p })));
  const carried = h10.filter(x => x.survives && x.mean < 0).map(x => x.name);
  const reading10 = !replicated ? `R NOT REPLICATED (d ${R.mean.toFixed(2)}, p ${R.p.toFixed(4)}); parts descriptive` : carried.length ? `CARRIED BY ${carried.join(', ')}` : 'NO SINGLE PART IDENTIFIED';
  await put10([row('analysis', null, null, { R: { d: dC('S1981'), mean: R.mean, p: R.p, replicated }, parts: tests.map(t => ({ ...t, ...h10.find(x => x.name === t.name)! })), reading: reading10,
    byArm: Object.fromEntries(Object.keys(arms10).map(a => [a, { E_choice: mean(s10[a].map(m => m.E_choice)), E_flow: mean(s10[a].map(m => m.E_flow)), E: mean(s10[a].map(m => m.E)),
      warpShare: mean(s10[a].map(m => m.warpShare)), linesOfFlight: mean(s10[a].map(m => m.linesOfFlight)), choiceFirst200: mean(s10[a].map(m => m.choiceFirst200)) }])) })]);
  console.log(`WT-10L analysis: ${reading10}`);
}

if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
