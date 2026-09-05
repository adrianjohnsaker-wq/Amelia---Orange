/**
 * AmeliaThread11Dispatcher.ts
 *
 * Bridge dispatcher for Thread 11 Minimal Reinduction Threshold Assay (MRTA)
 */

import { LiveAmeliaBindings } from './AmeliaThread3EncodingActivationAssay';
import {
  Thread11AssayResult,
  THREAD11_PILOT_CONFIG,
  THREAD11_FULL_CONFIG,
  runThread11MinimalReinductionAssay,
  formatThread11Result,
} from './AmeliaThread11MinimalReinductionAssay';

export function createThread11BridgeDispatcher(
  bindings: LiveAmeliaBindings
): (command: string) => Promise<string> {
  let lastResult: Thread11AssayResult | null = null;

  return async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (trimmed === "BRIDGE THREAD11 — RUN PILOT" || trimmed === "AMELIA THREAD11 MRTA RUN PILOT" || trimmed === "AMELIA THREAD11 RUN PILOT") {
      lastResult = await runThread11MinimalReinductionAssay(bindings, THREAD11_PILOT_CONFIG);
      return formatThread11Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD11 — RUN FULL" || trimmed === "AMELIA THREAD11 MRTA RUN FULL" || trimmed === "AMELIA THREAD11 RUN FULL") {
      lastResult = await runThread11MinimalReinductionAssay(bindings, THREAD11_FULL_CONFIG);
      return formatThread11Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD11 — RESULTS" || trimmed === "AMELIA THREAD11 MRTA RESULTS" || trimmed === "AMELIA THREAD11 RESULTS") {
      return lastResult
        ? formatThread11Result(lastResult)
        : "ERR: No Thread 11 minimal reinduction run is available. Run ‘BRIDGE THREAD11 — RUN PILOT’ first.";
    }
    return `ERR: Unknown Thread 11 command: “${command}”`;
  };
}
