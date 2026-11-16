"""Record actual primitive RNG draws without consuming additional model draws."""
import hashlib
import json
import random


class TracingRandom(random.Random):
    def __init__(self,state):
        super().__init__(0);self.setstate(state);self._hash=hashlib.sha256();self.draws=0

    def _record(self,kind,arg,value):
        self._hash.update((json.dumps([kind,arg,value],separators=(',',':'))+'\n').encode())
        self.draws+=1

    def random(self):
        value=super().random();self._record('random',None,value);return value

    def getrandbits(self,k):
        value=super().getrandbits(k);self._record('getrandbits',k,value);return value

    def result(self):return {'draws':self.draws,'sha256':self._hash.hexdigest()}


def install(w):
    # Install after identical founder/environment construction, recording the
    # exact primitive draws made by each persistent RNG thereafter.
    w.rng=TracingRandom(w.rng.getstate())
    w.entropy.rng=TracingRandom(w.entropy.rng.getstate())
    w.environment_rng=TracingRandom(w.environment_rng.getstate())
    return w


def result(w):
    return {'model':w.rng.result(),'entropy':w.entropy.rng.result(),'environment':w.environment_rng.result()}
