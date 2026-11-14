#!/usr/bin/env python3
"""Build the explorer page from matrix.json:   python3 page/build.py <out.html>"""
import json, pathlib, sys
H = pathlib.Path(__file__).resolve().parent
d = json.dumps(json.load(open(H.parent / 'matrix.json')), separators=(',', ':')).replace('</', '<\\/')
open(sys.argv[1], 'w').write(open(H / 'template.html').read().replace('__DATA__', d))
