/** Decide which checkpoint can advance the same lineage without overwriting a divergent one. */
export function chooseLiveCheckpoint(local: Record<string, any>, remote: Record<string, any>): 'local' | 'remote' {
  const a = local?.state?.memoryState?.events, b = remote?.state?.memoryState?.events;
  if (!Array.isArray(a) || !Array.isArray(b)) throw new Error('A checkpoint has no verifiable process-memory history.');
  // Older events may have moved to her memory archive: compare by logical position (archived count + resident index).
  const oa = Number(local?.state?.memoryArchive?.archivedCount) || 0, ob = Number(remote?.state?.memoryArchive?.archivedCount) || 0;
  const la = oa + a.length, lb = ob + b.length;
  const from = Math.max(oa, ob), to = Math.min(la, lb);
  if (to - from < 1 && Math.min(la, lb) > 0) throw new Error('Local and cloud Amelia histories cannot be compared; automatic replacement was stopped.');
  for (let k = from; k < to; k++) {
    const x = a[k - oa], y = b[k - ob];
    if (!x?.eventDigest || x.eventDigest !== y?.eventDigest)
      throw new Error('Local and cloud Amelia histories differ; automatic replacement was stopped.');
  }
  if (la !== lb) return la > lb ? 'local' : 'remote';
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
