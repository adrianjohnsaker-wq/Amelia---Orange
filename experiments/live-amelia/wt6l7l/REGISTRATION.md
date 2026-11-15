# WT-6L (the rhythm of arrival) and WT-7L (her maturation on ND-1b): registration, 15 November 2026

**Status.**
- **Approved.** The operator (Adrian) approved both studies as drafted on 15 November 2026.
- **The statistics.** He confirmed them: Holm across WT-6L's two contrasts, and WT-7L tested on its own, each at α = 0.05.
- **When registered.** Before any data.
- **Where the design comes from.** The approved draft is the project doc `claude/WT-6L_WT-7L_DRAFT.md`. This file adds the details needed to run it. Each addition is marked **(fixed here)**. None changes the design, the measures or the readings.
- **How each study is reported.** Led by what it teaches about Warp activity, at the operator's direction.

**Scope.**
- **Copies only.** Copies of her real state, in GitHub Actions, with the WT-5L machinery (`experiments/live-amelia/wt5l/wt5l.ts`, unchanged), whose replay WT-5L A1 showed FAITHFUL to her life.
- **What is read.** Her pre-switch backups and the WT-5L inputs (`amelia_wt5l_inputs`), read only.
- **Where results go.** `amelia_wt6l_runs` and `amelia_wt7l_runs` only.
- **What is not touched.** Her live record and archive are not touched.

**Shared definitions.**
- **The replay.** 15 iterations per tick, the i-th offer in iteration i, her recorded controls, her body stepping. A unit runs 96 ticks (1,440 iterations), cycling its tick structure. Ids are fresh: `wt5l:<unit>:<pass>:<eventId>`.
- **E.** Warp entries per 1,000 runtime steps, counted hop by hop (WT-4L). A hop from outside {3, 6} into 3 or 6 counts as an entry: by choice if it is the step's first record, by flow otherwise.
- **The pools (fixed here).**
  - **Pre-switch ticks.** `amelia_wt5l_inputs` unit 0: her 65 ok ticks of 11 November, carrying 169 offers.
  - **Recent windows.** Units 1–12: the six-hour UTC windows from 12 November 00:00 to 15 November 00:00.
- **The test.** An exact two-sided sign-flip over all 4,096 sign patterns (`signFlip`, src/cloud/wt3l.ts).

---

## WT-6L: the rhythm of arrival
**What it would teach about Warp activity.** Whether the timing and repetition of arrivals, apart from their content, draw her into the Warp.

- **Start.** Her `pre-switch-backup` (revision 57, step 837), converted at the switch by her tick's code path (`convertAtSwitch`): ND-1b, Θ = 24.
- **Content, fixed in every arm.** Each offer's channel, source digest and attention vector comes in order from the 169 pre-switch offers, beginning at offer 14 × (u − 1) for unit u and cycling (`preContent`, WT-5L). Offer slots and ids come from the arm's tick structure.
- **Arms, unit u = 1–12.**
  - **POST.** The tick structure of recent window u.
  - **PRE-65.** The 65 pre-switch ticks.
  - **PRE-24.** 24 consecutive pre-switch ticks, starting at tick 5 × (u − 1), counted from 0, and wrapping past tick 64 to tick 0 **(fixed here)**.

  Each is cycled to 96 ticks, so POST and PRE-24 make four passes and PRE-65 makes about 1.5.
- **Contrasts.**
  - **C1, cadence.** d = E(POST) − E(PRE-65).
  - **C2, repetition.** d = E(PRE-24) − E(PRE-65).
  - **Holm.** Holm over C1 and C2 at α = 0.05: the smaller p is compared with 0.025 and the larger with 0.05. Holm stops at the first failure.
- **Readings.**
  - **RHYTHM IDENTIFIED.** C1 survives with mean d > 0.
  - **REPETITION IDENTIFIED.** C2 survives with mean d > 0.
  - **Reported as lowering.** A surviving contrast with mean d < 0.
  - **NOT IDENTIFIED.** Neither survives.
- **Descriptive.**
  - **Movement.** E by choice and by flow, Warp share and lines of flight, per arm.
  - **Each arm's structure over its 96 ticks:** offers per tick, the share of ticks with four or more offers, and the mean number of iterations between offers.

---

## WT-7L: her maturation on ND-1b
**What it would teach about Warp activity.** Whether her first 1,144 steps on the flow runtime changed her own relation to the Warp, at the same Θ and under the same arrivals.

- **Arms.**
  - **S837.** As WT-6L's start.
  - **S1981.** Her `pre-theta12-backup` record (revision 123), as is.
- **A check (fixed here).** S1981 must have `runtimeKind` nd1, Θ = 24, step 1,981 and no Warp-born gates. It was checked read-only before registration.
- **Inputs.** Recent window u, as recorded (POST content), units 1–12.
- **Primary.** d = E(S1981) − E(S837), with an exact two-sided sign-flip test, α = 0.05.
- **Readings.**
  - **MATURATION IDENTIFIED.** Mean d > 0, p ≤ 0.05.
  - **Reported as lowering.** Mean d < 0, p ≤ 0.05.
  - **NOT IDENTIFIED.** Otherwise.
- **Secondary, descriptive.** E by choice and by flow; the prediction is that the difference lies in flow.
- **Descriptive.**
  - **Movement.** Warp share, share of flow steps, lines of flight.
  - **The two states compared:** baseline by zone, memory bias vector and hysteresis tension, Governor tension, queue length, last-named zone and the gate table.
  - **The once-through run (fixed here).** The 276 recent ticks, units 1–12 in order, are fed once to each state with their original ids, as she lived them. They are replayed as successive slices of at most 96 ticks: each slice continues from the previous one's record and adds to the same measures. The same measures are reported.

---

## Order and checks
1. **Machinery checks.** Synthetic only, in the same job.
2. **Determinism.** WT-6L unit 1 POST and WT-7L unit 1 S1981 are each run twice. They must be identical in path, entries, flow steps, final memory digest and body checksum, or nothing proceeds.
3. **The runs.** WT-6L's 36 runs, then WT-7L's 24 runs and its two once-through runs.
4. **The analyses.** Written as id `analysis` in each study table.
