"""Atomic SQLite checkpoint for isolated promoter-enabled virtual ecology."""
import argparse
import hashlib
import json
import sqlite3

from promoter_study import PromoterRuntime
from reactor import canonical,digest
from storage import payload_of,validate_payload
from strict_trial import StrictWorld


def save_promoter(path,world,runtime):
    payload=payload_of(world)
    payload['promoter_runtime']=runtime.snapshot()
    raw=canonical(payload);sha=hashlib.sha256(raw).hexdigest()
    with sqlite3.connect(path) as db:
        db.execute('PRAGMA synchronous=FULL')
        db.execute('CREATE TABLE IF NOT EXISTS promoter_checkpoint (singleton INTEGER PRIMARY KEY CHECK(singleton=1), payload TEXT NOT NULL, sha256 TEXT NOT NULL)')
        db.execute('BEGIN IMMEDIATE')
        db.execute('INSERT OR REPLACE INTO promoter_checkpoint VALUES (1, ?, ?)',(raw.decode(),sha))
    return sha


def load_promoter(path):
    with sqlite3.connect(path) as db:
        row=db.execute('SELECT payload,sha256 FROM promoter_checkpoint WHERE singleton=1').fetchone()
    if row is None:raise LookupError('no promoter checkpoint')
    raw,sha=row
    if hashlib.sha256(raw.encode()).hexdigest()!=sha:raise ValueError('promoter checkpoint digest mismatch')
    payload=json.loads(raw)
    validate_payload(payload)
    world=StrictWorld.restore(payload['state'],payload['events'])
    s=payload['promoter_runtime']
    runtime=PromoterRuntime(world,s['target'],s['alternatives'],s['header'],s['mode'],s['start'],state=s)
    return world,runtime


def main():
    p=argparse.ArgumentParser();p.add_argument('db');p.add_argument('--until',required=True,type=float)
    a=p.parse_args();world,runtime=load_promoter(a.db)
    if a.until<world.now:raise ValueError('cannot resume backwards')
    world.advance(until_time=a.until)
    print(json.dumps({'state_sha256':digest(world.snapshot()),'event_sha256':digest(world.log),
                      'runtime':runtime.snapshot()},sort_keys=True))


if __name__=='__main__':main()
