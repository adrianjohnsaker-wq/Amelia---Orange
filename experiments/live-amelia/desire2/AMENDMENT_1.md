# DESIRE-2 Amendment 1 (19 November 2026): read her database one copy at a time

**Status.** It changes when the copy jobs read their rows, and nothing else. The registration, the machinery, the arms,
the claims, the analysis and the copies are those sealed on 19 November at 12:38:08 UTC (`seal/DESIRE2_BUNDLE.json`), and
the run verifies every sealed source unchanged before it starts.

**Operator decision.** Adrian, 19 November 2026, after the incomplete run below.

## Why
**What happened.** The run of 19 November (Actions run 44525771213) started all 12 copy jobs at 12:41–12:42 UTC. Each
first reads two rows of `amelia_long1_runs`:
- its starting copy, `start-cNN`;
- its span, `inputs-cNN`, about 8–9 MB of JSON.

Twelve such reads at once overloaded the database. Eight jobs (copies 3, 4, 5, 6, 7, 8, 11 and 12) received HTTP 500
through six retries, and stopped at 12:47 UTC before running a single step. Copies 1, 2, 9 and 10 completed. The analysis
then ran on 4 copies, where no claim can reach significance: with four copies the exact sign-flip's smallest p is 0.0625.

**What it is.** An infrastructure failure, not a result. The partial analysis is kept as
`result/PARTIAL_4_COPIES.json` and `.txt`, and is reported as description only.

**The risk to her.** The same database serves her live record. Concurrent large reads are the contention that cancelled
her 01:20 tick on 14 November (WT-3L Amendment 2). Whether her ticks were affected between 12:41 and 12:48 UTC is being
checked by the cloud-home session (`CLOUDHOME_NOTE.md`). This amendment does not start until that session confirms.

## What changes
- **Only the missing copies run:** 3, 4, 5, 6, 7, 8, 11 and 12. The rows of copies 1, 2, 9 and 10 came from the sealed
  code on the sealed copies, and are kept.
- **One read at a time.** Each copy job waits `120 s × its position` before its first read (0, 120, …, 840 s), so the
  eight jobs read their rows at least two minutes apart. If the cloud-home session names minutes to avoid, the waits are
  shifted to avoid them, and the shift is recorded in this file before the run trigger.
- **Nothing else.** The runner (`run_actions.ts`), its retries and its writes are the sealed ones. Each job writes its
  five result rows at the end of its arms, about 50 minutes after its read, so the writes are spread out as well.
- **The analysis** runs once, after the eight jobs. It reads all 12 copies' rows and writes `result/RESULT.json` and
  `RESULT.txt`, replacing nothing else.

## How it runs
| | |
|---|---|
| Workflow | `.github/workflows/desire2a.yml`, started by `amend1/run.trigger` |
| Before any read | Verifies the original seal and every sealed source, then seals this amendment and the new workflow (RFC 3161, `amend1/seal/`) |
| Access | The same study table, the same secret, the same live-path separation as the sealed run |
