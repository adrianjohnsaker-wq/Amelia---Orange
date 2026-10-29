#!/usr/bin/env python3
"""THE ORACLE: the world stream, in order of arrival. THE ANTENNA's data (28 Oct - 4 Nov) and THE WORLD STREAM's
(from 4 Nov, open-ended), each datum with its Anglossic Qabbala value and Numogram zone (AQ, digital root), reduced
exactly as THE ANTENNA's prepare.py. Arrival order (collection batch, then event time) only ever appends.

  python3 stream.py <out stream.json> <live dir> [<live dir> ...]
"""
import glob, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "antenna"))
from prepare import aq, droot, ORDER

def main(out, *lives):
    batches = sorted((os.path.basename(f), f) for live in lives if os.path.isdir(live) for f in glob.glob(f"{live}/batches/*.json"))
    seen, s = set(), []
    for name, f in batches:
        items = json.load(open(f))["items"]
        for x in sorted(items, key=lambda x: (x["time"], ORDER[x["stream"]], x["source"], x["id"])):
            k = (x["stream"], x["source"], x["id"])
            if k in seen: continue
            seen.add(k); v = aq(x["text"])
            s.append({"i": len(s), "batch": name, "time": x["time"], "stream": x["stream"], "source": x["source"], "text": x["text"], "aq": v, "zone": droot(v)})
    json.dump(s, open(out, "w"), ensure_ascii=False)
    print(json.dumps({"data": len(s), "batches": len(batches), "last": s[-1]["time"] if s else None}))

if __name__ == "__main__":
    main(sys.argv[1], *sys.argv[2:])
