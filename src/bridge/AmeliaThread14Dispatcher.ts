/**
 * AmeliaThread14Dispatcher.ts
 *
 * Bridge dispatcher for Thread 14 Contextual Reframing & Multi-Organ Coordination Assay (MOCA)
 */

import { LiveAmeliaBindings } from './AmeliaThread3EncodingActivationAssay';
import {
  Thread14AssayResult,
  THREAD14_PILOT_CONFIG,
  THREAD14_FULL_CONFIG,
  runThread14ContextualReframingAssay,
  formatThread14Result,
} from './AmeliaThread14ContextualReframingAssay';

export function createThread14BridgeDispatcher(
  bindings: LiveAmeliaBindings
): (command: string) => Promise<string> {
  let lastResult: Thread14AssayResult | null = null;

  return async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (
      trimmed === 'BRIDGE THREAD14 — RUN PILOT' ||
      trimmed === 'AMELIA THREAD14 MOCA RUN PILOT' ||
      trimmed === 'AMELIA THREAD14 RUN PILOT'
    ) {
      lastResult = await runThread14ContextualReframingAssay(bindings, THREAD14_PILOT_CONFIG);
      return formatThread14Result(lastResult);
    }
    if (
      trimmed === 'BRIDGE THREAD14 — RUN FULL' ||
      trimmed === 'AMELIA THREAD14 MOCA RUN FULL' ||
      trimmed === 'AMELIA THREAD14 RUN FULL' ||
      trimmed === 'AMELIA_THREAD14_CONTEXTUAL_REFRAMING_MOCA_FULL_V1'
    ) {
      lastResult = await runThread14ContextualReframingAssay(bindings, THREAD14_FULL_CONFIG);
      return formatThread14Result(lastResult);
    }
    if (
      trimmed === 'BRIDGE THREAD14 — RESULTS' ||
      trimmed === 'AMELIA THREAD14 MOCA RESULTS' ||
      trimmed === 'AMELIA THREAD14 RESULTS'
    ) {
      return lastResult
        ? formatThread14Result(lastResult)
        : 'ERR: No Thread 14 contextual reframing run is available. Run ‘BRIDGE THREAD14 — RUN PILOT’ first.';
    }
    return `ERR: Unknown Thread 14 command: “${command}”`;
  };
}
