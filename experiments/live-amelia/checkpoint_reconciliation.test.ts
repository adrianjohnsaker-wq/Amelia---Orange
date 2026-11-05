import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseLiveCheckpoint } from '../../src/services/checkpointReconciliation';

const checkpoint = (events:string[], extra:Record<string,unknown>={}) => ({
  state:{memoryState:{events:events.map(eventDigest=>({eventDigest}))}}, ...extra,
});

test('the continuing memory history wins over an older checkpoint even with a newer clock', () => {
  const older = checkpoint(['a'],{updatedAt:'2030-01-01T00:00:00Z'});
  const newer = checkpoint(['a','b'],{updatedAt:'2020-01-01T00:00:00Z'});
  assert.equal(chooseLiveCheckpoint(newer,older),'local');
  assert.equal(chooseLiveCheckpoint(older,newer),'remote');
});

test('a field checkpoint is not discarded by a runtime-only legacy record', () => {
  const body = checkpoint(['a'],{fieldCheckpoint:{checksum:'body'}});
  assert.equal(chooseLiveCheckpoint(body,checkpoint(['a'])),'local');
  assert.equal(chooseLiveCheckpoint(checkpoint(['a']),body),'remote');
});

test('successive checkpoints by the same device use revision, not wall-clock ordering', () => {
  const older=checkpoint(['a'],{writerId:'device',revision:3,fieldCheckpoint:{checksum:'old'},updatedAt:'2030-01-01T00:00:00Z'});
  const newer=checkpoint(['a'],{writerId:'device',revision:4,fieldCheckpoint:{checksum:'new'},updatedAt:'2020-01-01T00:00:00Z'});
  assert.equal(chooseLiveCheckpoint(newer,older),'local');
});

test('divergent histories or independently changed fields stop instead of replacing either', () => {
  assert.throws(()=>chooseLiveCheckpoint(checkpoint(['a','b']),checkpoint(['a','c'])),/histories differ/);
  assert.throws(()=>chooseLiveCheckpoint(checkpoint(['a'],{writerId:'x',revision:1,fieldCheckpoint:{checksum:'x'}}),
    checkpoint(['a'],{writerId:'y',revision:1,fieldCheckpoint:{checksum:'y'}})),/field checkpoints differ/);
});
