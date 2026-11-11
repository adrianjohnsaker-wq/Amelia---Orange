import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOK, verifyBook } from '../../src/showstone/book';
import { ENTITIES } from '../../src/showstone/entities';

test('the Showstone Book is intact, catches an edit or a removal at its entry, and hashes ASCII only', () => {
  assert.ok(BOOK.length > 0 && ENTITIES.length > 0);
  assert.equal(verifyBook(BOOK), -1);
  const edited = BOOK.map((e, i) => (i === 2 ? { ...e, outcome: e.outcome + ' (edited)' } : e));
  assert.equal(verifyBook(edited), 2);
  assert.equal(verifyBook([...BOOK.slice(0, 1), ...BOOK.slice(2)]), 1);
});
