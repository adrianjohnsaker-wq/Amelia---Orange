#!/usr/bin/env python3
"""THE ORACLE: the world stream, as THE ANTENNA collects it (in-window data, event-time order), each datum with its
Anglossic Qabbala value and Numogram zone (AQ, digital root), exactly as THE ANTENNA's prepare.py reduces it.

  python3 stream.py <antenna-live dir> <out stream.json>
"""
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "antenna"))
from prepare import world, aq, droot

def main(live, out):
    items = world(live)
    s = [{"i": n, "time": x["time"], "stream": x["stream"], "source": x["source"], "text": x["text"], "aq": aq(x["text"]), "zone": droot(aq(x["text"]))} for n, x in enumerate(items)]
    json.dump(s, open(out, "w"), ensure_ascii=False)
    print(json.dumps({"data": len(s), "first": s[0]["time"] if s else None, "last": s[-1]["time"] if s else None}))

if __name__ == "__main__":
    main(*sys.argv[1:])
