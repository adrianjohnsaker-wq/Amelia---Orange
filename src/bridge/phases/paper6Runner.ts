import { Paper6H1ResistanceAssay } from './paper6H1ResistanceAssay';
import { Paper6AssayResult } from '../../types/amelia';

export class Paper6Runner {
  public static runFullSuite(depths: string[] = ['D048', 'D072', 'D288'], seeds: number[] = [101, 202, 303, 404, 505]): Paper6AssayResult[] {
    const results: Paper6AssayResult[] = [];
    for (const d of depths) {
      for (const s of seeds) {
        results.push(Paper6H1ResistanceAssay.evaluateH1Resistance(d, s));
      }
    }
    return results;
  }

  public static runMultiSeedAssay(seeds: number[] = [101, 202, 303, 404, 505], depth: string = 'D288'): Paper6AssayResult[] {
    return seeds.map(s => Paper6H1ResistanceAssay.evaluateH1Resistance(depth, s));
  }
}
