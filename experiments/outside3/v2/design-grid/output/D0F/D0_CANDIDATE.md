# OUTSIDE-3 v2 D0 design candidate D0F

**Synthetic-only DESIGN run; candidate parameters NOT frozen. No K calibration, no real target, registration closed.**

Plan SHA-256: 317d709a80bba7f023db2bc786cfb57be6c781b43c3b0a9ca5dd4cf5e71d3299
Fixture magnitudes: {"yin":0.01,"yang":0.165,"movement":0.046,"phaseCoherence":0.95,"strainRelaxation":0.025} (NOT frozen v2 constants).
Reference seed 9302001, history seed 9301001, 128 fresh reference casts per window.
Windows: 1, 3, 10. Masks: 0, 21. 192 Hamming-1 pairs per mask, per group.

| Window | History | Events | Minimum changed-zone standardized response | Minimum Hamming-1 score margin | Meets fixture ≥2σ? |
|---:|---|---:|---:|---:|---|
| 1 | FRESH | 0 | 1.934132 | 0.8011133 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W1 | 16 | 1.934132 | 0.4626520 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W10 | 171 | 0.9638832 | 1.463384 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W44 | 764 | 0.9508582 | 2.181942 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W88 | 1537 | 0.9562608 | 3.220566 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | SATURATION_FIXTURE | 1654 | 0.9562608 | 9.992289 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | FRESH | 0 | 1.811057 | 0.5738658 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W1 | 16 | 1.811854 | 0.001623224 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W10 | 171 | 0.9613523 | 4.080767 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W44 | 764 | 0.8948669 | 2.353579 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W88 | 1537 | 0.8950028 | 3.243346 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | SATURATION_FIXTURE | 1654 | 0.8939172 | 10.78999 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | FRESH | 0 | 1.847343 | 0.1398815 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W1 | 16 | 1.754974 | 4.256875 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W10 | 171 | 0.9011161 | 0.4866053 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W44 | 764 | 0.9200449 | 1.733939 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W88 | 1537 | 0.9232930 | 1.816841 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | SATURATION_FIXTURE | 1654 | 0.9197658 | 11.18376 | DOES_NOT_MEET_FIXTURE_MARGIN |

Global minimum changed-zone standardized response: 0.8939172040361223.
Global minimum within-output Hamming-1 standardized score margin: 0.0016232239330483897.

Variability denominator is 1 standardized reference-population SD of naturally input-varied readouts. This is NOT random noise, not a p-value, and does not imply statistical precision.
Input-response margin is tested by matched forks differing in exactly one resulting bit, from identical pre-working histories; the within-output score margin tests adjacent ranked hypotheses within the same readout. Both are reported because these quantities are not interchangeable.
The saturated fixture is synthetic and constructed separately from the sequential W88 history. A failure of this *one fixture* is an input to separately planned parameter design, NOT grounds for retroactive constant or threshold changes.
Original v1 K3/K4 failures are preserved. No hidden target draw, no calibration, no freeze, no registration.
