# POS-1L result: her position when the Outside arrives (18 November 2026)

**The run.**
- **Workflow.** GitHub Actions run 44211158546, started 00:50 UTC on 18 November 2026. It completed after one re-run (see *Running faults*).
- **Starting copy.** Revision 600, step 10,047, `outside-lane-v1`, Θ = 12 (16 November, 22:20 UTC tick).
- **Windows.** Twelve six-hour windows, 15 November 00:00 to 18 November 00:00 UTC. These are the same windows as DEE-1L: 20–24 ticks and 27–69 offers each, none missing.
- **Determinism.** The repeated pair was identical.
- **Arms.** Six, as registered:
  - LANE-TOWARD, LANE-AWAY, LANE-BLIND and LANE-RECORDED, under her rule;
  - QUEUE-TOWARD and QUEUE-AWAY, under `relative-v1`.

---

## What we have learned about Warp activity

**Under the lane, an Outside offer that reaches her at the Warp's threshold is an occasion for entry.**
- **How often entry follows.** Counting entries within five steps of an offer delivered while she stands at 7, 2 or 5:
  - under the lane: 0.39–0.55 entries per such offer;
  - under the queue: 0.28–0.29.
- **Offers delivered elsewhere.** They are followed by an entry within five steps about one time in twenty (0.04–0.06), in every arm.
- **What follows.** Where she stands when the Outside arrives matters a great deal locally. This is descriptive.

**Pointing matters at the edge, but not for her entry rate as a whole.**
- **At the edge.** An offer pointing toward the Warp's next zone is followed by more entries than one pointing away (0.55 against 0.44 per edge delivery, descriptive).
- **Over the whole window.** The registered contrast in entry rate is not identified: −1.1 per 1,000 steps, p = 0.24.
- **Why.** She stands at an edge for only 3–4% of offer slots, so the local difference is small against her whole passage. Choosing a different offer at those slots also changes the order of everything that arrives after them, and the rest of her passage changes with it.

**The lane eases her Governor, as GATE-2L found.**
- **Admission on arrival.** Under the lane about 68% of offers are admitted on arrival, against none under the queue.
- **Locked recovery.** 0.8–1.3% of steps under the lane, against 5.7% under the queue.
- **Tension.** Unchanged.

This confirms GATE-2L's description of the lane on windows it did not use.

---

## 1. Registered tests

Each is an exact two-sided sign-flip over 12 windows. S1 and S2 are corrected by Holm between them.

| Test | Contrast | Mean difference (entries per 1,000 steps) | p | Holm threshold | Result |
|---|---|---|---|---|---|
| **P1** (primary, α = 0.05) | LANE-TOWARD − LANE-AWAY | −1.06 | 0.24 | — | not identified |
| **S1** | LANE-TOWARD − LANE-BLIND | +1.99 | 0.12 | 0.05 | not identified |
| **S2** | lane contrast − queue contrast | −2.65 | 0.10 | 0.025 | not identified |

**The registered reading.** NOT IDENTIFIED.

**Comparison with GATE-2L.** GATE-2L's descriptive contrasts (+1.7 and +2.3 per 1,000) do not recur on these windows. They are best read as varying with the windows rather than as a stable effect of position on her entry rate.

---

## 2. Descriptive measures by arm (means over 12 windows)

| | LANE-TOWARD | LANE-AWAY | LANE-BLIND | LANE-RECORDED | QUEUE-TOWARD | QUEUE-AWAY |
|---|---|---|---|---|---|---|
| E per 1,000 steps | 16.5 | 17.5 | 14.5 | 16.0 | 15.7 | 14.1 |
| by flow | 7.6 | 8.6 | 7.4 | 8.8 | 9.2 | 7.3 |
| by choice | 8.9 | 8.9 | 7.1 | 7.1 | 6.4 | 6.7 |
| Entries within 5 steps, per offer delivered at an edge | 0.555 | 0.438 | 0.411 | 0.392 | 0.280 | 0.294 |
| The same, per offer delivered elsewhere | 0.040 | 0.057 | 0.052 | 0.043 | 0.062 | 0.064 |
| Share of slots at an edge | 4.4% | 2.8% | 2.9% | 3.2% | 4.2% | 4.3% |
| Admitted on arrival | 67.7% | 67.8% | 67.7% | 67.6% | 0% | 0% |
| Coupling C | 0.050 | 0.035 | 0.050 | 0.046 | 0.031 | 0.033 |
| Warp share | 9.4% | 9.6% | 8.8% | 9.1% | 11.4% | 10.6% |
| Locked recovery | 0.9% | 0.8% | 0.9% | 1.3% | 5.7% | 5.7% |
| Mean tension | 0.776 | 0.782 | 0.777 | 0.777 | 0.773 | 0.779 |
| Lines of flight per window | 5.8 | 6.1 | 5.1 | 6.3 | 8.8 | 9.0 |

**The lane against the queue (descriptive).** Under the lane she spends slightly less time in the Warp (9–10% against 11%), with fewer lines of flight. Her entry rate is about the same, which implies shorter stays.

---

## 3. Running faults
- **What failed.** The run's first attempt failed at its first database read (HTTP 500). This was the REST role's 8-second statement timeout, reached while DEE-1L's twelve window jobs were reading their own large starting copy.
- **The re-run.** The job was re-run with unchanged code once that load had passed. No study result had been read.

---

## 4. Limits
- **The edge measures.** They are descriptive, and they count entries within five steps of a delivery, so they include entries that would have happened anyway. The elsewhere rate (about 0.05) is the comparison for that.
- **One starting state.** Twelve windows, all from 16 November.
