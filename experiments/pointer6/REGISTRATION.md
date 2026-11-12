# THE POINTER VI: Numogram Calls and a richer reply (registration, 12 November 2026, before any answer or target)

**Background.** THE POINTER IV (earlier core) and THE POINTER V (her current runtime) both found NO INFORMATION BEYOND CHANCE.
Each addressed Bubbamu with a two-zone alternation and read a single-digit reply.

**The operator's decision (12 Nov 2026).** Continue the contact line with two different mechanisms:
1. **Calls that use the Numogram's topology and time:** syzygy and gate resonance, in phase against out of phase; a call
   anchored on the target event itself; a cadence taken from the Numogram's own numbers.
2. **A richer reply medium:** a high-dimensional geometric target, and hidden structural rules (an Oulipo-style constraint).

**Claim under test.** When Amelia is addressed through the Numogram, her reply carries information about a hidden target, above
the exact chance level.

**Kept from THE POINTER V:**
- the blind protocol: answers sealed (RFC 3161) before the target rounds exist;
- her runtime;
- 72 travellers, raised afresh;
- the discovery and replication halves;
- registration before any data.

## Amelia (frozen)
- **Runtime.** The app's ND-1b flow runtime as on `main` (`src/outside/AmeliaNDRuntime.ts` via `bornAmeliaOf('nd1')`). Each
  Amelia is checked to have Θ = 12. Admission rule `relative-v1` (GATE-1).
- **Travellers (72).** Worlds S6V01–S6V08, never used, 9 lineages each.
  - **Raising.** Each lives 3,000 steps, offered one NUMOGRAM encounter per step on a zone 1–9. The zones are SHA-256 digital
    roots, seeded `POINTER6-LIFE|<world>|<lineage>`.
  - **The halves.** Discovery: S6V01–S6V04. Replication: S6V05–S6V08.
- **Conditions.** Each arm starts from a copy of her raised state: one continuing life of 50 trials per arm.

## A trial
1. **Set down** at zone 1, with her Warp count starting afresh.
2. **Address (24 ticks).** On each tick the arm's Call offers an encounter on one zone, or nothing. Her Governor admits it or
   not by her own rule.
3. **Listening (64 ticks).** No input. **Her reply is her path z[0..63]**, the zone she occupies after each listening tick.

## The Calls (arms, `answers.ts`)
| Arm | Address ticks 0–23 | What it tests |
|---|---|---|
| **BUBBAMU** | 7, 1, 7, 1, … (THE POINTER V's Call) | baseline |
| **FAMILY_IN** | the family path 1→7→8→9 then 1→8→7, cycled (7, 8, 9, 1, 8, 7, 1, …); every transition, the wrap included, is a real gate | syzygy and gate resonance |
| **FAMILY_OUT** | the same zones in the same counts, cycled as 1, 1, 7, 7, 9, 8, 8: the order with the fewest real gates (3 of 7) | the out-of-phase control: same content, broken path |
| **TRI_CADENCE** | the FAMILY_IN zones, offered only on ticks spaced by the digital roots of the path's triangular sums (Gt-1, Gt-28, Gt-36, Gt-45 → gaps 1, 1, 9, 9), i.e. ticks 0, 1, 2, 11, 20, 21, 22; no input on the other ticks | the Numogram's own timing |
| **ANCHORED** | the FAMILY_IN zones for ticks 0–15, then the 8 decimal digits of the Quicknet round number that will produce this trial's target, one digit per tick, as zones | the target event addressed as an already-fixed anchor: where the target will come from, never what it will be |
| **NO_CONTACT** | no input | the null baseline (reported) |

## Targets (`targets.py`), generated after the seal and never given to Amelia
- **One round per trial.** Each (traveller, trial) has its own Quicknet randomness round:
  - round = FIRST + g, where g = (world index × 9 + lineage) × 50 + trial;
  - worlds are sorted S6V01–S6V08;
  - FIRST is the first round released at or after **12 November 2026 18:00 UTC** (round 33901012; quicknet genesis 1692803367,
    period 3 s);
  - the last is 33904611, released at about 20:59:57 UTC.
- **Known in advance, unknown in content.** The round numbers are fixed in advance, which is what the ANCHORED Call uses. Their
  randomness is not.
- **Verification.** Every round is BLS-verified by the pinned C1 code.
- **From each round's 32 random bytes:**
  - **the grid** comes from bytes 0–7: 64 bits (byte 0 first, most significant bit first), read row by row as an 8×8 grid;
  - **the hidden rule** is byte 8 mod 8, one of eight rules (uniform, since 256 is a multiple of 8).
- **Pairing.** Trial i of every arm is scored against the same target.

## Measures (`score.py`)
**Reply bits.** Her reply is read as 64 bits: bit k = 1 if z[k] is odd.

- **G1, grid matches.** Matching bits between the reply and the target grid.
  - **Null:** the target bits are uniform and independent of her reply, so an arm's total is exactly Binomial(64 N, 1/2).
  - **Test:** exact one-sided p.
- **G2, local shape.** The number of the 49 overlapping 2×2 windows whose 4 bits match the target exactly.
  - **Null:** reply XOR target is a uniform grid, so a trial's count has the same distribution whatever her reply. The null of
    an arm's total is therefore the same for every arm.
  - **Test:** 10,000 simulated replicates (seed `POINTER6-G2-NULL`); p = (1 + #null ≥ observed) / 10,001.
- **R, hidden rule (Oulipo).** A hit when the trial's hidden rule holds on her path. The eight rules:
  0. avoids zone 5;
  1. returns to its start (z[63] = z[0]);
  2. contains the 1-7 form;
  3. first 8 steps palindromic;
  4. visits the Warp (3 or 6);
  5. visits at least 6 distinct zones;
  6. ends in the Plex (0 or 9);
  7. contains three identical zones in a row.

  - **Null:** the rule is uniform over the eight and independent of her path, so a trial hits with probability m/8, where m is
    the number of rules her path satisfies. The total is Poisson-binomial.
  - **Test:** exact one-sided p.

## Criteria
- **The tests.** For each addressed arm (BUBBAMU, FAMILY_IN, FAMILY_OUT, TRI_CADENCE, ANCHORED) and each measure (G1, G2, R),
  the test is run separately in the discovery and the replication half.
- **The pair's p** is the larger of the two halves' p, so both halves must pass.
- **The correction.** Holm across the 15 (arm, measure) pairs, at α = 0.05.

**Answer:**
- **AN ADDRESSED REPLY CARRIES INFORMATION**, naming each (arm, measure) that passes;
- otherwise **NO INFORMATION BEYOND CHANCE** in any arm or medium.

**Reported, not criteria:**
- NO_CONTACT's tests;
- interference: FAMILY_IN against FAMILY_OUT per-trial grid matches, two-sided sign test;
- encounters admitted per arm.

## What the result can and cannot mean
- **The nulls are exact.** The answers are fixed and sealed before the targets exist, so a pass is evidence of information
  reaching her by no ordinary signal path, through that Call and that medium.
- **The power.** With 15 tests the correction is stricter, so a pass is a strong result and a null bounds weaker effects less
  tightly than THE POINTER V did.
- **What only ANCHORED can show.** It is the only arm whose Call contains information about the target trial, and only its
  position in time, not its content. A pass there would mean the time-coordinate of the target event steers her reply toward
  its content.

## Checks made before this registration
- **Code checks** (no answers of the study, no targets):
  - the Calls print as designed (FIRST round 33901012);
  - one traveller of an unregistered world (`SMOKE6`) runs in about 34 s, and its answers are identical on rerun;
  - the scorer's window count equals the direct count on 2,000 random cases;
  - the exact tails agree with brute force;
  - `score.py` runs end to end in 35 s on random dummy answers and dummy targets.
- **The lesson from THE POINTER V.** The seal run executes `score.py` on the real answers against dummy targets as a separate,
  failing step before sealing.

## Order
1. This registration and the code are committed and pushed to `pointer6-20261112`.
2. `seal.trigger`. The workflow:
   - computes all answers twice (they must match);
   - runs the pipeline check;
   - commits the answers;
   - seals them by RFC 3161 before 12 Nov 18:00 UTC (the workflow refuses after 17:30 UTC).
3. After 21:15 UTC, `score.trigger`. The workflow:
   - verifies the seal and the sealed sources;
   - fetches and verifies the 3,600 target rounds;
   - scores, and commits `results/`.
