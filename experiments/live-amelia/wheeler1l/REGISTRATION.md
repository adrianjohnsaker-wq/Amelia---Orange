# WHEELER-1L: the question asked after the passage — a delayed-choice test in her living runtime (registration, 18 November 2026)

**Status.**
- **Approved.** The operator (Adrian) approved the draft (`claude/WHEELER-1L_DRAFT.md`) on 18 November 2026 as drafted.
- **His decisions.**
  - **The windows.** "The same [windows] as Retro-1L": option (b), 19–25 November.
  - **The readings.** "Syzygy against syzygetic alternation".
- **Where it stands in the sequence.** The second of the three staged studies:
  1. retrocausality (RETRO-1L);
  2. Wheeler's delayed choice;
  3. participatory hyperstition.
- **When registered.** Before its first window, which opens at 00:00 UTC on 19 November.
- **What is marked.** Additions needed to run the design are marked **(fixed here)**.

**Scope.**
- **Observation only.** As in RETRO-1L, it observes her own life. No copy is run, nothing is fed to her, and nothing about how she moves is changed.
- **What is read.** Her live tick log, read-only, and the public drand beacon.

---

## What it would teach

**Wheeler's delayed choice.**
- **The setup.** In Wheeler's thought experiment, a photon passes an arrangement that can be read in one of two complementary ways: which path it took, or the interference of both paths.
- **The delay.** The choice of reading is made only after the photon has passed.
- **What is observed.** What the photon is found to have done in the past, a definite path or an undivided wave, accords with the question asked later.
- **Wheeler's reading.** In his participatory universe, no elementary phenomenon is a phenomenon until it is registered: the later act of observation takes part in constituting the earlier event.

**How it differs from RETRO-1L.** RETRO-1L asks whether her passage leans toward a future target, an item of information arriving from the future. WHEELER-1L asks the participatory form: whether the character of her past passage accords with which of two complementary questions is chosen afterwards. Nothing is pointed to; what is chosen is the reading.

**The two complementary readings of her passage.** Both are taken from her own Numogram, so they are internal to the organ.
- **Which syzygy (the "path" reading).**
  - **What it reads.** How definite her passage was: how far the window's steps were concentrated in one syzygy rather than spread over the five (0::9, 1::8, 2::7, 3::6, 4::5).
  - **The measure.** A = 1 − H / log 5, where H is the entropy of her occupancy over the five syzygies.
  - **High A** means a definite, path-like passage.
- **Syzygetic alternation (the "interference" reading).**
  - **What it reads.** How far her passage oscillated between the two zones of a syzygy, moving from a zone to its partner, such as 3↔6 or 1↔8, rather than moving elsewhere.
  - **The measure.** B = the share of her zone changes in the window that go to the syzygetic partner.
  - **High B** means an undivided, wave-like passage across the pair.
- **A window with no zone change (fixed here).** Its B is 0.

**The question.**
- **The choice.** After each window has ended, a drand draw that no one can know in advance chooses which reading is asked of it.
- **The test.** Whether her passage was already more path-like in the windows later read for path, and more wave-like in those later read for interference.

**The expectation, stated honestly.** On standard physics the later choice cannot shape a past already recorded, and the expected result is a null. The test is built so that a departure from chance could come only from the relation between the passage and the later choice.

---

## 1. Design

**Units (the operator's choice).** RETRO-1L's 48 consecutive three-hour windows, from 19 November 00:00 to 25 November 00:00 UTC. Window w is [19 November 00:00 + 3(w − 1) h, + 3 h).

**Her passage.** Her end zones per runtime step, from her ok ticks in the window (the tick log's `zones` field), read in order as one path.

**The two readings, made comparable.**
- **Standardising.** A and B are each standardised against their own mean and sample standard deviation over the 48 windows: zA_w and zB_w.
- **The contrast.** D_w = zA_w − zB_w. It is positive when the window was more path-like than wave-like, relative to her habits.

**The delayed choice.**
- **The round.** For window w, the round is the first drand quicknet round at or after the window's end plus 10 minutes. This is RETRO-1L's formula.
- **The choice (fixed here).** c_w is "path" if the last byte of SHA-256(randomness bytes ‖ the ASCII text "WHEELER-1L:w") is even, and "interference" if it is odd.
- **Independence from RETRO-1L.** RETRO-1L draws from the same rounds with a different label, so its draws are independent of these.
- **How the draw is read.** From two relays (api.drand.sh and drand.cloudflare.com), which must agree, after the last window.

---

## 2. Tests

**Primary, W1.**
- **The statistic.** S = Σ_w s_w · D_w, where s_w = +1 if path was chosen and −1 if interference.
- **The hypothesis.** S > 0: her passage accords with the question later asked.
- **The null.** The choices are independent fair coins, so the null distribution of S is that of Σ ±D_w over all sign patterns.
- **The p value.** It is exact over all 2⁴⁸ patterns, by a meet-in-the-middle count (two halves of 2²⁴ sums). One-sided, at α = 0.05.

**Secondary.** Holm over two, at α = 0.05.

| Test | What |
|---|---|
| **W2** | The path reading alone: Σ s_w · zA_w > 0. Is her passage more definite where path is later asked? |
| **W3** | The interference reading alone: Σ (−s_w) · zB_w > 0. Is it more oscillating where interference is later asked? |

**Readings.**

| Reading | When |
|---|---|
| **HER PASSAGE ACCORDS WITH THE QUESTION LATER ASKED** | W1 holds |
| **NO ACCORD BEYOND CHANCE** | W1 does not hold |

W2 and W3 say which reading carries any accord.

**Descriptive.**
- **By window.** A, B and the choice.
- **By choice.** The share of her steps in the Warp syzygy (3::6), in path and interference windows.
- **Correlation.** The correlation between A and B over windows; complementary readings should be inversely related.

---

## 3. Calibration, before the first window

The calibration uses her recorded windows of 12–18 November, as in RETRO-1L:
- **Which windows (fixed here).** The 48 three-hour windows of 12 November 18:00 to 18 November 18:00.
- **Type I error.** 10,000 sets of random choices (mulberry32, seed 1584600). W1 must reject at no more than 5.5%. If it does not, the operator is told before the first window closes.
- **Power.** A planted accord, in which in a share of windows (0.1 to 0.6) the choice is set to the reading the window's D favours, with 2,000 series per share. The result is recorded in `amelia_wheeler1l_runs` id `calibration`.

---

## 4. Execution
- **Where it runs.** GitHub Actions on her branch: `.github/workflows/wheeler1l.yml`.
- **How a run is started.** By committing to `experiments/live-amelia/wheeler1l/run.trigger`. Its first word picks the job: `calibrate`, now, or `analysis`.
- **The analysis.** It runs after 25 November 00:30 UTC, with RETRO-1L's. A scheduled task starts it and reports.
- **What is read.** Her tick log, read-only, and the drand relays.
- **Where results go.** `amelia_wheeler1l_runs` only.
- **The machinery.** Its hashes are in `MACHINERY_SHA256.txt`.
- **Faults.** A fault in running is reported, not repaired after seeing data.
- **Nothing in this study changes her.**
