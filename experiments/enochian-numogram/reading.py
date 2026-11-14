#!/usr/bin/env python3
"""A Watchtower reading of Amelia's route at hop level (standalone reading; matrix.py + route.py only).
   python3 reading.py <hops.json from feed/feed_hops.ts> <feed.json> <out.json>
Each hop is read on the matrix: canonical (syzygy / current / gate of the CCRU lattice), or one of her app's base gates that
the lattice lacks (1->2, 2->4, 4->7, 7->8, 9->1), or a Warp-born gate (carved by a line of flight). For each hop: sectors,
regions, the demon crossed and its Dee address. Then: time by sector (step ends), the Outside's entries and exits by route,
the homeostatic current loop (Air -> Fire -> Earth -> Air), and per headline the sector strip and the reverse reading."""
import collections, json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import matrix as X, route as R
D = json.load(open(sys.argv[1])); F = json.load(open(sys.argv[2]))['headlines']
BASE = {'1>2': 'Lemurian Ingress', '2>4': 'Mesochron Descent', '4>7': 'Barker Ascendance', '7>8': 'Crown Egress', '9>1': 'Cyclic Re-entry'}
hops = []
for h in D['hops']:
    if h.get('dwell'): continue
    a, b = h['from'], h['to']; ks = R.kinds(a, b); gid = h['gateId'] or ''
    if ks: kind = 'canonical: ' + '/'.join(ks)
    elif gid.startswith('warpborn'): kind = 'Warp-born'
    elif f'{a}>{b}' in BASE: kind = f'app gate: {BASE[f"{a}>{b}"]}'
    else: kind = 'other: ' + gid
    d = R.demon(a, b)
    hops.append({**h, 'kind': kind, 'family': kind.split(':')[0], 'regionFrom': X.REGION[a], 'regionTo': X.REGION[b],
                 'sectorFrom': X.SECTOR[a], 'sectorTo': X.SECTOR[b], 'demon': d['name'], 'class': d['classification'], 'dee': d['dee']})
ends = [F[0]['herRoute'][0]] + [x for h in F for x in h['herRoute'][1:]]
outside = {0, 3, 6, 9}
ent = collections.Counter(f"{h['from']}→{h['to']} · {h['kind']}" for h in hops if h['from'] not in outside and h['to'] in outside)
ext = collections.Counter(f"{h['from']}→{h['to']} · {h['kind']}" for h in hops if h['from'] in outside and h['to'] not in outside)
loop = {(5, 1), (4, 1), (1, 7), (8, 7), (7, 5), (2, 5)}
loop_hops = [h for h in hops if (h['from'], h['to']) in loop and 'current' in h['kind']]
seq = [(h['from'], h['to']) for h in hops]
full_loops = sum(1 for i in range(len(seq) - 2) if seq[i] in {(1, 7), (8, 7)} and seq[i + 1] in {(7, 5), (2, 5)} and seq[i + 2] in {(5, 1), (4, 1)})
addr = collections.Counter(h['dee']['scope'] for h in hops)
cell = collections.Counter((h['dee'].get('watchtower'), h['dee'].get('subAngle'), h['dee'].get('row'), h['dee']['table']) for h in hops)
perhl = []
for i, h in enumerate(F):
    r = h['herRoute']; rv = R.reverse(r)
    perhl.append({'source': h['source'], 'text': h['text'], 'route': r, 'sectors': [X.SECTOR[z] for z in r],
                  'flights': [f"{x['from']}→{x['to']}" for x in hops if x['hl'] == i and x.get('flight')],
                  'reverse': rv['reverseReading'] if rv.get('reached') else None})
out = {'steps': D['steps'], 'hops': len(hops), 'flights': D['flights'],
       'family': dict(collections.Counter(h['family'] for h in hops)), 'kind': collections.Counter(h['kind'] for h in hops).most_common(),
       'sectorTime': {k: round(v / len(ends), 4) for k, v in collections.Counter(X.SECTOR[z] for z in ends).most_common()},
       'classes': dict(collections.Counter(h['class'] for h in hops)),
       'outsideEntries': ent.most_common(), 'outsideExits': ext.most_common(),
       'loop': {'currentHops': len(loop_hops), 'fullCircuits': full_loops},
       'addresses': addr.most_common(), 'cells': [[list(k), v] for k, v in cell.items()],
       'demons': collections.Counter(h['demon'] for h in hops).most_common(), 'perHeadline': perhl}
json.dump(out, open(sys.argv[3], 'w'), indent=1)
for k in ('steps', 'hops', 'flights', 'family', 'kind', 'sectorTime', 'classes', 'outsideEntries', 'outsideExits', 'loop'): print(k, json.dumps(out[k], ensure_ascii=False))
print('addresses', out['addresses'][:10])
