# PF4 — Author's inscription, exact input validation, and sealed custody
**24 October 2026. Design record only; no inscription code has been generated, sealed, or exposed to future beacons.**

## I. The punctuation correction is accepted, no V1 alteration

The existing frozen source `experiments/pf4/PF4_SIGIL_V1.py`, method version `PF4-SIGIL-V1`, rejects non-ASCII input and then retains only the **first occurrence of each uppercase ASCII letter A..Z**, removing every space, numeral and punctuation mark. That logic was publicly committed before the author supplied the statement.

For the author's subsequently supplied sentence, canonicalise the *terminal input* only as follows: **omit the surrounding typographic quotation marks, replace each em dash U+2014 with exactly two ASCII hyphen-minus bytes `--`, and preserve all other letters and punctuation exactly.** Do not introduce a newline within the statement; terminal Enter is not part of the `getpass` string. This typing instruction is not a change to the frozen algorithm.

A private, independent source-compatible check of the supplied wording showed:
- The canonical terminal input contains **207 printable ASCII characters**.
- It reduces to **21 distinct uppercase ASCII letters**.
- Replacing the two em dashes with `--`, `-` or the empty string yields the same reduced letters, same `SHA256("AMELIA-PF4-SIGIL-V1" || NUL || sigil)` and same complete synthetic training input domain.
- Only the separate `PF4-RAW-STATEMENT-V1` hash of the raw terminal text changes between those punctuational renderings. **It is NOT used for the 30-pass code construction.**
- The statement and 21-letter reduced sequence are **deliberately omitted here**; no hashes identifying the string or derived seed are published in this design record.

**Status:** typing method validated; **no 30-pass run has been invoked**. Generating a code now without an approved encryption/custody and future-round deadline would create a plaintext result that could be inspected early, violating the intended blindness.

## II. Timing and a concrete cryptographic custody method

A viable option for the four-window 'seal and forget' experiment is [drand tlock](https://github.com/drand/tlock), which provides encryption decryptable after a specified **future Quicknet round** is published. The official `tle` supports `-c <chain hash> -r <round> -o <ciphertext> <plaintext>` and is compatible with the **unchained quicknet chain** `52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971`. The tool, version, executable hash, round and ciphertext hash must be pinned and independently audited before the one-time actual inscription run.

Proposed **procedural order**:
1. Complete full G3 400-world calibration and G2 operator-package verification. Calibrate the candidate robust statistic on the entire disjoint calibration and physically published control periods. Keep the existing Vstar as primary; the inscription candidate as a distinct multiplicity-controlled secondary.
2. Freeze and externally timestamp the *complete four-window schedule*, 9-arm input mapping, exact 14-day per-window tick count, generator and scoring code, source authenticity policy and all null procedures **before the first target beacon becomes public**.
3. Select a future **unlock Quicknet round strictly AFTER all four test windows finish**, with an explicit safety buffer. A *duration* without exact round is not suitable for a final registered record.
4. Independently commit the author statement's allowed ASCII spelling once to a controlled terminal. Run the unchanged `PF4_SIGIL_V1.py` once on an audited ephemeral host, without printing plaintext code or SIGIL.
5. Immediately encrypt the candidate code *and derivation audit* to the pinned tlock round using `tle`. Archive only ciphertext and public SHA-256 commitment of plaintext/ciphertext with third-party timestamp receipt. The system must record any temporary-plaintext custody exposure and independent oversight. Avoid writing plaintext to a persistent shared GitHub branch or ordinary Actions artifact.
6. Verify ciphertext's target chain hash / unlock round from the tlock header, verify the external timestamp preceded the first test round, and review the plaintext exposure/audit trail.
7. The precommitted physical source may be independently verified and archived throughout the four windows, **but neither the candidate code nor scored outcomes are inspected**. After the unlock round appears, decrypt, check candidate SHA, verify all four beacon windows/signature receipts and execute the previously pinned offline scoring code exactly once.
8. Report all controls, nonconvergences, failed verifications, and adverse results unchanged. An anomalous result would indicate unexplained prospective correlation, not by itself prove information transmitted backwards through time.

### Important limitations

- A SHA-256 file commitment is **not** encryption or an independent temporal seal.
- tlock's secrecy is **computational and conditional** on the security of the Quicknet network and its threshold key; sufficient key shares could disclose the future unlock information early.
- Even if only ciphertext survives, a participant who already knows the exact statement and publicly frozen deterministic method can **independently reconstruct the code**. Thus tlock protects the archived plaintext against passive disclosure, **not against voluntary re-computation** by someone who knows both inputs. For rigorous blindness, use role separation, a statement custodian who does not run the code, and a clean offline execution host; log violations. A private precommitted salt/secret would change the originally frozen V1 mapping and must **not** be inserted retrospectively.
- The future boundary must be specified independently of the experimental target outcome; no changing the unlocking round after seeing any of the four windows.
- **No unlock round is yet chosen, no independent seal exists, and no derived code is yet generated.**

## III. The candidate primary statistic

The original whole-code infinity residual is `R_inf=max_{k,e}|Vend[k,e]-Vstart[k,e]|`, which can be dominated by one rare death. Candidate smoother measure:

`R_mean_active=(1/90) sum_{k=0..8} sum_{e in E_active} |Vend[k,e]-Vstart[k,e]|`
where `E_active` is the ten frozen canonical edges other than dormant `3>6` (11 total − 1 dormant = 10; **fixed before prospective scoring**, not selected per world).

Define paired advantage for each independently published 14-day window `B`:
`A_mean(B)=R_mean_active(C_shift,B)-R_mean_active(C_vstar,B)`.

This measure is only a **candidate**. It must be reported alongside `R_inf`, per-lineage fatality and brink-access measures; false-positive control requires the full pairing across Vstar/shift and *four-window tuple* null distribution, not separate uncorrected one-window significance tests. Compared codes must have identically mapped input opportunities.

The operator reports for the earlier paired `R_inf` comparison: mean advantage 0.007; standard deviation 0.092; Vstar smaller in 53.5% of 400 synthetic worlds; reported `p<0.01` four-window mean threshold ~0.137. These numbers are currently **operator-reported, not independently audited** from a supplied 900-row package. They are not inferential confirmation or yet-frozen thresholds.

**Require raw per-lineage/edge terminal V values** to compute `R_mean_active` exactly. The reported CSV's **maxima per edge** are insufficient to reconstruct the mean of 90 absolute differences. Do not substitute the mean of 10 edge maxima and call it the same statistic.

## IV. Remaining before any future-world test

At time of this draft, the operator's `claude/pf4_calibration/` files and calibration zip were **not accessible** on the connected repository's main/design branches or as attached files. The independently reproduced seed 1000 shows exact three-condition spot equality; independent G2 matches 99/99 V doubles on the 1731-tick published historical prefix; a brief G3a source-cue diagnostic found a high-tail aggregate chi-square. That is insufficient to seal the full four-window G3 null.

**Decision:** accept the punctuation equivalence, preserve V1 byte-for-byte, keep the one-time code *ungenerated* until audited time-lock/custody and future schedule are ready, and prioritise the completed 400-world raw calibration and a disjoint published-source residual check. Do not touch PF1, PF2 or C1.
