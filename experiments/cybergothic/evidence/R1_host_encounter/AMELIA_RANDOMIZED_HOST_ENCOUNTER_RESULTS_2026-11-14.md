# Randomized viral fragments: what happened to the host?

**14 November 2026 · separate cybergothic Numogram prototype · two studies of 60 fresh populations each**

The experienced fragment **changed the recipient's immediate resource uptake in this prototype**. An initial study found an exploratory next-action signal; a second, locally fixed study tested that signal on 60 fresh populations, with stricter first-contact tracking and encounters on both sides of the environmental reversal. In that confirmation, the experienced fragment produced more nutrient on the recipient's first action than either pointer-selected or shuffled code. The studies did **not establish a clear 12-unit advantage** in total recipient uptake or recipient survival.

This is a more direct test than the preceding population-wide comparison. Every comparison starts at one actual gate-matched encounter with the **same recipient, donor, route, packet cost, instruction pointer, resources, clocks, memory and RNG state**. The ecology is then simulated separately after inserting experienced, pointer-selected or shuffled code. All work stayed in the separate prototype; Amelia Orange and her live state were not touched.

## The encounter

At packet shedding, the donor supplies three equal-length virtual code fragments:

1. **Experienced:** a fragment selected using the donor's recorded prior nutrient uptake.
2. **Pointer:** the fragment at the donor's instruction pointer at shedding.
3. **Shuffled:** a seeded permutation of the experienced fragment, preserving the digits and their per-digit ancestry tags.

The packet follows the existing Numogram gates. Once a gate-matched host is chosen, the entire ecology is paused **before** insertion. The three fragments are delivered at the same host instruction pointer in three matched copies, with the same immediate energy-transfer rule. Subsequent infections, splices, movement, mutations and deaths continue normally. One of the three assignments, selected by an independent balanced random schedule, is also applied to the continuing ecology from which later encounters are sampled.

Sixty new seeded populations each supplied eight different recipients: **480 matched encounters and 1,440 follow-up branches**. The three actual continuation assignments were exactly balanced at **160 each**. A packet was sampled at most once after the post-warm-up sampling began; no recipient was sampled twice in the same population. All follow-ups covered 12 model-time units, and all three copies of each encounter experienced the same independently generated environmental signal sequence. Their ecological trajectories could diverge after insertion.

The experienced and pointer sequences differed in **454/480** encounters; experienced and shuffled differed in **422/480**. The first digits differed in 386 and 299 encounters, respectively. All 480 experienced candidates had a recorded donor experience. Identical sequences were retained in the planned analysis rather than discarded after outcomes were known. The search recorded no exclusions for genome-cap truncation; it skipped packets already delivered during sampling and recipients already sampled.

**Protocol deviation found in the audit:** the plan called for a packet's first host delivery, but the exclusion tracker began after warm-up. Seventeen sampled packets had a previously logged successful infection during warm-up, including one previous infection of the same recipient. Any such history was shared by all three matched copies at their fork. An exploratory sensitivity analysis removing those 17 encounters left 463 and did not change the interpretation: all four adjusted intervals still included zero. For example, experienced-minus-pointer uptake became −0.0066 (98.75% interval −0.0374 to +0.0241), while experienced-minus-shuffled survival became +2.98 points (−1.49 to +7.38). The audit can identify earlier logged successful infections; it cannot rule out earlier silent contacts that produced no logged insertion.

## Planned host outcomes

The first outcome is all nutrient harvested by the **same recipient** during its 12-unit window, with no further uptake after death. The second is whether that original recipient ID is alive at the end. The mean differences weight each of the 60 independent populations equally; the intervals are **98.75% seed-clustered bootstrap intervals**, adjusted for the four planned comparisons.

| Recipient outcome | Experienced | Pointer | Shuffled |
| --- | ---: | ---: | ---: |
| Mean 12-unit nutrient uptake | 0.3123 | 0.3165 | 0.3018 |
| Survived to end of window | 400/480 (83.3%) | 394/480 (82.1%) | 385/480 (80.2%) |
| Mean number of actions | 7.78 | 7.93 | 7.70 |

| Paired contrast: experienced minus control | Estimated difference | 98.75% interval |
| --- | ---: | ---: |
| Nutrient versus pointer | −0.0042 | −0.0339 to +0.0260 |
| Nutrient versus shuffled | +0.0106 | −0.0082 to +0.0308 |
| Survival versus pointer | +1.25 percentage points | −3.33 to +5.83 points |
| Survival versus shuffled | +3.13 percentage points | −1.25 to +7.50 points |

Every planned interval includes zero. The data therefore do not clearly support an experienced-fragment advantage on these two outcomes over this window. They also do not prove that the treatments are equivalent: the intervals still allow benefits or harms of the sizes shown.

## What the code did inside the host

The injected digit was not merely stored. In the experienced branches, **351 of 477** recipients with an observed next action executed the first injected digit as that action's operand; the corresponding counts were 353/477 for pointer and 352/477 for shuffled. In **126/480** experienced branches at least one event capable of changing the host genome occurred before its first action. Such an event does not necessarily erase the injected fragment, but it shows that the surrounding ecology can intervene before the host next acts.

Among the **477 paired encounters in which the host's next action was observed in both compared branches**, the next resource focus differed in 198 experienced-versus-pointer pairs and 149 experienced-versus-shuffled pairs. In a separate deterministic fixture, two known fragments changed the host's focus and immediate uptake while its starting state and transfer cost were held fixed. These checks show that the virtual interpreter can express a fragment as different behavior; they do not mean that every observed focus difference was caused solely by the injected digit, because further ecological interactions were allowed.

An exploratory, unadjusted analysis of that **next observed action** found mean experienced-minus-pointer uptake of **+0.00634** (95% seed-bootstrap interval **+0.00274 to +0.01010**) and experienced-minus-shuffled uptake of **+0.00525** (95% interval **+0.00267 to +0.00807**). This conditions on the host acting in both futures, uses shorter follow-up than the planned endpoints, and was not one of the four multiplicity-adjusted primary tests. It is a useful candidate signal, not a confirmed lasting benefit.

A further exploratory analysis limited to the 422 encounters where experienced and shuffled strings actually differed estimated survival at **+3.83 percentage points** for experienced, with an unadjusted 95% interval of **+0.08 to +7.65** points. This is a selected, unadjusted secondary comparison; the planned all-encounter survival interval includes zero. It is not a confirmed survival effect.

## Fresh confirmation of the first action

After discovering both the first-action signal and the warm-up contact-tracking deviation, the sampler was corrected to track **all** packet–host contacts from initialization, including silent contacts that insert nothing. A new plan was saved before running **60 fresh seeds**. It made first-action nutrient uptake the primary outcome, with zero assigned if the original recipient took no action in 12 model-time units. It also requested up to four recipients before the environmental reversal and four after it.

The corrected run yielded **463 matched encounters**: 240 before the reversal across all 60 populations, and 223 after it across 58 populations. Every recipient took a first action in all three matched branches. As before, the same host and full ecology were frozen before the packet insertion. Intervals below are **97.5% seed-clustered bootstrap intervals**, adjusted for the two planned first-action comparisons.

| First-action outcome | Experienced | Pointer | Shuffled |
| --- | ---: | ---: | ---: |
| Mean nutrient uptake | 0.04527 | 0.03963 | 0.03844 |
| Original host's first action observed | 463/463 | 463/463 | 463/463 |
| First executed digit matched the inserted first digit | 363/463 | 368/463 | 353/463 |

Experienced minus pointer was **+0.00564** nutrient units (97.5% interval **+0.00108 to +0.01034**). Experienced minus shuffled was **+0.00683** (97.5% interval **+0.00272 to +0.01098**). These are small absolute effects, but both planned intervals favor the experienced fragment in this modeled environment. The shuffled control preserves the experienced fragment's digit and ancestry composition, so this comparison is consistent with a functional contribution from its ordering or position-dependent execution. Other ecological events between insertion and first action are part of the treatment's possible pathway; the test does not isolate a single digit's mechanism.

In secondary analyses, the first-action difference appeared larger among the sampled post-reversal encounters than before reversal, but phase-specific intervals were unadjusted and the phases had different eligible populations. This study did not pre-register an interaction test, so that pattern is a question rather than an established difference between regimes.

The confirmation's **12-unit** outcomes were secondary and did not show a clear sustained benefit. Mean total nutrient uptake was 0.3889, 0.3911 and 0.3728 for experienced, pointer and shuffled; original-host survival was 378/463, 387/463 and 372/463, respectively. The unadjusted 95% intervals for experienced-minus-control uptake and survival included zero. Thus the fresh test supports an immediate functional effect in the prototype, while leaving its persistence and effect on survival unresolved.

## What this changes in the interpretation

The prior study found greater **population-wide** uptake with experienced cargo over 180 model-time units. These host-level assays reproduce a small immediate benefit on the next action, but do not show a clear advantage in an individual recipient's total uptake or survival during 12 units. The measures and horizons differ, so this does not erase the population result. It does mean that we cannot yet explain that population result as a demonstrated sustained improvement to each infected host.

The pattern leaves several possibilities open: a fragment may alter an immediate action without producing a lasting host advantage; ecological feedback or effects on other agents may accumulate beyond the host window; or the previous population difference may be specific to its conditions. These are questions for follow-up, not conclusions established by this run.

The initial study's sampling was also specific. Its first eight eligible distinct recipients per population were chosen, so the median encounter occurred at model time **42.2**, shortly after the warm-up and partial shock. Only **one** occurred after the environment's first programmed reversal at time 126. In that initial sample, 204 encounters were in zone 3 and 63 in zone 6. The confirmation added post-reversal encounters, but neither study represents every possible environment or part of the graph equally.

## Verification and persistence

Both study plans and source hashes were saved before their respective 60-seed outcome runs; separate pilot seeds had already been inspected. These were locally fixed studies, not independently witnessed public preregistrations. The uncertainty intervals are approximate and cluster by population rather than treating the eight encounters in each population as independent.

The observation hook was tested against the uninstrumented reactor, and the manual event scheduler reproduced the original events and state when no payload intervention was made. A known-fragment positive-control fixture changed a host's resource focus. Both ordinary and corrected first-contact checkpoints were saved to SQLite and resumed in a fresh process with identical event and state histories. **Thirty-two tests passed**, including a check that a silent, unchanged insertion is still tracked as a contact.

All **1,440 initial branches and 1,389 confirmation branches** were regenerated. An independent outcome checker recomputed recipient nutrient, actions, survival, death cause and first action from their replayed event ledgers, and checked the common fork, gate, assignment, insertion and environmental-signal records. In the confirmation it also checked the first-contact tracking at all 463 encounters. This is independent checking of recorded outcomes using a replay of the same simulator, not an independent implementation of the entire ecology. Selected complete replayed ledgers and all per-encounter results are included in the evidence package, together with usable pre-insertion SQLite checkpoints.

The prototype's persistence in this test is local SQLite. No hosted Supabase project was used or changed. The virtual nutrient environment was seeded and generated for this experiment; this is not a test of an external Outside stream or evidence of a physical-world viral effect.

The next discriminating study should follow **how** the confirmed immediate response propagates: track the inserted fragment and its execution through subsequent host instructions, separate cases with and without intervening overwrites using an appropriately designed intervention, and test whether the response affects other hosts or population recovery at longer horizons. Any future integration with Amelia remains a separate, governed-copy question.
