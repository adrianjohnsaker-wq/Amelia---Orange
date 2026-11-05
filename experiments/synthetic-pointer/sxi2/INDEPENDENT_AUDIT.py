#!/usr/bin/env python3
"""Post-run independent rational-arithmetic and archive audit; changes no data."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from fractions import Fraction
import hashlib
import itertools
import json
from pathlib import Path
import zstandard

ARMS={'live':('live','dynamic','none'),'replay':('replay','dynamic','none'),
 'shuffled':('shuffled','dynamic','none'),'sham':('sham','dynamic','none'),
 'target_dynamic':('live','dynamic','targeted'),'target_frozen':('live','frozen','targeted'),
 'orthogonal':('live','dynamic','orthogonal')}
def sha(path):
 h=hashlib.sha256()
 with path.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def retention(triples):
 def distance(a,b):
  assert sum(a.values())==sum(b.values())==498
  return sum(abs(a.get(k,0)-b.get(k,0)) for k in set(a)|set(b))
 return Fraction(distance(triples['baseline'],triples['post'])-distance(triples['exposure'],triples['post']),996)
def audit_archive(p):
 receipt=json.loads((p/'run_receipt.json').read_text()); archive=receipt['archive'];v=receipt['verification']
 assert v['status']=='PASS' and v['steps']==20160
 file=p/f"attempt_{receipt['attempt']}"/archive['compressed_file']
 assert sha(file)==archive['compressed_sha256']
 h=hashlib.sha256()
 with file.open('rb') as raw, zstandard.ZstdDecompressor().stream_reader(raw) as stream:
  for b in iter(lambda:stream.read(1024*1024),b''):h.update(b)
 assert h.hexdigest()==archive['trace_sha256']
 return str(p)
def main():
 parser=argparse.ArgumentParser();parser.add_argument('root',type=Path);parser.add_argument('output',type=Path);a=parser.parse_args();root=a.root
 result=json.loads((root/'analysis.json').read_text());execution=json.loads((root/'execution.json').read_text())
 assert execution['planned']==execution['completed']==64 and not execution['errors']
 paths=[root/'runs'/f'W{w}'/arm for w in range(9701,9709) for arm in ARMS]
 paths += [root/'donors'/f'W{w}' for w in range(9801,9809)]
 with ThreadPoolExecutor(max_workers=4) as pool: checked=list(pool.map(audit_archive,paths))
 differences={x:[] for x in ('replay','shuffled')}; cf={x:0 for x in ('ticks','stateChanged','symbolChanged','gateChanged','eligibleChoices','winnerChanged')}
 for w in range(9701,9709):
  scores={};donor=root/'donor_feedback'/f'W{w+100}.json';donor_data=json.loads(donor.read_text())
  assert donor_data['donor']['world']==f'S05W{w+100}' and len(donor_data['sensors'])==4800
  for arm,expected in ARMS.items():
   base=root/'runs'/f'W{w}'/arm; r=json.loads((base/'run_receipt.json').read_text());v=r['verification'];x=json.loads((base/'extract.json').read_text())
   assert (v['mode'],v['pointerMode'],v['mutationMode'])==expected
   assert v['world']==f'S05W{w}' and r['extract_sha256']==sha(base/'extract.json')
   assert v['activeTicks']==(0 if arm=='sham' else 4800)
   assert abs(v['absoluteDose']-(0 if arm=='sham' else 240))<1e-7
   if arm in ('replay','shuffled'): assert v['donorSha256']==sha(donor) and x['donorWorld']==f'S05W{w+100}'
   scores[arm]=retention(x['triplets'])
   stored=next(z for z in result['rows'] if z['world']==w)[arm]['retention']
   assert abs(float(scores[arm])-stored)<1e-12
   if arm=='live':
    for k in cf:cf[k]+=x['counterfactual'][k]
  for control in differences:differences[control].append(scores['live']-scores[control])
 tests=[]
 for control, values in differences.items():
  vals=[v-Fraction(1,20) for v in values];observed=sum(vals)
  count=sum(sum(s*v for s,v in zip(signs,vals))>=observed for signs in itertools.product((-1,1),repeat=8))
  tests.append({'control':control,'mean_difference':float(sum(values)/8),'worlds_above_margin':sum(v>Fraction(1,20) for v in values),'exact_sign_flip_p':count/256})
 for t in tests:
  recorded=next(z for z in result['tests'] if z['control']==t['control'])
  assert abs(t['mean_difference']-recorded['mean_difference'])<1e-12
  assert t['worlds_above_margin']==recorded['worlds_above_margin'] and t['exact_sign_flip_p']==recorded['p_one_sided_sign_flip']
 report={'status':'PASS','checked_64_archive_hashes_and_decompression':len(checked),'verified_arm_identities_and_donor_hashes':True,
  'exact_integer_motif_and_rational_sign_flip_recalculation':tests,'live_counterfactual_totals':cf,
  'note':'Independent recalculation uses the committed trace extracts; it does not independently repeat each full simulation.'}
 with a.output.open('x') as f:json.dump(report,f,indent=2);f.write('\n')
 print(json.dumps(report,indent=2))
if __name__=='__main__':main()
