import { canonicalSha256 } from './sha256';

/**
 * hashUtils.ts
 *
 * Provides cryptographic SHA-256 digests (64 hex characters) using FIPS 180-4 compliant SHA-256.
 */
export function computeShaDigest(data: string | object): string {
  return canonicalSha256(data);
}

export function computeSha256Hex(data: string | object): string {
  return canonicalSha256(data);
}
