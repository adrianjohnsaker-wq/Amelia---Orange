# PF-1 Pandemonium Fieldwork: synthetic pilot work order

**Issued:** 20 October 2026, after the operator approved the six PF-1 design decisions.

**Repository:** \`adrianjohnsaker-wq/Amelia---Orange\`, new directory \`experiments/pf1/\`.

**Purpose:** show, on synthetic inflow only, that the PF-1 machinery can do four things reliably:
- detect a candidate;
- challenge it in forks;
- name it correctly;
- seal it in the journal.

**Rules for this stage:**
- Synthetic tapes only.
- No live beacon rounds.
- No live genesis.
- The Amelia-Orange substrate, Governor and ProcessFieldMemory law are used unchanged, from a pinned commit.
- The live start needs separate operator approval after this pilot's report.

## A. Naming table

1. **Build the table.** Build an immutable JSON table of the 45 Pandemonium entities from the CCRU source (ccru.net, Pandemonium). Key each entity by unordered zone pair (net-span), and give its mesh-serial number, name and the attributes the source lists. Record the source URL, the retrieval date and the file's SHA-256.
2. **Test it.** The test must show:
   - exactly 45 entries;
   - each of the 45 unordered pairs of zones 0–9 appears exactly once;
   - the mapping from pair to entity is one-to-one.
3. **Use.** The table is read-only at runtime. Entity attributes never influence whether a pattern qualifies.

## B. Scanner: candidates

1. **Excursion.** The trajectory leaves zone a and returns to a. Its turning zone b is the zone visited in the excursion that is farthest from a, by shortest directed-path distance back to a. Ties go to the earliest visited.
2. **Candidate.** An unordered pair {a, b} with at least 3 such excursions inside a sliding window. Propose the window length from the pilot and freeze it before the live start.
3. **Scanner logs.** Record the steps scanned, the candidates found and the detection step for each candidate.

## C. Fork prober: challenges

For each candidate, take forks from the live (here, synthetic) state, history included. Each fork receives the same subsequent inputs as the main trajectory. The live trajectory is never altered.

1. **Perturbations.** Four distinct perturbations:
   - **(i) Route block:** forbid the first edge of the most recent excursion.
   - **(ii) Displacement:** move the present zone to one at least 2 steps from a, with a viable path back.
   - **(iii) Second route block:** block a different edge on the usual route.
   - **(iv) Combined displacement and block.**
2. **Reachability check.** Before counting any fork, verify that at least one alternative route to a exists under the perturbation. Forks without one are recorded as not-applicable.
3. **Conditions.** For each perturbation, run four conditions:
   - **Intact.**
   - **Memory reset:** ProcessFieldMemory reset to baseline.
   - **Selective suppression:** zone b's contribution, or the Governor's, scaled down while a viable route remains.
   - **Sham:** the same code path with a neutral scale factor of 1.
4. **Recovery.** The excursion pattern re-forms, returning to a by way of b, within 24 steps.
5. **Budget.** At most 24 forks per candidate, as frozen.

## D. Encounter rule (starting values for the pilot)

A candidate becomes an encounter when both of these hold:

1. **Goal-directedness.** At least 3 recoveries in the intact condition, across the 4 perturbations, using at least 2 distinct routes.
2. **At least one further signature:**
   - **Memory:** the intact recovery rate exceeds the memory-reset rate by a proposed margin;
   - **Integration:** selective suppression abolishes recovery that the sham condition preserves.

Reach (the steps and zones traversed) is recorded descriptively only. The pilot proposes final margins, and they are frozen before the live start.

## E. Controls (the core of the pilot)

1. **Negative control, pure recurrence.** A walker on the same Numogram graph with fixed preferences, no ProcessFieldMemory influence and no Governor. It will produce recurring circuits, so the scanner should find candidates, but it must yield **zero encounters**.
2. **Positive control, constructed recovery.** A test-harness agent, not part of Amelia, that holds a target zone pair in its memory. When displaced or blocked, it steers back along available alternative routes, and the steering depends on that memory. It is built for at least 5 different zone pairs. The scanner must confirm it as an encounter in at least 90% of constructed instances, and name it with the correct entity in 100% of confirmed encounters.
3. **Sham check.** In both controls, the sham condition must behave like the intact condition.
4. **Amelia on synthetic tape, descriptive only.** Run Amelia-Orange for at least 10,000 synthetic steps. Report candidates, encounters, entities and the memory depth against its effective influence. **These numbers are not used to tune the criteria.**

## F. Journal and sealing

1. **Journal.** An append-only JSONL journal, hash-chained. Each entry holds:
   - the entity name, mesh-serial number and zone pair;
   - the signature measurements;
   - the step range;
   - the fork evidence summary;
   - the state digest;
   - three times: candidate detection, encounter confirmation and seal.
2. **Silent ledger.** Steps scanned, candidates examined, probes run, and probes failed or not applicable. No reports are written here.
3. **Sealing.** RFC 3161 seal per entry, tested against a local test TSA, plus at least one real FreeTSA seal verified offline against the pinned root.
4. **Replay.** From the same inputs, a replay gives a byte-identical journal and ledger.

## G. Pilot pass criteria (engineering, fixed now)

| Check | Requirement |
|---|---|
| Naming table | 45 entries, complete, one-to-one |
| Negative control | 0 encounters |
| Positive control | confirmed in ≥ 90% of constructed instances |
| Naming accuracy | 100% of confirmed encounters |
| Sham behaviour | consistent with intact in both controls |
| Replay | byte-identical journal and ledger |
| Seals | every journal entry's seal verifies |
| Resources | runtime per hour of simulated inflow within the fixed budget, stated in the report |

## H. Deliverables

1. \`experiments/pf1/\`: code, tests, the naming table and the frozen pilot constants, with their SHA-256 values.
2. A GitHub Actions run executing A–G, with its artifact archived.
3. \`experiments/pf1/PILOT_REPORT.md\`, giving:
   - the results against section G;
   - the descriptive Amelia run;
   - the proposed window and margins for the live start;
   - an explicit statement that no live inflow was used.

The live start requires the operator's review of this report.
