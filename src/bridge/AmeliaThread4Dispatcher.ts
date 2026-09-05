/**
 * AmeliaThread4Dispatcher.ts
 *
 * Bridge dispatcher for Thread 4 Teleopleptic Horizon Coupling Assay
 */

import { LiveAmeliaBindings } from './AmeliaThread3EncodingActivationAssay';
import {
  Thread4AssayResult,
  THREAD4_PILOT_CONFIG,
  THREAD4_FULL_CONFIG,
  runThread4Assay,
  formatThread4Result,
} from './AmeliaThread4TeleoplepticHorizonAssay';

export function createThread4BridgeDispatcher(
  bindings: LiveAmeliaBindings
): (command: string) => Promise<string> {
  let lastResult: Thread4AssayResult | null = null;

  return async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (trimmed === "BRIDGE THREAD4 — RUN PILOT") {
      lastResult = await runThread4Assay(bindings, THREAD4_PILOT_CONFIG);
      return formatThread4Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD4 — RUN FULL") {
      lastResult = await runThread4Assay(bindings, THREAD4_FULL_CONFIG);
      return formatThread4Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD4 — RESULTS") {
      return lastResult
        ? formatThread4Result(lastResult)
        : "ERR: No Thread 4 teleopleptic horizon run is available. Run ‘BRIDGE THREAD4 — RUN PILOT’ first.";
    }
    return `ERR: Unknown Thread 4 command: “${command}”`;
  };
}
