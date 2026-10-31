/**
 * A small, deterministic lexical lens for the Anthropic language relay.
 * The four matrix rows are read in turn from the current substrate step.
 * They affect wording only; they do not alter Numogram transitions, memory,
 * Governor decisions, or the relay's generation parameters.
 */

export const WATCHTOWER_MATRIX = [
  ['m', 'a', 'd', 'o', 'l', 'g'],
  ['v', 'r', 'e', 'g', 'z', 'o'],
  ['i', 'o', 'i', 'a', 'd', 't'],
  ['b', 'i', 't', 'o', 'm', 'e'],
] as const;

// Project glosses supplied with this design, applied only when the full key is
// present contiguously in the active row. They are not asserted as translations.
const KEY_GLOSSES: Readonly<Record<string, string>> = {
  MAD: 'creative origin',
  OLG: 'material grounding',
  VREG: 'sonic resonance',
  ZODACAR: 'dynamic velocity',
  IOIAD: 'temporal distortion',
  TORZU: 'structural escalation',
  BITOM: 'destructive transformation',
  EXENTSER: 'chaos and linear breakage',
};

export interface WatchtowerContext {
  phase: number;
  phaseLabel: string;
  rowSignature: string;
  keys: ReadonlyArray<{ token: string; gloss: string }>;
  characterEntropy: number;
}

/** Read a deterministic four-phase cycle from the current Numogram step. */
export function getWatchtowerContext(step: number): WatchtowerContext {
  const phase = ((Math.floor(step) - 1) % WATCHTOWER_MATRIX.length + WATCHTOWER_MATRIX.length) % WATCHTOWER_MATRIX.length;
  const row = WATCHTOWER_MATRIX[phase];
  const rowSignature = row.join('').toUpperCase();
  const counts = new Map<string, number>();
  for (const character of row) counts.set(character, (counts.get(character) ?? 0) + 1);
  const characterEntropy = [...counts.values()].reduce((sum, count) => {
    const probability = count / row.length;
    return sum - probability * Math.log2(probability);
  }, 0);

  return {
    phase,
    phaseLabel: `row ${phase + 1} of ${WATCHTOWER_MATRIX.length}`,
    rowSignature,
    keys: Object.entries(KEY_GLOSSES)
      .filter(([token]) => rowSignature.includes(token))
      .map(([token, gloss]) => ({ token, gloss })),
    characterEntropy: Number(characterEntropy.toFixed(3)),
  };
}

export interface TextShapeMetrics {
  wordCount: number;
  lexicalDiversity: number;
  meanWordLength: number;
  sentenceCount: number;
}

/** Describes surface form only; these metrics are not an intelligence test. */
export function measureTextShape(text: string): TextShapeMetrics {
  const words: string[] = [...(text.match(/[\p{L}\p{N}’'-]+/gu) ?? [])];
  const normalized = words.map(word => word.toLocaleLowerCase());
  const uniqueWords = new Set(normalized);
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.filter(part => part.trim()) ?? [];

  return {
    wordCount: words.length,
    lexicalDiversity: words.length ? Number((uniqueWords.size / words.length).toFixed(3)) : 0,
    meanWordLength: words.length
      ? Number((words.reduce((sum: number, word: string) => sum + word.length, 0) / words.length).toFixed(2))
      : 0,
    sentenceCount: sentences.length,
  };
}
