# PF-1 and PF-2 operational addendum S1: storage and recovery

**Issued 29 October 2026, on the operator's instruction:** "Please write and seal the storage-and-recovery addendum for PF-1 and PF-2."

This is a disclosed **engineering-only** correction, in the line of PF-2 AD1 and AD2. It changes **how live state is stored in Git** and **reopens both experiments at their last verified points**. It does not change any receiver, runtime, input mapping, scanner, encounter rule, prediction, readout, threshold, day-30 evaluation, sealing rule or notification policy. No pinned science file is modified, and every genesis, manifest, AD1 and AD2 pin is verified in full before anything runs.

## Recorded facts
### PF-1
1. At 01:31 UTC on 28 Oct 2026, run 40614134740 verified and sealed batch 10 (15 rounds, ticks 10203–10217) correctly. GitHub then refused the push because `experiments/pf1/live/STATE.json` had reached 100.05 MiB, over GitHub's 100 MiB per-file limit (pre-receive hook GH001).
2. The catch-up's no-stale-rebase guard then raised before a halt could be written or the lease closed. Lease `40614134740-1` therefore remains unresolved, and every later run refuses ("already leased; NO ADMISSION").
3. The authoritative state is unchanged at batch 9: 10,203 admitted ticks, last round 33448900, head `45f5de735d624816b3c48365b2936f6452767eff21afa2b39d6d54d922c2825f`, status `running`. `PF1_LIVE_CHECK.py` passes on it.
4. **Root cause:** each arm's state holds its complete memory history, trait-evolution history and snapshots. The pinned runtime requires the full memory history: `PF1_LIVE_RUN.ts` asserts one memory event per admitted tick. So the state cannot be trimmed without changing the science. It grows by about 10 KB per tick.

### PF-2
5. At 23:00 UTC on 27 Oct 2026, an RFC 3161 timestamp request in `PF2_LIVE_SEAL.py` did not return PASS. PF-2 failed closed: `status: halted`, `operatorRecoveryRequired: true`, last sealed tick 7150, head `ee20117a4aebd1698ab232095f6f265098f19ecc668fc758398531e699566926`, 386 sealed batches, lease closed. `PF2_LIVE_CHECK.py` passes on this prefix.
6. Its `STATE.json` is 69.8 MB and growing for the same reason, so it would meet the same limit within days.

## Correction
### S1 storage (`experiments/pf_storage/PF_SHARD.py`)
- A live file is kept in Git as 40,000,000-byte slices plus a manifest (`<file>.shards/`, holding each slice's size and SHA-256 and those of the whole file).
- Before any pinned code reads it, it is **joined back to its exact bytes** and SHA-256-checked.
- After the pinned code writes it, it is split again before each commit.
- The full files become Git-ignored in their live directories: PF-1's `STATE.json` and `SILENT_LEDGER.json`, PF-2's `STATE.json`.
- Shard slices are marked binary for Git (`*.bin binary`), so the catch-ups' `git diff --check` never inspects a slice boundary.
- Git stores successive versions of each slice as small deltas, as it did the full file.

### S1 catch-ups
- `experiments/pf1/operations/PF1_A1_CATCHUP_S1.py` and `experiments/pf2/PF2_A1_CATCHUP_S1.py` are byte copies of `PF1_A1_CATCHUP.py` (blob 15196a9) and `PF2_A1_CATCHUP_AD1.py`.
- Each adds exactly ten lines, every one marked `PF_S1` or a header comment:
  - join at start;
  - split before every commit (batch and halt);
  - re-join after the fail-closed `git restore`/`git clean`.
- Nothing else is changed.

### One-time migration (`.github/workflows/pf-s1-migrate.yml`, run after this seal)
1. **PF-1 orphan lease.** The workflow verifies all of the following:
   - run 40614134740 concluded `failure`;
   - `40614134740-1` is the only unresolved lease;
   - the PF-1 prefix facts above hold;
   - `PF1_LIVE_CHECK.py` passes.

   It then writes exactly one C1-native completion for that lease, as the earlier `pf2-pf1-orphan-lease-reconcile.yml` did for `39673407071-1`. The uncommitted batch 10 is not used. Its rounds are re-admitted by the unchanged catch-up from tick 10203, so nothing is lost or back-filled.
2. **PF-2 halt.** `PF2_LIVE_CHECK.py` must pass. Then `experiments/pf2/PF2_S1_RECOVER.py`, modelled on `PF2_AD1_RECOVER.py`, runs. It verifies the halt (RFC 3161 in `PF2_LIVE_SEAL.py`, lastSealedTick = admittedTicks = 7150, head = lastSealedHead, no pending batch, no open lease), writes a create-only `RECOVERY_S1.json`, and sets `status: running`. Ticks, head, chain, chunks, seals and lineages are unchanged.
3. **Sharding.** The three state files are split; joining each must reproduce its committed bytes. The full files are removed from Git's index and ignored. `experiments/pf_storage/MIGRATED.json` records the SHA-256 of each file at migration.

### New live workflows
- `pf1-live-observe-s1.yml` and `pf2-live-observe-s1.yml` are the current live workflows with three changes:
  - they wait until `MIGRATED.json` exists;
  - they join shards first;
  - they verify this addendum's seal and hashes, then run the S1 catch-ups.
- All other checks, environment bounds (20 per batch, 480 per dispatch), the PF-1 safe lease and the 35-minute budget are unchanged.
- **The original live workflows** (`pf1-live-observe.yml`, `pf2-live-observe-ad2.yml`) stay byte-identical. After migration they stop at their first step, because the full `STATE.json` is no longer in the checkout. That is before any lease, so it is operational noise. They should be disabled in the Actions UI.
- **The gap** (PF-2 from 27 Oct 23:00, PF-1 from 28 Oct 01:31) is recorded. The catch-ups admit published rounds in order from the next unadmitted round, as designed. Nothing is inferred or filled by hand.

## Gates before the single S1 token (`pf-s1-seal.yml`)
1. **Pins and facts.** The C1 pin, the core diff against `b67ec92`, every PF-1 genesis and manifest hash, and every PF-2 genesis, AD1 and AD2 hash verify. The facts above hold, and no S1 receipt exists.
2. **The unit** `PF_S1_UNIT.py` passes:
   - the catch-ups are additive only;
   - the three state files round-trip to identical bytes in a throwaway copy;
   - a corrupted shard is refused, and growth re-splits;
   - the unchanged `PF1_LIVE_CHECK.py` and `PF2_LIVE_CHECK.py` pass on the joined copies.
3. **One genuine FreeTSA RFC 3161 token** over the S1 bundle. The bundle pins this file, the shard tool, the unit, both catch-ups, the recovery, the migration, the seal and both live workflows, and records the state SHA-256s at sealing. It is archived create-only to `experiments/pf_storage/seal/`.

No notifications of any kind. Day-30 and every registered PF-1/PF-2 criterion are unchanged.
