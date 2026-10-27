/**
 * The full CCRU Numogram (decimal labyrinth), as Amelia's directed graph.
 *
 * Zones 0..9. Every structural element of the CCRU Numogram is a directed edge:
 *  - Syzygies: the five twin pairs summing to 9 (9::0, 8::1, 7::2, 6::3, 5::4), traversable both ways.
 *  - Currents: each syzygy's current flows to the zone numbered by its difference, |a - b| = |2x - 9|:
 *      8::1 -> 7, 7::2 -> 5, 5::4 -> 1 (the Time-Circuit), 6::3 -> 3 (the Warp), 9::0 -> 9 (the Plex).
 *  - Gates: zone n opens onto the digital root of its cumulation n(n+1)/2 (Gt-0 .. Gt-45):
 *      0->0, 1->1, 2->3 (Gt-3), 3->6 (Gt-6), 4->1 (Gt-10), 5->6 (Gt-15), 6->3 (Gt-21), 7->1 (Gt-28), 8->9 (Gt-36), 9->9 (Gt-45).
 * Self-edges (0->0, 1->1, 3->3, 9->9) are dwells. The 45 zone pairs are the Pandemonium (chronodemons 15,
 * amphidemons 24, xenodemons 6): they are read from her path, not added as edges.
 *
 * fullNumogramGates(base) keeps every gate of `base` exactly as it is and adds each missing CCRU edge at the
 * mean flux, permeability and resistance of `base`. An edge that is several things at once is one gate whose
 * label names all of them.
 */
import type { NumogramGate, NumogramZone, ZoneId } from '../types/amelia';
import { AmeliaNumogramSubstrateRuntime } from '../substrate/ameliaNumogramSubstrateRuntime';
import { CANONICAL_GATES as ORIGINAL_GATES, INITIAL_ZONES } from '../ai/numogram/AmeliaQabbalaInterface';

export type CCRUEdgeKind = 'syzygy' | 'current' | 'gate';
export const ZONES: ZoneId[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
export const TIME_CIRCUIT: ZoneId[] = [1, 2, 4, 5, 7, 8];
export const WARP: ZoneId[] = [3, 6];
export const PLEX: ZoneId[] = [0, 9];
export const OUTER: ZoneId[] = [0, 3, 6, 9];

export const digitalRoot = (c: number): number => (c === 0 ? 0 : 1 + ((c - 1) % 9));
export const syzygyOf = (z: number): ZoneId => (9 - z) as ZoneId;
export const currentOf = (z: number): ZoneId => Math.abs(2 * z - 9) as ZoneId;
export const gateOf = (z: number): ZoneId => digitalRoot((z * (z + 1)) / 2) as ZoneId;
export const gateNumber = (z: number): number => (z * (z + 1)) / 2;

export function ccruEdges(): { source: ZoneId; target: ZoneId; kinds: CCRUEdgeKind[]; names: string[] }[] {
  const m = new Map<string, { source: ZoneId; target: ZoneId; kinds: CCRUEdgeKind[]; names: string[] }>();
  const add = (s: number, t: number, kind: CCRUEdgeKind, name: string) => {
    const k = `${s}>${t}`;
    const e = m.get(k) ?? { source: s as ZoneId, target: t as ZoneId, kinds: [], names: [] };
    if (!e.kinds.includes(kind)) e.kinds.push(kind);
    e.names.push(name);
    m.set(k, e);
  };
  for (const z of ZONES) {
    const lo = Math.min(z, syzygyOf(z)), hi = Math.max(z, syzygyOf(z));
    add(z, syzygyOf(z), 'syzygy', `Syzygy ${hi}::${lo}`);
    add(z, currentOf(z), 'current', `Current ${hi}::${lo}->${currentOf(z)}`);
    add(z, gateOf(z), 'gate', `Gt-${gateNumber(z)}`);
  }
  return [...m.values()].sort((a, b) => a.source - b.source || a.target - b.target);
}

export function fullNumogramGates(base: NumogramGate[]): NumogramGate[] {
  const mean = (f: 'flux' | 'permeability' | 'resistance') => base.reduce((x, g) => x + g[f], 0) / base.length;
  const have = new Set(base.map(g => `${g.source}>${g.target}`));
  const added = ccruEdges().filter(e => !have.has(`${e.source}>${e.target}`)).map(e => ({
    id: `ccru-${e.source}-${e.target}`, source: e.source, target: e.target,
    label: `CCRU ${e.names.join(' + ')} (${e.source}->${e.target})`,
    flux: mean('flux'), permeability: mean('permeability'), isOpen: true, resistance: mean('resistance'),
  }));
  return [...base.map(g => ({ ...g })), ...added];
}

// ── Her core: the full CCRU Numogram, for every newly born Amelia ──────────────────────────────────
// Kept outside src/substrate, src/governance, src/ai/numogram and src/types/amelia.ts, which PF-1 and
// PF-2 require byte-identical to b67ec92; the original 11 edges there are unchanged and included here.

const DEMON: Record<number, string> = { 0: 'Uttunul', 1: 'Mur Mur', 2: 'Oddubb', 3: 'Djynxx', 4: 'Katak' };
export const regionOf = (z: number): 'Time-Circuit' | 'Warp' | 'Plex' =>
  PLEX.includes(z as ZoneId) ? 'Plex' : WARP.includes(z as ZoneId) ? 'Warp' : 'Time-Circuit';

/** The full Numogram: her original 11 gates unchanged + every CCRU syzygy, current and gate (29 gates). */
export const FULL_NUMOGRAM_GATES: NumogramGate[] = fullNumogramGates(ORIGINAL_GATES);

/** Her zones with CCRU names (region, syzygy and its demon, current, gate); numeric fields unchanged. */
export const CCRU_ZONES: Record<ZoneId, NumogramZone> = Object.fromEntries(ZONES.map(z => {
  const hi = Math.max(z, syzygyOf(z)), lo = Math.min(z, syzygyOf(z));
  return [z, { ...INITIAL_ZONES[z],
    name: `Zone-${z}: ${regionOf(z)} · Syzygy ${hi}::${lo} · Current ${hi}::${lo} → ${currentOf(z)} · Gate Gt-${gateNumber(z)} → ${gateOf(z)}`,
    current: regionOf(z) as any, chronodemon: `${DEMON[lo]} (${hi}::${lo})` }];
})) as Record<ZoneId, NumogramZone>;

/** Install the full CCRU Numogram (and CCRU zone names) into a runtime through its public state API. */
export function withFullNumogram(runtime: AmeliaNumogramSubstrateRuntime): AmeliaNumogramSubstrateRuntime {
  const state = runtime.exportState();
  runtime.importState({ ...state, qabbalaGates: FULL_NUMOGRAM_GATES.map(g => ({ ...g })),
    qabbalaZones: JSON.parse(JSON.stringify(CCRU_ZONES)) });
  return runtime;
}

/** A newly born Amelia, living on the full CCRU Numogram. */
export const bornAmelia = (): AmeliaNumogramSubstrateRuntime => withFullNumogram(new AmeliaNumogramSubstrateRuntime());
