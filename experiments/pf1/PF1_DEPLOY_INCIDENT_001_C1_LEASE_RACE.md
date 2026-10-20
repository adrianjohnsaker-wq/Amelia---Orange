# PF-1 pre-live incident: C1 lease acquisition race

**Incident:** PF1-DEPLOY-INCIDENT-001  
**Date:** 20 October 2026  
**Severity:** BLOCKING — admission safety  
**Affected baseline:** existing C1 lease acquisition adapter in `Amelia-0.4`, branch `amelia-1.0`, pinned commit `f1875b5eea5339eb1ac73e50b5df6b103d0cabe9`.  
**Not affected:** accepted PF1-A1 R2 scientific constants, current Amelia runtime, canonical graph, scanner, synthetic experimental evidence.  
**No live start authorised.**

## Provenance

- [Failing six-trial synthetic Git race run #39460285743](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39460285743)
- [Full archived failure artifact #12282776138](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39460285743/artifacts/12282776138)
- [Machine-readable race results](https://github.com/adrianjohnsaker-wq/Amelia---Orange/blob/main/experiments/pf1/c1-compat-output/C1_GIT_LEASE_RACE.json)
- [Untouched pinned C1 implementation](https://github.com/adrianjohnsaker-wq/Amelia-0.4/blob/f1875b5eea5339eb1ac73e50b5df6b103d0cabe9/drift1a_c1/lease_push.py)

## Observed failure

Each of six independent trials created a *new isolated local bare Git repository*, initialized a synthetic lease branch, and launched two independent Git processes from separate clones to acquire a recorder lease. Both invocations used the exact pinned `drift1a_c1.lease_push.acquire()` source and separate prospective workflow IDs.

| Trial | Workers reporting successful admission | Durable outstanding leases | Status |
|---:|---:|---:|---|
| 1 | 2 | 2 | UNSAFE |
| 2 | 2 | 2 | UNSAFE |
| 3 | 2 | 2 | UNSAFE |
| 4 | 2 | 2 | UNSAFE |
| 5 | 2 | 2 | UNSAFE |
| 6 | 2 | 2 | UNSAFE |

The source tries to push a newly claimed lease, and, on push rejection, fetches and **rebases** the pending lease commit onto remote state before retrying. It never rechecks for a foreign unresolved lease after that fetch/rebase. As a result, both agents can ultimately push distinct outstanding lease files and both return `admission_authorized=True`.

This result is a **local Git concurrency reproducible failure**, not evidence of real GitHub-hosted overlapping runs. The source alone is nevertheless unsuitable as PF-1 live admission protection without prospective engineering correction.

## Required fail-closed remedy (PF-1-specific)

Keep the accepted C1 commit and its original evidence unchanged. Introduce a separate **PF-1 lease acquisition adapter** that refuses to push a stale lease after non-fast-forward rejection. It must check remote unresolved leases immediately before preparing the lease and, on any push rejection, **fail closed without rebasing/pushing the already prepared claim**. To retry after unrelated remote changes, abandon the existing lease commit, start from a freshly fetched remote head, revalidate absence of all unresolved leases, create a *new claim*, and only then attempt another conditional push.

Additional required invariant: **do not run ingestion before remote push acknowledgement**; a still-open lease must never self-expire; after ingestion, completion and all input records must be committed transactionally with push/replay reconciliation. A status file or a local `flock` alone is insufficient across GitHub runners.

Before promotion of the PF-1 adapter, test competing simultaneous Git processes from cloned checkouts and verify **exactly one acknowledged lease, exactly one durable outstanding lease** on every trial. Then separately test actual GitHub-run concurrency and evidence persistence (not established by local test), including completion/incident and orphan lease recovery.

## Scientific and approval consequence

This failure does not modify scientific encounter criteria, negate the seven-control engineering pilot, or supersede the *cumulative-memory tanh NO-GO*. It **blocks PF-1 live operation and genesis approval** until the protected persistence interface has been implemented and independently accepted.

**NO LIVE GENESIS. NO LIVE BEACON. NO AUTOMATIC LEASE RESET.**
