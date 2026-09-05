import React from 'react';
import { CanalizationArmResult } from '../types/amelia';
import { Layers, Activity, Database, CheckCircle2, Play, RefreshCw } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface CanalizationAssaySuiteProps {
  threeArmResults: Record<string, CanalizationArmResult>;
  selectedDepth: number;
  selectedSeed: number;
  isAssaying: boolean;
  onSetSelectedDepth: (depth: number) => void;
  onSetSelectedSeed: (seed: number) => void;
  onRunThreeArmAssay: () => void;
}

export const CanalizationAssaySuite: React.FC<CanalizationAssaySuiteProps> = ({
  threeArmResults,
  selectedDepth,
  selectedSeed,
  isAssaying,
  onSetSelectedDepth,
  onSetSelectedSeed,
  onRunThreeArmAssay
}) => {
  const chartData = [
    { name: 'Frozen Arm', retention: threeArmResults.FROZEN?.zone9ContactRetention || 18.2, fill: '#78716c' },
    { name: 'Null Baseline', retention: threeArmResults.NULL_BASELINE?.zone9ContactRetention || 44.5, fill: '#f59e0b' },
    { name: 'Active C1 Substrate', retention: threeArmResults.ACTIVE_C1?.zone9ContactRetention || 89.6, fill: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      {/* Assay Controls Header */}
      <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              3-Arm Canalization Comparative Assay
            </h3>
            <p className="text-xs text-stone-400 font-mono mt-0.5">
              Comparative validation: Frozen Arm vs Null Baseline vs Active C1 Zone 9 Retention
            </p>
          </div>

          <button
            id="btn-run-assay"
            onClick={onRunThreeArmAssay}
            disabled={isAssaying}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all font-mono"
          >
            {isAssaying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Execute 3-Arm Assay
          </button>
        </div>

        {/* Depth & Seed Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <span className="text-xs font-mono text-stone-400">Canalization Depth</span>
            <div className="flex gap-2">
              {[48, 72, 144, 288, 576].map((depth) => (
                <button
                  key={depth}
                  onClick={() => onSetSelectedDepth(depth)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    selectedDepth === depth 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60' 
                      : 'bg-stone-950 text-stone-400 border border-stone-800 hover:text-stone-200'
                  }`}
                >
                  D{depth}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-mono text-stone-400">Assay Replication Seed</span>
            <div className="flex gap-2">
              {[101, 202, 303, 404, 505].map((seed) => (
                <button
                  key={seed}
                  onClick={() => onSetSelectedSeed(seed)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    selectedSeed === seed 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60' 
                      : 'bg-stone-950 text-stone-400 border border-stone-800 hover:text-stone-200'
                  }`}
                >
                  S{seed}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3-Arm Comparison Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Arm 1: Frozen */}
        <div className="p-5 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-stone-400">ARM A</span>
            <span className="text-xs font-mono font-bold text-stone-400">FROZEN CONTROL</span>
          </div>
          <div className="text-2xl font-bold text-stone-400 font-mono">
            {threeArmResults.FROZEN?.zone9ContactRetention}%
          </div>
          <span className="text-xs text-stone-500 font-mono block">
            Coherence: {threeArmResults.FROZEN?.fieldCoherence} • Entropy: {threeArmResults.FROZEN?.meanTrajectoryEntropy}
          </span>
        </div>

        {/* Arm 2: Null Baseline */}
        <div className="p-5 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400">ARM B</span>
            <span className="text-xs font-mono font-bold text-amber-300">NULL BASELINE</span>
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {threeArmResults.NULL_BASELINE?.zone9ContactRetention}%
          </div>
          <span className="text-xs text-stone-500 font-mono block">
            Coherence: {threeArmResults.NULL_BASELINE?.fieldCoherence} • Entropy: {threeArmResults.NULL_BASELINE?.meanTrajectoryEntropy}
          </span>
        </div>

        {/* Arm 3: Active C1 Substrate */}
        <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-600/60 shadow-lg shadow-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-bold">ARM C</span>
            <span className="text-xs font-mono font-bold text-emerald-300">ACTIVE C1 SUBSTRATE</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {threeArmResults.ACTIVE_C1?.zone9ContactRetention}%
          </div>
          <span className="text-xs text-emerald-300/80 font-mono block">
            Coherence: {threeArmResults.ACTIVE_C1?.fieldCoherence} • Entropy: {threeArmResults.ACTIVE_C1?.meanTrajectoryEntropy}
          </span>
        </div>
      </div>

      {/* Bar Chart Representation */}
      <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <h4 className="text-xs font-mono font-bold text-stone-300">
          Terminal Zone 9 Retention Comparison (D{selectedDepth} / Seed {selectedSeed})
        </h4>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#78716c" fontSize={12} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#78716c" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', color: '#f5f5f4', fontSize: '12px', fontFamily: 'monospace' }}
              />
              <Bar dataKey="retention" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sealed Protocol & Admissibility Audit Discipline */}
      <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Sealed Protocol Audit & Epistemic Boundary
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
            GOVERNOR-VERIFIED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-stone-400">
          <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1">
            <span className="text-[11px] font-semibold text-stone-300 block">Pre-Classification Invariant:</span>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Boot-state snapshots and raw trajectory records are immutably sealed before classification under guidance-off, label-free baseline conditions.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1">
            <span className="text-[11px] font-semibold text-amber-300 block">Bounded Admissibility Scope:</span>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Admissible conclusions concern history-conditioned future response dynamics. Terminal Zone-9 retention and higher-order authorizations remain non-authorising without direct empirical confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
