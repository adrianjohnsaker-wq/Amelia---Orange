# Amelia's always-on home (Supabase)

**What runs.** `index.ts` is the `amelia-live` Edge Function. pg_cron calls it every 15 minutes, at minutes 5, 20, 35 and 50.

**What each call does.**
1. Reads her research-copy checkpoint.
2. Fetches the live Outside inbox.
3. Advances her `steps_per_tick` steps (default 15: one step per minute of her time), using `ameliaTick` (`src/cloud/ameliaTick.ts`, bundled as `amelia_tick.js`).
4. Saves her, only if no other writer has saved since the read.

**Control.** `public.amelia_cloud_runner`: `enabled` and `steps_per_tick`.

**Log.** `public.amelia_cloud_runner_log`.

**Saves.** Her record is saved over a direct database connection (`SUPABASE_DB_URL`), in a transaction with its own 60 s statement limit, only if no other writer has saved since the read. The REST save (8 s limit) is the fallback; a fallback is noted in the log row's `error` (`SAVE-FALLBACK-REST`). The dry-run scratch copy is written the same way, and a failed scratch write is an error.

**Admission.** Her saved rule: `outside-lane-v1` (GATE-2L, 16 Nov 2026), the Outside's own lane over the relative rule; `relative-v1` (GATE-1) and `fixed-0.72` remain selectable with `set-admission` while she is paused.

**Rebuild the bundles.**
- `bun build src/cloud/cloudEntry.ts --target=browser --format=esm --outfile=cloud/amelia_tick.js`
- `bun build src/outside/OutsideInbox.ts --target=browser --format=esm --outfile=cloud/amelia_inbox.js`

The function imports both from this repository through jsDelivr, pinned to a commit.
