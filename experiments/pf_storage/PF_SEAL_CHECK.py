"""PF S1 amendment 8: verify operational seals in order, later amendments superseding earlier hashes.

  python PF_SEAL_CHECK.py <seal dir> [<seal dir> ...]

Each directory holds one *_SIGNED_BUNDLE.json and its RFC3161 receipt. Every bundle's token must verify (C1 Sealer).
Every file listed by any bundle must currently have the SHA-256 given by the LAST bundle (in argument order) that
lists it. Amendment 8 re-seals the files it changes, so pass seal_a8 last. Read-only.
"""
import hashlib, json, pathlib, sys
from drift1a_c1.beacon import Sealer

def h(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()

def main(dirs):
    want = {}
    for d in map(pathlib.Path, dirs):
        bundle = next(d.glob('*_SIGNED_BUNDLE.json'))
        assert Sealer().verify(d, h(bundle))['status'] == 'PASS', 'PF_SEAL_TOKEN_FAILED ' + str(d)
        b = json.loads(bundle.read_text())
        assert b.get('scienceChanged') is False, 'PF_SEAL_SCIENCE_FLAG ' + str(d)
        for x in b['sourceSHA256']: want[x['path']] = (x['sha256'], d.name)
    for path, (digest, src) in sorted(want.items()):
        assert h(path) == digest, f'PF_SEAL_HASH_CHANGED {path} (sealed in {src})'
    print('PF_SEAL_CHECK_PASS', json.dumps({'bundles': [pathlib.Path(d).name for d in dirs], 'files': len(want)}))

if __name__ == '__main__': main(sys.argv[1:])
