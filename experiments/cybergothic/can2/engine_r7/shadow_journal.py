"""Atomic SQLite checkpoints binding the primary world to a shadow sidecar."""
import json
import sqlite3

from observer import ObservedWorld
from reactor import canonical,digest
from storage import ZERO,chain


def binding(seq,head,state_hash,shadow_hash):
    return digest({'seq':seq,'head':head,'state_hash':state_hash,'shadow_hash':shadow_hash})


class ShadowJournal:
    def __init__(self,path):
        self.db=sqlite3.connect(path,timeout=30,isolation_level=None)
        self.db.execute('PRAGMA journal_mode=WAL')
        self.db.execute('PRAGMA synchronous=FULL')
        self.db.executescript('''
        CREATE TABLE IF NOT EXISTS events(seq INTEGER PRIMARY KEY,body TEXT NOT NULL,hash TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS checkpoint(singleton INTEGER PRIMARY KEY CHECK(singleton=1),
          seq INTEGER NOT NULL,head TEXT NOT NULL,state TEXT NOT NULL,state_hash TEXT NOT NULL,
          shadow TEXT NOT NULL,shadow_hash TEXT NOT NULL,binding_hash TEXT NOT NULL);
        ''')

    def close(self):self.db.close()

    def save(self,w,*,inject_failure=False):
        if w.shadow is None:raise ValueError('observer required')
        w.shadow.audit(w)
        if w.shadow.last_seq!=len(w.log):raise ValueError('cannot save mid-event or mismatched observer')
        self.db.execute('BEGIN IMMEDIATE')
        try:
            row=self.db.execute('SELECT seq,head,state FROM checkpoint WHERE singleton=1').fetchone()
            seq,head=(row[0],row[1]) if row else (0,ZERO)
            if seq>len(w.log):raise ValueError('checkpoint is ahead of world')
            if row and digest(w.log[:seq])!=json.loads(row[2])['log_hash']:
                raise ValueError('refusing to overwrite different primary history')
            for event in w.log[seq:]:
                seq+=1;head=chain(head,event)
                self.db.execute('INSERT INTO events(seq,body,hash) VALUES(?,?,?)',
                                (seq,canonical(event).decode(),head))
            state=w.snapshot();shadow=w.shadow.export();sh=digest(state);oh=digest(shadow)
            self.db.execute('INSERT INTO checkpoint VALUES(1,?,?,?,?,?,?,?) '
                'ON CONFLICT(singleton) DO UPDATE SET seq=excluded.seq,head=excluded.head,'
                'state=excluded.state,state_hash=excluded.state_hash,shadow=excluded.shadow,'
                'shadow_hash=excluded.shadow_hash,binding_hash=excluded.binding_hash',
                (seq,head,canonical(state).decode(),sh,canonical(shadow).decode(),oh,binding(seq,head,sh,oh)))
            if inject_failure:raise RuntimeError('injected failure before commit')
            self.db.execute('COMMIT')
        except BaseException:
            self.db.execute('ROLLBACK');raise
        return {'seq':seq,'head':head,'state_sha256':sh,'shadow_sha256':oh}

    def load(self,world_cls=ObservedWorld):
        row=self.db.execute('SELECT seq,head,state,state_hash,shadow,shadow_hash,binding_hash '
                            'FROM checkpoint WHERE singleton=1').fetchone()
        if not row:raise LookupError('no checkpoint')
        seq,expected_head,state_s,state_hash,shadow_s,shadow_hash,bh=row
        if binding(seq,expected_head,state_hash,shadow_hash)!=bh:raise ValueError('checkpoint binding mismatch')
        state=json.loads(state_s);shadow=json.loads(shadow_s)
        if digest(state)!=state_hash or digest(shadow)!=shadow_hash:raise ValueError('checkpoint data hash mismatch')
        events=[];head=ZERO
        for expected,(actual,body,event_hash) in enumerate(self.db.execute('SELECT seq,body,hash FROM events ORDER BY seq'),1):
            event=json.loads(body);head=chain(head,event)
            if actual!=expected or head!=event_hash:raise ValueError('primary event chain mismatch')
            events.append(event)
        if len(events)!=seq or head!=expected_head or shadow['last_seq']!=seq:
            raise ValueError('primary/sidecar ledger mismatch')
        return world_cls.restore_with_shadow(state,events,shadow)
