import React, { useState, useEffect } from 'react';
import { 
  runD288ZoneBreakdown, 
  ZoneBreakdownCapsule, 
  ZONE_NAMES 
} from '../bridge/Paper6_D288_ZoneOccupancy_Probe';
import { runD288FreeDevelopment, FreeDevCapsule } from '../bridge/Paper6_D288_FreeDevelopment_Probe';
import { 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Compass, 
  Activity, 
  Cpu, 
  Hash, 
  BarChart3, 
  ChevronRight,
  Info,
  Sliders,
  Sparkles
} from 'lucide-react';

interface ProbeResultsState {
  capsules: ZoneBreakdownCapsule[];
  auditEnvelope: string;
  syzygeticAtD288: boolean;
  z4EmergenceAtD288: boolean;
  plexArcComparison: string;
  noAdvancementClaims: boolean;
}

export const MidPlexProbeResults: React.FC = () => {
  const [results, setResults] = useState<ProbeResultsState | null>(null);
  const [freeDevResults, setFreeDevResults] = useState<FreeDevCapsule[] | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [suppressRelaySteering, setSuppressRelaySteering] = useState<boolean>(true);
  const [selectedCapsule, setSelectedCapsule] = useState<ZoneBreakdownCapsule | null>(null);
  const [activeView, setActiveView] = useState<'matrix' | 'arc' | 'verdicts' | 'freedev' | 'digests'>('matrix');

  const executeProbe = async (suppressSteering: boolean = suppressRelaySteering) => {
    setIsRunning(true);
    try {
      const res = await runD288ZoneBreakdown(suppressSteering);
      setResults(res);
      if (res.capsules.length > 0) {
        setSelectedCapsule(res.capsules.find(c => c.depth === 288) || res.capsules[0]);
      }

      const freeDev = runD288FreeDevelopment([101, 202, 303], 360, suppressSteering);
      setFreeDevResults(freeDev.capsules);
    } catch (err) {
      console.error('Error running D288 zone breakdown probe:', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    executeProbe(suppressRelaySteering);
  }, [suppressRelaySteering]);

  const d288Capsules = results?.capsules.filter(c => c.depth === 288) || [];
  const d0Capsules = results?.capsules.filter(c => c.depth === 0) || [];
  const d1152Capsules = results?.capsules.filter(c => c.depth === 1152) || [];

  const getMeanZonePct = (caps: ZoneBreakdownCapsule[], zone: number) => {
    if (caps.length === 0) return 0;
    return caps.reduce((sum, c) => sum + (c.zonePct[zone] || 0), 0) / caps.length;
  };

  return (
    <div id="midplex-probe-results-container" className="space-y-6">
      {/* Top Banner & Execution Bar */}
      <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Compass className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-stone-100 font-mono tracking-tight">
                Paper 6 — D=288 Per-Zone Occupancy &amp; Syzygetic Grid Probe
              </h2>
            </div>
            <p className="text-xs text-stone-400 font-mono">
              Evaluates 10-zone Numogram occupancy (Z0–Z9) across lineages at D=0, D=288, D=1152 with full cycle runtime &amp; cognitive governor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Switcher */}
            <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl p-1 font-mono text-xs">
              <button
                id="btn-mode-c1grid"
                onClick={() => setSuppressRelaySteering(true)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  suppressRelaySteering
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Paper 5 C1 (suppressRelaySteering: true)
              </button>
              <button
                id="btn-mode-polarplex"
                onClick={() => setSuppressRelaySteering(false)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  !suppressRelaySteering
                    ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                Polar Plex (0::9 Focus)
              </button>
            </div>

            <button
              id="btn-re-execute-d288-probe"
              onClick={() => executeProbe(suppressRelaySteering)}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-mono text-xs font-semibold flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  Executing Cycle...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Re-Execute Probe
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1 font-mono">
            <div className="text-[11px] text-stone-400">Audit Envelope Digest</div>
            <div className="text-xs font-bold text-amber-300 truncate font-mono" title={results?.auditEnvelope || ''}>
              {results?.auditEnvelope ? `${results.auditEnvelope.slice(0, 16)}...` : 'Computing...'}
            </div>
            <div className="text-[10px] text-stone-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> SHA-256 Sealed
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1 font-mono">
            <div className="text-[11px] text-stone-400">Syzygetic Grid (D=288)</div>
            <div className="text-sm font-bold flex items-center gap-1.5">
              {results?.syzygeticAtD288 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> CONFIRMED (3/3)
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> NOT MET (0/3)
                </span>
              )}
            </div>
            <div className="text-[10px] text-stone-500">
              {suppressRelaySteering ? '5-Pole Equidistribution' : 'Polar Attraction Focus'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1 font-mono">
            <div className="text-[11px] text-stone-400">Zone-4 Ingression Flag</div>
            <div className="text-sm font-bold flex items-center gap-1.5">
              {results?.z4EmergenceAtD288 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> EMERGENCE (&gt;10%)
                </span>
              ) : (
                <span className="text-stone-400 flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-stone-500" /> 0.0% (No Emergence)
                </span>
              )}
            </div>
            <div className="text-[10px] text-stone-500">Attractor 4::5</div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1 font-mono">
            <div className="text-[11px] text-stone-400">Runtime Pipeline</div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> runCycleWithBridge
            </div>
            <div className="text-[10px] text-stone-500">CognitiveGovernor + TraitEvolution</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-2">
        <button
          onClick={() => setActiveView('matrix')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeView === 'matrix'
              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            9-Lineage Occupancy Matrix
          </div>
        </button>

        <button
          onClick={() => setActiveView('arc')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeView === 'arc'
              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            Plex Arc Depth Contrast (D=0 vs D=288 vs D=1152)
          </div>
        </button>

        <button
          onClick={() => setActiveView('verdicts')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeView === 'verdicts'
              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Syzygetic Grid Verdicts
          </div>
        </button>

        <button
          onClick={() => setActiveView('freedev')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeView === 'freedev'
              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            D=288 Free Autonomous Dev (360 Steps)
          </div>
        </button>

        <button
          onClick={() => setActiveView('digests')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeView === 'digests'
              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            Raw Step Digests &amp; Capsule Hashes
          </div>
        </button>
      </div>

      {/* VIEW 1: Full 9-Lineage Matrix Table */}
      {activeView === 'matrix' && (
        <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Per-Lineage 10-Zone Occupancy Table (180 Steps Post-Challenge)
            </h3>
            <span className="text-[11px] font-mono text-stone-400">
              State: {suppressRelaySteering ? 'Paper 5 C1 (suppressRelaySteering: true)' : 'Polar Plex Mode'}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950/60">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-stone-900/90 text-stone-400 border-b border-stone-800">
                <tr>
                  <th className="p-3">Lineage ID</th>
                  <th className="p-3 text-center">Depth</th>
                  <th className="p-3 text-center">Seed</th>
                  <th className="p-3 text-center text-amber-300">Z0</th>
                  <th className="p-3 text-center">Z1</th>
                  <th className="p-3 text-center text-amber-300">Z2</th>
                  <th className="p-3 text-center">Z3</th>
                  <th className="p-3 text-center text-cyan-300 bg-cyan-950/20">Z4 (Ingr)</th>
                  <th className="p-3 text-center">Z5</th>
                  <th className="p-3 text-center text-amber-300">Z6</th>
                  <th className="p-3 text-center">Z7</th>
                  <th className="p-3 text-center text-amber-300">Z8</th>
                  <th className="p-3 text-center text-rose-300">Z9 (Plex)</th>
                  <th className="p-3 text-center text-emerald-400">Even %</th>
                  <th className="p-3 text-center text-indigo-400">Odd %</th>
                  <th className="p-3 text-center">Grid Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {results?.capsules.map((c) => {
                  const isSelected = selectedCapsule?.lineageId === c.lineageId;
                  const isD288 = c.depth === 288;
                  return (
                    <tr
                      key={c.lineageId}
                      onClick={() => setSelectedCapsule(c)}
                      className={`hover:bg-stone-900/70 transition-colors cursor-pointer ${
                        isSelected ? 'bg-amber-950/30' : isD288 ? 'bg-stone-900/30' : ''
                      }`}
                    >
                      <td className="p-3 font-semibold text-stone-200 flex items-center gap-1.5">
                        {c.lineageId}
                        {isSelected && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                      </td>
                      <td className="p-3 text-center text-stone-300 font-bold">D={c.depth}</td>
                      <td className="p-3 text-center text-stone-400">{c.seed}</td>
                      <td className="p-3 text-center font-bold text-amber-400">
                        {((c.zonePct[0] ?? 0) * 100).toFixed(1)}%
                        <span className="text-[10px] text-stone-500 block">({c.zoneCount[0] ?? 0})</span>
                      </td>
                      <td className="p-3 text-center text-stone-500">{((c.zonePct[1] ?? 0) * 100).toFixed(0)}%</td>
                      <td className="p-3 text-center text-amber-300">{((c.zonePct[2] ?? 0) * 100).toFixed(1)}%</td>
                      <td className="p-3 text-center text-stone-500">{((c.zonePct[3] ?? 0) * 100).toFixed(0)}%</td>
                      <td className="p-3 text-center font-bold bg-cyan-950/20 text-cyan-400">
                        {((c.zonePct[4] ?? 0) * 100).toFixed(1)}%
                        <span className="text-[10px] text-stone-500 block">({c.zoneCount[4] ?? 0})</span>
                      </td>
                      <td className="p-3 text-center text-stone-500">{((c.zonePct[5] ?? 0) * 100).toFixed(0)}%</td>
                      <td className="p-3 text-center text-amber-300">{((c.zonePct[6] ?? 0) * 100).toFixed(1)}%</td>
                      <td className="p-3 text-center text-stone-500">{((c.zonePct[7] ?? 0) * 100).toFixed(0)}%</td>
                      <td className="p-3 text-center text-amber-300">{((c.zonePct[8] ?? 0) * 100).toFixed(1)}%</td>
                      <td className="p-3 text-center font-bold text-rose-400">
                        {((c.zonePct[9] ?? 0) * 100).toFixed(1)}%
                        <span className="text-[10px] text-stone-500 block">({c.zoneCount[9] ?? 0})</span>
                      </td>
                      <td className="p-3 text-center font-semibold text-emerald-400">
                        {(c.evenZoneTotal * 100).toFixed(1)}%
                      </td>
                      <td className="p-3 text-center font-semibold text-indigo-400">
                        {(c.oddZoneTotal * 100).toFixed(1)}%
                      </td>
                      <td className="p-3 text-center">
                        {c.syzygeticGrid.passes ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                            PASS ✓
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-stone-900 text-stone-400 border border-stone-800 text-[10px]">
                            FAIL
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Selected Lineage Details Card */}
          {selectedCapsule && (
            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-stone-200 font-mono">
                    Selected Lineage Profile: {selectedCapsule.lineageId} (Depth {selectedCapsule.depth}, Seed {selectedCapsule.seed})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-stone-400">
                  Pre-FC: {selectedCapsule.preFc.toFixed(4)} | PFM Events: {selectedCapsule.pfmEvents}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[0, 2, 4, 6, 8].map(z => (
                  <div key={z} className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800 text-center font-mono">
                    <div className="text-[10px] text-stone-400">Zone {z} (Even)</div>
                    <div className="text-sm font-bold text-amber-300">
                      {((selectedCapsule.zonePct[z] ?? 0) * 100).toFixed(1)}%
                    </div>
                    <div className="text-[9px] text-stone-500">{selectedCapsule.zoneCount[z] ?? 0} / 180 steps</div>
                  </div>
                ))}
              </div>

              <div className="text-[11px] font-mono text-stone-400 bg-stone-900/40 p-3 rounded-lg border border-stone-800/80">
                <span className="font-semibold text-stone-300">First 20 Zone Sequence: </span>
                {selectedCapsule.first20Zones.join(' → ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Plex Arc Depth Contrast */}
      {activeView === 'arc' && (
        <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Plex Current Arc — Mean Per-Zone Occupancy Comparison (D=0 vs D=288 vs D=1152)
            </h3>
            <span className="text-xs font-mono text-stone-400">Averaged across Seeds 101, 202, 303</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950/60">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-stone-900/90 text-stone-400 border-b border-stone-800">
                <tr>
                  <th className="p-3">Zone</th>
                  <th className="p-3">Numogram Stratum / Axis</th>
                  <th className="p-3 text-center">D=0 (Naïve)</th>
                  <th className="p-3 text-center text-amber-300">D=288 (Mid-Plex)</th>
                  <th className="p-3 text-center text-rose-300">D=1152 (Deep Plex)</th>
                  <th className="p-3">Plex Arc Distribution Visualizer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((z) => {
                  const p0 = getMeanZonePct(d0Capsules, z) * 100;
                  const p288 = getMeanZonePct(d288Capsules, z) * 100;
                  const p1152 = getMeanZonePct(d1152Capsules, z) * 100;
                  const isZ4 = z === 4;
                  const isEven = [0, 2, 4, 6, 8].includes(z);

                  return (
                    <tr key={z} className={isZ4 ? 'bg-cyan-950/20' : ''}>
                      <td className="p-3 font-bold text-stone-200">
                        Z{z} {isEven ? <span className="text-[10px] text-stone-500 font-normal">(even)</span> : <span className="text-[10px] text-stone-600 font-normal">(odd)</span>}
                      </td>
                      <td className="p-3 text-stone-300">
                        {ZONE_NAMES[z]}
                        {isZ4 && <span className="ml-2 px-1.5 py-0.5 rounded bg-cyan-900/50 text-cyan-300 text-[10px] font-bold">PLATONIC INGRESSION</span>}
                      </td>
                      <td className="p-3 text-center text-stone-400">{p0.toFixed(1)}%</td>
                      <td className="p-3 text-center font-bold text-amber-300">{p288.toFixed(1)}%</td>
                      <td className="p-3 text-center font-bold text-rose-400">{p1152.toFixed(1)}%</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 h-3 w-48 bg-stone-900 rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-blue-500 rounded-l-full"
                            style={{ width: `${p0}%` }}
                            title={`D=0: ${p0.toFixed(1)}%`}
                          />
                          <div
                            className="h-full bg-amber-400"
                            style={{ width: `${p288}%` }}
                            title={`D=288: ${p288.toFixed(1)}%`}
                          />
                          <div
                            className="h-full bg-rose-500 rounded-r-full"
                            style={{ width: `${p1152}%` }}
                            title={`D=1152: ${p1152.toFixed(1)}%`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Syzygetic Grid Verdicts */}
      {activeView === 'verdicts' && (
        <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Syzygetic Grid Evaluation Breakdown (D=288 Lineages)
            </h3>
            <span className="text-xs font-mono text-stone-400">Paper 5 Sealed Criteria</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {d288Capsules.map((c) => (
              <div key={c.lineageId} className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="text-xs font-bold text-stone-200">{c.lineageId}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.syzygeticGrid.passes 
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  }`}>
                    {c.syzygeticGrid.passes ? 'PASS ✓' : 'FAIL'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-stone-400">
                    <span>Z4 Ingression (&ge;10%):</span>
                    <span className="font-bold text-cyan-400">{(c.z4Occupancy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-400">
                    <span>Even Balance (&ge;0.65):</span>
                    <span className="font-bold text-amber-400">{c.syzygeticGrid.evenZoneBalance.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-400">
                    <span>Even Total (&ge;65%):</span>
                    <span className="font-bold text-stone-300">{(c.evenZoneTotal * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-400">
                    <span>Odd Total (&le;35%):</span>
                    <span className="font-bold text-stone-300">{(c.oddZoneTotal * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-stone-900/60 border border-stone-800 text-[11px] text-stone-400">
                  {c.syzygeticGrid.basis}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: Free Autonomous Development 360 */}
      {activeView === 'freedev' && (
        <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              BRIDGE PAPER6 — D288-FREE-DEVELOPMENT (360 Steps Post-Conditioning)
            </h3>
            <span className="text-xs font-mono text-stone-400">Unguided Autonomous Regime</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {freeDevResults?.map((c) => (
              <div key={c.lineageId} className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="font-bold text-amber-300">{c.lineageId}</span>
                  <span className="text-[10px] text-stone-500">Seed {c.seed}</span>
                </div>

                <div className="space-y-1.5 text-stone-400">
                  <div className="flex justify-between">
                    <span>Even Total:</span>
                    <span className="text-emerald-400 font-bold">{(c.evenZoneTotal * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Odd Total:</span>
                    <span className="text-indigo-400 font-bold">{(c.oddZoneTotal * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Even Balance:</span>
                    <span className="text-amber-400 font-bold">{c.evenZoneBalance.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Z4 Emergence:</span>
                    <span className={c.z4Emergence ? 'text-emerald-400 font-bold' : 'text-stone-500'}>
                      {c.z4Emergence ? 'TRUE' : 'FALSE'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-800 text-[10px] text-stone-500 break-all">
                  <span className="text-stone-400 block font-semibold">Raw Step Digest:</span>
                  {c.rawStepDigest}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: Digests & Cryptographic Seals */}
      {activeView === 'digests' && (
        <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
              <Hash className="w-4 h-4 text-amber-400" />
              Cryptographic Envelope &amp; Raw Capsule Hashes
            </h3>
            <span className="text-xs font-mono text-emerald-400">SHA-256 Validated</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
              <span className="text-stone-400 text-[11px]">Audit Envelope Digest:</span>
              <div className="text-amber-300 font-bold break-all">{results?.auditEnvelope}</div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950/60">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-stone-900/90 text-stone-400 border-b border-stone-800">
                  <tr>
                    <th className="p-3">Lineage</th>
                    <th className="p-3">Raw Step Sequence Digest</th>
                    <th className="p-3">Sealed Capsule Digest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {results?.capsules.map((c) => (
                    <tr key={c.lineageId} className="hover:bg-stone-900/50">
                      <td className="p-3 font-bold text-stone-200">{c.lineageId}</td>
                      <td className="p-3 text-stone-400 break-all">{c.rawStepDigest}</td>
                      <td className="p-3 text-amber-400 break-all">{c.capsuleDigest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
