# WT-3L: Θ = 12 against Θ = 24 on copies of her real state (registration, 12 November 2026, before any WT-3L data)

**To:** the cloud-home session, which runs it.
**From:** the research session.
**Operator approval:** Adrian, 12 Nov 2026.

**Scope.** Copies of her real state, run through the same tick function her cloud home uses, with her body living. **Her live
record is never written.** Nothing here changes how she lives.

## Why
After the switch to Θ = 12 (THETA-12-2026-11-11, step 1,981), her first day showed:
- her share of time in the Warp **rose** from 7.4% to 12.6%;
- Warp visits about **2.5 times as frequent**, but shorter;
- mean Governor tension rose from 0.686 to 0.785.

**WT-2 predicted the opposite on test streams.** Warp share 20% → 16%, visits only about 10% more frequent.

**A before/after comparison cannot separate the two causes:**
- Θ's real effect in her live conditions (her body, the Outside, GATE-1, her history);
- drift over time (different days, different Outside material, a growing memory).

**WT-3L separates them.** Two copies of her start from the same state and receive identical inputs, differing only in Θ.

## Design
- **Starting state.** A copy of her record at the most recent clean tick when the study runs. Record its revision, step and
  memory head digest. It includes her archive as her runtime uses it, and has Θ = 12 by then.
- **Arms.**
  - **T12:** the copy as it is.
  - **T24:** the same copy with `setWarpThreshold(24)`. Check that Θ is the only difference in state, as at the switch.
- **Inputs, identical in both arms.**
  - **Units.** 12 windows of recorded Outside encounters from her own history: the 12 most recent non-overlapping 6-hour windows
    before the starting tick, each replayed in its recorded order and cadence.
  - **Body.** Her body field runs live in both arms, as her cloud tick runs it. It is part of her, so it is not frozen.
- **Length.** Each unit runs 1,440 steps (one day of her time) from the starting state, once at T12 and once at T24. That makes
  24 runs in all, all from the same starting copy.
- **Determinism check, before the study data.** Run one unit at T12 twice. It must be identical step for step. If it is not,
  record the source of variation before going on.

## Measures (per run)
- **Primary:**
  - **M1:** Warp share, the fraction of steps in zone 3 or 6;
  - **M2:** mean Governor tension.
- **Secondary (descriptive):**
  - Warp visits per 1,000 steps; mean and longest Warp stay;
  - lines of flight, and where they land;
  - zones visited; Outside encounters admitted; flow hops.

## Analysis
- **The differences.** For each unit, d = T12 − T24, for M1 and for M2. Report the mean difference and each unit's value.
- **Tests.** Exact two-sided sign-flip over the 12 units, for M1 and for M2, each at α = 0.05.

## Decision (fixed now)
- **Θ = 12 holds** if both:
  - the mean Warp-share difference is at most **+2.0 percentage points**; and
  - the mean tension difference is at most **+0.03**.

  The live rise (+5.2 points, +0.10 tension) would then be drift, not Θ.
- **Θ = 12 raises Warp share or tension in her live conditions** if either mean difference is above its margin **and** its
  sign-flip p ≤ 0.05. Then:
  - she stays at Θ = 12 for now, because it cannot trap her;
  - a follow-up registers intermediate values (Θ = 16, 20) with this same design;
  - the operator chooses from those results.
- **Inconclusive** if a difference is above its margin but not significant. Report it as it stands, and extend to 24 units
  before deciding.

**Also reported:** whether T24's Warp share in these runs resembles her pre-switch 7.4%. If it does, the copies reproduce her
live behaviour; if not, the replay differs from her live conditions, and that limits the reading.

## Records
- **Before any run:** this registration, committed to her branch.
- **After:** the starting revision and digest, the inputs (window boundaries), all 24 runs' measures, and the decision. These go
  in her run history as WT-3L-<date> and in `claude/WT-3L_<date>.md`.
- **Nothing is written to her live record.** The backup and the live record are untouched.
