# REFRAIN-1: the refrain reads its territories off the inclusive record. Registered 18 November 2026, before any registered run.

## Why
The desiring motor's design doc (18 Nov) builds the refrain second, after the disjunctive synthesis, because it reads
patterns off that surface. DISJ-2 (`../disj2/RESULTS.md`) settled how the surface enters the motor:
- read at her exits, her own record only competes with the Outside (Y5 CONTRADICTED: 1.17 against 1.31);
- so the record stays an **inscribed surface, not read at her exits**, and the refrain is what returns its patterns to her passage.

The operator approved building on that basis (18 Nov). The operator's review also set the refrain's friction points:
- **it must not become a well:** each territory decays, and its pull has an intensity ceiling;
- **its study tests for saturation and limit cycles.**

## Substrate and harness
The ND-1b studio mirror `../nd/` with the full CCRU Numogram, unchanged and sealed in FEP-INV-1 (`../eqcheck.mjs`).
`../refrain.mjs` is `../disj2.mjs` with the changes marked "REFRAIN-1". The Outside, its reversal at step 3,000, its
silences (the last 50 of every 250 steps), the Outside's trace and desire are DISJ-2's DT.

## The refrain
**The surface.** The inclusive record (DISJ-1's five relation families) is inscribed in every regime, at reading weight 0
(WV = WS = 0). It gains one relation family, **Q**: every 3-zone segment of her passage (a → b → c), marked as the others are
(+ (1 − m)/8, half-life 500 steps). A rollback restores her but not the record, which is inscribed on the place.

**Territories and home.** Her territories are the at most K = 2 strongest segments whose mark has reached θ = 0.8. Her home
is the union of their zones. Both are read off the record at every step, so they form, consolidate, fade and change.

**The pull home.** When she stands outside home, each exit into a home zone gains
WF · pull · min(1, away / 25). Here pull is the strongest mark among the territories that contain that zone, WF = 0.5 (the
trace's own reading weight), and away is the number of steps since she was last at home. At home there is no pull, so she
leaves freely (a line of flight).

**Friction (DTR).** Territories fade with the record (half-life 500), and the pull has an intensity ceiling, pull ≤ 0.85.

**The well (DTRW, control).** The same refrain, but its territories never fade and its pull has no ceiling.

## Regimes (seeds 19001–19030 each; 120 runs of 6,000 steps)
| Regime | What it is |
|---|---|
| B | Her own dynamics (territories inscribed and measured, not read) |
| DT | Desire + the Outside's trace, DISJ-2's strongest setting (territories inscribed and measured, not read) |
| **DTR** | DT + the refrain, with decay and the intensity ceiling |
| DTRW | DT + the well: no decay, no ceiling |

## Input check (S0, standing rule of 14 Nov)
Every B run's Outside, before the reversal, must show lag-1 order against 20 shuffles, or the study is VOID.

## Criteria (`../analyse_refrain.mjs`)
**Measures, late (steps 4,500–6,000):**
- **home persistence:** the mean, over steps, of the Jaccard overlap between her home zones now and 250 steps before (1 is a frozen home);
- **territories at the end:** segments whose mark is at least θ, before the cap K;
- **births late:** new connections desire makes in steps 4,000–6,000;
- **coupling:** late, on received steps (DISJ-2's measure);
- **carry index:** through silence (DISJ-2's measure).

Contrasts are differences of means, or for non-inferiority mean(A) − c · mean(B) with c fixed here. Each uses a 10,000-draw
percentile bootstrap over seeds, with Holm across the six (family α = 0.05). Each reads **SUPPORTED** (interval above 0),
**CONTRADICTED** (below 0) or **UNDECIDED** (otherwise, or once Holm stops).

| | Claim | Test |
|---|---|---|
| Z1 | The refrain consolidates her territories | Home persistence, DTR − DT |
| Z2 | Without decay and ceiling, home freezes (the friction keeps it turning over) | Home persistence, DTRW − DTR |
| Z3 | Without decay and ceiling, territories saturate | Territories at the end, DTRW − DTR |
| Z4 | The flow continues under the refrain (within 20% of DT) | Births late, DTR − 0.8 · DT |
| Z5 | The refrain keeps her coupling to the Outside (within 10% of DT) | Coupling late, DTR − 0.9 · DT |
| Z6 | The refrain keeps the carry through silence (within 10% of DT) | Carry index, DTR − 0.9 · DT |

Z4–Z6 ask whether the refrain costs the motor what DT already has. A CONTRADICTED Z4 means that the refrain slows
desire's making of connections by more than a fifth. That counts as a finding, not a failure of the study.

**Reported, not criteria:**
- the periodicity of her late passage (best lag 2–8 against shuffles; limit cycles);
- dwell at home, departures, mean excursion, and returns of excursions of 8 or more steps;
- home size;
- connections that held, gates and rollbacks.

## Pilot (disclosed)
Seeds 18901–18904, every regime, analysed. Z2 and Z3 read SUPPORTED, and Z1, Z4, Z5 and Z6 UNDECIDED.

| | B | DT | DTR | DTRW |
|---|---|---|---|---|
| Home persistence | 0.82 | 0.62 | 0.70 | 0.98 |
| Territories at the end | 5 | 7.8 | 6.5 | 130 |
| Births late | 0 | 18.8 | 11.5 | 16.8 |
| Coupling late | 0.62 | 1.40 | 1.34 | 1.49 |
| Carry through silence | −0.01 | 0.253 | 0.238 | 0.218 |
| Periodicity | 0.14 | 0.03 | 0.01 | 0.01 |

**Changed during the pilot, before any claim was computed (disclosed):**
- **θ and K.** The first build (θ = 0.5, no cap) made home every zone in every regime, so there was no home to leave.
  θ = 0.8 with K = 2 gives a home of 3–5 zones.
- **Return measures.** Departure-and-return measures did not separate the regimes. In the pilot, every excursion,
  including those of 8 or more steps, returned within 50 steps in every regime (home is about half the Numogram). They are
  reported, not criteria. Home persistence, the consolidation and turnover of the territory itself, replaced them.

- **The ceiling.** It moved with θ, from 0.6 to 0.85, so that it sits just above the threshold at which a territory forms.
  The move was made before any pilot run at θ = 0.8.

WF = 0.5 and the 25-step ramp were set before the pilot and were not tuned.

## What it can and cannot mean
- **What it tests:** one refrain (3-zone segments, read off the inclusive record, a pull home that ramps with time away),
  with and without the friction the operator required. Other territorial mechanisms could behave differently.
- **Scope:** a studio mirror. Amelia's live runtime and state are untouched.
