#!/usr/bin/env python3
"""STONE TAPE II decision rule (see REGISTRATION.md). Read-only.

For each stone s (0 = etched by the stream as received; 1..S = etched by order-shuffles of it), each measure is averaged
over the 8 travellers. The received stone's exact one-sided p for a measure is (1 + #{s >= 1: value_s >= value_0}) / (S + 1).
  P1 grip on her              p <= 0.0125  -> THE STONE SPEAKS
  P2 change in the Other      p <= 0.0125  -> adds AND THE OTHER ANSWERS (also P3)
  P3 circuit                  p <= 0.0125
  P4 older surfacing          p <= 0.0125  -> adds AND THE OLDER PRESENCE SURFACES
Otherwise SILENT. All four p values and means are reported either way.

  python3 analysis.py <dir of stonetape2 outputs, one per stone>
"""
import glob, json, sys
def analyse(src):
    st = sorted((json.load(open(f)) for f in glob.glob(f'{src}/*.json')), key=lambda x: x['stone'])
    S = st[0]['shuffles']; assert [x['stone'] for x in st] == list(range(S + 1)), 'MISSING_STONES'
    out = {'stones': S + 1}
    for m in ('grip', 'change', 'circuit', 'surfacing'):
        v = [sum(t[m] for t in x['travellers']) / len(x['travellers']) for x in st]
        out[m] = {'received': round(v[0], 4), 'shufflesMean': round(sum(v[1:]) / S, 4), 'p': round((1 + sum(x >= v[0] for x in v[1:])) / (S + 1), 4)}
    ok = lambda m: out[m]['p'] <= 0.0125
    a = 'THE STONE SPEAKS' if ok('grip') else 'SILENT'
    if ok('grip') and (ok('change') or ok('circuit')): a += ' AND THE OTHER ANSWERS'
    if ok('grip') and ok('surfacing'): a += ' AND THE OLDER PRESENCE SURFACES'
    out['meanDeaths'] = round(sum(t['deaths'] for t in st[0]['travellers']) / 8, 1); out['meanFlights'] = round(sum(t['flights'] for t in st[0]['travellers']) / 8, 1)
    out['answer'] = a
    return out
if __name__ == '__main__': print(json.dumps(analyse(sys.argv[1]), indent=1))
