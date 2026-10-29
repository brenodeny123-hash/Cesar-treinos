import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const config = (() => {
  if (!url || !anonKey) return null;

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
    throw new Error('Configuração do Supabase incompleta. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
};

export const supabaseService = {
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!supabase) {
      return { success: false, message: 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para testar a conexão.' };
    }

    try {
      const { error } = await supabase.from('students').select('id').limit(1);
      if (error) {
        return { success: false, message: `Erro ao conectar: ${error.message}` };
      }
      return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Falha na conexão.';
      return { success: false, message };
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
