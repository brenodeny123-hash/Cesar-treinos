import { ThemeToggle } from './ThemeToggle.tsx';
import React, { useState } from 'react';
import { useAuth, DEMO_ALLOWED } from '../context/AuthContext.tsx';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserRole = 'student' | 'coach';
const AUTHORIZED_COACH_EMAIL = 'professor@academia.com';

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
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

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

  const isCoach = userRole === 'coach';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0f0f12] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
        <ThemeToggle className="absolute left-4 top-4" />
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
          <img src="/cesar-avatar.jpg" alt="Cesar, seu treinador" className="w-36 h-36 sm:w-40 sm:h-40 rounded-full object-cover object-[50%_30%] mx-auto border-4 border-[#00ff66]/70 shadow-xl" />
          <span className="text-[10px] font-bold text-[#00ff66] uppercase tracking-wider block">
            Cesar Treinos • #TeamCesar
          </span>
          <h2 className="text-xl font-bold font-display text-white">
            {mode === 'login' && (isCoach ? 'Acesso do Treinador' : 'Acessar Minha Conta')}
            {mode === 'register' && 'Criar Nova Conta'}
            {mode === 'forgot' && 'Recuperar Senha'}
          </h2>
          <p className="text-xs text-[#a1a1aa]">
            {mode === 'login' && !isCoach && 'Gerencie seus treinos, cargas e evolução física.'}
            {mode === 'login' && isCoach && 'Painel do professor — gerencie alunos e fichas.'}
            {mode === 'register' && !isCoach && 'Cadastre-se para acompanhar sua ficha de treino.'}
            {mode === 'register' && isCoach && `Cadastro de treinador autorizado para ${AUTHORIZED_COACH_EMAIL}. Confirme esse e-mail para liberar o painel.`}
            {mode === 'forgot' && 'Digite seu e-mail para receber as instruções.'}
          </p>
        </div>

        {/* Role Switcher — Aluno / Treinador */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#09090b] border border-white/5 text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                userRole === 'student'
                  ? 'bg-[#121214] text-white shadow-sm font-bold border border-[#00ff66]/30'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Sou Aluno
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('coach')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                userRole === 'coach'
                  ? 'bg-[#0a2a1c] text-[#00ff66] shadow-sm font-bold border border-[#00ff66]/50'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Sou Treinador
            </button>
          </div>
        )}

        {/* Coach badge */}
        {isCoach && mode !== 'forgot' && (
          <div className="flex items-center gap-2 rounded-xl border border-[#00ff66]/20 bg-[#00ff66]/5 px-3 py-2">
            <ShieldCheck className="w-4 h-4 text-[#00ff66] shrink-0" />
            <p className="text-[11px] text-[#a1a1aa]">
              {mode === 'register'
                ? email.trim().toLowerCase() === AUTHORIZED_COACH_EMAIL
                  ? 'Este e-mail receberá o perfil de treinador após a confirmação da conta.'
                  : `Somente ${AUTHORIZED_COACH_EMAIL} pode receber o perfil de treinador; outros e-mails serão cadastrados como aluno.`
                : 'Acesso restrito ao professor. Use as credenciais cadastradas no painel do treinador.'}
            </p>
          </div>
        )}

        {/* Toggle Mode Segmented Control (login/register) */}
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
                placeholder={isCoach ? 'professor@academia.com' : 'seu.email@exemplo.com'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full h-11 pl-10 pr-3 rounded-xl bg-[#09090b] border text-sm text-white focus:outline-none ${
                  isCoach ? 'border-[#00ff66]/30 focus:border-[#00ff66]' : 'border-white/10 focus:border-[#00ff66]'
                }`}
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
              className={`w-full py-3.5 rounded-xl disabled:opacity-50 text-sm font-bold font-display shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
                isCoach
                  ? 'bg-[#00ff66] hover:bg-[#00cc52] text-[#04130a] shadow-[#00ff66]/20'
                  : 'bg-[#00ff66] hover:bg-[#00cc52] text-[#04130a] shadow-[#00ff66]/20'
              }`}
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : mode === 'login' ? (
                <>
                  {isCoach && <ShieldCheck className="w-4 h-4" />}
                  <span>{isCoach ? 'Entrar como Treinador' : 'Entrar no Cesar Treinos'}</span>
                </>
              ) : (
                <span>{isCoach ? 'Criar Conta de Treinador' : 'Cadastrar Minha Conta'}</span>
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
