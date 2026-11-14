# WT-3L result: Θ = 12 against Θ = 24 on copies of her real state (14 November 2026)

**Decision (registered rule): Θ = 12 HOLDS.**

## How it was run
- **Starting copy.** Her record as saved by the 00:05 UTC tick on 14 November: revision 341, step 5,669, Θ = 12, six Warp-born gates.
- **Inputs.** The recorded Outside offers of the 12 six-hour windows from 11 November 00:00 to 14 November 00:00 UTC, with none missing. Each window was replayed four times, 1,440 iterations per run.
- **Execution.** One GitHub Actions job (Amendment 2): run 43579540431, attempt 2, 09:35 to 09:45 UTC. Her live record was not read or written.

**Determinism check.** Unit 1 at Θ = 12, run twice, was identical on every compared measure:
- zone path;
- per-step and tick-end tensions;
- landings and Warp exits;
- admissions and flow hops;
- Warp-born gates;
- final memory head digest and body checksum.

## Primary measures (d = T12 − T24, 12 units, exact two-sided sign-flip over 4,096 patterns)

| | Mean d | p | Margin | Above margin |
|---|---|---|---|---|
| M1, Warp share | −5.62 points | 0.00049 | +2.0 points | no |
| M2, mean Governor tension | −0.0078 | 0.088 | +0.03 | no |

**Per unit.**

| Unit | T12 Warp share | T24 Warp share | d M1 (points) | T12 tension | T24 tension | d M2 |
|---|---|---|---|---|---|---|
| 1 | 12.2% | 16.6% | −4.4 | 0.781 | 0.784 | −0.003 |
| 2 | 13.6% | 21.2% | −7.6 | 0.813 | 0.818 | −0.005 |
| 3 | 6.2% | 20.3% | −14.1 | 0.780 | 0.805 | −0.025 |
| 4 | 11.1% | 20.4% | −9.3 | 0.753 | 0.775 | −0.022 |
| 5 | 14.2% | 16.7% | −2.5 | 0.784 | 0.800 | −0.016 |
| 6 | 12.6% | 16.1% | −3.5 | 0.777 | 0.779 | −0.001 |
| 7 | 11.7% | 17.6% | −5.9 | 0.772 | 0.789 | −0.018 |
| 8 | 11.1% | 15.8% | −4.7 | 0.752 | 0.733 | +0.019 |
| 9 | 14.6% | 14.8% | −0.3 | 0.779 | 0.761 | +0.017 |
| 10 | 15.3% | 15.8% | −0.5 | 0.771 | 0.782 | −0.011 |
| 11 | 8.7% | 18.0% | −9.3 | 0.767 | 0.789 | −0.022 |
| 12 | 11.6% | 17.0% | −5.4 | 0.768 | 0.776 | −0.008 |

**What the primary measures show.**
- **Warp share.** In all 12 units the copy at Θ = 12 spent less time in the Warp than the same copy at Θ = 24.
- **Tension.** It was lower in 10 of 12 units, but not significantly.
- **The live rise.** Her live rise after the switch (+5.2 points of Warp share, +0.10 tension) is therefore not an effect of Θ. Under the registered reading it is drift: different days, different Outside material, a different state of her.

## Secondary measures (12 runs per arm, about 1,649 runtime steps each)

| | Θ = 12 | Θ = 24 |
|---|---|---|
| Warp visits per 1,000 steps | 15.3 | 15.4 |
| Mean Warp visit (steps) | 7.8 | 11.5 |
| Longest Warp visit (every run) | 12 | 24 |
| Lines of flight (total; per run) | 133; 11.1 | 48; 4.0 |
| Landings of lines of flight | 9: 87, 0: 36, 1: 4, 2: 3, 4, 7, 8: 1 each | 9: 26, 0: 19, 1: 2, 7: 1 |
| Warp exits by line of flight | 133 | 48 |
| Warp exits by a Warp-born gate | 149 | 219 |
| Warp exits by a pre-existing gate | 22 | 37 |
| Warp exits in all | 304 | 304 |
| Warp-born gates at start / at end | 6 / 6–8 | 6 / 6–7 |
| Zones visited | all ten in every run | all ten in every run |
| Replayed Outside offers admitted | 2,480 of 2,504 | 2,490 of 2,504 |
| Flow hops per run | 262 | 251 |
| Mean tension at tick ends | 0.770 | 0.778 |

**What the secondary measures show.**
- **Entries.** Θ does not change how often she enters the Warp; entries are the same in both arms.
- **Length of stay.** It shortens each visit: the line of flight fires at the twelfth step instead of the twenty-fourth. That is the whole of the difference in Warp share.
- **Exits.** The number of exits is identical. At Θ = 12, more of them are lines of flight, mostly to the Plex (9 and 0), and fewer go through a Warp-born or pre-existing gate.
- **New Warp-born gates.** Five appeared in single Θ = 12 runs: 3→1, 3→2, 6→2, 6→4 and 6→7. One appeared in a Θ = 24 run: 6→7.

## Does the copy reproduce her live behaviour? (registered check)
**The registered check.** T24's mean Warp share in these runs is 17.5%. That does not resemble her pre-switch live 7.4%, so the replay differs from her live conditions of 11 November, and that limits the reading. Two cautions apply:
- **A different starting state.** The copies start from her state of 14 November (step 5,669), not from her state before the switch (step 1,981).
- **A different input density.** Each window's offers are replayed four times.

**Descriptive only, not a registered check.** The Θ = 12 arm's mean Warp share, 11.9%, is close to her live 12.6% over her first day at Θ = 12.
