# OUTSIDE-3 v2 D0 design candidate D0B

**Synthetic-only DESIGN run; candidate parameters NOT frozen. No K calibration, no real target, registration closed.**

Plan SHA-256: 317d709a80bba7f023db2bc786cfb57be6c781b43c3b0a9ca5dd4cf5e71d3299
Fixture magnitudes: {"yin":0.006,"yang":0.055,"movement":0.016,"phaseCoherence":0.95,"strainRelaxation":0.025} (NOT frozen v2 constants).
Reference seed 9302001, history seed 9301001, 128 fresh reference casts per window.
Windows: 1, 3, 10. Masks: 0, 21. 192 Hamming-1 pairs per mask, per group.

| Window | History | Events | Minimum changed-zone standardized response | Minimum Hamming-1 score margin | Meets fixture ≥2σ? |
|---:|---|---:|---:|---:|---|
| 1 | FRESH | 0 | 1.922082 | 0.7263597 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W1 | 16 | 1.922082 | 3.789337 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W10 | 171 | 1.172230 | 1.149960 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W44 | 764 | 1.152748 | 28.54281 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W88 | 1537 | 1.173660 | 24.75921 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | SATURATION_FIXTURE | 1654 | 1.156651 | 27.61857 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | FRESH | 0 | 1.793088 | 0.5080424 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W1 | 16 | 1.793748 | 6.650312 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W10 | 171 | 1.013154 | 4.307117 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W44 | 764 | 0.9735934 | 11.88831 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W88 | 1537 | 0.9704610 | 0.4907615 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | SATURATION_FIXTURE | 1654 | 1.008870 | 30.90415 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | FRESH | 0 | 1.815360 | 0.2105565 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W1 | 16 | 1.800248 | 18.76500 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W10 | 171 | 0.9280808 | 0.01799994 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W44 | 764 | 0.9451012 | 0.09143063 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W88 | 1537 | 0.9510125 | 4.416082 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | SATURATION_FIXTURE | 1654 | 0.9441900 | 31.10634 | DOES_NOT_MEET_FIXTURE_MARGIN |

Global minimum changed-zone standardized response: 0.9280807696518045.
Global minimum within-output Hamming-1 standardized score margin: 0.017999941981225103.

Variability denominator is 1 standardized reference-population SD of naturally input-varied readouts. This is NOT random noise, not a p-value, and does not imply statistical precision.
Input-response margin is tested by matched forks differing in exactly one resulting bit, from identical pre-working histories; the within-output score margin tests adjacent ranked hypotheses within the same readout. Both are reported because these quantities are not interchangeable.
The saturated fixture is synthetic and constructed separately from the sequential W88 history. A failure of this *one fixture* is an input to separately planned parameter design, NOT grounds for retroactive constant or threshold changes.
Original v1 K3/K4 failures are preserved. No hidden target draw, no calibration, no freeze, no registration.
