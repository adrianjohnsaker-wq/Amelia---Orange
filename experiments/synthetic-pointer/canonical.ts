import { createHash } from 'node:crypto';

// Canonical JSON round-trips every finite IEEE-754 value, including negative zero.
// A reserved object encoding prevents JSON.stringify from silently losing -0.
const NEG_ZERO = '$sxi_negative_zero';
function normalise(value: unknown, inArray = false): unknown {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Non-finite numbers are not valid checkpoint data');
    return Object.is(value, -0) ? { [NEG_ZERO]: true } : value;
  }
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (value === undefined && inArray) return null;
  if (Array.isArray(value)) return value.map(v => normalise(v, true));
  if (value && typeof value === 'object') {
    const input = value as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(input, NEG_ZERO)) throw new Error('Reserved checkpoint key');
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(input).sort()) {
      if (input[key] !== undefined) out[key] = normalise(input[key]);
    }
    return out;
  }
  throw new Error('Unsupported checkpoint value: ' + typeof value);
}
export const canonical = (value: unknown): string => JSON.stringify(normalise(value));
export const sha256 = (bytes: string | Buffer): string => createHash('sha256').update(bytes).digest('hex');
export const digest = (value: unknown): string => sha256(canonical(value));
export function decodeCanonical(text: string): unknown {
  return JSON.parse(text, (_key, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value) &&
        Object.keys(value).length === 1 && value[NEG_ZERO] === true) return -0;
    return value;
  });
}
