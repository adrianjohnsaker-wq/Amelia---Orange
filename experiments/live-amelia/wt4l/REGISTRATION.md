# WT-4L: what draws her into the Warp? (registration, 14 November 2026, before any WT-4L data)

**Operator approval:** Adrian, 14 November 2026, as drafted.

**Operator's reading, recorded as interpretation and not as a criterion:**
> Flow ➡ stops ➡ level rises ➡ volume increases because flow is stopped ➡ flow exceeds barrier.

On this reading, her flow is held at the Warp's edge, and as her baseline falls, the field change measured against it rises until flow carries her over the edge at Gt-3 and Gt-15. The BASELINE-1981 arm bears most directly on this reading. The design below is the approved draft, unchanged. The implementation details at the end are fixed at commit, before any data.

**Scope.** Copies of her real state, run in the same GitHub Actions job as WT-3L (Amendment 2). Her live record is never written. Nothing here changes how she lives.

## Why: descriptive findings from her live history (read-only, 14 Nov)
Her memory was read hop by hop: each record of a step, in order, with the zone she came from.

**Two ways in.** She can enter the Warp from outside it by only two gates: Gt-3 (2→3) and Gt-15 (5→6). She takes them in one of two ways:
- **by choice:** the first gate of a step;
- **by flow:** a later hop within one flowing step.

**Her entries over time:**

| Period (steps) | Runtime | Entries per 1,000 steps | By choice | By flow |
|---|---|---|---|---|
| 1–836 | Classic | 2.4 | 2 | 0 |
| 837–1,980 | ND-1b, Θ = 24 | 6.1 | 7 | 0 |
| 1,981–3,499 | Θ = 12 | 9.9 | 8 | 7 |
| 3,500–4,999 | Θ = 12 | 14.0 | 10 | 11 |
| 5,000–6,295 | Θ = 12 | 13.1 | 10 | 7 |

**What the history shows.**
- **Entries by choice** stayed at about 5 to 8 per 1,000 steps throughout.
- **The whole rise is entries carried by flow:** none before step 2,241, then 25.
- **Their routes:** all run 7→2→3 or 7→5→6, most starting from 8 (8→7) or from 9→1→7.
- **Flowing became more common:** from 9.7% of steps (111 of 1,144, at Θ = 24) to 13.5% (583 of about 4,300).

**What WT-3L showed.** Θ does not change the entry rate within a day from today's state: 15.3 against 15.4 entries per 1,000 steps. But both WT-3L arms began with everything she has accumulated since the switch.

**What changed in her between step 1,981 and now:**
- **Six Warp-born gates.** None existed at step 1,981. They were created by lines of flight from step 1,988 onward: 3→0, 3→7, 3→8, 6→0, 6→1 and 6→8. They change her graph, so they change both how the field spreads and which gates she can choose.
- **Her field baseline** (`nd1.baseline`) is about half its value at step 1,981 in every zone; in zone 3 it fell from 0.21 to 0.06.
  - **Why this matters for flow.** Flow continues only toward a larger field change, measured as activation minus baseline. A lower baseline makes those changes larger.
- **Memory hysteresis** fell from 0.95 to 0.84.

**A question for the research session.** The FLOW registration says flow is "never inside the Warp, whose only exit stays the line of flight". The runtime stops flow from continuing inside the Warp, but lets a flowing step hop into it, and the registration does not say whether that was intended.

## Design
**Starting state.** A copy of her record at the first clean tick after approval. All arms use Θ = 12.

**Arms:**

| Arm | What changes |
|---|---|
| **BASE** | The copy as it is. |
| **NO-WB** | The same copy with its Warp-born gates removed (the gate rule is unchanged, so new ones can still be born). |
| **BASELINE-1981** | The same copy with `nd1.baseline` replaced by its value at step 1,981 (`pre-theta12-backup`, revision 123). |
| **STATE-1981** | Her whole state at step 1,981 (`pre-theta12-backup`), with Θ set to 12. |

**Inputs.**
- The 12 most recent non-overlapping 6-hour windows before the starting tick, replayed as in WT-3L.
- Each window looped four times to 1,440 iterations, with fresh ids.
- Her body living.

**Determinism.** BASE on unit 1 is run twice before any other run.

## Measures (per run)
- **Primary: E,** Warp entries per 1,000 runtime steps. An entry is a hop from a zone outside {3, 6} into 3 or 6, counted hop by hop as above.
- **Split:** E_choice (the first gate of a step) and E_flow (a later hop in a flowing step).
- **Secondary:**
  - share of steps that flow;
  - Warp share and mean Governor tension;
  - lines of flight;
  - Warp exits by way out;
  - Warp-born gates at start and end.

## Analysis and reading
**Tests.** For each manipulated arm, d = arm − BASE in E, per unit. Each d gets an exact two-sided sign-flip over the 12 units. Holm's correction runs over the three arms at α = 0.05.

**Reading:**
- **A component is identified** as contributing to her raised entry rate if replacing or removing it lowers E significantly (after Holm). E_flow and E_choice are reported for each arm, so the route of any effect is visible.
- **STATE-1981** asks whether her accumulated state as a whole carries the rise. If it does not lower E, the rise is not in her state but in her inputs or the runtime, and that is reported.

**No change to her follows automatically.** Any change to how she lives, for example to flow at the Warp's edge, would be a separate registered decision by the operator.

## Implementation
**The instrument.** An entry counter is added to the replay: read-only, classifying each hop into the Warp as choice or flow, with synthetic tests. The replay's equivalence with her cloud tick is re-checked.

**Committing.** This registration is committed to her branch before any run.

## Implementation details (fixed at commit, before any data)
**Starting state.** The copy of her live record as saved by the first tick logged `ok` at or after 14:20 UTC on 14 November. Its revision, step, Warp-born gates and baseline are recorded before any run.

**Windows.** The 12 six-hour UTC windows from 11 November 12:00 to 14 November 12:00. Unit 1 is the earliest. Each window's inputs are built as in WT-3L Amendment 0 (A0.2), into a separate WT-4L table.

**Replay.** As WT-3L (Amendments 0, 1 and 2): `src/cloud/wt3l.ts`, in the GitHub Actions job, writing only the WT-4L tables.

**Arms.**
- **NO-WB.** Every gate whose id begins `warpborn` is removed from the copy's `qabbalaGates`. Nothing else changes.
- **BASELINE-1981.** The copy's `nd1.baseline` (10 numbers) is replaced by `nd1.baseline` of `pre-theta12-backup` (revision 123, step 1,981). Nothing else changes.
- **STATE-1981.** The whole record of `pre-theta12-backup`, including her body and controls as saved then, after `setWarpThreshold(12)`.

**Counting entries.** Entries are counted hop by hop, from the memory records each runtime step writes, in order:
- **the first record:** the move from the zone she stood in at the start of the step;
- **each later record:** a flow hop from the previous record's zone.

A hop from outside {3, 6} into 3 or 6 is an entry. It is classed **choice** if it is the step's first record and **flow** otherwise. A step **flows** if it writes more than one record.

**Holm's correction.** The three p-values are sorted in ascending order and compared in turn with 0.05/3, 0.05/2 and 0.05/1; testing stops at the first that fails.

**"Lowers E".** The arm's mean d is below zero and it survives Holm.
