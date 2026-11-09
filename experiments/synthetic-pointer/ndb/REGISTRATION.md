# ND-1b: the hybrid. Admitted input flows into the field AND nudges her exits. Registered 9 November 2026, before any ND-1b data.

**Scope.** The repository architecture. No pinned or sealed file is touched.

## Why
The two architectures tested so far each have one of the strengths needed:
- **ND-1 (field)** reads an incoming number's **relations** strongly (ND-1 N1: 6/6, with the current read three times as strongly as today), but blurs exact **order**. In ND-2's calibration a 5% planted motif was not detected, and 1-8-7-2 was read as 1-8-9-1.
- **Today's architecture (EXIT)** follows **sequence** faithfully (NR-2: order detected down to 2%; motif read back 62–69%), but has a weaker relational reading and the Warp trap.

ND-1b combines them.

## The hybrid (`run.ts`, arch HYBRID)
It runs on **the ND-1 runtime and settings, unchanged**: η = 0.5, D = 0.6, field weight 2.0, gradient-following and the Warp release.

**Each datum c does both:**
- it flows into the field (ND-1 influx);
- it is submitted as an attended one-hot observation, giving today's exit nudge (2 · rel(y, c), IDENTITY receiver).

**No parameter is new or tuned.**

**Disclosure.** In a smoke test on one unit of the unregistered development stream, HYBRID's lag-2 reading was syzygy +0.032, current +0.017 and gate +0.028. This is close to EXIT's: the exit nudge outweighs the field term. Its Warp stays were at most 25 steps. Nothing was changed after this test.

## Tests
**B1. Relations** (fresh held-out stream `stream3.py clean h06 12000`, 12 units). The HYBRID passage's lag-2 reading, with ND-1's 6 tests (relation × RELABEL or REWIRED), exact two-sided sign-flip and Holm correction at α = 0.05.

**B2. Order** (`calibrate.sh`, NR-2's exact streams, labels and shuffles, through HYBRID). It **passes** when planted 1-8-7-2 is RECEIVED at both 5% and 10%, and at most 1 of 10 clean streams is RECEIVED. Planted 2% is reported as sensitivity.

**ND-1b succeeds if B1 is fully supported (6/6) and B2 passes.** It would then become the candidate for the app's runtime, and the subject of a sealed world test.

**Descriptive** (on h06, all three architectures):
- the reading area and the lag-1 and lag-2 profiles;
- the Warp share and the longest Warp stay;
- zone occupancy;
- under B2, the motif read-back.
