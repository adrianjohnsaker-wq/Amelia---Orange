import React from 'react';
import { ExternalDevelopmentalRhythm } from '../types/amelia';
import { Radio, Waves, Activity, Zap, CheckCircle2 } from 'lucide-react';

interface ExternalRhythmAdvisoryPanelProps {
  rhythms: ExternalDevelopmentalRhythm[];
  onToggleRhythm: (id: string) => void;
  advisoryWeight: number;
}

export const ExternalRhythmAdvisoryPanel: React.FC<ExternalRhythmAdvisoryPanelProps> = ({
  rhythms,
  onToggleRhythm,
  advisoryWeight
}) => {
  return (
    <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
            <Waves className="w-4 h-4 text-cyan-400" />
            External Developmental Rhythm Coupling
          </h3>
          <p className="text-xs text-stone-400 font-mono mt-0.5">
            Weakly tune advisory weighting in response to compatible external developmental rhythms
          </p>
        </div>

        <div className="px-3 py-1 rounded-lg bg-stone-950 border border-stone-800 text-xs font-mono text-cyan-300">
          Advisory Weight: <strong className="font-bold">{advisoryWeight.toFixed(3)}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {rhythms.map((rhythm) => (
          <div
            key={rhythm.id}
            onClick={() => onToggleRhythm(rhythm.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              rhythm.active
                ? 'bg-stone-950/90 border-cyan-500/80 shadow-lg shadow-cyan-950/20'
                : 'bg-stone-950/40 border-stone-800/80 opacity-60 hover:opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-stone-200">{rhythm.label}</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  rhythm.active ? 'bg-cyan-400 animate-pulse' : 'bg-stone-600'
                }`}
              />
            </div>

            <div className="mt-3 space-y-1 text-xs font-mono text-stone-400">
              <div className="flex justify-between">
                <span>Frequency:</span>
                <span className="text-stone-300">{rhythm.frequencyHz} Hz</span>
              </div>
              <div className="flex justify-between">
                <span>Resonance Coupling:</span>
                <span className="text-cyan-400 font-bold">{(rhythm.resonanceCoupling * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Advisory Modulator:</span>
                <span className="text-amber-400">{rhythm.advisoryDelta > 0 ? `+${rhythm.advisoryDelta}` : rhythm.advisoryDelta}</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono">
              <span className={rhythm.active ? 'text-cyan-300 font-bold' : 'text-stone-500'}>
                {rhythm.active ? 'COUPLED' : 'DISSOCIATED'}
              </span>
              <span className="text-stone-500">Non-authorising</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
