"""Atomic, isolated SQLite checkpoint for a donor-context virtual branch."""
import argparse
import hashlib
import json
import sqlite3

from donor_context_study import ContextRuntime
from reactor import canonical,digest
from storage import payload_of,validate_payload
from strict_trial import StrictWorld


def save_context(path,world,runtime):
    payload=payload_of(world);payload['context_runtime']=runtime.snapshot()
    raw=canonical(payload);sha=hashlib.sha256(raw).hexdigest()
    with sqlite3.connect(path) as db:
        db.execute('PRAGMA synchronous=FULL')
        db.execute('CREATE TABLE IF NOT EXISTS context_checkpoint (singleton INTEGER PRIMARY KEY CHECK(singleton=1), payload TEXT NOT NULL, sha256 TEXT NOT NULL)')
        db.execute('BEGIN IMMEDIATE')
        db.execute('INSERT OR REPLACE INTO context_checkpoint VALUES (1,?,?)',(raw.decode(),sha))
    return sha


def load_context(path):
    with sqlite3.connect(path) as db:
        row=db.execute('SELECT payload,sha256 FROM context_checkpoint WHERE singleton=1').fetchone()
    if row is None:raise LookupError('no context checkpoint')
    raw,sha=row
    if hashlib.sha256(raw.encode()).hexdigest()!=sha:raise ValueError('context checkpoint digest mismatch')
    p=json.loads(raw);validate_payload(p)
    w=StrictWorld.restore(p['state'],p['events']);s=p['context_runtime']
    r=ContextRuntime(w,s['target'],s['alternatives'],s['header'],s['mode'],s['policy'],
                     s['start'],offset=s['offset'],state=s)
    return w,r


def main():
    p=argparse.ArgumentParser();p.add_argument('db');p.add_argument('--until',type=float,required=True)
    a=p.parse_args();w,r=load_context(a.db)
    if a.until<w.now:raise ValueError('cannot resume backwards')
    w.advance(until_time=a.until)
    print(json.dumps({'state_sha256':digest(w.snapshot()),'event_sha256':digest(w.log),
                      'runtime':r.snapshot()},sort_keys=True))


if __name__=='__main__':main()
