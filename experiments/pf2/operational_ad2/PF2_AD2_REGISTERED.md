# PF-2 Operational Addendum AD2 — pre-flight hash helper repair in the live workflow

**Issued:** 22 October 2026, after one-shot AD1 admission run 39854098920 failed in pre-flight; **zero PF-2 observations admitted**.
**Authorisation:** Operator's 22 October 2026 19:29 UTC approval of PF-2 genesis and live admission, and the operator's later instruction to "proceed and make this operational" after the AD2 proposal was put to them. This is a disclosed *engineering-only* correction. It does **not** amend the receiver, predictions, BLS selection, mapping, encounter rule, readouts, day-30 evaluation or notification policy.

## Recorded facts

- Signed genesis unchanged: R0 **33298740**, genesis digest **6edb50ea3bdb6595cac20399c06142506ec1f35b8079fb556850eb20ca48b723**. AD1 bundle and token unchanged (bundle SHA256 `03d888c92c40f3660378644531db3e5410f75be69bae672f41135fb4bf290d4c`).
- One-shot run **39854098920** (`pf2-ad1-first-live.yml`, 21:03 UTC) passed K0 and the first O1 identity block (`PF2_APPROVED_ACTUAL_R0_REGISTERED_SCIENTIFIC_IDENTITY_PASS`), then the second O1 Python block raised `NameError: name 'h' is not defined`. The helper `h` was defined only in the first heredoc. **No lease acquired, no BLS fetched, no state written.** `STATE.json` stays `running`, 0 ticks, head = genesis.
- The scheduled AD1 workflow `.github/workflows/pf2-live-observe-ad1.yml` (AD1-sealed SHA256 `156fe99cdb9ec9ede355970155e5767555b8d52456470ef60461c1f311474c2e`) contains the identical defect, so every scheduled AD1 run would fail at the same point.

## Prospective AD2 correction (zero admitted ticks before application)

- `pf2-live-observe-ad1.yml` and every other AD1- and genesis-pinned file stay **byte-identical**. No pin is exempted or relaxed.
- New additive workflow `.github/workflows/pf2-live-observe-ad2.yml` = the AD1 workflow plus:
  - the missing `hashlib` import and `h` definition in the second O1 block;
  - verification of this AD2 bundle's pins and of its independent RFC 3161 token, in addition to the full genesis and AD1 checks;
  - K0 no-op until the AD2 seal is archived;
  - schedule `13,28,43,58 * * * *`, offset from AD1's minutes, and no push trigger.
- The runner `PF2_A1_CATCHUP_AD1.py`, the PF-1 shared lease, the 20-round/480-tick limits, the per-batch RFC 3161 seals, the original verifier and the canonical rehash are all unchanged.
- The defective AD1 schedule should be disabled in the Actions UI. Until then its runs fail before any lease or fetch, and are recorded as operational noise rather than scientific events.

## Gates before the single AD2 token (`pf2-ad2-seal.yml`)

1. Genesis, AD1 and PF-1 pins verify in full. State is running, with 0 ticks, head = genesis, no chunks, and no prior AD2 receipt.
2. `PF2_AD2_PREFLIGHT_UNIT.py` statically reproduces the AD1 undefined `h` and shows no undefined names in AD2. It then runs, in a throwaway copy, the exact AD2 O1 blocks: the real genesis and AD1 tokens are verified offline, and a constructed AD2 bundle is checked with an offline stand-in. After that it runs two synthetic 20-round batches through RUN → AD1 canonical → SEAL → CHECK, plus the independent replay. No live inputs; nothing from the unit is committed.
3. One genuine FreeTSA RFC 3161 token over the AD2 bundle. The bundle pins this registration, the AD2 workflow, the unit, the seal workflow and the genesis bundle, and records the AD1 bundle SHA256. The C1-native `receipt.json` is archived as produced by `Sealer`; the informational receipt is a separate file.

Day-30 P2-1/P2-2 at exactly 43,200 admitted ticks, with the sparse P2-2 extension to 86,400, is unchanged. The weekly report stays journal-only. **No notifications of any kind.**
