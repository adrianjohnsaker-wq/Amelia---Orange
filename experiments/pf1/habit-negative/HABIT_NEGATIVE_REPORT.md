# PF1-A1 R2 habit-memory negative-control report

**Pre-live, synthetic-only; existing sealed constants unmodified.**

- Pinned PFM source SHA-256: b47beb2b2c73c6bf44827316707b1e79c688c97ad2857c8cad953f01d7925e8f
- **Source discrepancy:** the actual pinned PFM implements linear frequency and strain terms, not tanh. No tanh was added.
- Fixed canonical gate and initial-zone scores; no Governor, no goal or target representation.
- Input tape seed 20261020; 10000 synthetic developmental steps.
- Candidates 126, eligible 42.
- Goal-only passes 39.
- Memory signature passes 0.
- Integration signature passes 0.
- **Complete encounters 0.**
- Sham parity true.

| Pair | Orientation | Detection | Probed instance IDs | Intact wins | Reset wins | Memory | Integration | Goal only | Encounter |
|---|---|---:|---|---:|---:|:---:|:---:|:---:|:---:|
| 1-9 | 9→1 | 9 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 10 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 11 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 2 | false | false | true | false |
| 1-9 | 9→1 | 249 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 250 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 251 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 2 | false | false | true | false |
| 1-9 | 9→1 | 489 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 490 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 491 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 729 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 730 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 731 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 969 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 970 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 971 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 1209 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 1210 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 1211 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 1449 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 1450 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 1451 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 1689 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 1690 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 1691 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 1929 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 1930 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 1931 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 2169 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 2170 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 2171 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 2409 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 2410 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 2411 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 2649 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 2650 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 2651 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 2 | false | false | true | false |
| 1-9 | 9→1 | 2889 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 2890 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 2891 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 3129 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 3130 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 3131 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 3369 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 3370 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 3371 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 3609 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 3610 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 3611 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 3849 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 3850 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 3851 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 4089 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 4090 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 4091 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 4329 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 4330 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 4331 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 4569 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 4570 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 4571 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 4809 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 4810 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 4811 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 5049 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 5050 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 5051 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 5289 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 5290 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 5291 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 5529 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 5530 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 5531 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 2 | 2 | false | false | false | false |
| 1-9 | 9→1 | 5769 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 5770 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 5771 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 2 | 2 | false | false | false | false |
| 1-9 | 9→1 | 6009 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 6010 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 6011 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 6249 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 6250 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 6251 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 2 | false | false | true | false |
| 1-9 | 9→1 | 6489 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 6490 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 6491 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 2 | false | false | true | false |
| 1-9 | 9→1 | 6729 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 6730 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 6731 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 6969 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 6970 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 6971 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 7209 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 7210 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 7211 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 2 | false | false | true | false |
| 1-9 | 9→1 | 7449 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 7450 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 7451 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 7689 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 7690 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 7691 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 2 | false | false | true | false |
| 1-9 | 9→1 | 7929 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 7930 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 7931 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 8169 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 8170 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 8171 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 8409 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 8410 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 8411 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 8649 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 8650 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 8651 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 8889 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 8890 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 8891 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 9129 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 9130 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 9131 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 9369 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 9370 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 9371 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 9609 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 9610 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 9611 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 3 | 3 | false | false | true | false |
| 1-9 | 9→1 | 9849 |  | 0 | 0 | false | false | false | false |
| 1-8 | 1→8 | 9850 |  | 0 | 0 | false | false | false | false |
| 8-9 | 8→9 | 9851 | D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 2 | 2 | false | false | false | false |

**Disposition: NEGATIVE ZERO-ENCOUNTER CHECK PASS.**

The integration branch is necessarily neutral for an architecture with no explicitly suppressible Governor or goal contribution. A full source-faithfulness assessment of the user-described tanh law remains outstanding.

No live genesis or inflow was used; live start not authorised.
