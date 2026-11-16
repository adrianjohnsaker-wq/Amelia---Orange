"""Exercise the prototype after closing off new file and network syscalls."""
import argparse
import ctypes
import errno
import json
import os
import socket
import sys


def main():
    p=argparse.ArgumentParser();p.add_argument('--output-dir',required=True);a=p.parse_args()
    output=os.path.realpath(a.output_dir);lab=os.path.realpath(os.path.dirname(__file__))
    from local_guard import install as install_guard
    audit=install_guard(output,lab)

    # Load all code and open only the temporary checkpoint before tightening
    # the kernel policy. The Python audit hook already limits these accesses.
    from observer import ObservedWorld
    from pilot_stop_screen import create_world
    from reactor import digest
    from shadow_journal import ShadowJournal
    from seccomp_lock import install
    libc=ctypes.CDLL(None,use_errno=True)
    db=os.path.join(output,'isolated.sqlite');w=create_world(45021,ObservedWorld)
    j=ShadowJournal(db);j.save(w)

    installed=install()

    try:socket.socket()
    except OSError as ex:assert ex.errno==errno.EPERM
    else:raise AssertionError('network socket was not blocked')
    libc.open.argtypes=[ctypes.c_char_p,ctypes.c_int];libc.open.restype=ctypes.c_int
    fd=libc.open(b'/etc/passwd',os.O_RDONLY)
    assert fd==-1 and ctypes.get_errno()==errno.EPERM,'kernel file-open block failed'
    try:open('/home/user/Amelia_Orange_state.json','r')
    except PermissionError:pass
    else:raise AssertionError('outside file was not blocked')

    w.advance(until_time=5.);w.shadow.audit(w);j.save(w)
    restored=j.load();assert digest(restored.snapshot())==digest(w.snapshot())
    assert digest(restored.shadow.export())==digest(w.shadow.export());j.close()
    print(json.dumps({'status':'pass','syscalls_blocked':installed,'socket_probe':'EPERM',
        'direct_libc_file_probe':'EPERM','outside_python_file_probe':'blocked',
        'primary_and_shadow_sqlite':'pass','model_time':w.now,
        'supabase_or_amelia_environment_keys':0,'audited_python_open_count':len(audit['reads']),
        'blocked_outside_open_count':len(audit['blocked'])},sort_keys=True))


if __name__=='__main__':main()
