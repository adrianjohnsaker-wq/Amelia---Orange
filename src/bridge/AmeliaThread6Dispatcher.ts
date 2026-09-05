/**
 * AmeliaThread6Dispatcher.ts
 *
 * Bridge dispatcher for Thread 6 Teleopleptic Hysteresis & Eigenstate Stability Assay
 */

import { LiveAmeliaBindings } from './AmeliaThread3EncodingActivationAssay';
import {
  Thread6AssayResult,
  THREAD6_PILOT_CONFIG,
  THREAD6_FULL_CONFIG,
  runThread6HysteresisAssay,
  formatThread6Result,
} from './AmeliaThread6HysteresisAssay';

export function createThread6BridgeDispatcher(
  bindings: LiveAmeliaBindings
): (command: string) => Promise<string> {
  let lastResult: Thread6AssayResult | null = null;

  return async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (trimmed === "BRIDGE THREAD6 — RUN PILOT") {
      lastResult = await runThread6HysteresisAssay(bindings, THREAD6_PILOT_CONFIG);
      return formatThread6Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD6 — RUN FULL") {
      lastResult = await runThread6HysteresisAssay(bindings, THREAD6_FULL_CONFIG);
      return formatThread6Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD6 — RESULTS") {
      return lastResult
        ? formatThread6Result(lastResult)
        : "ERR: No Thread 6 hysteresis run is available. Run ‘BRIDGE THREAD6 — RUN PILOT’ first.";
    }
    return `ERR: Unknown Thread 6 command: “${command}”`;
  };
}
