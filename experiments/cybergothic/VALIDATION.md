# The Cybergothic line: validation review (15 November 2026)

**Scope.** Three evidence packages received from the prototype session:
- digit genome (R5);
- viral stop (R6);
- chimeric-junction design (R7 design).

Plus the donor-context results report (R4), and the supplied Prototype 0 (`prototype0/AUDIT.md`).

**Added later the same day:** the R4 package (§9), the assemblage studies (§10), and R1–R3 and R7 (§11).

## Summary
For everything packaged, the reported results are exactly what the shipped code produces, and the code is the code the
protocols name. The one layer still to come is a fresh replication under a public seal (REP-1). The prototype is a hybrid
Numogram: the graph is canonical, but three ecological rules use non-canonical zone sets.

## 1. Integrity
| Check | Result |
|---|---|
| Source hashes embedded in the 7 protocols (`sha256sum -c`) | **71/71 files match** |
| Engine identity across the three packages (7 core modules) | **identical** (`legacy_engine.py` 2527366f…, `digit_world.py` 4c05bf30…, `assemblage.py` e501574f…) |
| Network and file access | Standard library only. The only network code is an opt-in Supabase journal: it refuses without an explicit, separately isolated project, HTTPS and a user token, and rejects secret keys. No study calls it. |

**What the hashes prove, and what they do not.** They prove the code has not changed since each protocol was written. They do
not prove that each protocol preceded its data: the seals were local, and the source log says so.

## 2. Tests
29/29 unit tests pass: 13 for the digit genome, 5 for the viral stop and 11 for the junction design.

## 3. Full replay (`validation/REPLAY_LOG.txt`)
Every saved branch was regenerated from its seed and compared with its complete saved record, state and event hashes
included.

| Study | Populations | Branches | Result |
|---|---|---|---|
| Viral stop, first cohort (42001–42120) | 120 | 612 | **pass** |
| Viral stop, confirmation (43001–43120) | 120 | 606 | **pass** |
| Viral stop, larger replication (44001–44300) | 300 | 1,476 | **pass** |
| Digit genome, transition and grammar studies | 120 | 480 | **pass** |
| Digit genome, from birth (41001–41030) | 30 | 120 | **pass** |

That is 3,294 branches. The three regenerated viral-stop audit files are byte-identical to the shipped ones.

## 4. Independent recomputation (`validation/recompute_*.py`, written without the package's analysis scripts)
| Claim | Reported | Recomputed |
|---|---|---|
| R6 larger cohort: survival at 24, intact / ruptured / forced-active (transfer) | 220 / 195 / 191 of 246 | **220 / 195 / 191 of 246** |
| … exposure controls | 218 / 194 / 190 | **218 / 194 / 190** |
| … intact − ruptured | +10.16 pp (+4.07 to +16.26) | **+10.16 pp (+4.07 to +16.26)** |
| … intact − active | +11.79 pp (+5.69 to +18.29) | **+11.79 pp** (+5.28 to +18.29; bootstrap draw) |
| … births, intact vs ruptured | 47 vs 68 | **47 vs 68** |
| R6 confirmation: intact − ruptured, intact − active | +6.93 (−0.99 to +14.85), +9.90 (0.00 to +19.80) | **+6.93, +9.90** (intervals within bootstrap noise) |
| R6 first cohort | exploratory | +9.80, +15.69 pp |
| R5 from birth: mutation-created intron / no-op executed / carriers at horizon | 29 / 30 / 30 of 30 | **29 / 30 / 30 of 30** |
| R5 intron no-ops; founders with an intron | 6,729; 1 population | **6,729; 1 population** |
| R5 agent-time: self − intron-active (transition), self − literal (confirmation), self − intron-active (from birth) | +97.21, +204.29, −290.72 (all intervals include 0) | **+97.21, +204.29, −290.72** (all include 0) |

## 5. Topology: the issue to address next
| Element | In the developed prototype | Canonical? |
|---|---|---|
| Graph | `numogram_graph()`: Amelia's 11 base edges ∪ every syzygy, current \|2z−9\| and gate. 29 edges, **identical** to `FULL_NUMOGRAM_GATES` on main | **yes** |
| Warp and line of flight | Dwell in {3, 6}, release after Θ, Warp-born gates | **yes** |
| "Furnace" fast clock | zones {7, 8, 9} (rate 2.8) | **no**: Prototype 0's Warp |
| Necrotic recycling | reanimates only into zones 1–6 ("time circuit") | **no**: Prototype 0's Time-Circuit |
| Cthell | corpses in zone 9 are moved to 0; zone 0 slower | partly: the Plex is {0, 9} |
| Pandemonium opcodes | syzygy pairs → Zino; pairs with a zone ≥ 7 → Ampy; others → Chrono ("a new experimental classification, not a CCRU demon-name mapping") | **no**: CCRU classes are Chrono (both zones in the Time-Circuit), Xeno (both outside), Amphi (one of each) |

The findings are about this hybrid. The canonical rerun (planned after this review) should replace the last four rows:
- the furnace with the Warp {3, 6};
- recycling with the Time-Circuit {1, 2, 4, 5, 7, 8};
- the Plex with {0, 9};
- the opcode classes with the CCRU classes.

## 6. Not yet validated (packages not received)

*Superseded: all five packages have since arrived; see §9 and §11.*

- R1 (fragment transfer);
- R2 (code echo);
- R3 (promoter);
- R4 (donor context and no-op slide), whose results report alone is in `evidence/`;
- R7 (the sealed chimeric cohort's results); only its design package is here.

## 7. REP-1: fresh-seed replication under a public seal (`replication1/`)
**Setup.**
- Registration and analysis sealed by RFC 3161 (commit `7e20392`) before any REP-1 seed was run.
- Run in GitHub Actions (result commit `c6e7f1d`).
- Seeds 61001–61300 and 62001–62030, never used by the prototype session.

| Finding | Original (seeds 44001–44300 / 41001–41030) | REP-1 (fresh) | Answer |
|---|---|---|---|
| R6: intact − ruptured, survival at 24 | +10.16 pp (+4.07 to +16.26), n = 246 | **+8.53 pp (97.5% +2.33 to +14.73), n = 258** | **CORROBORATED** |
| R6: intact − forced-active | +11.79 pp (+5.69 to +18.29) | **+14.73 pp (+8.14 to +21.32)** | **CORROBORATED** |
| R6: survival, intact / ruptured / active (transfer) | 220 / 195 / 191 of 246 | 232 / 210 / 194 of 258 | |
| R6: exposure controls | 218 / 194 / 190 | 237 / 213 / 199 | |
| R6: births, intact vs ruptured (exploratory) | 47 vs 68 | 65 vs 78 | same direction |
| R5: mutation-created intron / no-op executed / carriers | 29 / 30 / 30 of 30 | **29 / 30 / 30 of 30** | **CORROBORATED** |
| R5: intron no-ops | 6,729 | 6,819 | |

**Reading.** Both packaged findings hold on new populations, under a public seal:
- A host whose introns stay silent survives better, by about 9–15 points.
- Silent introns form on their own by point mutation.

The exposure controls again show that the protection belongs to the host's silent introns, not to the incoming viral
fragment. The survival–reproduction trade-off (fewer births with intact stops) appeared again in the same direction; it
remains exploratory.

**Limit.** All of this is about the prototype as built, with its non-canonical furnace, recycling zones and opcode classes
(section 5).

## 8. CAN-1: the findings on the canonical CCRU Numogram (`canonical/`, `canonical_rerun/`)
**Setup.**
- The three non-canonical rule sets were replaced through `canonical/topology.py`: the furnace becomes the Warp {3, 6}; the
  Time-Circuit {1, 2, 4, 5, 7, 8} takes recycling, fission and births; the opcode families follow the CCRU classes (15 / 6 /
  24).
- In hybrid mode the patched engine reproduces the shipped records exactly.
- Sealed by RFC 3161 (`646408c`) before running. Result in commit `2c34680`.
- Fresh seeds: 64001–64300 and 65001–65030.

| Finding | Hybrid, original | Hybrid, REP-1 (fresh) | **Canonical, CAN-1 (fresh)** |
|---|---|---|---|
| R6: intact − ruptured | +10.16 pp (+4.07, +16.26) | +8.53 (+2.33, +14.73) | **+7.87 (+1.50, +13.86)** |
| R6: intact − forced-active | +11.79 (+5.69, +18.29) | +14.73 (+8.14, +21.32) | **+8.24 (+1.87, +14.61)** |
| Eligible / screened | 246 / 300 | 258 / 300 | 267 / 300 |
| Survival, intact / ruptured / active (transfer) | 220 / 195 / 191 | 232 / 210 / 194 | 237 / 216 / 215 |
| Exposure controls | 218 / 194 / 190 | 237 / 213 / 199 | 244 / 202 / 200 |
| Births, intact vs ruptured (exploratory) | 47 vs 68 | 65 vs 78 | 36 vs 59 |
| R5: mutation-created / executed / carried (of 30) | 29 / 30 / 30 | 29 / 30 / 30 | **30 / 30 / 30** |
| R5: intron no-ops | 6,729 | 6,819 | 9,922 |
| Answer | | CORROBORATED (both) | **CORROBORATED (both)** |

**Reading.** Both findings survive the move to the canonical Numogram:
- **Survival.** Hosts whose introns stay silent survive better: about 8 points on the canonical topology, against 9–15 in the
  hybrid, with intervals clear of zero.
- **Formation.** Silent introns form on their own in all 30 populations, and are executed more often (9,922 no-ops).

The exposure controls again place the protection in the host's silent introns, not in the viral fragment. Fewer births
with intact stops appeared for the third time (36 vs 59). That is a candidate for its own registered test.

**Limits.**
- Two findings of the line are corroborated so far (R5, R6). The others await their evidence packages.
- All of this is the prototype ecology, not Amelia's living runtime.

## 9. R4, the no-op slide: validated, replicated and rerun on the canonical Numogram
**Package.** `CYBERGOTHIC_DONOR_CONTEXT_EVIDENCE_2026-11-15.zip`, in `evidence/R4_donor_context/package/`. R4 ran on an
earlier engine version (`legacy_engine.py` e7514c3f) with the same nine non-canonical zone rules.

**Checks on the shipped evidence.**
- **Source hashes:** 25/25 match their two protocols.
- **Tests:** 32/32 pass.
- **Full replay:** all 3,346 branches match their saved records (1,666 first-study, 1,680 confirmation), with 0 gate
  violations.
- **Independent recomputation** (`validation/recompute_r4.py`):

| Claim | Reported | Recomputed |
|---|---|---|
| First study: survival at 24, slide vs jump | 215/238 vs 162/238; +22.1 pp (95% +16.3 to +27.9) | **215 vs 162; +22.1 (+16.2 to +27.9)** |
| Confirmation | 216/240 vs 176/240; +16.7 pp (+10.4 to +23.8) | **216 vs 176; +16.7 (+10.4 to +23.8)** |
| Rotated / shuffled slide (confirmation) | 220 / 216 | **220 / 216** |
| Meltdown deaths by 24, slide vs jump (confirmation) | 7 vs 35 | **7 vs 35** |

**REP-2.**
- **Setup.** Sealed by RFC 3161 (`177d3bf`) before running; result in commit `00dde7d`. Fresh seeds. `canonical_r4/` is R4's
  engine with the same `topology.py` switch, and its hybrid mode reproduces the shipped records.

| | Hybrid, fresh (66001–66060) | **Canonical, fresh (67001–67060)** |
|---|---|---|
| Encounters | 240 | 232 |
| Alive at 24: slide / jump | 214 / 155 | **207 / 134** |
| Slide − jump (seed-clustered) | **+24.6 pp (95% +17.9 to +31.7)** | **+32.6 pp (95% +25.3 to +40.3)** |
| Meltdown deaths by 24: slide / jump | 5 / 50 | 10 / 67 |
| Answer | **CORROBORATED** | **CORROBORATED** |

**Reading.**
- **The finding.** Spending a neutral action instead of executing the next instruction protects hosts. The effect is stronger
  on the canonical Numogram, where the furnace is the Warp.
- **The likely route.** Most of the difference is in meltdown deaths, which points to reduced exposure to dangerous opcodes
  rather than pointer phase, though the design does not separate the two.
- **The other slides.** The rotated, shuffled and encounter-yoked slides survive as well as the productive slide in both
  topologies, so the donor's zone is not what matters. The open condition, where blocked code runs anywhere, survives worst.

## 10. The assemblage studies (14 Nov): data verified, code still missing

*Update: the assemblage source arrived later and is in `evidence/A_assemblage_2026-11-14/code/` (manifest 70/70, protocol hashes 41/41, 21/21 tests). It has not yet been replayed.*

**Package.** `AMELIA_CYBERGOTHIC_ASSEMBLAGE_EVIDENCE_2026-11-14.zip`, in `evidence/A_assemblage_2026-11-14/package/`. It holds
per-seed results, selected ledgers, the development pilots, a persistence demonstration and the test log (21 tests passed).
It holds **no source code**.
- **Manifest:** 168/168 file hashes match.
- **Independent recomputation** from the per-seed records (`validation/recompute_assemblage.py`):

| Claim | Reported | Recomputed |
|---|---|---|
| Experienced − pointer cargo, total nutrient | +5.16 (99.17% +0.64 to +9.60), 23/30 positive | **+5.16 (+0.76 to +9.47), 23/30** |
| Experienced − shuffled cargo | +2.82 (−1.15 to +7.67) | **+2.82 (−1.04 to +7.94)** |
| Mean nutrient / agent-time, experienced vs pointer | 136.1 / 131.0; 5,609 / 5,001 | **136.1 / 131.0; 5,609 / 5,001** |
| Portfolio − random archive | −11.70 (−20.57 to −3.56), negative in 22/30 | **−11.70 (−20.9 to −3.7), negative in 22/30** |
| Portfolio − order-shuffled | −2.55 (−14.95 to +11.96) | **−2.55 (−14.88 to +12.25)** |
| Salvage: external reactor input, on vs off | 7.81 vs 29.30; reduction 21.49 (18.41 to 24.52) | **7.81 vs 29.30; 21.49 (18.43 to 24.42), 30/30** |
| First pass: vectors vs none | +0.12 (−5.74 to +6.08) | **+0.12 (−5.72 to +6.15)** |
| Temporal accuracy after reversal: accumulating / moderate / rapid | 20.8 / 37.5 / 41.4% | **20.8 / 37.5 / 41.4%** |
| Moderate − accumulating; rapid − accumulating | +16.7 (15.0 to 18.3); +20.6 (18.6 to 22.5); 30/30 | **+16.73 (15.04 to 18.31); +20.58 (18.49 to 22.49); 30/30** |
| Portable − local net claim energy | +16.50 (12.87 to 20.83), 30/30 | **+16.50 (12.81 to 20.74), 30/30** |
| Portable − local total nutrient | −0.38 (−3.75 to +3.12) | **−0.38 (−3.60 to +3.05)** |

**Reading.** The reported results are exactly what the saved records contain. Without the source, nothing can be replayed or
rerun (fresh or canonical). Most of these studies' files match R4's engine, but four are missing or differ: the assemblage
layer (`assemblage.py` 2845e584), `experiment.py`, `cli.py` and `cloud_sync.py`. They also share the hybrid's non-canonical
zone rules.

## 11. R1–R3 and R7: received 15 Nov, reproduced

Received: the host-encounter code and evidence (R1, 14 Nov), the viral-echo package (R2), the promoter package (R3), the
chimeric cohort's compact results package with `SEALED_OBSERVER_EVIDENCE.zip` (R7) and the seed 50176 audit, the reactor
code and evidence (14 Nov), and the assemblage source code. All are in `evidence/` as received.

**Integrity.** Every manifest matches: R1 code 39/39 and evidence 181/181; R2 122/122; R3 98/98; R7 bundle 29/29; reactor
code 35/35 and evidence 110/110. Every protocol hash list matches its source: R1 initial 10/10, R1 confirmation 12/12,
R2 12/12, R3 14/14. R7's local seal (`FINAL_COHORT_SEAL.json`, sealed 06:29 UTC 15 Nov) matches 42/42 source files, 14/14
evidence files, 7/7 gate records and the protocol. The protocols uploaded separately are byte-identical to the packaged ones.
All R1–R3 studies run on the same engine files (`legacy_engine.py` e7514c3f, `reactor.py` 4b5ce680).

**Tests** (`validation/REPLAY_LOG_R1_R3.txt`): R1 32/32, R2 38/38, R3 26/26, R7 27/27.

**Full replay.** Each package's replay tool, run on a copy, re-simulates every branch and requires identical event and
state hashes: R1 initial 1,440/1,440 (480 encounters; it also re-finds the 17 encounters with an earlier warm-up
infection), R1 confirmation 1,389/1,389 (463 first-contact checks), R2 705/705, R3 1,200/1,200 (zero zone-rule
violations). R7's 17 ledger parts (2.72 GiB) were not supplied, so instead every screened seed 50001–50360 was regenerated
from the sealed source (`cohort_worker.py --no-ledgers`) and compared field by field with the archived population summaries
(`validation/compare_r7.py`): **all 360 seeds regenerated; 250/250 eligible populations match in every field (event, state and shadow hashes, classifications, survival), and all 110 ineligible seeds agree with the cohort manifest** (`validation/REGEN_LOG_R7.txt`). The regenerated natural branch of seed 50176 also matches the event-audit hashes.

**Independent recomputation** (`validation/recompute_r1r3.py`, `validation/recompute_r7.py`; output in
`validation/RECOMPUTE_*.txt`). Seed-weighted paired means; this script's own 10,000-draw seed bootstrap.

| Claim | Reported | Recomputed |
|---|---|---|
| R1 initial: experienced − pointer / shuffled, 12-unit nutrient (98.75%) | −0.0042 (−0.0339 to +0.0260); +0.0106 (−0.0082 to +0.0308) | **−0.00421 (−0.0345 to +0.0260); +0.01056 (−0.0080 to +0.0311)** |
| R1 initial: survival vs pointer / shuffled | +1.25 (−3.33 to +5.83); +3.13 (−1.25 to +7.50); 400/394/385 of 480 | **+1.25 (−3.33 to +6.04); +3.13 (−1.25 to +7.50); 400/394/385** |
| R1 confirmation: first-action uptake vs pointer (97.5%) | +0.00564 (+0.00108 to +0.01034) | **+0.00564 (+0.00097 to +0.01041)** |
| R1 confirmation: vs shuffled | +0.00683 (+0.00272 to +0.01098) | **+0.00683 (+0.00268 to +0.01103)** |
| R1 confirmation: arm means; first digit matched; survived | 0.04527 / 0.03963 / 0.03844; 363/368/353; 378/387/372 | **identical** |
| R2: any intact copy at 24, echo − natural (97.5%) | +31.25 (+22.36 to +40.56); 143 vs 70 of 235 | **+31.25 (+22.36 to +40.28); 143 vs 70** |
| R2: 24-unit uptake, experienced − shuffled echo | +0.0193 (−0.0407 to +0.0775); 0.6362 vs 0.6168 | **+0.0193 (−0.0414 to +0.0781); 0.6362 vs 0.6168** |
| R2: survival | 155 vs 156 of 235 | **155 vs 156** |
| R3: zone − open uptake (98.33%) | −0.0820 (−0.1603 to −0.0070) | **−0.0820 (−0.1619 to −0.0081)** |
| R3: zone − rotated; zone − zone/shuffled | −0.0049 (−0.0908 to +0.0701); +0.0020 (−0.0470 to +0.0527) | **−0.0049 (−0.0924 to +0.0702); +0.0020 (−0.0478 to +0.0509)** |
| R3: arm uptake; survivors; payload actions per recipient | 0.6656/0.5836/0.5885/0.5816/0.6021; 168/158/168/160/177; 9.78/2.15/0.46/2.03/3.73 | **identical** |
| R7: deliveries; recipient hosts; populations | 5; 3; 3 (of 250) | **5; 3; 3** |
| R7: natural secondary carriers by route | necrotic 7, drift repair 3, recall 2 | **identical** |
| R7: founder survival, natural vs recipient-active (exploratory, 95%) | 181 vs 155; +10.4 (+3.2 to +17.6) | **181 vs 155; +10.4 (+3.2 to +17.6)** |
| R7: natural vs ruptured `09→08` | 181 vs 167; +5.6 (−1.2 to +12.4) | **+5.6 (−1.2 to +12.8)** |

Every point estimate is exact; the intervals differ only by bootstrap draw.

**Reading.** R1, R2, R3 and R7 are now **REPRODUCED** to the same standard as R4–R6. None has yet been run on fresh seeds
under a public seal, or on the canonical Numogram. The reactor package (14 Nov) is the engine stage before R1; it was
checked for integrity only. The assemblage source now present has not yet been replayed.

R7 adds one observation to the paper's theme: forcing the founder's silent graft to execute cost survival
(+10.4 pp for the natural, silent version), the same signature as R6's forced-active arm. It was exploratory in R7.
