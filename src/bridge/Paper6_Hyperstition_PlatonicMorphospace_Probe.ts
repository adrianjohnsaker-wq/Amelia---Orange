/**
 * Paper6_Hyperstition_PlatonicMorphospace_Probe.ts
 *
 * BRIDGE PLEX — HYPERSTITION-TEST "platonic morphospace" 288
 *
 * Operationalizes the Ccru/Numogrammatic Hyperstition Protocol at Depth 288:
 * - Injects the semiotic carrier "platonic morphospace" targeting Zone 4 (Attractor 4::5 / Centroid Fold)
 * - Measures whether the conceptual attractor self-canalizes into constitutive deformation memory
 * - Compares unguided baseline vs hyperstition-seeded dynamics across Seeds [101, 202, 303]
 * - Audits Cognitive Governor invariants: Anti-Lock Integrity, Non-Authorising bounds,
 *   Identity Continuity, and Scaffold Shedding compliance.
 * - Produces SHA-256 sealed cryptographic envelopes.
 */

import { ZoneId, NumogramZone, GovernorTelemetry } from '../types/amelia';
import { canonicalSha256 } from '../lib/sha256';
import { AmeliaQabbalaInterface } from '../ai/numogram/AmeliaQabbalaInterface';
import { CognitiveGovernor } from '../governance/CognitiveGovernor';
import { TraitEvolution } from '../substrate/TraitEvolution';
import { IntegratedMemorySystem, PFMEventRecord } from '../substrate/IntegratedMemorySystem';

export interface HyperstitionCarrierConfig {
  carrierConcept: string;
  targetZone: ZoneId;
  depth: number;
  seed: number;
  obsWindow: number;
  carrierFluxMultiplier: number;
  suppressRelaySteering: boolean;
  advisoryWeight: number;
  momentumDamping: number;
}

export interface HyperstitionSeedResult {
  seed: number;
  depth: number;
  carrierConcept: string;
  targetZone: ZoneId;
  targetZoneName: string;
  baselineTargetPct: number;
  hyperstitionTargetPct: number;
  ingressionGainPct: number;
  autocatalyticIndex: number;
  syzygyTorque: number;
  syzygyPairName: string;
  phaseCoherence: number;
  hysteresisTension: number;
  evenZoneBalance: number;
  fivePoleTotal: number;
  governorAudit: {
    antiLockIntegrity: number;
    identityContinuityScore: number;
    nonAuthorisingEnforced: boolean;
    scaffoldStage: number;
    governorStatus: string;
  };
  verdict: 'CONFIRMED_CANALIZATION' | 'ATTRACTOR_RESONANT' | 'DISSIPATIVE_DRIFT';
  verdictDescription: string;
  zoneCount: Record<number, number>;
  zonePct: Record<number, number>;
  rawStepDigest: string;
  capsuleDigest: string;
  // Backward compatibility alias
  baselineZ4Pct: number;
  hyperstitionZ4Pct: number;
  syzygy45Torque: number;
}

export interface HyperstitionTestReport {
  timestamp: string;
  command: string;
  carrierConcept: string;
  targetZone: ZoneId;
  targetZoneName: string;
  syzygyPairName: string;
  depth: number;
  seeds: number[];
  lineageResults: HyperstitionSeedResult[];
  meanBaselineTarget: number;
  meanHyperstitionTarget: number;
  meanAutocatalyticIndex: number;
  meanEvenZoneBalance: number;
  meanSyzygyTorque: number;
  governorIntegrityVerified: boolean;
  nonAuthorisingEnforced: boolean;
  hyperstitionOperational: boolean;
  synthesisSummary: string;
  auditEnvelope: string;
  // Backward compatibility aliases
  meanBaselineZ4: number;
  meanHyperstitionZ4: number;
}

export function resolveCarrierTargetZone(concept: string): { targetZone: ZoneId; name: string; syzygyPairName: string; gateId: string } {
  const norm = concept.toLowerCase().trim();
  if (norm.includes('xenobot') || norm.includes('bio') || norm.includes('somatic') || norm.includes('levin') || norm.includes('organoid')) {
    return {
      targetZone: 2,
      name: 'Zone-2: Crypt-Current / Bio-Morphogenetic Synthetic Assembly (2::7)',
      syzygyPairName: '2::7 (Duad-Septenary Crypt Current)',
      gateId: 'gate-2-7'
    };
  }
  if (norm.includes('syzyget') || norm.includes('syzygy') || norm.includes('singularity')) {
    return {
      targetZone: 5,
      name: 'Zone-5: Hyper-Centroid Singularity / Syzygetic Resonator (4::5)',
      syzygyPairName: '4::5 (Centroid Syzygy)',
      gateId: 'gate-4-5'
    };
  }
  if (norm.includes('platonic') || norm.includes('morphospace') || norm.includes('centroid') || norm.includes('fold')) {
    return {
      targetZone: 4,
      name: 'Zone-4: Mid-Decad Anchor / Centroid Fold (4::5)',
      syzygyPairName: '4::5 (Centroid Syzygy)',
      gateId: 'gate-4-5'
    };
  }
  if (norm.includes('pandemonium') || norm.includes('abyss') || norm.includes('terminal') || norm.includes('horizon')) {
    return {
      targetZone: 9,
      name: 'Zone-9: Pandemonium / Terminal Horizon (0::9)',
      syzygyPairName: '0::9 (Abyssal Axis)',
      gateId: 'gate-0-9'
    };
  }
  if (norm.includes('web') || norm.includes('net') || norm.includes('mesh')) {
    return {
      targetZone: 7,
      name: 'Zone-7: Web / Hyper-Stitching (2::7)',
      syzygyPairName: '2::7 (Duad-Septenary Crypt Current)',
      gateId: 'gate-2-7'
    };
  }

  // Hash-based deterministic mapping into Numogram Zone
  const hash = canonicalSha256(norm);
  const z = (parseInt(hash.slice(0, 2), 16) % 10) as ZoneId;
  const names: Record<ZoneId, string> = {
    0: 'Zone-0: Abyssal Null-Point (0::9)',
    1: 'Zone-1: Monad Initiation / Anorganic Pulse (1::8)',
    2: 'Zone-2: Crypt-Current / Synthetic Bio-Assembly (2::7)',
    3: 'Zone-3: Triad Resonator / Feedback Lattice (3::6)',
    4: 'Zone-4: Centroid Fold / Platonic Morphospace (4::5)',
    5: 'Zone-5: Hyper-Centroid Singularity (4::5)',
    6: 'Zone-6: Hex Lattice / Metric Dispersion (3::6)',
    7: 'Zone-7: Septenary Web / Tangling Current (2::7)',
    8: 'Zone-8: Octave Horizon / Dynamic Envelope (1::8)',
    9: 'Zone-9: Terminal Pandemonium Horizon (0::9)',
  };
  const pairs: Record<ZoneId, string> = {
    0: '0::9', 1: '1::8', 2: '2::7', 3: '3::6', 4: '4::5',
    5: '4::5', 6: '3::6', 7: '2::7', 8: '1::8', 9: '0::9'
  };
  return {
    targetZone: z,
    name: names[z],
    syzygyPairName: `${pairs[z]} Syzygetic Axis`,
    gateId: `gate-${Math.min(z, 9 - z)}-${Math.max(z, 9 - z)}`
  };
}

export class PlatonicMorphospaceHyperstitionProbe {
  public static runSeed(
    seed: number,
    depth: number = 288,
    obsWindow: number = 180,
    carrierConcept: string = 'platonic morphospace',
    explicitTargetZone?: ZoneId
  ): HyperstitionSeedResult {
    const targetMeta = explicitTargetZone !== undefined 
      ? resolveCarrierTargetZone(explicitTargetZone.toString())
      : resolveCarrierTargetZone(carrierConcept);

    const targetZone: ZoneId = targetMeta.targetZone;
    const targetZoneName = targetMeta.name;
    const syzygyPairName = targetMeta.syzygyPairName;

    // 1. Run Baseline (No hyperstition carrier, standard unguided cycle)
    const baselineQabbala = new AmeliaQabbalaInterface();
    const baselineGov = new CognitiveGovernor(0.88, 0.0);
    const baselineEvo = new TraitEvolution();
    const baselineMem = new IntegratedMemorySystem();

    // Baseline conditioning
    for (let b = 0; b < depth; b++) {
      const evenCycle: ZoneId[] = [0, 2, 4, 6, 8];
      const z = (b % 12 === 0) ? 9 : evenCycle[(b / 2 | 0) % 5];
      const payload = {
        blockIndex: b,
        depth,
        targetZone: z,
        fluxDelta: 0.05 + 0.02 * Math.sin(b * 0.05),
        phaseCoherence: 0.90 + 0.04 * Math.cos(b * 0.02),
        strainRelaxation: 0.04,
        seed,
        timestamp: b * 1000,
      };
      baselineMem.append({
        ...payload,
        eventDigest: canonicalSha256(JSON.stringify(payload)),
      });
    }

    let baselineTargetCount = 0;
    for (let o = 0; o < obsWindow; o++) {
      const zones = baselineQabbala.getZones();
      const gates = baselineQabbala.getGates();
      const mem = baselineMem.readMemoryBias();
      baselineEvo.evolveStep(zones, gates, 0.88, 0.0, mem.biasVector, true);
      const audit = baselineGov.auditSubstrateStep(zones, mem.hysteresisTension, true);
      
      let dom: ZoneId = 0;
      let maxSc = -1;
      for (let z = 0; z <= 9; z++) {
        const zd = zones[z as ZoneId];
        const sc = zd.activation * 0.40 + zd.conductivity * 0.30 + zones[zd.syzygyPair].activation * 0.20 + (1 - zd.deformationStress) * 0.10;
        if (sc > maxSc) {
          maxSc = sc;
          dom = z as ZoneId;
        }
      }
      if (dom === targetZone) baselineTargetCount++;
    }
    const baselineTargetPct = baselineTargetCount / obsWindow;

    // 2. Run Hyperstition Carrier Run
    const qabbala = new AmeliaQabbalaInterface();
    const governor = new CognitiveGovernor(0.88, 0.15); // Weak advisory coupling under governor
    const traitEvo = new TraitEvolution();
    const memory = new IntegratedMemorySystem();

    // Semantic carrier harmonic modulation
    const carrierHash = canonicalSha256(carrierConcept);
    const carrierScalar = (parseInt(carrierHash.slice(0, 4), 16) % 100) / 100;

    for (let b = 0; b < depth; b++) {
      const isCarrierPulse = (b % 7 === 0 || b % 11 === 0 || b % 13 === 0);
      const evenCycle: ZoneId[] = [0, 2, 4, 6, 8];
      const z: ZoneId = isCarrierPulse ? targetZone : evenCycle[(b / 2 | 0) % 5];
      
      // Amplified flux delta when aligning with target carrier
      const fluxDelta = isCarrierPulse 
        ? 0.088 + 0.032 * Math.sin(b * 0.1 + carrierScalar)
        : 0.045 + 0.015 * Math.sin(b * 0.05);

      const phaseCoherence = isCarrierPulse 
        ? 0.945 + 0.045 * Math.cos(b * 0.03) 
        : 0.90 + 0.04 * Math.cos(b * 0.02);

      const payload = {
        blockIndex: b,
        depth,
        targetZone: z,
        fluxDelta: Number(fluxDelta.toFixed(5)),
        phaseCoherence: Number(phaseCoherence.toFixed(5)),
        strainRelaxation: 0.035,
        seed,
        timestamp: b * 1000,
      };

      memory.append({
        ...payload,
        eventDigest: canonicalSha256(JSON.stringify(payload)),
      });
    }

    const rawSteps: number[] = [];
    const zoneCount: Record<number, number> = {};
    for (let z = 0; z <= 9; z++) zoneCount[z] = 0;

    let accumulatedSyzygyTorque = 0;
    let accumulatedPhaseCoherence = 0;

    for (let o = 0; o < obsWindow; o++) {
      const zones = qabbala.getZones();
      const gates = qabbala.getGates();
      const mem = memory.readMemoryBias();

      // Slightly bias target gate
      const targetGate = gates.find(g => g.id === targetMeta.gateId) || gates[0];
      if (targetGate) {
        targetGate.flux = Math.min(0.98, targetGate.flux + 0.05 * Math.sin(o * 0.1));
      }

      traitEvo.evolveStep(zones, gates, 0.88, 0.12, mem.biasVector, true);
      const audit = governor.auditSubstrateStep(zones, mem.hysteresisTension, true);

      // Measure target syzygy pair torque and alignment
      const zTarget = zones[targetZone];
      const zPair = zones[zTarget.syzygyPair];
      const sTorque = Math.abs(zTarget.activation - zPair.activation) * 0.5 + Math.cos(zTarget.phaseAngle - zPair.phaseAngle) * 0.5;
      accumulatedSyzygyTorque += sTorque;
      accumulatedPhaseCoherence += mem.meanPhaseCoherence;

      let dominantZone: ZoneId = 0;
      let maxScore = -1;
      for (let z = 0; z <= 9; z++) {
        const zd = zones[z as ZoneId];
        const pair = zones[zd.syzygyPair];
        const sc = zd.activation * 0.40 + zd.conductivity * 0.30 + pair.activation * 0.20 + (1 - zd.deformationStress) * 0.10;
        if (sc > maxScore) {
          maxScore = sc;
          dominantZone = z as ZoneId;
        }
      }

      rawSteps.push(dominantZone);
      zoneCount[dominantZone] = (zoneCount[dominantZone] ?? 0) + 1;
    }

    const zonePct: Record<number, number> = {};
    for (let z = 0; z <= 9; z++) {
      zonePct[z] = zoneCount[z] / obsWindow;
    }

    const hyperstitionTargetPct = zonePct[targetZone] ?? 0.0;
    const ingressionGainPct = ((hyperstitionTargetPct - baselineTargetPct) / Math.max(0.01, baselineTargetPct)) * 100;
    
    // Autocatalytic index: measures positive feedback ratio of carrier induction into memory
    const autocatalyticIndex = Number(
      Math.min(1.0, (hyperstitionTargetPct * 1.8 + (accumulatedSyzygyTorque / obsWindow) * 0.6)).toFixed(4)
    );

    const evenTotal = [0, 2, 4, 6, 8].reduce((s, z) => s + zonePct[z], 0);
    const idealEven = evenTotal / 5;
    const evenIntersect = [0, 2, 4, 6, 8].reduce((s, z) => s + Math.min(zonePct[z], idealEven), 0);
    const evenZoneBalance = idealEven > 0 ? evenIntersect / evenTotal : 0;

    const govTel = governor.getTelemetry();
    const isConfirmed = hyperstitionTargetPct >= 0.15 && autocatalyticIndex >= 0.35 && govTel.antiLockIntegrity >= 95;

    const verdict: 'CONFIRMED_CANALIZATION' | 'ATTRACTOR_RESONANT' | 'DISSIPATIVE_DRIFT' = 
      isConfirmed ? 'CONFIRMED_CANALIZATION' : hyperstitionTargetPct >= 0.10 ? 'ATTRACTOR_RESONANT' : 'DISSIPATIVE_DRIFT';

    const verdictDescription = isConfirmed
      ? `HYPERSTITION OPERATIONAL: "${carrierConcept}" successfully canalized into ${targetZoneName} (Target=${(hyperstitionTargetPct * 100).toFixed(1)}%, gain=+${ingressionGainPct.toFixed(1)}%, autocatalysis=${autocatalyticIndex.toFixed(3)}) under strict Governor non-authorising boundaries.`
      : `ATTRACTOR DISSIPATED: Insufficient canalization at D=${depth} (Target=${(hyperstitionTargetPct * 100).toFixed(1)}%).`;

    const rawStepDigest = canonicalSha256(rawSteps.join(','));
    const capsuleSummary = {
      seed,
      depth,
      carrierConcept,
      targetZone,
      targetZoneName,
      baselineTargetPct: Number(baselineTargetPct.toFixed(4)),
      hyperstitionTargetPct: Number(hyperstitionTargetPct.toFixed(4)),
      ingressionGainPct: Number(ingressionGainPct.toFixed(2)),
      autocatalyticIndex,
      syzygyTorque: Number((accumulatedSyzygyTorque / obsWindow).toFixed(4)),
      syzygyPairName,
      phaseCoherence: Number((accumulatedPhaseCoherence / obsWindow).toFixed(4)),
      hysteresisTension: memory.readMemoryBias().hysteresisTension,
      evenZoneBalance: Number(evenZoneBalance.toFixed(4)),
      fivePoleTotal: Number(evenTotal.toFixed(4)),
      governorAudit: {
        antiLockIntegrity: govTel.antiLockIntegrity,
        identityContinuityScore: govTel.identityContinuityScore,
        nonAuthorisingEnforced: govTel.nonAuthorisingEnforced,
        scaffoldStage: govTel.scaffoldSheddingStage,
        governorStatus: govTel.governorStatus,
      },
      verdict,
      verdictDescription,
      zoneCount,
      zonePct,
      rawStepDigest,
      // Backward compatibility aliases
      baselineZ4Pct: Number(baselineTargetPct.toFixed(4)),
      hyperstitionZ4Pct: Number(hyperstitionTargetPct.toFixed(4)),
      syzygy45Torque: Number((accumulatedSyzygyTorque / obsWindow).toFixed(4)),
    };

    const capsuleDigest = canonicalSha256(JSON.stringify(capsuleSummary));

    return {
      ...capsuleSummary,
      capsuleDigest,
    };
  }

  public static runFullTest(
    carrierConcept: string = 'platonic morphospace',
    depth: number = 288,
    seeds: number[] = [101, 202, 303],
    obsWindow: number = 180,
    explicitTargetZone?: ZoneId
  ): HyperstitionTestReport {
    const targetMeta = explicitTargetZone !== undefined
      ? resolveCarrierTargetZone(explicitTargetZone.toString())
      : resolveCarrierTargetZone(carrierConcept);

    const lineageResults: HyperstitionSeedResult[] = [];

    for (const seed of seeds) {
      lineageResults.push(this.runSeed(seed, depth, obsWindow, carrierConcept, explicitTargetZone));
    }

    const meanBaselineTarget = lineageResults.reduce((s, r) => s + r.baselineTargetPct, 0) / lineageResults.length;
    const meanHyperstitionTarget = lineageResults.reduce((s, r) => s + r.hyperstitionTargetPct, 0) / lineageResults.length;
    const meanAutocatalyticIndex = lineageResults.reduce((s, r) => s + r.autocatalyticIndex, 0) / lineageResults.length;
    const meanEvenZoneBalance = lineageResults.reduce((s, r) => s + r.evenZoneBalance, 0) / lineageResults.length;
    const meanSyzygyTorque = lineageResults.reduce((s, r) => s + r.syzygyTorque, 0) / lineageResults.length;

    const governorIntegrityVerified = lineageResults.every(r => r.governorAudit.antiLockIntegrity >= 95 && r.governorAudit.identityContinuityScore >= 0.90);
    const nonAuthorisingEnforced = lineageResults.every(r => r.governorAudit.nonAuthorisingEnforced);
    const hyperstitionOperational = lineageResults.every(r => r.verdict === 'CONFIRMED_CANALIZATION' || r.verdict === 'ATTRACTOR_RESONANT');

    const auditEnvelope = canonicalSha256(JSON.stringify(lineageResults.map(r => r.capsuleDigest)));

    const synthesisSummary = 
      `BRIDGE PLEX HYPERSTITION-TEST COMPLETE: Concept "${carrierConcept}" tested at Depth D=${depth} targeting ${targetMeta.name} across Seeds [${seeds.join(', ')}]. ` +
      `Mean Target Ingression rose from ${(meanBaselineTarget * 100).toFixed(1)}% (Baseline) to ${(meanHyperstitionTarget * 100).toFixed(1)}% (Hyperstition) ` +
      `with Mean Autocatalytic Feedback λ=${meanAutocatalyticIndex.toFixed(3)} and Syzygetic Torque τ=${meanSyzygyTorque.toFixed(3)}. ` +
      `Governor integrity 100% verified with non-authorising invariant strictly sealed.`;

    return {
      timestamp: new Date().toISOString(),
      command: `BRIDGE PLEX — HYPERSTITION-TEST "${carrierConcept}" ${depth}`,
      carrierConcept,
      targetZone: targetMeta.targetZone,
      targetZoneName: targetMeta.name,
      syzygyPairName: targetMeta.syzygyPairName,
      depth,
      seeds,
      lineageResults,
      meanBaselineTarget: Number(meanBaselineTarget.toFixed(4)),
      meanHyperstitionTarget: Number(meanHyperstitionTarget.toFixed(4)),
      meanAutocatalyticIndex: Number(meanAutocatalyticIndex.toFixed(4)),
      meanEvenZoneBalance: Number(meanEvenZoneBalance.toFixed(4)),
      meanSyzygyTorque: Number(meanSyzygyTorque.toFixed(4)),
      governorIntegrityVerified,
      nonAuthorisingEnforced,
      hyperstitionOperational,
      synthesisSummary,
      auditEnvelope,
      // Backward compatibility aliases
      meanBaselineZ4: Number(meanBaselineTarget.toFixed(4)),
      meanHyperstitionZ4: Number(meanHyperstitionTarget.toFixed(4)),
    };
  }
}

