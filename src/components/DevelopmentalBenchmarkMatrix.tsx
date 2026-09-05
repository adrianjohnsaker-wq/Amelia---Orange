import React from 'react';
import { ControlledBenchmark } from '../types/amelia';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Play, RefreshCw } from 'lucide-react';

interface DevelopmentalBenchmarkMatrixProps {
  benchmarks: ControlledBenchmark[];
  onRerunBenchmarks: () => void;
}

export const DevelopmentalBenchmarkMatrix: React.FC<DevelopmentalBenchmarkMatrixProps> = ({
  benchmarks,
  onRerunBenchmarks
}) => {
  return (
    <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Controlled Developmental Benchmark Matrix
          </h3>
          <p className="text-xs text-stone-400 font-mono mt-0.5">
            Non-authorising invariants and canary benchmark evaluation
          </p>
        </div>

        <button
          onClick={onRerunBenchmarks}
          className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          Re-evaluate All Invariants
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {benchmarks.map((bench) => (
          <div
            key={bench.id}
            className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-stone-200">{bench.name}</span>
                {bench.status === 'PASS' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> PASS
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 border border-amber-700 text-amber-300 font-mono font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> WARN
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xs text-stone-400 font-mono">Current:</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {typeof bench.currentValue === 'number' ? bench.currentValue.toFixed(2) : bench.currentValue}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span>Expected: [{bench.expectedRange[0]}, {bench.expectedRange[1]}]</span>
              <span>{bench.targetMetric}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
