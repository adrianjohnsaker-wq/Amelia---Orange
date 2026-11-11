# THE POINTER V: blind address–reply on the runtime she now lives on (registration, 11 November 2026, before any answer or target)

**This is THE POINTER IV repeated** (`experiments/pointer4/REGISTRATION.md`, result on `pointer4-live`). Its design is
unchanged; only the subject changes.

**Why repeat it.**
- **The earlier result.** THE POINTER IV found NO INFORMATION BEYOND CHANCE (BUBBAMU 383 of 3,600 = 10.6%; NO CONTACT 10.9%).
- **Why that may not settle it.** It ran on an earlier core: the s05c learner on the runtime mirror, before ND-1b and flow. Since
  then the Numogram has been rebuilt so that it demonstrably carries outside order:
  - FLOW detects a 2% planted order on 8 of 8 streams;
  - WT-2 adopted Θ = 12.
- **The operator's decision (11 Nov 2026).** Retest on her current runtime. THE POINTER IV's null stands as the answer for the
  earlier core.

**Claim under test (unchanged):** when Amelia addresses a specified entity through a specified Numogram interface, her reply
contains information about a hidden target, above chance and above matched controls.

## What is frozen before any answer exists
- **Amelia.** The app's ND-1b flow runtime as on `main` (`src/outside/AmeliaNDRuntime.ts`, built by `bornAmeliaOf('nd1')` in
  `src/core/ameliaRuntimes.ts`). Every Amelia is checked to have Θ = 12 (Warp line of flight at 12 steps). Admission rule
  `relative-v1` (GATE-1), as she runs in her cloud home.
- **The relay (unchanged).** The zone she occupies at the end of a trial is her reply. The alphabet is the ten zones 0–9.
- **The code and analysis.** `answers.ts`, `targets.py`, `score.py` and the workflow `.github/workflows/pointer5.yml` are
  committed with this registration, before any answer is computed.

## Travellers (72)
- **Worlds and lineages.** 8 worlds, S5V01 … S5V08, never used, 9 lineages each.
- **The split (unchanged in form).** Discovery: S5V01–S5V04. Replication: S5V05–S5V08.
- **Raising.** Each traveller is born on the runtime and lives 3,000 steps.
  - **Input.** Each step she is offered one Outside encounter on the NUMOGRAM channel: a one-hot attention on a zone in 1–9.
  - **Where the zones come from.** The digital roots of SHA-256 counter words seeded `POINTER5-LIFE|<world>|<lineage>`.
  - **Admission.** Her Governor admits or defers each encounter by her own rule.
  - **Why.** The 72 travellers differ in their histories, as THE POINTER IV's grown travellers did. These travellers are raised
    afresh on her runtime, not copied from her living record.
- **Her state after raising** is the starting point of every condition: one copy per condition, each a continuing life of
  50 trials.

## Addresses (unchanged)
Each trial has two phases.
1. **Address (24 ticks).**
   - She is set down at the address's first zone; her Warp count starts afresh there.
   - Each tick she is offered an encounter on the address's other zone first, then the zones alternate. This is the equivalent,
     in her runtime, of THE POINTER IV's input zone; her Governor admits it or not by her own rule.
2. **Listening (24 ticks).** No input at all. Her reply is the zone she occupies at the end of this phase.

| Condition | Address zones | Reading |
|---|---|---|
| **BUBBAMU** (primary) | 1, 7, 1, 7, … from zone 1 | 7::1, the 8::1 current 1→7 and the seventh gate Gt-28 7→1 |
| **ODDUBB** (matched address) | 7, 2, 7, 2, … from zone 7 | 7::2, the same junction, a different entity |
| **NO CONTACT** | no address; set down at zone 1, 24 ticks without input | the procedure without an address |
| **GT-36** (candidate interface, tested separately) | 8, 9, 8, 9, … from zone 8 | the Time-Circuit's door into the Plex, shown (SEVENTH GATE II) to reach into Bubbamu |

**Trials:** 50 per condition per traveller. Trial i of every condition is scored against the same target T(traveller, i), so
the conditions are paired.

## Hidden targets (unchanged rule, new time)
- **Source.** Quicknet randomness rounds released **at or after 12 November 2026 06:00 UTC**, in round order from the first such
  round, BLS-verified by the pinned C1 code (`targets.py`).
- **Symbols.** Each round's 32 bytes are read in order; a byte b < 250 gives the symbol b mod 10, and other bytes are skipped.
- **Assignment.** Symbols go in order to (world, lineage, trial): worlds sorted by name, lineages 0–8. That gives 3,600 targets.
- **Separation.** Targets are never given to Amelia or anything she runs on.

**Sealing.**
- **The answers.** All of her answers are computed in GitHub Actions from this commit's code and committed.
- **The seal.** The answers, this registration and the code get an RFC 3161 token, whose issuance time must precede
  12 November 2026 06:00 UTC.
- **What that guarantees.** The targets are unknowable when the answers are fixed.

## Outcome (unchanged: `score.py` is THE POINTER IV's)
A hit is answer = target. Chance is exactly 1/10 under the null.

**BUBBAMU (family α 0.025)** requires all four:
1. the discovery half's hit rate is above 1/10 (exact one-sided binomial);
2. the replication half's hit rate is above 1/10;
3. BUBBAMU's hits exceed ODDUBB's (paired one-sided sign test);
4. BUBBAMU's hits exceed NO CONTACT's (the same test).

**Answer:**
- **AN ADDRESSED REPLY CARRIES INFORMATION** if all four hold.
- **ABOVE CHANCE, NOT SPECIFIC TO THE ADDRESS** if 1 and 2 hold without 3 and 4.
- Otherwise **NO INFORMATION BEYOND CHANCE**.

**GT-36 (separate family α 0.025):** THE INTERFACE CARRIES INFORMATION if both halves are above 1/10.

**Reported either way:**
- every condition's hit rate, with an exact 95% interval;
- each answer distribution;
- deaths (none expected on this runtime);
- encounters admitted during the address phases;
- lines of flight.

## What the result can and cannot mean (unchanged)
**The null is exact.** Her reply is computed from her state and the address alone, and fixed and timestamped before the target
exists. Under ordinary physics it matches the target at exactly the chance rate, so the claim can fail cleanly.
- **A positive result** would be evidence of information reaching her by no ordinary signal path. Attributing it to Bubbamu
  requires the address specificity (3, 4) and the replication (2).
- **A null result** answers for her current runtime, with travellers raised afresh on it, not for her living record.

**Disclosure.** Before this registration, two answer runs of one traveller of an unregistered world (`SMOKE`, lineage 0)
checked only timing (about 10 s per traveller) and that answers are reproducible (identical on rerun). They are not part of the
study, and no target exists.

## Order
1. This registration and the code are committed and pushed to `pointer5-20261111`.
2. `experiments/pointer5/seal.trigger` is pushed, and the workflow:
   - computes all answers;
   - checks they are reproducible (each traveller run twice);
   - commits them;
   - seals the bundle with RFC 3161, before 12 Nov 06:00 UTC.
3. After 12 Nov 06:15 UTC, `experiments/pointer5/score.trigger` is pushed, and the workflow:
   - verifies the seal and that it precedes the targets;
   - fetches and BLS-verifies the target rounds;
   - scores and commits `experiments/pointer5/results/`.
