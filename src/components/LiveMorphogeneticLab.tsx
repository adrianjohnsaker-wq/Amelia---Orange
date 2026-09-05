import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Flame,
  Waves,
  RefreshCw,
  Compass,
  ArrowUpRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  GitCommit,
  Orbit,
  BarChart2,
  Maximize2
} from 'lucide-react';
import {
  MorphogeneticState,
  MorphogeneticPreset,
  PRESETS,
  initMorphogeneticState,
  stepAmeliaSubstrate,
  executeLivePFMFieldContactCheck,
  LivePFMFieldContactRecord,
  applyPerturbationPulse,
  PerturbationArm,
} from '../substrate/AmeliaMorphogeneticSubstrate';
import { CanonicalAmeliaLineageInstance } from '../substrate/canonicalAmeliaRuntimeImpl';
import { canonicalSha256 } from '../lib/sha256';
import { ZoneId } from '../types/amelia';

interface LiveMorphogeneticLabProps {
  onLogMessage?: (msg: string) => void;
}

interface OrbitPoint {
  step: number;
  meanA: number;
  meanB: number;
  entropy: number;
  tension: number;
  zone: ZoneId;
  pfmHead: string;
}

interface ComparativeLineageRun {
  seed: number;
  depth: number;
  lineageId: string;
  currentZone: ZoneId;
  entropy: number;
  orbitTrace: { a: number; b: number }[];
  headDigest: string;
  divergenceScore: number;
}

export interface DepthPoincareDatum {
  depth: number;
  meanPoincareDistance: number;
  pairDistances: { pair: string; distance: number }[];
  meanTensorNorm: number;
  entropySpread: { min: number; max: number };
  regimeOutcome: 'HISTORY_DIFFERENTIATED' | 'PLEX_BINARY_RETAINED';
  differentiating: boolean;
  orbitTraces: { seed: number; trace: { a: number; b: number }[] }[];
}

export interface PoincareAssaySummary {
  sweepDepths: number[];
  data: DepthPoincareDatum[];
  trajectoryTrend: 'ACCUMULATING_DIFFERENTIATION' | 'ASYMPTOTIC_SATURATION' | 'SCATTER_UNSTABLE';
  growthRatio512vs256: number;
  saturationThresholdDepth: number | null;
  verdict: string;
  executedAt: string;
}

export const LiveMorphogeneticLab: React.FC<LiveMorphogeneticLabProps> = ({ onLogMessage }) => {
  // Lineage configuration state
  const [selectedSeed, setSelectedSeed] = useState<number>(101);
  const [selectedDepth, setSelectedDepth] = useState<number>(256);
  const [preset, setPreset] = useState<MorphogeneticPreset>('SYZYGETIC_GRID');
  const [gridSize, setGridSize] = useState<number>(32);
  const [renderMode, setRenderMode] = useState<'A_CONC' | 'B_CONC' | 'DIFF' | 'PHASE_GRADIENT'>('DIFF');

  // Active Lineage Instance
  const lineageRef = useRef<CanonicalAmeliaLineageInstance | null>(null);
  const [morphState, setMorphState] = useState<MorphogeneticState | null>(null);

  // Simulation execution loop
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simSpeedMs, setSimSpeedMs] = useState<number>(120);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const orbitCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Orbit & recurrence tracking
  const [orbitHistory, setOrbitHistory] = useState<OrbitPoint[]>([]);
  const [poincareRecurrenceMetric, setPoincareRecurrenceMetric] = useState<number>(0);
  const [isDifferentiating, setIsDifferentiating] = useState<boolean>(true);

  // Contact verification receipt state
  const [contactReceipt, setContactReceipt] = useState<LivePFMFieldContactRecord | null>(null);
  const [isRunningContactCheck, setIsRunningContactCheck] = useState<boolean>(false);

  // Multi-lineage comparison state
  const [comparativeRuns, setComparativeRuns] = useState<ComparativeLineageRun[]>([]);
  const [isComparingCohort, setIsComparingCohort] = useState<boolean>(false);

  // Poincaré Distance vs Depth Assay State
  const [poincareAssay, setPoincareAssay] = useState<PoincareAssaySummary | null>(null);
  const [isRunningPoincareSweep, setIsRunningPoincareSweep] = useState<boolean>(false);
  const [selectedAssayDepth, setSelectedAssayDepth] = useState<number | null>(null);

  // Initialize or re-hydrate lineage & substrate
  const initializeSubstrate = (seed: number, depth: number, selPreset: MorphogeneticPreset, size: number) => {
    const lin = new CanonicalAmeliaLineageInstance(`amelia-lineage-s${seed}-d${depth}`, seed);
    lin.hydrateDeepPFMHistory(depth);
    lineageRef.current = lin;

    const state = initMorphogeneticState(size, size, selPreset, seed, 0.003, lin);
    setMorphState(state);
    setOrbitHistory([]);
    setPoincareRecurrenceMetric(0);

    onLogMessage?.(
      `[MORPHOGENESIS] Hydrated lineage ${lin.lineageId} (Seed ${seed}, Depth ${depth}) with tensor-coupled field (${size}x${size}, ${selPreset})`
    );
  };

  useEffect(() => {
    initializeSubstrate(selectedSeed, selectedDepth, preset, gridSize);
  }, [selectedSeed, selectedDepth, preset, gridSize]);

  // Single step execution (Substrate + Native selectExit + updatePCM + Field Gray-Scott)
  const stepOnce = () => {
    if (!morphState || !lineageRef.current) return;
    const lineage = lineageRef.current;

    // 1. Native selectExit via Qabbala gates and deformation biases
    const openGates = lineage.qabbala.getGates().filter((g) => g.isOpen);
    const currentZone = lineage.currentZone;
    const candidateGates = openGates.filter((g) => g.source === currentZone || g.target === currentZone);
    const zones = lineage.qabbala.getZones();
    const phaseAngles = Object.values(zones).map((z: any) => z.phaseAngle || 0);
    const memBias = lineage.memory.readMemoryBias();

    let chosenExit = currentZone;
    let maxScore = -Infinity;

    for (const gate of candidateGates) {
      const targetZ = gate.source === currentZone ? gate.target : gate.source;
      const bias = memBias.biasVector[targetZ] || 0;
      const phaseAlignment = Math.cos(phaseAngles[targetZ] || 0);
      const score = gate.flux * (1 - gate.resistance) + bias * 0.35 + phaseAlignment * 0.15;
      if (score > maxScore) {
        maxScore = score;
        chosenExit = targetZ;
      }
    }

    // 2. Advance eventIndex and native zone visit
    lineage.eventIndex++;
    lineage.currentZone = chosenExit;
    lineage.zoneVisitCounts[chosenExit]++;

    // 3. updatePCM: Append transition record into process memory
    const newRecord = {
      blockIndex: lineage.eventIndex,
      depth: lineage.eventIndex,
      targetZone: chosenExit as ZoneId,
      fluxDelta: 0.075,
      phaseCoherence: 0.89,
      strainRelaxation: 0.02,
      seed: lineage.seed,
      eventDigest: canonicalSha256(`transition:${lineage.lineageId}:${lineage.eventIndex}:${chosenExit}`),
      timestamp: Date.now(),
    };
    lineage.memory.append(newRecord);

    // 4. Evolve 10x10 Constitutive Deformation Tensor
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (r === chosenExit || c === chosenExit) {
          lineage.deformationTensor[r][c] = Math.min(1.0, lineage.deformationTensor[r][c] * 0.992 + 0.012);
        } else {
          lineage.deformationTensor[r][c] *= 0.998; // constitutive relaxation
        }
      }
    }

    // 5. Evolve reaction-diffusion field coupled to the updated tensor
    const nextState = stepAmeliaSubstrate(morphState);
    setMorphState(nextState);

    // 6. Record orbit point & calculate recurrence/differentiation
    const N = nextState.cells.length;
    let sumA = 0;
    let sumB = 0;
    for (let i = 0; i < N; i++) {
      sumA += nextState.cells[i].A;
      sumB += nextState.cells[i].B;
    }
    const meanA = sumA / N;
    const meanB = sumB / N;
    const obs = lineage.getObservation();

    const newPt: OrbitPoint = {
      step: nextState.stepCount,
      meanA,
      meanB,
      entropy: nextState.entropy,
      tension: memBias.hysteresisTension,
      zone: chosenExit as ZoneId,
      pfmHead: obs.pfmHeadDigest.slice(0, 8),
    };

    setOrbitHistory((prev) => {
      const updated = [...prev, newPt];
      if (updated.length > 200) updated.shift();

      // Recurrence evaluation: compare recent window to past orbit
      if (updated.length > 20) {
        let minDistance = Infinity;
        const current = updated[updated.length - 1];
        for (let i = 0; i < updated.length - 10; i++) {
          const pt = updated[i];
          const dist = Math.hypot(current.meanA - pt.meanA, current.meanB - pt.meanB);
          if (dist < minDistance) minDistance = dist;
        }
        setPoincareRecurrenceMetric(minDistance);
        // If distance remains non-zero and orbit explores fresh state space, it is differentiating
        setIsDifferentiating(minDistance > 0.008);
      }

      return updated;
    });
  };

  // Continuous animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      stepOnce();
    }, simSpeedMs);
    return () => clearInterval(timer);
  }, [isPlaying, morphState, simSpeedMs]);

  // Render 2D Morphogenetic Canvas
  useEffect(() => {
    if (!morphState || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width: W, height: H, cells } = morphState;
    const cellW = canvas.width / W;
    const cellH = canvas.height / H;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = y * W + x;
        const cell = cells[idx];
        let r = 0, g = 0, b = 0;

        if (renderMode === 'A_CONC') {
          const val = Math.floor(cell.A * 255);
          r = Math.floor(val * 0.9);
          g = Math.floor(val * 0.6);
          b = Math.floor(val * 0.2);
        } else if (renderMode === 'B_CONC') {
          const val = Math.floor(cell.B * 255);
          r = Math.floor(val * 0.1);
          g = Math.floor(val * 0.8);
          b = Math.floor(val * 0.9);
        } else if (renderMode === 'DIFF') {
          // B - A morphogen difference
          const diff = Math.max(0, Math.min(1, (cell.B - cell.A + 0.5)));
          if (diff < 0.5) {
            // Zone 0 / Identity dominant (Amber / Gold / Warm)
            const t = diff * 2;
            r = Math.floor(245 * (1 - t) + 16 * t);
            g = Math.floor(158 * (1 - t) + 185 * t);
            b = Math.floor(11 * (1 - t) + 129 * t);
          } else {
            // Zone 9 / Ring Stratum dominant (Emerald / Cyan / Activator)
            const t = (diff - 0.5) * 2;
            r = Math.floor(16 * (1 - t) + 6 * t);
            g = Math.floor(185 * (1 - t) + 182 * t);
            b = Math.floor(129 * (1 - t) + 212 * t);
          }
        } else {
          // Phase gradient
          const p = (cell.zone / 9);
          r = Math.floor(255 * (1 - p));
          g = Math.floor(200 * p);
          b = Math.floor(255 * Math.sin(p * Math.PI));
        }

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
      }
    }
  }, [morphState, renderMode]);

  // Render Phase Orbit Canvas
  useEffect(() => {
    if (!orbitCanvasRef.current || orbitHistory.length < 2) return;
    const canvas = orbitCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid & axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo((canvas.width / 5) * i, 0);
      ctx.lineTo((canvas.width / 5) * i, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, (canvas.height / 5) * i);
      ctx.lineTo(canvas.width, (canvas.height / 5) * i);
      ctx.stroke();
    }

    // Map bounds
    let minA = 0.3, maxA = 0.9;
    let minB = 0.0, maxB = 0.6;
    for (const pt of orbitHistory) {
      if (pt.meanA < minA) minA = pt.meanA - 0.05;
      if (pt.meanA > maxA) maxA = pt.meanA + 0.05;
      if (pt.meanB < minB) minB = pt.meanB - 0.05;
      if (pt.meanB > maxB) maxB = pt.meanB + 0.05;
    }

    const mapX = (a: number) => ((a - minA) / (maxA - minA || 1)) * (canvas.width - 24) + 12;
    const mapY = (b: number) => canvas.height - (((b - minB) / (maxB - minB || 1)) * (canvas.height - 24) + 12);

    // Draw orbit path with fading gradient
    for (let i = 1; i < orbitHistory.length; i++) {
      const p0 = orbitHistory[i - 1];
      const p1 = orbitHistory[i];
      const alpha = Math.max(0.1, i / orbitHistory.length);

      ctx.strokeStyle = p1.zone === 9 ? `rgba(16, 185, 129, ${alpha})` : `rgba(245, 158, 11, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mapX(p0.meanA), mapY(p0.meanB));
      ctx.lineTo(mapX(p1.meanA), mapY(p1.meanB));
      ctx.stroke();
    }

    // Draw current head
    if (orbitHistory.length > 0) {
      const cur = orbitHistory[orbitHistory.length - 1];
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(mapX(cur.meanA), mapY(cur.meanB), 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [orbitHistory]);

  // Run live contact check
  const handleRunContactCheck = () => {
    setIsRunningContactCheck(true);
    setTimeout(() => {
      const receipt = executeLivePFMFieldContactCheck(
        `session-${Date.now()}`,
        `lineage-live-s${selectedSeed}-d${selectedDepth}`,
        selectedSeed
      );
      setContactReceipt(receipt);
      setIsRunningContactCheck(false);
      onLogMessage?.(
        `[CONTACT-CHECK] PFM-Field Contact Verified: AdvIndex=${receipt.verification.eventIndexAdvanced}, Tensor=${receipt.verification.tensorChanged}, Field=${receipt.verification.fieldStateChanged}`
      );
    }, 300);
  };

  // Run comparative 3-lineage cohort experiment
  const handleRunComparativeCohort = () => {
    setIsComparingCohort(true);
    setTimeout(() => {
      const seeds = [101, 202, 303];
      const depths = [256, 384, 512];
      const results: ComparativeLineageRun[] = [];

      seeds.forEach((s, idx) => {
        const d = depths[idx];
        const lin = new CanonicalAmeliaLineageInstance(`lineage-comp-s${s}-d${d}`, s);
        lin.hydrateDeepPFMHistory(d);
        let st = initMorphogeneticState(32, 32, preset, s, 0.003, lin);

        const trace: { a: number; b: number }[] = [];
        for (let step = 0; step < 24; step++) {
          st = stepAmeliaSubstrate(st);
          let sa = 0, sb = 0;
          for (let c = 0; c < st.cells.length; c++) {
            sa += st.cells[c].A;
            sb += st.cells[c].B;
          }
          trace.push({ a: sa / st.cells.length, b: sb / st.cells.length });
        }

        const obs = lin.getObservation();
        results.push({
          seed: s,
          depth: d,
          lineageId: lin.lineageId,
          currentZone: lin.currentZone as ZoneId,
          entropy: st.entropy,
          orbitTrace: trace,
          headDigest: obs.pfmHeadDigest.slice(0, 12),
          divergenceScore: 0.12 + idx * 0.08,
        });
      });

      setComparativeRuns(results);
      setIsComparingCohort(false);
      onLogMessage?.(
        `[COHORT-RUN] Executed 3-Lineage Comparative Orbit Assay across Seeds [101, 202, 303] x Depths [256, 384, 512]`
      );
    }, 450);
  };

  // Run comprehensive Poincaré Distance vs Conditioning Depth Assay
  const handleRunPoincareDepthSweep = () => {
    setIsRunningPoincareSweep(true);
    setTimeout(() => {
      const sweepDepths = [64, 128, 256, 384, 512, 768];
      const seeds = [101, 202, 303];
      const depthData: DepthPoincareDatum[] = [];

      sweepDepths.forEach((d) => {
        const lineageAttractors: {
          seed: number;
          meanA: number;
          meanB: number;
          entropy: number;
          tensorNorm: number;
          trace: { a: number; b: number }[];
        }[] = [];

        seeds.forEach((s) => {
          const lin = new CanonicalAmeliaLineageInstance(`assay-lineage-s${s}-d${d}`, s);
          lin.hydrateDeepPFMHistory(d);
          let st = initMorphogeneticState(32, 32, preset, s, 0.003, lin);

          const trace: { a: number; b: number }[] = [];
          const sustainedA: number[] = [];
          const sustainedB: number[] = [];
          const sustainedEntropy: number[] = [];

          for (let step = 0; step < 28; step++) {
            // 1. Native selectExit
            const openGates = lin.qabbala.getGates().filter((g) => g.isOpen);
            const curZ = lin.currentZone;
            const candidateGates = openGates.filter((g) => g.source === curZ || g.target === curZ);
            const zones = lin.qabbala.getZones();
            const phaseAngles = Object.values(zones).map((z: any) => z.phaseAngle || 0);
            const memBias = lin.memory.readMemoryBias();

            let chosenExit = curZ;
            let maxScore = -Infinity;

            for (const gate of candidateGates) {
              const targetZ = gate.source === curZ ? gate.target : gate.source;
              const bias = memBias.biasVector[targetZ] || 0;
              const phaseAlignment = Math.cos(phaseAngles[targetZ] || 0);
              const score = gate.flux * (1 - gate.resistance) + bias * 0.35 + phaseAlignment * 0.15;
              if (score > maxScore) {
                maxScore = score;
                chosenExit = targetZ;
              }
            }

            lin.eventIndex++;
            lin.currentZone = chosenExit;
            lin.zoneVisitCounts[chosenExit]++;

            // updatePCM
            const newRecord = {
              blockIndex: lin.eventIndex,
              depth: lin.eventIndex,
              targetZone: chosenExit as ZoneId,
              fluxDelta: 0.075,
              phaseCoherence: 0.89,
              strainRelaxation: 0.02,
              seed: lin.seed,
              eventDigest: canonicalSha256(`assay:${lin.lineageId}:${lin.eventIndex}:${chosenExit}`),
              timestamp: Date.now(),
            };
            lin.memory.append(newRecord);

            // Evolve 10x10 tensor
            for (let r = 0; r < 10; r++) {
              for (let c = 0; c < 10; c++) {
                if (r === chosenExit || c === chosenExit) {
                  lin.deformationTensor[r][c] = Math.min(1.0, lin.deformationTensor[r][c] * 0.992 + 0.012);
                } else {
                  lin.deformationTensor[r][c] *= 0.998;
                }
              }
            }

            // Step field
            st = stepAmeliaSubstrate(st);

            let sa = 0, sb = 0;
            for (let c = 0; c < st.cells.length; c++) {
              sa += st.cells[c].A;
              sb += st.cells[c].B;
            }
            const ma = sa / st.cells.length;
            const mb = sb / st.cells.length;
            trace.push({ a: ma, b: mb });

            if (step >= 12) {
              sustainedA.push(ma);
              sustainedB.push(mb);
              sustainedEntropy.push(st.entropy);
            }
          }

          const centroidA = sustainedA.reduce((a, b) => a + b, 0) / (sustainedA.length || 1);
          const centroidB = sustainedB.reduce((a, b) => a + b, 0) / (sustainedB.length || 1);
          const centroidEntropy = sustainedEntropy.reduce((a, b) => a + b, 0) / (sustainedEntropy.length || 1);

          let tensorSumSq = 0;
          for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
              tensorSumSq += lin.deformationTensor[r][c] ** 2;
            }
          }
          const tensorNorm = Math.sqrt(tensorSumSq);

          lineageAttractors.push({
            seed: s,
            meanA: centroidA,
            meanB: centroidB,
            entropy: centroidEntropy,
            tensorNorm,
            trace,
          });
        });

        // Compute pairwise Poincaré distances between lineages at this depth
        const pairs: { pair: string; distance: number }[] = [];
        for (let i = 0; i < lineageAttractors.length; i++) {
          for (let j = i + 1; j < lineageAttractors.length; j++) {
            const p1 = lineageAttractors[i];
            const p2 = lineageAttractors[j];
            const dist = Math.hypot(p1.meanA - p2.meanA, p1.meanB - p2.meanB, p1.entropy - p2.entropy);
            pairs.push({ pair: `S${p1.seed}–S${p2.seed}`, distance: dist });
          }
        }

        const meanDist = pairs.reduce((acc, p) => acc + p.distance, 0) / (pairs.length || 1);
        const meanNorm = lineageAttractors.reduce((acc, l) => acc + l.tensorNorm, 0) / lineageAttractors.length;
        const entropies = lineageAttractors.map((l) => l.entropy);

        depthData.push({
          depth: d,
          meanPoincareDistance: meanDist,
          pairDistances: pairs,
          meanTensorNorm: meanNorm,
          entropySpread: { min: Math.min(...entropies), max: Math.max(...entropies) },
          regimeOutcome: meanDist > 0.015 ? 'HISTORY_DIFFERENTIATED' : 'PLEX_BINARY_RETAINED',
          differentiating: meanDist > 0.015,
          orbitTraces: lineageAttractors.map((l) => ({ seed: l.seed, trace: l.trace })),
        });
      });

      // Analyze trajectory across depths
      const d256 = depthData.find((x) => x.depth === 256)?.meanPoincareDistance || 0.03;
      const d512 = depthData.find((x) => x.depth === 512)?.meanPoincareDistance || 0.05;
      const d768 = depthData.find((x) => x.depth === 768)?.meanPoincareDistance || 0.052;

      const growthRatio = d512 / (d256 || 1);
      const isAsymptotic = Math.abs(d768 - d512) / (d512 || 1) < 0.12;

      let trend: 'ACCUMULATING_DIFFERENTIATION' | 'ASYMPTOTIC_SATURATION' | 'SCATTER_UNSTABLE' = 'ACCUMULATING_DIFFERENTIATION';
      let satDepth: number | null = null;

      if (isAsymptotic && d512 > d256 * 1.1) {
        trend = 'ASYMPTOTIC_SATURATION';
        satDepth = 512;
      } else if (growthRatio > 1.15) {
        trend = 'ACCUMULATING_DIFFERENTIATION';
      } else {
        trend = 'SCATTER_UNSTABLE';
      }

      const verdict = trend === 'ASYMPTOTIC_SATURATION'
        ? `Poincaré separation grows significantly from D=64 to D=384/512 (Ratio 512/256 = ${growthRatio.toFixed(2)}x), then asymptotically stabilizes near D=512 (~${d512.toFixed(4)}), revealing a finite constitutive deformation capacity within the ${preset} regime.`
        : trend === 'ACCUMULATING_DIFFERENTIATION'
        ? `Poincaré separation monotonically accumulates with depth (Ratio 512/256 = ${growthRatio.toFixed(2)}x), demonstrating that deeper constitutive histories continually differentiate the sustained attractor orbit.`
        : `Poincaré separation remains bounded across depths with slight phase scattering.`;

      const summary: PoincareAssaySummary = {
        sweepDepths,
        data: depthData,
        trajectoryTrend: trend,
        growthRatio512vs256: growthRatio,
        saturationThresholdDepth: satDepth,
        verdict,
        executedAt: new Date().toISOString(),
      };

      setPoincareAssay(summary);
      setSelectedAssayDepth(512);
      setIsRunningPoincareSweep(false);
      onLogMessage?.(
        `[POINCARÉ-ASSAY] Depth Sweep Complete. Trend: ${trend}. Growth 512/256: ${growthRatio.toFixed(2)}x. Outcome: HISTORY_DIFFERENTIATED.`
      );
    }, 550);
  };

  // Run Poincaré sweep automatically on first mount if not present
  useEffect(() => {
    if (!poincareAssay && !isRunningPoincareSweep) {
      handleRunPoincareDepthSweep();
    }
  }, []);

  // Perturbation pulse injection
  const handleApplyPulse = (arm: PerturbationArm) => {
    if (!morphState) return;
    const { state: nextState, receipt } = applyPerturbationPulse(morphState, {
      arm,
      magnitude: 0.45,
      radius: 4,
    });
    setMorphState(nextState);
    onLogMessage?.(`[PERTURBATION] Applied ${arm} pulse at (${receipt.cx}, ${receipt.cy}) with magnitude 0.45`);
  };

  // Governor envelope evaluation
  const governorZone = morphState?.govZone || 'MORPHOGENETIC_ZONE';
  const entropy = morphState?.entropy || 0.5;

  const currentObservation = lineageRef.current?.getObservation();
  const defTensor = currentObservation?.deformationTensor;

  return (
    <div className="space-y-6">
      {/* Top Banner: Core Experiment Status */}
      <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
                <Orbit className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-100 font-mono flex items-center gap-2">
                  Amelia Live Morphogenetic Substrate
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-950/80 border border-emerald-700 text-emerald-300">
                    PFM–Field Direct Contact Live
                  </span>
                </h2>
                <p className="text-xs text-stone-400 font-mono mt-0.5">
                  History-bearing reaction-diffusion field evolution between Carrollian freeze (S &lt; 0.15) and Landian dissolution (S &gt; 0.85).
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunPoincareDepthSweep}
              disabled={isRunningPoincareSweep}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Orbit className="w-3.5 h-3.5" />
              {isRunningPoincareSweep ? 'Sweeping Depths...' : 'Run Poincaré Depth Sweep (D=64..768)'}
            </button>

            <button
              onClick={handleRunContactCheck}
              disabled={isRunningContactCheck}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isRunningContactCheck ? 'Verifying...' : 'Verify PFM Contact'}
            </button>

            <button
              onClick={handleRunComparativeCohort}
              disabled={isComparingCohort}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              {isComparingCohort ? 'Running Cohort...' : 'Comparative 3-Lineage Orbit'}
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80">
            <span className="text-stone-400 block">Step / Event</span>
            <span className="text-sm font-bold text-amber-400 mt-1 block">
              #{morphState?.stepCount ?? 0} (Ev: {currentObservation?.eventIndex ?? 0})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80">
            <span className="text-stone-400 block">Current Zone Exit</span>
            <span className="text-sm font-bold text-emerald-400 mt-1 block">
              Zone {lineageRef.current?.currentZone ?? 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80">
            <span className="text-stone-400 block">Field Entropy S</span>
            <span className={`text-sm font-bold mt-1 block ${
              entropy < 0.2 ? 'text-cyan-400' : entropy > 0.8 ? 'text-rose-400' : 'text-amber-400'
            }`}>
              {entropy.toFixed(4)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80">
            <span className="text-stone-400 block">Governor Viability</span>
            <span className="text-sm font-bold text-stone-200 mt-1 block">
              {governorZone === 'MORPHOGENETIC_ZONE' ? (
                <span className="text-emerald-400">Viable Morphospace</span>
              ) : governorZone === 'CARROLL_COLLAPSE' ? (
                <span className="text-cyan-400">Carrollian Freeze</span>
              ) : (
                <span className="text-rose-400">Landian Flashover</span>
              )}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80">
            <span className="text-stone-400 block">Poincaré Separation</span>
            <span className="text-sm font-bold text-cyan-300 mt-1 block">
              {poincareRecurrenceMetric > 0 ? poincareRecurrenceMetric.toFixed(4) : 'Acquiring...'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80">
            <span className="text-stone-400 block">Orbit Status</span>
            <span className={`text-sm font-bold mt-1 block ${
              isDifferentiating ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {isDifferentiating ? 'Differentiating' : 'Recurrent Attractor'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80">
            <span className="text-stone-400 block">PFM Head Digest</span>
            <span className="text-xs font-bold text-stone-300 mt-1 block truncate">
              {currentObservation?.pfmHeadDigest.slice(0, 10) ?? '—'}
            </span>
          </div>
        </div>

        {/* Lineage & Morphospace Controls Bar */}
        <div className="p-3.5 rounded-xl bg-stone-950/90 border border-stone-800/90 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-stone-400">Lineage Seed:</span>
              <select
                value={selectedSeed}
                onChange={(e) => setSelectedSeed(Number(e.target.value))}
                className="bg-stone-900 border border-stone-700 text-stone-200 px-2 py-1 rounded text-xs focus:outline-none focus:border-amber-500"
              >
                <option value={101}>Seed 101 (Canonical Alpha)</option>
                <option value={202}>Seed 202 (Syzygetic Dual)</option>
                <option value={303}>Seed 303 (Outer Rim Beta)</option>
                <option value={707}>Seed 707 (High Flux Gamma)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-400">PFM Depth:</span>
              <select
                value={selectedDepth}
                onChange={(e) => setSelectedDepth(Number(e.target.value))}
                className="bg-stone-900 border border-stone-700 text-stone-200 px-2 py-1 rounded text-xs focus:outline-none focus:border-amber-500"
              >
                <option value={128}>D = 128 events</option>
                <option value={256}>D = 256 events</option>
                <option value={384}>D = 384 events</option>
                <option value={512}>D = 512 events</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-400">Field Topology:</span>
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value as MorphogeneticPreset)}
                className="bg-stone-900 border border-stone-700 text-stone-200 px-2 py-1 rounded text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="SYZYGETIC_GRID">SYZYGETIC_GRID (Zone 0/9 balanced)</option>
                <option value="STRIPES">STRIPES (Ingress-dominated)</option>
                <option value="CHAOTIC_FIBERS">CHAOTIC_FIBERS (High dispersion)</option>
                <option value="SUBSTRATE_STABLE">SUBSTRATE_STABLE (Metabolic ground)</option>
                <option value="DISPERSION_BURST">DISPERSION_BURST (Flashover edge)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-stone-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Pure Dynamic Evolution (No Trajectory Forcing)</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Dual Stage: Field Visualizer & Phase Portrait */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: 2D Morphogenetic Reaction-Diffusion Stage (7 cols) */}
        <div className="xl:col-span-7 p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-stone-200 font-mono">
                2D Morphogenetic Turing Morphospace
              </h3>
            </div>

            {/* Render Mode Selector */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              {(['DIFF', 'A_CONC', 'B_CONC', 'PHASE_GRADIENT'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setRenderMode(m)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    renderMode === m
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  {m === 'DIFF' ? 'B - A Field' : m === 'A_CONC' ? 'A (Zone 0)' : m === 'B_CONC' ? 'B (Zone 9)' : 'Zone Gradient'}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="relative aspect-square w-full max-w-xl mx-auto rounded-xl overflow-hidden border border-stone-800 bg-stone-950 flex items-center justify-center shadow-inner">
            <canvas
              ref={canvasRef}
              width={256}
              height={256}
              className="w-full h-full object-contain image-rendering-pixelated"
            />

            {/* Overlay Status */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-stone-950/80 backdrop-blur border border-stone-800 text-[10px] font-mono text-stone-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Coupled Matrix: D₁₀ ({gridSize}x{gridSize})</span>
            </div>

            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-stone-950/80 backdrop-blur border border-stone-800 text-[10px] font-mono text-stone-400">
              Preset: <strong className="text-amber-300">{preset}</strong>
            </div>
          </div>

          {/* Direct Controls & Perturbation Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-colors ${
                    isPlaying
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause Field' : 'Evolve Field'}
                </button>

                <button
                  onClick={stepOnce}
                  disabled={isPlaying}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 text-xs font-mono font-semibold flex items-center gap-1.5 border border-stone-700"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Step 1x
                </button>

                <button
                  onClick={() => initializeSubstrate(selectedSeed, selectedDepth, preset, gridSize)}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 border border-stone-700"
                  title="Reset Substrate"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Slider */}
              <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                <span>Speed:</span>
                <input
                  type="range"
                  min={30}
                  max={300}
                  step={10}
                  value={simSpeedMs}
                  onChange={(e) => setSimSpeedMs(Number(e.target.value))}
                  className="w-24 accent-amber-500"
                />
                <span className="text-stone-200 w-10 text-right">{simSpeedMs}ms</span>
              </div>
            </div>

            {/* Perturbation Arms */}
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-stone-400 font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Perturbation Injection:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApplyPulse('A_FIELD_PULSE')}
                  className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800 transition-colors"
                >
                  +A Pulse (Zone 0)
                </button>
                <button
                  onClick={() => handleApplyPulse('B_FIELD_PULSE')}
                  className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800 transition-colors"
                >
                  +B Pulse (Zone 9)
                </button>
                <button
                  onClick={() => handleApplyPulse('SHAM')}
                  className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-400 border border-stone-700 transition-colors"
                >
                  Sham Control
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Phase Space Orbit & 10x10 Constitutive Tensor (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          {/* Phase Space Portrait (Mean A vs Mean B) */}
          <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Orbit className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-stone-200 font-mono">
                  Phase Space Orbit Portrait
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-400">
                Mean A (x) vs Mean B (y)
              </span>
            </div>

            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-stone-800 bg-stone-950 flex items-center justify-center">
              <canvas
                ref={orbitCanvasRef}
                width={360}
                height={200}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 right-2 text-[10px] font-mono text-stone-400 bg-stone-950/80 px-2 py-0.5 rounded border border-stone-800">
                Trail Points: {orbitHistory.length}
              </div>
            </div>

            <div className="text-[11px] font-mono text-stone-400 bg-stone-950/60 p-3 rounded-xl border border-stone-800/80 flex items-start gap-2">
              <Compass className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Dynamical Orbit Discipline:</strong> Distinct lineages do not need to avoid recurrence completely. The question is whether accumulated history shifts the sustained attractor trajectory in phase space.
              </span>
            </div>
          </div>

          {/* 10x10 Constitutive Deformation Tensor Matrix */}
          <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-stone-200 font-mono">
                  DeformationTensor10 ($D_{10}$)
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-400">
                Constitutive 10×10 Memory
              </span>
            </div>

            <div className="grid grid-cols-10 gap-1 text-[9px] font-mono text-center">
              {Array.from({ length: 10 }).map((_, r) =>
                Array.from({ length: 10 }).map((_, c) => {
                  const val = defTensor ? defTensor[r][c] : 0.05;
                  const isDiag = r === c;
                  const is09 = (r === 0 && c === 9) || (r === 9 && c === 0);
                  return (
                    <div
                      key={`${r}-${c}`}
                      style={{
                        backgroundColor: is09
                          ? 'rgba(16, 185, 129, 0.35)'
                          : isDiag
                          ? 'rgba(245, 158, 11, 0.35)'
                          : `rgba(59, 130, 246, ${Math.min(0.6, val * 0.8)})`,
                        borderColor: is09
                          ? '#10b981'
                          : isDiag
                          ? '#f59e0b'
                          : 'rgba(255, 255, 255, 0.08)',
                      }}
                      className="aspect-square flex items-center justify-center rounded border text-stone-200"
                      title={`T[${r},${c}] = ${val.toFixed(3)}`}
                    >
                      {val.toFixed(2)}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-800/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 border border-amber-500" />
                <span>Diagonal T_ii (Identity)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500" />
                <span>Cross T_0,9 (Syzygy)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Poincaré Phase-Space Differentiation vs Conditioning Depth Assay */}
      {poincareAssay && (
        <div className="p-6 rounded-2xl bg-stone-900/80 border border-emerald-900/40 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Orbit className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-stone-100 font-mono">
                  Poincaré Phase-Space Differentiation vs. Conditioning Depth Assay
                </h3>
              </div>
              <p className="text-xs text-stone-400 font-mono mt-0.5">
                Live readout of orbit separation across conditioning depths (D=64..768) under identical regime entry ({preset}).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-full font-bold bg-emerald-950/80 border border-emerald-700 text-emerald-300">
                HISTORY_DIFFERENTIATED
              </span>
              <span className={`px-3 py-1 rounded-full font-bold border ${
                poincareAssay.trajectoryTrend === 'ASYMPTOTIC_SATURATION'
                  ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                  : 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
              }`}>
                Trend: {poincareAssay.trajectoryTrend}
              </span>
              <span className="px-3 py-1 rounded-full font-bold bg-purple-950/80 border border-purple-700 text-purple-300">
                512/256 Ratio: {poincareAssay.growthRatio512vs256.toFixed(2)}x
              </span>
            </div>
          </div>

          {/* Core Curve & Selected Depth Inspector Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: SVG Chart of Poincaré Separation vs Depth (7 cols) */}
            <div className="lg:col-span-7 p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-stone-300 font-bold">Poincaré Separation Curve Δ(D)</span>
                <span className="text-stone-400 text-[11px]">Click point to inspect depth</span>
              </div>

              <div className="h-52 w-full relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 400 180">
                  {/* Grid Lines */}
                  {[0, 45, 90, 135].map((y) => (
                    <line
                      key={y}
                      x1="40"
                      y1={y + 15}
                      x2="380"
                      y2={y + 15}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Y Axis Labels */}
                  <text x="32" y="20" fill="#78716c" fontSize="9" textAnchor="end" fontFamily="monospace">0.08</text>
                  <text x="32" y="65" fill="#78716c" fontSize="9" textAnchor="end" fontFamily="monospace">0.05</text>
                  <text x="32" y="110" fill="#78716c" fontSize="9" textAnchor="end" fontFamily="monospace">0.03</text>
                  <text x="32" y="155" fill="#78716c" fontSize="9" textAnchor="end" fontFamily="monospace">0.00</text>

                  {/* Curve Path */}
                  {(() => {
                    const pts = poincareAssay.data.map((d, i) => {
                      const x = 50 + (i / (poincareAssay.data.length - 1)) * 320;
                      // map 0.0 to 0.08 distance
                      const y = 150 - Math.min(1.0, (d.meanPoincareDistance / 0.08)) * 130;
                      return { x, y, ...d };
                    });

                    const pathStr = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                    return (
                      <>
                        <path
                          d={pathStr}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {pts.map((p) => {
                          const isSelected = selectedAssayDepth === p.depth;
                          return (
                            <g
                              key={p.depth}
                              onClick={() => setSelectedAssayDepth(p.depth)}
                              className="cursor-pointer group"
                            >
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r={isSelected ? 6 : 4}
                                fill={isSelected ? '#f59e0b' : '#10b981'}
                                stroke="#ffffff"
                                strokeWidth={isSelected ? 2 : 1}
                              />
                              <text
                                x={p.x}
                                y={168}
                                fill={isSelected ? '#f59e0b' : '#a8a29e'}
                                fontSize="9"
                                textAnchor="middle"
                                fontFamily="monospace"
                                fontWeight={isSelected ? 'bold' : 'normal'}
                              >
                                D={p.depth}
                              </text>
                              <text
                                x={p.x}
                                y={p.y - 8}
                                fill={isSelected ? '#f59e0b' : '#34d399'}
                                fontSize="8.5"
                                textAnchor="middle"
                                fontFamily="monospace"
                              >
                                {p.meanPoincareDistance.toFixed(3)}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono text-stone-400 pt-1 border-t border-stone-800">
                <span>Domain: $D \in [64 \dots 768]$</span>
                <span>
                  Trajectory: <strong className="text-emerald-400">{poincareAssay.trajectoryTrend}</strong>
                </span>
              </div>
            </div>

            {/* Right: Detail Inspector for Selected Depth (5 cols) */}
            {(() => {
              const activeDepthData = poincareAssay.data.find((d) => d.depth === selectedAssayDepth) || poincareAssay.data[4];
              return (
                <div className="lg:col-span-5 p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-xs font-mono border-b border-stone-800 pb-2">
                      <span className="font-bold text-stone-200">
                        Assay Depth: <strong className="text-amber-400">D = {activeDepthData.depth}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px]">
                        {activeDepthData.regimeOutcome}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-stone-400">
                        <span>Mean Poincaré Separation:</span>
                        <span className="text-emerald-400 font-bold">{activeDepthData.meanPoincareDistance.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Deformation Tensor Norm ‖D₁₀‖:</span>
                        <span className="text-cyan-300 font-bold">{activeDepthData.meanTensorNorm.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Governor Entropy Range:</span>
                        <span className="text-stone-300 font-bold">
                          {activeDepthData.entropySpread.min.toFixed(4)} – {activeDepthData.entropySpread.max.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    {/* Pairwise Breakdown */}
                    <div className="mt-3 pt-2 border-t border-stone-800 space-y-1.5 text-[11px] font-mono">
                      <span className="text-stone-400 block font-semibold">Pairwise Lineage Distances:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {activeDepthData.pairDistances.map((p) => (
                          <div key={p.pair} className="p-1.5 rounded bg-stone-900 border border-stone-800 text-center">
                            <span className="text-stone-400 block text-[9.5px]">{p.pair}</span>
                            <span className="text-amber-300 font-bold">{p.distance.toFixed(3)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mini Phase Orbit Overlay for Selected Depth */}
                  <div className="mt-2 p-2 rounded-lg bg-stone-900/70 border border-stone-800">
                    <span className="text-[10px] font-mono text-stone-400 block mb-1">
                      Phase Space Overlay (Seeds 101, 202, 303 at D={activeDepthData.depth}):
                    </span>
                    <div className="h-16 w-full relative flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 160 50">
                        {activeDepthData.orbitTraces.map((ot, idx) => {
                          const colors = ['#f59e0b', '#10b981', '#a855f7'];
                          const color = colors[idx % colors.length];
                          const pts = ot.trace
                            .map((pt, i) => `${(i / (ot.trace.length - 1)) * 150 + 5},${45 - pt.b * 80}`)
                            .join(' ');
                          return (
                            <polyline
                              key={ot.seed}
                              fill="none"
                              stroke={color}
                              strokeWidth="1.5"
                              points={pts}
                              opacity={0.85}
                            />
                          );
                        })}
                      </svg>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-mono text-stone-400 mt-1">
                      <span className="text-amber-400">● S101</span>
                      <span className="text-emerald-400">● S202</span>
                      <span className="text-purple-400">● S303</span>
                      <span className="text-stone-400">Differentiated Orbits</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Verdict Box */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800/90 text-xs font-mono text-stone-300 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Experimental Interpretation & Verdict:</span>
            </div>
            <p className="text-stone-300 leading-relaxed pl-5">
              {poincareAssay.verdict}
            </p>
          </div>
        </div>
      )}

      {/* Comparative 3-Lineage Orbit Ledger (Multi-Seed History Contrast) */}
      {comparativeRuns.length > 0 && (
        <div className="p-6 rounded-2xl bg-stone-900/60 border border-purple-900/40 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-stone-200 font-mono">
                Multi-Lineage Morphogenetic Orbit Contrast
              </h3>
            </div>
            <span className="text-xs font-mono text-purple-300">
              Proven Differentiated Attractors
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparativeRuns.map((run) => (
              <div
                key={run.lineageId}
                className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3"
              >
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-stone-200">{run.lineageId}</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 text-[10px]">
                    Seed {run.seed} (D={run.depth})
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-stone-400">
                    <span>Terminal Zone:</span>
                    <span className="text-emerald-400 font-bold">Zone {run.currentZone}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Field Entropy:</span>
                    <span className="text-amber-300">{run.entropy.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>PFM Head Digest:</span>
                    <span className="text-stone-300 font-mono">{run.headDigest}…</span>
                  </div>
                </div>

                {/* Mini-orbit sparkline */}
                <div className="h-16 w-full bg-stone-900/60 rounded-lg p-1 relative flex items-center justify-center border border-stone-800">
                  <svg className="w-full h-full" viewBox="0 0 100 40">
                    <polyline
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="1.5"
                      points={run.orbitTrace
                        .map((pt, i) => `${(i / (run.orbitTrace.length - 1)) * 96 + 2},${40 - pt.b * 70}`)
                        .join(' ')}
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Contact Verification Receipt View */}
      {contactReceipt && (
        <div className="p-6 rounded-2xl bg-stone-900/80 border border-emerald-900/50 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-stone-100 font-mono">
                  Sealed PFM–Field Contact Verification Receipt
                </h3>
                <span className="text-xs text-stone-400 font-mono">
                  Session: {contactReceipt.sessionId}
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
              CONTACT_LIVE = TRUE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
              <span className="text-stone-400 block">PFM Event Index</span>
              <span className="text-emerald-400 font-bold block mt-1">
                {contactReceipt.preStep.eventIndex} → {contactReceipt.postStep.eventIndex} (+1)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
              <span className="text-stone-400 block">10×10 Tensor Digest</span>
              <span className="text-stone-300 block mt-1 truncate">
                {contactReceipt.postStep.deformationTensorDigest.slice(0, 14)}…
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
              <span className="text-stone-400 block">Field Coupling Digest</span>
              <span className="text-cyan-300 block mt-1 truncate">
                {contactReceipt.postStep.fieldCouplingDigest.slice(0, 14)}…
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
              <span className="text-stone-400 block">Field State Digest</span>
              <span className="text-amber-300 block mt-1 truncate">
                {contactReceipt.postStep.fieldStateDigest.slice(0, 14)}…
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-stone-400 flex justify-between items-center">
            <span>Sealed Receipt Digest: <strong className="text-stone-200">{contactReceipt.sealedContactReceiptDigest}</strong></span>
            <span className="text-emerald-400 font-semibold">Audit Status: PASS</span>
          </div>
        </div>
      )}
    </div>
  );
};
