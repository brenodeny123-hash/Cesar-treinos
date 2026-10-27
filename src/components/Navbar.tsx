import React from 'react';
import { useWorkout } from '../context/WorkoutContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { isSupabaseConfigured } from '../lib/supabase.ts';
import {
  Dumbbell,
  UserCheck,
  RotateCcw,
  LogIn,
  LogOut,
  Database,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigateTab: (tab: 'inicio' | 'treinos' | 'evolucao' | 'medidas') => void;
  onOpenCoachView: () => void;
  onOpenSupabaseModal: () => void;
  onStartActiveWorkout: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigateTab,
  onOpenCoachView,
  onOpenSupabaseModal,
  onStartActiveWorkout,
  onOpenAuthModal,
}) => {
  const { activeWorkout, resetAllData } = useWorkout();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0b1326]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f97316] to-[#ffb690] flex items-center justify-center text-[#090d16] font-display font-black text-lg shadow-md shadow-[#f97316]/20">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#f97316] block leading-none">
              #TeamCesar
            </span>
            <span className="text-base font-bold font-display text-white tracking-tight leading-tight">
              PulseFit
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#94a3b8]">
          <button
            type="button"
            onClick={() => onNavigateTab('inicio')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'inicio' ? 'text-white font-bold' : 'hover:text-white'
            }`}
          >
            Início
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('treinos')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'treinos' ? 'text-white font-bold' : 'hover:text-white'
            }`}
          >
            Fichas de Treino
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('evolucao')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'evolucao' ? 'text-white font-bold' : 'hover:text-white'
            }`}
          >
            Evolução Semanal
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('medidas')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'medidas' ? 'text-white font-bold' : 'hover:text-white'
            }`}
          >
            Medidas Corporais
          </button>
        </nav>

        {/* Zone 3: Actions & Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Supabase Integration Button */}
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            className="px-2.5 py-1.5 rounded-xl bg-[#171f33] hover:bg-[#222a3d] text-[#3ECF8E] text-xs font-semibold flex items-center gap-1.5 border border-white/5 transition-all"
            title="Supabase & Migrations"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Supabase</span>
          </button>

          <button
            type="button"
            onClick={onOpenCoachView}
            className="px-2.5 py-1.5 rounded-xl bg-[#171f33] hover:bg-[#222a3d] text-[#89ceff] text-xs font-semibold flex items-center gap-1.5 border border-white/5 transition-all"
            title="Ver CRM do Treinador Cesar"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CRM Cesar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Deseja restaurar os dados de exemplo do aluno e treinos?')) {
                resetAllData();
              }
            }}
            className="w-8 h-8 rounded-xl bg-[#171f33] hover:bg-[#222a3d] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors"
            title="Restaurar dados de exemplo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {activeWorkout && (
            <button
              type="button"
              onClick={onStartActiveWorkout}
              className="px-2.5 py-1.5 rounded-xl bg-[#f97316] text-[#090d16] font-bold text-xs flex items-center gap-1 animate-pulse shadow-md"
            >
              <span className="w-2 h-2 rounded-full bg-[#090d16]" />
              <span className="hidden sm:inline">Treinando</span>
            </button>
          )}

          {/* User Auth Chip or Login CTA */}
          {user ? (
            <div className="flex items-center gap-1.5 bg-[#171f33] border border-white/5 rounded-xl px-2.5 py-1">
              <div className="w-6 h-6 rounded-full bg-[#f97316]/20 text-[#f97316] flex items-center justify-center text-xs font-bold font-display">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-white max-w-[80px] sm:max-w-[120px] truncate hidden xs:inline">
                {user.displayName.split(' ')[0]}
              </span>
              <button
                type="button"
                onClick={logout}
                className="text-[#94a3b8] hover:text-[#ffb4ab] p-1 ml-0.5 transition-colors"
                title="Sair da conta"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold font-display flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
