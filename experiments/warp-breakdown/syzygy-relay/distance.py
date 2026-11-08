"""Native directed shortest paths with Oracle's transition-to-5 reset semantics."""
from collections import deque
BASE=[(0,9),(1,8),(2,7),(3,6),(4,5),(1,2),(2,4),(4,7),(7,8),(8,9),(9,1),(0,0),(1,1),(1,7),(2,3),(2,5),(3,3),(4,1),(5,1),(5,4),(5,6),(6,3),(7,1),(7,2),(7,5),(8,1),(8,7),(9,0),(9,9)]
MATCH=[e for e in BASE if e[0] not in (2,7)]+[(2,2),(2,7),(7,2)]
def shortest(start,targets,matched=False):
 graph=MATCH if matched else BASE;q=deque([(start,[])]);seen={start}
 while q:
  zone,path=q.popleft()
  if zone in targets:return {'transitions':len(path),'events':path}
  for src,to in graph:
   if src!=zone:continue
   actual=0 if to==5 else to
   if actual not in seen:seen.add(actual);q.append((actual,path+[[zone,to,actual]]))
 return {'transitions':None,'events':None}
if __name__=='__main__':
 import json
 print(json.dumps({str(z):{'warp':shortest(z,(3,6)),'native27':shortest(z,(2,7)),'matched27':shortest(z,(2,7),True)} for z in (1,4,8)},indent=2))
