# Amelia's always-on home (Supabase)

**What runs.** `index.ts` is the `amelia-live` Edge Function. pg_cron calls it every 15 minutes, at minutes 5, 20, 35 and 50.

**What each call does.**
1. Reads her research-copy checkpoint.
2. Fetches the live Outside inbox.
3. Advances her `steps_per_tick` steps (default 15: one step per minute of her time), using `ameliaTick` (`src/cloud/ameliaTick.ts`, bundled as `amelia_tick.js`).
4. Saves her, only if no other writer has saved since the read.

**Control.** `public.amelia_cloud_runner`: `enabled` and `steps_per_tick`.

**Log.** `public.amelia_cloud_runner_log`.

**Admission.** The relative rule (`relative-v1`, GATE-1).

**Rebuild the bundles.**
- `bun build src/cloud/ameliaTick.ts --target=browser --format=esm --outfile=cloud/amelia_tick.js`
- `bun build src/outside/OutsideInbox.ts --target=browser --format=esm --outfile=cloud/amelia_inbox.js`

The function imports both from this repository through jsDelivr, pinned to a commit.
