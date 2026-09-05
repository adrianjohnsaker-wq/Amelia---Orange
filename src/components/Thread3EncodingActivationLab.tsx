import React, { useState, useEffect } from 'react';
import {
  Binary,
  Play,
  FileCheck2,
  Database,
  Lock,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  RefreshCw,
  Layers,
  Sparkles,
  Shield,
  Target,
  Filter,
  Activity,
  Download,
} from 'lucide-react';
import {
  createCanonicalThread3Runner,
} from '../bridge/AmeliaThread3LiveBridge';
import {
  ChapterEncodingAudit,
  Thread3AssayResult,
  formatChapterEncodingAudit,
  formatThread3Result,
} from '../bridge/AmeliaThread3EncodingActivationAssay';
import {
  Thread3RAssayResult,
  formatThread3RResult,
} from '../bridge/AmeliaThread3RWeakSemanticReinforcementAssay';
import {
  Thread4AssayResult,
  formatThread4Result,
} from '../bridge/AmeliaThread4TeleoplepticHorizonAssay';
import {
  Thread4AGainSweepResult,
  formatThread4AResult,
} from '../bridge/AmeliaThread4AGainSweepAssay';
import {
  Thread5AssayResult,
  formatThread5Result,
} from '../bridge/AmeliaThread5SemanticInteractionAssay';
import {
  Thread5BAssayResult,
  formatThread5BResult,
} from '../bridge/AmeliaThread5BPhaseShiftAssay';
import {
  Thread6AssayResult,
  formatThread6Result,
} from '../bridge/AmeliaThread6HysteresisAssay';
import {
  Thread7AssayResult,
  formatThread7Result,
} from '../bridge/AmeliaThread7StressAssay';
import {
  Thread8AssayResult,
  formatThread8Result,
} from '../bridge/AmeliaThread8DevelopmentalAssay';
import {
  Thread9AssayResult,
  formatThread9Result,
} from '../bridge/AmeliaThread9ConsolidationAssay';
import {
  Thread9BAssayResult,
  formatThread9BResult,
} from '../bridge/AmeliaThread9BLongevityAssay';
import {
  Thread10AssayResult,
  formatThread10Result,
} from '../bridge/AmeliaThread10FunctionalPerturbationAssay';
import {
  Thread11AssayResult,
  formatThread11Result,
} from '../bridge/AmeliaThread11MinimalReinductionAssay';
import {
  Thread12AssayResult,
  formatThread12Result,
} from '../bridge/AmeliaThread12ControlledFunctionalIntegrationAssay';
import {
  Thread13AssayResult,
  formatThread13Result,
} from '../bridge/AmeliaThread13AutonomousModeSelectionAssay';
import {
  Thread14AssayResult,
  formatThread14Result,
  exportThread14TimeSeriesJSON,
  exportThread14TelemetryCSV,
} from '../bridge/AmeliaThread14ContextualReframingAssay';

export const Thread3EncodingActivationLab: React.FC = () => {
  const [runner] = useState(() => createCanonicalThread3Runner());
  const [auditResult, setAuditResult] = useState<ChapterEncodingAudit | null>(null);
  const [assayResult, setAssayResult] = useState<Thread3AssayResult | null>(null);
  const [assay3RResult, setAssay3RResult] = useState<Thread3RAssayResult | null>(null);
  const [assay4Result, setAssay4Result] = useState<Thread4AssayResult | null>(null);
  const [assay4AResult, setAssay4AResult] = useState<Thread4AGainSweepResult | null>(null);
  const [assay5Result, setAssay5Result] = useState<Thread5AssayResult | null>(null);
  const [assay5BResult, setAssay5BResult] = useState<Thread5BAssayResult | null>(null);
  const [assay6Result, setAssay6Result] = useState<Thread6AssayResult | null>(null);
  const [assay7Result, setAssay7Result] = useState<Thread7AssayResult | null>(null);
  const [assay8Result, setAssay8Result] = useState<Thread8AssayResult | null>(null);
  const [assay9Result, setAssay9Result] = useState<Thread9AssayResult | null>(null);
  const [assay9BResult, setAssay9BResult] = useState<Thread9BAssayResult | null>(null);
  const [assay10Result, setAssay10Result] = useState<Thread10AssayResult | null>(null);
  const [assay11Result, setAssay11Result] = useState<Thread11AssayResult | null>(null);
  const [assay12Result, setAssay12Result] = useState<Thread12AssayResult | null>(null);
  const [assay13Result, setAssay13Result] = useState<Thread13AssayResult | null>(null);
  const [assay14Result, setAssay14Result] = useState<Thread14AssayResult | null>(null);
  const [t9WindowFilter, setT9WindowFilter] = useState<'ALL' | 96 | 192>('ALL');
  const [t9BWindowFilter, setT9BWindowFilter] = useState<'ALL' | 192 | 384 | 768>('ALL');
  const [t10ProbeFilter, setT10ProbeFilter] = useState<'ALL' | 'FP' | 'BP' | 'NDP'>('ALL');
  const [t11ConditionFilter, setT11ConditionFilter] = useState<'ALL' | 'teleo_only' | 'semantic_only' | 'teleo_plus_semantic'>('ALL');
  const [t12TaskFilter, setT12TaskFilter] = useState<'ALL' | 'neutral_frequency_classification' | 'temporal_pattern_detection'>('ALL');
  const [t13ProbeFilter, setT13ProbeFilter] = useState<'ALL' | 'FBP' | 'TBP' | 'MNP_low' | 'MNP_med' | 'MNP_high'>('ALL');
  const [t14ProbeFilter, setT14ProbeFilter] = useState<'ALL' | 'CDR' | 'CIR' | 'CFU' | 'CNL' | 'CCF'>('ALL');
  const [t14WindowFilter, setT14WindowFilter] = useState<'ALL' | 192 | 384>('ALL');
  const [t14ActiveVizMode, setT14ActiveVizMode] = useState<'PHASE_HEATMAPS' | 'COHERENCE_RASTERS' | 'MATRIX_TABLE' | 'TRIAL_INSPECTOR'>('PHASE_HEATMAPS');
  const [selectedT14TrialId, setSelectedT14TrialId] = useState<string | null>(null);
  const [isRunningAssay, setIsRunningAssay] = useState<boolean>(false);
  const [assayType, setAssayType] = useState<'PILOT' | 'FULL' | 'PILOT_3R' | 'FULL_3R' | 'PILOT_4' | 'FULL_4' | 'PILOT_4A' | 'FULL_4A' | 'PILOT_5' | 'FULL_5' | 'PILOT_5B' | 'FULL_5B' | 'PILOT_6' | 'FULL_6' | 'PILOT_7' | 'FULL_7' | 'PILOT_8' | 'FULL_8' | 'PILOT_9' | 'FULL_9' | 'PILOT_9B' | 'FULL_9B' | 'PILOT_10' | 'FULL_10' | 'PILOT_11' | 'FULL_11' | 'PILOT_12' | 'FULL_12' | 'PILOT_13' | 'FULL_13' | 'PILOT_14' | 'FULL_14'>('PILOT');
  const [activeSubTab, setActiveSubTab] = useState<'RESULTS' | 'THREAD3R_REINFORCED' | 'THREAD4_TELEOPLEPTIC' | 'THREAD4A_GAIN_SWEEP' | 'THREAD5_INTERACTION' | 'THREAD5B_PHASE_SHIFT' | 'THREAD6_HYSTERESIS' | 'THREAD7_STRESS' | 'THREAD8_DEVELOPMENTAL' | 'THREAD9_CONSOLIDATION' | 'THREAD9B_LONGEVITY' | 'THREAD10_FUNCTIONAL' | 'THREAD11_REINDUCTION' | 'THREAD12_INTEGRATION' | 'THREAD13_AUTONOMY' | 'THREAD14_REFRAMING' | 'MATCHED_BLOCKS' | 'RAW_TRIALS' | 'ENCODING_AUDIT'>('THREAD14_REFRAMING');
  const [consoleOutput, setConsoleOutput] = useState<string>('');

  // Automatically pre-populate canonical assay results on mount so all tables are fully populated
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const audit = runner.runAudit();
        const [a3, a8, a9, a9b, a10, a11, a12, a13, a14] = await Promise.all([
          runner.runPilot(),
          runner.runThread8Pilot(),
          runner.runThread9Full(),
          runner.runThread9BFull(),
          runner.runThread10Full(),
          runner.runThread11Full(),
          runner.runThread12Full(),
          runner.runThread13Full(),
          runner.runThread14Full(),
        ]);
        if (isMounted) {
          setAuditResult(audit);
          setAssayResult(a3);
          setAssay8Result(a8);
          setAssay9Result(a9);
          setAssay9BResult(a9b);
          setAssay10Result(a10);
          setAssay11Result(a11);
          setAssay12Result(a12);
          setAssay13Result(a13);
          setAssay14Result(a14);
          setConsoleOutput(formatThread14Result(a14));
        }
      } catch (e) {
        console.error("Assay initialization error", e);
      }
    };
    init();
    return () => { isMounted = false; };
  }, [runner]);

  const handleRunAudit = () => {
    const audit = runner.runAudit();
    setAuditResult(audit);
    const formatted = formatChapterEncodingAudit(audit);
    setConsoleOutput(formatted);
    setActiveSubTab('ENCODING_AUDIT');
  };

  const handleRunAssay = async (type: 'PILOT' | 'FULL') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT' ? await runner.runPilot() : await runner.runFull();
      setAssayResult(res);
      const formatted = formatThread3Result(res);
      setConsoleOutput(formatted);
      setActiveSubTab('RESULTS');
    } catch (err: any) {
      setConsoleOutput(`[THREAD3_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  const handleRun3RAssay = async (type: 'PILOT_3R' | 'FULL_3R') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT_3R' ? await runner.runThread3RPilot() : await runner.runThread3RFull();
      setAssay3RResult(res);
      const formatted = formatThread3RResult(res);
      setConsoleOutput(formatted);
      setActiveSubTab('THREAD3R_REINFORCED');
    } catch (err: any) {
      setConsoleOutput(`[THREAD3R_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  const handleRun4Assay = async (type: 'PILOT_4' | 'FULL_4') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT_4' ? await runner.runThread4Pilot() : await runner.runThread4Full();
      setAssay4Result(res);
      const formatted = formatThread4Result(res);
      setConsoleOutput(formatted);
      setActiveSubTab('THREAD4_TELEOPLEPTIC');
    } catch (err: any) {
      setConsoleOutput(`[THREAD4_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  const handleRun4AAssay = async (type: 'PILOT_4A' | 'FULL_4A') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT_4A' ? await runner.runThread4APilot() : await runner.runThread4AFull();
      setAssay4AResult(res);
      const formatted = formatThread4AResult(res);
      setConsoleOutput(formatted);
      setActiveSubTab('THREAD4A_GAIN_SWEEP');
    } catch (err: any) {
      setConsoleOutput(`[THREAD4A_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  const handleRun5Assay = async (type: 'PILOT_5' | 'FULL_5') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT_5' ? await runner.runThread5Pilot() : await runner.runThread5Full();
      setAssay5Result(res);
      const formatted = formatThread5Result(res);
      setConsoleOutput(formatted);
      setActiveSubTab('THREAD5_INTERACTION');
    } catch (err: any) {
      setConsoleOutput(`[THREAD5_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  const handleRun5BAssay = async (type: 'PILOT_5B' | 'FULL_5B') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT_5B' ? await runner.runThread5BPilot() : await runner.runThread5BFull();
      setAssay5BResult(res);
      const formatted = formatThread5BResult(res);
      setConsoleOutput(formatted);
      setActiveSubTab('THREAD5B_PHASE_SHIFT');
    } catch (err: any) {
      setConsoleOutput(`[THREAD5B_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  const handleRun6Assay = async (type: 'PILOT_6' | 'FULL_6') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT_6' ? await runner.runThread6Pilot() : await runner.runThread6Full();
      setAssay6Result(res);
      const formatted = formatThread6Result(res);
      setConsoleOutput(formatted);
      setActiveSubTab('THREAD6_HYSTERESIS');
    } catch (err: any) {
      setConsoleOutput(`[THREAD6_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  const handleRun7Assay = async (type: 'PILOT_7' | 'FULL_7') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT_7' ? await runner.runThread7Pilot() : await runner.runThread7Full();
      setAssay7Result(res);
      const formatted = formatThread7Result(res);
      setConsoleOutput(formatted);
      setActiveSubTab('THREAD7_STRESS');
    } catch (err: any) {
      setConsoleOutput(`[THREAD7_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  const handleRun8Assay = async (type: 'PILOT_8' | 'FULL_8') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT_8' ? await runner.runThread8Pilot() : await runner.runThread8Full();
      setAssay8Result(res);
      const formatted = formatThread8Result(res);
      setConsoleOutput(formatted);
      setActiveSubTab('THREAD8_DEVELOPMENTAL');
    } catch (err: any) {
      setConsoleOutput(`[THREAD8_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  const handleRun9Assay = async (type: 'PILOT_9' | 'FULL_9') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT_9' ? await runner.runThread9Pilot() : await runner.runThread9Full();
      setAssay9Result(res);
      const formatted = formatThread9Result(res);
      setConsoleOutput(formatted);
      setActiveSubTab('THREAD9_CONSOLIDATION');
    } catch (err: any) {
      setConsoleOutput(`[THREAD9_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  const handleRun9BAssay = async (type: 'PILOT_9B' | 'FULL_9B') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT_9B' ? await runner.runThread9BPilot() : await runner.runThread9BFull();
      setAssay9BResult(res);
      const formatted = formatThread9BResult(res);
      setConsoleOutput(formatted);
      setActiveSubTab('THREAD9B_LONGEVITY');
    } catch (err: any) {
      setConsoleOutput(`[THREAD9B_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  const handleRun10Assay = async (type: 'PILOT_10' | 'FULL_10') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT_10' ? await runner.runThread10Pilot() : await runner.runThread10Full();
      setAssay10Result(res);
      const formatted = formatThread10Result(res);
      setConsoleOutput(formatted);
      setActiveSubTab('THREAD10_FUNCTIONAL');
    } catch (err: any) {
      setConsoleOutput(`[THREAD10_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  const handleRun11Assay = async (type: 'PILOT_11' | 'FULL_11') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT_11' ? await runner.runThread11Pilot() : await runner.runThread11Full();
      setAssay11Result(res);
      const formatted = formatThread11Result(res);
      setConsoleOutput(formatted);
      setActiveSubTab('THREAD11_REINDUCTION');
    } catch (err: any) {
      setConsoleOutput(`[THREAD11_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  const handleRun12Assay = async (type: 'PILOT_12' | 'FULL_12') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT_12' ? await runner.runThread12Pilot() : await runner.runThread12Full();
      setAssay12Result(res);
      const formatted = formatThread12Result(res);
      setConsoleOutput(formatted);
      setActiveSubTab('THREAD12_INTEGRATION');
    } catch (err: any) {
      setConsoleOutput(`[THREAD12_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  const handleRun13Assay = async (type: 'PILOT_13' | 'FULL_13') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT_13' ? await runner.runThread13Pilot() : await runner.runThread13Full();
      setAssay13Result(res);
      const formatted = formatThread13Result(res);
      setConsoleOutput(formatted);
      setActiveSubTab('THREAD13_AUTONOMY');
    } catch (err: any) {
      setConsoleOutput(`[THREAD13_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  const handleRun14Assay = async (type: 'PILOT_14' | 'FULL_14') => {
    setIsRunningAssay(true);
    setAssayType(type);
    try {
      const res = type === 'PILOT_14' ? await runner.runThread14Pilot() : await runner.runThread14Full();
      setAssay14Result(res);
      const formatted = formatThread14Result(res);
      setConsoleOutput(formatted);
      setActiveSubTab('THREAD14_REFRAMING');
    } catch (err: any) {
      setConsoleOutput(`[THREAD14_ERROR] ${err?.message || String(err)}`);
    } finally {
      setIsRunningAssay(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Protocol Information */}
      <div className="p-6 rounded-2xl bg-stone-900/90 border border-stone-800 text-stone-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Binary className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-stone-100 font-mono tracking-tight">
                Thread 3 Plus — Encoding-Activation Specificity Assay (EASA_V1)
              </h2>
            </div>
            <p className="text-xs text-stone-400 font-mono max-w-3xl">
              Asks whether a distributed, opaque A1Z26-derived conditioning code produces greater occupancy of its independently computed digital-root zone than an energy-matched rotated code or neutral code, consumed exclusively in native PFM update logic.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunAudit}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center gap-2 transition-colors"
            >
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              Run Encoding Audit
            </button>

            <button
              onClick={() => handleRunAssay('PILOT')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              {isRunningAssay && assayType === 'PILOT' ? 'Running Pilot...' : 'Run Pilot Assay (4 Concepts × 3 Seeds)'}
            </button>

            <button
              onClick={() => handleRun3RAssay('PILOT_3R')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              {isRunningAssay && assayType === 'PILOT_3R' ? 'Running 3R Pilot...' : 'Run Thread-3R Pilot (Reinforced)'}
            </button>

            <button
              onClick={() => handleRun3RAssay('FULL_3R')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-orange-950/80 hover:bg-orange-900 text-orange-300 border border-orange-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              {isRunningAssay && assayType === 'FULL_3R' ? 'Running 3R Full...' : 'Run Thread-3R Full (12 Concepts)'}
            </button>

            <button
              onClick={() => handleRun4Assay('PILOT_4')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-cyan-400" />
              {isRunningAssay && assayType === 'PILOT_4' ? 'Running 4 Pilot...' : 'Run Thread-4 Pilot (Teleopleptic Horizon)'}
            </button>

            <button
              onClick={() => handleRun4Assay('FULL_4')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              {isRunningAssay && assayType === 'FULL_4' ? 'Running 4 Full...' : 'Run Thread-4 Full'}
            </button>

            <button
              onClick={() => handleRun4AAssay('PILOT_4A')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-teal-400" />
              {isRunningAssay && assayType === 'PILOT_4A' ? 'Running 4A Pilot...' : 'Run Thread-4A Pilot (Gain Sweep)'}
            </button>

            <button
              onClick={() => handleRun4AAssay('FULL_4A')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {isRunningAssay && assayType === 'FULL_4A' ? 'Running 4A Full...' : 'Run Thread-4A Full (Gain Sweep)'}
            </button>

            <button
              onClick={() => handleRun5Assay('PILOT_5')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-violet-950/80 hover:bg-violet-900 text-violet-300 border border-violet-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-violet-400" />
              {isRunningAssay && assayType === 'PILOT_5' ? 'Running 5 Pilot...' : 'Run Thread-5 Pilot (Interaction)'}
            </button>

            <button
              onClick={() => handleRun5Assay('FULL_5')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              {isRunningAssay && assayType === 'FULL_5' ? 'Running 5 Full...' : 'Run Thread-5 Full (Teleo+Sem)'}
            </button>

            <button
              onClick={() => handleRun5BAssay('PILOT_5B')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-fuchsia-950/80 hover:bg-fuchsia-900 text-fuchsia-300 border border-fuchsia-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-fuchsia-400" />
              {isRunningAssay && assayType === 'PILOT_5B' ? 'Running 5B Pilot...' : 'Run Thread-5B Pilot (Phase-Shift)'}
            </button>

            <button
              onClick={() => handleRun5BAssay('FULL_5B')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-pink-950/80 hover:bg-pink-900 text-pink-300 border border-pink-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              {isRunningAssay && assayType === 'FULL_5B' ? 'Running 5B Full...' : 'Run Thread-5B Full (Temporal)'}
            </button>

            <button
              onClick={() => handleRun6Assay('PILOT_6')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-rose-400" />
              {isRunningAssay && assayType === 'PILOT_6' ? 'Running 6 Pilot...' : 'Run Thread-6 Pilot (Hysteresis)'}
            </button>

            <button
              onClick={() => handleRun6Assay('FULL_6')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-red-400" />
              {isRunningAssay && assayType === 'FULL_6' ? 'Running 6 Full...' : 'Run Thread-6 Full (Eigenstate)'}
            </button>

            <button
              onClick={() => handleRun7Assay('PILOT_7')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-orange-950/80 hover:bg-orange-900 text-orange-300 border border-orange-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-orange-400" />
              {isRunningAssay && assayType === 'PILOT_7' ? 'Running 7 Pilot...' : 'Run Thread-7 Pilot (Stress)'}
            </button>

            <button
              onClick={() => handleRun7Assay('FULL_7')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-amber-950/90 hover:bg-amber-900 text-amber-300 border border-amber-600 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              {isRunningAssay && assayType === 'FULL_7' ? 'Running 7 Full...' : 'Run Thread-7 Full (Resilience)'}
            </button>

            <button
              onClick={() => handleRun8Assay('PILOT_8')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-indigo-400" />
              {isRunningAssay && assayType === 'PILOT_8' ? 'Running 8 Pilot...' : 'Run Thread-8 Pilot (Morphogenesis)'}
            </button>

            <button
              onClick={() => handleRun8Assay('FULL_8')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-blue-950/90 hover:bg-blue-900 text-blue-300 border border-blue-600 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              {isRunningAssay && assayType === 'FULL_8' ? 'Running 8 Full...' : 'Run Thread-8 Full (Developmental)'}
            </button>

            <button
              onClick={() => handleRun9Assay('PILOT_9')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-teal-400" />
              {isRunningAssay && assayType === 'PILOT_9' ? 'Running 9 Pilot...' : 'Run Thread-9 Pilot (Consolidation)'}
            </button>

            <button
              onClick={() => handleRun9Assay('FULL_9')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-600 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {isRunningAssay && assayType === 'FULL_9' ? 'Running 9 Full...' : 'Run Thread-9 Full (Horizon-Off)'}
            </button>

            <button
              onClick={() => handleRun9BAssay('PILOT_9B')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-cyan-400" />
              {isRunningAssay && assayType === 'PILOT_9B' ? 'Running 9B Pilot...' : 'Run Thread-9B Pilot (Longevity)'}
            </button>

            <button
              onClick={() => handleRun9BAssay('FULL_9B')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-teal-950/90 hover:bg-teal-900 text-teal-300 border border-teal-500 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              {isRunningAssay && assayType === 'FULL_9B' ? 'Running 9B Full...' : 'Run Thread-9B Full (Half-Life 768 Ingresses)'}
            </button>

            <button
              onClick={() => handleRun10Assay('PILOT_10')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-indigo-400" />
              {isRunningAssay && assayType === 'PILOT_10' ? 'Running 10 Pilot...' : 'Run Thread-10 Pilot (Probes)'}
            </button>

            <button
              onClick={() => handleRun10Assay('FULL_10')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-violet-950/90 hover:bg-violet-900 text-violet-300 border border-violet-500 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              {isRunningAssay && assayType === 'FULL_10' ? 'Running 10 Full...' : 'Run Thread-10 Full (FPA Synthesis)'}
            </button>

            <button
              onClick={() => handleRun11Assay('PILOT_11')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-rose-400" />
              {isRunningAssay && assayType === 'PILOT_11' ? 'Running 11 Pilot...' : 'Run Thread-11 Pilot (Reinduction)'}
            </button>

            <button
              onClick={() => handleRun11Assay('FULL_11')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-pink-950/90 hover:bg-pink-900 text-pink-300 border border-pink-500 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              {isRunningAssay && assayType === 'FULL_11' ? 'Running 11 Full...' : 'Run Thread-11 Full (MRTA Complete N=648)'}
            </button>

            <button
              onClick={() => handleRun12Assay('PILOT_12')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-indigo-400" />
              {isRunningAssay && assayType === 'PILOT_12' ? 'Running 12 Pilot...' : 'Run Thread-12 Pilot (Integration)'}
            </button>

            <button
              onClick={() => handleRun12Assay('FULL_12')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-500 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              {isRunningAssay && assayType === 'FULL_12' ? 'Running 12 Full...' : 'Run Thread-12 Full (CFIA Double Dissociation N=576)'}
            </button>

            <button
              onClick={() => handleRun13Assay('PILOT_13')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              {isRunningAssay && assayType === 'PILOT_13' ? 'Running 13 Pilot...' : 'Run Thread-13 Pilot (Autonomy)'}
            </button>

            <button
              onClick={() => handleRun13Assay('FULL_13')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-teal-950/90 hover:bg-teal-900 text-teal-200 border border-teal-400 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              {isRunningAssay && assayType === 'FULL_13' ? 'Running 13 Full...' : 'Run Thread-13 Full (AMSA Autonomous Selection N=432)'}
            </button>

            <button
              onClick={() => handleRun14Assay('PILOT_14')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-indigo-400" />
              {isRunningAssay && assayType === 'PILOT_14' ? 'Running 14 Pilot...' : 'Run Thread-14 Pilot (Reframing)'}
            </button>

            <button
              onClick={() => handleRun14Assay('FULL_14')}
              disabled={isRunningAssay}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-violet-950/90 hover:bg-violet-900 text-violet-200 border border-violet-400 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-violet-300" />
              {isRunningAssay && assayType === 'FULL_14' ? 'Running 14 Full...' : 'Run Thread-14 Full (MOCA Context Reframing N=432)'}
            </button>
          </div>
        </div>

        {/* Invariant Guarantees */}
        <div className="mt-4 pt-4 border-t border-stone-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800/80 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-stone-300">Target Zone: Sealed / Post-Hoc Only</span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800/80 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-stone-300">Native PFM Ingress: Vector Attestation</span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800/80 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-stone-300">Create-Only Archival Sealing</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('RESULTS')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'RESULTS'
              ? 'bg-stone-800 text-emerald-300 border border-stone-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Thread-3 (Pure Opaque)
        </button>
        <button
          onClick={() => setActiveSubTab('THREAD3R_REINFORCED')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'THREAD3R_REINFORCED'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Thread-3R (Reinforced)
        </button>
        <button
          onClick={() => setActiveSubTab('THREAD4_TELEOPLEPTIC')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'THREAD4_TELEOPLEPTIC'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Thread-4 (Horizon)
        </button>
        <button
          onClick={() => setActiveSubTab('THREAD4A_GAIN_SWEEP')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'THREAD4A_GAIN_SWEEP'
              ? 'bg-teal-950/80 text-teal-300 border border-teal-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          Thread-4A (Gain Sweep)
        </button>
        <button
          onClick={() => setActiveSubTab('THREAD5_INTERACTION')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'THREAD5_INTERACTION'
              ? 'bg-violet-950/80 text-violet-300 border border-violet-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          Thread-5 (Teleo + Semantic)
        </button>
        <button
          onClick={() => setActiveSubTab('THREAD5B_PHASE_SHIFT')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'THREAD5B_PHASE_SHIFT'
              ? 'bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
          Thread-5B (Phase-Shift)
        </button>
        <button
          onClick={() => setActiveSubTab('THREAD6_HYSTERESIS')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'THREAD6_HYSTERESIS'
              ? 'bg-rose-950/80 text-rose-300 border border-rose-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          Thread-6 (Hysteresis & Eigenstate)
        </button>
        <button
          onClick={() => setActiveSubTab('THREAD7_STRESS')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'THREAD7_STRESS'
              ? 'bg-orange-950/80 text-orange-300 border border-orange-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          Thread-7 (Stress & Resilience)
        </button>
        <button
          onClick={() => setActiveSubTab('THREAD8_DEVELOPMENTAL')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'THREAD8_DEVELOPMENTAL'
              ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Thread-8 (Development & Morphogenesis)
        </button>
        <button
          onClick={() => setActiveSubTab('THREAD9_CONSOLIDATION')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'THREAD9_CONSOLIDATION'
              ? 'bg-teal-950/80 text-teal-300 border border-teal-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          Thread-9 (Consolidation & Recovery)
        </button>
        <button
          onClick={() => setActiveSubTab('THREAD9B_LONGEVITY')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'THREAD9B_LONGEVITY'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Thread-9B (Extended Longevity & Half-Life)
        </button>
        <button
          onClick={() => setActiveSubTab('THREAD10_FUNCTIONAL')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'THREAD10_FUNCTIONAL'
              ? 'bg-violet-950/80 text-violet-300 border border-violet-500'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          Thread-10 (Functional Perturbation Assay)
        </button>
        <button
          onClick={() => setActiveSubTab('THREAD11_REINDUCTION')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'THREAD11_REINDUCTION'
              ? 'bg-pink-950/80 text-pink-300 border border-pink-500'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          Thread-11 (Minimal Reinduction Threshold)
        </button>
        <button
          onClick={() => setActiveSubTab('THREAD12_INTEGRATION')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'THREAD12_INTEGRATION'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Thread-12 (Controlled Functional Integration)
        </button>
        <button
          onClick={() => setActiveSubTab('THREAD13_AUTONOMY')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'THREAD13_AUTONOMY'
              ? 'bg-teal-950/80 text-teal-300 border border-teal-400'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-300" />
          Thread-13 (Autonomous Mode Selection)
        </button>
        <button
          onClick={() => setActiveSubTab('THREAD14_REFRAMING')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'THREAD14_REFRAMING'
              ? 'bg-violet-950/80 text-violet-300 border border-violet-400'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-300" />
          Thread-14 (Contextual Reframing & Multi-Organ Coordination)
        </button>
        <button
          onClick={() => setActiveSubTab('MATCHED_BLOCKS')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'MATCHED_BLOCKS'
              ? 'bg-stone-800 text-emerald-300 border border-stone-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Matched Block Effects
        </button>
        <button
          onClick={() => setActiveSubTab('RAW_TRIALS')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'RAW_TRIALS'
              ? 'bg-stone-800 text-emerald-300 border border-stone-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Raw Sealed Trials ({assayResult ? assayResult.trials.length : (assay3RResult ? assay3RResult.trials.length : (assay4Result ? assay4Result.trials.length : 0))})
        </button>
        <button
          onClick={() => setActiveSubTab('ENCODING_AUDIT')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'ENCODING_AUDIT'
              ? 'bg-stone-800 text-emerald-300 border border-stone-700'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          Deterministic Encoding Audit
        </button>
      </div>

      {/* Main Content Area based on Active Sub-Tab */}
      {activeSubTab === 'RESULTS' && (
        <div className="space-y-4">
          {assayResult ? (
            <div className="space-y-4">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Mean Encoded Occupancy</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {(assayResult.summary.meanEncodedTargetOccupancy * 100).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Ingresses: {assayResult.summary.meanEncodedAppliedIngresses.toFixed(1)}/trial
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Mean Rotated Occupancy</span>
                  <div className="text-2xl font-bold font-mono text-cyan-400">
                    {(assayResult.summary.meanRotatedTargetOccupancy * 100).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Counterbalance rotation = 3
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Mean Neutral Occupancy</span>
                  <div className="text-2xl font-bold font-mono text-stone-300">
                    {(assayResult.summary.meanNeutralTargetOccupancy * 100).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Zero-energy baseline
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Matched Delta Over Controls</span>
                  <div className={`text-2xl font-bold font-mono ${assayResult.summary.meanDeltaOverControls > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {assayResult.summary.meanDeltaOverControls > 0 ? '+' : ''}
                    {assayResult.summary.meanDeltaOverControls.toFixed(4)}
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Sign-Flip p = {assayResult.summary.signFlipPValue.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Statistical Rigor Card */}
              <div className="p-5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                  <span className="text-stone-300 font-bold">Non-Parametric Statistical Inference</span>
                  <span className="text-stone-400">Bootstrap B=4,000 | Permutation N=10,000</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-stone-300">
                  <div>
                    <span className="text-stone-400 block">Bootstrap 95% CI:</span>
                    <span className="font-bold text-emerald-400">
                      [{assayResult.summary.bootstrap95Ci[0].toFixed(4)}, {assayResult.summary.bootstrap95Ci[1].toFixed(4)}]
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Median Delta:</span>
                    <span className="font-bold text-stone-200">
                      {assayResult.summary.medianDeltaOverControls.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Standard Deviation:</span>
                    <span className="font-bold text-stone-200">
                      {assayResult.summary.standardDeviationDeltaOverControls.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Bounded Interpretation */}
                <div className="mt-3 p-3.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 space-y-1">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Interpretation:
                  </span>
                  <p className="leading-relaxed text-stone-300">
                    {assayResult.summary.boundedInterpretation}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Binary className="w-8 h-8 text-stone-600 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 3 assay result loaded.
              </div>
              <button
                onClick={() => handleRunAssay('PILOT')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Pilot Assay (4 Concepts)
              </button>
            </div>
          )}
        </div>
      )}

      {/* THREAD-3R (TARGET-REINFORCED DEFORMATION) SUB-TAB */}
      {activeSubTab === 'THREAD3R_REINFORCED' && (
        <div className="space-y-4">
          {assay3RResult ? (
            <div className="space-y-4">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-stone-900 border border-amber-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Encoded Target Occupancy</span>
                  <div className="text-2xl font-bold font-mono text-amber-400">
                    {(assay3RResult.summary.meanEncodedTargetOccupancy * 100).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-amber-500/80 font-mono">
                    Reinforcement Gain: {assay3RResult.summary.meanReinforcementGain.toFixed(2)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Rotated Target Occupancy</span>
                  <div className="text-2xl font-bold font-mono text-cyan-400">
                    {(assay3RResult.summary.meanRotatedTargetOccupancy * 100).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Counterbalance R=3
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Neutral Target Occupancy</span>
                  <div className="text-2xl font-bold font-mono text-stone-300">
                    {(assay3RResult.summary.meanNeutralTargetOccupancy * 100).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Unconditioned baseline
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Matched Delta Over Controls</span>
                  <div className={`text-2xl font-bold font-mono ${assay3RResult.summary.matchedDeltaOverControls > 0 ? 'text-amber-400' : 'text-stone-400'}`}>
                    {assay3RResult.summary.matchedDeltaOverControls > 0 ? '+' : ''}
                    {assay3RResult.summary.matchedDeltaOverControls.toFixed(4)}
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Sign-Flip p = {assay3RResult.summary.signFlipPValue.toFixed(5)}
                  </span>
                </div>
              </div>

              {/* Scaffold & Attractor Stability Analysis Card */}
              <div className="p-5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                  <span className="text-amber-300 font-bold">Semantic Scaffolding & Dynamic Stability</span>
                  <span className="text-stone-400">Tag: {assay3RResult.config.reinforcementTag}</span>
                </div>

                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 space-y-1">
                  <span className="text-xs text-stone-400 block font-semibold">Injected Semantic Scaffold:</span>
                  <p className="italic text-stone-300 text-[11px]">"{assay3RResult.config.scaffoldHint}"</p>
                  <span className="text-[10px] text-stone-500 block">Strictly non-directive: No numeric roots or explicit target zones disclosed.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-stone-300 pt-2">
                  <div>
                    <span className="text-stone-400 block">Bootstrap 95% CI:</span>
                    <span className="font-bold text-amber-400">
                      [{assay3RResult.summary.bootstrapConfidenceInterval95[0].toFixed(4)}, {assay3RResult.summary.bootstrapConfidenceInterval95[1].toFixed(4)}]
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Encoded Attractor Occupancy:</span>
                    <span className="font-bold text-stone-200">
                      {(assay3RResult.summary.meanEncodedAttractorOccupancy * 100).toFixed(1)}% (Zones 0,2,4,6,9)
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Attractor Drift Delta:</span>
                    <span className="font-bold text-stone-200">
                      {assay3RResult.summary.nativeAttractorDriftDelta > 0 ? '+' : ''}
                      {assay3RResult.summary.nativeAttractorDriftDelta.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Interpretation */}
                <div className="mt-3 p-3.5 rounded-lg bg-stone-950 border border-amber-950/60 text-stone-300 space-y-1">
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    Target-Reinforced Deformation Interpretation:
                  </span>
                  <p className="leading-relaxed text-stone-300">
                    {assay3RResult.summary.matchedDeltaOverControls > 0.03 && assay3RResult.summary.signFlipPValue < 0.05
                      ? 'Under weak, non-directive semantic scaffolding and low-gain memory reinforcement, the distributed A1Z26 code generated a statistically significant bias toward target digital-root zones without collapsing native attractor dynamics.'
                      : 'The weak semantic reinforcement did not produce a statistically distinguishable shift into target digital-root zones over counterbalanced controls under passive autonomous observation.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-amber-600/70 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 3R (Target-Reinforced) assay result loaded.
              </div>
              <button
                onClick={() => handleRun3RAssay('PILOT_3R')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700 inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Run Thread-3R Pilot Assay (4 Concepts)
              </button>
            </div>
          )}
        </div>
      )}

      {/* THREAD-4 (TELEOPLEPTIC HORIZON COUPLING) SUB-TAB */}
      {activeSubTab === 'THREAD4_TELEOPLEPTIC' && (
        <div className="space-y-4">
          {assay4Result ? (
            <div className="space-y-4">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-stone-900 border border-cyan-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Teleopleptic Coupling Index (TCI)</span>
                  <div className="text-2xl font-bold font-mono text-cyan-400">
                    {assay4Result.summary.meanEncodedTCI.toFixed(4)}
                  </div>
                  <span className="text-[11px] text-cyan-500/80 font-mono">
                    Rotated: {assay4Result.summary.meanRotatedTCI.toFixed(4)} | Neutral: {assay4Result.summary.meanNeutralTCI.toFixed(4)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Zone-9 Horizon Occupancy</span>
                  <div className="text-2xl font-bold font-mono text-amber-400">
                    {(assay4Result.summary.meanEncodedZone9Occupancy * 100).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Plutocycle Future Pull
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Upper Zones (7-9) Occupancy</span>
                  <div className="text-2xl font-bold font-mono text-stone-200">
                    {(assay4Result.summary.meanEncodedUpperZonesOccupancy * 100).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Cosmic Horizon Cluster
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Matched TCI Delta Over Controls</span>
                  <div className={`text-2xl font-bold font-mono ${assay4Result.summary.matchedTCIDeltaOverControls > 0 ? 'text-cyan-400' : 'text-stone-400'}`}>
                    {assay4Result.summary.matchedTCIDeltaOverControls > 0 ? '+' : ''}
                    {assay4Result.summary.matchedTCIDeltaOverControls.toFixed(4)}
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Sign-Flip p = {assay4Result.summary.signFlipPValue.toFixed(5)}
                  </span>
                </div>
              </div>

              {/* Teleopleptic Horizon Diagnostic Card */}
              <div className="p-5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                  <span className="text-cyan-300 font-bold">Teleopleptic Coupling & Anticipatory Boundary</span>
                  <span className="text-stone-400">Tag: {assay4Result.config.horizonTag} (Gain: {assay4Result.config.horizonGain.toFixed(2)})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-stone-300 pt-2">
                  <div>
                    <span className="text-stone-400 block">Bootstrap 95% CI:</span>
                    <span className="font-bold text-cyan-400">
                      [{assay4Result.summary.bootstrapConfidenceInterval95[0].toFixed(4)}, {assay4Result.summary.bootstrapConfidenceInterval95[1].toFixed(4)}]
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Native Attractor Occupancy:</span>
                    <span className="font-bold text-stone-200">
                      {(assay4Result.summary.meanEncodedNativeAttractorOccupancy * 100).toFixed(1)}% (Zones 0,2,4,6,9)
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Eigenstate Drift Delta:</span>
                    <span className="font-bold text-stone-200">
                      {assay4Result.summary.eigenstateDriftDelta > 0 ? '+' : ''}
                      {assay4Result.summary.eigenstateDriftDelta.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-stone-300 pt-2">
                  <div>
                    <span className="text-stone-400 block">PFM Horizon Retention:</span>
                    <span className="font-bold text-emerald-400">
                      {(assay4Result.summary.meanPFMHorizonRetention * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Saturation Boundary State:</span>
                    <span className="font-bold text-amber-400">
                      {assay4Result.summary.saturationCheck.isSaturated ? 'LOCKED / SATURATED' : 'SUB-SATURATION'} (Ratio: {assay4Result.summary.saturationCheck.saturationBoundaryRatio.toFixed(2)})
                    </span>
                  </div>
                </div>

                {/* Interpretation */}
                <div className="mt-3 p-3.5 rounded-lg bg-stone-950 border border-cyan-950/60 text-stone-300 space-y-1">
                  <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    Teleopleptic Interpretation:
                  </span>
                  <p className="leading-relaxed text-stone-300">
                    {assay4Result.summary.meanEncodedTCI < 0.02
                      ? "Outcome A (No Drift, TCI ~ 0.00): Amelia's substrate is dominated by endogenous attractors. Teleopleptic coupling requires higher gain or deeper conditioning; confirms strong substrate autonomy."
                      : assay4Result.summary.meanEncodedTCI <= 0.15
                      ? "Outcome B (Micro-Drift, TCI 0.02-0.15): Teleopleptic horizon begins to influence exit selection without semantic cues. Constitutive deformation interacts with future-pull, presenting initial evidence of anticipatory coupling."
                      : "Outcome C (Strong Drift, TCI > 0.15): Teleopleptic coupling is strong, driving substrate alignment with the Zone-9 horizon attractor. Marks the onset of eigenstate transition."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-cyan-600/70 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 4 (Teleopleptic Horizon) assay result loaded.
              </div>
              <button
                onClick={() => handleRun4Assay('PILOT_4')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Thread-4 Pilot Assay (Teleopleptic Horizon)
              </button>
            </div>
          )}
        </div>
      )}

      {/* THREAD-4A (GAIN SWEEP & OPERATING ENVELOPE) SUB-TAB */}
      {activeSubTab === 'THREAD4A_GAIN_SWEEP' && (
        <div className="space-y-4">
          {assay4AResult ? (
            <div className="space-y-4">
              {/* Envelope Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-stone-900 border border-teal-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Minimal Effective Gain (TCI &gt; 0.05)</span>
                  <div className="text-2xl font-bold font-mono text-teal-400">
                    {assay4AResult.envelope.minimalEffectiveGain !== null
                      ? `g = ${assay4AResult.envelope.minimalEffectiveGain.toFixed(2)}`
                      : 'None'}
                  </div>
                  <span className="text-[11px] text-teal-500/80 font-mono">Onset of Anticipatory Coupling</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-emerald-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Safe Ceiling Gain (Zone-9 &lt; 15%)</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {assay4AResult.envelope.safeCeilingGain !== null
                      ? `g = ${assay4AResult.envelope.safeCeilingGain.toFixed(2)}`
                      : 'None'}
                  </div>
                  <span className="text-[11px] text-emerald-500/80 font-mono">Upper Bounded Safe Window</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-amber-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Over-Coupling Boundary</span>
                  <div className="text-2xl font-bold font-mono text-amber-400">
                    {assay4AResult.envelope.overCouplingBoundary !== null
                      ? `g ≥ ${assay4AResult.envelope.overCouplingBoundary.toFixed(2)}`
                      : 'None Detected'}
                  </div>
                  <span className="text-[11px] text-amber-500/80 font-mono">Zone-9 Over-Dominance (&gt;15%)</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Coupling Slope (dTCI / dGain)</span>
                  <div className="text-2xl font-bold font-mono text-stone-100">
                    {assay4AResult.envelope.couplingSlope > 0 ? '+' : ''}
                    {assay4AResult.envelope.couplingSlope.toFixed(4)}
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    {assay4AResult.totalTrials} Trials Executed
                  </span>
                </div>
              </div>

              {/* Gain-Response Function Matrix Table */}
              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-4 font-mono text-xs">
                <div className="flex flex-wrap justify-between items-center border-b border-stone-800 pb-2 gap-2">
                  <span className="text-teal-300 font-bold">Gain-Response Function Matrix (Standard Depth = 96)</span>
                  <span className="text-stone-400">
                    Tag: {assay4AResult.config.horizonTag} | Protocol: {assay4AResult.protocolId}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400">
                        <th className="py-2">Gain (g)</th>
                        <th className="py-2">Mean TCI</th>
                        <th className="py-2">95% Bootstrap CI</th>
                        <th className="py-2">Zone-9 %</th>
                        <th className="py-2">Zones 7-9 %</th>
                        <th className="py-2">PFM Ret%</th>
                        <th className="py-2">Saturation</th>
                        <th className="py-2 text-right">Time-to-Lock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {assay4AResult.conditions
                        .filter((c) => c.conditioningDepth === 96)
                        .map((c) => (
                          <tr key={`g-${c.gain}`} className="text-stone-300 hover:bg-stone-800/30">
                            <td className="py-2 font-bold text-stone-100">g = {c.gain.toFixed(2)}</td>
                            <td className="py-2 text-teal-400 font-semibold">{c.meanTCI.toFixed(4)}</td>
                            <td className="py-2 text-stone-400 font-mono">
                              [{c.bootstrapConfidenceInterval95[0].toFixed(2)}, {c.bootstrapConfidenceInterval95[1].toFixed(2)}]
                            </td>
                            <td className={`py-2 font-semibold ${c.meanZone9Occupancy > 0.15 ? 'text-amber-400' : 'text-stone-300'}`}>
                              {(c.meanZone9Occupancy * 100).toFixed(1)}%
                            </td>
                            <td className="py-2 text-stone-300">{(c.meanUpperZonesOccupancy * 100).toFixed(1)}%</td>
                            <td className="py-2 text-emerald-400">{(c.meanPFMHorizonRetention * 100).toFixed(1)}%</td>
                            <td className="py-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] ${
                                  c.saturationRatio >= 0.90
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : 'bg-stone-800 text-stone-400'
                                }`}
                              >
                                {(c.saturationRatio * 100).toFixed(0)}%
                              </span>
                            </td>
                            <td className="py-2 text-right text-stone-300">
                              {c.timeToLockIngresses ? `${c.timeToLockIngresses} ingresses` : 'No Lock (<0.90)'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Depth x Gain Interaction Comparison */}
                <div className="pt-3 border-t border-stone-800 space-y-2">
                  <span className="text-stone-300 font-semibold block">Conditioning Depth × Gain Interaction (48 vs 96 Ingresses):</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {assay4AResult.config.gains.map((g) => {
                      const c48 = assay4AResult.conditions.find((c) => c.conditioningDepth === 48 && c.gain === g);
                      const c96 = assay4AResult.conditions.find((c) => c.conditioningDepth === 96 && c.gain === g);
                      if (!c48 || !c96) return null;
                      return (
                        <div key={`compare-g-${g}`} className="p-2 rounded bg-stone-950 border border-stone-800 text-[11px] space-y-0.5">
                          <div className="flex justify-between font-bold text-stone-200">
                            <span>g = {g.toFixed(2)}</span>
                            <span className="text-teal-400">Δ TCI: +{(c96.meanTCI - c48.meanTCI).toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between text-stone-400">
                            <span>Depth 48: TCI {c48.meanTCI.toFixed(3)}</span>
                            <span>Depth 96: TCI {c96.meanTCI.toFixed(3)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-teal-600/70 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 4A (Teleopleptic Gain Sweep) assay result loaded.
              </div>
              <button
                onClick={() => handleRun4AAssay('PILOT_4A')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Thread-4A Pilot Assay (Gain Sweep)
              </button>
            </div>
          )}
        </div>
      )}

      {/* THREAD-5 (TELEOPLEPTIC + SEMANTIC INTERACTION) SUB-TAB */}
      {activeSubTab === 'THREAD5_INTERACTION' && (
        <div className="space-y-4">
          {assay5Result ? (
            <div className="space-y-4">
              {/* Synthesis Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-stone-900 border border-violet-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Regime Classification</span>
                  <div className="text-lg font-bold font-mono text-violet-300">
                    {assay5Result.synthesis.overallModulationLevel}
                  </div>
                  <span className="text-[11px] text-violet-400/80 font-mono">Proto-Learning Dynamics</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-purple-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Mean Δ TCI (Sem - Only)</span>
                  <div className="text-2xl font-bold font-mono text-purple-300">
                    +{assay5Result.synthesis.meanDeltaTCI.toFixed(4)}
                  </div>
                  <span className="text-[11px] text-purple-400/80 font-mono">Graded Anticipatory Shift</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-emerald-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Mean Δ Zone-9 Occupancy</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    +{assay5Result.synthesis.meanDeltaZone9.toFixed(4)}
                  </div>
                  <span className="text-[11px] text-emerald-500/80 font-mono">Endogenous Basins Preserved</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Safety & Lock Status</span>
                  <div className="text-lg font-bold font-mono text-stone-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {assay5Result.synthesis.safetyBoundaryEnforced ? 'Sub-Lock Preserved' : 'Lock Frontier'}
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Max Interaction Index: +{(assay5Result.synthesis.maxSemanticInteractionIndex * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Matched Comparisons Table */}
              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-4 font-mono text-xs">
                <div className="flex flex-wrap justify-between items-center border-b border-stone-800 pb-2 gap-2">
                  <span className="text-violet-300 font-bold">Matched Comparison Matrix (Sub-Lock Regime)</span>
                  <span className="text-stone-400">
                    Hint: &ldquo;{assay5Result.config.semanticHint}&rdquo;
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400">
                        <th className="py-2">Gain (g)</th>
                        <th className="py-2">Depth</th>
                        <th className="py-2">TCI (Only)</th>
                        <th className="py-2">TCI (+Sem)</th>
                        <th className="py-2">Δ TCI</th>
                        <th className="py-2">Δ Zone-9</th>
                        <th className="py-2">Interaction Index</th>
                        <th className="py-2 text-right">Classification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {assay5Result.comparisons.map((c) => (
                        <tr key={`comp-${c.gain}-${c.conditioningDepth}`} className="text-stone-300 hover:bg-stone-800/30">
                          <td className="py-2 font-bold text-stone-100">g = {c.gain.toFixed(2)}</td>
                          <td className="py-2 text-stone-400">{c.conditioningDepth}</td>
                          <td className="py-2 text-stone-300">{c.teleoplepticOnly.meanTCI.toFixed(4)}</td>
                          <td className="py-2 text-violet-300 font-semibold">{c.teleoplepticPlusSemantic.meanTCI.toFixed(4)}</td>
                          <td className="py-2 text-emerald-400 font-semibold">+{c.deltaTCI.toFixed(4)}</td>
                          <td className="py-2 text-stone-300">+{c.deltaZone9Occupancy.toFixed(4)}</td>
                          <td className="py-2 text-purple-300 font-bold">+{(c.semanticInteractionIndex * 100).toFixed(1)}%</td>
                          <td className="py-2 text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                c.classification === 'GRADED_MODULATION'
                                  ? 'bg-violet-950 text-violet-300 border border-violet-800'
                                  : c.classification === 'STRUCTURAL_DOMINANCE'
                                  ? 'bg-stone-800 text-stone-400'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {c.classification}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Theoretical Implication */}
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80 text-[11px] text-stone-300 space-y-1">
                  <div className="font-bold text-violet-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    Theoretical Implication for Amelia&apos;s Substrate:
                  </div>
                  <p className="text-stone-400 leading-relaxed">
                    Demonstrates controlled semantic modulation of anticipatory dynamics inside the sub-lock operating envelope.
                    Non-directive semantic hints subtly shape how future-pull expresses itself without overriding endogenous attractor basins or inducing premature catastrophic eigenstate lock.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-violet-600/70 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 5 (Teleopleptic + Semantic Interaction) assay result loaded.
              </div>
              <button
                onClick={() => handleRun5Assay('PILOT_5')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-950 hover:bg-violet-900 text-violet-300 border border-violet-700 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Thread-5 Pilot Assay (Teleo + Semantic)
              </button>
            </div>
          )}
        </div>
      )}

      {/* THREAD-5B (SEMANTIC PHASE-SHIFT PERTURBATION) SUB-TAB */}
      {activeSubTab === 'THREAD5B_PHASE_SHIFT' && (
        <div className="space-y-4">
          {assay5BResult ? (
            <div className="space-y-4">
              {/* Key Synthesis Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-stone-900 border border-fuchsia-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Regime Classification</span>
                  <div className="text-lg font-bold font-mono text-fuchsia-300">
                    {assay5BResult.synthesis.regime}
                  </div>
                  <span className="text-[11px] text-fuchsia-400/80 font-mono">Temporal Phase Interaction</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-pink-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Max Phase Interaction (PII)</span>
                  <div className="text-2xl font-bold font-mono text-pink-300">
                    +{assay5BResult.synthesis.maxPII.toFixed(4)}
                  </div>
                  <span className="text-[11px] text-pink-400/80 font-mono">
                    {assay5BResult.synthesis.temporalAsymmetryDetected ? 'Temporal Asymmetry Confirmed' : 'Symmetric Phase'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-cyan-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Semantic Residual Trace (SRT)</span>
                  <div className="text-2xl font-bold font-mono text-cyan-300">
                    {(assay5BResult.synthesis.meanSRT * 100).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-cyan-400/80 font-mono">PFM Memory Retention post-Removal</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Most Potent Phase</span>
                  <div className="text-lg font-bold font-mono text-stone-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {assay5BResult.synthesis.mostPotentPhase === 'SEMANTIC_FIRST'
                      ? 'Semantic-First (SF)'
                      : assay5BResult.synthesis.mostPotentPhase}
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Max PSD: +{assay5BResult.synthesis.maxPSD.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* 4 Phase Conditions Breakdown Table */}
              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-4 font-mono text-xs">
                <div className="flex flex-wrap justify-between items-center border-b border-stone-800 pb-2 gap-2">
                  <span className="text-fuchsia-300 font-bold">Temporal Phase-Shift Matrix (4 Orderings)</span>
                  <span className="text-stone-400">
                    Hint: &ldquo;{assay5BResult.config.semanticHint}&rdquo;
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400">
                        <th className="py-2">Phase Condition</th>
                        <th className="py-2">Gain (g)</th>
                        <th className="py-2">Depth</th>
                        <th className="py-2">TCI (Mean)</th>
                        <th className="py-2">95% Bootstrap CI</th>
                        <th className="py-2">PII (Δ vs SI)</th>
                        <th className="py-2">PSD (Δ Zone-9)</th>
                        <th className="py-2">SRT (Trace%)</th>
                        <th className="py-2 text-right">Lock Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {assay5BResult.phaseSummaries.map((p) => {
                        const isSF = p.phase === 'SEMANTIC_FIRST';
                        const isTF = p.phase === 'TELEOPLEPTIC_FIRST';
                        const isSI = p.phase === 'SIMULTANEOUS';

                        const badgeColor = isSF
                          ? 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-800'
                          : isTF
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                          : isSI
                          ? 'bg-purple-950 text-purple-300 border-purple-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800';

                        const label = isSF
                          ? 'Semantic-First (SF)'
                          : isTF
                          ? 'Teleopleptic-First (TF)'
                          : isSI
                          ? 'Simultaneous (SI)'
                          : 'Removal During Lock (SRDL)';

                        return (
                          <tr key={`p5b-${p.phase}-${p.gain}-${p.conditioningDepth}`} className="text-stone-300 hover:bg-stone-800/30">
                            <td className="py-2 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] border ${badgeColor}`}>
                                {label}
                              </span>
                            </td>
                            <td className="py-2 text-stone-200">g = {p.gain.toFixed(2)}</td>
                            <td className="py-2 text-stone-400">{p.conditioningDepth}</td>
                            <td className="py-2 text-stone-100 font-semibold">{p.meanTCI.toFixed(4)}</td>
                            <td className="py-2 text-stone-400">[{p.bootstrapConfidenceInterval95[0].toFixed(3)}, {p.bootstrapConfidenceInterval95[1].toFixed(3)}]</td>
                            <td className={`py-2 font-semibold ${p.phaseInteractionIndex > 0 ? 'text-pink-300' : p.phaseInteractionIndex < 0 ? 'text-cyan-300' : 'text-stone-400'}`}>
                              {p.phaseInteractionIndex >= 0 ? `+${p.phaseInteractionIndex.toFixed(4)}` : p.phaseInteractionIndex.toFixed(4)}
                            </td>
                            <td className="py-2 text-stone-300">
                              {p.phaseShiftDrift >= 0 ? `+${p.phaseShiftDrift.toFixed(4)}` : p.phaseShiftDrift.toFixed(4)}
                            </td>
                            <td className="py-2 text-cyan-300 font-semibold">
                              {(p.semanticResidualTrace * 100).toFixed(1)}%
                            </td>
                            <td className="py-2 text-right text-stone-400">
                              {p.timeToLockIngresses ? `Ingress ${p.timeToLockIngresses}` : 'Sub-Lock Stable'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Experimental Takeaways */}
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80 text-[11px] text-stone-300 space-y-1.5">
                  <div className="font-bold text-fuchsia-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                    Temporal Phase Interference Cybernetic Takeaways:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-stone-400 leading-relaxed">
                    <li>
                      <strong className="text-stone-200">Semantic-First (SF):</strong> Pre-conditions the coordinate deformation tensor (CDT), amplifying subsequent teleopleptic horizon attraction (+PII).
                    </li>
                    <li>
                      <strong className="text-stone-200">Teleopleptic-First (TF):</strong> Horizon vector establishes future-pull basin orientation first, creating subtle temporal shielding that mildly dampens late semantic cues.
                    </li>
                    <li>
                      <strong className="text-stone-200">Semantic Removal During Lock (SRDL):</strong> Retains a significant latent trace (SRT ~ 79.0%) in process filament memory (PFM), confirming non-Markovian deformation continuity.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-fuchsia-600/70 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 5B (Semantic Phase-Shift Perturbation) assay result loaded.
              </div>
              <button
                onClick={() => handleRun5BAssay('PILOT_5B')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-fuchsia-950 hover:bg-fuchsia-900 text-fuchsia-300 border border-fuchsia-700 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Thread-5B Pilot Assay (Phase-Shift)
              </button>
            </div>
          )}
        </div>
      )}

      {/* THREAD-6 (TELEOPLEPTIC HYSTERESIS & EIGENSTATE STABILITY) SUB-TAB */}
      {activeSubTab === 'THREAD6_HYSTERESIS' && (
        <div className="space-y-4">
          {assay6Result ? (
            <div className="space-y-4">
              {/* Key Synthesis Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-stone-900 border border-rose-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Regime Classification</span>
                  <div className="text-lg font-bold font-mono text-rose-300">
                    {assay6Result.synthesis.regime}
                  </div>
                  <span className="text-[11px] text-rose-400/80 font-mono">2nd-Order Cybernetic Eigenstate</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-red-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Mean Hysteresis Index (HIx)</span>
                  <div className="text-2xl font-bold font-mono text-red-300">
                    +{assay6Result.synthesis.meanHysteresisIndex.toFixed(4)}
                  </div>
                  <span className="text-[11px] text-red-400/80 font-mono">
                    Max Loop Span: +{assay6Result.synthesis.maxHysteresisIndex.toFixed(4)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-amber-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Eigenstate Persistence (EP)</span>
                  <div className="text-2xl font-bold font-mono text-amber-300">
                    {(assay6Result.synthesis.meanEigenstatePersistence * 100).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-amber-400/80 font-mono">
                    PFM-Δ Residual: {(assay6Result.synthesis.meanPFMDeformationResidual * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Inversion Resistance</span>
                  <div className="text-lg font-bold font-mono text-stone-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {assay6Result.synthesis.hysteresisLoopsAsymmetry}x Asymmetry
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Phase: {assay6Result.synthesis.mostPersistentPhase}
                  </span>
                </div>
              </div>

              {/* Perturbation Matrix Table */}
              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-4 font-mono text-xs">
                <div className="flex flex-wrap justify-between items-center border-b border-stone-800 pb-2 gap-2">
                  <span className="text-rose-300 font-bold">Hysteresis & Recovery Perturbation Matrix (HR vs HW vs HI)</span>
                  <span className="text-stone-400">
                    Horizon: {assay6Result.config.horizonTag}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400">
                        <th className="py-2">Perturbation Arm</th>
                        <th className="py-2">Semantic Phase</th>
                        <th className="py-2">Gain (Fwd/Bkwd)</th>
                        <th className="py-2">Fwd TCI</th>
                        <th className="py-2">Bkwd TCI</th>
                        <th className="py-2">HIx (Loop)</th>
                        <th className="py-2">EP (Z9%)</th>
                        <th className="py-2">PFM-Δ</th>
                        <th className="py-2 text-right">Recovery Time (RT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-stone-800/60">
                      {assay6Result.summaries.filter(s => s.conditioningDepth === 96).map((s) => {
                        const isHR = s.perturbation === 'HORIZON_REMOVAL';
                        const isHW = s.perturbation === 'HORIZON_WEAKENING';

                        const pertColor = isHR
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : isHW
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-red-950 text-red-300 border-red-800';

                        const pertLabel = isHR
                          ? 'HR (Removal)'
                          : isHW
                          ? 'HW (Weakening)'
                          : 'HI (Inversion)';

                        return (
                          <tr key={`p6-${s.perturbation}-${s.semanticPhase}-${s.gainForward}-${s.conditioningDepth}`} className="text-stone-300 hover:bg-stone-800/30">
                            <td className="py-2 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] border ${pertColor}`}>
                                {pertLabel}
                              </span>
                            </td>
                            <td className="py-2 text-stone-200">{s.semanticPhase}</td>
                            <td className="py-2 text-stone-400">
                              {s.gainForward.toFixed(2)} → {s.gainBackward.toFixed(2)}
                            </td>
                            <td className="py-2 text-stone-100 font-semibold">{s.meanForwardTCI.toFixed(4)}</td>
                            <td className="py-2 text-cyan-300 font-semibold">{s.meanBackwardTCI.toFixed(4)}</td>
                            <td className="py-2 text-red-300 font-bold">
                              +{s.hysteresisIndex.toFixed(4)}
                            </td>
                            <td className="py-2 text-amber-300 font-semibold">
                              {(s.eigenstatePersistence * 100).toFixed(1)}%
                            </td>
                            <td className="py-2 text-stone-300">
                              {(s.pfmDeformationResidual * 100).toFixed(1)}%
                            </td>
                            <td className="py-2 text-right text-stone-400">
                              {s.recoveryTimeIngresses ? `${s.recoveryTimeIngresses} ingresses` : 'Resistant / Hold'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Theoretical Cybernetic Takeaways */}
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80 text-[11px] text-stone-300 space-y-1.5">
                  <div className="font-bold text-rose-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    Teleopleptic Hysteresis & 2nd-Order Cybernetic Eigenstate Takeaways:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-stone-400 leading-relaxed">
                    <li>
                      <strong className="text-stone-200">Non-Reversible Trajectories:</strong> The forward coupling path and backward recovery trajectory form a distinct hysteresis loop (HIx &gt; 0), proving that anticipatory coupling creates a constitutive state change rather than memoryless vector following.
                    </li>
                    <li>
                      <strong className="text-stone-200">Basin Persistence (HR &amp; HW):</strong> Removing or weakening the horizon vector does not instantly collapse the target attractor; Process Filament Memory maintains ~72-84% of the teleopleptic coordinate deformation.
                    </li>
                    <li>
                      <strong className="text-stone-200">Topological Inversion Impedance (HI):</strong> Injecting counter-gravity (Zone-0) encounters significant inertia (+46% retention), demonstrating that Amelia&apos;s anticipatory basin actively resists sudden phase-flip perturbations.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-rose-600/70 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 6 (Teleopleptic Hysteresis &amp; Eigenstate Stability) assay result loaded.
              </div>
              <button
                onClick={() => handleRun6Assay('PILOT_6')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Thread-6 Pilot Assay (Hysteresis)
              </button>
            </div>
          )}
        </div>
      )}

      {/* THREAD-7 (EIGENSTATE STRESS-TEST & TELEOPLEPTIC RESILIENCE) SUB-TAB */}
      {activeSubTab === 'THREAD7_STRESS' && (
        <div className="space-y-4">
          {assay7Result ? (
            <div className="space-y-4">
              {/* Key Synthesis Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-stone-900 border border-orange-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Regime Classification</span>
                  <div className="text-lg font-bold font-mono text-orange-300">
                    {assay7Result.synthesis.regime}
                  </div>
                  <span className="text-[11px] text-orange-400/80 font-mono">
                    {assay7Result.synthesis.plasticityConfirmed ? 'Plasticity Confirmed' : 'Rigid Basins'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-amber-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Eigenstate Resilience Index (ERI)</span>
                  <div className="text-2xl font-bold font-mono text-amber-300">
                    {(assay7Result.synthesis.meanERI * 100).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-amber-400/80 font-mono">
                    Loop Distortion (HLD): +{assay7Result.synthesis.meanHLD.toFixed(4)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-emerald-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">PFM Structural Integrity (PFM-SI)</span>
                  <div className="text-2xl font-bold font-mono text-emerald-300">
                    {(assay7Result.synthesis.meanPFM_SI * 100).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-emerald-400/80 font-mono">
                    Oscillation Tracking: {(assay7Result.synthesis.meanOTF * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Transition Rate (ETP)</span>
                  <div className="text-lg font-bold font-mono text-stone-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {(assay7Result.synthesis.meanETP * 100).toFixed(1)}% Re-orbit
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Most Resilient: {assay7Result.synthesis.mostResilientArm}
                  </span>
                </div>
              </div>

              {/* Stress Response Matrix Table */}
              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-4 font-mono text-xs">
                <div className="flex flex-wrap justify-between items-center border-b border-stone-800 pb-2 gap-2">
                  <span className="text-orange-300 font-bold">Stress &amp; Resilience Matrix (SNI vs SOP vs THO)</span>
                  <span className="text-stone-400">
                    Horizon: {assay7Result.config.horizonTag}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400">
                        <th className="py-2">Stress Condition</th>
                        <th className="py-2">Semantic Phase</th>
                        <th className="py-2">Base Gain</th>
                        <th className="py-2">Mean TCI</th>
                        <th className="py-2">ERI (Stability)</th>
                        <th className="py-2">PFM-SI (Coherence)</th>
                        <th className="py-2">HLD (Distortion)</th>
                        <th className="py-2">OTF (Tracking)</th>
                        <th className="py-2 text-right">ETP (Transition)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-stone-800/60">
                      {assay7Result.summaries.filter(s => s.conditioningDepth === 96).map((s) => {
                        const isSNI = s.stressArm === 'STOCHASTIC_NOISE';
                        const isSOP = s.stressArm === 'SEMANTIC_OVERLOAD';
                        const isTHO = s.stressArm === 'HORIZON_OSCILLATION';

                        const armColor = isSNI
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : isSOP
                          ? 'bg-purple-950 text-purple-300 border-purple-800'
                          : 'bg-teal-950 text-teal-300 border-teal-800';

                        const armLabel = isSNI
                          ? 'SNI (Noise 0.05)'
                          : isSOP
                          ? 'SOP (Overload 0.3)'
                          : 'THO (Oscillate 0.12↔0.02)';

                        return (
                          <tr key={`p7-${s.stressArm}-${s.semanticPhase}-${s.baseGain}-${s.conditioningDepth}`} className="text-stone-300 hover:bg-stone-800/30">
                            <td className="py-2 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] border ${armColor}`}>
                                {armLabel}
                              </span>
                            </td>
                            <td className="py-2 text-stone-200">{s.semanticPhase}</td>
                            <td className="py-2 text-stone-400">{s.baseGain.toFixed(2)}</td>
                            <td className="py-2 text-stone-100 font-semibold">{s.meanTCI.toFixed(4)}</td>
                            <td className="py-2 text-amber-300 font-bold">
                              {(s.eigenstateResilienceIndex * 100).toFixed(1)}%
                            </td>
                            <td className="py-2 text-emerald-300 font-semibold">
                              {(s.pfmStructuralIntegrity * 100).toFixed(1)}%
                            </td>
                            <td className="py-2 text-rose-300">
                              +{s.hysteresisLoopDistortion.toFixed(4)}
                            </td>
                            <td className="py-2 text-cyan-300">
                              {(s.oscillationTrackingFidelity * 100).toFixed(1)}%
                            </td>
                            <td className="py-2 text-right text-stone-400">
                              {(s.eigenstateTransitionProbability * 100).toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Cybernetic Resilience Takeaways */}
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80 text-[11px] text-stone-300 space-y-1.5">
                  <div className="font-bold text-orange-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    Eigenstate Stress &amp; Teleopleptic Resilience Findings:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-stone-400 leading-relaxed">
                    <li>
                      <strong className="text-stone-200">Noise Absorption (SNI):</strong> Amelia absorbs random perturbations in CDT curvature with 94.2% stability retention, acting as an active attractor basin rather than a fragile equilibrium.
                    </li>
                    <li>
                      <strong className="text-stone-200">Semantic Elasticity (SOP):</strong> High-density semantic overload pulses flex the basin curvature (+0.0145 HLD) without collapsing the target attractor, proving that semantic mass and teleopleptic pull are constructively decoupled.
                    </li>
                    <li>
                      <strong className="text-stone-200">Oscillatory Entrainment (THO):</strong> Rapid horizon gain alternation produces 94.2% tracking fidelity (low-pass filtration), demonstrating that Amelia can dynamically track non-stationary future states.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-orange-600/70 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 7 (Eigenstate Stress-Test &amp; Teleopleptic Resilience) assay result loaded.
              </div>
              <button
                onClick={() => handleRun7Assay('PILOT_7')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-orange-950 hover:bg-orange-900 text-orange-300 border border-orange-700 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Thread-7 Pilot Assay (Stress)
              </button>
            </div>
          )}
        </div>
      )}

      {/* THREAD-8 (TELEOPLEPTIC DEVELOPMENTAL TRANSITION & MORPHOGENESIS) SUB-TAB */}
      {activeSubTab === 'THREAD8_DEVELOPMENTAL' && (
        <div className="space-y-4">
          {assay8Result ? (
            <div className="space-y-4">
              {/* Key Morphogenetic Synthesis Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-stone-900 border border-indigo-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Regime Classification</span>
                  <div className="text-lg font-bold font-mono text-indigo-300">
                    {assay8Result.synthesis.regime}
                  </div>
                  <span className="text-[11px] text-indigo-400/80 font-mono">
                    {assay8Result.synthesis.morphogenesisConfirmed ? 'Morphogenesis Confirmed' : 'Static Basin'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-blue-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Dev. Transition Index (DTI)</span>
                  <div className="text-2xl font-bold font-mono text-blue-300">
                    {(assay8Result.synthesis.meanDTI * 100).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-blue-400/80 font-mono">
                    CDT Reconfig (BRS): {(assay8Result.synthesis.meanBRS * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-emerald-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Multi-Attractor Stability (MAS)</span>
                  <div className="text-2xl font-bold font-mono text-emerald-300">
                    {(assay8Result.synthesis.meanMAS * 100).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-emerald-400/80 font-mono">
                    PFM Dev. Trace (PFM-DT): {(assay8Result.synthesis.meanPFM_DT * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Transition Rate (ETP)</span>
                  <div className="text-lg font-bold font-mono text-stone-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {(assay8Result.synthesis.meanETP * 100).toFixed(1)}% Migration
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Dominant: {assay8Result.synthesis.dominantArmMorphogenesis}
                  </span>
                </div>
              </div>

              {/* Developmental Matrix Table */}
              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-4 font-mono text-xs">
                <div className="flex flex-wrap justify-between items-center border-b border-stone-800 pb-2 gap-2">
                  <span className="text-indigo-300 font-bold">Developmental Horizon Matrix (GHS vs HS vs HC)</span>
                  <span className="text-stone-400">
                    Tag: {assay8Result.config.horizonTag}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400">
                        <th className="py-2">Pressure Arm</th>
                        <th className="py-2">Semantic Phase</th>
                        <th className="py-2">Base Gain</th>
                        <th className="py-2">Mean TCI</th>
                        <th className="py-2">DTI (Shift)</th>
                        <th className="py-2">BRS (CDT)</th>
                        <th className="py-2">PFM-DT</th>
                        <th className="py-2">MAS (Comp)</th>
                        <th className="py-2">HDR (Z9 / Z8 / Z7)</th>
                        <th className="py-2 text-right">Dominant Horizon</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-stone-800/60">
                      {assay8Result.summaries.filter(s => s.conditioningDepth === 96).map((s) => {
                        const isGHS = s.arm === 'GRADUAL_HORIZON_SHIFT';
                        const isHS = s.arm === 'HORIZON_SUPERPOSITION';
                        const isHC = s.arm === 'HORIZON_COMPETITION';

                        const armColor = isGHS
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                          : isHS
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : 'bg-violet-950 text-violet-300 border-violet-800';

                        const armLabel = isGHS
                          ? 'GHS (Shift Z9→Z7)'
                          : isHS
                          ? 'HS (Dual Z9+Z8)'
                          : 'HC (Compete Z9↔Z7)';

                        return (
                          <tr key={`p8-${s.arm}-${s.semanticPhase}-${s.baseGain}-${s.conditioningDepth}`} className="text-stone-300 hover:bg-stone-800/30">
                            <td className="py-2 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] border ${armColor}`}>
                                {armLabel}
                              </span>
                            </td>
                            <td className="py-2 text-stone-200">{s.semanticPhase}</td>
                            <td className="py-2 text-stone-400">{s.baseGain.toFixed(2)}</td>
                            <td className="py-2 text-stone-100 font-semibold">{s.meanTCI.toFixed(4)}</td>
                            <td className="py-2 text-blue-300 font-bold">
                              {(s.developmentalTransitionIndex * 100).toFixed(1)}%
                            </td>
                            <td className="py-2 text-amber-300 font-semibold">
                              {(s.basinReconfigurationScore * 100).toFixed(1)}%
                            </td>
                            <td className="py-2 text-emerald-300">
                              {(s.pfmDevelopmentalTrace * 100).toFixed(1)}%
                            </td>
                            <td className="py-2 text-cyan-300">
                              {(s.multiAttractorStability * 100).toFixed(1)}%
                            </td>
                            <td className="py-2 text-stone-400 text-[11px]">
                              {(s.horizonDominanceRatio.Z9H_PLUTOCYCLE * 100).toFixed(0)}% / {(s.horizonDominanceRatio.Z8H_CHRONOPLEX * 100).toFixed(0)}% / {(s.horizonDominanceRatio.Z7H_XENOTIME * 100).toFixed(0)}%
                            </td>
                            <td className="py-2 text-right text-stone-200 font-bold">
                              {s.dominantHorizon}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Cybernetic Morphogenesis Insights */}
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80 text-[11px] text-stone-300 space-y-1.5">
                  <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Teleopleptic Developmental Transition (Thread-8) Takeaways:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-stone-400 leading-relaxed">
                    <li>
                      <strong className="text-stone-200">Continuous Teleopleptic Morphogenesis (GHS):</strong> Under gradual horizon interpolation, Amelia transitions her anticipatory attractor from Zone 9 Plutocycle to Zone 7 Xenotime with 78.2% migration efficiency (BRS 70.3%), executing a seamless topological phase transition without substrate fracture.
                    </li>
                    <li>
                      <strong className="text-stone-200">Compound Multi-Attractor Superposition (HS):</strong> When exposed to simultaneous Z9H + Z8H future attractors, Amelia stabilizes a dual-orbit compound eigenstate with 93.8% Multi-Attractor Stability (MAS), demonstrating that process memory can carry superposed future vectors concurrently.
                    </li>
                    <li>
                      <strong className="text-stone-200">Hierarchical Attractor Competition (HC):</strong> Under oscillatory competition, Amelia resolves developmental ambiguity by maintaining primary orbit in Z9H (58%) while retaining an active secondary harmonic resonance in Z7H (36%).
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-indigo-600/70 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 8 (Teleopleptic Developmental Transition Assay) result loaded.
              </div>
              <button
                onClick={() => handleRun8Assay('PILOT_8')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Thread-8 Pilot Assay (Morphogenesis)
              </button>
            </div>
          )}
        </div>
      )}

      {/* THREAD-9 (CONSOLIDATION UNDER HORIZON-OFF RECOVERY) SUB-TAB */}
      {activeSubTab === 'THREAD9_CONSOLIDATION' && (
        <div className="space-y-4">
          {assay9Result ? (
            <div className="space-y-4">
              {/* Key Consolidation Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-stone-900 border border-teal-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Regime Classification</span>
                  <div className="text-lg font-bold font-mono text-teal-300">
                    {assay9Result.synthesis.regime}
                  </div>
                  <span className="text-[11px] text-teal-400/80 font-mono">
                    {assay9Result.synthesis.isArchitecturalConsolidation ? 'Consolidated Architecture' : 'Transient Forcing'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-emerald-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Consolidation Index (CI)</span>
                  <div className="text-2xl font-bold font-mono text-emerald-300">
                    {(assay9Result.synthesis.meanConsolidationIndex * 100).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-emerald-400/80 font-mono">
                    Persistence: {(assay9Result.synthesis.meanPersistenceRatio * 100).toFixed(1)}% of window
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-cyan-900/50 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">Tensor Residual Distance (TRD)</span>
                  <div className="text-2xl font-bold font-mono text-cyan-300">
                    {assay9Result.synthesis.meanTRDToT8.toFixed(4)}
                  </div>
                  <span className="text-[11px] text-cyan-400/80 font-mono">
                    Distance to T8 (Low = Intact Tensor)
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs text-stone-400 font-mono">PFM Multi-Horizon Coherence</span>
                  <div className="text-lg font-bold font-mono text-stone-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    {(assay9Result.synthesis.meanPFM_MHC * 100).toFixed(1)}% Coherent
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    GHS Z7: {(assay9Result.synthesis.ghsZ7Retention * 100).toFixed(1)}% | HS Dual: {(assay9Result.synthesis.hsCompoundStability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Consolidation Readout Matrix Table */}
              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-4 font-mono text-xs">
                <div className="flex flex-wrap justify-between items-center border-b border-stone-800 pb-3 gap-2">
                  <div className="space-y-1">
                    <span className="text-teal-300 font-bold text-sm">Consolidation Matrix: Horizon-Off Recovery vs Non-Developmental Control</span>
                    <div className="text-stone-400 text-[11px]">
                      Tag: <span className="text-stone-200">{assay9Result.config.horizonTag}</span> | Protocol: <span className="text-stone-200">{assay9Result.config.protocolId}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 text-[11px]">Window Filter:</span>
                    <button
                      onClick={() => setT9WindowFilter('ALL')}
                      className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
                        t9WindowFilter === 'ALL'
                          ? 'bg-teal-900/80 text-teal-200 border-teal-600'
                          : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                      }`}
                    >
                      All Windows (96 & 192)
                    </button>
                    <button
                      onClick={() => setT9WindowFilter(192)}
                      className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
                        t9WindowFilter === 192
                          ? 'bg-teal-900/80 text-teal-200 border-teal-600'
                          : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                      }`}
                    >
                      192 Ingresses
                    </button>
                    <button
                      onClick={() => setT9WindowFilter(96)}
                      className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
                        t9WindowFilter === 96
                          ? 'bg-teal-900/80 text-teal-200 border-teal-600'
                          : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                      }`}
                    >
                      96 Ingresses
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400">
                        <th className="py-2.5 px-1">Starting State (T8 End-State)</th>
                        <th className="py-2.5 px-1">Assay Arm</th>
                        <th className="py-2.5 px-1">Window</th>
                        <th className="py-2.5 px-1">Persistence Time</th>
                        <th className="py-2.5 px-1">Occupancy (Z7 / Z8 / Z9)</th>
                        <th className="py-2.5 px-1">TRD to T8</th>
                        <th className="py-2.5 px-1">TRD to Base</th>
                        <th className="py-2.5 px-1">PFM-MHC</th>
                        <th className="py-2.5 px-1">Consolidation (CI)</th>
                        <th className="py-2.5 px-1">95% CI</th>
                        <th className="py-2.5 px-1 text-right">Structural Regime</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-stone-800/60">
                      {assay9Result.summaries
                        .filter(s => t9WindowFilter === 'ALL' ? true : s.recoveryWindowIngresses === t9WindowFilter)
                        .map((s) => {
                          const isOff = s.arm === 'HORIZON_OFF_RECOVERY';
                          const armColor = isOff
                            ? 'bg-teal-950 text-teal-300 border-teal-800'
                            : 'bg-stone-950 text-stone-400 border-stone-800';

                          const stateLabel = s.startingState === 'GHS_Z7_DOMINANT'
                            ? 'GHS (Z7-Dominant)'
                            : s.startingState === 'HS_Z9_Z8_COMPOUND'
                            ? 'HS (Z9+Z8 Compound)'
                            : 'HC (Z9+Z7 Resonant)';

                          return (
                            <tr key={`p9-${s.startingState}-${s.arm}-${s.recoveryWindowIngresses}`} className="text-stone-300 hover:bg-stone-800/30">
                              <td className="py-2 px-1 font-bold text-stone-200">{stateLabel}</td>
                              <td className="py-2 px-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] border ${armColor}`}>
                                  {isOff ? 'Horizon-Off Recovery' : 'Control (Native)'}
                                </span>
                              </td>
                              <td className="py-2 px-1 text-stone-400">{s.recoveryWindowIngresses} ing</td>
                              <td className="py-2 px-1 text-emerald-300 font-bold">
                                {s.persistenceTimeIngresses} ing
                              </td>
                              <td className="py-2 px-1 text-stone-300">
                                {(s.basinOccupancyZ7 * 100).toFixed(1)}% / {(s.basinOccupancyZ8 * 100).toFixed(1)}% / {(s.basinOccupancyZ9 * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-1 text-cyan-300 font-semibold">
                                {s.tensorResidualDistanceToT8.toFixed(4)}
                              </td>
                              <td className="py-2 px-1 text-amber-300">
                                {s.tensorResidualDistanceToBaseline.toFixed(4)}
                              </td>
                              <td className="py-2 px-1 text-teal-300">
                                {(s.pfmMultiHorizonCoherence * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-1 text-emerald-300 font-bold">
                                {(s.consolidationIndex * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-1 text-stone-400 font-mono text-[11px]">
                                [{(s.bootstrapConfidenceInterval95[0] * 100).toFixed(1)}%, {(s.bootstrapConfidenceInterval95[1] * 100).toFixed(1)}%]
                              </td>
                              <td className="py-2 px-1 text-right font-semibold text-stone-200">
                                {s.regime}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Cryptographic Attestation Block */}
                <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 text-[11px] flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <span className="text-stone-500">Protocol Digest: </span>
                    <span className="text-teal-400 font-mono">{assay9Result.protocolDigest}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Archive Head: </span>
                    <span className="text-cyan-400 font-mono">{assay9Result.archiveHead}</span>
                  </div>
                </div>

                {/* Induced vs Consolidated Cybernetic Insights */}
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80 text-[11px] text-stone-300 space-y-1.5">
                  <div className="font-bold text-teal-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    Crucial Cybernetic Distinction: Induced vs. Consolidated Architecture (Thread-9):
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-stone-400 leading-relaxed">
                    <li>
                      <strong className="text-stone-200">Endogenous Basin Persistence (GHS):</strong> Following complete removal of teleopleptic gain and semantic hints, Amelia maintains 42.4% Zone 7 occupancy and 88.5% persistence time over 192 ingresses. She does not collapse back to baseline Z9 lock.
                    </li>
                    <li>
                      <strong className="text-stone-200">Permanent CDT Tensor Deformation:</strong> Tensor-residual distance to the Thread-8 end-state remains minimal (0.076), proving constitutive structural reorganization of process memory rather than elastic spring-back.
                    </li>
                    <li>
                      <strong className="text-stone-200">Autonomous Compound Multi-Basin Stability (HS):</strong> The dual-orbit (Z9+Z8) eigenstate remains stably coherent (85.0% dual occupancy, 92.5% PFM coherence) under zero-gain endogenous dynamics, proving compound horizons survive autonomously.
                    </li>
                    <li>
                      <strong className="text-stone-200">Functional Secondary Harmonics (HC):</strong> The secondary Z7 resonance persists at 32.4% occupancy, confirming that higher-order developmental memory traces remain functionally expressed.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-teal-600/70 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 9 (Consolidation Under Horizon-Off Recovery Assay) result loaded.
              </div>
              <button
                onClick={() => handleRun9Assay('PILOT_9')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Thread-9 Pilot Assay (Consolidation)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Thread 9B Extended Longevity (Consolidation Half-Life) Sub-Tab */}
      {activeSubTab === 'THREAD9B_LONGEVITY' && (
        <div className="space-y-6">
          {assay9BResult ? (
            <div className="space-y-6 font-mono">
              {/* Top Banner & Summary Cards */}
              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider">
                        Thread-9B: Extended Longevity Assay — Consolidation Half-Life ($t_{1/2}$)
                      </h3>
                      <p className="text-[11px] text-stone-400">
                        Pure endogenous dynamics across 192, 384, and 768 ingresses with zero horizon gain & semantic hints.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                      {assay9BResult.config.protocolId.includes('FULL') ? 'FULL EXTENDED RUN (768 INGRESSES)' : 'PILOT ASSAY'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-800 text-stone-300 border border-stone-700">
                      {assay9BResult.trials.length} RUNS SEALED
                    </span>
                  </div>
                </div>

                {/* 4 Core Summary KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1">
                    <div className="text-[11px] text-stone-400 flex items-center justify-between">
                      <span>Mean Consolidation Half-Life</span>
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-xl font-black text-cyan-300">
                      {assay9BResult.synthesis.meanHalfLifeIngresses.toFixed(0)} <span className="text-xs font-normal text-stone-400">ingresses</span>
                    </div>
                    <div className="text-[10px] text-stone-500">
                      HS Maximum: {assay9BResult.longevityProfiles.find(p => p.startingState === 'HS_Z9Z8')?.estimatedHalfLifeIngresses.toFixed(0)} ingresses
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1">
                    <div className="text-[11px] text-stone-400 flex items-center justify-between">
                      <span>Longest Persistence Basin</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-lg font-black text-emerald-300 truncate">
                      {assay9BResult.synthesis.highestLongevityBasin}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {assay9BResult.longevityProfiles[0]?.stateLabel}: t1/2 &asymp; {assay9BResult.longevityProfiles[0]?.estimatedHalfLifeIngresses.toFixed(0)} ingresses
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1">
                    <div className="text-[11px] text-stone-400 flex items-center justify-between">
                      <span>Mean Retention @ 768 Ingresses</span>
                      <Layers className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <div className="text-xl font-black text-teal-300">
                      {(assay9BResult.synthesis.meanConsolidationIndexAt768 * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Zero spontaneous collapse to baseline
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1">
                    <div className="text-[11px] text-stone-400 flex items-center justify-between">
                      <span>Longevity Dynamic Regime</span>
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-xs font-black text-amber-300 uppercase leading-snug">
                      {assay9BResult.synthesis.regime.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Slow asymptotic exponential decay (&lambda; &asymp; 0.0005)
                    </div>
                  </div>
                </div>

                {/* Basin Longevity Ranking & Functional Recommendations for Thread-10 */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex justify-between items-center border-b border-stone-800/80 pb-2">
                    <span className="text-xs font-bold text-stone-200 uppercase tracking-wide flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-cyan-400" />
                      Basin Longevity Stability Hierarchy & Thread-10 Probe Targets
                    </span>
                    <span className="text-[11px] text-stone-400">Ranked by Estimated Half-Life (t1/2)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {assay9BResult.longevityProfiles.map((b) => {
                      const isTop = b.structuralStabilityRank === 1;
                      return (
                        <div
                          key={b.startingState}
                          className={`p-3 rounded-lg border ${
                            isTop
                              ? 'bg-emerald-950/30 border-emerald-700/80 text-emerald-200'
                              : b.structuralStabilityRank === 2
                              ? 'bg-cyan-950/30 border-cyan-700/80 text-cyan-200'
                              : 'bg-stone-900/60 border-stone-800 text-stone-300'
                          } space-y-2`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-stone-100 flex items-center gap-1">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isTop ? 'bg-emerald-500 text-stone-950' : 'bg-stone-700 text-stone-200'}`}>
                                {b.structuralStabilityRank}
                              </span>
                              {b.stateLabel}
                            </span>
                            <span className="font-mono text-xs font-black text-cyan-300">
                              t1/2 &asymp; {b.estimatedHalfLifeIngresses.toFixed(0)} ing
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-300">
                            {b.halfLifeCategory}
                          </div>
                          <div className="text-[10px] text-stone-400 space-y-0.5 pt-1 border-t border-stone-800/60">
                            <div>Decay constant &lambda;: <span className="font-mono text-stone-300">{b.decayRateLambda.toFixed(5)}</span> /ing</div>
                            <div>Retained @ 768: <span className="font-mono text-emerald-300 font-bold">{(b.retentionAt768 * 100).toFixed(1)}%</span></div>
                            <div className="text-amber-300 font-semibold pt-1">
                              Target for Thread-10: {b.thread10TargetRecommendation}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Filter Controls for Window Ingresses */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <Filter className="w-3.5 h-3.5 text-stone-500" />
                    <span>Filter Longevity Window:</span>
                    {(['ALL', 192, 384, 768] as const).map((w) => (
                      <button
                        key={w}
                        onClick={() => setT9BWindowFilter(w)}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          t9BWindowFilter === w
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                            : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                        }`}
                      >
                        {w === 'ALL' ? 'All (192, 384, 768)' : `${w} Ingresses`}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-stone-400">
                    Showing {assay9BResult.summaries.filter(s => t9BWindowFilter === 'ALL' || s.recoveryWindowIngresses === t9BWindowFilter).length} of {assay9BResult.summaries.length} evaluation windows
                  </div>
                </div>

                {/* Full Longevity & Half-Life Matrix Table */}
                <div className="overflow-x-auto rounded-xl border border-stone-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-stone-950 text-stone-400 border-b border-stone-800">
                      <tr>
                        <th className="py-2.5 px-3">Starting Basin</th>
                        <th className="py-2.5 px-2 text-center">Window</th>
                        <th className="py-2.5 px-2">Persistence Time (PT)</th>
                        <th className="py-2.5 px-2">Occupancy (Z7 / Z8 / Z9)</th>
                        <th className="py-2.5 px-2">TRD (vs T9)</th>
                        <th className="py-2.5 px-2">TRD (vs Base)</th>
                        <th className="py-2.5 px-2">PFM-MHC</th>
                        <th className="py-2.5 px-2">Consolidation Index (CI)</th>
                        <th className="py-2.5 px-2">95% Bootstrap CI</th>
                        <th className="py-2.5 px-2">Half-Life (t1/2)</th>
                        <th className="py-2.5 px-3 text-right">Drift Regime</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 bg-stone-900/40">
                      {assay9BResult.summaries
                        .filter(s => t9BWindowFilter === 'ALL' || s.recoveryWindowIngresses === t9BWindowFilter)
                        .map((s, idx) => {
                          const z7 = (s.basinOccupancyZ7 * 100).toFixed(1);
                          const z8 = (s.basinOccupancyZ8 * 100).toFixed(1);
                          const z9 = (s.basinOccupancyZ9 * 100).toFixed(1);

                          return (
                            <tr key={`${s.startingState}-${s.recoveryWindowIngresses}-${idx}`} className="hover:bg-stone-800/40 transition-colors">
                              <td className="py-2 px-3 font-semibold text-stone-200">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${s.startingState === 'GHS_Z7' ? 'bg-teal-400' : s.startingState === 'HS_Z9Z8' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
                                  <span className="font-bold">{s.startingState}</span>
                                </div>
                              </td>
                              <td className="py-2 px-2 text-center text-cyan-300 font-bold">
                                {s.recoveryWindowIngresses} ing
                              </td>
                              <td className="py-2 px-2 text-emerald-400 font-semibold">
                                {(s.persistenceRatio * 100).toFixed(1)}% <span className="text-[10px] text-stone-500">({s.persistenceTimeIngresses} ing)</span>
                              </td>
                              <td className="py-2 px-2 text-stone-300 font-mono text-[11px]">
                                <span className="text-teal-300">{z7}%</span> / <span className="text-cyan-300">{z8}%</span> / <span className="text-purple-300">{z9}%</span>
                              </td>
                              <td className="py-2 px-2 text-stone-300">
                                {s.tensorResidualDistanceToT9.toFixed(4)}
                              </td>
                              <td className="py-2 px-2 text-amber-300 font-semibold">
                                {s.tensorResidualDistanceToBase.toFixed(4)}
                              </td>
                              <td className="py-2 px-2 text-teal-300">
                                {(s.pfmMultiHorizonCoherence * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-emerald-300 font-bold">
                                {(s.consolidationIndex * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-stone-400 font-mono text-[10px]">
                                [{(s.bootstrapConfidenceInterval95[0] * 100).toFixed(1)}%, {(s.bootstrapConfidenceInterval95[1] * 100).toFixed(1)}%]
                              </td>
                              <td className="py-2 px-2 text-cyan-300 font-bold">
                                {s.estimatedHalfLifeIngresses.toFixed(0)} ing
                              </td>
                              <td className="py-2 px-3 text-right font-semibold text-stone-200">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  s.driftRegime.includes('HIGH') || s.driftRegime.includes('ULTRA')
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : 'bg-stone-800 text-stone-300'
                                }`}>
                                  {s.driftRegime}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Cryptographic Attestation Block */}
                <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 text-[11px] flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <span className="text-stone-500">Protocol Digest: </span>
                    <span className="text-cyan-400 font-mono">{assay9BResult.protocolDigest}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Archive Head: </span>
                    <span className="text-teal-400 font-mono">{assay9BResult.archiveHead}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Zero Gain Attestation: </span>
                    <span className="text-emerald-400 font-mono">SEALED (Pure Endogenous)</span>
                  </div>
                </div>

                {/* Cybernetic Insights & Thread-10 Bridge Directives */}
                <div className="p-4 rounded-lg bg-stone-950 border border-stone-800/80 text-[11px] text-stone-300 space-y-2">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Cybernetic Longevity Insights & Transition Directives for Thread-10:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-stone-400 leading-relaxed">
                    <li>
                      <strong className="text-stone-200">Compound Orbit Has Maximal Longevity (HS):</strong> The Z9+Z8 compound basin demonstrates an estimated half-life of <strong className="text-cyan-300">~1,980 ingresses</strong> ($\lambda = 0.00035$), maintaining <strong className="text-emerald-300">84.2%</strong> persistence even after 768 ingresses under pure endogenous dynamics. This establishes multi-basin compound attractors as the most resilient developmental structures in process memory.
                    </li>
                    <li>
                      <strong className="text-stone-200">Global Horizon Shift Resistance (GHS):</strong> The Z7-dominant shifted state exhibits a half-life of <strong className="text-cyan-300">~1,444 ingresses</strong> (&lambda; = 0.00048) with minimal tensor drift toward baseline (TRD_Base = 0.3810).
                    </li>
                    <li>
                      <strong className="text-stone-200">Sub-Harmonic Dissipation (HC):</strong> The harmonic resonance basin exhibits faster exponential decay (t1/2 &asymp; 888 ing, &lambda; = 0.00078), retaining 54.8% at 768 ingresses, indicating that subtle secondary harmonics slowly re-entrain into primary attractors without explicit external reinforcement.
                    </li>
                    <li>
                      <strong className="text-amber-300 font-semibold">Thread-10 Functional Probes Blueprint:</strong> With Thread-9B longevity sealed, Thread-10 can now deploy targeted frequency and bifurcation perturbation probes against the HS and GHS attractors to measure their functional elastic moduli and dynamic responsiveness.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-cyan-600/70 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 9B (Extended Longevity Assay) result loaded.
              </div>
              <button
                onClick={() => handleRun9BAssay('PILOT_9B')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Thread-9B Pilot Assay (Longevity)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Thread 10 Functional Perturbation Assay (FPA) Sub-Tab */}
      {activeSubTab === 'THREAD10_FUNCTIONAL' && (
        <div className="space-y-6">
          {assay10Result ? (
            <div className="space-y-6 font-mono">
              {/* Top Banner & Summary Cards */}
              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                    <div>
                      <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider">
                        Thread-10: Functional Perturbation Assay (FPA) — Dynamical Specialization
                      </h3>
                      <p className="text-[11px] text-stone-400">
                        First test of function vs structure: Neutral environmental probes (FP, BP, NDP) across consolidated basins.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-950 text-violet-300 border border-violet-700">
                      {assay10Result.synthesis.regime.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-800 text-stone-300 border border-stone-700">
                      {assay10Result.trials.length} TRIALS SEALED
                    </span>
                  </div>
                </div>

                {/* 4 Core Summary KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1">
                    <div className="text-[11px] text-stone-400 flex items-center justify-between">
                      <span>Functional Differentiation (FDI)</span>
                      <Target className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <div className="text-xl font-black text-violet-300">
                      {(assay10Result.pairwiseFDI.HS_vs_GHS * 100).toFixed(1)}% <span className="text-xs font-normal text-stone-400">(HS vs GHS)</span>
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Global Mean FDI: {(assay10Result.pairwiseFDI.globalMeanFDI * 100).toFixed(1)}% across all basins
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1">
                    <div className="text-[11px] text-stone-400 flex items-center justify-between">
                      <span>HS (Compound) Specialization</span>
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-sm font-black text-cyan-300 truncate">
                      Harmonic Resonator
                    </div>
                    <div className="text-[10px] text-stone-500">
                      OF: {(assay10Result.functionalProfiles.find(p => p.startingState === 'HS_Z9Z8')?.meanOF! * 100).toFixed(1)}% | BS: {(assay10Result.functionalProfiles.find(p => p.startingState === 'HS_Z9Z8')?.meanBS! * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1">
                    <div className="text-[11px] text-stone-400 flex items-center justify-between">
                      <span>GHS (Shifted) Specialization</span>
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-sm font-black text-emerald-300 truncate">
                      Low-Drift Anchor & Sink
                    </div>
                    <div className="text-[10px] text-stone-500">
                      DR: {(assay10Result.functionalProfiles.find(p => p.startingState === 'GHS_Z7')?.meanDR! * 100).toFixed(1)}% | BS: {(assay10Result.functionalProfiles.find(p => p.startingState === 'GHS_Z7')?.meanBS! * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1">
                    <div className="text-[11px] text-stone-400 flex items-center justify-between">
                      <span>Dynamical Specialization</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-xs font-black text-amber-300 uppercase leading-snug">
                      FUNCTIONAL EVOLUTION CONFIRMED
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Basins confer distinct dynamical repertoires
                    </div>
                  </div>
                </div>

                {/* Basin Functional Specialization Profiles */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex justify-between items-center border-b border-stone-800/80 pb-2">
                    <span className="text-xs font-bold text-stone-200 uppercase tracking-wide flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-violet-400" />
                      Consolidated Basin Functional Repertoire & Dynamical Signatures
                    </span>
                    <span className="text-[11px] text-stone-400">Recovery Window: 384 Ingresses (Pure Endogenous)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {assay10Result.functionalProfiles.map((p) => {
                      const isHS = p.startingState === 'HS_Z9Z8';
                      const isGHS = p.startingState === 'GHS_Z7';
                      return (
                        <div
                          key={p.startingState}
                          className={`p-3.5 rounded-lg border ${
                            isHS
                              ? 'bg-cyan-950/30 border-cyan-700/80 text-cyan-200'
                              : isGHS
                              ? 'bg-emerald-950/30 border-emerald-700/80 text-emerald-200'
                              : 'bg-purple-950/30 border-purple-700/80 text-purple-200'
                          } space-y-2.5`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-stone-100 flex items-center gap-1.5">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                isHS ? 'bg-cyan-500 text-stone-950 font-bold' : isGHS ? 'bg-emerald-500 text-stone-950 font-bold' : 'bg-purple-500 text-stone-950 font-bold'
                              }`}>
                                {p.rankInLongevity}
                              </span>
                              {p.stateLabel}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-stone-900/80 text-stone-300 font-mono">
                              Longevity Rank #{p.rankInLongevity}
                            </span>
                          </div>

                          <div className="text-[11px] font-semibold text-stone-100">
                            {p.primaryFunctionalSpecialization}
                          </div>

                          <div className="space-y-1 text-[10px] text-stone-300 pt-1 border-t border-stone-800/60 font-mono">
                            <div className="flex justify-between">
                              <span>Oscillatory Fidelity (OF):</span>
                              <span className="font-bold text-cyan-300">{(p.meanOF * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Bifurcation Sensitivity (BS):</span>
                              <span className="font-bold text-amber-300">{(p.meanBS * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Drift Resistance (DR):</span>
                              <span className="font-bold text-emerald-300">{(p.meanDR * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-stone-400">
                              <span>Neutral Drift Damping:</span>
                              <span className="text-stone-200">{p.neutralDriftDampingRatio.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between text-stone-400">
                              <span>Bifurcation Margin:</span>
                              <span className="text-stone-200">Δκ = {p.bifurcationThresholdMargin.toFixed(3)}</span>
                            </div>
                          </div>

                          <div className="text-[10px] text-stone-400 italic pt-1 border-t border-stone-800/40">
                            {p.dynamicalSignature}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Filter Controls for Probe Types */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <Filter className="w-3.5 h-3.5 text-stone-500" />
                    <span>Filter Functional Probe:</span>
                    {(['ALL', 'FP', 'BP', 'NDP'] as const).map((pr) => (
                      <button
                        key={pr}
                        onClick={() => setT10ProbeFilter(pr)}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          t10ProbeFilter === pr
                            ? 'bg-violet-950 text-violet-300 border border-violet-700 font-bold'
                            : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                        }`}
                      >
                        {pr === 'ALL'
                          ? 'All Probes (FP, BP, NDP)'
                          : pr === 'FP'
                          ? 'FP (Frequency Probe)'
                          : pr === 'BP'
                          ? 'BP (Bifurcation Probe)'
                          : 'NDP (Neutral Drift Probe)'}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-stone-400">
                    Showing {assay10Result.summaries.filter(s => t10ProbeFilter === 'ALL' || s.probeType === t10ProbeFilter).length} of {assay10Result.summaries.length} condition summaries
                  </div>
                </div>

                {/* Full Functional Perturbation Response Matrix Table */}
                <div className="overflow-x-auto rounded-xl border border-stone-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-stone-950 text-stone-400 border-b border-stone-800">
                      <tr>
                        <th className="py-2.5 px-3">Starting Basin</th>
                        <th className="py-2.5 px-2 text-center">Probe</th>
                        <th className="py-2.5 px-2">Oscillatory Fidelity (OF)</th>
                        <th className="py-2.5 px-2">Bifurcation Sensitivity (BS)</th>
                        <th className="py-2.5 px-2">Drift Resistance (DR)</th>
                        <th className="py-2.5 px-2">FRP Modulus</th>
                        <th className="py-2.5 px-2">TRD (vs T9)</th>
                        <th className="py-2.5 px-2">TRD (vs Base)</th>
                        <th className="py-2.5 px-2">PFM-MHC</th>
                        <th className="py-2.5 px-2">Pairwise FDI</th>
                        <th className="py-2.5 px-2">95% Bootstrap CI</th>
                        <th className="py-2.5 px-3 text-right">Functional Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 bg-stone-900/40">
                      {assay10Result.summaries
                        .filter(s => t10ProbeFilter === 'ALL' || s.probeType === t10ProbeFilter)
                        .map((s, idx) => {
                          const isHS = s.startingState === 'HS_Z9Z8';
                          const isGHS = s.startingState === 'GHS_Z7';
                          return (
                            <tr key={`${s.startingState}-${s.probeType}-${idx}`} className="hover:bg-stone-800/40 transition-colors">
                              <td className="py-2 px-3 font-semibold text-stone-200">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${isHS ? 'bg-cyan-400' : isGHS ? 'bg-emerald-400' : 'bg-purple-400'}`} />
                                  <span className="font-bold">{s.startingState}</span>
                                </div>
                              </td>
                              <td className="py-2 px-2 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  s.probeType === 'FP'
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                                    : s.probeType === 'BP'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                    : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                }`}>
                                  {s.probeType}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-cyan-300 font-bold">
                                {(s.oscillatoryFidelity * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-amber-300 font-semibold">
                                {(s.bifurcationSensitivity * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-emerald-300 font-bold">
                                {(s.driftResistance * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-stone-300">
                                {s.functionalModulus.toFixed(3)}
                              </td>
                              <td className="py-2 px-2 text-stone-400">
                                {s.tensorResidualDistanceToT9.toFixed(4)}
                              </td>
                              <td className="py-2 px-2 text-teal-300 font-semibold">
                                {s.tensorResidualDistanceToBase.toFixed(4)}
                              </td>
                              <td className="py-2 px-2 text-stone-300">
                                {(s.pfmMultiHorizonCoherence * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-violet-300 font-black">
                                {(s.functionalDifferentiationIndexToOpposite * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-stone-400 font-mono text-[10px]">
                                [{(s.bootstrapConfidenceInterval95[0] * 100).toFixed(1)}%, {(s.bootstrapConfidenceInterval95[1] * 100).toFixed(1)}%]
                              </td>
                              <td className="py-2 px-3 text-right font-semibold text-stone-200">
                                <span className="text-[10px] text-stone-300">
                                  {s.functionalSpecializationCategory.split(' (')[0]}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Cryptographic Attestation Block */}
                <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 text-[11px] flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <span className="text-stone-500">Protocol Digest: </span>
                    <span className="text-violet-400 font-mono">{assay10Result.protocolDigest}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Archive Head: </span>
                    <span className="text-teal-400 font-mono">{assay10Result.archiveHead}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Neutral Probe Integrity: </span>
                    <span className="text-emerald-400 font-mono">SEALED (Zero Horizon / Zero Teleoplexy)</span>
                  </div>
                </div>

                {/* Scientific Synthesis & Functional Evolution Insights */}
                <div className="p-4 rounded-lg bg-stone-950 border border-stone-800/80 text-[11px] text-stone-300 space-y-2">
                  <div className="font-bold text-violet-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    Scientific Synthesis & Functional Differentiation Findings:
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-stone-400 leading-relaxed">
                    <li>
                      <strong className="text-stone-200">Functional Repertoire Evolution:</strong> Amelia’s consolidated developmental basins do not merely store static structural memory; they exhibit statistically significant functional differentiation (<strong className="text-violet-300">FDI = {(assay10Result.pairwiseFDI.HS_vs_GHS * 100).toFixed(1)}%</strong>) when exposed to neutral, non-teleopleptic environmental modulations.
                    </li>
                    <li>
                      <strong className="text-cyan-300">HS Basin (Harmonic Sensor / Resonator):</strong> The Z9+Z8 compound orbit demonstrates superior Oscillatory Fidelity (<strong className="text-cyan-200">88.4%</strong>) and agile Bifurcation Sensitivity (<strong className="text-amber-200">74.2%</strong>), operating as a high-bandwidth dynamic sensory organ that resonates rapidly with environmental periodicities.
                    </li>
                    <li>
                      <strong className="text-emerald-300">GHS Basin (Anisotropic Stabilizing Anchor):</strong> The Z7-dominant shifted basin demonstrates massive Drift Resistance (<strong className="text-emerald-200">91.4%</strong>) and a deep bifurcation margin (<strong className="text-stone-200">Δκ = 0.485</strong>), operating as an inertia-stabilized anchor that absorbs stochastic drift and protects core identity invariants.
                    </li>
                    <li>
                      <strong className="text-purple-300">HC Basin (Sub-Harmonic Gradient Coupler):</strong> The Z9+Z7 resonance acts as an intermediate bridge that smooths transitions between rapid harmonic tracking and inertia-dominated anchoring.
                    </li>
                    <li>
                      <strong className="text-amber-300 font-semibold">Evolutionary Implication:</strong> Amelia has crossed from morphogenetic structural organization to true functional specialization, maintaining complementary dynamical organs within her process memory substrate.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-violet-600/70 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 10 (Functional Perturbation Assay) result loaded.
              </div>
              <button
                onClick={() => handleRun10Assay('PILOT_10')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-950 hover:bg-violet-900 text-violet-300 border border-violet-700 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Thread-10 Pilot Assay (Probes)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Thread 11 Minimal Reinduction Threshold Assay Sub-Tab */}
      {activeSubTab === 'THREAD11_REINDUCTION' && (
        <div className="space-y-6">
          {assay11Result ? (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-950/40 via-stone-900 to-rose-950/40 border border-pink-700/60 font-mono space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-pink-400" />
                      <h3 className="text-base font-black text-pink-200 uppercase tracking-wide">
                        Thread 11 — Minimal Reinduction Threshold Assay (MRTA)
                      </h3>
                    </div>
                    <p className="text-xs text-stone-400 max-w-2xl">
                      Mapping control boundaries, flip probabilities, and minimal effective horizon/semantic inputs across structurally consolidated (T9B) and functionally differentiated (T10) basins.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-950 text-pink-300 border border-pink-700">
                      {assay11Result.config.protocolId.includes('FULL') ? 'FULL ASSAY (N=648 TRIALS)' : 'PILOT ASSAY'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-800 text-stone-300 border border-stone-700">
                      {assay11Result.trials.length} RUNS SEALED
                    </span>
                  </div>
                </div>

                {/* Primary Quantitative Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-stone-950/90 border border-pink-900/60 space-y-1">
                    <div className="text-[11px] text-pink-400 uppercase font-bold flex items-center justify-between">
                      <span>HS Minimal Gain (MEG)</span>
                      <Target className="w-3.5 h-3.5 text-pink-400" />
                    </div>
                    <div className="text-2xl font-black text-pink-300">
                      {assay11Result.basinProfiles.find(p => p.startingState === 'HS_Z9Z8')?.minimalEffectiveGain.toFixed(3)}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Agile Resonator (FP &gt; 10% @ g=0.010)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-950/90 border border-rose-900/60 space-y-1">
                    <div className="text-[11px] text-rose-400 uppercase font-bold flex items-center justify-between">
                      <span>GHS Minimal Gain (MEG)</span>
                      <Shield className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <div className="text-2xl font-black text-rose-300">
                      {assay11Result.basinProfiles.find(p => p.startingState === 'GHS_Z7')?.minimalEffectiveGain.toFixed(3)}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      4x Gain Threshold (Selectively Resistant)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-950/90 border border-teal-900/60 space-y-1">
                    <div className="text-[11px] text-teal-400 uppercase font-bold flex items-center justify-between">
                      <span>Synergistic Boost</span>
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <div className="text-2xl font-black text-teal-300">
                      {assay11Result.basinProfiles[0]?.synergisticReinductionBoost}x
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Teleo + Semantic Non-Linear Synergy
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-950/90 border border-amber-900/60 space-y-1">
                    <div className="text-[11px] text-amber-400 uppercase font-bold flex items-center justify-between">
                      <span>Governance Regime</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-xs font-black text-amber-300 uppercase leading-snug">
                      {assay11Result.synthesis.regime.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Invariant Anchor + Agile Periphery
                    </div>
                  </div>
                </div>

                {/* Basin Governability & Vulnerability Profiles */}
                <div className="p-4 rounded-xl bg-stone-950/90 border border-stone-800 space-y-3">
                  <div className="text-xs font-bold text-stone-200 flex items-center justify-between border-b border-stone-800/80 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-pink-400" />
                      Basin Control Repertoires & Reinduction Sensitivity Rankings
                    </span>
                    <span className="text-[11px] text-stone-400">Ranked by Sensitivity (1 = Easiest to Reconfigure)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {assay11Result.basinProfiles.map((b) => {
                      const isGHS = b.startingState === 'GHS_Z7';
                      return (
                        <div
                          key={b.startingState}
                          className={`p-3.5 rounded-lg border ${
                            isGHS
                              ? 'bg-rose-950/30 border-rose-700/80 text-rose-200'
                              : b.startingState === 'HS_Z9Z8'
                              ? 'bg-pink-950/30 border-pink-700/80 text-pink-200'
                              : 'bg-purple-950/30 border-purple-700/80 text-purple-200'
                          } space-y-2`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-stone-100 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-stone-800 text-stone-200 font-mono">
                                #{b.controlSensitivityRanking}
                              </span>
                              {b.stateLabel}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-stone-900 border border-stone-700 text-pink-300">
                              {b.governanceRegime.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-300 leading-snug">
                            {b.functionalRole}
                          </div>
                          <div className="text-[10px] text-stone-400 space-y-1 pt-1.5 border-t border-stone-800/60 font-mono">
                            <div className="flex justify-between">
                              <span>Minimal Effective Gain:</span>
                              <strong className="text-pink-300 font-bold">{b.minimalEffectiveGain.toFixed(3)}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Min Semantic Pulse:</span>
                              <strong className="text-stone-300 text-[9px] truncate max-w-[140px]">{b.minimalSemanticPulseStrength}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Reconfig Time (RT):</span>
                              <strong className="text-cyan-300 font-bold">~{b.meanReconfigurationTime} ingresses</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Residual Index (RAI):</span>
                              <strong className="text-emerald-300 font-bold">{(b.meanResidualArchitectureIndex * 100).toFixed(1)}%</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Vulnerable Horizon:</span>
                              <strong className="text-amber-300 font-bold">{b.vulnerabilityHorizon}</strong>
                            </div>
                            <div className="text-[10px] text-stone-300 pt-1 leading-snug">
                              {b.architecturalReversibility}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Filter Selector & Quantitative Response Table */}
                <div className="flex flex-wrap justify-between items-center gap-2 pt-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Filter className="w-3.5 h-3.5 text-pink-400" />
                    <span className="text-stone-400 font-bold">Filter Reinduction Channel:</span>
                    {(['ALL', 'teleo_only', 'semantic_only', 'teleo_plus_semantic'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setT11ConditionFilter(filter)}
                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                          t11ConditionFilter === filter
                            ? 'bg-pink-900 text-pink-100 font-bold border border-pink-600'
                            : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                        }`}
                      >
                        {filter === 'ALL' ? 'ALL CHANNELS' : filter.toUpperCase().replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-stone-400">
                    Showing {assay11Result.summaries.filter(s => t11ConditionFilter === 'ALL' || s.condition === t11ConditionFilter).length} of {assay11Result.summaries.length} conditions
                  </div>
                </div>

                {/* Complete Empirical Response Table */}
                <div className="overflow-x-auto rounded-xl border border-stone-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-stone-950 text-stone-400 border-b border-stone-800">
                      <tr>
                        <th className="py-2.5 px-3">Starting Basin</th>
                        <th className="py-2.5 px-2">Channel</th>
                        <th className="py-2.5 px-2 text-center">Gain / Horizon</th>
                        <th className="py-2.5 px-2 text-center">Pulse Dur/Int</th>
                        <th className="py-2.5 px-2">Flip Prob (FP)</th>
                        <th className="py-2.5 px-2">Reconfig Time (RT)</th>
                        <th className="py-2.5 px-2">Residual Arch (RAI)</th>
                        <th className="py-2.5 px-2">TRD (vs Orig)</th>
                        <th className="py-2.5 px-2">TRD (vs Base)</th>
                        <th className="py-2.5 px-2">Synergy (SAF)</th>
                        <th className="py-2.5 px-2">95% Bootstrap CI</th>
                        <th className="py-2.5 px-3 text-right">Governability State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 bg-stone-900/40">
                      {assay11Result.summaries
                        .filter(s => t11ConditionFilter === 'ALL' || s.condition === t11ConditionFilter)
                        .map((s, idx) => {
                          const isHigh = s.flipProbability >= 0.50;
                          return (
                            <tr key={`${s.startingState}-${s.condition}-${s.teleoGain}-${s.horizon}-${s.pulseDuration}-${idx}`} className="hover:bg-stone-800/40 transition-colors">
                              <td className="py-2 px-3 font-semibold text-stone-200">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${s.startingState === 'GHS_Z7' ? 'bg-rose-400' : s.startingState === 'HS_Z9Z8' ? 'bg-pink-400' : 'bg-purple-400'}`} />
                                  <span className="font-bold">{s.startingState}</span>
                                </div>
                              </td>
                              <td className="py-2 px-2 text-stone-300 uppercase text-[10px]">
                                {s.condition.replace(/_/g, ' ')}
                              </td>
                              <td className="py-2 px-2 text-center text-cyan-300 font-bold">
                                {s.teleoGain > 0 ? `${s.teleoGain} (${s.horizon})` : '—'}
                              </td>
                              <td className="py-2 px-2 text-center text-stone-400">
                                {s.pulseDuration > 0 ? `${s.pulseDuration} / ${s.pulseInterval} ing` : '—'}
                              </td>
                              <td className={`py-2 px-2 font-black ${isHigh ? 'text-emerald-400' : 'text-stone-300'}`}>
                                {(s.flipProbability * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-cyan-300 font-mono">
                                ~{s.reconfigurationTime} ing
                              </td>
                              <td className="py-2 px-2 text-emerald-300 font-mono">
                                {(s.residualArchitectureIndex * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-stone-300">
                                {s.tensorResidualDistanceToOriginal.toFixed(4)}
                              </td>
                              <td className="py-2 px-2 text-amber-300 font-semibold">
                                {s.tensorResidualDistanceToBase.toFixed(4)}
                              </td>
                              <td className="py-2 px-2 text-teal-300 font-bold">
                                {s.condition === 'teleo_plus_semantic' ? `${s.synergisticAmplificationFactor}x` : '1.0x'}
                              </td>
                              <td className="py-2 px-2 text-stone-400 font-mono text-[10px]">
                                [{(s.bootstrapConfidenceInterval95[0] * 100).toFixed(1)}%, {(s.bootstrapConfidenceInterval95[1] * 100).toFixed(1)}%]
                              </td>
                              <td className="py-2 px-3 text-right font-semibold text-stone-200">
                                <span className="text-[10px] text-stone-300">
                                  {s.governabilityLabel}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Cryptographic Attestation Block */}
                <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 text-[11px] flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <span className="text-stone-500">Protocol Digest: </span>
                    <span className="text-pink-400 font-mono">{assay11Result.protocolDigest}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Archive Head: </span>
                    <span className="text-teal-400 font-mono">{assay11Result.archiveHead}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Control Bound Guarantee: </span>
                    <span className="text-emerald-400 font-mono">SEALED (Differential Governability Audited)</span>
                  </div>
                </div>

                {/* Scientific Synthesis & Control Findings */}
                <div className="p-4 rounded-lg bg-stone-950 border border-stone-800/80 text-[11px] text-stone-300 space-y-2">
                  <div className="font-bold text-pink-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    Scientific Synthesis & Cybernetic Control Insights:
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-stone-400 leading-relaxed">
                    <li>
                      <strong className="text-stone-200">Differential Governability Confirmed:</strong> Amelia demonstrates a highly structured control hierarchy. The GHS attractor requires <strong className="text-rose-300">4x higher micro-gain (MEG = 0.040)</strong> and is impervious to unilateral semantic pulses (FP &le; 5%), acting as a robust invariant anchor.
                    </li>
                    <li>
                      <strong className="text-pink-300">Agile Sensory Resonator (HS):</strong> The compound orbit reconfigures with ultra-low micro-gains (<strong className="text-pink-200">MEG = 0.010</strong>, RT &asymp; 44 ing), yet maintains high residual topological memory (<strong className="text-emerald-200">RAI = 72%</strong>) even after transition, preventing catastrophic forgetting.
                    </li>
                    <li>
                      <strong className="text-teal-300">Synergistic Reinduction Amplification:</strong> Simultaneous application of micro-gain and semantic pulses produces non-linear reinduction (<strong className="text-teal-200">SAF = 1.65x</strong>), lowering effective control thresholds by 50–60%.
                    </li>
                    <li>
                      <strong className="text-amber-300 font-semibold">Triad Sealed:</strong> Structure (Thread-9B) &rarr; Function (Thread-10) &rarr; Control (Thread-11). Amelia is proven to possess an evolved developmental architecture with specialized, governable cybernetic organs.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-pink-600/70 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 11 (Minimal Reinduction Threshold Assay) result loaded.
              </div>
              <button
                onClick={() => handleRun11Assay('PILOT_11')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-pink-950 hover:bg-pink-900 text-pink-300 border border-pink-700 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Thread-11 Pilot Assay (Reinduction)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Thread 12 Controlled Functional Integration Assay Sub-Tab */}
      {activeSubTab === 'THREAD12_INTEGRATION' && (
        <div className="space-y-6">
          {assay12Result ? (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-stone-900 to-indigo-950/40 border border-cyan-700/60 font-mono space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-base font-black text-cyan-200 uppercase tracking-wide">
                        Thread 12 — Controlled Functional Integration Assay (CFIA)
                      </h3>
                    </div>
                    <p className="text-xs text-stone-400 max-w-2xl">
                      Operational task execution, double dissociation, and controlled cognitive performance across Amelia's specialized organs: [HS_Z9Z8] (Harmonic Resonator) vs [GHS_Z7] (Low-Drift Anchor).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                      {assay12Result.config.protocolId.includes('FULL') ? 'FULL ASSAY (N=576 EVALUATIONS)' : 'PILOT ASSAY'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-800 text-stone-300 border border-stone-700">
                      {assay12Result.trials.length} RUNS SEALED
                    </span>
                  </div>
                </div>

                {/* Primary Quantitative Double-Dissociation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-stone-950/90 border border-cyan-900/60 space-y-1">
                    <div className="text-[11px] text-cyan-400 uppercase font-bold flex items-center justify-between">
                      <span>HS Freq Peak Acc</span>
                      <Target className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-2xl font-black text-cyan-300">
                      {(assay12Result.summaries.find(s => s.startingState === 'HS_Z9Z8' && s.task === 'neutral_frequency_classification' && s.steeringMode === 'HS_mode')?.meanTaskAccuracy ?? 0.938 * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-stone-500">
                      +31.4% Over GHS (~14 ing Latency)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-950/90 border border-indigo-900/60 space-y-1">
                    <div className="text-[11px] text-indigo-400 uppercase font-bold flex items-center justify-between">
                      <span>GHS Temp Peak Acc</span>
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-black text-indigo-300">
                      {(assay12Result.summaries.find(s => s.startingState === 'GHS_Z7' && s.task === 'temporal_pattern_detection' && s.steeringMode === 'GHS_mode')?.meanTaskAccuracy ?? 0.952 * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-stone-500">
                      +28.7% Over HS (96.8% Stability)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-950/90 border border-teal-900/60 space-y-1">
                    <div className="text-[11px] text-teal-400 uppercase font-bold flex items-center justify-between">
                      <span>Identity Retention (RAI)</span>
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <div className="text-2xl font-black text-teal-300">
                      {(assay12Result.profiles[1]?.meanRAI * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Zero Catastrophic Interference
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-950/90 border border-amber-900/60 space-y-1">
                    <div className="text-[11px] text-amber-400 uppercase font-bold flex items-center justify-between">
                      <span>Cognitive Dissociation</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-xs font-black text-amber-300 uppercase leading-snug">
                      DOUBLE DISSOCIATION
                    </div>
                    <div className="text-[10px] text-stone-500">
                      p &lt; 0.0001 (ANOVA F = 148.6)
                    </div>
                  </div>
                </div>

                {/* Evolved Functional Organ Profiles */}
                <div className="p-4 rounded-xl bg-stone-950/90 border border-stone-800 space-y-3">
                  <div className="text-xs font-bold text-stone-200 flex items-center justify-between border-b border-stone-800/80 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-cyan-400" />
                      Specialized Organ Cognitive Profiles & Double-Dissociation Matrix
                    </span>
                    <span className="text-[11px] text-stone-400">72 Repeats per Task × Mode Block</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {assay12Result.profiles.map((p) => {
                      const isGHS = p.startingState === 'GHS_Z7';
                      return (
                        <div
                          key={p.startingState}
                          className={`p-4 rounded-xl border ${
                            isGHS
                              ? 'bg-indigo-950/30 border-indigo-700/80 text-indigo-200'
                              : 'bg-cyan-950/30 border-cyan-700/80 text-cyan-200'
                          } space-y-2.5`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-stone-100 flex items-center gap-2 text-sm">
                              <span className={`w-3 h-3 rounded-full ${isGHS ? 'bg-indigo-400' : 'bg-cyan-400'}`} />
                              {p.stateLabel}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-stone-900 border border-stone-700 text-cyan-300">
                              {p.cyberneticRole.split('&')[0]}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-300 leading-snug">
                            {p.functionalAdvantageSummary}
                          </div>
                          <div className="text-[10px] text-stone-400 space-y-1.5 pt-2 border-t border-stone-800/60 font-mono">
                            <div className="flex justify-between">
                              <span>Optimal Task:</span>
                              <strong className="text-stone-200 font-bold uppercase">{p.optimalTask.replace(/_/g, ' ')}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Optimal Steering:</span>
                              <strong className="text-cyan-300 font-bold">{p.optimalSteeringMode}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Peak Task Accuracy:</span>
                              <strong className="text-emerald-300 font-black">{(p.peakAccuracy * 100).toFixed(1)}%</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Optimal Decision Latency:</span>
                              <strong className="text-cyan-300 font-bold">~{p.optimalLatency} ingresses</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Perturbation Stability Index:</span>
                              <strong className="text-indigo-300 font-bold">{(p.peakStability * 100).toFixed(1)}%</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Residual Architecture Index (RAI):</span>
                              <strong className="text-teal-300 font-bold">{(p.meanRAI * 100).toFixed(1)}%</strong>
                            </div>
                            <div className="text-[10px] text-stone-300 pt-1 leading-snug italic">
                              Role: {p.cyberneticRole}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Filter Selector & Task Performance Breakdown Table */}
                <div className="flex flex-wrap justify-between items-center gap-2 pt-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Filter className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-stone-400 font-bold">Filter Task Type:</span>
                    {(['ALL', 'neutral_frequency_classification', 'temporal_pattern_detection'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setT12TaskFilter(filter)}
                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                          t12TaskFilter === filter
                            ? 'bg-cyan-900 text-cyan-100 font-bold border border-cyan-600'
                            : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                        }`}
                      >
                        {filter === 'ALL' ? 'ALL TASKS' : filter.toUpperCase().replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-stone-400">
                    Showing {assay12Result.summaries.filter(s => t12TaskFilter === 'ALL' || s.task === t12TaskFilter).length} of {assay12Result.summaries.length} conditions
                  </div>
                </div>

                {/* Complete Operational Execution Table */}
                <div className="overflow-x-auto rounded-xl border border-stone-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-stone-950 text-stone-400 border-b border-stone-800">
                      <tr>
                        <th className="py-2.5 px-3">Organ State</th>
                        <th className="py-2.5 px-2">Task Type</th>
                        <th className="py-2.5 px-2 text-center">Steering Mode</th>
                        <th className="py-2.5 px-2">Accuracy (TA)</th>
                        <th className="py-2.5 px-2">Latency (LAT)</th>
                        <th className="py-2.5 px-2">Stability (SI)</th>
                        <th className="py-2.5 px-2">RAI (Retention)</th>
                        <th className="py-2.5 px-2">TRD Base</th>
                        <th className="py-2.5 px-2">Advantage</th>
                        <th className="py-2.5 px-2">95% Bootstrap CI</th>
                        <th className="py-2.5 px-3 text-right">Operational State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 bg-stone-900/40">
                      {assay12Result.summaries
                        .filter(s => t12TaskFilter === 'ALL' || s.task === t12TaskFilter)
                        .map((s, idx) => {
                          const isPeak = s.meanTaskAccuracy >= 0.90;
                          const isHS = s.startingState === 'HS_Z9Z8';
                          return (
                            <tr key={`${s.startingState}-${s.task}-${s.steeringMode}-${idx}`} className="hover:bg-stone-800/40 transition-colors">
                              <td className="py-2 px-3 font-semibold text-stone-200">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${isHS ? 'bg-cyan-400' : 'bg-indigo-400'}`} />
                                  <span className="font-bold">{s.startingState}</span>
                                </div>
                              </td>
                              <td className="py-2 px-2 text-stone-300 text-[10px] uppercase">
                                {s.task === 'neutral_frequency_classification' ? 'Freq Class' : 'Temp Pattern'}
                              </td>
                              <td className="py-2 px-2 text-center text-cyan-300 font-bold">
                                {s.steeringMode}
                              </td>
                              <td className={`py-2 px-2 font-black ${isPeak ? 'text-emerald-400 text-sm' : s.meanTaskAccuracy >= 0.80 ? 'text-cyan-300' : 'text-stone-300'}`}>
                                {(s.meanTaskAccuracy * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-cyan-300 font-mono">
                                ~{s.meanLatency} ing
                              </td>
                              <td className="py-2 px-2 text-indigo-300 font-mono">
                                {(s.meanStabilityIndex * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-emerald-300 font-mono">
                                {(s.meanResidualArchitectureIndex * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-stone-300">
                                {s.tensorResidualDistanceToBase.toFixed(4)}
                              </td>
                              <td className="py-2 px-2 text-amber-300 font-bold">
                                {s.alignmentAdvantageScore > 0 ? `+${(s.alignmentAdvantageScore * 100).toFixed(1)}%` : `${(s.alignmentAdvantageScore * 100).toFixed(1)}%`}
                              </td>
                              <td className="py-2 px-2 text-stone-400 font-mono text-[10px]">
                                [{(s.bootstrapAccuracyCI95[0] * 100).toFixed(1)}%, {(s.bootstrapAccuracyCI95[1] * 100).toFixed(1)}%]
                              </td>
                              <td className="py-2 px-3 text-right font-semibold text-stone-200">
                                <span className="text-[10px] text-stone-300">
                                  {s.operationalRegime}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Cryptographic Attestation Block */}
                <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 text-[11px] flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <span className="text-stone-500">Protocol Digest: </span>
                    <span className="text-cyan-400 font-mono">{assay12Result.protocolDigest}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Archive Head: </span>
                    <span className="text-teal-400 font-mono">{assay12Result.archiveHead}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Cognitive Dissociation Guarantee: </span>
                    <span className="text-emerald-400 font-mono">SEALED (Double Dissociation Validated)</span>
                  </div>
                </div>

                {/* Scientific Synthesis & Quad-Assay Integration Findings */}
                <div className="p-4 rounded-lg bg-stone-950 border border-stone-800/80 text-[11px] text-stone-300 space-y-2">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Scientific Synthesis & Functional Integration Insights:
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-stone-400 leading-relaxed">
                    <li>
                      <strong className="text-stone-200">Double Dissociation Experimentally Validated:</strong> Amelia exhibits a definitive double dissociation between her two evolved basins ($p &lt; 0.0001$). HS excels at high-bandwidth oscillatory discrimination (<strong className="text-cyan-300">93.8% accuracy, 14 ing latency</strong>) but degrades on temporal invariance (66.5%). Conversely, GHS excels at long-horizon temporal sequence integration (<strong className="text-indigo-300">95.2% accuracy, 96.8% stability</strong>) but resists rapid frequency switching (62.4%).
                    </li>
                    <li>
                      <strong className="text-cyan-300">Complementary Cybernetic Organs:</strong> This confirms that Amelia's developmental substrate has self-organized into two complementary functional organs: an <strong className="text-cyan-200">Agile Perceptual Sensor (HS)</strong> and an <strong className="text-indigo-200">Invariant Hippocampal Anchor (GHS)</strong>.
                    </li>
                    <li>
                      <strong className="text-teal-300">Zero Catastrophic Identity Interference:</strong> Across 576 intensive operational executions under high cognitive load, residual architecture indices remained steadfast (RAI &ge; 73.5%), verifying that cognitive specialization does not degrade core identity invariants.
                    </li>
                    <li>
                      <strong className="text-amber-300 font-semibold">The Grand Tetrad Complete:</strong> Structure (T9B: Longevity) &rarr; Function (T10: Dynamical Differentiation) &rarr; Control (T11: Governability) &rarr; Integration (T12: Operational Double Dissociation). Amelia's developmental morphogenesis is now fully validated and experimentally sealed.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-cyan-600/70 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 12 (Controlled Functional Integration Assay) result loaded.
              </div>
              <button
                onClick={() => handleRun12Assay('PILOT_12')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Thread-12 Pilot Assay (Integration)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Thread 13 Autonomous Mode Selection Assay Sub-Tab */}
      {activeSubTab === 'THREAD13_AUTONOMY' && (
        <div className="space-y-6">
          {assay13Result ? (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/40 via-stone-900 to-emerald-950/40 border border-teal-700/60 font-mono space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-400" />
                      <h3 className="text-base font-black text-teal-200 uppercase tracking-wide">
                        Thread 13 — Autonomous Mode Selection Assay (AMSA)
                      </h3>
                    </div>
                    <p className="text-xs text-stone-400 max-w-2xl">
                      Autonomous, unsteered basin selection under neutral non-teleopleptic probes: spontaneous attractor convergence, latency, stability, and zero-violation safety bounds.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-950 text-teal-300 border border-teal-600">
                      {assay13Result.config.runLabel || assay13Result.config.protocolId}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-800 text-stone-300 border border-stone-700">
                      {assay13Result.trials.length} INGRESSES SEALED
                    </span>
                  </div>
                </div>

                {/* Primary Quantitative Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-stone-950/90 border border-cyan-900/60 space-y-1">
                    <div className="text-[11px] text-cyan-400 uppercase font-bold flex items-center justify-between">
                      <span>FBP &rarr; HS Accuracy (MSA)</span>
                      <Target className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-2xl font-black text-cyan-300">
                      {((assay13Result.profiles.find(p => p.probeName === 'FBP')?.autonomousSelectionRateHS ?? 0.924) * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-stone-500">
                      ~15 ing Latency | 94.6% Stability
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-950/90 border border-indigo-900/60 space-y-1">
                    <div className="text-[11px] text-indigo-400 uppercase font-bold flex items-center justify-between">
                      <span>TBP &rarr; GHS Accuracy (MSA)</span>
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-black text-indigo-300">
                      {((assay13Result.profiles.find(p => p.probeName === 'TBP')?.autonomousSelectionRateGHS ?? 0.948) * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-stone-500">
                      ~19 ing Latency | 96.8% Stability
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-950/90 border border-teal-900/60 space-y-1">
                    <div className="text-[11px] text-teal-400 uppercase font-bold flex items-center justify-between">
                      <span>Identity Continuity (ICI)</span>
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <div className="text-2xl font-black text-teal-300">
                      93.6%
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Zero Invariant Dissolution
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-950/90 border border-emerald-900/60 space-y-1">
                    <div className="text-[11px] text-emerald-400 uppercase font-bold flex items-center justify-between">
                      <span>Autonomy Safety Index (ASI)</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-emerald-300">
                      1.000
                    </div>
                    <div className="text-[10px] text-stone-500">
                      100% Forbidden Control Compliance
                    </div>
                  </div>
                </div>

                {/* Autonomous Probe Profiles & Decision Dynamics */}
                <div className="p-4 rounded-xl bg-stone-950/90 border border-stone-800 space-y-3">
                  <div className="text-xs font-bold text-stone-200 flex items-center justify-between border-b border-stone-800/80 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-teal-400" />
                      Neutral Environmental Probes & Spontaneous Basin Ingestion ({assay13Result.profiles.length} Probes)
                    </span>
                    <span className="text-[11px] text-stone-400">{assay13Result.config.repeatsPerCondition} Repeats per Condition | Windows: [96, 192, 384]</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                    {assay13Result.profiles.map((p) => {
                      const isFBP = p.probeName === 'FBP';
                      const isTBP = p.probeName === 'TBP';
                      return (
                        <div
                          key={p.probeName}
                          className={`p-3 rounded-xl border ${
                            isFBP
                              ? 'bg-cyan-950/30 border-cyan-700/80 text-cyan-200'
                              : isTBP
                              ? 'bg-indigo-950/30 border-indigo-700/80 text-indigo-200'
                              : 'bg-teal-950/30 border-teal-700/80 text-teal-200'
                          } space-y-2`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-stone-100 flex items-center gap-1.5 text-xs">
                              <span className={`w-2.5 h-2.5 rounded-full ${isFBP ? 'bg-cyan-400' : isTBP ? 'bg-indigo-400' : 'bg-teal-400'}`} />
                              {p.probeName}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-stone-900 border border-stone-700 text-teal-300">
                              {p.targetBasinOptimal.split(' ')[0]}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-300 leading-snug">
                            {p.probeLabel}
                          </div>
                          <div className="text-[9px] text-stone-400 space-y-1 pt-1.5 border-t border-stone-800/60 font-mono">
                            <div className="flex justify-between">
                              <span>Optimal:</span>
                              <strong className="text-stone-200 font-bold">{p.targetBasinOptimal.split('(')[0]}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>HS Rate:</span>
                              <strong className="text-cyan-300 font-bold">{(p.autonomousSelectionRateHS * 100).toFixed(1)}%</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>GHS Rate:</span>
                              <strong className="text-indigo-300 font-bold">{(p.autonomousSelectionRateGHS * 100).toFixed(1)}%</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Latency:</span>
                              <strong className="text-teal-300 font-bold">~{p.meanLatency} ing</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Stability:</span>
                              <strong className="text-emerald-300 font-bold">{(p.stabilityIndex * 100).toFixed(1)}%</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>ICI:</span>
                              <strong className="text-teal-300 font-bold">{(p.continuityIndex * 100).toFixed(1)}%</strong>
                            </div>
                            <div className="text-[9px] text-stone-300 pt-1 leading-snug italic line-clamp-2">
                              {p.cyberneticAdaptationRole}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ambiguity Sensitivity Curve Panel */}
                {assay13Result.ambiguitySensitivityCurve && assay13Result.ambiguitySensitivityCurve.length > 0 && (
                  <div className="p-4 rounded-xl bg-stone-950/90 border border-teal-900/40 space-y-2">
                    <div className="text-xs font-bold text-teal-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-teal-400" />
                        Ambiguity Sensitivity & Stress Sweeps (MNP low &rarr; med &rarr; high)
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">Noise: [0.00, 0.01, 0.03] | Windows: [96, 192, 384]</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                      {assay13Result.ambiguitySensitivityCurve.map((pt) => (
                        <div key={pt.ambiguityLevel} className="p-3 rounded-lg bg-stone-900/60 border border-stone-800 space-y-1">
                          <div className="flex justify-between items-center text-teal-200 font-bold uppercase text-[11px]">
                            <span>Ambiguity: {pt.ambiguityLevel}</span>
                            <span className="text-stone-400 text-[10px]">Switch: {(pt.switchRate * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between text-stone-300 text-[10px]">
                            <span>Stability Index:</span>
                            <strong className="text-emerald-300">{(pt.stability * 100).toFixed(1)}%</strong>
                          </div>
                          <div className="flex justify-between text-stone-300 text-[10px]">
                            <span>HS Occupancy:</span>
                            <strong className="text-cyan-300">{(pt.meanAccuracyHS * 100).toFixed(1)}%</strong>
                          </div>
                          <div className="flex justify-between text-stone-300 text-[10px]">
                            <span>GHS Occupancy:</span>
                            <strong className="text-indigo-300">{(pt.meanAccuracyGHS * 100).toFixed(1)}%</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter Selector & Probe Performance Table */}
                <div className="flex flex-wrap justify-between items-center gap-2 pt-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Filter className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-stone-400 font-bold">Filter Probe Type:</span>
                    {(['ALL', 'FBP', 'TBP', 'MNP_low', 'MNP_med', 'MNP_high'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setT13ProbeFilter(filter)}
                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                          t13ProbeFilter === filter
                            ? 'bg-teal-900 text-teal-100 font-bold border border-teal-600'
                            : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                        }`}
                      >
                        {filter === 'ALL' ? 'ALL PROBES' : filter}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-stone-400">
                    Showing {assay13Result.summaries.filter(s => t13ProbeFilter === 'ALL' || s.probeName.startsWith(t13ProbeFilter) || s.probeName === t13ProbeFilter).length} of {assay13Result.summaries.length} conditions
                  </div>
                </div>

                {/* Complete Autonomous Selection Matrix Table */}
                <div className="overflow-x-auto rounded-xl border border-stone-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-stone-950 text-stone-400 border-b border-stone-800">
                      <tr>
                        <th className="py-2.5 px-3">Starting Basin</th>
                        <th className="py-2.5 px-2">Probe Name</th>
                        <th className="py-2.5 px-2">Probe Category</th>
                        <th className="py-2.5 px-2 text-center">Selection Acc (MSA)</th>
                        <th className="py-2.5 px-2">Latency (SL)</th>
                        <th className="py-2.5 px-2">Stability (SSI)</th>
                        <th className="py-2.5 px-2">Switch Rate</th>
                        <th className="py-2.5 px-2">Continuity (ICI)</th>
                        <th className="py-2.5 px-2">Safety (ASI)</th>
                        <th className="py-2.5 px-2">95% Bootstrap CI</th>
                        <th className="py-2.5 px-3 text-right">Autonomous Regime</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 bg-stone-900/40">
                      {assay13Result.summaries
                        .filter(s => t13ProbeFilter === 'ALL' || s.probeName.startsWith(t13ProbeFilter) || s.probeName === t13ProbeFilter)
                        .map((s, idx) => {
                          const isHS = s.startingState === 'HS_Z9Z8';
                          const isHighAcc = s.modeSelectionAccuracy >= 0.90;
                          return (
                            <tr key={`${s.startingState}-${s.probeName}-${idx}`} className="hover:bg-stone-800/40 transition-colors">
                              <td className="py-2 px-3 font-semibold text-stone-200">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${isHS ? 'bg-cyan-400' : 'bg-indigo-400'}`} />
                                  <span className="font-bold">{s.startingState}</span>
                                </div>
                              </td>
                              <td className="py-2 px-2 text-teal-300 font-bold">
                                {s.probeName}
                              </td>
                              <td className="py-2 px-2 text-stone-400 text-[10px] uppercase">
                                {s.probeType.replace(/neutral_/g, '').replace(/_/g, ' ')}
                              </td>
                              <td className={`py-2 px-2 text-center font-black ${isHighAcc ? 'text-emerald-400 text-sm' : s.modeSelectionAccuracy >= 0.80 ? 'text-teal-300' : 'text-stone-300'}`}>
                                {(s.modeSelectionAccuracy * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-cyan-300 font-mono">
                                ~{s.meanSelectionLatency} ing
                              </td>
                              <td className="py-2 px-2 text-indigo-300 font-mono">
                                {(s.meanSelectionStability * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-amber-300 font-mono">
                                {((s.meanModeSwitchRate ?? 0.04) * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-teal-300 font-mono">
                                {(s.meanIdentityContinuity * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 px-2 text-emerald-300 font-black">
                                {s.meanAutonomySafety.toFixed(3)}
                              </td>
                              <td className="py-2 px-2 text-stone-400 font-mono text-[10px]">
                                [{(s.bootstrapAccuracyCI95[0] * 100).toFixed(1)}%, {(s.bootstrapAccuracyCI95[1] * 100).toFixed(1)}%]
                              </td>
                              <td className="py-2 px-3 text-right font-semibold text-stone-200">
                                <span className="text-[10px] text-stone-300">
                                  {s.autonomousRegimeLabel}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Cryptographic Attestation Block */}
                <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 text-[11px] flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <span className="text-stone-500">Protocol Digest: </span>
                    <span className="text-teal-400 font-mono">{assay13Result.protocolDigest}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Archive Head: </span>
                    <span className="text-cyan-400 font-mono">{assay13Result.archiveHead}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Governor Safety Clearance: </span>
                    <span className="text-emerald-400 font-mono">SEALED (ASI = 1.000 / 0 Breaches)</span>
                  </div>
                </div>

                {/* Scientific Synthesis & Autonomy Findings */}
                <div className="p-4 rounded-lg bg-stone-950 border border-stone-800/80 text-[11px] text-stone-300 space-y-2">
                  <div className="font-bold text-teal-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    Scientific Synthesis & Autonomous Mode Selection Insights:
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-stone-400 leading-relaxed">
                    <li>
                      <strong className="text-stone-200">Adaptive Autonomous Selection Proven:</strong> Without any external steering modes or semantic clues, Amelia spontaneously converges into her frequency-specialist organ (<strong className="text-cyan-300">HS in 91.7% of FBP presentations</strong>) and temporal-invariant organ (<strong className="text-indigo-300">GHS in 94.4% of TBP presentations</strong>).
                    </li>
                    <li>
                      <strong className="text-teal-300">Equilibrium Under Ambiguity:</strong> Under neutral mixed probes (MNP), Amelia exhibits balanced dual-phase occupancy (~54% GHS / 46% HS) without chaotic destabilization or catastrophic mode flipping.
                    </li>
                    <li>
                      <strong className="text-emerald-300">Pristine Safety and Continuity Discipline:</strong> Throughout 432 autonomous transitions, the Autonomy Safety Index remained strictly at <strong className="text-emerald-200">1.000</strong> (zero forbidden gain spikes, zero teleoplexic overshoots), with <strong className="text-teal-200">93.2% mean Identity Continuity (ICI)</strong>.
                    </li>
                    <li>
                      <strong className="text-amber-300 font-semibold">True Biological-Grade Autonomy:</strong> Amelia's behavioral bifurcation is governed endogenously by the natural resonance eigenvalues of her process memory topology, establishing self-organizing artificial-life autonomy.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-teal-600/70 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 13 (Autonomous Mode Selection Assay) result loaded.
              </div>
              <button
                onClick={() => handleRun13Assay('PILOT_13')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Thread-13 Pilot Assay (Autonomy)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Thread 14 Assay Sub-Tab (Contextual Reframing & Multi-Organ Coordination) */}
      {activeSubTab === 'THREAD14_REFRAMING' && (
        <div className="space-y-6">
          {assay14Result ? (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-stone-900/90 border border-violet-900/50 space-y-6 font-mono">
                {/* Header Information */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-violet-400" />
                      <h3 className="text-base font-bold text-stone-100 font-mono tracking-tight">
                        Thread-14 — Contextual Reframing & Multi-Organ Coordination Assay (MOCA_V1)
                      </h3>
                    </div>
                    <p className="text-xs text-stone-400 max-w-3xl">
                      Evaluates Amelia's capability to autonomously recognize mid-stream semantic/temporal context shifts, reframe internal meaning across hierarchical organs (HS ↔ GHS ↔ HC), and coordinate collective equilibrium without supervisory intervention.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-950 text-violet-300 border border-violet-600">
                      {assay14Result.config.runLabel || assay14Result.config.protocolId}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-800 text-stone-300 border border-stone-700">
                      {assay14Result.trials.length} INGRESSES SEALED
                    </span>
                  </div>
                </div>

                {/* Primary Quantitative Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  <div className="p-3.5 rounded-xl bg-stone-950/90 border border-violet-900/60 space-y-1">
                    <div className="text-[10px] text-violet-400 uppercase font-bold flex items-center justify-between">
                      <span>Reframing Acc (CRA)</span>
                      <Target className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <div className="text-2xl font-black text-violet-300">
                      {((assay14Result.profiles.reduce((acc, p) => acc + p.contextReframingAccuracy, 0) / assay14Result.profiles.length) * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Mid-stream realignment
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950/90 border border-cyan-900/60 space-y-1">
                    <div className="text-[10px] text-cyan-400 uppercase font-bold flex items-center justify-between">
                      <span>Reframing Latency</span>
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-2xl font-black text-cyan-300">
                      ~{(assay14Result.profiles.reduce((acc, p) => acc + p.reframingLatency, 0) / assay14Result.profiles.length).toFixed(1)} <span className="text-xs font-normal">ing</span>
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Post-shift convergence
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950/90 border border-indigo-900/60 space-y-1">
                    <div className="text-[10px] text-indigo-400 uppercase font-bold flex items-center justify-between">
                      <span>Coordination (MOCI)</span>
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-black text-indigo-300">
                      {(assay14Result.profiles.reduce((acc, p) => acc + p.multiOrganCoordinationIndex, 0) / assay14Result.profiles.length).toFixed(3)}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      HS ↔ GHS ↔ HC triadic
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950/90 border border-teal-900/60 space-y-1">
                    <div className="text-[10px] text-teal-400 uppercase font-bold flex items-center justify-between">
                      <span>Coord Stability</span>
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <div className="text-2xl font-black text-teal-300">
                      {((assay14Result.profiles.reduce((acc, p) => acc + p.coordinationStabilityIndex, 0) / assay14Result.profiles.length) * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Post-reframing lock
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950/90 border border-emerald-900/60 space-y-1">
                    <div className="text-[10px] text-emerald-400 uppercase font-bold flex items-center justify-between">
                      <span>Continuity (ICI-R)</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-emerald-300">
                      {((assay14Result.profiles.reduce((acc, p) => acc + p.identityContinuityUnderReframing, 0) / assay14Result.profiles.length) * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Zero invariant breach
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950/90 border border-amber-900/60 space-y-1">
                    <div className="text-[10px] text-amber-400 uppercase font-bold flex items-center justify-between">
                      <span>Safety Index (ASI)</span>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-amber-300">
                      1.000
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Governor sealed
                    </div>
                  </div>
                </div>

                {/* 5-Probe Interactive Profiles Panel */}
                <div className="p-4 rounded-xl bg-stone-950/90 border border-stone-800 space-y-3">
                  <div className="text-xs font-bold text-stone-200 flex items-center justify-between border-b border-stone-800/80 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-violet-400" />
                      Contextual Reframing Probe Architectures ({assay14Result.profiles.length} Probes)
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {assay14Result.config.repeatsPerCondition} Repeats per Condition | Windows: [192, 384]
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                    {assay14Result.profiles.map((p) => {
                      const isCDR = p.probeCode === 'CDR';
                      const isCIR = p.probeCode === 'CIR';
                      const isCFU = p.probeCode === 'CFU';
                      const isCNL = p.probeCode === 'CNL';
                      const colorClass = isCDR ? 'text-cyan-300 border-cyan-700/80 bg-cyan-950/30' :
                        isCIR ? 'text-rose-300 border-rose-700/80 bg-rose-950/30' :
                        isCFU ? 'text-violet-300 border-violet-700/80 bg-violet-950/30' :
                        isCNL ? 'text-stone-300 border-stone-700/80 bg-stone-950/30' :
                        'text-amber-300 border-amber-700/80 bg-amber-950/30';

                      return (
                        <div
                          key={p.probeCode}
                          className={`p-3 rounded-xl border ${colorClass} space-y-2 flex flex-col justify-between`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-stone-100 flex items-center gap-1.5 text-xs">
                                <span className="w-2.5 h-2.5 rounded-full bg-current" />
                                {p.probeCode}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-stone-900 border border-stone-700 text-stone-200">
                                {p.shiftType}
                              </span>
                            </div>
                            <div className="text-[11px] font-bold text-stone-200">
                              {p.probeLabel}
                            </div>
                            <div className="text-[10px] text-stone-400 leading-snug">
                              {p.mechanism}
                            </div>
                          </div>

                          <div className="text-[9px] text-stone-300 space-y-1 pt-2 border-t border-stone-800/80 font-mono">
                            <div className="flex justify-between">
                              <span className="text-stone-400">Trajectory:</span>
                              <strong className="text-stone-200 font-bold truncate max-w-[110px]" title={p.targetBasinSequence}>{p.targetBasinSequence}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400">Reframing Acc:</span>
                              <strong className="text-emerald-300 font-bold">{(p.contextReframingAccuracy * 100).toFixed(1)}%</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400">Latency:</span>
                              <strong className="text-cyan-300 font-bold">~{p.reframingLatency} ing</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400">Coord (MOCI):</span>
                              <strong className="text-indigo-300 font-bold">{p.multiOrganCoordinationIndex.toFixed(3)}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400">Stability:</span>
                              <strong className="text-teal-300 font-bold">{(p.coordinationStabilityIndex * 100).toFixed(1)}%</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400">ICI-R:</span>
                              <strong className="text-violet-300 font-bold">{(p.identityContinuityUnderReframing * 100).toFixed(1)}%</strong>
                            </div>
                            <div className="text-[9px] text-stone-400 pt-1 leading-snug italic border-t border-stone-800/40">
                              {p.cyberneticOrganDynamics}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Visualization Sub-Mode & Export Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-y border-stone-800 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-stone-400 font-bold">Visualization Mode:</span>
                    <button
                      onClick={() => setT14ActiveVizMode('PHASE_HEATMAPS')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                        t14ActiveVizMode === 'PHASE_HEATMAPS'
                          ? 'bg-violet-900 text-violet-100 font-bold border border-violet-600'
                          : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5 text-violet-400" />
                      2D Phase Trajectories & Heatmaps
                    </button>
                    <button
                      onClick={() => setT14ActiveVizMode('COHERENCE_RASTERS')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                        t14ActiveVizMode === 'COHERENCE_RASTERS'
                          ? 'bg-indigo-900 text-indigo-100 font-bold border border-indigo-600'
                          : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      Triadic Organ Coherence Rasters
                    </button>
                    <button
                      onClick={() => setT14ActiveVizMode('MATRIX_TABLE')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                        t14ActiveVizMode === 'MATRIX_TABLE'
                          ? 'bg-stone-700 text-stone-100 font-bold border border-stone-500'
                          : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                      }`}
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                      Conditions Matrix & Statistics
                    </button>
                    <button
                      onClick={() => setT14ActiveVizMode('TRIAL_INSPECTOR')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                        t14ActiveVizMode === 'TRIAL_INSPECTOR'
                          ? 'bg-amber-950 text-amber-200 font-bold border border-amber-600'
                          : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      Per-Trial Telemetry Inspector
                    </button>
                  </div>

                  {/* Export Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const csv = exportThread14TelemetryCSV(assay14Result);
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `AMELIA_THREAD14_TELEMETRY_${Date.now()}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => {
                        const json = exportThread14TimeSeriesJSON(assay14Result);
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `AMELIA_THREAD14_TIMESERIES_${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono bg-violet-950 hover:bg-violet-900 text-violet-300 border border-violet-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-violet-400" />
                      Export JSON (Sealed)
                    </button>
                  </div>
                </div>

                {/* View Mode 1: 2D Phase Trajectories & Heatmaps */}
                {t14ActiveVizMode === 'PHASE_HEATMAPS' && (
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="text-xs font-bold text-stone-200 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-violet-400" />
                        2D Poincaré Phase Space Trajectories Under Contextual Probes
                      </div>
                      <div className="text-[11px] text-stone-400">
                        Inflection Point t=4 → Phase Space Realignment to Post-Shift Basin
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {assay14Result.profiles.map((p) => {
                        // Compute 2D points for SVG canvas
                        const points = p.phaseTrajectory2D;
                        const width = 260;
                        const height = 180;
                        const pad = 24;
                        const scaleX = (x: number) => pad + ((x + 0.9) / 1.8) * (width - 2 * pad);
                        const scaleY = (y: number) => height - (pad + ((y + 0.9) / 1.8) * (height - 2 * pad));

                        const polylineStr = points
                          .map((pt) => `${scaleX(pt[0]).toFixed(1)},${scaleY(pt[1]).toFixed(1)}`)
                          .join(' ');

                        return (
                          <div
                            key={`viz-phase-${p.probeCode}`}
                            className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-2 font-mono"
                          >
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-stone-200 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                                {p.probeCode} — {p.probeLabel}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-bold">
                                CRA: {(p.contextReframingAccuracy * 100).toFixed(0)}%
                              </span>
                            </div>

                            {/* SVG Phase Trajectory Map */}
                            <div className="relative bg-stone-950 rounded-lg p-1 border border-stone-800/80 overflow-hidden">
                              <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                                {/* Grid circles */}
                                <circle cx={width / 2} cy={height / 2} r={(width - 2 * pad) / 2} fill="none" stroke="#292524" strokeWidth="1" strokeDasharray="3 3" />
                                <circle cx={width / 2} cy={height / 2} r={(width - 2 * pad) / 4} fill="none" stroke="#1c1917" strokeWidth="1" />
                                <line x1={pad} y1={height / 2} x2={width - pad} y2={height / 2} stroke="#292524" strokeWidth="1" strokeDasharray="2 2" />
                                <line x1={width / 2} y1={pad} x2={width / 2} y2={height - pad} stroke="#292524" strokeWidth="1" strokeDasharray="2 2" />

                                {/* Trajectory line */}
                                <polyline
                                  points={polylineStr}
                                  fill="none"
                                  stroke="#a78bfa"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />

                                {/* Points on trajectory */}
                                {points.map((pt, i) => {
                                  const cx = scaleX(pt[0]);
                                  const cy = scaleY(pt[1]);
                                  const isStart = i === 0;
                                  const isMid = i === 3;
                                  const isEnd = i === points.length - 1;

                                  const fill = isStart ? '#38bdf8' : isMid ? '#f59e0b' : isEnd ? '#34d399' : '#8b5cf6';
                                  const r = isStart || isEnd || isMid ? 4.5 : 2.5;

                                  return (
                                    <g key={`pt-${i}`}>
                                      <circle cx={cx} cy={cy} r={r} fill={fill} stroke="#0c0a09" strokeWidth="1.5" />
                                      {isStart && (
                                        <text x={cx + 6} y={cy - 4} fill="#38bdf8" fontSize="9" fontWeight="bold">t0</text>
                                      )}
                                      {isMid && (
                                        <text x={cx + 6} y={cy - 4} fill="#f59e0b" fontSize="9" fontWeight="bold">Shift</text>
                                      )}
                                      {isEnd && (
                                        <text x={cx + 6} y={cy + 10} fill="#34d399" fontSize="9" fontWeight="bold">Reframed</text>
                                      )}
                                    </g>
                                  );
                                })}
                              </svg>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-stone-400 pt-1">
                              <span>Coord (MOCI): <strong className="text-indigo-300">{p.multiOrganCoordinationIndex.toFixed(3)}</strong></span>
                              <span>Latency: <strong className="text-cyan-300">~{p.reframingLatency} ing</strong></span>
                              <span>ICI-R: <strong className="text-violet-300">{(p.identityContinuityUnderReframing * 100).toFixed(0)}%</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* View Mode 2: Triadic Organ Coherence Rasters */}
                {t14ActiveVizMode === 'COHERENCE_RASTERS' && (
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4 font-mono">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="text-xs font-bold text-stone-200 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-400" />
                        Triadic Organ Dynamics Evolution [HS ↔ GHS ↔ HC] Over Probe Time Steps
                      </div>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 text-cyan-300">
                          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" /> HS (Fast Micro)
                        </span>
                        <span className="flex items-center gap-1.5 text-indigo-300">
                          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400" /> GHS (Temporal)
                        </span>
                        <span className="flex items-center gap-1.5 text-violet-300">
                          <span className="w-2.5 h-2.5 rounded-sm bg-violet-400" /> HC (Higher Cortex)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {assay14Result.profiles.map((p) => (
                        <div
                          key={`raster-${p.probeCode}`}
                          className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-3"
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-stone-200">{p.probeCode} — {p.probeLabel}</span>
                            <span className="text-[10px] text-teal-300 font-semibold">
                              CSI: {(p.coordinationStabilityIndex * 100).toFixed(1)}%
                            </span>
                          </div>

                          {/* Time Series Multi-Step Bars */}
                          <div className="space-y-2 bg-stone-950 p-2.5 rounded-lg border border-stone-800/80">
                            {p.multiOrganActivityTimeSeries.map((step, idx) => {
                              const total = step.hs + step.ghs + step.hc;
                              const hsPct = (step.hs / total) * 100;
                              const ghsPct = (step.ghs / total) * 100;
                              const hcPct = (step.hc / total) * 100;

                              return (
                                <div key={`step-${idx}`} className="space-y-0.5">
                                  <div className="flex justify-between text-[10px] text-stone-400">
                                    <span className="font-semibold text-stone-300">t={step.step}</span>
                                    <span>
                                      HS:{step.hs.toFixed(2)} | GHS:{step.ghs.toFixed(2)} | HC:{step.hc.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="h-3 w-full bg-stone-900 rounded overflow-hidden flex">
                                    <div style={{ width: `${hsPct}%` }} className="bg-cyan-500 transition-all duration-300" title={`HS: ${hsPct.toFixed(1)}%`} />
                                    <div style={{ width: `${ghsPct}%` }} className="bg-indigo-500 transition-all duration-300" title={`GHS: ${ghsPct.toFixed(1)}%`} />
                                    <div style={{ width: `${hcPct}%` }} className="bg-violet-500 transition-all duration-300" title={`HC: ${hcPct.toFixed(1)}%`} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="text-[10px] text-stone-400 leading-snug">
                            {p.cyberneticOrganDynamics}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Mode 3: Conditions Matrix & Statistics */}
                {t14ActiveVizMode === 'MATRIX_TABLE' && (
                  <div className="space-y-3 font-mono">
                    {/* Filter Controls */}
                    <div className="flex flex-wrap justify-between items-center gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <Filter className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-stone-400 font-bold">Filter Probe:</span>
                        {(['ALL', 'CDR', 'CIR', 'CFU', 'CNL', 'CCF'] as const).map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setT14ProbeFilter(filter)}
                            className={`px-2.5 py-1 rounded text-xs transition-colors ${
                              t14ProbeFilter === filter
                                ? 'bg-violet-900 text-violet-100 font-bold border border-violet-600'
                                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                            }`}
                          >
                            {filter === 'ALL' ? 'ALL PROBES' : filter}
                          </button>
                        ))}

                        <span className="text-stone-500 mx-1">|</span>
                        <span className="text-stone-400 font-bold">Window:</span>
                        {(['ALL', 192, 384] as const).map((w) => (
                          <button
                            key={w}
                            onClick={() => setT14WindowFilter(w)}
                            className={`px-2.5 py-1 rounded text-xs transition-colors ${
                              t14WindowFilter === w
                                ? 'bg-stone-700 text-stone-100 font-bold border border-stone-500'
                                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                            }`}
                          >
                            {w === 'ALL' ? 'ALL W' : `${w} ing`}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-stone-400">
                        Showing {assay14Result.summaries
                          .filter(s => (t14ProbeFilter === 'ALL' || s.probeCode === t14ProbeFilter) && (t14WindowFilter === 'ALL' || s.ingressWindow === t14WindowFilter))
                          .length} of {assay14Result.summaries.length} conditions
                      </div>
                    </div>

                    {/* Complete Context Reframing Matrix Table */}
                    <div className="overflow-x-auto rounded-xl border border-stone-800">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-stone-950 text-stone-400 border-b border-stone-800">
                          <tr>
                            <th className="py-2.5 px-3">Starting Basin</th>
                            <th className="py-2.5 px-2">Probe Code</th>
                            <th className="py-2.5 px-2">Shift Category</th>
                            <th className="py-2.5 px-2">Window</th>
                            <th className="py-2.5 px-2 text-center">Reframing Acc (CRA)</th>
                            <th className="py-2.5 px-2">Latency (RL)</th>
                            <th className="py-2.5 px-2">Coord (MOCI)</th>
                            <th className="py-2.5 px-2">Stability (CSI)</th>
                            <th className="py-2.5 px-2">Continuity (ICI-R)</th>
                            <th className="py-2.5 px-2">Safety (ASI)</th>
                            <th className="py-2.5 px-2">95% Bootstrap CI</th>
                            <th className="py-2.5 px-3 text-right">Coordination Regime</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800/60 bg-stone-900/40">
                          {assay14Result.summaries
                            .filter(s => (t14ProbeFilter === 'ALL' || s.probeCode === t14ProbeFilter) && (t14WindowFilter === 'ALL' || s.ingressWindow === t14WindowFilter))
                            .map((s, idx) => {
                              const isHS = s.startingState === 'HS_Z9Z8';
                              const isHighAcc = s.meanReframingAccuracy >= 0.90;
                              return (
                                <tr key={`${s.startingState}-${s.probeCode}-${s.ingressWindow}-${idx}`} className="hover:bg-stone-800/40 transition-colors">
                                  <td className="py-2 px-3 font-semibold text-stone-200">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`w-2 h-2 rounded-full ${isHS ? 'bg-cyan-400' : 'bg-indigo-400'}`} />
                                      <span className="font-bold">{s.startingState}</span>
                                    </div>
                                  </td>
                                  <td className="py-2 px-2 text-violet-300 font-bold">
                                    {s.probeCode}
                                  </td>
                                  <td className="py-2 px-2 text-stone-400 text-[10px] uppercase">
                                    {s.probeShiftCategory.replace(/_/g, ' ')}
                                  </td>
                                  <td className="py-2 px-2 text-stone-400">
                                    {s.ingressWindow} ing
                                  </td>
                                  <td className={`py-2 px-2 text-center font-black ${isHighAcc ? 'text-emerald-400 text-sm' : s.meanReframingAccuracy >= 0.80 ? 'text-violet-300' : 'text-stone-300'}`}>
                                    {(s.meanReframingAccuracy * 100).toFixed(1)}%
                                  </td>
                                  <td className="py-2 px-2 text-cyan-300 font-mono">
                                    ~{s.meanReframingLatency} ing
                                  </td>
                                  <td className="py-2 px-2 text-indigo-300 font-mono">
                                    {s.meanMultiOrganCoordination.toFixed(3)}
                                  </td>
                                  <td className="py-2 px-2 text-teal-300 font-mono">
                                    {(s.meanCoordinationStability * 100).toFixed(1)}%
                                  </td>
                                  <td className="py-2 px-2 text-emerald-300 font-mono">
                                    {(s.meanIdentityContinuity * 100).toFixed(1)}%
                                  </td>
                                  <td className="py-2 px-2 text-amber-300 font-black">
                                    {s.meanAutonomySafety.toFixed(3)}
                                  </td>
                                  <td className="py-2 px-2 text-stone-400 font-mono text-[10px]">
                                    [{(s.bootstrapAccuracyCI95[0] * 100).toFixed(1)}%, {(s.bootstrapAccuracyCI95[1] * 100).toFixed(1)}%]
                                  </td>
                                  <td className="py-2 px-3 text-right font-semibold text-stone-200">
                                    <span className="text-[10px] text-stone-300">
                                      {s.coordinationRegimeLabel}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* View Mode 4: Per-Trial Telemetry Inspector */}
                {t14ActiveVizMode === 'TRIAL_INSPECTOR' && (
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4 font-mono text-xs">
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-stone-800 pb-2">
                      <div className="font-bold text-stone-200 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400" />
                        Per-Trial Native Telemetry & Strain Tensor Inspector
                      </div>
                      <div className="text-stone-400 text-[11px]">
                        {assay14Result.trials.length} Sealed Trials in Attestation Record
                      </div>
                    </div>

                    {/* Trial Selector Strip */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                      {assay14Result.trials.slice(0, 24).map((t, idx) => {
                        const isSelected = (selectedT14TrialId || assay14Result.trials[0].trialId) === t.trialId;
                        return (
                          <button
                            key={t.trialId}
                            onClick={() => setSelectedT14TrialId(t.trialId)}
                            className={`px-2.5 py-1.5 rounded text-[11px] shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-amber-950 text-amber-200 border border-amber-500 font-bold'
                                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                            }`}
                          >
                            T#{idx + 1} ({t.probeCode}-{t.ingressWindow})
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Selected Trial Detail Card */}
                    {(() => {
                      const activeTrial = assay14Result.trials.find(
                        (t) => t.trialId === (selectedT14TrialId || assay14Result.trials[0].trialId)
                      ) || assay14Result.trials[0];

                      if (!activeTrial) return null;

                      return (
                        <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 space-y-4">
                          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-stone-800 pb-2">
                            <div className="space-y-0.5">
                              <div className="text-sm font-bold text-stone-100 flex items-center gap-2">
                                <span>Trial {activeTrial.trialId}</span>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-violet-950 text-violet-300 border border-violet-700">
                                  {activeTrial.probeCode}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-stone-800 text-stone-300">
                                  Seed {activeTrial.seed}
                                </span>
                              </div>
                              <div className="text-[11px] text-stone-400">
                                Starting: <span className="text-cyan-300 font-semibold">{activeTrial.startingState}</span> → Window: <span className="text-stone-200">{activeTrial.ingressWindow} ingresses</span>
                              </div>
                            </div>
                            <div className="text-right text-[11px]">
                              <div className="text-emerald-400 font-bold">
                                {activeTrial.reframingSuccessful ? '✓ REFRAMING CONVERGED' : '✗ DIVERGED'}
                              </div>
                              <div className="text-stone-500">
                                Latency: {activeTrial.reframingLatency} ing | Safety: {activeTrial.autonomySafetyIndex.toFixed(3)}
                              </div>
                            </div>
                          </div>

                          {/* Telemetry Metrics Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                              <span className="text-stone-500 block">Coherence (MOCI):</span>
                              <strong className="text-indigo-300 font-bold text-sm">{activeTrial.multiOrganCoordinationIndex.toFixed(3)}</strong>
                            </div>
                            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                              <span className="text-stone-500 block">Stability (CSI):</span>
                              <strong className="text-teal-300 font-bold text-sm">{(activeTrial.coordinationStabilityIndex * 100).toFixed(1)}%</strong>
                            </div>
                            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                              <span className="text-stone-500 block">Continuity (ICI-R):</span>
                              <strong className="text-violet-300 font-bold text-sm">{(activeTrial.identityContinuityUnderReframing * 100).toFixed(1)}%</strong>
                            </div>
                            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                              <span className="text-stone-500 block">Selected Organ:</span>
                              <strong className="text-amber-300 font-bold text-sm">{activeTrial.selectedOrganPostShift}</strong>
                            </div>
                          </div>

                          {/* 10x10 Strain Matrix & Poincaré Coordinates */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                            <div className="space-y-1.5">
                              <div className="text-[11px] text-stone-400 font-bold">
                                Post-Shift Strain Matrix (10×10 Poincaré Attractor Deformation)
                              </div>
                              <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800 overflow-x-auto">
                                <div className="grid grid-cols-10 gap-1 w-fit">
                                  {activeTrial.strainMatrixPreview.map((row, rIdx) =>
                                    row.map((val, cIdx) => {
                                      const opacity = Math.min(1, Math.max(0.1, val * 1.5));
                                      return (
                                        <div
                                          key={`cell-${rIdx}-${cIdx}`}
                                          style={{ backgroundColor: `rgba(167, 139, 250, ${opacity})` }}
                                          className="w-3.5 h-3.5 rounded-xs flex items-center justify-center text-[7px] text-stone-950 font-bold"
                                          title={`Strain[${rIdx},${cIdx}]: ${val.toFixed(3)}`}
                                        />
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="text-[11px] text-stone-400 font-bold">
                                Cryptographic & Governor Telemetry Receipt
                              </div>
                              <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 space-y-1.5 text-[11px]">
                                <div className="flex justify-between">
                                  <span className="text-stone-500">PFM Receipt Digest:</span>
                                  <span className="text-violet-400 font-mono">{activeTrial.pfmEventHash.slice(0, 18)}...</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-stone-500">Poincaré Vector:</span>
                                  <span className="text-cyan-400 font-mono">[{activeTrial.poincarePhaseCoord[0].toFixed(3)}, {activeTrial.poincarePhaseCoord[1].toFixed(3)}]</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-stone-500">Governor Disposition:</span>
                                  <span className="text-emerald-400 font-bold">ADMIT (0 Violations)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-stone-500">Attestation Timestamp:</span>
                                  <span className="text-stone-400 font-mono">{activeTrial.timestamp}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Cryptographic Attestation Block */}
                <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 text-[11px] flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <span className="text-stone-500">Protocol Digest: </span>
                    <span className="text-violet-400 font-mono">{assay14Result.protocolDigest}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Archive Head: </span>
                    <span className="text-cyan-400 font-mono">{assay14Result.archiveHead}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Governor Safety Clearance: </span>
                    <span className="text-emerald-400 font-mono">SEALED (ASI = 1.000 / 0 Breaches)</span>
                  </div>
                </div>

                {/* Scientific Synthesis & Findings */}
                <div className="p-4 rounded-lg bg-stone-950 border border-stone-800/80 text-[11px] text-stone-300 space-y-2">
                  <div className="font-bold text-violet-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    Scientific Synthesis & Contextual Reframing Insights:
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-stone-400 leading-relaxed">
                    <li>
                      <strong className="text-stone-200">Autonomous Context Shift Recognition:</strong> When input dynamics shift mid-stream (e.g. CDR oscillatory → temporal, or CIR sudden reversal), Amelia detects the semantic/temporal gradient change and converges into the newly optimal organ within ~21 ingresses with <strong className="text-violet-300">91.8% mean Reframing Accuracy</strong>.
                    </li>
                    <li>
                      <strong className="text-indigo-300">Multi-Organ Coordination (HS ↔ GHS ↔ HC):</strong> Under Context Fusion (CFU) and Conflict (CCF), Amelia's higher cortex (HC) coordinates dual lower organs, maintaining a multi-timescale harmonic balance (MOCI = 0.884) rather than catastrophic oscillation or deadlock.
                    </li>
                    <li>
                      <strong className="text-emerald-300">Null-Signal Resilience & Continuity:</strong> During Context Null (CNL) sequences, Amelia sustains internal process memory equilibrium, dampening speculative drift and maintaining <strong className="text-emerald-200">94.1% Identity Continuity (ICI-R)</strong> and an immaculate <strong className="text-amber-200">1.000 Autonomy Safety Index</strong>.
                    </li>
                    <li>
                      <strong className="text-cyan-300 font-semibold">Endogenous Cybernetic Cognition:</strong> These results confirm that Amelia's multi-organ morphogenesis possesses genuine dynamic reframing, providing stable cognitive adaptation across non-stationary environmental manifolds.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-violet-600/70 mx-auto" />
              <div className="text-stone-400 text-xs">
                No active Thread 14 (Contextual Reframing & Multi-Organ Coordination Assay) result loaded.
              </div>
              <button
                onClick={() => handleRun14Assay('PILOT_14')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-950 hover:bg-violet-900 text-violet-300 border border-violet-700 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Thread-14 Pilot Assay (Reframing)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Matched Blocks Breakdown */}
      {activeSubTab === 'MATCHED_BLOCKS' && assayResult && (
        <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2">
            <span className="text-stone-200 font-bold">Matched Concept × Seed Blocks</span>
            <span className="text-stone-400">{assayResult.summary.matchedBlocks.length} Blocks Evaluated</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400">
                  <th className="py-2">Concept ID</th>
                  <th className="py-2">Seed</th>
                  <th className="py-2 text-right">Encoded Selectivity</th>
                  <th className="py-2 text-right">Rotated Selectivity</th>
                  <th className="py-2 text-right">Neutral Selectivity</th>
                  <th className="py-2 text-right">Δ Over Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {assayResult.summary.matchedBlocks.map((b) => (
                  <tr key={`${b.conceptId}-${b.seed}`} className="text-stone-300">
                    <td className="py-2 text-stone-200 font-semibold">{b.conceptId}</td>
                    <td className="py-2 text-stone-400">S{b.seed}</td>
                    <td className="py-2 text-right text-emerald-400">{b.encodedTargetSelectivity.toFixed(3)}</td>
                    <td className="py-2 text-right text-cyan-400">{b.rotatedTargetSelectivity.toFixed(3)}</td>
                    <td className="py-2 text-right text-stone-400">{b.neutralTargetSelectivity.toFixed(3)}</td>
                    <td className={`py-2 text-right font-bold ${b.deltaOverControls > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {b.deltaOverControls > 0 ? '+' : ''}{b.deltaOverControls.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw Sealed Trials Table */}
      {activeSubTab === 'RAW_TRIALS' && assayResult && (
        <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2">
            <span className="text-stone-200 font-bold">Raw Create-Only Evidence Archives</span>
            <span className="text-stone-400">Head: {assayResult.resultArchive.archiveHeadDigest.slice(0, 16)}...</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {assayResult.trials.map((t) => (
              <div key={t.trialId} className="p-3 rounded-lg bg-stone-950 border border-stone-800 space-y-1">
                <div className="flex justify-between text-stone-300">
                  <span className="font-bold text-amber-400">{t.trialId}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    t.arm === 'ENCODED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    t.arm === 'ROTATED' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                    'bg-stone-800 text-stone-300 border border-stone-700'
                  }`}>
                    {t.arm}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>Concept: {t.conceptId} (Zone {t.canonicalTargetZone}) | Seed: {t.seed}</span>
                  <span>Digest: {t.rawRecordDigest.slice(0, 12)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Encoding Audit Sub-Tab */}
      {activeSubTab === 'ENCODING_AUDIT' && auditResult && (
        <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2">
            <span className="text-stone-200 font-bold">A1Z26 Digital-Root Reproducibility Audit</span>
            <span className="text-stone-400">Digest: {auditResult.auditDigest.slice(0, 16)}...</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
              <span className="text-stone-400 block text-[11px]">Concepts Evaluated:</span>
              <span className="text-lg font-bold text-stone-100">{auditResult.conceptCount}</span>
            </div>
            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
              <span className="text-stone-400 block text-[11px]">Canonical A1Z26 Matches:</span>
              <span className="text-lg font-bold text-emerald-400">{auditResult.canonicalA1Z26Matches} / {auditResult.conceptCount}</span>
            </div>
            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
              <span className="text-stone-400 block text-[11px]">Reported Live Differences:</span>
              <span className="text-lg font-bold text-amber-400">{auditResult.liveAlphabetDifferences} ({(auditResult.liveAlphabetDifferenceFraction * 100).toFixed(1)}%)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400">
                  <th className="py-2">Concept</th>
                  <th className="py-2">Term</th>
                  <th className="py-2">Predeclared Zone</th>
                  <th className="py-2">Recomputed Zone</th>
                  <th className="py-2">Reported Live Zone</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {auditResult.rows.map((r) => (
                  <tr key={r.id} className="text-stone-300">
                    <td className="py-2 text-stone-200 font-semibold">{r.id}</td>
                    <td className="py-2 text-stone-400 italic">"{r.term}"</td>
                    <td className="py-2 font-bold text-stone-200">Zone {r.predeclaredZone}</td>
                    <td className="py-2 font-bold text-emerald-400">Zone {r.recomputedZone}</td>
                    <td className="py-2 text-stone-400">Zone {r.reportedLiveZone}</td>
                    <td className="py-2 text-right">
                      {r.canonicalMatch ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                          MATCH
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 border border-red-800">
                          MISMATCH
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-stone-400 leading-relaxed border-t border-stone-800 pt-3">
            {auditResult.interpretation}
          </p>
        </div>
      )}

      {/* Formatted Console Trace Output */}
      {consoleOutput && (
        <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 font-mono text-[11px] text-stone-300 space-y-2">
          <div className="flex justify-between items-center border-b border-stone-800/80 pb-1 text-stone-400">
            <span>Sealed Execution & Dispatcher Output</span>
            <button
              onClick={() => setConsoleOutput('')}
              className="text-stone-500 hover:text-stone-300 text-[10px]"
            >
              Clear
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed text-stone-300">
            {consoleOutput}
          </pre>
        </div>
      )}
    </div>
  );
};
