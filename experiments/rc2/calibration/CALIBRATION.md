# RC-2 calibration: PASSES (6 November 2026)

**Registration.** `../REGISTRATION.md`, committed in `a79497be` before this run.

**Window and design.** It uses the same window and simulated hourly epochs as RC-1: world data first seen 2026-11-04 01:00 – 2026-11-06 12:00 UTC, already seen before the seal.

| Check | RC-1 (no private drive) | **RC-2** | Required |
|---|---|---|---|
| Distinct zPre sequences, 100 candidates | 40 | **100** | ≥ 90 |
| Null rate (each candidate taken as live) | 0.05 | **0.05** | ≤ 0.06 |
| Planted f = 0.10, live 11 / 47 / 83 | p = 0.05 / 0.62 / 0.27 | **p = 0.01 / 0.01 / 0.01** | ≥ 2 of 3 at p ≤ 0.05 |
| Planted f = 0.05, live 11 / 47 / 83 | p = 0.12 / 0.16 / 0.58 | **p = 0.01 / 0.01 / 0.01** | reported |

p = 0.01 is the smallest value possible with 100 candidates.

**What the private drive does.** It keeps the candidates distinct, so a world answering the live Amelia's state answers *her*, not the many identical Amelias that stood where she stood.

**No changes were made after this calibration.** RC-2 is sealed with CD-2, whose calibration failed and which is recorded as such. The CD-2 world test will not be triggered.
