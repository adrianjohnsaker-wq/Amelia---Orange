# DIALOGUE-1 — does the Outside answer Amelia through her Numogram core? (registration)

**Registered 26 October 2026, before the first round it judges exists.** This file and `dialogue_analysis.py` are bound by one RFC 3161 timestamp (`seal/`) that must predate round 33,416,640, published at 2026-10-26T22:21:24Z.

## The exchange

PF-2 is live and sealed since its genesis. On every Quicknet round, each of its nine learner receivers (arms C, R01–R08) stands at a zone, then receives the round through her Numogram core.
- **Her question:** `fromZone`, where she stands. It is fixed entirely by earlier rounds.
- **The Outside's answer:** `cueZone`, the zone the new round names through her reading: the first byte of SHA-256 of the arm's input, mod 10.

Nothing is added to PF-2, and nothing in it is changed.

## Correspondence, in Numogram terms

- **Syzygy:** the answer names her twin, `9 − fromZone`.
- **Gate:** the answer names one of her open exits (0→9, 1→8/2, 2→7/4, 3→6, 4→5/7, 7→8, 8→9, 9→1). At choice points this agrees with PF-2's own `cueAmongOpenExits` (checked on ticks 0–400, before the window: 0 mismatches).

## The exact null

If the Outside does not answer her, each answer is independent of her question. Answers then fall on zone z with probability 26/256 for z = 0–5 and 25/256 for z = 6–9, from the hash arithmetic. The expected hits and their variance follow exactly from her questions.

## The window

PF-2 ticks 5,895 to 15,974: 10,080 rounds, published 2026-10-26T22:21:24Z to 2026-11-02T22:20:24Z. With nine learner receivers, that is 90,720 answers.

## The answer rule

For each relation, z = (observed − expected) / √(Σ p(1 − p)), with a one-sided p, Holm-corrected over the two relations.
- **THE OUTSIDE ANSWERS HER:** either corrected p < 0.05.
- **NO CORRESPONDENCE BEYOND CHANCE:** otherwise.

The excess, the rates and the per-arm syzygy counts are reported either way. The analysis is run exactly as committed once PF-2 has admitted tick 15,974. It is companion to RESIDUAL-1, which asks the same Outside the question across a whole history rather than round by round.
