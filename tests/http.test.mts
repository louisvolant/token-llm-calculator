import test from 'node:test';
import assert from 'node:assert/strict';
import {
  handleRouteError,
  HttpError,
  readJsonBody,
  requireString,
} from '../src/lib/http.ts';

function jsonRequest(body: string, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  });
}

async function expectHttpError(promise: Promise<unknown>, status: number): Promise<void> {
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof HttpError, 'expected an HttpError');
    assert.equal(error.status, status);
    return true;
  });
}

test('readJsonBody parses a valid JSON object', async () => {
  const body = await readJsonBody(jsonRequest('{"text":"hello"}'));
  assert.deepEqual(body, { text: 'hello' });
});

test('readJsonBody rejects an empty body with 400', async () => {
  await expectHttpError(readJsonBody(jsonRequest('')), 400);
});

test('readJsonBody rejects invalid JSON with 400', async () => {
  await expectHttpError(readJsonBody(jsonRequest('{not json')), 400);
});

test('readJsonBody rejects a non-object JSON value with 400', async () => {
  await expectHttpError(readJsonBody(jsonRequest('[1,2,3]')), 400);
});

test('readJsonBody rejects a body larger than the content-length limit with 413', async () => {
  const request = jsonRequest('{"text":"hello"}', {
    'content-length': String(10 * 1024 * 1024),
  });
  await expectHttpError(readJsonBody(request), 413);
});

test('readJsonBody rejects an aborted upload with 400', async () => {
  const stream = new ReadableStream({
    start(controller) {
      controller.error(new Error('client aborted'));
    },
  });
  const request = new Request('http://localhost/api/test', {
    method: 'POST',
    body: stream,
    // @ts-expect-error -- `duplex` is required by undici for streaming bodies
    duplex: 'half',
  });

  await expectHttpError(readJsonBody(request), 400);
});

test('requireString accepts a non-empty string', () => {
  assert.equal(requireString('hello', 'text', 10), 'hello');
});

test('requireString rejects missing, empty and non-string values with 400', async () => {
  await expectHttpError(Promise.resolve().then(() => requireString(undefined, 'text', 10)), 400);
  await expectHttpError(Promise.resolve().then(() => requireString('', 'text', 10)), 400);
  await expectHttpError(Promise.resolve().then(() => requireString(42, 'text', 10)), 400);
});

test('requireString rejects values over the limit with 413', async () => {
  await expectHttpError(Promise.resolve().then(() => requireString('x'.repeat(11), 'text', 10)), 413);
});

test('handleRouteError keeps the status of an HttpError', async () => {
  const response = handleRouteError(new HttpError(400, 'bad request'), 'test');
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'bad request' });
});

test('handleRouteError turns an unknown error into a 500', async () => {
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    const response = handleRouteError(new Error('boom'), 'test');
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
      error: 'An unexpected error occurred during test.',
      details: 'boom',
    });
  } finally {
    console.error = originalConsoleError;
  }
});
