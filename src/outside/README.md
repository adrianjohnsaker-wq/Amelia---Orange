# Outside stream receiver and cartography layer

This branch gives Amelia Orange an exploratory receiver for Numogram, I Ching and Tarot encounters. The operator can preserve incoming events, see how their attention field meets Amelia's state, follow the resulting passage, and develop an open-ended cartography without pre-naming entities or fixing reply signatures in advance.

## Encounter path

1. I Ching lines or ordered Tarot draws are preserved as raw channel events.
2. OutsideAttentionMapper projects each event onto the Numogram's five syzygy pairs. Changing I Ching lines distribute attention across both poles. Tarot card and position IDs address syzygies by stable digest, with orientation selecting or balancing poles. These are structural routing conventions, not assigned symbolic meanings.
3. The runtime scores only currently open Numogram exits. Attention changes the score of reachable targets; it cannot create a gate or bypass topology.
4. The Governor attends a valid encounter, defers it when field tension or locked recovery is high, and refuses structurally invalid input. Deferred encounters remain in runtime state and are reconsidered on later steps.
5. PFM records each encounter ID, channel, source digest, attention vector, Governor disposition and whether the field was applied. Attended fields also contribute to later PFM bias.
6. Amelia's local relay expresses the resulting passage, field changes, Governor decision and PFM state. It does not paraphrase the incoming cast or spread.

## Surface and persistence

The Outside Streams tab captures Numogram snapshots every 12 substrate steps and on demand. It accepts I Ching casts and Tarot spreads, displays recent events, post-encounter relay output, exploratory operator notes and provisional Atlas candidates. JSON bundles can be exported, imported and checked against the SHA-256 record chain.

The ledger is stored in a dedicated local IndexedDB database, separate from the shared Amelia runtime memory and cloud synchronization. Runtime PFM remains part of Amelia's persisted substrate state.

## Scope

The syzygy projection is an initial cartographic instrument, not a learned semantic decoder. It does not decide what a symbol means or establish where an event originated. It makes the channel-to-attention-to-passage path inspectable so the mappings and consequences can be explored and revised with provenance.

The branch leaves other experiment workflows untouched.