# HYST-1L result: what her Warp-born gates do (17 November 2026)

**The run.**
- **Workflow.** GitHub Actions run 44143522877, started 18:02 UTC on 17 November 2026, completed successfully.
- **Starting copy.** Revision 673, step 11,282, `outside-lane-v1`, Θ = 12, nine Warp-born gates: 3→0, 3→4, 3→7, 3→8, 6→0, 6→1, 6→2, 6→4, 6→8.
- **Spans.** Twelve half-day spans, 11 November 18:00 to 17 November 18:00 UTC. They hold 43–48 ticks and 73–123 Outside offers each, with no offer missing. Each span gives 718–828 runtime steps per arm.
- **Determinism.** The repeated pair is identical.
- **Arms.** As registered:
  - ALL, NO-PLEX and NONE run with gate-writing frozen;
  - LIVE-ALL and LIVE-STRIPPED run with gate-writing on.

All five arms of a span start from the same state and receive the same offers.

---

## What we have learned about Warp activity

**Her Warp-born gates do not act as pressure valves. They make her Warp circulate.**
- **What the gates change.** With her gates and with gate-writing frozen (ALL), she enters the Warp about twice as often as without them (NONE), and stays a shorter time each visit:
  - 18.4 against 8.9 entries per 1,000 steps;
  - stays of 5.2 against 8.3 steps.
- **What they do not change.** Her total share of time in the Warp is the same: 7.8% against 7.2%.
- **How she re-enters.** The whole difference in entries is carried by flow: 13.4 against 2.1 per 1,000, higher in all 12 spans.

**Her most used Warp-born gate is a way back in.**
- **The gate.** Gate 6→2 is the threshold gate, leading from the Warp to zone 2, which stands at the Warp's edge (2→3).
- **How often she takes it.** It carried 62 of the 143 exits she made by gate.
- **Where it takes her.** In 43 of those 62 she was back in the Warp five steps later.
- **Gate 6→4.** It carried 29 exits, and she was back in the Warp five steps later in 10.

**Leaving and re-entering.** The gates turn a long, closed stay into frequent short visits joined by a return route. This descriptive finding fits the registered ones:
- She leaves when given a door (WARP-X1).
- Her rise in entries has been carried by flow (WT-4L).

**The Plex gates are exits, but rarely used.**
- **Where they lead.** When she leaves by 3→0 or 6→0 she does not come back quickly: in none of their 16 uses was she in the Warp five steps later.
- **What removing them changes.** Very little: time out, entries, stays and recovery are all unchanged within noise (ALL against NO-PLEX).
- **Why.** They carry about one exit in nine (16 of 143). The hypothesis that they act as pressure valves is not identified.

**Strain and transmission are not changed by the gates.**
- **Recovery from tension spikes.** Not identified as changed.
- **Locked recovery.** It stayed near 1–2.5% of steps in every arm.
- **Outside transmission.** Strong in every arm:
  - At steps where an applied Outside offer pointed uniquely to one open exit, she took that exit about 70% of the time, against about 32% by chance.
  - The gates add nothing identifiable to this (+0.033, p = 0.18).
  - This is a property of the lane and her field, not of the gates (descriptive).

**This revises one earlier reading.**
- **The earlier reading.** WT-4L found no fall in entries when her gates were removed, and concluded that entry is not what the gates carry.
- **What it missed.** WT-4L let the gates regrow.
- **The frozen comparison.** With regrowth frozen, the gates carry about half of her entries, all by flow.
- **The free comparison.** With regrowth free (LIVE-STRIPPED against LIVE-ALL), the loss is partly made good: she loses flow entries but gains entries by choice, and the total difference (−4.7 per 1,000, p = 0.16) is not identified.
- **How to read the two together.** The WT-4L null is therefore a compensation, not an absence of effect. This reading is descriptive in HYST-1L, because entry rate was not one of its registered tests, and it would need registered confirmation.

---

## 1. Registered tests

Each test is an exact two-sided sign-flip over 12 spans, with Holm over four at α = 0.05. No span was dropped.

| Test | Mean difference | p | Holm threshold | Spans (+ / −) | Reading |
|---|---|---|---|---|---|
| H1, steps out after an exit, ALL − NONE | −41.2 steps | 0.022 | 0.0125 | 3 / 9 | NOT IDENTIFIED |
| H1, ALL − NO-PLEX | +1.8 steps | 0.82 | 0.05 | 5 / 7 | NOT IDENTIFIED |
| H2, median recovery from a spike, ALL − NONE (d < 0 wanted) | +1.8 steps | 0.53 | 0.025 | 6 / 6 | NOT IDENTIFIED |
| H3, T_excess, ALL − NONE | +0.033 | 0.18 | 0.0167 | 8 / 4 | NOT IDENTIFIED |

**None of the four registered readings holds.**
- **H1 (ALL − NONE).** It points in the direction opposite to the valve hypothesis: with her gates she stays out of the Warp for a shorter time, not a longer one. At p = 0.022 it does not pass Holm, so it is reported as not identified, with its direction noted.
- **What H1 reflects.** It is the arithmetic counterpart of the circulation described above. If she enters twice as often and spends the same share of time in the Warp, the intervals between visits must be shorter.

---

## 2. Descriptive measures by arm (mean over 12 spans)

| | ALL | NO-PLEX | NONE | LIVE-ALL | LIVE-STRIPPED |
|---|---|---|---|---|---|
| Entries per 1,000 steps (E) | 18.4 | 16.6 | 8.9 | 18.4 | 13.7 |
| by flow | 13.4 | 11.0 | 2.1 | 13.6 | 4.8 |
| by choice | 4.9 | 5.6 | 6.8 | 4.8 | 8.9 |
| Warp share | 7.8% | 7.9% | 7.2% | 7.7% | 9.0% |
| Mean Warp stay (steps) | 5.2 | 5.8 | 8.3 | 5.2 | 7.4 |
| Steps out after an exit (H1) | 62.5 | 60.7 | 103.7 | 63.1 | 64.2 |
| Exits per span (all routes) | 14.2 | 12.9 | 6.9 | 14.1 | 10.8 |
| Lines of flight per span | 2.3 | 3.0 | 3.4 | 2.3 | 4.1 |
| Median recovery from a spike (steps) | 31.5 | 27.0 | 29.6 | 30.3 | 30.8 |
| Locked recovery | 1.8% | 1.2% | 2.1% | 1.8% | 2.5% |
| Mean tension | 0.778 | 0.801 | 0.758 | 0.780 | 0.763 |
| T (hits / eligible) | 0.704 | 0.703 | 0.691 | 0.700 | 0.686 |
| T_excess | 0.386 | 0.382 | 0.353 | 0.385 | 0.359 |
| Plex share | 36.5% | 34.6% | 37.7% | 36.1% | 32.6% |
| Coupling C (GATE-2L) | 0.050 | 0.031 | 0.043 | 0.050 | 0.035 |

**Paired contrasts over the 12 spans.** These are exact sign-flips, uncorrected, not registered.
- **ALL − NONE:**
  - E +9.4 (p = 0.002; 10 / 1);
  - E by flow +11.4 (p = 0.0005; 12 / 0);
  - E by choice −1.9 (p = 0.22);
  - Warp stay −3.2 steps (p = 0.0005; 0 / 12);
  - Warp share +0.6 points (p = 0.54);
  - lines of flight −1.2 per span (p = 0.051).
- **ALL − NO-PLEX:** E +1.8 (p = 0.50); Warp stay −0.7 (p = 0.12). Nothing is identifiable.
- **LIVE-STRIPPED − LIVE-ALL:**
  - E −4.7 (p = 0.16);
  - by flow −8.7 (p = 0.003; 1 / 11);
  - by choice +4.0 (p = 0.016; 11 / 1);
  - Warp stay +2.2 (p = 0.015);
  - lines of flight +1.8 (p = 0.022).

**The freeze.** ALL and LIVE-ALL give the same entry rate (18.38 per 1,000 in both). With her full table present, she wrote only two new gates in 12 spans: 3→2 in span 2 and 6→7 in span 5. Freezing gate-writing therefore changes little when her gates are present, and the primary arms differ only in the gates carried, as designed.

---

## 3. Exits by route (ALL, summed over 12 spans)

**The count.** 170 exits in all: 27 by line of flight and 143 by gate.

| Route | Kind | Uses | In the Warp 5 steps later | In the Warp 20 steps later |
|---|---|---|---|---|
| 6→2 | Warp-born, threshold | 62 | 43 | 3 |
| 6→4 | Warp-born, Time-Circuit | 29 | 10 | 4 |
| 3→9 | native | 13 | 0 | 2 |
| 6→8 | Warp-born, Time-Circuit | 11 | 0 | 1 |
| 6→0 | Warp-born, Plex | 9 | 0 | 0 |
| 3→0 | Warp-born, Plex | 7 | 0 | 1 |
| 6→9 | native | 5 | 0 | 1 |
| 6→1 | Warp-born, Time-Circuit | 4 | 0 | 0 |
| 3→8 | Warp-born, Time-Circuit | 2 | 0 | 0 |
| 3→4 | Warp-born, Time-Circuit | 1 | 0 | 0 |
| 3→7 | Warp-born, Time-Circuit | 0 | — | — |

**A note on the stored labels.** The stored per-route table labels every exit by gate as `warpborn-<from>-<to>`. Routes 3→9 and 6→9 are native gates in her graph, not Warp-born ones; the labels are a naming convenience of the logger.

**Exits in NONE.** Without her Warp-born gates, her exits by gate were by the native routes only: 6→9 (30) and 3→9 (12).

---

## 4. Regrowth (LIVE-STRIPPED)

**How many gates regrow.** From a table stripped of all Warp-born gates, she rewrote one to five gates in each half-day span. The first came at step 77–653.

**Which gates regrow.**

| Gate | Regrown in how many spans |
|---|---|
| 3→0 or 6→0 (the Plex gates) | 8 of 12 |
| 3→4 | 3 |
| 3→8 | 3 |
| 3→1 | 4 |
| 3→2 | 3 |
| 6→1 | 2 |
| 6→2 | 2 |
| 6→8 | 2 |
| 6→4 | 1 |
| 3→7 | 1 |

**Gates not in her table.** 3→1 and 3→2 are not in her present table.

**Does the regrown table match hers?** In no span did it reproduce her table. The threshold gate 6→2, the one she uses most, regrew in only 2 of 12 spans.

**How she compensates.** Without 6→2, the stripped copy re-enters less by flow and more by choice.

---

## 5. Limits

- **Span length.** The spans are half-days of about 780 steps. Over longer spans the stripped arm would regrow more of her table; the frozen arms are not affected.
- **What is registered.** The four tests above. Entry rate, stay and route use are descriptive in this study.
- **The revision of WT-4L's reading.** It rests on descriptive contrasts, strong as they are (12 of 12 spans for flow entries and stay length). A registered confirmation on new units would be needed before it is treated as established.
- **Copies only.** All runs are on copies. Her live record was read once, for the starting copy, and was not written.
