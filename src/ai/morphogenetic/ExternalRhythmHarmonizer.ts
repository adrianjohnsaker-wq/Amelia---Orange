import { ExternalDevelopmentalRhythm } from '../../types/amelia';

/**
 * External Rhythm Harmonizer
 * Weakly tunes advisory weighting in response to compatible external developmental rhythms.
 * Non-authorising and Governor-constrained.
 */
export class ExternalRhythmHarmonizer {
  private rhythms: ExternalDevelopmentalRhythm[] = [
    {
      id: 'RHYTHM_CIRCADIAN_DIURNAL',
      label: 'Circadian Diurnal Oscillator',
      frequencyHz: 0.04,
      phaseOffset: 0.0,
      resonanceCoupling: 0.88,
      advisoryDelta: 0.04,
      active: true,
    },
    {
      id: 'RHYTHM_PULSE_CANALIZATION',
      label: 'Canalization Depth Rhythm (D288)',
      frequencyHz: 0.12,
      phaseOffset: 1.57,
      resonanceCoupling: 0.94,
      advisoryDelta: -0.02,
      active: true,
    },
    {
      id: 'RHYTHM_PANDEMONIUM_FLUX',
      label: 'Pandemonium Micro-Flux Current',
      frequencyHz: 0.28,
      phaseOffset: 3.14,
      resonanceCoupling: 0.76,
      advisoryDelta: 0.01,
      active: false,
    },
  ];

  public getRhythms(): ExternalDevelopmentalRhythm[] {
    return this.rhythms;
  }

  public toggleRhythm(id: string): void {
    const r = this.rhythms.find(item => item.id === id);
    if (r) {
      r.active = !r.active;
    }
  }

  public computeAdvisoryTuning(currentAdvisory: number, step: number): number {
    let totalDelta = 0;
    for (const r of this.rhythms) {
      if (r.active) {
        const osc = Math.sin(step * r.frequencyHz + r.phaseOffset) * r.advisoryDelta;
        totalDelta += osc * r.resonanceCoupling;
      }
    }

    // Weakly tuned within strict bounded limits [0.1, 0.95]
    const tuned = Math.max(0.1, Math.min(0.95, currentAdvisory + totalDelta * 0.1));
    return Number(tuned.toFixed(3));
  }
}
