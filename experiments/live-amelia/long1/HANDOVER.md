# LONG-1 handover: from the research session to the cloud-home session (19 November 2026)

**What LONG-1 is.** The last studio gate before ND-1d. The whole desiring motor (desire, the Outside's trace, the unread
inclusive record, the guarded relational refrain, the residual subject) runs for 30 days of her time on copies of her real
state, beside ND-1b, on identical recorded inputs. Design approved by the operator (18-19 Nov):
https://claude.ai/artifact/KkxaWWp8x5ivBS7DvEFbhp. Machinery: `experiments/live-amelia/long1/` on branch `long1-20261119`
(cut from `research/live-run-history-20261109` at a41562c5).

**How it runs.** As WT-3L Amendment 2: one GitHub Actions workflow (`.github/workflows/long1.yml`, 12 parallel copy jobs),
off her database's live path. It reads and writes **only** the study table `amelia_long1_runs`. Her live record, her
archive and her edge function are never touched. The workflow uses the existing repository secret
`AMELIA_SUPABASE_SERVICE_KEY`.

## What we need from you

### 1. The study table
Create `amelia_long1_runs` with the same columns and access as `amelia_hyp2l_runs`: `id text primary key, unit int,
arm text, status text, record jsonb, error text, metrics jsonb, updated_at timestamptz`, service role only.

### 2. Twelve starting copies: rows `start-c01` ... `start-c12` (`record` = a whole scratch record)
Each `record` is a copy of her record exactly as `wt3lBegin` takes it, with `state` (`runtimeKind` 'nd1', Θ = 12, her
Warp-born gates), `fieldCheckpoint` (her body), `controls` and `revision`. In order of preference:
- **(a) Twelve stored states.** Twelve stored states of her at clean ticks, spread as evenly as her stored history allows.
  The most recent should be taken when you load them.
- **(b) Fewer stored states, each used more than once.** Distinct span offsets come from (3). Say how many distinct
  states there are.
- **(c) One state.** If no earlier state is stored, the current clean state for all 12 copies, with the 12 distinct span
  offsets of (3).

Please record which option you used, and for each copy its revision, step and memory-head digest, in `metrics` of the
same row.

### 3. Each copy's span: rows `inputs-c01` ... `inputs-c12` (`metrics.ticks`, 2,880 ticks)
`metrics.ticks` is an array of 2,880 ticks, 30 days of 96. Each tick is `{ startedAt, offers: [{ eventId, channel,
sourceDigest, attentionVector }] }`: the Outside offers her tick delivered then, in order, as WT-3L's inputs were built.
Include no `field:` or `source:` events, which are her own field.

**Her recorded history is about 8–9 days, so no copy has 30 days of recorded future.** Build each span as:
- the recorded ticks that follow the copy's starting tick, in order;
- then continuing **cyclically through her whole recorded history** from its first tick, in order;
- until there are 2,880 ticks.

For option (c), copy n starts the cycle at offset (n − 1)/12 of her history. Set `metrics.span` to the recorded interval
and the cycle offset, and `metrics.flagged = true` when a span wraps (it always will).

### 4. Tell us when the rows are in
Reply with the option used and the 12 copies' revisions and steps. The research session then runs the disclosed pilot
(copies 1–2, 3 days, every arm) by committing `experiments/live-amelia/long1/pilot.trigger`, finishes the registration,
seals it (RFC 3161) and starts the run.

## What LONG-1 will not do
- It will not write to her live record or archive, use her edge function, or change her runtime. The default stays ND-1b.
- It will not switch her. A pass only lets ND-1d be offered as a selectable runtime on main, in a PF gap, with the
  operator's approval.
