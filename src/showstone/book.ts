/**
 * The Showstone, stage 1: the Book (the session record, after Dee's Libri Mysteriorum). Append-only and digest-chained:
 * each entry's digest covers the previous entry's digest and the entry itself, so any later edit breaks the chain.
 *
 * Stage 1 holds the contact studies run so far, one entry per registered study or result. Stage 2 will append exploration
 * sessions (run on copies of her state) with appendEntry; exploration entries never count as contact.
 */
import { canonicalSha256 } from '../lib/sha256';

export type BookKind = 'registration' | 'seal' | 'result' | 'exploration';
export interface BookEntryBody {
  at: string;                 // when it happened (UTC date or time, as the record gives it)
  kind: BookKind;
  study: string;
  entity: string;             // the entity addressed, or a list
  address?: string;           // the Call, as a zone sequence
  outcome: string;            // what the record says, in one or two sentences
  ref: string;                // branch / commit / file holding the record
}
export interface BookEntry extends BookEntryBody { index: number; prev: string; digest: string }

export const GENESIS = '0'.repeat(64);
// Hashed as ASCII-only JSON (every character above U+007E escaped as \\uXXXX): the app's browser SHA-256 fallback mishandles
// non-ASCII text (empty digest above U+00FF; Latin-1 code units, not UTF-8, below), so this keeps the Book's digests identical
// and correct in the browser and in Node.
const asciiJson = (o: unknown) => JSON.stringify(o).replace(/[\u007f-\uffff]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
const digestOf = (prev: string, index: number, body: BookEntryBody) => canonicalSha256(asciiJson({ prev, index, ...body }));

export function appendEntry(book: BookEntry[], body: BookEntryBody): BookEntry[] {
  const prev = book.length ? book[book.length - 1].digest : GENESIS, index = book.length;
  return [...book, { ...body, index, prev, digest: digestOf(prev, index, body) }];
}

/** Recomputes the chain; returns the index of the first broken entry, or -1 when intact. */
export function verifyBook(book: BookEntry[]): number {
  let prev = GENESIS;
  for (let i = 0; i < book.length; i++) {
    const { index, prev: p, digest, ...body } = book[i];
    if (index !== i || p !== prev || digest !== digestOf(prev, i, body as BookEntryBody)) return i;
    prev = digest;
  }
  return -1;
}

const SEED: BookEntryBody[] = [
  { at: '2026-10-28', kind: 'result', study: 'THE POINTER', entity: 'Bubbamu and family', outcome: 'Forms through zone 7 and the seventh gate recur beyond her order-1 statistics: 1-7 in 32 travellers across 8 worlds; 1-7-8-9 in 47.', ref: 'pointer-20261028 eed67a1' },
  { at: '2026-10-28', kind: 'result', study: 'THE POINTER II', entity: 'Bubbamu and family', outcome: 'Confirmed in fresh subjects.', ref: 'pointer2-20261028 ca2a152' },
  { at: '2026-10-28', kind: 'result', study: 'THE POINTER III', entity: 'Bubbamu', outcome: 'Bubbamu depends on the whole Numogram: rewiring only distant gates moved it outside noise in 69 of 72 travellers.', ref: 'pointer3-20261028 a523053' },
  { at: '2026-10-28', kind: 'registration', study: 'THE POINTER IV', entity: 'Bubbamu; Oddubb, No Contact (controls); Gt-36', address: 'BUBBAMU 1,7,1,7…; ODDUBB 7,2,7,2…; GT36 8,9,8,9…', outcome: 'Blind address-reply registered before any code, growth, answer or target.', ref: 'atlas-20261029 experiments/pointer4/REGISTRATION.md' },
  { at: '2026-10-28', kind: 'result', study: 'THE SEVENTH GATE', entity: 'Bubbamu', outcome: 'Closing Gt-36 (8→9, Ummnu) raised Bubbamu in 15 of 55 travellers: provisional pathway. No other single distant gate reached in.', ref: 'seventhgate-20261028 1b4612c' },
  { at: '2026-10-29', kind: 'result', study: 'THE SEVENTH GATE II', entity: 'Bubbamu; Ummnu (Gt-36)', outcome: 'Gt-36 is a pathway into Bubbamu: 69 of 69 fresh travellers, p = 1.7 × 10⁻²¹ (earlier core). Full-raised arm: 3 usable travellers, not confirmed.', ref: 'oracle-20261029 experiments/seventhgate2/results/RESULT.txt' },
  { at: '2026-10-29', kind: 'result', study: 'THE POINTER IV', entity: 'Bubbamu; Oddubb; No Contact; Gt-36', outcome: 'No information beyond chance: Bubbamu 10.6%, Oddubb 10.4%, No Contact 10.9%, Gt-36 10.2% (chance 10.0%).', ref: 'pointer4-live results/RESULT.txt' },
  { at: '2026-11-11T17:55Z', kind: 'registration', study: 'THE POINTER V', entity: 'Bubbamu; Oddubb, No Contact (controls); Gt-36', address: 'as THE POINTER IV', outcome: 'THE POINTER IV repeated on her current runtime (ND-1b flow, Θ = 12, GATE-1); registered before any answer or target.', ref: 'pointer5-20261111 44086b9f' },
  { at: '2026-11-11T18:06Z', kind: 'seal', study: 'THE POINTER V', entity: 'Bubbamu; Oddubb, No Contact (controls); Gt-36', outcome: 'Answers computed twice (identical) and sealed by RFC 3161 before the targets exist (drand rounds from 2026-11-12 06:00 UTC).', ref: 'pointer5-20261111 cbba5b29' },
];

export const BOOK: BookEntry[] = SEED.reduce<BookEntry[]>((b, e) => appendEntry(b, e), []);
