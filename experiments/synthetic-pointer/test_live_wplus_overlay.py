#!/usr/bin/env python3
"""Check live-overlay provenance and fail-closed invocation guards."""
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

from build_live_wplus_overlay import build


def main():
    if len(sys.argv) != 4:
        raise SystemExit('usage: python test_live_wplus_overlay.py REGISTERED_RUNNER RUNTIME_MIRROR LIVE_MODULE')
    source, runtime, module = [Path(x).resolve() for x in sys.argv[1:]]
    with tempfile.TemporaryDirectory(prefix='sxi-live-guards-') as temp:
        root = Path(temp)
        invalid = root / 'invalid.txt'
        invalid.write_text('not the registered runner')
        output = root / 'live.mjs'
        try:
            build(invalid, module, output)
            raise AssertionError('Wrong source accepted')
        except ValueError:
            pass
        assert not output.exists()
        build(source, module, output)
        try:
            build(source, module, output)
            raise AssertionError('Existing overlay overwritten')
        except FileExistsError:
            pass
        tampered = root / 'tampered.mjs'
        shutil.copyfile(module, tampered)
        with tampered.open('a') as stream:
            stream.write('\n// intentionally changed in a test copy\n')
        args = ['node', '--experimental-strip-types', '--no-warnings', str(output), f'm={runtime}',
            'world=1', 'seasons=1', 'lineages=1', 'mode=plus', 'inf=I', 'refrain=evo',
            f'out={root / "out"}', 'sxiTrace=1', f'sxiModule={tampered}',
            'sxiMode=live', 'sxiPointer=dynamic', 'sxiMutation=none']
        result = subprocess.run(args, capture_output=True, text=True)
        assert result.returncode and 'Live source module hash mismatch' in result.stderr
        assert not (root / 'out').exists()
        args[-4] = f'sxiModule={module}'
        args[-3] = 'sxiMode=invalid'
        result = subprocess.run(args, capture_output=True, text=True)
        assert result.returncode and 'Explicit live-loop modes are required' in result.stderr
        assert not (root / 'out').exists()
    print('PASS: source identity, create-only output, source-module hash and mode guards')


if __name__ == '__main__':
    main()
