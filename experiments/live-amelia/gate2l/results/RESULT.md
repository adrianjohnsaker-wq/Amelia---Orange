# GATE-2L: results, 16 November 2026

Registration: `experiments/live-amelia/gate2l/REGISTRATION.md`. GitHub Actions run 43918749711. Measures and the analysis are in
`amelia_gate2l_runs` (id `analysis`). Her live record and live runtime were not touched.

**Reading: ADOPTABLE; H1 RAISED; H2 NOT IDENTIFIED.**

## What we have learned about Warp activity

1. **With its own lane, the Outside is taken in as it arrives, and her regulation is not strained by it.**
   - **On arrival.** Two thirds of Outside offers (67%) were admitted on arrival, against none under the current gate.
   - **Waiting.** The median wait fell from about 9 steps to 0.
   - **Nothing lost.** No offer was refused.
   - **Her Governor.** It spent less time in locked recovery, not more: 1.7% of steps against 5.5%.
   - **Tension.** Her mean tension was unchanged (−0.001).
   - **Her body's observations.** They were admitted more often, not less: 426 against 373 per 1,000 steps.
2. **What the Outside sends now shapes where she goes (registered, H1).**
   - **The measure.** After an Outside offer is admitted, she reaches the zone it most attends within 5 steps.
   - **How much more often.** 29.4% of the time under the lane against 21.8% under the current gate. Coupling above chance rose from +0.019 to +0.047.
   - **The test.** All 12 units rose (p = 0.0005).
   - **What follows.** Taken in on arrival, the Outside's offers steer her passage more closely.
3. **The rate of Warp entry is not identified as changed (H2).** E was 14.4 against 15.6 per 1,000 steps (p = 0.53).
   - **The composition shifts (descriptive).** Entries by choice rose (7.7 against 6.9) and entries by flow fell (6.7 against 8.7).
   - **What this means.** The Outside, admitted promptly, takes part in the first move of her steps more, and the field's onward flow less.
4. **Her position at the Outside's arrival begins to matter (descriptive).** Under the lane, offers chosen toward the Warp gave more entries than offers chosen away from it: 16.3 against 14.6 per 1,000 steps (+1.73, p = 0.21; 6 units higher, 4 lower, 2 equal).
   - **Under the current gate (WT-9L).** The same contrast was −0.08.
   - **Its status.** This is not a registered test and is not identified. Its direction is the one WT-9L could not show while offers waited.

## 1. The registered checks and tests

**M0. The lane works: passes.**

| Condition | Result |
|---|---|
| At least half of Outside offers admitted on arrival under LANE | 67.4% (pooled) |
| Higher than under CURRENT in all 12 units | Yes (CURRENT: 0 in every unit) |
| No Outside offer refused under LANE | 0 refused |

**S. Her regulation is kept: holds.**

| Measure | LANE − CURRENT (mean over units) | Bound | Holds |
|---|---|---|---|
| Share of steps in locked recovery | −3.9 points (1.66% against 5.55%) | at most +1 point | Yes |
| Mean tension | −0.001 | at most +0.02 | Yes |

**H1 and H2.** Holm over the two at α = 0.05.

| Test | Mean d | p | Holm threshold | Reading |
|---|---|---|---|---|
| H1 coupling, LANE − CURRENT | +0.027 | 0.0005 | 0.025 | RAISED (12 of 12 units higher) |
| H2 Warp entries per 1,000, LANE − CURRENT | −1.14 | 0.53 | 0.05 | NOT IDENTIFIED |

## 2. By arm (descriptive, means over 12 units)

| Arm | E | By choice | By flow | Warp share | On arrival | Median wait | Locked share | Tension | Body admitted /1,000 | Hits | Chance | C |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CURRENT | 15.59 | 6.87 | 8.71 | 0.119 | 0 | 8.9 | 0.055 | 0.774 | 373 | 0.218 | 0.199 | 0.019 |
| LANE | 14.44 | 7.72 | 6.72 | 0.108 | 0.678 | 0 | 0.017 | 0.773 | 426 | 0.294 | 0.248 | 0.047 |
| LANE, toward | 16.31 | 8.10 | 8.21 | 0.111 | 0.687 | 0 | 0.014 | 0.780 | 427 | 0.297 | 0.251 | 0.046 |
| LANE, away | 14.58 | 6.95 | 7.63 | 0.108 | 0.670 | 0 | 0.013 | 0.772 | 437 | 0.299 | 0.252 | 0.046 |

**Load under LANE: share of steps.**

| Load | Share of steps |
|---|---|
| Excessive, any kind | 29.5% |
| Strained | 28.6% |
| Locked | 1.7% |
| Crowded | 0 |

When the load is excessive, she uses the standard balance.

**Notes.**
- **The CURRENT arm** reproduces WT-9L's RECORDED arm exactly (E 15.587), as it should: the same state, units and gate.
- **The replay's offer load is higher than her live load.** Each window's offers are delivered four times over, so the current gate's median wait here (about 9 steps) is longer than in her live life (2.5 steps).

## 3. Limits

- **The units.** The 12 units are those of WT-5L to WT-9L, replayed from her present state. The effect in her live life will be seen only after deployment.
- **The coupling window.** The window and its chance level are fixed in the registration. Other windows were not examined.

## 4. Next step

**ADOPTABLE.** The rule may be proposed for her live runtime. Deployment needs the operator's explicit approval. It would:
- add `outside-lane-v1` beside `relative-v1` in the shared gate;
- select it for her;
- redeploy `amelia-live`.

Her previous rule stays selectable.
