import { NumogramZone, NumogramGate, ZoneId } from '../../types/amelia';

export const INITIAL_ZONES: Record<ZoneId, NumogramZone> = {
  0: { id: 0, name: 'Zone-0: Pandemonium / Barker Index', syzygyPair: 9, current: 'Abyss', activation: 0.12, conductivity: 0.85, polarCharge: 0.0, phaseAngle: 0.0, deformationStress: 0.05, chronodemon: 'Lur-0 (Murrumur)', archetypeWeight: 0.82 },
  1: { id: 1, name: 'Zone-1: Plex / Origin Surge', syzygyPair: 8, current: 'Plex', activation: 0.65, conductivity: 0.72, polarCharge: 0.42, phaseAngle: 0.628, deformationStress: 0.14, chronodemon: 'Du-1 (Oddod)', archetypeWeight: 0.74 },
  2: { id: 2, name: 'Zone-2: Lemur / Cryptic Weft', syzygyPair: 7, current: 'Lemur', activation: 0.48, conductivity: 0.60, polarCharge: -0.31, phaseAngle: 1.256, deformationStress: 0.22, chronodemon: 'Tri-2 (Gharab)', archetypeWeight: 0.68 },
  3: { id: 3, name: 'Zone-3: Barker / Surge Channel', syzygyPair: 6, current: 'Barker', activation: 0.54, conductivity: 0.78, polarCharge: 0.55, phaseAngle: 1.884, deformationStress: 0.18, chronodemon: 'Kra-3 (Bubastis)', archetypeWeight: 0.86 },
  4: { id: 4, name: 'Zone-4: Mid-Decad Anchor', syzygyPair: 5, current: 'Plex', activation: 0.38, conductivity: 0.64, polarCharge: -0.15, phaseAngle: 2.513, deformationStress: 0.09, chronodemon: 'Tet-4 (Lurmur)', archetypeWeight: 0.91 },
  5: { id: 5, name: 'Zone-5: Hyper-Grounded Flux', syzygyPair: 4, current: 'Lemur', activation: 0.42, conductivity: 0.68, polarCharge: 0.18, phaseAngle: 3.141, deformationStress: 0.11, chronodemon: 'Pent-5 (Subtle-Gharab)', archetypeWeight: 0.77 },
  6: { id: 6, name: 'Zone-6: Barker / Return Spine', syzygyPair: 3, current: 'Barker', activation: 0.59, conductivity: 0.81, polarCharge: -0.48, phaseAngle: 3.769, deformationStress: 0.25, chronodemon: 'Hex-6 (Chrono-Spine)', archetypeWeight: 0.83 },
  7: { id: 7, name: 'Zone-7: Lemur / Phase Threshold', syzygyPair: 2, current: 'Lemur', activation: 0.71, conductivity: 0.88, polarCharge: 0.62, phaseAngle: 4.398, deformationStress: 0.31, chronodemon: 'Hept-7 (Gate-Master)', archetypeWeight: 0.88 },
  8: { id: 8, name: 'Zone-8: Plex / Vortex Terminal', syzygyPair: 1, current: 'Plex', activation: 0.79, conductivity: 0.92, polarCharge: -0.74, phaseAngle: 5.026, deformationStress: 0.38, chronodemon: 'Oct-8 (Vortex-Loom)', archetypeWeight: 0.93 },
  9: { id: 9, name: 'Zone-9: Pandemonium / Terminal Horizon', syzygyPair: 0, current: 'Abyss', activation: 0.88, conductivity: 0.96, polarCharge: 0.91, phaseAngle: 5.654, deformationStress: 0.45, chronodemon: 'Enn-9 (Syzygetic-Apex)', archetypeWeight: 0.98 },
};

export const CANONICAL_GATES: NumogramGate[] = [
  { id: 'gate-0-9', source: 0, target: 9, label: 'Abyssal Chasm (0::9)', flux: 0.94, permeability: 0.91, isOpen: true, resistance: 0.08 },
  { id: 'gate-1-8', source: 1, target: 8, label: 'Murmur Current (1::8)', flux: 0.82, permeability: 0.85, isOpen: true, resistance: 0.12 },
  { id: 'gate-2-7', source: 2, target: 7, label: 'Sub-Crypt Bridge (2::7)', flux: 0.74, permeability: 0.79, isOpen: true, resistance: 0.18 },
  { id: 'gate-3-6', source: 3, target: 6, label: 'Barker Loop (3::6)', flux: 0.88, permeability: 0.86, isOpen: true, resistance: 0.11 },
  { id: 'gate-4-5', source: 4, target: 5, label: 'Centroid Fold (4::5)', flux: 0.65, permeability: 0.70, isOpen: true, resistance: 0.22 },
  { id: 'gate-1-2', source: 1, target: 2, label: 'Lemurian Ingress (1->2)', flux: 0.58, permeability: 0.75, isOpen: true, resistance: 0.25 },
  { id: 'gate-2-4', source: 2, target: 4, label: 'Mesochron Descent (2->4)', flux: 0.49, permeability: 0.68, isOpen: true, resistance: 0.29 },
  { id: 'gate-4-7', source: 4, target: 7, label: 'Barker Ascendance (4->7)', flux: 0.63, permeability: 0.77, isOpen: true, resistance: 0.21 },
  { id: 'gate-7-8', source: 7, target: 8, label: 'Crown Egress (7->8)', flux: 0.85, permeability: 0.90, isOpen: true, resistance: 0.14 },
  { id: 'gate-8-9', source: 8, target: 9, label: 'Terminal Horizon Incursion (8->9)', flux: 0.91, permeability: 0.95, isOpen: true, resistance: 0.09 },
  { id: 'gate-9-1', source: 9, target: 1, label: 'Cyclic Re-entry (9->1)', flux: 0.87, permeability: 0.89, isOpen: true, resistance: 0.10 },
];

export class AmeliaQabbalaInterface {
  private zones: Record<ZoneId, NumogramZone>;
  private gates: NumogramGate[];

  constructor() {
    this.zones = JSON.parse(JSON.stringify(INITIAL_ZONES));
    this.gates = JSON.parse(JSON.stringify(CANONICAL_GATES));
  }

  public getZones(): Record<ZoneId, NumogramZone> {
    return this.zones;
  }

  public setZones(zones: Record<ZoneId, NumogramZone>): void {
    this.zones = JSON.parse(JSON.stringify(zones));
  }

  public getGates(): NumogramGate[] {
    return this.gates;
  }

  public setGates(gates: NumogramGate[]): void {
    this.gates = JSON.parse(JSON.stringify(gates));
  }

  public computeSyzygyCoherence(): number {
    const pairs: [ZoneId, ZoneId][] = [[0, 9], [1, 8], [2, 7], [3, 6], [4, 5]];
    let totalAlignment = 0;
    for (const [a, b] of pairs) {
      const zA = this.zones[a];
      const zB = this.zones[b];
      const diff = Math.abs(zA.activation - zB.activation);
      totalAlignment += 1 - diff * 0.5;
    }
    return Number((totalAlignment / pairs.length).toFixed(4));
  }

  public stepPhaseDynamics(damping: number, advisory: number, memoryBiasVector?: number[]): void {
    // Inter-zone current flux transfer through open gates
    for (const gate of this.gates) {
      if (gate.isOpen) {
        const src = this.zones[gate.source];
        const tgt = this.zones[gate.target];
        const transfer = (src.activation - tgt.activation) * gate.permeability * 0.08 * (1 - gate.resistance);
        src.activation = Math.max(0.04, src.activation - transfer * 0.5);
        tgt.activation = Math.min(0.98, tgt.activation + transfer * 0.5);
      }
    }

    for (let i = 0; i <= 9; i++) {
      const z = this.zones[i as ZoneId];
      const pairedZone = this.zones[z.syzygyPair];
      
      // Phase angle angular velocity based on Zone conductivity and index
      const baseFreq = 0.10 + (i * 0.04) * (1 + z.conductivity * 0.15);
      z.phaseAngle = (z.phaseAngle + baseFreq) % (Math.PI * 2);
      
      // Dynamic torque along the syzygetic axis
      const torque = Math.sin(z.phaseAngle + i * 0.628) * 0.22;
      
      // Memory bias force directly applied to target activation and zone dynamics
      const memoryBias = (memoryBiasVector && memoryBiasVector[i] !== undefined) ? memoryBiasVector[i] : 0.0;
      
      // Target activation combines base phase angle, syzygy pairing with external advisory, and internal constitutive memory bias
      const targetActivation = (0.35 + 0.30 * Math.sin(z.phaseAngle) + pairedZone.activation * 0.35) * advisory + memoryBias;
      
      // Momentum-damped relaxation
      const rawDelta = (targetActivation - z.activation) * (1 - damping * 0.45);
      z.activation = Math.max(0.05, Math.min(0.98, z.activation + rawDelta + torque * 0.08 + memoryBias * 0.15));
      z.deformationStress = Math.min(1.0, Math.abs(z.activation - pairedZone.activation) * 0.85 + Math.abs(memoryBias) * 0.5);
      z.polarCharge = Number((Math.cos(z.phaseAngle) * z.activation).toFixed(3));
    }
  }
}
