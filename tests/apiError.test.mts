import test from 'node:test';
import assert from 'node:assert/strict';
import { extractErrorMessage } from '../src/lib/apiError.ts';

test('extractErrorMessage uses a string error and its details', () => {
  assert.equal(
    extractErrorMessage({ error: 'Failed to minify CSS.', details: 'Unexpected token' }, 400),
    'Failed to minify CSS. (Unexpected token)'
  );
});

test('extractErrorMessage uses a string error without details', () => {
  assert.equal(
    extractErrorMessage({ error: 'Request body is empty.' }, 400),
    'Request body is empty.'
  );
});

test('extractErrorMessage supports an error object with a message', () => {
  assert.equal(
    extractErrorMessage({ error: { message: 'Something failed' } }, 500),
    'Something failed'
  );
});

test('extractErrorMessage falls back to the HTTP status', () => {
  assert.equal(extractErrorMessage(null, 502), 'HTTP error! Status: 502');
  assert.equal(extractErrorMessage({}, 500), 'HTTP error! Status: 500');
});
