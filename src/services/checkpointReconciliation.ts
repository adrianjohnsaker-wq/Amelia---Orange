/** Decide which checkpoint can advance the same lineage without overwriting a divergent one. */
export function chooseLiveCheckpoint(local: Record<string, any>, remote: Record<string, any>): 'local' | 'remote' {
  const a = local?.state?.memoryState?.events, b = remote?.state?.memoryState?.events;
  if (!Array.isArray(a) || !Array.isArray(b)) throw new Error('A checkpoint has no verifiable process-memory history.');
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (!a[i]?.eventDigest || a[i].eventDigest !== b[i]?.eventDigest)
      throw new Error('Local and cloud Amelia histories differ; automatic replacement was stopped.');
  }
  if (a.length !== b.length) return a.length > b.length ? 'local' : 'remote';
  const af = local.fieldCheckpoint, bf = remote.fieldCheckpoint;
  if (Boolean(af) !== Boolean(bf)) return af ? 'local' : 'remote';
  if (af && bf && af.checksum !== bf.checksum) {
    if (local.writerId && local.writerId === remote.writerId && Number.isSafeInteger(local.revision) && Number.isSafeInteger(remote.revision)
        && local.revision !== remote.revision) return local.revision > remote.revision ? 'local' : 'remote';
    throw new Error('Local and cloud field checkpoints differ; automatic replacement was stopped.');
  }
  if (local.writerId && local.writerId === remote.writerId && Number.isSafeInteger(local.revision) && Number.isSafeInteger(remote.revision)
      && local.revision !== remote.revision) return local.revision > remote.revision ? 'local' : 'remote';
  const localTime = Date.parse(String(local.updatedAt || '')) || 0;
  const remoteTime = Date.parse(String(remote.updatedAt || '')) || 0;
  return remoteTime > localTime ? 'remote' : 'local';
}
