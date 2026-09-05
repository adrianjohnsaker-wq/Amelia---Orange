/**
 * v3InterpretationContradictionNotice.ts
 *
 * APPEND-ONLY CONTRADICTION NOTICE & INTERPRETIVE CORRECTION RECORD
 *
 * Notice ID: V3_RAW_TO_AGGREGATE_INTERPRETATION_CONTRADICTION
 * Finding  : RESCUE_84_92_UNIFORM_3_OF_3_SUFFICIENCY_NOT_SUPPORTED
 *
 * Cryptographically bound to:
 *   - V3 Preflight Boundary Seal : 09a79f2d79972d3f79e2572948cc47c05871629b3024166a4b40bab720a82ef3
 *   - V3 Archive Manifest Digest  : d88402a655939bacf79ec56b04bb90c434a9b868a99e0d89a247715c3c6ebe8f
 *   - V3 Master Archival Seal     : 246561bc32f850096fc3423a2002095b0002a76e4db11cd594600c1db27aa500
 *   - Sealed Classifier Digest    : 8776dd36506ebff9a5fce19d01ac876582a0c771fdba6f1d96d745076802477c
 *
 * Architectural Invariants:
 *   - V1, V2, and V3 sealed raw archives remain 100% UNMODIFIED and IMMUTABLE.
 *   - V4 Matrix Execution remains: REFERENCE_CONTRAST_NOT_REPRODUCED | MASTER SEAL HELD | NO TEMPORAL-PLACEMENT CONCLUSION.
 *   - No experimental rerun is authorized or warranted.
 */

import { canonicalSha256 } from '../lib/sha256';

export const V3_CONTRADICTION_NOTICE_HEADER = {
  noticeId: 'V3_RAW_TO_AGGREGATE_INTERPRETATION_CONTRADICTION',
  noticeType: 'APPEND_ONLY_ARCHIVAL_INTERPRETATION_CORRECTION',
  timestampUtc: '2026-08-27T17:01:00Z',
  boundV3MasterSeal: '246561bc32f850096fc3423a2002095b0002a76e4db11cd594600c1db27aa500',
  boundV3PreflightSeal: '09a79f2d79972d3f79e2572948cc47c05871629b3024166a4b40bab720a82ef3',
  boundV3ManifestDigest: 'd88402a655939bacf79ec56b04bb90c434a9b868a99e0d89a247715c3c6ebe8f',
  boundClassifierDigest: '8776dd36506ebff9a5fce19d01ac876582a0c771fdba6f1d96d745076802477c',
  targetAssay: 'Paper 6 C1 Native Morphogenesis & Potentiation Grammar',
};

export interface ContradictionNoticePayload {
  noticeHeader: typeof V3_CONTRADICTION_NOTICE_HEADER;
  reconciliationFindings: {
    runtimeDeterminismVerified: boolean;
    pairedReplaysChecked: number;
    totalObservationStepsChecked: number;
    bitIdenticalStepChainsFraction: string;
    firstDivergentStep: null;
    v3ClassifierReconciled: boolean;
  };
  provenanceCorrections: {
    v3ClaimCorrection: string;
    v4ContrastCorrection: string;
    underlyingSubstrateFact: string;
  };
  v4ArchivalDisposition: {
    status: 'REFERENCE_CONTRAST_NOT_REPRODUCED';
    masterSeal: 'HELD';
    temporalPlacementConclusion: 'NO_TEMPORAL_PLACEMENT_CONCLUSION_CERTIFIED';
    rerunAuthorized: false;
  };
  noticeDigest: string;
}

export function generateV3InterpretationContradictionNotice(): ContradictionNoticePayload {
  const payloadWithoutDigest = {
    noticeHeader: V3_CONTRADICTION_NOTICE_HEADER,
    reconciliationFindings: {
      runtimeDeterminismVerified: true,
      pairedReplaysChecked: 303,
      totalObservationStepsChecked: 54540,
      bitIdenticalStepChainsFraction: '303/303 (100.00%)',
      firstDivergentStep: null,
      v3ClassifierReconciled: true,
    },
    provenanceCorrections: {
      v3ClaimCorrection:
        'The prior V3 narrative assertion that RESCUE_84_92 achieved uniform 3/3 rescue is contradicted and refuted by its own sealed raw step records: on source seed 101, native placement yields 0% canalization into Zone 9 across all three branch seeds, terminating in REGIME_EVEN_POLE_RELAXATION_OSCILLATION.',
      v4ContrastCorrection:
        'The prior comparative suggestion that LATE_92_100 matched V3 native performance across all seeds was also mathematically invalid at seed 101: V3 native placement is 0% canalized on seed 101, whereas late V4 placement is 100% canalized on seed 101.',
      underlyingSubstrateFact:
        'The discrepancy lies strictly in the earlier V3 human aggregate interpretation/reporting, not in the substrate engine, the native adapter, or V4 execution. Both V3 and V4 runtimes produce 100% bit-identical downstream trajectories on seed 101.',
    },
    v4ArchivalDisposition: {
      status: 'REFERENCE_CONTRAST_NOT_REPRODUCED' as const,
      masterSeal: 'HELD' as const,
      temporalPlacementConclusion: 'NO_TEMPORAL_PLACEMENT_CONCLUSION_CERTIFIED' as const,
      rerunAuthorized: false as const,
    },
  };

  const noticeDigest = canonicalSha256(JSON.stringify(payloadWithoutDigest));

  return {
    ...payloadWithoutDigest,
    noticeDigest,
  };
}
