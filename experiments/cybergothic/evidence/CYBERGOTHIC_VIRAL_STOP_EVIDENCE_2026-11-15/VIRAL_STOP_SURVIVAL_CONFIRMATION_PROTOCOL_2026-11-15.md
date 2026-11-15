# Fresh confirmation: stop integrity and recipient survival

**Plan fixed locally after inspecting the first cohort and before running this fresh cohort · 15 November 2026**

The first 120-population viral-stop study produced no clear evidence for its planned transfer-by-stop interactions. Its exploratory comparisons suggested higher 24-unit recipient survival with an intact, silent intron than either with an experimentally ruptured stop or with recipient-only active intron interpretation. Those are selected post-observation contrasts; they were not the first study's primary outcomes.

Run the unchanged six-arm `stop_trial.py` for **120 fresh populations, seeds 43001–43120**, using the same natural-encounter selection, point-edit, sham contact, interpreter control and 24-unit follow-up as the first study. Exclude populations without a qualifying infection by time 150 and report their number. Every qualifying population contributes all six matched branches; external environmental streams must match.

The two planned primary outcomes are the paired differences in 24-unit recipient survival:

1. **Intact transfer minus ruptured transfer:** the original `09` recipient versus the signature-preserving `09` → `00` intervention, both receiving the same viral insertion.
2. **Intact transfer minus active-interpreter transfer:** the same original genome and viral insertion under the normal parser versus recipient-only active intron interpretation.

Use 10,000 independent-population paired bootstrap resamples with two-sided **97.5% percentile intervals**, accounting for two comparisons. Report observed counts in all six arms. Neither comparison isolates a benefit of the viral payload: the physical edit alters a digit, and the active-interpreter control affects all introns in the selected recipient.

As secondary descriptive outcomes, report the same intact versus ruptured and intact versus active survival comparisons in sham-exposure branches; the transfer-by-stop and transfer-by-interpreter survival interactions; the transfer-by-stop next-action nutrient interaction; next-action no-op rates; uptake, descendant births and lineage transmissions. Use unadjusted 95% intervals for secondary contrasts and identify them as exploratory. Count recognised changes and splits in the natural direct and vector infections descriptively. No sample extension or outcome-based exclusions are planned.

Replay all branches and separately audit representative event ledgers. This is a locally fixed fresh confirmation, not independently witnessed public preregistration. It tests an explicitly selected host-suppression effect; it cannot establish Darwinian adaptation or whether a particular transferred intron spreads. The nutrient field and archive reactor remain on, and Amelia Orange is not involved.

```
82c2a5fa01fe40b87379c0ad795beb9dbc3cfa23cb1c2e81002c2cc19522dfab  analyse_stop_confirmation.py
efd2644778042c54ea597d1d0f65ed560dfcfde90912ee054c89e162f74b5e3f  stop_trial.py
5aef4ed7c0a6f86b43060b83dcb5c2f70e458efa2bf8fe2a9e91172611bd8d05  analyse_stop.py
2fa7c6a32ea4011025ec4cddf0acf95c5a89b289cbc09e052810b852f10fb375  pilot_stop_screen.py
4c05bf30346962a9fc9e1b1de6601ec77725ff3a77b990343024b8131693f4ab  digit_world.py
2527366f0de2b20a17b32327b6a86568df2f49eaf13aa906173cf14296e58bf3  legacy_engine.py
d442cc2972707247930aa11ef63fc60ea97c2b24af240ae7511d640c2e3a1147  reactor.py
e501574f89b943942ff21669ea01255e1b9153652070fd7c905573be27e8c835  assemblage.py
02c0988415b4cba48f80b1c6e569b66b77c22cff087f9d5893984826d49058b4  adaptive.py
ee3aca9bbb31d2f4078798ba64825158a42c6616912aafe2445a1be54bac27d2  portable.py
```
