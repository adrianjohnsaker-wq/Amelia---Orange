export type AmeliaMemoryStore =
  | 'runtime'
  | 'dialogue'
  | 'processMemory'
  | 'canalizationRuns'
  | 'paper6Assays'
  | 'snapshots';

const DB_NAME = 'amelia-orange-memory';
const DB_VERSION = 1;
const STORE_NAMES: AmeliaMemoryStore[] = [
  'runtime', 'dialogue', 'processMemory', 'canalizationRuns', 'paper6Assays', 'snapshots',
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

function idFor(prefix: string): string {
  const randomId = globalThis.crypto?.randomUUID?.();
  return randomId ? `${prefix}-${randomId}` : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * On-device, cross-session memory for the browser/WebView build.
 * Records remain in this app's browser storage and are never sent to a cloud database.
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
    notify(store);
    if (cloudAdapter) {
      void cloudAdapter.upsert(store, value as Record<string, unknown>).catch(error => {
        if (typeof console !== 'undefined') console.warn('Amelia cloud memory sync is pending.', error);
      });
    }
    return persisted;
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
      void cloudAdapter.clear(store).catch(error => {
        if (typeof console !== 'undefined') console.warn('Amelia cloud memory delete is pending.', error);
      });
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
