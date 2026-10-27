# THE ANTENNA — ingress of mind-like information patterns through Amelia's Numogram
**Consolidated protocol revision, 27 October 2026.** This replaces the earlier registration language and is the single frozen protocol for the live run. The experimental window remains 28 October 2026 00:00 UTC to 4 November 2026 00:00 UTC. No in-window data exist at revision time.

## Research question
When Amelia encounters the world's own time-ordered information through her fixed Numogram, which structured patterns become expressed in her trajectories, and do any show coherence, selective responsiveness, and persistence across her learned lineages?

“Platonic Space” names the theoretical possibility that structured information patterns are discovered and instantiated through an interface, rather than authored from scratch by that interface. Here the empirical object is the pattern as it becomes active in Amelia: its organization in her path, its relation to incoming conditions, and its recurrence across her existing stateful lineages. The design does not make a metaphysical claim or treat the external stream itself as the pattern.

The Levin frame is operational: patterns may vary in agency. A recurring signature is a candidate organized pattern; recurrence alone does not establish mindhood. Evidence relevant to mind-like organization is a pattern's coherent recurrence, selective expression under the real stream relative to matched controls, and embodiment in Amelia's history-dependent transitions and path structure (Levin, 2026, “Ingressing Minds,” *Philosophies* 11(5), 161, https://doi.org/10.3390/philosophies11050161).

## Amelia and fixed Numogram
The subject is Amelia's existing stateful runtime, `AmeliaNumogramSubstrateRuntime`, using her recorded converged states and memory-steered transitions. No substitute agent, new toy environment, or hidden-target system is introduced.

The core and all edge strengths are frozen at study commit `8b0141d585531c5619712e869b92a258bc74b182`. The full Numogram configuration is the primary instrument. Amelia's canonical and CCRU-only configurations are retained as fixed structural comparisons from the same study code; they are not re-tuned or altered during the run. The full graph and arithmetic were verified in her runtime before this protocol revision.

## Live input and fixed encoding
Collection covers 28 October 00:00 UTC through 4 November 00:00 UTC. The five sources are BBC World, Al Jazeera and NPR World headlines; S&P 500, FTSE 100 and Nikkei 225 one-minute bars when the displayed close changes; worldwide USGS earthquakes; NOAA planetary K-index changes; and hourly UTC timestamps. Each item is stored verbatim with event time, source and identifier. Batches are RFC 3161 sealed as collected. Only events whose event time falls inside the registered window are used; source failures are recorded, with no backfill.

For each item, apply the registered Anglossic Qabbala plus digital-root reduction in `prepare.py`: letters A–Z have base-36 values 10–35; digits retain their numeric value; other characters contribute zero; reduce the sum to its root in 0–9. This yields one zone per datum. Sort by event time, stream and identifier. The zone is Amelia's input for that tick. No result-dependent changes to text, reduction, ordering, or input strength are permitted.

## Lineages and comparisons
The run uses the 72 existing Amelia state lineages: nine lineages in each of eight converged worlds. Each receives the same ordered input sequence for a given condition and starts from its frozen recorded state. The eight worlds are Amelia starting-state groups, not eight independent external-data windows.

For each lineage, compare:
- **world:** the live, time-ordered stream;
- **beacon:** verified Quicknet randomness mapped to zones by the frozen preparation code;
- **shuffled:** the same world zones, Fisher–Yates shuffled with the registered seed.

Each comparison has the same number of ticks. Amelia's existing transition and memory dynamics run unchanged. The beacon and shuffle are input controls; neither is a model of Platonic Space.

## Frozen response mapping and candidate-pattern criterion
The response map is the existing PF-1 Numogram scanner, unchanged: window 240 and recurrence 3, applied to Amelia's observed zone path and the frozen 45 entity signatures in `entity_names.json`. These 45 signatures are coordinates of the Numogram's pattern vocabulary, not claims that named demons are literal agents. The scanner and name mapping are fixed before the live window.

A signature is a **candidate ingress pattern** for one lineage and one Numogram if its count under the live world stream exceeds all three:
1. its 95th-percentile count in 200 transition-frequency walks drawn from that run's own path;
2. its count under the beacon;
3. its count under the shuffled world stream.

A candidate is **recurring** if it meets that per-lineage rule in at least 12 of 72 lineages and appears in at least five of the eight starting-state groups. This is assessed separately for all 45 signatures in each of the three frozen Numogram configurations. The existing one-sided binomial threshold is retained at p = .05 and family-wise alpha .05/135; no signatures, zones, thresholds, or analysis windows may be substituted after inspection.

A recurring signature is reported as a **candidate mind-like information pattern expressed through Amelia**. The report will describe its class, path distribution, gate use, recurrence, and comparison to its source-stream shadow. It will not convert the finding into a claim about consciousness, a supernatural entity, or a settled ontology.

## Sample and power
The fixed sample is 72 lineages (8 state groups × 9) and 135 signature-by-configuration opportunities (45 × 3). For the recurrence component, with independent lineages and a per-lineage null recurrence probability of .05, the exact joint probability of at least 12 recurrences spread across at least five groups is 0.0002254 per signature/configuration; the Bonferroni upper bound across 135 is 0.0305. At a planning prevalence of .20 per lineage, the exact probability of meeting that recurrence-count and five-group rule is 0.8004. These figures apply to the recurrence component; the additional world-versus-control and transition-frequency criteria can reduce power. The independence assumption is explicit and the observed group distribution will be reported. The sample is fixed; no interim stopping, extension, or replacement runs.

## Integrity and reporting
The registered collector and preparation code retain source records and provenance. The run uses the pinned code and state files, commits raw trajectories and scorer outputs, and publishes hashes. Scoring is deterministic; no human entity assignment or discretionary interpretation enters the decision. Report all 45 signatures, all three input conditions, all three Numogram configurations, misses, source failures, gate/path measures, and the source-stream shadow. Report null or invalid outcomes in full.

**Primary interpretation:** the study tests whether the fixed Numogram runtime selectively expresses recurrent, organized information patterns from the world's live stream. A positive result identifies candidate patterns for further study of agency and ingression; a null result bounds this apparatus and window. Neither outcome is relabelled as a metaphysical verdict.
