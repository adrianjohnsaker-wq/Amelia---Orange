# PCI-1 registered outcome (2026-10-15)

Registration: [commit 6298e9f](https://github.com/adrianjohnsaker-wq/Amelia---Orange/commit/6298e9f11b901d0bef42889f236f0519f37941f0) — predictions fixed before execution.

Registration SHA-256: `23106c336c655c1c9965111d755bcef8760a18b2a933cf7e7efc563a8dca0d1d`

Corrected completed outcome: [GitHub Actions #38784428766](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/38784428766), execution commit `3c435cb4fa6d1bb5f6437b1177b39682ff69fa66`.

Raw observations SHA-256: `a05e3fd8c50953d6121c553152aab3d3e9cbb6576de8e776052bd5e8f0d9f5ac`

| Registered prediction | Passes | Observed range |
| --- | ---: | --- |
| P1 — retention vs reset activation L1 difference at next step, >1e-7 | 12/12 | 0.0814699610 – 0.1135569445 |
| P2 — H9 minus H0 Zone-9 activation, >1e-6 | 12/12 | 0.0271815008 |
| P3 — H0 minus H9 Zone-0 activation, >1e-6 | 12/12 | 0.0324864000 |
| P4 — sham vs reset activation max difference <=1e-12 | 12/12 | 0 |
| P5 — H9 vs H0 downstream field-B difference >1e-7 | 12/12 | 0.0003151650 – 0.0009597741 |

**Verdict: SUPPORTED under the registered all-pairs deterministic software criterion.**

The primary and rerun raw JSONL files and verdict files were byte-identical; SHA-256 manifests verified. This repeated execution is a reproducibility check, not an independent replication.

**Limitations:** Only 7 distinct starting-state fingerprints among 12 deterministic tapes. Zero observed differences in discrete exit selection at steps 1 and 8, despite continuous activation and field differences. Engineered H0/H9 history interventions do not prove autonomous, naturally formed memory guidance. No independent stochastic replication, statistical significance claim, emergent autonomy, consciousness inference, or evidence of the metaphysical Outside.

**Workflow incident:** Initial run [#38784127428](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/38784127428) generated matching complete primary and repeat outputs, but was flagged unsuccessful because the replay log path was absent before `tee`. See [Incident 001](./INCIDENT_001.md). The workflow-only repair did not alter the registered predictions or outcome runner; the raw output digest was identical before and after repair.

**Audit materials:** The successful GitHub Actions run provides the registration copy, all 12 raw paired records, two verdict files, run logs, registration-ancestry proof, provenance and checksums. Artifacts are subject to retention limits; archive the complete raw set under a persistent public accession before manuscript submission.

**Reproduction:** `npx tsx src/bridge/runPCI1ProspectiveCli.ts --out pci1-results/local`. Recomputed provenance timestamps differ by design.
