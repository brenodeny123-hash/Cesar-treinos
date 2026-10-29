import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient, supabase } from '../lib/supabase.ts';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student' | 'coach';
}

type AuthResult = { success: boolean; error?: string; message?: string };
type AuthAction = 'login' | 'register' | 'reset';
type AuthErrorLike = { code?: string; message?: string; name?: string; status?: number };

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  authError: string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<AuthResult>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  loginDemoUser: (role: 'student' | 'coach') => void;
}

export const DEMO_ALLOWED = import.meta.env.DEV || import.meta.env.VITE_ALLOW_DEMO === 'true';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapAuthError = (error: unknown, action: AuthAction): string => {
  const details = error && typeof error === 'object' ? (error as AuthErrorLike) : {};
  const code = details.code?.toLowerCase() ?? '';
  const message = details.message?.toLowerCase() ?? '';
  const combined = `${code} ${message}`;

  if (
    (combined.includes('supabase') &&
      (combined.includes('configuração') || combined.includes('configure'))) ||
    combined.includes('service_role') ||
    combined.includes('sb_secret_')
  ) {
    return 'O acesso ao Supabase não está configurado corretamente. Confira as variáveis de ambiente do projeto.';
  }
  if (
    combined.includes('pgrst116') ||
    combined.includes('multiple (or no) rows returned') ||
    combined.includes('perfil ausente')
  ) {
    return 'Sua conta foi autenticada, mas o perfil não foi encontrado. Confira o cadastro do perfil e as políticas RLS do Supabase.';
  }
  if (
    combined.includes('redirect_to_not_allowed') ||
    combined.includes('redirect url not allowed') ||
    (combined.includes('redirect url') && combined.includes('not allowed')) ||
    combined.includes('email_redirect_to') ||
    combined.includes('not allowed uri')
  ) {
    return 'O endereço de redirecionamento não está autorizado no Supabase. Confira as URLs permitidas nas configurações de autenticação.';
  }
  if (
    combined.includes('signup_disabled') ||
    combined.includes('signups not allowed') ||
    combined.includes('email_provider_disabled') ||
    combined.includes('provider is disabled')
  ) {
    return 'Este método de autenticação está desativado no Supabase. Habilite o provedor de e-mail nas configurações de autenticação.';
  }
  if (combined.includes('email_not_confirmed') || combined.includes('email not confirmed')) {
    return 'Seu e-mail ainda não foi confirmado. Confira sua caixa de entrada e confirme o cadastro.';
  }
  if (
    combined.includes('invalid_credentials') ||
    combined.includes('invalid login credentials') ||
    combined.includes('wrong password')
  ) {
    return 'E-mail ou senha incorretos.';
  }
  if (combined.includes('user_already_exists') || combined.includes('already registered')) {
    return 'Este e-mail já está cadastrado. Tente entrar ou recuperar sua senha.';
  }
  if (combined.includes('weak_password') || combined.includes('password should be')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (combined.includes('invalid_email') || combined.includes('email address is invalid')) {
    return 'Confira o formato do e-mail informado.';
  }
  if (
    details.status === 429 ||
    combined.includes('too many requests') ||
    combined.includes('rate limit') ||
    combined.includes('over_request_rate_limit')
  ) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente.';
  }
  if (details.status === 401 || details.status === 403 || combined.includes('42501')) {
    return 'A autenticação foi recusada por falta de permissão. Confira a sessão e as políticas de acesso do Supabase.';
  }
  if (details.status !== undefined && details.status >= 500) {
    return 'O serviço de autenticação está temporariamente indisponível. Tente novamente mais tarde.';
  }
  if (
    combined.includes('failed to fetch') ||
    combined.includes('fetch failed') ||
    combined.includes('networkerror') ||
    combined.includes('network request failed') ||
    (details.name === 'TypeError' && combined.includes('load failed'))
  ) {
    return 'Falha de conexão. Verifique sua internet e tente novamente.';
  }
  if (action === 'reset') {
    return 'Não foi possível enviar o e-mail de recuperação. Tente novamente.';
  }
  if (action === 'register') {
    return 'Não foi possível criar a conta. Verifique os dados e tente novamente.';
  }
  return 'Não foi possível entrar. Verifique seus dados e tente novamente.';
};

const mapAuthenticatedUser = async (authUser: User): Promise<AppUser> => {
  const { data: profile, error } = await getSupabaseClient()
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', authUser.id)
    .single();

  if (error) throw error;
  if (!profile) {
    throw new Error('Perfil ausente para o usuário autenticado. Verifique o trigger de cadastro e as políticas RLS da tabela profiles.');
  }

  const role = profile.role === 'coach' || profile.role === 'admin' ? 'coach' : 'student';
  return {
    uid: authUser.id,
    email: authUser.email ?? '',
    displayName: profile.full_name || authUser.user_metadata.full_name || authUser.email?.split('@')[0] || 'Aluno PulseFit',
    photoURL: profile.avatar_url || undefined,
    role,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setAuthError(null);
        setIsAuthModalOpen(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      void Promise.resolve()
        .then(() => mapAuthenticatedUser(session.user))
        .then((mappedUser) => {
          setUser(mappedUser);
          setAuthError(null);
          setIsAuthModalOpen(false);
        })
        .catch((error: unknown) => {
          console.error('Não foi possível carregar o perfil do usuário no Supabase.', error);
          setUser(null);
          setAuthError(mapAuthError(error, 'login'));
          setIsAuthModalOpen(true);
        })
        .finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loginWithEmail = async (email: string, pass: string): Promise<AuthResult> => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      if (!data.user) throw new Error('O Supabase não retornou o usuário autenticado.');

      const mappedUser = await mapAuthenticatedUser(data.user);
      setUser(mappedUser);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (error: unknown) {
      const message = mapAuthError(error, 'login');
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string): Promise<AuthResult> => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await getSupabaseClient().auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: name } },
      });
      if (error) throw error;
      if (!data.user) throw new Error('O Supabase não retornou o usuário criado.');

      if (data.session) {
        setUser(await mapAuthenticatedUser(data.user));
        setIsAuthModalOpen(false);
        return { success: true };
      }

      return {
        success: true,
        message: 'Conta criada. Confirme seu e-mail pelo link enviado antes de entrar.',
      };
    } catch (error: unknown) {
      const message = mapAuthError(error, 'register');
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setAuthError(null);
    try {
      const { error } = await getSupabaseClient().auth.signOut();
      if (error) throw error;
    } catch (error: unknown) {
      const message = mapAuthError(error, 'login');
      setAuthError(message);
      setIsAuthModalOpen(true);
      console.error('Não foi possível encerrar a sessão do Supabase.', error);
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    setAuthError(null);
    try {
      const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (error: unknown) {
      const message = mapAuthError(error, 'reset');
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const loginDemoUser = (role: 'student' | 'coach') => {
    if (!DEMO_ALLOWED) return;
    setAuthError(null);
    if (role === 'coach') {
      setUser({
        uid: 'demo-coach-cesar',
        email: 'cesar@pulsefit.com',
        displayName: 'Prof. Cesar Treinos',
        role: 'coach',
      });
    } else {
      setUser({
        uid: 'demo-student-lucas',
        email: 'lucas.silva@pulsefit.com',
        displayName: 'Lucas Silva',
        role: 'student',
      });
    }
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        authError,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithEmail,
        registerWithEmail,
        logout,
        resetPassword,
        loginDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
