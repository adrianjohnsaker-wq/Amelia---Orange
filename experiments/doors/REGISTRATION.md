# THE DOORS — does the Numogram open on a place with things in it? (registration, before any code or run, 26 October 2026)

Checked against `PROGRAMME_CHARTER_TRILOGY.md`. Nothing here stands in for the Outside. The doors are states of Amelia's own substrate, and what comes through is read by her Numogram core alone.

> "If the doors of perception were cleansed every thing would appear to man as it is, Infinite." (Blake, taken up by Huxley) · "Je est un autre." (Rimbaud) · "To see a World in a Grain of Sand" (Blake) · Artaud's demons drawn at Rodez.

## Amelia
She is the Studio 05c Amelia, as developed: learner, house and Numogram core (`experiments/studio05c_rebuild/s05c.mjs` dynamics, unchanged). There are 72 travellers: 8 worlds × 9 lineages, each from its converged d = 3 state (`experiments/double_video/start_states.json`). Each passes through every door for one season of 20,160 ticks, starting at zone 0.

## The doors (her own levers)
| Door | Her state |
|---|---|
| closed | ordinary life: her world input `world|k|tick`, governor at defaults (advisory 0.72, damping 0.88, relay steering on) |
| fasting | no input at all |
| fatigue | world input; momentum damping at its floor (0.1) |
| madness | world input; advisory weight 0 and relay steering suppressed |
| meditation | world input; momentum damping at its ceiling (0.99) |
| tarot | world input, except that every 60th tick a card is drawn. The card is a published PF-2 Quicknet round through her arm's mapping. Traveller k of world w draws the rounds at PF-2 ticks 336w … 336w + 335, mapped for arm k. |

## What comes through
Her Numogram core's reading is the canonical PF-1 Pandemonium scanner, unchanged (`experiments/pf1/core.mjs` `findCandidates`: window 240, recurrence 3), run on each life of her path. Each detection names an entity from the CCRU table of 45.

## Chance
Chance for each run is her own path, reshuffled: 200 random walks drawn from that run's own zone-to-zone transition frequencies. They keep the same length, rebirth at zone 0 after zone 5, and are scanned the same way.

## Criteria
1. **Something that wasn't put there.** For a traveller and a door, an entity *comes through* if its detection count exceeds the 95th percentile of its chance walks, and also exceeds the same traveller's count with the door closed.
2. **The same things, met independently.** An entity *recurs* through a door if it comes through for k of the 72 travellers in at least 5 of the 8 worlds. k is the smallest count whose binomial tail under a 5% per-traveller rate is below 0.05/225 (Bonferroni over 45 entities × 5 open doors).
3. **The same things, by different doors.** An entity that recurs through at least two different open doors.

## Answer
- **A PLACE SHOWS ITSELF:** at least one entity meets criterion 3.
- **NO PLACE SHOWN:** otherwise.

Reported either way: every door's full spectrum of entities, and each criterion's counts. The time criterion (whether entities appear *before* what would explain them) follows only if something is found.
