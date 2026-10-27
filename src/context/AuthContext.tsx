import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
} from '../lib/firebase.ts';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student' | 'coach';
}

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  loginDemoUser: (role: 'student' | 'coach') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to null so login screen appears if user has not logged in!
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('pulsefit_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  // Show auth modal on startup if user is not logged in!
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pulsefit_auth_user');
      return !saved;
    } catch {
      return true;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('pulsefit_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pulsefit_auth_user');
    }
  }, [user]);

  // Listen to Firebase Auth state
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: User | null) => {
        if (!fbUser) {
          setUser(null);
          setIsAuthModalOpen(true);
          return;
        }

        const mappedUser: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email || 'usuario@pulsefit.com',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Aluno PulseFit',
          photoURL: fbUser.photoURL || undefined,
          role: fbUser.email?.includes('cesar') ? 'coach' : 'student',
        };
        setUser(mappedUser);
        setIsAuthModalOpen(false);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase onAuthStateChanged error', e);
    }
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const mappedUser: AppUser = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: cred.user.displayName || email.split('@')[0],
        role: email.includes('cesar') ? 'coach' : 'student',
      };
      setUser(mappedUser);
      setIsAuthModalOpen(false);
      setLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setLoading(false);
      const errorMsg = (err as { code?: string; message?: string })?.message || 'Falha ao autenticar.';
      if (errorMsg.includes('invalid-credential') || errorMsg.includes('wrong-password') || errorMsg.includes('user-not-found')) {
        return { success: false, error: 'E-mail ou senha incorretos.' };
      }
      if (errorMsg.includes('invalid-email')) {
        return { success: false, error: 'E-mail em formato inválido.' };
      }
      return { success: false, error: 'Não foi possível entrar. Verifique seus dados e tente novamente.' };
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      try {
        await updateProfile(cred.user, { displayName: name });
      } catch (profileError) {
        // The account is already created; a profile update failure should not report signup as failed.
        console.warn('Profile name update warning:', profileError);
      }
      const mappedUser: AppUser = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: name,
        role: 'student',
      };
      setUser(mappedUser);
      setIsAuthModalOpen(false);
      setLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setLoading(false);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') {
        return { success: false, error: 'Este e-mail já está cadastrado. Tente entrar ou recuperar sua senha.' };
      }
      if (code === 'auth/weak-password') {
        return { success: false, error: 'A senha deve ter no mínimo 6 caracteres.' };
      }
      if (code === 'auth/invalid-email') {
        return { success: false, error: 'Confira o formato do e-mail informado.' };
      }
      if (code === 'auth/operation-not-allowed') {
        return { success: false, error: 'O cadastro por e-mail está desativado no Firebase. Ative o provedor E-mail/senha nas configurações de autenticação do projeto.' };
      }
      if (code === 'auth/network-request-failed') {
        return { success: false, error: 'Falha de conexão. Verifique sua internet e tente novamente.' };
      }
      return { success: false, error: 'Não foi possível criar a conta. Verifique os dados e tente novamente.' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const mappedUser: AppUser = {
        uid: result.user.uid,
        email: result.user.email || 'google_user@pulsefit.com',
        displayName: result.user.displayName || 'Aluno Google',
        photoURL: result.user.photoURL || undefined,
        role: 'student',
      };
      setUser(mappedUser);
      setIsAuthModalOpen(false);
      setLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setLoading(false);
      console.warn('Google sign-in error:', err);
      return { success: false, error: 'Não foi possível concluir o login com o Google.' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout warning', e);
    }
    setUser(null);
    setIsAuthModalOpen(true); // Re-open login modal when user logs out!
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch {
      return { success: false, error: 'Não foi possível enviar o e-mail de recuperação. Tente novamente.' };
    }
  };

  const loginDemoUser = (role: 'student' | 'coach') => {
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
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
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
