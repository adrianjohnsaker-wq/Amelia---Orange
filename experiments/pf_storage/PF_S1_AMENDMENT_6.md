# PF S1 amendment 6 (2 Nov 2026): the weekly S1 audits join the PF exclusive group

**What happened.**
- PF-2 run 41493947064 (lease `41493947064-1`) committed 14 verified, sealed batches (8750 → 9030 ticks; head `6d9182642d280241455e28c226222c04a4322348efb256ae37c71daa71453062`).
- At 18:36:24 UTC the weekly audit `pf1-c1-weekly-readonly-s1.yml` wrote its dated report to `main` through the contents API (`0eb0b1d1`). Its Monday 08:23 schedule had been started by GitHub only at 18:34.
- PF-2's batch-15 push was refused eight seconds later, and the no-stale-rebase guard stopped the run before it could close its lease.
- `pf1-p1-weekly-readonly-s1.yml` wrote another report at 18:39:54.

**Cause.** The three weekly S1 successors (amendment 2) write dated reports to `main` but, like the originals they copy, were not in the PF exclusive concurrency group. That was an omission in amendment 2.

**Correction.**
1. **The fix.** `pf1-c1-weekly-readonly-s1.yml`, `pf1-p1-weekly-readonly-s1.yml` and `pf2-weekly-committed-s1.yml` gain one block: `concurrency: group: pf1-exclusive-live-continuous` (no cancellation of a run in progress). Nothing else in them changes.
2. **The seal.** `.github/workflows/pf-s1-a6.yml` seals this file and the three changed workflows with one RFC 3161 token, archived create-only to `experiments/pf_storage/seal_a6/`. That supersedes amendment 2's hashes for those three files.
3. **The lease.** The orphaned PF-2 lease `41493947064-1` is closed by the reusable amendment 5 path (dispatch with `pf2`, 9030). No new code is needed for that.

**Side effect.** A pending run in a concurrency group can be replaced by a newer pending run in the same group. A weekly audit may therefore occasionally be skipped while PF catch-up runs are queued. It can be re-run by hand (`workflow_dispatch`). The live PF runs are unaffected: they re-admit from the next unadmitted round.

**Still to do (operator).** Disable the retired originals in the Actions UI, as they still wake on their schedules:
- `pf1-c1-weekly-readonly.yml`
- `pf1-p1-weekly-readonly.yml`
- `pf2-weekly-committed.yml`
- `pf1-live-observe.yml`
- `pf2-live-observe-ad2.yml`

Science, criteria, pins, C1 and the live workflows are unchanged.
