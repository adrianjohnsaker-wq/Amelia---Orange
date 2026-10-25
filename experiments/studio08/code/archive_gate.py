#!/usr/bin/env python3
"""Studio 08 strict provenance gate for importing the operator's EXISTING studio archive.

No archive files are generated, changed or reconstructed by this tool. A supplied
manifest binds original bytes and SHA256 digests. --check does not start science.
The file paths in the manifest are relative to --archive-root and confined there.

Usage:
  python3 experiments/studio08/code/archive_gate.py --check --archive-root /path/to/studio-archive --manifest /path/to/manifest.json
  python3 experiments/studio08/code/archive_gate.py --self-test

This is a *packaging gate*, not evidence the original experiments ran correctly.
"""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import tempfile

REQUIRED_ROLES = (
    "studio05_record",
    "studio05c_precommit",
    "studio06b_precommit",
    "studio07_precommit",
    "studio05_runner",
    "studio07_runner",
    "studio07_full_checkpoints",
    "studio07_traces",
)
MIN_SHA = 64

def require(ok, message):
    if not ok:
        raise ValueError(message)

def _file_digest(file):
    h=hashlib.sha256()
    with open(file,'rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''):
            h.update(b)
    return h.hexdigest()

def _resolve(root, path):
    require(isinstance(path,str) and len(path)>0, 'path must be a nonempty string')
    p=PurePosixPath(path)
    require(not p.is_absolute() and all(part not in ('.','..') for part in p.parts)
            and not str(p).startswith('~'), 'path must be canonical and relative: '+path)
    full=(root / path).resolve()
    require(full.is_relative_to(root.resolve()),'path escapes source root: '+path)
    return full

def validate(root, manifest):
    root=Path(root).resolve()
    m=json.loads(Path(manifest).read_bytes())
    require(m.get('schema') == 'STUDIO08_WORKING_PROJECT_SOURCE_MANIFEST_V1',
            'manifest schema mismatch')
    require(m.get('operator_source') == 'existing_working_project_archive',
            'must identify existing working-project archive')
    entries=m.get('files')
    require(isinstance(entries,list) and entries,'nonempty files[] required')
    seen_paths=set()
    seen_roles=set()
    reports=[]
    for row in entries:
        require(isinstance(row,dict),'each files entry must be an object')
        rel=row.get('path')
        role=row.get('role')
        expected=row.get('sha256')
        require(isinstance(role,str) and bool(role),'file role required')
        require(rel not in seen_paths,'duplicate archive path: '+str(rel))
        require(role not in seen_roles,'duplicate role: '+role)
        seen_paths.add(rel)
        seen_roles.add(role)
        require(isinstance(expected,str) and len(expected)==MIN_SHA
                and all(c in '0123456789abcdef' for c in expected),
                'expected lowercase SHA256: '+str(role))
        path=_resolve(root,rel)
        require(path.is_file(),'missing original archive file: '+str(rel))
        actual=_file_digest(path)
        require(actual == expected,'SHA256 mismatch (do not overwrite original): '+str(rel))
        require(path.stat().st_size>0,'archive file empty: '+str(rel))
        reports.append({'role':role,'path':rel,'sha256':actual,'bytes':path.stat().st_size})
    absent=[role for role in REQUIRED_ROLES if role not in seen_roles]
    require(not absent,'missing mandatory source roles: '+', '.join(absent))
    return {'status':'STUDIO08_ORIGINAL_ARCHIVE_HASH_GATE_PASS_NOT_SCIENCE',
            'files':reports,'roles':len(seen_roles),'archiveRoot':str(root),
            'noScienceRun':True,'noFilesModified':True}

def selftest():
    with tempfile.TemporaryDirectory() as tmp:
        root=Path(tmp)
        entries=[]
        for role in REQUIRED_ROLES:
            name=role+'.txt'
            payload=('ORIGINAL-FIXTURE-'+role+'\n').encode()
            (root/name).write_bytes(payload)
            entries.append({'role':role,'path':name,'sha256':hashlib.sha256(payload).hexdigest()})
        m={'schema':'STUDIO08_WORKING_PROJECT_SOURCE_MANIFEST_V1',
           'operator_source':'existing_working_project_archive','files':entries}
        mf=root/'manifest.json'
        mf.write_text(json.dumps(m))
        assert validate(root,mf)['roles']==len(REQUIRED_ROLES)
        (root/(REQUIRED_ROLES[0]+'.txt')).write_text('CHANGED\n')
        try:
            validate(root,mf)
            raise AssertionError('changed original source accepted')
        except ValueError as e:
            assert 'SHA256 mismatch' in str(e)
        (root/(REQUIRED_ROLES[0]+'.txt')).write_text('ORIGINAL-FIXTURE-'+REQUIRED_ROLES[0]+'\n')
        m['files'][0]['path']='../outside'
        mf.write_text(json.dumps(m))
        try:
            validate(root,mf)
            raise AssertionError('path escape accepted')
        except ValueError as e:
            assert 'canonical and relative' in str(e)
        m['files'][0]['path']=REQUIRED_ROLES[0]+'.txt'
        m['files']=m['files'][:-1]
        mf.write_text(json.dumps(m))
        try:
            validate(root,mf)
            raise AssertionError('missing role accepted')
        except ValueError as e:
            assert 'missing mandatory source roles' in str(e)
        print(json.dumps({'status':'STUDIO08_ARCHIVE_GATE_SELFTEST_PASS',
                          'cases':4,'syntheticFixturesOnly':True}))

def main():
    p=argparse.ArgumentParser()
    op=p.add_mutually_exclusive_group(required=True)
    op.add_argument('--self-test',action='store_true')
    op.add_argument('--check',action='store_true')
    p.add_argument('--archive-root')
    p.add_argument('--manifest')
    args=p.parse_args()
    if args.self_test:
        selftest()
    else:
        require(args.archive_root and args.manifest,'--archive-root and --manifest required')
        print(json.dumps(validate(args.archive_root,args.manifest),sort_keys=True))

if __name__=='__main__':
    main()
