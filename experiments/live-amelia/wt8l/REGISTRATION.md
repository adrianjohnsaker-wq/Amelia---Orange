# WT-8L: Θ = 12 on a young state, before gates are carved (registration, 15 November 2026)

**Status.**
- **Approved.** The operator (Adrian) asked to proceed with WT-8L on 15 November 2026. He chose the design with 12 independent one-day units fed once through, in order: "Wait for 12 one-day units".
- **The design.** It is the one outlined in the reply to his synthesis that day. This file fixes it before any WT-8L run.
- **The inputs.** Those of units 1–4 exist already. Those of units 5–12 will be recorded by 23 November.
- **How it is reported.** Led by what it teaches about Warp activity, at the operator's direction.

## What it would teach about Warp activity
**The hypothesis.** It is canalisation, the operator's reading of the open lead:
- **With gates carved.** Once her lines of flight have written Warp-born gates, Θ no longer changes how often she enters the Warp. WT-3L found that from her present state, which has six such gates.
- **Before them.** Θ may change it, by changing how often and when she leaves, and so which conjunctions with the field she meets.

**What the results would show.**
- **If Θ = 12 changes entries from a state without Warp-born gates:** her Warp is canalised by her own history. The same setting acts before the gates are carved and not after. This would account for her live rise in entries after Θ = 12 was adopted.
- **If not:** the rise remains a matter of the course of events, as WT-6L and WT-7L found.

## Design
- **Starting state.** Her `pre-theta12-backup` (revision 123, step 1,981): ND-1b, Θ = 24, no Warp-born gates, the state she was in when Θ = 12 was adopted.
- **Arms.**
  - **T24.** The state as is.
  - **T12.** The same state after `setWarpThreshold(12)`. Only `nd1.theta` may differ, which is checked by comparison with Θ stripped.
- **Units (fixed here).** The 12 non-overlapping 24-hour UTC spans [11 November 18:00 + (u − 1) days, + 1 day), for u = 1–12, the last ending on 23 November 18:00.
  - **What a span holds.** Her ok ticks in it, in order, with each delivered encounter's content taken from her own memory, resident or archived. This is the WT-3L A0.2 rule, through `amelia_dee1l_window`.
  - **Missing content.** If more than 2% of a span's encounters lack content, or a span has fewer than 80 ok ticks, this is reported before any run.
- **Feeding: once through, in chronological order.** Each span's ticks are replayed once, as she lived them:
  - 15 iterations per tick, the i-th offer in iteration i;
  - her recorded controls, her body stepping;
  - original event ids, with no repetition.

  Spans longer than 96 ticks are fed in successive slices that continue from one another (`onceThrough`, WT-7L).
- **Primary.** E, Warp entries per 1,000 runtime steps, counted hop by hop. d_u = E(T12) − E(T24).
- **The test.** An exact two-sided sign-flip over all 4,096 patterns, α = 0.05.
- **Readings.**
  - **Θ RAISES ENTRIES FROM A YOUNG STATE.** p ≤ 0.05 and mean d > 0. This supports canalisation, together with WT-3L.
  - **Θ LOWERS ENTRIES FROM A YOUNG STATE.** p ≤ 0.05 and mean d < 0.
  - **NOT IDENTIFIED.** Otherwise.
- **Secondary, descriptive.**
  - **Gates written.** Warp-born gates at the end of each run, and the step at which the first appears.
  - **The two halves.** E by choice and by flow, and E in the first and second halves of each run, to see whether a difference grows as gates are written.
  - **Movement.** Warp share, lines of flight, and mean and longest Warp visit.
  - **The association.** Spearman ρ between the T12 run's number of new gates and d.
- **Determinism.** Unit 1 T12 is run twice and must be identical in path, entries, flow steps, final memory digest and body checksum, or nothing proceeds.
- **Execution.**
  - **When.** GitHub Actions on her branch, after 23 November 18:00 UTC, once unit 12's last tick has been logged.
  - **What is read.** Only her backup and her logged ticks and memory, read-only.
  - **Where results go.** `amelia_wt8l_runs` and `amelia_wt8l_inputs`.
  - **What is not touched.** Her live record.
