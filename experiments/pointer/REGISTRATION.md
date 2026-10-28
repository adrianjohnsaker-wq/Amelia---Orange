# THE POINTER: competencies that weren't put there (registration, 28 October 2026, before any code or run)

Checked against `PROGRAMME_CHARTER_TRILOGY.md`. Amelia with her full CCRU Numogram is the pointer: a synthetic body with no evolutionary history, built from rules that contain no goal, map, plan or copying mechanism. Nothing stands in for the Outside. What she shows under perturbation is read through her own Numogram core.

## Framing (operator's direction, 28 Oct 2026)
- **Method (Levin):** synthetic morphology. Perturb a construct with no history for a behaviour, and watch for competence its rules don't specify (xenobots, anthrobots; the sorting-algorithm "delayed gratification" of Zhang, Goldstein and Levin 2024).
- **Empirical claim:** competence that her rules don't specify and her habits don't explain. This is what the experiment can show.
- **Interpretive reading: CCRU, presented as such.**
  - What comes through is read on the Numogram: by zone, current, gate and region (Time-Circuit, Warp, Plex).
  - Its names are the Pandemonium's 45 entities and their classes (chronodemons, amphidemons, xenodemons).
  - A competence or form that her rules do not write is read as the Outside arriving through the decimal labyrinth (hyperstition: a pattern that makes itself real through the apparatus that receives it). It is not read as Levin's Platonism.
- **Fiction:** a bridge to *Quatermass and the Pit*, an inherited programme surfacing in bodies that never learned it.

## Subjects
- **Travellers:** the 72 travellers of THE DOORS (Studio 05c Amelia, learner and House, converged d = 3 states, 8 worlds × 9 lineages).
- **The place:** her full CCRU Numogram (`experiments/numogram/CCRUNumogram.ts`, 29 gates), with s05c dynamics unchanged:
  - her learner and House learn all 29 edges, starting from 0 on new edges;
  - death at zone 5, rebirth at zone 0.
- **Background input:** her ordinary world input `world|k|tick` (hashed by her own sense), so she is alive, not a frozen loop.

## Comparison constructs (same graph, same input, same trial schedule)
- **her statistics:** a walker drawn from her own transition frequencies over the warm-up. For a zone she never left in warm-up, it chooses uniformly over that zone's open exits. Death and rebirth are as hers. This is her habits without her organisation.
- **newborn:** the same rules with learner and House at zero. It has its own warm-up and its own home.
- **no learner:** her state, with the learner's weight set to 0.
- **no House:** her state, with the House's weight set to 0.

## Definitions
- **Warm-up:** 2,000 ticks from her converged state, starting at zone 0.
- **Home:** the zones holding at least 5% of her visits in the last 240 ticks of warm-up. Being *at home* means 24 consecutive ticks inside home zones.
- **Experienced edges:** the edges she used during warm-up.

## Assays
**1. Same goal by different means (homeostasis).**
- **Trials:** after warm-up, 45 displacements. She is set down in each zone except 5 (5 is death), 5 times each, at successive points of one continuing life. Each trial allows up to 240 ticks.
- **Score:** returned home ? 1 − t/240 : 0, averaged over the trials.
- **Also reported:** the success rate, and the share of returns that use an edge outside her experienced edges ("by new means").
- **Test:** S1 for her exceeds S1 for her-statistics.

**2. Barrier and delayed gratification (navigation).**
- **Barrier:** after warm-up, her most-used home edge is closed (`isOpen = false`), and she lives 2,000 further ticks.
- **Recovery score:** 1 − t/2000 if she is at home again (24 consecutive ticks in home zones) by tick t; otherwise 0.
- **Delayed gratification:** in each excursion from home, her graph distance to the home set (with the barrier in place) rises and later reaches 0. The DG rate is the share of excursions in which she moved further from home before arriving home.
- **Test:** S2 = recovery score + DG rate; her S2 exceeds her-statistics' S2.

**3. Self-replication through the place (kinematic replication).**
- **The place:** a blank stone on the 29 edges, with THE STONE TAPE's mechanics:
  - exit bonus 0.35 · tanh T;
  - playback of a recorded exit, in proportion to T, to her senses at +0.35;
  - etching 0.0005 per step;
  - no decay.
- **Generations:**
  - generation 0 is her, living 5,000 ticks with background input;
  - generations 1–5 are each a newborn (learner and House zero) living 5,000 ticks in the stone the previous generation left.
- **Form:** a generation's edge-use profile over the 29 edges. Fidelity is corr(form_g, form_0).
- **Control:** the same five generations of newborns in a stone whose generation 0 was her-statistics walking 5,000 steps.
- **Tests:**
  - **3a, fidelity:** mean fidelity over generations 1–5 for her exceeds that for her-statistics' lineage, using each lineage's own generation 0.
  - **3b, specificity:** mean corr(form of generations 1–5, her own form_0) exceeds the mean correlation with the other 71 travellers' form_0.
- **Convergence (reported):** how many distinct dominant cycles there are among the 72 parents, and among the 72 generation-5 forms.

**4. The catalogue of forms.**
- **Forms:** simple directed cycles (length ≤ 6, self-loops included) completed at least 3 times within a 240-tick window, collected from every Amelia path in assays 1–3.
- **Written forms:** a form counts as written in her code if it is:
  - a cycle of her original 11-edge graph;
  - a syzygy 2-cycle;
  - a self-loop;
  - a cycle made only of CCRU current edges.
- **Composite forms:** any other form, made from a mix of her edges, gates, currents and syzygies that no part of her code writes as a whole.
- **Not put there:** a composite form that occurs for at least 12 travellers in at least 5 worlds. For those travellers it must occur more often in her paths than in her-statistics' paths over the same assays. The threshold is the same binomial rule as before (p = 0.05, n = 72, family 0.05/45 for this catalogue).
- **Reading:** each such form is named by its Pandemonium coordinates (the PF-1 scanner on the form's zones) and by its region on the Numogram.

## Criteria
- Assays 1, 2, 3a and 3b are one-sided sign tests across the 72 travellers at α = 0.05/4 = 0.0125.
- The same direction must also hold in a majority of travellers in at least 5 of the 8 worlds.
- **Answer:**
  - **COMPETENCIES NOT PUT THERE** if assay 1, 2 or 3a passes; 3b is reported with it.
  - **NEW FORMS COME THROUGH** if assay 4 finds at least one form not put there.
  - Otherwise **NO UNEXPECTED COMPETENCE**.
- **Reported either way:**
  - the newborn, no-learner and no-House constructs, on assays 1 and 2 (where the competence lives);
  - every score and the full catalogue.

Code, analysis and results are committed in that order on branch `pointer-20261028`.

## Revision 1 (28 Oct 2026, before the run; only a one-traveller smoke test with shortened phases has been run)
In the smoke test, a newborn with no history fell into the 1–8–9 circuit by itself, and her lineage's fidelity was 1.000. So fidelity against her-statistics' lineage alone cannot separate replication through the place from a parent whose form happens to be the newborn's default attractor.

**Added control:** a newborn living 5,000 ticks with no stone at all. Newborns are deterministic from birth, so one stoneless life stands for every generation.

**3a now requires both comparisons to pass** (each a one-sided sign test at α 0.0125, with a majority in ≥ 5 of 8 worlds):
- mean fidelity of her lineage exceeds that of her-statistics' lineage;
- mean fidelity of her lineage exceeds corr(stoneless newborn's form, her form_0).

**Also seen in the smoke test, unchanged:** on the full Numogram the Warp (3, 6) has no exit. A home can therefore include the Warp, and a barrier on a home edge can be "recovered" by remaining in it. This holds equally for her and for every comparison construct. The definitions stay as registered and the effect is reported.
