"""Amendment A1 (A1.md): availability-based feeding, shared by AG-1 (epoch_a1.py) and RC-2 (rc2/epoch2_a1.py).

An item is fed in the first epoch window that both (i) has reached its seenAt and (ii) had it available, i.e. its
world-live batch was committed. The ledger keeps the assignment it made (a1/assigned.json: key -> epoch), so a replay
feeds exactly what the live Amelia was fed. Epochs logged before A1 are backfilled once from world-live's commit
history (`backfill`) and must reproduce every logged zPre and digest, else nothing is written.
Items are passed to the unchanged sealed live.ts / live2.ts with seenAt set to their window's epoch time T_w, in the
order (window, original sort key), so the sealed `feedUntil(T_w)` feeds exactly the window's items in that order."""
import json, pathlib, subprocess, sys
AG = pathlib.Path(__file__).resolve().parents[2] / 'agentic'   # experiments/agentic (prepare_world)
sys.path.insert(0, str(AG)); from prepare_world import aq, droot, ORDER
def key(x): return f"{x['stream']}|{x['source']}|{x['id']}"
def world(live, since):
    """All study items (first occurrence by batch-file order, as in the sealed items()), with their batch file."""
    seen, out = set(), []
    for f in sorted(pathlib.Path(live, 'batches').glob('*.json')):
        for x in json.load(open(f))['items']:
            k = key(x)
            if k in seen or (since and x['seenAt'] <= since): continue
            seen.add(k); out.append(dict(x, _file=f'batches/{f.name}', _key=k))
    out.sort(key=lambda x: (x['seenAt'], x['time'], ORDER[x['stream']], x['source'], x['id']))
    return out
def feed_list(out, assigned, Ts):
    """Items in (window, original order); seenAt := T_window. Unassigned items are excluded."""
    sel = [(assigned[x['_key']], i, x) for i, x in enumerate(out) if x['_key'] in assigned]
    sel.sort(key=lambda t: (t[0], t[1]))
    return [{'seenAt': Ts[w], 'zone': droot(aq(x['text'])), 'stream': x['stream']} for w, _, x in sel]
def assign_pending(out, assigned, e, T):
    """Live rule: every item present in this checkout, not yet fed, with seenAt <= T, is fed in pending epoch e."""
    for x in out:
        if x['_key'] not in assigned and x['seenAt'] <= T: assigned[x['_key']] = e
def replay(runner, items, log, cand, cut, tmp):
    tmp = pathlib.Path(tmp); tmp.mkdir(parents=True, exist_ok=True)
    json.dump(items, open(tmp / 'items.json', 'w')); json.dump(log, open(tmp / 'log.json', 'w'))
    args = ['node', '--import', 'tsx', str(runner), str(tmp / 'items.json'), str(tmp / 'log.json'), str(cand)] + [cut or '-', str(tmp / 'out.json')]
    subprocess.run(args, check=True)
    return json.load(open(tmp / 'out.json'))
def check(rep, log):
    for a, b in zip(rep, log):
        if a['zPre'] != b['zPre'] or a['digest'] != b['digest']: return b['e'], a, b
    return None
def backfill(live_full, arrival, log):
    """Pre-A1 epochs: item available at T_e iff its batch file was committed by T_e (arrival: file -> ISO commit time).
    Window = first epoch e with seenAt <= T_e and arrival < T_e (the run checks the stream out before it takes T_e). Items not yet available at the last logged epoch stay unassigned."""
    out = world(live_full, log[0]['T']); Ts = [x['T'] for x in log]; assigned = {}
    for x in out:
        for e, T in enumerate(Ts):
            if e > 0 and x["seenAt"] <= T and arrival[x["_file"]] < T: assigned[x['_key']] = e; break
    return out, assigned
