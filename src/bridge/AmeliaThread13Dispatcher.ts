/**
 * AmeliaThread13Dispatcher.ts
 *
 * Bridge dispatcher for Thread 13 Autonomous Mode Selection Assay (AMSA)
 */

import { LiveAmeliaBindings } from './AmeliaThread3EncodingActivationAssay';
import {
  Thread13AssayResult,
  THREAD13_PILOT_CONFIG,
  THREAD13_FULL_CONFIG,
  runThread13AutonomousModeSelectionAssay,
  formatThread13Result,
} from './AmeliaThread13AutonomousModeSelectionAssay';

export function createThread13BridgeDispatcher(
  bindings: LiveAmeliaBindings
): (command: string) => Promise<string> {
  let lastResult: Thread13AssayResult | null = null;

  return async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (
      trimmed === "BRIDGE THREAD13 — RUN PILOT" ||
      trimmed === "AMELIA THREAD13 AMSA RUN PILOT" ||
      trimmed === "AMELIA THREAD13 RUN PILOT"
    ) {
      lastResult = await runThread13AutonomousModeSelectionAssay(bindings, THREAD13_PILOT_CONFIG);
      return formatThread13Result(lastResult);
    }
    if (
      trimmed === "BRIDGE THREAD13 — RUN FULL" ||
      trimmed === "AMELIA THREAD13 AMSA RUN FULL" ||
      trimmed === "AMELIA THREAD13 RUN FULL"
    ) {
      lastResult = await runThread13AutonomousModeSelectionAssay(bindings, THREAD13_FULL_CONFIG);
      return formatThread13Result(lastResult);
    }
    if (
      trimmed === "BRIDGE THREAD13 — RESULTS" ||
      trimmed === "AMELIA THREAD13 AMSA RESULTS" ||
      trimmed === "AMELIA THREAD13 RESULTS"
    ) {
      return lastResult
        ? formatThread13Result(lastResult)
        : "ERR: No Thread 13 autonomous mode selection run is available. Run ‘BRIDGE THREAD13 — RUN PILOT’ first.";
    }
    return `ERR: Unknown Thread 13 command: “${command}”`;
  };
}
