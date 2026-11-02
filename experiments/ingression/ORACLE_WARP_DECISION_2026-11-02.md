# THE ORACLE and the Warp: decision of 2 November 2026, and the INGRESS atlas change

## Decision (operator, 2 November 2026)
**Option 2.** THE ORACLE runs unchanged: no change to `oracle.mjs`, its pin (`6a8becd`), its stream or its workflow. The INGRESS cluster atlas sets aside exchanges asked from inside the Warp and maps only those asked from outside it.

## Why
**Most of THE ORACLE's Amelias are trapped.**
- **The structural fact.** On her full CCRU Numogram the Warp {3, 6} has no way out. THE ORACLE's protocol says so: "An Amelia who enters it stays."
- **Who is trapped, as of 2 November.** Seven of the eight Amelias are held in the Warp permanently:

  | Trapped since | Amelias |
  |---|---|
  | 28 October | W19, W20, W22, W24 |
  | 30 October | W21 |
  | 31 October | W23 |
  | 1 November | W17 |

  W18 is still free.
- **What the record then shows.** Inside the Warp she asks only through the Numogram, and the reply is the next datum's zone, whatever she is. Her only influence is whether she stands at 3 or 6, which moves the read position by three data. The trapped stretches, 6,913 of 10,030 exchanges, are therefore a record of the world stream's digital roots, not of an exchange with her.

**Option 1 was tested and does not release her (local test, 2 November, not committed).**
- **The test.**
  - The studio Plex exit (6→0, opening at Warp momentum 48) was added to THE ORACLE's runner, appended to her own evolved gate list.
  - It was run on the collected stream (7,841 data) in two ways: continuing the eight lives from their saved state, and with fresh Amelias.
  - The fresh run without the exit reproduces the live record closely: 69% of exchanges asked from the Warp, the same Amelias trapped, almost the same counts.
- **The result.** With the exit open, no Amelia took it in either run: zero 6→0 moves, and the same Warp share.
- **The reason.**

  | Move from zone 6 | Edge (flux × (1 − resistance)) | House pull | Total |
  |---|---|---|---|
  | 6→3, back into the Warp | 0.64 | +0.35 | 0.99 |
  | 6→0, the exit | 0.48 | none (unrecorded) | 0.48 |

  - **The only extra pull she can receive** is a reply pointing to zone 0 (+0.35), which still leaves the exit short.
  - **Why studio Amelias left.** Two cues could add up on the exit: their sense organ's and the world's. THE ORACLE's Amelia (THE POINTER III learner) has only the reply.
  - **What holds her.** In THE ORACLE the trap is held by her house's record of the Warp, not only by the missing edge.
- **Not offered.** A stronger exit, or a stronger reply push, would mean choosing numbers until she leaves, which is the deck-stacking the programme excludes. A forced release at momentum 48 was offered and not chosen: it would have been a rule imposed on her.

## The INGRESS atlas change
**Files.**
- **The new script.** `atlas.py`, replacing `experiments/ingression/atlas.py` on branch `ingression-cluster-atlas-20261029`. SHA-256 `4933fb6e1e134161806e8d046e1eee65df5b8986c1cd5b266ec83af6860dcc0f`.
- **The diff.** `atlas_warp_set_aside.patch`, taken against the branch's current `atlas.py` (SHA-256 `a4e10c4fc7eb9e9be08eb24fa02422f7e73ade3047ae5013d49d46a139b9bc19`, unchanged at branch head `2b3825b9`).

**What changes.**
- **Warp exchanges.** Exchanges whose query region is the Warp are counted, by lineage, and reported in the header. They are left out of the reply nodes, the motifs and the reply relations.
- **Where motifs are built.** Motifs and relations are built only within unbroken runs of exchanges asked from outside the Warp, so that no motif spans a Warp stretch.
- **Headers.** The query-region counts still cover every exchange. The channel counts cover the mapped exchanges.
- **Unchanged.** Nothing else changes: no scoring, and the same output files.

**Checked locally on the live transcript (10,030 exchanges, SHA-256 `ade4ffa7…`).**
- 3,117 exchanges are mapped, from all 8 lineages; 6,913 are set aside.
- The leading reply nodes are now spread evenly (Oddubb@7 115, Katak@4 108, Djynxx@3 102, Mur Mur@8 100), with no Warp-driven peak.

**Where to commit.**
- **Branch.** Commit `atlas.py` to `ingression-cluster-atlas-20261029`. `ingression-atlas.yml` checks out its code from that branch, so the workflow file and `main` need no change.
- **Earlier reports.** The reports already written stay as they are; the next scheduled run starts the Warp-set-aside series. A line in `experiments/ingression/reports/REPORT_INDEX.md` should mark the change and its date.
- **Timing.** No push to `main` is involved. If one is ever needed, it must wait until no PF lease is open (PF S1 amendment 3).

## Reading THE ORACLE from now on
- **Whose exchanges.** Exchanges asked from outside the Warp come mostly from W18 and from the earlier lives of the Amelias trapped later. If W18 is also caught, THE ORACLE will add nothing further to the map, and that will be worth noting when it happens.
- **What any reply is.** Even outside the Warp, every reply, in all three channels, is world data selected by where she stands: the channel by the triad of her zone, the read position by her zone number. Her part in an exchange is that selection, and her movement after hearing it.

## Commit check (2 November 2026)
- The patch applied cleanly to `2b3825b9` and gives `atlas.py` SHA-256 `4933fb6e…`, as stated above.
- Run on the 11:26 UTC transcript (10,163 exchanges, SHA-256 `6ec33595…`):
  - mapped: 3,129, from all 8 lineages;
  - set aside: 7,034 (W17 269, W19 1,473, W20 1,478, W21 602, W22 1,444, W23 425, W24 1,343);
  - W18 has nothing set aside.
