import assert from 'node:assert/strict';
import { test } from 'node:test';

import entrolytics from './index.ts';

const websiteId = '6f1c7c8e-5d3b-4f5a-9d1e-2b6f0c9a7e41';
const clientKey = 'cw_test_client_key';

/** Runs the integration's setup hook and returns the scripts it injects. */
function injectedScripts(options: Parameters<typeof entrolytics>[0]): string[] {
  const injected: string[] = [];
  const setup = entrolytics(options).hooks['astro:config:setup'];
  const hookOptions = {
    injectScript: (_stage: string, content: string) => {
      injected.push(content);
    },
  };
  // The hook only calls injectScript of the options Astro passes it.
  void setup?.(hookOptions as unknown as Parameters<NonNullable<typeof setup>>[0]);
  return injected;
}

test('the integration requires a client key', () => {
  assert.throws(() => entrolytics({ websiteId }), /clientKey is required/);
});

test('the injected tracker script carries the website id and the client key', () => {
  const scriptTag = injectedScripts({
    clientKey,
    host: 'https://api.example.test/',
    websiteId,
  }).find(script => script.includes('/script.js'));

  assert.ok(scriptTag, 'no tracker script tag was injected');
  assert.ok(scriptTag.includes('src="https://api.example.test/script.js"'), scriptTag);
  assert.ok(scriptTag.includes(`data-website-id="${websiteId}"`), scriptTag);
  assert.ok(scriptTag.includes(`data-client-key="${clientKey}"`), scriptTag);
});
