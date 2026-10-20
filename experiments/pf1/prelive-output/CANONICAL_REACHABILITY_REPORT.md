# PF-1 canonical-graph pre-live audit

**Synthetic structural audit only. Live start remains unauthorised.**

## Identity and scope

- The actual fresh runtime gate graph and frozen CANONICAL_GATES have identical directed edges: PASS.
- Pinned substrate commit: b67ec92e1cec13e9500d87292d59605428fb467e
- Graph SHA-256: dda60b666ee8107f3bda138159091913d3291a3c7543e31ec07a5ec49baa3ecd
- Directed open edges: 0→9, 1→8, 2→7, 3→6, 4→5, 1→2, 2→4, 4→7, 7→8, 8→9, 9→1
- Original pure-recurrence negative control uses runtime-derived canonical graph, NOT syntheticGraph(): confirmed by source check.
- Previous negative result retained: 21 candidate observations, ZERO encounters.
- The previous positive controls ran on a distinct richer synthetic graph; this is the new canonical check.

## Complete 45 pairs × 4 challenges

YES means at least one genuine scanner-derived directed excursion of this unordered pair has a viable challenge recovery path via the turning zone under the existing perturbation implementation. N/A includes pairs that cannot be scanner candidates. The accompanying JSON contains reasons and explicit witness paths.
The maximum applies to one excursion and cannot be assembled from different path templates. A pair is potentially eligible only if the unchanged 3-of-4 recovery gate can be met.

| Pair | Entity | Excursions | Block 1 | Displace | Block 2 | Combined | Max on one excursion |
|---|---|---:|:---:|:---:|:---:|:---:|---:|
| 0-1 | Lurgo | 0 | N/A | N/A | N/A | N/A | 0 |
| 0-2 | Duoddod | 0 | N/A | N/A | N/A | N/A | 0 |
| 0-3 | Ixix | 0 | N/A | N/A | N/A | N/A | 0 |
| 0-4 | Krako | 0 | N/A | N/A | N/A | N/A | 0 |
| 0-5 | Tokhatto | 0 | N/A | N/A | N/A | N/A | 0 |
| 0-6 | Tchu | 0 | N/A | N/A | N/A | N/A | 0 |
| 0-7 | Puppo | 0 | N/A | N/A | N/A | N/A | 0 |
| 0-8 | Minommo | 0 | N/A | N/A | N/A | N/A | 0 |
| 0-9 | Uttunul | 0 | N/A | N/A | N/A | N/A | 0 |
| 1-2 | Doogu | 2 | N/A | YES | YES | N/A | 2 |
| 1-3 | Ixigool | 0 | N/A | N/A | N/A | N/A | 0 |
| 1-4 | Sukugool | 0 | N/A | N/A | N/A | N/A | 0 |
| 1-5 | Tukkamu | 0 | N/A | N/A | N/A | N/A | 0 |
| 1-6 | Djungo | 0 | N/A | N/A | N/A | N/A | 0 |
| 1-7 | Bubbamu | 0 | N/A | N/A | N/A | N/A | 0 |
| 1-8 | Mur Mur | 1 | YES | YES | N/A | YES | 3 |
| 1-9 | Tutagool | 1 | N/A | YES | YES | N/A | 2 |
| 2-3 | Ixidod | 0 | N/A | N/A | N/A | N/A | 0 |
| 2-4 | Skoodu | 1 | N/A | YES | N/A | N/A | 1 |
| 2-5 | Kuttadid | 0 | N/A | N/A | N/A | N/A | 0 |
| 2-6 | Djuddha | 0 | N/A | N/A | N/A | N/A | 0 |
| 2-7 | Oddubb | 1 | YES | YES | N/A | YES | 3 |
| 2-8 | Nammamad | 0 | N/A | N/A | N/A | N/A | 0 |
| 2-9 | Unnunddo | 2 | N/A | YES | N/A | YES | 2 |
| 3-4 | Skarkix | 0 | N/A | N/A | N/A | N/A | 0 |
| 3-5 | Tikkitix | 0 | N/A | N/A | N/A | N/A | 0 |
| 3-6 | Djynxx | 0 | N/A | N/A | N/A | N/A | 0 |
| 3-7 | Pabbakis | 0 | N/A | N/A | N/A | N/A | 0 |
| 3-8 | Mummumix | 0 | N/A | N/A | N/A | N/A | 0 |
| 3-9 | Ununuttix | 0 | N/A | N/A | N/A | N/A | 0 |
| 4-5 | Katak | 0 | N/A | N/A | N/A | N/A | 0 |
| 4-6 | Tchakki | 0 | N/A | N/A | N/A | N/A | 0 |
| 4-7 | Ababbatok | 1 | N/A | YES | N/A | YES | 2 |
| 4-8 | Numko | 0 | N/A | N/A | N/A | N/A | 0 |
| 4-9 | Ununak | 0 | N/A | N/A | N/A | N/A | 0 |
| 5-6 | Tchattuk | 0 | N/A | N/A | N/A | N/A | 0 |
| 5-7 | Papatakoo | 0 | N/A | N/A | N/A | N/A | 0 |
| 5-8 | Muntuk | 0 | N/A | N/A | N/A | N/A | 0 |
| 5-9 | Tukutu | 0 | N/A | N/A | N/A | N/A | 0 |
| 6-7 | Bobobja | 0 | N/A | N/A | N/A | N/A | 0 |
| 6-8 | Mommoljo | 0 | N/A | N/A | N/A | N/A | 0 |
| 6-9 | Unnutchi | 0 | N/A | N/A | N/A | N/A | 0 |
| 7-8 | Mombbo | 2 | N/A | YES | N/A | YES | 2 |
| 7-9 | Nuttubab | 0 | N/A | N/A | N/A | N/A | 0 |
| 8-9 | Ummnu | 3 | N/A | YES | N/A | YES | 2 |

## Encounter-possible pairs (topology alone)

- 1-8 — Mur Mur (Mesh-29), maximum 3 viable challenges out of four.
- 2-7 — Oddubb (Mesh-23), maximum 3 viable challenges out of four.

This is a necessary topology condition, not a demonstration that Amelia is capable of goal-directed recovery.

## Constructed positive agent on canonical Numogram

| Pair | Name correct | Intact recoveries | Routes | Memory delta | Sham parity | Encounter |
|---|:---:|---:|---:|---:|:---:|:---:|
| 1-8 | true | 3 | 3 | 1 | true | true |
| 2-7 | true | 3 | 2 | 1 | true | true |

Canonical graph constructed controls: PASS.
All 45-by-4 decisions and control trajectories are archived as JSON.

## Boundaries

- No change to readout, thresholds, recurrence scanner, fork code, Governor, ProcessFieldMemory or canonical gates.
- No live beacon rounds, genesis, registration or live exploration.
- Live start needs separate operator approval after review.
