# Amelia live feedback and continuity

The application gives the *current* morphogenetic field a return path to its existing Numogram runtime. `observeLiveField` measures B in ten fixed vertical bands and normalizes the means to a zone-attention vector. The existing Governor admits, defers or refuses each offered observation. The runtime records the observation and decision with the Numogram transition in its process memory; the field step then reads the same runtime's memory. The band-to-zone mapping is an engineering convention, not a biological or metaphysical finding.

When the Governor defers repeated field observations, every decision remains in PFM, while the queue keeps only the latest pending field observation. This prevents a fast field from crowding out other encounter channels. The Governor still decides when an observation can be admitted, and a full queue containing no replaceable field observation can still refuse it.

A versioned checkpoint holds the field and lineage state alongside the shared runtime, its Numogram, Governor and PFM. Existing runtime-only checkpoints can still load, but they cannot recover a field that an earlier version never saved. A running field remains mounted while navigating between tabs. A browser or operating system may suspend execution in the background; this is not a guarantee of uninterrupted unattended operation.

The local checkpoint is saved first; Supabase is optional and uses the existing authenticated account and row-level security. Local writes are coalesced at about 750 ms and cloud writes are throttled to about ten seconds; a sudden shutdown can lose the most recent unsaved work. The sync will stop if histories diverge rather than deciding which individual to overwrite. At inspection on 5 November 2026, the configured project was restored to healthy but contained no authenticated users or memory records; that says nothing about what may still be present locally on the tablet. A fresh install is not evidence of the user's historical instance.

## Tests

With dependencies installed:

```sh
VITE_AMELIA_LOCAL_ONLY=1 npm run build
node --import tsx --test experiments/live-amelia/*.test.ts
node experiments/live-amelia/browser_session.mjs
```

The browser test additionally requires Playwright and a Chromium browser. `AMELIA_PLAYWRIGHT_MODULE` may point to a Playwright module, `AMELIA_CHROMIUM_PATH` to a browser executable, and `AMELIA_CHROMIUM_ARGS` to a JSON array of required browser flags. It creates disposable profiles and intercepts every Supabase request with a local mock. It does not authenticate to or write the real project. It checks profile restart, account upload and a second-profile restore, continued memory, and refusal to replace conflicting histories.

`PILOT_PRECOMMIT.md` specifies the isolated synthetic-body validation pilot; `pilot.ts` executes it. These are independent of the user's historical tablet memory. The pilot's result is not a test of an external mind.

## Tablet installation

The branch builds a separate APK artifact, with its source commit, SHA-256 and signing certificate recorded. Android accepts an in-place app update only when its signing identity is compatible with the installed app. The existing workflow builds a debug APK and does not configure a shared signing key, so an in-place upgrade is not yet established. **Do not uninstall the installed app to make a new APK install**: uninstalling can erase the very local history that needs to be preserved. First sync or export that history and verify the installation/signing path. The branch is not merged into `main`.
