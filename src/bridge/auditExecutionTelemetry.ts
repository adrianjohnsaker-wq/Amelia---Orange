import {
  runNullControlAssay,
  runSensitivitySweep,
  toMarkdownTable,
  sensitivityToMarkdownTable,
} from './pfm-null-control-assay';
import { LiveAmeliaSubstrateAdapter } from './AmeliaSubstrateAdapterImpl';
import fs from 'fs';

class InstrumentedAdapter extends LiveAmeliaSubstrateAdapter {
  public conditionLineageCalls = 0;
  public computeReturnCalls = 0;
  public distanceCalls = 0;
  public governorEntropyCalls = 0;
  public baselineCalls = 0;

  public async conditionLineage(seed: number, depth: number, params: any) {
    this.conditionLineageCalls++;
    return super.conditionLineage(seed, depth, params);
  }

  public async computeReturn(obs: any, pfm: any) {
    this.computeReturnCalls++;
    return super.computeReturn(obs, pfm);
  }

  public distance(a: any, b: any) {
    this.distanceCalls++;
    return super.distance(a, b);
  }

  public async governorEntropy(obs: any, pfm: any) {
    this.governorEntropyCalls++;
    return super.governorEntropy(obs, pfm);
  }

  public async canonicalBaselineTensor() {
    this.baselineCalls++;
    return super.canonicalBaselineTensor();
  }
}

async function verifyAudit() {
  const adapter = new InstrumentedAdapter();
  const depths = [128, 256, 384, 432, 480, 512];

  console.log("Starting instrumented run...");
  const t1 = await runNullControlAssay(adapter, depths, { eta: 0.05, kappa: 0.25 });
  const t1Compute = adapter.computeReturnCalls;
  const t1Dist = adapter.distanceCalls;
  const t1Entropy = adapter.governorEntropyCalls;

  const t2 = await runSensitivitySweep(adapter, depths);
  const totalCompute = adapter.computeReturnCalls;
  const totalDist = adapter.distanceCalls;
  const totalEntropy = adapter.governorEntropyCalls;

  const auditReport = {
    nullControl: {
      expectedCells: 24, // 6 depths * 4 conditions
      pairwisePairsPerCell: 3, // (101, 202), (101, 303), (202, 303)
      computeReturnInvocations: t1Compute, // 24 * 3 * 2 = 144
      distanceInvocations: t1Dist, // 24 * 3 = 72
      governorEntropyInvocations: t1Entropy, // 24 * 3 * 2 = 144
    },
    sensitivitySweep: {
      expectedCells: 72, // 4 etas * 3 kappas * 6 depths (NATURAL)
      computeReturnInvocations: totalCompute - t1Compute, // 72 * 3 * 2 = 432
      distanceInvocations: totalDist - t1Dist, // 72 * 3 = 216
      governorEntropyInvocations: totalEntropy - t1Entropy, // 72 * 3 * 2 = 432
    },
    totalSubstrateInvocations: {
      computeReturn: totalCompute, // 144 + 432 = 576
      distance: totalDist, // 72 + 216 = 288
      governorEntropy: totalEntropy, // 144 + 432 = 576
    }
  };

  fs.writeFileSync('./assay_telemetry_audit.json', JSON.stringify(auditReport, null, 2));
  console.log("Telemetry audit written:", auditReport);
}

verifyAudit();
