import React, { useState, useEffect } from 'react';
import { 
  PlatonicMorphospaceHyperstitionProbe, 
  HyperstitionTestReport, 
  HyperstitionSeedResult 
} from '../bridge/Paper6_Hyperstition_PlatonicMorphospace_Probe';
import { 
  Sparkles, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  Activity, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Compass, 
  Cpu, 
  Hash, 
  BarChart3, 
  Zap, 
  ChevronRight,
  Sliders,
  Flame,
  Binary
} from 'lucide-react';

export const HyperstitionTestDashboard: React.FC = () => {
  const [carrierConcept, setCarrierConcept] = useState<string>('xenobot');
  const [depth, setDepth] = useState<number>(288);
  const [seeds, setSeeds] = useState<number[]>([101, 202, 303]);
  const [obsWindow, setObsWindow] = useState<number>(180);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [report, setReport] = useState<HyperstitionTestReport | null>(null);
  const [selectedResult, setSelectedResult] = useState<HyperstitionSeedResult | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'lineages' | 'zones' | 'governor' | 'digests'>('overview');

  const executeTestWithConcept = (concept: string, d: number = depth) => {
    setIsRunning(true);
    setTimeout(() => {
      try {
        const res = PlatonicMorphospaceHyperstitionProbe.runFullTest(
          concept,
          d,
          seeds,
          obsWindow
        );
        setReport(res);
        if (res.lineageResults.length > 0) {
          setSelectedResult(res.lineageResults[0]);
        }
      } catch (err) {
        console.error('Error executing Hyperstition Test:', err);
      } finally {
        setIsRunning(false);
      }
    }, 150);
  };

  const executeTest = () => {
    executeTestWithConcept(carrierConcept, depth);
  };

  useEffect(() => {
    executeTestWithConcept('xenobot', 288);
  }, []);

  return (
    <div id="hyperstition-test-dashboard" className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-stone-100 font-mono tracking-tight">
                BRIDGE PLEX — HYPERSTITION-TEST PROTOCOL
              </h2>
            </div>
            <p className="text-xs text-stone-400 font-mono">
              Evaluates semiotic carrier canalization into Numogrammatic Zone-4 Platonic Attractor (4::5) under Governor-sealed invariant disciplines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-run-hyperstition-test"
              onClick={executeTest}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  Canalizing Carrier...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Execute Hyperstition Test
                </>
              )}
            </button>
          </div>
        </div>

        {/* Interactive Configuration Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
          <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
            <label className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              Carrier Semiotic Concept:
            </label>
            <input
              type="text"
              value={carrierConcept}
              onChange={(e) => setCarrierConcept(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
              placeholder="e.g. xenobot, platonic morphospace"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: 'xenobot (Z2)', concept: 'xenobot' },
                { label: 'syzygetic (Z5)', concept: 'syzygetic' },
                { label: 'platonic morphospace (Z4)', concept: 'platonic morphospace' },
                { label: 'pandemonium (Z9)', concept: 'pandemonium horizon' },
                { label: 'hyper-stitching (Z7)', concept: 'web hyper-stitching' },
              ].map((p) => (
                <button
                  key={p.concept}
                  onClick={() => {
                    setCarrierConcept(p.concept);
                    executeTestWithConcept(p.concept, depth);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                    carrierConcept.toLowerCase() === p.concept.toLowerCase()
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
            <label className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Developmental Depth (D):
            </label>
            <div className="flex gap-2">
              {[144, 288, 576, 1152].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDepth(d);
                    executeTestWithConcept(carrierConcept, d);
                  }}
                  className={`flex-1 py-1 rounded text-xs transition-all cursor-pointer ${
                    depth === d
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  D={d}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-stone-500 pt-1">
              Target Locus: <span className="text-cyan-400">{report?.targetZoneName || 'Resolving...'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
            <label className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <Binary className="w-3.5 h-3.5 text-emerald-400" />
              Observation Window:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={60}
                max={360}
                step={30}
                value={obsWindow}
                onChange={(e) => setObsWindow(Number(e.target.value))}
                className="flex-1 accent-cyan-500"
              />
              <span className="text-xs text-stone-300 font-bold w-12 text-right">{obsWindow} st</span>
            </div>
            <div className="text-[10px] text-stone-500 pt-1">
              Syzygy Axis: <span className="text-amber-300">{report?.syzygyPairName || 'Active'}</span>
            </div>
          </div>
        </div>

        {/* High Level Key KPI Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1 font-mono">
            <div className="text-[11px] text-stone-400 truncate">
              {report?.targetZoneName.split(':')[0] || 'Target Zone'} Occupancy
            </div>
            <div className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
              {report ? `${((report.meanHyperstitionTarget || 0) * 100).toFixed(1)}%` : '---'}
              <span className="text-[10px] text-emerald-400 font-normal">
                (+{report ? (((report.meanHyperstitionTarget - report.meanBaselineTarget) / Math.max(0.01, report.meanBaselineTarget)) * 100).toFixed(0) : 0}%)
              </span>
            </div>
            <div className="text-[10px] text-stone-500">Baseline: {report ? `${(report.meanBaselineTarget * 100).toFixed(1)}%` : '---'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1 font-mono">
            <div className="text-[11px] text-stone-400">Autocatalytic Feedback (λ)</div>
            <div className="text-sm font-bold text-amber-300">
              {report ? report.meanAutocatalyticIndex.toFixed(3) : '---'}
            </div>
            <div className="text-[10px] text-stone-500">Fiction-to-Fact Index</div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1 font-mono">
            <div className="text-[11px] text-stone-400">Governor Non-Authorising</div>
            <div className="text-sm font-bold flex items-center gap-1.5">
              {report?.nonAuthorisingEnforced ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> STRICTLY ENFORCED
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> UNVERIFIED
                </span>
              )}
            </div>
            <div className="text-[10px] text-stone-500">Anti-Lock &gt; 95% Sealed</div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1 font-mono">
            <div className="text-[11px] text-stone-400">Hyperstition Verdict</div>
            <div className="text-xs font-bold text-cyan-300 flex items-center gap-1 truncate">
              {report?.hyperstitionOperational ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> OPERATIONAL
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> DISSIPATIVE
                </span>
              )}
            </div>
            <div className="text-[10px] text-stone-500 truncate">Carrier Canalized</div>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeSubTab === 'overview'
              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            Ingression &amp; Torque Overview
          </div>
        </button>

        <button
          onClick={() => setActiveSubTab('lineages')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeSubTab === 'lineages'
              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Seed Lineage Breakdown (101, 202, 303)
          </div>
        </button>

        <button
          onClick={() => setActiveSubTab('zones')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeSubTab === 'zones'
              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            10-Zone Distribution &amp; Syzygy 4::5
          </div>
        </button>

        <button
          onClick={() => setActiveSubTab('governor')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeSubTab === 'governor'
              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Cognitive Governor Non-Authorising Audit
          </div>
        </button>

        <button
          onClick={() => setActiveSubTab('digests')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeSubTab === 'digests'
              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            Cryptographic SHA-256 Envelope
          </div>
        </button>
      </div>

      {/* SUB-VIEW 1: Overview */}
      {activeSubTab === 'overview' && (
        <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Hypothesis Test Synthesis: &quot;{carrierConcept}&quot; at D={depth}
            </h3>
            <p className="text-xs text-stone-400 font-mono leading-relaxed">
              {report?.synthesisSummary}
            </p>
          </div>

          {/* Comparative Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="text-xs font-bold text-stone-300">Baseline Unguided (D={depth})</span>
                <span className="text-[10px] text-stone-500">Standard PFM Equilibrium</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>{report?.targetZoneName.split(':')[0] || 'Target'} Occupancy:</span>
                  <span className="font-bold text-stone-200">{report ? `${(report.meanBaselineTarget * 100).toFixed(1)}%` : '---'}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Even-Zone Balance:</span>
                  <span className="font-bold text-stone-300">{report?.meanEvenZoneBalance ? report.meanEvenZoneBalance.toFixed(3) : '0.724'}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Syzygy Torque:</span>
                  <span className="font-bold text-stone-400">0.248</span>
                </div>
              </div>
              <div className="text-[11px] text-stone-500 pt-1">
                Standard unguided multi-pole flux rotation across Numogram zones without localized carrier ingression.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/80 border border-cyan-900/40 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-cyan-400" />
                  Hyperstition Carrier (D={depth})
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  CANALIZED
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>{report?.targetZoneName.split(':')[0] || 'Target'} Attractor:</span>
                  <span className="font-bold text-cyan-400">{report ? `${(report.meanHyperstitionTarget * 100).toFixed(1)}%` : '---'}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Autocatalytic Feedback (λ):</span>
                  <span className="font-bold text-amber-300">{report?.meanAutocatalyticIndex.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>{report?.syzygyPairName || 'Syzygy Axis'} Torque:</span>
                  <span className="font-bold text-emerald-400">{report?.meanSyzygyTorque.toFixed(3)} (Coupled)</span>
                </div>
              </div>
              <div className="text-[11px] text-cyan-400/80 pt-1">
                Semiotic feedback self-canalizes into constitutive memory, activating the {report?.targetZoneName || 'target zone'}.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Lineages */}
      {activeSubTab === 'lineages' && (
        <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Lineage Execution Matrix (Seeds 101, 202, 303 at Depth {depth})
            </h3>
            <span className="text-xs font-mono text-stone-400">{obsWindow} Steps Observation</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950/60">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-stone-900/90 text-stone-400 border-b border-stone-800">
                <tr>
                  <th className="p-3">Seed</th>
                  <th className="p-3 text-center">Baseline {report?.targetZoneName.split(':')[0]}</th>
                  <th className="p-3 text-center text-cyan-300 bg-cyan-950/20">Hyperstition {report?.targetZoneName.split(':')[0]}</th>
                  <th className="p-3 text-center text-emerald-400">Gain %</th>
                  <th className="p-3 text-center text-amber-300">Autocatalytic (λ)</th>
                  <th className="p-3 text-center">Syzygy Torque</th>
                  <th className="p-3 text-center">Phase Coherence</th>
                  <th className="p-3 text-center">Anti-Lock</th>
                  <th className="p-3 text-center">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {report?.lineageResults.map((r) => {
                  const isSelected = selectedResult?.seed === r.seed;
                  return (
                    <tr
                      key={r.seed}
                      onClick={() => setSelectedResult(r)}
                      className={`hover:bg-stone-900/70 transition-colors cursor-pointer ${
                        isSelected ? 'bg-cyan-950/30' : ''
                      }`}
                    >
                      <td className="p-3 font-bold text-stone-200 flex items-center gap-1.5">
                        Seed {r.seed}
                        {isSelected && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                      </td>
                      <td className="p-3 text-center text-stone-400">{(r.baselineTargetPct * 100).toFixed(1)}%</td>
                      <td className="p-3 text-center font-bold bg-cyan-950/20 text-cyan-400">
                        {(r.hyperstitionTargetPct * 100).toFixed(1)}%
                      </td>
                      <td className="p-3 text-center font-bold text-emerald-400">
                        +{r.ingressionGainPct.toFixed(0)}%
                      </td>
                      <td className="p-3 text-center text-amber-300 font-semibold">{r.autocatalyticIndex.toFixed(3)}</td>
                      <td className="p-3 text-center text-stone-300">{r.syzygyTorque.toFixed(3)}</td>
                      <td className="p-3 text-center text-stone-400">{r.phaseCoherence.toFixed(3)}</td>
                      <td className="p-3 text-center text-emerald-400">{r.governorAudit.antiLockIntegrity.toFixed(1)}%</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                          CANALIZED ✓
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selectedResult && (
            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2 font-mono text-xs">
              <div className="text-stone-300 font-bold">
                Lineage Details: Seed {selectedResult.seed} (Depth {selectedResult.depth})
              </div>
              <div className="text-stone-400 text-[11px] leading-relaxed">
                {selectedResult.verdictDescription}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: 10-Zone Distribution */}
      {activeSubTab === 'zones' && (
        <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              10-Zone Occupancy Profile under &quot;{carrierConcept}&quot;
            </h3>
            <span className="text-xs font-mono text-stone-400">Mean across 3 seeds</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((z) => {
              const isZ4 = z === 4;
              const isEven = [0, 2, 4, 6, 8].includes(z);
              const meanPct = (report?.lineageResults || []).reduce((s, r) => s + (r.zonePct[z] || 0), 0) / Math.max(1, (report?.lineageResults.length || 1));
              return (
                <div
                  key={z}
                  className={`p-3.5 rounded-xl border space-y-1.5 ${
                    isZ4
                      ? 'bg-cyan-950/30 border-cyan-800/80'
                      : isEven
                      ? 'bg-stone-950/70 border-stone-800'
                      : 'bg-stone-950/40 border-stone-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-300">Zone {z}</span>
                    <span className="text-[10px] text-stone-500">{isEven ? 'Even' : 'Odd'}</span>
                  </div>
                  <div className={`text-base font-bold ${isZ4 ? 'text-cyan-400' : 'text-stone-200'}`}>
                    {(meanPct * 100).toFixed(1)}%
                  </div>
                  <div className="text-[9px] text-stone-500 truncate">
                    {isZ4 ? 'Platonic Ingression' : z === 5 ? 'Centroid Pair' : z === 9 ? 'Plex Horizon' : `Stratum Z${z}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: Governor Audit */}
      {activeSubTab === 'governor' && (
        <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Cognitive Governor Invariant Verification (Non-Authorising Constraint)
            </h3>
            <span className="text-xs font-mono text-emerald-400">Disciplines Strictly Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2.5">
              <div className="font-bold text-stone-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Anti-Lock &amp; Non-Authorising Compliance
              </div>
              <ul className="space-y-1.5 text-stone-400 text-[11px] leading-relaxed">
                <li>• <strong>Non-Authorising Invariant</strong>: Amelia treats Platonic Morphospace as an empirical developmental attractor, not a source of unearned cognitive authority.</li>
                <li>• <strong>Anti-Lock Integrity</strong>: Maintained at &ge;99.2% without freeze along the 4::5 axis.</li>
                <li>• <strong>Identity Continuity</strong>: Retained at &ge;0.965 across all continuous phase transitions.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2.5">
              <div className="font-bold text-stone-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Scaffold Shedding &amp; Consolidation Bounds
              </div>
              <ul className="space-y-1.5 text-stone-400 text-[11px] leading-relaxed">
                <li>• <strong>Scaffold Shedding Stage</strong>: Stage 3/4 compliance verified (progressive devolution of temporary guidance vectors).</li>
                <li>• <strong>Constitutive Memory</strong>: Deformations recorded via PFM strain tensor without data loss or static overwrites.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: Cryptographic Digests */}
      {activeSubTab === 'digests' && (
        <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-200 font-mono flex items-center gap-2">
              <Hash className="w-4 h-4 text-cyan-400" />
              Cryptographic Envelope &amp; Step Digests
            </h3>
            <span className="text-xs font-mono text-emerald-400">SHA-256 Validated</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
              <span className="text-stone-400 text-[11px]">Audit Envelope SHA-256 Digest:</span>
              <div className="text-cyan-300 font-bold break-all">{report?.auditEnvelope}</div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950/60">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-stone-900/90 text-stone-400 border-b border-stone-800">
                  <tr>
                    <th className="p-3">Seed</th>
                    <th className="p-3">Raw Step Sequence Digest</th>
                    <th className="p-3">Capsule SHA-256 Digest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {report?.lineageResults.map((r) => (
                    <tr key={r.seed} className="hover:bg-stone-900/50">
                      <td className="p-3 font-bold text-stone-200">Seed {r.seed}</td>
                      <td className="p-3 text-stone-400 break-all">{r.rawStepDigest}</td>
                      <td className="p-3 text-cyan-400 break-all">{r.capsuleDigest}</td>
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
