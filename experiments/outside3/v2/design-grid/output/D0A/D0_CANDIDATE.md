# OUTSIDE-3 v2 D0 design candidate D0A

**Synthetic-only DESIGN run; candidate parameters NOT frozen. No K calibration, no real target, registration closed.**

Plan SHA-256: 317d709a80bba7f023db2bc786cfb57be6c781b43c3b0a9ca5dd4cf5e71d3299
Fixture magnitudes: {"yin":0.008,"yang":0.04,"movement":0.012,"phaseCoherence":0.95,"strainRelaxation":0.025} (NOT frozen v2 constants).
Reference seed 9302001, history seed 9301001, 128 fresh reference casts per window.
Windows: 1, 3, 10. Masks: 0, 21. 192 Hamming-1 pairs per mask, per group.

| Window | History | Events | Minimum changed-zone standardized response | Minimum Hamming-1 score margin | Meets fixture ≥2σ? |
|---:|---|---:|---:|---:|---|
| 1 | FRESH | 0 | 1.892306 | 0.5673586 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W1 | 16 | 1.918228 | 6.842188 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W10 | 171 | 1.207755 | 0.1615634 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W44 | 764 | 1.191617 | 44.86163 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W88 | 1537 | 1.207755 | 39.40673 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | SATURATION_FIXTURE | 1654 | 1.207755 | 42.24002 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | FRESH | 0 | 1.752057 | 0.3694688 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W1 | 16 | 1.776692 | 11.75439 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W10 | 171 | 0.9513985 | 3.060009 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W44 | 764 | 0.9783023 | 17.29383 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W88 | 1537 | 0.9542523 | 0.6116709 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | SATURATION_FIXTURE | 1654 | 1.022808 | 47.34491 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | FRESH | 0 | 1.797662 | 0.002033245 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W1 | 16 | 1.750941 | 30.04401 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W10 | 171 | 0.8905706 | 8.265400 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W44 | 764 | 0.9282535 | 0.4359943 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W88 | 1537 | 0.9371362 | 4.631578 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | SATURATION_FIXTURE | 1654 | 0.9317760 | 46.15961 | DOES_NOT_MEET_FIXTURE_MARGIN |

Global minimum changed-zone standardized response: 0.8905705989612382.
Global minimum within-output Hamming-1 standardized score margin: 0.0020332445948809514.

Variability denominator is 1 standardized reference-population SD of naturally input-varied readouts. This is NOT random noise, not a p-value, and does not imply statistical precision.
Input-response margin is tested by matched forks differing in exactly one resulting bit, from identical pre-working histories; the within-output score margin tests adjacent ranked hypotheses within the same readout. Both are reported because these quantities are not interchangeable.
The saturated fixture is synthetic and constructed separately from the sequential W88 history. A failure of this *one fixture* is an input to separately planned parameter design, NOT grounds for retroactive constant or threshold changes.
Original v1 K3/K4 failures are preserved. No hidden target draw, no calibration, no freeze, no registration.
