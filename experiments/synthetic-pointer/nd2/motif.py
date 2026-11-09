#!/usr/bin/env python3
"""ND-2 descriptive motif reading: what the planted 1-8-7-2 becomes in her ND-1 passage (received runs only).
  python3 motif.py <dir of order.ts outputs on a planted stream> <the planted stream.json>"""
import collections, glob, json, sys
F = [json.load(open(f)) for f in sorted(glob.glob(f'{sys.argv[1]}/seg*.json'))]; Z = json.load(open(sys.argv[2]))['zones']
c = collections.Counter(); n = 0
for f in F:
    m, L = f['segment'], f['L']; x = Z[m * L:(m + 1) * L]; p = f['runs'][0]['canonical']
    for t in range(len(x) - 3):
        if x[t:t + 4] == [1, 8, 7, 2] and t + 5 <= len(p): c[''.join(map(str, p[t + 1:t + 5]))] += 1; n += 1
print(json.dumps({'motifs': n, 'exact1872': c['1872'], 'exactRate': round(c['1872'] / max(1, n), 3), 'top': c.most_common(10)}))
