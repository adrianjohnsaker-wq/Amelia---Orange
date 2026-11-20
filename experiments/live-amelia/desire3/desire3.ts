/**
 * DESIRE-3 (experiments/live-amelia/desire3/REGISTRATION.md): a dose-response of how long desire's connections live.
 * Arms over LONG-1's machinery (../long1/long1.ts, ../long1/motor.ts), 10 days, on LONG-1's 12 copies and spans; every
 * motor arm has the Warp guard:
 *   N    ND-1b                                  D2g  guard only: kept connections never fade (DESIRE-2)
 *   H10  dissolution, half-life 10,000 steps    H3   dissolution, half-life 3,000 steps
 *   D2   dissolution, half-life 1,000 (DESIRE-2) D3   D2 + renewal by the Outside's trace
 * Renewal (motor.ts, traceRenew): while the trace's mark on a kept connection's edge is at least D3.TMIN = 0.05, the
 * connection's flux gains D3.RENEW (0.01) x mark x (1 - flux) each step. D3 carries the residual subject (non-steering).
 */
import { longRun, type LongResult } from '../long1/long1';
import { ND1D, type MotorConfig } from '../long1/motor';
import type { Wt3lTick } from '../../../src/cloud/wt3l';
export const DAYS = 10;
export const ARMS = ['N', 'D2g', 'H10', 'H3', 'D2', 'D3'] as const;
/** The four candidates, longest-lived first: the order in which the selection rule takes the first that passes. */
export const CANDIDATES = ['H10', 'H3', 'D3', 'D2'] as const;
export type D3Arm = typeof ARMS[number];
export const CFG: Record<Exclude<D3Arm, 'N'>, MotorConfig> = {
  D2g: { ...ND1D, warpGuard: true }, H10: { ...ND1D, warpGuard: true, dissolve: true, hld: 10000 }, H3: { ...ND1D, warpGuard: true, dissolve: true, hld: 3000 },
  D2: { ...ND1D, warpGuard: true, dissolve: true }, D3: { ...ND1D, warpGuard: true, dissolve: true, traceRenew: true } };
export function d3Run(start: Record<string, any>, ticks: Wt3lTick[], arm: D3Arm, copy: number, days = DAYS): LongResult {
  if (arm === 'N') return longRun(start, ticks, 'N', copy, { days, idPrefix: 'desire3' });
  return longRun(start, ticks, arm, copy, { days, idPrefix: 'desire3', cfg: CFG[arm], subject: arm === 'D3', shuffle: false });
}
