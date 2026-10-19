# OUTSIDE-3 v2 D0 design candidate D0C

**Synthetic-only DESIGN run; candidate parameters NOT frozen. No K calibration, no real target, registration closed.**

Plan SHA-256: 317d709a80bba7f023db2bc786cfb57be6c781b43c3b0a9ca5dd4cf5e71d3299
Fixture magnitudes: {"yin":0.012,"yang":0.075,"movement":0.021,"phaseCoherence":0.95,"strainRelaxation":0.025} (NOT frozen v2 constants).
Reference seed 9302001, history seed 9301001, 128 fresh reference casts per window.
Windows: 1, 3, 10. Masks: 0, 21. 192 Hamming-1 pairs per mask, per group.

| Window | History | Events | Minimum changed-zone standardized response | Minimum Hamming-1 score margin | Meets fixture ≥2σ? |
|---:|---|---:|---:|---:|---|
| 1 | FRESH | 0 | 1.923971 | 0.6918636 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W1 | 16 | 1.937240 | 1.672134 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W10 | 171 | 0.9679254 | 9.186647 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W44 | 764 | 0.9679254 | 19.49283 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W88 | 1537 | 0.9553513 | 16.17116 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | SATURATION_FIXTURE | 1654 | 0.9553513 | 23.36380 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | FRESH | 0 | 1.789866 | 0.4788170 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W1 | 16 | 1.790542 | 3.819288 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W10 | 171 | 0.9592285 | 7.932042 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W44 | 764 | 0.8883015 | 9.650577 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W88 | 1537 | 0.8883295 | 0.2568886 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | SATURATION_FIXTURE | 1654 | 0.9251935 | 25.93497 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | FRESH | 0 | 1.817569 | 0.2619105 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W1 | 16 | 1.790552 | 14.47182 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W10 | 171 | 0.9218351 | 0.1227243 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W44 | 764 | 0.9346484 | 3.458188 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W88 | 1537 | 0.9406312 | 7.304451 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | SATURATION_FIXTURE | 1654 | 0.9378992 | 25.36964 | DOES_NOT_MEET_FIXTURE_MARGIN |

Global minimum changed-zone standardized response: 0.8883015220496961.
Global minimum within-output Hamming-1 standardized score margin: 0.12272426694730061.

Variability denominator is 1 standardized reference-population SD of naturally input-varied readouts. This is NOT random noise, not a p-value, and does not imply statistical precision.
Input-response margin is tested by matched forks differing in exactly one resulting bit, from identical pre-working histories; the within-output score margin tests adjacent ranked hypotheses within the same readout. Both are reported because these quantities are not interchangeable.
The saturated fixture is synthetic and constructed separately from the sequential W88 history. A failure of this *one fixture* is an input to separately planned parameter design, NOT grounds for retroactive constant or threshold changes.
Original v1 K3/K4 failures are preserved. No hidden target draw, no calibration, no freeze, no registration.
