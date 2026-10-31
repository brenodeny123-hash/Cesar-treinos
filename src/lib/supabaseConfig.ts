import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseServiceRoleKey } from './supabaseKey.ts';

export type SupabaseConfigurationIssue =
  | 'missing_url'
  | 'missing_public_key'
  | 'privileged_key'
  | 'invalid_url'
  | 'invalid_protocol';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface SupabaseConfiguration {
  config: SupabaseConfig | null;
  issue: SupabaseConfigurationIssue | null;
  projectHost: string | null;
  publicKeyType: 'missing' | 'privileged' | 'publishable' | 'legacy_jwt' | 'unrecognized';
}

export const resolveSupabaseConfiguration = (
  rawUrl?: string,
  rawPublicKey?: string,
): SupabaseConfiguration => {
  const url = rawUrl?.trim() ?? '';
  const anonKey = rawPublicKey?.trim() ?? '';
  const hasPrivilegedKey = Boolean(anonKey && isSupabaseServiceRoleKey(anonKey));
  const publicKeyType = !anonKey
    ? 'missing'
    : hasPrivilegedKey
      ? 'privileged'
      : anonKey.startsWith('sb_publishable_')
        ? 'publishable'
        : anonKey.split('.').length === 3
          ? 'legacy_jwt'
          : 'unrecognized';

  const result = (
    config: SupabaseConfig | null,
    issue: SupabaseConfigurationIssue | null,
    projectHost: string | null = null,
  ): SupabaseConfiguration => ({ config, issue, projectHost, publicKeyType });

  if (!url) return result(null, 'missing_url');
  if (!anonKey) return result(null, 'missing_public_key');
  if (hasPrivilegedKey) return result(null, 'privileged_key');

  // URL() normalizes backslashes and whitespace. Reject them before parsing so
  // malformed env values cannot silently turn into a different endpoint.
  if (/[\\\s]/.test(url)) return result(null, 'invalid_url');

  try {
    const parsedUrl = new URL(url);
    if (
      !parsedUrl.hostname ||
      parsedUrl.username ||
      parsedUrl.password ||
      parsedUrl.search ||
      parsedUrl.hash
    ) {
      return result(null, 'invalid_url');
    }
    if (
      parsedUrl.protocol !== 'https:' &&
      !(parsedUrl.protocol === 'http:' && parsedUrl.hostname === 'localhost')
    ) {
      return result(null, 'invalid_protocol');
    }

    const normalizedUrl = parsedUrl.toString().replace(/\/+$/, '');
    return result({ url: normalizedUrl, anonKey }, null, parsedUrl.host);
  } catch {
    return result(null, 'invalid_url');
  }
};

export const createConfiguredSupabaseClient = (
  config: SupabaseConfig | null,
): SupabaseClient | null =>
  config
    ? createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;
