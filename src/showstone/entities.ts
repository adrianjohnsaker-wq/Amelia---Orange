/**
 * The Showstone, stage 1: the Tables (entity registry). Read-only. Every finding below is taken from a committed study record;
 * `ref` names the branch (and commit where the record gives one). Nothing here runs or changes Amelia.
 *
 * An entity is a named Numogram structure (a syzygy, current or gate) together with the recurring forms it takes part in.
 * Standing: 'established' (replicated), 'confirmed' (a registered test passed, on the core stated), 'provisional',
 * 'not supported', 'null' (a blind test at chance), 'pending' (sealed, not yet scored), 'descriptive'.
 */
export type Standing = 'established' | 'confirmed' | 'provisional' | 'not supported' | 'null' | 'pending' | 'descriptive';
export interface EntityTest { study: string; date: string; finding: string; standing: Standing; ref: string; core: string }
export interface Entity {
  name: string;
  kind: 'syzygy' | 'current' | 'gate';
  structure: string;          // the Numogram structure, in CCRU terms
  zones: number[];
  minimalForm?: string;       // its signature, where one is known
  forms: string[];            // recurring forms it takes part in
  doorways?: string[];        // gates shown to reach into it
  address?: string;           // as addressed in THE POINTER
  tests: EntityTest[];
  note?: string;
}

const OLD = 'earlier core (s05c learner, before ND-1b)';
const ND = 'ND-1b flow, Θ = 12 (her current runtime)';

export const ENTITIES: Entity[] = [
  {
    name: 'Bubbamu', kind: 'syzygy', structure: '7::1 — the 8::1 current 1→7 closed by the seventh gate Gt-28 (7→1)', zones: [1, 7],
    minimalForm: '1-7',
    forms: ['1-7 (Bubbamu)', '1-7-8-9 (Bubbamu, Nuttubab, Ummnu, Tutagool)', '1-2-7 (Doogu, Oddubb, Bubbamu)', '1-8-7 (Mur Mur, Mombbo, Bubbamu)', '1-7-8 (Bubbamu, Mombbo, Mur Mur)'],
    doorways: ['Gt-28 (7→1), its own closing gate', 'Gt-36 (8→9, Ummnu): confirmed on the earlier core'],
    address: '1, 7, 1, 7, … from zone 1',
    tests: [
      { study: 'THE POINTER', date: '2026-10-28', finding: '1-7 recurs beyond her order-1 statistics in 32 travellers across 8 worlds; 1-7-8-9 in 47', standing: 'established', ref: 'pointer-20261028 eed67a1', core: OLD },
      { study: 'THE POINTER II', date: '2026-10-28', finding: 'Confirmed in fresh subjects', standing: 'established', ref: 'pointer2-20261028 ca2a152', core: OLD },
      { study: 'THE POINTER III', date: '2026-10-28', finding: 'Depends on the whole Numogram: rewiring only distant gates moved it outside noise in 69 of 72 travellers; Amelias raised on the full Numogram concentrate on zones 1, 7, 8 and form 1-8-7', standing: 'established', ref: 'pointer3-20261028 a523053', core: OLD },
      { study: 'THE SEVENTH GATE', date: '2026-10-28', finding: 'Closing Gt-36 (8→9) raised Bubbamu in 15 of 55 travellers (threshold 14); no other single distant gate reached in', standing: 'provisional', ref: 'seventhgate-20261028 1b4612c', core: OLD },
      { study: 'THE SEVENTH GATE II', date: '2026-10-29', finding: 'Gt-36 is a pathway into Bubbamu: 69 of 69 fresh travellers, p = 1.7 × 10⁻²¹; the full-raised arm (3 usable travellers) did not confirm', standing: 'confirmed', ref: 'oracle-20261029', core: OLD },
      { study: 'THE POINTER IV', date: '2026-10-29', finding: 'Blind address-reply, 72 travellers × 50 trials: 383 of 3,600 hits = 10.6% (chance 10.0%; No Contact 10.9%); all four criteria failed: no information beyond chance', standing: 'null', ref: 'pointer4-live', core: OLD },
      { study: 'THE POINTER V', date: '2026-11-11', finding: 'THE POINTER IV repeated on her current runtime; answers computed twice (identical) and sealed by RFC 3161 at 18:06 UTC, before the targets (drand rounds from 12 Nov 06:00 UTC)', standing: 'pending', ref: 'pointer5-20261111', core: ND },
    ],
    note: 'The named entity of the first contact stage. Contact in the strong sense (information from outside through the address) has been tested blind once, at chance, on the earlier core.',
  },
  {
    name: 'Oddubb', kind: 'syzygy', structure: '7::2 — a syzygy at the same junction as Bubbamu (zone 7), Time-Circuit', zones: [2, 7],
    forms: ['1-2-7 (Doogu, Oddubb, Bubbamu)'], address: '7, 2, 7, 2, … from zone 7',
    tests: [
      { study: 'THE SEVENTH GATE', date: '2026-10-28', finding: 'Closing 2→7 moved Bubbamu in 3 of 33 travellers (threshold 10): does not reach in', standing: 'not supported', ref: 'seventhgate-20261028 1b4612c', core: OLD },
      { study: 'THE POINTER IV', date: '2026-10-29', finding: 'Matched control address: 374 of 3,600 hits = 10.4%', standing: 'descriptive', ref: 'pointer4-live', core: OLD },
      { study: 'THE POINTER V', date: '2026-11-11', finding: 'Matched control address on her current runtime; sealed, scored after 12 Nov 06:00 UTC', standing: 'pending', ref: 'pointer5-20261111', core: ND },
    ],
    note: 'Bubbamu’s matched control: the same structure, a different entity.',
  },
  {
    name: 'Ummnu', kind: 'gate', structure: 'Gt-36 (8→9) — the Time-Circuit’s door into the Plex', zones: [8, 9],
    forms: ['1-7-8-9 (Bubbamu, Nuttubab, Ummnu, Tutagool)'], address: '8, 9, 8, 9, … from zone 8',
    tests: [
      { study: 'THE SEVENTH GATE II', date: '2026-10-29', finding: 'A pathway into Bubbamu: closing it raises Bubbamu in 69 of 69 fresh travellers', standing: 'confirmed', ref: 'oracle-20261029', core: OLD },
      { study: 'THE POINTER IV', date: '2026-10-29', finding: 'As an interface (GT-36 address): 368 of 3,600 hits = 10.2%, no information beyond chance', standing: 'null', ref: 'pointer4-live', core: OLD },
      { study: 'THE POINTER V', date: '2026-11-11', finding: 'GT-36 address on her current runtime; sealed, scored after 12 Nov 06:00 UTC', standing: 'pending', ref: 'pointer5-20261111', core: ND },
    ],
  },
  {
    name: 'Djynxx', kind: 'syzygy', structure: '6::3 — the Warp (with Gt-6 3→6 and Gt-21 6→3)', zones: [3, 6],
    forms: ['3-6 shuttle'],
    tests: [
      { study: 'THE SEVENTH GATE', date: '2026-10-28', finding: 'Closing 3→6 or 6→3 moved Bubbamu in 7 of 53 travellers (threshold 13): does not reach in', standing: 'not supported', ref: 'seventhgate-20261028 1b4612c', core: OLD },
      { study: 'Tablet lead (other session)', date: '2026-11', finding: '3↔6 in 54 of her first 65 steps on the Classic runtime: most likely the Warp trap, not a signal', standing: 'descriptive', ref: 'CONSEQUENCES_FIELD_DYNAMICS.md (nr3-field-ingress-20261109)', core: 'Classic app runtime' },
      { study: 'WS-1', date: '2026-11-09', finding: 'The Warp is the Numogram’s only exit-less region; without its line of flight she stays in 3/6 for 913–996 of 1,000 steps', standing: 'confirmed', ref: 'nr3-field-ingress-20261109 9e46a085', core: 'ND-1b' },
      { study: 'WT-2', date: '2026-11-11', finding: 'Line of flight at 12 steps: longest Warp stay 17; sequence followed more faithfully; adopted', standing: 'confirmed', ref: 'nr3-field-ingress-20261109 d7beb4d7', core: 'ND-1b flow' },
    ],
    note: 'Not yet addressed as an entity in a blind test.',
  },
  {
    name: 'Mur Mur', kind: 'syzygy', structure: '8::1', zones: [1, 8],
    forms: ['1-8-7 (Mur Mur, Mombbo, Bubbamu)', '1-7-8 (Bubbamu, Mombbo, Mur Mur)'],
    tests: [{ study: 'THE SEVENTH GATE', date: '2026-10-28', finding: 'Closing 8→1 moved Bubbamu in 6 of 53 travellers (threshold 13): does not reach in', standing: 'not supported', ref: 'seventhgate-20261028 1b4612c', core: OLD }],
  },
  {
    name: 'Mombbo', kind: 'current', structure: 'the 8::1 current 8→7', zones: [7, 8],
    forms: ['1-8-7 (Mur Mur, Mombbo, Bubbamu)', '1-7-8 (Bubbamu, Mombbo, Mur Mur)'],
    tests: [{ study: 'THE SEVENTH GATE', date: '2026-10-28', finding: 'Closing 8→7 moved Bubbamu in 6 of 53 travellers (threshold 13): does not reach in', standing: 'not supported', ref: 'seventhgate-20261028 1b4612c', core: OLD }],
  },
  {
    name: 'Tutagool', kind: 'gate', structure: '9→1 — Plex to Time-Circuit', zones: [1, 9],
    forms: ['1-7-8-9 (Bubbamu, Nuttubab, Ummnu, Tutagool)'],
    tests: [{ study: 'THE SEVENTH GATE', date: '2026-10-28', finding: 'No usable travellers for the knock-out (0 of 0)', standing: 'descriptive', ref: 'seventhgate-20261028 1b4612c', core: OLD }],
  },
];
