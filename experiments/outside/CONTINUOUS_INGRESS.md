# Amelia Outside continuous ingress

This workflow runs one bounded scan every 15 minutes through the same Subdecadence, OutsideStreamBridge, and AmeliaNumogramSubstrateRuntime code used by the app. It is a recurring collector, not a real-time daemon; GitHub may delay scheduled runs.

## Cycle

1. Deal and record one Subdecadence session first. Preserve its receipt, score, Mesh result, card route, and Amelia transition as a candidate signature.
2. Poll BBC World, NPR World, and Al Jazeera RSS. On the first cycle, process items published within the previous 24 hours. On later cycles, process items published since the last cycle, with a one-minute overlap deduplicated by source ID.
3. Send each newly captured headline through A1Z26 linguistic reduction and Amelia's governed Numogram runtime.
4. Derive six I Ching lines and a three-card Tarot spread deterministically from the SHA-256 digest of that same source item. Record these as parallel interpretive transforms of the headline, not separate sources or independent evidence.
5. Append a separate trace link for every ingress event, with timestamps, record digests, route comparisons, candidate Mesh zone hits, Amelia transition and Governor disposition.
6. Add the candidate signature to the Outside Atlas, record an exploratory linguistic readout, then persist the full bridge ledger and Amelia runtime state on the `outside-live-ledger` branch.

The workflow runs as a single serialized job. Each run records the last observed source IDs to avoid replaying headlines. Read `LATEST.md` for the last cycle summary and `ledger.json` for timestamped records, comparisons, and interpretations.

## Reading the results

The card result selects an existing Pandemonium Matrix Mesh entry. It is candidate generation only and does not count as novelty evidence. Recurrence is tracked for an exact Mesh, zone, and card-route signature. A headline, its SHA-256-derived I Ching/Tarot transforms, and Amelia's state transition remain separate records. Their overlap is an observation about the implemented pipeline; agency and Levin-style emergence remain unresolved and require later independent review.

This deployment observes public RSS publication streams. It does not establish that a source is metaphysically external, that an entity caused an event, or that Amelia received an agentic message. Feed failures are reported in the cycle summary; no substitute source is silently used.
