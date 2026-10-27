import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Dumbbell,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    resetPassword,
    loginDemoUser,
    loading,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMsg('Por favor, informe seu e-mail.');
        return;
      }
      const res = await resetPassword(email.trim());
      if (res.success) {
        setSuccessMsg('E-mail de recuperação enviado com sucesso!');
      }
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Por favor, informe seu nome completo.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('As senhas não coincidem.');
        return;
      }
      const res = await registerWithEmail(email.trim(), password, name.trim());
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Erro ao registrar.');
      }
      return;
    }

    // Login
    if (!email.trim() || !password) {
      setErrorMsg('Preencha e-mail e senha.');
      return;
    }
    const res = await loginWithEmail(email.trim(), password);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Credenciais inválidas.');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    const res = await loginWithGoogle();
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Erro ao conectar com Google.');
    }
  };

  const handleQuickDemo = (role: 'student' | 'coach') => {
    loginDemoUser(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#131b2e] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 w-9 h-9 rounded-xl bg-[#171f33] hover:bg-[#222a3d] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f97316] to-[#ffb690] text-[#090d16] flex items-center justify-center mx-auto shadow-lg shadow-[#f97316]/20">
            <Dumbbell className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-[#f97316] uppercase tracking-wider block">
            PulseFit • #TeamCesar
          </span>
          <h2 className="text-xl font-bold font-display text-white">
            {mode === 'login' && 'Acessar Minha Conta'}
            {mode === 'register' && 'Criar Nova Conta'}
            {mode === 'forgot' && 'Recuperar Senha'}
          </h2>
          <p className="text-xs text-[#94a3b8]">
            {mode === 'login' && 'Gerencie seus treinos, cargas e evolução física.'}
            {mode === 'register' && 'Cadastre-se para acompanhar sua ficha de treino.'}
            {mode === 'forgot' && 'Digite seu e-mail para receber as instruções.'}
          </p>
        </div>

        {/* Toggle Mode Segmented Control */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0b1326] border border-white/5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#171f33] text-white shadow-sm font-bold'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-[#171f33] text-white shadow-sm font-bold'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Cadastrar
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-[#172617] border border-[#91db2a]/30 text-[#91db2a] text-xs p-3 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: Lucas Silva"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                />
                <User className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#dae2fd] block mb-1">E-mail</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
              />
              <Mail className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#dae2fd]">Senha</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                    }}
                    className="text-[11px] text-[#f97316] hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                />
                <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-8 h-8 text-[#94a3b8] hover:text-white absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                />
                <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-1/3 py-3 rounded-xl bg-[#171f33] text-xs font-semibold text-[#dae2fd]"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold font-display shadow-lg active:scale-95"
              >
                Enviar Recuperação
              </button>
            </div>
          )}

          {mode !== 'forgot' && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 text-white text-sm font-bold font-display shadow-lg shadow-[#f97316]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : mode === 'login' ? (
                <span>Entrar no PulseFit</span>
              ) : (
                <span>Cadastrar Minha Conta</span>
              )}
            </button>
          )}
        </form>

        {/* Social Auth Divider */}
        {mode !== 'forgot' && (
          <>
            <div className="flex items-center gap-3">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[11px] text-[#94a3b8] uppercase">ou continue com</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#171f33] hover:bg-[#222a3d] text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/5 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com Google</span>
            </button>

            {/* Quick Demo Logins for instant review */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <span className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider block text-center">
                Acesso Rápido de Demonstração
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('student')}
                  className="py-2 px-2 rounded-xl bg-[#0b1326] hover:bg-[#171f33] text-[11px] font-semibold text-[#89ceff] border border-white/5 flex items-center justify-center gap-1 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#89ceff]" />
                  <span>Aluno Lucas</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('coach')}
                  className="py-2 px-2 rounded-xl bg-[#0b1326] hover:bg-[#171f33] text-[11px] font-semibold text-[#acf847] border border-white/5 flex items-center justify-center gap-1 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#acf847]" />
                  <span>Treinador Cesar</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
