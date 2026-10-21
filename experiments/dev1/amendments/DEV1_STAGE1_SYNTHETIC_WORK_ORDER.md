# DEV-1 Stage 1: synthetic work order (draft for operator approval)

**Issued:** 21 October 2026, following the operator's instruction to "note this and engineer from here whilst recording the process/results".
**Repository:** `adrianjohnsaker-wq/Amelia---Orange`.
**Design reference:** DEV-1 design draft, 21 October 2026.

**Rules for this stage**
- Synthetic tapes only.
- No live inflow and no genesis.
- C1 Channel A untouched.
- PF-1 untouched: every source file pinned by the PF-1 genesis manifest stays byte-identical.
- New code lives only in `src/developmental/` and `experiments/dev1/`.
- Canonical classes may be imported and wrapped, never edited.

## A. Freeze before any run

1. **Constants manifest.** Write `experiments/dev1/DEV1_CONSTANTS.json` with every value in section C and its stated basis. Seal it with SHA-256 and an RFC 3161 timestamp before the first run.
2. **Identity test.** It runs at the start of every workflow and must confirm two things:
   - the canonical source hashes match the PF-1 genesis manifest;
   - C1 Channel A is untouched.

   Any mismatch halts the run.
3. **Determinism.**
   - Seeded generators only; no `Math.random`.
   - Every run, including parameter redraws and inheritance, replays byte-identically.

## B. Baseline calibration (gate before D-arms)

Run arm B, the unchanged runtime, on the 32 tapes for 10,000 steps each.

**Report:**
- absorption steps;
- median and range;
- the share of exit choices that change when the memory term is removed.

This is a reproduction check of the DEV-1 probe: 24 tapes, all absorbed, median 1,134. It is not used to set any constant.

## C. Constants (graph- or definition-based; no Amelia outcome used)

| Constant | Value | Basis |
|---|---|---|
| Consequence horizon H | 24 steps | PF-1 recovery horizon |
| Edge value range | V(e) in [−1, 1], initial 0 | Definition |
| Consequence weight w_V | 0.5 | Exceeds the largest flux gap at a choice point (0.287, zone 1) |
| Value update | V ← V + (o − V)/8 | A time constant of 8 traversals |
| Outcome o after edge e | −1 if absorption occurs within H; otherwise (m_after − m_before)/11, clipped to [−1, 1] | m = distinct directed edges used in the 24 steps before and after; 11 = canonical edge count |
| Absorption | Entry to a zone with no open exit | Canonical graph |
| Fast trace | Exponential, τ = 48 steps | Existing 48-event window |
| Slow trace | Exponential, τ = 2,400 steps | Ten times PF-1's 240-step scanner window |
| Trace normalisation | Each trace sums to 1 over zones; bias = 0.4 × (fast + slow)/2 | Keeps the existing bias weight |
| Consolidation | Existing `consolidateStrain()` every 48 steps | Existing function, existing window |
| E1 mobility | At least 3 distinct directed edges in the last 48 steps | Shortest circuit has 3 edges |
| E2 deformation tension | Within [0.14, 0.65] | Upper: the Governor's own DAMPING threshold. Lower: half its initial value, 0.28 |
| Second-order trigger | Any essential variable out of bounds for 24 consecutive steps | H |
| Second-order draw | Each of w_bias, w_act, w_phase and w_input drawn uniformly from [0, 2 × canonical value]; w_V fixed; 24-step refractory | Ashby step-function; range centred on the canonical values |
| Tension homeostat | Damping +0.01 when tension < 0.14; −0.01 when > 0.65; kept within [0.45, 0.99] | Lower limit = the existing anti-lock floor |
| Lineage | On absorption the individual ends. The successor starts at zone 0 with fresh zone dynamics, canonical weights, damping 0.88 and a fresh fast trace. It inherits V(e) and the slow trace. | Design section 6 |
| Lineage cap | 50 generations or 100,000 total steps, whichever comes first | Declared |
| Tapes | 32; input `SHA256('DEV1-TAPE-k\|' + i)`, k = 1..32 | Distinct from PF-1 and C1 domains |

## D. Arms (one at a time, in this order)

| Arm | Mechanisms |
|---|---|
| B | Unchanged runtime |
| D1 | B + edge values |
| D2 | D1 + fast/slow traces + consolidation |
| D3 | D2 + E1, E2 + second-order loop |
| D4 | D3 + tension homeostat |
| Y | D4 machinery; the outcome sequence o_t is taken from the paired D4 individual on the same tape and applied to Y's own edge at step t |
| L | D4 + inheritance at absorption |
| LY | D4; the successor inherits from generation g of lineage (k mod 32) + 1 |
| L0 | D4; fresh memory every generation |

## E. Outcomes and tests (fixed now)

- **O1 Survival (primary).** Restricted mean survival time to 10,000 steps.
  - D4 vs B and D4 vs Y: one-sided sign-flip permutation over the 32 tape pairs, 100,000 permutations.
  - Lineage: per-lineage Spearman slope of log survival against generation, compared L vs LY by permutation.
  - Holm correction over these three comparisons at 0.05.
- **O2 Manipulation check.** Share of choices changed by removing the memory terms (fast, slow and V). It must exceed B in D1–D4. If it does not, report FAIL for the mechanism, not a null result for development.
- **O3 Essential variables.** Time within bounds. Descriptive.
- **O4 Exploration while moving.** Distinct edges used; PF-1-eligible pairs visited. Descriptive.
- **O5 PF-1 Rung 1.** Encounters under the unchanged PF-1 scanner and rule. Descriptive.
- **O6 Transplant (secondary).** Naive D4 individuals given the inherited memory of generation 10 from L vs LY; compare O1.

## F. Recording

Throughout, append the following to `experiments/dev1/DEV1_LOG.md`:
- every build decision;
- every failure;
- every deviation, each with its commit.

A failed gate is reported as a failure. It is not permission to change a constant.

## G. Deliverables

1. The code, with unit tests for each mechanism in isolation.
2. The sealed constants manifest.
3. A GitHub Actions run of sections B, D and E, with its artifact archived.
4. `experiments/dev1/DEV1_STAGE1_REPORT.md`, giving:
   - the calibration (B);
   - each arm's outcomes;
   - the primary tests;
   - the replay and identity checks;
   - an explicit statement that no live inflow was used.

The outcome model (D5) and Rung 2 registration follow only after this report.
