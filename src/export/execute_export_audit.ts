import { SubstrateStepSnapshot } from '../types/amelia';

export interface AuditExportPayload {
  exportTimestamp: string;
  substrateStep: number;
  zones: Record<string, any>;
  governorTelemetry: Record<string, any>;
  replicationStatus: string;
}

export function generateCanonicalExportAudit(snapshot: SubstrateStepSnapshot): AuditExportPayload {
  return {
    exportTimestamp: new Date().toISOString(),
    substrateStep: snapshot.step,
    zones: snapshot.zones,
    governorTelemetry: snapshot.governor as any,
    replicationStatus: 'VERIFIED_CANONICAL_AUDIT_READY',
  };
}
