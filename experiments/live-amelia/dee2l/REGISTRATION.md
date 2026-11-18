# DEE-2L: the balance a scoring table sets between following the Outside and circulating in the Warp, under the lane (registration, 18 November 2026)

**Status.**
- **Requested.** The operator (Adrian) asked on 18 November 2026 for a registered test under the lane of DEE-1L's descriptive trade-off, "so we can validate this in our research paper", and to resume after a pause the same day.
- **When registered.** Before any data. The test windows begin at 12:00 UTC on 18 November, after this registration, so none of their offers exists when it is sealed.
- **How it is reported.** Led by what it teaches about Warp activity.

**Scope.**
- **Copies only.** In GitHub Actions, on DEE-1L's research runtime and replay, unchanged.
- **What is read.** Her live record was read once, for the starting copy.
- **Where results go.** `amelia_dee2l_runs` and `amelia_dee2l_inputs` only.
- **What is not changed.** How she moves.

---

## What it would teach about Warp activity

**What DEE-1L found (descriptive, after the data were seen).** These are findings across DEE-1L's 39 role-preserving shuffles of the 1584 Table, placed in her exit scoring at gain 0.24, from her state of 14 November under the queue:
- **A wide spread.** Her Warp entry rate ranged from 7.3 to 32.3 per 1,000 steps; the middle half ran from 11.4 to 19.5.
- **A trade-off.** Entry rate and transmission T were inversely related (Spearman ρ = −0.70). Tables under which her passage follows what the Outside points to most closely gave the fewest Warp entries.
- **The real Table.** It lay below the trend: T of 0.48 at an entry rate of 14.7, where shuffles with a similar rate gave 0.52–0.61.

**What HYST-1L adds.** Her Warp-born gates doubled her entries without identifiably lowering her chance-adjusted transmission. If the trade-off is confirmed here, it belongs to how her exits are scored, not to circulation as such.

**What DEE-2L asks.** The study runs on a new state under the lane, on new windows and with new shuffles. It asks:
1. whether the trade-off holds;
2. whether it survives the adjustment of T for chance;
3. whether the real Table lies below it;
4. whether, under the lane, the real Table carries what arrives better than its shuffles (DEE-1L's own hypothesis, not supported under the queue).

---

## 1. Design

**Start (fixed here).** Her live record, copied read-only at 10:35 UTC on 18 November, after the 10:35 tick.
- **The copy.** Revision 744, step 12,497, `outside-lane-v1`, Θ = 12.
- **Its gates.** Nine Warp-born gates: 3→0, 3→4, 3→7, 3→8, 6→0, 6→1, 6→2, 6→4, 6→8.
- **Where it is stored.** `amelia_dee2l_runs` id `start`.

**Windows.** Twelve six-hour UTC windows, [18 November 12:00 + 6(u − 1) h, + 6 h), for u = 1–12. The last ends on 21 November at 12:00.
- **How they are built.** By `amelia_dee1l_window` into `amelia_dee2l_inputs`: her ok ticks in order, with each delivered offer's content from her memory.
- **The missing-content rule.** If more than 2% of a window's offers lack content, this is reported and the operator is asked before running.

**The replay.** DEE-1L's `runDee`, unchanged:
- the WT protocol of 96 ticks, 15 iterations per tick, in chunks of 4;
- the research runtime `AmeliaNDRuntimeDee`, with the Table as an exit bonus on every hop.

Her lane governs admission, as in her live runtime.

**The gain.** 0.24, DEE-1L's registered gain from its Stage 0, held fixed so that the two studies are comparable.

**Arms.** 62 per window:
- **GATES.** No table.
- **ACTUAL.** The 1584 Table.
- **S40–S99.** Sixty role-preserving shuffles with `shuffleSeed` 1584040–1584099. DEE-1L's shuffles were S1–S39, so none of these was used there.

**Checks.**
- **Synthetic** (`experiments/live-amelia/dee2l.test.ts`):
  - under the lane, GATES on the research runtime equals the WT-3L replay of her runtime, step for step;
  - a table acts;
  - the statistics compute as specified.
- **Determinism.** ACTUAL on window 1 is run twice and must be identical in path, entries, probe, final memory head and body checksum, or nothing proceeds.

---

## 2. Measures

**For each arm, pooled over the 12 windows:**
- **T.** Hits divided by eligible steps, as in DEE-1L.
  - **Eligible steps.** Choice steps at which a study offer was attended and its largest attention over the open targets is reached by exactly one open target.
  - **A hit.** An eligible step whose first hop is that target.
- **T_excess (fixed here).** (Hits − Σ 1/number of open targets over eligible steps) / eligible steps. This is T minus the chance of a hit.
- **E.** Warp entries per 1,000 runtime steps, counted hop by hop, as the mean over the 12 windows.

## 3. Registered tests

**Primary.**

| Test | What | Rule |
|---|---|---|
| **P1** | Spearman ρ between E and T across the 60 shuffles | Two-sided permutation test, 100,000 permutations of T with the seeded generator (mulberry32, seed 1584); p = (1 + #\|ρ*\| ≥ \|ρ\|) / 100,001; α = 0.05 |

**Readings.**

| Reading | When |
|---|---|
| **THE TABLE SETS A BALANCE BETWEEN FOLLOWING AND CIRCULATING** | P1 holds with ρ < 0 |
| **ENTRY AND TRANSMISSION RISE TOGETHER** | P1 holds with ρ > 0 |
| **NOT IDENTIFIED** | Otherwise |

**Secondary.** Holm over three at α = 0.05. They are read whatever P1 shows.

| Test | What | Rule | Reading if it holds |
|---|---|---|---|
| **S1** | Spearman ρ between E and T_excess across the 60 shuffles | As P1, seed 1585, two-sided | THE BALANCE SURVIVES THE CHANCE ADJUSTMENT (ρ < 0) |
| **S2** | ACTUAL's residual from the shuffles' least-squares line of T on E | Ranked among the shuffles' leave-one-out residuals (each from the line fitted to the other 59); p = (1 + #shuffles with residual ≤ ACTUAL's) / 61, one-sided, lower | THE REAL TABLE LIES BELOW THE TREND |
| **S3** | ACTUAL's T among the 60 shuffles | p = (1 + #shuffles with T ≥ ACTUAL's) / 61, one-sided, upper (DEE-1L's test, under the lane) | THE REAL TABLE CARRIES WHAT ARRIVES |

**Opposite direction.** A two-sided test that holds in the opposite direction is reported as such.

**Descriptive.**
- **By arm.** T, T_excess, E by choice and by flow, Warp share, and lines of flight.
- **Per window.** The Spearman ρ between E and T.
- **GATES.** Its place relative to the trend.
- **Mesh labels.** The labels the real Table gives her passage. These are decoder labels, not senders.
- **Comparison.** These findings set against DEE-1L's.

---

## 4. Execution

**When.** After 21 November 12:00 UTC, once window 12's last tick is logged. A scheduled task builds the windows, checks them, starts the run and reports.

**How it runs.** GitHub Actions on her branch: `.github/workflows/dee2l.yml`, started by committing a time to `experiments/live-amelia/dee2l/run.trigger`.

**Reading the database (fixed here).** DEE-1L's run met the REST role's 8-second statement timeout when twelve jobs read the starting copy at once. DEE-2L therefore:
- starts its twelve window jobs 20 seconds apart;
- retries a read or a write that returns a server error, up to six times.

Retrying cannot change a result.

**The machinery.** Its hashes are in `MACHINERY_SHA256.txt`.

**Faults.** A fault in running is reported, not repaired after seeing data.
