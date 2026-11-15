# WT-5L result: the replay reproduces her; the protocol does not raise her entries; the content of recent inputs is not identified (15 November 2026)

**Registered readings.**
- **A1: FAITHFUL.**
- **A2: the protocol does not raise the rate** (+0.50 per 1,000, against a threshold of 2.0).
- **B: NOT IDENTIFIED** (mean d = +0.98 per 1,000, p = 0.47).

A1 is faithful, so B bears on her live rise. It finds that the content of what has arrived since the switch does not carry the rise.

## How it was run
**The run.** GitHub Actions run 43703722128 used the registered code (`MACHINERY_SHA256.txt`). Its synthetic checks (4 tests) passed first.

**The starting state.** Her `pre-switch-backup` (revision 57, step 837) converted to ND-1b through her own tick's code path, with zero steps: Θ = 24, step 837.

**Inputs.**
- **Pre-switch.** Her 65 ok ticks of 11 November (00:55:59 to 17:20), with 169 offers and none missing.
- **Recent.** The 12 six-hour windows of 12–14 November, with 557 offers and none missing.

**Her live record.** Steps 838–1,981, all present in her archived memory.

**What was not touched.** Her live record and archive were read only, never written.

**Determinism.** Unit 1 POST, run twice, was identical: path, entries, flow steps, final memory digest and body checksum.

## A1: fidelity
| | Her live record | The replay |
|---|---|---|
| Steps | 1,144 | 1,144 |
| Zone path | — | identical on all 1,144 steps |
| E (entries per 1,000 steps) | 6.12 (7 by choice, 0 by flow) | 6.12 (7 by choice, 0 by flow) |
| Warp share | 7.34% | 7.34% |
| Lines of flight | 1 (to 9) | 1 (to 9) |

**Reading.** FAITHFUL: the zone path is identical on every step.
- **What it shows.** Today's code, driven by her recorded ticks and offers from her state at the switch, lives her eleventh of November exactly.
- **What follows.** The replay is sound. The rates measured in WT-3L and WT-4L are properties of her dynamics under those states and inputs, not artefacts of the replay.

**Step digests (F2, reported).** The step-record digests agree on only 26 of 1,144 steps, the first difference coming at step 851. Zones, transitions, entries and Warp share are unaffected.
- **What the digest covers.** It hashes the whole step record, including the encounter traces, so the difference lies in recorded detail rather than in movement.
- **Not established here.** Which detail differs. A candidate is wording or fields of the decision traces that differ between the code of 11 November and today's.

## A2: the protocol
- **The run.** The same 65 ticks, cycled to 1,440 iterations with fresh ids, as WT-3L and WT-4L replay a window.
- **Entries.** E = 6.61 (10 by choice, 1 by flow), against A1's 6.12: +0.50, below the 2.0 threshold.
- **Warp share.** 10.6%, with 11 visits, a mean visit of 16 steps and the longest 24 (= Θ).

**Reading.** The WT protocol does not raise her entry rate.

## B: the inputs
- **The arms.** 12 recent windows, from her state at the switch at Θ = 24, in two arms. POST is the windows as recorded. PRE-CONTENT keeps the same ticks, slots and ids, and carries her pre-switch offers.
- **The test.** d = E(POST) − E(PRE-CONTENT), with an exact two-sided sign-flip test over 4,096 patterns.

| Unit | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| E POST | 10.5 | 9.3 | 21.1 | 8.1 | 10.7 | 7.4 | 6.9 | 11.0 | 11.0 | 11.8 | 7.3 | 8.1 |
| E PRE-CONTENT | 8.6 | 13.3 | 10.3 | 7.5 | 6.3 | 6.2 | 9.4 | 6.1 | 10.4 | 11.8 | 10.4 | 11.2 |
| d | +1.9 | −4.1 | +10.9 | +0.6 | +4.4 | +1.2 | −2.5 | +4.9 | +0.6 | 0.0 | −3.0 | −3.1 |

**The result.** Mean d = +0.98, p = 0.47. Seven units are positive, four negative and one zero. The mean is carried by unit 3 (+10.9).

**Reading.** NOT IDENTIFIED. The recent Outside material does not draw her into the Warp more than the material she lived on before the switch, given the same cadence and the same state.

**Means over the 12 units (descriptive).**

| | POST | PRE-CONTENT |
|---|---|---|
| E (choice + flow) | 10.27 (7.43 + 2.84) | 9.29 (6.51 + 2.77) |
| Warp share | 12.4% | 13.1% |
| Share of flow steps | 11.3% | 11.0% |
| Lines of flight per run | 2.75 | 3.08 |

**The two offer pools (descriptive).**
- **Channel mix.** It is nearly the same. Pre-switch: Subdecadence 40%, with Linguistic, I Ching and Tarot each 20%. Recent: 52% and 16% each.
- **Mean attention on zones 2, 3, 5, 6 and 7.**
  - Pre-switch: 0.084, 0.119, 0.102, 0.106, 0.095.
  - Recent: 0.092, 0.103, 0.097, 0.108, 0.097.

## What remains (descriptive, across studies, not tested)
**Entry rates by state and inputs:**

| | Inputs | E |
|---|---|---|
| Her state at the switch (837), Θ = 24 | her own pre-switch ticks, once (A1) or cycled (A2) | 6.1–6.6 |
| The same state | recent windows, recorded or pre-switch content (B) | 9.3–10.3 |
| Her state at step 1,981 (WT-4L STATE-1981), Θ = 12 | recent windows | 15.0 |
| Her state of 14 November (WT-3L, WT-4L) | recent windows | 14.7–15.4 |

The windows differ somewhat between studies, and WT-3L found that Θ does not change E.

**Two candidates remain:**
- **The cadence of what arrives.** The recent windows' ticks and slots raise E from about 6.5 to about 9.5–10, whatever content they carry. PRE-CONTENT kept the recent cadence and A2 kept the old.
- **Her development on ND-1b in its first 1,144 steps.** From the same recent windows, her state at step 1,981 enters about 15 times per 1,000 steps, against about 10 from her state at step 837. Most of the additional entries are by flow.

**The next test.** Each is a single registered contrast on the same windows:
- the state at 837 against the state at 1,981, at Θ = 24;
- the pre-switch tick cadence against the recent one, with the content fixed.
