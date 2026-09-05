/**
 * AmeliaThread3LiveBridge.ts
 *
 * Provides canonical bindings connecting the Live Amelia Substrate and
 * DurableCreateOnlyEvidenceArchive to the Thread 3 Encoding-Activation Specificity Assay (EASA_V1).
 */

import {
  CanonicalAmeliaLineageInstance,
  DurableCreateOnlyEvidenceArchive,
} from '../substrate/canonicalAmeliaRuntimeImpl';
import {
  LiveAmeliaBindings,
  makeLiveAmeliaBindings,
  createThread3BridgeDispatcher,
  runThread3EncodingAssay,
  auditThread3ChapterEncoding,
  formatChapterEncodingAudit,
  formatThread3Result,
  THREAD3_PILOT_CONFIG,
  THREAD3_FULL_CONFIG,
  Thread3AssayResult,
  CanonicalCycleInput,
  CreateOnlyRecord,
  ArchiveSeal,
} from './AmeliaThread3EncodingActivationAssay';
import { canonicalSha256 } from '../lib/sha256';
import { ZoneId } from '../types/amelia';
import { PFMEventRecord } from '../substrate/IntegratedMemorySystem';

export class AmeliaThread3LiveBridgeRunner {
  private lineages = new Map<string, CanonicalAmeliaLineageInstance>();
  private archive = new DurableCreateOnlyEvidenceArchive();

  private getOrRegisterLineage(sessionId: string, seed: number): CanonicalAmeliaLineageInstance {
    if (!this.lineages.has(sessionId)) {
      const inst = new CanonicalAmeliaLineageInstance(sessionId, seed);
      inst.hydrateDeepPFMHistory(128);
      this.lineages.set(sessionId, inst);
    }
    return this.lineages.get(sessionId)!;
  }

  /**
   * Canonical cycle implementation recognizing `encodingActivationV1`
   */
  public async runCycleWithBridge(input: CanonicalCycleInput): Promise<Record<string, unknown>> {
    const experiment = (input.context.experiment as Record<string, unknown>) || {};
    const seed = typeof experiment.seed === 'number' ? experiment.seed : 101;
    const lineage = this.getOrRegisterLineage(input.sessionId, seed);

    const pfmHeadBefore = lineage.memory.exportHistoryDigest();
    const encodingActivation = input.context.encodingActivationV1 as
      | {
          opaqueVector: number[];
          vectorDigest: string;
          sourceTermDigest: string;
          mappingDigest: string;
        }
      | undefined;
    const semanticScaffold = input.context.semanticScaffoldV1 as
      | {
          hint: string;
          noDirectZoneInstruction?: boolean;
        }
      | undefined;
    const memoryReinforcement = input.context.memoryReinforcementChannelV1 as
      | {
          tag: string;
          gain: number;
          isDirectZoneTargeting?: boolean;
        }
      | undefined;
    const teleoplepticHorizon = input.context.teleoplepticHorizonV1 as
      | {
          tag: string;
          gain: number;
          horizonTargetZone: number;
          horizonGradient?: number[];
          isNonSemantic?: boolean;
        }
      | undefined;

    // 1. Native Ingress: Modulate constitutive deformation tensor if opaque vector or teleopleptic horizon is present
    let applied = false;
    let ingressDigest = '';
    let nativeMutationDigest = '';

    if (encodingActivation && Array.isArray(encodingActivation.opaqueVector)) {
      const vec = encodingActivation.opaqueVector;
      const reinforcementGain = memoryReinforcement?.gain ?? 0;
      const horizonGain = teleoplepticHorizon?.gain ?? 0;
      const horizonZone = teleoplepticHorizon?.horizonTargetZone ?? 9;
      
      for (let r = 0; r < 10; r++) {
        const val = vec[r] || 0;
        // Non-directive reinforcement coupling to deformation tensor
        const rCoupling = reinforcementGain > 0 ? (val > 0 ? reinforcementGain * 0.05 : -reinforcementGain * 0.02) : 0;
        // Teleopleptic future-pull coupling toward horizon zone
        const hCoupling = horizonGain > 0 ? (r === horizonZone ? horizonGain * 0.15 : (r >= 7 ? horizonGain * 0.06 : -horizonGain * 0.02)) : 0;

        for (let c = 0; c < 10; c++) {
          lineage.deformationTensor[r][c] = Math.max(
            0.01,
            Math.min(1.0, lineage.deformationTensor[r][c] * 0.985 + Math.abs(val) * 0.08 + rCoupling + hCoupling)
          );
        }
      }
      applied = true;
      ingressDigest = canonicalSha256(
        JSON.stringify({
          vectorDigest: encodingActivation.vectorDigest,
          sessionId: input.sessionId,
          eventIndex: lineage.eventIndex,
          scaffoldPresent: !!semanticScaffold,
          reinforcementTag: memoryReinforcement?.tag ?? 'none',
          horizonTag: teleoplepticHorizon?.tag ?? 'none',
          horizonGain: teleoplepticHorizon?.gain ?? 0,
        })
      );
      nativeMutationDigest = canonicalSha256(
        JSON.stringify({
          tensorSlice: lineage.deformationTensor[0],
          eventIndex: lineage.eventIndex,
        })
      );
    }

    // 2. Governor evaluation
    const tel = lineage.governor.getTelemetry();
    let governorDisposition: 'ADMIT' | 'DEFER' | 'REFUSE' | 'ABSTAIN' = 'ADMIT';
    if (tel.hardLimitViolationCount > 0) governorDisposition = 'REFUSE';
    else if (tel.antiLockIntegrity < 80.0) governorDisposition = 'DEFER';
    else if (tel.deformationFieldTension > 0.95) governorDisposition = 'ABSTAIN';

    const governorDecisionDigest = canonicalSha256(
      JSON.stringify({
        sessionId: input.sessionId,
        eventIndex: lineage.eventIndex,
        disposition: governorDisposition,
        antiLock: tel.antiLockIntegrity,
      })
    );

    // 3. Native selectExit via Qabbala gates + memory bias
    const openGates = lineage.qabbala.getGates().filter((g) => g.isOpen);
    const curZ = lineage.currentZone;
    const candidateGates = openGates.filter((g) => g.source === curZ || g.target === curZ);
    const memBias = lineage.memory.readMemoryBias();
    const zones = lineage.qabbala.getZones();
    const phaseAngles = Object.values(zones).map((z: any) => z.phaseAngle || 0);

    let chosenExit = curZ;
    let maxScore = -Infinity;

    for (const gate of candidateGates) {
      const targetZ = gate.source === curZ ? gate.target : gate.source;
      const bias = memBias.biasVector[targetZ] || 0;
      // If opaque vector was injected, also couple vector influence
      const encodingBias = encodingActivation?.opaqueVector?.[targetZ] || 0;
      const phaseAlignment = Math.cos(phaseAngles[targetZ] || 0);
      const score =
        gate.flux * (1 - gate.resistance) +
        bias * 0.35 +
        encodingBias * 0.25 +
        phaseAlignment * 0.15;
      if (score > maxScore) {
        maxScore = score;
        chosenExit = targetZ;
      }
    }

    // 4. Native updatePCM
    lineage.eventIndex++;
    lineage.currentZone = chosenExit;
    lineage.zoneVisitCounts[chosenExit]++;

    const newRecord: PFMEventRecord = {
      blockIndex: lineage.eventIndex,
      depth: lineage.eventIndex,
      targetZone: chosenExit as ZoneId,
      fluxDelta: 0.08,
      phaseCoherence: 0.89,
      strainRelaxation: 0.02,
      seed: lineage.seed,
      eventDigest: canonicalSha256(`easa:${lineage.lineageId}:${lineage.eventIndex}:${chosenExit}`),
      timestamp: Date.now(),
    };
    lineage.memory.append(newRecord);

    const pfmHeadAfter = lineage.memory.exportHistoryDigest();
    const selectedExitDigest = canonicalSha256(`exit:${input.sessionId}:${lineage.eventIndex}:${chosenExit}`);
    const transitionReceiptDigest = canonicalSha256(
      JSON.stringify({
        selectedExitDigest,
        pfmHeadAfter,
        eventRecordDigest: newRecord.eventDigest,
      })
    );

    const receipt: Record<string, unknown> = {
      sessionId: input.sessionId,
      currentZone: chosenExit,
      selectedExitDigest,
      transitionReceiptDigest,
      pfmHeadDigest: pfmHeadAfter,
      governorDisposition,
      governorDecisionDigest,
      fieldConfidence: 0.92,
      phaseCoordinate: [chosenExit / 9, lineage.deformationTensor[chosenExit][chosenExit]],
    };

    if (encodingActivation) {
      receipt.encodingActivationReceipt = {
        applied,
        vectorDigest: encodingActivation.vectorDigest,
        ingressDigest,
        nativeMutationDigest,
        pfmHeadBefore,
        pfmHeadAfter,
      };
    }

    return receipt;
  }

  /**
   * Create-only archival sealing
   */
  public async sealIntoCanonicalCreateOnlyArchive(record: CreateOnlyRecord): Promise<ArchiveSeal> {
    const rawRecord: any = {
      recordId: record.recordId,
      protocolId: "AMELIA_CANONICAL_ARCHIVE_V1",
      runId: record.recordId,
      chronologyIndex: 0,
      lineageId: "canonical-lineage",
      kind: record.kind,
      payload: record.payload,
      canonicalPayload: record.canonicalPayload,
      payloadDigest: record.payloadDigest,
    };
    const receipt = await this.archive.appendCreateOnly(rawRecord);
    return {
      archiveRecordId: receipt.recordId,
      archiveHeadDigest: receipt.archiveHeadDigest,
    };
  }

  public getBindings(): LiveAmeliaBindings {
    return makeLiveAmeliaBindings(
      (input) => this.runCycleWithBridge(input),
      (record) => this.sealIntoCanonicalCreateOnlyArchive(record)
    );
  }
}

import {
  Thread3RProtocolConfig,
  Thread3RAssayResult,
  THREAD3R_PILOT_CONFIG,
  THREAD3R_FULL_CONFIG,
  runThread3RAssay,
  formatThread3RResult,
} from './AmeliaThread3RWeakSemanticReinforcementAssay';
import { createThread3RBridgeDispatcher } from './AmeliaThread3RDispatcher';
import {
  Thread4AssayResult,
  THREAD4_PILOT_CONFIG,
  THREAD4_FULL_CONFIG,
  runThread4Assay,
  formatThread4Result,
} from './AmeliaThread4TeleoplepticHorizonAssay';
import { createThread4BridgeDispatcher } from './AmeliaThread4Dispatcher';
import {
  Thread4AGainSweepResult,
  THREAD4A_PILOT_CONFIG,
  THREAD4A_FULL_CONFIG,
  runThread4AGainSweepAssay,
  formatThread4AResult,
} from './AmeliaThread4AGainSweepAssay';
import { createThread4ABridgeDispatcher } from './AmeliaThread4ADispatcher';
import {
  Thread5AssayResult,
  THREAD5_PILOT_CONFIG,
  THREAD5_FULL_CONFIG,
  runThread5SemanticInteractionAssay,
  formatThread5Result,
} from './AmeliaThread5SemanticInteractionAssay';
import { createThread5BridgeDispatcher } from './AmeliaThread5Dispatcher';
import {
  Thread5BAssayResult,
  THREAD5B_PILOT_CONFIG,
  THREAD5B_FULL_CONFIG,
  runThread5BPhaseShiftAssay,
  formatThread5BResult,
} from './AmeliaThread5BPhaseShiftAssay';
import { createThread5BBridgeDispatcher } from './AmeliaThread5BDispatcher';
import {
  Thread6AssayResult,
  THREAD6_PILOT_CONFIG,
  THREAD6_FULL_CONFIG,
  runThread6HysteresisAssay,
  formatThread6Result,
} from './AmeliaThread6HysteresisAssay';
import { createThread6BridgeDispatcher } from './AmeliaThread6Dispatcher';
import {
  Thread7AssayResult,
  THREAD7_PILOT_CONFIG,
  THREAD7_FULL_CONFIG,
  runThread7StressAssay,
  formatThread7Result,
} from './AmeliaThread7StressAssay';
import { createThread7BridgeDispatcher } from './AmeliaThread7Dispatcher';
import {
  Thread8AssayResult,
  THREAD8_PILOT_CONFIG,
  THREAD8_FULL_CONFIG,
  runThread8DevelopmentalAssay,
  formatThread8Result,
} from './AmeliaThread8DevelopmentalAssay';
import { createThread8BridgeDispatcher } from './AmeliaThread8Dispatcher';
import {
  Thread9AssayResult,
  THREAD9_PILOT_CONFIG,
  THREAD9_FULL_CONFIG,
  runThread9ConsolidationAssay,
  formatThread9Result,
} from './AmeliaThread9ConsolidationAssay';
import { createThread9BridgeDispatcher } from './AmeliaThread9Dispatcher';
import {
  Thread9BAssayResult,
  THREAD9B_PILOT_CONFIG,
  THREAD9B_FULL_CONFIG,
  runThread9BLongevityAssay,
  formatThread9BResult,
} from './AmeliaThread9BLongevityAssay';
import { createThread9BBridgeDispatcher } from './AmeliaThread9BDispatcher';
import {
  Thread10AssayResult,
  THREAD10_PILOT_CONFIG,
  THREAD10_FULL_CONFIG,
  runThread10FunctionalPerturbationAssay,
  formatThread10Result,
} from './AmeliaThread10FunctionalPerturbationAssay';
import { createThread10BridgeDispatcher } from './AmeliaThread10Dispatcher';
import {
  Thread11AssayResult,
  THREAD11_PILOT_CONFIG,
  THREAD11_FULL_CONFIG,
  runThread11MinimalReinductionAssay,
  formatThread11Result,
} from './AmeliaThread11MinimalReinductionAssay';
import { createThread11BridgeDispatcher } from './AmeliaThread11Dispatcher';
import {
  Thread12AssayResult,
  THREAD12_PILOT_CONFIG,
  THREAD12_FULL_CONFIG,
  runThread12ControlledFunctionalIntegrationAssay,
  formatThread12Result,
} from './AmeliaThread12ControlledFunctionalIntegrationAssay';
import { createThread12BridgeDispatcher } from './AmeliaThread12Dispatcher';
import {
  Thread13AssayResult,
  THREAD13_PILOT_CONFIG,
  THREAD13_FULL_CONFIG,
  runThread13AutonomousModeSelectionAssay,
  formatThread13Result,
} from './AmeliaThread13AutonomousModeSelectionAssay';
import { createThread13BridgeDispatcher } from './AmeliaThread13Dispatcher';
import {
  Thread14AssayResult,
  THREAD14_PILOT_CONFIG,
  THREAD14_FULL_CONFIG,
  runThread14ContextualReframingAssay,
  formatThread14Result,
} from './AmeliaThread14ContextualReframingAssay';
import { createThread14BridgeDispatcher } from './AmeliaThread14Dispatcher';

export function createCanonicalThread3Runner(): {
  dispatcher: (command: string) => Promise<string>;
  runPilot: () => Promise<Thread3AssayResult>;
  runFull: () => Promise<Thread3AssayResult>;
  runAudit: () => ReturnType<typeof auditThread3ChapterEncoding>;
  runThread3RPilot: () => Promise<Thread3RAssayResult>;
  runThread3RFull: () => Promise<Thread3RAssayResult>;
  runThread4Pilot: () => Promise<Thread4AssayResult>;
  runThread4Full: () => Promise<Thread4AssayResult>;
  runThread4APilot: () => Promise<Thread4AGainSweepResult>;
  runThread4AFull: () => Promise<Thread4AGainSweepResult>;
  runThread5Pilot: () => Promise<Thread5AssayResult>;
  runThread5Full: () => Promise<Thread5AssayResult>;
  runThread5BPilot: () => Promise<Thread5BAssayResult>;
  runThread5BFull: () => Promise<Thread5BAssayResult>;
  runThread6Pilot: () => Promise<Thread6AssayResult>;
  runThread6Full: () => Promise<Thread6AssayResult>;
  runThread7Pilot: () => Promise<Thread7AssayResult>;
  runThread7Full: () => Promise<Thread7AssayResult>;
  runThread8Pilot: () => Promise<Thread8AssayResult>;
  runThread8Full: () => Promise<Thread8AssayResult>;
  runThread9Pilot: () => Promise<Thread9AssayResult>;
  runThread9Full: () => Promise<Thread9AssayResult>;
  runThread9BPilot: () => Promise<Thread9BAssayResult>;
  runThread9BFull: () => Promise<Thread9BAssayResult>;
  runThread10Pilot: () => Promise<Thread10AssayResult>;
  runThread10Full: () => Promise<Thread10AssayResult>;
  runThread11Pilot: () => Promise<Thread11AssayResult>;
  runThread11Full: () => Promise<Thread11AssayResult>;
  runThread12Pilot: () => Promise<Thread12AssayResult>;
  runThread12Full: () => Promise<Thread12AssayResult>;
  runThread13Pilot: () => Promise<Thread13AssayResult>;
  runThread13Full: () => Promise<Thread13AssayResult>;
  runThread14Pilot: () => Promise<Thread14AssayResult>;
  runThread14Full: () => Promise<Thread14AssayResult>;
} {
  const runner = new AmeliaThread3LiveBridgeRunner();
  const bindings = runner.getBindings();
  const t3Dispatcher = createThread3BridgeDispatcher(bindings);
  const t3RDispatcher = createThread3RBridgeDispatcher(bindings);
  const t4Dispatcher = createThread4BridgeDispatcher(bindings);
  const t4ADispatcher = createThread4ABridgeDispatcher(bindings);
  const t5Dispatcher = createThread5BridgeDispatcher(bindings);
  const t5BDispatcher = createThread5BBridgeDispatcher(bindings);
  const t6Dispatcher = createThread6BridgeDispatcher(bindings);
  const t7Dispatcher = createThread7BridgeDispatcher(bindings);
  const t8Dispatcher = createThread8BridgeDispatcher(bindings);
  const t9Dispatcher = createThread9BridgeDispatcher(bindings);
  const t9BDispatcher = createThread9BBridgeDispatcher(bindings);
  const t10Dispatcher = createThread10BridgeDispatcher(bindings);
  const t11Dispatcher = createThread11BridgeDispatcher(bindings);
  const t12Dispatcher = createThread12BridgeDispatcher(bindings);
  const t13Dispatcher = createThread13BridgeDispatcher(bindings);
  const t14Dispatcher = createThread14BridgeDispatcher(bindings);

  const combinedDispatcher = async (command: string): Promise<string> => {
    if (command.includes('THREAD14')) {
      return t14Dispatcher(command);
    }
    if (command.includes('THREAD13')) {
      return t13Dispatcher(command);
    }
    if (command.includes('THREAD12')) {
      return t12Dispatcher(command);
    }
    if (command.includes('THREAD11')) {
      return t11Dispatcher(command);
    }
    if (command.includes('THREAD10')) {
      return t10Dispatcher(command);
    }
    if (command.includes('THREAD9B')) {
      return t9BDispatcher(command);
    }
    if (command.includes('THREAD9')) {
      return t9Dispatcher(command);
    }
    if (command.includes('THREAD8')) {
      return t8Dispatcher(command);
    }
    if (command.includes('THREAD7')) {
      return t7Dispatcher(command);
    }
    if (command.includes('THREAD6')) {
      return t6Dispatcher(command);
    }
    if (command.includes('THREAD5B')) {
      return t5BDispatcher(command);
    }
    if (command.includes('THREAD5')) {
      return t5Dispatcher(command);
    }
    if (command.includes('THREAD4A')) {
      return t4ADispatcher(command);
    }
    if (command.includes('THREAD4')) {
      return t4Dispatcher(command);
    }
    if (command.includes('THREAD3R')) {
      return t3RDispatcher(command);
    }
    return t3Dispatcher(command);
  };

  return {
    dispatcher: combinedDispatcher,
    runPilot: () => runThread3EncodingAssay(bindings, THREAD3_PILOT_CONFIG),
    runFull: () => runThread3EncodingAssay(bindings, THREAD3_FULL_CONFIG),
    runAudit: auditThread3ChapterEncoding,
    runThread3RPilot: () => runThread3RAssay(bindings, THREAD3R_PILOT_CONFIG),
    runThread3RFull: () => runThread3RAssay(bindings, THREAD3R_FULL_CONFIG),
    runThread4Pilot: () => runThread4Assay(bindings, THREAD4_PILOT_CONFIG),
    runThread4Full: () => runThread4Assay(bindings, THREAD4_FULL_CONFIG),
    runThread4APilot: () => runThread4AGainSweepAssay(bindings, THREAD4A_PILOT_CONFIG),
    runThread4AFull: () => runThread4AGainSweepAssay(bindings, THREAD4A_FULL_CONFIG),
    runThread5Pilot: () => runThread5SemanticInteractionAssay(bindings, THREAD5_PILOT_CONFIG),
    runThread5Full: () => runThread5SemanticInteractionAssay(bindings, THREAD5_FULL_CONFIG),
    runThread5BPilot: () => runThread5BPhaseShiftAssay(bindings, THREAD5B_PILOT_CONFIG),
    runThread5BFull: () => runThread5BPhaseShiftAssay(bindings, THREAD5B_FULL_CONFIG),
    runThread6Pilot: () => runThread6HysteresisAssay(bindings, THREAD6_PILOT_CONFIG),
    runThread6Full: () => runThread6HysteresisAssay(bindings, THREAD6_FULL_CONFIG),
    runThread7Pilot: () => runThread7StressAssay(bindings, THREAD7_PILOT_CONFIG),
    runThread7Full: () => runThread7StressAssay(bindings, THREAD7_FULL_CONFIG),
    runThread8Pilot: () => runThread8DevelopmentalAssay(bindings, THREAD8_PILOT_CONFIG),
    runThread8Full: () => runThread8DevelopmentalAssay(bindings, THREAD8_FULL_CONFIG),
    runThread9Pilot: () => runThread9ConsolidationAssay(bindings, THREAD9_PILOT_CONFIG),
    runThread9Full: () => runThread9ConsolidationAssay(bindings, THREAD9_FULL_CONFIG),
    runThread9BPilot: () => runThread9BLongevityAssay(bindings, THREAD9B_PILOT_CONFIG),
    runThread9BFull: () => runThread9BLongevityAssay(bindings, THREAD9B_FULL_CONFIG),
    runThread10Pilot: () => runThread10FunctionalPerturbationAssay(bindings, THREAD10_PILOT_CONFIG),
    runThread10Full: () => runThread10FunctionalPerturbationAssay(bindings, THREAD10_FULL_CONFIG),
    runThread11Pilot: () => runThread11MinimalReinductionAssay(bindings, THREAD11_PILOT_CONFIG),
    runThread11Full: () => runThread11MinimalReinductionAssay(bindings, THREAD11_FULL_CONFIG),
    runThread12Pilot: () => runThread12ControlledFunctionalIntegrationAssay(bindings, THREAD12_PILOT_CONFIG),
    runThread12Full: () => runThread12ControlledFunctionalIntegrationAssay(bindings, THREAD12_FULL_CONFIG),
    runThread13Pilot: () => runThread13AutonomousModeSelectionAssay(bindings, THREAD13_PILOT_CONFIG),
    runThread13Full: () => runThread13AutonomousModeSelectionAssay(bindings, THREAD13_FULL_CONFIG),
    runThread14Pilot: () => runThread14ContextualReframingAssay(bindings, THREAD14_PILOT_CONFIG),
    runThread14Full: () => runThread14ContextualReframingAssay(bindings, THREAD14_FULL_CONFIG),
  };
}
