import React from 'react';
import { ThemeToggle } from './ThemeToggle.tsx';
import { useWorkout } from '../context/WorkoutContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import type { AppTab } from './BottomNav.tsx';
import {
  RotateCcw,
  LogIn,
  LogOut,
  Database,
} from 'lucide-react';

interface NavbarProps {
  currentTab: AppTab;
  onNavigateTab: (tab: AppTab) => void;
  onOpenSupabaseModal: () => void;
  onStartActiveWorkout: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigateTab,
  onOpenSupabaseModal,
  onStartActiveWorkout,
  onOpenAuthModal,
}) => {
  const { user: roleUser } = useAuth();
  const { activeWorkout, resetAllData } = useWorkout();
  const { user, logout } = useAuth();
  const isCoach = roleUser?.role === 'coach';
  const navTabs: { id: AppTab; label: string }[] = isCoach
    ? [
        { id: 'inicio', label: 'Painel do treinador' },
        { id: 'alunos', label: 'Alunos' },
        { id: 'treinos', label: 'Fichas' },
      ]
    : [
        { id: 'inicio', label: 'Início' },
        { id: 'treinos', label: 'Fichas de Treino' },
        { id: 'evolucao', label: 'Evolução Semanal' },
        { id: 'medidas', label: 'Medidas Corporais' },
      ];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#09090b]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img src="/cesar-avatar-small.jpg" alt="Cesar" className="w-10 h-10 rounded-full object-cover object-[50%_30%] border-2 border-[#00ff66]/70" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00ff66] block leading-none">
              {isCoach ? 'Área do treinador' : '#TeamCesar'}
            </span>
            <span className="text-base font-bold font-display text-white tracking-tight leading-tight">
              Cesar Treinos
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#a1a1aa]">
          {navTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigateTab(tab.id)}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                currentTab === tab.id ? 'text-white font-bold' : 'hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions & Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Supabase Integration Button */}
          {roleUser?.role === 'coach' && (
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            className="px-2.5 py-1.5 rounded-xl bg-[#121214] hover:bg-[#1c1c21] text-[#3ECF8E] text-xs font-semibold flex items-center gap-1.5 border border-white/5 transition-all"
            title="Supabase & Migrations"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Supabase</span>
          </button>
          )}

          <ThemeToggle />

          {!isCoach && <button
            type="button"
            onClick={() => {
              if (window.confirm('Deseja restaurar os dados de exemplo do aluno e treinos?')) {
                resetAllData();
              }
            }}
            className="w-8 h-8 rounded-xl bg-[#121214] hover:bg-[#1c1c21] text-[#a1a1aa] hover:text-white flex items-center justify-center transition-colors"
            title="Restaurar dados de exemplo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>}

          {!isCoach && activeWorkout && (
            <button
              type="button"
              onClick={onStartActiveWorkout}
              className="px-2.5 py-1.5 rounded-xl bg-[#00ff66] text-[#09090b] font-bold text-xs flex items-center gap-1 animate-pulse shadow-md"
            >
              <span className="w-2 h-2 rounded-full bg-[#09090b]" />
              <span className="hidden sm:inline">Treinando</span>
            </button>
          )}

          {/* User Auth Chip or Login CTA */}
          {user ? (
            <div className="flex items-center gap-1.5 bg-[#121214] border border-white/5 rounded-xl px-2.5 py-1">
              <div className="w-6 h-6 rounded-full bg-[#00ff66]/20 text-[#00ff66] flex items-center justify-center text-xs font-bold font-display">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-white max-w-[80px] sm:max-w-[120px] truncate hidden xs:inline">
                {user.displayName.split(' ')[0]}
              </span>
              <button
                type="button"
                onClick={logout}
                className="text-[#a1a1aa] hover:text-[#ffb4ab] p-1 ml-0.5 transition-colors"
                title="Sair da conta"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-xl bg-[#00ff66] hover:bg-[#00cc52] text-[#04130a] text-xs font-bold font-display flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
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
