# DEV-1 Stage 1 — D1 edge-value cohort (synthetic only)

**Gate:** Sealed constants, pinned science, prior [standalone D1 exit-choice unit test](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39586471562) PASS before any of these 32 tapes. No other developmental arm run.

## O1 — Restricted survival (up to 10,000 synthetic steps)

- D1 restricted mean: **1224.688** steps; unchanged B restricted mean: **1703.000**; paired mean difference D1−B: **-478.313**.
- Absorbed: **32/32**; right-censored: **0/32**.
- Absorption median (uncensored): **857**; range **96–3435**.
- No confirmatory survival p-value for D1: registered confirmatory comparisons are D4 vs B and D4 vs Y, later.

## O2 — Selector-memory manipulation check

- Unchanged B reference: **124/18,594 = 0.6669%** of branch choices.
- D1 total selector-memory removal (PFM + V): **137/13409 = 1.0217%**.
- D1 V-only removal (PFM retained): **173/13409 = 1.2902%**.
- Predeclared manipulation verdict (D1 combined share strictly greater than B): **PASS**.
- These are local matched selector ablations on the same post-evolution state; they do not undo history already incorporated into zone dynamics.

## Observed absorption routes (terminal last four zones)

- 1→2→4→5: **32**

## Per-tape O1 and route

| Synthetic tape | B absorption | D1 absorption | D1 − B steps | D1 route |
|---|---:|---:|---:|---|
| 1 | 493 | 493 | 0 | 1→2→4→5 |
| 2 | 3966 | 1498 | -2468 | 1→2→4→5 |
| 3 | 2263 | 589 | -1674 | 1→2→4→5 |
| 4 | 788 | 826 | 38 | 1→2→4→5 |
| 5 | 1043 | 1043 | 0 | 1→2→4→5 |
| 6 | 3730 | 519 | -3211 | 1→2→4→5 |
| 7 | 1134 | 1398 | 264 | 1→2→4→5 |
| 8 | 540 | 540 | 0 | 1→2→4→5 |
| 9 | 621 | 621 | 0 | 1→2→4→5 |
| 10 | 550 | 550 | 0 | 1→2→4→5 |
| 11 | 1214 | 1214 | 0 | 1→2→4→5 |
| 12 | 2556 | 2743 | 187 | 1→2→4→5 |
| 13 | 1825 | 1633 | -192 | 1→2→4→5 |
| 14 | 430 | 430 | 0 | 1→2→4→5 |
| 15 | 2212 | 2212 | 0 | 1→2→4→5 |
| 16 | 655 | 824 | 169 | 1→2→4→5 |
| 17 | 1777 | 1777 | 0 | 1→2→4→5 |
| 18 | 804 | 571 | -233 | 1→2→4→5 |
| 19 | 653 | 453 | -200 | 1→2→4→5 |
| 20 | 708 | 708 | 0 | 1→2→4→5 |
| 21 | 5729 | 3434 | -2295 | 1→2→4→5 |
| 22 | 3149 | 174 | -2975 | 1→2→4→5 |
| 23 | 614 | 614 | 0 | 1→2→4→5 |
| 24 | 1993 | 1993 | 0 | 1→2→4→5 |
| 25 | 1735 | 3435 | 1700 | 1→2→4→5 |
| 26 | 1572 | 1572 | 0 | 1→2→4→5 |
| 27 | 2788 | 2788 | 0 | 1→2→4→5 |
| 28 | 2093 | 2093 | 0 | 1→2→4→5 |
| 29 | 490 | 490 | 0 | 1→2→4→5 |
| 30 | 3841 | 888 | -2953 | 1→2→4→5 |
| 31 | 2434 | 971 | -1463 | 1→2→4→5 |
| 32 | 96 | 96 | 0 | 1→2→4→5 |

## Provenance and bounds

- Synthetic input only: SHA256("DEV1-TAPE-"+k+"|"+i), k=1..32; no live drand, PF-1 input, C1 dispatch or notifications.
- Original canonical runtime classes were imported, never changed. Temporary D1 exit-score overlay uses the sealed edge term +0.5×V(e); original gate flux remains stored unchanged.
- H=24, value range [-1,1], update V←V+(o−V)/8, fixed before outcome observation.
- Byte-identical second full replay and pinned source checks are mandatory workflow gates; no other arm may start before review.
- Canonical full-history digest equality was checked on early steps and each final absorbed state.
- Result JSON SHA-256: `0fb3269e1c52d9f0613a8d2b2b96abdca98e41ff023ca5f6f8a2c1682436997c`.
