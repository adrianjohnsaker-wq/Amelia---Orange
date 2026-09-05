/**
 * AmeliaThread9BDispatcher.ts
 *
 * Bridge dispatcher for Thread 9B Extended Longevity Assay (Consolidation Half-Life)
 */

import { LiveAmeliaBindings } from './AmeliaThread3EncodingActivationAssay';
import {
  Thread9BAssayResult,
  THREAD9B_PILOT_CONFIG,
  THREAD9B_FULL_CONFIG,
  runThread9BLongevityAssay,
  formatThread9BResult,
} from './AmeliaThread9BLongevityAssay';

export function createThread9BBridgeDispatcher(
  bindings: LiveAmeliaBindings
): (command: string) => Promise<string> {
  let lastResult: Thread9BAssayResult | null = null;

  return async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (trimmed === "BRIDGE THREAD9B — RUN PILOT") {
      lastResult = await runThread9BLongevityAssay(bindings, THREAD9B_PILOT_CONFIG);
      return formatThread9BResult(lastResult);
    }
    if (trimmed === "BRIDGE THREAD9B — RUN FULL") {
      lastResult = await runThread9BLongevityAssay(bindings, THREAD9B_FULL_CONFIG);
      return formatThread9BResult(lastResult);
    }
    if (trimmed === "BRIDGE THREAD9B — RESULTS") {
      return lastResult
        ? formatThread9BResult(lastResult)
        : "ERR: No Thread 9B extended longevity run is available. Run ‘BRIDGE THREAD9B — RUN PILOT’ first.";
    }
    return `ERR: Unknown Thread 9B command: “${command}”`;
  };
}
