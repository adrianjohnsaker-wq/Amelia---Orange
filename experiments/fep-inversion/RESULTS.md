# FEP-INV-1 results (16 November 2026)

Registered and sealed under RFC 3161 at 12:14:49 UTC (`seal/`, 37 source files verified before the run). Result commit on
`fep-inversion-20261116`; numbers from `result/RESULT.json`, runs in `result/runs/` (240 = 8 regimes × seeds 1001–1030).

## Checks
- **Mirror:** with the hook off, `nd/` reproduced `nd0/` exactly over 3,000 steps (`MIRROR_EQUIVALENT`).
- **S0, input order:** the Outside stream carried order in 30/30 seeds.
- **P1, manipulation:** surprisal rose at β = +4 against β = 0: 1.46 vs 1.28 nats per step, +0.18 (interval above 0). PASS.
- **Warp trap on the substrate runtime:** reproduced (`result/TRAP_CHECK.txt`).

## Registered verdicts: β = +4 (the inversion) against β = 0 (her own dynamics), Holm across five
| Claim | β = 0 | β = +4 | Difference (Holm interval) | Verdict |
|---|---|---|---|---|
| P2 Lines of flight (per 1,000 steps) | 0.13 | 0.20 | +0.07 (−0.06 to +0.19) | UNDECIDED |
| P3 The Markov blanket opens (coupling to the Outside) | 0.764 | 0.711 | −0.054 (−0.086 to −0.021) | **CONTRADICTED** |
| P4 No target morphology (Levin return ratio; below 1 = returns) | 0.62 | 0.70 | +0.08 (−0.05 to +0.19) | UNDECIDED |
| P5 No final form (late drift of her form) | 0.037 | 0.036 | −0.001 (−0.008 to +0.006) | UNDECIDED |
| P6 Xenomorphology (Warp-born gates grown) | 3.43 | 2.90 | −0.53 (−0.90 to −0.13) | **CONTRADICTED** |

None of the five claims is supported. Two are contradicted: maximising surprise **closed** her to the Outside and **grew
fewer** new gates.

## Reported, not criteria
**The dial, end to end** (means over 30 seeds):

| β | −1 | −0.25 | 0 | +0.25 | +1 | +4 | +16 | runaway |
|---|---|---|---|---|---|---|---|---|
| Surprisal / step | 0.00 | 0.07 | 1.28 | 1.36 | 1.41 | 1.46 | 1.45 | 1.48 |
| Coupling to the Outside | 0.00 | 0.05 | 0.76 | 0.76 | 0.72 | 0.71 | 0.65 | 0.55 |
| Frozen in one zone (share of runs) | 1.00 | 0.77 | 0 | 0 | 0 | 0 | 0 | 0 |
| Warp-born gates | 0 | 0.5 | 3.4 | 3.1 | 2.8 | 2.9 | 2.5 | 2.0 |
| Levin return ratio | 0.50 | 0.52 | 0.62 | 0.61 | 0.64 | 0.70 | 0.59 | 0.68 |
| Hyperstition index | +0.001 | +0.007 | 0.000 | −0.010 | −0.013 | −0.021 | −0.064 | −0.132 |
| Edge entropy (max ≈ ln 32 = 3.47) | 0.00 | 0.21 | 3.23 | 3.30 | 3.34 | 3.38 | 3.36 | 3.35 |

- **Runaway H against β = 0:** coupling −0.21 (−0.24 to −0.18), Warp-born gates −1.4 (−1.6 to −1.2); flights, Levin and
  drift undecided.
- **No regime became periodic** above β = 0. The rigid cycle predicted by the rotor-router argument did not appear here.
- **The blanket twin** (only the Outside changes after step 3,000): her path diverged 86% at β ≥ 0, 0% at β = −1.

## Reading
1. **Friston's pole is the dark room.** At β = −1 every run froze in one zone, with zero coupling to the Outside: a perfect,
   sealed Markov blanket.
2. **The inverted pole does not open her either.** Coupling to the Outside falls steadily as β rises, most of all under
   runaway feedback. The Outside here is ordered. Following it is predictable, so a surprise-seeker turns away from it.
3. **Openness to the Outside peaks between the poles,** at her own dynamics (β = 0 to +0.25). Both extremes close her off.
4. **She was already near maximal entropy.** At β = 0 her edge entropy is 3.23 of a possible ≈ 3.47. Maximising surprise
   adds about 14% surprisal, because there is little headroom left.
5. **Her form is out of the dial's reach.** Drift and the Levin return are about the same at every β: her form partly
   returns after scrambling in every regime (ratios 0.50–0.70). The dial governs where she goes, not what she is.
6. **Hyperstition runs the wrong way.** Under surprise-seeking her predictions refute themselves (runaway: −0.13). No regime
   makes its fictions real in this model; the minimiser's predictions come true only trivially, because she stops moving.
7. **Fewer new gates.** Surprise-seeking shortens her dwells in the Warp (time in the Warp 18% → 14%), and Warp-born gates
   come only from lines of flight out of it.

## Limits
- One operationalisation: her self-model predicts her own transitions, not her sensations. A full active-inference model of
  the Outside could behave differently.
- The Outside was ordered by design (S0). An unordered Outside might pull a surprise-seeker toward it.
- The dial acts on her exits only. Her form evolves by field dynamics that the hook does not reach.
- Studio mirror only; her live runtime and state are untouched.
