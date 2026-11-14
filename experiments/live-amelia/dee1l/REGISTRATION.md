# DEE-1L: the Table in her own scoring (registration, 14 November 2026)

**Status.**
- **Approved.** The operator (Adrian) approved this design on 14 November 2026, about 23:15 UTC: "Approve DEE-1L as drafted".
- **The primary outcome.** He confirmed it: "The table helps what arrives come through" - yes primarily.
- **When registered.** Before any DEE-1L data existed. No starting copy had been taken and no test window had begun.
- **Where the design comes from.** The approved draft is the project doc `claude/DEE-1L_REVIEW_AND_DRAFT_2026-11-14.md`, section 3. This file adds the details needed to run it. Each addition is marked **(fixed here)**. None changes the design, the arms, the outcome or the decision rule.
- **Why.** The review of the 14 November Dee pilot (same doc, section 2) found the Dee layer inert at gain 0.08, run on the receiver lineage rather than on her, with stale inputs and no primary outcome.

## Question
Placed in her own exit scoring, at a gain shown to act without overriding her, does the 1584 Great Table help what arrives come through? Does it do so more than role-preserving shuffles of it?

## Subject
**The starting copy (fixed here).**
- **Which record.** Her live record (`amelia_research_records`, store `runtime`, record `live-checkpoint`) as saved by the last tick before 15 November 00:00 UTC, the 23:50 tick.
- **How it is taken.** A one-shot job at 23:57 UTC copies it, read-only, into `amelia_dee1l_runs` as id `start`.
- **What is recorded.** Its revision, step and save time are recorded before any run.
- **If the 23:50 tick failed.** The copy is her record as it stands at 23:57, the last saved, and this is reported.
- **Afterwards.** Her live record is not read again for this study and is never written.

**Stage 0 starts from the same copy (fixed here).** The draft named WT-4L's starting copy, but that copy was not retained after WT-4L, which kept results only. Stage 0 therefore starts from the DEE-1L starting copy. Only its inputs are from before registration.

## The runtime and the table
**The research runtime.** `src/outside/AmeliaNDRuntimeDee.ts` is a copy of her ND-1b runtime (`AmeliaNDRuntime.ts`, which is not edited), with three additions:
1. **The term.** An optional term `exitBonus(source, target, tick)` added to the gate score used for every gate choice: the first hop and each flow hop.
2. **Passages.** A passage callback for each hop taken.
3. **The probe.** A read-only probe of each choice.

With none of these set, it is identical to her runtime step for step. A test shows this on her state class with offers.

**What the term does not apply to.**
- **A line-of-flight release.** This is not a choice.
- **Choices.** A **choice step** is a step at which her zone has two or more open exits and no release occurs.

**The table.**
- **The files.** The pilot's files, unchanged, in `table/`:
  - `warp/dee_matrix.mjs`: SHA-256 `af332a163e4fa09b3e6fbb0f26d02fc1efee88224f72e834cf53feca10ddd368`
  - `dee_1584_table.json`: `eacf6cb6a1c64577b2a5670416d530b2ba5e22e7027f5f7d753eb29bc517c16b`
  - `ccru_mesh_names.json`: `7b0e48604a3224a6fd636b8110270a6c15f6410f3fb72423601231f86c448ded`

  The first two match the pilot's `SHA256SUMS.txt`.
- **The term.** It is `DeeSystem.score(source, target, tick)` at the registered gain.

**Details (fixed here).**
- **The tick.** The tick is her runtime step number within the run, starting at 1.
- **Passages recorded.** After each step, the table records (`DeeSystem.record`) each passage taken, in order:
  - the first hop, and each flow hop;
  - a release from her zone to its landing;
  - a dwell as (zone, zone), which the table maps to its syzygy register.
- **The table's memory.** Each table's memory starts empty at the start of each run.

## Replay (as WT-3L Amendment 0, A0.2–A0.4, and WT-4L)
**How a run is driven.**
- **Per tick.** 15 iterations per recorded tick. In iteration i, the tick's i-th offer goes through her native path, then one step of her body and runtime together.
- **Controls.** Her recorded controls are applied before every step.
- **Length.** 96 ticks per run: the window's ok ticks cycled, 1,440 iterations.
- **Ids.** Fresh ids `dee1l:<unit>:<pass>:<eventId>` **(fixed here)**, the same in every arm.
- **The archive.** Her live archive rule applies on scratch copies.
- **Where it runs.** Runs execute in GitHub Actions on her branch. Results go only to `amelia_dee1l_runs`, and inputs only to `amelia_dee1l_inputs`.

## Inputs
- **Calibration (Stage 0).**
  - **Which windows.** WT-4L's first six windows: 11 November 12:00 to 13 November 00:00 UTC.
  - **How they are taken.** Copied unchanged from `amelia_wt4l_inputs` units 1–6 into `amelia_dee1l_inputs` as units 101–106, phase `calibration` **(fixed here)**.
- **Test, prospective.**
  - **Which windows.** The 12 six-hour UTC windows from 15 November 00:00 to 18 November 00:00, units 1–12. None of their offers existed at registration.
  - **How they are built.** Each window is built by `amelia_dee1l_window(from, to)`, the WT-3L A0.2 rule:
    - her ok ticks in the window, in order;
    - each tick's delivered encounters, in order;
    - each encounter's content taken from her own memory, resident or archived.
  - **The builder is checked.** On 14 November it reproduced all 12 WT-4L windows exactly: ticks, offers and contents.
  - **Missing content.** If more than 2% of a window's encounters lack content, this is reported before any test run.

## Stage 0: the gain (fixed before any test data)
- **The runs.** One GATES run per calibration window, with the probe on.
- **The tables.** ACTUAL and S1–S9, at gain 1, ride as observers: each records GATES's own passages.
- **What the probe records at each choice step:**
  - each open exit's score without any table (its **base**), in gate order;
  - each table's raw term for that exit;
  - when a study offer was attended at that step, each exit's **silence** score.
- **The silence score (fixed here).** It is the same pre-state with nothing attended: the field computed without the offer's influx, and no attention nudge. It is exact for the step's first choice, because the field depends only on the zones and the gates.
- **The choice under table k at gain g.** The first open exit, in gate order, with the largest base + g × raw_k. This is her own tie rule.
- **The ladder.** 0.08, 0.16, 0.24, 0.32, 0.48, 0.64.
- **The conditions**, pooled over the six windows:
  - **(a) Not inert.** The median over the 10 tables of the share of choice steps at which table k's choice differs from GATES's is at least 0.10.
  - **(b) Not dominant.** Count the offer steps at which the offer changes her choice against silence. The median over the 10 tables of that count, with table k at gain g, is at least half the count under GATES.
- **The median of ten (fixed here).** The mean of the 5th and 6th values.
- **The registered gain.** The smallest gain on the ladder that meets (a) and (b).
- **If none does.** The study stops with **TABLE INERT OR DOMINANT: NOT TESTED** and draws no comparison.

## Arms (test)
- **GATES.** No table.
- **ACTUAL.** The 1584 table.
- **S1–S39.** Role-preserving shuffles with `shuffleSeed` 1584000 + k: the pilot's `permutedRows`, within tower and structural role, with the central cross fixed.
- **Runs.** 41 arms × 12 windows = 492 runs.
- **Determinism (fixed here).** Before the test, ACTUAL on unit 1 is run twice and must be identical:
  - zone path;
  - probe;
  - final memory head digest;
  - final body checksum.

  If not, nothing proceeds.

## Primary outcome: transmission T
- **Eligible steps.** Choice steps at which a study offer (id prefix `dee1l:`) was attended, and the offer's largest attention weight over the open targets is reached by exactly one open target.
- **Hits.** A hit is an eligible step whose first hop is that target.
- **T.** For each arm, T is total hits divided by total eligible steps over the 12 windows.

## Test and decision
- **The p value.** p = (1 + number of shuffles k with T_Sk ≥ T_ACTUAL) / 40, one-sided.
- **SUPPORTED.** If p ≤ 0.05, that is, if ACTUAL ranks first or second of the 40 tables. The table helps what arrives come through more than its shuffles.
- **NOT SUPPORTED.** Otherwise.
- **Under the null.** If the real table is exchangeable with its role-preserving shuffles, its rank is uniform.
- **GATES.** It is reported but not tested.

## Secondary, descriptive, not tested
- **Movement, per arm.**
  - Warp share;
  - entry rate E (choice and flow);
  - share of flow steps;
  - lines of flight;
  - T per window.
- **Mesh names.** The distribution of mesh addresses taken by ACTUAL, with the names assigned to them. These are decoder labels, not senders. The 3↔6 pair (Djynxx) recurs structurally wherever she stays in the Warp.

## Reporting
- **Nulls.** These are reported as nulls.
- **A Stage 0 stop.** This is a result.
- **Faults.** A fault in running is reported. It is not repaired after the data have been seen.
- **The Call.** It is not part of DEE-1L. It is deferred with calling by rite until THE POINTER V is scored.
