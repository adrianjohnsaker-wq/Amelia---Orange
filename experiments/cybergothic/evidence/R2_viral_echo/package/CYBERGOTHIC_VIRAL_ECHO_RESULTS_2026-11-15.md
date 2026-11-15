# Viral echo: tracking and extending transmitted code

**15 November 2026 · separate cybergothic research prototype · 60 fresh populations, 235 matched encounters**

A costed code echo kept an ordered copy of the transmitted fragment available in more recipients at 24 model-time units. The improvement came from repeatedly inserting additional copies. The test did **not** establish that this particular experienced-code echo improved 24-unit nutrient uptake over an equally costed, digit-matched shuffled echo.

This distinction matters. The earlier study showed an immediate response to the initially transmitted code; its uncertain 12-unit results did not by themselves establish that the code had been rapidly overwritten. The present study tracks the fragment and tests a specific maintenance intervention. It is a study of the developed ecology, separate from Amelia Orange. Its archive reactor and modeled nourishment remain active; it is not a test of an unassisted perpetual population.

## What was tested

Sixty fresh seeds 34001–34060 supplied 235 first-contact host encounters: 120 before and 115 after the programmed environmental reversal. For each encounter, three complete ecological copies began with the same host, donor, packet, random state and **same initial experienced fragment**, inserted at the host's instruction pointer. The 29-gate research engine, asynchronously scheduled agents, mutable matrix, contagion, splicing, Cthell archive and other ecological processes continued to operate.

| Branch | Subsequent treatment |
| --- | --- |
| Natural | No experimental refresh. |
| Experienced echo | Insert the experienced fragment immediately before host action 4 and every third host action thereafter, when permitted. |
| Shuffled echo | Use the same schedule and cost, but insert a seeded permutation preserving the experienced fragment's digit and donor-ancestry composition. |

Each insertion cost **0.05 virtual energy** and was skipped when the host lacked energy or the genome cap would be exceeded. The two echo branches can diverge and therefore need not receive the same realized number of insertions. The original code could also be altered by the rest of the ecology. In **29/235** encounters, the shuffled sequence happened to equal the experienced sequence; those encounters remained in the planned analysis.

The assay marks the initially inserted digits with distinct observation-only ancestry labels. Each later echo has a separate set of labels. An intact copy is present when the ordered labels and their digits appear contiguously in the original recipient's genome. The tracking therefore distinguishes the originally transmitted label lineage from copies supplied by the intervention. A fragmented sequence can still leave individual inherited digits present; absence of an *intact ordered copy* is not necessarily total erasure of every digit.

## Code availability over time

At 24 units, **70/235** natural-branch recipients retained an intact original-label sequence; **143/235** experienced-echo recipients had an intact original or echo copy. The planned seed-weighted echo-minus-natural difference was **+31.25 percentage points** (97.5% population-clustered bootstrap interval **+22.36 to +40.56 points**). A dead recipient is scored as having no retained copy. The interval adjusts for the two planned primary comparisons.

| Time after encounter | Natural: original lineage intact | Experienced echo: original or refreshed copy intact | Experienced echo: original lineage intact |
| --- | ---: | ---: | ---: |
| 6 units | 48.3% | 66.7% | 43.9% |
| 12 units | 41.8% | 70.6% | 32.4% |
| 24 units | 29.6% | 60.8% | 22.4% |
| 36 units | 23.5% | 49.3% | 16.0% |

These are population-weighted means, so they can differ slightly from raw encounter proportions. The echo's maintained copy is an engineered replacement: it does **not** show that the original physical sequence remained intact. Indeed, the exploratory original-lineage comparison at 24 units was **−7.22 points** for echo versus natural (unadjusted 95% interval **−12.78 to −1.67**). Insertions can break up an existing contiguous sequence while creating new copies; the present analysis does not isolate the mechanism behind that difference.

## What disrupted, and sometimes restored, the original

In the natural branches, the first detected loss of an intact original-label sequence occurred while the host was alive in **132/235 encounters** by 24 units. Another **41/235** recipients died without a previously detected loss; **62/235** were alive without a detected loss through that horizon. First-loss observations included:

| Event at which intact sequence first ceased | Encounters |
| --- | ---: |
| Replay | 38 |
| Necrotic reinjection | 31 |
| Direct infection | 18 |
| Chrono recall | 15 |
| Vector infection | 12 |
| Genome mutation | 12 |
| Time-splice | 6 |

These are descriptive event attributions from this implementation. Insertions can interrupt contiguity without destroying all transmitted digits, and the figures do not establish that Warp mutation was the main cause of loss. In **8** natural-branch encounters, the original tagged sequence had first ceased to be intact and was present again at 24 units; the recorded restoration events were replay in five and chrono recall in three. Thus the code's history can be interrupted and recovered, rather than following a single irreversible decay.

## Did maintained code help the host?

The planned functional comparison was experienced echo versus shuffled echo, both with the same initial experienced insertion and the same cost rule. Through 24 units the seed-weighted mean recipient nutrient uptake was **0.6362** versus **0.6168** virtual units. The paired difference was **+0.0193** (97.5% interval **−0.0407 to +0.0775**). The interval includes both a modest harm and a benefit; it does not establish equivalence or an advantage for experienced ordering.

At 24 units, **155/235** original recipients survived in the experienced-echo branch and **156/235** in the shuffled-echo branch. Survival was secondary; its unadjusted 95% interval for the paired difference included zero. The experienced echo cost a seed-weighted mean **0.201** virtual energy units by 24 units, compared with **0.205** for the shuffled echo. Across the full 36-unit follow-up, experienced and shuffled branches delivered **1,337** and **1,391** echoes respectively; three and one attempts were skipped. Differences in total realized dose can arise after branches develop different host lives and action counts.

The earlier short-term finding and this uncertain later result are compatible: transmission can alter the next action, while this repeated-copy strategy has not yet demonstrated a specific longer-term benefit of experienced ordering. It would be premature to claim either permanent efficacy or proven evolutionary washout.

## Design, checks and persistence

Each population contributes equally to estimated contrasts. The two primary comparisons use 10,000 seed-clustered bootstrap resamples and two-sided **97.5%** intervals; secondary intervals are unadjusted. The plan and outcome code hashes were fixed locally before the 34001–34060 runs, following one fixture and two inspected development-pilot seeds. This was not independently witnessed public preregistration. The intermediate pilot tracer source was not separately frozen; its output is included as development material, not mixed into the fresh outcomes.

The observation labels replace ancestry slots within the experimental branches; the original donor ancestry is retained in the encounter records. In a fixture for each branch, the tagged and untagged versions produced the same event history and final state after ancestry fields were removed. All **705 outcome branches** were regenerated and matched their recorded results. A separate ledger checker recomputed host actions, nutrient uptake and echo deliveries for **36 branches** across three seeds; three complete example ledgers are included. This is checking a replay of the same underlying simulator, not a second independent implementation of the ecology.

The prior research engine's durable state is retained. An additional, isolated SQLite checkpoint format for this echo extension stores the world, event chain, original and echo labels, action counter information and observation history together. A paused branch with active echoes was restored in a fresh Python process and matched an uninterrupted continuation's complete event and state hashes. A deliberate checkpoint alteration was detected. An example paused checkpoint is supplied. This added persistence test was implemented after the outcome study; it did not change the frozen outcome code or rerun the primary outcomes with a revised mechanism. Amelia's live Supabase memory and application remain untouched.

The sealed plan, exact source, per-seed observations, action and echo traces, replay audits, selected full event ledgers, checkpoint example and figure are in the evidence bundle. The study's signals and energy are generated within the model and do not establish physical retrocausation or contact with an external intelligence.
