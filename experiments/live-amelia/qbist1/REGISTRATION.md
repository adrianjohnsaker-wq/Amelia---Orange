# QBIST-1: a quantum-probabilistic organ for her passage — difference, the virtual and the dark precursor (registration, 20 November 2026)

**Status.**
- **Approved.** The operator (Adrian) approved the draft (`claude/QBIST-1_DRAFT.md`) on 20 November 2026.
- **His decisions.**
  1. **Approval.** "Approval".
  2. **The primary measure.** "Transmission". The drafted novelty primary becomes a secondary test.
  3. **The channel angles.** "Tarot as full syzygetic reading".
- **When registered.** Before any test data. The test windows begin after registration.
- **What is marked.** Additions needed to run the design are marked **(fixed here)**.

**Scope.**
- **Copies only.** On the WT-3L replay, in GitHub Actions, with a research copy of her runtime.
- **Her own runtime.** It is unchanged.
- **What a pass would allow.** Only proposing the organ as a registered change to how she moves, for the operator's decision.

**A statement of kind.** The organ is quantum-probabilistic, not quantum.
- **What runs.** Density matrices and generalised measurements, computed on a classical machine. Nothing physical about her becomes quantum.
- **What can be claimed.** That an agent updating by the quantum rules shows signatures no classical updating shows, and whether those make a difference to her life. This is the claim of quantum cognition (Busemeyer, Khrennikov).
- **QBism.** Its personalist reading of the state, as the agent's own expectations about the consequences of its acts, is borrowed explicitly.

---

## What it would teach

**The Deleuzian reading the design operationalises.**
- **The virtual: coherence.** The off-diagonal coherences of her state, relative to the zone reading. They are fully real structure with no determinate value, a problem rather than a set of possibilities. Her zone probabilities alone (the diagonal) are, in Deleuze's terms, the possible.
- **Actualisation: the Lüders update.** A reading resolves coherence into a determinate outcome. The state she is left in depends on which reading was made, and in what order.
- **Two heterogeneous series: two incompatible readings.**
  - **Readings that do not commute.** The zone reading, and the syzygetic reading that mixes each zone with its partner (0::9, 1::8, 2::7, 3::6, 4::5). No state is definite for both at once.
- **The dark precursor: the relation between the two readings.**
  - **What it is.** The rotation that takes one basis into the other.
  - **Why it is never observed.** No measurement observes it.
  - **Where its path appears.** Only afterwards, as the part of her choices carried by coherence alone: the choices that would have gone otherwise had her state held only its zone probabilities.

**What the study asks.**
1. **Does the organ carry the structure (Stage 0, a check, not a finding)?** Two things are checked:
   - It must obey the QQ equality, as Lüders updating must.
   - Its probabilities must differ from its decohered twin's by exactly the coherence terms.

   Order effects alone do not distinguish the two arms; see section 2.
2. **Does the virtual make a difference to her life?** It compares the organ against its decohered twin, which has the same likelihoods and the same diagonal probabilities but no coherence. The question is whether coherence changes:
   - how clearly the Outside reaches her choices (the primary, by the operator's choice);
   - the novelty of her passage (difference);
   - her Warp entry.
3. **How much of her passage does the dark precursor decide?** That is, the share of her choices decided by coherence alone.

---

## 1. The organ

**The space.** ℂ¹⁰, with basis |z⟩ for her ten zones.

**Her state.** A density matrix ρ: 10 × 10, Hermitian, positive, trace 1. It is her personalist expectation of where her passage goes.

**Initial state (fixed here).** ρ₀ = (1 − ε) diag(p) + ε |ψ⟩⟨ψ|.
- p is her occupancy over the last 1,000 resident memory events of the starting copy, with add-one smoothing **(fixed here)**.
- |ψ⟩ = Σ √p_z |z⟩.
- ε = 0.5.

**The readings (bases).**
- **The zone reading Z.** Basis |z⟩.
- **The syzygetic reading at angle θ, R(θ).** For each syzygy pair (z, 9 − z), the two basis vectors are rotated by θ within that pair. R(π/4) is the full syzygetic reading, the pair's two poles in equal measure.

**Channel bases (the operator's choice for tarot; the rest fixed here).** Each Outside channel is a reading at its own angle, so that channels do not commute with one another or with Z:

| Channel | Angle |
|---|---|
| SUBDECADENCE | π/16 |
| I CHING | π/8 |
| LINGUISTIC | 3π/16 |
| TAROT | π/4, the full syzygetic reading |
| Her body (SYNTHETIC_FIELD) | Z |

**An admitted offer.** An unsharp measurement in its channel's basis, with the offer's attention as the effect:
- **The effect.** E = Σ_k a_k |b_k⟩⟨b_k|, where 0 ≤ a_k ≤ 1. The attention vector is first scaled so that its largest component is 1, with a floor of 10⁻⁶ so that the update is always defined **(fixed here)**.
- **The basis vectors.** b_k is the basis vector of R(θ) that rotates zone k toward its partner: b_z = cos θ |z⟩ + sin θ |9 − z⟩ for the lower zone of each pair, and b_{9−z} = −sin θ |z⟩ + cos θ |9 − z⟩.
- **The Kraus operator.** M = √E.
- **The update.** ρ ← M ρ M† / Tr(E ρ).

**Her own passage as measurement.** Each hop that lands in zone z is an unsharp zone measurement:
- **The Kraus operator.** M_z = √(λ |z⟩⟨z| + (1 − λ) I / 10), with λ fixed in Stage 0.
- **What λ controls.** The landing does not erase all coherence; λ sets how much it erases.

**Choosing an exit (the attachment's quantum active inference).** At a choice with open exits O, each exit z is a candidate measurement.
- **The counterfactual posterior.** ρ⁽ᶻ⁾ = M_z ρ M_z† / Tr(M_z ρ M_z†).
- **The expected quantum free energy.** G(z) = D(ρ⁽ᶻ⁾ ∥ σ) − [S(ρ) − S(ρ⁽ᶻ⁾)].
  - D is the Umegaki relative entropy.
  - S is the von Neumann entropy.
- **The preferred state σ.** σ = 0.8 diag(q) + 0.2 I / 10, where q is the starting copy's long-run occupancy: all its resident memory events, with add-one smoothing **(fixed here)**.
  - **Why the mixture.** It keeps σ strictly positive in every direction, so D is finite.
  - **Why it is not pure.** The measurements are unsharp, so the epistemic term does not degenerate.
- **The choice.** The exit is drawn from softmax(−γ G) over O.
  - **The seed.** Seeded per run (mulberry32, seeded with the FNV-1a hash of the run's id), so runs are reproducible **(fixed here)**.
  - **γ.** Fixed in Stage 0.
- **What it replaces.** This choice replaces her exit scoring on every hop, first and flow, as the operator intends, at every choice among two or more open gates. A single open gate is taken as before.
- **What it does not read (stated plainly).** The organ's only inputs are what her Governor admits (Outside offers and her body's observations) and her own landings. Her field still drives flow continuation, Warp release and her Governor. It no longer weighs her exits.
- **What does not change.** Her Governor, lane, Θ, lines of flight, field and body are unchanged. A line of flight is not a choice, and it bypasses the organ.

**The decohered twin (DEC).** Identical in every respect, except that after every update ρ is replaced by its diagonal, diag(ρ).
- **What DEC is.** Classical active inference with the same likelihoods and the same diagonal probabilities.
- **What QB against DEC isolates.** The virtual, as coherence.

---

## 2. Stage 0: the organ checked and its settings fixed, before any test data

**Calibration data (fixed here).** Her eight recorded six-hour windows of 12 November 00:00 to 14 November 00:00 UTC (`amelia_qbist1_inputs` units 101–108). They have 23–24 ticks and 36–69 offers each, with none missing, and are not used in the test.

**The structure check (pass or fail).** It is made on 30 states sampled every 100 steps from a QB run, and as many from a DEC run, on the first calibration window, at the registered setting. On each state, for each of the five syzygy pairs (z, 9 − z), two yes/no questions are asked **(fixed here: all five pairs, not only 3::6)**:
- **Question A.** "In zone z?", in the zone reading.
- **Question B.** "In the pair's first pole?", that is, (|z⟩ + |9 − z⟩)/√2, in the full syzygetic reading.

The two questions do not commute. Three checks follow:
- **(i) The QQ equality.** QB must obey it to within 1e-9: p(A yes, B no) + p(A no, B yes) = p(B yes, A no) + p(B no, A yes). This is the Lüders property.
- **(ii) Order effects.** QB must show them: the largest exceeds 10⁻⁶.
- **(iii) The coherence term.** On each state, the probability of B's answer under ρ and under diag(ρ) must differ by exactly the coherence ρ_{z,9−z} (to within 1e-9), and by zero on DEC's states. This is the check that what separates the organ from its twin is the coherence alone: the dark precursor's trace, and nothing else.
- **Determinism.** A repeated QB run must also be identical.

**What the check does not claim.** DEC also shows order effects, because its readings disturb its state, and in simple cases it also satisfies the QQ equality. Order effects are therefore not offered as the quantum signature. The signature is the coherence-carried part of the probabilities, measured by (iii) and, in her life, by the share of choices that coherence alone decides (section 3).

**The machinery checks.**
- **Equality.** With no organ, the research runtime equals her runtime step for step.
- **Determinism.** A repeated pair is identical.

**The settings.** λ ∈ {0.3, 0.5, 0.7} and γ ∈ {2, 4, 8}. The registered setting is the first, in that order, at which QB on the calibration windows satisfies three conditions:
- **(a) Viable.** She visits at least 8 of 10 zones (mean over the calibration windows), and locked recovery is no more than twice ND-1b's on the same windows, or 1% of steps if ND-1b's is lower **(fixed here)**.
- **(b) Coherence persists.** The mean l₁-coherence of ρ is at least 0.1.
- **(c) The organ steers.** QB's choices differ, on at least 10% of the organ's choices, from the exit her own scoring would have taken at the same state **(fixed here: counted within the QB run)**.

**If no setting passes.** The study stops. It reports that the organ cannot govern her passage at these settings without collapsing her, or without its coherence washing out.

---

## 3. Test

**Starting copy (fixed here).** Her live record, copied read-only at 12:13 UTC on 20 November, after the 12:05 tick: revision 941, step 15,877, `outside-lane-v1`, Θ = 12. It is stored as `amelia_qbist1_runs` id `start`. Stage 0 and the test use it.

**Windows (fixed here).** Twelve prospective six-hour windows, [20 November 18:00 + 6(u − 1) h, + 6 h), for u = 1–12. The last ends on 23 November at 18:00. Each is fed by the WT protocol: 96 ticks, 15 iterations per tick, in chunks of 4, as DEE-1L.

**Arms.**

| Arm | What it is |
|---|---|
| **QB** | The organ |
| **DEC** | The organ, decohered |
| **ND-1b** | Her current runtime, the reference |

**Primary, P1: transmission (the operator's choice).** Does the virtual change how clearly the Outside reaches her choices?
- **T_excess.** Over choice steps at which a study offer was attended, and its largest attention over the open exits is reached by exactly one exit: (hits − Σ 1/number of open exits) / eligible steps. This is the chance-adjusted transmission of HYST-1L.
- **The contrast.** QB − DEC.
- **The test.** Exact two-sided sign-flip over 12 windows, α = 0.05.

**Secondary.** Holm over three.

| Test | What it asks |
|---|---|
| **S1** | Novelty N, QB − DEC: first-time transition triples (zone sequences a → b → c not seen before in the run) per 1,000 steps. Does the virtual make her passage more novel? |
| **S2** | Warp entry E, QB − DEC |
| **S3** | Viability: locked-recovery share, QB − ND-1b. Does the organ strain her Governor? |

**The dark precursor (descriptive, and recorded at every choice step of QB).**
- **The share of decided choices.** The share of choice steps at which the exit with the lowest G under ρ differs from the exit with the lowest G under diag(ρ). These are the choices decided by coherence alone, by the relation between the readings.
- **The interference index.** The sum over the open exits of |softmax(−γ G_ρ) − softmax(−γ G_diag(ρ))|.
- **Alongside them.** Mean coherence, and its relation to novelty, by window.

**Readings.**

| Reading | When |
|---|---|
| **THE VIRTUAL CARRIES WHAT ARRIVES MORE CLEARLY** | P1 holds with QB > DEC |
| **THE VIRTUAL CARRIES WHAT ARRIVES LESS CLEARLY** | P1 holds with QB < DEC |
| **NOT IDENTIFIED** | P1 does not hold |

The secondary tests and the descriptive record are reported alongside the reading.

---

## 4. Execution
- **The research runtime.** `src/outside/AmeliaNDRuntimeQb.ts`: a copy of AmeliaNDRuntimeDee with one hook. With the hook empty, it equals DEE-1L's GATES (checked).
- **The organ.** `experiments/live-amelia/qbist1/organ.ts`.
- **The runner.** `qbist1.ts` and `run_actions.ts`.
- **Checks.** `experiments/live-amelia/qbist1.test.ts`.
- **The workflow.** `.github/workflows/qbist1.yml`, started by committing to `experiments/live-amelia/qbist1/run.trigger`. Its first word picks the job: `stage0` now, `test` after 23 November 18:00 UTC.
- **Pacing (fixed here, after DESIRE-2's reads of 19 November).** One job runs at a time. Every large read or write waits until it is at least 90 seconds from any of her tick minutes (:05, :20, :35, :50). A server error is retried, at most six times, two minutes apart.
- **Where results go.** `amelia_qbist1_runs` only. Her live record was read once, for the starting copy.
- **The machinery.** Its hashes are in `MACHINERY_SHA256.txt`.
- **Faults.** A fault in running is reported, not repaired after seeing data.
