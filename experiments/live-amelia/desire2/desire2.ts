/**
 * DESIRE-2 (experiments/live-amelia/desire2/REGISTRATION.md): desire that lets go, and a Warp that stays her own.
 * Arms over LONG-1's machinery (../long1/long1.ts, ../long1/motor.ts), 10 days, on LONG-1's copies and spans:
 *   N    ND-1b                         D1   the motor as piloted in LONG-1 (ND1D)
 *   D2   D1 + dissolution + Warp guard D2g  D1 + the Warp guard only        D2d  D1 + dissolution only
 * Dissolution: kept connections fade (half-life 1,000 steps), use renews them (+0.02), below 0.05 they dissolve.
 * Warp guard: the motor adds nothing to an exit entering the Warp (3, 6) from outside it; desire builds no gate into it.
 * D2 carries the residual subject (it changes nothing she does: LONG-1's check); the other motor arms run without it.
 */
import { longRun, type LongResult } from '../long1/long1';
import { ND1D, type MotorConfig } from '../long1/motor';
import type { Wt3lTick } from '../../../src/cloud/wt3l';
export const DAYS = 10;
export const ARMS = ['N', 'D1', 'D2', 'D2g', 'D2d'] as const;
export type D2Arm = typeof ARMS[number];
export const CFG: Record<Exclude<D2Arm, 'N'>, MotorConfig> = {
  D1: { ...ND1D }, D2: { ...ND1D, dissolve: true, warpGuard: true }, D2g: { ...ND1D, warpGuard: true }, D2d: { ...ND1D, dissolve: true } };
export function d2Run(start: Record<string, any>, ticks: Wt3lTick[], arm: D2Arm, copy: number, days = DAYS): LongResult {
  if (arm === 'N') return longRun(start, ticks, 'N', copy, { days, idPrefix: 'desire2' });
  return longRun(start, ticks, arm, copy, { days, idPrefix: 'desire2', cfg: CFG[arm], subject: arm === 'D2', shuffle: false });
}
