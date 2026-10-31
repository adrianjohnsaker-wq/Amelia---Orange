export type AmeliaMemoryStore =
  | 'runtime'
  | 'dialogue'
  | 'processMemory'
  | 'canalizationRuns'
  | 'paper6Assays'
  | 'snapshots'
  | 'watchtowerEncounters';

const DB_NAME = 'amelia-orange-memory';
const DB_VERSION = 2;
const STORE_NAMES: AmeliaMemoryStore[] = [
  'runtime', 'dialogue', 'processMemory', 'canalizationRuns', 'paper6Assays', 'snapshots', 'watchtowerEncounters',
];

type StoredRecord = { id: string; [key: string]: unknown };

export interface AmeliaCloudAdapter {
  upsert(store: AmeliaMemoryStore, record: Record<string, unknown>): Promise<void>;
  clear(store: AmeliaMemoryStore): Promise<void>;
}

let cloudAdapter: AmeliaCloudAdapter | null = null;
const listeners = new Map<AmeliaMemoryStore, Set<() => void>>();
const fallback = new Map<AmeliaMemoryStore, Map<string, StoredRecord>>();
let persistenceAvailable = true;
let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      persistenceAvailable = false;
      reject(new Error('IndexedDB is unavailable in this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of STORE_NAMES) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { persistenceAvailable = false; reject(request.error ?? new Error('Could not open Amelia local memory.')); };
  });
  return dbPromise;
}

function notify(store: AmeliaMemoryStore): void {
  for (const listener of listeners.get(store) ?? []) listener();
}

function reportCloudError(error: unknown): void {
  if (typeof console !== 'undefined') console.warn('Amelia cloud memory sync failed; the local copy remains available.', error);
  if (typeof window !== 'undefined') {
    const message = error instanceof Error ? error.message : 'Supabase memory sync failed.';
    window.dispatchEvent(new CustomEvent('amelia-cloud-sync-error', { detail: message }));
  }
}

function idFor(prefix: string): string {
  const randomId = globalThis.crypto?.randomUUID?.();
  return randomId ? `${prefix}-${randomId}` : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Cross-session memory for the browser/WebView build. IndexedDB is canonical;
 * configured authenticated cloud sync mirrors supported stores when enabled.
 */
export class AmeliaIndexedMemory {
  static setCloudAdapter(adapter: AmeliaCloudAdapter | null): void {
    cloudAdapter = adapter;
  }

  static isPersistent(): boolean {
    return persistenceAvailable;
  }

  static createId(prefix: string): string {
    return idFor(prefix);
  }

  static async get<T = StoredRecord>(store: AmeliaMemoryStore, id: string): Promise<T | null> {
    try {
      const db = await openDatabase();
      return await new Promise((resolve, reject) => {
        const request = db.transaction(store, 'readonly').objectStore(store).get(id);
        request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      persistenceAvailable = false;
      return (fallback.get(store)?.get(id) as T | undefined) ?? null;
    }
  }

  static async put<T extends { id: string }>(store: AmeliaMemoryStore, value: T): Promise<boolean> {
    let persisted = true;
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).put(value);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? new Error('Local memory write was aborted.'));
      });
    } catch (error) {
      persistenceAvailable = false;
      persisted = false;
      let records = fallback.get(store);
      if (!records) { records = new Map(); fallback.set(store, records); }
      records.set(value.id, value as StoredRecord);
      if (typeof console !== 'undefined') console.warn('Amelia IndexedDB unavailable; using memory for this session.', error);
    }
    if (cloudAdapter) {
      try {
        await cloudAdapter.upsert(store, value as Record<string, unknown>);
      } catch (error) {
        persisted = false;
        reportCloudError(error);
      }
    }
    notify(store);
    return persisted;
  }

  /** Append-only insert used for provenance records; existing ids are never overwritten. */
  static async add<T extends { id: string }>(store: AmeliaMemoryStore, value: T): Promise<boolean> {
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).add(value);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? new Error('Append-only memory write was aborted.'));
      });
    } catch (error) {
      if (typeof console !== 'undefined') console.warn('Append-only encounter storage failed.', error);
      return false;
    }
    if (cloudAdapter) {
      try { await cloudAdapter.upsert(store, value as Record<string, unknown>); }
      catch (error) { reportCloudError(error); }
    }
    notify(store);
    return true;
  }

  static async list<T = StoredRecord>(store: AmeliaMemoryStore, limit = 200): Promise<T[]> {
    try {
      const db = await openDatabase();
      const records = await new Promise<T[]>((resolve, reject) => {
        const request = db.transaction(store, 'readonly').objectStore(store).getAll();
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
      });
      return records.sort((a, b) => String((b as any).timestamp ?? '').localeCompare(String((a as any).timestamp ?? ''))).slice(0, limit);
    } catch {
      persistenceAvailable = false;
      const records = [...(fallback.get(store)?.values() ?? [])] as T[];
      return records.sort((a, b) => String((b as any).timestamp ?? '').localeCompare(String((a as any).timestamp ?? ''))).slice(0, limit);
    }
  }

  static async clear(store: AmeliaMemoryStore): Promise<void> {
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? new Error('Local memory clear was aborted.'));
      });
    } catch {
      persistenceAvailable = false;
      fallback.set(store, new Map());
    }
    notify(store);
    if (cloudAdapter) {
      try {
        await cloudAdapter.clear(store);
      } catch (error) {
        reportCloudError(error);
      }
    }
  }

  static subscribe(store: AmeliaMemoryStore, callback: () => void): () => void {
    let storeListeners = listeners.get(store);
    if (!storeListeners) { storeListeners = new Set(); listeners.set(store, storeListeners); }
    storeListeners.add(callback);
    void openDatabase().catch(() => undefined);
    return () => storeListeners?.delete(callback);
  }

  static async exportAll(): Promise<Record<AmeliaMemoryStore, StoredRecord[]>> {
    const entries = await Promise.all(STORE_NAMES.map(async store => [store, await this.list(store, 10000)] as const));
    return Object.fromEntries(entries) as Record<AmeliaMemoryStore, StoredRecord[]>;
  }
}
