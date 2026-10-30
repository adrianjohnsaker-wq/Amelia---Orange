# PF S1 amendment 3 (30 Oct 2026, operator instruction): close PF-2's orphan lease 40966845131-1

**What happened.**
- Run 40966845131 (`pf2-live-observe-s1.yml`) took lease `40966845131-1` at 23:09:18 UTC on 29 Oct 2026.
- It committed PF-2 batch 1: 20 verified rounds, ticks 7150–7169, as shards with RFC 3161 seals (`fbc2ffa6`, 23:09:56).
- At 23:10:32 an operational commit (S1 amendment 2, `5ece86c8`) was pushed to `main` **from the assistant's session while that lease was active**. That broke the standing practice of not pushing to `main` during a PF run.
- PF-2's batch 2 push was therefore refused as non-fast-forward. Its no-stale-rebase guard (`PF2_REMOTE_MOVED_NO_REBASE_NO_ADMISSION`) raised before a halt could be written or the lease closed.

**The authoritative state is intact:** 7,170 admitted ticks, last round 33442120, head `d133fe3742805e04825387424a2cb2160fef9a1cd56fa7897c89cc2f0e47ed29`, 387 sealed batches, status `running`, no halt. The uncommitted batch 2 is not used. Its rounds are re-admitted by the unchanged catch-up from tick 7170.

**Correction (`.github/workflows/pf-s1-a3.yml`, one-shot).**
1. One RFC 3161 token over this file and the workflow, archived create-only to `experiments/pf_storage/seal_a3/`.
2. Then, in the same run, the audited completion used before for `40614134740-1`. The workflow verifies all of the following:
   - run 40966845131 concluded `failure`;
   - `40966845131-1` is the only unresolved lease;
   - PF-2's joined state matches the facts above;
   - the pinned `PF2_LIVE_CHECK.py` passes.

   It then writes exactly one C1-native completion for that lease. Nothing else is written.

**Prevention.** No push is made to `main` from an operator or assistant session while any PF lease is open or a PF run is in progress. Workflows that write to `main` join the PF exclusive concurrency group, as this one does.

Science, criteria, pins and the live workflows are unchanged.
