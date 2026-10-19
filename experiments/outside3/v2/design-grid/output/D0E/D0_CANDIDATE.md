# OUTSIDE-3 v2 D0 design candidate D0E

**Synthetic-only DESIGN run; candidate parameters NOT frozen. No K calibration, no real target, registration closed.**

Plan SHA-256: 317d709a80bba7f023db2bc786cfb57be6c781b43c3b0a9ca5dd4cf5e71d3299
Fixture magnitudes: {"yin":0.022,"yang":0.13,"movement":0.036,"phaseCoherence":0.95,"strainRelaxation":0.025} (NOT frozen v2 constants).
Reference seed 9302001, history seed 9301001, 128 fresh reference casts per window.
Windows: 1, 3, 10. Masks: 0, 21. 192 Hamming-1 pairs per mask, per group.

| Window | History | Events | Minimum changed-zone standardized response | Minimum Hamming-1 score margin | Meets fixture ≥2σ? |
|---:|---|---:|---:|---:|---|
| 1 | FRESH | 0 | 1.926864 | 0.6962616 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W1 | 16 | 1.926864 | 0.3672951 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W10 | 171 | 0.9436957 | 2.114339 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W44 | 764 | 0.9436957 | 3.816366 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | W88 | 1537 | 0.9436957 | 0.9477181 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 1 | SATURATION_FIXTURE | 1654 | 0.9436957 | 14.97812 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | FRESH | 0 | 1.792404 | 0.4829258 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W1 | 16 | 1.785963 | 0.1394368 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W10 | 171 | 0.8893628 | 6.626410 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W44 | 764 | 0.8814819 | 8.254414 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | W88 | 1537 | 0.8815230 | 4.390141 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 3 | SATURATION_FIXTURE | 1654 | 0.8818573 | 16.36409 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | FRESH | 0 | 1.823839 | 0.01880235 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W1 | 16 | 1.744013 | 7.246889 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W10 | 171 | 0.8954686 | 0.002834700 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W44 | 764 | 0.9136935 | 2.770792 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | W88 | 1537 | 0.9165620 | 4.517704 | DOES_NOT_MEET_FIXTURE_MARGIN |
| 10 | SATURATION_FIXTURE | 1654 | 0.9094235 | 15.92556 | DOES_NOT_MEET_FIXTURE_MARGIN |

Global minimum changed-zone standardized response: 0.8814819012749435.
Global minimum within-output Hamming-1 standardized score margin: 0.002834699933334271.

Variability denominator is 1 standardized reference-population SD of naturally input-varied readouts. This is NOT random noise, not a p-value, and does not imply statistical precision.
Input-response margin is tested by matched forks differing in exactly one resulting bit, from identical pre-working histories; the within-output score margin tests adjacent ranked hypotheses within the same readout. Both are reported because these quantities are not interchangeable.
The saturated fixture is synthetic and constructed separately from the sequential W88 history. A failure of this *one fixture* is an input to separately planned parameter design, NOT grounds for retroactive constant or threshold changes.
Original v1 K3/K4 failures are preserved. No hidden target draw, no calibration, no freeze, no registration.
