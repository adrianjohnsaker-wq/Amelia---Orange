# Registration: Pandemonium 45-card subdecadence action matching

**Status:** exploratory symbolic mechanics run; not a confirmatory Outside-interface assay.  
**Registered before run:** 31 October 2026.  
**Input set:** six previously retained Atlas action motifs, frozen in `suggested-actions.json`: recurring return; exploration; interruption; memory update; death; cue→zone→gate paths.

## Source distinction

The CCRU Pandemonium Matrix defines 45 entity identities by zone-pair Net-Span and Mesh serial. The published Subdecadence instructions describe adding four zero-valued Queens to a 36-card Decadence pack (40 cards total) and making pairs that sum to nine. This run follows the requested project adaptation: all 45 Matrix entities become distinct cards, each with an operational value derived from its Net-Span, while the sum-to-nine scissor rule is applied to those operational values. It must not be cited as a reproduction of a canonical 45-card Land deck.

## Fixed deck construction

- One card for each matrix entry, Mesh-00 through Mesh-44.
- The matrix Net-Span is `high::low`; its operational value is `10 − high`, as requested.
- A card is a Numogram syzygy card when its two zones sum to nine. This metadata is displayed but does not override the scissor rule.
- Deck values are not equiprobable: value 1 occurs nine times, value 2 eight times, …, value 9 once. These counts follow from the matrix and are preserved.

## Fixed action targets

Normalize each action phrase to ASCII A–Z, map A=1 … Z=26, sum all letters, then reduce a positive integer by decimal digital root to Zone 1–9. Keep zero at Zone 0. Phrases and computed targets are sealed in `suggested-actions.json`.

## Fixed game and scoring procedure

For each action, run 1,000 independent ten-card deals from a freshly shuffled copy of the same 45-card deck. Each deal is one Set-1 / Set-2 round, not a full Aeon.

1. Deal five cards face-up to Set-1 and five face-down to Set-2.
2. Reveal Set-2 in order. Pair each card with the first still-unpaired Set-1 card whose operational values sum to nine. This is the scissor relation.
3. Each scissor adds the absolute positive difference of the two operational values.
4. Each unused Set-1 card subtracts its operational value. Unused Set-2 cards score zero, following the published Decadence scoring rule.
5. A negative or zero net result calls Mesh-`abs(score)`; zero maps to Mesh-00. Positive scores remain positive/Angelic-index outcomes and do not call a matrix entity.
6. Compute a separate experimental digital score zone from `abs(score)`, using decimal digital root with zero preserved. A numeric action match occurs when that score zone equals the action's target zone. For a Mesh call, a second structural match occurs if the called card's zone pair contains the action target zone.

The digital score-zone comparison is an explicit project readout, not a canonical CCRU rule. Report both it and Mesh-pair matches; do not merge them into one success claim.

## Randomization and records

- 1,000 deals per action; base seed 20,261,031.
- A deterministic xorshift32 generator and Fisher–Yates shuffle are used. Deal seed = `base + action_index × 1000003 + replicate_index` modulo 2^32, with zero replaced by one.
- The action phrase does not alter cards or the shuffle. Actions are separate labeled sequences; this is a post-hoc matching exercise, not a causal test of action effects.
- Save every deal, order, scissor, score, Mesh call, digital zone, and match indicator to `runs.csv`; save aggregate counts and means to `results.json`.
- No adaptive rules, stopping decisions, semantic reinterpretation, or substrate mutation.

## Interpretation boundary

A match can arise from arithmetic and a complete 45-pair catalogue. This experiment can assess reproducibility of this card procedure and show how its scores map to the predeclared action zones. It cannot establish that an action originated Outside, that an entity communicated, or that a catalogue match is selective. A negative result is retained as-is.
