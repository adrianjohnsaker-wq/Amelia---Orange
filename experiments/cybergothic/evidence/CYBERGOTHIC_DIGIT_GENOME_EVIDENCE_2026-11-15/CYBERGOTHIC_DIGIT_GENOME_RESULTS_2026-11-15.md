# Self-parsing genomes in the cybergothic ecology

**15 November 2026 · Separate research prototype**

## Result

The prototype now interprets genes and non-coding buffers from the digits themselves. Per-digit ancestry arrays have been removed from living agents, corpses, infection packets, histories and the Cthell archive. Agent identity and lineage remain in the event ledger so that a host can be followed, but neither marks a gene or controls its execution. This is a new, separately versioned checkpoint format; the previous prototype and Amelia Orange were not modified.

With the parser active from the first action, buffers appeared and were used without experimental insertion of introns. In 30 fresh ecologies, one population had an intron in its randomly generated founders; by the end, all 30 had living carriers, and all 30 had executed intron no-ops. Twenty-nine of the 30 exhibited a newly recognized intron span immediately after a point mutation. Across the self-parsing branches, there were 6,729 intron no-op actions.

These are observations of the designed grammar operating in an evolving ecology. They do not yet show that natural selection favored the buffers, that introns improved population survival, or that the grammar itself evolved. The meaning of a newly recognized span is explained below.

## What changed in the genome

| Digit sequence | Interpreter behavior |
| --- | --- |
| `80 <zone> <body> 09` | A gene. Its body executes when the host is in the header's zone; otherwise the body consumes neutral actions. |
| `60 <body> 09` | An intron. Each digit, including the boundary digits, consumes a neutral action. |
| Other digits | Ordinary code under the existing Pandemonium interpreter. |

The first following `09` closes a region. Start codons within a region are read as body digits rather than nested starts. An unclosed start is ordinary code. The regulatory digits of a gene are neutral actions as well. A neutral action advances the pointer one digit and suppresses that digit's matrix opcode and digit-specific focus change. It does **not** suspend the rest of the ecology: the host still pays ordinary metabolism, can forage neutrally at its current focus, and remains exposed to movement, mutation, infection and other processes.

This makes non-coding material an active part of the host's temporal economy: it changes how its instruction pointer passes through the genome while the surrounding ecology continues. Mutation, infection, time-splicing and necrotic recycling may create, transmit, rearrange, break or erase these boundaries. The two start codons, stop codon and parsing rules were supplied by the experiment; they were not discovered by evolution.

## From-birth ecology: structures arise without planted introns

Thirty populations, each with 36 random founders, ran for 180 model-time units with the grammar active from the first scheduled action. No experimental introns, promoters, shock, or emergency host spawns were introduced. Each population was compared with three matched interpreter controls from the same founder state. The existing resource field and costed archive reactor remained enabled.

| Observation in the self-parsing populations | Result |
| --- | ---: |
| A founder carried an intron at birth | 1/30 populations |
| A newly recognized intron span followed a point mutation | 29/30 populations |
| At least one intron no-op was executed | 30/30 populations |
| A living host carried an intron at the horizon | 30/30 populations |
| Intron no-op actions, summed across the 30 runs | 6,729 |

Among the 29 populations with no intron in any founder, 28 had a newly recognized span after a point mutation; all 29 executed intron no-ops and had living carriers at the horizon. The archives and corpse stores start empty in these runs. Carriers and execution can still arise through multiple interacting processes, including copying and horizontal transfer; the counts do not assign an exclusive cause to every carrier.

A concrete trace in the matched transition study shows a start and stop becoming a functional intron. In seed `39042`, at model time `33.107280521`, shrapnel changed agent 51's genome from `16080368877999` to `16080968877999`. The single altered digit completed the stop codon: the parser then recognized `60 8 09` as an intron. The original mutation event and its genome before and after are preserved in the evidence package.

In general, the mutation count records **newly recognized spans**, not necessarily wholly new sequences: changing one digit can also expose or close existing codons, or change which region the parser recognizes. Similarly, appearance of an intron sequence after a transfer can be inheritance or rearrangement; it is not proof of an independent invention or an exact pedigree.

## Do the buffers improve the ecology?

The main matched transition study used 60 fresh populations. Each was warmed for 30 model-time units with ordinary literal execution, received the same partial shock, and was forked into four branches for another 120 units: full self-parsing, intron digits active as ordinary instructions, genes always open, and literal execution. Each branch started with the same complete state and random-generator state, and external signal sequences were checked for equality. The genome cap was applied after the fork. These results compare populations, not the previously reported individual-host survival assay.

The two planned primary outcomes compare **self-parsing minus intron-active**, preserving gene regulation in both branches:

| Outcome | Self-parsing mean | Intron-active mean | Paired difference (97.5% interval) |
| --- | ---: | ---: | ---: |
| Population agent-time | 3,540.82 | 3,443.60 | +97.21 (−206.98 to +408.78) |
| Total field nutrient uptake | 88.90 | 88.65 | +0.25 (−1.35 to +1.85) |

The intervals include both beneficial and harmful effects. They do not establish an advantage, or equivalence, for evolved intron buffering at this sample size. The 97.5% intervals account for the two planned primary comparisons; they are seed-paired bootstrap intervals. Agent-time is the area under the living-population curve, reconstructed from the event ledger.

An exploratory comparison in this first study suggested higher agent-time for the whole self-parsing grammar versus literal execution. A subsequent, separately planned confirmation on 60 fresh populations estimated **+204.29 agent-time** (95% paired interval **−66.74 to +478.61**). It did not clearly distinguish the two conditions. That comparison concerns the complete grammar, including promoters and regulatory no-ops; it does not isolate introns.

The from-birth cohort also produced an exploratory self-parser minus intron-active difference of **−290.72 agent-time** (95% paired interval **−1,288.44 to +733.93**). It was a different developmental design with 30 populations and was not a test with sufficient precision to establish equivalence or a harm.

None of the from-birth populations was empty at the horizon, but the self-parsing runs used a mean of 1.13 archive reconstitutions and received a mean of 141.0 units of external nutrient renewal. Persistence is real within that open resource ecology; it should not be described as closed-energy self-sustainability or attributed solely to introns.

## Continuity and verification

The new interpreter retains the developed prototype's 29-gate graph, asynchronous schedules, Pandemonium matrix, viral infection, time-splicing, Cthell archive and resource ecology. The literal mode reproduced three earlier-engine reference trajectories after projecting away the old observational ancestry fields. This is a check on those fixtures, not proof of equivalence under every configuration.

All **600 branches** from the three fresh studies were regenerated with matching saved branch records. An additional, separately coded parser and ledger audit checked **40 branches**, including the behavior of recorded no-op decisions and reconstruction of population agent-time. Thirteen unit tests passed, including point-mutation and infection formation of an intron, corpse/archive reconstitution, time-splicing, fission, vector delivery and checkpoint validation.

An isolated SQLite checkpoint stores the digit-only world, parser mode, full event ledger and random-generator state. A fresh-process resume of the included example matched the continuous run's final state and event hashes. The package includes the checkpoint, code, locally fixed protocols, summaries, selected full event ledgers, audits and replay tools. The plans were fixed locally before their corresponding fresh seeds; they were not independently witnessed public preregistrations.

This work remains separate from Amelia Orange, her Governor, gates, memory and live Supabase state.
