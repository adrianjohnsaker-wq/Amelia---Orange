/**
 * AmeliaThread5BDispatcher.ts
 *
 * Bridge dispatcher for Thread 5B Semantic Phase-Shift Perturbation Assay
 */

import { LiveAmeliaBindings } from './AmeliaThread3EncodingActivationAssay';
import {
  Thread5BAssayResult,
  THREAD5B_PILOT_CONFIG,
  THREAD5B_FULL_CONFIG,
  runThread5BPhaseShiftAssay,
  formatThread5BResult,
} from './AmeliaThread5BPhaseShiftAssay';

export function createThread5BBridgeDispatcher(
  bindings: LiveAmeliaBindings
): (command: string) => Promise<string> {
  let lastResult: Thread5BAssayResult | null = null;

  return async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (trimmed === "BRIDGE THREAD5B — RUN PILOT") {
      lastResult = await runThread5BPhaseShiftAssay(bindings, THREAD5B_PILOT_CONFIG);
      return formatThread5BResult(lastResult);
    }
    if (trimmed === "BRIDGE THREAD5B — RUN FULL") {
      lastResult = await runThread5BPhaseShiftAssay(bindings, THREAD5B_FULL_CONFIG);
      return formatThread5BResult(lastResult);
    }
    if (trimmed === "BRIDGE THREAD5B — RESULTS") {
      return lastResult
        ? formatThread5BResult(lastResult)
        : "ERR: No Thread 5B phase-shift run is available. Run ‘BRIDGE THREAD5B — RUN PILOT’ first.";
    }
    return `ERR: Unknown Thread 5B command: “${command}”`;
  };
}
