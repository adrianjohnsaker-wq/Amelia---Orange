"""Linux worker lockdown after required modules and SQLite files are open."""
import ctypes
import errno


def install(full=True):
    lib=ctypes.CDLL('libseccomp.so.2',use_errno=True)
    lib.seccomp_init.argtypes=[ctypes.c_uint32];lib.seccomp_init.restype=ctypes.c_void_p
    lib.seccomp_syscall_resolve_name.argtypes=[ctypes.c_char_p];lib.seccomp_syscall_resolve_name.restype=ctypes.c_int
    lib.seccomp_rule_add.argtypes=[ctypes.c_void_p,ctypes.c_uint32,ctypes.c_int,ctypes.c_uint]
    lib.seccomp_rule_add.restype=ctypes.c_int
    lib.seccomp_load.argtypes=[ctypes.c_void_p];lib.seccomp_load.restype=ctypes.c_int
    lib.seccomp_release.argtypes=[ctypes.c_void_p]
    ctx=lib.seccomp_init(0x7fff0000)
    if not ctx:raise RuntimeError('seccomp_init failed')
    names=('socket','socketpair','connect','bind','listen','accept','accept4','sendto','sendmsg',
           'sendmmsg','recvfrom','recvmsg','recvmmsg','shutdown','setsockopt','getsockopt',
           'io_uring_setup','pidfd_getfd','process_vm_readv','process_vm_writev','ptrace')
    if full:names+=('open','openat','openat2','creat','open_by_handle_at','name_to_handle_at',
                    'execve','execveat')
    installed=[]
    for name in names:
        nr=lib.seccomp_syscall_resolve_name(name.encode())
        if nr<0:continue
        rc=lib.seccomp_rule_add(ctx,0x00050000|errno.EPERM,nr,0)
        if rc:raise RuntimeError(f'seccomp rule failed: {name}: {rc}')
        installed.append(name)
    rc=lib.seccomp_load(ctx)
    if rc:raise RuntimeError(f'seccomp load failed: {rc}')
    lib.seccomp_release(ctx)
    return installed
