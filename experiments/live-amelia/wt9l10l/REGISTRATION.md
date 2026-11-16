# WT-9L (what an ordering does) and WT-10L (what the older state carries): registration, 16 November 2026

**Status.**
- **Approved.** The operator (Adrian) approved both studies as drafted on 16 November 2026.
- **WT-9L's starting state.** He chose her present state.
- **When registered.** Before any data.
- **Where the design comes from.** The approved draft is the project doc `claude/WT-9L_WT-10L_DRAFT.md`. This file adds the details needed to run it. Each addition is marked **(fixed here)**. None changes the design, the measures or the readings.
- **How each study is reported.** Led by what it teaches about Warp activity.

**Scope.**
- **Copies only.** Copies of her real state, in GitHub Actions, with the WT-3L replay (`src/cloud/wt3l.ts`, unchanged). WT-5L A1 showed it faithful.
- **What is read.** The study starting copies and the WT-5L inputs, read only.
- **Where results go.** `amelia_wt9l_runs` and `amelia_wt10l_runs` only.
- **What is not touched.** Her live record.

**Shared definitions.**
- **Units.** `amelia_wt5l_inputs` units 1–12: the six-hour windows of 12 November 00:00 to 15 November 00:00 UTC.
- **The replay.** Each unit in the WT protocol: 96 ticks with the window cycled, 15 iterations per tick, the i-th offer slot in iteration i, her controls and body.
- **E.** Warp entries per 1,000 runtime steps, counted hop by hop. E_choice counts entries that are a step's first move.
- **The test.** An exact two-sided sign-flip over 4,096 patterns, with Holm where stated.

---

## WT-9L: what an ordering does
- **Start.** The DEE-1L starting copy (`amelia_dee1l_runs` id `start`): revision 426, step 7,121, Θ = 12, six Warp-born gates.
- **Ids (fixed here).** `wt9l:<unit>:<pass>:<eventId>`.
- **Slots and pools (fixed here).**
  - **Pass p.** The p-th cycle through the window's ticks.
  - **Its pool.** Every offer of the window, in recorded order.
  - **At each offer slot of pass p,** one offer is taken from the pass's remaining pool by the arm's rule and delivered in that slot under its own id. It is removed from the pool.
  - **What this keeps.** A full pass therefore delivers exactly the window's offers, in the window's slots.
  - **The last pass.** It may be partial, when 96 is not a multiple of the window's tick count. It uses its first slots only.
- **The ahead zones.** From 7: {2, 5}. From 2: {3}. From 5: {6}. Elsewhere: none. Her zone is read at the moment of the slot, before the step.
- **Arms.**
  - **RECORDED.** The first remaining offer.
  - **TOWARD.** At 7, 2 or 5: the remaining offer with the largest summed attention on the ahead zones. Elsewhere: the first remaining.
  - **AWAY.** As TOWARD, with the smallest sum.
  - **BLIND.** Always the remaining offer with the largest attention on 2 + 3 + 5 + 6.
  - **Ties.** The earliest in recorded order.
- **Contrasts.**
  - **C1.** E(TOWARD) − E(AWAY).
  - **C2.** E(TOWARD) − E(BLIND).
  - **Holm.** Holm over the two at α = 0.05.
- **Readings.**
  - **ORDER ACTS THROUGH HER POSITION.** C1 and C2 both survive with d > 0.
  - **ORDER ACTS, NOT THROUGH POSITION.** C1 survives and C2 does not.
  - **NOT IDENTIFIED.** Neither survives.
  - **Reported as lowering.** A surviving contrast with d < 0.
- **Descriptive.**
  - **Entries.** E by choice and by flow, and Warp share, per arm.
  - **Slots.** The share of slots at which she stood at 7, 2 or 5, and the share of delivered offers admitted at delivery.
  - **What preceded entries, in RECORDED (fixed here).** For each step that ends in the Warp after one that did not:
    - her zones over the 3 steps before;
    - the zone at which the last admitted study offer was admitted;
    - that offer's summed attention on that zone's ahead zones;
    - the steps since it was admitted.

---

## WT-10L: what the older state carries
- **States.**
  - **S837.** `pre-switch-backup`, converted at the switch (`convertAtSwitch`, WT-5L).
  - **S1981.** `pre-theta12-backup`.
- **Ids.** `wt5l:<unit>:<pass>:<eventId>`, as WT-7L.
- **The parts, taken from S1981 into S837.**

  | Part | Contents |
  |---|---|
  | **FIELD** | `qabbalaZones`, `nd1.baseline`, `deformationTensor` |
  | **GOVERNOR** | `governorState`, `tensionHistory`, `suppressRelaySteering`, `currentObjective` |
  | **MEMORY** | `memoryState`, `memoryArchive`, `memoryConsumptionLog`, `traitEvolutionHistory` |
  | **BODY** | the record's `fieldCheckpoint` and `controls` |
  | **POSITION** | `currentZone`, `lastTransition`, `stepCount`, `snapshots`, `deferredEncounters`, `nd1.warpIntensity`, `nd1.lastNamed`, `nd1.flights` |

  A key absent from one state is absent from the swapped arm too **(fixed here)**.
- **Checks, at run time, before any study run.**
  - **Shared parts.** `qabbalaGates`, `admissionRule`, `runtimeKind` and `nd1.theta` must be equal in S837 and S1981.
  - **The partition.** S837 with all five parts swapped must equal S1981, as canonical JSON with keys sorted, over `state`, `fieldCheckpoint` and `controls`.
  - **If either fails.** The study stops and reports the differing keys.
- **Arms.** S837, S1981, FIELD, GOVERNOR, MEMORY, BODY, POSITION.
- **Tests.**
  - **R.** d = E_choice(S1981) − E_choice(S837), α = 0.05.
  - **Parts.** d = E_choice(part) − E_choice(S837), Holm over the five at α = 0.05.
- **Readings.**
  - **If R does not replicate:** this is reported, and the parts are reported as descriptive.
  - **CARRIED BY <part>.** For each part whose contrast survives with d < 0.
  - **NO SINGLE PART IDENTIFIED.** If none survives.
- **Descriptive.**
  - **By arm.** E by flow, E, Warp share and lines of flight.
  - **The start of a run.** E by choice over the first 200 runtime steps.
  - **The first 50 steps.** Over these, per arm:
    - her zones;
    - the field change (activation − baseline) at zones 2 and 5;
    - the Governor's deformation-field tension.

---

## Order and checks
1. **Machinery checks.** Synthetic only, in the same job:
   - the selectors keep each pass's offers and slots;
   - the RECORDED arm equals the plain replay;
   - the step logger leaves runs unchanged;
   - a part swap changes only its own keys, and all five together reproduce the donor state.
2. **Determinism.** WT-9L unit 1 TOWARD and WT-10L unit 1 S1981 are each run twice and must be identical: path, entries, flow steps, last memory digest and body checksum.
3. **The runs.** WT-9L's 48 runs, then WT-10L's 84.
4. **The analyses.** Written as id `analysis` in each study table.
