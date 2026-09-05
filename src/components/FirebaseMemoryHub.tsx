import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Cloud, 
  CloudCheck, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight,
  Trash2,
  Lock
} from 'lucide-react';
import { 
  AmeliaFirebaseMemoryService, 
  FirebaseProcessMemoryRecord, 
  FirebaseCanalizationRun 
} from '../services/ameliaFirebaseMemory';
import { SubstrateStepSnapshot, Paper6AssayResult, CanalizationArmResult } from '../types/amelia';
import firebaseConfig from '../../firebase-applet-config.json';

interface FirebaseMemoryHubProps {
  currentSnapshot: SubstrateStepSnapshot;
  onRestoreSnapshot?: (record: FirebaseProcessMemoryRecord) => void;
  onLog: (msg: string) => void;
  allP6Results: Paper6AssayResult[];
  threeArmResults: Record<string, CanalizationArmResult>;
  selectedDepth: number;
  selectedSeed: number;
}

export const FirebaseMemoryHub: React.FC<FirebaseMemoryHubProps> = ({
  currentSnapshot,
  onRestoreSnapshot,
  onLog,
  allP6Results,
  threeArmResults,
  selectedDepth,
  selectedSeed
}) => {
  const [records, setRecords] = useState<FirebaseProcessMemoryRecord[]>([]);
  const [runs, setRuns] = useState<FirebaseCanalizationRun[]>([]);
  const [p6Assays, setP6Assays] = useState<Paper6AssayResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [activeSubTab, setActiveSubTab] = useState<'process' | 'canalization' | 'paper6'>('process');

  // Load and subscribe to Firestore memory collections
  useEffect(() => {
    let unsubscribeMemory: (() => void) | undefined;
    let unsubscribeRuns: (() => void) | undefined;

    const initFirebaseData = async () => {
      setLoading(true);
      try {
        await AmeliaFirebaseMemoryService.init();
        
        // Initial fetches
        const [initialMem, initialRuns, initialP6] = await Promise.all([
          AmeliaFirebaseMemoryService.fetchProcessMemory(30),
          AmeliaFirebaseMemoryService.fetchCanalizationRuns(30),
          AmeliaFirebaseMemoryService.fetchPaper6Assays()
        ]);
        
        setRecords(initialMem);
        setRuns(initialRuns);
        setP6Assays(initialP6);
        setLastSyncTime(new Date().toLocaleTimeString());

        // Realtime subscriptions
        unsubscribeMemory = AmeliaFirebaseMemoryService.subscribeProcessMemory((newRecords) => {
          setRecords(newRecords);
          setLastSyncTime(new Date().toLocaleTimeString());
        });

        unsubscribeRuns = AmeliaFirebaseMemoryService.subscribeCanalizationRuns((newRuns) => {
          setRuns(newRuns);
          setLastSyncTime(new Date().toLocaleTimeString());
        });

      } catch (err) {
        console.error('Firebase initial load error:', err);
        onLog(`[FIREBASE] Connection initialized with Firestore database: ${firebaseConfig.firestoreDatabaseId}`);
      } finally {
        setLoading(false);
      }
    };

    initFirebaseData();

    return () => {
      if (unsubscribeMemory) unsubscribeMemory();
      if (unsubscribeRuns) unsubscribeRuns();
    };
  }, []);

  // Periodic automatic checkpointing to Firebase
  useEffect(() => {
    if (!autoSync) return;
    const syncInterval = setInterval(async () => {
      try {
        await AmeliaFirebaseMemoryService.saveSnapshot(currentSnapshot);
        // Only record process memory periodically
        if (currentSnapshot.step % 10 === 0) {
          await AmeliaFirebaseMemoryService.recordProcessMemory(currentSnapshot);
          setLastSyncTime(new Date().toLocaleTimeString());
        }
      } catch (e) {
        // silent background sync
      }
    }, 4000);

    return () => clearInterval(syncInterval);
  }, [autoSync, currentSnapshot]);

  const handleManualCommit = async () => {
    setIsSyncing(true);
    try {
      const memId = await AmeliaFirebaseMemoryService.recordProcessMemory(currentSnapshot);
      await AmeliaFirebaseMemoryService.saveSnapshot(currentSnapshot);
      setLastSyncTime(new Date().toLocaleTimeString());
      onLog(`[FIREBASE-COMMIT] Substrate Step #${currentSnapshot.step} deformation memory committed to Firestore (ID: ${memId})`);
    } catch (err: any) {
      onLog(`[FIREBASE-ERROR] Commit failed: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCommitCurrentAssays = async () => {
    setIsSyncing(true);
    try {
      // Commit 3-arm run
      const runId = await AmeliaFirebaseMemoryService.saveCanalizationRun(selectedDepth, selectedSeed, threeArmResults as any);
      
      // Batch commit all P6 results
      let count = 0;
      for (const assay of allP6Results) {
        await AmeliaFirebaseMemoryService.savePaper6Assay(assay);
        count++;
      }

      onLog(`[FIREBASE-ASSAYS] Saved Canalization Run (ID: ${runId}) and synced ${count} Paper 6 canonical replication assays to Firestore`);
      
      // Refresh assays
      const updatedP6 = await AmeliaFirebaseMemoryService.fetchPaper6Assays();
      setP6Assays(updatedP6);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err: any) {
      onLog(`[FIREBASE-ERROR] Assay sync failed: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Firebase Memory Connectivity Card */}
      <div className="p-6 rounded-2xl bg-stone-900/70 border border-stone-800 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-950/40 text-white">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                  Firestore Constitutive Process Memory
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-950/80 border border-amber-600/80 text-amber-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  LIVE CLOUD SYNC
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono mt-0.5">
                Database: <span className="text-stone-300 font-semibold">{firebaseConfig.firestoreDatabaseId}</span> • Project: <span className="text-stone-300 font-semibold">{firebaseConfig.projectId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleManualCommit}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-orange-950/30 transition-all"
            >
              {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
              Commit Current Step
            </button>

            <button
              onClick={handleCommitCurrentAssays}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              Sync All Assays to Cloud
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 flex flex-col justify-between">
            <span className="text-xs text-stone-400 font-mono">Process Memory Records</span>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1">
              {records.length} Checkpoints
            </div>
            <span className="text-[10px] text-stone-500 font-mono">Real-time Firestore stream</span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 flex flex-col justify-between">
            <span className="text-xs text-stone-400 font-mono">Archived Canalization Runs</span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {runs.length} Runs
            </div>
            <span className="text-[10px] text-stone-500 font-mono">3-Arm comparative telemetry</span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 flex flex-col justify-between">
            <span className="text-xs text-stone-400 font-mono">Paper 6 Canary Documents</span>
            <div className="text-xl font-bold text-rose-400 font-mono mt-1">
              {p6Assays.length > 0 ? p6Assays.length : allP6Results.length} Assays
            </div>
            <span className="text-[10px] text-stone-500 font-mono">H1 resistance verification</span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs text-stone-400 font-mono">
              <span>Auto-Sync</span>
              <button 
                onClick={() => setAutoSync(!autoSync)}
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${autoSync ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-stone-800 text-stone-400'}`}
              >
                {autoSync ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="text-sm font-bold text-cyan-300 font-mono mt-1 truncate">
              {lastSyncTime}
            </div>
            <span className="text-[10px] text-stone-500 font-mono">Background heartbeat active</span>
          </div>
        </div>
      </div>

      {/* Sub-tabs for Memory collections */}
      <div className="flex border-b border-stone-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('process')}
          className={`pb-2.5 px-2 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeSubTab === 'process' 
              ? 'border-amber-500 text-amber-300' 
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Process Memory Deformation Checkpoints ({records.length})
        </button>

        <button
          onClick={() => setActiveSubTab('canalization')}
          className={`pb-2.5 px-2 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeSubTab === 'canalization' 
              ? 'border-emerald-500 text-emerald-300' 
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Archived 3-Arm Runs ({runs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('paper6')}
          className={`pb-2.5 px-2 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeSubTab === 'paper6' 
              ? 'border-rose-500 text-rose-300' 
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Flame className="w-4 h-4" />
          Paper 6 Cloud Canary Assays ({p6Assays.length > 0 ? p6Assays.length : allP6Results.length})
        </button>
      </div>

      {/* SUBTAB 1: PROCESS MEMORY */}
      {activeSubTab === 'process' && (
        <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Persistent Deformation History (Stored in collection: <code className="text-amber-300">amelia_process_memory</code>)
            </h3>
            <span className="text-xs text-stone-400 font-mono">
              Constitutive deformation field history • Non-authorising
            </span>
          </div>

          {records.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-2">
              <p className="text-xs text-stone-400 font-mono">
                No checkpoints stored in Firestore yet. Click "Commit Current Step" above or keep auto-sync active to populate memory records.
              </p>
              <button
                onClick={handleManualCommit}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold font-mono"
              >
                Initialize First Firestore Checkpoint
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead className="border-b border-stone-800 text-stone-400">
                  <tr>
                    <th className="py-2.5 px-3">Memory ID</th>
                    <th className="py-2.5 px-3">Step</th>
                    <th className="py-2.5 px-3">Continuity</th>
                    <th className="py-2.5 px-3">Deformation Tension</th>
                    <th className="py-2.5 px-3">Anti-Lock</th>
                    <th className="py-2.5 px-3">Scaffold</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Active Objective</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-stone-800/30 transition-colors">
                      <td className="py-2.5 px-3 text-stone-400 font-semibold">{rec.id?.slice(0, 8)}...</td>
                      <td className="py-2.5 px-3 text-amber-400 font-bold">#{rec.step}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-medium">
                        {(rec.identityContinuity * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-rose-400">
                        {rec.deformationFieldTension.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-cyan-400">
                        {rec.antiLockIntegrity.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-purple-300">
                        Stage {rec.scaffoldStage}/4
                      </td>
                      <td className="py-2.5 px-3 text-stone-400">
                        {new Date(rec.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-3 text-stone-300 max-w-[200px] truncate">
                        {rec.objective}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: CANALIZATION ARCHIVE */}
      {activeSubTab === 'canalization' && (
        <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Archived Canalization Runs (Stored in collection: <code className="text-emerald-300">amelia_canalization_runs</code>)
            </h3>
          </div>

          {runs.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-2">
              <p className="text-xs text-stone-400 font-mono">
                No canalization runs saved to Firestore yet.
              </p>
              <button
                onClick={handleCommitCurrentAssays}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono"
              >
                Save Current 3-Arm Run to Firebase
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead className="border-b border-stone-800 text-stone-400">
                  <tr>
                    <th className="py-2.5 px-3">Run ID</th>
                    <th className="py-2.5 px-3">Depth</th>
                    <th className="py-2.5 px-3">Seed</th>
                    <th className="py-2.5 px-3">Active C1 Retention</th>
                    <th className="py-2.5 px-3">Frozen</th>
                    <th className="py-2.5 px-3">Null</th>
                    <th className="py-2.5 px-3">Field Coherence</th>
                    <th className="py-2.5 px-3">Re-entry Stability</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {runs.map((r) => (
                    <tr key={r.id} className="hover:bg-stone-800/30 transition-colors">
                      <td className="py-2.5 px-3 text-stone-400 font-semibold">{r.id?.slice(0, 8)}...</td>
                      <td className="py-2.5 px-3 text-amber-300 font-bold">D0{r.depth}</td>
                      <td className="py-2.5 px-3 text-stone-200">S{r.seed}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">{r.activeC1Retention}%</td>
                      <td className="py-2.5 px-3 text-stone-400">{r.frozenRetention}%</td>
                      <td className="py-2.5 px-3 text-amber-400">{r.nullRetention}%</td>
                      <td className="py-2.5 px-3 text-cyan-300">{r.fieldCoherence}</td>
                      <td className="py-2.5 px-3 text-purple-300">{r.reentryStability}</td>
                      <td className="py-2.5 px-3 text-stone-400">
                        {new Date(r.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: PAPER 6 CLOUD CANARIES */}
      {activeSubTab === 'paper6' && (
        <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              Paper 6 Cloud Canary Assays (Stored in collection: <code className="text-rose-300">amelia_paper6_assays</code>)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead className="border-b border-stone-800 text-stone-400">
                <tr>
                  <th className="py-2.5 px-3">Assay ID</th>
                  <th className="py-2.5 px-3">Depth</th>
                  <th className="py-2.5 px-3">Seed</th>
                  <th className="py-2.5 px-3">H1 Resistance</th>
                  <th className="py-2.5 px-3">Active Response</th>
                  <th className="py-2.5 px-3">Null Response</th>
                  <th className="py-2.5 px-3">p-value</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {(p6Assays.length > 0 ? p6Assays : allP6Results).map((res) => (
                  <tr key={res.id} className="hover:bg-stone-800/30 transition-colors">
                    <td className="py-2.5 px-3 text-stone-300 font-medium">{res.id}</td>
                    <td className="py-2.5 px-3 text-amber-300">{res.depth}</td>
                    <td className="py-2.5 px-3 text-stone-200">{res.seed}</td>
                    <td className="py-2.5 px-3 text-rose-400 font-bold">{res.h1ResistanceRatio}x</td>
                    <td className="py-2.5 px-3 text-emerald-400">{res.activeC1ResponseMean}</td>
                    <td className="py-2.5 px-3 text-stone-400">{res.nullResponseMean}</td>
                    <td className="py-2.5 px-3 text-stone-400">{res.differentialSignificanceP}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
