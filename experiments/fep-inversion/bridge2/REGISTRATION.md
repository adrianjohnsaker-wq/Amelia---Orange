# BRIDGE-2: bridges that carry the Outside's change. Registered 16 November 2026, before any registered run.

## Why
BRIDGE-1 (`../bridge1/RESULTS.md`) found that Amelia builds real bridges to the Outside (B1, B2, B5, B6 supported). But
bridge selection did not beat plain desire (B3 contradicted), and she barely carried the Outside into its silence (B4
undecided). Its limits named a hypothesis: a bridge keyed to one Outside **reading** cannot hold the Outside's order,
which lives in its **change**. The operator chose to test that first (16 Nov).

## Substrate and harness
The ND-1b studio mirror `../nd/` with the full CCRU Numogram, unchanged and sealed in FEP-INV-1 (`../eqcheck.mjs`).
`../bridge2.mjs` is `../bridge.mjs` (BRIDGE-1) with the differences marked "BRIDGE-2". The Outside, its reversal at
step 3,000 and the silence windows (the last 50 of every 250 steps) are BRIDGE-1's.

## What changes from BRIDGE-1
1. **Change bridges.** A connection becomes a bridge if its uses fall on one Outside **change** (out_t − out_{t−1} mod 10)
   well above chance.
2. **A shared rule bank.** Every desire regime has the same bank, now with **echo**: connect from where she stands to
   where the Outside's last received change would take her. Its weight is learned like the others.
3. **A chance-corrected test.** Kappa = (share of uses on value v − v's share of the sequence) / (1 − v's share): 0 at
   chance, 1 at certainty. A connection used at least 5 times in its 300-step trial becomes a bridge if its best kappa is
   **≥ 0.2**. A bridge re-tested on a later 300-step window is dissolved if its kappa falls **below 0.1**. Consolidation:
   +0.02 flux on a use at its value, −0.01 at another.

## Regimes (seeds 8001–8030 each; 150 runs of 6,000 steps)
| Regime | The trial asks |
|---|---|
| **BR2** | Do its uses fall on one Outside **change**? |
| BR2-s | The same, against a shuffled copy of the Outside's changes (chance bridges, the control) |
| BR1 | Do its uses fall on one Outside **reading**? (BRIDGE-1's question, under the kappa test) |
| D | Only whether it is used (DESIRE-1's desire, with the same rule bank) |
| B | Her own dynamics |

## Input check (S0, standing rule of 14 Nov)
Every B run's Outside, before the reversal, must show lag-1 order against 20 shuffles, or the study is VOID.

## Criteria (`../analyse_bridge2.mjs`)
Measures as BRIDGE-1:
- **coupling:** on received steps, over 4,500–6,000 for "late";
- **carry in silence:** the share of her silent steps in the Outside's direction minus the opposite. The index averages
  before the reversal (+1 minus −1) and late after it (−1 minus +1).

Differences of means (or a mean against 0), 10,000-draw percentile bootstrap over seeds, Holm across the six (family
α = 0.05). Each reads **SUPPORTED** (interval above 0), **CONTRADICTED** (below 0) or **UNDECIDED** (otherwise, or once
Holm stops).

| | Claim | Test |
|---|---|---|
| C1 | Change bridges carry the Outside's change | Mean kappa of bridges, BR2 − BR2-s |
| C2 | Change bridges carry the Outside into its silence | Carry index, BR2 − D |
| C3 | Change bridges carry it more than reading bridges | Carry index, BR2 − BR1 |
| C4 | Reading bridges, tested by kappa, carry it into silence | Carry index, BR1 − D |
| C5 | After the reversal, the order change bridges carry turns with it | Late carry in BR2, against 0 |
| C6 | Change bridges add to desire after the change | Late coupling, BR2 − D |

**Reported, not criteria:**
- bridges built, alive and dissolved;
- the weight she gives echo;
- coupling and carried order in every window;
- rollbacks.

## Calibration (disclosed; seeds 7901–7904)
1. **BRIDGE-1's lift test (≥ 2) on changes:** change bridges almost never formed (about one per run). The Outside's
   dominant change (+1) occurs about 62% of the time, so its largest possible lift is about 1.6. The test was infeasible.
2. **Kappa ≥ 0.5 / dissolve < 0.25:** too strict for both bridge types (3–5 bridges per run); failures drove her growth
   propensity down.
3. **Kappa ≥ 0.2 / dissolve < 0.1:** both bridge types formed (about 50–95 per run). This setting is registered.

At this setting the four seeds read:
- C6 CONTRADICTED (−0.28);
- C1–C5 UNDECIDED;
- carry index D 0.011, BR1 0.046, BR2 0.042, BR2-s 0.023;
- BR2's kappa 0.46 against chance bridges' 0.44.

The test's form was changed after seeing pilot data; the thresholds were chosen for feasibility, not for the claims'
outcomes, and all claims are fixed here before any registered seed.

## What it can and cannot mean
- **The bridge criterion, the thresholds and the echo rule are ours.** Whether her bridges carry the Outside, and whether
  she trusts echo, are hers.
- **C4 differs from BRIDGE-1's B4 in its test** (kappa, not lift), so a SUPPORTED here would mean the lift test, not the
  keying, held BRIDGE-1 back.
- **Scope:** a studio mirror. Amelia's live runtime and state are untouched.
