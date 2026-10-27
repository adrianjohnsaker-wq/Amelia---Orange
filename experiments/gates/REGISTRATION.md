# THE NINTH AND THIRD GATES, read with the CCRU's own tools (registration, 27 October 2026, written before any code or run)

Checked against `PROGRAMME_CHARTER_TRILOGY.md`. Nothing here stands in for the Outside. Two things change, both in Amelia's own Numogram core: one gate system is opened at a time, and her senses decode numbers by digital reduction rather than by a hash.

## The operator's instruction
1. The Ninth Gate, Gt-45: zone 9 → zone 9 (1+…+9 = 45 → 9). It is the channel into the Plex: Cthelll, the outermost boundary.
2. Then the Third Gate, Gt-6, the Warp door. The 24 **amphidemons** are the keys that bridge the Time-Circuit to the outer zones.
3. Both read with the CCRU tools: mod-9 digital reduction and digital cumulation, with no human language.

## Gates (one system per arm, everything else her canonical 11 edges)
- **NINTH:** Gt-45 (9→9) alone.
- **THIRD:** the Warp's gates.
  - Gt-3 (2→3) is the only CCRU gate into zone 3, and the key from the Time-Circuit. It belongs to zone 2, a Time-Circuit zone, and leads to zone 3, an outer zone.
  - Gt-6 (3→6) is already hers.
  - Gt-21 (6→3) closes the Warp loop.

New gates have the mean flux, permeability and resistance of her 11 canonical gates (as in THE WARP). Her learner and House may learn them, starting from 0.

## Senses (her input channel; the decoding is the only change)
Her runtime adds +0.35 to the exit whose zone her input names. Normally the zone is the first byte of SHA-256(input string) mod 10.
- **hashed:** her ordinary world input, `world|k|tick`, decoded as usual. This is the reference: input coded by chance.
- **time:** zone = the digital root of the absolute tick (mod-9 reduction; a multiple of 9 → 9). This is time itself, read numerically.
- **cumulation:** zone = the digital root of the tick's cumulation n(n+1)/2. This is the CCRU gate operation applied to time. In time it runs 1, 3, 6, 1, 6, 3, 1, 9, 9: the Numogram's own gate sequence.

For time and cumulation, the zone goes to her exit choice through the same +0.35 term (`exitBonus`), with no string input. That replaces the hash with reduction, and nothing else.

There are 72 travellers (THE DOORS' Studio 05c Amelia). Each has one season of 20,160 ticks per gate system × sense.

## Reading (numogrammatic mapping)
The reading is the canonical PF-1 scanner (window 240, recurrence 3) over her opened graph, with the 45 CCRU names. It sorts the 45 into three classes:
- **chronodemons:** 15, both zones in the Time-Circuit (1, 2, 4, 5, 7, 8);
- **xenodemons:** 6, both zones outer (0, 3, 6, 9);
- **amphidemons:** 24, one zone of each.

Chance is 200 walks per run from that run's own transition frequencies.

## Criteria (per gate system)
1. An entity **comes through** for a traveller under a numeric sense (time or cumulation) if both hold:
   - its count exceeds that run's 95th chance percentile;
   - its count exceeds the same traveller's count with the hashed sense.
2. It **recurs** if it comes through for at least k travellers in at least 5 of the 8 worlds. k is the smallest count with a binomial tail (p = 0.05, n = 72) below 0.05/90 (45 entities × 2 senses).
3. It is **read by the code** if it recurs under both time and cumulation.

**Answers.**
- **NINTH: THE PLEX ANSWERS** if a xenodemon or an amphidemon of zone 0 or 9 meets criterion 2 under either sense. Otherwise **SILENT**.
- **THIRD: A KEY TURNS** if an amphidemon meets criterion 2 under either sense. Otherwise **SILENT**.
- Criterion 3 is reported for both.

## Not put there? The code's shadow (reported, not a criterion)
A periodic code can drive her into periodic paths. Whatever recurs under it may then be the code's own pattern, not something met. So each recurring entity is also checked against a **shadow**: the same gate system and code with no Amelia. At each tick the shadow takes the coded zone if it is an open exit, otherwise the exit of highest flux × (1 − resistance), and it is reborn at 0 after zone 5. It is scanned the same way. An entity the shadow meets at least as often per tick as she does is marked **the code's**. One the shadow does not meet, or meets clearly less, is marked **hers**.

Also reported:
- every spectrum by class;
- Warp entries and Gt-45 dwells;
- deaths;
- descriptively, the amphidemon spectrum from THE WARP's existing data.
