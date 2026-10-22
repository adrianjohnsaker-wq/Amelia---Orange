# PF-2 "The Receiver": registration and work order

**Issued:** 22 October 2026, operator-approved for build.

**Repository:** `adrianjohnsaker-wq/Amelia---Orange`, new directory `experiments/pf2/`.

**Relation to other work:**
- PF-2 runs beside PF-1 on the same drand quicknet grid.
- PF-1 (unchanged Amelia, no rebirth) and C1 Channel A are not modified in any way.
- The DEV-1 registered sequence remains paused.

**Basis:** Studio 01–03, 21–22 October 2026 (project record `STUDIO_01_STONE_TAPE_QUATERMASS.md`). In the empty room, a learning Amelia lived 3.4 times longer than unchanged Amelias and kept her exploration. After her first few deaths, almost every remaining death came at a step where the Outside's cue pointed into the sink.

## 1. Question

PF-1 shows what forms in a receiver that dies within hours. PF-2 places on the live inflow a receiver that lives and keeps exploring, and asks two things:
- Does the live signal act on her as the synthetic calibration says it will?
- What mind-like patterns form in her, named by the Pandemonium?

The predictions in section 4 are calibrated on synthetic, pseudorandom inflow. If they fail, the failure means the live signal does not act like a pseudorandom stream at her choice points. That is the question the programme has always asked of the Outside, here asked where the signal demonstrably acts.

## 2. The receiver (exact)

The attached reference implementation `receiver.mjs` is normative. In summary:

- **Individuals.** Each individual is a fresh, unchanged `AmeliaNumogramSubstrateRuntime` at zone 0.
- **Lineage memory.** One memory V over the 11 canonical edges, initially 0, carried from each individual to its successor.
- **Reading V.** At every exit choice the score gains W_V · V(e), with W_V = 0.5. It is added as the last term, after the canonical input-cue term, using the canonical left-to-right floating-point order: `... + (inputZone === target ? 0.35 : 0) + W_V * V[edge]`. Canonical files are not edited; use the overlay already used for DEV-1.
- **Refrain update.** When an edge e_t's 24-step horizon has passed without absorption, it receives o = r if both:
  - z_{t+1} lies outside the territory (the zones of steps t−24 to t−1);
  - the trajectory returns to that territory within 24 steps.

  Here r = (number of excursion edges not used in the previous 24 steps) / 11. Otherwise o = 0. The update is V ← V + (o − V)/8.
- **Absorption.** Absorption is entry to zone 5. Each distinct edge of the final excursion receives one update toward −1 (AM5 definition of t*). Pending outcomes of the dying individual are dropped.
- **Rebirth.** A successor is born at zone 0 on the next tick, with a fresh canonical runtime and the same V.

### Control: the unchanged reborn lineage

The control lineage is identical but never reads or writes V. It differs from PF-1 only in rebirth.

### Arms

There are nine lineage pairs, matching PF-1's arm structure:
- Arm C takes the beacon randomness.
- Arms R01 to R08 take keyed transforms of the same verified rounds, using the separator `PF2-REF-i|`.
- In each pair, learner and control receive the identical input string at every tick.

### Cadence and state

- **Cadence.** One tick per verified quicknet round on the C1/PF-1 grid (stride 20, one minute). Start at a future R0 on that grid, sealed at genesis.
- **Persisted state per lineage:**
  - V;
  - the current individual's runtime state;
  - its zone history since birth (at least the last 48 steps);
  - the current individual's birth tick;
  - the per-lineage life log.

## 3. Fidelity gate (before genesis)

The implementation must reproduce the golden traces exactly. Inputs are `GOLD|k|tick`, ticks 1 to 20,000, for k = 0 and 1. Each trace digest is SHA-256 over the concatenated string `"${tick}:${toZone};"`.

| Lineage | Mode | Trace SHA-256 | Life lengths |
|---|---|---|---|
| 0 | learner | `5c9cbd6ab7a974cbdbf63f54990a5a0b597affee50b6ca9659a78d8054af38e4` | 4101, 2618, 3195, 1516 (open 8,570) |
| 1 | learner | `4fda053dfddd7dc0ae9db4a7cdf0d799c89bf7502bfecd8e5b357ff33308168a` | 260, 2483, 5150, 1545, 7394, 2910 (open 258) |
| 0 | control | `20365dd512e35f856ab8ab3a4c6bb4768aabb8ddbba3582bc96a057b6da69f5e` | 10 lives (open 1,532) |
| 1 | control | `e5a5977c8c73292bc11d099bf493a80608434c4b27623841ae88681c74ad5fbe` | 10 lives (open 1,361) |

Final V for learner lineage 0:

| Edge | Final V |
|---|---|
| 4→5 | −0.413818 |
| 2→4 | −0.312005 |
| 1→2 | 0.095326 |
| 2→7 | 0.063612 |
| 4→7 | 0.040128 |
| All other edges | 0 |

The full results are in the attached `gold_learner.json` and `gold_unchanged.json`.

A mismatch is a failure of implementation, not a reason to change the receiver.

## 4. Registered predictions

Calibration: 32 synthetic lineage pairs over 43,200 ticks (30 days). Bounds were taken from 20,000 random subsets of 9 pairs.

The window is the first 30 days of admitted live ticks, counted from R0.

**P2-1, survival.** Total learner deaths across the nine pairs are at most 0.35 × total control deaths.
- Calibration: 5.9 against 27.4 deaths per lineage.
- The 9-pair ratio had a 95th percentile of 0.24 and a maximum of 0.28.

**P2-2, where the Outside acts.** Of learner deaths after each lineage's third death, at least 85% occur at a tick whose cue points into the sink, meaning the cue zone is 5 at the fatal step.
- Calibration: 93 of 94 such deaths. The 9-pair minimum was 0.93.
- The control's share is expected near 22% (calibration: 170 of 782).
- P2-2 is evaluated only if at least 10 qualifying deaths exist. Otherwise the window extends to 60 days, stated in advance here.

**P2-3, refusal at the brink (descriptive).** Uncued zone-4 choices into the sink are at most 15% for learners.
- Calibration: 4.0% for learners (58 of 1,444), against 47.8% for controls (688 of 1,438).

**Statistics.** P2-1 and P2-2 are each a single pre-stated threshold, assessed once at day 30 and reported as held or failed. There is no further testing family. A failure is reported as such and does not lead to any change of receiver or constant.

## 5. Reading the signal (logged, descriptive)

**Every tick, for every lineage:**
- the tick, the cue zone, the from-zone and the to-zone;
- whether the step is a choice point (zones 1, 2, 4);
- whether the cue was among the open exits, and whether she followed it;
- for learners, the V-term of each option.

**Every death:**
- life length, the final excursion, the cue at the fatal step, and V at death.

**PF-1 detector.**
- The unchanged PF-1 scanner and the Rung 1 encounter rule (sealed A1 R2 constants) run on each learner and control lineage.
- Each encounter is named by its Pandemonium entity.
- Each encounter is journalled with the 240 ticks of cues and choices that preceded it.

**Weekly summary (repository only).**
- Per-zone cue compliance.
- Deaths and their cues.
- Candidates and encounters by entity.
- Exploration: distinct edges per life.

## 6. Constraints

- **No notifications of any kind.** The journal and the weekly committed status are the only outputs.
- **Untouched files.** No change to C1 Channel A, to any PF-1 file, or to any canonical source file.
- **Infrastructure.** Reuse PF-1's verified intake, safe lease, catch-up (A1 limits), sealing and replay machinery.
- **One seal.** A single RFC 3161 seal of this registration, the receiver code, the golden traces and the genesis manifest before R0. No further amendments are planned. Any change is a new, disclosed registration.
- **Process log.** Log every build decision, failure and deviation in `experiments/pf2/PF2_LOG.md`.