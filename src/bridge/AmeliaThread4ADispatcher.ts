/**
 * AmeliaThread4ADispatcher.ts
 *
 * Bridge dispatcher for Thread 4A Teleopleptic Horizon Gain Sweep Assay
 */

import { LiveAmeliaBindings } from './AmeliaThread3EncodingActivationAssay';
import {
  Thread4AGainSweepResult,
  THREAD4A_PILOT_CONFIG,
  THREAD4A_FULL_CONFIG,
  runThread4AGainSweepAssay,
  formatThread4AResult,
} from './AmeliaThread4AGainSweepAssay';

export function createThread4ABridgeDispatcher(
  bindings: LiveAmeliaBindings
): (command: string) => Promise<string> {
  let lastResult: Thread4AGainSweepResult | null = null;

  return async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (trimmed === "BRIDGE THREAD4A — RUN PILOT") {
      lastResult = await runThread4AGainSweepAssay(bindings, THREAD4A_PILOT_CONFIG);
      return formatThread4AResult(lastResult);
    }
    if (trimmed === "BRIDGE THREAD4A — RUN FULL") {
      lastResult = await runThread4AGainSweepAssay(bindings, THREAD4A_FULL_CONFIG);
      return formatThread4AResult(lastResult);
    }
    if (trimmed === "BRIDGE THREAD4A — RESULTS") {
      return lastResult
        ? formatThread4AResult(lastResult)
        : "ERR: No Thread 4A gain sweep run is available. Run ‘BRIDGE THREAD4A — RUN PILOT’ first.";
    }
    return `ERR: Unknown Thread 4A command: “${command}”`;
  };
}
