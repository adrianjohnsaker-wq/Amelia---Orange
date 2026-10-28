#!/usr/bin/env python3
"""THE POINTER III, supplementary (NOT registered; written after A's registered result): is A's SD comparison
a level effect? Compares relative spread (SD / mean) and asks whether the rewired mean leaves the whole range of
the 20 input-seed lives.   python3 supplementary_A_check.py <holism dir>"""
import glob, json, statistics as st, sys
rs = [json.load(open(f)) for f in sorted(glob.glob(f"{sys.argv[1]}/*.json"))]
for F in ("F1", "F2", "F3"):
    pos = neg = out = 0
    for r in rs:
        s = [x["rate"] for x in r["seed"][F] if x["rate"] is not None]; w = [x["rate"] for x in r["rewired"][F] if x["rate"] is not None]
        cv = lambda v: st.pstdev(v) / st.mean(v) if st.mean(v) > 0 else 0
        d = cv(w) - cv(s); pos += d > 0; neg += d < 0
        out += st.mean(w) > max(s) or st.mean(w) < min(s)
    print(f"{F}: relative spread rewired > seed {pos} / {neg};  rewired mean outside the whole seed range: {out} of {len(rs)}")
