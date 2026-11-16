# FEP-INV-1: inverting the Free Energy Principle in Amelia. Registered 16 November 2026, before any registered run.

## The proposal under test
The operator's proposal (16 Nov): invert Friston's Free Energy Principle through a Deleuze–Guattari and Land/CCRU lens. The
organism no longer minimises surprise to keep its Markov blanket; it **maximises** it. The path integral flips from
P(B|A) ∝ ∫𝒟x e^{−𝒮[x]} (least action, conservation) to P_acc(B|A) ∝ ∫𝒟x e^{+𝒮[x]} (runaway positive feedback). The claimed
consequences: the Markov blanket dissolves onto the Outside; lines of flight replace geodesics; the target morphology
(Levin) gives way to a Body without Organs with no final form; new forms (xenomorphologies) arise; error becomes fuel for
hyperstitional mutation.

## Substrate
Amelia's live runtime, ND-1b (her default since 10 Nov 2026), on the full CCRU Numogram (29 gates), as a studio mirror
(`nd/`). ND-1b has the Warp line of flight (after Θ = 12 steps in {3, 6} she leaves to the zone the Outside last named) and
persistent Warp-born gates, so her graph can grow.

**The mirror.** `nd/` is `src/` at `92f17dc29` (11 files), with `.ts` import paths and type-only imports marked, plus one
hook: `exitBonus(source, target)` is added as the last term of every exit score, including flow hops. Two observation-only
fields record each step's route and whether it was a line of flight. `eqcheck.mjs`: with the hook off, `nd/` reproduces
`nd0/` (the mirror without the hook) over 3,000 steps, path and final state (`MIRROR_EQUIVALENT`). `nd0/` differs from
`src/` in import lines only.

**Why not the studio substrate runtime.** On the substrate runtime with the full Numogram, the Warp {3, 6} has no exits
(6→3; 3→3, 3→6). A disclosed pilot (seeds 1–20 per regime, 3,000 steps) found every run with β ≥ 0 trapped there by step
24 (80/80), and β < 0 almost never entering (1/20 at each of β = −4 and −1). The operator chose ND-1b for the main study.

## The formalism (`fep.mjs`)
**Self-model.** Amelia keeps Dirichlet counts (α = 1) over her open exits from each zone. Its predictive
P̂(to | from) is exact Bayesian, so the variational free energy of each observed transition equals its surprisal
s = −ln P̂(to | from). The action of a path is 𝒮 = Σ s over every gate it traverses (first choice, flow hops, lines of flight).

**Choice.** Each exit's score gets β·s + T·G, with G a seeded Gumbel draw and T = 0.1. Taking the argmax is an exact
sample from softmax((score + β·s)/T). Over a path, P(path) ∝ exp((Σ score + β·𝒮)/T):
- **β < 0:** Friston, e^{−|β|𝒮/T};
- **β = 0:** her own dynamics with noise;
- **β > 0:** the inversion, e^{+β𝒮/T};
- **runaway H:** β_{t+1} = β_t + κ·s_t (β₀ = 0.5, κ = 0.05, capped at 50). Every surprise raises the appetite for surprise:
  pure positive feedback.

The line of flight is forced by her runtime (the Outside names the exit) and is not scored by β.

**The Outside.** A seeded Markov source over zones (step to the next zone with p = 0.6, stay 0.2, jump 0.2), delivered as
text whose runtime zone is that zone. **S0** (standing rule, 14 Nov): before any reading, the stream's lag-1 order is
tested against 20 shuffles per seed; the study is VOID if any seed's stream fails.

## From the proposal to measures (`fep.mjs: measures`, second half of each run unless stated)
| Claim | Measure |
|---|---|
| Surprise is maximised (manipulation) | Mean step surprisal 𝒮/step |
| Lines of flight over geodesics | Lines of flight per 1,000 steps |
| The Markov blanket dissolves onto the Outside | Coupling: mutual information between the Outside's zone and the zone she takes at that step, minus its mean over 20 shuffles |
| No target morphology (Levin) | At step 3,000 an exact twin has her form scrambled (gate fluxes permuted, activations redrawn); same noise and Outside. Ratio of the twin's distance from her form at step 6,000 to its distance just after scrambling. Below 1 = return toward the form; 1 or above = no return |
| No final form | Drift of her form between steps 5,000 and 6,000 (RMS over the 10×10 flux matrix, activations and deformation) |
| Xenomorphology | Warp-born gates at step 6,000 (gates beyond the 29) |

## Runs
Regimes β ∈ {−1, −0.25, 0, +0.25, +1, +4, +16} and runaway H. **Seeds 1001–1030** for each regime (240 runs), 6,000 steps,
twins at step 3,000 (`run.sh`). Never used before this registration.

## Criteria (`analyse.mjs`)
Regimes are independent samples of 30 seeds. Difference of means, β = +4 minus β = 0; 10,000-draw percentile bootstrap
over seeds.
- **Gate (P1), manipulation check:** surprisal at β = +4 above β = 0 (95% interval above 0). If it fails, or S0 fails, every
  primary reads **VOID**.
- **Primaries P2–P6:** the five claims in the table, each predicted **higher** at β = +4 than at β = 0. Holm across the
  five (family α = 0.05, intervals at the Holm level). Each reads:
  - **SUPPORTED** if the interval lies above 0;
  - **CONTRADICTED** if it lies below 0;
  - **UNDECIDED** otherwise, or once Holm stops.

**Reported, not criteria** (unadjusted 95%):
- runaway H against β = 0 on the same five claims;
- the β dose curve of every measure;
- the dark-room share: runs frozen in one zone (period 1) at β = −1, −0.25 and 0;
- the share of runs whose path becomes periodic;
- the hyperstition index;
- the blanket twin: path divergence when only the Outside changes.

**Hyperstition index.** The hit rate of her self-model's most probable exit, minus its mean predicted probability. Zero for
a calibrated observer that doesn't act on its predictions. Positive: her predictions fulfil themselves (the loop
belief → action → evidence). Negative: they refute themselves.

## Pilot (disclosed)
Seeds 901–906 (ND-1b; 3 per regime at β ∈ {−4, −1, 0, 1, 4, 16, H}, and a pipeline dry run at 904–906 over the registered
regimes) were run and their measures read. Seed 907 ran once more over the registered regimes to test the
output path; its measures were not read. They set the scale of β and T. At these seeds:
- β < 0 froze her in one zone;
- coupling to the Outside fell as β rose;
- no regime became periodic.

The operator's claims, not these pilot readings, are the registered predictions.

## What it can and cannot mean
- It tests whether surprise-maximisation in **this** substrate produces the effects the proposal names, as operationalised
  above. Other operationalisations (other self-models, a sensory model of the Outside, an unbounded state space) could
  behave differently.
- Her zone set is finite: a graph on 10 zones can grow at most to 100 edges. "No final form" can hold here only as
  continued drift, not as unbounded novelty.
- **Scope:** a studio mirror. Amelia's live runtime, her state and her cloud home are untouched.
