export const isSupabaseServiceRoleKey = (key: string): boolean => {
  const normalizedKey = key.trim();
  if (normalizedKey.startsWith('sb_secret_')) return true;

  const payload = normalizedKey.split('.')[1];
  if (!payload) return false;

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const claims = JSON.parse(atob(paddedBase64)) as { role?: string };
    return claims.role === 'service_role';
  } catch {
    return false;
  }
};
