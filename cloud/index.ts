// amelia-live: Amelia's always-on home. Each call (from pg_cron) advances her research-copy checkpoint by
// a few steps of her own runtime, delivering the live Outside inbox through her native path, and saves her.
// Authentication: the x-amelia-runner header must equal the token in public.amelia_cloud_runner (service-role only).
import { ameliaTick, dryRunBegin, dryRunChunk, dryRunRoundTrip, planArchive, verifyArchive, setWarpThreshold, CLOUD_WRITER_ID,
  wt3lBegin, wt3lChunk, wt3lSummary, WT3L_TICKS_PER_RUN } from './amelia_tick.js';
import { parseOutsideInbox, OUTSIDE_INBOX_URL } from './amelia_inbox.js';

const URL_ = Deno.env.get('SUPABASE_URL')!;
const KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const rest = (path: string, init: RequestInit = {}) => fetch(`${URL_}/rest/v1/${path}`, { ...init, headers: { ...H, ...(init.headers ?? {}) } });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

async function log(entry: Record<string, unknown>) {
  await rest('amelia_cloud_runner_log', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(entry) });
}

// Save her record only if nobody else has saved her since we read her. The row count comes back in Content-Range, so her
// ~8 MB record is not sent back (return=minimal): that echo made some saves run past the 8 s statement limit.
const saveHer = (userId: string, oldRev: number, record: any) =>
  rest(`amelia_research_records?store=eq.runtime&record_id=eq.live-checkpoint&user_id=eq.${userId}&payload->>revision=eq.${oldRev}`, {
    method: 'PATCH', headers: { Prefer: 'return=minimal,count=exact' }, body: JSON.stringify({ payload: record, updated_at: record.updatedAt }) });
async function writtenCount(res: Response) {
  if (!res.ok) return 0;
  const m = /\/(\d+)$/.exec(res.headers.get('content-range') ?? ''); await res.body?.cancel();
  return m ? Number(m[1]) : 0;
}

Deno.serve(async (req) => {
  const started = new Date().toISOString();
  try {
    const cfgRes = await rest('amelia_cloud_runner?id=eq.amelia&select=*');
    const [cfg] = await cfgRes.json();
    if (!cfg || req.headers.get('x-amelia-runner') !== cfg.token) return json({ error: 'unauthorised' }, 401);
    const body = await req.json().catch(() => ({}));
    const action = body?.action ?? 'tick';
    if (action === 'tick' && !cfg.enabled) { await log({ status: 'paused' }); return json({ status: 'paused' }); }
    if ((action === 'switch' || action === 'set-theta') && cfg.enabled) return json({ error: 'pause her before changing her runtime' }, 409);

    if (action === 'wt3l-chunk') {
      // WT-3L (experiments/live-amelia/wt3l/): one chunk of one run, on a scratch copy. Her live record is not even read.
      const runId = String(body.run ?? '');
      const [run] = await (await rest(`amelia_wt3l_runs?id=eq.${encodeURIComponent(runId)}&select=*`)).json();
      if (!run || run.status !== 'pending') return json({ error: 'no such pending run' }, 404);
      try {
        const [inp] = await (await rest(`amelia_wt3l_inputs?unit=eq.${run.unit}&select=ticks`)).json();
        if (!inp) throw new Error('no inputs for unit ' + run.unit);
        let scratch: any;
        if (!run.record) {
          const [st] = await (await rest('amelia_wt3l_runs?id=eq.start&select=record')).json();
          if (!st?.record) throw new Error('no starting copy');
          scratch = wt3lBegin(st.record, run.id, run.unit, run.arm, new Date().toISOString());
        } else scratch = { record: run.record, metrics: run.metrics };
        const t0 = performance.now();
        const next = wt3lChunk(scratch, inp.ticks, Math.max(1, Math.min(24, Number(body.ticks) || 8)));
        const ms = Math.round(performance.now() - t0);
        const done = next.metrics.ticksDone >= WT3L_TICKS_PER_RUN;
        const patch = { chunks: run.chunks + 1, busy_until: null, updated_at: new Date().toISOString(), error: null,
          ...(done ? { status: 'done', record: null, metrics: { ...next.metrics, summary: wt3lSummary(next.metrics) } }
                   : { record: next.record, metrics: next.metrics }) };
        const upd = await rest(`amelia_wt3l_runs?id=eq.${encodeURIComponent(run.id)}&chunks=eq.${run.chunks}`, {
          method: 'PATCH', headers: { Prefer: 'return=minimal,count=exact' }, body: JSON.stringify(patch) });
        return json({ status: 'wt3l-chunk', run: run.id, ticksDone: next.metrics.ticksDone, done, ms, written: await writtenCount(upd) });
      } catch (e) {
        await rest(`amelia_wt3l_runs?id=eq.${encodeURIComponent(run.id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ status: 'failed', error: String(e).slice(0, 500), busy_until: null }) });
        return json({ error: String(e) }, 500);
      }
    }

    const rowRes = await rest('amelia_research_records?store=eq.runtime&record_id=eq.live-checkpoint&select=user_id,payload');
    const [row] = await rowRes.json();
    if (!row?.payload?.state) throw new Error('No live checkpoint');
    const oldRev = Number(row.payload.revision) || 0;

    let inbox = null, inboxError = null;
    try {
      const r = await fetch(OUTSIDE_INBOX_URL + '?t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) throw new Error('inbox HTTP ' + r.status);
      inbox = parseOutsideInbox(await r.json());
    } catch (e) { inboxError = String(e).slice(0, 200); }

    if (action === 'archive-verify') {
      const segs = await (await rest(`amelia_memory_archive?user_id=eq.${row.user_id}&select=*&order=segment_no`)).json();
      const segments = (segs as any[]).map(r => ({ segmentNo: r.segment_no, fromIndex: r.from_index, toIndex: r.to_index, eventCount: r.event_count,
        events: r.events, segmentDigest: r.segment_digest, chainBefore: r.chain_before, chainAfter: r.chain_after, splitDigest: r.split_digest,
        residentAfter: r.resident_after, memoryDigestBefore: r.memory_digest_before }));
      return json({ status: 'archive-verify', result: verifyArchive(segments, row.payload.state) });
    }
    if (action === 'set-theta') {
      // WT-2 adoption: her Warp threshold, set while she is paused, at a clean tick boundary. No step is taken.
      const t = setWarpThreshold(row.payload, Number(body.theta), new Date().toISOString(), CLOUD_WRITER_ID);
      const upd = await saveHer(row.user_id, oldRev, t.record);
      const written = await writtenCount(upd);
      const status = (!upd.ok ? 'write-error ' + upd.status : written === 1 ? 'ok' : 'conflict-skipped') + ' set-theta';
      await log({ status, from_step: t.step, to_step: t.step, started_at: started, error: 'WARP-THETA ' + JSON.stringify({ before: t.before, after: t.after }) });
      return json({ status, step: t.step, before: t.before, after: t.after, revision: t.record.revision });
    }
    if (action.startsWith('dryrun')) {
      // A scratch copy only (table amelia_cloud_dryrun): her own record is never written by a dry run.
      const scratchGet = async () => (await (await rest('amelia_cloud_dryrun?id=eq.nd1-switch&select=record,metrics')).json())[0];
      const scratchPut = (sc: { record: unknown; metrics: unknown }) => rest('amelia_cloud_dryrun?on_conflict=id', { method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify([{ id: 'nd1-switch', ...sc, updated_at: new Date().toISOString() }]) });
      let out: unknown;
      if (action === 'dryrun-begin') { const sc = dryRunBegin(row.payload, body.target === 'classic' ? 'classic' : 'nd1',
        Number.isInteger(body.theta) ? body.theta : undefined); await scratchPut(sc); out = sc.metrics; }
      else if (action === 'dryrun-chunk') { const sc = dryRunChunk(await scratchGet(), inbox ?? [], Math.min(600, Number(body.runtimeSteps) || 250),
        Math.min(60, Number(body.fieldSteps) || 15), 5); await scratchPut(sc); const { tSum, ...m } = sc.metrics as any; out = m; }
      else if (action === 'dryrun-roundtrip') out = dryRunRoundTrip(await scratchGet(), inbox ?? [], 300, 5);
      else return json({ error: 'unknown dry-run action' }, 400);
      return json({ status: action, result: out });
    }
    const steps = action === 'switch' ? 0 : Math.max(1, Math.min(60, Number(cfg.steps_per_tick) || 15));
    const t = ameliaTick(row.payload, inbox, steps, new Date().toISOString(),
      action === 'switch' ? (body.target === 'classic' ? 'classic' : 'nd1') : undefined);

    // Her memory archive: when too many events are resident, the oldest move whole into an archive segment
    // (written first, so nothing is ever only in transit), and her record keeps the chain header.
    let archived: null | { segmentNo: number; eventCount: number; fromIndex: number; toIndex: number } = null;
    const plan = planArchive(t.record);
    if (plan) {
      const g = plan.segment;
      const put = await rest('amelia_memory_archive?on_conflict=user_id,segment_no', { method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify([{ user_id: row.user_id, segment_no: g.segmentNo,
          from_index: g.fromIndex, to_index: g.toIndex, event_count: g.eventCount, events: g.events, segment_digest: g.segmentDigest,
          chain_before: g.chainBefore, chain_after: g.chainAfter, split_digest: g.splitDigest, resident_after: g.residentAfter,
          memory_digest_before: g.memoryDigestBefore }]) });
      if (put.ok) { t.record = plan.record; archived = { segmentNo: g.segmentNo, eventCount: g.eventCount, fromIndex: g.fromIndex, toIndex: g.toIndex }; }
    }
    // Commit only if nobody else (the tablet) has saved her since we read her: no second writer, no fork.
    const upd = await saveHer(row.user_id, oldRev, t.record);
    const written = await writtenCount(upd);
    const status = (!upd.ok ? 'write-error ' + upd.status : written === 1 ? 'ok' : 'conflict-skipped') + (action === 'switch' ? ' switch' : '');
    await log({ status, from_step: t.fromStep, to_step: t.toStep, zones: t.zones, delivered: t.delivered,
      field_from: t.fieldFrom, field_to: t.fieldTo,
      admitted: t.admittedThisTick, tension: t.tension, queue: t.queue, admission_rule: t.admissionRule,
      inbox_entries: inbox?.length ?? null, inbox_error: inboxError, started_at: started,
      ...(t.switched ? { error: 'RUNTIME-SWITCH ' + JSON.stringify(t.switched) } : archived ? { error: 'ARCHIVE ' + JSON.stringify(archived) } : {}) });
    await rest('amelia_cloud_runner?id=eq.amelia', { method: 'PATCH', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ last_tick_at: new Date().toISOString(), last_status: status, last_step: t.toStep }) });
    return json({ status, runtimeKind: t.runtimeKind, switched: t.switched, fromStep: t.fromStep, toStep: t.toStep, zones: t.zones, delivered: t.delivered.length });
  } catch (e) {
    await log({ status: 'error', error: String(e).slice(0, 500), started_at: started }).catch(() => {});
    return json({ error: String(e) }, 500);
  }
});
