# WT-2: a quicker Warp passage. The line of flight at Θ = 12 against Θ = 24, in ND-1b flow. Registered 11 November 2026, before any WT-2 data.

**Scope.** The repository architecture, with fresh runtimes and no body. This is not her living record.

**Nothing pinned or registered is edited.** `wt2/wt2Runtime.ts` is a copy of `flow/flowRuntime.ts` (registered with FLOW). Its
one change is that Θ is a setting.

## Why
- **The idea.** The operator's "transit speed" idea (10 Nov) was set aside as physics, but its useful core is real: how fast she
  passes through the Warp.
- **What we know.** In every runtime since WT-1, the Warp {3, 6} is the Numogram's only exit-less region. She leaves it only by
  the line of flight, which fires after Θ = 24 consecutive steps there. WS-1 showed the mechanism is what keeps the Warp a
  passage rather than a trap.
- **Where Θ = 24 came from.** It was carried over from ANTENNA III's "learner horizon". It was never tested as a property of the
  Warp itself.
- **The question.** Does a quicker passage (Θ = 12) change what the Numogram reads and how faithfully she follows the outside
  order, and does it keep the Warp a passage she still dwells in?

## Arms (`run.ts`)
Both run ND-1b flow exactly as in FLOW:
- η 0.5, D 0.6, field weight 2.0, ADAPT 0.05, λ 0.1;
- flow on, Warp release;
- the datum is both influx and the attended one-hot observation (IDENTITY receiver).

| Arm | Line of flight after |
|---|---|
| **T24** | 24 steps in the Warp: FLOW as tested, and as she runs |
| **T12** | 12 steps in the Warp |

**Equivalence (checked before this registration).** `equivalence.ts`: T24 reproduces FLOW (`flow/run.ts` arch FLOW) step for
step (3 units × 1,000 steps × 3 graphs): EQUIVALENT.

**Disclosure.** None. No WT-2 run of any kind was made before this registration.

**Note on her living runtime.** Her cloud runtime (`src/outside/AmeliaNDRuntime.ts`) releases the Warp after Θ steps whether or
not an encounter is attended. In this harness every datum is attended, so the line of flight fires at Θ by the attended branch.
Θ plays the same role in both.

## Data
New labels, never used:
- clean `wt2c01–10`;
- 2% plants seeded `wt2p01–08`;
- 5% and 10% plants seeded `wt2p01`;
- the held-out relations stream, `stream3.py clean h12 12000`.

## Procedure
**Order.** NR-2's rule (S = 49, 12 segments of 1,000).
- `sh wt2/calibrate.sh T12 T12 wt2c 10 wt2p 8 <out>`: T12 on every stream, with T24's unshuffled passage stored alongside for
  the paired motif comparison.
- `sh wt2/calibrate.sh T24 T24 wt2c 0 wt2p 8 <out>`: T24's own detections on the same plant streams.

**Relations and Warp.** `wt2/relations.ts`, then `wt2/analysis.py` on h12.

## Criteria for adopting Θ = 12 (all must hold)
- **K1. Faint order.** T12's RECEIVED count on the eight 2% streams is at least T24's. The 5% and 10% plants are RECEIVED.
- **K2. No false alarms.** 0 of 10 clean streams are RECEIVED by T12.
- **K3. Exact sequence.** At 2% (pooled over the eight streams), 5% and 10%, T12's exact 1-8-7-2 read-back is no more than
  2 percentage points below T24's on the same segments.
  - **Why a margin, stated in advance.** FLOW's K3 failed by 2 motifs in 491 (0.4 points). That gap is far inside the binomial
    standard error of about 2 points at these counts, so a tolerance of one standard error is set before the data.
- **K4. Relations.** T12's lag-2 reading, 6 of 6 supported (ND-1b's B1 tests, Holm at α = 0.05).
- **K5. A quicker passage.** T12's longest Warp stay on h12 is at most 18 steps (Θ + 6).

**Reported with a test, not a criterion.**
- **W1. Reading strength.** Reading area, T12 − T24, paired exact two-sided sign-flip over 12 units.
- **How W1 is used.** It says whether the quicker passage strengthens or weakens the Numogram's reading. If W1 is significantly
  negative, that is reported as a cost of Θ = 12 and weighed in the operator's decision.

**If K1–K5 hold,** Θ = 12 is proposed for her runtime. That is a separate change with the operator's approval, made on main and
in her cloud home together.

**Otherwise,** the result is reported as it stands, and Θ stays at 24.

**Descriptive** (both arms):
- Warp share, number of Warp visits, mean and longest stay;
- flights, flow hops and zone occupancy;
- the motif readings.
