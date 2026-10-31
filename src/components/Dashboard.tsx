import React from 'react';
import { todayFortaleza, weekStart, cycleWeek } from '../lib/time.ts';
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

  const today = todayFortaleza();
  const monday = weekStart(today);
  // Data de início do treino: antes dela nada conta como treinado.
  const startIso = /^\d{4}-\d{2}-\d{2}$/.test(studentProfile.joinedDate) ? studentProfile.joinedDate : '';
  const cycle = cycleWeek(startIso || today, today);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${monday}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + index);
    const iso = date.toISOString().slice(0, 10);
    const names = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const routinesByDay = ['Recuperação', 'Treino A', 'Treino B', 'Treino C', 'Treino A', 'Treino B', 'Treino C'];
    const beforeStart = !!startIso && iso < startIso;
    const completed = !beforeStart && workoutLogs.some(log => log.date === iso);
    return { date: iso, day: names[date.getUTCDay()], name: routinesByDay[date.getUTCDay()], done: completed, isToday: iso === today, rest: date.getUTCDay() === 0, beforeStart };
  });


  // Métricas reais da semana (somente treinos a partir do início do treino)
  const weekLogs = workoutLogs.filter(l => l.date >= monday && l.date <= today && (!startIso || l.date >= startIso));
  const weekVolume = weekLogs.reduce((acc, l) => acc + l.totalVolumeKg, 0);
  const weeklyDone = new Set(weekLogs.map(l => l.date)).size;
  const weeklyGoal = Math.max(1, studentProfile.weeklyGoal || 1);
  const weeklyPct = Math.min(100, Math.round((weeklyDone / weeklyGoal) * 100));
  const volumeLabel = weekVolume >= 1000 ? `${(weekVolume / 1000).toFixed(1).replace('.', ',')}k` : String(Math.round(weekVolume));
  const hasMeasure = measurements.length > 0;
  const oldestMeas = measurements[measurements.length - 1];
  const weightDelta = hasMeasure && measurements.length > 1 ? Math.round((latestMeas.weightKg - oldestMeas.weightKg) * 10) / 10 : null;

  const displayName = user?.displayName || studentProfile.nickname;

  return (
    <div className="space-y-5 pb-24">
      {/* Top Banner & Greeting */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#39ff14] uppercase tracking-wider">
              {user?.role === 'coach' ? 'Modo Treinador Pro' : 'Aluno Ativo • #TeamCesar'}
            </span>
          </div>
          {user?.role === 'coach' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenStudentManager}
              className="text-[11px] font-semibold text-[#5be7ff] hover:underline flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" /> Alunos ({students.length})
            </button>
            <span className="text-white/20">·</span>
            <button
              type="button"
              onClick={onOpenCoachView}
              className="text-[11px] font-semibold text-[#00ff66] hover:underline flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" /> CRM Cesar
            </button>
          </div>
          )}
        </div>

        <div className="on-photo mt-3 relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f12]">
          <img src="/cesar-avatar.jpg" alt="Caricatura do Cesar, seu treinador" className="w-full h-64 sm:h-72 object-cover object-[50%_28%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00ff66]">#TeamCesar</span>
            <p className="text-2xl font-bold font-display text-white leading-tight">Cesar Treinos</p>
            <p className="text-xs text-white/80">Treine com foco. Evolua com consistência.</p>
          </div>
        </div>
        <h1 className="text-2xl font-bold font-display text-white mt-1">
          Olá, {displayName}! 💪
        </h1>
        <p className="text-xs text-[#a1a1aa]">
          Foco total no gás hoje. Acompanhe sua rotina e evolução, um treino de cada vez.
        </p>
      </div>

      {/* Active Workout Resumption Alert (if training) */}
      {activeWorkout ? (
        <div className="bg-gradient-to-r from-[#00ff66]/20 via-[#121214] to-[#121214] border border-[#00ff66]/50 rounded-2xl p-4 shadow-lg shadow-[#00ff66]/10 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00ff66] text-[#04130a] flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00ff66]">
                Treino em Andamento
              </span>
              <h3 className="text-sm font-bold font-display text-white">
                {activeWorkout.routineTitle}
              </h3>
              <span className="text-xs text-[#a1a1aa]">
                {Math.floor(activeWorkout.elapsedSeconds / 60)} min decorridos
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onStartWorkout(activeWorkout.routineId)}
            className="px-4 py-2 rounded-xl bg-[#00ff66] hover:bg-[#00cc52] text-[#04130a] text-xs font-bold font-display shadow-md active:scale-95 transition-all"
          >
            Retomar
          </button>
        </div>
      ) : (
        /* Next Workout Card */
        <div className="bg-[#0f0f12] border border-white/10 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#00ff66] uppercase tracking-wider bg-[#00ff66]/15 px-2.5 py-1 rounded-full">
              Treino Recomendado de Hoje
            </span>
            <span className="text-xs text-[#a1a1aa] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> ~{currentRoutine.estimatedMinutes} min
            </span>
          </div>

          <div className="mt-3">
            <h2 className="text-xl font-bold font-display text-white">
              Treino {currentRoutine.code} • {currentRoutine.title}
            </h2>
            <p className="text-xs text-[#a1a1aa] mt-1">
              {currentRoutine.exercises.length} exercícios programados com foco em hipertrofia e aumento progressivo de cargas.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#121214] text-xs font-bold font-display text-[#00ff66] flex items-center justify-center border border-white/5">
                {currentRoutine.code}
              </span>
              <span className="text-xs text-[#e8ffef] truncate max-w-[150px] sm:max-w-xs">
                {currentRoutine.exercises[0]?.name || 'Supino Reto com Barra'} e mais...
              </span>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('treinos')}
              className="px-5 py-3 rounded-2xl bg-[#00ff66] hover:bg-[#00cc52] text-[#04130a] text-xs font-bold font-display flex items-center gap-2 shadow-lg shadow-[#00ff66]/25 active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4" /> Escolher ficha
            </button>
          </div>
        </div>
      )}

      {/* 2x2 Bento Performance Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Metric 1: Weekly Consistency */}
        <div
          onClick={() => onNavigateTab('evolucao')}
          className="bg-[#0f0f12] rounded-2xl p-4 border border-white/5 flex flex-col justify-between shadow-sm cursor-pointer hover:border-white/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-[#121214] text-[#39ff14]">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-semibold text-[#39ff14] bg-[#39ff14]/15 px-2 py-0.5 rounded-full">
              {weeklyDone}/{weeklyGoal} metas
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-display text-white tabular-nums">{weeklyPct}%</span>
              <span className="text-xs text-[#a1a1aa]">meta</span>
            </div>
            <span className="text-xs text-[#a1a1aa] mt-0.5 block">Frequência Semanal</span>
          </div>
          <div className="w-full bg-[#121214] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#39ff14] h-full rounded-full" style={{ width: `${weeklyPct}%` }} />
          </div>
        </div>

        {/* Metric 2: Accumulated Tonnage */}
        <div
          onClick={() => onNavigateTab('evolucao')}
          className="bg-[#0f0f12] rounded-2xl p-4 border border-white/5 flex flex-col justify-between shadow-sm cursor-pointer hover:border-white/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-[#121214] text-[#00ff66]">
              <Dumbbell className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-semibold text-[#00ff66] bg-[#00ff66]/15 px-2 py-0.5 rounded-full">
              {weekLogs.length} {weekLogs.length === 1 ? 'treino' : 'treinos'}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-display text-white tabular-nums block">
              {volumeLabel} <span className="text-xs font-normal text-[#a1a1aa]">kg</span>
            </span>
            <span className="text-xs text-[#a1a1aa] mt-0.5 block">Volume Semanal</span>
          </div>
          <div className="w-full bg-[#121214] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#00ff66] h-full rounded-full" style={{ width: `${weeklyPct}%` }} />
          </div>
        </div>

        {/* Metric 3: Bodyweight */}
        <div
          onClick={() => onNavigateTab('medidas')}
          className="bg-[#0f0f12] rounded-2xl p-4 border border-white/5 flex flex-col justify-between shadow-sm cursor-pointer hover:border-white/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-[#121214] text-[#5be7ff]">
              <Scale className="w-4 h-4" />
            </span>
            {weightDelta !== null && (
              <span className="text-[10px] font-semibold text-[#5be7ff] bg-[#5be7ff]/15 px-2 py-0.5 rounded-full">
                {weightDelta > 0 ? '+' : ''}{String(weightDelta).replace('.', ',')} kg
              </span>
            )}
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-display text-white tabular-nums block">
              {latestMeas.weightKg} <span className="text-xs font-normal text-[#a1a1aa]">kg</span>
            </span>
            <span className="text-xs text-[#a1a1aa] mt-0.5 block">Peso Atual</span>
          </div>
          <span className="text-[11px] text-[#39ff14] mt-2 block">{hasMeasure ? 'Última medição' : 'Registre seu peso em Medidas'}</span>
        </div>

        {/* Metric 4: Streak */}
        <div
          onClick={() => onNavigateTab('evolucao')}
          className="bg-[#0f0f12] rounded-2xl p-4 border border-white/5 flex flex-col justify-between shadow-sm cursor-pointer hover:border-white/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-[#121214] text-[#7dff5c]">
              <Flame className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-semibold text-[#7dff5c] bg-[#7dff5c]/15 px-2 py-0.5 rounded-full">
              Sequência
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-display text-white tabular-nums block">
              {studentProfile.streakDays} <span className="text-xs font-normal text-[#a1a1aa]">dias</span>
            </span>
            <span className="text-xs text-[#a1a1aa] mt-0.5 block">Foco Ininterrupto</span>
          </div>
          <span className="text-[11px] text-[#a1a1aa] mt-2 block">{workoutLogs.length} treinos no total</span>
        </div>
      </div>

      {/* Quick Actions (Students CRUD, Workouts CRUD, Measurements) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#e8ffef]">
            Ações Rápidas & Gestão
          </span>
          <span className="text-[11px] text-[#a1a1aa]">Acesso veloz</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {user?.role === 'coach' && (
          <button
            type="button"
            onClick={onOpenStudentManager}
            className="px-4 py-2.5 rounded-xl bg-[#00ff66] text-[#09090b] font-bold text-xs flex items-center gap-1.5 whitespace-nowrap active:scale-95 shadow-md"
          >
            <Users className="w-3.5 h-3.5 fill-[#09090b]" /> + Alunos (CRUD)
          </button>
          )}
          <button
            type="button"
            onClick={() => onNavigateTab('treinos')}
            className="px-4 py-2.5 rounded-xl bg-[#0f0f12] hover:bg-[#121214] text-white font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap border border-white/5"
          >
            <Dumbbell className="w-3.5 h-3.5 text-[#00ff66]" /> + Montar Treino
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('evolucao')}
            className="px-4 py-2.5 rounded-xl bg-[#0f0f12] hover:bg-[#121214] text-white font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap border border-white/5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#5be7ff]" /> Gráficos de Cargas
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('medidas')}
            className="px-4 py-2.5 rounded-xl bg-[#0f0f12] hover:bg-[#121214] text-white font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap border border-white/5"
          >
            <Scale className="w-3.5 h-3.5 text-[#39ff14]" /> Medidas Corporais
          </button>
        </div>
      </div>

      {/* Week Calendar Strip */}
      <div className="bg-[#0f0f12] rounded-2xl p-4 border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00ff66]" />
            <h3 className="text-sm font-bold font-display text-white">Cronograma da Semana</h3>
          </div>
          <span className="text-[11px] text-[#39ff14] font-bold bg-[#39ff14]/10 px-2 py-1 rounded-lg">Semana {cycle.week}/{cycle.total}</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {weekDays.map((d, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl border flex flex-col items-center justify-between min-h-[58px] ${
                d.isToday
                  ? 'bg-[#121214] border-[#00ff66] ring-1 ring-[#00ff66]/50'
                  : d.done
                  ? 'bg-[#172617]/70 border-[#39ff14]/30'
                  : d.beforeStart
                  ? 'bg-[#09090b]/30 border-white/5 opacity-40'
                  : 'bg-[#09090b]/50 border-white/5 opacity-60'
              }`}
            >
              <span className={`text-[10px] font-bold ${d.isToday ? 'text-[#00ff66]' : 'text-[#a1a1aa]'}`}>
                {d.day}
              </span>
              <div className="my-1">
                {d.done ? (
                  <CheckCircle2 className="w-4 h-4 text-[#39ff14]" />
                ) : d.isToday ? (
                  <span className="w-3.5 h-3.5 rounded-full bg-[#00ff66] block animate-ping" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20 block" />
                )}
              </div>
              <span className="text-[9px] text-[#a1a1aa] truncate max-w-[36px]">
                {d.done ? 'Feito' : d.beforeStart ? '—' : d.rest ? 'Desc.' : 'Treino'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trainer Quote / Guidance Card */}
      <div className="bg-gradient-to-r from-[#121214] via-[#1c1c21] to-[#121214] rounded-2xl p-4 border border-white/5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#00ff66]/20 text-[#00ff66] flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <span className="text-[10px] font-bold text-[#00ff66] uppercase">
            Recado do Treinador Cesar
          </span>
          <p className="text-xs text-[#e8ffef] mt-0.5 italic leading-relaxed">
            "Bem-vindo ao seu ciclo de treino, {displayName}! Foque na execução e anote as cargas de cada série. Qualquer dúvida, fale comigo."
          </p>
        </div>
      </div>
    </div>
  );
};
