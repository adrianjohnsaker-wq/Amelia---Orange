# OUTSIDE-3 v2 D0 design candidate D0D

**Synthetic-only DESIGN run; candidate parameters NOT frozen. No K calibration, no real target, registration closed.**

Plan SHA-256: 317d709a80bba7f023db2bc786cfb57be6c781b43c3b0a9ca5dd4cf5e71d3299
Fixture magnitudes: {"yin":0.018,"yang":0.095,"movement":0.027,"phaseCoherence":0.95,"strainRelaxation":0.025} (NOT frozen v2 constants).
Reference seed 9302001, history seed 9301001, 128 fresh reference casts per window.
Windows: 1, 3, 10. Masks: 0, 21. 192 Hamming-1 pairs per mask, per group.

| Window | History | Events | Minimum changed-zone standardized response | Minimum Hamming-1 score margin | Meets fixture ≥2σ? |
|---:|---|---:|---:|---:|---|
| 1 | FRESH | 0 | 1.922157 | 0.6418112 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W1 | 16 | 1.922157 | 0.3075536 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W10 | 171 | 0.9498782 | 0.9089763 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W44 | 764 | 0.9390842 | 14.11534 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W88 | 1537 | 0.9340341 | 6.961313 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | SATURATION_FIXTURE | 1654 | 0.9340341 | 20.16067 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | FRESH | 0 | 1.782060 | 0.4361581 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W1 | 16 | 1.782750 | 1.979959 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W10 | 171 | 0.9480955 | 10.18820 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W44 | 764 | 0.8806516 | 8.694272 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W88 | 1537 | 0.8706605 | 4.757777 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | SATURATION_FIXTURE | 1654 | 0.8803524 | 22.21350 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | FRESH | 0 | 1.811264 | 0.04742517 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W1 | 16 | 1.761780 | 11.65632 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W10 | 171 | 0.9062510 | 0.001143848 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W44 | 764 | 0.9204112 | 3.224993 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W88 | 1537 | 0.9097912 | 7.922853 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | SATURATION_FIXTURE | 1654 | 0.9241387 | 21.42870 | DOES_NOT_MEET_FIXTURE_MARGIN |

Global minimum changed-zone standardized response: 0.8706604848483881.
Global minimum within-output Hamming-1 standardized score margin: 0.0011438475948034011.

Variability denominator is 1 standardized reference-population SD of naturally input-varied readouts. This is NOT random noise, not a p-value, and does not imply statistical precision.
Input-response margin is tested by matched forks differing in exactly one resulting bit, from identical pre-working histories; the within-output score margin tests adjacent ranked hypotheses within the same readout. Both are reported because these quantities are not interchangeable.
The saturated fixture is synthetic and constructed separately from the sequential W88 history. A failure of this *one fixture* is an input to separately planned parameter design, NOT grounds for retroactive constant or threshold changes.
Original v1 K3/K4 failures are preserved. No hidden target draw, no calibration, no freeze, no registration.
