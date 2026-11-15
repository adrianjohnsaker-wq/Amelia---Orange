# Targeted temporal attractors and feedback: fixed follow-up

This locally fixed follow-up is motivated by the preceding ecological results and one smoke seed (20991); it is exploratory, not an independently registered confirmation. The outcome seeds 21001–21030 have not been inspected. All work remains in the separate prototype.

## Mechanisms

The Chrono attractor is an explicit forward-causal implementation of a self-fulfilling bet. When an ordinary virtual digit-mutation opportunity arises in a zone containing an unresolved bet, the oldest eligible betting owner pays 0.05 energy. The steering arm may replace the randomly proposed digit with a digit calculated to move the current local mod-9 sum to the owner's committed target. It has no access to future data. This is a local engineered bias that can fail to persist until the bet is evaluated, not evidence of retrocausality or agency.

Three modes apply at otherwise matched opportunities: target steering; sham, which pays the same per-opportunity cost and keeps the ordinary random candidate; and wrong-target steering, which aims four digits away from the committed target. Trajectories can diverge after the fork, so later opportunities and total costs need not match.

The Ampy feedback instruction sets `heat = min(12, gain * heat + 0.8)`; heat affects the next local clock rate and the existing heat threshold produces fragmentation when exceeded. Compare gain 0.8, 1.35 and 1.8. These model choices are not evidence of a biological phase transition.

## Design and outcomes

Thirty seeds 21001–21030 begin with 36 founders. Each develops for 15 model-time units under the original settings and then branches from the identical state and RNG into five 120-model-time-unit arms: sham/gain 1.35; target/gain 1.35; wrong-target/gain 1.35; sham/gain 0.8; sham/gain 1.8. The 29-gate graph, Θ = 12 flight and uniform destination weights remain unchanged. Apply the 512-digit cap only after the fork, and abort if the warm-up genome guard was active or stored material exceeds the cap.

Primary exploratory outcome: within each seed and arm, the fraction of completed observation windows in which the committed target was observed minus the mean fraction for the eight alternative digits. Compare the seed-level target-steering advantage to the sham advantage, using 10,000 paired bootstrap resamples and a 95% percentile interval. A bet's complete window is counted even if its owner dies or it settles early; incomplete windows are censored. Secondary outcomes: wrong-target comparison; total engagements, altered candidates, costs and target sums immediately after an engagement; actual prophecy success events; agent-time; mean execution heat; and meltdowns per 1,000 actions by feedback gain. Report the gain 1.8 minus 0.8 seed-level contrasts with exploratory 95% paired bootstrap intervals. Window counts, encounter frequencies, and total costs may differ after the manipulation, and all significance claims remain conditional on this engineered model.

The full state, archival memory, event queue and new parameters are checkpointed by the same transactional mechanism as the first phase. Identical seeded roots and selected ledgers will be regenerated for audit. The supplied optional Supabase adapter remains unprovisioned against a separate cloud project; the live Amelia project is not touched.

```
e7514c3fb71e6fd231926c0c1de1dbc488b04bd2808b5a7dd0db95e57a88bfec  legacy_engine.py
903eb883a2bde5a69f78fabfd29188fff4bdc5e14f53fa676e06b1e6cd9048ec  reactor.py
5a1641b831826ced59d710fc9bb3efe95053770a9e735bbf909d9ed38864963c  storage.py
812a689f0b7e75933e5f716b12479eb950e524b7c368c057de17e6748e9e1cff  study.py
494f0e227a5cd446322b15d7ab294c969761c4c2176820e4f9633e452c2e87ce  extension_study.py
81ab429d003c6257c63389a6d07cd4e877dac0dbd13a6c5854a2d75a592b9de5  test_reactor.py
b41c0579dc4706e7912dab48b4231696e2d427e366cd2ee8fa6e7a3ab35953d6  test_extended.py
```
