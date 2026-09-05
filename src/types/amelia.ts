export type ZoneId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type NumogramCurrent = 'Barker' | 'Lemur' | 'Plex' | 'Abyss' | 'Pandemonium' | 'Hyperborean';

export interface NumogramZone {
  id: ZoneId;
  name: string;
  syzygyPair: ZoneId;
  current: NumogramCurrent;
  activation: number; // 0.0 to 1.0
  conductivity: number; // gate throughput
  polarCharge: number; // -1.0 to 1.0
  phaseAngle: number; // radians
  deformationStress: number;
  chronodemon: string;
  archetypeWeight: number;
}

export interface NumogramGate {
  id: string;
  source: ZoneId;
  target: ZoneId;
  label: string;
  flux: number;
  permeability: number;
  isOpen: boolean;
  resistance: number;
}

export interface NumogramSyzygy {
  id: string;
  pair: [ZoneId, ZoneId];
  sum: number; // always sums to 9 (e.g. 0+9, 1+8, 2+7, 3+6, 4+5)
  phaseCoherence: number;
  torque: number;
  active: boolean;
}

export interface GovernorTelemetry {
  momentumDampingFactor: number;
  antiLockIntegrity: number; // 0 - 100%
  identityContinuityScore: number; // 0 - 1.0
  scaffoldSheddingStage: number; // 0 - 4
  hardLimitViolationCount: number;
  consolidationEntropy: number;
  deformationFieldTension: number;
  advisoryWeight: number;
  governorStatus: 'NOMINAL' | 'REGULATING' | 'DAMPING' | 'LOCKED_RECOVERY';
  invariantsAudited: number;
  nonAuthorisingEnforced: boolean;
}

export interface ConstitutiveDeformationField {
  stressTensor: number[][];
  strainHistory: number[];
  hysteresisTension: number;
  plasticDeformationRatio: number;
  elasticRelaxationRate: number;
  deformationHistoryVectors: number[][];
}

export interface BoundedObjective {
  id: string;
  title: string;
  targetZone: ZoneId;
  targetActivation: number;
  boundedWindowSteps: number;
  currentProgress: number;
  status: 'PENDING' | 'PURSUING' | 'CONSOLIDATED' | 'SHED';
  uncertaintyScore: number;
}

export interface ArchetypalTrajectory {
  id: string;
  name: string;
  primaryAxis: string;
  recurrenceProbability: number;
  basinStability: number;
  zoneRoute: ZoneId[];
  color: string;
}

export interface DevelopmentalAtlasManifold {
  step: number;
  coordinates: [number, number, number];
  basinId: string;
  bifurcationPotential: number;
  trajectoryId: string;
  timestamp: string;
}

export interface OneStepExtrapolation {
  step: number;
  predictedZoneStates: Record<ZoneId, number>;
  uncertaintyTag: number; // 0.0 to 1.0 (Governor tagged)
  topologicalRefinementDelta: number;
  isGovernorApproved: boolean;
}

export interface ExternalDevelopmentalRhythm {
  id: string;
  label: string;
  frequencyHz: number;
  phaseOffset: number;
  resonanceCoupling: number;
  advisoryDelta: number;
  active: boolean;
}

export interface CanalizationArmResult {
  arm: 'FROZEN' | 'NULL_BASELINE' | 'ACTIVE_C1';
  depth: number;
  seed: number;
  zone9ContactRetention: number; // percentage (e.g. 88.4%)
  fieldCoherence: number;
  canalizationEfficiency: number;
  reentryStability: number;
  meanTrajectoryEntropy: number;
  timestamp: string;
}

export interface Paper6AssayResult {
  id: string;
  depth: string;
  seed: number;
  h1ResistanceRatio: number;
  nullResponseMean: number;
  activeC1ResponseMean: number;
  differentialSignificanceP: number;
  reentryTerminalRetained: boolean;
  status: 'PASSED' | 'BORDERLINE' | 'ANOMALOUS';
}

export interface ControlledBenchmark {
  id: string;
  name: string;
  targetMetric: string;
  expectedRange: [number, number];
  currentValue: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  lastRunTimestamp: string;
}

export interface SubstrateStepSnapshot {
  step: number;
  timestamp: number;
  zones: Record<ZoneId, NumogramZone>;
  governor: GovernorTelemetry;
  activeSyzygies: string[];
  deformationVector: number[];
  selectedObjective: string;
  extrapolations?: OneStepExtrapolation[];
  atlasPoint?: DevelopmentalAtlasManifold;
}

export interface AmeliaDialogueAction {
  id: string;
  label: string;
  actionType: 'step' | 'consolidate' | 'shed' | 'run3arm' | 'inspectZone' | 'toggleRhythm' | 'tuneAdvisory' | 'openTab';
  payload?: any;
}

export interface AmeliaDialogueMessage {
  id: string;
  sender: 'user' | 'amelia' | 'system';
  text: string;
  timestamp: string;
  step?: number;
  activeSyzygy?: string;
  deformationTension?: number;
  governorStatus?: 'NOMINAL' | 'REGULATING' | 'DAMPING' | 'LOCKED_RECOVERY';
  identityContinuityScore?: number;
  suggestedActions?: AmeliaDialogueAction[];
  isThinking?: boolean;
}

