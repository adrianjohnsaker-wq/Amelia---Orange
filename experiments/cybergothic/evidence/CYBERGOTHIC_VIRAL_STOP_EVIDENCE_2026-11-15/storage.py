"""Transactional local checkpoints and an optional isolated Supabase adapter."""
from __future__ import annotations
import hashlib
import json
import sqlite3
from urllib.error import HTTPError
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen
from reactor import Reactor, canonical, digest

ZERO = "00" * 32


def chain(head, event):
    return hashlib.sha256(bytes.fromhex(head) + canonical(event)).hexdigest()


def validate_payload(payload):
    head = ZERO
    for event in payload["events"]:
        head = chain(head, event)
    if head != payload["head"] or digest(payload["state"]) != payload["state_sha256"]:
        raise ValueError("checkpoint integrity check failed")
    return Reactor.restore(payload["state"], payload["events"])


def payload_of(world):
    head = ZERO
    for event in world.log:
        head = chain(head, event)
    state = world.snapshot()
    return {"format": 1, "events": world.log, "head": head,
            "state": state, "state_sha256": digest(state)}


class SQLiteJournal:
    """One run per file. Event append and checkpoint commit in one transaction."""
    def __init__(self, path):
        self.db = sqlite3.connect(path, timeout=30)
        self.db.execute("PRAGMA foreign_keys=ON")
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.execute("PRAGMA synchronous=FULL")
        self.db.executescript("""
          CREATE TABLE IF NOT EXISTS events
            (seq INTEGER PRIMARY KEY, body TEXT NOT NULL, hash TEXT NOT NULL);
          CREATE TABLE IF NOT EXISTS checkpoint
            (singleton INTEGER PRIMARY KEY CHECK(singleton=1), seq INTEGER NOT NULL,
             head TEXT NOT NULL, state TEXT NOT NULL, state_hash TEXT NOT NULL);
        """)

    def close(self):
        self.db.close()

    def save(self, world, *, inject_failure=False):
        with self.db:
            self.db.execute("BEGIN IMMEDIATE")
            row = self.db.execute("SELECT seq, head, state FROM checkpoint WHERE singleton=1").fetchone()
            seq, head = (row[0], row[1]) if row else (0, ZERO)
            if seq > len(world.log):
                raise ValueError("checkpoint is ahead of this world")
            if row and digest(world.log[:seq]) != json.loads(row[2])["log_hash"]:
                raise ValueError("refusing to overwrite a different event history")
            for event in world.log[seq:]:
                seq += 1
                head = chain(head, event)
                self.db.execute("INSERT INTO events VALUES (?, ?, ?)",
                                (seq, canonical(event).decode(), head))
            if inject_failure:
                raise RuntimeError("injected failure before commit")
            state = world.snapshot()
            self.db.execute("INSERT INTO checkpoint VALUES (1, ?, ?, ?, ?) "
                            "ON CONFLICT(singleton) DO UPDATE SET seq=excluded.seq, "
                            "head=excluded.head, state=excluded.state, state_hash=excluded.state_hash",
                            (seq, head, canonical(state).decode(), digest(state)))
        return head

    def load(self):
        row = self.db.execute("SELECT seq, head, state, state_hash FROM checkpoint WHERE singleton=1").fetchone()
        if not row:
            raise LookupError("no checkpoint")
        events, head = [], ZERO
        for expected, (seq, body, actual) in enumerate(
                self.db.execute("SELECT seq, body, hash FROM events ORDER BY seq"), 1):
            event = json.loads(body)
            head = chain(head, event)
            if seq != expected or head != actual:
                raise ValueError("event ledger integrity check failed")
            events.append(event)
        state = json.loads(row[2])
        if len(events) != row[0] or head != row[1] or digest(state) != row[3]:
            raise ValueError("checkpoint integrity check failed")
        return Reactor.restore(state, events)


class SupabaseJournal:
    """One JSON checkpoint row, guarded by optimistic revision and owner RLS.

    This adapter uses a separately provisioned project only. It has no default
    endpoint or credentials. It never uses a service-role key.
    """
    def __init__(self, url, publishable_key, user_jwt, run_id, *, isolated=False):
        parsed = urlparse(url)
        if not isolated:
            raise ValueError("a separately isolated prototype project must be configured")
        if parsed.scheme != "https" and not (parsed.scheme == "http" and parsed.hostname == "127.0.0.1"):
            raise ValueError("HTTPS is required except for the local test server")
        if not publishable_key or not user_jwt or not run_id:
            raise ValueError("publishable key, authenticated user JWT and run ID required")
        if publishable_key.startswith("sb_secret_"):
            raise ValueError("secret keys are not accepted")
        self.endpoint = url.rstrip("/") + "/rest/v1/cg_reactor_checkpoints"
        self.key, self.jwt, self.run_id = publishable_key, user_jwt, run_id

    def request(self, method, query="", body=None):
        headers = {"apikey": self.key, "Authorization": "Bearer " + self.jwt,
                   "Content-Type": "application/json", "Prefer": "return=representation"}
        req = Request(self.endpoint + query, method=method, headers=headers,
                      data=canonical(body) if body is not None else None)
        try:
            with urlopen(req, timeout=30) as response:
                return json.loads(response.read().decode())
        except HTTPError as e:
            raise RuntimeError(f"checkpoint request failed with HTTP {e.code}") from e

    def read(self):
        q = "?run_id=eq." + quote(self.run_id, safe="") + "&select=revision,payload"
        rows = self.request("GET", q)
        if len(rows) > 1:
            raise ValueError("ambiguous checkpoint")
        if not rows:
            return None, 0
        return validate_payload(rows[0]["payload"]), rows[0]["revision"]

    def save(self, world, revision):
        payload = payload_of(world)
        if revision == 0:
            rows = self.request("POST", body={"run_id": self.run_id, "revision": 1,
                                               "payload": payload})
        else:
            q = "?run_id=eq." + quote(self.run_id, safe="") + f"&revision=eq.{revision}"
            rows = self.request("PATCH", q, {"revision": revision + 1, "payload": payload})
        if len(rows) != 1:
            raise RuntimeError("checkpoint changed concurrently or was inaccessible")
        return revision + 1
