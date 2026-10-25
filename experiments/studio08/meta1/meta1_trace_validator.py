#!/usr/bin/env python3
"""META1 independent structural check of one committed-model experimental trace (gzipped JSONL), adapted from ../trace_integrity.py.

Same checks as trace_integrity.py except one substitution: the committed runtime does not expose its
per-exit scores, so the score-margin fields are replaced by the recorded exit-score terms the runner adds
(code, house, lesion, cue) for every evaluated exit. This proves structure and bookkeeping, not model replay.

  python3 committed_trace_integrity.py <trace.jsonl.gz> <worldId> <scenario> <arm>
"""
import gzip, json, math, sys

EDGES = {"0>9","1>8","2>7","3>6","4>5","1>2","2>4","4>7","7>8","8>9","9>1"}
ARMS = ("adaptive","round_robin","fixed_surface_decline24","fixed_house_flux24","no_cue","asm_textual")
SCENARIOS = ("intact","lesion")
SCHEMA = "S1_COMMITTED_MODEL_RAW_TRANSITION_V1"
SEASON_TICKS, SEASONS = 5000, 7
import hashlib
def seed_for(world):
    if world in ("META1-P0","META1-P1"):
        domain="STUDIO08-META1-PILOT-V1|"
    elif world.startswith("META1-W") and len(world)==9 and world[-2:].isdigit() and int(world[-2:]) <32:
        domain="STUDIO08-META1-V1|"
    else: raise ValueError("unregistered world "+world)
    return hashlib.sha256((domain+world).encode()).hexdigest()

def require(ok, why):
    if not ok: raise ValueError(why)

def ishash(x):
    return isinstance(x, str) and len(x) == 64 and all(c in "0123456789abcdef" for c in x)

SENSORS = ("surface_decline24", "house_flux24", "code_drift24")

class SelectorReplay:
    """Re-derives every learning-arm choice from the trace's own readouts and settled rewards
    (same rule as ../../code/learning_cue_gate.mjs: UCB c=0.20, strict > keeps declared order)."""
    def __init__(self, mode):
        self.mode, self.tick = mode, 0
        self.n_sel = dict.fromkeys(SENSORS, 0); self.n_set = dict.fromkeys(SENSORS, 0); self.sums = dict.fromkeys(SENSORS, 0.0)
    def choose(self, readouts):
        self.tick += 1
        nonnull = [(s, t) for s, t in zip(SENSORS, readouts or [None] * 3) if t is not None]
        if not nonnull: return None, None
        if self.mode == "round_robin": win = nonnull[(self.tick - 1) % len(nonnull)]
        else:
            best, win = -math.inf, None
            for s, t in nonnull:
                score = self.sums[s] / max(1, self.n_set[s]) + 0.20 * math.sqrt(2 * math.log(1 + self.tick) / (1 + self.n_sel[s]))
                if score > best: best, win = score, (s, t)
        self.n_sel[win[0]] += 1
        return win
    def settle(self, sensor, reward):
        self.n_set[sensor] += 1; self.sums[sensor] += reward

def validate(path, world, scenario, arm):
    require(scenario in SCENARIOS and arm in ARMS, "invalid requested condition")
    learning = arm in ("adaptive", "round_robin")
    replay = SelectorReplay(arm) if learning else None; token_sensor = {}
    tick = 0; prev_post = None; selected = {}; credits_n = 0; cue_ticks = 0
    with gzip.open(path, "rt", encoding="utf-8") as f:
        for line in f:
            require(line.strip() != "", "blank trace line")
            x = json.loads(line); tick += 1
            require(x.get("schema") == SCHEMA, "wrong schema")
            require((x.get("worldId"), x.get("scenario"), x.get("arm")) == (world, scenario, arm), "mixed trace")
            require(x.get("tick") == tick, "missing/reordered tick")
            require(x.get("season") == (tick - 1) // SEASON_TICKS + 1, "season label")
            expected_input=f"STUDIO08-META1-INPUT-V1|{seed_for(world)}|{tick}"
            require(x.get("sourceInput")==expected_input,
                    "shared deterministic external input mismatch")
            frm, to = x.get("from"), x.get("to")
            require(type(frm) == int and type(to) == int and f"{frm}>{to}" in EDGES, "invalid directed edge")
            require(type(x.get("death")) is bool and x["death"] == (to == 5), "death flag")
            require(ishash(x.get("preChoiceStateSha256")) and ishash(x.get("postChoiceStateSha256")), "state digest")
            if prev_post is not None: require(x["preChoiceStateSha256"] == prev_post, "state continuity")
            prev_post = x["postChoiceStateSha256"]
            lesion = scenario == "lesion" and x["season"] == 1
            require(x.get("lesionActive") is lesion, "lesion schedule")
            cue, mag = x.get("selectedTarget"), x.get("selectedCueMagnitude")
            require(cue is None or (type(cue) == int and 0 <= cue <= 9), "invalid cue zone")
            require(mag in (0, 0.35) and ((cue is None) == (mag == 0)), "cue amplitude contract")
            if arm == "no_cue": require(cue is None, "no_cue arm cued")
            if mag: cue_ticks += 1
            opts = x.get("options")
            require(isinstance(opts, list) and len(opts) >= 1, "evaluated exits missing")
            require(to in [o["to"] for o in opts], "chosen exit was not evaluated")
            for o in opts:
                require(o["cue"] == (0.35 if cue is not None and o["to"] == cue else 0), "cue applied off-target")
                require(o["lesion"] == (-5 if lesion and frm == 2 and o["to"] == 7 else 0), "lesion applied wrongly")
                require(all(type(o[k]) in (int, float) and math.isfinite(o[k]) for k in ("code", "house")), "score term")
            cr = x.get("candidateReadouts")
            require(cr is None or (isinstance(cr, list) and len(cr) == 3), "three sensor readouts or null")
            if arm in ("no_cue", "asm_textual"): require(cr is None, "sensor readouts in a non-sensor arm")
            if arm == "fixed_surface_decline24": require(cue == (cr[0] if cr else None), "fixed sensor target mismatch")
            if arm == "fixed_house_flux24": require(cue == (cr[1] if cr else None), "fixed sensor target mismatch")
            token = x.get("selectedToken")
            if learning:
                sensor, target = replay.choose(cr)
                require(cue == target and x.get("selectedSensor") == sensor, "selector choice not reproducible from trace")
                require((token is None) == (sensor is None), "token without a choice")
                if token is not None:
                    require(token == f"S1-{tick}" and token not in selected, "duplicate or misnumbered token")
                    selected[token] = {"start": tick, "edges": set()}; token_sensor[token] = sensor
            else:
                require(token is None, "non-learning arm acquired a token")
            for v in selected.values(): v["edges"].add(f"{frm}>{to}")
            used = set()
            for c in x.get("creditsSettled"):
                tok = c.get("token")
                require(tok in selected and tok not in used, "unknown/doubled credit"); used.add(tok)
                start = selected[tok]["start"]
                require(c.get("decisionTick") == start and c.get("observedAt") == tick, "credit timing")
                require(start <= tick <= start + 23 and (x["death"] or tick == start + 23), "credit matured early")
                require(c.get("deathWithin24") == x["death"], "death attribution")
                r = -1 if x["death"] else max(0, min(1, (len(selected[tok]["edges"]) - 4) / 7))
                require(abs(c.get("reward") - r) < 1e-12, "reward not recomputable from raw trajectory")
                replay.settle(token_sensor.pop(tok), c["reward"])
                del selected[tok]; credits_n += 1
            if x["death"]: require(not selected, "pending credit survived a death")
            require(x.get("pendingRewards") == len(selected), "pending count")
    require(tick == SEASON_TICKS * SEASONS, "incomplete run")
    return {"status": "META1_SOURCE_BOUND_TRACE_STRUCTURE_PASS_NOT_MODEL_REPLAY", "ticks": tick,
            "cueTicks": cue_ticks, "credits": credits_n, "censored": len(selected)}

if __name__ == "__main__":
    print(json.dumps(validate(*sys.argv[1:5])))
