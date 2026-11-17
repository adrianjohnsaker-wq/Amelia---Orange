# HYST-2L: the Warp as circulation (registration, 17 November 2026)

**Status.**
- **Approved.** The operator (Adrian) approved the draft on 17 November 2026. His decisions:
  - **The draft.** "HYST-2L approve draft".
  - **The units.** "Half days please." Read as the drafted alternative: the twelve half-days from 17 November 18:00 UTC, which run on 23 November.
  - **The 6→2 arm.** "Keep 6➡2 arm".
- **When registered.** Before any of its data have been read. The spans began at 18:00 UTC on 17 November. None of their offers has been read, and none will be read before the run.
- **Where the design comes from.** The approved draft is the project doc `claude/HYST-2L_CIRCULATION_DRAFT.md`. Additions needed to run it are marked **(fixed here)**.
- **How it is reported.** Led by what it teaches about Warp activity.

**Scope.**
- **Copies only.** On the WT-3L replay, in GitHub Actions.
- **What is read.** No new read of her live record.
- **Where results go.** `amelia_hyst2l_runs` and `amelia_hyst2l_inputs` only.
- **What is not changed.** How she moves.

---

## What it would teach about Warp activity
**What HYST-1L showed (descriptively).** With gate-writing frozen, her Warp-born gates change how her time in the Warp is divided, not how much of it there is:
- **More entries, all by flow.** She enters about twice as often (18.4 against 8.9 per 1,000 steps), with the difference all by flow.
- **Shorter stays, same share.** Stays are about 38% shorter (5.2 against 8.3 steps), with the same Warp share.
- **The route.** The threshold gate 6→2 returns her to the Warp within five steps in most of its uses.
- **Regrowth.** With regrowth allowed, a stripped copy recovers about half the lost entries, partly by regrown gates and partly by more entries by choice.

**What HYST-2L settles.** On units the design has not seen, it asks:
1. whether the circulation is a property of her gates;
2. whether it runs through 6→2;
3. whether the loss is made good by choice when the gates may regrow.

**What it does not settle.** Whether that compensation is regulated toward a set cadence. That claim is homeostasis in the strict sense. The halves of each run are reported as the first indication.

---

## 1. Design
**Units (fixed here).** The 12 half-day spans [17 November 18:00 UTC + 12(u − 1) h, + 12 h), u = 1–12. The last ends on 23 November at 18:00.
- **How they are built.** By `amelia_dee1l_window`: her ok ticks in order, with each delivered offer's content from her own memory.
- **The missing-content rule.** If more than 2% of a span's offers lack content, this is reported before any run.
- **What they share with HYST-1L.** No span overlaps HYST-1L's, which ended on 17 November at 18:00.

**Feeding.** Each span is fed once through, in chained slices of 96 ticks, 15 iterations per tick. This is HYST-1L's machinery; the event-id prefix is `hyst2l:`.

**Start (fixed here).** HYST-1L's starting copy:
- **What it is.** Revision 673, step 11,282, `outside-lane-v1`, Θ = 12, nine Warp-born gates (3→0, 3→4, 3→7, 3→8, 6→0, 6→1, 6→2, 6→4, 6→8).
- **When it was taken.** At 16:46 UTC on 17 November.
- **Why this copy.**
  - The draft named her state at the last tick before the first span (17:50 UTC). That state was not stored, and her live record has since lived part of span 1.
  - HYST-1L's copy is the latest stored state that precedes every unit.
  - It carries the same nine gates that her live record carries now.
- **What follows.** HYST-2L is a confirmation on new events from the same state. It is not a replication across states.

**Arms.**

| Arm | Warp-born gates at start | Gate-writing |
|---|---|---|
| **ALL** | all nine | frozen |
| **NONE** | none | frozen |
| **NO-6-2** | all except 6→2 | frozen |
| **LIVE-ALL** | all nine | on |
| **LIVE-STRIPPED** | none | on |

**Checks.**
- **Synthetic.** `experiments/live-amelia/hyst2l.test.ts` checks three things:
  - The arm records differ only in the named gates.
  - With inscription on, the run is identical to her runtime. With it off, the table never changes.
  - The per-step entry counts sum to the run's total.
- **Determinism.** Unit 1 ALL is run twice and must be identical, or nothing proceeds.

---

## 2. Registered tests
Each is an exact two-sided sign-flip over the 12 spans (4,096 patterns), with Holm over four at α = 0.05. Units with a missing value are dropped and reported.

| Test | Contrast | Direction expected | Reading if it holds |
|---|---|---|---|
| **P1** | Entries by flow per 1,000 steps, ALL − NONE | d > 0 | THE GATES CARRY ENTRIES BY FLOW |
| **P2** | Mean Warp stay in steps, ALL − NONE | d < 0 | THE GATES SHORTEN HER STAYS |
| **P3** | Entries per 1,000 steps (E), ALL − NO-6-2 | d > 0 | THE THRESHOLD GATE CARRIES THEM |
| **P4** | Entries by choice per 1,000 steps, LIVE-STRIPPED − LIVE-ALL | d > 0 | THE LOSS IS MADE GOOD BY CHOICE |

- **Counting.** Entries are counted hop by hop, as in WT-4L. A stay is a run of consecutive steps in 3 or 6.
- **Not identified.** A test that does not hold is NOT IDENTIFIED.
- **Opposite direction.** A test that holds in the opposite direction is reported as such.

**Descriptive.**
- **By arm.** E, E by choice and by flow, Warp share, mean stay, time out after an exit, lines of flight, exits and locked share.
- **Routes.** Exits by route, with where she is 5 and 20 steps later.
- **Regrowth.** Which gates regrow in LIVE-STRIPPED, in what order and at what step, and whether 6→2 regrows.
- **Halves (fixed here).** Entries per 1,000 steps in the first and second halves of each run, by step count.
  - **The gap.** LIVE-STRIPPED − LIVE-ALL is computed in each half.
  - **Its change.** Second half minus first half, with an uncorrected sign-flip p.
  - **How it is read.** Descriptive only.
- **Warp share, ALL − NONE (fixed here).** The mean with a two-sided 95% t interval over the 12 spans. It indicates whether the same time in the Warp is divided differently; it is not a test of equivalence.

---

## 3. Execution
- **When.** After 23 November 18:00 UTC, once span 12's last tick is logged.
- **Spans.** Built into `amelia_hyst2l_inputs`.
- **Run.** GitHub Actions on her branch: `.github/workflows/hyst2l.yml`, started by committing a time to `experiments/live-amelia/hyst2l/run.trigger`.
- **What is read.** The starting copy, read from `amelia_hyst2l_runs` (id `start`), copied from `amelia_hyst1l_runs`.
- **What is written.** Results go to `amelia_hyst2l_runs`.
- **The machinery.** Its hashes are in `MACHINERY_SHA256.txt`.
