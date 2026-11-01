# Enochian Watchtower · continuous Antenna companion

The Watchtower consumes the verified Outside ledger produced by the 15-minute Antenna cycle. It is a second, read-only pass over completed encounters: it does not draw cards, poll feeds, replay Amelia's runtime, or alter the Antenna ledger.

## What one Watchtower record preserves

- The source Outside event, source/session sequence, source record digest, prior digest, runtime signal digest, and the event's UTF-8 representation and digest.
- Separate event roles: Subdecadence card candidate, RSS-derived linguistic source item, derived I Ching/Tarot transform, or substrate observation.
- Publication/occurrence time and capture time, source label/reference, original headline where present, and the numerical source route.
- The realized Amelia transition, compact before/after substrate readouts, Governor disposition, and PFM head references.
- Any existing card-to-ingress trace links, including the card-selected Mesh/route and the separately recorded ingress and Amelia transition.
- The active Watchtower row/focus, its observation fields, exact-route recurrence references, and an append-only SHA-256 record link.

The card's Mesh and route remain candidate-generation data. They are not counted as evidence that a later source item is novel. I Ching and Tarot events retain their source-item linkage and are marked as derived transforms, not independent feed sources.

## Aperture cycle

The matrix focus is selected from the already-recorded post-encounter Numogram step:

| Row | Focus | Attention in the trace |
|---|---|---|
| MADOLG | Entry and grounding | Source, channel, timestamp, route, input zone |
| VREGZO | Resonance and recurrence | Exact-route/candidate-linked prior encounter references |
| IOIADT | Temporal return | Occurred/captured times, sequence order, recurrence interval |
| BITOME | Transformation and rupture | Actual transition, activation/deformation change, PFM and Governor references |

Every event is retained; the phase determines which relational features are surfaced for that event. The atlas groups exact observed signatures and links each group to its records. It does not infer an entity class, novelty, or agency.

## Operation and storage

`.github/workflows/outside-continuous-ingress.yml` remains the 15-minute scheduler and invokes this branch's runner after the Antenna ledger commit. GitHub schedules only run workflow definitions present on the default branch, so the default branch carries the small scheduler invocation while Watchtower implementation stays on `enochian-watchtower-antenna-20261101`.

The runner verifies the complete source ledger before processing new source sequences, then writes `ledger.json`, `atlas.json`, `state.json`, and `LATEST.md` to the separate `watchtower-live-ledger` branch. The run is serialized with the Antenna workflow. A source-ledger change behind the saved cursor, a broken record chain, or a sequence gap stops the Watchtower run rather than silently replaying or skipping events.
