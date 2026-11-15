# Longitudinal chimeric-junction tracking

**Protocol draft · 15 November 2026 · Separate cybergothic Numogram prototype**

**Status:** design and retrospective feasibility analysis. The reference provenance operations in this package are not connected to the running ecology. The 20-seed invariance test, integrated checkpoint test and prospective 250-graft cohort have **not** been run. Complete the gates in §11, freeze the final source and analysis hashes, and register the final plan before starting the cohort.

## 1. Research question

When an ordinary viral transfer makes a mixed host–viral `09` closure in a self-parsing digit genome, can that **particular newly formed junction** pass to other hosts, survive across fission and necrotic recycling, or give rise to further repaired junctions? Does keeping the code non-executing change propagation, recipient survival or reproduction?

The object is an actual occurrence of a chimeric boundary, not just the text `09`. Exact matching of short strings cannot establish descent. The programme will preserve the pure digit genome and add an **external observational shadow tape**, invisible to the interpreter, ecology and random generators.

The previous 47 versus 68 lineage-birth counts are an exploratory signal, not a demonstrated survival–reproduction trade-off or a classification of hosts as r- or K-selected. This study measures survival, fission and transmission together and retains unsuccessful and extinct lineages.

## 2. Feasibility from already-inspected populations

I regenerated the natural, unperturbed trajectories for the 540 populations of the previous viral-stop studies and screened their recorded direct infections and vector deliveries. The screen used insertion coordinates and digits, **not watermarks**. It required an untruncated insertion, a recognised resulting intron of at least six digits, and a `09` closure composed of one incoming and one recipient digit.

| Historical structural screen, to model time 180 | Result |
| --- | ---: |
| Populations with at least one candidate | **373/540 (69.1%)** |
| Candidate insertion events | 881 |
| Populations with a split-existing-stop candidate | 190 |
| Populations with an unclosed-frame candidate | 317 |
| Populations with both kinds | 134 |
| Median time of a population's first candidate | 77.7 model-time units |
| Median span of that first candidate | 13 digits |

At this historical rate, 250 qualifying populations would require roughly **362 screened populations on average**. This is a planning approximation, not a sample-size guarantee: the seeds were already inspected, and the full watermark, checkpoint and ancestry eligibility checks did not exist. The structural rate may overstate the final eligible rate. A proposed ceiling of 600 fresh screened seeds is specified below; if it yields fewer than 250 eligible populations, report the shortfall and do not silently extend the sample.

The estimated 357 extensions in the earlier report were **events**, not 357 independent populations. Also, the open-frame and split-stop strata differ; do not treat them as interchangeable. In the historical screen the first candidate was a split stop in 101/373 eligible populations and an unclosed frame in 272/373.

## 3. Primary model and isolation

Use the current 10-zone, 29-gate digit-only ecology with asynchronous scheduling, infection, vector delivery, time-splicing, Cthell archive/reconstitution and the existing `80 <zone> <body> 09` / `60 <body> 09` parser. Keep the previous from-birth configuration: 36 initial random hosts, 180-host limit, 512-digit genome cap, transient Θ=12 Warp flight, uniform movement weights, seeded entropy, `recovery_floor=8`, `pulse_renewal=0.6`, feedback gain 1.8, target steering, random archive selection, learned forecasts, intact vectors with experienced-cargo selection, temporal hold 3, retention 0.85, salvage feedback and portable bets. Fix the complete configuration and exact source hashes in the registration.

External nutrient renewal and the costed archive reactor remain on. All data, checkpoints and diagnostics use a new local research directory and SQLite database. The runner must have no access to Amelia Orange, her Governor, live databases or Supabase credentials. The experiment makes no claim of closed-energy self-sustainability.

## 4. Shadow-tape design

The primary engine stores and executes only its ordinary digit string. The observer maintains separate mappings for living genomes, corpse fragments, archive snapshots, vector packets and each historical genome retained for replay/recall. No agent, opcode, movement function, genome, matrix instruction, metabolism or random-generator decision may read these mappings.

Each shadow digit carries an immutable record:

`(run_id, origin_event_id, origin_host_id, origin_model_time, original_offset, digit_value)`.

The original offset distinguishes different digits created in the same event. Event IDs must include the population seed, a globally unambiguous ledger sequence and, after a fork, a branch namespace. Copies retain the source digit record. A point overwrite creates a new origin record even if the replacement happens to have the same value. Record both the value and the event, so the observer can check that shadow digits match the primary string after each operation.

### Track adjacency as well as digit origin

Digit origins alone do not identify a particular graft. The same inherited `0` and `9` can be separated and later joined again. Maintain a second immutable **adjacency ID** for each ordered neighbouring pair. A contiguous copy preserves its internal adjacency IDs; a new join, including either boundary of an insertion, receives a fresh ID `(seed, branch, event_sequence, affected_object, boundary_ordinal)`. If a viral slice wraps from the end of a circularly read genome to its beginning, that wrap is a newly formed adjacency in the copied slice, not an existing linear adjacency.

At the qualifying event, the new mixed-origin closing adjacency is the **focal junction `G`**. Record its two source records, its new adjacency ID and the complete recognised intron at that moment. Separately give every copied digit and edge occurrence its own node, with a parent pointer to the exact source occurrence, while retaining the same immutable origin or adjacency-lineage ID. Store occurrence-level transfer edges identifying source object, destination object, copied offsets, actual delivery event, time and mechanism. This distinguishes two copies of one ancestral digit and makes a chain of transfers auditable even when an atom or adjacency has been copied several times. All branch IDs share the same `G` for their common pre-intervention graft; post-fork events receive branch-specific IDs.

“Chimeric” describes **where the two digits came from at this insertion**: one copied position was in the viral slice and the other was in the recipient's pre-insertion string. Their ultimate origin hosts may be the same because of earlier circulation. Never infer an incoming-versus-recipient source merely by comparing original host IDs.

### Mirroring operations

| Engine operation | Required shadow operation |
| --- | --- |
| Random founder | Mint unique digit and adjacency origins. |
| Direct infection or vector delivery | Copy the exact actual source offsets and preserved internal edges; mint insertion-boundary edges; apply the same genome cap. |
| Vector shedding | Store the shadow slice on the packet **at shedding time**, including the exact source position chosen by experienced-cargo selection; the donor may later change or die. |
| Time-splice | Copy both directions from their respective **pre-exchange** tapes. Record as time-splice, not viral infection. |
| Fission | Copy the actual suffix and its internal adjacencies; retain the parent–child relation. |
| Point or necrotic mutation | Mint a new digit origin and new adjoining edges; keep all untouched origins. |
| Corpse, decoy and shrapnel | Mirror the exact source slice and cause; retain a tombstone when the agent has already been removed. |
| Archive and reconstitution | Preserve the archive snapshot separately from the mutable corpse; mirror the documented reconstitution mutation and its source. |
| Replay or chrono recall | Restore the shadow **history snapshot corresponding to the restored genome**, not a new founder or an inferred copy. |
| Scramble intervention | Move each digit and its origin record together; preserve only adjacencies actually carried in the same order, and mint the new joins. |

Insertion, mutation, truncation and source offsets must be checked against the primary before/after strings. Some existing event records do not expose every source offset or the exact moment a history entry is stored. Add passive, separate observer hooks at those operation sites, without adding events or fields to the primary ledger. Never choose a plausible source by substring alone when repeated digits make the source ambiguous. If a required transition cannot be reconstructed, mark the observation **unknown** and fail the verification gate; do not call it a mutation, true transmission or convergence.

The accompanying `shadow_reference.py` demonstrates digit-origin and adjacency-copy rules in isolation. It is a reference, **not an integrated observer**.

## 5. Qualifying graft at t₀

Screen the first eligible event in each independently seeded population, in actual primary-ledger sequence order, through model time 180. The host may acquire it through a successful direct viral insertion or a delivered vector. Qualify only if all conditions hold immediately after the event:

1. **Landing.** The insertion splits the `0|9` of a recognised recipient intron, or joins immediately adjacent recipient and incoming digits within a visible unclosed `60` frame and closes that frame.
2. **Mixed boundary.** The resulting recognised `09` consists of one copied viral digit and one pre-insertion recipient digit, verified by exact offsets and shadow origins. Both closing digits remain in the capped result.
3. **Recognised span.** The resulting intron begins with `60`, ends at this `09`, is parsed by the existing non-nesting rules and has length **at least six** digits, including its start and stop.
4. **New junction.** Its adjacency ID `G` is minted at this event and was absent from the population immediately before it. Do **not** require all digit-origin IDs to be absent from other hosts: a viral digit may already exist in its donor or other descendants. Record pre-existing sequence lookalikes separately.
5. **Complete insertion.** The entire recipient genome and incoming slice fit under the cap, so the immediate result is the full before-string with that slice inserted. Count otherwise-qualifying clipped insertions separately; this restriction may underrepresent long genomes. Normal capped insertions remain enabled during follow-up.
6. **Known state.** All required source, recipient, packet and history tapes are complete and agree with primary digits. Do not select on later survival, reading, reproduction, transfer or persistence.

The unclosed-frame stratum must have a `60` start that is not inside a previously recognised region and had no closing `09` later in that original frame. The inserted closure must cross the physical boundary between recipient and incoming slice. The split-stop and unclosed-frame strata are reported separately as well as together.

A six-digit intron is **not** guaranteed rare by length: with fixed `60` and `09` ends, a six-digit sequence has only two unconstrained digits, or 100 possible bodies under a uniform ten-digit assumption. Real genomes are neither independent nor necessarily uniform. Length is an inclusion rule, not proof that a match is a descendant.

## 6. Cohort and event-time checkpointing

After the verification gates and the small development pilot, use previously uninspected seeds **50001–50600**. Process seeds in numerical order and stop screening when the first **250 independent populations** have each produced their first qualifying graft, or after seed 50600, whichever comes first. Report all screened, qualifying and nonqualifying populations and any pre-specified technical failures. Do not add seeds because an outcome is unfavourable.

Set `t₀` to the actual graft event's model time and follow each branch until **t₀ + 48 model-time units**. Scan after every relevant mutation, transfer, birth, death, restoration or archive event, plus the final horizon; the model has no global simulation tick. The outcome unit is the independent population/graft, not the number of infections within it.

The existing engine may emit an infection **inside an agent action**. A normal SQLite checkpoint taken in the middle of the Python call would omit the live call stack and is not an exact resumable state. Save a complete paired model/shadow checkpoint at the preceding scheduler-safe boundary, preserve the pending event, replay deterministically to the recorded `t₀` event in each branch, apply the assigned intervention at that exact hook, and finish the action. Make the next ordinary checkpoint only at a complete scheduler boundary. Record any mutation, other transfer, fission or death occurring between `t₀` and that boundary; never exclude a graft because its founder did not survive to the checkpoint. An equivalent resumable event-continuation design is acceptable only after it passes the same hash-invariance tests.

## 7. Matched branches and the natural comparison group

All branches below begin from the same primary and shadow state before the scheduled event and experience the same natural graft at `t₀` before intervention. Experimental hooks may identify the selected recipient and recorded location, but **the simulation's parser must not consult watermarks**.

| Branch | Intervention and interpretation |
| --- | --- |
| **Natural chimera** | No change; ordinary parser and ecology. |
| **Ruptured stop** | Change focal `09` to `08` immediately after the graft. The new `8` is a new origin, and the resulting `08` adjacency gets a new branch-specific ID `G*`, explicitly linked as an intervention-created variant of `G`. |
| **Recipient-active interpreter** | Keep the genome and `G` identical, but make only the original recipient interpret all its recognised introns as active during its actions. Descendants use the normal parser. This is a researcher-applied execution control, not a genome watermark. |
| **Scrambled body** | Permute the focal body while preserving `60`, the `09` closure, genome length and digit multiset. Move each digit's shadow record with it and mint new adjacencies as appropriate. |
| **Signature-matched rupture** | As a planned sensitivity control, change `09` to `00`; this preserves the genome's mod-9 sum, though it changes an opcode digit. Give the new `00` edge its own variant ID. |

For the scramble, use a **separate experiment-only** RNG derived from a documented hash of the seed and event; never consume a simulation RNG draw. Try at most 64 predetermined permutations and take the first different digit sequence for which the intended `60` and focal `09` still define the same parsed boundaries. If none exists, label this branch `scramble_not_applicable`, run an unchanged sham and retain the population in every other analysis. The scramble comparison is secondary and restricted to the applicability group; report its denominator.

Changing `09` to `08` changes the recipient's mod-9 signature and can affect later infection eligibility as well as instruction execution. In addition, a later `09` may keep the body silent: inspect and record the parser immediately after each edit rather than assuming the edit always exposes it. The `00` and recipient-active controls help interpret these effects, but do not turn the physical edit into a pure stop-only manipulation.

The proposed **non-chimeric rebuilt stop** cannot be a same-state fork of the original natural event: it is a different encounter. Define it as a separate observational comparison group whose closure's two digits both came from the same incoming slice. That donor adjacency may have existed in multiple hosts before the index encounter, so record all pre-existing carriers at baseline and count later first acquisitions separately; do not give it the focal chimera's newly minted `G` status. Select its first eligible event per population using the same deadline, without outcome information. Match or stratify on pre-event zone, time, source mechanism, intron length, host energy and age, local population and available resources; report unmatched events and residual differences. It is a descriptive comparison, not a randomised branch or a causal estimate of chimerism.

## 8. Carrier and route definitions

After `t₀`, audit every living host for `G` by its **adjacency identity and transfer path**. A recognised-junction carrier must also have `G` as the closing `09` of a currently recognised `60…09` intron. A host carrying the edge outside such an intron is recorded as an edge carrier, not a functional intron carrier.

For strict intron retention, require the recognised intron to contain descendants of **at least 80%** of the original focal intron's digit occurrences in their original order, including both closing atoms and `G`. Trace those occurrences through their copy-node parent pointers; matching a shared founder-origin ID alone is insufficient. Use a one-to-one, monotone alignment; duplicate occurrences cannot be counted twice. Record the exact percentage and a stricter 100% measure as well. A short direct viral payload can carry the two-digit junction even when it cannot carry the whole six-or-more-digit intron; report **junction-only** spread and ≥80% intron retention separately.

For each first acquisition by a host, retain a primary route plus the full path:

* `TRUE_VERT_ONLY`: a fission descendant of the `t₀` recipient whose verified `G` path is vertical from that recipient and meets the strict retention rule.
* `TRUE_HORIZ_NONKIN`: a host outside the founder's fission-descendant tree that acquired `G` through one or more verified direct/vector transfers and currently has it as a recognised intron stop.
* `MIXED_VERTICAL_HORIZONTAL`: a fission descendant whose verified `G` path includes viral transfer. Count it once in a union, and report both host ancestry and transfer history; do not force it into a false exclusive choice.
* `DRIFT_REPAIR`: the original `G` adjacency has been destroyed, but the original `60` start records remain together in a recognised intron with a new, traceable closing adjacency. Distinguish retention of the original start adjacency from later reassembly of the two start digits, and distinguish mutation, transfer, time-splice and recall as the new stop join's cause.
* `NECROTIC`, `TIME_SPLICE`, `CHRONO_RECALL`, or `OTHER`: use the observed route; a corpse reinjection is not a new direct viral infection, and a replay is not time travel.
* `UNKNOWN`: required shadow source or path cannot be established. Never reclassify this as convergence.

Host family relation and copy mechanism are separate attributes. A virus can infect a genetic relative, and the descendants of a horizontally infected host can subsequently inherit the junction. For the user's requested vertical-plus-horizontal union, count each eligible living secondary host once and disclose mixed paths. Count archive-only copies separately; they are dormant records, not living hosts, until reconstitution.

For identical whole-sequence matches, distinguish `G` descendants; matches with **zero focal digit-origin overlap and a complete trace**; partial-overlap/reassembled matches; pre-existing lookalikes; and unknowns. The zero-overlap class is a non-descended sequence match, not proof of a completely unrelated earlier genome. A newly reconstructed `09` with identical digits but a new edge ID is not the original `G`.

## 9. Outcomes and analysis

The independent unit is one selected population. Keep populations where the founder dies immediately, the population becomes empty or `G` fails to transmit. Never condition the primary analysis on a later successful transfer.

**Planned descriptive primary outcomes in the natural branch:**

1. The proportion with at least one living secondary carrier in the union of `TRUE_VERT_ONLY`, `TRUE_HORIZ_NONKIN` and `MIXED_VERTICAL_HORIZONTAL` at `t₀ + 48`; give the components and ≥80% strict-intron results. Report a 95% Wilson interval across independent populations. Other routes are reported separately.
2. The number of verified direct/vector events in which the focal `G` adjacency is actually copied into a recipient and is recognised as an intron stop immediately after insertion. Report total events, unique first recipient hosts, per-population distribution and a seed-cluster bootstrap interval for the mean. Also report events per eligible contact and host-time at risk when those denominators are valid; distinguish repeated deliveries from first acquisition. The observer must capture unsuccessful and rejected contact attempts separately if they are used in a denominator; the existing primary ledger does not record every attempted infection.

**Two planned paired causal contrasts:**

* Natural versus recipient-active: the difference in the proportion with at least one living secondary recognised-junction carrier of the **same `G`** in the vertical/viral/mixed union at the horizon. This tests a recipient-level change in intron interpretation; it affects all that recipient's introns.
* Natural versus physical `08` edit: the difference in the proportion with at least one living secondary carrier with a verified vertical or viral path of the branch-specific homologous edge **`G` versus `G*`**, irrespective of whether it is a recognised `09` stop. This is allele-marker propagation under a physical digit edit, not a comparison of two intact introns. Comparing exact original `G` in both arms would be mechanically biased because the edit destroys it at `t₀`.

Use 10,000 population-paired bootstrap resamples with two-sided **97.5%** percentile intervals for these two contrasts. Report the paired 2×2 counts, estimates and intervals even if no difference is clear. Keep the `00` sensitivity and the scramble comparison secondary. Fixed-budget 250 gives a worst-case descriptive 95% proportion margin of about six percentage points; it does not guarantee power for a paired effect, which depends on discordance and the frequency of actual transmission.

The pre-specified sequence-collision audit groups focal introns by exact length **6**, exact length **8**, and length **10 or more**. At the final horizon count distinct living nonfounder host–sequence matches and report the proportion with a complete trace and **zero focal digit overlap**. Show `G` descendants, partial/reassembled matches, pre-existing lookalikes and unknowns separately; keep unknowns out of the confirmed-zero numerator. Give numerators, denominators and seed-cluster uncertainty, and mark empty strata as not estimable. Report event-level first appearances separately to avoid counting one unchanged host repeatedly. Use matched digit-frequency or context shuffles only as supplementary nulls, and estimate their collision rates in the actual genomes rather than assuming uniform independent digits.

Secondary outcomes include recipient survival, restricted lifetime, fission events, descendant births, living descendant counts, host age and energy, realised opcode families and no-ops, heat, meltdown, nutrient intake, archive/corpse persistence, secondary carriers by route and first-passage time. A survival–reproduction trade-off requires a prospective joint comparison of survival and birth outcomes; raw birth totals and labels such as r- or K-selection are insufficient.

## 10. Statistics and reporting discipline

Specify the natural inventory, two paired contrasts, strata, seed rule, event deadline and all exclusions before the confirmatory run. Analyse split-stop and unclosed-frame strata separately as pre-specified effect descriptions; avoid post hoc filtering for hosts whose code was actually executed. Report event counts and host counts distinctly. Compare matched population branches with the same frozen initial state and environmental stream, while allowing their subsequent endogenous random paths to diverge after intervention.

The independent non-chimeric encounters and all additional phenotype, drift, collision and offspring analyses are exploratory unless separately registered. Do not interpret a zero-crossing interval as equivalence. If a trace is incomplete, state the number and reason and do not promote it to a positive or a negative ancestry classification. If archive reconstitution or nutrient renewal contributes to persistence, report it.

## 11. Pre-run gates: all must pass

1. **Twenty-seed non-interference:** on development seeds `45001–45020`, run the exact same model with the observer enabled and disabled. Compare canonical **primary** state, complete primary event ledger, queue, histories, archives, packets and all primary RNG streams at scheduler boundaries, and compare actual random outputs with a separately validated RNG tracer. Use seeded or identically recorded entropy. For live clock jitter, capture once and replay identically: observer overhead can itself alter a timing sensor. The primary hashes must match exactly. An SQLite file containing shadow tables will naturally differ at the file-byte level; compare the canonical primary projection and primary ledger, while hashing the shadow data separately.
2. **Copy conservation:** forced fixtures and naturally occurring examples must cover fission, direct infection, vector shedding and delivery, circular slices, two-way time-splice, genome-cap truncation, corpse/shrapnel/decoy creation, archive and reconstitution. Verify every copied digit and adjacency, including repeated identical digits. A standalone reference test is not a substitute for the integrated engine check.
3. **Mutation and repair:** point, necrotic and experimental mutations create new atom/edge identities as specified, including same-value overwrites; rejoining the same atoms in a later event creates a new adjacency. Confirm that literal lookalikes with unrelated origins do not get credited as `G` descendants.
4. **SQLite and process restart:** write primary and shadow data in the **same atomic SQLite transaction**, linked by model checkpoint sequence, primary state hash and primary ledger head. Resume in a fresh process and compare the entire continuing primary trajectory, shadow hashes and all `TRUE_VERT`, `TRUE_HORIZ`, drift and false-match classifications with an uninterrupted run. Verify rollback after injected failure and reject mismatched primary/sidecar pairs. The current journal's transaction handling must be adapted rather than nested unsafely.
5. **External isolation:** exercise the research runner with network access disabled, no live credentials and a fresh local output directory; assert no reads or writes to Amelia Orange's state or any Supabase endpoint. Record the actual commands and result.

Additionally, test replay/chrono history snapshots, event ordering and grafts where the founder dies before the next scheduler boundary. Hold a separate small development pilot, proposed seeds `45101–45140`, out of the prospective cohort. Confirm eligibility and audit coverage without selecting primary outcomes. Then seal source and analysis hashes and register the final seed range. If any gate fails, repair the observer and rerun all affected checks **before** the prospective cohort; do not infer missing ancestry.

## 12. Present design checks

The accompanying standalone reference passed seven tests of graft identity, inherited edges, independent lookalikes, fission slices, point overwrite, circular copies, capped insertion, independent reassembly and a JSON tape round trip. Four synthetic tests checked the structural candidate screen. These tests exercise reference operations, not the full running ecology. The historical 540-population reanalysis is retrospective and is not the prospective study. The five integrated pre-run gates above remain pending.

## 13. Provenance for this draft

The following hashes identify the historical baseline and the reference used to prepare this design; they are **not** a seal of a future integrated observer or of a registered confirmatory run:

```
4c05bf30346962a9fc9e1b1de6601ec77725ff3a77b990343024b8131693f4ab  digit_world.py
2527366f0de2b20a17b32327b6a86568df2f49eaf13aa906173cf14296e58bf3  legacy_engine.py
d442cc2972707247930aa11ef63fc60ea97c2b24af240ae7511d640c2e3a1147  reactor.py
e501574f89b943942ff21669ea01255e1b9153652070fd7c905573be27e8c835  assemblage.py
099812a9df2e4ddcabdddbe948cf62ca35768424e35e672f36d44109cc6626b3  design_feasibility.py
11ab277fb103a7de3650fc7e8c7d3e88c5637124a4253a3fcbb80f327cb8509c  historical_feasibility_540.json
e7027546d58a6ab8a46e36fba70d6de06bc19f15b30fbef4453833b318e415e5  shadow_reference.py
83570450d17ac1fb402e7b2c66fef0c61cdc1202c33bda9f17efc08e0b0c2a33  test_shadow_reference.py
13db0bf09ec35132f1dd2b1620b817d5fc4b2d364192d7d6730ae76838a7ae9e  test_design_feasibility.py
```
