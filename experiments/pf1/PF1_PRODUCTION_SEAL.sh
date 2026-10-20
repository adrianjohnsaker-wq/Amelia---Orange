#!/usr/bin/env bash
set -euo pipefail
dir=experiments/pf1/production-dry-run/output
mkdir -p "$dir/seals"
python - "$dir" <<'PY'
import json,sys,pathlib
root=pathlib.Path(sys.argv[1]);j=json.loads((root/'JOURNAL.json').read_text())
for i,x in enumerate(j['entries']):
 assert x['scientificEncounter'] is False and x['synthetic'] is True
 p=root/'seals'/f'entry-{i:03d}.json'
 content=json.dumps(x,sort_keys=True,separators=(',',':'))+'\n'
 if p.exists():assert p.read_text()==content,'REWRITTEN_SEALED_ENTRY'
 else:p.write_text(content)
print('PREPARED_SYNTHETIC_ENTRY_FILES',len(j['entries']))
PY
curl -fsSL --retry 3 --max-time 30 https://freetsa.org/files/cacert.pem -o "$dir/seals/cacert.pem"
echo "2151b61137ffa86bf664691ba67e7da0b19f98c758e3d228d5d8ebf27e044438  $dir/seals/cacert.pem" | sha256sum -c -
curl -fsSL --retry 3 --max-time 30 https://freetsa.org/files/tsa.crt -o "$dir/seals/tsa.crt"
echo "8bfb0305bb64e2571ca507552ef3245cb1c2fee8728e0ff8689225081ea13467  $dir/seals/tsa.crt" | sha256sum -c -
count=0
for data in "$dir"/seals/entry-*.json; do
  [ -f "$data" ] || continue
  base="$(echo "$data" | sed 's/\.json$//')"
  if [ ! -f "$base.tsr" ]; then
    openssl ts -query -data "$data" -sha256 -no_nonce -cert -out "$base.tsq"
    curl -fsSL --retry 3 --retry-all-errors --max-time 60 \
      -H 'Content-Type: application/timestamp-query' \
      --data-binary @"$base.tsq" https://freetsa.org/tsr -o "$base.tsr"
  fi
  openssl ts -verify -queryfile "$base.tsq" -in "$base.tsr" \
      -CAfile "$dir/seals/cacert.pem" -untrusted "$dir/seals/tsa.crt" \
      | grep -q 'Verification: OK'
  count=$((count+1))
done
python - "$dir" "$count" <<'PY'
import json,sys,pathlib,hashlib
root=pathlib.Path(sys.argv[1]);n=int(sys.argv[2])
entries=json.loads((root/'JOURNAL.json').read_text())['entries']
assert n==len(entries)>0
manifest={'schema':'PF1_SYNTHETIC_FIXTURE_PER_ENTRY_RFC3161_V1',
 'sealCount':n,'journalEntries':len(entries),
 'testOnly':True,'scientificEncounters':0,'liveRoundsAdmitted':0,
 'entries':[{'id':i,'entrySha256':hashlib.sha256((root/'seals'/f'entry-{i:03d}.json').read_bytes()).hexdigest(),
 'tokenSha256':hashlib.sha256((root/'seals'/f'entry-{i:03d}.tsr').read_bytes()).hexdigest(),
 'offlineVerified':True} for i in range(n)]}
(root/'seals'/'VERIFIED.json').write_text(json.dumps(manifest,indent=2,sort_keys=True)+'\n')
print('PF1_INTEGRATED_ARCHIVED_PER_ENTRY_FREETSA',json.dumps({'entries':n,'verified':n}))
PY
