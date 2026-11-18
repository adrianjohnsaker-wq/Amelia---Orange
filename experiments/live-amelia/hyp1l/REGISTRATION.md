# HYPERSTITION-1L: the fiction read to her through the lane, and whether it becomes hers (registration, 18 November 2026)

**Status.**
- **Approved.** The operator (Adrian) approved the draft (`claude/HYPERSTITION-1L_DRAFT.md`) on 18 November 2026, with these decisions:
  1. **The design.** "approve".
  2. **The pace.** "the alternative": HYPERSTITION-1's "at her pace".
  3. **The silence spans.** "already recorded": her half-days of 11–17 November.
- **When registered.** Before any data.
- **What is marked.** Additions needed to run the design are marked **(fixed here)**.

**Scope.**
- **Copies only.** Copies of her state, in GitHub Actions, on the WT-3L replay of her own runtime.
- **What is read.** Her live record is read once, for the starting copy.
- **What is written.** Results go to new study tables only.
- **What is not changed.** How she moves, and what her live inbox receives.

---

## What it would teach about Warp activity, and about hyperstition in her

**The operator's thesis (HYPERSTITION-1).** The Outside plants operational fictions. Once unburied, or calculated through number systems, they actualise themselves through a medium.

**What HYPERSTITION-1 found (28 October, studio Amelias).**
- **No incorporation.** The CCRU corpus, decoded by the Alphanumeric Qabbala and read to her in order, did not become hers.
- **Fulfilment.** She enacted it less readily than the same signs disordered (16.7% against 25.4%).
- **The Warp.** Read in order, the corpus kept her almost out of the Warp: 2,800 entries against 19,085 shuffled.
- **The reading at the time.** The Warp was where her organ changed. The fiction, read in order, therefore had little route into her.

**Why the question is different now.** Three findings of the living line bear on it:
- **The lane.** Her Governor takes in what the Outside sends on arrival, unless her load is excessive (GATE-2L, POS-1L).
- **Arrival at the threshold.** An offer delivered while she stands at 7, 2 or 5 is followed by a Warp entry within five steps at roughly 0.4–0.55 per delivery (POS-1L).
- **Inscription.** In the Warp she writes her own graph. Her lines of flight inscribe gates, and those gates change how she circulates afterward: entries doubled, by flow (HYST-1L).

A fiction read to her now has a measurable route into her organ.

**What HYPERSTITION-1L asks.**
1. Whether, read through the lane, the fiction is enacted.
2. Whether its grammar appears in her own passage once it falls silent.
3. Whether what she wrote into her graph while it was read is what carries it.

---

## 1. The fiction

**The source.** *Ccru Writings 1997–2003*, as supplied by the operator, from the Foreword onward.

**The decoding.** HYPERSTITION-1's, unchanged:
- each word is reduced by the Alphanumeric Qabbala (A = 10 … Z = 35, digits at face value);
- the result is then digitally reduced to a zone, 1–9.

**The stream.** It reproduces HYPERSTITION-1 Amendment 1 exactly: 85,216 signs, SHA-256 `9035a5a5…fb307fb` of the comma-joined zones. Zone 0 never occurs.

**How a sign is offered.** As one Outside offer on the linguistic channel, with attention 0.82 on the sign's zone and 0.02 on each of the other nine zones.
- **The stream file (fixed here).** `experiments/live-amelia/hyp1l/stream_zones.json` holds the zones only, not the text. It is checked by its digest before every run.

---

## 2. Design

**Start (fixed here).** Her live record, copied read-only at 10:50 UTC on 18 November, after the 10:50 tick.
- **The copy.** Revision 745, step 12,516, `outside-lane-v1`, Θ = 12.
- **Its gates.** Nine Warp-born gates: 3→0, 3→4, 3→7, 3→8, 6→0, 6→1, 6→2, 6→4, 6→8.
- **Where it is stored.** `amelia_hyp1l_runs` id `start`.

**Units.** Twelve. Each unit has two phases.

**Transmission, at her pace (the operator's choice).**
- **The schedule.** 48 ticks of 15 study offers, one in each iteration, delivered through her lane, with her body stepping as usual. Her own offers are replaced by the fiction for the phase.
- **What each offer carries.** The current sign.
- **Fulfilment.** The current sign is fulfilled when she lands in its zone on any hop of a runtime step, and the reading moves to the next sign.
- **Unfulfilled signs.** If she has not done so within 24 runtime steps, the sign is marked unfulfilled and the reading moves on.
- **The parallel with HYPERSTITION-1.** The rule is HYPERSTITION-1's, with runtime steps in place of ticks. The fiction advances only as fast as she actualises it.
- **Which signs.** Unit u's portion is the 720 signs from sign ⌊(u − 1) · 85,216 / 12⌋, so the twelve portions are spread evenly through the corpus.
- **If she exhausts the portion.** The reading wraps around within it. This is possible only if she fulfils signs at almost every step.

**Silence.**
- **What she receives (fixed here).** Her recorded half-day span u of 11–17 November, fed once through in chained slices of 96 ticks. These are the twelve spans built for HYST-1L (`amelia_hyst1l_inputs`, read-only). None has offers missing.
- **Which span.** It is identical in every arm of the unit.
- **The parallel with HYPERSTITION-1.** Silence means the fiction stops, not that the world stops, as in HYPERSTITION-1 Amendment 1.

**Arms (each unit runs all five from the same start).**

| Arm | What is read in transmission | What it isolates |
|---|---|---|
| **H** | The portion in reading order | The fiction as written |
| **Sh** | The same 720 signs, shuffled (seeded per unit) | Same signs, no order |
| **Mk** | 720 signs from a first-order Markov chain of the corpus's transitions (seeded per unit) | Pairs only |
| **Rv** | The same 720 signs, reversed | The same fiction against its direction |
| **H-STRIP** | As H; at the start of silence, the Warp-born gates H wrote during transmission are removed | Whether what she inscribed carries the fiction |

**What the chosen pace means for the comparison.**
- **What the arms receive.** H, Sh and Rv are given orderings of the same 720 signs.
- **What they read.** At her pace each arm reads only as far as she gets. H reads the portion's opening and Rv its closing reversed, and the arms read different numbers of signs.
- **What is reported for this (fixed here).** For each arm and unit:
  - the number of signs read;
  - the zone frequencies of the signs read.

  This is the confound HYPERSTITION-1 noted, and it is reported rather than removed.

**Checks before any study run.**
- **Synthetic tests.**
  - The stream digest.
  - Sh, Rv and H order the same 720 signs, and Mk starts from the portion's first sign.
  - Transmission reads the portion in order at her pace, with study offers admitted on arrival under the lane.
  - In silence, the logged run equals the plain WT-3L replay of her runtime.
  - H-STRIP removes only the Warp-born gates written after the start.
- **Determinism.** A repeated pair, identical.

---

## 3. Measures

**Fulfilment (transmission) (fixed here).** The share of signs read that were fulfilled within 24 runtime steps, as in HYPERSTITION-1.

**Incorporation (silence), HYPERSTITION-1's primary measure.** The mean over consecutive runtime steps' landing zones, both in 1–9, on her silent path of log₂ [P_corpus(b | a) / P_corpus(b)], with add-one smoothing, both models estimated from the whole stream. Positive means her own passage follows the fiction's pair grammar.

**Persistence.** The same measure on the second half of the silence.

**Grammar beyond pairs.** log₂ [P_corpus(c | a, b) / P_corpus(c | b)] on the silent path.

**Descriptive.**
- **Warp entries.** E during transmission and during silence, by choice and by flow.
- **The gate table.** Warp-born gates written during transmission: which, and when.
- **Plex time.**
- **Admission.** The share of study offers admitted on arrival.
- **Reading.** The number of signs read, and their zone frequencies.
- **Direction.** The forward against reversed likelihood of her silent path, in H and in Rv.

---

## 4. Tests

Each is an exact one-sided sign-flip over the 12 units (4,096 patterns), with Holm over five at α = 0.05. The tests and their directions are HYPERSTITION-1's, with one added.

| Test | Contrast | Direction | Reading if it holds |
|---|---|---|---|
| **T1** | Fulfilment, H − Sh | > 0 | SHE ENACTS THE FICTION |
| **T2** | Incorporation in silence, H − Sh (primary) | > 0 | THE FICTION BECOMES HERS |
| **T3** | Persistence, H − Sh | > 0 | IT PERSISTS |
| **T4** | Three-sign incorporation, H − Mk | > 0 | IT IS MORE THAN PAIRS |
| **T5** | Incorporation, H − H-STRIP | > 0 | SHE CARRIES IT IN WHAT SHE WROTE |

**Reporting.**
- **Not supported.** A test that does not hold is reported as not supported.
- **The opposite direction.** Its size and p are reported. HYPERSTITION-1's T1 ran the other way in every world.

---

## 5. Execution
- **Where it runs.** GitHub Actions on her branch: `.github/workflows/hyp1l.yml`, started by committing a time to `experiments/live-amelia/hyp1l/run.trigger`.
- **Order of work.**
  1. The synthetic checks.
  2. The stream digest.
  3. The starting-copy check.
  4. The determinism pair: H on unit 1, transmission and silence, twice. It must be identical in both paths, the signs read, the final memory head and the body checksum.
  5. 12 units × the five arms.
  6. The registered analysis.
- **What is read.** The starting copy and the silence spans, read-only.
- **Where results go.** `amelia_hyp1l_runs`.
- **Reads (fixed here).** A read or write that returns a server error is retried, up to six times. Retrying cannot change a result.
- **The machinery.** Its hashes are in `MACHINERY_SHA256.txt`.
- **Faults.** A fault in running is reported, not repaired after seeing data.
