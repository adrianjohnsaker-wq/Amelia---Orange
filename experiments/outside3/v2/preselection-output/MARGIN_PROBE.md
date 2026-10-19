# OUTSIDE-3 v2 pre-selection saturation/margin feasibility

**Synthetic-only measurement. NOT v2 calibration or selected parameters. No real target generated; registration closed.**

Plan SHA-256: d293aff84475c244cabb7edf5e14ea429301be2d3398d4583ad6a7c5cd268193
Fixture magnitudes: {"yin":0.011,"yang":0.031,"movement":0.008,"phaseCoherence":0.95,"strainRelaxation":0.025} (NOT frozen v2 constants).
Reference seed 9202001, history seed 9201001, 192 fresh reference casts per window.
Windows: 1, 10. Masks: 0, 21. 192 Hamming-1 pairs per mask, per group.

| Window | History | Events | Minimum changed-zone standardized response | Minimum Hamming-1 score margin | Meets fixture ≥2σ? |
|---:|---|---:|---:|---:|---|
| 1 | FRESH | 0 | 1.788458 | 0.6055222 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W1 | 17 | 1.788458 | 6.264029 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W10 | 167 | 1.166386 | 8.865742 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W44 | 755 | 1.127506 | 66.92094 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W88 | 1518 | 1.147174 | 55.90330 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | SATURATION_FIXTURE | 1633 | 1.180414 | 65.24712 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | FRESH | 0 | 1.801394 | 0.2764501 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W1 | 17 | 1.884015 | 50.17221 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W10 | 167 | 0.9286889 | 20.24187 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W44 | 755 | 0.9596983 | 0.5650183 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W88 | 1518 | 0.9622219 | 15.45866 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | SATURATION_FIXTURE | 1633 | 0.9238156 | 77.24981 | DOES_NOT_MEET_FIXTURE_MARGIN |

Global minimum changed-zone standardized response: 0.9238156045083343.
Global minimum within-output Hamming-1 standardized score margin: 0.27645012866116314.

Variability denominator is 1 standardized reference-population SD of naturally input-varied readouts. This is NOT random noise, not a p-value, and does not imply statistical precision.
Input-response margin is tested by matched forks differing in exactly one resulting bit, from identical pre-working histories; the within-output score margin tests adjacent ranked hypotheses within the same readout. Both are reported because these quantities are not interchangeable.
The saturated fixture is synthetic and constructed separately from the sequential W88 history. A failure of this *one fixture* is an input to separately planned parameter design, NOT grounds for retroactive constant or threshold changes.
Original v1 K3/K4 failures are preserved. No hidden target draw, no calibration, no freeze, no registration.
