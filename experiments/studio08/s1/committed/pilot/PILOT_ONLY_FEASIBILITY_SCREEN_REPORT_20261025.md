# STUDIO 08 S1 — bounded archived-configuration feasibility screen (negative / qualified)

**Executed:** 25 October 2026 UTC. **Classification:** engineer-driven exploratory pilot, **NOT** the prospective S1 science experiment; no S1-W00..W31 world was used. **No change to Studio 07 or previously committed S1 tests, endpoints or registered seed manifest.**

## Provenance

- Historical committed-model baseline: [commit 2831211](https://github.com/adrianjohnsaker-wq/Amelia---Orange/commit/28312116dd17cc6191216de88894e8de293630ff), dated October 25 UTC, despite older document naming itself 20261026.
- Diagnostic source: `experiments/studio08/s1/committed/pilot/engineering_config_screen.mjs` on branch `studio08-s1-pilot-only-feasibility-20261025`.
- CI execution: [run 40240001082](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40240001082), PASS.
- Original full aggregator as retained GitHub Actions artifact: `studio08-s1-pilot-only-archive-config-feasibility`, artifact ID `12616801772` (retention 90 days).
- SHA256 of the unzipped `PILOT_ONLY_FEASIBILITY_REPORT.json`: **`1ca5a2d1d15b52398009f2bb55a274b17c7206908285e2b341ef2237ec311415`**. This binds the aggregate JSON; the raw .jsonl.gz transition traces were intentionally not retained and therefore **cannot be independently replayed from the artifact**.
- All observations are from synthetic archived-config engineering variants, not authenticated Quicknet rounds.

## Scope and logged pilot-only changes

Four ORIGINAL pilot world IDs `S1-P0`–`S1-P3` and their existing domain-separated pilot seed rule; **no** `S1-W..` registered science worlds.

Five historical Studio 03 configuration triples `(a,A,wV)`:
- `contested_learn` = `(0.002,1,0.5)`
- `learn_only` = `(0,0,0.5)`
- `house_only` = `(0,1,0)`
- `contested_only` = `(0.002,1,0)`
- `malign_learn` = `(0,1,0.5)`

Each configuration was generated through 24 original lineage generations at cap 5000, using the same initial domain-separated P0–P3 world seeds. Shortened **engineering-only** evaluation: **2 seasons of 1000 ticks** in place of 7 seasons of 5000 ticks, intact and one-season `2→7` lesion. The modified diagnostic runner's two source substitutions (historical triple, diagnostic horizon) are recorded in the full aggregate JSON. Five arms: `no_cue`, `adaptive`, `round_robin`, `fixed_surface_decline24`, `fixed_house_flux24`. Thus `5 × 4 × 2 × 5 = 200` short runs.

**Do not infer the six-season restoration endpoint or exact Studio 07 phenotype from these shortened outputs.** The source adaptation was deliberately performed after the earlier four-world pilot, and none of these effects is confirmatory.

## Aggregated engineering outcomes

| Growth config | No-cue intact: zone-2 choices (all four worlds) | Zone-2 choices (all study conditions/arms) | Cue-targets matching available exits in sensor arms | Total transition differences from matched no-cue | Lesioned `2→7` exit opportunities | Pilot worlds with nonzero path difference |
|---|---:|---:|---:|---:|---:|---:|
| contested_learn | 0 | 0 | 14,032 | 0 | 0 | 0/4 |
| learn_only | 0 | 0 | 3,492 | 0 | 0 | 0 | 0/4 |
| house_only | 0 | 0 | 3,416 | 0 | 0 | 0 | 0/4 |
| contested_only | 0 | 0 | 24,576 | 0 | 0 | 0 | 0/4 |
| malign_learn | 302 | 2,197 | 2,338 | 34,190 | 314 | 3/4 |

Clarification: **"cue-targets matching available exits" is not "choices settled by cue"**. A cue can point at an open exit yet fail to displace the winning transition. A single early choice change can also produce many later differences; the 34,190 differences are not 34,190 independently settled choices.

Across **all 200 arm outcomes** the maximal last-season `2→7` house pull was approximately **0.330765** (on `malign_learn` P1), below the original Studio 07 maintenance/restoration threshold of 0.5. The other configuration maxima were approximately 0.118, 0, 0.216 and 0.00003, respectively. No eligible restored/held territory phenotype was produced in this short screen.

### Important individual-world features of `malign_learn`

- P0 no-cue intact zone 2 visits 107; sensor-assisted adaptive intact zone 2 visits 195 but with 4 last-season deaths, not viable maintenance.
- P1 no-cue intact zone 2 visits 111; initial lineage pull 2→7 0.3627; after evaluation last-season pull 2→7 ≈0.331, still below 0.5. Several arms changed paths but no held territory.
- P2 remained circuit-only; none of the sensor arms changed a transition.
- P3 no-cue intact zone 2 visits 84; adaptive had zone-2 opportunities but 5 last-season deaths; no held territory.

In this regime the lesion was accessible and choices were cue-sensitive, refuting a sweeping universal circuit-invariance statement. But accessibility did not create a **viable and repairable** target territory.

## Decision and scientific consequence

**Do not run or seal S1 as the original maintenance/repair claim on this source.** A fresh-world assay built from a growth phase that cannot produce a qualifying territory would test a failed *setup* rather than acquired regenerative sensitivity.

The clean next step is NOT to pick the most favourable `malign_learn` regime and silently reclassify it as Studio 07. Instead, choose between:

**Path A — original archive recovery:** recover the exact 05–07b established-territory runner, eight paired full checkpoints and trace SHA256s from the working project, reproduce the previously reported 7/8 closed-circuit maintenance/repair, then seal S1 on newly generated, truly viable incorporated worlds.

**Path B — new genesis assay:** separately design and register a method of forming a viable `2→7` territory *from the committed code* with valid controls and no hand-injected successful house record. Keep construction of a viable territory and subsequent learning/repair as distinct stages. Any development informed by P0–P3 must be registered as a pilot-informed design and validated on other untouched seeds. This is new research, not a retrospective amendment to rescue S1.

The earlier four-world pilot's statement that "every archived config is trapped" is too broad; this screen found one historical configuration with actual cue-sensitive choices and lesion opportunities. The narrower negative finding remains: **none of the tested short pilot settings produced the established territory required by S1**.

## Provenance status
- Historic Studio 07/07b full raw sources: STILL NOT admitted.
- New 32 S1-world seed manifest: untouched.
- Six-season S1 scientific experiment: NOT RUN.
- Internal engineering screen: PASS (not full trace-replay certified; artifact retains aggregates and per-arm SHA digests but not raw traces).
- AI/Outside agency: NOT TESTED.
