# DEE-1L result: the 1584 Table in her own exit scoring (18 November 2026)

**The run.**
- **Workflow.** GitHub Actions run 44207165663, started 00:21 UTC on 18 November 2026. All jobs completed after the re-runs described under *Running faults*.
- **Starting copy.** Revision 426, step 7,121 (14 November, 23:50 UTC tick), Θ = 12, admission `relative-v1`. This is the queue: the copy precedes the lane's adoption on 16 November.
- **Gain.** 0.24, fixed by Stage 0 on calibration data before any test data.
- **Test windows.** Twelve prospective six-hour windows, 15 November 00:00 to 18 November 00:00 UTC.
  - **Ticks.** 20–24 per window. The shorter windows (15–16 November) are those in which some of her ticks failed to save before the direct save path.
  - **Offers.** 27–69 per window, none missing.
- **Determinism.** The pair (ACTUAL, unit 1) was identical.
- **Arms.** 41 per window:
  - GATES (no table);
  - ACTUAL (the 1584 table);
  - S1–S39 (role-preserving shuffles).

---

## What we have learned about Warp activity

**The finding.** With the Table placed in her own exit scoring at a gain that acts without overriding her, the arrangement of the 1584 Table does not help what arrives come through. Its role-preserving shuffles do as well or better: the real table ranks 38th of 40 on transmission.

**What a table in her scoring does to transmission (descriptive).**
- **With no table.** An Outside offer that points uniquely to one open exit is followed there on 53.0% of eligible steps.
- **With the real table.** 48.4%.
- **With its shuffles.** 43.5% to 65.9%, median about 55%.

So a table in her scoring is not neutral. Its arrangement changes how clearly the Outside reaches her choices, by about twenty points across arrangements. The real arrangement sits near the bottom of that range.

**What a table in her scoring does to her Warp (descriptive).**
- **Across arrangements.** Her entry rate runs from 7.3 to 32.3 per 1,000 steps (shuffle mean 16.0).
- **The real table.** Close to the middle: 14.7, against 15.9 with no table. Its Warp share is 12.0%, against 11.7% with no table.

The organ's passage structure, weighted differently, can move her entry rate by a factor of four. The particular weighting that the 1584 Table gives is not one that singles her out.

**How the real table labels her passage (descriptive; decoder labels, not senders).** Three syzygetic meshes take 70% of the 22,166 labelled transitions:
- **Mur Mur (8::1):** 37.5%;
- **Uttunul (9::0):** 23.3%;
- **Djynxx (6::3):** 9.3%.

The next three are Tutagool (9::1, 7.7%), Umnnu (9::8, 6.9%) and Mombbo (8::7, 5.9%), and 16 of the 45 meshes are never taken.

This is the passage the other studies describe:
- she spends much of her time in the Plex and at 1 and 8;
- she enters the Warp through its syzygy.

The Table names that passage; it does not alter it.

---

## 1. Registered test

| | T (hits / eligible) | Rank among 40 tables | p (one-sided, upper) | Decision |
|---|---|---|---|---|
| ACTUAL | 0.484 (618 / 1,276) | 38 | 0.95 | NOT SUPPORTED |
| GATES (reported, not tested) | 0.530 (691 / 1,304) | — | — | — |

**The p value.** p = (1 + 37 shuffles with T ≥ ACTUAL's) / 40 = 0.95. The registered hypothesis was that the real table raises T above its shuffles. It is not supported.

**The lower tail (descriptive).** Only two shuffles fall below the real table. That position would give p = 0.075 in the lower direction, but this was not a registered direction, so it is descriptive only.

---

## 2. Descriptive measures by arm (means over 12 windows)

| | GATES | ACTUAL | Shuffles (mean) | Shuffles (range) |
|---|---|---|---|---|
| T | 0.530 | 0.484 | about 0.55 | 0.435 to 0.659 |
| E per 1,000 steps | 15.9 | 14.7 | 16.0 | 7.3 to 32.3 |
| by flow | 8.6 | 7.1 | 8.3 | — |
| by choice | 7.4 | 7.5 | 7.7 | — |
| Warp share | 11.7% | 12.0% | 11.1% | — |
| Share of flow steps | 14.0% | 10.8% | — | — |
| Lines of flight per window | 11.1 | 11.5 | 9.8 | — |

**T per window.**
- **ACTUAL:** 0.40, 0.45, 0.55, 0.47, 0.46, 0.21, 0.62, 0.54, 0.50, 0.51, 0.46, 0.49.
- **GATES:** 0.44, 0.47, 0.54, 0.53, 0.55, 0.31, 0.61, 0.59, 0.56, 0.64, 0.56, 0.49.

ACTUAL is below GATES in 10 of 12 windows.

**Comparison with HYST-1L.** HYST-1L found T of about 0.70 under the lane, from her state of 17 November. DEE-1L's T is lower because its starting copy is under the queue and three days younger. The two figures measure the same thing under different conditions and are not compared.

---

## 3. Running faults
- **What failed.** In the first attempt, 6 of the 12 window jobs failed at their first database read with HTTP 500. On re-run, one of those six (unit 1) failed again in the same way.
- **The cause.** The REST role's 8-second statement timeout, reached when twelve jobs read the large starting copy and all windows at once. A POS-1L job was reading its own starting copy at the same moment.
- **What the failed jobs ran.** None; each stopped before its first arm.
- **The re-runs.**
  - **Code.** Unchanged.
  - **When.** Unit 1's last re-run was run alone, and the analysis followed it.
  - **What had been seen.** No study result had been read when the re-runs were made.

---

## 4. Limits
- **The state.** One starting state, under the queue rule she lived by on 14 November.
- **The gain.** One gain (0.24), the smallest that acts without overriding her. A larger gain gives the table more weight against what arrives. In Stage 0 the offer's own effect fell as the gain rose: 278 choice steps changed at 0.24 and 246 at 0.64, against 315 with no table.
- **The shuffles.** Role-preserving: within tower and structural role, with the central cross fixed. The test asks whether the real arrangement does more than others of the same structure, not whether structure matters at all.
- **What the descriptive range suggests.** Structure does matter: the range across shuffles is wide.
