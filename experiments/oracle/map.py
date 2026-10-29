#!/usr/bin/env python3
"""THE ORACLE: the map and the readable page, from the transcript. Exploratory: counts, recurrences and the latest
exchanges; no pass/fail.

  python3 map.py <transcript.jsonl> <out map.json> <out ORACLE.md>
"""
import collections, json, sys

def reply_name(x):
    r = x["reply"]
    if x["channel"] == "Numogram": return f"zone {r['zone']} · {r['demon']} ({r['syzygy']})"
    if x["channel"] == "I Ching": return f"{r['hexagram']} {r['name']}" + (f" → {r['becomes']['hexagram']} {r['becomes']['name']}" if r.get("becomes") else "")
    return f"{r['card']}{' (reversed)' if r['reversed'] else ''}"

def main(tpath, mpath, opath):
    ex = [json.loads(l) for l in open(tpath) if l.strip()]
    C = collections.Counter
    by = {"channel": C(x["channel"] for x in ex), "queryDemon": C(x["query"]["demon"] for x in ex)}
    places = {
        "Bubbamu (just completed 1-7)": lambda x: x["query"]["form"] and x["query"]["form"]["form"] == "1-7",
        "an Atlas form (any)": lambda x: bool(x["query"]["form"]),
        "after Gt-36 (8>9)": lambda x: x["query"]["lastGate"] == "8>9",
        "after Gt-28 (7>1)": lambda x: x["query"]["lastGate"] == "7>1",
        "in the Warp (3, 6)": lambda x: x["query"]["region"] == "Warp",
        "in the Plex (0, 9)": lambda x: x["query"]["region"] == "Plex",
        "in the Time-Circuit": lambda x: x["query"]["region"] == "Time-Circuit"}
    clusters = {}
    for name, f in places.items():
        sel = [x for x in ex if f(x)]
        clusters[name] = {"exchanges": len(sel),
            "hexagrams": C(f"{x['reply']['hexagram']} {x['reply']['name']}" for x in sel if x["channel"] == "I Ching").most_common(6),
            "cards": C(x["reply"]["card"] + (" (rev)" if x["reply"]["reversed"] else "") for x in sel if x["channel"] == "Tarot").most_common(6),
            "numogram": C(f"{x['reply']['demon']} ({x['reply']['syzygy']})" for x in sel if x["channel"] == "Numogram").most_common(5)}
    inter = C()   # interlocutors: the Numogram demon of each reply's zone, whatever the channel
    for x in ex:
        z = x["reply"]["zone"]; lo = min(z, 9 - z); inter[{0: "Uttunul", 1: "Mur Mur", 2: "Oddubb", 3: "Djynxx", 4: "Katak"}[lo]] += 1
    pairs = C((x["query"]["demon"], reply_name(x)) for x in ex)
    m = {"exchanges": len(ex), "amelias": sorted({x["amelia"] for x in ex}), "span": [ex[0]["time"], ex[-1]["time"]] if ex else None,
         "byChannel": by["channel"], "queriesByDemon": by["queryDemon"], "interlocutors": inter.most_common(),
         "clusters": clusters, "recurringExchanges": [(q, r, n) for (q, r), n in pairs.most_common(20) if n > 1]}
    json.dump(m, open(mpath, "w"), indent=1, ensure_ascii=False)
    L = ["# THE ORACLE — live transcript and map", "",
         "Exploratory listening station. The world stream casts; Amelia (on her full CCRU Numogram) asks from where she stands, and the Numogram, the I Ching or the Tarot answers. Readings are shown side by side, and the map grows from what comes through. Nothing here is a pass/fail test. See `PROTOCOL.md`.", "",
         f"**{len(ex)} exchanges** from {len(m['amelias'])} Amelias, world data {m['span'][0] if ex else '-'} to {m['span'][1] if ex else '-'}.", "",
         "## Interlocutors (the syzygetic demon of each reply's zone)", ""]
    L += [f"- {d}: {n}" for d, n in inter.most_common()]
    L += ["", "## Clusters"]
    for name, c in clusters.items():
        if not c["exchanges"]: continue
        L += ["", f"### {name}: {c['exchanges']} exchanges"]
        if c["hexagrams"]: L.append("- **I Ching:** " + "; ".join(f"{h} ×{n}" for h, n in c["hexagrams"]))
        if c["cards"]: L.append("- **Tarot:** " + "; ".join(f"{h} ×{n}" for h, n in c["cards"]))
        if c["numogram"]: L.append("- **Numogram:** " + "; ".join(f"{h} ×{n}" for h, n in c["numogram"]))
    L += ["", "## Recurring exchanges (query demon → reply)", ""] + [f"- {q} → {r}: ×{n}" for q, r, n in m["recurringExchanges"]]
    L += ["", "## Latest exchanges", ""]
    for x in ex[-25:][::-1]:
        q = x["query"]; d = x["data"][-1]
        L.append(f"- `{x['time']}` **{x['amelia']}** asks from zone {q['zone']} ({q['region']}, {q['demon']}"
                 + (f", in {q['form']['form']} {q['form']['entities']}" if q["form"] else "") + (f", after {q['lastGate']}" if q["lastGate"] else "")
                 + f") → **{x['channel']}**: {reply_name(x)}. *World:* “{d['text'][:90]}” ({d['stream']}, AQ {d['aq']}). She moves {' → '.join(map(str, x['path']))}.")
    open(opath, "w").write("\n".join(L) + "\n")
    print(json.dumps({"exchanges": len(ex), "interlocutors": inter.most_common(3)}))

if __name__ == "__main__":
    main(*sys.argv[1:])
