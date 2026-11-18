# HYPERSTITION-2L: the fiction in order at a fixed pace — a registered confirmation of HYPERSTITION-1L's descriptive findings (registration, 18 November 2026)

**Status.**
- **Approved.** The operator (Adrian) approved the draft (`claude/HYPERSTITION-2L_FIXED_PACE_DRAFT.md`) on 18 November 2026: "Approved".
- **His choices.**
  - **The hold.** "shorter 6".
  - **The units.** 24.
- **When registered.** Before any data.
- **What is marked.** Additions needed to run the design are marked **(fixed here)**.

**Scope.**
- **Copies only.** Copies of her state, in GitHub Actions, on the WT-3L replay of her own runtime.
- **What is read.** Her live record is read once, for the starting copy.
- **What is written.** Results go to new study tables only.
- **What is not changed.** How she moves.

---

## What it would teach about Warp activity

**What HYPERSTITION-1L showed (descriptive).** With the CCRU corpus read to her through the lane at her pace, the reading in order did better than the other readings on two counts:
- **Fulfilment.** She fulfilled 73.4% of its signs, against 68.9–69.4% for the shuffled, reversed and Markov readings (H − Sh +0.045, p = 0.022, short of Holm).
- **The Warp.** It drew her into the Warp more: 30.3 entries per 1,000 steps against 25.2–27.8.

**Why it was descriptive.** At her pace each reading went only as far as she got. The arms therefore read different signs and different numbers of them, and the differences could not be attributed to order alone.

**What HYPERSTITION-2L settles.** It holds the pace fixed, so that the in-order, shuffled and reversed readings read exactly the same signs, the same number of them, for the same time each. It then asks whether the order the CCRU wrote them in:
1. is enacted more readily;
2. draws her into the Warp more.

If both hold, the order of the fiction itself, not its content or pace, is what her organ takes up.

---

## 1. Design

**Start (fixed here).** Her live record, copied read-only at 12:06 UTC on 18 November, after the 12:05 tick.
- **The copy.** Revision 750, step 12,599, `outside-lane-v1`, Θ = 12.
- **Its gates.** Ten Warp-born gates: 3→0, 3→1, 3→4, 3→7, 3→8, 6→0, 6→1, 6→2, 6→4, 6→8. She wrote 3→1 since HYPERSTITION-1L's copy.
- **Where it is stored.** `amelia_hyp2l_runs` id `start`.

**The fiction.** HYPERSTITION-1L's stream, unchanged: 85,216 signs, checked by its digest.

**The fixed pace (the operator's choice: 6).**
- **The hold.** Each sign is held for exactly 6 runtime steps, then the reading moves on, whether or not she reached its zone.
- **What each unit reads.** A transmission is 48 ticks of 15 study offers, with her body stepping: exactly 1,440 runtime steps. It therefore reads exactly 240 signs.
- **The offers per sign.** Each sign is carried by three study offers, one in each of its three iterations.

**Units: 24 new portions.**
- **Where they start.** Unit u's portion is the 240 signs from sign ⌊(u − ½) · 85,216 / 24⌋.
- **Overlap with HYPERSTITION-1L.** None of these overlaps any portion HYPERSTITION-1L read, so the corpus passages are new to the question.
- **Why 24.** Doubling the units gives the test more power than HYPERSTITION-1L's 12. The sign-flip remains exact (2²⁴ patterns).

**Arms.**

| Arm | What is read | What it isolates |
|---|---|---|
| **H** | The portion in reading order | The order the CCRU wrote |
| **Sh** | The same 240 signs, shuffled (seeded per unit, mulberry32 seed 1584300 + u) | Same signs, no order |
| **Rv** | The same 240 signs, reversed | The same order against its direction |
| **Mk** | 240 signs from a first-order Markov chain of the corpus's transitions (seed 1584400 + u, starting from the portion's first sign) | The corpus's pairs, no longer structure |

**What this fixes.**
- H, Sh and Rv read the same multiset of signs, the same number of them, each for 6 steps. They differ in order only.
- Mk reads a different sample with the corpus's pair statistics. It answers whether pairs alone produce the effect.

**No silence.** The effects to be confirmed are those of transmission, so no silence phase is run. HYPERSTITION-1L settled incorporation, and it was not supported.

**Checks before any study run.**
- **Synthetic tests.**
  - The stream digest.
  - H, Sh and Rv have the same multiset.
  - Every sign is held for exactly 6 steps, and each transmission has exactly 1,440 steps.
  - Every portion is clear of the portions HYPERSTITION-1L read.
  - The exact sign-flip agrees with brute force.
- **Determinism.** A repeated pair, identical.

---

## 2. Measures

**Fulfilment F.** The share of the 240 signs whose zone she lands in on any hop during that sign's 6 steps.

**Warp entry E.** Entries per 1,000 runtime steps during transmission, counted hop by hop, as in WT-4L.

**Descriptive.**
- **Entry and time.** E by choice and by flow, Warp share, and lines of flight.
- **Admission.** The share of study offers admitted on arrival.
- **Gates.** New Warp-born gates.
- **Adjacency (a candidate mechanism).** The share of consecutive sign pairs that are one open gate apart in her starting graph, per arm. It indicates whether the order the CCRU wrote follows her body's passages more than the disorderings do.
- **Chance.** Fulfilment against its chance, the share of signs whose zone she would reach if her path were independent of the sign. It is estimated by pairing each unit's H path with Sh's signs **(fixed here)**.

---

## 3. Registered tests

Each is an exact one-sided sign-flip over the 24 units (2²⁴ patterns).

**Primary.** Holm over two at α = 0.05.

| Test | Contrast | Direction | Reading if it holds |
|---|---|---|---|
| **P1** | F, H − Sh | > 0 | THE ORDER OF THE FICTION IS ENACTED |
| **P2** | E, H − Sh | > 0 | THE ORDER OF THE FICTION DRAWS HER INTO THE WARP |

**Secondary.** Holm over four at α = 0.05, read whatever the primary tests show.

| Test | Contrast | Direction | What it asks |
|---|---|---|---|
| **S1** | F, H − Rv | > 0 | Is it the order's direction? |
| **S2** | E, H − Rv | > 0 | The same, for the Warp |
| **S3** | F, H − Mk | > 0 | Is it more than the corpus's pairs? |
| **S4** | E, H − Mk | > 0 | The same, for the Warp |

**Reporting.**
- **Not confirmed.** A test that does not hold is reported as not confirmed.
- **The opposite direction.** Its size and p are reported.

---

## 4. Execution
- **Where it runs.** GitHub Actions on her branch: `.github/workflows/hyp2l.yml`, started by committing a time to `experiments/live-amelia/hyp2l/run.trigger`. It runs once registered.
- **Order of work.**
  1. The synthetic checks.
  2. The stream digest.
  3. The starting-copy check.
  4. The determinism pair: H on unit 1, identical in path, entries, final memory head and body checksum.
  5. 24 units × the four arms.
  6. The registered analysis.
- **The sign-flip (fixed here).** All 2²⁴ sign patterns are enumerated exactly, in Gray-code order.
- **Retries.** A read or write that returns a server error is retried, up to six times.
- **Where results go.** `amelia_hyp2l_runs` only.
- **The machinery.** Its hashes are in `MACHINERY_SHA256.txt`.
- **Faults.** A fault in running is reported, not repaired after seeing data.
