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
  AmeliaLocalMemoryService, 
  LocalProcessMemoryRecord, 
  LocalCanalizationRun 
} from '../services/ameliaLocalMemory';
import { SubstrateStepSnapshot, Paper6AssayResult, CanalizationArmResult } from '../types/amelia';
import { AmeliaIndexedMemory } from '../services/ameliaIndexedMemory';
import { AmeliaSupabaseMemory, AmeliaCloudSession } from '../services/ameliaSupabaseMemory';

interface LocalMemoryHubProps {
  currentSnapshot: SubstrateStepSnapshot;
  onRestoreSnapshot?: (record: LocalProcessMemoryRecord) => void;
  onLog: (msg: string) => void;
  allP6Results: Paper6AssayResult[];
  threeArmResults: Record<string, CanalizationArmResult>;
  selectedDepth: number;
  selectedSeed: number;
  onCloudRestore?: (state: unknown) => void;
  onCloudStatusChange?: (connected: boolean) => void;
}

export const LocalMemoryHub: React.FC<LocalMemoryHubProps> = ({
  currentSnapshot,
  onRestoreSnapshot,
  onLog,
  allP6Results,
  threeArmResults,
  selectedDepth,
  selectedSeed,
  onCloudRestore,
  onCloudStatusChange
}) => {
  const [records, setRecords] = useState<LocalProcessMemoryRecord[]>([]);
  const [runs, setRuns] = useState<LocalCanalizationRun[]>([]);
  const [p6Assays, setP6Assays] = useState<Paper6AssayResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [activeSubTab, setActiveSubTab] = useState<'process' | 'canalization' | 'paper6'>('process');
  const [cloudSession, setCloudSession] = useState<AmeliaCloudSession | null>(null);
  const [cloudEmail, setCloudEmail] = useState('');
  const [cloudPassword, setCloudPassword] = useState('');
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudError, setCloudError] = useState('');
  const [cloudMessage, setCloudMessage] = useState('');

  const activateCloudSession = async (session: AmeliaCloudSession | null, mounted = true) => {
    setCloudSession(session);
    if (!session) {
      AmeliaIndexedMemory.setCloudAdapter(null);
      onCloudStatusChange?.(false);
      return;
    }
    setCloudBusy(true);
    setCloudError('');
    try {
      const result = await AmeliaSupabaseMemory.syncLocalMemory(session);
      if (!mounted) return;
      onCloudStatusChange?.(true);
      if (result.runtimeCheckpoint?.state) onCloudRestore?.(result.runtimeCheckpoint.state);
      setCloudMessage('Supabase synced · ' + result.uploaded + ' uploaded · ' + result.downloaded + ' restored');
    } catch (error) {
      if (!mounted) return;
      AmeliaIndexedMemory.setCloudAdapter(null);
      onCloudStatusChange?.(false);
      setCloudError(error instanceof Error ? error.message : 'Supabase memory sync failed.');
    } finally {
      if (mounted) setCloudBusy(false);
    }
  };

  const handleCloudSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setCloudBusy(true);
    setCloudError('');
    setCloudMessage('');
    try {
      await AmeliaSupabaseMemory.signIn(cloudEmail, cloudPassword);
      setCloudPassword('');
    } catch (error) {
      setCloudError(error instanceof Error ? error.message : 'Supabase sign-in failed.');
      setCloudBusy(false);
    }
  };

  const handleCloudSignUp = async () => {
    setCloudBusy(true);
    setCloudError('');
    setCloudMessage('');
    try {
      const result = await AmeliaSupabaseMemory.signUp(cloudEmail, cloudPassword);
      setCloudPassword('');
      if (result.confirmationRequired) {
        setCloudMessage('Check your email to confirm the account, then sign in here.');
        setCloudBusy(false);
      }
    } catch (error) {
      setCloudError(error instanceof Error ? error.message : 'Supabase account creation failed.');
      setCloudBusy(false);
    }
  };

  const handleCloudSync = async () => {
    const session = await AmeliaSupabaseMemory.getSession();
    if (session) await activateCloudSession(session);
  };

  const handleCloudSignOut = async () => {
    await AmeliaSupabaseMemory.signOut();
    setCloudMessage('Signed out · local memory remains available on this device');
  };

  // Load and subscribe to the local IndexedDB memory archive
  useEffect(() => {
    let unsubscribeMemory: (() => void) | undefined;
    let unsubscribeRuns: (() => void) | undefined;

    const initLocalMemory = async () => {
      setLoading(true);
      try {
        await AmeliaLocalMemoryService.init();
        
        // Initial fetches
        const [initialMem, initialRuns, initialP6] = await Promise.all([
          AmeliaLocalMemoryService.fetchProcessMemory(30),
          AmeliaLocalMemoryService.fetchCanalizationRuns(30),
          AmeliaLocalMemoryService.fetchPaper6Assays()
        ]);
        
        setRecords(initialMem);
        setRuns(initialRuns);
        setP6Assays(initialP6);
        setLastSyncTime(new Date().toLocaleTimeString());

        // Realtime subscriptions
        unsubscribeMemory = AmeliaLocalMemoryService.subscribeProcessMemory((newRecords) => {
          setRecords(newRecords);
          setLastSyncTime(new Date().toLocaleTimeString());
        });

        unsubscribeRuns = AmeliaLocalMemoryService.subscribeCanalizationRuns((newRuns) => {
          setRuns(newRuns);
          setLastSyncTime(new Date().toLocaleTimeString());
        });

      } catch (err) {
        console.error('Local memory load error:', err);
        onLog('[STORAGE] Local IndexedDB memory archive opened');
      } finally {
        setLoading(false);
      }
    };

    initLocalMemory();

    return () => {
      if (unsubscribeMemory) unsubscribeMemory();
      if (unsubscribeRuns) unsubscribeRuns();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = AmeliaSupabaseMemory.subscribe(session => {
      void activateCloudSession(session, mounted);
    });
    void AmeliaSupabaseMemory.getSession()
      .then(session => activateCloudSession(session, mounted))
      .catch(error => {
        if (mounted) setCloudError(error instanceof Error ? error.message : 'Could not restore Supabase session.');
      });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Periodic automatic checkpointing to local IndexedDB
  useEffect(() => {
    if (!autoSync) return;
    const syncInterval = setInterval(async () => {
      try {
        await AmeliaLocalMemoryService.saveSnapshot(currentSnapshot);
        // Only record process memory periodically
        if (currentSnapshot.step % 10 === 0) {
          await AmeliaLocalMemoryService.recordProcessMemory(currentSnapshot);
          setLastSyncTime(new Date().toLocaleTimeString());
        }
      } catch (e) {
        // silent background sync
      }
    }, 4000);

    return () => clearInterval(syncInterval);
  }, [autoSync, currentSnapshot]);

  const handleExportLocalArchive = async () => {
    const archive = await AmeliaIndexedMemory.exportAll();
    const payload = {
      kind: 'AMELIA_LOCAL_MEMORY_ARCHIVE_V1',
      exportedAt: new Date().toISOString(),
      note: 'Local continuity archive; not a signed or tamper-evident research record.',
      stores: archive,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'amelia-local-memory-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleManualCommit = async () => {
    setIsSyncing(true);
    try {
      const memId = await AmeliaLocalMemoryService.recordProcessMemory(currentSnapshot);
      await AmeliaLocalMemoryService.saveSnapshot(currentSnapshot);
      setLastSyncTime(new Date().toLocaleTimeString());
      onLog(`[STORAGE-COMMIT] Substrate Step #${currentSnapshot.step} memory stored locally (ID: ${memId})`);
    } catch (err: any) {
      onLog(`[STORAGE-ERROR] Local commit failed: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCommitCurrentAssays = async () => {
    setIsSyncing(true);
    try {
      // Commit 3-arm run
      const runId = await AmeliaLocalMemoryService.saveCanalizationRun(selectedDepth, selectedSeed, threeArmResults as any);
      
      // Batch commit all P6 results
      let count = 0;
      for (const assay of allP6Results) {
        await AmeliaLocalMemoryService.savePaper6Assay(assay);
        count++;
      }

      onLog(`[STORAGE-ASSAYS] Saved Canalization Run (ID: ${runId}) and ${count} Paper 6 rows locally`);
      
      // Refresh assays
      const updatedP6 = await AmeliaLocalMemoryService.fetchPaper6Assays();
      setP6Assays(updatedP6);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err: any) {
      onLog(`[STORAGE-ERROR] Local assay save failed: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="p-5 rounded-2xl bg-stone-900/70 border border-emerald-900/70 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <CloudCheck className="w-5 h-5 text-emerald-400" /> Supabase Research Memory
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Durable, account-backed copies of Amelia’s runtime checkpoints, dialogue, and assay records. The Numogram substrate remains the source of runtime state and actions.
            </p>
          </div>
          <span className={"px-2.5 py-1 rounded-full text-xs font-mono border " + (cloudSession ? "text-emerald-300 bg-emerald-950/50 border-emerald-800" : "text-stone-400 bg-stone-950 border-stone-700")}>
            {cloudSession ? "ACCOUNT CONNECTED" : "LOCAL ONLY"}
          </span>
        </div>
        {cloudSession ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-stone-300">{cloudSession.user.email || "Authenticated research account"}</span>
            <button onClick={() => void handleCloudSync()} disabled={cloudBusy} className="px-3 py-2 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 text-xs font-semibold">
              {cloudBusy ? "Syncing…" : "Sync now"}
            </button>
            <button onClick={() => void handleCloudSignOut()} disabled={cloudBusy} className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold">
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={handleCloudSignIn} className="flex flex-wrap items-end gap-3">
            <label className="flex-1 min-w-48 text-xs text-stone-400">Account email
              <input type="email" autoComplete="email" value={cloudEmail} onChange={event => setCloudEmail(event.target.value)} required className="mt-1 w-full rounded-lg bg-stone-950 border border-stone-700 px-3 py-2 text-sm text-stone-100" />
            </label>
            <label className="flex-1 min-w-48 text-xs text-stone-400">Password
              <input type="password" autoComplete="current-password" value={cloudPassword} onChange={event => setCloudPassword(event.target.value)} required minLength={8} className="mt-1 w-full rounded-lg bg-stone-950 border border-stone-700 px-3 py-2 text-sm text-stone-100" />
            </label>
            <button type="submit" disabled={cloudBusy} className="px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold">
              {cloudBusy ? "Connecting…" : "Sign in"}
            </button>
            <button type="button" onClick={() => void handleCloudSignUp()} disabled={cloudBusy || !cloudEmail || cloudPassword.length < 8} className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 border border-stone-700 text-xs font-semibold">
              Create account
            </button>
          </form>
        )}
        {(cloudError || cloudMessage) && <p className={"text-xs " + (cloudError ? "text-rose-300" : "text-emerald-300")}>{cloudError || cloudMessage}</p>}
      </section>
      {/* Local Memory & Persistence Card */}
      <div className="p-6 rounded-2xl bg-stone-900/70 border border-stone-800 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-950/40 text-white">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                  Local Constitutive Process Memory
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-950/80 border border-amber-600/80 text-amber-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  ON-DEVICE MEMORY
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono mt-0.5">
                Database: <span className="text-stone-300 font-semibold">IndexedDB</span> • Scope: <span className="text-stone-300 font-semibold">this browser / WebView</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportLocalArchive}
              className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-cyan-400" />
              Export Local Archive
            </button>

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
              Save All Assays Locally
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
            <span className="text-[10px] text-stone-500 font-mono">Local IndexedDB stream</span>
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
          Paper 6 Canary Assays ({p6Assays.length > 0 ? p6Assays.length : allP6Results.length})
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
                No checkpoints stored locally yet. Click "Commit Current Step" above or keep auto-sync active to populate memory records.
              </p>
              <button
                onClick={handleManualCommit}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold font-mono"
              >
                Save First Local Checkpoint
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
                No canalization runs saved locally yet.
              </p>
              <button
                onClick={handleCommitCurrentAssays}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono"
              >
                Save Current 3-Arm Run Locally
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
              Paper 6 Canary Assays (Stored in collection: <code className="text-rose-300">amelia_paper6_assays</code>)
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
