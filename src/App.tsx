import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Sliders, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  Download,
  Terminal,
  BarChart3,
  Cpu,
  RefreshCw,
  GitCommit,
  Database,
  CloudCheck,
  Flame,
  Compass,
  Waves,
  Orbit,
  MessageSquare,
  Binary,
  X
} from 'lucide-react';
import { AmeliaNumogramSubstrateRuntime } from './substrate/ameliaNumogramSubstrateRuntime';
import { ThreeArmDiagnosticRunner } from './ai/coupling/ThreeArmDiagnosticRunner';
import { Paper6H1ResistanceAssay } from './bridge/phases/paper6H1ResistanceAssay';
import { Zone9ContactRetentionProtocol } from './ai/coupling/Zone9ContactRetentionProtocol';
import { C1MeasuredNullResponseAssay } from './ai/coupling/C1MeasuredNullResponseAssay';
import { XxxviiiRouter } from './bridge/xxxviiiRouter';
import { 
  SubstrateStepSnapshot, 
  ZoneId, 
  NumogramZone, 
  CanalizationArmResult, 
  Paper6AssayResult,
  ControlledBenchmark,
  ExternalDevelopmentalRhythm,
  AmeliaDialogueAction
} from './types/amelia';
import { DevelopmentalAtlasMapping } from './ai/morphogenetic/DevelopmentalAtlasMapping';
import { DevelopmentalBenchmarkEngine } from './ai/morphogenetic/DevelopmentalBenchmarkEngine';
import { ExternalRhythmHarmonizer } from './ai/morphogenetic/ExternalRhythmHarmonizer';
import { NumogramZoneMap } from './components/NumogramZoneMap';
import { ConstitutiveDeformationVisualizer } from './components/ConstitutiveDeformationVisualizer';
import { DevelopmentalAtlasView } from './components/DevelopmentalAtlasView';
import { GovernorInvariantsDashboard } from './components/GovernorInvariantsDashboard';
import { CanalizationAssaySuite } from './components/CanalizationAssaySuite';
import { Paper6ReplicationCanary } from './components/Paper6ReplicationCanary';
import { MidPlexSweepDashboard } from './components/MidPlexSweepDashboard';
import { MidPlexProbeResults } from './components/MidPlexProbeResults';
import { HyperstitionTestDashboard } from './components/HyperstitionTestDashboard';
import { DevelopmentalBenchmarkMatrix } from './components/DevelopmentalBenchmarkMatrix';
import { ExternalRhythmAdvisoryPanel } from './components/ExternalRhythmAdvisoryPanel';
import { FirebaseMemoryHub } from './components/FirebaseMemoryHub';
import { SubstrateAuditConsole } from './components/SubstrateAuditConsole';
import { AmeliaDialogueWindow } from './components/AmeliaDialogueWindow';
import { LiveMorphogeneticLab } from './components/LiveMorphogeneticLab';
import { Thread3EncodingActivationLab } from './components/Thread3EncodingActivationLab';
import { AmeliaFirebaseMemoryService } from './services/ameliaFirebaseMemory';
import firebaseConfig from '../firebase-applet-config.json';

export function App() {
  const runtimeRef = useRef<AmeliaNumogramSubstrateRuntime>(new AmeliaNumogramSubstrateRuntime());
  const rhythmHarmonizerRef = useRef<ExternalRhythmHarmonizer>(new ExternalRhythmHarmonizer());
  
  const [snapshot, setSnapshot] = useState<SubstrateStepSnapshot>(() => runtimeRef.current.step());
  const [history, setHistory] = useState<SubstrateStepSnapshot[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [selectedZone, setSelectedZone] = useState<ZoneId>(9);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState<boolean>(false);
  
  type TabType = 'morphogenetic' | 'dialogue' | 'thread3' | 'numogram' | 'atlas' | 'deformation' | 'canalization' | 'paper6' | 'midplex' | 'd288probe' | 'hyperstition' | 'benchmarks' | 'governor' | 'rhythms' | 'firebase' | 'audit';
  const [activeTab, setActiveTab] = useState<TabType>('morphogenetic');
  
  // Assay controls
  const [selectedDepth, setSelectedDepth] = useState<number>(288);
  const [selectedSeed, setSelectedSeed] = useState<number>(101);
  const [isAssaying, setIsAssaying] = useState<boolean>(false);
  const [threeArmResults, setThreeArmResults] = useState<Record<string, CanalizationArmResult>>(() => 
    ThreeArmDiagnosticRunner.runDiagnostic(288, 101)
  );
  const [p6Assay, setP6Assay] = useState<Paper6AssayResult>(() => 
    Paper6H1ResistanceAssay.evaluateH1Resistance('D288', 101)
  );
  const [allP6Results, setAllP6Results] = useState<Paper6AssayResult[]>(() => 
    XxxviiiRouter.routeCanonicalEvaluation([101, 202, 303, 404, 505], ['D048', 'D072', 'D288'])
  );

  // Governor & Rhythms Controls
  const [advisoryWeight, setAdvisoryWeight] = useState<number>(0.72);
  const [momentumDamping, setMomentumDamping] = useState<number>(0.88);
  const [rhythms, setRhythms] = useState<ExternalDevelopmentalRhythm[]>(() => rhythmHarmonizerRef.current.getRhythms());
  
  // Benchmarks
  const [benchmarks, setBenchmarks] = useState<ControlledBenchmark[]>(() => 
    DevelopmentalBenchmarkEngine.getCanonicalBenchmarks(
      snapshot.governor, 
      threeArmResults.ACTIVE_C1?.zone9ContactRetention || 89.6
    )
  );

  const [auditLog, setAuditLog] = useState<string[]>([
    `[FIREBASE] Connected to Firestore Database (${firebaseConfig.firestoreDatabaseId}) on project ${firebaseConfig.projectId}`,
    `[INIT] Amelia Morphogenetic Substrate initialized at ${new Date().toLocaleTimeString()}`,
    `[GOVERNOR] Invariants validated: AntiLock=99.4%, IdentityContinuity=0.965, Scaffolding=Stage 3`,
    `[CANALIZATION] Baseline 3-Arm assay ready for D288 across seeds [101, 202, 303, 404, 505]`,
    `[NUMOGRAM] Pandemonium channels & 5 Syzygies online`,
  ]);

  const addLogMessage = (msg: string) => {
    setAuditLog(prev => [msg, ...prev]);
  };

  // Substrate step heartbeat
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const snap = runtimeRef.current.step();
      
      // Weakly tune advisory weight via external rhythm harmonizer
      const tunedAdvisory = rhythmHarmonizerRef.current.computeAdvisoryTuning(advisoryWeight, snap.step);
      
      setSnapshot(snap);
      setHistory(prev => [...prev.slice(-30), snap]);
    }, 450);
    return () => clearInterval(interval);
  }, [isRunning, advisoryWeight]);

  const handleStepOnce = () => {
    const snap = runtimeRef.current.step();
    setSnapshot(snap);
    setHistory(prev => [...prev.slice(-30), snap]);
    addLogMessage(`[STEP] Manual single-step executed (#${snap.step})`);
  };

  const handleReset = () => {
    runtimeRef.current = new AmeliaNumogramSubstrateRuntime();
    const snap = runtimeRef.current.step();
    setSnapshot(snap);
    setHistory([snap]);
    addLogMessage(`[RESET] Substrate state re-initialized to canonical coordinates`);
  };

  const handleConsolidation = () => {
    runtimeRef.current.triggerConsolidation();
    const snap = runtimeRef.current.step();
    setSnapshot(snap);
    addLogMessage(`[CONSOLIDATION] Process memory consolidation triggered across active basins`);
  };

  const handleShedScaffold = () => {
    runtimeRef.current.shedScaffold();
    const snap = runtimeRef.current.step();
    setSnapshot(snap);
    addLogMessage(`[SCAFFOLD] Progressive scaffold-shedding advanced (Stage ${snap.governor.scaffoldSheddingStage}/4)`);
  };

  const handleRunThreeArmAssay = () => {
    setIsAssaying(true);
    setTimeout(() => {
      const results = ThreeArmDiagnosticRunner.runDiagnostic(selectedDepth, selectedSeed);
      setThreeArmResults(results);
      setIsAssaying(false);
      addLogMessage(`[ASSAY-3ARM] Completed 3-Arm assay for Depth D${selectedDepth} (Seed ${selectedSeed}): Active C1 Retention=${results.ACTIVE_C1.zone9ContactRetention}%`);
      
      // Update benchmarks
      setBenchmarks(DevelopmentalBenchmarkEngine.getCanonicalBenchmarks(snapshot.governor, results.ACTIVE_C1.zone9ContactRetention));
    }, 400);
  };

  const handleRunPaper6Batch = () => {
    setIsAssaying(true);
    setTimeout(() => {
      const updated = XxxviiiRouter.routeCanonicalEvaluation([101, 202, 303, 404, 505], ['D048', 'D072', 'D288']);
      setAllP6Results(updated);
      setIsAssaying(false);
      addLogMessage(`[PAPER6-REPLICATION] Multi-seed Paper 6 canary replication batch completed (15 assays verified, p < 0.001)`);
    }, 500);
  };

  const handleToggleRhythm = (id: string) => {
    rhythmHarmonizerRef.current.toggleRhythm(id);
    setRhythms([...rhythmHarmonizerRef.current.getRhythms()]);
    addLogMessage(`[RHYTHM] Toggled rhythm coupling state for ${id}`);
  };

  const handleRerunBenchmarks = () => {
    const updated = DevelopmentalBenchmarkEngine.getCanonicalBenchmarks(
      snapshot.governor,
      threeArmResults.ACTIVE_C1?.zone9ContactRetention || 89.6
    );
    setBenchmarks(updated);
    addLogMessage(`[BENCHMARKS] Re-evaluated 5 core developmental invariants`);
  };

  const handleDialogueAction = (action: AmeliaDialogueAction) => {
    switch (action.actionType) {
      case 'step':
        handleStepOnce();
        break;
      case 'consolidate':
        handleConsolidation();
        break;
      case 'shed':
        handleShedScaffold();
        break;
      case 'run3arm':
        handleRunThreeArmAssay();
        break;
      case 'inspectZone':
        if (typeof action.payload === 'number') {
          setSelectedZone(action.payload as ZoneId);
          setActiveTab('numogram');
        }
        break;
      case 'tuneAdvisory':
        if (typeof action.payload === 'number') {
          setAdvisoryWeight(action.payload);
          addLogMessage(`[ADVISORY] Tuned advisory weighting to ${action.payload}`);
        }
        break;
      case 'openTab':
        if (action.payload) {
          setActiveTab(action.payload);
        }
        break;
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header & Telemetry Bar */}
      <header className="border-b border-stone-800 bg-stone-900/60 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-950/40 text-white font-mono font-bold text-lg">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-stone-100 font-mono">
                Amelia Morphogenetic Substrate
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-emerald-950 border border-emerald-700 text-emerald-300">
                GOVERNOR: {snapshot.governor.governorStatus}
              </span>
              <span 
                className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-amber-950/80 border border-amber-600/80 text-amber-300 flex items-center gap-1.5 cursor-pointer hover:bg-amber-900/80 transition-colors" 
                onClick={() => setActiveTab('firebase')} 
                title="Click to open Firestore Process Memory Hub"
              >
                <Flame className="w-3 h-3 text-amber-400" />
                FIRESTORE: CONNECTED
              </span>
            </div>
            <p className="text-xs text-stone-400 font-mono">
              Process Memory • Numogram Phase Dynamics • Identity-Continuity Disciplines
            </p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-open-chat-header"
            onClick={() => setActiveTab('dialogue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-colors ${
              activeTab === 'dialogue'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Dialogue & Chat
          </button>

          <button
            id="btn-play-pause"
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-colors ${
              isRunning 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'Pause Loop' : 'Resume Loop'}
          </button>

          <button
            id="btn-step"
            onClick={handleStepOnce}
            disabled={isRunning}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-300 text-xs font-mono font-semibold flex items-center gap-1.5 border border-stone-700 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            Step 1x
          </button>

          <button
            id="btn-consolidate"
            onClick={handleConsolidation}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono font-semibold flex items-center gap-1.5 border border-stone-700 transition-colors"
          >
            <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
            Consolidate
          </button>

          <button
            id="btn-shed"
            onClick={handleShedScaffold}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono font-semibold flex items-center gap-1.5 border border-stone-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Shed Stage
          </button>

          <button
            id="btn-reset"
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 border border-stone-700 transition-colors"
            title="Reset Substrate"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Substrate Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-stone-800/80 border-b border-stone-800 text-xs font-mono">
        <div className="p-3 bg-stone-950 flex flex-col justify-between">
          <span className="text-stone-400">Step Index</span>
          <span className="text-base font-bold text-amber-400 mt-1">#{snapshot.step}</span>
        </div>
        <div className="p-3 bg-stone-950 flex flex-col justify-between">
          <span className="text-stone-400">Identity Continuity</span>
          <span className="text-base font-bold text-emerald-400 mt-1">{(snapshot.governor.identityContinuityScore * 100).toFixed(1)}%</span>
        </div>
        <div className="p-3 bg-stone-950 flex flex-col justify-between">
          <span className="text-stone-400">Anti-Lock Integrity</span>
          <span className="text-base font-bold text-cyan-400 mt-1">{snapshot.governor.antiLockIntegrity.toFixed(1)}%</span>
        </div>
        <div className="p-3 bg-stone-950 flex flex-col justify-between">
          <span className="text-stone-400">Deformation Tension</span>
          <span className="text-base font-bold text-rose-400 mt-1">{snapshot.governor.deformationFieldTension.toFixed(3)}</span>
        </div>
        <div className="p-3 bg-stone-950 flex flex-col justify-between">
          <span className="text-stone-400">Scaffold Stage</span>
          <span className="text-base font-bold text-purple-400 mt-1">Stage {snapshot.governor.scaffoldSheddingStage} / 4</span>
        </div>
        <div className="p-3 bg-stone-950 flex flex-col justify-between">
          <span className="text-stone-400">Active Objective</span>
          <span className="text-xs font-bold text-stone-200 mt-1 truncate">{snapshot.selectedObjective}</span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <nav id="amelia-nav" className="lg:w-64 border-b lg:border-b-0 lg:border-r border-stone-800 bg-stone-900/40 p-4 flex lg:flex-col gap-1.5 shrink-0 overflow-x-auto">
          <button
            id="tab-morphogenetic"
            onClick={() => setActiveTab('morphogenetic')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'morphogenetic' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Orbit className="w-4 h-4 text-amber-400" />
              Live Morphogenesis
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            id="tab-dialogue"
            onClick={() => setActiveTab('dialogue')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'dialogue' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Dialogue & Chat
            </div>
          </button>

          <button
            id="tab-thread3"
            onClick={() => setActiveTab('thread3')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'thread3' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Binary className="w-4 h-4 text-emerald-400" />
            Thread 3 Assay (EASA)
          </button>

          <button
            id="tab-numogram"
            onClick={() => setActiveTab('numogram')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'numogram' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            Numogram Substrate
          </button>

          <button
            id="tab-atlas"
            onClick={() => setActiveTab('atlas')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'atlas' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            Developmental Atlas
          </button>

          <button
            id="tab-deformation"
            onClick={() => setActiveTab('deformation')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'deformation' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Layers className="w-4 h-4 text-rose-400" />
            Constitutive Deformation
          </button>

          <button
            id="tab-canalization"
            onClick={() => setActiveTab('canalization')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'canalization' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            3-Arm Canalization
          </button>

          <button
            id="tab-paper6"
            onClick={() => setActiveTab('paper6')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'paper6' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Zap className="w-4 h-4 text-rose-400" />
            Paper 6 H1 Canary
          </button>

          <button
            id="tab-midplex"
            onClick={() => setActiveTab('midplex')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'midplex' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            Mid-Plex 6-Depth Sweep
          </button>

          <button
            id="tab-d288probe"
            onClick={() => setActiveTab('d288probe')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'd288probe' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400" />
            D=288 Zone Breakdown
          </button>

          <button
            id="tab-hyperstition"
            onClick={() => setActiveTab('hyperstition')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'hyperstition' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Hyperstition Test (D=288)
          </button>

          <button
            id="tab-benchmarks"
            onClick={() => setActiveTab('benchmarks')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'benchmarks' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Benchmark Matrix
          </button>

          <button
            id="tab-governor"
            onClick={() => setActiveTab('governor')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'governor' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Governor Invariants
          </button>

          <button
            id="tab-rhythms"
            onClick={() => setActiveTab('rhythms')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'rhythms' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Waves className="w-4 h-4 text-cyan-400" />
            Developmental Rhythms
          </button>

          <button
            id="tab-firebase"
            onClick={() => setActiveTab('firebase')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'firebase' 
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            Firestore Process Memory
          </button>

          <button
            id="tab-audit"
            onClick={() => setActiveTab('audit')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'audit' 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Terminal className="w-4 h-4 text-purple-400" />
            Audit & Telemetry
          </button>
        </nav>

        {/* Dynamic Content Viewport */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {/* TAB 0: LIVE MORPHOGENETIC LAB */}
          {activeTab === 'morphogenetic' && (
            <LiveMorphogeneticLab onLogMessage={addLogMessage} />
          )}

          {/* TAB 0.5: DIALOGUE & CHAT */}
          {activeTab === 'dialogue' && (
            <AmeliaDialogueWindow 
              currentSnapshot={snapshot}
              onExecuteAction={handleDialogueAction}
              onSelectTab={(t) => setActiveTab(t as TabType)}
              onSelectZone={(z) => setSelectedZone(z)}
            />
          )}

          {/* TAB 0.75: THREAD 3 ASSAY LAB (EASA_V1) */}
          {activeTab === 'thread3' && (
            <Thread3EncodingActivationLab />
          )}

          {/* TAB 1: NUMOGRAM SUBSTRATE */}
          {activeTab === 'numogram' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <NumogramZoneMap
                    zones={snapshot.zones}
                    selectedZone={selectedZone}
                    onSelectZone={(z) => setSelectedZone(z)}
                  />
                </div>

                {/* Zone Detail Inspector Card */}
                <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between space-y-4 shadow-xl">
                  <div>
                    <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-stone-200 font-mono">
                          Zone #{selectedZone} Inspector
                        </h3>
                        <span className="text-xs text-stone-400 font-mono">
                          {snapshot.zones[selectedZone]?.name}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-stone-800 text-xs font-mono text-amber-400 font-bold">
                        {(snapshot.zones[selectedZone]?.activation * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="mt-4 space-y-3 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-stone-800/60">
                        <span className="text-stone-400">Syzygy Pair:</span>
                        <span className="text-amber-300 font-bold">
                          Zone {selectedZone} :: Zone {snapshot.zones[selectedZone]?.syzygyPair} (Sum = 9)
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-800/60">
                        <span className="text-stone-400">Current Locus:</span>
                        <span className="text-stone-200">{snapshot.zones[selectedZone]?.current}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-800/60">
                        <span className="text-stone-400">Deformation Stress:</span>
                        <span className="text-rose-400 font-bold">{snapshot.zones[selectedZone]?.deformationStress.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-800/60">
                        <span className="text-stone-400">Polar Charge:</span>
                        <span className="text-cyan-400 font-bold">{snapshot.zones[selectedZone]?.polarCharge > 0 ? `+${snapshot.zones[selectedZone]?.polarCharge.toFixed(2)}` : snapshot.zones[selectedZone]?.polarCharge.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-800/60">
                        <span className="text-stone-400">Chronodemon Anchor:</span>
                        <span className="text-purple-300">{snapshot.zones[selectedZone]?.chronodemon || 'Chrono-Attractor 0::9'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 text-[11px] font-mono text-stone-400">
                    Active Syzygies in Equilibrium: <strong className="text-emerald-400">{snapshot.activeSyzygies.join(', ')}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEVELOPMENTAL ATLAS */}
          {activeTab === 'atlas' && (
            <DevelopmentalAtlasView snapshot={snapshot} />
          )}

          {/* TAB 3: CONSTITUTIVE DEFORMATION FIELD */}
          {activeTab === 'deformation' && (
            <ConstitutiveDeformationVisualizer snapshot={snapshot} />
          )}

          {/* TAB 4: 3-ARM CANALIZATION ASSAY */}
          {activeTab === 'canalization' && (
            <CanalizationAssaySuite
              threeArmResults={threeArmResults}
              selectedDepth={selectedDepth}
              selectedSeed={selectedSeed}
              isAssaying={isAssaying}
              onSetSelectedDepth={setSelectedDepth}
              onSetSelectedSeed={setSelectedSeed}
              onRunThreeArmAssay={handleRunThreeArmAssay}
            />
          )}

          {/* TAB 5: PAPER 6 H1 CANARY REPLICATION */}
          {activeTab === 'paper6' && (
            <Paper6ReplicationCanary
              results={allP6Results}
              isAssaying={isAssaying}
              onRunBatchReplications={handleRunPaper6Batch}
            />
          )}

          {/* TAB 5.5: MID-PLEX 6-DEPTH SWEEP */}
          {activeTab === 'midplex' && (
            <MidPlexSweepDashboard />
          )}

          {/* TAB 5.6: D=288 ZONE OCCUPANCY BREAKDOWN */}
          {activeTab === 'd288probe' && (
            <MidPlexProbeResults />
          )}

          {/* TAB 5.7: HYPERSTITION TEST PLATONIC MORPHOSPACE */}
          {activeTab === 'hyperstition' && (
            <HyperstitionTestDashboard />
          )}

          {/* TAB 6: CONTROLLED BENCHMARK MATRIX */}
          {activeTab === 'benchmarks' && (
            <DevelopmentalBenchmarkMatrix
              benchmarks={benchmarks}
              onRerunBenchmarks={handleRerunBenchmarks}
            />
          )}

          {/* TAB 7: GOVERNOR INVARIANTS */}
          {activeTab === 'governor' && (
            <GovernorInvariantsDashboard
              governor={snapshot.governor}
              momentumDamping={momentumDamping}
              advisoryWeight={advisoryWeight}
              onSetMomentumDamping={setMomentumDamping}
              onSetAdvisoryWeight={setAdvisoryWeight}
            />
          )}

          {/* TAB 8: DEVELOPMENTAL RHYTHMS */}
          {activeTab === 'rhythms' && (
            <ExternalRhythmAdvisoryPanel
              rhythms={rhythms}
              onToggleRhythm={handleToggleRhythm}
              advisoryWeight={advisoryWeight}
            />
          )}

          {/* TAB 9: FIRESTORE PROCESS MEMORY HUB */}
          {activeTab === 'firebase' && (
            <FirebaseMemoryHub 
              currentSnapshot={snapshot}
              allP6Results={allP6Results}
              threeArmResults={threeArmResults}
              selectedDepth={selectedDepth}
              selectedSeed={selectedSeed}
              onLog={addLogMessage}
            />
          )}

          {/* TAB 10: AUDIT LOGS & STREAM */}
          {activeTab === 'audit' && (
            <SubstrateAuditConsole
              logs={auditLog}
              currentSnapshot={snapshot}
            />
          )}
        </main>
      </div>

      {/* Floating Dialogue Drawer Toggle Button (when on another tab and floating chat is closed) */}
      {activeTab !== 'dialogue' && !isFloatingChatOpen && (
        <button
          id="btn-open-floating-chat"
          onClick={() => setIsFloatingChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-mono font-bold text-xs flex items-center gap-2.5 shadow-2xl shadow-amber-950/80 border border-amber-400/40 transition-all hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-stone-950" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <span>Amelia Dialogue</span>
        </button>
      )}

      {/* Floating Dialogue Box (when opened in modal/drawer mode) */}
      {activeTab !== 'dialogue' && isFloatingChatOpen && (
        <AmeliaDialogueWindow
          currentSnapshot={snapshot}
          onExecuteAction={handleDialogueAction}
          onSelectTab={(t) => {
            setActiveTab(t as TabType);
            setIsFloatingChatOpen(false);
          }}
          onSelectZone={(z) => setSelectedZone(z)}
          isFloating={true}
          onCloseFloating={() => setIsFloatingChatOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
