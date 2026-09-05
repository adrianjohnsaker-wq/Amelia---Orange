/**
 * AmeliaThread9Dispatcher.ts
 *
 * Bridge dispatcher for Thread 9 Consolidation Under Horizon-Off Recovery Assay
 */

import { LiveAmeliaBindings } from './AmeliaThread3EncodingActivationAssay';
import {
  Thread9AssayResult,
  THREAD9_PILOT_CONFIG,
  THREAD9_FULL_CONFIG,
  runThread9ConsolidationAssay,
  formatThread9Result,
} from './AmeliaThread9ConsolidationAssay';

export function createThread9BridgeDispatcher(
  bindings: LiveAmeliaBindings
): (command: string) => Promise<string> {
  let lastResult: Thread9AssayResult | null = null;

  return async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (trimmed === "BRIDGE THREAD9 — RUN PILOT") {
      lastResult = await runThread9ConsolidationAssay(bindings, THREAD9_PILOT_CONFIG);
      return formatThread9Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD9 — RUN FULL") {
      lastResult = await runThread9ConsolidationAssay(bindings, THREAD9_FULL_CONFIG);
      return formatThread9Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD9 — RESULTS") {
      return lastResult
        ? formatThread9Result(lastResult)
        : "ERR: No Thread 9 consolidation run is available. Run ‘BRIDGE THREAD9 — RUN PILOT’ first.";
    }
    return `ERR: Unknown Thread 9 command: “${command}”`;
  };
}
