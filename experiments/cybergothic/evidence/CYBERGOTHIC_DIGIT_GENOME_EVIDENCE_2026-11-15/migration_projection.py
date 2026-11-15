"""Print an ancestry-free projection of a literal-mode ecological trajectory."""
import argparse
import hashlib
import json

from legacy_engine import Config,Entropy
from portable import PortableAssemblage


def strip_metadata(x):
    if isinstance(x,dict):
        return {k:strip_metadata(v) for k,v in x.items()
                if k not in ('origins','origin_history','digit_genome','log_hash','schema')}
    if isinstance(x,(list,tuple)):return [strip_metadata(v) for v in x]
    return x


def main():
    p=argparse.ArgumentParser();p.add_argument('seed',type=int);p.add_argument('--legacy',action='store_true');a=p.parse_args()
    if a.legacy:cls=PortableAssemblage
    else:
        from digit_world import DigitWorld
        cls=DigitWorld
    w=cls(Config(seed=a.seed,initial_agents=36,max_agents=180,max_genome=1000000),Entropy('seeded',a.seed))
    if not a.legacy:w.parser_mode='literal'
    w.recovery_floor=8;w.pulse_renewal=.6;w.steering_mode='target';w.feedback_gain=1.8
    w.archive_mode='random';w.forecast_mode='learned';w.vector_mode='intact';w.cargo_policy='experienced'
    w.temporal_hold=3;w.salvage_feedback=True;w.temporal_retention=.85;w.portable_bets=True
    w.advance(until_time=30.)
    for ident in sorted(w.agents)[::2]:w.kill(w.agents[ident],'shared_ecological_shock')
    w.cfg.max_genome=512;w.advance(until_time=100.)
    payload={'state':strip_metadata(w.snapshot()),'events':strip_metadata(w.log)}
    raw=json.dumps(payload,sort_keys=True,separators=(',',':')).encode()
    print(json.dumps({'seed':a.seed,'projection_sha256':hashlib.sha256(raw).hexdigest(),
                      'events':len(w.log),'agents':len(w.agents),'actions':w.actions},sort_keys=True))


if __name__=='__main__':main()
