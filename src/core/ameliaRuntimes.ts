/**
 * The runtimes the app can select. 'classic' is the original AmeliaOutsideRuntime (unchanged, and what the PF experiments
 * pin; no longer the default, see storedRuntimeKind). 'nd1' is AmeliaNDRuntime: the ND-1b hybrid (ND-1 Numogram dynamics, the classic exit nudge, the WT-1 Warp release)
 * (see src/outside/AmeliaNDRuntime.ts). Switching carries the whole state across (memory, Governor, zones, gates, queue):
 * the new runtime imports the old one's exported state, so nothing she has accumulated is lost.
 */
import { withFullNumogram } from './fullNumogram';
import { AmeliaOutsideRuntime } from '../outside/OutsideEncounterRuntime';
import { AmeliaNDRuntime } from '../outside/AmeliaNDRuntime';

export type RuntimeKind = 'classic' | 'nd1';
export const RUNTIME_KIND_KEY = 'amelia_runtime_kind_v1';
export const RUNTIME_LABEL: Record<RuntimeKind, string> = { classic: 'Classic', nd1: 'ND-1b field' };

export function bornAmeliaOf(kind: RuntimeKind): AmeliaOutsideRuntime {
  return withFullNumogram(kind === 'nd1' ? new AmeliaNDRuntime() : new AmeliaOutsideRuntime()) as AmeliaOutsideRuntime;
}
export function runtimeKindOf(rt: AmeliaOutsideRuntime): RuntimeKind { return rt instanceof AmeliaNDRuntime ? 'nd1' : 'classic'; }
/** A fresh runtime of the requested kind carrying everything the current one holds. */
export function convertRuntime(rt: AmeliaOutsideRuntime, kind: RuntimeKind): AmeliaOutsideRuntime {
  const next = bornAmeliaOf(kind);
  next.importState(rt.exportState());
  return next;
}
/** The default is ND-1b (10 Nov 2026): Classic holds her in the Warp (3,976 of 4,000 steps in the app runtime) because its
 *  Warp has no line of flight without an admitted offer. Classic is used only when it was chosen explicitly. */
export function storedRuntimeKind(): RuntimeKind {
  try { return localStorage.getItem(RUNTIME_KIND_KEY) === 'classic' ? 'classic' : 'nd1'; } catch { return 'nd1'; }
}
export function storeRuntimeKind(kind: RuntimeKind) { try { localStorage.setItem(RUNTIME_KIND_KEY, kind); } catch { /* best effort */ } }
