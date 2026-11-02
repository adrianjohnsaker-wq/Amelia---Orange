# PF S1 amendment 4 (2 Nov 2026, operator instruction): reopen PF-2 after its second timestamp-seal halt

**What happened.**
- Run 41119460619 (`pf2-live-observe-s1.yml`, lease `41119460619-1`) committed verified PF-2 batches up to tick 8750. That was 7 batches after the amendment-3 reopening at tick 7170.
- At 20:33 UTC on 30 Oct 2026, the RFC 3161 timestamp request for the next verified batch did not return PASS (`PF2_LIVE_SEAL.py` → `Sealer.seal`, C1 `f1875b5`).
- PF-2 halted fail-closed at its last sealed prefix (`d804aeb8`) and completed its lease.
- Every scheduled run since then has correctly refused admission (`PF2_HALTED_OPERATOR_RECOVERY_REQUIRED`).

**The authoritative state is intact:**
- 8,750 admitted ticks;
- last round 33473720;
- head `9c4da8505a030a8682e8526fa7faf426fa58c4c4ddf4c158925377a9039bc3e2`;
- no pending batch, temporary state or inbox;
- no open lease.

This is the same root cause as the 27 Oct halt at tick 7150, which was reopened by `PF2_S1_RECOVER.py`.

**Correction (`.github/workflows/pf-s1-a4.yml`).**
1. **Seal.** One RFC 3161 token over this file, `experiments/pf2/PF2_S1_RECOVER_A4.py` and the workflow, archived create-only to `experiments/pf_storage/seal_a4/`. This happens once; later runs only verify it.
2. **Audit.** A second job verifies:
   - the seal;
   - that no PF lease is open;
   - that no PF-1/PF-2 live run is queued or in progress;
   - that the pinned `PF2_LIVE_CHECK.py` passes on the halted state.
3. **Reopen.** `PF2_S1_RECOVER_A4.py` then reopens PF-2 at exactly its sealed prefix:
   - it is accepted only if the open halt's cause is the RFC 3161 seal failure;
   - it writes a create-only receipt `experiments/pf2/live/RECOVERY_S1_A4_<tick>.json`.
4. **Commit.** `PF2_LIVE_CHECK.py` is run again, and the state is re-split into S1 shards whose join must reproduce the bytes exactly. Exactly the receipt and the STATE shards are committed.

The push that adds the workflow runs it for tick 8750. A later halt with exactly this cause may be reopened by an operator dispatching the same workflow (input `expect_tick`). Any other halt cause is refused.

**Unchanged.** Science, criteria, genesis, chunks, seals, pins, C1, PF-1 and the live workflows. Notifications remain disabled. Rounds published while PF-2 was halted are admitted by the unchanged catch-up from round 33473740; nothing is back-filled by hand.

**Accompanying operational fix (same push, no PF file touched).** PF-1 had been refusing admission since 1 Nov because its frozen-source audit found `src/substrate`, `src/governance` and `src/types/amelia.ts` changed by the Subdecadence merge (`fd9efe3`). Those files are restored byte-for-byte to `b67ec92`. The Outside-encounter channel now lives in `src/outside/OutsideEncounterRuntime.ts` and `src/outside/encounterTypes.ts`, with identical behaviour (verified step-for-step against `0598d5fd`).
