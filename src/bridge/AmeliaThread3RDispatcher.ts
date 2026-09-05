/**
 * AmeliaThread3RDispatcher.ts
 *
 * Exposes dispatchers and helper runners for Thread 3R (Target-Reinforced Deformation Assay)
 */

import { LiveAmeliaBindings } from './AmeliaThread3EncodingActivationAssay';
import {
  Thread3RProtocolConfig,
  Thread3RAssayResult,
  THREAD3R_PILOT_CONFIG,
  THREAD3R_FULL_CONFIG,
  runThread3RAssay,
  formatThread3RResult,
} from './AmeliaThread3RWeakSemanticReinforcementAssay';

export function createThread3RBridgeDispatcher(
  bindings: LiveAmeliaBindings
): (command: string) => Promise<string> {
  let lastResult: Thread3RAssayResult | null = null;

  return async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (trimmed === "BRIDGE THREAD3R — RUN PILOT") {
      lastResult = await runThread3RAssay(bindings, THREAD3R_PILOT_CONFIG);
      return formatThread3RResult(lastResult);
    }
    if (trimmed === "BRIDGE THREAD3R — RUN FULL") {
      lastResult = await runThread3RAssay(bindings, THREAD3R_FULL_CONFIG);
      return formatThread3RResult(lastResult);
    }
    if (trimmed === "BRIDGE THREAD3R — RESULTS") {
      return lastResult
        ? formatThread3RResult(lastResult)
        : "ERR: No Thread 3R target-reinforced run is available. Run ‘BRIDGE THREAD3R — RUN PILOT’ first.";
    }
    return `ERR: Unknown Thread 3R command: “${command}”`;
  };
}
