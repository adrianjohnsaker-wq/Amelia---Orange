import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, readdirSync, writeFileSync, writeSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { canonical, decodeCanonical, digest, sha256 } from './canonical';

function syncDirectory(path: string): void {
  const fd = openSync(path, 'r');
  try { fsyncSync(fd); } finally { closeSync(fd); }
}

export interface CheckpointRef { sha256: string; file: string; byteLength: number }
export interface LedgerRecord {
  schema: 'sxi.ledger/v1';
  sequence: number;
  utc: string;
  monotonicNs: string;
  kind: string;
  data: unknown;
  checkpoint: CheckpointRef | null;
  previousHash: string | null;
  recordHash: string;
}

/** A new run has its own exclusive directory. Restart/resume is deliberately unsupported. */
export class SyntheticEvidenceLedger {
  private readonly eventsPath: string;
  private readonly checkpointDir: string;
  private sequence = 0;
  private previousHash: string | null = null;
  private failed = false;

  constructor(public readonly directory: string) {
    mkdirSync(directory); // exclusive: a pre-existing run is never overwritten
    this.checkpointDir = join(directory, 'checkpoints');
    mkdirSync(this.checkpointDir);
    this.eventsPath = join(directory, 'events.jsonl');
    writeFileSync(this.eventsPath, '', { flag: 'wx' });
    syncDirectory(this.checkpointDir);
    syncDirectory(directory);
    syncDirectory(dirname(directory));
  }

  append(kind: string, data: unknown, checkpoint?: unknown): LedgerRecord {
    if (this.failed) throw new Error('Ledger has failed; do not continue this run');
    try {
      let ref: CheckpointRef | null = null;
      if (checkpoint !== undefined) {
        const bytes = Buffer.from(canonical(checkpoint), 'utf8');
        const hash = sha256(bytes);
        const name = hash + '.json';
        const target = join(this.checkpointDir, name);
        if (existsSync(target)) {
          if (sha256(readFileSync(target)) !== hash) throw new Error('Existing checkpoint hash mismatch');
        } else {
          const fd = openSync(target, 'wx');
          try { writeFileSync(fd, bytes); fsyncSync(fd); } finally { closeSync(fd); }
          syncDirectory(this.checkpointDir);
        }
        ref = { sha256: hash, file: 'checkpoints/' + name, byteLength: bytes.length };
      }
      const body = {
        schema: 'sxi.ledger/v1' as const,
        sequence: this.sequence + 1,
        utc: new Date().toISOString(),
        monotonicNs: process.hrtime.bigint().toString(),
        kind,
        data,
        checkpoint: ref,
        previousHash: this.previousHash,
      };
      const record: LedgerRecord = { ...body, recordHash: digest(body) };
      const fd = openSync(this.eventsPath, 'a');
      try { writeSync(fd, canonical(record) + '\n', undefined, 'utf8'); fsyncSync(fd); }
      finally { closeSync(fd); }
      this.sequence = record.sequence;
      this.previousHash = record.recordHash;
      return record;
    } catch (error) {
      this.failed = true;
      throw error;
    }
  }
}

/** Verify the complete chain and every checkpoint, and reject orphan files or partial lines. */
export function verifyLedger(directory: string, options: { expectedHead?: string; requireComplete?: boolean } = {}): { count: number; head: string | null; records: LedgerRecord[] } {
  const raw = readFileSync(join(directory, 'events.jsonl'), 'utf8');
  if (raw && !raw.endsWith('\n')) throw new Error('Incomplete final ledger record');
  const lines = raw ? raw.slice(0, -1).split('\n') : [];
  let previousHash: string | null = null;
  const used = new Set<string>();
  const records: LedgerRecord[] = [];
  for (let i = 0; i < lines.length; i++) {
    const record = decodeCanonical(lines[i]) as LedgerRecord;
    if (record.schema !== 'sxi.ledger/v1' || record.sequence !== i + 1 || record.previousHash !== previousHash) {
      throw new Error('Broken sequence or chain at record ' + (i + 1));
    }
    const { recordHash, ...body } = record;
    if (digest(body) !== recordHash) throw new Error('Record hash mismatch at ' + (i + 1));
    if (record.checkpoint) {
      const { sha256: expected, file, byteLength } = record.checkpoint;
      if (!/^[a-f0-9]{64}$/.test(expected) || file !== 'checkpoints/' + expected + '.json') throw new Error('Invalid checkpoint reference');
      const bytes = readFileSync(join(directory, file));
      if (bytes.length !== byteLength || sha256(bytes) !== expected) throw new Error('Checkpoint hash mismatch');
      used.add(expected + '.json');
    }
    records.push(record);
    previousHash = recordHash;
  }
  const files = readdirSync(join(directory, 'checkpoints'));
  if (files.some(file => !used.has(file))) throw new Error('Orphan checkpoint detected');
  if (options.expectedHead !== undefined && previousHash !== options.expectedHead) throw new Error('Ledger head does not match the external receipt');
  if (options.requireComplete) {
    if (records[0]?.kind !== 'RUN_STARTED' || records.at(-1)?.kind !== 'RUN_FINISHED' || records.length % 2 !== 0) {
      throw new Error('Run is incomplete');
    }
    for (let i = 1; i < records.length - 1; i += 2) {
      if (records[i].kind !== 'STEP_BEGIN' || records[i + 1]?.kind !== 'STEP_COMMITTED' ||
          (records[i + 1].data as { beginSequence?: number }).beginSequence !== records[i].sequence) {
        throw new Error('Unpaired step records');
      }
    }
  }
  return { count: records.length, head: previousHash, records };
}

export function readCheckpoint(directory: string, ref: CheckpointRef): unknown {
  if (!/^[a-f0-9]{64}$/.test(ref.sha256) || ref.file !== 'checkpoints/' + ref.sha256 + '.json') throw new Error('Invalid checkpoint reference');
  const bytes = readFileSync(join(directory, ref.file));
  if (bytes.length !== ref.byteLength || sha256(bytes) !== ref.sha256) throw new Error('Checkpoint hash mismatch');
  return decodeCanonical(bytes.toString('utf8'));
}
