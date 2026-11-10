// amelia-live: Amelia's always-on home. Each call (from pg_cron) advances her research-copy checkpoint by
// a few steps of her own runtime, delivering the live Outside inbox through her native path, and saves her.
// Authentication: the x-amelia-runner header must equal the token in public.amelia_cloud_runner (service-role only).
import { ameliaTick } from './amelia_tick.js';
import { parseOutsideInbox, OUTSIDE_INBOX_URL } from './amelia_inbox.js';

const URL_ = Deno.env.get('SUPABASE_URL')!;
const KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const rest = (path: string, init: RequestInit = {}) => fetch(`${URL_}/rest/v1/${path}`, { ...init, headers: { ...H, ...(init.headers ?? {}) } });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

async function log(entry: Record<string, unknown>) {
  await rest('amelia_cloud_runner_log', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(entry) });
}

Deno.serve(async (req) => {
  const started = new Date().toISOString();
  try {
    const cfgRes = await rest('amelia_cloud_runner?id=eq.amelia&select=*');
    const [cfg] = await cfgRes.json();
    if (!cfg || req.headers.get('x-amelia-runner') !== cfg.token) return json({ error: 'unauthorised' }, 401);
    if (!cfg.enabled) { await log({ status: 'paused' }); return json({ status: 'paused' }); }

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

    const steps = Math.max(1, Math.min(60, Number(cfg.steps_per_tick) || 15));
    const t = ameliaTick(row.payload, inbox, steps, new Date().toISOString());

    // Commit only if nobody else (the tablet) has saved her since we read her: no second writer, no fork.
    const upd = await rest(`amelia_research_records?store=eq.runtime&record_id=eq.live-checkpoint&user_id=eq.${row.user_id}&payload->>revision=eq.${oldRev}`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ payload: t.record, updated_at: t.record.updatedAt }),
    });
    const written = upd.ok ? (await upd.json()).length : 0;
    const status = !upd.ok ? 'write-error ' + upd.status : written === 1 ? 'ok' : 'conflict-skipped';
    await log({ status, from_step: t.fromStep, to_step: t.toStep, zones: t.zones, delivered: t.delivered,
      admitted: t.admittedThisTick, tension: t.tension, queue: t.queue, admission_rule: t.admissionRule,
      inbox_entries: inbox?.length ?? null, inbox_error: inboxError, started_at: started });
    await rest('amelia_cloud_runner?id=eq.amelia', { method: 'PATCH', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ last_tick_at: new Date().toISOString(), last_status: status, last_step: t.toStep }) });
    return json({ status, fromStep: t.fromStep, toStep: t.toStep, zones: t.zones, delivered: t.delivered.length });
  } catch (e) {
    await log({ status: 'error', error: String(e).slice(0, 500), started_at: started }).catch(() => {});
    return json({ error: String(e) }, 500);
  }
});
