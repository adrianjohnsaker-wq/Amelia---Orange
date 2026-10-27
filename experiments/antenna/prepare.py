"""THE ANTENNA, after the window (see REGISTRATION.md): order the world's data, reduce each by AQ to its zone,
fetch and verify the beacon, shuffle the world. Writes inputs.json for antenna.mjs.

  python3 prepare.py <live dir> <out inputs.json> [--offline-beacon]   (offline: unit tests only, never scored)
"""
import datetime as dt, glob, hashlib, json, random, sys, unicodedata

BEACON_AT = dt.datetime(2026, 11, 4, 3, tzinfo=dt.timezone.utc)
ORDER = {'words': 0, 'markets': 1, 'earth': 2, 'sun': 3, 'date': 4}

def aq(text):
    t = unicodedata.normalize('NFKD', text).upper()
    return sum(int(c) if c in '0123456789' else ord(c) - 55 for c in t if c in '0123456789' or 'A' <= c <= 'Z')

def droot(c): return 0 if c == 0 else 1 + (c - 1) % 9

def world(live):
    items, seen = [], set()
    for f in sorted(glob.glob(f'{live}/batches/*.json')):
        for x in json.load(open(f))['items']:
            k = (x['stream'], x['source'], x['id'])
            if k in seen: continue
            seen.add(k); items.append(x)
    items.sort(key=lambda x: (x['time'], ORDER[x['stream']], x['source'], x['id']))
    return items

def beacon(n, offline):
    from drift1a_c1.beacon import LiveBeacon, QUICKNET
    first = -(-(int(BEACON_AT.timestamp()) - QUICKNET['genesis_time']) // 3) + 1   # first round at or after 03:00
    rounds = []
    if offline:
        rounds = [{'round': first + i, 'randomness': hashlib.sha256(f'UNIT|{i}'.encode()).hexdigest()} for i in range(-(-n // 8))]
    else:
        b = LiveBeacon()
        for i in range(-(-n // 8)): rounds.append(b.fetch(first + i))
    zones = []
    for r in rounds:
        raw = bytes.fromhex(r['randomness'])
        zones += [droot(int.from_bytes(raw[j:j + 4], 'big')) for j in range(0, 32, 4)]
    return zones[:n], rounds

def syzygies(z): return sum(1 for a, b in zip(z, z[1:]) if a + b == 9)

def main(live, out, offline=False):
    items = world(live)
    zw = [droot(aq(x['text'])) for x in items]
    zb, rounds = beacon(len(zw), offline)
    zs = zw[:]
    rng = random.Random(hashlib.sha256(('ANTENNA-SHUFFLE|' + rounds[0]['randomness']).encode()).hexdigest())
    for i in range(len(zs) - 1, 0, -1):
        j = rng.randrange(i + 1); zs[i], zs[j] = zs[j], zs[i]
    streams = {}
    for x, z in zip(items, zw):
        s = streams.setdefault(x['stream'], [0] * 10); s[z] += 1
    doc = {'schema': 'ANTENNA_INPUTS_V1', 'offlineBeacon': offline, 'N': len(zw),
           'zones': {'world': zw, 'beacon': zb, 'shuffled': zs},
           'beaconRounds': [r['round'] for r in rounds][:1] + [r['round'] for r in rounds][-1:],
           'beaconFirstRandomness': rounds[0]['randomness'],
           'streamZoneCounts': streams,
           'syzygies': {k: syzygies(v) for k, v in (('world', zw), ('beacon', zb), ('shuffled', zs))},
           'worldSHA256': hashlib.sha256(json.dumps(items, sort_keys=True, ensure_ascii=False).encode()).hexdigest()}
    json.dump(doc, open(out, 'w'))
    print(json.dumps({k: doc[k] for k in ('N', 'syzygies', 'streamZoneCounts', 'beaconRounds')}))

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], '--offline-beacon' in sys.argv)
