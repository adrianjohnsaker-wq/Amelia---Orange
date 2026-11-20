/**
 * DESIRE-3 (experiments/live-amelia/desire3/REGISTRATION.md): what the Outside travels stays.
 * Arms over LONG-1's machinery (../long1/long1.ts, ../long1/motor.ts), 10 days, on LONG-1's 12 copies and spans:
 *   N    ND-1b                                  D2g  the Warp guard only (DESIRE-2)
 *   D2   guard + dissolution (DESIRE-2)         D3   guard + dissolution renewed by the Outside's trace
 * Renewal (motor.ts, traceRenew): while the trace's mark on a kept connection's edge is at least D3.TMIN = 0.05, the
 * connection's flux gains D3.RENEW (0.01) x mark x (1 - flux) each step. D3 carries the residual subject (non-steering).
 */
import { longRun, type LongResult } from '../long1/long1';
import { ND1D, type MotorConfig } from '../long1/motor';
import type { Wt3lTick } from '../../../src/cloud/wt3l';
export const DAYS = 10;
export const ARMS = ['N', 'D2g', 'D2', 'D3'] as const;
export type D3Arm = typeof ARMS[number];
export const CFG: Record<Exclude<D3Arm, 'N'>, MotorConfig> = {
  D2g: { ...ND1D, warpGuard: true }, D2: { ...ND1D, warpGuard: true, dissolve: true }, D3: { ...ND1D, warpGuard: true, dissolve: true, traceRenew: true } };
export function d3Run(start: Record<string, any>, ticks: Wt3lTick[], arm: D3Arm, copy: number, days = DAYS): LongResult {
  if (arm === 'N') return longRun(start, ticks, 'N', copy, { days, idPrefix: 'desire3' });
  return longRun(start, ticks, arm, copy, { days, idPrefix: 'desire3', cfg: CFG[arm], subject: arm === 'D3', shuffle: false });
}
