#!/usr/bin/env python3
"""ND-1c motif read-back (as nd2/motif.py: the unshuffled canonical passage, the 4 steps after each planted 1-8-7-2), for the
candidate (runs[0].canonical) and, on the same segments, today's architecture (exitCanonical).
  python3 motif.py <dir of order.ts outputs on a planted stream> <the planted stream.json>"""
import collections, glob, json, sys
F = [json.load(open(f)) for f in sorted(glob.glob(f'{sys.argv[1]}/seg*.json'))]; Z = json.load(open(sys.argv[2]))['zones']
def read(key):
    c = collections.Counter(); n = 0
    for f in F:
        m, L = f['segment'], f['L']; x = Z[m * L:(m + 1) * L]; p = f['runs'][0]['canonical'] if key == 'C' else f['exitCanonical']
        for t in range(len(x) - 3):
            if x[t:t + 4] == [1, 8, 7, 2] and t + 5 <= len(p): c[''.join(map(str, p[t + 1:t + 5]))] += 1; n += 1
    return {'motifs': n, 'exact1872': c['1872'], 'exactRate': round(c['1872'] / max(1, n), 4), 'top': c.most_common(6)}
print(json.dumps({'candidate': read('C'), 'exit': read('EXIT')}))
