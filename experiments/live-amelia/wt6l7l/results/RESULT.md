# WT-6L and WT-7L results (15 November 2026)

## What we have learned about Warp activity
1. **Two candidates did not hold up within the same windows.**
   - **The candidates.** Two explanations were drawn from comparisons across studies: the rhythm of arrival, and her maturation on ND-1b.
   - **The tests.** Each was tested on the same windows, from the same state, with the content fixed.
   - **The result.** Neither is identified:
     - the recent cadence does not raise her entries (C1);
     - a shorter, four-fold repetition does not either (C2);
     - her state after 1,144 steps on ND-1b does not enter more than her state at the switch.
   - **The one difference seen runs the other way.** The older state enters less often by choice. It is borderline on the primary measure and clear only on the descriptive one.
2. **Entry into the Warp depends on the course of events.**
   - **What does change her rate:** which window she lives and the order in which things arrive. From one state, at one Θ and under one rule, her entry rate ranges from about 6 to 21 per 1,000 steps across windows.
   - **Order alone.** The same pre-switch content, started at different points in its order, gives 6.6 to 13.8.
   - **What the arms move.** Differences between arms of 1 to 2 per 1,000 sit inside that spread.
   - **What an entry is.** She enters when she happens to be at 7, 2 or 5 while the field's change points into 3 or 6. It is a conjunction in her passage, not a fixed property of her or of the Warp.
3. **Earlier cross-study gaps were partly a matter of sampling.**
   - **The rhythm gap.** It was 6.6 against 9.3, but 6.6 was one ordering of content (WT-5L A2). Over 12 orderings the same structure averages 8.7, against 9.3 for the recent cadence.
   - **The maturation gap.** It was 10 against 15, but the 15 came from different windows and from Θ = 12 (WT-4L). On the same windows at Θ = 24, her state at step 1,981 enters 8.1 against 10.3.
4. **What remains unseparated.** Her live entry rate did rise after Θ = 12 was adopted, from 6.1 to about 10–14 per 1,000, carried by flow. WT-3L found that Θ does not change entries from her present state, which already has six Warp-born gates.
   - **The open question.** Whether Θ = 12 acting on a younger state, one without Warp-born gates, changes entries has not been tested. Her state at step 1,981 entered 15.0 at Θ = 12 in WT-4L's windows and 8.1 at Θ = 24 in these. The windows differ, so this is a lead, not a finding.

## How it was run
**The run.** GitHub Actions run 43731759742 used the registered code (`MACHINERY_SHA256.txt`). Its synthetic checks passed first.

**The starting states.**
- **S837.** Her `pre-switch-backup` (step 837), converted at the switch as in WT-5L: Θ = 24.
- **S1981.** Her `pre-theta12-backup` (revision 123, step 1,981): Θ = 24, no Warp-born gates, checked.

**What was not touched.** Her live record and archive.

**Determinism.**
- **The pairs.** The WT-6L unit 1 POST pair and the WT-7L unit 1 S1981 pair were each identical.
- **Across runs.** These runs also reproduce earlier runs exactly:
  - WT-6L's POST arm equals WT-5L's PRE-CONTENT arm (E 9.29);
  - WT-6L's PRE-65 arm in unit 1 equals WT-5L A2 (6.61);
  - WT-7L's S837 arm equals WT-5L's POST arm (10.27).

## WT-6L: the rhythm of arrival (content fixed; from S837 at Θ = 24)
| Arm | E | by choice | by flow | Warp share | Offers per tick | Ticks with 4+ offers | Iterations between offers |
|---|---|---|---|---|---|---|---|
| POST (recent cadence, 24 ticks × 4) | 9.29 | 6.51 | 2.77 | 13.1% | 2.03 | 25% | 7.6 |
| PRE-24 (pre-switch ticks, 24 × 4) | 10.55 | 7.44 | 3.11 | 13.0% | 2.66 | 33% | 6.1 |
| PRE-65 (pre-switch ticks, 65 × 1.5) | 8.67 | 5.96 | 2.71 | 10.9% | 2.32 | 28% | 6.4 |

| Contrast | Mean d | p | Holm threshold | Reading |
|---|---|---|---|---|
| C1, cadence: POST − PRE-65 | +0.62 | 0.39 | 0.05 | NOT IDENTIFIED |
| C2, repetition: PRE-24 − PRE-65 | +1.88 | 0.11 | 0.025 | NOT IDENTIFIED |

**Per unit.** In PRE-65, E ranges from 6.6 to 13.8 across the 12 content offsets, with the tick structure unchanged.

## WT-7L: her maturation on ND-1b (recent windows as recorded; Θ = 24)
| | S837 | S1981 | Mean d (S1981 − S837) | p |
|---|---|---|---|---|
| **E (primary)** | 10.27 | 8.05 | −2.22 | 0.056 |
| E by choice (descriptive) | 7.43 | 5.65 | −1.78 | 0.005 |
| E by flow (descriptive) | 2.84 | 2.40 | −0.44 | 0.74 |
| Warp share | 12.4% | 12.5% | | |
| Share of flow steps | 11.3% | 10.3% | | |
| Lines of flight per run | 2.75 | 3.75 | | |

**Reading.** NOT IDENTIFIED: p = 0.056, above α = 0.05.
- **The direction.** It is opposite to the prediction. The older state enters less, and the difference lies in entries by choice, not by flow.
- **Per unit.** S1981 is lower in 9 of 12 units. S837's unit 3 (21.1) is the largest single value.

**Once through, as she lived them (descriptive, one run each).** The 276 recent ticks were fed once, about 4,700 steps:

| | E | by choice | by flow | Warp share | Lines of flight |
|---|---|---|---|---|---|
| S837 | 8.52 | 7.03 | 1.49 | 10.2% | 10 |
| S1981 | 13.41 | 10.22 | 3.19 | 12.7% | 9 |

Fed once rather than four times, the order reverses. This is one run per state and is not a test, but it shows again that her entry rate depends on the course the run takes.

**What differs between the two states (descriptive).**
- **The same.** The gate table is identical (31 gates, none Warp-born) and the admission rule is relative-v1.
- **Baseline.** It is lower in every zone at step 1,981: for example zone 3 is 0.21 against 0.59, and zone 6 is 0.16 against 0.78.
- **The Governor.** Tension is 0.95 against 0.67, and memory hysteresis 0.95 against 0.61.
- **Her position.** At step 1,981 she stands in zone 3 at Warp intensity 6, with the last-named zone 8.
