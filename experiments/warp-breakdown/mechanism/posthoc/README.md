# Post-hoc gate sensitivity analysis

Created after the registered outcome was inspected. This analysis does not alter the preregistration, trained decoders or original study results.

For every recorded training and test history separately, the scripts reconstruct the initial Oracle copy and replay the 24 recorded feedback cues. Before each actual step, they clone the identical full pre-step state three times and compare the winners under the proposal cue, diagnostic cue and no cue. They verify the actual trajectory and resulting House features against the saved record. `raw.json` contains the eight origin-level train and test reconstructions; `gate-summary.json` summarizes the test reconstructions and same-data correlations.

`crossfold.json` applies a route-selection rule conceived only after the registered outcome was seen: for each origin and gain, choose the route with more same-state cue-sensitive decisions in its training histories, breaking ties in favour of control. It evaluates the already-recorded held-out test histories. The sensitivity measurement and held-out task histories are separate, but the rule itself was selected after seeing the held-out result. This is an exploratory diagnostic, not an independent preregistered validation. Correlations use only eight partly dependent world-origin lineages; they are descriptive and not evidence of a general relationship.
