import { ZoneId, NumogramZone, NumogramSyzygy } from '../types/amelia';

/**
 * Amelia Movements & Qabbalistic Current Router
 * Maps the 5 syzygies (0::9, 1::8, 2::7, 3::6, 4::5) and 3 primary currents (Barker, Lemur, Plex)
 */
export class AmeliaQabbalaInterface {
  public static readonly SYZYGIES: Array<{ id: string; pair: [ZoneId, ZoneId]; name: string; current: string }> = [
    { id: 'SYZ_0_9', pair: [0, 9], name: 'Utter-Void / Plexus Terminal', current: 'Abyss' },
    { id: 'SYZ_1_8', pair: [1, 8], name: 'Origin Flux / Anamnesis Locus', current: 'Barker' },
    { id: 'SYZ_2_7', pair: [2, 7], name: 'Chasm Crossing / Hyperborean Gate', current: 'Lemur' },
    { id: 'SYZ_3_6', pair: [3, 6], name: 'Pandemonium Vortex / Chrono-Attractor', current: 'Plex' },
    { id: 'SYZ_4_5', pair: [4, 5], name: 'Torque Equilibrium / Central Horizon', current: 'Barker' },
  ];

  public static calculateTorque(zoneA: NumogramZone, zoneB: NumogramZone): number {
    const diff = zoneA.activation - zoneB.activation;
    const phaseDelta = Math.sin(zoneA.phaseAngle - zoneB.phaseAngle);
    return Math.abs(diff * 0.6 + phaseDelta * 0.4);
  }

  public static getSyzygyCoherence(zones: Record<ZoneId, NumogramZone>): NumogramSyzygy[] {
    return this.SYZYGIES.map(syz => {
      const zA = zones[syz.pair[0]];
      const zB = zones[syz.pair[1]];
      const torque = zA && zB ? this.calculateTorque(zA, zB) : 0.5;
      const phaseCoherence = zA && zB ? 1.0 - Math.min(1.0, Math.abs(zA.activation - zB.activation) * 0.7) : 0.8;
      return {
        id: syz.id,
        pair: syz.pair,
        sum: 9,
        phaseCoherence: Number(phaseCoherence.toFixed(3)),
        torque: Number(torque.toFixed(3)),
        active: phaseCoherence > 0.45,
      };
    });
  }

  public static evaluateQabbalisticCurrents(zones: Record<ZoneId, NumogramZone>): Record<string, number> {
    const currents = {
      Barker: ((zones[1]?.activation || 0.5) + (zones[4]?.activation || 0.5) + (zones[5]?.activation || 0.5) + (zones[8]?.activation || 0.5)) / 4,
      Lemur: ((zones[2]?.activation || 0.5) + (zones[7]?.activation || 0.5)) / 2,
      Plex: ((zones[3]?.activation || 0.5) + (zones[6]?.activation || 0.5)) / 2,
      Abyss: ((zones[0]?.activation || 0.5) + (zones[9]?.activation || 0.5)) / 2,
    };
    return currents;
  }
}
