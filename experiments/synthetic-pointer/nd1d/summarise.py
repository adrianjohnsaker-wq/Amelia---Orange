#!/usr/bin/env python3
"""ND-1d summary of one calibrate.sh run (REGISTRATION.md).  python3 summarise.py <outdir> <cfg> <arch>
Motif read-back at 2% is pooled over all 2% streams (exact 1-8-7-2 count / motif count), for the tested architecture and for
today's architecture on the same segments."""
import glob, json, os, sys
O, cfg, arch = sys.argv[1:4]
R = {os.path.basename(f)[:-12]: json.load(open(f)) for f in glob.glob(f'{O}/runs/*.result.json')}
M = {os.path.basename(f)[:-11]: json.load(open(f)) for f in glob.glob(f'{O}/runs/*.motif.json')}
def pool(keys, who):
    n = sum(M[k][who]['motifs'] for k in keys); x = sum(M[k][who]['exact1872'] for k in keys); return round(x / max(1, n), 4)
p2 = sorted(k for k in R if k.startswith('plant2_'))
print(json.dumps({'cfg': cfg, 'arch': arch,
  'cleanReceived': sum(R[k]['answer'] == 'RECEIVED' for k in R if k.startswith('clean')), 'cleanStreams': sum(1 for k in R if k.startswith('clean')),
  'plant2Received': sum(R[k]['answer'] == 'RECEIVED' for k in p2), 'plant2Streams': len(p2),
  'plant5': R['plant_0.05']['answer'], 'plant10': R['plant_0.10']['answer'],
  'motif': {'0.02': {'tested': pool(p2, 'candidate'), 'exit': pool(p2, 'exit')},
            '0.05': {'tested': pool(['plant_0.05'], 'candidate'), 'exit': pool(['plant_0.05'], 'exit')},
            '0.10': {'tested': pool(['plant_0.10'], 'candidate'), 'exit': pool(['plant_0.10'], 'exit')}},
  'streams': {k: {'answer': v['answer'], 'recurs': v['canonical']['recurs'][:6]} for k, v in sorted(R.items())}}, indent=1))
