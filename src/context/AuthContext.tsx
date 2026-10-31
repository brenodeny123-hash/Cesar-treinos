import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  getSupabaseClient,
  supabase,
  supabaseRuntimeDiagnostics,
} from '../lib/supabase.ts';
import {
  classifyAuthError,
  getAuthErrorDetails,
} from '../lib/supabaseAuthErrors.ts';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student' | 'coach';
}

type AuthResult = { success: boolean; error?: string; message?: string };
type AuthAction = 'login' | 'register' | 'reset' | 'logout';
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
  const { code, combined } = getAuthErrorDetails(error);

  switch (classifyAuthError(error)) {
    case 'configuration':
      return 'O acesso ao Supabase não está configurado corretamente. Confira as variáveis de ambiente do projeto e faça um novo deploy.';
    case 'invalid_api_key':
      return 'O Supabase recusou a chave pública ou o token. Confira VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis do deploy.';
    case 'domain_not_allowed':
      return 'O endereço de redirecionamento não está autorizado. Confira Authentication > URL Configuration no painel do Supabase.';
    case 'provider_disabled':
      return 'O login por e-mail está desativado. Habilite Email provider em Authentication > Sign In / Providers no Supabase.';
    case 'email_not_confirmed':
      return 'Seu e-mail ainda não foi confirmado. Confira sua caixa de entrada e confirme o cadastro.';
    case 'user_not_found':
      return 'Não foi possível encontrar essa conta. Confira o e-mail ou faça seu cadastro.';
    case 'profile_missing':
      return 'Sua conta foi autenticada, mas o perfil não foi encontrado. Confira o cadastro do perfil e as políticas RLS da tabela profiles.';
    case 'invalid_credentials':
      return 'E-mail ou senha incorretos. O Supabase pode usar a mesma resposta para usuário inexistente e senha incorreta.';
    case 'rate_limited':
      return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente.';
    case 'permission_denied':
      return 'A autenticação ou o acesso ao perfil foi recusado. Confira a sessão e as políticas RLS da tabela profiles.';
    case 'authentication':
      return 'O Supabase recusou a autenticação. Confira os dados da conta e tente novamente.';
    case 'http_error':
      if (action === 'register' && getAuthErrorDetails(error).status === 422) {
        return 'O Supabase recusou os dados do cadastro (HTTP 422). Confira o formato do e-mail, os requisitos da senha e se esse e-mail j\u00e1 possui uma conta.';
      }
      return `O Supabase respondeu com HTTP ${getAuthErrorDetails(error).status ?? '4xx'}. Confira o endpoint e tente novamente.`;
    case 'service_unavailable':
      return 'O serviço Supabase está temporariamente indisponível. Tente novamente mais tarde.';
    case 'timeout':
      return 'A conexão com o Supabase excedeu o tempo limite. Verifique a rede e tente novamente.';
    case 'network':
      return 'N\u00e3o foi poss\u00edvel concluir a conex\u00e3o com o Supabase. Verifique o acesso \u00e0 internet e tente novamente. O navegador n\u00e3o identifica com seguran\u00e7a se a causa foi DNS, VPN, proxy ou firewall.';
    case 'other':
      if (['user_already_exists', 'email_exists'].includes(code) || combined.includes('already registered')) {
        return 'Este e-mail já está cadastrado. Tente entrar ou recuperar sua senha.';
      }
      if (code === 'weak_password' || combined.includes('password should be') || combined.includes('password is too weak')) {
        return 'A senha não atende aos requisitos do Supabase. Tente uma senha mais longa e forte.';
      }
      if (['invalid_email', 'email_address_invalid'].includes(code) || combined.includes('email address is invalid')) {
        return 'Confira o formato do e-mail informado.';
      }
      if (action === 'reset') {
        return 'Não foi possível enviar o e-mail de recuperação. Confira o endereço e tente novamente.';
      }
      if (action === 'register') {
        return 'Não foi possível criar a conta. Verifique os dados e tente novamente.';
      }
      return 'Não foi possível entrar. Verifique os dados e tente novamente.';
  }
};

const logAuthFailure = (action: AuthAction, error: unknown): void => {
  const { details, code, status } = getAuthErrorDetails(error);
  const safeCode = /^[a-z0-9_-]{1,80}$/i.test(code) ? code : 'unknown';
  const safeName =
    details.name && /^[a-z0-9_$.-]{1,80}$/i.test(details.name) ? details.name : 'unknown';

  console.warn('[Cesar Treinos auth] request failed', {
    action,
    category: classifyAuthError(error),
    code: safeCode,
    httpStatus: status ?? null,
    applicationOrigin: typeof window === 'undefined' ? 'unknown' : window.location.origin,
    errorName: safeName,
    ...supabaseRuntimeDiagnostics,
  });
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
    displayName: profile.full_name || authUser.user_metadata.full_name || authUser.email?.split('@')[0] || 'Aluno Cesar Treinos',
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
          logAuthFailure('login', error);
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
      logAuthFailure('login', error);
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
      logAuthFailure('register', error);
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
      logAuthFailure('logout', error);
      const message = mapAuthError(error, 'logout');
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
      logAuthFailure('reset', error);
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
