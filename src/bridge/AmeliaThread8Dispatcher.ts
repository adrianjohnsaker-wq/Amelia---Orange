/**
 * AmeliaThread8Dispatcher.ts
 *
 * Bridge dispatcher for Thread 8 Teleopleptic Developmental Transition Assay
 */

import { LiveAmeliaBindings } from './AmeliaThread3EncodingActivationAssay';
import {
  Thread8AssayResult,
  THREAD8_PILOT_CONFIG,
  THREAD8_FULL_CONFIG,
  runThread8DevelopmentalAssay,
  formatThread8Result,
} from './AmeliaThread8DevelopmentalAssay';

export function createThread8BridgeDispatcher(
  bindings: LiveAmeliaBindings
): (command: string) => Promise<string> {
  let lastResult: Thread8AssayResult | null = null;

  return async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (trimmed === "BRIDGE THREAD8 — RUN PILOT") {
      lastResult = await runThread8DevelopmentalAssay(bindings, THREAD8_PILOT_CONFIG);
      return formatThread8Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD8 — RUN FULL") {
      lastResult = await runThread8DevelopmentalAssay(bindings, THREAD8_FULL_CONFIG);
      return formatThread8Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD8 — RESULTS") {
      return lastResult
        ? formatThread8Result(lastResult)
        : "ERR: No Thread 8 developmental run is available. Run ‘BRIDGE THREAD8 — RUN PILOT’ first.";
    }
    return `ERR: Unknown Thread 8 command: “${command}”`;
  };
}
