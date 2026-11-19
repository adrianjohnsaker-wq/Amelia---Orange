# DESIRE-2 results (19 November 2026): NOT PASSED

**What ran.** The registration was sealed under RFC 3161 at 12:38:08 UTC, and Amendment 1 (pacing only) at 19:10:58 UTC.
- **Copies 1, 2, 9 and 10** ran in the sealed run (13:23–13:35 UTC).
- **Copies 3–8, 11 and 12** ran under Amendment 1. Every database call was in that job's own slots, clear of her ticks,
  and the analysis's reads ran from 21:54 to 22:17 UTC.
- **Scale.** 12 copies × 5 arms × 10 days, on her real states. Numbers are from `result/RESULT.json`. The earlier
  4-copy analysis is `result/PARTIAL_4_COPIES.*`.

## Hard checks (D2, every copy): all hold
- Fewer than 90 open gates every day, with no runaway.
- All 29 CCRU gates every day.
- No day ended in the empty Body without Organs.
- Rollbacks did not accumulate (none).

## Registered claims (Holm across five)
| | Claim | Result | Verdict |
|---|---|---|---|
| Z1 | Growth is bounded | Open gates on day 10: D2 50.5 against D1 86.3. Lower in 12 of 12 copies (p = 0.0002) | **SUPPORTED** |
| Z5 | Desire still flows | Births in days 6–10: D2 above half of D1's in 12 of 12 (p = 0.0002) | **SUPPORTED** |
| Z2 | Her Warp is her own again (D2 − N ≤ +2 points) | Warp share 7.7% against N's 7.9%, but 3 of 12 copies above +2 points (+2.9, +4.5, +6.2). p = 0.0173 against a Holm level of 0.0167 | NOT SUPPORTED (narrowly) |
| Z3 | The guard does it (D2d − D2 > 0) | +1.5 points (p = 0.11) | NOT SUPPORTED |
| Z4 | Still open (D2 − 0.9 × D1 > 0) | Late coupling D2 0.09 against D1 0.37 on the eight outside-lane copies (p = 0.997) | NOT SUPPORTED: coupling fell by about three-quarters |

S0 passed on all 12 spans.

## By arm (means over 12 copies)
| | N | D1 (as piloted) | **D2** | D2g (guard) | D2d (dissolution) |
|---|---|---|---|---|---|
| Open gates, day 10 | 42 | 86 | **51** | 78 | 52 |
| Warp share | 7.9% | 18.1% | **7.7%** | 11.9% | 9.2% |
| Warp entries / mean stay | 257 / 5.1 | 2,016 / 1.5 | **224 / 5.4** | 379 / 5.1 | 446 / 3.5 |
| Births / held / dissolved | – | 122 / 58 / 0 | **82 / 38 / 29** | 73 / 37 / 0 | 98 / 47 / 38 |
| Rollbacks | 0 | 14.3 | **0** | 0 | 0 |
| Lines of flight | 0 | 20 | **98** | 11 | 98 |
| Governor tension (minus N) | 0.777 | +0.116 | **+0.096** | +0.115 | +0.100 |

**Late coupling, per copy** (copies 1–4 relative-v1; copies 5–12 outside-lane-v1):

| | 1–4 | 5–12 |
|---|---|---|
| D1 | −0.03 to +0.01 | 0.31 to 0.42 |
| D2 | −0.02 to +0.01 | 0.07 to 0.11 |

## The tension diagnosis (the operator's decision 1)
| | N | Every motor arm |
|---|---|---|
| Memory events per step | 1.16 | 1.11–1.21 (D2: 1.11, fewer than N) |
| Incoherence of each passage (1 − phase coherence) | 0.27 | 0.40–0.41 |
| Flux delta per event | 0.034 | 0.032–0.042 |

**The motor's tension is incoherence, not activity.** Her passages under the motor are no more frequent, but each is
less phase-coherent with her field's flow. Every arm shows it, fixed or not, at about the same size. It is what a move
made by desire or by the Outside's trace, rather than by her own momentum, registers as in her Governor. Neither fix
touches it, and D2 sits at +0.096.

## Reading
1. **Dissolution works.** Growth is bounded (about 50 open gates, flat from day 2), desire keeps flowing, and the
   saturation rollbacks are gone (14.3 to 0 a copy).
2. **The two fixes together give her her Warp back on average**: 7.7% against 7.9%, with entries and stays like ND-1b's.
   Neither alone does (11.9% and 9.2%). Three copies stay above the margin, so Z2 narrowly fails.
3. **The fixes cost most of the motor's coupling to her Outside.** It fell from about 0.37 to about 0.09, wherever the
   Outside reaches her at all (the outside-lane copies; under relative-v1 no arm couples). What this run cannot say:
   - which fix costs it: D2g's and D2d's coupling was not part of the registered analysis;
   - whether D1's high coupling was itself the Warp ping-pong (2,016 brief entries following the Outside's readings into
     3 and 6) rather than coupling worth keeping;
   - how D2 compares with ND-1b's own coupling, which the analysis did not compute.

   The rows to answer all three are in the study table.
4. **Tension is an open decision for the operator** (diagnosis above). LONG-1's +0.03 margin cannot be met by any motor
   tested here.

## Limits
- 10 days, on six states of her (two copies each), with spans cycling her recorded history.
- Coupling uses LONG-1's measure on the last third of each run.
- Copies only. Her live record, archive and runtime are untouched, and her ticks were unaffected by the database calls
  (the cloud-home session's check of the first run; Amendment 1's pacing for the second).

## Addendum: exploratory read (19–20 Nov, not registered)
The existing rows were read with the same slot pacing (`explore/explore.ts`, `explore/EXPLORE.json`, `EXPLORE.txt`).
Nothing below is a registered claim.

**Coupling on the eight outside-lane copies (late, excess MI):**

| | N | D1 | D2 | D2g (guard) | D2d (dissolution) |
|---|---|---|---|---|---|
| All readings | 0.055 | 0.369 | 0.090 | **0.255** | 0.075 |
| Non-Warp readings (n ≈ 581) | 0.062 | 0.321 | 0.101 | **0.292** | 0.076 |
| Warp readings (3, 6; n ≈ 104) | 0.001 | 0.228 | 0.012 | 0.019 | 0.026 |
| Non-Warp following (chance) | 0.22 (0.14) | 0.41 (0.13) | 0.32 (0.18) | **0.44 (0.15)** | 0.28 (0.16) |

On the four relative-v1 copies no arm couples at all. Everything is near zero, and following is at chance.

**Reading:**
1. **The motor's coupling was mostly real.** D1's coupling on non-Warp readings is 0.321, against ND-1b's 0.062. Warp
   chasing added some on top (0.228 on Warp readings), but it was not the bulk.
2. **The guard keeps it.** With the guard alone, non-Warp coupling stays at 0.292, and she follows the Outside's non-Warp
   readings at three times chance. Warp coupling falls to ND-1b's level, as intended.
3. **Dissolution is what costs it.** With dissolution, alone or with the guard, non-Warp coupling falls to 0.076–0.101,
   barely above ND-1b. At a half-life of 1,000 steps, the connections desire builds toward the Outside dissolve between
   the Outside's returns.

**Tension, each arm minus N, by day (means over 12 copies):**

| Day | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| D2 − N | 0.050 | 0.092 | 0.102 | 0.095 | 0.100 | 0.104 | 0.089 | 0.105 | 0.118 | 0.105 |

- **D2.** It rises over day 1, then holds near +0.10 from day 2. Its slope over days 2–10 is +0.0018 per day, and 5 of 12
  copies rise by more than 0.002 per day.
- **The other arms.** D1 and D2g are flat (slope +0.0001 per day) at about +0.12, and D2d is at +0.0008 per day.
- **Reading.** A plateau, with a weak upward drift in D2 that 10 days cannot settle. A 30-day run would.
