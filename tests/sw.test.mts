import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const swSource = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const registerSource = readFileSync(
  new URL('../src/components/ServiceWorkerRegister.tsx', import.meta.url),
  'utf8'
);

type FetchListener = (event: {
  request: Record<string, unknown>;
  waitUntil: (promise: Promise<unknown>) => void;
  respondWith: (promise: Promise<Response>) => void;
}) => void;

function loadServiceWorker() {
  const listeners: Record<string, FetchListener> = {};
  const cached = new Map<string, Response>();

  const sandbox = {
    self: {
      location: { origin: 'https://example.com' },
      addEventListener: (type: string, handler: FetchListener) => {
        listeners[type] = handler;
      },
      skipWaiting: async () => {},
      clients: { claim: async () => {} },
    },
    caches: {
      open: async () => ({
        put: async (request: { url: string }, response: Response) => {
          cached.set(request.url, response);
        },
      }),
      keys: async () => [],
      match: async (request: { url: string }) => cached.get(request.url),
      delete: async () => true,
    },
    fetch: async () => new Response('ok', { status: 200 }),
    URL,
    Response,
    Promise,
    console,
  };

  vm.runInNewContext(swSource, sandbox);
  return { listeners, cached };
}

function dispatch(
  listener: FetchListener,
  request: Record<string, unknown>
): { response: Promise<Response>; waitUntil: Promise<unknown>[] } {
  const waitUntil: Promise<unknown>[] = [];
  let response: Promise<Response> | undefined;
  listener({
    request,
    waitUntil: (promise) => waitUntil.push(promise),
    respondWith: (promise) => {
      response = promise;
    },
  });
  assert.ok(response, 'the fetch handler should call respondWith');
  return { response, waitUntil };
}

test('service worker keeps navigation cache writes alive', async () => {
  const { listeners } = loadServiceWorker();
  const { response, waitUntil } = dispatch(listeners.fetch, {
    method: 'GET',
    mode: 'navigate',
    url: 'https://example.com/',
  });

  await response;
  assert.equal(waitUntil.length, 1, 'cache write should be passed to waitUntil');
  await Promise.all(waitUntil);
});

test('service worker keeps stale-while-revalidate fetches alive', async () => {
  const { listeners } = loadServiceWorker();
  const { response, waitUntil } = dispatch(listeners.fetch, {
    method: 'GET',
    mode: 'same-origin',
    url: 'https://example.com/icon_calculator.png',
  });

  await response;
  assert.equal(waitUntil.length, 1, 'revalidation should be passed to waitUntil');
  await Promise.all(waitUntil);
});

test('service worker ignores API routes', () => {
  const { listeners } = loadServiceWorker();
  let responded = false;

  listeners.fetch({
    request: {
      method: 'GET',
      mode: 'same-origin',
      url: 'https://example.com/api/tokenize/openai',
    },
    waitUntil: () => {},
    respondWith: () => {
      responded = true;
    },
  });

  assert.equal(responded, false);
});

test('service worker registration only reloads when an update takes control', () => {
  assert.match(registerSource, /hadController/);
  assert.match(registerSource, /if \(hadController && !refreshing\)/);
});
