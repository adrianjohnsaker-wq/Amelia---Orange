#!/usr/bin/env python3
"""Amendment A1 live epoch (A1.md), for AG-1 (experiments/agentic) and RC-2 (experiments/rc2). Replaces the sealed
epoch.py / epoch2.py in the hourly launchers; the sealed replays (live.ts, live2.ts), the epoch rule, the drand draw and
the HALT check are unchanged. What changes: an item is fed in the first epoch whose run actually had it (A1 rule), and
the ledger records that assignment (a1/assigned.json) so every later replay feeds exactly the same items.
  python3 epoch_a1.py ag1|rc2 <world-live dir, full history on the first A1 run> <ledger dir>"""
import datetime, hashlib, json, pathlib, subprocess, sys, urllib.request
HERE = pathlib.Path(__file__).resolve().parent; sys.path.insert(0, str(HERE)); import a1lib as A
EXP = HERE.parents[1]
RUNNER = {'ag1': EXP / 'agentic' / 'live.ts', 'rc2': EXP / 'rc2' / 'live2.ts'}
QUICKNET = '52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971'
def drand():
    for base in ('https://api.drand.sh', 'https://api2.drand.sh', 'https://drand.cloudflare.com'):
        try:
            d = json.load(urllib.request.urlopen(f'{base}/{QUICKNET}/public/latest', timeout=20))
            assert hashlib.sha256(bytes.fromhex(d['signature'])).hexdigest() == d['randomness']; d['source'] = base; return d
        except Exception as e: err = e
    raise SystemExit(f'drand unavailable: {err}')
def arrivals(live):
    """batch file -> UTC time of the commit that added it to world-live (needs the branch's full history)."""
    r = subprocess.run(['git', '-C', str(live), 'log', '--format=@%cI', '--diff-filter=A', '--name-only', '--', 'batches'], capture_output=True, text=True, check=True).stdout
    out, t = {}, None
    for l in r.split('\n'):
        if l.startswith('@'): t = datetime.datetime.fromisoformat(l[1:]).astimezone(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        elif l.strip(): out.setdefault(l.strip(), t)
    return out
def halt(L, T, what):
    json.dump(dict(what, at=T, amendment='A1'), open(L / 'HALT.json', 'w'), indent=1); raise SystemExit('A1: HALT ' + json.dumps(what)[:300])
def main(study, live, ledger):
    L = pathlib.Path(ledger); logf, metaf = L / 'log.json', L / 'meta.json'; AD = L / 'a1'; asgf = AD / 'assigned.json'
    log = json.load(open(logf)); meta = json.load(open(metaf))
    if (L / 'HALT.json').exists(): raise SystemExit('ledger halted')
    r = drand(); T = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    tmp = pathlib.Path('/tmp/a1-' + study)
    if asgf.exists(): assigned = json.load(open(asgf)); out = A.world(live, log[0]['T'])
    else:   # first A1 run: backfill the logged epochs from world-live's commit history and verify them exactly
        out, assigned = A.backfill(live, arrivals(live), log)
        rep = A.replay(RUNNER[study], A.feed_list(out, assigned, [e['T'] for e in log]), log, meta['liveCandidate'], None, tmp)
        bad = A.check(rep, log)
        if bad or len(rep) != len(log): halt(L, T, {'stage': 'backfill', 'epoch': bad[0] if bad else None, 'replayed': bad[1] if bad else len(rep)})
        AD.mkdir(exist_ok=True)
        json.dump({'at': T, 'epochsBackfilled': len(log), 'itemsAssigned': len(assigned), 'verified': 'every logged zPre and memory digest reproduced',
                   'fedPerEpoch': [a['fed'] for a in rep]}, open(AD / 'BACKFILL.json', 'w'), indent=1)
    e = len(log); A.assign_pending(out, assigned, e, T)
    rep = A.replay(RUNNER[study], A.feed_list(out, assigned, [x['T'] for x in log] + [T]), log, meta['liveCandidate'], T, tmp)
    bad = A.check(rep, log)
    if bad: halt(L, T, {'stage': 'replay', 'epoch': bad[0], 'logged': bad[2], 'replayed': bad[1]})
    p = rep[-1]; assert p.get('pending') and p['fed'] == sum(1 for v in assigned.values() if v == e), 'A1 feed count'
    ent = {'e': e, 'T': T}
    if study == 'ag1':
        X = 1 + int(r['randomness'][0:8], 16) % 9; arm = 'APPLY' if int(r['randomness'][8:16], 16) % 2 == 0 else 'SHAM'
        ent.update({'X': X, 'arm': arm, 'zPre': p['zPre'], 'zPost': X if arm == 'APPLY' else p['zPre']})
    else: ent.update({'zPre': p['zPre']})
    ent.update({'digest': p['digest'], 'fedBefore': p['fed'], 'round': r['round'], 'randomness': r['randomness'], 'signature': r['signature'], 'drandSource': r['source'], 'a1': True})
    log.append(ent); AD.mkdir(exist_ok=True)
    json.dump(log, open(logf, 'w'), indent=0); json.dump(assigned, open(asgf, 'w'), sort_keys=True)
    name = {'ag1': 'AG-1/RC-1', 'rc2': 'RC-2'}[study]; extra = f", X={ent['X']}, {ent['arm']}" if study == 'ag1' else ''
    (L / 'LATEST.md').write_text(f"{name} live ledger (amendment A1): {len(log)} epochs; latest {T}: round {r['round']}{extra}, zPre={p['zPre']}, fed {p['fed']}\n")
    print('EPOCH', e, T, extra, 'zPre', p['zPre'], 'fed', p['fed'])
if __name__ == '__main__': main(sys.argv[1], sys.argv[2], sys.argv[3])
