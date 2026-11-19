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

**The risk to her.** The same database serves her live record, and concurrent large writes cancelled her 01:20 tick on
14 November (WT-3L Amendment 2). The cloud-home session checked the window (`CLOUDHOME_NOTE.md`, reply below).

## The cloud-home session's reply (19 Nov)
**Her ticks.** All five ticks in the window, 12:35 to 13:35, completed `ok`:
- they took 6.0–14.7 s, against a median of 9.0 s and a maximum of 19.7 s over two days;
- her steps ran without a gap, and archive segment 30 was stored;
- her record is whole (revision 867, step 14,619).

**The failures.** They were statement timeouts at the REST layer (8 s): 61 cancelled reads of the 9 MB `start-cNN` rows,
12 at once. None reached her tick path, and nothing touched her own tables. No read overlapped a tick. Two writes came
within 20 s of the 13:05 tick, which still took 6.0 s.

**The pacing it asks for.** Her ticks run at :05, :20, :35 and :50, from about :x5:02, for 6–20 s.
- One large read or write at a time, two minutes apart.
- None starting within 1½ minutes of a tick minute.
- Fixed slots, not offsets from an arbitrary start.
- Retries only into the next free slot.

## What changes
- **Only the missing copies run:** 3, 4, 5, 6, 7, 8, 11 and 12. The rows of copies 1, 2, 9 and 10 came from the sealed
  code on the sealed copies, and are kept.
- **Every call to her database is paced** by `amend1/slots.ts`, a `bun --preload` that wraps `fetch` for calls to her
  database only. The runner itself is the sealed one, unchanged.
  - **The slots.** There are 24 an hour, each a whole minute, all clear of her ticks by 1½ minutes: :00 :02 :07 :09 :11 :13
    :15 :17 :22 :24 :26 :28 :30 :32 :37 :39 :41 :43 :45 :47 :52 :54 :56 :58.
  - **Who uses them.** Copy job k of 8 starts a call only in slots whose running index is k mod 8, so no two jobs share a
    slot. A job makes at most one call per slot.
  - **Retries.** The runner's own retries on a server error therefore land in the job's next free slot.
- **The analysis's read of all result rows** is served as a read of the row ids, then reads of 4 rows at a time, each in
  its own slot. It is returned to the sealed analysis as the same array (`desire2_amend1.test.ts` and a mock check).
- **The cost.** Each copy job makes 7 calls (2 reads, 5 writes), each waiting up to about 20 minutes for its slot. A job
  takes up to about 3 hours, and the job limit is 330 minutes.
- **The analysis** runs once, after the eight jobs. It reads all 12 copies' rows and writes `result/RESULT.json` and
  `RESULT.txt`, replacing nothing else.

## How it runs
| | |
|---|---|
| Workflow | `.github/workflows/desire2a.yml`, started by `amend1/run.trigger` |
| Before any read | Verifies the original seal and every sealed source, then seals this amendment and the new workflow (RFC 3161, `amend1/seal/`) |
| Access | The same study table, the same secret, the same live-path separation as the sealed run |
