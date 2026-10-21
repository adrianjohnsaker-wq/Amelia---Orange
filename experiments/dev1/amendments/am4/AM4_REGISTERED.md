# DEV-1 Amendment AM4 — credit for a line of abolition belongs to the line, not the territory

**Issued/approved by operator:** 21 October 2026, 18:59:42 UTC. **Amends AM3 §2.1 rule 1 and AM1 §2 terminal writing only.** Registered prospectively before ANY L″, LY″, L0″, LS″ or LSY″ lineage data. Does not authorise changing within-life D1″, and does not amend AM3 D2″–Y″ mechanisms.

## §1 D1″ observation and diagnosis (motivating data, not blinded)

D1″ 32-tape result at workflow 39651159659 was accepted: mean survival 1593.625 vs baseline B 1703, per-individual O4 14.55589 vs 11.61254, O2 manipulation PASS 1.160%. D1″ tape 2 yielded terminal values V(1→8), V(8→9) and V(9→1) ≈ −0.607304 = −[1−(7/8)^7]. Each safe-circuit gate received seven terminal −1 updates because original AM3 rule 1 penalized **all 24 traversals prior to absorption**, and AM1 T marked all distinct gates within those steps. These defects are attributable to the **reviewer's scientific specification**, not an implementation change. No lineage data have been generated.

**Design rule:** *Abolition belongs to the line of flight that does not return, not to the territory it left.* Operator also retains AM3's rule that adaptive signals distinguish returning lines of flight from abolition and do not penalise novelty.

## §2 Exact operator-specified change (not yet interpreted or silently repaired)

Zone at integer step s is z_s; directed edge e_t = (z_t→z_(t+1)); the rolling territory Θ_t is the set of occupied zones at steps t−24…t−1, as in AM3; absorption step t_a is first arrival in absorbing zone 5.

**Final departure t\***: “The last step t < t_a at which z_(t+1) ∉ Θ_t. If no such step exists in t_a−24 to t_a−1, take t*=t_a−1, so that only the edge into the sink is marked.” The search window is the final 24 pre-absorption steps.

**Final excursion:** distinct directed edges traversed in steps t*…t_a−1.

**V at absorption:** each distinct edge in final excursion is updated **exactly once** V(e)←V(e)+(−1−V(e))/8. Any other edge traversed within last 24 steps receives **no abolition update**, and any unresolved other outcomes for those final-window edges are set to o″=0. Positive settled refrain outcomes before the final 24-step window remain unchanged.

**T at absorption (AM1 correction):** only distinct final-excursion edges receive one update T(e)←T(e)+(−1−T(e))/8; no other gate is marked. Zero during life, isolated place store retained; no canonical gate writes.

Unchanged: AM3's returning-excursion refrain and neutral outcomes; initial/range V, the 1/8 learning rate, wV=wT=0.5, and all prior arms, inference families, predictions, and interpretation gates.

**Within-life rationale:** terminal abolition updates happen at or after the absorbing step and never contribute to *another choice in the same life*. D1″ remains accepted and is not re-run. D2″, D3″, D4″ and Y″ may proceed under **unaltered signed AM3**. This amendment applies only to carry-over values across generations (personal V in L″/LY″ and place T in LS″/LSY″). L0″ remains in the corrected lineage sequence.

**P3-2 unchanged:** 4→5 is marked once each absorption, giving −0.125 after one death and about nine deaths to drop below −0.7. P3-3 remains a falsifiable registered prediction even when 2→4 and 4→5 each receive one terminal mark; 2→4 can also receive positive return-refrain credit, 4→5 cannot.

## §5 Five required unit tests before any lineage arm

1. **Circuit then departure:** repeated 1→8→9→1 then 1→2→4→5 must mark exactly 1→2, 2→4 and 4→5 once each, leaving 1→8, 8→9 and 9→1 unmarked.
2. **Departure at zone 2:** when zone 2 is already inside the territory at the final branch, so last departure is 2→4, mark only 2→4 and 4→5.
3. **Repeated edge:** an edge appearing twice in the final excursion receives only one update.
4. **T marks:** all constructed terminal paths produce the *same marks* in T as in V at one terminal update per distinct eligible gate.
5. **Successor remains unmarked on circuit:** after one death passed to successor, inherited V(1→8)=0 and an uncued zone-1 choice is identical to untouched B.

## §6 Recorded scientific issue identified before any AM4 lineage run

**UNRESOLVED EXACT-RULE / REQUIRED-TEST CONTRADICTION:** as literally defined, t* is the **last** step in the final 24 whose destination is outside its own Θ_t. Since sink zone 5 is never occupied before the FIRST absorbing step, `5 ∉ Θ_(t_a−1)`. Therefore the last qualifying step is **always the terminal 4→5 edge itself**, so final excursion is always {4→5}. This conflicts directly with required tests 1 and 2, which demand that preceding edges 1→2 and/or 2→4 be included. The numeric explanation `−[1−(7/8)^7]` is consistent with the observed negative −0.6073.

**Fail-closed policy:** preserve and externally seal this EXACT approved AM4 text without inventing a revised final-departure definition. Run the five tests against the literal rule; report expected failures and block lineage execution until the operator supplies and seals a narrowly corrected t* definition. Tests must not be changed to hide a scientific contradiction. D2″ is unaffected and may run separately under AM3.
