import React from 'react';
import { SubstrateStepSnapshot } from '../types/amelia';
import { DevelopmentalAtlasMapping } from '../ai/morphogenetic/DevelopmentalAtlasMapping';
import { Compass, Orbit, Sparkles, Navigation, GitBranch, Layers } from 'lucide-react';

interface DevelopmentalAtlasViewProps {
  snapshot: SubstrateStepSnapshot;
}

export const DevelopmentalAtlasView: React.FC<DevelopmentalAtlasViewProps> = ({ snapshot }) => {
  const manifold = DevelopmentalAtlasMapping.projectManifoldCoordinates(
    snapshot.step,
    snapshot.zones,
    snapshot.governor.deformationFieldTension
  );

  const archetypes = DevelopmentalAtlasMapping.CANONICAL_ARCHETYPES;
  const activeArch = DevelopmentalAtlasMapping.recognizeArchetype(snapshot.zones);

  return (
    <div className="space-y-6">
      {/* 3D Manifold Coordinates Banner */}
      <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700/80 flex items-center justify-center text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-200 font-mono">
                Developmental Atlas Manifold Mapping
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                Continuous state embedding across Numogram phase space basins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-stone-950 border border-stone-800 text-xs font-mono text-cyan-300">
              Manifold Locus: [{manifold.coordinates.join(', ')}]
            </span>
          </div>
        </div>

        {/* 3-Coordinate Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
            <span className="text-xs text-stone-400 font-mono">Barker-Lemur Modulus (X)</span>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {manifold.coordinates[0]}
            </div>
            <span className="text-[10px] text-stone-500 font-mono">Zone (1,4,7) vs (2,5,8)</span>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
            <span className="text-xs text-stone-400 font-mono">Plexus-Abyss Gradient (Y)</span>
            <div className="text-lg font-bold text-cyan-400 font-mono">
              {manifold.coordinates[1]}
            </div>
            <span className="text-[10px] text-stone-500 font-mono">Zone (3,6) vs (0,9)</span>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
            <span className="text-xs text-stone-400 font-mono">Bifurcation Locus Potential</span>
            <div className="text-lg font-bold text-amber-400 font-mono">
              {(manifold.bifurcationPotential * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-stone-500 font-mono">Attractor basin stability</span>
          </div>
        </div>
      </div>

      {/* Archetypal Trajectory Basins */}
      <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
            <Orbit className="w-4 h-4 text-emerald-400" />
            Recurring Archetypal Trajectory Basins
          </h3>
          <span className="text-xs text-stone-400 font-mono">
            Recognised Active: <strong className="text-emerald-300">{activeArch.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {archetypes.map((arch) => {
            const isActive = arch.id === activeArch.id;
            return (
              <div
                key={arch.id}
                className={`p-4 rounded-xl border transition-all ${
                  isActive 
                    ? 'bg-stone-950/90 border-emerald-500/80 shadow-lg shadow-emerald-950/20' 
                    : 'bg-stone-950/40 border-stone-800/80 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-stone-200" style={{ color: arch.color }}>
                    {arch.name}
                  </span>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono font-bold">
                      ACTIVE BASIN
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs font-mono text-stone-400">
                  <span>Routing: </span>
                  <span className="text-stone-300 font-semibold">{arch.primaryAxis}</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span>Recurrence: {(arch.recurrenceProbability * 100).toFixed(0)}%</span>
                  <span>Basin Stability: {(arch.basinStability * 100).toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
