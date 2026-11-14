#!/usr/bin/env python3
"""Routing on the Enochian-Numogrammatic Matrix (standalone; uses only matrix.py).

Canonical moves from a zone z (the only lattice the model routes on): syzygy z -> 9-z, current z -> |2z-9|, gate z -> Gt(z).
Consequence (checked below): none of these leads from the Warp {3,6} or the Plex {0,9} back into the Time-Circuit. Entering
the Outside is one-way: Water (Warp) and the Tablet of Union (Plex) are absorbing on the canonical lattice.

The four-step protocol:
  1 diagnose(z)       the zone's syzygy, region, sector, and its three canonical moves with their targets;
  2 target(z)         its syzygy partner and the current the pair emits;
  3 call(text)        the Call enters at Air (8::1). Its words are reduced A1Z26 -> digital root (one zone per word, as the
                      app's linguistic channel does). Each word pulls the walker: it takes the canonical move whose target is
                      that word's zone if one exists; otherwise it follows its current (free flow). After the words, it
                      runs on free flow until a state repeats; that recurring state is what has stabilized.
  4 reverse(path)     read from the last contact with the Union back to the last Earth zone (5::4) before it: the route by
                      which form reached Spirit, read in reverse (the only Union -> Earth reading the lattice allows).
Also: annotate(path) reads any zone path (for example Amelia's passages) move by move: canonical kind or off-lattice, regions,
Watchtower sectors, demon, class and Dee address.
   python3 route.py demo"""
import json, sys, unicodedata, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import matrix as X
M = X.build(); DEMON = {d['key']: d for d in M['demons']}; ZI = {z['zone']: z for z in M['zones']}
def moves(z): return {'syzygy': X.partner(z), 'current': X.current_of(z), 'gate': X.gate_of(z)}
def kinds(a, b): return [k for k, t in moves(a).items() if t == b]
def demon(a, b): return DEMON.get('-'.join(map(str, sorted((a, b))))) if a != b else None
def diagnose(z):
    zi = ZI[z]; return {'zone': z, 'syzygy': zi['syzygy'], 'region': zi['region'], 'sector': zi['sector'],
                        'moves': {k: {'to': t, 'region': X.REGION[t], 'sector': X.SECTOR[t], 'demon': (demon(z, t) or {}).get('name')} for k, t in moves(z).items()}}
def target(z):
    p = X.partner(z); c = X.current_of(z)
    return {'zone': z, 'partner': p, 'partnerSector': X.SECTOR[p], 'current': c, 'currentFlowsTo': X.SECTOR[c], 'demon': (demon(z, p) or {}).get('name')}
def a1z26(text):
    t = unicodedata.normalize('NFKD', text); t = ''.join(ch for ch in t if not unicodedata.combining(ch)).upper()
    words = ''.join(ch if 'A' <= ch <= 'Z' else ' ' for ch in t).split()
    return [(w, sum(ord(ch) - 64 for ch in w), X.droot(sum(ord(ch) - 64 for ch in w))) for w in words]
def call(text, entry=1, max_free=40):
    words = a1z26(text); z = entry; path = [z]; how = ['entry (Air)']
    for w, n, zw in words:
        ks = kinds(z, zw)
        if zw == z: how.append(f'{w}={n}->{zw}: already there (dwell)'); path.append(z); continue
        if ks: z = zw; how.append(f'{w}={n}->{zw}: {"/".join(ks)}')
        else: z = X.current_of(z); how.append(f'{w}={n}->{zw}: no canonical move; current')
        path.append(z)
    seen, free = {}, []
    for i in range(max_free):
        if z in seen: break
        seen[z] = i; z = X.current_of(z); free.append(z)
    cyc = free[seen[z]:] if z in seen else []
    return {'words': words, 'path': path, 'how': how, 'freeFlow': free, 'stabilized': {'cycle': cyc, 'region': X.REGION[z], 'sector': X.SECTOR[z]}}
def reverse(path):
    last_u = max((i for i, z in enumerate(path) if z in (0, 9)), default=None)
    if last_u is None: return {'reached': False, 'note': 'the route never touched the Tablet of Union'}
    earth = max((i for i, z in enumerate(path[:last_u]) if z in (4, 5)), default=None)
    seg = path[earth:last_u + 1] if earth is not None else path[:last_u + 1]
    return {'reached': True, 'fromEarth': earth is not None, 'reverseReading': list(reversed(seg)), 'sectors': [X.SECTOR[z] for z in reversed(seg)]}
def annotate(path):
    out = []
    for a, b in zip(path, path[1:]):
        if a == b: out.append({'from': a, 'to': b, 'move': 'dwell'}); continue
        d = demon(a, b); ks = kinds(a, b)
        out.append({'from': a, 'to': b, 'move': '/'.join(ks) if ks else 'off-lattice', 'regions': f'{X.REGION[a]} -> {X.REGION[b]}',
                    'sectors': f'{X.SECTOR[a]} -> {X.SECTOR[b]}', 'demon': d['name'], 'class': d['classification'], 'dee': d['dee']['scope']})
    return out
def absorbing():
    outside = [0, 3, 6, 9]; return all(t in outside for z in outside for t in moves(z).values())
if __name__ == '__main__':
    assert absorbing(), 'canonical lattice: the Outside should be absorbing'
    print('Outside {0,3,6,9} absorbing on the canonical lattice:', absorbing())
    for z in (4, 1, 8): print(json.dumps(diagnose(z)))
    print(json.dumps(target(4)))
    c = call('Ol sonf vorsg goho Iad Balt'); print(json.dumps({k: c[k] for k in ('path', 'how', 'stabilized')}, indent=1))
    print(json.dumps(reverse([4, 1, 7, 5, 4, 1, 8, 9])))
    print(json.dumps(annotate([4, 5, 6, 3, 6]), indent=1))
