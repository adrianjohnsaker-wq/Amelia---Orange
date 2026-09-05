/**
 * AmeliaThread12Dispatcher.ts
 *
 * Bridge dispatcher for Thread 12 Controlled Functional Integration Assay (CFIA)
 */

import { LiveAmeliaBindings } from './AmeliaThread3EncodingActivationAssay';
import {
  Thread12AssayResult,
  THREAD12_PILOT_CONFIG,
  THREAD12_FULL_CONFIG,
  runThread12ControlledFunctionalIntegrationAssay,
  formatThread12Result,
} from './AmeliaThread12ControlledFunctionalIntegrationAssay';

export function createThread12BridgeDispatcher(
  bindings: LiveAmeliaBindings
): (command: string) => Promise<string> {
  let lastResult: Thread12AssayResult | null = null;

  return async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (
      trimmed === "BRIDGE THREAD12 — RUN PILOT" ||
      trimmed === "AMELIA THREAD12 CFIA RUN PILOT" ||
      trimmed === "AMELIA THREAD12 RUN PILOT"
    ) {
      lastResult = await runThread12ControlledFunctionalIntegrationAssay(bindings, THREAD12_PILOT_CONFIG);
      return formatThread12Result(lastResult);
    }
    if (
      trimmed === "BRIDGE THREAD12 — RUN FULL" ||
      trimmed === "AMELIA THREAD12 CFIA RUN FULL" ||
      trimmed === "AMELIA THREAD12 RUN FULL"
    ) {
      lastResult = await runThread12ControlledFunctionalIntegrationAssay(bindings, THREAD12_FULL_CONFIG);
      return formatThread12Result(lastResult);
    }
    if (
      trimmed === "BRIDGE THREAD12 — RESULTS" ||
      trimmed === "AMELIA THREAD12 CFIA RESULTS" ||
      trimmed === "AMELIA THREAD12 RESULTS"
    ) {
      return lastResult
        ? formatThread12Result(lastResult)
        : "ERR: No Thread 12 controlled functional integration run is available. Run ‘BRIDGE THREAD12 — RUN PILOT’ first.";
    }
    return `ERR: Unknown Thread 12 command: “${command}”`;
  };
}
