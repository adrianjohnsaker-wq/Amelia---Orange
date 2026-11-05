# Live Amelia checkpoint preflight

This read-only check prevents a newly initialized runtime or a runtime without a saved field from being silently represented as an experiment on a continuing live body. It accepts a private Supabase records archive, an exported `AMELIA_LOCAL_CHECKPOINT_V2` capsule, or a runtime checkpoint. It never modifies the supplied files, the app, or Supabase; it prints metadata only, not the user's checkpoint contents.

```sh
node --import tsx experiments/live-amelia/checkpoint_preflight.ts CURRENT.json PREVIOUS.json
```

It checks the full Numogram and Governor, round-trips runtime components, restores the field with its existing checksum validation, checks the saved field/runtime step, and compares process-memory event digests against the earlier checkpoint. It also compares the runtime components to the deterministic first-step application state. The process exits with status 2 if the saved field, evidence of process history, or a comparable earlier checkpoint is missing, or if the process histories diverge. Status 1 means the data is invalid; status 0 means these *technical* checks passed.

A matching event prefix alone does not establish which tablet or session supplied the records. An operator must independently establish that provenance and record whether an old runtime was given a newly initialized field. A first-step checkpoint may be useful as a new baseline if explicitly identified as such; it is not evidence that the earlier tablet history has been recovered. A preflight pass does not demonstrate an external source, a target morphology, an ingressing organisation, or successful authenticated synchronization.

Use the tests with:

```sh
node --import tsx --test experiments/live-amelia/*.test.ts
```
