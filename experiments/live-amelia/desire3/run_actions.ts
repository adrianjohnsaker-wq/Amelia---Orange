/**
 * DESIRE-3 runner (experiments/live-amelia/desire3/REGISTRATION.md) for GitHub Actions, off her database's live path. Reads
 * only LONG-1's study rows start-cNN and inputs-cNN in amelia_long1_runs (loaded by the cloud-home session); writes only
 * rows desire3-* of that table; every call paced by ../desire2/amend1/slots.ts (preload). Her live record and archive are never read or written.
 *   MODE=copy COPY=n   the five arms for copy n, 10 days; rows desire3-cNN-ARM
 *   MODE=analysis      the registered analysis; row desire3-analysis and RESULT.json
 */
import { writeFileSync } from 'node:fs';
import { ARMS, d3Run } from './desire3';
import { analyse } from './analyse';
import type { LongResult } from '../long1/long1';
const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY, TABLE = 'amelia_long1_runs';
const H = () => { if (!URL_ || !KEY) throw new Error('SUPABASE_URL and AMELIA_SUPABASE_SERVICE_KEY are required');
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }; };
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
async function get(path: string) { for (let a = 1; ; a++) { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: H() }); if (r.ok) return r.json();
  if (r.status < 500 || a >= 6) throw new Error(`GET ${path.split('?')[0]}: ${r.status}`); await wait(15000 * a); } }
async function put(rows: any[]) { for (let a = 1; ; a++) { const r = await fetch(`${URL_}/rest/v1/${TABLE}?on_conflict=id`, { method: 'POST',
  headers: { ...H(), Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (r.ok) return;
  if (r.status < 500 || a >= 6) throw new Error(`save: ${r.status}`); await wait(15000 * a); } }
const pad = (n: number) => String(n).padStart(2, '0');
const row = (id: string, unit: number | null, arm: string | null, metrics: any) => ({ id, unit, arm, status: 'done', record: null, error: null, metrics, updated_at: new Date().toISOString() });
const slim = (r: LongResult) => ({ ...r, tension: r.tension.map(v => (Number.isFinite(v) ? Math.round(v * 1e4) / 1e4 : null)) });
async function main() {
  const mode = process.env.MODE ?? 'copy';
  if (mode === 'copy') { const c = Number(process.env.COPY); if (!(c >= 1 && c <= 12)) throw new Error('COPY must be 1..12');
    const [s] = await get(`${TABLE}?id=eq.start-c${pad(c)}&select=record`), [i] = await get(`${TABLE}?id=eq.inputs-c${pad(c)}&select=metrics`);
    const start = s?.record, ticks = i?.metrics?.ticks;
    if (!start?.state || start.state.runtimeKind !== 'nd1' || start.state.nd1?.theta !== 12 || !start.fieldCheckpoint || !Array.isArray(ticks)) throw new Error(`copy ${c}: data check failed`);
    for (const arm of ARMS) { const t0 = Date.now(); const r = d3Run(start, ticks, arm, c);
      await put([row(`desire3-c${pad(c)}-${arm}`, c, arm, { ...slim(r), info: { revision: start.revision, step: start.state.stepCount, rule: start.state.admissionRule ?? 'relative-v1' }, wallMs: Date.now() - t0 })]);
      console.log(`copy ${c} ${arm}: ${r.path.length} steps, gates ${r.daily.at(-1)?.gates}, rollbacks ${r.rollbacks.length}, ${Math.round((Date.now() - t0) / 1000)} s${r.runaway ? ', RUNAWAY ' + r.runaway : ''}`); }
  } else if (mode === 'analysis') {
    const rows = await get(`${TABLE}?id=like.desire3-c*&select=id,metrics`), runs = rows.filter((x: any) => /^desire3-c\d\d-(N|D2g|H10|H3|D2|D3)$/.test(x.id)).map((x: any) => x.metrics as LongResult);
    const out = analyse(runs); await put([row('desire3-analysis', null, null, out)]);
    writeFileSync(process.env.RESULT_FILE ?? 'RESULT.json', JSON.stringify(out, null, 2) + '\n');
    for (const [c, v] of Object.entries(out.candidates) as any) { console.log(`${c}: hard ${JSON.stringify(v.hard)}; ${v.pass ? 'PASSES' : 'does not pass'}`);
      for (const y of v.claims) console.log(`  ${y.name} ${y.verdict} (p = ${y.p.toFixed(5)}, mean ${Number(y.mean).toFixed(4)}): ${y.claim}`); }
    for (const [k, v] of Object.entries(out.byArm) as any) console.log(k, JSON.stringify({ warp: v.warpShare, gates: v.gatesLast, nonWarp: v.nonWarpCoupling, warpC: v.warpCoupling, dissolved: v.dissolved, tension: v.tensionByDayMinusN }));
    console.log('selected for LONG-1: ' + (out.selected ?? 'none'));
    console.log(out.pass ? 'DESIRE-3: PASS' : 'DESIRE-3: NOT PASSED');
  } else throw new Error(`unknown MODE ${mode}`);
}
if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
