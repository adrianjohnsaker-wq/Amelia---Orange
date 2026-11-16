"""Reference rules for a *separate* observational provenance tape.

This module is not connected to DigitWorld. It deliberately contains no RNG,
interpreter, scheduler, network client or engine-state mutation. Integration and
enabled/disabled invariance tests are prerequisites for any confirmatory run.
Callers must provide event IDs already unique by run, branch and affected object.
"""
from __future__ import annotations

from dataclasses import asdict,dataclass
import hashlib
import json


@dataclass(frozen=True)
class Atom:
    run_id: str
    origin_event: str
    origin_host: str
    origin_model_time: float
    ordinal: int
    digit: str
    @property
    def uid(self):return (self.run_id,self.origin_event,self.ordinal)


@dataclass(frozen=True)
class Edge:
    edge_id: str
    left: tuple[str,str,int]
    right: tuple[str,str,int]


@dataclass(frozen=True)
class Tape:
    atoms: tuple[Atom,...]
    edges: tuple[Edge,...]

    def __post_init__(self):
        if len(self.edges)!=max(0,len(self.atoms)-1):raise ValueError('wrong edge count')
        for i,e in enumerate(self.edges):
            if e.left!=self.atoms[i].uid or e.right!=self.atoms[i+1].uid:
                raise ValueError('edge endpoints do not match neighbouring atoms')
        if any(a.digit not in '0123456789' or len(a.digit)!=1 for a in self.atoms):
            raise ValueError('digits must be decimal characters')

    @property
    def digits(self):return ''.join(a.digit for a in self.atoms)

    def to_dict(self):return {'atoms':[asdict(a) for a in self.atoms],
                               'edges':[asdict(e) for e in self.edges]}

    @classmethod
    def from_dict(cls,data):
        atoms=tuple(Atom(**a) for a in data['atoms'])
        edges=tuple(Edge(e['edge_id'],tuple(e['left']),tuple(e['right'])) for e in data['edges'])
        return cls(atoms,edges)

    def digest(self):
        data=json.dumps(self.to_dict(),sort_keys=True,separators=(',',':')).encode()
        return hashlib.sha256(data).hexdigest()


def _new_edge(event,position,left,right):
    return Edge(f'{event}/adjacency/{position}',left.uid,right.uid)


def mint(digits,event,host,model_time,run_id):
    atoms=tuple(Atom(str(run_id),event,str(host),float(model_time),i,d) for i,d in enumerate(digits))
    return Tape(atoms,tuple(_new_edge(event,i,atoms[i],atoms[i+1]) for i in range(len(atoms)-1)))


def select_indices(tape,indices,event):
    """Copy selected atoms, keeping edges only across source-adjacent positions."""
    positions=list(indices)
    if any(i<0 or i>=len(tape.atoms) for i in positions):raise IndexError('invalid source index')
    atoms=tuple(tape.atoms[i] for i in positions);edges=[]
    for j,(a,b) in enumerate(zip(positions,positions[1:])):
        edges.append(tape.edges[a] if b==a+1 else _new_edge(event,j,atoms[j],atoms[j+1]))
    return Tape(atoms,tuple(edges))


def insert(host,position,payload,event,cap):
    """Mirror insertion and cap truncation; preserve copied internal adjacencies."""
    if not 0<=position<=len(host.atoms) or cap<1:raise ValueError('invalid insertion')
    if not payload.atoms:
        return select_indices(host,range(min(len(host.atoms),cap)),event+'/unchanged')
    parts=[(host,i,0) for i in range(position)] + [(payload,i,1) for i in range(len(payload.atoms))] + \
          [(host,i,2) for i in range(position,len(host.atoms))]
    parts=parts[:cap];atoms=tuple(t.atoms[i] for t,i,_ in parts);edges=[]
    for j,((a,ai,ag),(b,bi,bg)) in enumerate(zip(parts,parts[1:])):
        if ag==bg and a is b and bi==ai+1:edges.append(a.edges[ai])
        else:edges.append(_new_edge(event,j,atoms[j],atoms[j+1]))
    return Tape(atoms,tuple(edges))


def mutate(tape,position,digit,event,host,model_time):
    """An overwrite creates a fresh origin even if the value happens to match."""
    if not 0<=position<len(tape.atoms):raise IndexError('invalid mutation position')
    atoms=list(tape.atoms);atoms[position]=Atom(atoms[position].run_id,event,str(host),float(model_time),0,digit)
    edges=list(tape.edges)
    for j in (position-1,position):
        if 0<=j<len(edges):edges[j]=_new_edge(event,j,atoms[j],atoms[j+1])
    return Tape(tuple(atoms),tuple(edges))
