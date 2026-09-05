import { ThreeArmDiagnosticRunner } from '../coupling/ThreeArmDiagnosticRunner';
import { CanalizationArmResult } from '../../types/amelia';

export class Paper5ExploratoryNovelFlowSuite {
  public static runMultiDepthExploration(depths: number[] = [48, 52, 56, 60, 72, 288], seeds: number[] = [101, 202, 303, 404, 505]): CanalizationArmResult[] {
    const outputs: CanalizationArmResult[] = [];
    for (const d of depths) {
      for (const s of seeds) {
        const diag = ThreeArmDiagnosticRunner.runDiagnostic(d, s);
        outputs.push(diag.ACTIVE_C1);
      }
    }
    return outputs;
  }
}
