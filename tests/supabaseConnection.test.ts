import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createConfiguredSupabaseClient,
  resolveSupabaseConfiguration,
} from '../src/lib/supabaseConfig.ts';
import { classifyAuthError } from '../src/lib/supabaseAuthErrors.ts';

const publicKey = 'sb_publishable_test_key_for_local_checks';

test('Supabase config accepts a well-formed HTTPS endpoint and public key', () => {
  const result = resolveSupabaseConfiguration(' https://example.supabase.co/ ', ` ${publicKey} `);

  assert.equal(result.issue, null);
  assert.equal(result.config?.url, 'https://example.supabase.co');
  assert.equal(result.projectHost, 'example.supabase.co');
  assert.equal(result.publicKeyType, 'publishable');
});

test('Supabase config reports missing URL and public key separately', () => {
  assert.equal(resolveSupabaseConfiguration('', publicKey).issue, 'missing_url');
  assert.equal(resolveSupabaseConfiguration('https://example.supabase.co', '').issue, 'missing_public_key');
});

test('Supabase config rejects malformed URLs before URL normalization', () => {
  for (const malformedUrl of [
    'https//example.supabase.co',
    'https://example.supabase.co\\extra',
    'https://example .supabase.co',
    'https://example.supabase.co?unexpected=1',
    'https://example.supabase.co#fragment',
  ]) {
    assert.equal(resolveSupabaseConfiguration(malformedUrl, publicKey).issue, 'invalid_url');
  }
});

test('Supabase config only allows HTTP for localhost', () => {
  assert.equal(resolveSupabaseConfiguration('http://example.supabase.co', publicKey).issue, 'invalid_protocol');
  assert.equal(resolveSupabaseConfiguration('http://localhost:54321', publicKey).issue, null);
});

test('Supabase client initializes from valid config and remains null when config is absent', () => {
  const config = resolveSupabaseConfiguration('https://example.supabase.co', publicKey).config;
  const client = createConfiguredSupabaseClient(config);

  assert.ok(client);
  assert.equal(typeof client.auth.signInWithPassword, 'function');
  assert.equal(createConfiguredSupabaseClient(null), null);
});

test('network failures are not classified as bad credentials or HTTP errors', () => {
  assert.equal(classifyAuthError(new TypeError('Failed to fetch')), 'network');
  assert.equal(
    classifyAuthError({ name: 'AuthRetryableFetchError', message: 'Failed to fetch', status: 0 }),
    'network',
  );
  assert.equal(
    classifyAuthError({ name: 'AuthRetryableFetchError', message: 'Service unavailable', status: 503 }),
    'service_unavailable',
  );
});

test('timeouts and HTTP responses have distinct categories', () => {
  assert.equal(classifyAuthError({ name: 'AbortError', message: 'The operation was aborted' }), 'timeout');
  assert.equal(classifyAuthError({ status: 504, message: 'Gateway timeout' }), 'timeout');
  assert.equal(classifyAuthError({ status: 503, message: 'Service unavailable' }), 'service_unavailable');
  assert.equal(classifyAuthError({ status: 404, message: 'Not found' }), 'http_error');
});

test('invalid credentials take precedence over HTTP 401 and are not called a network failure', () => {
  assert.equal(
    classifyAuthError({
      name: 'AuthApiError',
      status: 401,
      code: 'invalid_credentials',
      message: 'Invalid login credentials',
    }),
    'invalid_credentials',
  );
  assert.equal(
    classifyAuthError({ status: 401, message: 'Invalid login credentials' }),
    'invalid_credentials',
  );
  assert.equal(
    classifyAuthError({ status: 401, code: 'invalid_api_key', message: 'Invalid API key' }),
    'invalid_api_key',
  );
});
