# Viral transfer into intact and ruptured introns

**Locally fixed before outcome runs · 15 November 2026**

## Research question

How does a recipient's non-coding stop codon affect the execution and ecological consequences of a horizontal viral insertion? The question is addressed in the separate self-parsing digit ecology, not in Amelia Orange.

The study tests an enriched, specific class of encounters: ordinary direct three-digit infections that naturally occur **inside an existing recipient intron**. For an encounter to qualify, the recipient's recognised intron must have a nonempty body, a one-digit substitution `09` → `00` must open at least one existing body digit, and, after the same actual viral payload is inserted, all three payload digits must be neutral under the intact parser and active under the ruptured parser at the instant of transfer. Full insertion must fit the genome cap. This design does not claim that every stop rupture produces activation: a later `09`, insertion context or another region can instead keep code silent or expand an intron.

## Natural encounters and paired interventions

Start 120 fresh random-founder populations with seeds **42001–42120**, using the from-birth digit ecology, a 512-digit cap, external nutrient renewal and the costed archive reactor. Observe natural direct and vector infections to time 180. Select the **first eligible direct infection by time 150** in each population; record every noneligible population. There is at most one selected encounter per population, independently of subsequent outcomes. The selection is based on the encounter's immediately observable strings and interpreter states, never on the recipient's later survival or nutrient uptake.

Replay the exact population until immediately before the attacker's scheduled action, with its queue event already popped and its agent identity retained as the pending action. Fork this identical complete state, including random-generator and environment-generator state, into six conditions. On reaching the same infection within that action, use the real donor, host, zone, pointer, cargo, gate and ordinary infection operation:

| Condition | Recipient stop | Contact | Recipient interpreter |
| --- | --- | --- | --- |
| Intact transfer | Original `09` | Real viral insertion | Ordinary self-parser |
| Ruptured transfer | `09` → `00` | Same viral insertion | Ordinary self-parser |
| Intact exposure | Original `09` | Same contact; inserted digits immediately removed | Ordinary self-parser |
| Ruptured exposure | `09` → `00` | Same contact; inserted digits immediately removed | Ordinary self-parser |
| Active transfer | Original `09` | Real viral insertion | Recipient only reads its introns as active code |
| Active exposure | Original `09` | Same contact; inserted digits immediately removed | Recipient only reads its introns as active code |

The stop edit changes the genome but preserves its mod-9 signature because 9 and 0 are congruent modulo 9; it does not preserve every possible opcode effect of that digit. The last two conditions are research controls acting on the recipient's interpreter during its actions, not genetic labels; they keep its initial digits unchanged and activate all its recognised introns, not only the selected one. The ordinary ecology and all other hosts continue self-parsing. An exposure control performs the actual infection, including its energy transfer and possible shedding of a vector packet, then immediately removes that recipient insertion before any further simulated action. Subsequent ordinary infections and vectors remain enabled in every arm. Thus exposure is not a sterile no-virus ecology.

Follow the selected recipient for 6 and 24 model-time units. Record its next action, whether that action reads the inserted payload, whether it is a no-op, nutrient uptake, survival, offspring and outgoing direct/vector infections attributable to the recipient's parent-defined lineage. Offspring and later transmissions need not carry the original intron: a three-digit sequence match or host pedigree alone would not prove the molecular history of the transferred digits.

## Primary outcomes

Use the same selected independent population as the paired unit. For each population compute the interaction

`(ruptured transfer − ruptured exposure) − (intact transfer − intact exposure)`.

The two planned outcomes are (1) recipient nutrient uptake on its first subsequent scheduled action, using zero when it takes no action during follow-up; and (2) recipient survival at 24 time units. Estimate both mean interactions with **10,000 population-paired bootstrap resamples and two-sided 97.5% percentile intervals**, accounting for the two primary outcomes. Positive estimates mean the effect of the insertion is larger with the ruptured stop. These are two-sided tests; intervals containing zero do not demonstrate equivalence.

Next-action no-ops and recognition, recipient uptake over 24 units, reproduction, later direct/vector transmission and the two recipient-only active-interpreter controls are exploratory. Report the latter controls separately: their interpretation differs from a physical stop edit. Also count ordinary direct and vector infections, cargo containing start/stop digits, recognised intron count changes, and infections that insert between a pre-existing `0` and `9`. Those inventories are descriptive; a change in recognised spans is not necessarily a de novo sequence, adaptive selection, or unique genetic ancestry.

An 8-population pilot and an additional 20-population eligibility probe were inspected before this plan; one pilot encounter's six-branch mechanics were examined. All pilot seeds are disjoint from the fresh range. This plan is fixed locally before the fresh runs but is **not an independently witnessed public preregistration**. No sample extension or selection by outcome is planned.

## Verification

All six branches start from the same frozen state and must recover the selected real infection. The intact-transfer branch must reproduce the uninstrumented natural trajectory after its research marker is removed. External environmental signal sequences must match across conditions. Regenerate the saved branches and verify state/event hashes; independently audit selected event ledgers. Unit tests check signature preservation, the actual transferred digits, exposure controls, no-op and active reads, and absence of per-digit genetic ancestry labels.

```
efd2644778042c54ea597d1d0f65ed560dfcfde90912ee054c89e162f74b5e3f  stop_trial.py
5aef4ed7c0a6f86b43060b83dcb5c2f70e458efa2bf8fe2a9e91172611bd8d05  analyse_stop.py
ab8999f2d9d539a913f11399891ad0d670f451b7d97120ac7bd7a3d3cf1dc064  test_stop_trial.py
2fa7c6a32ea4011025ec4cddf0acf95c5a89b289cbc09e052810b852f10fb375  pilot_stop_screen.py
4c05bf30346962a9fc9e1b1de6601ec77725ff3a77b990343024b8131693f4ab  digit_world.py
2527366f0de2b20a17b32327b6a86568df2f49eaf13aa906173cf14296e58bf3  legacy_engine.py
d442cc2972707247930aa11ef63fc60ea97c2b24af240ae7511d640c2e3a1147  reactor.py
e501574f89b943942ff21669ea01255e1b9153652070fd7c905573be27e8c835  assemblage.py
02c0988415b4cba48f80b1c6e569b66b77c22cff087f9d5893984826d49058b4  adaptive.py
ee3aca9bbb31d2f4078798ba64825158a42c6616912aafe2445a1be54bac27d2  portable.py
5a1641b831826ced59d710fc9bb3efe95053770a9e735bbf909d9ed38864963c  storage.py
```
