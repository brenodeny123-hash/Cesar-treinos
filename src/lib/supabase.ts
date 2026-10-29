import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseServiceRoleKey } from './supabaseKey.ts';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const hasPrivilegedKey = Boolean(anonKey && isSupabaseServiceRoleKey(anonKey));

if (import.meta.env.PROD && (!url || !anonKey)) {
  console.warn(
    'Supabase não configurado neste deploy. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente da Vercel e faça um novo deploy.',
  );
}
if (hasPrivilegedKey) {
  console.error('Uma chave privilegiada foi configurada como VITE_SUPABASE_ANON_KEY e não será usada no navegador.');
}

const config = (() => {
  if (!url || !anonKey || hasPrivilegedKey) return null;

  try {
    const parsedUrl = new URL(url);
    if (
      parsedUrl.protocol !== 'https:' &&
      !(parsedUrl.protocol === 'http:' && parsedUrl.hostname === 'localhost')
    ) return null;
    return { url, anonKey };
  } catch {
    return null;
  }
})();

export const isSupabaseConfigured = config !== null;
export const supabase: SupabaseClient | null = config
  ? createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    if (hasPrivilegedKey) {
      throw new Error('VITE_SUPABASE_ANON_KEY não pode conter uma chave service_role ou secret. Use somente uma chave pública.');
    }
    throw new Error('Configuração do Supabase incompleta. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
};

export const supabaseService = {
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!config) {
      if (hasPrivilegedKey) {
        return { success: false, message: 'A chave configurada é privilegiada. Use somente uma chave pública do Supabase no navegador.' };
      }
      return { success: false, message: 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para testar a conexão.' };
    }

    try {
      const response = await fetch(new URL('/auth/v1/health', config.url), {
        headers: { apikey: config.anonKey },
        signal: AbortSignal.timeout(10_000),
      });

      if (response.ok) {
        return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
      }

      if (response.status === 401 || response.status === 403) {
        return { success: false, message: 'O Supabase recusou a chave pública configurada. Confira VITE_SUPABASE_ANON_KEY.' };
      }
      if (response.status === 404) {
        return { success: false, message: 'Projeto ou endpoint do Supabase não encontrado. Confira VITE_SUPABASE_URL.' };
      }
      return { success: false, message: `O Supabase respondeu com HTTP ${response.status}. Verifique a disponibilidade do projeto.` };
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        return { success: false, message: 'Tempo limite ao conectar ao Supabase. Verifique a rede e tente novamente.' };
      }
      if (error instanceof TypeError) {
        return { success: false, message: 'Falha de rede ao conectar ao Supabase. Verifique a internet e a URL configurada.' };
      }
      if (error instanceof Error) throw error;
      throw new Error('Falha inesperada ao testar a conexão com o Supabase.', { cause: error });
    }
  },

  async fetchStudents() {
    const { data, error } = await getSupabaseClient()
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async insertStudent(student: Record<string, unknown>) {
    const { data, error } = await getSupabaseClient().from('students').insert([student]).select();
    if (error) throw error;
    return data;
  },

  async fetchRoutines() {
    const { data, error } = await getSupabaseClient()
      .from('workout_routines')
      .select('*, exercises(*)')
      .order('code');
    if (error) throw error;
    return data;
  },
};
