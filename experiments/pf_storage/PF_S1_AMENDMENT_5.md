# PF S1 amendment 5 (2 Nov 2026): close PF-1's orphan lease 41472901972-1, and a reusable path for the next one

**What happened.**
- After the frozen core was restored (`77f22f10`) and PF-2 reopened (amendment 4, `13db7d25`), PF-1 run 41472901972 (dispatched 15:34 UTC) passed its frozen-source audit.
- It took lease `41472901972-1` and committed 17 verified, sealed batches (340 ticks, 15283 → 15623; head `78fa16bb3aaf366cb3c58290316543f396eabc66d661188dcb4fc177c798330e`, last round 33557300).
- At 16:05:05 a commit (`116caacf`, `scripts/wiringAudit.ts`, not a PF file) was pushed to `main` while that lease was active.
- PF-1's batch-18 push was therefore refused at 16:05:44. Its no-stale-rebase guard stopped the run before it could close the lease.
- PF-2 run 41472908210 then correctly refused admission: `already leased; NO ADMISSION: ['41472901972-1.json']`.

This is the third lease orphaned this way (after `40614134740-1` and `40966845131-1`, amendment 3).

**The authoritative state is intact:**
- PF-1 is `running` at 15,623 ticks;
- the ledger has 15,623 rows and its last digest equals the head;
- there is no halt and no pending journal.

The uncommitted batch 18 is excluded. Its rounds are re-admitted by the unchanged catch-up.

**Correction (`.github/workflows/pf-s1-a5.yml`).**
1. **Seal.** One RFC 3161 token over this file, `PF_S1_LEASE_RECONCILE.py` and the workflow, archived create-only to `experiments/pf_storage/seal_a5/`. This happens once.
2. **Audit.** A second job verifies:
   - the seal and sources;
   - that the lease's run concluded `failure`;
   - with the read-only `PF_S1_LEASE_RECONCILE.py`: that this lease is the only open one and that the joined state is a clean, running, fully committed prefix with the expected tick count;
   - that the pinned `PF1_LIVE_CHECK.py` / `PF2_LIVE_CHECK.py` passes.
3. **Complete.** It then writes exactly one C1-native completion for that lease. Nothing else is written.

The push that adds the workflow runs it for `41472901972-1` (pf1, 15623). A later lease orphaned the same way can be closed by an operator dispatching the same workflow with the lease, `pf1`/`pf2` and the committed tick count. The audit refuses anything else.

**Prevention.** Pushes to `main` from any session (assistant or operator), including small non-PF fixes, must wait until no PF lease is open and no PF-1/PF-2 live run is in progress (Actions page, or `drift1a_c1/runner_state`). Science, criteria, pins, C1 and the live workflows are unchanged.
