import React, { useState } from 'react';
import { useAuth, DEMO_ALLOWED } from '../context/AuthContext.tsx';
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
    resetPassword,
    loginDemoUser,
    loading,
    authError,
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
      } else {
        setErrorMsg(res.error || 'Não foi possível enviar o e-mail de recuperação.');
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
        if (res.message) {
          setSuccessMsg(res.message);
        } else {
          onClose();
        }
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

  const handleQuickDemo = (role: 'student' | 'coach') => {
    loginDemoUser(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0f0f12] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 w-9 h-9 rounded-xl bg-[#121214] hover:bg-[#1c1c21] text-[#a1a1aa] hover:text-white flex items-center justify-center transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00ff66] to-[#ffb690] text-[#09090b] flex items-center justify-center mx-auto shadow-lg shadow-[#00ff66]/20">
            <Dumbbell className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-[#00ff66] uppercase tracking-wider block">
            PulseFit • #TeamCesar
          </span>
          <h2 className="text-xl font-bold font-display text-white">
            {mode === 'login' && 'Acessar Minha Conta'}
            {mode === 'register' && 'Criar Nova Conta'}
            {mode === 'forgot' && 'Recuperar Senha'}
          </h2>
          <p className="text-xs text-[#a1a1aa]">
            {mode === 'login' && 'Gerencie seus treinos, cargas e evolução física.'}
            {mode === 'register' && 'Cadastre-se para acompanhar sua ficha de treino.'}
            {mode === 'forgot' && 'Digite seu e-mail para receber as instruções.'}
          </p>
        </div>

        {/* Toggle Mode Segmented Control */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#09090b] border border-white/5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#121214] text-white shadow-sm font-bold'
                  : 'text-[#a1a1aa] hover:text-white'
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
                  ? 'bg-[#121214] text-white shadow-sm font-bold'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              Cadastrar
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {(errorMsg || authError) && (
          <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg || authError}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-[#172617] border border-[#39ff14]/30 text-[#39ff14] text-xs p-3 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-[#e8ffef] block mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: Lucas Silva"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#09090b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00ff66]"
                />
                <User className="w-4 h-4 text-[#a1a1aa] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#e8ffef] block mb-1">E-mail</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#09090b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00ff66]"
              />
              <Mail className="w-4 h-4 text-[#a1a1aa] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#e8ffef]">Senha</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                    }}
                    className="text-[11px] text-[#00ff66] hover:underline"
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
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#09090b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00ff66]"
                />
                <Lock className="w-4 h-4 text-[#a1a1aa] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-8 h-8 text-[#a1a1aa] hover:text-white absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-[#e8ffef] block mb-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#09090b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00ff66]"
                />
                <Lock className="w-4 h-4 text-[#a1a1aa] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-1/3 py-3 rounded-xl bg-[#121214] text-xs font-semibold text-[#e8ffef]"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-[#00ff66] hover:bg-[#00cc52] text-[#04130a] text-xs font-bold font-display shadow-lg active:scale-95"
              >
                Enviar Recuperação
              </button>
            </div>
          )}

          {mode !== 'forgot' && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#00ff66] hover:bg-[#00cc52] disabled:opacity-50 text-[#04130a] text-sm font-bold font-display shadow-lg shadow-[#00ff66]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
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

        {mode !== 'forgot' && DEMO_ALLOWED && (
            <div className="pt-2 border-t border-white/5 space-y-2">
              <span className="text-[10px] text-[#a1a1aa] uppercase font-bold tracking-wider block text-center">
                Acesso Rápido de Demonstração
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('student')}
                  className="py-2 px-2 rounded-xl bg-[#09090b] hover:bg-[#121214] text-[11px] font-semibold text-[#5be7ff] border border-white/5 flex items-center justify-center gap-1 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#5be7ff]" />
                  <span>Aluno Lucas</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('coach')}
                  className="py-2 px-2 rounded-xl bg-[#09090b] hover:bg-[#121214] text-[11px] font-semibold text-[#7dff5c] border border-white/5 flex items-center justify-center gap-1 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#7dff5c]" />
                  <span>Treinador Cesar</span>
                </button>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};
