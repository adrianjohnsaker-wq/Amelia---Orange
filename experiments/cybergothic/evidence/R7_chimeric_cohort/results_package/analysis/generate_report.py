"""Render a factual report from the locked and supplementary analyses."""
import argparse
import json
from pathlib import Path


def percent(x):return f'{100*x:.1f}%'
def difference(v):
    if v is None:return 'not estimable'
    return f"{100*v['estimate']:+.1f} pp ({100*v['low']:+.1f} to {100*v['high']:+.1f})"
def proportion(v):
    if v is None:return 'not estimable'
    return f"{v['successes']}/{v['n']} ({percent(v['estimate'])}; {percent(v['low'])}–{percent(v['high'])})"
def mean(v):
    if v is None:return 'not estimable'
    return f"{v['estimate']:.2f} ({v['low']:.2f}–{v['high']:.2f})"
def paired_counts(x):
    return f"{x.get('1,1',0)} / {x.get('1,0',0)} / {x.get('0,1',0)} / {x.get('0,0',0)}"


def main():
    p=argparse.ArgumentParser();p.add_argument('--run-dir',type=Path,required=True)
    p.add_argument('--analysis-dir',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();r=a.run_dir;d=a.analysis_dir
    m=json.loads((r/'cohort_manifest.json').read_text());primary=json.loads((r/'analysis.json').read_text())
    match=json.loads((r/'nonchimeric_matching.json').read_text());audit=json.loads((r/'archive_audit.json').read_text())
    extra=json.loads((d/'exploratory_analysis.json').read_text());chain=json.loads((d/'horizontal_chains.json').read_text())
    replay=json.loads((d/'independent_replay.json').read_text())
    case=json.loads((d/'CASE_STUDY_50176.json').read_text())
    initial_audit=json.loads((d/'original_archive_audit_failure.json').read_text());n=len(m['selected_seeds'])
    if any(x['status']!='pass' for x in (audit,replay)) or audit['branches']!=5*n or replay['branches']!=5*n:
        raise ValueError('full audit and independent replay are required')
    first=m['seed_start'];last=max(m['selected_seeds']+m['noneligible_seeds'])
    pc=primary['paired_primary'];ct=primary['paired_2x2'];nat=primary['natural_primary'];pop=extra['population_overall']
    lines=['# Chimeric-junction cohort: confirmatory results','',
      '15 November 2026','',
      f"The locally sealed design screened {m['screened']} populations (seeds {first}–{last}) and selected {n} naturally occurring grafts. Each produced five branches, for {5*n} branches. Status: **{m['status']}**. The source, protocol, seed range and analysis were hash-sealed before this run; the seal was local and was not an independent public registration.",'',
      f"All {5*n} branch archives passed the corrected stored-state, event, shadow, checkpoint and classification audit. Fresh isolated replays reproduced the primary-state, event-ledger and shadow hashes and classifications of all {5*n} branches. The original archive validator flagged {sum(x['seed'] is not None for x in initial_audit['failures'])} populations because it treated host-list ordering as significant after JSON restoration. The corrected audit compared host identity and all recorded paths while preserving the order within each path; it found {len(audit['order_only_mismatches'])} order-only comparisons across the dataset. The original failure and corrected audit are both preserved. No model or locked-analysis source was changed. These checks apply to seeded entropy in the isolated research prototype; Amelia Orange and Supabase were not accessed.",'',
      '## Primary natural outcomes','',
      f"* At least one living secondary carrier in the defined vertical/horizontal/mixed union at 48 model-time units: **{proportion(nat['secondary_union'])}**, 95% Wilson interval.",
      f"* Recognised G copied by direct/vector delivery: **{nat['viral_delivery_events']} events**, including {nat['nonkin_viral_delivery_events']} to hosts outside the founder’s fission-descendant tree; there were {nat['unique_recipient_hosts_summed_within_population']} distinct recipient hosts summed within population. Mean events per population: {mean(nat['viral_events_per_population'])}, 95% population bootstrap.",
      f"* At least one viral delivery outside that fission-descendant tree during the 48-unit follow-up occurred in **{proportion(pop['at_least_one_nonkin_viral_delivery'])}** populations. A delivery during follow-up and a living carrier at the final horizon are different measures.",
      f"* At least one secondary carrier retaining ≥80% of the focal digit occurrences was present at the final horizon in {proportion(nat['strict_80_percent_carrier_populations'])} populations, including routes outside the primary union. Downstream viral deliveries by mechanism: `{json.dumps(nat['viral_events_by_mechanism'],sort_keys=True)}`.",
      f"* At least one horizon carrier classified through a necrotic route was present in {proportion(pop['horizon_necrotic_carrier'])} populations.",
      f"* Natural-branch living carrier categories at the horizon, counting each host once: `{json.dumps(nat['categories'],sort_keys=True)}`. Necrotic, time-splice and recall routes are reported separately from the primary union.",'',
      'The pre-specified union uses exclusive route labels. When a surviving junction has a history involving both viral transfer and chrono recall, the classifier labels it as recall rather than placing it in the viral category. The union result therefore cannot be read as the total number of living carriers with any viral ancestry. The broader ancestry audit below addresses this distinction.','',
      'The primary ledger does not capture every rejected contact, so the data do not identify an infection probability per encounter. A verified viral copy demonstrates transfer in this simulation; its adaptive value is assessed by the matched comparisons.','',
      '## Sealed matched comparisons','',
      'Both comparisons use 10,000 population-paired bootstrap resamples and two-sided 97.5% percentile intervals. Positive values favour the natural branch. Paired counts are both-positive / natural-only / control-only / neither.','',
      '| Contrast | Natural minus control | Paired counts |', '| --- | ---: | ---: |',
      f"| Same G, recognised carrier union: natural vs recipient-active | {difference(pc['natural_minus_active_recognised_union'])} | {paired_counts(ct['natural_active'])} |",
      f"| G vs edited G*, homologous edge carrier: natural vs `09→08` | {difference(pc['natural_G_minus_ruptured_Gstar_marker'])} | {paired_counts(ct['natural_ruptured_marker'])} |",'',
      'The physical `09→08` edit changes a digit and the mod-9 signature. The G/G* comparison follows a homologous marker irrespective of whether the edited edge is a recognised stop; it is not a comparison of two intact introns. The recipient-active branch retains G but changes how the original recipient interprets all of its recognised introns. A bootstrap interval including zero is not evidence of equivalence. If the paired samples have no discordance, a degenerate percentile interval is not proof of a zero effect.','',
      'The pre-specified graft-form descriptions below use 95% intervals and are not additional confirmatory tests.','',
      '| Formation | Populations | Natural carrier union, 95% interval | Natural minus recipient-active, 95% interval | Natural G minus `08` G*, 95% interval |',
      '| --- | ---: | ---: | ---: | ---: |']
    for key,label in (('split_existing_stop','Split stop'),('close_open_frame','Closed open frame')):
        q=primary['prespecified_form_strata'][key]
        lines.append(f"| {label} | {q['populations']} | {proportion(q['natural_secondary_union'])} | {difference(q['paired_natural_minus_recipient_active'])} | {difference(q['paired_natural_minus_08_marker'])} |")
    lines+=['',
      '## Sequence lookalikes at the horizon','',
      'The numerator counts exact-sequence matches with zero descent from focal digit occurrences; the denominator is all exact matches in living nonfounder hosts in each focal-length group. Intervals are 95% population-cluster bootstrap intervals. A zero-focal match may share older ancestry. An absence of matches makes the ratio not estimable.','',
      '| Focal intron length | Zero-focal / exact matches | Ratio (95% interval) | Pre-existing lookalike ancestries |', '| --- | ---: | ---: | ---: |']
    for label in ('6','8','10+'):
        q=primary['secondary']['sequence_collision'][label];v=q['ratio'];interval=v['interval']
        text='not estimable' if v['estimate'] is None else f"{percent(v['estimate'])} ({percent(interval[0])}–{percent(interval[1])})"
        lines.append(f"| {label} digits | {v['numerator']}/{v['denominator']} | {text} | {q['preexisting_lookalike_ancestries']} |")
    collisions=primary['secondary']['sequence_collision']
    existing=sum(collisions[k]['preexisting_lookalike_ancestries'] for k in ('6','8','10+'))
    total_matches=sum(collisions[k]['ratio']['denominator'] for k in ('6','8','10+'))
    lines+=['',f"Across these strata, {existing}/{total_matches} horizon matches had a stop tracing to a pre-graft exact lookalike. This is a horizon scan. The first historical appearance of each full matching sequence has not automatically been established; it would require a separate audited replay. Bootstrap ratios with very few matches can produce degenerate intervals and should not be treated as precise population rates.",'',
      '## Exploratory mechanisms and phenotype','',
      f"* A broader post-hoc audit of all recognised original-G paths found at least one living secondary carrier by any route in {proportion(chain['horizon_original_recognised_any_route'])} populations, and a living non-descendant carrier with viral ancestry in {proportion(chain['horizon_nondescendant_carrier_with_viral_ancestry'])} populations. This includes paths containing viral transfer together with recall or necrotic routing, regardless of their order, even when the primary category is not viral.",
      f"* Post-hoc case, seed {case['seed']}: the original junction arose at model time {case['graft_time']:.3f}, was replayed in its founder at {case['causal_path_from_graft'][0]['model_time']:.3f}, and was delivered by direct infection to host {case['host']} at {case['causal_path_from_graft'][-1]['model_time']:.3f}. The recipient was alive at the horizon {case['time_from_last_delivery_to_horizon']:.3f} model-time units after delivery. Its recognised intron retained {case['saved_classification']['focal_overlap']}/{case['saved_classification']['focal_total']} original focal digit occurrences: the junction entered a different intron body, rather than an intact copy of the full original intron. Replay preceded delivery in this case.",
      f"  Original focal intron: `{case['original_focal_sequence']}`. Recipient intron at the horizon: `{case['recipient_recognised_intron']}`.",
      f"* An ancestry with viral transfers to at least two distinct secondary recipients was found in {proportion(chain['multihop_distinct_secondary_recipients'])} populations; {chain['delivery_events_checked']} delivery ancestries were checked. This is a multi-hop path within host ecology, not proof of a free-standing self-replicator.",
      f"* A delivery to a host with a different recorded fission/archive founder root occurred in {proportion(chain['viral_delivery_to_different_recorded_root'])} populations. Event-level root relations: `{json.dumps(chain['recorded_root_relations'],sort_keys=True)}`. Different recorded roots do not prove the hosts share no earlier horizontally acquired code.",
      f"* A viral delivery whose ancestry included a necrotic route appeared in {proportion(chain['viral_delivery_with_necrotic_ancestry'])} populations. Viral packet delivery and Cthell/archive recycling are distinct mechanisms.",
      f"* Index grafts by mechanism: direct {extra['index_mechanism']['direct']['populations']}; vector {extra['index_mechanism']['vector']['populations']}. The exploratory vector-minus-direct difference in the natural secondary-carrier outcome was {difference(extra['vector_minus_direct_exploratory']['natural_secondary_union'])}, 95% unpaired population bootstrap. Index-mode groups were not randomised.",
      f"* At least one later viral delivery outside the founder’s fission-descendant tree occurred in {proportion(extra['index_mechanism']['direct']['at_least_one_nonkin_viral_delivery'])} of direct-index populations and {proportion(extra['index_mechanism']['vector']['at_least_one_nonkin_viral_delivery'])} of vector-index populations. The exploratory vector-minus-direct difference was {difference(extra['vector_minus_direct_exploratory']['any_nonkin_delivery'])}, 95% bootstrap; the index route and the later delivery route are distinct variables.",
      f"* Natural founder survival was {proportion(primary['secondary']['founder_survival']['natural'])} versus {proportion(primary['secondary']['founder_survival']['recipient_active'])} under recipient-active interpretation. The paired natural-minus-active difference was {difference(extra['paired_exploratory_phenotypes']['recipient_active']['natural_minus_arm_founder_survival'])}, 95% bootstrap.",
      f"* Natural founder survival: {proportion(primary['secondary']['founder_survival']['natural'])}; rupture survival: {proportion(primary['secondary']['founder_survival']['ruptured_08'])}. Their paired natural-minus-rupture difference was {difference(extra['paired_exploratory_phenotypes']['ruptured_08']['natural_minus_arm_founder_survival'])}, 95% bootstrap.",
      f"* Mean descendant births: natural {mean(primary['secondary']['descendant_births']['natural'])}; rupture {mean(primary['secondary']['descendant_births']['ruptured_08'])}. Their paired natural-minus-rupture difference was {mean(extra['paired_exploratory_phenotypes']['ruptured_08']['natural_minus_arm_descendant_births'])}, 95% bootstrap.",
      f"* In the signature-matched `09→00` sensitivity, natural minus edited homologous-marker prevalence was {difference(primary['secondary']['natural_minus_00_homologous_marker'])}, 95% bootstrap. The body-scramble was applicable in {primary['secondary']['scramble']['applicable_populations']}/{n} populations; natural minus scramble recognised-carrier prevalence was {difference(primary['secondary']['scramble']['natural_minus_scramble_secondary_union'])}, 95% bootstrap.",
      f"* The separate donor-only comparison produced {match['matched_pairs']} descriptive matched pairs, with {len(match['unmatched_graft_seeds'])} unmatched graft populations. Any-route secondary carriers occurred in {match['graft_secondary_count']}/{match['matched_pairs']} chimeric and {match['comparator_secondary_count']}/{match['matched_pairs']} donor-only encounters. It is observational and may reuse populations in different roles.",'',
      'These secondary and delivery-mode summaries are exploratory and unadjusted for multiple comparisons. Supplementary delivery-mode and transmission-chain scripts were prepared during screening before cohort outcomes were inspected; they were not part of the original seal. The broader horizon-route audit was added after the results, to investigate the classifier’s route priority. The cohort uses seeded entropy and a costed archive-reconstitution mechanism with recovery floor eight; persistence must be interpreted with that recovery process present. The 250-population target improves precision but does not guarantee power for rare transmission or small paired effects.','',
      'The machine-readable fixed analysis, supplementary summaries, full cohort manifest, replay audit and original archived branch data accompany this report.']
    a.output.write_text('\n'.join(lines)+'\n');print(a.output)


if __name__=='__main__':main()
