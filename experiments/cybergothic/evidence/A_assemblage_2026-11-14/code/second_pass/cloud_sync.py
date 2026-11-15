"""Sync a checkpoint only to an explicitly isolated prototype project."""
import argparse
import os
from pathlib import Path
from assemblage import AssemblageJournal,AssemblageCloudJournal

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument("direction",choices=("push","pull"))
    p.add_argument("--db",type=Path,required=True);p.add_argument("--isolated-prototype-project",action="store_true",required=True)
    a=p.parse_args();v=os.environ
    remote=AssemblageCloudJournal(v.get("CG_PROTOTYPE_SUPABASE_URL",""),v.get("CG_PROTOTYPE_SUPABASE_PUBLISHABLE_KEY",""),
             v.get("CG_PROTOTYPE_USER_JWT",""),v.get("CG_PROTOTYPE_RUN_ID",""),isolated=a.isolated_prototype_project)
    cloud,revision=remote.read()
    if a.direction=="push":
        if not a.db.is_file():raise SystemExit("Local checkpoint does not exist")
        j=AssemblageJournal(a.db);local=j.load();j.close()
        if cloud is not None and local.log[:len(cloud.log)]!=cloud.log:raise SystemExit("Divergent event histories; nothing overwritten")
        print("Saved revision",remote.save(local,revision))
    else:
        if cloud is None:raise SystemExit("No remote checkpoint")
        if a.db.exists():raise SystemExit("Refusing to overwrite an existing local file")
        a.db.parent.mkdir(parents=True,exist_ok=True);j=AssemblageJournal(a.db);j.save(cloud);j.close()
        print("Recovered revision",revision)

if __name__=="__main__":main()
