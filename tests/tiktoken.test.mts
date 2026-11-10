import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveEncoding } from '../src/lib/tiktoken.ts';

test('resolveEncoding keeps valid encoding names', () => {
  assert.equal(resolveEncoding('cl100k_base'), 'cl100k_base');
  assert.equal(resolveEncoding('o200k_base'), 'o200k_base');
  assert.equal(resolveEncoding('p50k_base'), 'p50k_base');
});

test('resolveEncoding maps model names to their encoding', () => {
  assert.equal(resolveEncoding('gpt-4o'), 'o200k_base');
  assert.equal(resolveEncoding('gpt-3.5-turbo'), 'cl100k_base');
  assert.equal(resolveEncoding('text-davinci-003'), 'p50k_base');
});

test('resolveEncoding falls back to cl100k_base for unknown values', () => {
  assert.equal(resolveEncoding('not-a-model'), 'cl100k_base');
  assert.equal(resolveEncoding(''), 'cl100k_base');
});
