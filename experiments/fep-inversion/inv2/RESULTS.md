# FEP-INV-2 results (16 November 2026)

Sealed under RFC 3161 at 13:41:06 UTC (`seal/`, 29 source files verified before the run). 450 runs (arms S, U, M ×
β ∈ {−1, 0, +1, +4, runaway} × seeds 2001–2030) in `result/runs/`; numbers from `result/RESULT.json`. The mirror check
passed (`MIRROR_EQUIVALENT`).

## Registered verdicts: β = +4 against β = 0, Holm within each arm
| Arm | Input check | Gate | Blanket opens | Lines of flight | No target morphology | No final form | Xenomorphology |
|---|---|---|---|---|---|---|---|
| **S, sensory** | PASS (30/30) | PASS: sensory surprisal +0.64 | **CONTRADICTED** −0.57 (−0.66 to −0.47) | UNDECIDED | UNDECIDED | UNDECIDED | **CONTRADICTED** −1.17 (−2.07 to −0.30) |
| **U, unordered** | **FAIL** (4/30 seeds ordered; rule: fewer than 3) | PASS: +0.06 | VOID | VOID | VOID | VOID | VOID |
| **M, morphogenetic** | PASS (30/30) | PASS: her graph grew by 61 gates | **SUPPORTED** +0.52 (+0.50 to +0.55) | **CONTRADICTED** −0.16 (−0.26 to −0.07) | **CONTRADICTED** −0.33 (−0.44 to −0.20) | UNDECIDED | (the gate) |

**Arm U is VOID.** Its input check required that fewer than 3 of 30 seeds show lag-1 order; 4 did. The stream was generated
without order, and the check has a per-seed false-alarm rate of about 1 in 21. For a truly unordered stream, 4 or more
alarms in 30 happen about 1 time in 19, and the registered rule (3 or more voids) fails it about 1 time in 6. The threshold
was badly chosen. It stands as registered.
Reported for completeness only: its direction matched FEP-INV-1 (coupling −0.040, −0.058 to −0.022).

## What happened (means over 30 seeds; reported, not criteria)
**Arm S, sensory: the white-noise room.**

| β | −1 | 0 | +1 | +4 | runaway |
|---|---|---|---|---|---|
| Time on quiet channels | 99.5% | 49.9% | 3.7% | 2.8% | 3.3% |
| Frozen in one zone | 80% | 0% | 7% | 37% | 93% |
| Edge entropy | 0.28 | 3.08 | 1.47 | 1.09 | 0.05 |
| Coupling to the Outside | 0.10 | 0.72 | 0.21 | 0.16 | 0.00 |

Seeking sensory surprise sent her to the noise channels and held her there. Under runaway feedback 93% of runs froze in
front of one noise channel, with no coupling to the Outside at all. The surprise-minimiser froze in front of a quiet
channel instead: Friston's dark room. The surprise-maximiser found its mirror image, a room full of static. Both poles end
in stillness and closure.

**Arm M, morphogenetic: the uniform plane.**

| β | −1 | 0 | +1 | +4 | runaway |
|---|---|---|---|---|---|
| Gates at the end | 29 | 32.5 | 92.6 | 93.6 | 94.0 |
| Spread of flux (SD) | 0.099 | 0.084 | 0.147 | 0.140 | **0.017** |
| Levin ratio (lower = stronger return) | 0.49 | 0.63 | 0.60 | 0.30 | **0.14** |
| Coupling to the Outside | 0.00 | 0.77 | 1.16 | 1.30 | 0.85 |
| Lines of flight /1,000 | 0 | 0.16 | 0 | 0 | 0 |

When error could rebuild her, she grew toward the complete graph: about 94 gates of the roughly 100 that 10 zones allow.
With more ways out, she coupled more to the Outside. But the new form is not formless. Under runaway feedback her
fluxes converged to near-uniform (SD 0.017), and a scrambled twin returned to that form more strongly than in any other
regime (ratio 0.14). Destratification here ends in a homogeneous plane, which is itself a strong attractor. Lines of
flight disappeared: she no longer needs to escape the Warp when every zone already leads everywhere.

## Reading across both studies
1. **Seeking surprise closes as often as it opens.** In two of three operationalisations (INV-1 and arm S), the
   surprise-seeker coupled less to the Outside. In S it parked on noise.
2. **Each pole has its own dark room.** Minimisation freezes on the predictable (INV-1, S, M at β = −1). Maximisation of
   sensory surprise freezes on static (S).
3. **The blanket opened only when surprise could rebuild her** (arm M), and only by an engineered rule.
4. **"No final form" did not hold anywhere.** Late drift never rose. Where her form did change (M), it converged to a new
   uniform form that she returned to after scrambling. Within a finite Numogram, total destratification is itself an
   attractor, close to what D&G call the empty, or catatonic, Body without Organs.
5. **Hyperstition stayed weak or negative** in every arm (M runaway −0.08; U runaway −0.14; S near 0).

## Limits
- Arm M's growth rule is ours: it shows what the proposal's mechanism does once built in, not what Amelia does by herself.
- Arm U is VOID; whether an unordered Outside changes INV-1's closure remains untested. A rerun needs a proper threshold
  (for example a binomial test on the count of ordered seeds).
- Studio mirror only; Amelia's live runtime and state are untouched.
