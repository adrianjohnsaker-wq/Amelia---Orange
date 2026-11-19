/**
 * DESIRE-2 Amendment 1: the cloud-home session's pacing (19 Nov), applied to the sealed runner without changing it. Loaded
 * with `bun --preload`, it wraps fetch for calls to her database (SUPABASE_URL) only:
 *   - her ticks run at :05, :20, :35, :50 (pg_cron), each about 6-20 s from about :x5:02;
 *   - no large read or write starts within 1.5 minutes of a tick minute;
 *   - one large read or write at a time, two minutes apart.
 * The free slots are 24 an hour, each a whole minute: :00 :02 :07 :09 :11 :13 :15 :17 :22 :24 :26 :28 :30 :32 :37 :39
 * :41 :43 :45 :47 :52 :54 :56 :58 (00:00 of each). Job k of n (SLOT_CLASS, SLOT_CLASSES) may start a call only at a slot
 * whose running index is k modulo n, so no two jobs ever share a slot, and each job makes one call per slot.
 * The analysis's one large read of every result row (`id=like.desire2-c*`, `select=id,metrics`) is served instead as a
 * read of the ids, then reads of ROWS_PER_SLOT rows at a time, each in its own slot, and returned to the runner as the
 * same JSON array. Logged: the time and kind of each call, never its data.
 */
export const SLOT_MINUTES = [0, 2, 7, 9, 11, 13, 15, 17, 22, 24, 26, 28, 30, 32, 37, 39, 41, 43, 45, 47, 52, 54, 56, 58];
export const TICK_MINUTES = [5, 20, 35, 50];
const ROWS_PER_SLOT = 4;
/** The running index of the slot starting at time ms (UTC), or -1 if ms is not a slot start minute. */
export const slotIndexAt = (ms: number) => { const m = Math.floor(ms / 60000), h = Math.floor(m / 60), k = SLOT_MINUTES.indexOf(((m % 60) + 60) % 60);
  return k < 0 ? -1 : h * SLOT_MINUTES.length + k; };
/** The start (ms) of this job's next slot at or after `from`. */
export function nextSlot(from: number, cls: number, n: number) { let m = Math.ceil(from / 60000) * 60000;
  for (let i = 0; i < 24 * 60; i++, m += 60000) { const s = slotIndexAt(m); if (s >= 0 && s % n === cls) return m; }
  throw new Error('no slot'); }
/** Clear of every tick by 1.5 minutes for the whole slot minute. */
export const clearOfTicks = (startMs: number) => { const t = ((startMs / 60000) % 60 + 60) % 60;
  return TICK_MINUTES.every(k => { const d = Math.min(Math.abs(t - k), 60 - Math.abs(t - k), Math.abs(t + 1 - k), 60 - Math.abs(t + 1 - k)); return d >= 1.5; }); };

const URL_ = process.env.SUPABASE_URL ?? '', CLS = Number(process.env.SLOT_CLASS ?? 0), N = Number(process.env.SLOT_CLASSES ?? 1);
const real = globalThis.fetch.bind(globalThis);
let last = 0;
async function inSlot<T>(what: string, go: () => Promise<T>): Promise<T> {
  const at = nextSlot(Math.max(Date.now(), last + 60000), CLS, N);
  if (process.env.SLOTS_DRYRUN !== '1') await new Promise(r => setTimeout(r, Math.max(0, at - Date.now())));   // DRYRUN: tests only, never in the workflow
  last = at; console.log(`[slot] ${new Date(at).toISOString().slice(11, 16)} ${what}`); return go(); }
if (URL_ && process.env.SLOTS !== 'off') {
  (globalThis as any).fetch = async (input: any, init?: any) => {
    const u = String(input?.url ?? input);
    if (!u.startsWith(URL_)) return real(input, init);
    const method = String(init?.method ?? 'GET');
    if (method === 'GET' && /id=like\./.test(u) && /select=id,metrics/.test(u)) {   // the analysis's read of all result rows
      const idsRes = await inSlot('GET ids', () => real(u.replace('select=id,metrics', 'select=id'), init));
      if (!idsRes.ok) return idsRes;
      const ids: string[] = (await idsRes.json()).map((x: any) => x.id), rows: any[] = [];
      for (let i = 0; i < ids.length; i += ROWS_PER_SLOT) { const part = ids.slice(i, i + ROWS_PER_SLOT), q = u.replace(/id=like\.[^&]*/, `id=in.(${part.join(',')})`);
        const r = await inSlot(`GET ${part.length} rows`, () => real(q, init)); if (!r.ok) return r; rows.push(...(await r.json())); }
      return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return inSlot(`${method} ${u.slice(URL_.length).split('?')[0]}`, () => real(input, init));
  };
}
