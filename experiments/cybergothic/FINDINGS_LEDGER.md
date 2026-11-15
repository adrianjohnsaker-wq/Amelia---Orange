# The Cybergothic line: findings ledger (as reported by the prototype session, 14–15 Nov 2026)

**Source.** `SOURCE_LOG_2026-11-15.txt` (the operator's export of the prototype session).

**Status.**
- **CORROBORATED:** independently re-run here, and it agrees.
- **REPRODUCED:** every saved branch replays identically, and the reported numbers recompute exactly from the saved records.
- **PENDING:** needs the developed prototype's code and evidence, which are not yet in this repository.

All plans in the source were sealed locally, not by public RFC 3161 seal.

| # | Study | Reported result | Status |
|---|---|---|---|
| P0 | Audit of the supplied engine | Ghost hosts and shared corpse lists in 30/30 supplied runs, 0/30 repaired; without reseeding, zero hosts at cycle 100 in 14/30 supplied, 29/30 repaired | **CORROBORATED** (`prototype0/AUDIT.md`), except the supplied extinction count: 22/30 here |
| R1 | Experienced vs pointer-selected vs shuffled fragments (463 encounters, 60 populations) | First-action uptake +0.00564 (97.5% CI +0.00108 to +0.01034) vs pointer-selected; +0.00683 (+0.00272 to +0.01098) vs shuffled; no clear advantage over 12 units | PENDING |
| R2 | Costed code echo (235 encounters, 60 populations) | Intact experienced copy at 24 units: 60.8% vs 29.6% (+31.25 pp, 97.5% CI +22.36 to +40.56); uptake vs shuffled echo +0.019 (−0.041 to +0.078); survival 146 / 155 / 156 of 235 | PENDING |
| R3 | Zone promoter (240 encounters) | Uptake, zone-gated minus open: −0.082 (98.33% CI −0.160 to −0.007); payload actions 2.15 vs 9.78 | PENDING |
| R4 | Donor-provenance header; no-op slide vs jump | All 5 uptake comparisons null (99% CIs include 0). Slide vs jump survival 216/240 vs 176/240 (+16.7 pp, 95% CI +10.4 to +23.8), confirmed in a fresh study; misdirected slide 220/240 | PENDING (results report received; evidence package not) |
| R5 | Self-parsing codon grammar (80 z body 09 genes, 60 body 09 introns) | Introns arise and are executed in 30/30 populations (6,729 no-ops); population benefit inconclusive (+97, −207 to +409; +204, −67 to +479) | **REPRODUCED**: replay 600/600 branches; numbers recomputed exactly. Fresh replication: REP-1 |
| R6 | Viral insertions at stop codons (540 populations; matched cohort 246) | 836 boundary infections: 216 rebuilt, 357 extended, 263 lost. Survival: intact 220/246 vs ruptured 195/246 (+10.2 pp, 97.5% CI +4.1 to +16.3) vs forced execution 191/246 (+11.8, +5.7 to +18.3); exposure controls alike. Births 47 vs 68 (exploratory). The larger cohort was planned after the first was inspected. | **REPRODUCED**: replay 2,694/2,694 branches; numbers recomputed exactly (VALIDATION.md). Fresh replication: REP-1 |
| R7 | Sealed chimeric-junction cohort (seeds 50001–50360, 250 grafts, 1,250 branches) | Horizontal junction transfer rare (5 deliveries, 3 hosts, 3 populations); primary union 0/250 (95% CI 0–1.5%); both matched comparisons null; exploratory survival 181 vs 155 (+10.4 pp, +3.2 to +17.6); lookalikes 6/6 (6-digit), 1/1 (8-digit) | PENDING (design package received; protocol hashes 9/9 OK; results package not) |
| R8 | Delivery-locked follow-up (draft); seed 50176 audit | A protocol draft, not run | n/a |

**What recurs across studies.** Suppressing execution (no-op slides, intact introns) protects hosts by about 10–17 points of
survival in R4, R6 and R7, while code transfer brings only immediate, short-lived gains (R1, R2). This is the line's most
consistent result, and the first to corroborate.
