#!/usr/bin/env python3
"""ANTENNA B world run (see REGISTRATION.md): primary answer on the merged stream; per-source descriptive.
  python3 run_world.py <world.json> <out dir>
"""
import json, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from structure import analyse
d = json.load(open(sys.argv[1])); out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
primary = analyse(d['zones'], label='B-world')
per = {}
for s in ('markets', 'sun', 'words', 'earth', 'date'):
    z = [x for x, t in zip(d['zones'], d['streams']) if t == s]; M = len(z) // 1000
    per[s] = analyse(z, M=min(M, 16), label=f'B-world-{s}') if M >= 5 else {'answer': f'not measured ({len(z)} data < 5,000)'}
lines = ['ANTENNA B: world stream order structure (REGISTRATION.md)', f"data: {len(d['zones'])} first seen {d['first']} .. {d['last']}", '',
         f"PRIMARY (merged stream): {primary['answer']}  K={primary['K']} E={primary['elements']} recurring={primary['recurring']}",
         f"   recurs: {primary['recurs'][:30]}", f"   mutual information (descriptive): {primary['mutualInformation']}", '', 'Per source (descriptive):']
for s, v in per.items():
    lines.append(f"   {s:8} {v['answer']}" + (f"  M={v['M']} K={v['K']} recurring={v['recurring']} recurs {v['recurs'][:12]}" if 'K' in v else ''))
(out / 'RESULT.txt').write_text('\n'.join(lines) + '\n'); json.dump({'primary': primary, 'perSource': per}, open(out / 'result.json', 'w'), indent=1)
print('\n'.join(lines))
