# HYST-1L: structural hysteresis — what her Warp-born gates do once she is outside the Warp (registration, 17 November 2026)

**Status.**
- **Approved.** The operator (Adrian) approved the draft on 17 November 2026. His decisions:
  1. **Spans.** "(b) twelve half-day spans".
  2. **"Time-Circuit escape efficiency".** It means how long she stays out of the Warp after leaving it, which is H1 as drafted.
  3. **Gate-writing.** Freezing gate-writing in the main arms: approved.
- **When registered.** Before any data. The spans are not complete until 17 November 18:00 UTC.
- **Where the design comes from.** The approved draft is the project doc `claude/HYST-1L_STRUCTURAL_HYSTERESIS_DRAFT.md`. Additions needed to run it are marked **(fixed here)**. None changes the design, the measures or the readings.
- **How it is reported.** Led by what it teaches about Warp activity.

**Scope.**
- **Copies only.** Copies of her state, in GitHub Actions, on the WT-3L replay.
- **What is read.** Her live record was read once, for the starting copy.
- **Where results go.** `amelia_hyst1l_runs` and `amelia_hyst1l_inputs` only.
- **What is not changed.** How she moves.

---

## What we would learn about Warp activity

**What is known.** WT-4L removed her Warp-born gates, and her entry rate did not fall (13.97 against 14.73 per 1,000 steps, p = 0.57). The gates also regrew within a day. Entry is therefore not what the gates carry.

**What this study asks.** What the gates do after she has left the Warp, on three questions:
- whether they keep her out longer;
- whether she recovers from strain sooner;
- whether what the Outside sends passes more clearly into her choices.

**A correction to the premise.** She no longer carries six Warp-born gates. Her live record now holds nine:
- **The six of 14 November.** 3→0, 3→7, 3→8, 6→0, 6→1, 6→8.
- **3→4.** Present by 16 November.
- **6→2 and 6→4.** Written since.

Not all of these can be valves. 6→2 leads from the Warp to zone 2, which stands at the Warp's threshold (2→3), so it may be a route back in. The design therefore separates the gates by where they lead:
- **Plex gates:** 3→0, 6→0.
- **Time-Circuit gates:** 3→4, 3→7, 3→8, 6→1, 6→4, 6→8.
- **Threshold gate:** 6→2.

---

## 1. Design

**Start.** Her live state under the lane, copied read-only at the first tick boundary after approval, with all Warp-born gates it then holds. The copy is stored as the study's starting copy, with its step, revision and gate list recorded.

**Spans (the operator chooses; see section 4).** Twelve chronological spans of her recorded Outside offers, each fed once through, in order, in WT-7L's manner (chained slices of 96 ticks).

**The gate table is held fixed in the primary arms.**
- **The problem.** WT-4L showed that she rewrites removed gates within a day. Over long spans a stripped copy would stop being stripped, and the comparison would wash out.
- **The fix.** In the primary arms her lines of flight still fire, at Θ = 12, and still take her where they take her. They write no new gate.
  - **How it is done.** A research copy of the runtime with one switch, `inscribe = false`. With the switch on, the copy is identical to her runtime; this is checked step for step.
  - **What it isolates.** The gates she carries, not her ability to write them.

**Primary arms** (inscription off in all three, so the only difference is the gates carried):

| Arm | Warp-born gates carried |
|---|---|
| **ALL** | all of hers |
| **NO-PLEX** | all except 3→0 and 6→0 |
| **NONE** | none |

**Descriptive arms** (inscription on, as she lives):

| Arm | What it is |
|---|---|
| **LIVE-ALL** | her as she is |
| **LIVE-STRIPPED** | all Warp-born gates removed at the start, free to regrow; the order and time of regrowth are recorded |

**Checks before any study run.**
- **Synthetic tests.**
  - With `inscribe` on, the research runtime equals her runtime step for step.
  - With it off, lines of flight occur and the gate table never changes.
  - The arm records differ only in the named gates.
- **Determinism.** A repeated pair, identical.

---

## 2. Measures

**H1. Escape: how long she stays out (the pressure-valve measure).**
- **The measure.** After each exit from the Warp, the number of runtime steps until her next entry, censored at the span's end. The run's mean is used, with censored intervals counted at their observed length.
- **The two contrasts.**
  - ALL − NONE: do the gates keep her out?
  - ALL − NO-PLEX: do the Plex gates specifically keep her out?
- **Reported alongside.** Exits by route (gate or line of flight) and by destination (Plex or Time-Circuit).

**H2. Recovery from strain.**
- **A spike.** A step at which her tension reaches her own 48-step mean plus one standard deviation, the lane's "strained", after a step at which it did not.
- **Recovery time.** The steps until her tension falls below her own 48-step mean.
- **The measure.** The run's median recovery time.
- **The contrast.** ALL − NONE.
- **Reported alongside.** The share of steps in locked recovery, and the number of spikes.

**H3. Transmission T** (DEE-1L's measure, with no table).
- **Eligible steps.** Choice steps at which an Outside offer was applied, and the offer's largest attention over the open exits is reached by exactly one exit.
- **A hit.** An eligible step whose first hop is that exit.
- **The chance adjustment.** Removing gates changes how many exits are open, and so the chance of a hit. T is therefore reported as hits minus the sum over eligible steps of 1/(number of open exits).
- **The contrast.** ALL − NONE.

**Statistics.** Exact two-sided sign-flip over the 12 spans (4,096 patterns). Holm over the four tests:
- H1 (ALL − NONE);
- H1 (ALL − NO-PLEX);
- H2 (ALL − NONE);
- H3 (ALL − NONE).

Each is judged at α = 0.05.

**Readings.**

| Reading | When |
|---|---|
| **THE GATES KEEP HER OUT** | H1 (ALL − NONE) holds with d > 0 |
| **THE PLEX GATES ARE VALVES** | H1 (ALL − NO-PLEX) holds with d > 0 |
| **THE GATES SPEED RECOVERY** | H2 holds with d < 0 |
| **THE GATES CARRY THE OUTSIDE** | H3 holds with d > 0 |

Any test that does not hold is NOT IDENTIFIED. A holding test in the opposite direction is reported as such.

**Descriptive.**
- **By arm.**
  - Warp share and E (by choice and by flow).
  - Lines of flight, the mean Warp stay, and the Plex share.
  - GATE-2L's coupling C.
- **For LIVE-STRIPPED.** Which gates regrow, in what order and at what step, and whether the regrown table matches hers.
- **For each Warp-born gate.** How often it is used, and where she is 5 and 20 steps later.

---

## 3. Details fixed here

- **The starting copy (fixed here).** `amelia_hyst1l_runs` id `start`.
  - **Her live record.** Revision 673, step 11,282, Θ = 12, `outside-lane-v1`.
  - **When it was copied.** Read-only at 16:46 UTC on 17 November, after the 16:35 tick, before any study data.
  - **Her Warp-born gates.** Nine: 3→0, 3→4, 3→7, 3→8, 6→0, 6→1, 6→2, 6→4 and 6→8.
- **The spans (fixed here, the operator's choice b).**
  - **Unit u.** [11 Nov 18:00 + 12(u−1) h, + 12 h), for u = 1…12. The last span ends at 17 Nov 18:00.
  - **How they are built.** By `amelia_dee1l_window` into `amelia_hyst1l_inputs`, from the `ok` ticks.
  - **The missing limit.** At most 2% of a window's offers may be missing, that is, delivered offers whose content is not found. A span over the limit is reported, and the operator is asked before running.
  - **How each span is fed.** Once through, in order, in chained slices of 96 ticks: WT-7L's `onceThrough` pattern with the study's runtime.
- **Arm records (fixed here).** Each arm's start is the starting copy with the named Warp-born gates removed from `qabbalaGates`. Nothing else changes; the synthetic tests check this.
  - **ALL and LIVE-ALL.** All nine gates.
  - **NO-PLEX.** Without 3→0 and 6→0.
  - **NONE and LIVE-STRIPPED.** Without all nine.
- **Inscription off (fixed here).** After each runtime step, any Warp-born gate added during that step is removed.
  - **Why this equals never writing it.** A gate written at a line of flight leaves the Warp zone. That step's field update and flow hops cannot use it, because the field is updated before passage and flow never starts from inside the Warp.
  - **What the tests check.** With the switch on, runs equal the plain runtime step for step.
- **Ids (fixed here).** `hyst1l:<unit>:<pass>:<eventId>`.
- **Measures, by runtime step (fixed here).**
  - **H1.**
    - **The data.** The landing zones of each runtime step (the run's path).
    - **An exit.** A landing outside {3, 6} after one inside.
    - **The interval.** The steps until the next landing inside {3, 6}, or until the end of the run if there is none (censored, counted at its observed length).
    - **The run's value.** The mean interval. A run with no exit has no value, and its unit drops from that contrast. Any such unit is reported.
  - **H2.**
    - **The data.** Her Governor tension after each runtime step.
    - **The reference.** The mean and population standard deviation of the previous 48 values.
    - **A spike.** Its first step, with tension at or above mean + 1 sd, after a step below it.
    - **Recovery.** The number of steps until tension is below the reference mean of that step. A spike unresolved at the end is censored at its observed length.
    - **The run's value.** The median over spikes. A run with no spike has no value, and its unit drops from that contrast. Any such unit is reported.
  - **H3.**
    - **The open exits.** The open gates from her zone at the start of the step, in gate order.
    - **A choice step.** A step with two or more open exits and no line of flight.
    - **The applied offer.** The Outside offer applied on that step, that is, an `hyst1l:` encounter decided ATTEND and applied.
    - **The first hop.** The target of the first memory event the step writes.
    - **The run's value.** T_excess = (hits − Σ 1/|open|) / eligible steps. If eligible is 0 the value is 0, and this is reported.
- **Order of work.**
  1. Synthetic machinery checks.
  2. The determinism pair (ALL, unit 1).
  3. 12 × the five arms.
  4. The analysis, written as id `analysis`.

## 4. Size and timing
**Size.** Five arms × 12 half-day spans, about 48 ticks each, once through.

**Timing.** The run starts after 17 November 18:00 UTC, when the spans are complete. The job has a 300-minute limit.
