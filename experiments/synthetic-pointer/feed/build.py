import json, sys, collections
F = sys.argv[1]; d = json.load(open(f'{F}/feed.json')); H = d['headlines']
dem = collections.Counter(p['demon']['name'] for h in H for p in h['herPassage'] if p['demon'])
syz = {(0,9),(1,8),(2,7),(3,6),(4,5)}
syzc = collections.Counter('%d::%d' % tuple(sorted((p['from'],p['to']))) for h in H for p in h['herPassage'] if tuple(sorted((p['from'],p['to']))) in syz)
summary = {'n': len(H), 'first': H[0]['seenAt'], 'last': H[-1]['seenAt'], 'generated': d['generated'],
           'demons': dem.most_common(9), 'syzygies': sorted(syzc.items(), key=lambda x: -x[1]), 'warpBorn': H[-1]['warpBorn'],
           'steps': sum(len(h['herRoute']) - 1 for h in H)}
data = json.dumps({'summary': summary, 'headlines': list(reversed(H))}).replace('</', '<\\/')
html = open(f'{F}/template.html').read().replace('__DATA__', data)
open(f'{F}/pandemonium-feed.html', 'w').write(html); print(summary['demons'], summary['syzygies'], summary['warpBorn'])
