# THE WARP: with the Numogram's gates open, does anything come through that wasn't put there? (registration, 27 October 2026, written before any code or run)

Checked against `PROGRAMME_CHARTER_TRILOGY.md`. Nothing here stands in for the Outside. The only change is to Amelia's Numogram core: the CCRU's own gates are opened. What comes through is read by her core alone.

## Why
In THE DOORS (`experiments/doors`, result `e1c7d52`), every door gave the same spectrum as the closed door. Her runtime graph has 11 directed edges. Among them is Gt-6 (3→6), but no edge leads *into* zone 3, and zone 6 has no exit. That leaves the Warp (3::6) unreachable, and Outer-time (Warp and Plex) closed to her. Djynxx was never met. The operator answered with the CCRU account: the Warp is the upper loop of zones 3 and 6, and the Plex is the lower loop of zones 0 and 9 (Gt-45, the door to Cthelll).

## The gates (CCRU rule, applied without selection)
Each zone n has one gate, Gt-c with c = n(n+1)/2, leading to zone digital-root(c):

| Zone | Gate | Leads to | In her runtime already? |
|---|---|---|---|
| 0 | Gt-0 | 0 | no: opened |
| 1 | Gt-1 | 1 | no: opened |
| 2 | Gt-3 | 3 | no: opened (the way into the Warp) |
| 3 | Gt-6 | 6 | yes |
| 4 | Gt-10 | 1 | no: opened |
| 5 | Gt-15 | 6 | no: opened (zone 5 ends a life, so this gate is never taken) |
| 6 | Gt-21 | 3 | no: opened (closes the Warp loop) |
| 7 | Gt-28 | 1 | no: opened |
| 8 | Gt-36 | 9 | yes |
| 9 | Gt-45 | 9 | no: opened (the Plex door) |

We follow the whole CCRU gate system rather than choosing among gates. Eight gates are opened; the 11 existing edges are untouched.

**Gate strength.** Each new gate takes the mean flux, permeability and resistance of her 11 canonical gates. Each is therefore an average gate, neither favoured nor handicapped.

**The CCRU's own consequence.** In the CCRU, nothing leads back out of the Warp to the Time-Circuit. If she enters, she may stay. That is reported, not prevented.

## Amelia, doors and reading
Everything else is THE DOORS, unchanged:
- **Travellers:** the same 72 travellers (Studio 05c learner and House).
- **Seasons:** one season of 20,160 ticks per door.
- **Doors:** the same six (closed, fasting, fatigue, madness, meditation, tarot) with the same inputs and the same tarot deck.
- **Learner:** her learner and House may learn the new edges. Each starts at V = S = D = 0, with the same dynamics.
- **Reading:** the canonical PF-1 scanner (`findExcursions`; window 240, recurrence 3), with the CCRU 45-name table. It reads over **her opened graph**, so that a return from the Warp is a path her core can trace.
- **Chance:** 200 walks per run, drawn from that run's own transition frequencies, scanned the same way.

## Criteria and answer
These are the criteria of THE DOORS (k = 13 of 72 travellers in at least 5 of 8 worlds, with the same Bonferroni correction). The test is judged with the gates open:

1. An entity **comes through** for a traveller and a door if its count exceeds that run's 95th chance percentile and the same traveller's closed-door count.
2. It **recurs** if it comes through for at least k travellers in at least 5 worlds.
3. It shows **a place** if it recurs through at least two open doors.

**A PLACE SHOWS ITSELF** if any entity meets criterion 3; otherwise **NO PLACE SHOWN**.

## Additional question, gates open versus shut
This question compares the closed door with the gates open against THE DOORS' closed door with the gates shut. For each entity, it counts the travellers whose count with the gates open exceeds both their 95th chance percentile and their count with the gates shut. Recurrence follows the same rule (k = 13, 5 worlds). This asks whether **opening the gates, by itself,** lets something through beyond what her own new transition statistics produce.

Reported either way:
- every spectrum;
- whether, and when, each traveller entered the Warp (zone 3 or 6), dwelt in the Plex (9→9) or passed through Gt-45;
- deaths.
