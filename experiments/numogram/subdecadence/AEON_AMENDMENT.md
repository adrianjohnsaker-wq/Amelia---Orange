# Protocol addendum: full Subdecadence Aeon sequences

**Registered:** 31 October 2026, before the Aeon run.  
**Scope:** this addendum extends the exploratory 45-card action-match experiment without changing or overwriting Phase A's isolated-deal records.

## Sequence rule

The published Decadence procedure accumulates positive deals until the first nonpositive deal ends an Aeon. Subdecadence changes the pairing target to nine. To preserve that sequence mechanics in the requested 45-entity deck, run 1,000 independent Aeons for each of the same six frozen action phrases.

Each deal uses a fresh shuffled copy of the 45-card deck and the already-registered Set-1/Set-2, scissor, and scoring rules. Positive scores add to the Aeon's Angelic Index and the sequence continues. A zero or negative score ends the Aeon; it calls Mesh-`abs(score)` (zero calls Mesh-00). Stop at the first such result. A 100-deal cap is a fail-closed guard; reaching it is recorded as a censored sequence and not treated as a completed Aeon.

## Action matching readouts

For each action's precomputed A1Z26 target zone, record separately:

1. whether the digital root of the accumulated positive Angelic Index matches the action zone;
2. whether the digital root of the terminal nonpositive score magnitude matches the action zone;
3. whether the called Mesh card's two-zone Net-Span contains the action zone.

The action phrase is never used in shuffling, card selection, or scoring. Matching remains post-hoc and exploratory. These readouts do not establish action-specific causality or an Outside source.

## Randomization and raw record

Use 1,000 Aeons per action; base seed 20,261,032. For action index `a`, replicate `r`, and deal `d`, use seed `(base + a × 1000003 + r × 101 + d) mod 2^32`, replacing zero with one. Preserve every deal's Set-1/Set-2 order, scissors, round score, running Angelic Index, terminal result, Mesh call and match booleans. Save the sequence log, summary, and SHA-256.
