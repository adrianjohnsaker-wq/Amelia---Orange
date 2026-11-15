# The Cybergothic line: validation review (15 November 2026)

**Scope.** Three evidence packages received from the prototype session:
- digit genome (R5);
- viral stop (R6);
- chimeric-junction design (R7 design).

Plus the donor-context results report (R4), and the supplied Prototype 0 (`prototype0/AUDIT.md`).

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
