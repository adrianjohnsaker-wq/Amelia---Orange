# AMELIA-LIVE-TABLET-GATE-2: consolidation calibration

**One use of the existing Consolidate operation did not reopen source admission in this saved state.** This is a two-arm engineering calibration on copies of one tablet checkpoint; it was not applied to the live tablet.

| Measure | No consolidation | One consolidation |
|---|---:|---:|
| Governor tension at the saved checkpoint | 0.7634 | 0.7634 |
| Tension after the matched bare runtime step | 0.7849 | 0.7560 |
| Lowest audited tension across 40 source steps | 0.8038 | 0.7603 |
| Current source offers admitted | 0 of 40 | 0 of 40 |
| Current source offers deferred | 40 of 40 | 40 of 40 |
| Previously deferred source offers later admitted | 0 | 0 |

The encounter rule requires audited tension below 0.72 for this attention gate. The existing operation reduced the measured tension relative to the matched control, but not enough to admit any of the tested offers. Its branch added one `CONSOLIDATE` event and one bare `STEP`; the control added the matched bare `STEP`. Both preserved the original 50-event digest prefix. Because neither arm reached the registered minimum of five immediate source admissions, neither provides a valid source-effect test.

The calibration procedure was committed before execution at `c7aaf0aa33f50be434d7edc993403ef45fc6636f`. Independent recalculation checked all **80** source rows, decisions, source/body digest bindings, thresholds and original memory-event prefixes. A separate checker reopened both final field/runtime checkpoints and verified their checksums, source states and original memory-event prefixes.

- Private trace SHA-256: `115f1c56e3b99750662414f3373bd6c25ed959bbb55fe4aa0e979dedce4d28f1`.
- Private summary SHA-256: `3cf15d77e49f6c24c409b7159a84fd77cab61ef1e507e90fa4c6eb2545e3777c`.

This calibration does not justify instructing the user to consolidate repeatedly or to alter the Governor. The live tablet's source remained disabled at the last cloud check; a real-device source run has not been observed.
