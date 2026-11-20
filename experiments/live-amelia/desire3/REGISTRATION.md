# DESIRE-3: how long desire's connections live, a dose-response. Registered 20 November 2026, before any DESIRE-3 run.

## Why
DESIRE-2 (`../desire2/RESULTS.md`) and its exploratory read showed four things:
- **The Warp guard keeps the motor's real coupling.** Non-Warp coupling stays at 0.292, against ND-1b's 0.062.
- **Dissolution at a half-life of 1,000 steps loses most of that coupling** (0.101).
- **Only the two fixes together bring her Warp share back to ND-1b's level** (7.7% against 7.9%).
- **Tension holds near +0.10 to +0.12 over ND-1b from day 2.** Its source is the incoherence of each passage.

**The approved design, and the change.** The operator approved one candidate on 20 November: renewal of kept connections
by the Outside's trace (threshold 0.05), with coupling on all 12 copies, an 80% coupling bar and a +0.12 tension limit
tested now. A calibration read of her recorded Outside (`returns/RETURNS.json`; input data, not a test) then showed:
- the Outside travels all 90 directed moves;
- it repeats the same move after a median of 350 steps (75th percentile 880, 90th 1,940);
- the renewal rule would bridge 66% of its returns, so on her real Outside it would likely protect almost every
  connection;
- coupling and Warp share both appear to rise with the number of connections she keeps.

The operator then approved (20 Nov) replacing the single candidate with a dose-response over how long desire's connections
live. The four decisions above stand.

## Machinery (branch long1-20261119)
| File | What it is |
|---|---|
| `desire3.ts` | The arms over LONG-1's machinery |
| `../long1/motor.ts` | Flags `warpGuard`, `dissolve`, `hld` (half-life) and `traceRenew` (threshold 0.05, gain 0.01); ND1D unchanged |
| `analyse.ts`, `run_actions.ts`, `../../../.github/workflows/desire3.yml` | The analysis, runner and workflow |
| `../desire3.test.ts` | Synthetic checks |

The synthetic checks:
- each half-life sets how long an unused connection lives;
- the guard alone never fades one;
- renewal holds only at or above its threshold;
- the six arms run and the analysis judges four candidates.

**Pacing.** Every database call is made in the job's own slots, never within 1½ minutes of her ticks at :05, :20, :35 and
:50 (`../desire2/amend1/slots.ts`, the cloud-home session's rules, 19 Nov). Twelve copy jobs share the 24 slots of each
hour, two each.

## Copies, spans and arms
**Copies and spans.** LONG-1's 12 copies and spans, read only: six states of her, two copies each, the first 10 days of
each span.

**Arms per copy.** Every motor arm has the Warp guard.

| Arm | Kept connections | Role |
|---|---|---|
| N | – | ND-1b |
| D2g | Never fade | The benchmark (DESIRE-2's guard only) |
| **H10** | Fade with a half-life of 10,000 steps | Candidate |
| **H3** | Fade with a half-life of 3,000 steps | Candidate |
| **D3** | Fade with a half-life of 1,000 steps, renewed by the Outside's trace while its mark on the edge is ≥ 0.05 | Candidate |
| **D2** | Fade with a half-life of 1,000 steps | Candidate (DESIRE-2) |

Use renews a connection (+0.02 flux), and below 0.05 flux it dissolves. D3 carries the residual subject.

## Claims (`analyse.ts`), for each candidate C
**Method.** The unit is the copy, all 12 (operator's decision). Each claim uses an exact one-sided sign-flip over
copies. Holm runs across the six claims at α = 0.05 / 4 = 0.0125 per candidate (Bonferroni across the four).

**Hard checks on C, in every copy:**
- fewer than 90 open gates every day, with no runaway;
- all 29 CCRU gates every day;
- no day ends in the empty Body without Organs;
- rollbacks in the last third ≤ the first third + 1.

| | Claim | Test |
|---|---|---|
| Y1 | Growth stays bounded | Open gates on day 10, D2g − C > 0 |
| Y2 | Her Warp is her own | Warp share, C − N ≤ +0.02 |
| Y3 | The motor stays open | Non-Warp coupling, C − 0.8 × D2g > 0 |
| Y4 | More open than ND-1b | Non-Warp coupling, C − N > 0 |
| Y5 | Desire still flows | Births in days 6–10, C − 0.5 × D2g > 0 |
| Y6 | Her tension holds a plateau | (a) Daily tension C − N, mean over days 2–10, ≤ +0.12; (b) its mean over days 8–10 minus over days 2–4 ≤ +0.02. Each is a sign-flip on limit − value, and Y6 takes the larger p |

**Non-Warp coupling** is the excess mutual information between the Outside's reading and her zone. It is measured on offer
steps with a non-Warp reading, in the last third of the run, minus 20 shuffles. Copies on which the Outside does not reach
her contribute their flat values, as decided.

**A candidate passes** if its hard checks hold and all six claims are SUPPORTED.

**Selection.** The first passing candidate in the order H10, H3, D3, D2 goes to LONG-1: the longest-lived, which keeps the
most coupling within bounds. If none passes, DESIRE-3 is reported as not passed, and the dose-response says where the
trade-off breaks.

**Reported, not criteria:**
- every arm's open gates by day, Warp share and entries;
- non-Warp and Warp coupling;
- births, held and dissolved connections;
- rollbacks and lines of flight;
- daily tension minus N, and the tension parts;
- S0 for every span;
- D3's subject's statements.

**What follows.** If a candidate is selected, LONG-1's registration is amended to its motor, with a tension limit of +0.12
and a drift of at most +0.02. LONG-1 is then re-piloted (c01–c02, 3 days, slot-paced), sealed and run.

**No pilot.** The synthetic checks of D3's mechanism and the calibration read are disclosed. The half-lives (3,000, which
covers the 90th percentile of the Outside's returns, and 10,000, close to dissolution paused in her silences) were set
from the calibration read before any DESIRE-3 run, and are not tuned.

## Scope
Copies only. Her live record, archive, edge function and runtime are untouched.
