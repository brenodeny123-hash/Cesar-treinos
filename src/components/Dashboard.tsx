import React from 'react';
import { useWorkout } from '../context/WorkoutContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Play,
  Flame,
  CheckCircle2,
  Calendar,
  Dumbbell,
  Scale,
  Award,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';

interface DashboardProps {
  onStartWorkout: (routineId: string) => void;
  onOpenCoachView: () => void;
  onOpenStudentManager: () => void;
  onNavigateTab: (tab: 'inicio' | 'treinos' | 'evolucao' | 'medidas') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartWorkout,
  onOpenCoachView,
  onOpenStudentManager,
  onNavigateTab,
}) => {
  const { studentProfile, routines, activeWorkout, workoutLogs, measurements, students } = useWorkout();
  const { user } = useAuth();

  const currentRoutine = routines[0] || {
    id: 'routine-a',
    code: 'A',
    title: 'Peito, Deltoide & Tríceps',
    estimatedMinutes: 55,
    exercises: [],
  };

  const latestMeas = measurements[0] || { weightKg: 78.4 };

  const daysOfWeek = [
    { day: 'Seg', name: 'Peito & Tríceps', done: true },
    { day: 'Ter', name: 'Descanso Ativo', done: true, rest: true },
    { day: 'Qua', name: 'Costas & Bíceps', done: true },
    { day: 'Qui', name: 'Descanso', done: true, rest: true },
    { day: 'Sex', name: 'Pernas & Glúteo', done: true },
    { day: 'Hoje', name: 'Peito & Tríceps', done: false, isToday: true },
    { day: 'Dom', name: 'Recuperação', done: false, rest: true },
  ];

  const displayName = user?.displayName || studentProfile.nickname;

  return (
    <div className="space-y-5 pb-24">
      {/* Top Banner & Greeting */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#91db2a] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#91db2a] uppercase tracking-wider">
              {user?.role === 'coach' ? 'Modo Treinador Pro' : 'Aluno Ativo • #TeamCesar'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenStudentManager}
              className="text-[11px] font-semibold text-[#89ceff] hover:underline flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" /> Alunos ({students.length})
            </button>
            <span className="text-white/20">·</span>
            <button
              type="button"
              onClick={onOpenCoachView}
              className="text-[11px] font-semibold text-[#f97316] hover:underline flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" /> CRM Cesar
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold font-display text-white mt-1">
          Olá, {displayName}! 💪
        </h1>
        <p className="text-xs text-[#94a3b8]">
          Foco total no gás hoje. Sua ficha atual está na <span className="text-[#f97316] font-semibold">Semana 4 de 8</span> do ciclo de força.
        </p>
      </div>

      {/* Active Workout Resumption Alert (if training) */}
      {activeWorkout ? (
        <div className="bg-gradient-to-r from-[#f97316]/20 via-[#171f33] to-[#171f33] border border-[#f97316]/50 rounded-2xl p-4 shadow-lg shadow-[#f97316]/10 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f97316] text-white flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#f97316]">
                Treino em Andamento
              </span>
              <h3 className="text-sm font-bold font-display text-white">
                {activeWorkout.routineTitle}
              </h3>
              <span className="text-xs text-[#94a3b8]">
                {Math.floor(activeWorkout.elapsedSeconds / 60)} min decorridos
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onStartWorkout(activeWorkout.routineId)}
            className="px-4 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold font-display shadow-md active:scale-95 transition-all"
          >
            Retomar
          </button>
        </div>
      ) : (
        /* Next Workout Card */
        <div className="bg-[#131b2e] border border-white/10 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#f97316] uppercase tracking-wider bg-[#f97316]/15 px-2.5 py-1 rounded-full">
              Treino Recomendado de Hoje
            </span>
            <span className="text-xs text-[#94a3b8] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> ~{currentRoutine.estimatedMinutes} min
            </span>
          </div>

          <div className="mt-3">
            <h2 className="text-xl font-bold font-display text-white">
              Treino {currentRoutine.code} • {currentRoutine.title}
            </h2>
            <p className="text-xs text-[#94a3b8] mt-1">
              {currentRoutine.exercises.length} exercícios programados com foco em hipertrofia e aumento progressivo de cargas.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#171f33] text-xs font-bold font-display text-[#f97316] flex items-center justify-center border border-white/5">
                {currentRoutine.code}
              </span>
              <span className="text-xs text-[#dae2fd] truncate max-w-[150px] sm:max-w-xs">
                {currentRoutine.exercises[0]?.name || 'Supino Reto com Barra'} e mais...
              </span>
            </div>

            <button
              type="button"
              onClick={() => onStartWorkout(currentRoutine.id)}
              className="px-5 py-3 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold font-display flex items-center gap-2 shadow-lg shadow-[#f97316]/25 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" /> Iniciar Treino
            </button>
          </div>
        </div>
      )}

      {/* 2x2 Bento Performance Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Metric 1: Weekly Consistency */}
        <div
          onClick={() => onNavigateTab('evolucao')}
          className="bg-[#131b2e] rounded-2xl p-4 border border-white/5 flex flex-col justify-between shadow-sm cursor-pointer hover:border-white/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-[#171f33] text-[#91db2a]">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-semibold text-[#91db2a] bg-[#91db2a]/15 px-2 py-0.5 rounded-full">
              4/5 metas
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-display text-white tabular-nums">80%</span>
              <span className="text-xs text-[#94a3b8]">meta</span>
            </div>
            <span className="text-xs text-[#94a3b8] mt-0.5 block">Frequência Semanal</span>
          </div>
          <div className="w-full bg-[#171f33] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#91db2a] h-full rounded-full" style={{ width: '80%' }} />
          </div>
        </div>

        {/* Metric 2: Accumulated Tonnage */}
        <div
          onClick={() => onNavigateTab('evolucao')}
          className="bg-[#131b2e] rounded-2xl p-4 border border-white/5 flex flex-col justify-between shadow-sm cursor-pointer hover:border-white/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-[#171f33] text-[#f97316]">
              <Dumbbell className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-semibold text-[#f97316] bg-[#f97316]/15 px-2 py-0.5 rounded-full">
              +8.8%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-display text-white tabular-nums block">
              18.7k <span className="text-xs font-normal text-[#94a3b8]">kg</span>
            </span>
            <span className="text-xs text-[#94a3b8] mt-0.5 block">Volume Semanal</span>
          </div>
          <div className="w-full bg-[#171f33] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#f97316] h-full rounded-full" style={{ width: '92%' }} />
          </div>
        </div>

        {/* Metric 3: Bodyweight */}
        <div
          onClick={() => onNavigateTab('medidas')}
          className="bg-[#131b2e] rounded-2xl p-4 border border-white/5 flex flex-col justify-between shadow-sm cursor-pointer hover:border-white/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-[#171f33] text-[#89ceff]">
              <Scale className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-semibold text-[#89ceff] bg-[#89ceff]/15 px-2 py-0.5 rounded-full">
              -3.7 kg
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-display text-white tabular-nums block">
              {latestMeas.weightKg} <span className="text-xs font-normal text-[#94a3b8]">kg</span>
            </span>
            <span className="text-xs text-[#94a3b8] mt-0.5 block">Peso Atual</span>
          </div>
          <span className="text-[11px] text-[#91db2a] mt-2 block">Meta: 77.0 kg</span>
        </div>

        {/* Metric 4: Streak */}
        <div
          onClick={() => onNavigateTab('evolucao')}
          className="bg-[#131b2e] rounded-2xl p-4 border border-white/5 flex flex-col justify-between shadow-sm cursor-pointer hover:border-white/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-[#171f33] text-[#acf847]">
              <Flame className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-semibold text-[#acf847] bg-[#acf847]/15 px-2 py-0.5 rounded-full">
              Sequência
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-display text-white tabular-nums block">
              {studentProfile.streakDays} <span className="text-xs font-normal text-[#94a3b8]">dias</span>
            </span>
            <span className="text-xs text-[#94a3b8] mt-0.5 block">Foco Ininterrupto</span>
          </div>
          <span className="text-[11px] text-[#94a3b8] mt-2 block">{workoutLogs.length} treinos no total</span>
        </div>
      </div>

      {/* Quick Actions (Students CRUD, Workouts CRUD, Measurements) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#dae2fd]">
            Ações Rápidas & Gestão
          </span>
          <span className="text-[11px] text-[#94a3b8]">Acesso veloz</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={onOpenStudentManager}
            className="px-4 py-2.5 rounded-xl bg-[#f97316] text-[#090d16] font-bold text-xs flex items-center gap-1.5 whitespace-nowrap active:scale-95 shadow-md"
          >
            <Users className="w-3.5 h-3.5 fill-[#090d16]" /> + Alunos (CRUD)
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('treinos')}
            className="px-4 py-2.5 rounded-xl bg-[#131b2e] hover:bg-[#171f33] text-white font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap border border-white/5"
          >
            <Dumbbell className="w-3.5 h-3.5 text-[#f97316]" /> + Montar Treino
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('evolucao')}
            className="px-4 py-2.5 rounded-xl bg-[#131b2e] hover:bg-[#171f33] text-white font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap border border-white/5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#89ceff]" /> Gráficos de Cargas
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('medidas')}
            className="px-4 py-2.5 rounded-xl bg-[#131b2e] hover:bg-[#171f33] text-white font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap border border-white/5"
          >
            <Scale className="w-3.5 h-3.5 text-[#91db2a]" /> Medidas Corporais
          </button>
        </div>
      </div>

      {/* Week Calendar Strip */}
      <div className="bg-[#131b2e] rounded-2xl p-4 border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#f97316]" />
            <h3 className="text-sm font-bold font-display text-white">Cronograma da Semana</h3>
          </div>
          <span className="text-[11px] text-[#91db2a] font-semibold">Semana 43</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {daysOfWeek.map((d, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl border flex flex-col items-center justify-between min-h-[58px] ${
                d.isToday
                  ? 'bg-[#171f33] border-[#f97316] ring-1 ring-[#f97316]/50'
                  : d.done
                  ? 'bg-[#172617]/70 border-[#91db2a]/30'
                  : 'bg-[#0b1326]/50 border-white/5 opacity-60'
              }`}
            >
              <span className={`text-[10px] font-bold ${d.isToday ? 'text-[#f97316]' : 'text-[#94a3b8]'}`}>
                {d.day}
              </span>
              <div className="my-1">
                {d.done ? (
                  <CheckCircle2 className="w-4 h-4 text-[#91db2a]" />
                ) : d.isToday ? (
                  <span className="w-3.5 h-3.5 rounded-full bg-[#f97316] block animate-ping" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20 block" />
                )}
              </div>
              <span className="text-[9px] text-[#94a3b8] truncate max-w-[36px]">
                {d.rest ? 'Desc.' : 'Treino'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trainer Quote / Guidance Card */}
      <div className="bg-gradient-to-r from-[#171f33] via-[#222a3d] to-[#171f33] rounded-2xl p-4 border border-white/5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#f97316]/20 text-[#f97316] flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <span className="text-[10px] font-bold text-[#f97316] uppercase">
            Recado do Treinador Cesar
          </span>
          <p className="text-xs text-[#dae2fd] mt-0.5 italic leading-relaxed">
            "Excelente evolução de carga no Supino essa semana, Lucas! Mantenha a cadência de descida em 2 segundos para máxima hipertrofia miofibrilar."
          </p>
        </div>
      </div>
    </div>
  );
};
