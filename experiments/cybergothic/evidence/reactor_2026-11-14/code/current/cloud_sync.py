"""Optional sync to an explicitly isolated Supabase prototype project."""
import argparse
import os
from pathlib import Path
from storage import SQLiteJournal, SupabaseJournal


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("direction",choices=("push","pull"));p.add_argument("--db",type=Path,required=True)
    p.add_argument("--isolated-prototype-project",action="store_true",required=True)
    a=p.parse_args()
    env=os.environ
    remote=SupabaseJournal(env.get("CG_PROTOTYPE_SUPABASE_URL",""),
        env.get("CG_PROTOTYPE_SUPABASE_PUBLISHABLE_KEY",""),env.get("CG_PROTOTYPE_USER_JWT",""),
        env.get("CG_PROTOTYPE_RUN_ID",""),isolated=a.isolated_prototype_project)
    cloud,rev=remote.read()
    if a.direction == "push":
        if not a.db.is_file():raise SystemExit("Local checkpoint does not exist.")
        j=SQLiteJournal(a.db);local=j.load();j.close()
        if cloud is not None and local.log[:len(cloud.log)]!=cloud.log:
            raise SystemExit("Remote and local event histories differ; nothing was overwritten.")
        rev=remote.save(local,rev);print(f"Saved isolated prototype revision {rev}.")
    else:
        if cloud is None: raise SystemExit("No remote prototype checkpoint exists.")
        if a.db.exists(): raise SystemExit("Refusing to replace an existing local checkpoint.")
        a.db.parent.mkdir(parents=True,exist_ok=True)
        j=SQLiteJournal(a.db);j.save(cloud);j.close();print(f"Recovered prototype revision {rev}.")

if __name__=="__main__":main()
