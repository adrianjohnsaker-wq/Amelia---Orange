# Conditional viral promoters: functioning gate, lower uptake in the first test

**15 November 2026 · separate cybergothic research prototype · 60 fresh populations, 240 matched encounters**

The zone promoter worked as an execution rule: tagged viral payloads were expressed in their header-matched zone and skipped outside it. In this implementation, however, the promoter **reduced recipient nutrient uptake** compared with allowing the same experienced payload to execute in every zone. This is an informative result about one proposed way to make the ecology context-sensitive; it does not show that conditional promoters generally lack value.

The result does not establish that the earlier 12-unit uncertainty was caused by environmental drift, pointer starvation or the cost of echoing. Those explanations remain testable. Nor does deterministic replay prove that every possible hidden-state fault has been eliminated.

## Mechanism and controls

The promoter cassette consists of a **header digit followed by four executable digits**. The header initially records the recipient's zone, and the interpreter reads its current value before permitting labelled payload instructions to execute. A mutation of the header can therefore change the permitted zone. If a labelled cassette loses its header or is split, its tagged payload is held inactive until a complete cassette is present. Ordinary unlabelled digits remain available for execution, including digits with values identical to the viral payload. The interpreter scans past blocked positions within one action without an extra time charge; a host with no executable position pays basal metabolism and waits for its next scheduled action.

All five branches use the same header, initial packet transfer and costed echo schedule. From the recipient's fourth action, a five-digit cassette is reinserted every third recipient action when the host can pay **0.05 virtual energy** and has space. The copied header is the original encounter zone. Subsequent ecology and realized echo counts can diverge.

| Branch | Where the payload is allowed | Payload |
| --- | --- | --- |
| Open | Any zone | Experienced |
| Zone | Header zone only | Experienced |
| Rotated | `(header + 1) mod 10` | Experienced |
| Zone/shuffled | Header zone only | Digit-preserving shuffle |
| Syzygy | Header zone or its nine-sum twin | Experienced |

The recipient's actual encounter zone supplies the initial header. That zone is not known to be the context in which the donor's fragment was productive. This choice makes the rule concrete and testable, but it is a substantive limitation when interpreting the result.

The genome contains the header digit, but the implementation also uses the existing per-digit ancestry slots as **operational cassette labels**. Those non-digit labels identify promoter boundaries, propagate through simulated inheritance, and enforce fail-closure on fragments. The result is therefore not yet a self-parsing, digits-only promoter grammar. The original donor ancestry is retained in the encounter record.

## What happened to recipients

The primary endpoint was total nutrient harvested by the original recipient over 24 model-time units; no further uptake is credited after death. The same 240 encounters supplied each branch, with 120 before and 120 after the generated environment's reversal. Each seed contributed equally. Intervals are **98.33% seed-clustered bootstrap intervals**, adjusted for the three planned comparisons.

| Branch | Mean 24-unit uptake | Original hosts alive at 24 | Mean payload actions per recipient | Mean echo energy cost |
| --- | ---: | ---: | ---: | ---: |
| Open | 0.6656 | 168/240 | 9.78 | 0.218 |
| Zone | 0.5836 | 158/240 | 2.15 | 0.207 |
| Rotated | 0.5885 | 168/240 | 0.46 | 0.216 |
| Zone/shuffled | 0.5816 | 160/240 | 2.03 | 0.212 |
| Syzygy | 0.6021 | 177/240 | 3.73 | 0.214 |

| Planned paired contrast | Uptake difference | 98.33% interval |
| --- | ---: | ---: |
| Zone minus open | **−0.0820** | **−0.1603 to −0.0070** |
| Zone minus rotated | −0.0049 | −0.0908 to +0.0701 |
| Zone minus zone/shuffled | +0.0020 | −0.0470 to +0.0527 |

The first interval supports lower uptake under this exact-zone rule than under the open rule in this modeled ecology. The other two comparisons do not clearly separate; their intervals do not establish equivalence. Survival was secondary: for zone minus open, the unadjusted 95% interval was **−10.0 to +1.67 percentage points**.

The broader syzygy promoter permitted more payload execution than exact-zone gating and had a higher mean uptake, but its comparison with exact-zone gating was exploratory: **syzygy minus zone +0.0185** units, unadjusted 95% interval **−0.0205 to +0.0565**. No advantage is established. In 27/240 encounters the experienced and shuffled payload strings were identical; these were retained in the planned analysis.

## Was the promoter actually used?

At 24 units the original recipients executed **517** labelled payload actions under exact-zone gating, compared with **2,348** in the open condition. The interpreter recorded **958 recipient actions** in the zone condition in which one or more out-of-zone payload positions were skipped. Such skipping is part of the intervention: it can redirect the instruction pointer and alter later interactions, so the uptake difference is a total effect of this implemented rule, not a clean estimate of a single downstream cause.

Across all 240 zone-promoter branches over the full 36-unit observation, including other agents that acquired tagged material, the recorded choices contained **731 permitted payload executions**, **5,937 blocked out-of-zone payload positions** and **1,205 skipped fragmented positions**. A blocked-position count is not a count of hosts or independent encounters: one scan can encounter several positions. The recorded decisions contained **zero violations of the programmed zone rule**. A separate event-ledger audit checked actual execution against the genome and header in selected branches.

The strong reduction in execution shows that the gate is consequential. It also means that withholding code, changing which ordinary instructions execute, and changes to the surrounding population all remain possible contributors to the outcome. This study does not determine which of them accounts for the lower uptake.

## What this suggests for the next design

The gate binds code to its initial recipient zone, but the donor's experience may have been gathered in another context. A more discriminating continuation would record **where and under which resource conditions** each candidate fragment was productive, then compare a promoter selected from that prior evidence with an equally funded open gate, a random or misdirected gate, and shuffled code. Decisions would use only information available before the host acts. That would test whether a *learned* context assignment can improve on this simple encounter-zone assignment; the present experiment did not test that mechanism.

The previously observed replay and chrono-recall recoveries restored stored past model states during forward simulation. They are an interesting route for another engineered recovery study, but they do not establish literal access to future data or physical retrocausation.

## Provenance, replay and persistence

The source hashes and three primary contrasts were fixed locally before the 35001–35060 outcome seeds. One fixture and two development-pilot seeds were inspected earlier; the intermediate pilot source was not separately frozen. This was not an independently witnessed public preregistration. The 240 fresh encounters came from 60 simulated populations; the model-generated signals and external nutrient renewal are part of the experiment.

**Twenty-six tests passed**, covering gate activation, mutated headers, fragmented cassettes, quiescent metabolism, the inherited encounter sampler, persistence and a separate-process promoter checkpoint restart. All **1,200 outcome branches** were regenerated and matched their stored records. An additional checker independently recomputed host outcomes and inspected raw execution events for **60 branches** from three seeds, checking **323 payload executions** and **1,473 blocked positions**. These are checks of the same underlying simulator, not an independent implementation.

The promoter-specific SQLite checkpoint stores the event chain, ecological state, promoter mode, cassette-label registry, echo schedule and trace. A paused active branch resumed in a new Python process with the same final event and state hashes; deliberate checkpoint alteration was detected. An example is included. No Amelia Orange state, Governor, gate, database, Supabase project or scheduled experiment was changed.
