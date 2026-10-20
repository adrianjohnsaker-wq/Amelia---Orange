#!/usr/bin/env bash
# Synthetic PF-1 pilot only. All tokens are detached; no live beacon data.
set -euo pipefail
cd experiments/pf1/a1-r2-repilot-output
mkdir -p tsa/local tsa/freetsa
openssl req -x509 -newkey rsa:2048 -nodes -days 2 -sha256 \
 -subj '/CN=PF1 synthetic test root' -keyout tsa/local/root.key -out tsa/local/root.pem 2>/dev/null
openssl req -new -newkey rsa:2048 -nodes -sha256 \
 -subj '/CN=PF1 synthetic local TSA' -keyout tsa/local/tsa.key -out tsa/local/tsa.csr 2>/dev/null
cat > tsa/local/tsa.ext <<'EOF'
basicConstraints=CA:FALSE
keyUsage=critical,digitalSignature
extendedKeyUsage=critical,timeStamping
subjectKeyIdentifier=hash
authorityKeyIdentifier=keyid,issuer
EOF
openssl x509 -req -in tsa/local/tsa.csr -CA tsa/local/root.pem \
 -CAkey tsa/local/root.key -CAcreateserial -out tsa/local/tsa.crt \
 -days 2 -sha256 -extfile tsa/local/tsa.ext 2>/dev/null
printf '01\n' > tsa/local/serial
cat > tsa/local/tsa.cnf <<'EOF'
[tsa]
default_tsa=tsa_config
[tsa_config]
serial=tsa/local/serial
signer_cert=tsa/local/tsa.crt
certs=tsa/local/root.pem
signer_key=tsa/local/tsa.key
signer_digest=sha256
default_policy=1.3.6.1.4.1.13762.3
digests=sha256
accuracy=secs:1
ordering=yes
tsa_name=yes
ess_cert_id_chain=yes
clock_precision_digits=0
EOF
count=0
for f in entries/entry-*.json; do
 test -f "$f" || continue
 name=$(basename "$f" .json)
 openssl ts -query -data "$f" -sha256 -cert -out "tsa/local/$name.tsq"
 openssl ts -reply -config tsa/local/tsa.cnf -section tsa_config \
  -queryfile "tsa/local/$name.tsq" -out "tsa/local/$name.tsr"
 openssl ts -verify -queryfile "tsa/local/$name.tsq" -in "tsa/local/$name.tsr" \
  -CAfile tsa/local/root.pem -untrusted tsa/local/tsa.crt | grep -q 'Verification: OK'
 count=$((count+1))
done
test "$count" -gt 0
# Verify a real RFC 3161 response against a *previously pinned* FreeTSA root,
# never accept an unknown current root as a replacement.
curl -fsSL --retry 3 --max-time 30 https://freetsa.org/files/cacert.pem -o tsa/freetsa/cacert.pem
printf '%s  %s\n' \
 2151b61137ffa86bf664691ba67e7da0b19f98c758e3d228d5d8ebf27e044438 \
 tsa/freetsa/cacert.pem | sha256sum -c -
curl -fsSL --retry 3 --max-time 30 https://freetsa.org/files/tsa.crt -o tsa/freetsa/tsa.crt
printf '%s  %s\n' \
 8bfb0305bb64e2571ca507552ef3245cb1c2fee8728e0ff8689225081ea13467 \
 tsa/freetsa/tsa.crt | sha256sum -c -
openssl ts -query -data journal.jsonl -no_nonce -sha256 -cert -out tsa/freetsa/journal.tsq
curl -fsSL --retry 3 --retry-all-errors --max-time 60 \
 -H 'Content-Type: application/timestamp-query' \
 --data-binary @tsa/freetsa/journal.tsq \
 https://freetsa.org/tsr -o tsa/freetsa/journal.tsr
openssl ts -verify -in tsa/freetsa/journal.tsr \
 -queryfile tsa/freetsa/journal.tsq \
 -CAfile tsa/freetsa/cacert.pem -untrusted tsa/freetsa/tsa.crt | grep -q 'Verification: OK'
node -e '
 const fs=require("fs"),c=require("crypto"),p="tsa/local";
 const files=fs.readdirSync(p).filter(x=>x.endsWith(".tsr")).sort();
 const sha=(b)=>c.createHash("sha256").update(b).digest("hex");
 const output={schema:"PF1_RFC3161_VERIFIED_V1",localVerified:files.length,
   locallySealedEntries:files.map(x=>({name:x,tokenSha256:sha(fs.readFileSync(p+"/"+x))})),
   freeTsaVerified:true,freeTsaRootSha256:"2151b61137ffa86bf664691ba67e7da0b19f98c758e3d228d5d8ebf27e044438",
   freeTsaTokenSHA256:sha(fs.readFileSync("tsa/freetsa/journal.tsr"))};
 fs.writeFileSync("seal-verification.json",JSON.stringify(output,null,2)+"\n");
'
# Never archive locally generated private TSA keys, even in CI artifacts.
rm -f tsa/local/root.key tsa/local/tsa.key tsa/local/tsa.csr tsa/local/root.srl
echo PF1_RFC3161_LOCAL_AND_FREETSA_VERIFIED "$count"
