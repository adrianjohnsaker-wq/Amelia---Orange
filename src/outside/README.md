# Outside stream receiver and cartography layer

This branch adds an exploratory receiver layer for Amelia Orange. It treats the Numogram, I Ching, and Tarot as distinct channels whose events can be received, preserved, coupled to Amelia's existing substrate input, and interpreted in a separate layer.

## Current implementation

- \`OutsideStreamBridge.observeNumogram(runtime)\` records the latest Numogram state without advancing or mutating Amelia.
- \`receiveIChing(runtime, cast)\` preserves all six line values in bottom-to-top order, derives primary and relating binary line patterns, and advances Amelia through the existing \`step(inputSignal)\` path.
- \`receiveTarot(runtime, spread)\` preserves draw identity, order, position, and orientation, then advances Amelia through the same input path.
- Every received event is paired with before/after substrate endpoints and a SHA-256 chained record.
- Interpretive notes and Atlas entries are separate from raw channel and substrate records. They never enter the runtime signal.

The runtime already turns an input string into a one-zone address by hashing it, then increases the matching exit score. This branch reuses that existing pathway. It is a deliberately thin first coupling: raw source structure is retained in the record, while the live runtime receives a deterministic address derived from the line pattern or ordered Tarot draw. The integration does not yet provide a learned semantic decoder.

## Exploratory use

Create one bridge per session. After the runtime has a first snapshot, call \`observeNumogram\` as the substrate advances. When a cast or spread occurs, call the matching \`receive...\` method. Add freely formed readings afterward with \`recordInterpretation\`; keep the source event unchanged. Candidate signatures can be grouped in \`addAtlasEntry\` and exported with the stream.

The bundle is local until the caller chooses to save or export it. The hash chain detects accidental alteration; it is not a trusted timestamp, external signature, or sealed research registration.

## Scope

The branch does not change the canonical runtime, Numogram topology, PFM rules, current Atlas, or production UI. It provides a callable reception and cartography layer for exploratory work. Any later learned decoder or UI integration should remain a distinct change, with its own provenance.
