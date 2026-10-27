import { ZoneId, NumogramZone, NumogramSyzygy } from '../types/amelia';

/**
 * Amelia Movements & Qabbalistic Current Router
 * Maps the 5 CCRU syzygies (9::0, 8::1, 7::2, 6::3, 5::4) with their syzygetic demons, and the 3 CCRU regions
 * (Time-Circuit 1, 2, 4, 5, 7, 8; Warp 3, 6; Plex 0, 9)
 */
export class AmeliaQabbalaInterface {
  public static readonly SYZYGIES: Array<{ id: string; pair: [ZoneId, ZoneId]; name: string; current: string }> = [
    { id: 'SYZ_0_9', pair: [0, 9], name: 'Uttunul (9::0), current 9::0 -> 9', current: 'Plex' },
    { id: 'SYZ_1_8', pair: [1, 8], name: 'Mur Mur (8::1), current 8::1 -> 7', current: 'Time-Circuit' },
    { id: 'SYZ_2_7', pair: [2, 7], name: 'Oddubb (7::2), current 7::2 -> 5', current: 'Time-Circuit' },
    { id: 'SYZ_3_6', pair: [3, 6], name: 'Djynxx (6::3), current 6::3 -> 3', current: 'Warp' },
    { id: 'SYZ_4_5', pair: [4, 5], name: 'Katak (5::4), current 5::4 -> 1', current: 'Time-Circuit' },
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
      'Time-Circuit': ([1, 2, 4, 5, 7, 8] as ZoneId[]).reduce((a, z) => a + (zones[z]?.activation || 0.5), 0) / 6,
      Warp: ((zones[3]?.activation || 0.5) + (zones[6]?.activation || 0.5)) / 2,
      Plex: ((zones[0]?.activation || 0.5) + (zones[9]?.activation || 0.5)) / 2,
    };
    return currents;
  }
}
