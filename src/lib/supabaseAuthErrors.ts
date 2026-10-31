export type AuthErrorCategory =
  | 'configuration'
  | 'invalid_api_key'
  | 'domain_not_allowed'
  | 'provider_disabled'
  | 'email_not_confirmed'
  | 'user_not_found'
  | 'profile_missing'
  | 'invalid_credentials'
  | 'rate_limited'
  | 'permission_denied'
  | 'authentication'
  | 'http_error'
  | 'service_unavailable'
  | 'timeout'
  | 'network'
  | 'other';

export interface AuthErrorLike {
  code?: string;
  message?: string;
  name?: string;
  status?: number;
  statusCode?: number;
}

export const getAuthErrorDetails = (error: unknown) => {
  const details = error && typeof error === 'object' ? (error as AuthErrorLike) : {};
  const code = details.code?.toLowerCase() ?? '';
  const message = details.message?.toLowerCase() ?? '';
  const combined = `${code} ${message}`;
  const status = Number.isInteger(details.status)
    ? details.status
    : Number.isInteger(details.statusCode)
      ? details.statusCode
      : undefined;

  return { details, code, combined, status };
};

export const classifyAuthError = (error: unknown): AuthErrorCategory => {
  const { details, code, combined, status } = getAuthErrorDetails(error);

  if (
    combined.includes('vite_supabase_') ||
    (combined.includes('supabase') &&
      (combined.includes('configuração') ||
        combined.includes('configure') ||
        combined.includes('url válida') ||
        combined.includes('incompleta'))) ||
    combined.includes('service_role') ||
    combined.includes('sb_secret_')
  ) {
    return 'configuration';
  }

  // Auth failures can also carry HTTP 401. Check the auth error code/message
  // before interpreting the status as an API key or transport problem.
  if (
    code === 'invalid_credentials' ||
    combined.includes('invalid login credentials') ||
    combined.includes('wrong password')
  ) {
    return 'invalid_credentials';
  }
  if (
    ['invalid_api_key', 'no_api_key', 'bad_jwt', 'pgrst301'].includes(code) ||
    combined.includes('invalid api key') ||
    combined.includes('api key not valid')
  ) {
    return 'invalid_api_key';
  }
  if (
    (code.includes('redirect') && (code.includes('not_allowed') || code.includes('invalid'))) ||
    combined.includes('redirect url not allowed') ||
    (combined.includes('redirect url') && combined.includes('not allowed')) ||
    combined.includes('email_redirect_to') ||
    combined.includes('not allowed uri')
  ) {
    return 'domain_not_allowed';
  }
  if (
    [
      'provider_disabled',
      'email_provider_disabled',
      'signup_disabled',
      'operation_not_allowed',
      'unsupported_provider',
    ].includes(code) ||
    combined.includes('signups not allowed') ||
    combined.includes('provider is disabled')
  ) {
    return 'provider_disabled';
  }
  if (code.includes('email_not_confirmed') || combined.includes('email not confirmed')) {
    return 'email_not_confirmed';
  }
  if (
    code === 'user_not_found' ||
    code === 'user_not_exists' ||
    combined.includes('user not found')
  ) {
    return 'user_not_found';
  }
  // Supabase Auth commonly returns HTTP 422 for signup input errors. Keep
  // recognized validation errors out of the generic HTTP status branch so
  // the action-specific messages below can explain what the user can fix.
  if (
    [
      'user_already_exists',
      'email_exists',
      'invalid_email',
      'email_address_invalid',
      'weak_password',
      'validation_failed',
    ].includes(code) ||
    combined.includes('already registered') ||
    combined.includes('email address is invalid') ||
    combined.includes('password should be') ||
    combined.includes('password is too weak')
  ) {
    return 'other';
  }
  if (
    status === 429 ||
    combined.includes('too many requests') ||
    combined.includes('rate limit') ||
    combined.includes('over_request_rate_limit')
  ) {
    return 'rate_limited';
  }
  if (
    status === 403 ||
    code === '42501' ||
    code === 'insufficient_permissions' ||
    combined.includes('row-level security')
  ) {
    return 'permission_denied';
  }
  if (
    details.name === 'AbortError' ||
    details.name === 'TimeoutError' ||
    code.includes('timeout') ||
    code === 'etimedout' ||
    status === 408 ||
    status === 504 ||
    combined.includes('timed out') ||
    combined.includes('timeout') ||
    combined.includes('request_timeout')
  ) {
    return 'timeout';
  }
  if (status !== undefined && status >= 500) return 'service_unavailable';
  if (
    status === 0 ||
    combined.includes('failed to fetch') ||
    combined.includes('fetch failed') ||
    combined.includes('networkerror') ||
    combined.includes('network request failed') ||
    combined.includes('load failed') ||
    (details.name === 'AuthRetryableFetchError' && status === undefined) ||
    (details.name === 'TypeError' && status === undefined)
  ) {
    return 'network';
  }
  if (status === 401) return 'authentication';
  if (status !== undefined && status >= 400) return 'http_error';

  if (
    code === 'pgrst116' ||
    combined.includes('multiple (or no) rows returned') ||
    combined.includes('perfil ausente')
  ) {
    return 'profile_missing';
  }

  return 'other';
};
