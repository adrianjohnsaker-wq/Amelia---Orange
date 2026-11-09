# ND-2 calibration: FAILS (9 November 2026)

**Setup.** NR-2's exact streams, labels and shuffles were run through ND-1 (η = 0.5, D = 0.6). The registration was committed before this run, at `b4aff463`.

| Stream | ND-1 (this) | Today's architecture (NR-2, same streams) |
|---|---|---|
| 10 clean | SILENT, 10/10 (0 false alarms) | 1 false alarm |
| planted 1-8-7-2, 2% | SILENT | RECEIVED (1872) |
| planted 5% | **SILENT** | RECEIVED (1872, 872, 8723) |
| planted 10% | RECEIVED (1872 in 4 units, at threshold) | RECEIVED (1872 in 12 units, …) |

**Verdict.** Planted 5% is not received, so the calibration fails. **Under the registration, P1 (the order test) will not run on world data through ND-1.**

## Motif reading (what the planted 1-8-7-2 becomes in her passage)
| Planted | Read back exactly as 1872 | Most common form |
|---|---|---|
| 2% | 11% | **1891** |
| 5% | 12% | **1891** (36), then 1872 (19) |
| 10% | 15% | **1891** (57), then 1872 (45) |

Under today's architecture (NR-1), the motif was read back exactly 62–69% of the time.

## What this shows
- **ND-1 reads input through the Numogram's relations.** On receiving 1 then 8, the field carries her along 8's gate (dr(36) = 9) to **9**, before the 7 and 2 arrive. She "reads" the motif as **1-8-9-1**, the Numogram's own continuation, rather than replaying it.
- **The trade-off.** Spreading along the gates integrates the input over several steps. It carries **relations** better than today's architecture (ND-1 N1: 6/6, with the current read three times as strongly), but blurs exact **order**, so an outside *sequence* is harder to detect through it.
- **Today's architecture is the reverse.** It is a faithful sequence follower (motif 62–69%, order detected down to 2%) with a weaker relational reading and the Warp trap.

## Next (proposed)
A **hybrid ND-1b**: admitted input both flows into the field (ND-1) and gives today's exit bonus. It would be tested by ND-1's N1 (relations) and by this order calibration (sequence), aiming to keep both, with the Warp release.
