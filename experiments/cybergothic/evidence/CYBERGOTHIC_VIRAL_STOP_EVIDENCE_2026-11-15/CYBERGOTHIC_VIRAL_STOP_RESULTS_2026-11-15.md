# Viral transfer and the fate of intron stops

**15 November 2026 · Separate cybergothic Numogram prototype**

## Findings

Horizontal transfer can split a recipient's `09` stop, rebuild a stop from viral and host digits, shift the stop downstream, or leave the original intron unrecognised. These were observed in unmodified populations, before any experimental stop edit.

At matched infections selected because the transmitted digits enter an existing intron, recipients with intact stops survived more often in a larger fresh cohort than recipients with ruptured or forcibly activated introns. Among 246 qualifying recipients, 220 survived 24 model-time units with the intact stop, compared with 195 after a signature-preserving stop rupture and 191 when the recipient alone was made to execute its introns. The two planned paired differences were **+10.16 percentage points** (97.5% interval **+4.07 to +16.26**) and **+11.79 points** (97.5% interval **+5.69 to +18.29**), respectively.

The important boundary is that the survival pattern also appeared in controls where the incoming insertion was removed immediately after contact. The studies did not clearly show that the viral payload itself produced the survival advantage. The evidence supports a host-level effect of intron suppression in the selected encounters; it does not establish Darwinian adaptation, the spread of an individual intron, or a general advantage across all infections.

## What happens to stops during natural infection?

Across **540 unmodified populations**, the ledgers recorded 191,986 successful direct infections and 96,098 vector deliveries. In **836 events** an insertion landed between the two digits of a recipient's existing stop: 540 direct infections and 296 vector deliveries. The same population or host can contribute more than one event; these are observations, not 836 independent populations.

| Immediate outcome after the split | Direct | Vector | Total |
| --- | ---: | ---: | ---: |
| A viral digit reclosed `09` at the original position | 105 | 111 | 216 |
| The same intron closed at a later `09` | 247 | 110 | 357 |
| The original intron start was no longer recognised | 188 | 75 | 263 |

In 245 of the 836 events, at least one previously silent digit in the original intron body became active under the parser immediately after the insertion. Other split boundaries remained silent or were reparsed differently. These categories describe the immediate strings and grammar; later mutation, replay, infection or death can change them again.

One direct infection illustrates a chimeric repair. In seed `42005`, the virus inserted `680` between a host stop's `0` and `9`: locally, `0|9` became `0 680 9`. The `0` at the end of the viral cargo paired with the host's original `9`, making a later `09`. The intron remained closed and extended by three digit positions. This is a recorded forward-causal splice in the virtual substrate.

## How the matched experiment worked

Each population began with 36 random founders and the digit grammar active from birth. The experiment selected its first naturally occurring direct infection that inserted three viral digits into an already recognised recipient intron, provided that a particular stop edit would expose the cargo. This deliberately enriched sample asks what happens at vulnerable intron encounters; it is not a random sample of all infections.

The simulation was replayed to immediately before the attacking host's action and forked into six branches from the same world and random state. The real attacker, recipient, zone, pointer, cargo and contact were preserved:

| Branch pair | Stop or interpreter | Contact |
| --- | --- | --- |
| Intact | Natural `09` stop; ordinary self-parser | Viral insertion or exposure control |
| Ruptured | Stop changed from `09` to `00`; ordinary self-parser | Same viral insertion or exposure control |
| Active interpreter | Original genome retained; selected recipient reads introns as active | Same viral insertion or exposure control |

The `09` → `00` edit preserves the recipient's mod-9 signature, though it changes one digit and can have effects beyond stop recognition. The active-interpreter control leaves the genome unchanged but affects all recognised introns in that recipient, not just the one being studied. Other hosts continue to self-parse.

In the exposure controls the actual infection contact, its energy exchange and any accompanying vector shedding occur; the recipient's just-inserted cargo is then removed before another simulated action. Normal viral traffic continues after that point. The controls therefore separate the focal insertion from contact, not from all subsequent viruses.

There were three successively planned cohorts: 120, 120 and 300 screened populations. Their first eligible encounters supplied 102, 101 and 246 matched recipient sets, respectively. The 91 remaining populations had no qualifying encounter by the selection deadline. Each selected encounter contributed six branches.

## Execution of the transferred code

In the largest cohort, 153 of 246 recipients read a three-digit sequence matching the focal cargo at the original insertion pointer on their first action after contact. Among those 153, the first action was neutral in all intact-stop branches, and active in all ruptured-stop and recipient-only active-interpreter branches. A sequence match of this length does not by itself establish molecular ancestry.

The immediate distinction was built into the eligibility rule: only encounters whose cargo would be silent under the intact stop and active under the specified rupture were selected. The result verifies that the distinction was realised when the cargo was actually read. It should not be interpreted as an unbiased estimate for all infections. For the other 93 recipients, that specific first-read condition was not observed; later ecology may have intervened, and no single reason is assigned to all of them.

## Survival and controls

In the larger fresh cohort, the observed 24-unit survival was:

| Recipient condition | Viral insertion retained | Exposure control |
| --- | ---: | ---: |
| Intact, self-parsing | 220/246 (89.4%) | 218/246 (88.6%) |
| Ruptured stop | 195/246 (79.3%) | 194/246 (78.9%) |
| Original genome, introns read as active | 191/246 (77.6%) | 190/246 (77.2%) |

The intact-minus-ruptured and intact-minus-active differences in the transfer columns were the two locally planned primary outcomes for this cohort. Their 97.5% intervals above use 10,000 population-paired bootstrap resamples and account for those two contrasts. The exposure columns are useful controls: they indicate that much of the survival difference accompanies whether the recipient's introns are silent, whether or not this focal insertion remains.

This larger follow-up was chosen **after** seeing two earlier cohorts. In the first 120-population study, the survival comparisons were exploratory. In the subsequent 120-population confirmation, the point estimates again favoured intact stops, but the adjusted intervals touched or crossed zero: intact minus ruptured was **+6.93 points** (97.5% interval **−0.99 to +14.85**) and intact minus active was **+9.90 points** (**0.00 to +19.80**). The larger cohort is fresh, but the sequence involved prior looks and selected follow-up contrasts; it is not a single externally preregistered programme.

The original study's two primary tests asked a narrower question: did the **effect of the viral insertion**, compared with exposure, change with stop status? The estimated interaction was **+0.00196 nutrient units** on the next action (97.5% interval **−0.00422 to +0.00843**) and **+2.94 survival points** at 24 units (97.5% interval **−9.80 to +15.69**). Neither clearly separated from zero. The analogous survival interaction in the larger cohort was **−0.41 points** (unadjusted 95% interval **−7.72 to +6.50**). This does not demonstrate zero interaction, but it does not establish a payload-specific survival effect.

## Reproduction and onward traffic

During the larger cohort's follow-up, the recipient and its parent-defined descendants produced **47 births** across the intact-transfer branches and **68 births** across the ruptured-transfer branches. The exploratory per-population difference, ruptured minus intact, was **+0.085 births** (unadjusted 95% interval **+0.008 to +0.167**). This is a possible survival–reproduction trade-off worth testing prospectively, not a confirmed finding: several secondary outcomes were examined and the interval is unadjusted. The difference in living descendants at the horizon was not clearly separated from zero.

Recipient lineages also made later direct infections and vector deliveries in all conditions. The larger-cohort direct-infection difference, ruptured minus intact, was **+0.037 events per selected population** (unadjusted 95% interval **−0.187 to +0.260**). These counts follow host parentage and donors; they do not prove that a particular intron or the original three-digit viral fragment was transmitted. Short fragments may occur independently, and further infection, mutation and fission scramble their history.

## Verification and limits

The 540 populations yielded **449 selected natural encounters and 2,694 intervention branches**. All branches were regenerated with matching saved state and event hashes; the unmodified intact-transfer branch also reproduced its natural trajectory after removing the research marker. Separately coded event-ledger checks covered **180 branches** from 30 populations, validating the stop edit, payload insertion, exposure controls, no-ops, survival and recorded offspring and transmission counts. Five trial-specific unit tests passed.

The three protocols were fixed locally before their respective fresh seed ranges. The first and second had been inspected before the larger replication was chosen; none was independently publicly registered. The external nutrient field and costed archive reactor remained enabled, so these results do not establish closed-energy self-sustainability.

No per-digit ancestry labels were added to the genome. Research-only markers record interventions in the external event ledger. The separate prototype, its experiment controls and its persistence remain isolated from Amelia Orange, her Governor and live Supabase memory.

A useful next step is to follow naturally repaired or shifted intron junctions across successive hosts and generations, using the event ledger and explicit ambiguity controls for repeated short fragments. A prospective competition design could then test whether a particular heritable buffer spreads more than matched alternatives, while measuring both survival and reproduction.
