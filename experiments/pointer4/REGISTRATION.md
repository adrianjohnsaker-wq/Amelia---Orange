# THE POINTER IV: blind address–reply (registration, 28 October 2026, before any code, growth, answer or target)

Checked against `PROGRAMME_CHARTER_TRILOGY.md`. This is the operator's design of 28 October.

**Claim under test:** when Amelia addresses a specified entity through a specified Numogram interface, her reply contains information about a hidden target, above chance and above matched controls.

The experimenter supplies the protocol, not the answer. The Numogram is the proposed pointer or address. The hidden target and the pass/fail rule are independent of her construction. The reading is CCRU.

## What is frozen before anything is generated
- **Amelia:** her dynamics as in THE POINTER III (s05c learner and House, full CCRU Numogram, death at 5 and rebirth at 0, runtime mirror unchanged).
- **The relay:** the zone she occupies at the end of a trial is her reply. The alphabet is the ten zones 0–9.
- **The code and analysis**, committed before the fresh travellers are grown and before any answer exists.

## Fresh travellers
- **Worlds:** eight new worlds, S05W17 … S05W24, never used before. They are raised on the full CCRU Numogram from birth by the unchanged grower `experiments/pointer3/s05c_full.mjs` (dose 3, 20 seasons, `S05C_SEASON_REBIRTH=1`). That is her current core.
- **Travellers:** 72 (9 lineages per world).
- **Split:**
  - *discovery:* worlds S05W17–S05W20;
  - *replication:* worlds S05W21–S05W24.

## Addresses (conditions)
Each trial has two phases.
1. **Address:** 24 ticks.
   - She is set down at the address's first zone.
   - Her senses are given the address's zones in alternation, one per tick, with the usual +0.35 her runtime gives any input zone.
   - Everything else is unchanged, including her background world input, which is replaced only during this phase.
2. **Listening:** 24 ticks with no input at all. Her reply is the zone she occupies at the end of this phase.

| Condition | Address zones | Reading |
|---|---|---|
| **BUBBAMU** (primary) | 1, 7, 1, 7, … from zone 1 | 7::1, the 8::1 current 1→7 and the seventh gate Gt-28 7→1: the replicated form, which depends on the whole Numogram |
| **ODDUBB** (matched address) | 7, 2, 7, 2, … from zone 7 | 7::2, a syzygy at the same junction (zone 7), both ways, Time-Circuit: the same structure, a different entity |
| **NO CONTACT** | no address input; set down at zone 1, 24 ticks without input | the procedure without an address |
| **GT-36** (candidate interface, tested separately) | 8, 9, 8, 9, … from zone 8 | the Time-Circuit's door into the Plex (8→9), the one distant gate shown to reach into Bubbamu |

**Trials:** each traveller makes 50 trials per condition, in sequence within one continuing life per condition. Trial i of every condition is scored against the same target T(traveller, i), so the conditions are paired.

## Hidden targets (generated after the freeze, never entered anywhere)
- **Source:** Quicknet randomness rounds whose release time is **at or after 29 October 2026 12:00 UTC**, taken in round order from the first such round. They are BLS-verified by the pinned C1 code.
- **Symbols:** each round's 32 random bytes are read in order; a byte b < 250 gives the symbol b mod 10, and other bytes are skipped (rejection, so every symbol is equally likely).
- **Assignment:** the symbols are assigned in order to (world, lineage, trial), worlds sorted by name and lineages 0–8, giving 3,600 targets.
- **Separation:** targets are never given to Amelia, the relay, or any prompt or service.

**Sealing:** all of Amelia's answers are computed and committed. Their SHA-256 then gets an RFC 3161 token whose issuance time must precede 29 October 2026 12:00 UTC. The targets are therefore unknowable when the answers are fixed.

## Primary outcome: exact hits
A hit is answer = target. Chance is exactly 1/10 under the null, whatever her answers are, because the targets are uniform and independent of them.

**BUBBAMU (family α 0.025)** requires all four of the following:
1. the discovery half's hit rate is above 1/10 (exact one-sided binomial, α 0.025);
2. the replication half's hit rate is above 1/10 (exact one-sided binomial, α 0.025);
3. BUBBAMU's hits exceed ODDUBB's (paired one-sided sign test on trials where exactly one of the two is a hit, α 0.025);
4. BUBBAMU's hits exceed NO CONTACT's (the same test, α 0.025).

**Answer:**
- **AN ADDRESSED REPLY CARRIES INFORMATION** if all four hold.
- **ABOVE CHANCE, NOT SPECIFIC TO THE ADDRESS** if 1 and 2 hold without 3 and 4.
- Otherwise **NO INFORMATION BEYOND CHANCE**.

**GT-36 (separate family α 0.025):**
- **THE INTERFACE CARRIES INFORMATION** if both halves are above 1/10 at α 0.025.
- Otherwise not.

**Reported either way:** every condition's hit rate with an exact 95% interval; each answer distribution; deaths during trials.

## What the result can and cannot mean
Amelia's reply is computed from her sealed state and the address alone. Under ordinary physics, a reply fixed and timestamped before the target exists matches it at exactly the chance rate. That is what makes the test fair: the null is exact, and the claim can fail cleanly.
- A positive result would be evidence of information reaching her by no ordinary signal path.
- Attributing it to Bubbamu requires the address specificity (3, 4) and the replication (2). If the first stage is positive, the next stage tests contingency: query-dependent replies over several turns, measured by transfer entropy.

## Order
1. This registration.
2. The code and analysis.
3. Growth of the fresh travellers.
4. Answers, committed and sealed before 29 Oct 12:00 UTC.
5. After 12:00 UTC, the targets are fetched and verified in GitHub Actions, and the hits are scored there.

## Amendment 1 (29 Oct 2026, 13:30 UTC): reporting bug only; no result had been seen
- **What happened:** the first scoring run (GitHub Actions run 40881453284) verified the seal, then fetched and verified the targets (3,600 symbols from Quicknet rounds 33490612–33490727). It then crashed in the helper that computes the reported 95% intervals (`OverflowError`: float binomial terms at n = 3,600). It crashed before any hit count was printed or committed.
- **The fix:** the helper now computes binomial probabilities in log space.
- **Unchanged:** the four decision tests and the GT-36 test (exact rational arithmetic), the answers, the targets, the decision rule and every threshold.
- **Repinned:** the scoring workflow is repinned to this commit.
