#!/usr/bin/env bash
# PF-1 synthetic-only TSA fixture. Not an Amelia encounter.
set -euo pipefail
ROOT="experiments/pf1/deployment-synthetic-output"
mkdir -p "$ROOT/tsa"
test -f "$ROOT/seal-fixture.json"
curl -fsSL --retry 3 --max-time 30 https://freetsa.org/files/cacert.pem -o "$ROOT/tsa/cacert.pem"
printf '%s  %s\n' \
  2151b61137ffa86bf664691ba67e7da0b19f98c758e3d228d5d8ebf27e044438 \
  "$ROOT/tsa/cacert.pem" | sha256sum -c -
curl -fsSL --retry 3 --max-time 30 https://freetsa.org/files/tsa.crt -o "$ROOT/tsa/tsa.crt"
printf '%s  %s\n' \
  8bfb0305bb64e2571ca507552ef3245cb1c2fee8728e0ff8689225081ea13467 \
  "$ROOT/tsa/tsa.crt" | sha256sum -c -
openssl ts -query -data "$ROOT/seal-fixture.json" -no_nonce -sha256 -cert -out "$ROOT/tsa/fixture.tsq"
curl -fsSL --retry 3 --retry-all-errors --max-time 60 \
  -H 'Content-Type: application/timestamp-query' \
  --data-binary @"$ROOT/tsa/fixture.tsq" https://freetsa.org/tsr -o "$ROOT/tsa/fixture.tsr"
openssl ts -verify -queryfile "$ROOT/tsa/fixture.tsq" -in "$ROOT/tsa/fixture.tsr" \
 -CAfile "$ROOT/tsa/cacert.pem" -untrusted "$ROOT/tsa/tsa.crt" | grep -q 'Verification: OK'
sha256sum "$ROOT/seal-fixture.json" "$ROOT/tsa/fixture.tsr" > "$ROOT/tsa/VERIFIED_SHA256SUMS.txt"
echo PF1_SYNTH_TSA_REAL_OFFLINE_VERIFY_PASS
