#!/usr/bin/env python3
"""Exploratory relational atlas for THE ORACLE JSONL transcript.

No scoring, pass/fail, p-values, or automatic entity attribution. Raw transcript remains authoritative.
Usage: python3 atlas.py <transcript.jsonl> <output-directory>
"""
from collections import Counter, defaultdict
import hashlib, json, pathlib, sys

def load(path):
    raw = pathlib.Path(path).read_bytes()
    rows = [json.loads(line) for line in raw.decode("utf-8").splitlines() if line.strip()]
    return raw, rows

def form_id(query):
    f = query.get("form")
    return f.get("form") if isinstance(f, dict) else None

def reply_id(row):
    r, ch = row["reply"], row["channel"]
    if ch == "Numogram":
        return f"NUM:{r.get('demon')}:{r.get('syzygy')}@{r.get('zone')}"
    if ch == "I Ching":
        nxt = r.get("becomes") or {}
        return f"ICH:{r.get('hexagram')}:{r.get('name')}->{nxt.get('hexagram', '-')}"
    return f"TAR:{r.get('card')}:{'R' if r.get('reversed') else 'U'}"

def source_ids(row):
    return [f"{d.get('stream')}|{d.get('source')}|{d.get('i')}" for d in row.get("data", [])]

def token(row):
    q = row["query"]
    return {
        "query_zone": q.get("zone"),
        "query_region": q.get("region"),
        "query_form": form_id(q),
        "last_gate": q.get("lastGate"),
        "channel": row.get("channel"),
        "reply": reply_id(row),
        "reply_zone": row["reply"].get("zone"),
        "heard_path": row.get("path", []),
    }

def group_add(g, row, line):
    g["occurrences"] += 1
    g["lineages"].add(row.get("amelia", ""))
    g["worlds"].add(row.get("amelia", "").split("|")[0])
    g["sources"].update(source_ids(row))
    if len(g["examples"]) < 5:
        g["examples"].append({
            "line": line, "time": row.get("time"), "amelia": row.get("amelia"),
            "inputs": [{"i": d.get("i"), "stream": d.get("stream"), "source": d.get("source"),
                        "aq": d.get("aq"), "text": d.get("text")} for d in row.get("data", [])],
        })

def finish(g):
    return {**g, "lineages": sorted(g["lineages"]), "worlds": sorted(g["worlds"]),
            "source_items": sorted(g["sources"])}

def main(src, outdir):
    raw, rows = load(src)
    out = pathlib.Path(outdir); out.mkdir(parents=True, exist_ok=True)
    nodes = Counter()
    by_channel = Counter()
    by_query_region = Counter()
    by_form = Counter()
    by_context = defaultdict(lambda: {"occurrences": 0, "lineages": set(), "worlds": set(),
                                      "sources": set(), "examples": []})
    per_lineage = defaultdict(list)

    for line, row in enumerate(rows, 1):
        t = token(row); per_lineage[row.get("amelia", "")].append((line, row, t))
        nodes[t["reply"]] += 1
        by_channel[row.get("channel", "")] += 1
        by_query_region[row["query"].get("region", "")] += 1
        by_form[form_id(row["query"]) or "no form"] += 1
        # A one-exchange relation profile, retaining context and Amelia's immediate path.
        k = json.dumps(t, sort_keys=True, ensure_ascii=False)
        group_add(by_context[k], row, line)

    motifs = defaultdict(lambda: {"occurrences": 0, "lineages": set(), "worlds": set(),
                                  "sources": set(), "examples": []})
    for seq in per_lineage.values():
        for n in range(1, 5):
            for i in range(0, len(seq) - n + 1):
                chunk = seq[i:i+n]
                key = json.dumps([x[2] for x in chunk], sort_keys=True, ensure_ascii=False)
                g = motifs[key]
                for line, row, _ in chunk:
                    group_add(g, row, line)

    links = defaultdict(lambda: {"occurrences": 0, "lineages": set(), "worlds": set(),
                                  "sources": set(), "examples": []})
    for seq in per_lineage.values():
        for i in range(len(seq) - 1):
            line, row, t = seq[i]
            nline, nxt, nt = seq[i+1]
            key = json.dumps({"from_reply": t["reply"], "next_query_zone": nt["query_zone"],
                              "next_query_form": nt["query_form"], "to_reply": nt["reply"]},
                             sort_keys=True, ensure_ascii=False)
            group_add(links[key], row, line)
            group_add(links[key], nxt, nline)

    motif_rows = []
    for key, g in motifs.items():
        motif_rows.append({"sequence": json.loads(key), **finish(g)})
    motif_rows.sort(key=lambda x: (-len(x["lineages"]), -x["occurrences"], -len(x["source_items"]), json.dumps(x["sequence"], sort_keys=True)))
    link_rows = [{"relation": json.loads(k), **finish(g)} for k, g in links.items()]
    link_rows.sort(key=lambda x: (-len(x["lineages"]), -x["occurrences"], -len(x["source_items"])))

    meta = {
        "transcript_sha256": hashlib.sha256(raw).hexdigest(),
        "events": len(rows),
        "lineages": sorted(per_lineage),
        "span": [rows[0].get("time"), rows[-1].get("time")] if rows else None,
        "by_channel": dict(by_channel),
        "by_query_region": dict(by_query_region),
        "queries_by_form": dict(by_form),
        "reply_nodes": nodes.most_common(),
        "note": "Descriptive exploration. Repeated motifs are leads, not significance tests or independent evidence of an external source."
    }
    data = {"metadata": meta, "exchange_motifs": motif_rows, "reply_relations": link_rows}
    (out / "atlas.json").write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    lines = [
        "# INGRESS — evolving cluster atlas", "",
        "Descriptive map of the supplied THE ORACLE transcript. No pass/fail, p-values, or automated entity claims.", "",
        f"- Exchanges: {meta['events']}; lineages: {len(meta['lineages'])}",
        f"- Span: {meta['span']}",
        f"- Transcript SHA-256: `{meta['transcript_sha256']}`",
        f"- Channels: {meta['by_channel']}",
        f"- Query regions: {meta['by_query_region']}",
        f"- Query forms: {meta['queries_by_form']}", "",
        "## Reply nodes", ""
    ]
    lines += [f"- {name}: {n}" for name, n in meta["reply_nodes"]]
    lines += ["", "## Recurrent exchange motifs", "",
              "Shown here when a motif appears in at least two Amelia lineages. This is a navigation rule only; all motifs, including single-lineage motifs, remain in atlas.json.", ""]
    shown = [x for x in motif_rows if len(x["lineages"]) >= 2][:60]
    for x in shown:
        lines.append(f"- **{len(x['lineages'])} lineages / {x['occurrences']} motif-events / {len(x['source_items'])} distinct source items** — " +
                     json.dumps(x["sequence"], ensure_ascii=False, separators=(",", ":")))
    lines += ["", "## Reply-to-reply relations", "",
              "Adjacent exchanges within the same Amelia lineage; repeated world items are tracked separately in atlas.json.", ""]
    for x in [x for x in link_rows if len(x["lineages"]) >= 2][:60]:
        lines.append(f"- **{len(x['lineages'])} lineages / {x['occurrences']} relation endpoints / {len(x['source_items'])} distinct source items** — " +
                     json.dumps(x["relation"], ensure_ascii=False, separators=(",", ":")))
    lines += ["", "Interpret each candidate from its supporting transcript lines and raw inputs. A reply label is the Numogram/channel's reading, not by itself an entity identification.", ""]
    (out / "ATLAS.md").write_text("\n".join(lines))
    print(json.dumps({"events": len(rows), "lineages": len(per_lineage), "motifs": len(motif_rows),
                      "relations": len(link_rows), "sha256": meta["transcript_sha256"]}))

if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2])
