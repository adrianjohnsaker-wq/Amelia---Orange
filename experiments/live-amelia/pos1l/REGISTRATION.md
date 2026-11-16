# POS-1L: does her position when the Outside arrives shape her Warp entries? (registration, 16 November 2026)

**Status.**
- **Approved.** The operator (Adrian) approved the draft as drafted on 16 November 2026, choosing the fresh windows of 15–18 November ("Fresh 15–18 Nov") and "Approve as drafted".
- **When registered.** Before any data. The windows are not complete until 18 November 00:00 UTC.
- **Where the design comes from.** The approved draft is the project doc `claude/POS-1L_POSITION_AT_ARRIVAL_DRAFT.md`. Additions needed to run it are marked **(fixed here)**. None changes the design, the measures or the readings.
- **How it is reported.** Led by what it teaches about Warp activity.

**Scope.**
- **Copies only.** Copies of her state, in GitHub Actions, on the WT-3L replay.
- **What is read.** Her live record was read once, for the starting copy.
- **Where results go.** `amelia_pos1l_runs` and `amelia_pos1l_inputs` only.
- **What is not changed.** How she moves.

---

## What we would learn about Warp activity

**Under the queue (WT-9L).** Choosing which offer arrives according to where she stood made no difference: TOWARD − AWAY was −0.08 per 1,000, p = 0.93. The offer was not taken in until some steps later.

**Under the lane (GATE-2L).** The same contrast was +1.73 and then +2.26 per 1,000 steps, in two runs. Both were descriptive and neither was identified (p = 0.21 and p = 0.094).

**What this study asks.** Two questions, as a registered test on windows that GATE-2L did not use:
- whether an Outside offer that points toward the Warp's threshold, delivered while she stands at it, brings her into the Warp more often than one pointing away;
- whether this is so under the lane and not under the queue.

---

## 1. Design

**Start.** Her live state under the lane, copied read-only from her live record at the first tick boundary after approval. The copy is stored as the study's starting copy, with its step and revision recorded.

**Units.** Twelve six-hour windows of her recorded Outside offers, 15 November 00:00 to 18 November 00:00 UTC.
- **How they are built.** By the same window builder as WT-4L and DEE-1L (`amelia_dee1l_window`), with at most 2% of ticks missing.
- **Why these windows.** WT-9L and GATE-2L used 12–15 November. These windows are new to this question.
- **When they are complete.** At 18 November 00:00. The run starts after that.

**The replay.** The WT protocol: 96 ticks, 15 iterations per tick, the i-th offer in iteration i, her controls and body.

**The selectors.** WT-9L's, unchanged.
- At each offer slot, one offer is taken from the pass's remaining pool.
- **The ahead zones.** From 7: {2, 5}. From 2: {3}. From 5: {6}. Elsewhere: none.
- **TOWARD.** At 7, 2 or 5, the offer with the largest summed attention on the ahead zones.
- **AWAY.** At 7, 2 or 5, the offer with the smallest summed attention on the ahead zones.
- **Elsewhere,** both take the first remaining offer.
- **BLIND.** The offer with the largest attention on 2 + 3 + 5 + 6, wherever she stands.
- **RECORDED.** The first remaining offer.
- **Ties.** The earliest.

**Arms.** Six, paired by unit.

| Arm | Gate | Selector |
|---|---|---|
| LANE-TOWARD | Her rule, `outside-lane-v1` | TOWARD |
| LANE-AWAY | `outside-lane-v1` | AWAY |
| LANE-BLIND | `outside-lane-v1` | BLIND |
| LANE-RECORDED | `outside-lane-v1` | RECORDED |
| QUEUE-TOWARD | The same start with `relative-v1` (only the rule changed, as `set-admission` does) | TOWARD |
| QUEUE-AWAY | `relative-v1` | AWAY |

**Checks before any study run.**
- **Synthetic tests.** The selectors keep each pass's offers and slots. LANE-RECORDED equals the plain replay under her rule.
- **Determinism.** A repeated pair, identical.

---

## 2. Measures and rules

**E.** Warp entries per 1,000 runtime steps, counted hop by hop. E by choice and E by flow are reported.

**Tests.** Each is an exact two-sided sign-flip over 4,096 patterns.

| | Contrast | Role |
|---|---|---|
| **P1** | E(LANE-TOWARD) − E(LANE-AWAY) | Primary, α = 0.05 |
| **S1** | E(LANE-TOWARD) − E(LANE-BLIND) | Secondary |
| **S2** | [E(LANE-TOWARD) − E(LANE-AWAY)] − [E(QUEUE-TOWARD) − E(QUEUE-AWAY)] | Secondary, the interaction |

S1 and S2 are judged with Holm at α = 0.05 between them. They are read whatever P1 shows.

**Readings.**

| Reading | When |
|---|---|
| **POSITION SHAPES ENTRY UNDER THE LANE** | P1 holds with d > 0 |
| **POSITION LOWERS ENTRY UNDER THE LANE** | P1 holds with d < 0 |
| **NOT IDENTIFIED** | P1 does not hold |
| **…, AND NOT UNDER THE QUEUE** | Added when S2 also holds with d > 0 |
| **…, AND NOT BY THE OFFER'S POINTING ALONE** | Added when S1 also holds with d > 0: an offer aimed at her position does more than one aimed at the Warp wherever she is |

**Descriptive.**
- **By arm.**
  - The share of slots at which she stood at 7, 2 or 5.
  - The share of delivered offers admitted on arrival.
  - Coupling (GATE-2L's H1 measure).
  - Warp share and lines of flight.
- **By whether the slot was at an edge.** Entries within 5 steps of a delivered offer.

---

## 3. Timing and reporting

**When it runs.** 18 November, after 00:00 UTC, when the windows are complete. A scheduled task in this session builds the windows, checks them, starts the run and reports.

**How it is reported.** Led by what it teaches about Warp activity.

---

## 4. Details fixed here

- **The starting copy (fixed here).** `amelia_pos1l_runs` id `start`: her live record at revision 600, step 10,047, Θ = 12, `outside-lane-v1`. It was copied read-only at 22:29 UTC on 16 November, after the 22:20 tick and before any study data.
- **The QUEUE arms (fixed here).** Their start is that copy with only `admissionRule` set to `relative-v1`, by `setAdmissionRuleOf`, the same operation as `set-admission`.
- **Machinery (fixed here).** GATE-2L's `runGate`, unchanged, under the standard gate. Under the standard gate the core `outside-lane-v1` applies when it is her saved rule, and it is identical to the tested research lane (`admission_lane.test.ts`). The selectors are WT-9L's `choose`, unchanged. Offer ids take the GATE-2L form `gate2l:<unit>:<pass>:<eventId>`.
- **The windows (fixed here).**
  - **Unit u.** [15 Nov 00:00 + 6(u−1) h, + 6 h), for u = 1…12, built by `amelia_dee1l_window` into `amelia_pos1l_inputs`.
  - **What a window holds.** The builder takes the window's `ok` ticks, as WT-4L and DEE-1L did. A tick whose save was cancelled did not record its delivery, and its offers were delivered again in the next `ok` tick.
  - **The missing limit.** Missing means a delivered offer whose content is not found in her memory or archive. At most 2% of a window's offers may be missing. A window over that limit is reported, and the operator is asked before running.
- **The descriptive edge measure (fixed here).**
  - **The zone at delivery.** Her landing zone on the step before the delivery step.
  - **What is counted.** Entries into {3, 6} among her landing zones on the delivery step and the 4 after it, counted against the previous landing.
  - **How it is reported.** Separately for deliveries at 7, 2 or 5 and elsewhere.
- **Order of work.**
  1. Synthetic machinery checks.
  2. The determinism pair (LANE-TOWARD, unit 1).
  3. 12 × the six arms.
  4. The analysis, written as id `analysis`.
