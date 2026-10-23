import json, sys, numpy as np
sys.path.insert(0, sys.argv[4])
from indices import load, future_info
L = load(sys.argv[1]); U = load(sys.argv[2]); n = int(sys.argv[3])
for name, lin in (('learner', L), ('control', U)):
    fi, mx, fwp = future_info(lin, [0] + list(range(1, 61)), n_null=n, seed=99)
    top = sorted([k for k in fi if k > 0], key=lambda k: -fi[k]['z'])[:3]
    print(name, 'future max MI %.6f familywise p %.4f' % (mx, fwp), 'top lags', [(k, round(fi[k]['z'], 2)) for k in top], 'k=0 z %.0f' % fi[0]['z'])
