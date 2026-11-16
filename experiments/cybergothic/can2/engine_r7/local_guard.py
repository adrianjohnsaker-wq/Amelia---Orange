"""Credential-free, allowlisted Python I/O before the kernel worker lockdown."""
import os
import sys


def install(output,lab):
    output=os.path.realpath(output);lab=os.path.realpath(lab);reads=[];blocked=[]
    allowed=[output,lab,os.path.realpath(sys.base_prefix),'/usr/lib','/lib','/lib64']
    def inside(path,root):return path==root or path.startswith(root+os.sep)
    def audit(event,args):
        if event=='open' and args and isinstance(args[0],(str,bytes,os.PathLike)):
            name=os.path.realpath(os.fsdecode(args[0]));flags=args[2]
            if not any(inside(name,x) for x in allowed):
                blocked.append(name);raise PermissionError('outside isolated work area')
            write=bool(isinstance(flags,int) and flags & (os.O_WRONLY|os.O_RDWR|os.O_CREAT|os.O_TRUNC))
            if write and not inside(name,output):raise PermissionError('read-only source/runtime')
            reads.append(name)
        if event=='sqlite3.connect' and args and args[0]!=':memory:':
            name=os.path.realpath(os.fsdecode(args[0]))
            if not inside(name,output):raise PermissionError('database outside isolated output')
    sys.addaudithook(audit)
    if any('SUPABASE' in k.upper() or 'AMELIA' in k.upper() for k in os.environ):
        raise RuntimeError('live project credentials or variables present')
    return {'reads':reads,'blocked':blocked}
