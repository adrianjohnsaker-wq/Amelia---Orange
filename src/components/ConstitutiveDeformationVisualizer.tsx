import React from 'react';
import { SubstrateStepSnapshot } from '../types/amelia';
import { Layers, Activity, GitCommit, ArrowUpRight } from 'lucide-react';

interface ConstitutiveDeformationVisualizerProps {
  snapshot: SubstrateStepSnapshot;
}

export const ConstitutiveDeformationVisualizer: React.FC<ConstitutiveDeformationVisualizerProps> = ({
  snapshot
}) => {
  const vector = snapshot.deformationVector || Array(10).fill(0.5);
  const tension = snapshot.governor.deformationFieldTension;

  return (
    <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Constitutive Deformation Field (10-Zone Strain Tensor)
          </h3>
          <p className="text-xs text-stone-400 font-mono mt-0.5">
            History acts as an active, elastoplastic stress memory rather than passive static recall.
          </p>
        </div>

        <div className="px-3 py-1 rounded-lg bg-stone-950 border border-stone-800 text-xs font-mono">
          <span className="text-stone-400">Total Tensor Tension: </span>
          <span className="text-amber-400 font-bold font-mono">
            {(tension * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 10-Zone Deformation Vector Bar Visualization */}
      <div className="space-y-2">
        <div className="grid grid-cols-10 gap-2">
          {vector.map((val, idx) => (
            <div key={idx} className="space-y-1 text-center">
              <div className="h-32 bg-stone-950/80 rounded-lg p-1 flex flex-col justify-end border border-stone-800/80">
                <div
                  style={{
                    height: `${Math.max(5, val * 100)}%`,
                    backgroundColor: idx === 9 ? '#10b981' : idx === 0 ? '#f59e0b' : '#3b82f6',
                  }}
                  className="w-full rounded transition-all duration-300 opacity-90"
                />
              </div>
              <span className="text-[10px] font-mono text-stone-400 block">Z{idx}</span>
              <span className="text-[10px] font-mono text-stone-200 font-bold block">
                {(val * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 10x10 Constitutive Stress Tensor Matrix Preview */}
      <div className="p-4 rounded-xl bg-stone-950/90 border border-stone-800/90 space-y-3">
        <div className="flex justify-between items-center text-xs font-mono text-stone-400">
          <span className="font-bold text-stone-300">Constitutive Stress Coupling Tensor (T_ij)</span>
          <span>Symmetric Phase Modulus</span>
        </div>

        <div className="grid grid-cols-10 gap-1 text-[10px] font-mono text-center">
          {Array(10).fill(0).map((_, row) =>
            Array(10).fill(0).map((_, col) => {
              const val = Math.abs(vector[row] - vector[col]);
              const opacity = Math.min(1.0, 0.15 + val * 0.85);
              return (
                <div
                  key={`${row}-${col}`}
                  style={{
                    backgroundColor: row === col ? '#f59e0b22' : `rgba(59, 130, 246, ${opacity * 0.4})`,
                    borderColor: row === col ? '#f59e0b66' : 'transparent',
                  }}
                  className="aspect-square flex items-center justify-center rounded border text-stone-300"
                  title={`Stress T[${row},${col}] = ${val.toFixed(2)}`}
                >
                  {val.toFixed(1)}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
