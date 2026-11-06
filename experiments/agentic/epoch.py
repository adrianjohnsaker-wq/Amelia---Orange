#!/usr/bin/env python3
"""AG-1 / RC-1 live epoch (REGISTRATION.md). Run hourly by the launcher; appends one epoch to the live ledger.
  python3 epoch.py <world-live dir> <ledger dir>
1. fetch the latest drand quicknet round (randomness checked = SHA-256 of its signature);
2. now = UTC time after the fetch = T_e; replay the live candidate through all study data first seen up to T_e,
   checking that every earlier epoch's zPre and memory digest are reproduced exactly (else HALT, nothing appended);
3. X_e = 1 + (randomness[0:8] mod 9); arm_e = APPLY if randomness[8:16] is even else SHAM; APPLY moves her to X_e now.
Epoch 0 also chooses the live candidate L = randomness[16:24] mod 100."""
import hashlib, json, os, subprocess, sys, time, urllib.request, datetime, pathlib
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); from prepare_world import aq, droot, ORDER
QUICKNET = '52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971'
def drand():
    for base in ('https://api.drand.sh', 'https://api2.drand.sh', 'https://drand.cloudflare.com'):
        try:
            d = json.load(urllib.request.urlopen(f'{base}/{QUICKNET}/public/latest', timeout=20))
            assert hashlib.sha256(bytes.fromhex(d['signature'])).hexdigest() == d['randomness']; d['source'] = base; return d
        except Exception as e: err = e
    raise SystemExit(f'drand unavailable: {err}')
def items(live, since):
    seen, out = set(), []
    for f in sorted(pathlib.Path(live, 'batches').glob('*.json')):
        for x in json.load(open(f))['items']:
            k = (x['stream'], x['source'], x['id'])
            if k in seen or (since and x['seenAt'] <= since): continue
            seen.add(k); out.append(x)
    out.sort(key=lambda x: (x['seenAt'], x['time'], ORDER[x['stream']], x['source'], x['id']))
    return [{'seenAt': x['seenAt'], 'zone': droot(aq(x['text'])), 'stream': x['stream']} for x in out]
def main(live, ledger):
    L = pathlib.Path(ledger); logf, metaf = L / 'log.json', L / 'meta.json'
    log = json.load(open(logf)) if logf.exists() else []; meta = json.load(open(metaf)) if metaf.exists() else None
    if (L / 'HALT.json').exists(): raise SystemExit('ledger halted')
    r = drand(); T = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    if meta is None: meta = {'liveCandidate': int(r['randomness'][16:24], 16) % 100, 'chosenByRound': r['round'], 'start': T}
    it = items(live, log[0]['T'] if log else None) if log else []
    tmp = pathlib.Path('/tmp/ag1'); tmp.mkdir(exist_ok=True); json.dump(it, open(tmp / 'items.json', 'w')); json.dump(log, open(tmp / 'log.json', 'w'))
    subprocess.run(['node', '--import', 'tsx', str(HERE / 'live.ts'), str(tmp / 'items.json'), str(tmp / 'log.json'), str(meta['liveCandidate']), T, str(tmp / 'out.json')], check=True)
    rep = json.load(open(tmp / 'out.json'))
    for a, b in zip(rep, log):
        if a['zPre'] != b['zPre'] or a['digest'] != b['digest']:
            json.dump({'at': T, 'epoch': b['e'], 'logged': b, 'replayed': a}, open(L / 'HALT.json', 'w'), indent=1); raise SystemExit('replay mismatch: HALT')
    p = rep[-1]; X = 1 + int(r['randomness'][0:8], 16) % 9; arm = 'APPLY' if int(r['randomness'][8:16], 16) % 2 == 0 else 'SHAM'
    log.append({'e': len(log), 'T': T, 'X': X, 'arm': arm, 'zPre': p['zPre'], 'zPost': X if arm == 'APPLY' else p['zPre'], 'digest': p['digest'],
                'fedBefore': p['fed'], 'round': r['round'], 'randomness': r['randomness'], 'signature': r['signature'], 'drandSource': r['source']})
    json.dump(log, open(logf, 'w'), indent=0); json.dump(meta, open(metaf, 'w'), indent=1)
    (L / 'LATEST.md').write_text(f"AG-1/RC-1 live ledger: {len(log)} epochs; latest {T}: round {r['round']}, X={X}, {arm}, zPre={p['zPre']}, fed {p['fed']}\n")
    print('EPOCH', len(log) - 1, T, X, arm, 'zPre', p['zPre'], 'fed', p['fed'])
if __name__ == '__main__': main(sys.argv[1], sys.argv[2])
