import { 
  ZoneId, 
  NumogramZone, 
  DevelopmentalAtlasManifold, 
  ArchetypalTrajectory 
} from '../../types/amelia';

export class DevelopmentalAtlasMapping {
  public static readonly CANONICAL_ARCHETYPES: ArchetypalTrajectory[] = [
    {
      id: 'ARCH_LEMURIAN_DESCENT',
      name: 'Lemurian Descent Basin',
      primaryAxis: 'Zone 1 -> Zone 4 -> Zone 7 -> Zone 9',
      recurrenceProbability: 0.94,
      basinStability: 0.89,
      zoneRoute: [1, 4, 7, 9],
      color: '#10b981',
    },
    {
      id: 'ARCH_PLEXUS_SPIRAL',
      name: 'Plexus Chrono-Spiral',
      primaryAxis: 'Zone 3 -> Zone 6 -> Zone 8 -> Zone 2',
      recurrenceProbability: 0.87,
      basinStability: 0.82,
      zoneRoute: [3, 6, 8, 2],
      color: '#06b6d4',
    },
    {
      id: 'ARCH_ABYSSAL_REBOUND',
      name: 'Abyssal Invariant Rebound',
      primaryAxis: 'Zone 0 -> Zone 5 -> Zone 9',
      recurrenceProbability: 0.79,
      basinStability: 0.95,
      zoneRoute: [0, 5, 9],
      color: '#f59e0b',
    },
    {
      id: 'ARCH_BARKER_TORQUE',
      name: 'Barker Torque Balance',
      primaryAxis: 'Zone 4 -> Zone 5 -> Zone 8',
      recurrenceProbability: 0.91,
      basinStability: 0.88,
      zoneRoute: [4, 5, 8],
      color: '#ec4899',
    },
  ];

  /**
   * Project 10-dimensional zone activation space onto 3D manifold for the Developmental Atlas
   */
  public static projectManifoldCoordinates(
    step: number,
    zones: Record<ZoneId, NumogramZone>,
    deformationFieldTension: number
  ): DevelopmentalAtlasManifold {
    // Dimension X: Barker/Lemur balance
    const dimX = (zones[1].activation + zones[4].activation + zones[7].activation) / 3 -
                 (zones[2].activation + zones[5].activation + zones[8].activation) / 3;
    
    // Dimension Y: Plex/Abyss gradient
    const dimY = (zones[3].activation + zones[6].activation) / 2 -
                 (zones[0].activation + zones[9].activation) / 2;

    // Dimension Z: Constitutive tension height
    const dimZ = deformationFieldTension * 1.5 + (zones[9].activation * 0.5);

    // Identify closest basin
    const bifurcationPotential = Math.sin(step * 0.08) * 0.3 + 0.35;
    const activeArch = this.recognizeArchetype(zones);

    return {
      step,
      coordinates: [
        Number((dimX * 10).toFixed(3)),
        Number((dimY * 10).toFixed(3)),
        Number((dimZ * 5).toFixed(3))
      ],
      basinId: activeArch.id,
      bifurcationPotential: Number(Math.min(1.0, Math.max(0.0, bifurcationPotential)).toFixed(3)),
      trajectoryId: activeArch.name,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Recognise recurring archetypal trajectories
   */
  public static recognizeArchetype(zones: Record<ZoneId, NumogramZone>): ArchetypalTrajectory {
    let highestScore = -1;
    let selected = this.CANONICAL_ARCHETYPES[0];

    for (const arch of this.CANONICAL_ARCHETYPES) {
      let score = 0;
      for (const zId of arch.zoneRoute) {
        score += zones[zId].activation;
      }
      score /= arch.zoneRoute.length;

      if (score > highestScore) {
        highestScore = score;
        selected = arch;
      }
    }

    return selected;
  }
}
