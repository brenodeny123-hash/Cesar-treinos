import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get credentials from Vite environment variables or localStorage custom configuration
const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('pulsefit_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('pulsefit_supabase_key') : null;

  const url = storedUrl || envUrl || 'https://demo-pulsefit.supabase.co';
  const key = storedKey || envKey || 'demo-anon-key-placeholder';

  const isConfigured = Boolean(
    (storedUrl && storedKey) ||
    (envUrl && envKey && !envUrl.includes('your-project-id') && !envUrl.includes('demo-pulsefit'))
  );

  return { url, key, isConfigured };
};

const config = getSupabaseConfig();

export const isSupabaseConfigured = config.isConfigured;

export const supabase: SupabaseClient = createClient(config.url, config.key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper to update credentials dynamically from the UI
export const updateSupabaseCredentials = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pulsefit_supabase_url', url.trim());
    localStorage.setItem('pulsefit_supabase_key', key.trim());
    window.location.reload();
  }
};

// Helper to clear stored credentials
export const clearSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pulsefit_supabase_url');
    localStorage.removeItem('pulsefit_supabase_key');
    window.location.reload();
  }
};

// Service methods for syncing students and workouts with Supabase
export const supabaseService = {
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.from('students').select('id').limit(1);
      if (error) {
        return { success: false, message: `Erro ao conectar: ${error.message}` };
      }
      return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
    } catch (err: unknown) {
      return { success: false, message: (err as Error)?.message || 'Falha na conexão.' };
    }
  },

  async fetchStudents() {
    const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async insertStudent(student: Record<string, unknown>) {
    const { data, error } = await supabase.from('students').insert([student]).select();
    if (error) throw error;
    return data;
  },

  async fetchRoutines() {
    const { data, error } = await supabase.from('workout_routines').select('*, exercises(*)').order('code');
    if (error) throw error;
    return data;
  },
};
