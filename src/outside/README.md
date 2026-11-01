# Outside linguistic ingress and cartography layer

This branch adds a continuous language-to-Numogram path to the existing Outside stream receiver.

## Material flow

1. Preserve the submitted text, source label, optional reference, cipher choice and timestamp as one raw event.
2. Normalize Latin letters with Unicode decomposition, remove diacritics, uppercase, and split into alphabetic tokens. Punctuation and non-Latin characters do not contribute to the numerical sum; the original text remains in the event.
3. Apply the selected explicit value table per letter: **A1Z26** (A=1…Z=26) or **Atbash 1–26** (Z=1…A=26). Sum each token, factor each integer into primes, and digitally reduce each token sum to a zone. Sum the token values for the aggregate number and reduce it to a result zone.
4. Form a transparent route from the word zones followed by the aggregate result zone. Compare every adjacent zone pair against the 45-entry Lemurian Pandemonium Matrix. Record each catalogue match alongside the exact numeric route.
5. Project the word-zone counts and aggregate result zone into an attention vector. The runtime applies its existing Governor, open-gate topology and substrate state to the encounter. Record the actual before/after substrate passage separately and compare that realized pair with the same catalogue.
6. Append the full input, reduction, pre-runtime lore comparisons, realized passage, snapshots, runtime signal digest and linked record digest to the local Outside ledger.

The existing I Ching, Tarot and Numogram observation channels remain available. Lore is a post-reduction comparison layer: catalogue names and classifications do not choose the numerical result, alter the attention vector, or force a runtime passage.

## Numerical scope and limits

A1Z26 is the default cipher convention for this receiver. Atbash 1–26 is an explicit alternate for side-by-side exploration. Both are project-configurable conventions, not a claim that one recovers a uniquely canonical Land cipher. Prime factorization is recorded as a base-independent description of the resulting integers; it is not presented as a verified implementation of Land's Plexenomy.

The event also records the Numogram's stated net-span total of **360** and whether the aggregate text sum equals it. This is a cross-reference only; the value is not injected into the reduction or treated as evidence of an outside intelligence. Likewise, the word-zone route is a numerical comparison path over the pair catalogue, not the Book of Paths' textual Rite routes. A structured, provenance-checked Book of Paths source would be needed to claim those matches.

The pipeline makes the operations inspectable and repeatable for a fixed text and cipher. A match in a symbolic catalogue is a correspondence within the chosen mapping; by itself it does not establish that the text originated Outside or that the Numogram causally interfaces with an external mind.

## Persistence

Events and interpretation notes use the separate local IndexedDB ledger. JSON bundles can be exported, imported and verified against the SHA-256 record chain. Runtime PFM remains part of Amelia's persisted substrate state.


## Subdecadence event flow

The receiver can deal an automatic Subdecadence session with a replayable Web Crypto shuffle receipt. Each raw card is retained with its value-zone and cross pylon; nine-sum pairings, signed Aeon scores, cumulative score, and terminal Mesh entry remain in the event. The attention map is the normalized frequency of the card values actually drawn (zones 0–9). Amelia's Governor then attends, defers, or refuses that `SUBDECADENCE` encounter, and the live Numogram runtime determines the realized passage. The card-derived syzygy route, terminal Matrix result, and Amelia's realized transition are stored separately. No terminal Mesh zone is imposed as a target.

