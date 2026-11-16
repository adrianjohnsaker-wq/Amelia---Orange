"""Directed tests use real engine operations with an attached shadow observer."""
import random
import copy
import unittest

from digit_world import parse_genome
from classify import classify,inherited_fraction
from interventions import edit_stop,scramble_body
from legacy_engine import Config,Entropy
from observer import ObservedWorld


def world(cap=512):
    return ObservedWorld(Config(seed=45671,initial_agents=1,max_agents=80,max_genome=cap),
                         Entropy('seeded',45671),populate=False)


def atom_roots(w,t):return [w.shadow.nodes[x]['root'] for x in t.atoms]
def edge_roots(w,t):return [w.shadow.nodes[x]['root'] for x in t.edges]


class ObserverPathTests(unittest.TestCase):
    def test_natural_graft_and_subsequent_direct_junction_transfer(self):
        w=world();a=w.add_agent(0,'6804',8);b=w.add_agent(0,'6012094',8);c=w.add_agent(0,'601111110',8)
        d=w.add_agent(0,'6012068094',8)
        b.ip=5;self.assertTrue(w.infect(a,b));self.assertEqual(b.genome,'6012068094')
        graft=w.shadow.grafts[-1];self.assertEqual(graft['form'],'split_existing_stop')
        self.assertEqual(graft['sequence'],'601206809');graft_root=graft['graft_edge']
        b.ip=7;c.ip=8;self.assertTrue(w.infect(b,c));w.shadow.audit(w)
        stop=next(s[3] for s in parse_genome(c.genome) if s[0]=='intron')
        occurrence=w.shadow.agents[c.ident].edges[stop]
        self.assertEqual(w.shadow.nodes[occurrence]['root'],graft_root)
        self.assertEqual(w.shadow.nodes[occurrence]['route'],'viral_direct')
        result=classify(w.shadow,w,graft)
        self.assertEqual(result['categories']['TRUE_HORIZ_NONKIN'],1)
        self.assertEqual(result['verified_viral_delivery_events'],1)
        lookalike=next(x for x in result['exact_matches'] if x['host']==d.ident)
        self.assertEqual(lookalike['relation'],'ZERO_FOCAL');self.assertTrue(lookalike['preexisting_lookalike'])
        self.assertTrue(lookalike['preexisting_lookalike_ancestry'])

    def test_shared_older_origin_does_not_imply_focal_occurrence_descent(self):
        w=world();a=w.add_agent(0,'601209',8);s=w.shadow;source=s.agents[a.ident]
        focal=s.select(source,range(6),100,1.,'fission',a.ident,'focal')
        sibling=s.select(source,range(6),101,1.,'fission',a.ident,'sibling')
        child=s.select(focal,range(6),102,2.,'fission','focal','child')
        self.assertEqual(atom_roots(w,focal),atom_roots(w,sibling))
        self.assertEqual(inherited_fraction(s.nodes,focal.atoms,sibling.atoms),(0,6))
        self.assertEqual(inherited_fraction(s.nodes,focal.atoms,child.atoms),(6,6))

    def test_fission_suffix_and_two_way_timesplice(self):
        w=world();a=w.add_agent(0,'68046804',9);b=w.add_agent(9,'60120944',9)
        at=w.shadow.agents[a.ident];bt=w.shadow.agents[b.ident];a.ip=7;b.ip=1
        self.assertTrue(w.timesplice(a));w.shadow.audit(w)
        self.assertEqual(atom_roots(w,w.shadow.agents[a.ident])[7:10],atom_roots(w,bt)[1:4])
        self.assertEqual(atom_roots(w,w.shadow.agents[b.ident])[1:4],
                         [atom_roots(w,at)[7],atom_roots(w,at)[0],atom_roots(w,at)[1]])
        inserted=w.shadow.agents[b.ident]
        self.assertEqual(w.shadow.nodes[inserted.edges[1]]['route'],'copy_join')
        self.assertEqual(w.shadow.nodes[inserted.edges[2]]['root'],w.shadow.nodes[at.edges[0]]['root'])
        a.zone=1;before=w.shadow.agents[a.ident];w.fission(a);child=max(w.agents)
        ct=w.shadow.agents[child];cut=len(before.atoms)//2
        self.assertEqual(atom_roots(w,ct),atom_roots(w,before)[cut:]);w.shadow.audit(w)

    def test_strict_vertical_and_mixed_horizontal_are_distinct(self):
        w=world();a=w.add_agent(0,'6804',8);b=w.add_agent(0,'4444444446012094',8)
        b.ip=14;self.assertTrue(w.infect(a,b));graft=w.shadow.grafts[-1]
        w.fission(b);child=w.agents[max(w.agents)];first=classify(w.shadow,w,graft)
        self.assertEqual(first['categories'].get('TRUE_VERT_ONLY'),1)
        b.ip=16;child.ip=3;self.assertTrue(w.infect(b,child));w.shadow.audit(w)
        after=classify(w.shadow,w,graft)
        self.assertEqual(after['categories'].get('MIXED_VERTICAL_HORIZONTAL'),1)
        self.assertTrue(next(x for x in after['carriers'] if x['host']==child.ident)['family'])

    def test_open_frame_repair_is_traced_as_drift_not_original_junction(self):
        w=world();a=w.add_agent(0,'6804',8);b=w.add_agent(0,'4444444446012094',8)
        b.ip=14;self.assertTrue(w.infect(a,b));g=w.shadow.grafts[-1]
        w.fission(b);child=w.agents[max(w.agents)];donor=w.add_agent(0,'0945',8)
        stop=next(s[3] for s in parse_genome(child.genome) if s[0]=='intron')
        edit_stop(w,child.ident,stop,'08','fixture_drift');self.assertTrue(w.shadow.open_frames)
        donor.ip=0;child.ip=4;self.assertTrue(w.infect(donor,child));w.shadow.audit(w)
        self.assertEqual(w.shadow.drift_records[-1]['mode'],'open_then_repair')
        result=classify(w.shadow,w,g);self.assertEqual(result['categories'].get('DRIFT_REPAIR'),1)

    def test_second_graft_can_also_be_a_traced_immediate_shift(self):
        w=world();a=w.add_agent(0,'6804',8);b=w.add_agent(0,'6012094',8)
        b.ip=5;self.assertTrue(w.infect(a,b));first=w.shadow.grafts[0]
        b.ip=8;self.assertTrue(w.infect(a,b));w.shadow.audit(w)
        self.assertEqual(len(w.shadow.grafts),2);second=w.shadow.grafts[1]
        self.assertNotEqual(first['graft_edge'],second['graft_edge'])
        self.assertEqual(w.shadow.drift_records[-1]['mode'],'immediate_shift')
        self.assertEqual(w.shadow.drift_records[-1]['new_edge_root'],second['graft_edge'])

    def test_vector_packet_keeps_original_source_after_donor_mutates(self):
        w=world();a=w.add_agent(0,'68046804',8);b=w.add_agent(1,'60111111',8)
        a.ip=6;w.vector_mode='intact';w.cargo_policy='pointer'
        self.assertTrue(w.shed(a));pid=max(w.packets);packet=w.shadow.packets[pid]
        source=w.shadow.agents[a.ident];roots=atom_roots(w,packet)
        self.assertEqual(roots,[atom_roots(w,source)[i] for i in (6,7,0,1)])
        self.assertEqual(w.shadow.nodes[packet.edges[0]]['root'],w.shadow.nodes[source.edges[6]]['root'])
        self.assertEqual(w.shadow.nodes[packet.edges[1]]['route'],'copy_join')
        self.assertEqual(w.shadow.nodes[packet.edges[2]]['root'],w.shadow.nodes[source.edges[0]]['root'])
        self.assertEqual(w.shadow.digits(packet),w.packets[pid]['code'])
        w.mutate_genome(a,'fixture');self.assertEqual(atom_roots(w,w.shadow.packets[pid]),roots)
        b.zone=w.packets[pid]['zone'];b.ip=2;w.deliver_vector(pid);w.shadow.audit(w)
        received=w.shadow.agents[b.ident]
        self.assertEqual(atom_roots(w,received)[2:2+len(roots)],roots)

    def test_experienced_vector_uses_actual_first_source_offset(self):
        w=world();a=w.add_agent(0,'120112019',8);a.ip=5
        w.vector_mode='intact';w.cargo_policy='experienced';w.minds[a.ident]['programs']={'1201':[3,2.]}
        self.assertTrue(w.shed(a));pid=max(w.packets);event=[e for e in w.log if e['event']=='vector_shed'][-1]
        self.assertTrue(event['experienced']);self.assertEqual(event['cargo'],'1201')
        self.assertEqual(atom_roots(w,w.shadow.packets[pid]),atom_roots(w,w.shadow.agents[a.ident])[:4])
        w.shadow.audit(w)

    def test_shuffled_vector_preserves_actual_digit_origins(self):
        w=world();a=w.add_agent(0,'01234567',8);a.ip=3
        w.vector_mode='shuffled';w.cargo_policy='pointer';self.assertTrue(w.shed(a))
        pid=max(w.packets);order=list(range(4));random.Random((w.cfg.seed<<32)^pid^a.ident).shuffle(order)
        roots=atom_roots(w,w.shadow.agents[a.ident]);expected=[roots[3+i] for i in order]
        self.assertEqual(atom_roots(w,w.shadow.packets[pid]),expected);w.shadow.audit(w)

    def test_cap_truncates_shadow_in_the_same_place(self):
        w=world(8);a=w.add_agent(0,'6804',8);b=w.add_agent(0,'6012094',8);b.ip=2
        self.assertTrue(w.infect(a,b));self.assertEqual(len(b.genome),8)
        self.assertEqual(len(w.shadow.agents[b.ident].atoms),8);w.shadow.audit(w)

    def test_clipped_but_recognised_graft_is_counted_not_selected(self):
        w=world(9);a=w.add_agent(0,'6804',8);b=w.add_agent(0,'6012094',8);b.ip=5
        self.assertTrue(w.infect(a,b));self.assertEqual(b.genome,'601206809')
        self.assertEqual(len(w.shadow.grafts),0);self.assertEqual(len(w.shadow.clipped_candidates),1)
        w.shadow.audit(w)

    def test_corpse_archive_fermentation_reinjection_and_reconstitution(self):
        w=world();a=w.add_agent(0,'60120948',8)
        c=w.corpse(0,a.genome,a.ident,'fixture');arch=w.shadow.archive[c.ident]
        old_roots=atom_roots(w,arch);w.ferment(c.ident)
        self.assertEqual(atom_roots(w,w.shadow.archive[c.ident]),old_roots)
        self.assertNotEqual(atom_roots(w,w.shadow.corpses[c.ident]),old_roots)
        b=w.add_agent(1,'7777',8);w.ferment(c.ident);self.assertNotIn(c.ident,w.corpses)
        self.assertTrue(any(e['event']=='reinject' for e in w.log));w.shadow.audit(w)
        w.started=True;w.recovery_floor=80;w.resources[0]=8.;w.archive_mode='random';w.pulse()
        event=[e for e in w.log if e['event']=='reconstitute'][-1]
        born=w.shadow.agents[event['agent']];archive=w.shadow.archive[event['source_corpse']]
        p=event['mutation_position'];br=atom_roots(w,born);ar=atom_roots(w,archive)
        self.assertNotEqual(br[p],ar[p]);self.assertEqual(br[:p]+br[p+1:],ar[:p]+ar[p+1:]);w.shadow.audit(w)

    def test_shuffled_archive_reconstitution_keeps_permuted_origins(self):
        w=world();a=w.add_agent(0,'60120948',8);c=w.corpse(0,a.genome,a.ident,'fixture')
        w.started=True;w.recovery_floor=80;w.resources[0]=8.;w.archive_mode='shuffled';w.pulse()
        event=[e for e in w.log if e['event']=='reconstitute'][-1];born=event['agent'];pos=event['mutation_position']
        order=list(range(len(a.genome)));random.Random((w.cfg.seed<<32)^born^c.ident).shuffle(order)
        roots=atom_roots(w,w.shadow.archive[c.ident]);expected=[roots[i] for i in order]
        actual=atom_roots(w,w.shadow.agents[born]);self.assertNotEqual(actual[pos],expected[pos])
        self.assertEqual(actual[:pos]+actual[pos+1:],expected[:pos]+expected[pos+1:]);w.shadow.audit(w)

    def test_decoy_and_shrapnel_use_exact_source_slices(self):
        w=world();a=w.add_agent(0,'60120948',9);source=w.shadow.agents[a.ident]
        c=w.corpse(0,a.genome[:4],a.ident,'shrapnel')
        d=w.corpse(0,a.genome[4:],a.ident,'decoy')
        a.ip=6;code=(a.genome+a.genome)[6:12];e=w.corpse(0,code,a.ident,'decoy_opcode')
        roots=atom_roots(w,source)
        self.assertEqual(atom_roots(w,w.shadow.corpses[c.ident]),roots[:4])
        self.assertEqual(atom_roots(w,w.shadow.corpses[d.ident]),roots[4:])
        self.assertEqual(atom_roots(w,w.shadow.corpses[e.ident]),roots[6:]+roots[:4]);w.shadow.audit(w)

    def test_mutation_resets_origin_even_when_digit_is_unchanged(self):
        w=world();a=w.add_agent(0,'60120948',8);before=w.shadow.agents[a.ident]
        w.emit('genome_mutation',agent=a.ident,zone=a.zone,position=1,before=a.genome,after=a.genome,reason='fixture')
        after=w.shadow.agents[a.ident];self.assertEqual(w.shadow.digits(after),a.genome)
        self.assertNotEqual(atom_roots(w,before)[1],atom_roots(w,after)[1])
        self.assertNotEqual(edge_roots(w,before)[0:2],edge_roots(w,after)[0:2]);w.shadow.audit(w)

    def test_experimental_edits_have_distinct_variant_edges_and_preserve_zero_mod9(self):
        w=world();a=w.add_agent(0,'6804',8);b=w.add_agent(0,'6012094',8);b.ip=5
        self.assertTrue(w.infect(a,b));g=w.shadow.grafts[-1];stop=g['graft_stop'];before=b.genome
        edited=copy.deepcopy(w);edit_stop(edited,b.ident,stop,'08','ruptured')
        variant=edited.shadow.variants[-1]
        self.assertEqual(variant['source_edge'],g['graft_edge'])
        self.assertNotEqual(variant['variant_edge'],g['graft_edge']);edited.shadow.audit(edited)
        zero=copy.deepcopy(w);edit_stop(zero,b.ident,stop,'00','signature_matched')
        self.assertEqual(sum(map(int,before))%9,sum(map(int,zero.agents[b.ident].genome))%9)
        self.assertEqual(zero.shadow.variants[-1]['source_edge'],g['graft_edge']);zero.shadow.audit(zero)

    def test_scramble_moves_origins_together_and_keeps_stop_identity(self):
        w=world();a=w.add_agent(0,'6804',8);b=w.add_agent(0,'6012094',8);b.ip=5
        self.assertTrue(w.infect(a,b));g=w.shadow.grafts[-1];before=w.shadow.agents[b.ident]
        result=scramble_body(w,b.ident,g['graft_start'],g['graft_stop'],'fixture-seed')
        self.assertTrue(result['applicable']);after=w.shadow.agents[b.ident]
        self.assertEqual(sorted(atom_roots(w,before)),sorted(atom_roots(w,after)))
        self.assertEqual(w.shadow.nodes[after.edges[g['graft_stop']]]['root'],g['graft_edge'])
        w.shadow.audit(w)

    def test_founder_death_does_not_delete_graft_or_its_archived_copy(self):
        w=world();a=w.add_agent(0,'6804',8);b=w.add_agent(0,'6012094',8);b.ip=5
        self.assertTrue(w.infect(a,b));g=w.shadow.grafts[-1];w.kill(b,'starvation')
        self.assertNotIn(b.ident,w.agents);self.assertIn(g,w.shadow.grafts)
        self.assertTrue(any(g['graft_edge'] in edge_roots(w,t) for t in w.shadow.archive.values()))
        w.shadow.audit(w)

    def test_separate_viral_copies_reassemble_atoms_as_a_new_junction(self):
        w=world();a=w.add_agent(0,'6804',8);b=w.add_agent(0,'6012094',8);c=w.add_agent(0,'60111111',8)
        b.ip=5;self.assertTrue(w.infect(a,b));first=w.shadow.grafts[-1]
        first_stop=first['graft_stop'];first_tape=w.shadow.agents[b.ident]
        old_pair=atom_roots(w,first_tape)[first_stop:first_stop+2]
        b.ip=8;c.ip=7;self.assertTrue(w.infect(b,c))  # copies the 9 but not the 0
        b.ip=5;c.ip=7;self.assertTrue(w.infect(b,c))  # copies the 0 immediately before that 9
        second=w.shadow.grafts[-1];self.assertEqual(second['form'],'close_open_frame')
        new_tape=w.shadow.agents[c.ident];p=second['graft_stop']
        self.assertEqual(atom_roots(w,new_tape)[p:p+2],old_pair)
        self.assertNotEqual(first['graft_edge'],second['graft_edge'])
        self.assertIsNone(w.shadow.nodes[second['graft_occurrence']]['parent']);w.shadow.audit(w)

    def test_replay_and_chrono_recall_restore_history_origins(self):
        w=world();a=w.add_agent(1,'60120948',8);b=w.add_agent(1,'68046804',8)
        w.act(a);self.assertGreaterEqual(len(w.shadow.histories[a.ident]),2)
        snapshot=w.shadow.histories[a.ident][-2];roots=atom_roots(w,snapshot)
        w.execute(a,'replay',0);self.assertEqual(atom_roots(w,w.shadow.agents[a.ident]),roots)
        b.zone=a.zone;w.execute(b,'recall',0)
        self.assertEqual(atom_roots(w,w.shadow.agents[a.ident]),roots);w.shadow.audit(w)


if __name__=='__main__':unittest.main()
