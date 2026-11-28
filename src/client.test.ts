import assert from 'node:assert/strict';
import { test } from 'node:test';

import * as client from './client.ts';

test('the SDK-side Web Vitals sender is gone', () => {
  assert.equal('trackVital' in client, false);
  assert.equal('initWebVitals' in client, false);
});
