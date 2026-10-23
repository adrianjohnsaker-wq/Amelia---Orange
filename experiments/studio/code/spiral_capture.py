"""Spiral index (difference judged against the last 240 steps) and capture index by choice point."""
import json, sys, numpy as np
H, W, DAY = 24, 240, 1440

def excursions(z):
    res = []
    for t in range(len(z) - 1):
        th = set(z[max(0, t - H):t]) if t > 0 else {z[0]}
        if t > 0 and z[t] not in th: continue          # first step out of the territory only
        if z[t + 1] in th: continue
        ret = next((s for s in range(t + 2, min(len(z), t + H + 1)) if z[s] in th), None)
        if ret is None:
            res.append(('abolition' if z[-1] == 5 and len(z) - 1 - t <= H else 'open', t)); continue
        longpast = {(z[u], z[u + 1]) for u in range(max(0, t - W), t)}
        exc = {(z[u], z[u + 1]) for u in range(t, ret)}
        res.append(('spiral' if exc - longpast else 'circle', t))
    return res

def analyse(path, days=30):
    lin = json.load(open(path))['lineages']
    S = np.zeros((days, 4)); cap = {1: [0, 0, 0], 2: [0, 0, 0], 4: [0, 0, 0]}
    for l in lin:
        zones, starts, dec = l['zones'], l['lifeStart'], l['decisions']
        b = starts + [len(zones)]
        for i in range(len(starts)):
            a, e = b[i], b[i + 1]
            z = [0] + zones[a:e]
            for kind, t in excursions(z):
                if t < W: continue  # judge difference only once a full 240-step past exists in this life
                if kind in ('spiral', 'circle', 'abolition'):
                    S[min(days - 1, (a + t) // DAY), {'spiral': 0, 'circle': 1, 'abolition': 2}[kind]] += 1
            for tk in range(a + W, e):
                if zones[tk] != 5: S[min(days - 1, tk // DAY), 3] += 1
        for tk, d in enumerate(dec):
            if d & 8:
                frm = zones[tk - 1] if tk > 0 and tk not in starts[1:] and zones[tk - 1] != 5 else 0
                if tk in starts[1:] or tk == 0: frm = 0
                if frm in cap:
                    cap[frm][0] += 1; cap[frm][1] += (d & 1) > 0; cap[frm][2] += (d & 2) > 0
    first = S[:7].sum(0); last = S[-7:].sum(0)
    return {'spiralPer1k': round(1000 * S[:, 0].sum() / S[:, 3].sum(), 2), 'spiralShare': round(S[:, 0].sum() / (S[:, 0].sum() + S[:, 1].sum()), 3),
            'spiralShareWeek1': round(first[0] / (first[0] + first[1]), 3), 'spiralShareWeek5': round(last[0] / (last[0] + last[1]), 3),
            'spiralPer1kWeek1': round(1000 * first[0] / first[3], 2), 'spiralPer1kWeek5': round(1000 * last[0] / last[3], 2),
            'captureByZone': {z: {'choices': v[0], 'cueSettles': round(v[1] / v[0], 3) if v[0] else None, 'memorySettles': round(v[2] / v[0], 3) if v[0] else None} for z, v in cap.items()}}

for p in sys.argv[1:]:
    print(p, json.dumps(analyse(p)))
