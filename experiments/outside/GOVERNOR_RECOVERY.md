# Continuous Outside Governor recovery

This policy resumes the existing `outside-live-ledger` state with the existing
Governor and queue. It is a recorded intervention in a live research history.
The tablet and the Oracle are separate receivers and are not modified.

Before the first intervention, the workflow saves the precise current live
Git commit on a new `outside-pre-governor-recovery-<run>` branch. The runner
requires that reference and records it with SHA-256 digests of the state and
ledger it actually read. Missing state, a mismatched ledger, a missing archive,
a bad journal, an altered historical PFM prefix, a missing original offer, or
an undrained queue aborts the cycle before a result is committed. Git pushes
are ordinary fast-forwards; the worker never overwrites a newer live commit.

The collector applies Amelia's existing `triggerConsolidation()` when the
Governor's preceding tension is at least **0.66**, then lets the unchanged
Governor decide whether to attend the next item. It drains older queued items
before offering another item, without evicting, forcing, or reordering them.
The trigger is a working liveness policy selected in exploratory tests, not a
prespecified scientific threshold. Consolidation changes retained memory.

`recovery-journal.jsonl` is an append-only, hash-linked sidecar committed with
the state and Outside ledger. It records every consolidation's memory effects
and every new offer and admission's original event ID, source digest, original ledger digest,
offer/capture time and offer step; admissions also include admission time,
admission step, and Numogram passage. Cycle summaries count attended, deferred,
and refused offers. The start and end records bind each cycle to its source checkpoint,
state/ledger hashes, queue, event-history prefix, and final journal head.
Delayed admissions are old offers, not new source arrivals.
The first recovery cycle predates the added compact offer records; its original
offers remain in the Outside ledger and its admissions are in the journal.

The recovery workflow shares the Outside worker's concurrency group and takes
over the active worker. Its successor uses the same code branch, keeping the
maintenance policy in place. The normal scheduled `main` job is unchanged;
if the recovery workflow stops unexpectedly, an older scheduled worker could
resume, so check the live worker and journal rather than assuming permanence.
Do not treat the intervention period as ordinary untreated baseline data.

The comparison assay should start only after observing actual live admissions,
queue drainage across subsequent cycles, and appropriate calibration for this
memory-changing policy. Align delayed admissions with original offers and use
independent histories with disjoint inputs. This patch does not run the assay
or modify the sealed SXI-1R, NR-2, or ANTENNA B studies.

## Offline checks

With Node 22+ and `tsx` installed, run from the repository root using local,
matching pre-recovery fixtures:

```
npx tsx experiments/outside/recovery-regression.ts /path/state.json /path/ledger.json
npx tsx experiments/outside/recovery-integration.test.ts /path/state.json /path/ledger.json
```

The integration check substitutes synthetic RSS responses, uses a temporary
copy, runs two cycles, checks all original offer times and the retained PFM
prefix, and verifies that an altered journal or absent pre-archive fails closed.
