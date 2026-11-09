# PF S1 amendment 9 (9 Nov 2026, operator instruction): reopen PF-1 after a release-upload server error; restore halt alerting

## What happened
Run 42313639382 (`pf1-live-observe-s1.yml`, lease `42313639382-1`) committed verified A1 batch 1 (17 rounds), reaching **tick 24511**, round 33735060 and head `299d035d68eaf006f831dc6462c7e4cda391e490ddb5a808547479be8439dbaf` (commit `adb275e5`). At 23:45 UTC on 6 Nov 2026 the upload of batch 2's state asset to the `pf-live-state` release returned **HTTP 500** from GitHub (`PF_STORE_GH_FAILED gh release upload pf-live-state: HTTP 500`).

PF-1 then did what it was designed to do:
- it restored its last committed state;
- it halted fail-closed at the durably committed prefix (`543c0112`);
- it completed its lease (`794c67a3`).

Every PF-1 run since has correctly refused admission (`PF1_A1_HALTED_OPERATOR_REVIEW_REQUIRED`). PF-2, which needs the PF-1 safe lease, has admitted nothing either.

## The authoritative state is intact
- 24,511 admitted ticks; last round 33735060; head `299d035d…`;
- the silent ledger matches (24,511 rows);
- no pending journal; no open lease.

The cause was GitHub's storage service, not PF-1's science, data or chain.

## Why nobody was told
The PF pacer (amendment 7) finds halts through the last commit touching `experiments/<pf>/live/STATE.json.shards`. **Amendment 8 replaced that file with `STATE.json.pointer.json`, and so, from then on, the pacer never saw a halt.** It opened no issue, started no recovery, and kept dispatching live runs that the halted experiment refused. This was an error in amendment 8.

The pacer is sealed by amendments 7 and 8, and every live and recovery run verifies those hashes. It is therefore **not edited**; a separate watcher takes over its halt duty.

## Correction
1. **`.github/workflows/pf-s1-a9.yml`** follows amendment 4's pattern.
   - **Seal.** One RFC 3161 token over this file, `experiments/pf1/PF1_S1_RECOVER_A9.py`, the workflow, `PF_HALT_WATCH.py` and `pf-halt-watch.yml`. It is archived create-only to `experiments/pf_storage/seal_a9/`.
   - **Audit.** The workflow checks:
     - the seals `seal`, `seal_a8` and `seal_a9`;
     - that no PF lease is open;
     - that no PF-1 or PF-2 live run is queued or in progress;
     - that the pinned `PF1_LIVE_CHECK.py` passes on the halted state.
   - **Reopen.** `PF1_S1_RECOVER_A9.py` reopens PF-1 at exactly its committed prefix. It is accepted only if the open halt's reason is exactly an A1 batch failure caused by `PF_STORE_GH_FAILED gh release upload pf-live-state: HTTP 5xx`.
   - **Receipt.** It writes a create-only receipt, `experiments/pf1/live/RECOVERY_S1_A9_<tick>.json`.
   - **Re-verify and commit.** `PF1_LIVE_CHECK.py` runs again, and the state is re-split, with a join that must reproduce the bytes exactly. Only the receipt and the state pointer are committed.

   The push that adds the workflow runs it for tick 24,511. A later halt with exactly this cause may be reopened by dispatching the same workflow (input `expect_tick`).

2. **`.github/workflows/pf-halt-watch.yml` with `experiments/pf_storage/PF_HALT_WATCH.py`** runs every 30 minutes, reads the correct pointer file, and acts as follows:
   - for a PF-1 halt with exactly the cause above, it dispatches amendment 9;
   - for a PF-2 halt with exactly amendment 4's cause (an RFC 3161 seal failure), it dispatches amendment 4. This restores what amendment 7 intended.
   - **For anything else** (another cause, a failed recovery, or more than 3 automatic recoveries in 24 hours), it opens one GitHub issue, which GitHub emails to the operator, and leaves the case alone until the issue is closed.
   - It never commits.

## Unchanged
Science, criteria, genesis, ledger rows, journals, seals, pins, C1, PF-2, the pacer, the live workflows and every file sealed by amendments 1–8 (no existing file is modified). Notifications about encounters remain disabled. Rounds published while PF-1 was halted are admitted by the unchanged A1 catch-up, up to 480 per run, from round 33735080; nothing is back-filled by hand.
