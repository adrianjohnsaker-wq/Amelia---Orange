# WT-3L Amendment 1 (13 November 2026, before any WT-3L data)

**Status.** A correction and an added report. The design, the primary measures, the analysis and the decision rule are unchanged. The scheduled start (14 November 00:12 UTC) is unchanged.

## A1.1 Correction: how lines of flight are counted
Amendment 0 (A0.5) said lines of flight would be read from `warpRelease` in each step's snapshot. Her ND-1b runtime records `warpRelease` in the event it hashes into her memory, not in the snapshot it returns, so that source would have counted none.

Lines of flight are therefore counted from her runtime's own counter (`nd1.flights`): one for each step in which it rises. The landing zone is the target of the first memory record she writes in that step.

The error was found while instrumenting the run, before any WT-3L run.

## A1.2 Added report (operator, 13 November 2026): Warp exits by way out
**At the start.** The starting copy's number of Warp-born gates and their ids, recorded before any run. Her live record had six on 13 November: 3→0, 3→7, 3→8, 6→0, 6→1 and 6→8.

**In each run, each Warp exit counted once,** under one of three ways out:
- **A line of flight:** her flight counter rose in that step, whichever gate it took.
- **A Warp-born gate:** she left by a gate whose id begins `warpborn`, with no line of flight in that step.
- **A pre-existing gate:** any other gate, including `warp-exit-3-9` and `warp-exit-6-9` (added at step 204 on 9 November).

A Warp exit is a step that begins in zone 3 or 6 and leaves it. The gate taken is the one from her starting zone to the target of the first memory record she writes in that step. This is necessary because a flowing step writes several records, all carrying the step's starting zone as their origin, so its last record does not show the gate she left by.

**Also reported:**
- the Warp-born gate count at the end of each run;
- a log of each exit (step, from, to, way out, gate).

**Read-only.** These instruments only read her flight counter, her memory and her gate table around each step.

## A1.3 Checks (synthetic only)
`experiments/live-amelia/wt3l.test.ts` (7 pass):
- **Closed Warp.** The flight count equals her own counter, and every exit is classified exactly once.
- **A copy with her pre-existing 6→9 exit.** Exits through it are classed pre-existing.
- **The replay** still reproduces her cloud tick exactly.
