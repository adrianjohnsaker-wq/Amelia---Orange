# Self-parsing digit genomes: locally fixed ecological test

**15 November 2026 · separate cybergothic Numogram prototype**

This experiment replaces the previous operational ancestry-label promoter with a parser whose decisions depend on digit strings and the current zone. The new engine removes per-digit ancestry arrays from agents, corpses, packets, histories and archives. Agent-level identity and lineage remain for following hosts and recording events; they do not mark gene boundaries. The 29-gate graph, asynchronous schedules, Pandemonium matrix, infection, splicing, Cthell archive and virtual resource ecology are retained.

## Digit grammar

Parse each genome from left to right using these two-digit codons:

* `80 <zone digit> <body> 09` is a gene. Its body executes only in the current header zone in the self-parsing condition.
* `60 <body> 09` is an intron. Every digit of the recognized intron, including its boundary codons, is a neutral no-op under the self-parsing condition.
* The first following `09` closes a region. Starts inside a region are treated as body digits rather than nested regions. An unclosed start is ordinary code. The regulatory start, header and stop digits of a gene also use neutral actions.

A neutral digit consumes one normally scheduled action and normally advances the pointer one position. The host retains neutral foraging at its current focus, ordinary metabolism, external temporal intent, background infection, mutation, movement and other ecological dynamics. The digit's matrix opcode and digit-specific forage control are suppressed, and it is not credited as productive code. The inherited `execute` event records the decoded opcode; a following `digit_nop` event records its suppression. No experimental introns or genes are inserted into genomes.

## Matched controls and sampling

Use **60 fresh seeds 39001–39060**. Each population starts with 36 founders; it is warmed for 30 model-time units under the literal interpreter, receives an alternating-ID partial shock, then the 512-digit cap is applied and four full-state branches are simulated for a further **120** units:

1. **Self-parsing:** zone-controlled gene bodies and no-op introns.
2. **Intron-active:** identical grammar and gene regulation, but intron digits execute as ordinary instructions, one position per action.
3. **Promoter-open:** introns are no-ops but gene bodies execute in any zone.
4. **Literal:** all digits execute as ordinary instructions, with no codon control.

All branches begin with the exact same genomes, ecology, archive and RNG state; exogenous generated environmental signals are checked equal. Subsequent events can diverge. The existing costed archive reactor and external nutrient renewal remain active; this is not a closed-energy perpetual-life test. Parser activity begins after literal warm-up, so the experiment measures a transition in interpretation rather than evolutionary upbringing under the grammar from birth.

## Primary outcomes and naturally emerging structures

The two planned primary outcomes compare **self-parsing minus intron-active** for total population **agent-time** and total field nutrient uptake over the 120-unit window. Agent-time is the area under the live population curve reconstructed from births and deaths. Use 10,000 seed-paired bootstrap resamples and two-sided **97.5%** percentile intervals, adjusted for the two primary contrasts. Empty populations at the horizon, archive births, external input, genome diversity, novelty, cap use, deaths and promoter-open/literal comparisons are exploratory. A zero-crossing interval is not evidence of equivalence.

To assess spontaneous structures, record whether introns exist at the fork, whether new intron spans are recognized immediately after **point mutations** that do not change genome length, and whether previously absent intron sequences appear after infection, vector delivery, necrotic reinjection, time-splicing or scavenging. The latter can represent inherited material or rearrangement, not necessarily newly invented sequences. The parser and all codons are available to the whole ecology; mutation and horizontal transfer are the inherited processes. A recognized intron or no-op is a structural observation, not by itself evidence that natural selection favored it.

Fixtures 38991–38993 checked the digit-only literal implementation against projected trajectories from the previous ancestry-aware engine. Pilot seeds 38994–38995 were inspected before this plan. This plan and source hashes were saved locally before running the fresh outcome seeds; this is not independently witnessed public preregistration.

```
4c05bf30346962a9fc9e1b1de6601ec77725ff3a77b990343024b8131693f4ab  digit_world.py
1b220b3328dbcc9245cb13180880fa480b30855917ee84fe87b2dcebfd4fe07d  digit_study.py
39cbae46f2274e7d91bee08d5edd84fef219c164d705854f0497f60429cd3cfd  analyse_digit.py
a4d074ec40ae424862643cf0ba342564a3845d8f05664f4fd931a6b8d337967d  migration_projection.py
75ef1c4d23b9b9e6b3dfc31bdbeda2f1c0509b002409b6b8441bb6415b3eaabd  reference_literal_hashes.json
e25f4298b1c285b9b6a608006bb39738edc0776234c9dbf65d4f2eba054ed09d  test_digit_world.py
2c0fbd7385724c2952c2e41d2ba3fee6d7d5a2626164467a99a7d4ca83f10124  test_migration.py
2527366f0de2b20a17b32327b6a86568df2f49eaf13aa906173cf14296e58bf3  legacy_engine.py
d442cc2972707247930aa11ef63fc60ea97c2b24af240ae7511d640c2e3a1147  reactor.py
5a1641b831826ced59d710fc9bb3efe95053770a9e735bbf909d9ed38864963c  storage.py
40f66a84cf94b2bde8854ac565f17bc2cf2880199d384ff6319b7cdc4404ffd4  study.py
e501574f89b943942ff21669ea01255e1b9153652070fd7c905573be27e8c835  assemblage.py
02c0988415b4cba48f80b1c6e569b66b77c22cff087f9d5893984826d49058b4  adaptive.py
ee3aca9bbb31d2f4078798ba64825158a42c6616912aafe2445a1be54bac27d2  portable.py
```
