# PF S1 amendment 7 (3 Nov 2026, operator instruction): the PF pacer

**Why.** GitHub starts scheduled workflows late or not at all under load.
- **Live runs stalled.** PF-1/PF-2 live runs, scheduled every 15 minutes, went hours without starting; for example, nothing ran from 03:04 to 08:35 UTC on 3 Nov.
- **Recovery waited on a person.** The sealed recoveries of amendments 4 and 5 waited for someone to dispatch them. PF-2 halted on an RFC3161 seal failure overnight, at tick 11910, and stayed halted.

The operator asked that this run without manual monitoring.

**What.** `.github/workflows/pf-pacer.yml` runs `experiments/pf_storage/PF_PACER.py`. Every four minutes it does the following:
1. **When the PF group is busy.** It does nothing while any PF exclusive-group run (live, recovery, seal or weekly) is running or waiting.
2. **An orphaned lease.** If one PF lease is open and its run concluded `failure`, it dispatches the amendment 5 completion (`pf-s1-a5.yml`) with:
   - that lease;
   - its experiment, taken from the run's workflow;
   - the committed tick count.
3. **An RFC3161 halt.** If PF-2's state is halted and the halt's cause is an RFC3161 failure in `PF2_LIVE_SEAL.py`, it dispatches the amendment 4 reopening (`pf-s1-a4.yml`) with the halted tick.
4. **Otherwise.** It dispatches the next live run, PF-1 and PF-2 alternately, each at most every 12 minutes. A live run admits only rounds already due, so a caught-up experiment admits nothing.

Each recovery is the existing sealed, self-auditing workflow, and each refuses anything outside its exact case.

**Limits.**
- **No writes.** The pacer never commits or pushes, so it cannot collide with a PF lease. It changes no science, criteria, pins, C1 or live workflow.
- **When automation stops.** Automation stops for a case, and one GitHub issue is opened so the operator is told by GitHub's usual email, when there is:
  - another halt cause;
  - a PF-1 halt;
  - more than one open lease;
  - a failed recovery;
  - more than 4 automatic recoveries in 24 hours.

  Closing the issue resumes automation for that case.
- **One instance.** One pacer runs at a time (its own concurrency group, outside the PF group). It dispatches its successor after about 5 h 15 min. The schedule at :11 and :41 restarts it if a handover is lost.

**Sealed** by `.github/workflows/pf-s1-a7.yml`: one RFC 3161 token over this file, the pacer workflow and its script, archived create-only to `experiments/pf_storage/seal_a7/`.

**Also done.** The five retired originals are disabled in Actions:
- `pf1-c1-weekly-readonly.yml`
- `pf1-p1-weekly-readonly.yml`
- `pf2-weekly-committed.yml`
- `pf1-live-observe.yml`
- `pf2-live-observe-ad2.yml`
