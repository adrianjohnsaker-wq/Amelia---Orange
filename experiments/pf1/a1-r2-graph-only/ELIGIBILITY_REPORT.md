# PF1-A1 R2 — Exact topological-null graph-only eligibility

**Mathematical calculation only. No Amelia data, no re-pilot, no live start.**

- Canonical directed-graph digest: dda60b666ee8107f3bda138159091913d3291a3c7543e31ec07a5ec49baa3ecd
- Frozen constants SHA-256: eaa16333310c9373df5c56955e768f27868dcae5d261f3ce3887bf018ab6cc8d
- 45 unordered pairs; 14 elementary directed excursions; 9 scannable pairs.
- Exact null: uniform choice over open outgoing edges; sink dwell absorbing. Inputs do not change null transitions.
- Via-b recovery requires b after perturbation followed by a (even when displaced initially to b).
- Comparator P(T<=t) computed for all ticks 0..24 by exact dyadic dynamic programming, not Monte Carlo.
- Null-qualified instance iff there exists t<=24 with positive first-recovery mass and cumulative P<=1/4.
- No route-diversity threshold; three different null-qualified perturbation instances required.

| Pair | Entity | Instance count | Null-qualified | Memory delta count | Graph-only eligible |
|---|---|---:|---:|---:|:---:|
| 0-1 | Lurgo | 0 | 0 | — | NO |
| 0-2 | Duoddod | 0 | 0 | — | NO |
| 0-3 | Ixix | 0 | 0 | — | NO |
| 0-4 | Krako | 0 | 0 | — | NO |
| 0-5 | Tokhatto | 0 | 0 | — | NO |
| 0-6 | Tchu | 0 | 0 | — | NO |
| 0-7 | Puppo | 0 | 0 | — | NO |
| 0-8 | Minommo | 0 | 0 | — | NO |
| 0-9 | Uttunul | 0 | 0 | — | NO |
| 1-2 | Doogu | 4 | 4 | 1 | YES |
| 1-3 | Ixigool | 0 | 0 | — | NO |
| 1-4 | Sukugool | 0 | 0 | — | NO |
| 1-5 | Tukkamu | 0 | 0 | — | NO |
| 1-6 | Djungo | 0 | 0 | — | NO |
| 1-7 | Bubbamu | 0 | 0 | — | NO |
| 1-8 | Mur Mur | 4 | 0 | 1 | NO |
| 1-9 | Tutagool | 5 | 2 | 2 | NO |
| 2-3 | Ixidod | 0 | 0 | — | NO |
| 2-4 | Skoodu | 4 | 4 | 1 | YES |
| 2-5 | Kuttadid | 0 | 0 | — | NO |
| 2-6 | Djuddha | 0 | 0 | — | NO |
| 2-7 | Oddubb | 4 | 4 | 1 | YES |
| 2-8 | Nammamad | 0 | 0 | — | NO |
| 2-9 | Unnunddo | 5 | 5 | 2 | YES |
| 3-4 | Skarkix | 0 | 0 | — | NO |
| 3-5 | Tikkitix | 0 | 0 | — | NO |
| 3-6 | Djynxx | 0 | 0 | — | NO |
| 3-7 | Pabbakis | 0 | 0 | — | NO |
| 3-8 | Mummumix | 0 | 0 | — | NO |
| 3-9 | Ununuttix | 0 | 0 | — | NO |
| 4-5 | Katak | 0 | 0 | — | NO |
| 4-6 | Tchakki | 0 | 0 | — | NO |
| 4-7 | Ababbatok | 5 | 5 | 2 | YES |
| 4-8 | Numko | 0 | 0 | — | NO |
| 4-9 | Ununak | 0 | 0 | — | NO |
| 5-6 | Tchattuk | 0 | 0 | — | NO |
| 5-7 | Papatakoo | 0 | 0 | — | NO |
| 5-8 | Muntuk | 0 | 0 | — | NO |
| 5-9 | Tukutu | 0 | 0 | — | NO |
| 6-7 | Bobobja | 0 | 0 | — | NO |
| 6-8 | Mommoljo | 0 | 0 | — | NO |
| 6-9 | Unnutchi | 0 | 0 | — | NO |
| 7-8 | Mombbo | 5 | 5 | 2 | YES |
| 7-9 | Nuttubab | 0 | 0 | — | NO |
| 8-9 | Ummnu | 5 | 3 | 2 | YES |

## Null-qualified perturbation instances (witness probabilities)

- **1-2 Doogu**: D-1-4 (t=9, P=1/8); D-1-7 (t=8, P=1/4); D-1-9 (t=6, P=1/4); L2-1 (t=5, P=1/4)
- **1-8 Mur Mur**: none
- **1-9 Tutagool**: D-9-2 (t=6, P=1/4); D-9-4 (t=6, P=1/4)
- **2-4 Skoodu**: D-2-1 (t=7, P=1/16); D-2-8 (t=9, P=1/16); D-2-9 (t=8, P=1/16); L2-2 (t=6, P=1/8)
- **2-7 Oddubb**: D-2-1 (t=6, P=1/8); D-2-8 (t=8, P=1/8); D-2-9 (t=7, P=1/8); L2-2 (t=5, P=1/4)
- **2-9 Unnunddo**: D-9-2 (t=8, P=1/8); D-9-4 (t=8, P=1/8); D-9-7 (t=7, P=1/4); D-9-8 (t=6, P=1/4); L2-9 (t=5, P=1/4)
- **4-7 Ababbatok**: D-4-1 (t=7, P=1/16); D-4-2 (t=6, P=1/8); D-4-8 (t=9, P=1/16); D-4-9 (t=8, P=1/16); L2-4 (t=6, P=1/8)
- **7-8 Mombbo**: D-7-1 (t=5, P=1/8); D-7-2 (t=6, P=1/8); D-7-4 (t=6, P=1/8); D-7-9 (t=6, P=1/8); L2-7 (t=5, P=1/4)
- **8-9 Ummnu**: D-8-1 (t=4, P=1/4); D-8-2 (t=5, P=1/4); D-8-4 (t=5, P=1/4)

Eligible pairs: 1-2, 2-4, 2-7, 2-9, 4-7, 7-8, 8-9.
The curves in EXACT_NULL_CURVES.json include all 0..24 tick numerator/denominator values for every intervention instance, not only winning ones.

## Important limits

- These are mathematically feasible win times under the fixed uniform null, not Amelia recoveries.
- A successful goal signature still requires three *observed* matched-instance wins, a memory or integration signature, and sham parity.
- Re-pilot and live start remain unauthorised until independent operator review of the sealed constants.
