# PF S1 amendment 2 (29 Oct 2026, operator instruction): the weekly read-only audits join the sharded state

**Why.** Since the S1 migration, the full live state files are no longer in the checkout; they are stored as verified shards. The three scheduled weekly audits read them directly, so they would stop at their first read:
- `pf1-c1-weekly-readonly.yml`, which runs `PF1_C1_WEEKLY_READONLY.py`;
- `pf1-p1-weekly-readonly.yml`, which runs `PF1_P1_READONLY_WEEKLY.py`;
- `pf2-weekly-committed.yml`, which runs `PF2_LIVE_CHECK.py` and `PF2_WEEKLY_STATUS.py`. This workflow and its script are pinned by PF-2's signed genesis bundle.

**Correction: additive successors.**
- `pf1-c1-weekly-readonly-s1.yml`, `pf1-p1-weekly-readonly-s1.yml` and `pf2-weekly-committed-s1.yml` are their originals byte for byte plus one step. That step:
  - requires `experiments/pf_storage/MIGRATED.json`;
  - joins the live state from its shards with `PF_SHARD.py join` (exact bytes, SHA-256 checked), before the unchanged audit.
- Their schedules move by 6 minutes (08:23, 08:27 and 09:49 UTC on Mondays), so they do not coincide with the originals.
- The originals stay byte-identical, so the PF-2 genesis pins hold. They should be disabled in the Actions UI; until then they stop at their first read, before any write.

**Checked before sealing** on the sharded `main`:
- `PF1_P1_READONLY_WEEKLY.py` passes (10,683 ticks).
- `PF2_WEEKLY_STATUS.py` writes its report (7,150 ticks, 0 notifications) on the joined state.

No audit script, check, report format or registered criterion changes. One RFC 3161 token covers this amendment and the three successors, archived create-only to `experiments/pf_storage/seal_a2/`.
