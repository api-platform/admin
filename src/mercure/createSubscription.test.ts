import createSubscription from './createSubscription.js';
import type { MercureOptions } from '../types.js';

let urls: string[] = [];
let inits: (EventSourceInit | undefined)[] = [];

function FakeEventSource(url: string, init?: EventSourceInit) {
  urls.push(url);
  inits.push(init);

  return { addEventListener: () => {} };
}

const options = (protocolVersion?: MercureOptions['protocolVersion']) => ({
  hub: 'https://example.com/.well-known/mercure',
  topicUrl: new URL('https://example.com/api'),
  ...(protocolVersion ? { protocolVersion } : {}),
});

beforeEach(() => {
  urls = [];
  inits = [];
  global.EventSource = FakeEventSource as unknown as typeof EventSource;
});

test('Subscribe with the Mercure 1.0 match parameter by default', () => {
  createSubscription(options(), '/api/books/1', () => {});

  expect(urls).toEqual([
    'https://example.com/.well-known/mercure?match=https%3A%2F%2Fexample.com%2Fapi%2Fbooks%2F1',
  ]);
});

test('Subscribe with the topic parameter of the Mercure 0.x protocol', () => {
  createSubscription(options('0.x'), '/api/books/1', () => {});

  expect(urls).toEqual([
    'https://example.com/.well-known/mercure?topic=https%3A%2F%2Fexample.com%2Fapi%2Fbooks%2F1',
  ]);
});

test('Leave the authorization cookie to the server', () => {
  createSubscription(
    { ...options(), withCredentials: true },
    '/api/books/1',
    () => {},
  );

  expect(inits).toEqual([{ withCredentials: true }]);
  expect(document.cookie).toBe('');
});
