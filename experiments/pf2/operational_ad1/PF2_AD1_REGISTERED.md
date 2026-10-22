# PF-2 Operational Addendum AD1 — prospective live journal serialization correction

**Issued:** 22 October 2026 after failed first real admission, before any admitted PF-2 observation.
**Authorisation:** Operator's 22 October 2026 19:29 UTC approval of PF-2 genesis and live admission, followed by instruction at 20:35 UTC to complete the authorised deployment. This is a disclosed *engineering/provenance-only* correction. It does **not** amend scientific receiver, predictions, BLS selection, mapping, encounter rule or outcome readouts.

## Recorded facts (not prospective predictions)

- Actual operator-approved genesis remains immutable: R0 **33298740**, first release **2026-10-22T20:06:24Z**, single genuine RFC3161 genesis digest **6edb50ea3bdb6595cac20399c06142506ec1f35b8079fb556850eb20ca48b723**.
- Four uploaded normative sources and all goldens remain byte-identical. All 18 zero-memory receivers started with no live data.
- The first real live workflow, **39850485299**, refused to acquire shared PF1 lease because terminated PF1 run **39673407071-1** was unresolved. No PF2 fetch/admission occurred.
- A separately audited reconciliation, workflow **39851130161**, verified the terminated PF1 owner run had failed, PF1's complete signed data prefix through tick **1137** and head `29aa26f3da1e9a822f097f006ccdbde63638db06c12b740f780ec2cf3df884e1` were intact, and its rejected third batch was never durably committed. The original C1-native completion record was created for precisely that abandoned lease, and **no scientific PF1/C1 file changed**.
- The second live run **39851244654** successfully acquired the shared lease and verified a genuine 20-round Quicknet candidate inbox. The receiver processed it and the original batch seal staged evidence, but the **original Python integrity verifier failed at tick zero** with `AssertionError: PF2_CHAIN_TICK_0`.
- The original fail-closed mechanism discarded all noncommitted candidate batch evidence, committed a PF2-only HALT at tick **0** with head still equal to genesis digest, and completed its shared lease. Therefore **zero PF-2 observations existed at the point of this amendment**. The rejected attempt is not a scientific cohort.

## Root cause: different byte serializations of the *same event*

V1 `PF2_LIVE_RUN.mjs` hashed the event with JavaScript's insertion-ordered `JSON.stringify`. V1 `PF2_LIVE_SEAL.py` persisted the very same nested scientific content as `json.dumps(sort_keys=True)`. V1 `PF2_LIVE_CHECK.py` read the stored file and verified `sha256(json.dumps(row_without_digest,separators=(',',':'),ensure_ascii=False))`, now sorted by key from the archive. The SHA256 inputs were different byte strings: **the hash format disagreed, the numerical receiver data did not**.

The original verifier correctly refused the mismatched digest. It must not be disabled or made permissive.

## Prospective AD1 correction (zero admitted ticks before application)

- Leave original **receiver.mjs**, goldens, `PF2_RECEIVER_CORE.mjs`, `PF2_LIVE_RUN.mjs`, `PF2_LIVE_SEAL.py`, `PF2_LIVE_CHECK.py`, the actual signed genesis, and all canonical/PF1/C1 source **byte-identical**.
- Before calling the **original** `PF2_LIVE_SEAL.py` on each newly staged but not yet accepted 1–20 round batch, invoke `PF2_CANONICAL_CHAIN_AD1.py`: verify the complete input and original V1 hash chain, independently preserve all 18 scientific event payloads and Pandemonium scanner records unchanged, replace **only** row `previous`/`digest` and next-state `headDigest` with SHA256 over **UTF-8 JSON sorted recursively by property key** (Python `sort_keys=True`, minified separators, `ensure_ascii=False`, no NaN). Recheck that the fully persisted, key-sorted archive has identical hashes.
- The stage-to-seal adapter is `PF2_A1_CATCHUP_AD1.py`; it is the signed original A1 orchestrator plus the single canonicalization invocation immediately before the **unchanged original external RFC3161 batch seal and read-only original verifier**. No old sealed/published batch is ever edited. Deterministic replays still compare every individual transition and final receiver state.
- Original source `.github/workflows/pf2-live-observe.yml` is transparently superseded and **disabled** (no schedule, its job disabled) to avoid mistakenly scheduling the V1 digest protocol. Its original genesis-pinned SHA256 `9461fcc92de207279aac6444b7e83a7184f588ed1c2a90af7ac3becbc97bcd1d` remains in the original genesis; the new disabled-workflow SHA256 is pinned in AD1.
- New `.github/workflows/pf2-live-observe-ad1.yml` runs the signed V2 operational adapter with **the same PF1 shared Actions concurrency and C1 remote lease**. **No new scientific mechanism, random mapping, readout, null, prediction, cadence or input window**.
- After AD1 signed token passes independent verification and original zero-tick halt/source evidence is checked, administrative recovery must clear only `PF2_LIVE_RUNTIME_STATUS_V1.status/openHalt`, retaining the prior halt verbatim in a new create-only recovery receipt; **no** tick/head/engine/Pandemonium state may change.
- Archive this document, the new adapter, runner, disabled original workflow, replacement operational workflow, and recovery procedure SHA256 with **one independent RFC3161 token before any new admission**. Retain the original one-token signed scientific genesis permanently, unmodified.
- Day30 P2-1/P2-2 at **exactly 43,200 admitted verified ticks**, sparse P2-2 extension to 86,400 as registered. Zero interim hypothesis tests or thresholds changed; weekly reports remain journal-only.
- **No notifications** of any kind; no email, push, chat messages or encounter alarms. All failure, correction, new hashes, seals, release, and weekly status are committed to PF2 logs.

## Nonnegotiable gates

1. Constructed two-row JSON key-order fixture: original serialized digest disagrees with archived sorted digest; corrected version passes the untouched original hash rule, preserves event/encounter payload and normalizes correct next head.
2. At recovery: accepted PF2 ticks exactly **0**, head equal to original genesis, last round absent, no committed chunk, 18 receiver memories exactly as signed genesis and original HALT remains readable.
3. Original 4×20,000 GOLD digests and all 18 restart/replay checks unchanged. Original PF1/C1 identity pins intact.
4. Before every future batch: verify actual original genesis + this separately signed AD1 token; require remotely confirmed exclusive PF1 lease, genuine C1 BLS, original pre-seal scan and independent original post-seal verifier; sign each chunk before publish.
5. Any deviation halts without admission. No synthetic fallback or rewriting a published scientific record.
