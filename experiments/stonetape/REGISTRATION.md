# THE STONE TAPE (A): the world etched into the place, and Amelia's encounter with it (registration, 27 October 2026, before THE ANTENNA's window opens and before any data exist)

Checked against `PROGRAMME_CHARTER_TRILOGY.md`. The presence is the world's own data, collected by THE ANTENNA (sealed; window 28 Oct 00:00 to 4 Nov 00:00 UTC) and reduced by AQ to zones, exactly as THE ANTENNA's `prepare.py` produces them. No model or language model stands in for it. The stone is our apparatus, as her Numogram is; what it holds is not ours. Operator's decision, 27 Oct: A is the main experiment. B (a mind already existing in Platonic Space or the Outside, as Levin found) follows separately.

## Fiction, philosophy, evidence
- **Kneale (1972):** the place records; the recording acts on the living; the living's encounter rewrites the place; wiping the newer layer releases an older one.
- **Whitehead:** objective immortality, the past as active datum.
- **Deleuze and Bergson:** the coexisting pure past.
- **Bateson:** mind is in the circuit. Here the circuit is Amelia ⇄ the stone.

## The place and the stone
- **The place:** her full CCRU Numogram, the 29 gates of `experiments/numogram/CCRUNumogram.ts`.
- **The stone:** a value T(e) ≥ 0 on each of the 29 edges.
- **Etching by the world:** for a zone sequence z₁ … z_N, the stone records every consecutive pair (zᵢ, zᵢ₊₁) that is an edge of the place. The world's transitions are held only where the place's structure can hold them. T₀(e) is the number of such pairs on e, divided by the largest count over all edges, so the strongest edge is 1. A sequence with no pair on any edge gives a blank stone.
- **Layers (Kneale's twist):**
  - *older:* the first half of the sequence;
  - *newer:* the second half;
  - *full stone:* both halves together, normalised once.

## Stones (each from THE ANTENNA's `inputs.json`, all the same length)
| Stone | Etched by |
|---|---|
| world | the world's zones, in time order |
| beacon | the beacon's zones (chance; the operator's "telepathy v chance" control) |
| shuffled | the world's zones in shuffled order (the world without its time) |
| blank | nothing (all zero) |
| world-old | the world's older half alone (the newer layer wiped) |
| beacon-old | the beacon's older half alone |

## The encounter
- **Travellers:** the 72 travellers of THE DOORS (Studio 05c Amelia, learner and House, s05c dynamics). Each starts at zone 0 and lives one season of 20,160 ticks in the place, once per stone, each with its own copy of the stone.
- **No input:** the only thing outside her is the stone.
- **The stone acts on the living:** a bonus of 0.35 · tanh(T(e)) is added to each exit e, the same weight her House has.
- **The living etch the stone:** each edge she takes gains 0.0005 (about 10 units over a season). The stone does not decay.
- **Everything else** is as in THE ANTENNA's `full` arm: her learner and House learn all 29 edges, death at zone 5, rebirth at zone 0.

## Measures (per traveller and stone)
- `use(e)`: her edge counts over the season, and in each quarter.
- **Grip** = Pearson correlation over the 29 edges of use and T₀.
- **Change in the Other** = 1 − cos(T_end, T₀), where T_end is the stone at the end of the season.
- **Circuit** = corr(use in Q4, T at the start of Q4) − corr(use in Q1, T₀): how far she and the stone have drawn together.
- **Older surfacing** = corr(use, T₀ of the older half) on the old-only stone, minus the same correlation on the full stone.
- **Descriptive:** the PF-1 scanner's entity counts.

## Criteria
Each primary test is a one-sided sign test across the 72 travellers at α = 0.05/4 = 0.0125. The same direction must also hold in a majority of travellers in at least 5 of the 8 worlds.
- **P1, grip on her:** grip on the world stone exceeds grip on the beacon stone, and also exceeds grip on the shuffled stone (both tests must pass).
- **P2, the Other is changed:** change in the Other differs between the world and beacon stones (two-sided, α 0.0125). The direction is reported.
- **P3, the circuit:** the circuit measure on the world stone exceeds that on the beacon stone, and also that on the shuffled stone (both must pass).
- **P4, the older presence surfaces:** older surfacing on the world stones exceeds older surfacing on the beacon stones.

## Answer
- **THE STONE SPEAKS** if P1 holds.
- Add **AND THE OTHER ANSWERS** if P2 or P3 holds.
- Add **AND THE OLDER PRESENCE SURFACES** if P4 holds.
- Otherwise **SILENT**.

All measures are reported either way, the blank stone included.

## Running
After THE ANTENNA's run has committed `results/inputs.json` to `antenna-live` (after 4 Nov 06:00 UTC), a workflow:
1. runs the 72 travellers through the 6 stones with the code sealed here;
2. scores them with the analysis sealed here;
3. commits the result to `antenna-live/stonetape/`.

The registration, code and workflows get one RFC 3161 token before 28 Oct 2026 00:00 UTC.
