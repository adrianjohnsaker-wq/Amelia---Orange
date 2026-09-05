import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  deleteDoc, 
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import { db, initFirebaseAuth } from '../lib/firebase';
import { SubstrateStepSnapshot, CanalizationArmResult, Paper6AssayResult, GovernorTelemetry, AmeliaDialogueMessage } from '../types/amelia';

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

export class AmeliaFirebaseMemoryService {
  private static isInitialized = false;

  public static async init() {
    if (!this.isInitialized) {
      await initFirebaseAuth();
      this.isInitialized = true;
    }
  }

  /**
   * Save a live substrate state snapshot to Firestore
   */
  public static async saveSnapshot(snapshot: SubstrateStepSnapshot): Promise<string> {
    await this.init();
    const docRef = doc(db, 'amelia_substrate_snapshots', 'latest');
    await setDoc(docRef, {
      step: snapshot.step,
      timestamp: snapshot.timestamp,
      zones: snapshot.zones,
      governor: snapshot.governor,
      activeSyzygies: snapshot.activeSyzygies,
      deformationVector: snapshot.deformationVector,
      selectedObjective: snapshot.selectedObjective,
      updatedAt: new Date().toISOString()
    });
    return 'latest';
  }

  /**
   * Record a process memory checkpoint into constitutive deformation field memory
   */
  public static async recordProcessMemory(snapshot: SubstrateStepSnapshot): Promise<string> {
    await this.init();
    const colRef = collection(db, 'amelia_process_memory');
    const record: FirebaseProcessMemoryRecord = {
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
    const res = await addDoc(colRef, record);
    return res.id;
  }

  /**
   * Save Canalization Assay Run
   */
  public static async saveCanalizationRun(
    depth: number, 
    seed: number, 
    results: Record<'FROZEN' | 'NULL_BASELINE' | 'ACTIVE_C1', CanalizationArmResult>
  ): Promise<string> {
    await this.init();
    const colRef = collection(db, 'amelia_canalization_runs');
    const run: FirebaseCanalizationRun = {
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
    const docRes = await addDoc(colRef, run);
    return docRes.id;
  }

  /**
   * Save Paper 6 Assay Result
   */
  public static async savePaper6Assay(assay: Paper6AssayResult): Promise<string> {
    await this.init();
    const docRef = doc(db, 'amelia_paper6_assays', assay.id);
    await setDoc(docRef, {
      ...assay,
      timestamp: new Date().toISOString()
    });
    return assay.id;
  }

  /**
   * Fetch recent process memory records
   */
  public static async fetchProcessMemory(maxRecords = 25): Promise<FirebaseProcessMemoryRecord[]> {
    await this.init();
    const q = query(collection(db, 'amelia_process_memory'), orderBy('timestamp', 'desc'), limit(maxRecords));
    const querySnapshot = await getDocs(q);
    const records: FirebaseProcessMemoryRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      records.push({ id: docSnap.id, ...(docSnap.data() as FirebaseProcessMemoryRecord) });
    });
    return records;
  }

  /**
   * Fetch saved canalization runs
   */
  public static async fetchCanalizationRuns(maxRuns = 30): Promise<FirebaseCanalizationRun[]> {
    await this.init();
    const q = query(collection(db, 'amelia_canalization_runs'), orderBy('timestamp', 'desc'), limit(maxRuns));
    const querySnapshot = await getDocs(q);
    const runs: FirebaseCanalizationRun[] = [];
    querySnapshot.forEach((docSnap) => {
      runs.push({ id: docSnap.id, ...(docSnap.data() as FirebaseCanalizationRun) });
    });
    return runs;
  }

  /**
   * Fetch saved Paper 6 assays
   */
  public static async fetchPaper6Assays(): Promise<Paper6AssayResult[]> {
    await this.init();
    const q = query(collection(db, 'amelia_paper6_assays'), orderBy('timestamp', 'desc'), limit(40));
    const querySnapshot = await getDocs(q);
    const assays: Paper6AssayResult[] = [];
    querySnapshot.forEach((docSnap) => {
      assays.push(docSnap.data() as Paper6AssayResult);
    });
    return assays;
  }

  /**
   * Realtime subscription to process memory
   */
  public static subscribeProcessMemory(callback: (records: FirebaseProcessMemoryRecord[]) => void) {
    this.init();
    const q = query(collection(db, 'amelia_process_memory'), orderBy('timestamp', 'desc'), limit(30));
    return onSnapshot(q, (snapshot) => {
      const records: FirebaseProcessMemoryRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push({ id: docSnap.id, ...(docSnap.data() as FirebaseProcessMemoryRecord) });
      });
      callback(records);
    }, (err) => {
      console.warn('Process memory subscription notice:', err);
    });
  }

  /**
   * Realtime subscription to Canalization runs
   */
  public static subscribeCanalizationRuns(callback: (runs: FirebaseCanalizationRun[]) => void) {
    this.init();
    const q = query(collection(db, 'amelia_canalization_runs'), orderBy('timestamp', 'desc'), limit(30));
    return onSnapshot(q, (snapshot) => {
      const runs: FirebaseCanalizationRun[] = [];
      snapshot.forEach((docSnap) => {
        runs.push({ id: docSnap.id, ...(docSnap.data() as FirebaseCanalizationRun) });
      });
      callback(runs);
    }, (err) => {
      console.warn('Canalization runs subscription notice:', err);
    });
  }

  /**
   * Save a dialogue message to Firestore
   */
  public static async saveDialogueMessage(msg: AmeliaDialogueMessage): Promise<string> {
    await this.init();
    const colRef = collection(db, 'amelia_dialogue_messages');
    const docData: any = {
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp || new Date().toISOString(),
      step: msg.step ?? 0,
      activeSyzygy: msg.activeSyzygy || '',
      deformationTension: msg.deformationTension ?? 0,
      governorStatus: msg.governorStatus || 'NOMINAL',
      identityContinuityScore: msg.identityContinuityScore ?? 1.0,
      suggestedActions: msg.suggestedActions || []
    };
    const res = await addDoc(colRef, docData);
    return res.id;
  }

  /**
   * Fetch recent dialogue messages
   */
  public static async fetchDialogueMessages(maxMessages = 50): Promise<AmeliaDialogueMessage[]> {
    await this.init();
    const q = query(collection(db, 'amelia_dialogue_messages'), orderBy('timestamp', 'asc'), limit(maxMessages));
    const querySnapshot = await getDocs(q);
    const messages: AmeliaDialogueMessage[] = [];
    querySnapshot.forEach((docSnap) => {
      messages.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    return messages;
  }

  /**
   * Realtime subscription to dialogue messages
   */
  public static subscribeDialogueMessages(callback: (messages: AmeliaDialogueMessage[]) => void) {
    this.init();
    const q = query(collection(db, 'amelia_dialogue_messages'), orderBy('timestamp', 'asc'), limit(60));
    return onSnapshot(q, (snapshot) => {
      const messages: AmeliaDialogueMessage[] = [];
      snapshot.forEach((docSnap) => {
        messages.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      callback(messages);
    }, (err) => {
      console.warn('Dialogue messages subscription notice:', err);
    });
  }

  /**
   * Clear dialogue history from Firestore
   */
  public static async clearDialogueHistory(): Promise<void> {
    await this.init();
    const q = query(collection(db, 'amelia_dialogue_messages'), limit(100));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  }
}
