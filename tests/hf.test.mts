import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidHfModelName } from '../src/lib/hf.ts';

test('isValidHfModelName accepts organization/model ids', () => {
  assert.equal(isValidHfModelName('Xenova/llama-tokenizer'), true);
  assert.equal(isValidHfModelName('meta-llama/Llama-3.1-8B'), true);
});

test('isValidHfModelName rejects path traversal, URLs and bare names', () => {
  assert.equal(isValidHfModelName('bert-base-uncased'), false);
  assert.equal(isValidHfModelName('../../etc/passwd'), false);
  assert.equal(isValidHfModelName('https://huggingface.co/x/y'), false);
  assert.equal(isValidHfModelName('org//model'), false);
  assert.equal(isValidHfModelName('org/model?x=1'), false);
  assert.equal(isValidHfModelName(''), false);
});
