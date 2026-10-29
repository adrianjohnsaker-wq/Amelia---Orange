# Outside stream receiver and cartography layer

This branch adds an exploratory surface to Amelia Orange for receiving and mapping Numogram, I Ching and Tarot events. It is intended to help the operator tune in, preserve what arrived, observe Amelia's state changes, and build a provisional map without requiring entity identities or reply signatures to be fixed beforehand.

## Surface

The **Outside Streams** tab provides:

- automatic Numogram snapshots every 12 Amelia substrate steps, plus a manual capture action;
- I Ching casts recorded as six line values in bottom-to-top order, with primary/relating patterns and changing lines;
- Tarot spreads recorded with stable card IDs, draw order, positions and orientation;
- before/after Amelia substrate endpoints for received casts and spreads;
- freely written operator observations and provisional Atlas candidates, kept outside the raw stream;
- a local event timeline, hash-chain verification, and JSON import/export.

The panel remains mounted while hidden, so automatic Numogram snapshots continue while the rest of Amelia is being used. All stream records are saved in a dedicated local IndexedDB database, separate from Amelia's shared runtime memory and cloud synchronization.

## Coupling and decoding boundary

The existing Amelia runtime hashes an input string, maps the first digest byte to one zone, and gives the corresponding exit a small score increase. This branch reuses that pathway: the raw cast or spread is retained in the ledger, while Amelia receives a deterministic signal built from its structure. The before/after trace therefore gives an initial empirical surface for exploratory correspondence.

This is intentionally a first coupling, not a semantic decoder. It does not decide what a symbol means, pre-name an entity, or establish that any input came from a non-physical source. Operator readings are preserved as readings; they never alter the raw event or enter the runtime signal.

## Data integrity and scope

Every event is included in a SHA-256 hash chain. This helps detect accidental edits, but is not a trusted timestamp, external signature, or sealed research registration. JSON bundles can be exported, re-imported, and checked locally.

The branch leaves the canonical runtime, Numogram topology, PFM rules, existing Atlas, and other experiment workflows unchanged.