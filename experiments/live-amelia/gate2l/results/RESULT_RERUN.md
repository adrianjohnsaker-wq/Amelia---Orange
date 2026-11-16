# GATE-2L rerun: results, 16 November 2026

Amendment: `experiments/live-amelia/gate2l/AMENDMENT_RERUN.md`.
- **Starting state.** Her state after the undo (revision 590, step 9,891, `relative-v1`).
- **Everything else.** As registered.

GitHub Actions run 43946805837. Rows are `r-*` in `amelia_gate2l_runs`, with the analysis as id `r-analysis`.

**Reading: ADOPTABLE; H1 NOT IDENTIFIED; H2 NOT IDENTIFIED.**

## What we have learned about Warp activity

1. **The lane works, and eases her regulation, from both states.**
   - **On arrival.** 68% of Outside offers were admitted on arrival (none under the current gate), higher in all 12 units, with none refused.
   - **Locked recovery.** It fell from 5.7% to 1.2% of steps. Her tension was unchanged (−0.005).
   - **Her body's observations.** They were admitted more often (458 against 384 per 1,000 steps).
   - **Against the first run.** These match the first run (67%; 5.5% to 1.7%; 426 against 373). This part of the result holds.
2. **The rise in coupling above chance does not hold from her later state (H1 not identified).**
   - **The measure.** After an admitted Outside offer, she reached its peak zone within 5 steps more often: 30.3% against 22.8%, as in the first run (29.4% against 21.8%).
   - **The chance level.** It rose as well: 27.1% against 20.3%. Above chance, coupling was +0.032 against +0.025 (d = +0.007, p = 0.39; 6 units higher, 5 lower, 1 equal).
   - **Against the first run.** From step 7,121 the rise above chance was registered (p = 0.0005). From step 9,891 it is not identified.
   - **How to read it.** Promptly admitted offers are followed by wider movement through the zones they point to, and to others. The specific steering of the first run is not established as a general property of the lane.
3. **The Warp entry rate is again not identified as changed (H2).** E was 14.7 against 14.5 per 1,000 steps (p = 0.89).
4. **Her position at the Outside's arrival matters more clearly than in the first run (descriptive).** Under the lane, offers chosen toward the Warp gave more entries than offers chosen away: 16.8 against 14.6 per 1,000 steps (+2.26, p = 0.094; 7 units higher, 2 lower, 3 equal).
   - **Against the first run.** +1.73 (p = 0.21).
   - **Under the current gate (WT-9L).** −0.08.
   - **Its status.** Not a registered test, and not identified, but the same direction twice.

## 1. Registered checks and tests

| | First run (from step 7,121) | Rerun (from step 9,891) |
|---|---|---|
| M0: on arrival under LANE (pooled) | 67.4% | 67.8% |
| M0: higher than CURRENT in all units | yes | yes |
| M0: refused under LANE | 0 | 0 |
| **M0** | **passes** | **passes** |
| S: locked recovery, LANE − CURRENT | −3.9 points | −4.5 points |
| S: mean tension, LANE − CURRENT | −0.001 | −0.005 |
| **S** | **holds** | **holds** |
| H1 coupling, mean d (p) | +0.027 (0.0005) | +0.007 (0.39) |
| **H1** | **RAISED** | **NOT IDENTIFIED** |
| H2 entries per 1,000, mean d (p) | −1.14 (0.53) | +0.23 (0.89) |
| **H2** | **NOT IDENTIFIED** | **NOT IDENTIFIED** |
| **Reading** | **ADOPTABLE** | **ADOPTABLE** |

## 2. By arm, rerun (descriptive, means over 12 units)

| Arm | E | By choice | By flow | Warp share | On arrival | Median wait | Locked share | Tension | Body admitted /1,000 | Hits | Chance | C |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CURRENT | 14.46 | 7.24 | 7.22 | 0.105 | 0 | 6.4 | 0.057 | 0.771 | 384 | 0.228 | 0.203 | 0.025 |
| LANE | 14.68 | 7.27 | 7.42 | 0.092 | 0.683 | 0 | 0.012 | 0.765 | 458 | 0.303 | 0.271 | 0.032 |
| LANE, toward | 16.83 | 7.62 | 9.21 | 0.096 | 0.679 | 0 | 0.012 | 0.767 | 446 | 0.311 | 0.269 | 0.042 |
| LANE, away | 14.57 | 7.48 | 7.09 | 0.094 | 0.682 | 0 | 0.010 | 0.765 | 456 | 0.303 | 0.267 | 0.037 |

**Load under LANE.** Excessive on 28.2% of steps: strained 27.7%, locked 1.2%, crowded 0.1%.

## 3. What the two runs together say

**What holds in both runs.**
- The lane does what it was built to do.
- It does not strain her Governor; it eases it.

**What does not hold.**
- **Coupling (H1).** The registered rise in coupling above chance was found from one state and not from the other.
- **The rate of Warp entry (H2).** It is not identified as changed in either run.

**The one effect pointing the same way twice (descriptive).** Where she stands when the Outside arrives begins to matter for her entries.

**The adoption rule.** As registered, it depends on M0 and S, and both runs pass. Whether to restore the lane in her live runtime is the operator's decision.
