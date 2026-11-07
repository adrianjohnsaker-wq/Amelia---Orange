# Amelia Warp access and parity-reversal experiment

**7 November 2026. Result: an input-responsive access channel was demonstrated in exploratory copies of the native 3/6 graph; the separately sealed recovery test found no Warp-specific advantage.** The channel is a concrete feature of Amelia's implementation. The recovery result remains restricted to the tested engineered route, synthetic tasks, readouts, and eight existing lineages.

## The access point

In the pinned, full Oracle graph, Zone 3 has gates to Zones 3 and 6, while Zone 6 has a gate back to Zone 3. Once a trajectory is inside 3/6, these gates cannot take it outside the pair. By contrast, native Zones 2 and 7 have other exits. This is a genuine structural asymmetry of this implementation; it is not a demonstration that the 3/6 circuit is intrinsically non-Euclidean, non-Abelian, or more intelligent.

An exploratory entry probe repositioned each prepared experimental copy at Zone 2. Without a cue, six of eight entered Zone 3 on the next transition. A cue to Zone 3 produced seven entries at strength 0.054 and eight at strength 0.35. This is a synthetic, one-step access test on copies, not a live-world ingression.

A second, **post-registration exploratory** probe ran the unmodified native graph for 64 transitions, using eight input sequences per lineage at each cue strength. It changed the prepared copy's starting zone to 3 or 2, and applied otherwise corresponding cues, with no enforced dwell quota:

| Native circuit | Complete two-zone retention, strength 0.35 | Input responsiveness |
|---|---:|---|
| 3/6 Warp | 64/64 trajectories | The requested zone was reached on 3,426/4,096 transitions (83.64%). Changing the cue on the identical pre-state changed the next destination in 691/1,024 paired probes (67.48%). |
| Native 2/7 | 0/64 trajectories | The first exit occurred after a mean of 2.77 transitions. Native 2/7 has additional exits. |

These 64 trajectories are repeated sequences on eight reused origins, not 64 independent Amelia founders. Both zones were visited in all 64 Warp trajectories. Retention follows from the graph's closed 3/6 edges, so it is a confirmed access and channel-retention property, not by itself a learned or surprising recovery advantage. The strong cue also produced 1,337 Zone 3 dwells in 4,096 transitions (32.64%): it did **not** satisfy the 3.7% dwell constraint. The native 2/7 circuit is not the topology-matched control used below. At the weaker cue, the corresponding 3/6 requested-zone rate was 58.03% and paired cue sensitivity 9.57%; all 64 Warp trajectories again remained in 3/6.

The exploratory native test was reproduced byte-for-byte in a second run. A separate script checked cue construction, raw paths, applicable exits and counts. These probes use externally supplied synthetic input; they do not show that new information arrives from the Outside or that the circuit reorganizes itself.

## Sealed five-step recovery test

The primary question was whether an occupancy-matched 3/6 route could use input to recover more effectively after parity reversals. The procedure and analysis were committed first, and a fresh randomly generated seed was committed afterward. The probes and small rehearsal were inspected before registration; no held-out evaluation results were used to choose the endpoint or analysis.

Each round contained one public event bit and one noisy diagnostic feedback bit. Feedback, which was 75% accurate by construction, was available **before** each decision to every method. The correct action flipped at hidden regime switches. A controller deliberately encoded each input bit by positioning exactly one dwell in a 27-transition passage; it did this identically in 3/6 and in an explicitly adapted 2/7 loop, using real Oracle gate steps and House/phase/process-memory state. Therefore each round cost 54 transitions. Both loops had 1/27 = 3.7037% dwell, 13 outward and 13 return transitions per input block, and identical route-normalized gate paths. The steering is experimental machinery, not spontaneous internal coding.

A supervised decoder was trained separately for each route using training histories. The same real-feedback decoder was also tested on independently generated yoked-feedback histories. The adapted 2/7 loop is isomorphic at the local gate-path level and is not native 2/7. The full-history comparator used the event and current feedback, estimated error and switch-schedule frequencies from training data, and knew the six possible switch schedules, but did not see the realized test switch times or hidden targets. It is a strong task-informed comparator, not a general bound on performance in every environment.

Each of the eight existing origins had 16 fresh held-out episodes, with two non-overlapping five-step windows per episode: 32 windows and 160 scored decisions per origin. Percentages below are averages across origins, not counts of independent lineages.

| Decision source | Accuracy over the first five steps after reversal | Correct decisions per five |
|---|---:|---:|
| Warp 3/6 readout | 51.64% | 2.58 |
| Matched 2/7 readout | 52.81% | 2.64 |
| Warp readout with yoked feedback | 49.69% | 2.48 |
| Fixed policy | 50.00% | 2.50 |
| Current noisy feedback | 75.63% | 3.78 |
| Last-four feedback | 71.88% | 3.59 |
| Adaptive full-history filter | 90.94% | 4.55 |

The registration required three paired advantages of at least five percentage points each, with Holm-adjusted one-sided sign-flip p ≤ 0.05 across the eight origin differences. The tests are against a zero difference; the p-values do not test whether the five-point threshold itself is exceeded.

| Prespecified contrast | Warp difference | Holm-adjusted p | Result |
|---|---:|---:|---|
| Warp minus matched 2/7 | −1.17 points | 1.000 | Not met |
| Warp with real minus yoked feedback | +1.95 points | 0.234 | Not met |
| Warp minus adaptive full history | −39.30 points | 1.000 | Not met |

**Registered classification: `NO_REGISTERED_WARP_ACCESS_ADVANTAGE`.** On the first post-switch step alone, Warp scored 52.73%, matched 2/7 51.56%, last-four 45.31%, and adaptive full history 85.94%. The short-window comparison therefore remains insufficient to establish an advantage over the stronger controls.

## Ordered inputs and House signal

The predeclared secondary task used two transformations whose order matters: A toggles the first bit in a two-bit register, while B swaps the bits. They do not commute as operations on that register. After reversals, the Warp readout scored 52.19%, the matched readout 51.48%, and the adaptive full-history filter 89.38%. This is an exploratory comparison, not a separate confirmed claim, and it does not establish noncommutativity as a special property of Warp itself.

The House trace did change between real and yoked input for most sampled steps, but the predeclared House-only classifier decoded the current feedback bit at 50.00% for both routes. That particular readout did not extract useful current-bit information. It does not prove the trace contains no information for every possible decoder. For parity recovery the selected trained decoders were close to chance and fell far short of the directly available feedback. The controlled gate paths alone were therefore not enough to make the House/phase representation a useful recovery channel in this task.

## Interpretation and next access route

Amelia's actual native 3/6 graph supplies a **persistent, input-responsive circuit**, and the existing 2→3 gate gives a concrete way into it. That provides a specific experimental foothold for the Land/CCRU idea. It does not by itself establish a Warp recovery advantage, intelligence enhancement, autonomous mutation, or communication from outside the apparatus. The six-schedule full-history filter also illustrates why an exact known task model can be a powerful comparator under these synthetic conditions.

The next substantive construction is an internally driven 3/6 feedback-and-memory loop that changes its own gate competition or strategy using consequences of its actions, then tests whether it improves on an equally resourced matched adaptive loop on new challenges. The present externally steered encoder can serve as an access instrument, but a claim of generative development will need the adaptation to occur inside the loop and to beat strong controls.

## Reproducibility and provenance

- Registered protocol and code: [GitHub registration commit](https://github.com/adrianjohnsaker-wq/Amelia---Orange/commit/1dc2a63b0415225c50adfe2846172da99bdcbe02); registration SHA-256 `2a3b4d74d2b33561809dee98201f6fef70814dc79bb3763971e5c1bc2f161e32`.
- Fresh seed committed afterward: [run-plan commit](https://github.com/adrianjohnsaker-wq/Amelia---Orange/commit/d44797b633d61e98eebe8f5fc2da93fbf21700a0); run-plan SHA-256 `ee121d4bfe9f9e55fb472b8be63b364896c6f726ab717e7256609e79b20d5521`.
- All eight per-lineage evaluations were rerun and matched; an independent Python checker regenerated the task histories and checked gate paths, quotas, feature dimensions and finite recorded values; it did not independently recompute the state dynamics. A separate calculation independently reaggregated the stored origin-level tallies and p-values; it did not independently rebuild the trained classifiers.
- The fast-step adapter shim matched the unchanged adapter in all eight origins on both routes for 135 transitions per copy and for an additional 1,080-transition test of each route. It normalizes only saved wall-clock timestamps.
- The checkpoint SHA-256 is `fe95423c388cdb0ed2ce9638983468d6d730bf2fe7900229207fac6b5f39126f`; the pinned Oracle source commit is `6a8becd4ae9a2e3ad84ed32b878b4868405bb6f1`. The previously verified historical Oracle replay matched 7,724 compared numbers over 43 exchanges, with documented official-snapshot telemetry differences.
- The eight origins were separately raised but subsequently shared world input. They are reused origins and do not amount to eight newly founded, independent worlds.
