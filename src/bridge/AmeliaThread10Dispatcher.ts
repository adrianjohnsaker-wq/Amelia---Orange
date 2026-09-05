/**
 * AmeliaThread10Dispatcher.ts
 *
 * Bridge dispatcher for Thread 10 Functional Perturbation Assay (FPA)
 */

import { LiveAmeliaBindings } from './AmeliaThread3EncodingActivationAssay';
import {
  Thread10AssayResult,
  THREAD10_PILOT_CONFIG,
  THREAD10_FULL_CONFIG,
  runThread10FunctionalPerturbationAssay,
  formatThread10Result,
} from './AmeliaThread10FunctionalPerturbationAssay';

export function createThread10BridgeDispatcher(
  bindings: LiveAmeliaBindings
): (command: string) => Promise<string> {
  let lastResult: Thread10AssayResult | null = null;

  return async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (trimmed === "BRIDGE THREAD10 — RUN PILOT") {
      lastResult = await runThread10FunctionalPerturbationAssay(bindings, THREAD10_PILOT_CONFIG);
      return formatThread10Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD10 — RUN FULL") {
      lastResult = await runThread10FunctionalPerturbationAssay(bindings, THREAD10_FULL_CONFIG);
      return formatThread10Result(lastResult);
    }
    if (trimmed === "BRIDGE THREAD10 — RESULTS") {
      return lastResult
        ? formatThread10Result(lastResult)
        : "ERR: No Thread 10 functional perturbation run is available. Run ‘BRIDGE THREAD10 — RUN PILOT’ first.";
    }
    return `ERR: Unknown Thread 10 command: “${command}”`;
  };
}
