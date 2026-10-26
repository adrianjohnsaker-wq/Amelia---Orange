# PF-2 weekly status and measures — 26 October 2026

## Scope and provenance

Snapshot: **26 October 2026, 11:29 UTC**; **4,985 admitted ticks**, **271 committed chunks**, approximately **3.46 days** of live-beacon exposure.

This report records the completed weekly measures supplied by the operator on 26 October 2026. The numerical analysis and replay were not rerun as part of this documentation commit. It is a cumulative early baseline, not a full seven-day window or the registered day-30 assessment.

PF-2 was reported **running normally**, slightly behind wall-clock time and within its catch-up allowance. No new studio result was reported since **Studio 13b**. PF-1 sealed batches were reported committed that morning; this report does not independently audit PF-1.

## Replay gate

The reported replay of all 271 committed chunks reproduced **89,730 logged events**, with **zero mismatches**, covering 4,985 ticks across 18 receivers.

The weekly measures pipeline replays both receiver modes, compares each replayed event's destination zone and cue zone with the committed events, and stops before computing measures if a comparison disagrees. Measures were reported only after that gate passed.

Source: [weekly measures pipeline](../../studio/code/pf2_weekly_indices.sh).

## Capture by zone

Capture is the share of real choices settled by the beacon cue or lineage memory, under the analysis's counterfactual readout.

| Zone | Learner cue | Learner memory | Unchanged control cue | Calibration learner cue | Calibration learner memory | Calibration control cue |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 8.0% | 1.9% | 6.1% | 8.3% | 2.0% | 6.1% |
| 2 | 4.0% | 2.8% | 7.1% | 4.7% | 2.7% | 7.3% |
| 4 | 13.3% | 4.4% | 11.3% | 7.5% | 38% | 9.7% |

Zones 1 and 2 are descriptively close to calibration. Zone 4 has only **45 learner choices and 62 control choices**. Its learner-memory capture is currently much lower than the calibration value. Limited accumulated death history is a proposed early-stage explanation, not an established causal finding from this snapshot.

## Spiral index

| Mode | Spirals per 1,000 steps |
| --- | ---: |
| Learner | 0.74 |
| Unchanged control | 0.94 |

The supplied calibration comparison places learners at approximately 0.47 early, rising to 1.1 over the month, and controls at 0.8–1.0. The present values provide a baseline; a live trend requires further weeks.

## Future-information diagnostic

| Mode | Reported family-wise p |
| --- | ---: |
| Learner | 0.35 |
| Unchanged control | 0.30 |

Neither result meets the fixed **p < 0.01** criterion. There is **no detected future-information signal in this snapshot**; this is not proof of absence.

The existing decision rule remains: **p < 0.01, replicated the following week, with learner and control counted as one test family**. The two mode values do not create two independent discovery opportunities. This documentation commit does not change the correction, threshold, or replication requirement.

## Registered assessment and next step

- P2-1 and P2-2 remain **NOT EVALUATED** in this weekly update.
- The registered day-30 assessment is due at **43,200 admitted ticks**, approximately **21 November 2026**, governed by the actual admitted count rather than calendar date.
- The existing P2-2 sparse-event extension to **86,400 admitted ticks** remains applicable if fewer than ten qualifying deaths have occurred at day 30.
- Continue the existing live intake and weekly reporting. Preserve the frozen science, registration, signed chunks, and original evidence.
- The next weekly snapshot should retain the same measures and decision rule, allowing the early baseline to be compared without an interim P2-1/P2-2 decision.

References: [registration](../PF2_RECEIVER_REGISTRATION_AND_WORK_ORDER.md), [engineering log](../PF2_LOG.md), [weekly journal generator](../PF2_WEEKLY_STATUS.py).

This dated narrative supplements the detailed 18-receiver journal; it does not substitute for its per-lineage death, cue, route, and encounter records.
