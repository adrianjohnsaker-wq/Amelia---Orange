/**
 * AmeliaThread5Dispatcher.ts
 *
 * Bridge dispatcher for Thread 5 Teleopleptic + Semantic Interaction Assay
 */

import { LiveAmeliaBindings } from './AmeliaThread3EncodingActivationAssay';
import {
  Thread5AssayResult,
  THREAD5_PILOT_CONFIG,
  THREAD5_FULL_CONFIG,
  runThread5SemanticInteractionAssay,
  formatThread5Result,
} from './AmeliaThread5SemanticInteractionAssay';

export function createThread5BridgeDispatcher(
  bindings: LiveAmeliaBindings
): (command: string) => Promise<string> {
  let lastResult: Thread5AssayResult | null = null;

  return async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (trimmed === "BRIDGE THREAD5 — RUN PILOT") {
      lastResult = await runThread5SemanticInteractionAssay(bindings, THREAD5_PILOT_CONFIG);
      return formatThread5Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD5 — RUN FULL") {
      lastResult = await runThread5SemanticInteractionAssay(bindings, THREAD5_FULL_CONFIG);
      return formatThread5Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD5 — RESULTS") {
      return lastResult
        ? formatThread5Result(lastResult)
        : "ERR: No Thread 5 semantic interaction run is available. Run ‘BRIDGE THREAD5 — RUN PILOT’ first.";
    }
    return `ERR: Unknown Thread 5 command: “${command}”`;
  };
}
