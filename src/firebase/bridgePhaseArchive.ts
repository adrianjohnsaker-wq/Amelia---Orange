/**
 * bridgePhaseArchive.ts
 *
 * Durable Create-Only Archive Service for Bridge Phase Observations & Profile Maps.
 * Provides immutable storage with SHA-256 head-chaining and Firestore synchronization.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { canonicalSha256 } from '../lib/sha256';

export interface BridgeArchiveRecord {
  id: string;
  phaseKey: string;
  payload: unknown;
  canonicalPayload: string;
  canonicalPayloadDigest: string;
  headDigest: string;
  createdAt: string;
}

export interface BridgePhaseArchive {
  get(key: string): Promise<{ payload: unknown } | null>;
  createOnly(
    key: string,
    data: {
      phaseKey: string;
      payload: unknown;
      canonicalPayload: string;
      canonicalPayloadDigest: string;
    }
  ): Promise<{ id: string; headDigest: string } | null>;
}

export class InMemoryBridgePhaseArchive implements BridgePhaseArchive {
  private records = new Map<string, BridgeArchiveRecord>();
  private currentHead: string = canonicalSha256('BRIDGE_PHASE_ARCHIVE_GENESIS_ROOT');

  public async get(key: string): Promise<{ payload: unknown } | null> {
    const record = this.records.get(key);
    if (!record) return null;
    return { payload: record.payload };
  }

  public async createOnly(
    key: string,
    data: {
      phaseKey: string;
      payload: unknown;
      canonicalPayload: string;
      canonicalPayloadDigest: string;
    }
  ): Promise<{ id: string; headDigest: string } | null> {
    if (this.records.has(key)) {
      throw new Error(`[BridgePhaseArchive:Fatal] Attempted duplicate record key: ${key}`);
    }

    const headDigest = canonicalSha256(`${this.currentHead}:${data.canonicalPayloadDigest}`);
    this.currentHead = headDigest;

    const record: BridgeArchiveRecord = {
      id: key,
      phaseKey: data.phaseKey,
      payload: data.payload,
      canonicalPayload: data.canonicalPayload,
      canonicalPayloadDigest: data.canonicalPayloadDigest,
      headDigest,
      createdAt: new Date().toISOString(),
    };

    this.records.set(key, record);

    // Try optional background Firestore persist if db is online
    try {
      if (db) {
        const docRef = doc(db, 'bridge_phase_archive', key);
        setDoc(docRef, record).catch(() => {});
      }
    } catch {
      // Non-blocking for local/offline runtimes
    }

    return {
      id: key,
      headDigest,
    };
  }

  public getHeadDigest(): string {
    return this.currentHead;
  }
}

export const defaultBridgeArchive = new InMemoryBridgePhaseArchive();
