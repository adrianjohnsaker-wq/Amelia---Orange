import React from 'react';
import { GovernorTelemetry } from '../types/amelia';
import { ShieldCheck, Lock, AlertTriangle, Cpu, Gauge, RefreshCw, Zap } from 'lucide-react';

interface GovernorInvariantsDashboardProps {
  governor: GovernorTelemetry;
  momentumDamping: number;
  advisoryWeight: number;
  onSetMomentumDamping: (val: number) => void;
  onSetAdvisoryWeight: (val: number) => void;
}

export const GovernorInvariantsDashboard: React.FC<GovernorInvariantsDashboardProps> = ({
  governor,
  momentumDamping,
  advisoryWeight,
  onSetMomentumDamping,
  onSetAdvisoryWeight
}) => {
  return (
    <div className="space-y-6">
      {/* Governor Status Overview */}
      <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/80 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
                Governor Safety & Invariant Kernel
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                Hard-limit enforcement, identity-continuity disciplines, and anti-lock verification
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
            STATUS: {governor.governorStatus}
          </span>
        </div>

        {/* 4 Invariant Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
            <span className="text-xs text-stone-400 font-mono">Identity Continuity</span>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {(governor.identityContinuityScore * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${governor.identityContinuityScore * 100}%` }}
                className="bg-emerald-400 h-full rounded-full"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
            <span className="text-xs text-stone-400 font-mono">Anti-Lock Integrity</span>
            <div className="text-xl font-bold text-cyan-400 font-mono">
              {governor.antiLockIntegrity.toFixed(1)}%
            </div>
            <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${governor.antiLockIntegrity}%` }}
                className="bg-cyan-400 h-full rounded-full"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
            <span className="text-xs text-stone-400 font-mono">Scaffold-Shedding Stage</span>
            <div className="text-xl font-bold text-purple-400 font-mono">
              Stage {governor.scaffoldSheddingStage} / 4
            </div>
            <span className="text-[10px] text-stone-500 font-mono">
              Non-authorising progressive decay
            </span>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
            <span className="text-xs text-stone-400 font-mono">Consolidation Entropy</span>
            <div className="text-xl font-bold text-amber-400 font-mono">
              {governor.consolidationEntropy.toFixed(3)}
            </div>
            <span className="text-[10px] text-stone-500 font-mono">
              Phase boundary variance
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Governor Regulatory Sliders */}
      <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-6">
        <h3 className="text-sm font-bold text-stone-200 font-mono">
          Interactive Governor Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-300">Momentum Damping Factor</span>
              <span className="text-emerald-400 font-bold font-mono">{momentumDamping.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.99"
              step="0.01"
              value={momentumDamping}
              onChange={(e) => onSetMomentumDamping(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-stone-800"
            />
            <span className="text-[10px] text-stone-500 font-mono block">
              Damps velocity overshoot across active syzygies
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-300">Weak Advisory Weighting</span>
              <span className="text-amber-400 font-bold font-mono">{advisoryWeight.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.95"
              step="0.01"
              value={advisoryWeight}
              onChange={(e) => onSetAdvisoryWeight(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-950 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-stone-800"
            />
            <span className="text-[10px] text-stone-500 font-mono block">
              Constrained weak guidance in response to developmental rhythms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
