/**
 * AmeliaThread7Dispatcher.ts
 *
 * Bridge dispatcher for Thread 7 Eigenstate Stress-Test & Teleopleptic Resilience Assay
 */

import { LiveAmeliaBindings } from './AmeliaThread3EncodingActivationAssay';
import {
  Thread7AssayResult,
  THREAD7_PILOT_CONFIG,
  THREAD7_FULL_CONFIG,
  runThread7StressAssay,
  formatThread7Result,
} from './AmeliaThread7StressAssay';

export function createThread7BridgeDispatcher(
  bindings: LiveAmeliaBindings
): (command: string) => Promise<string> {
  let lastResult: Thread7AssayResult | null = null;

  return async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (trimmed === "BRIDGE THREAD7 — RUN PILOT") {
      lastResult = await runThread7StressAssay(bindings, THREAD7_PILOT_CONFIG);
      return formatThread7Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD7 — RUN FULL") {
      lastResult = await runThread7StressAssay(bindings, THREAD7_FULL_CONFIG);
      return formatThread7Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD7 — RESULTS") {
      return lastResult
        ? formatThread7Result(lastResult)
        : "ERR: No Thread 7 stress run is available. Run ‘BRIDGE THREAD7 — RUN PILOT’ first.";
    }
    return `ERR: Unknown Thread 7 command: “${command}”`;
  };
}
