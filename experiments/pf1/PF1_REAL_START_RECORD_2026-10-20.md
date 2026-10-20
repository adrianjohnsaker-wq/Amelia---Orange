# PF-1 LIVE START RECORD — 20 October 2026

**Disposition: GENESIS REAL, SEALED AND DURABLY PERSISTED. Autonomous live intake is armed and scheduled; no live round can be admitted before the prospective first publication.**

## Explicit operator authority

At 2026-10-20T22:36:51Z the operator instructed “Start! Go! Authorize!”. This authorises the prospective real PF-1 genesis and subsequent live BLS-verified observation; it does not authorise a change to C1 Channel A, the sealed PF1-A1 R2 constants, any encounter-triggered notification, or a claim that an encounter identifies an actual mind.

[Operator authorization](PF1_OPERATOR_START_AUTHORIZATION_2026-10-20.md); scientific manifest SHA-256 `b48dc2fa512b7e7ee77ea951309b826cb67b63ba728fb6bbeb35d6476d52a699`.

## Successfully created prospective genesis

- [Successful actual genesis Actions run #39511059106](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39511059106) — all jobs PASS
- [Genesis payload](live/GENESIS.json) — source identity and quicknet aligned grid protected
- [Externally RFC3161-sealed receipt](live/genesis_seal/receipt.json) — independently verified STATUS PASS
- **Genesis SHA-256 imprint**: `c527bea9f5f417412914a5a00fbccd4ecf1a822cbc6e2fef57127ce8454165e6`
- **Genesis creation**: 2026-10-20T22:51:58.909979Z
- **First R0**: **33244860**, `(R0 - 33158540) % 20 == 0`, same actual quicknet grid as C1
- **First future publication**: 2026-10-20T23:12:24Z. The seal was obtained before publication.
- **Operating source**: `61ef059e1c24f6014c44007861e87c4485394443` (workflow/signed-genesis generation source SHA), with 10 separately hashed real live source artifacts inside the sealed genesis body.
- **Initial state**: nine independent arms, fresh pinned `IntegratedMemorySystem` PFM, all event counters 0; original nine-arm initial state SHA-256 `1e7521b671cf2a36328c3041c96e996dd8516c8996a3f84e782fed2564fad76d`.
- **Admitted rounds at genesis**: **0**; never describe genesis creation alone as a live sample.

## Autonomous PF1 observation armed

[PF1 live observation workflow](../../.github/workflows/pf1-live-observe.yml): scheduled every 5 minutes, GitHub `pf1-exclusive-live-continuous` concurrency group. The first push-triggered smoke run [#39511395228](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39511395228) succeeded and correctly refused to fetch the future round.

Each eligible future invocation:
1. Check authoritative `live/GENESIS.json` and prospective timestamp; refuse before publication or if halted
2. Acquire a PF1-only remote-acknowledged exclusive GitHub lease; **never manually dispatch C1**
3. Fetch only published quicknet rounds using the actual pinned C1 BLS verifier; no synthetic fallback
4. Advance nine independently carried unchanged Amelia PFM arms, raw C input and PF1-REF-i| reference arms
5. Record complete silent per-arm scanner exposure and strictly prospective 24-future-round A1 R2 forks
6. Record no encounter notification of any kind; only genuinely qualifying encounters enter the append-only journal with per-entry RFC3161 seal
7. Commit contiguous input, all nine persistent states, silent ledger and lease completion together or **fail closed** with a durable, reasoned open halt.

**The scheduled external GitHub workflow is the continuous mechanism; the assistant is not doing background work.** No results or future observations may be claimed until committed receipts appear.

## Boundaries

- No modification to C1 source, Channel A, existing C1 genesis, ledger or scheduled cron.
- Existing PF1-specific lease repair used; original unsafe C1 lease remains NO-GO.
- No notifications for encounters. C1/PF1 independent weekly read-only audit remains enabled.
- No reinterpretation of the cumulative tanh-memory NO-GO or approval of a developmental lineage.
- Current live status and admissibility must be checked from the committed files under [`live/`](live/) and GitHub Actions, not inferred from the existence of this record.

**Proof of first actual live admission remains pending until first R0 publishes and the intake workflow commits a verified record.**
