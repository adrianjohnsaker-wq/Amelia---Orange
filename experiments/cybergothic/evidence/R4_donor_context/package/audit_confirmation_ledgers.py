"""Independently recheck selected fresh confirmation histories and ledgers."""
import json
from pathlib import Path
import audit_donor_ledgers as audit

DIRECTORY=Path('fresh_survival_37001')
audit.DIRECTORY=DIRECTORY


def main():
    rows=[audit.selected(s) for s in (37001,37030,37060)]
    out={'status':'pass','seeds':len(rows),'branches':sum(r['branches'] for r in rows),
         'payload_expressions':sum(r['payload_expressions'] for r in rows),
         'neutral_noops':sum(r['neutral_noops'] for r in rows),
         'jumped_positions':sum(r['jumped_positions'] for r in rows),'results':rows}
    (DIRECTORY/'ledger_audit.json').write_text(json.dumps(out,indent=2,sort_keys=True)+'\n')
    print(json.dumps({k:out[k] for k in ('status','seeds','branches','payload_expressions','neutral_noops','jumped_positions')}))


if __name__=='__main__':main()
