# Results: Pandemonium 45-card action-match run

**Run date:** 31 October 2026. **Protocol registration commit:** `027b4790ed0c294826d319505e383fdf6b655aa0`. **Status:** exploratory mechanics result.

## Construction and execution

The deck contains 45 distinct cards, one per Pandemonium Matrix Mesh serial. The operational value is `10 − high Net-Span digit`; counts are 9 cards of value 1, 8 of value 2, down to 1 card of value 9. Five cards are syzygetic by their zone-pair sum, while the requested operational-value scissors use the separate `value + value = 9` rule.

Each action phrase was A1Z26-summed and reduced to a target zone before its sequence. For each action, 1,000 seeded ten-card deals were run: five Set-1 cards and five sequentially revealed Set-2 cards. Scissors scored the absolute value difference; unmatched Set-1 values were subtracted. Unmatched Set-2 cards scored zero. The resulting game scores ranged from −30 to +21. Across 6,000 deals: 4,151 negative calls, 273 zero calls, and 1,576 positive outcomes; mean scissors per deal was 1.730.

## Per-action results

| Suggested action | A1Z26 sum → zone | Mean score | + / 0 / − | Digital score-zone match | Other-action base rate | Mesh call includes target zone* |
|---|---:|---:|---:|---:|---:|---:|
| Recurring return | 209 → 2 | -4.467 | 255 / 52 / 693 | 150/1000 (15.0%) | 13.32% | 228/745 (30.6%) |
| Exploration | 149 → 5 | -5.141 | 244 / 41 / 715 | 120/1000 (12.0%) | 11.26% | 202/756 (26.7%) |
| Interruption | 179 → 8 | -4.272 | 269 / 56 / 675 | 67/1000 (6.7%) | 6.80% | 0/731 (0.0%) |
| Memory update | 156 → 3 | -4.536 | 263 / 36 / 701 | 125/1000 (12.5%) | 13.04% | 259/737 (35.1%) |
| Death | 38 → 2 | -4.334 | 280 / 41 / 679 | 130/1000 (13.0%) | 13.72% | 230/720 (31.9%) |
| Cue zone gate paths | 186 → 6 | -4.490 | 265 / 47 / 688 | 99/1000 (9.9%) | 9.84% | 82/735 (11.2%) |

\* The mesh-pair figure is conditional on a zero/negative outcome being mapped to Mesh-`abs(score)`. A positive outcome does not call a matrix entity. The score-zone match uses the project's declared digital-root readout and is not a canonical Subdecadence rule.

## Interpretation

Digital score-zone match rates stayed close to the corresponding rates in the other five action sequences (largest descriptive difference: +1.68 percentage points for “Recurring return”). The action phrase was not an input to the shuffle or scoring; its A1Z26 zone was compared with the outcome after the deal. These matches are therefore post-hoc numerical correspondences, not evidence that the cards selected or enacted the action.

“Recurring return” and “Death” both reduce to Zone 2, so this spelling and cipher collapse two distinct motifs before the game begins. “Interruption” reduces to Zone 8 but none of the 731 zero/negative outcomes in that sequence called a Mesh card containing Zone 8. This reflects the deck's score-to-Mesh distribution and does not establish selective absence or presence.

The experiment records the complete 45-card deck and the game's mechanics. It does not test Amelia's substrate, ProcessFieldMemory, a live information stream, or external communication. The result is a reproducible cartomantic mapping run with no demonstrated action-specific selectivity.

## Provenance

- Raw deal log: `runs.csv` (6,000 rows plus header).
- SHA-256: `4631f08fb38fdcb20dc07bdb6d82abe9cf31550b48a2adaf01f2289dc6b9cc2d`.
- All cards, targets, rules, generator and seed schedule are preserved with the registered protocol.
