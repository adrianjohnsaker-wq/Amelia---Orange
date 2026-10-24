#!/usr/bin/env python3
"""PF4 G3g: bounded resumable historical source acquisition, never live PF2.

Each chunk draws ONLY preselected/published past rounds. Pinned C1/PF1 BLS
key and SHA256(signature) are independently verified for EVERY downloaded
sample. Network-free selftest is available. The outputs are scratch-only.
DOES NOT run a receiver, analyse outcomes or demonstrate exchangeability.

Worlds: 10 nonoverlapping 14-day windows aligned from 2026-06-01 UTC.
Each world 20160 ticks at 20-round stride. 17 chunks x 1200 max.
No live leases, mutations to existing science or prospective target intake.
"""
import argparse,hashlib,json,pathlib,time
from datetime import datetime,timezone
from drift1a_c1.beacon import LiveBeacon,round_time,QUICKNET,current_round

CH="52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971"
FIRST=29156220;PERIOD=3;STRIDE=20;TICKS=20160;WINDOWS=10
CHUNK=1200;NCHUNKS=17
def H(b):return hashlib.sha256(b).hexdigest()
def start_round(w):return FIRST+w*TICKS*STRIDE
def chunk_plan(w,c):
    assert type(w)==type(c)==int and 0<=w<WINDOWS and 0<=c<NCHUNKS
    assert QUICKNET["chain_hash"]==CH and QUICKNET["period"]==PERIOD
    a=c*CHUNK
    n=min(CHUNK,TICKS-a)
    assert n>0
    first=start_round(w)+a*STRIDE
    last=first+(n-1)*STRIDE
    assert last<=start_round(w)+(TICKS-1)*STRIDE
    assert round_time(last)<datetime(2026,10,24,tzinfo=timezone.utc).timestamp()
    return dict(windowIndex=w,chunkIndex=c,startTick=a,count=n,startRound=first,
                endRound=last,endUTC=datetime.fromtimestamp(round_time(last),timezone.utc).isoformat())
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--self-test",action="store_true")
    ap.add_argument("--window",type=int)
    ap.add_argument("--chunk",type=int)
    ap.add_argument("--pilot-count",type=int)
    ap.add_argument("--out",default="/tmp/pf4-g3g")
    args=ap.parse_args()
    if args.self_test:
        assert all(sum(chunk_plan(w,c)["count"] for c in range(NCHUNKS))==TICKS for w in range(WINDOWS))
        assert chunk_plan(0,0)["startRound"]==FIRST
        assert chunk_plan(9,16)["endRound"]==33188200
        assert chunk_plan(9,16)["count"]==960
        print("PF4_G3G_HISTORICAL_10_WORLD_170_CHUNK_GRID_PASS")
        return
    assert args.window is not None and args.chunk is not None
    plan=chunk_plan(args.window,args.chunk)
    pilot=args.pilot_count is not None
    n=plan["count"]
    if pilot:
        assert 1<=args.pilot_count<=30
        n=args.pilot_count
    assert current_round(time.time()-60)>plan["endRound"],"PUBLISHING_NOT_IN_PAST"
    beacon=LiveBeacon()
    rows=[]
    for idx in range(n):
        tick=plan["startTick"]+idx
        rd=start_round(args.window)+tick*STRIDE
        v=beacon.fetch(rd)
        beacon.verify(v,rd)
        sig=bytes.fromhex(v["signature"])
        assert len(sig)==48 and H(sig)==v["randomness"]
        rows.append(dict(tick=tick,round=rd,randomness=v["randomness"],
             signature=v["signature"],chainHash=CH))
        if len(rows)%200==0:print("PF4_G3G_HISTORICAL_VERIFIED_PROGRESS",args.window,args.chunk,len(rows),flush=True)
    assert len(rows)==n
    concatenation="".join(str(r["round"])+"|"+r["randomness"]+"|"+r["signature"]+"\n" for r in rows).encode()
    record=dict(schema="PF4_G3G_QUICKNET_VERIFIED_CHUNK_V1",
       status="PILOT_PARTIAL_NOT_ADMISSIBLE" if pilot else "FULL_CHUNK_BLS_VERIFIED",
       chainHash=CH,pinnedVerifier="f1875b5eea5339eb1ac73e50b5df6b103d0cabe9",
       worldIndex=args.window,chunkIndex=args.chunk,
       plannedCount=plan["count"],actualCount=n,startTick=plan["startTick"],
       firstRound=rows[0]["round"],lastRound=rows[-1]["round"],
       inputDigestSHA256=H(concatenation),
       roundsPerMinute=STRIDE,periodSeconds=PERIOD,
       sourcePublishedBeforeAudit=True,readOnly=True,futureTargetSeen=False,
       allIndividualBLSVerified=True,
       rows=rows)
    dest=pathlib.Path(args.out).resolve()
    assert str(dest).startswith("/tmp/") or str(dest).startswith("/mnt/data/")
    dest.mkdir(parents=True,exist_ok=True)
    name="PF4_G3G_W%02d_C%02d%s.json"%(args.window,args.chunk,"_PILOT" if pilot else "")
    p=dest/name
    assert not p.exists()
    raw=json.dumps(record,separators=(",",":"),sort_keys=True).encode()+b"\n"
    p.write_bytes(raw)
    print("PF4_G3G_CHUNK_SOURCE_VERIFIED",json.dumps({
     "status":record["status"],"world":args.window,"chunk":args.chunk,
     "records":n,"bytes":len(raw),"digest":H(raw),"inputSHA":record["inputDigestSHA256"],
     "startRound":record["firstRound"],"lastRound":record["lastRound"]}))
if __name__=="__main__":main()
