import createSubscription from './createSubscription.js';
import type { MercureOptions } from '../types.js';

let urls: string[] = [];

function FakeEventSource(url: string) {
  urls.push(url);

  return { addEventListener: () => {} };
}

const options = (protocolVersion?: MercureOptions['protocolVersion']) => ({
  hub: 'https://example.com/.well-known/mercure',
  jwt: null,
  topicUrl: new URL('https://example.com/api'),
  ...(protocolVersion ? { protocolVersion } : {}),
});

beforeEach(() => {
  urls = [];
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
