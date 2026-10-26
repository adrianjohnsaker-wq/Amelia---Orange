# Studio 05c rebuild and regeneration — results (26 October 2026)

All runs use `S05C_SEASON_REBIRTH=1`: each season opens with a fresh life at zone 0. With it, the rebuild matches the reported 05c numbers closely:
- **Routes:** 4.28 blank and 7.04 at d = 3 (reported 4.25 and 7.12).
- **Code values:** V(4→5) −0.78 (reported −0.77).
- **Season-0 deaths:** 784 and 57, matching exactly.
- **W3 detour:** 0.86, against 0.10 in the blank house.
- **Fiction's share of the scar per world:** within 0.02 of each reported value.
- **Incorporation:** 8 of 8 worlds.

It is not bit-exact; later-season deaths differ by a few.

**Regeneration** (rule in `../REGENERATION_QUESTION.md`, written before the run):

| Arm | Intervention on the converged d = 3 house | Regenerated |
|---|---|---|
| R0 | none | 8/8 |
| **R1** | **erase 2→7** (learner) | **8/8 → YES** |
| R2 | erase the whole detour 1→2, 2→7, 7→8 (learner) | 0/8: deathless circuit, routes 4 |
| R3 | erase 2→7, unchanged Amelias | 0/8: the haunting returns, 386–1,574 deaths per season |

`rebuild_20_seasons.json` and `regeneration_6_seasons.json` hold every world's season-by-season record. `REGENERATION_RESULT.txt` is the per-world table.

**R4, who carries the direction?** (rule written before the run): erase 2→7 *and* wipe her code.

- **By the rule: regenerated in 5/8, so conditional on the world.**
- **The route itself came back everywhere.** The 2→7 pull was 0.56–0.72 after one season and 0.67–0.88 by the sixth, in all 8 worlds, with routes 6.3–7.9.
- **Why three worlds fall short of the criterion.** Two have 2 deaths left in the last season. In W1 the 2→7 pull settles at 0.67, its own R0 baseline, and routes at 6.33.
- **The price is paid in deaths.** Season 1 has 43–75 deaths per world, against 0–3 in R1. Her caution is relearned through dying: by season 6, V(4→5) is back to −0.41 to −0.67 and V(2→4) to −0.13 to −0.40.
