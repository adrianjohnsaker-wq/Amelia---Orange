import { AmeliaIndexedMemory, AmeliaMemoryStore } from './ameliaIndexedMemory';

const SUPABASE_URL = 'https://rcgmtdponfljpribggsq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_3v_kyheXh9ODr0qQl1cXdg_5kPbHQIm';
const SESSION_KEY = 'amelia_supabase_session_v1';
const OWNER_KEY = 'amelia_supabase_memory_owner_v1';
const STORES: AmeliaMemoryStore[] = ['runtime', 'dialogue', 'processMemory', 'canalizationRuns', 'paper6Assays', 'snapshots', 'watchtowerEncounters'];

export interface AmeliaCloudSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: { id: string; email?: string };
}

type CloudRow = { store: AmeliaMemoryStore; record_id: string; payload: Record<string, unknown>; updated_at: string };
type AuthListener = (session: AmeliaCloudSession | null) => void;

const listeners = new Set<AuthListener>();

async function fetchTimed(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
let sessionCache: AmeliaCloudSession | null | undefined;
let redirectSessionPromise: Promise<AmeliaCloudSession | null> | null = null;

async function restoreAuthRedirect(): Promise<AmeliaCloudSession | null> {
  if (typeof window === 'undefined' || !window.location.hash) return null;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const error = params.get('error_description') || params.get('error');
  if (error) {
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    throw new Error(error);
  }
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken) return null;

  const user = await requestJson('/auth/v1/user', { method: 'GET' }, accessToken);
  if (!user?.id) throw new Error('Supabase confirmation returned no user identity.');
  const session: AmeliaCloudSession = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: Date.now() + Number(params.get('expires_in') || 3600) * 1000,
    user: { id: user.id, email: user.email },
  };
  setSession(session);
  window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
  return session;
}

async function getRedirectSession(): Promise<AmeliaCloudSession | null> {
  if (!redirectSessionPromise) {
    redirectSessionPromise = restoreAuthRedirect();
  }
  try {
    return await redirectSessionPromise;
  } finally {
    redirectSessionPromise = null;
  }
}

function readSavedSession(): AmeliaCloudSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as AmeliaCloudSession : null;
  } catch {
    return null;
  }
}

function setSession(session: AmeliaCloudSession | null): void {
  sessionCache = session;
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // Supabase remains usable for this page session when browser storage is unavailable.
  }
  for (const listener of listeners) listener(session);
}

function sessionFromResponse(value: any): AmeliaCloudSession | null {
  if (!value?.access_token || !value?.refresh_token || !value?.user?.id) return null;
  return {
    access_token: value.access_token,
    refresh_token: value.refresh_token,
    expires_at: Date.now() + Number(value.expires_in || 3600) * 1000,
    user: { id: value.user.id, email: value.user.email },
  };
}

async function requestJson(path: string, init: RequestInit = {}, token?: string): Promise<any> {
  const response = await fetchTimed(SUPABASE_URL + path, {
    ...init,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(init.headers || {}),
    },
  });
  const value = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = value.msg || value.message || value.error_description || value.error || 'Supabase request failed (' + response.status + ').';
    throw new Error(String(message));
  }
  return value;
}

export class AmeliaSupabaseMemory {
  static async signUp(email: string, password: string): Promise<{ session: AmeliaCloudSession | null; confirmationRequired: boolean }> {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const useWebRedirect = origin && !origin.includes('appassets.androidplatform.net');
    const redirect = useWebRedirect ? '?redirect_to=' + encodeURIComponent(origin) : '';
    const value = await requestJson('/auth/v1/signup' + redirect, {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const session = sessionFromResponse(value);
    if (session) setSession(session);
    return { session, confirmationRequired: !session };
  }

  static async signIn(email: string, password: string): Promise<AmeliaCloudSession> {
    const value = await requestJson('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const session = sessionFromResponse(value);
    if (!session) throw new Error('Supabase did not return a signed-in session.');
    setSession(session);
    return session;
  }

  static async signOut(): Promise<void> {
    const session = await this.getSession();
    if (session) {
      await requestJson('/auth/v1/logout?scope=local', { method: 'POST' }, session.access_token).catch(() => undefined);
    }
    AmeliaIndexedMemory.setCloudAdapter(null);
    setSession(null);
  }

  static subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  static async getSession(): Promise<AmeliaCloudSession | null> {
    if (sessionCache === undefined) sessionCache = readSavedSession();
    if (!sessionCache) {
      const redirected = await getRedirectSession();
      if (redirected) return redirected;
      return null;
    }
    if (sessionCache.expires_at > Date.now() + 60_000) return sessionCache;

    try {
      const value = await requestJson('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: sessionCache.refresh_token }),
      });
      const renewed = sessionFromResponse(value);
      if (!renewed) throw new Error('Supabase session refresh failed.');
      setSession(renewed);
      return renewed;
    } catch (error) {
      setSession(null);
      throw error;
    }
  }

  private static async fetchCloudRows(session: AmeliaCloudSession): Promise<CloudRow[]> {
    const rows: CloudRow[] = [];
    for (let offset = 0; ; offset += 500) {
      const response = await fetchTimed(
        SUPABASE_URL + '/rest/v1/amelia_memory_records?select=store,record_id,payload,updated_at&order=updated_at.asc',
        {
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: 'Bearer ' + session.access_token,
            Range: offset + '-' + (offset + 499),
            'Range-Unit': 'items',
          },
        },
      );
      const batch = await response.json().catch(() => []);
      if (!response.ok) throw new Error('Supabase memory read failed (' + response.status + ').');
      if (!Array.isArray(batch)) throw new Error('Supabase memory returned an invalid archive.');
      rows.push(...batch as CloudRow[]);
      if (batch.length < 500) break;
    }
    return rows;
  }

  private static async upsertRecord(store: AmeliaMemoryStore, record: Record<string, unknown>): Promise<void> {
    const session = await this.getSession();
    if (!session) throw new Error('Sign in to sync Amelia memory.');
    await requestJson('/rest/v1/amelia_memory_records?on_conflict=user_id,store,record_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify([{
        user_id: session.user.id,
        store,
        record_id: String(record.id),
        payload: record,
        updated_at: new Date().toISOString(),
      }]),
    }, session.access_token);
  }

  private static async deleteStore(store: AmeliaMemoryStore): Promise<void> {
    const session = await this.getSession();
    if (!session) return;
    const response = await fetchTimed(SUPABASE_URL + '/rest/v1/amelia_memory_records?store=eq.' + encodeURIComponent(store), {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: 'Bearer ' + session.access_token,
        Prefer: 'return=minimal',
      },
    });
    if (!response.ok) throw new Error('Supabase memory delete failed (' + response.status + ').');
  }

  static async syncLocalMemory(session: AmeliaCloudSession): Promise<{
    runtimeCheckpoint: Record<string, unknown> | null;
    uploaded: number;
    downloaded: number;
  }> {
    const savedOwner = (() => {
      try { return localStorage.getItem(OWNER_KEY); } catch { return null; }
    })();
    if (savedOwner && savedOwner !== session.user.id) {
      throw new Error('This device’s local cache is linked to a different Supabase account. Export and clear this device’s app data before switching accounts.');
    }
    const sameOwner = savedOwner === session.user.id;
    AmeliaIndexedMemory.setCloudAdapter(null);
    const [remoteRows, localArchive] = await Promise.all([
      this.fetchCloudRows(session),
      AmeliaIndexedMemory.exportAll(),
    ]);
    const remoteByKey = new Map<string, CloudRow>();
    for (const row of remoteRows) remoteByKey.set(row.store + '::' + row.record_id, row);
    const localByKey = new Map<string, { store: AmeliaMemoryStore; payload: Record<string, unknown> }>();
    for (const store of STORES) {
      for (const record of localArchive[store] as Array<Record<string, unknown>>) {
        if (typeof record.id === 'string') localByKey.set(store + '::' + record.id, { store, payload: record });
      }
    }

    const keys = new Set([...remoteByKey.keys(), ...localByKey.keys()]);
    let uploaded = 0;
    let downloaded = 0;
    for (const key of keys) {
      const remote = remoteByKey.get(key);
      const local = localByKey.get(key);
      const localTime = local ? Date.parse(String(local.payload.updatedAt || local.payload.timestamp || '')) || 0 : 0;
      const remoteTime = remote ? Date.parse(remote.updated_at) || 0 : 0;
      if (remote && (!local || !sameOwner || remoteTime > localTime)) {
        await AmeliaIndexedMemory.put(remote.store, remote.payload as { id: string });
        downloaded++;
      } else if (local) {
        await this.upsertRecord(local.store, local.payload);
        uploaded++;
      }
    }

    try { localStorage.setItem(OWNER_KEY, session.user.id); } catch { /* Account link survives for this session only. */ }
    AmeliaIndexedMemory.setCloudAdapter({
      upsert: (store, record) => this.upsertRecord(store, record),
      clear: store => this.deleteStore(store),
    });
    const runtimeCheckpoint = await AmeliaIndexedMemory.get<Record<string, unknown>>('runtime', 'live-checkpoint');
    return { runtimeCheckpoint, uploaded, downloaded };
  }
}
