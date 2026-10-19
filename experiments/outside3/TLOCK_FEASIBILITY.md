# OUTSIDE-3 Stage 1 — synthetic quicknet feasibility

**Gate outcome: PASS (software demonstration).**

**GitHub Actions:** https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39304200180

**Artifact:** https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39304200180/artifacts/12212599077

**Source commit:** `7bad1e09ab4068fbb70404f89e026ce3bb69447e`

**Quicknet chain:** `52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971`

**Round:** 33210811.

**Libraries:** Go drand/tlock `tle v1.2.0` and TypeScript `tlock-js v0.9.0`, with pinned Quicknet chain hash/public key.

**Payload commitment (SHA-256 of canonical synthetic salted payload bytes):**
`82de99e6216831d0807570b38b6b0969b0b5db61a47a8dce88e3b6b3e7a3d81c`

### Demonstrated

- Go and TypeScript ciphertext creation used a deliberately **SYNTHETIC_ONLY** randomly generated demonstration index with a transient 32-byte salt.
- Decryption attempts before the registered future Quicknet round failed.
- After Quicknet reveal, Go decrypted the Go ciphertext and verified the salted payload commitment.
- Go-generated ciphertext decrypted in the TypeScript implementation and TypeScript-generated ciphertext decrypted in Go.
- The two publicly archived armored ciphertexts have independent SHA-256 checksums, both checked against the artifact manifest.
- The artifact contains only ciphertexts, feasibility outcomes and checksums, with no target-index plaintext or salt.
- The plaintext existed transiently in an isolated runner tmpfs during encryption, and was removed before the wait. This is operational confidentiality evidence, not a proof that no infrastructure actor could have observed it.

### Ciphertext SHA-256

- Go: `df1fd5f3f23734da279be823e20991631b57aa46d4172bf887bed999b9762a81`
- TypeScript: `fbbecb1388bcaa0f5a32000a70225085f48297b0110d0b9fc44477cfe8099d07`

### Incident history

Earlier synthetic attempts [#39302523062](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39302523062) and [#39303054704](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39303054704) failed in the pinned Go CLI due to absence of its explicit encryption flag `-e`. A corrected first full-cycle test [#39303296101](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39303296101) succeeded. The artifact-complete final test above independently succeeded on a fresh synthetic payload and round.

### Stage restrictions

**No real target generated. No real working opened. OUTSIDE-3 registration remains closed.**

Successful technical feasibility does not establish access to a hidden target, cryptographic immunity to malicious infrastructure, or a scientific experimental result.
