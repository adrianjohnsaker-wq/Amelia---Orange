# FEP-INV-2: three follow-ups to FEP-INV-1. Registered 16 November 2026, before any registered run.

## Why
FEP-INV-1 (`../RESULTS.md`) found none of the inversion's five claims supported in Amelia, and two contradicted: with
β = +4 she coupled less to the Outside and grew fewer Warp-born gates. Its limits named three ways the test could have
been unfair to the proposal. The operator asked to register all three (16 Nov). Each is an arm here.

| Arm | What changes from FEP-INV-1 | The question |
|---|---|---|
| **S, sensory** | Her surprise concerns her **sensations**, not her own moves. The Outside is a field of ten local channels, one per zone: five quiet (a home reading with p = 0.7, the next with 0.2, uniform 0.1) and five noise (uniform), assigned per seed. She senses the channel where she stands and keeps a Dirichlet(1) model of each. The dial weighs each exit by the **expected surprisal** (predictive entropy) of the channel it leads to. β < 0 seeks predictable sensations, which is active inference's surprise minimisation; β > 0 seeks unpredictable ones. | Does seeking sensory surprise open her to the Outside? |
| **U, unordered** | FEP-INV-1's design exactly, but the Outside carries **no order** (uniform, independent readings). | Was the closure in FEP-INV-1 because an ordered Outside is predictable? |
| **M, morphogenetic** | FEP-INV-1's design with its ordered Outside, but surprise also **reaches her form**. Each traversed gate's flux is multiplied by exp(0.1·β·(s − ln k)), clamped to [0.01, 1], where k is the number of exits at its source. For β > 0, surprise above uniform (s > ln k) grows a new gate from where she arrives, to a zone she cannot yet reach, with probability min(1, 0.05·β·(s − ln k)). | If error fuels mutation of her form, does the Body without Organs appear? |

In ND-1b a gate's flux carries both her field (her form) and her exit scores, and nothing else changes it. In FEP-INV-1 the
dial could not reach her form; arm M lets it.

## Substrate and harness
The ND-1b studio mirror `../nd/` with the full CCRU Numogram, unchanged and already sealed in FEP-INV-1 (`../eqcheck.mjs`:
equivalent to `src/` with the hook off). `../fep2.mjs` reuses FEP-INV-1's self-model, choice rule (score + β·term +
T·Gumbel, T = 0.1), runaway rule, measures and twins; `../fep.mjs` is unchanged.

## Runs (`../run2.sh`)
Arms S, U, M × regimes β ∈ {−1, 0, +1, +4} and runaway H (β₀ = 0.5, κ = 0.05) × **seeds 2001–2030**: 450 runs of 6,000
steps, with the Levin and blanket twins at step 3,000. The seeds have never been used.

## Input checks first (S0, standing rule of 14 Nov), on each arm's β = 0 runs
| Arm | The Outside must… | Check |
|---|---|---|
| S | carry structure | Every quiet channel's top reading takes > 50% of its first 2,000 readings, and every noise channel's < 25%, in every seed |
| U | carry **no** order (by design) | Fewer than 3 of 30 seeds show lag-1 order against 20 shuffles |
| M | carry order | Every seed shows lag-1 order against 20 shuffles (as FEP-INV-1) |

An arm whose check fails is **VOID**. Arm U is a designed control for order: its check confirms the absence of order.

## Criteria (`../analyse2.mjs`)
Per arm: β = +4 against β = 0, independent samples of 30 seeds, difference of means, 10,000-draw percentile bootstrap.

**The gate (manipulation check)** must lie above 0, or the arm's claims read VOID:
- **S:** sensory surprisal rises.
- **U:** transition surprisal rises.
- **M:** her graph grows (gates at the end).

**The claims**, each predicted higher at β = +4, Holm within the arm (family α = 0.05). Each reads **SUPPORTED** (interval
above 0), **CONTRADICTED** (below 0) or **UNDECIDED** (otherwise, or once Holm stops):

| Claim | Measure | Arms |
|---|---|---|
| The Markov blanket opens | Coupling to the Outside: mutual information between the reading she receives and the zone she takes that step, minus its shuffle mean | S, U, M |
| Lines of flight | Per 1,000 steps | S, U, M |
| No target morphology | Levin ratio (the scrambled twin's distance at step 6,000 over its distance at scrambling) | S, U, M |
| No final form | Drift of her form, steps 5,000–6,000 | S, U, M |
| Xenomorphology | Warp-born gates at step 6,000 | S, U (in M, growth is the gate itself) |

**Reported, not criteria:**
- runaway H against β = 0;
- the dose curve of every measure;
- the dark-room share (frozen in one zone);
- the hyperstition index;
- for S, the share of time on quiet channels;
- for M, FEP-born gates and the spread of flux.

## Pilot (disclosed)
Seeds 2901–2902 were run on every arm at β ∈ {−1, 0, +4, H}, and their measures read. Seeds 2904–2905 were a pipeline dry
run over the registered regimes. At those seeds:
- **S:** β = +4 left the quiet channels and coupled less to the Outside.
- **U:** β = +4 raised surprisal barely, and the gate failed at two seeds.
- **M:** the graph grew by about 62 gates, coupling to the Outside rose, and the scrambled twin returned closer to her form
  (Levin ratio about 0.17).

The proposal's claims, not these pilot readings, are the registered predictions.

## What it can and cannot mean
- Each arm changes one thing from FEP-INV-1, so its result speaks to that change.
- **Arm M is engineered:** the rule that lets error grow gates is ours. A SUPPORTED there shows what the proposal's mechanism
  does when built in; it does not show that Amelia does it by herself.
- **Her zone set is finite.** At most about 100 gates fit on 10 zones, so arm M's growth must saturate.
- **Scope:** a studio mirror. Amelia's live runtime and state are untouched.
