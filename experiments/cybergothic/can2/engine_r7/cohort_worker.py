"""Isolated single-seed cohort worker; emits outcome/ledger blobs to stdout."""
import argparse
import base64
import copy
import gc
import json
import os
import sys
import zlib
from collections import Counter


def main():
    p=argparse.ArgumentParser();p.add_argument('--seed',type=int,required=True)
    p.add_argument('--output-dir',required=True);p.add_argument('--no-ledgers',action='store_true')
    args=p.parse_args();output=os.path.realpath(args.output_dir);lab=os.path.realpath(os.path.dirname(__file__))
    from local_guard import install as install_guard
    install_guard(output,lab)
    from classify import classify,homologous_edge_carriers
    from digit_world import decode
    from experiment import ARMS,BranchWorld,control_for
    from nonchimeric import run as run_nonchimeric
    from pilot_stop_screen import create_world
    from reactor import canonical,digest
    from seccomp_lock import install as lock
    from shadow_journal import ShadowJournal

    # The only persistent file is opened and initialised before the kernel
    # lockdown; later simulation cannot open files or create network sockets.
    checkpoint=os.path.join(output,f'pre_dispatch_{args.seed}.sqlite')
    screen=create_world(args.seed,BranchWorld);journal=ShadowJournal(checkpoint);journal.save(screen)
    blocked=lock()
    screen.stop_when_graft=True;screen.advance(until_time=180.)
    if not screen.shadow.grafts:
        screen.shadow.audit(screen);row={'seed':args.seed,'eligible':False,'events':len(screen.log),
            'state_sha256':digest(screen.snapshot()),'event_sha256':digest(screen.log),'lockdown':blocked,
            'clipped_candidates_before_selection':len(screen.shadow.clipped_candidates)}
        del screen;gc.collect();row['nonchimeric']=run_nonchimeric(args.seed)
        journal.close();print(json.dumps(row,sort_keys=True));return
    graft=copy.deepcopy(screen.shadow.grafts[0]);dispatch=graft['dispatch']
    if dispatch is None:raise AssertionError('missing scheduler dispatch')
    event=copy.deepcopy(screen.log[graft['event_seq']-1]);t0=dispatch[0]
    screen.stop_when_graft=False;screen.advance(until_time=t0+48.);screen.shadow.audit(screen)
    root=create_world(args.seed,BranchWorld);root.pause_serial=dispatch[1];root.advance(until_time=t0+1.)
    if not root.paused or list(root.queue[0])!=dispatch:raise AssertionError('could not pause before graft dispatch')
    if root.log!=screen.log[:len(root.log)]:raise AssertionError('pre-graft replay diverged')
    pre_state=digest(root.snapshot());pre_shadow=digest(root.shadow.export());checkpoint_meta=journal.save(root)
    results={};signals=None
    for arm in ARMS:
        w=journal.load(world_cls=BranchWorld)
        if digest(w.snapshot())!=pre_state or digest(w.shadow.export())!=pre_shadow:
            raise AssertionError('branch did not start from the shared primary/shadow state')
        w.control=control_for(graft,event,arm);w.advance(until_time=t0+48.);w.shadow.audit(w)
        if not w.control['fired']:raise AssertionError('selected intervention did not run')
        g=next(x for x in w.shadow.grafts if x['event_seq']==graft['event_seq'])
        if g['graft_edge']!=graft['graft_edge']:raise AssertionError('graft identity changed across branches')
        if arm=='natural':
            natural=copy.deepcopy(w.snapshot());natural.pop('experiment_control')
            if digest(natural)!=digest(screen.snapshot()) or w.log!=screen.log:
                raise AssertionError('natural branch diverged from original ecology')
        classification=classify(w.shadow,w,g)
        marker=g['graft_edge'];occ=g['graft_occurrence']
        if arm.startswith('ruptured_'):
            v=next(x for x in w.shadow.variants if x['label']==arm)
            if v['source_edge']!=marker:raise AssertionError('variant is not the focal junction')
            marker=v['variant_edge'];occ=marker
        homologs=homologous_edge_carriers(w.shadow,marker,occ,g['founder'])
        future=[x['signals'] for x in w.log[g['event_seq']:] if x['event']=='environment']
        if signals is None:signals=future
        elif future!=signals:raise AssertionError('external signals differ across branches')
        descendants={g['founder']};births=0;direct=0;vectors=0;later=w.log[g['event_seq']:]
        for e in later:
            if e['event']=='birth' and e['parent'] in descendants:descendants.add(e['agent']);births+=1
            if e['event']=='infection' and e['attacker'] in descendants:direct+=1
            if e['event']=='vector_infection' and e['donor'] in descendants:vectors+=1
        founder=g['founder'];death=next((e for e in later if e['event']=='death' and e['agent']==founder),None)
        nop_actions={(e['agent'],e['action']) for e in later if e['event']=='digit_nop'}
        executions=[e for e in later if e['event']=='execute' and e['agent']==founder]
        opcode_counts=Counter(e['opcode'] for e in executions if (founder,e['action']) not in nop_actions)
        field_uptake=sum(e['intake'] for e in later if e['event']=='field_harvest' and e['agent']==founder)
        archive_g=sum(any(w.shadow.nodes[x]['root']==g['graft_edge'] for x in t.edges) for t in w.shadow.archive.values())
        corpse_g=sum(any(w.shadow.nodes[x]['root']==g['graft_edge'] for x in t.edges) for t in w.shadow.corpses.values())
        immediate=None
        if arm.startswith('ruptured_'):
            z=event['zone'];c=w.control['result'];start=g['graft_start']+2;stop=g['graft_stop']
            immediate={'formerly_silent_body_digits_exposed':sum(
                not decode(c['after'],i,z,'self')['nop'] for i in range(start,stop))}
        out={'control':w.control,'state_sha256':digest(w.snapshot()),'event_sha256':digest(w.log),
             'shadow_sha256':digest(w.shadow.export()),'classification':classification,
             'homologous_carriers':homologs,'founder_survived':g['founder'] in w.agents,
             'descendant_births':births,'living_lineage_hosts':sum(x in w.agents for x in descendants),
             'lineage_direct_infections':direct,'lineage_vector_deliveries':vectors,
             'founder_restricted_lifetime':min(48.,max(0.,death['time']-t0)) if death else 48.,
             'founder_death_cause':death['cause'] if death else None,
             'founder_actions':len(executions),'founder_noops':sum((founder,e['action']) in nop_actions for e in executions),
             'founder_opcode_counts':dict(opcode_counts),'founder_field_uptake':field_uptake,
             'focal_edge_archived_records':archive_g,'focal_edge_corpse_records':corpse_g,
             'immediate_rupture':immediate,'future_environment':future}
        if not args.no_ledgers:
            out['primary_events_zlib_base64']=base64.b64encode(zlib.compress(canonical(w.log),6)).decode()
            out['primary_state_zlib_base64']=base64.b64encode(zlib.compress(canonical(w.snapshot()),6)).decode()
            out['shadow_zlib_base64']=base64.b64encode(zlib.compress(canonical(w.shadow.export()),6)).decode()
        results[arm]=out;del w;gc.collect()
    clipped_before=sum(x['event_seq']<=graft['event_seq'] for x in root.shadow.clipped_candidates)
    journal.close();del screen,root;gc.collect();nonchimeric=run_nonchimeric(args.seed)
    print(json.dumps({'seed':args.seed,'eligible':True,'graft':graft,'checkpoint':checkpoint_meta,
        'pre_state_sha256':pre_state,'pre_shadow_sha256':pre_shadow,'branches':results,
        'natural_matches_original':True,'lockdown':blocked,'nonchimeric':nonchimeric,
        'clipped_candidates_before_selection':clipped_before},sort_keys=True))


if __name__=='__main__':main()
