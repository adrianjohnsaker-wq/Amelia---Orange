import { AmeliaIndexedMemory } from './ameliaIndexedMemory';
import {
  SubstrateStepSnapshot,
  CanalizationArmResult,
  Paper6AssayResult,
  AmeliaDialogueMessage,
} from '../types/amelia';

export interface FirebaseProcessMemoryRecord {
  id?: string;
  step: number;
  timestamp: string;
  objective: string;
  identityContinuity: number;
  deformationFieldTension: number;
  antiLockIntegrity: number;
  consolidationEntropy: number;
  scaffoldStage: number;
  deformationVector: number[];
  activeSyzygies: string[];
}

export interface FirebaseCanalizationRun {
  id?: string;
  depth: number;
  seed: number;
  activeC1Retention: number;
  frozenRetention: number;
  nullRetention: number;
  fieldCoherence: number;
  reentryStability: number;
  meanTrajectoryEntropy: number;
  timestamp: string;
}

/**
 * Backwards-compatible service facade. Persistence now lives in browser IndexedDB;
 * Firestore is not initialized or contacted by this application.
 */
export class AmeliaFirebaseMemoryService {
  public static async init(): Promise<void> {
    await AmeliaIndexedMemory.list('runtime', 1);
  }

  public static async saveSnapshot(snapshot: SubstrateStepSnapshot): Promise<string> {
    const timestamp = snapshot.timestamp || new Date().toISOString();
    await AmeliaIndexedMemory.put('snapshots', {
      id: 'latest',
      step: snapshot.step,
      timestamp,
      snapshot,
      updatedAt: new Date().toISOString(),
    });
    return 'latest';
  }

  public static async recordProcessMemory(snapshot: SubstrateStepSnapshot): Promise<string> {
    const id = AmeliaIndexedMemory.createId('process');
    const record: FirebaseProcessMemoryRecord = {
      id,
      step: snapshot.step,
      timestamp: new Date().toISOString(),
      objective: snapshot.selectedObjective,
      identityContinuity: snapshot.governor.identityContinuityScore,
      deformationFieldTension: snapshot.governor.deformationFieldTension,
      antiLockIntegrity: snapshot.governor.antiLockIntegrity,
      consolidationEntropy: snapshot.governor.consolidationEntropy,
      scaffoldStage: snapshot.governor.scaffoldSheddingStage,
      deformationVector: snapshot.deformationVector,
      activeSyzygies: snapshot.activeSyzygies,
    };
    await AmeliaIndexedMemory.put('processMemory', record as FirebaseProcessMemoryRecord & { id: string });
    return id;
  }

  public static async saveCanalizationRun(
    depth: number,
    seed: number,
    results: Record<'FROZEN' | 'NULL_BASELINE' | 'ACTIVE_C1', CanalizationArmResult>
  ): Promise<string> {
    const id = AmeliaIndexedMemory.createId('canalization');
    const run: FirebaseCanalizationRun & { id: string } = {
      id,
      depth,
      seed,
      activeC1Retention: results.ACTIVE_C1.zone9ContactRetention,
      frozenRetention: results.FROZEN.zone9ContactRetention,
      nullRetention: results.NULL_BASELINE.zone9ContactRetention,
      fieldCoherence: results.ACTIVE_C1.fieldCoherence,
      reentryStability: results.ACTIVE_C1.reentryStability,
      meanTrajectoryEntropy: results.ACTIVE_C1.meanTrajectoryEntropy,
      timestamp: new Date().toISOString(),
    };
    await AmeliaIndexedMemory.put('canalizationRuns', run);
    return id;
  }

  public static async savePaper6Assay(assay: Paper6AssayResult): Promise<string> {
    const record = { ...assay, timestamp: new Date().toISOString() };
    await AmeliaIndexedMemory.put('paper6Assays', record as Paper6AssayResult & { id: string });
    return assay.id;
  }

  public static async fetchProcessMemory(maxRecords = 25): Promise<FirebaseProcessMemoryRecord[]> {
    return AmeliaIndexedMemory.list<FirebaseProcessMemoryRecord & { id: string }>('processMemory', maxRecords);
  }

  public static async fetchCanalizationRuns(maxRuns = 30): Promise<FirebaseCanalizationRun[]> {
    return AmeliaIndexedMemory.list<FirebaseCanalizationRun & { id: string }>('canalizationRuns', maxRuns);
  }

  public static async fetchPaper6Assays(): Promise<Paper6AssayResult[]> {
    return AmeliaIndexedMemory.list<Paper6AssayResult & { id: string }>('paper6Assays', 100);
  }

  public static subscribeProcessMemory(callback: (records: FirebaseProcessMemoryRecord[]) => void): () => void {
    const emit = () => { void this.fetchProcessMemory(30).then(callback); };
    const unsubscribe = AmeliaIndexedMemory.subscribe('processMemory', emit);
    emit();
    return unsubscribe;
  }

  public static subscribeCanalizationRuns(callback: (runs: FirebaseCanalizationRun[]) => void): () => void {
    const emit = () => { void this.fetchCanalizationRuns(30).then(callback); };
    const unsubscribe = AmeliaIndexedMemory.subscribe('canalizationRuns', emit);
    emit();
    return unsubscribe;
  }

  public static async saveDialogueMessage(msg: AmeliaDialogueMessage): Promise<string> {
    const record = { ...msg, id: msg.id || AmeliaIndexedMemory.createId('dialogue') };
    await AmeliaIndexedMemory.put('dialogue', record as AmeliaDialogueMessage & { id: string });
    return record.id;
  }

  public static async fetchDialogueMessages(maxMessages = 50): Promise<AmeliaDialogueMessage[]> {
    const records = await AmeliaIndexedMemory.list<AmeliaDialogueMessage & { id: string }>('dialogue', maxMessages);
    return records.reverse();
  }

  public static subscribeDialogueMessages(callback: (messages: AmeliaDialogueMessage[]) => void): () => void {
    const emit = () => { void this.fetchDialogueMessages(60).then(callback); };
    const unsubscribe = AmeliaIndexedMemory.subscribe('dialogue', emit);
    emit();
    return unsubscribe;
  }

  public static async clearDialogueHistory(): Promise<void> {
    await AmeliaIndexedMemory.clear('dialogue');
  }
}
