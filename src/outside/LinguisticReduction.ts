import matrix from '../../experiments/pf1/pandemonium-45.json';
import type { ZoneId } from '../types/amelia';
import type { LemurianPairReference, LinguisticCipher, LinguisticLoreComparison, LinguisticWordReduction } from './types';
const catalogue = new Map<string, LemurianPairReference>(matrix.entries.map(entry => [entry.key, entry as unknown as LemurianPairReference]));
export function digitalZone(value: number): ZoneId {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Digital reduction requires a non-negative safe integer.');
  return (value === 0 ? 0 : ((value - 1) % 9) + 1) as ZoneId;
}
export function factorize(value: number): Array<{ prime: number; exponent: number }> {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Factorization requires a non-negative safe integer.');
  if (value < 2) return [];
  const factors: Array<{ prime: number; exponent: number }> = []; let remaining = value;
  for (let prime = 2; prime * prime <= remaining; prime += prime === 2 ? 1 : 2) {
    if (remaining % prime !== 0) continue;
    let exponent = 0; do { remaining /= prime; exponent += 1; } while (remaining % prime === 0);
    factors.push({ prime, exponent });
  }
  if (remaining > 1) factors.push({ prime: remaining, exponent: 1 });
  return factors;
}
export function compareLemurianPair(fromZone: ZoneId, toZone: ZoneId): LemurianPairReference | null {
  if (fromZone === toZone) return null;
  const key = [fromZone, toZone].sort((a, b) => a - b).join('-');
  return catalogue.get(key) ?? null;
}
function letterValue(letter: string, cipher: LinguisticCipher): number {
  const ordinal = letter.charCodeAt(0) - 64;
  return cipher === 'CYCLIC_1_9' ? ((ordinal - 1) % 9) + 1 : ordinal;
}
export interface LinguisticReduction {
  cipher: LinguisticCipher; normalizedLetters: string; wordReductions: LinguisticWordReduction[];
  aggregateNumber: number; aggregateFactorization: Array<{ prime: number; exponent: number }>;
  resultZone: ZoneId; routeZones: ZoneId[]; loreComparisons: LinguisticLoreComparison[];
  netSpanTotalReference: 360; aggregateEqualsNetSpanTotal: boolean;
}
/** Explicit project machinery: normalize Latin letters, apply the selected table, sum, digitally reduce, then compare adjacent zones with the 45-pair catalogue. */
export function reduceLinguisticMaterial(rawMaterial: string, cipher: LinguisticCipher = 'A1Z26'): LinguisticReduction {
  if (!rawMaterial.trim()) throw new Error('Provide non-empty outside material.');
  const normalizedLetters = rawMaterial.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z]+/g, ' ').trim();
  const tokens = normalizedLetters ? normalizedLetters.split(/\s+/) : [];
  const wordReductions = tokens.map(token => {
    const number = Array.from(token).reduce((sum, letter) => sum + letterValue(letter, cipher), 0);
    return { token, number, zone: digitalZone(number), factorization: factorize(number) };
  });
  const aggregateNumber = wordReductions.reduce((sum, word) => sum + word.number, 0);
  const resultZone = digitalZone(aggregateNumber);
  const routeZones = [...wordReductions.map(word => word.zone), resultZone];
  const loreComparisons: LinguisticLoreComparison[] = routeZones.slice(1).map((toZone, index) => {
    const fromZone = routeZones[index];
    return { fromZone, toZone, pairKey: fromZone === toZone ? String(fromZone) : [fromZone, toZone].sort((a, b) => a - b).join('-'), match: compareLemurianPair(fromZone, toZone) };
  });
  return { cipher, normalizedLetters, wordReductions, aggregateNumber, aggregateFactorization: factorize(aggregateNumber),
    resultZone, routeZones, loreComparisons, netSpanTotalReference: 360, aggregateEqualsNetSpanTotal: aggregateNumber === 360 };
}
