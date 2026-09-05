import { Paper6H1ResistanceAssay } from './phases/paper6H1ResistanceAssay';
import { Paper6AssayResult } from '../types/amelia';

export class XxxviiiRouter {
  public static routeCanonicalEvaluation(seeds: number[], depths: string[]): Paper6AssayResult[] {
    const results: Paper6AssayResult[] = [];
    for (const d of depths) {
      for (const s of seeds) {
        results.push(Paper6H1ResistanceAssay.evaluateH1Resistance(d, s));
      }
    }
    return results;
  }
}
