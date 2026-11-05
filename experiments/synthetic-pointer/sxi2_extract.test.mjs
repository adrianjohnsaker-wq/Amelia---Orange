import test from 'node:test';
import assert from 'node:assert/strict';
import { motifs, counterfactualWinner } from './sxi2_extract.mjs';
test('500 destinations yield exactly 498 within-window motifs', () => {
  const counts = motifs(Array.from({length:500}, (_,i)=>i%2));
  assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),498);
  assert.deepEqual(counts, {'101':249,'010':249});
});
test('counterfactual recomputes score from same body and respects first-option ties', () => {
  const options = [{target:1,score:0.96,pointerDelta:-0.05},{target:2,score:1,pointerDelta:0}];
  assert.equal(counterfactualWinner(options,0),2);
  assert.equal(counterfactualWinner(options,1),1);
  const tie = [{target:1,score:1,pointerDelta:0},{target:2,score:0.95,pointerDelta:-0.05}];
  assert.equal(counterfactualWinner(tie,0),2);
});
