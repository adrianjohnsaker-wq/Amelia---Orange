"""Studio analyses for PF-2: capture index, spiral index, future-information test.
Input: instrumented receiver output (per-tick zones, cues, decision codes, life starts) for learner and control lineages.
Decision code bits: 8 = a real choice (two open exits); 1 = removing the Outside's cue changes the choice;
2 = removing her lineage memory V changes the choice.
"""
import json, sys, math
import numpy as np

H = 24
TICKS_PER_DAY = 1440


def load(path):
    return json.load(open(path))['lineages']


# ---------- capture index ----------
def capture(lin, days):
    out = []
    for l in lin:
        d = np.array(l['decisions'])
        rows = []
        for day in range(days):
            seg = d[day * TICKS_PER_DAY:(day + 1) * TICKS_PER_DAY]
            ch = seg[(seg & 8) > 0]
            n = len(ch)
            rows.append((n, int(((ch & 1) > 0).sum()), int(((ch & 2) > 0).sum())))
        out.append(rows)
    return out  # per lineage, per day: (choices, cue-settled, memory-settled)


# ---------- spiral index ----------
def excursions(z):
    """z: zones of one life including its starting zone. Yields (kind, start_t)."""
    res = []
    for t in range(len(z) - 1):
        th = set(z[max(0, t - H):t]) if t > 0 else {z[0]}
        if z[t] not in th and t > 0:
            continue  # only count the first step out of the territory
        if z[t + 1] in th:
            continue
        ret = None
        for s in range(t + 2, min(len(z), t + H + 1)):
            if z[s] in th:
                ret = s
                break
        if ret is None:
            kind = 'abolition' if (z[-1] == 5 and len(z) - 1 - t <= H) else 'open'
            res.append((kind, t))
            continue
        prev = {(z[u], z[u + 1]) for u in range(max(0, t - H), t)}
        exc = {(z[u], z[u + 1]) for u in range(t, ret)}
        res.append(('spiral' if len(exc - prev) > 0 else 'circle', t))
    return res


def spiral(lin, days):
    out = []
    for l in lin:
        zones = l['zones']
        starts = l['lifeStart']
        per_day = np.zeros((days, 4))  # spirals, circles, abolitions, moving steps
        bounds = starts + [len(zones)]
        for i in range(len(starts)):
            a, b = bounds[i], bounds[i + 1]
            # life i occupies ticks a+1..b (zones index a..b-1); its trajectory starts at zone 0
            z = [0] + zones[a:b]
            for kind, t in excursions(z):
                day = min(days - 1, (a + t) // TICKS_PER_DAY)
                per_day[day, {'spiral': 0, 'circle': 1, 'abolition': 2, 'open': 3}[kind] if kind != 'open' else 3] += 0 if kind == 'open' else 1
            for tk in range(a, b):
                if zones[tk] != 5:
                    per_day[min(days - 1, tk // TICKS_PER_DAY), 3] += 1
        out.append(per_day)
    return out


# ---------- future-information test ----------
def mi(x, y):
    joint = np.bincount(x * 10 + y, minlength=100).reshape(10, 10).astype(float)
    p = joint / joint.sum()
    px = p.sum(1, keepdims=True)
    py = p.sum(0, keepdims=True)
    nz = p > 0
    return float((p[nz] * np.log2(p[nz] / (px @ py)[nz])).sum())


def future_info(lin, lags, n_null=200, seed=11):
    rng = np.random.default_rng(seed)
    Z = [np.array(l['zones']) for l in lin]
    C = [np.array(l['cues']) for l in lin]
    T = len(Z[0])

    def stat(shifts, k):
        xs, ys = [], []
        for z, c, s in zip(Z, C, shifts):
            cc = np.roll(c, -s)  # cc[t] = c[t+s]
            if k >= 0:
                xs.append(z[:T - k]); ys.append(cc[k:])
            else:
                xs.append(z[-k:]); ys.append(cc[:T + k])
        return mi(np.concatenate(xs), np.concatenate(ys))

    observed = {k: stat([0] * len(Z), k) for k in lags}
    nulls = {k: [] for k in lags}
    null_max_future = []
    for _ in range(n_null):
        lo = min(2000, T // 10)
        sh = [int(rng.integers(lo, T - lo)) for _ in Z]
        vals = {k: stat(sh, k) for k in lags}
        for k in lags:
            nulls[k].append(vals[k])
        null_max_future.append(max(vals[k] for k in lags if k > 0))
    res = {}
    for k in lags:
        arr = np.array(nulls[k])
        res[k] = {'mi': observed[k], 'nullMean': float(arr.mean()), 'z': float((observed[k] - arr.mean()) / (arr.std() + 1e-15)),
                  'p': float(((arr >= observed[k]).sum() + 1) / (len(arr) + 1))}
    obs_max = max(observed[k] for k in lags if k > 0)
    fw_p = float(((np.array(null_max_future) >= obs_max).sum() + 1) / (n_null + 1))
    return res, obs_max, fw_p


if __name__ == '__main__':
    L = load(sys.argv[1]); U = load(sys.argv[2]); days = int(sys.argv[3]) if len(sys.argv) > 3 else 30
    out = {}
    for name, lin in (('learner', L), ('control', U)):
        cap = capture(lin, days)
        tot = np.array(cap).sum(0)  # per day summed over lineages
        spi = np.array(spiral(lin, days)).sum(0)
        lags = [-3, -1, 0] + list(range(1, 61))
        fi, mx, fwp = future_info(lin, lags)
        out[name] = {
            'captureByDay': [round(c / n, 4) if n else None for n, c, m in tot],
            'memoryByDay': [round(m / n, 4) if n else None for n, c, m in tot],
            'captureOverall': round(tot[:, 1].sum() / tot[:, 0].sum(), 4),
            'memoryOverall': round(tot[:, 2].sum() / tot[:, 0].sum(), 4),
            'perLineageCapture': [round(sum(r[1] for r in l) / max(1, sum(r[0] for r in l)), 4) for l in cap],
            'spiralPer1kByDay': [round(1000 * s / m, 3) if m else None for s, c, a, m in spi],
            'circlePer1kByDay': [round(1000 * c / m, 3) if m else None for s, c, a, m in spi],
            'spiralShareByDay': [round(s / (s + c), 4) if s + c else None for s, c, a, m in spi],
            'spiralPer1kOverall': round(1000 * spi[:, 0].sum() / spi[:, 3].sum(), 3),
            'spiralShareOverall': round(spi[:, 0].sum() / (spi[:, 0].sum() + spi[:, 1].sum()), 4),
            'abolitions': int(spi[:, 2].sum()),
            'futureInfo': {str(k): {kk: round(vv, 6) for kk, vv in v.items()} for k, v in fi.items()},
            'futureMaxMI': round(mx, 6), 'futureFamilywiseP': round(fwp, 4),
        }
    json.dump(out, open(sys.argv[4] if len(sys.argv) > 4 else 'indices_out.json', 'w'), indent=1)
    for name in out:
        o = out[name]
        print(name, 'capture', o['captureOverall'], 'memory', o['memoryOverall'], 'spiral/1k', o['spiralPer1kOverall'],
              'spiral share', o['spiralShareOverall'], 'future max MI', o['futureMaxMI'], 'familywise p', o['futureFamilywiseP'])
        print('  k=0 z %.1f  k=-1 z %.1f  k=+1 z %.2f p %.3f' % (o['futureInfo']['0']['z'], o['futureInfo']['-1']['z'], o['futureInfo']['1']['z'], o['futureInfo']['1']['p']))
