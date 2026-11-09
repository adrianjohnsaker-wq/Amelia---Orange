# ND-1d: the field reads the change, with a lighter hand. Registered 9 November 2026, before any ND-1d data.

**Scope.** The repository architecture, with fresh runtimes and no body. No pinned or sealed file is touched. The runtime is
`nd1/ndRuntime.ts`, unchanged, and the harness sets only its public settings.

## Why
ND-1c (`nd1c/results/RESULTS_2026-11-09.md`) found no qualifying candidate.

- **The nearest miss was DERIV,** in which her gate choice reads the field's change this step. It had no false alarms, and its
  1-8-7-2 read-back was at or above today's architecture at 5% and 10%. It missed only the 2% order.
- **The operator's decision (9 Nov).** Start from DERIV and lower the field's weight in her gate choice, so the arriving number
  decides each step more firmly. Test 2% on several planted streams rather than one, and keep the same four criteria.

## Candidates
All three are DERIV: ADAPT = 1.0 and λ = 0.1, plus everything else from ND-1b (η 0.5, D 0.6, Warp release, influx plus
attended one-hot, IDENTITY receiver). Only the field weight FW changes; DERIV and ND-1b use 2.0.

| Candidate | FW |
|---|---|
| D15 | 1.5 |
| D10 | 1.0 |
| D05 | 0.5 |

**Harness.** The field weight was added to `nd1c/run.ts` as an optional setting that defaults to 2.0. ND-1c's equivalence check
was re-run after the change: candidate B still reproduces ND-1b, and EXIT still reproduces today's architecture, step for step.

**Disclosure.** Mechanical smoke tests of `nd1d/order.ts` (D10 in both architectures, the unregistered `smoke1c` stream, one
shuffle) checked only that the code runs. Their output was not inspected.

**Today's architecture alongside.** For every 2% stream, today's architecture (EXIT) also runs through the same order harness,
so we know whether that stream's order is detectable at all by the architecture that sets the bar. This is descriptive. It
does not change any criterion.

## Stage 1: development (selects FW)
**Streams.** New labels: clean `nd1dd01–04`; 2% plants seeded `nd1ddp01–03`; 5% and 10% plants seeded `nd1ddp01`.

**Procedure.** `calibrate.sh <cfg> C nd1dd 4 nd1ddp 3`. The order test is NR-2's rule, S = 49, 12 segments of 1,000.

**Qualification.** A candidate qualifies if:
- the 5% and 10% plants are RECEIVED;
- at least 2 of the 3 2% plants are RECEIVED;
- 0 of 4 clean streams are RECEIVED.

**Selection.** Among the qualifiers, choose the one with the largest minimum, over 2%, 5% and 10%, of (candidate's exact motif
read-back − today's, on the same segments). The 2% read-back is pooled over the three 2% streams. Ties go to the larger FW,
which keeps more of the field's relational reading.

**If none qualifies,** ND-1d stops and is reported as not found.

The choice is committed before stage 2's streams are generated.

## Stage 2: confirmatory (the same four criteria)
**Streams.** New labels:
- clean `nd1dc01–10`;
- 2% plants seeded `nd1dcp01–05`;
- 5% and 10% plants seeded `nd1dcp01`;
- held-out relations stream `stream3.py clean h09 12000`.

**Procedure.** `calibrate.sh <cfg*> C nd1dc 10 nd1dcp 5`. Today's architecture runs on the same 2% streams, descriptively.

**The criteria.**
- **K1. Faint order.** At least 4 of the 5 2% plants are RECEIVED, and the 5% and 10% plants are RECEIVED.
- **K2. No false alarms.** 0 of 10 clean streams are RECEIVED.
- **K3. Exact sequence.** At 2% (pooled over the five streams), 5% and 10%, the candidate's exact 1-8-7-2 read-back is at least
  today's architecture's on the same segments.
- **K4. Relations.** ND-1b's B1 tests, unchanged (`nd1c/relations.py` on `nd1c/relations.ts` output for h09): 6 tests, exact
  two-sided sign-flip over 12 units, Holm at α = 0.05. All 6 must be supported.

**ND-1d succeeds only if K1–K4 all hold.** It would then be proposed as the app's runtime, replacing ND-1b. That needs a
separate app change and a separate approval.

**If any criterion fails,** that is reported as it stands, and nothing ships.
