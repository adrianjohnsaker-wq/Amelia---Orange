"""PF S1 amendment 8: live PF state stored outside Git history.

Drop-in replacement for PF_SHARD.join_all / split_all (same names, same calls). Under S1 every batch committed fresh
38 MB shard files, so the repository grew by gigabytes a day and checkouts slowed until runs hit their time limit.

Now the full live file (STATE.json, SILENT_LEDGER.json) is stored as a gzip'd, content-addressed asset of the GitHub
release `pf-live-state`. Git tracks only a small pointer, <file>.pointer.json, giving the file's SHA-256, size and
asset name. The pointer is committed atomically with each batch, exactly where the shards used to be. Consequences:

  - Integrity: `join` downloads the asset named by the committed pointer and refuses unless the decompressed bytes
    have exactly the SHA-256 the pointer records. No commit, chunk, seal or genesis changes meaning.
  - A refused push leaves the committed pointer, and therefore the committed state, untouched. The extra uploaded
    asset is simply unreferenced.
  - Pruning keeps the asset named by the committed pointer plus the KEEP newest assets per file. Nothing else is
    ever deleted.
  - Before migration (no pointer yet) `join` falls back to the S1 shards through the unchanged PF_SHARD.join.

  python PF_STORE.py join <file>...    python PF_STORE.py split <file>...    python PF_STORE.py verify <file>...
Tests: PF_STORE_LOCAL_DIR=<dir> stores assets in a local directory instead of the release.
"""
import gzip, hashlib, json, os, pathlib, subprocess, sys, tempfile

RELEASE = 'pf-live-state'
KEEP = 8
SCHEMA = 'PF_A8_STATE_POINTER_V1'
REPO = os.environ.get('GITHUB_REPOSITORY', 'adrianjohnsaker-wq/Amelia---Orange')
LOCAL = os.environ.get('PF_STORE_LOCAL_DIR')
_RELEASE_ID = None

def sha(b): return hashlib.sha256(b).hexdigest()
def pointer_path(path): p = pathlib.Path(path); return p.with_name(p.name + '.pointer.json')

def prefix(path):
    p = pathlib.Path(path).resolve()
    pf = next(x for x in reversed(p.parts) if x in ('pf1', 'pf2'))
    return f'{pf}--{p.name}'

def _gh(*args):
    r = subprocess.run(['gh', *args, '-R', REPO] if args[0] == 'release' else ['gh', *args], capture_output=True, text=True)
    if r.returncode: raise RuntimeError('PF_STORE_GH_FAILED gh ' + ' '.join(args[:3]) + ': ' + r.stderr[-500:])
    return r.stdout

def _assets():
    if LOCAL: return [{'name': f.name, 'created_at': f'{f.stat().st_mtime_ns:020d}'} for f in pathlib.Path(LOCAL).glob('*.json.gz')]
    global _RELEASE_ID
    if _RELEASE_ID is None: _RELEASE_ID = json.loads(_gh('api', f'repos/{REPO}/releases/tags/{RELEASE}'))['id']
    out, page = [], 1
    while True:
        batch = json.loads(_gh('api', f'repos/{REPO}/releases/{_RELEASE_ID}/assets?per_page=100&page={page}'))
        out += [{'name': a['name'], 'created_at': a['created_at']} for a in batch]
        if len(batch) < 100: return out
        page += 1

def _upload(local_file):
    if LOCAL:
        d = pathlib.Path(LOCAL); d.mkdir(parents=True, exist_ok=True); (d / local_file.name).write_bytes(local_file.read_bytes()); return
    _gh('release', 'upload', RELEASE, str(local_file), '--clobber')

def _download(name, dest_dir):
    if LOCAL: return (pathlib.Path(LOCAL) / name).read_bytes()
    _gh('release', 'download', RELEASE, '-p', name, '-D', str(dest_dir), '--clobber')
    return (pathlib.Path(dest_dir) / name).read_bytes()

def _delete(name):
    if LOCAL: (pathlib.Path(LOCAL) / name).unlink(missing_ok=True); return
    _gh('release', 'delete-asset', RELEASE, name, '-y')

def _committed_pointer(path):
    """The pointer as committed at HEAD (what the remote holds after a confirmed push), or None."""
    rel = os.path.relpath(pointer_path(path), _toplevel())
    r = subprocess.run(['git', 'show', f'HEAD:{rel}'], capture_output=True, text=True, cwd=_toplevel())
    return json.loads(r.stdout) if r.returncode == 0 else None

def _toplevel():
    return subprocess.run(['git', 'rev-parse', '--show-toplevel'], capture_output=True, text=True, check=True).stdout.strip()

def split(path):
    """Store the full file as a content-addressed asset and write its pointer. Same role as PF_SHARD.split."""
    p = pathlib.Path(path); raw = p.read_bytes(); digest = sha(raw)
    name = f'{prefix(p)}--{digest}.json.gz'
    gz = gzip.compress(raw, compresslevel=6, mtime=0)
    have = {a['name'] for a in _assets()}
    if name not in have:
        with tempfile.TemporaryDirectory() as td:
            f = pathlib.Path(td) / name; f.write_bytes(gz); _upload(f)
        listing = _assets()
        if name not in {a['name'] for a in listing}: raise RuntimeError('PF_STORE_UPLOAD_NOT_LISTED ' + name)
    else:
        listing = None
    ptr = {'schema': SCHEMA, 'file': p.name, 'sha256': digest, 'size': len(raw), 'asset': name, 'gzSha256': sha(gz), 'release': RELEASE}
    pointer_path(p).write_text(json.dumps(ptr, sort_keys=True, indent=1) + '\n')
    assert verify(p), 'PF_STORE_SPLIT_DID_NOT_ROUND_TRIP ' + str(p)
    _prune(p, keep_names={name}, listing=listing)
    return ptr

def _prune(path, keep_names, listing=None):
    try:
        committed = _committed_pointer(path)
        if committed: keep_names = set(keep_names) | {committed['asset']}
        mine = sorted((a for a in (listing if listing is not None else _assets()) if a['name'].startswith(prefix(path) + '--')), key=lambda a: a['created_at'], reverse=True)
        for a in mine[KEEP:]:
            if a['name'] not in keep_names: _delete(a['name'])
    except Exception as e:  # pruning is housekeeping only; never fail a batch for it
        print('PF_STORE_PRUNE_SKIPPED', repr(e)[:300], flush=True)

def join(path):
    """Rebuild the exact committed file from its pointer. Same role as PF_SHARD.join."""
    p = pathlib.Path(path); pp = pointer_path(p)
    if not pp.exists():
        sys.path.insert(0, str(pathlib.Path(__file__).parent)); import PF_SHARD
        return PF_SHARD.join(p)
    ptr = json.loads(pp.read_text())
    assert ptr['schema'] == SCHEMA and ptr['file'] == p.name and ptr['release'] == RELEASE, 'PF_STORE_BAD_POINTER ' + str(pp)
    if p.exists() and sha(p.read_bytes()) == ptr['sha256']:
        print('PF_STORE_JOIN', p, ptr['sha256'], '(already exact)', flush=True); return ptr['sha256']
    with tempfile.TemporaryDirectory() as td:
        gz = _download(ptr['asset'], td)
    assert sha(gz) == ptr['gzSha256'], 'PF_STORE_ASSET_GZ_HASH_MISMATCH ' + ptr['asset']
    raw = gzip.decompress(gz)
    assert len(raw) == ptr['size'] and sha(raw) == ptr['sha256'], 'PF_STORE_JOIN_HASH_MISMATCH ' + str(p)
    tmp = p.with_name('.' + p.name + '.join.tmp'); tmp.write_bytes(raw); tmp.replace(p)
    print('PF_STORE_JOIN', p, ptr['sha256'], flush=True)
    return ptr['sha256']

def verify(path):
    p = pathlib.Path(path); pp = pointer_path(p)
    if not (p.exists() and pp.exists()): return False
    return sha(p.read_bytes()) == json.loads(pp.read_text())['sha256']

def present(path): return pointer_path(path).exists() or (pathlib.Path(str(path) + '.shards') / 'MANIFEST.json').exists()
def join_all(paths): return {str(p): join(p) for p in paths if present(p)}
def split_all(paths): return {str(p): split(p)['sha256'] for p in paths if pathlib.Path(p).exists()}

if __name__ == '__main__':
    op, files = sys.argv[1], sys.argv[2:]
    assert op in ('join', 'split', 'verify') and files, __doc__
    for f in files:
        if op == 'join': join(f)
        elif op == 'split': print('PF_STORE_SPLIT', f, split(f)['sha256'])
        else:
            ok = verify(f); print('PF_STORE_VERIFY', f, ok)
            if not ok: sys.exit(1)
