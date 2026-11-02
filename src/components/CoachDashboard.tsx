import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useWorkout } from '../context/WorkoutContext.tsx';
import { daysBetween, todayFortaleza } from '../lib/time.ts';
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Dumbbell,
  UserPlus,
  Users,
} from 'lucide-react';

interface CoachDashboardProps {
  onNavigateTab: (tab: 'alunos' | 'treinos') => void;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({ onNavigateTab }) => {
  const { students, routines } = useWorkout();
  const { user } = useAuth();
  const activeStudents = students.filter(student => student.status === 'Ativo').length;
  const today = todayFortaleza();
  const renewals = students
    .filter(student => student.routineExpiresOn && /^\d{4}-\d{2}-\d{2}$/.test(student.routineExpiresOn))
    .map(student => ({
      student,
      daysLeft: daysBetween(today, student.routineExpiresOn as string),
    }))
    .filter(item => item.daysLeft <= 7)
    .sort((left, right) => left.daysLeft - right.daysLeft);

  const metrics = [
    { label: 'Alunos cadastrados', value: students.length, icon: Users, tone: 'text-[#5be7ff]' },
    { label: 'Alunos ativos', value: activeStudents, icon: ClipboardList, tone: 'text-[#00ff66]' },
    { label: 'Fichas disponíveis', value: routines.length, icon: Dumbbell, tone: 'text-[#a78bfa]' },
    { label: 'Fichas a renovar', value: renewals.length, icon: AlertTriangle, tone: 'text-[#ffb4ab]' },
  ];

  const renewalLabel = (daysLeft: number) => {
    if (daysLeft < 0) return `Venceu há ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? 'dia' : 'dias'}`;
    if (daysLeft === 0) return 'Vence hoje';
    return `Vence em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`;
  };

  return (
    <div className="space-y-5 pb-24">
      <section className="rounded-3xl border border-[#00ff66]/20 bg-gradient-to-br from-[#102117] via-[#0f0f12] to-[#0f0f12] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#00ff66]">Área do treinador</span>
            <h1 className="mt-2 text-2xl font-bold font-display text-white">
              Olá, {user?.displayName || 'Treinador'}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[#a1a1aa]">
              Gerencie seus alunos, organize as fichas e acompanhe o que precisa de atenção.
            </p>
          </div>
          <figure className="relative w-20 shrink-0 sm:w-28">
            <img
              src="/images/cesar/cesar-agachamento.jpg"
              alt="Cesar agachando com uma barra na academia"
              loading="lazy"
              decoding="async"
              className="h-24 w-full rounded-2xl border border-white/10 object-cover object-top sm:h-32"
            />
            <figcaption className="absolute inset-x-1 bottom-1 rounded-lg bg-black/75 px-1 py-1 text-center text-[8px] font-semibold text-white sm:text-[9px]">
              Cesar fiscalizando o agachamento
            </figcaption>
          </figure>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('alunos')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00ff66] px-4 py-2.5 text-xs font-bold text-[#04130a] transition-colors hover:bg-[#00cc52]"
          >
            <UserPlus className="h-4 w-4" /> Cadastrar ou gerenciar alunos
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('treinos')}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#121214] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:border-[#00ff66]/40"
          >
            <Dumbbell className="h-4 w-4 text-[#00ff66]" /> Criar ou editar fichas
          </button>
        </div>
      </section>

      <section aria-label="Resumo da academia" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-2xl border border-white/5 bg-[#0f0f12] p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-[#a1a1aa]">{metric.label}</span>
                <Icon className={`h-4 w-4 shrink-0 ${metric.tone}`} />
              </div>
              <p className="mt-3 text-2xl font-bold tabular-nums text-white">{metric.value}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-white/5 bg-[#0f0f12] p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold font-display text-white">Renovações e atenção</h2>
            <p className="mt-0.5 text-xs text-[#a1a1aa]">Fichas vencidas ou com vencimento nos próximos 7 dias.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('alunos')}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#00ff66] hover:underline"
          >
            Ver alunos <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {renewals.length > 0 ? (
          <div className="space-y-2">
            {renewals.slice(0, 5).map(({ student, daysLeft }) => (
              <div key={student.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#ffb4ab]/10 bg-[#09090b] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{student.name}</p>
                  <p className="truncate text-[11px] text-[#a1a1aa]">
                    {student.currentRoutineTitle || `Treino ${student.currentRoutineCode}`}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-[#ffb4ab]/10 px-2 py-1 text-[10px] font-bold text-[#ffb4ab]">
                  {renewalLabel(daysLeft)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 bg-[#09090b] px-3 py-4 text-center text-xs text-[#a1a1aa]">
            Nenhuma ficha precisa de renovação agora.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/5 bg-[#0f0f12] p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold font-display text-white">Alunos</h2>
            <p className="mt-0.5 text-xs text-[#a1a1aa]">Acesso rápido aos cadastros e às fichas atribuídas.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('alunos')}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#00ff66] hover:underline"
          >
            Gerenciar <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {students.length > 0 ? (
          <div className="space-y-2">
            {students.slice(0, 5).map(student => (
              <button
                key={student.id}
                type="button"
                onClick={() => onNavigateTab('alunos')}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#09090b] px-3 py-2.5 text-left transition-colors hover:border-white/15"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00ff66]/10 text-sm font-bold text-[#00ff66]">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">{student.name}</span>
                    <span className="block truncate text-[11px] text-[#a1a1aa]">
                      {student.currentRoutineTitle || `Treino ${student.currentRoutineCode}`} · {student.goal}
                    </span>
                  </span>
                </span>
                <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold ${student.status === 'Ativo' ? 'bg-[#00ff66]/10 text-[#00ff66]' : 'bg-white/5 text-[#a1a1aa]'}`}>
                  {student.status}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#09090b] px-4 py-6 text-center">
            <Users className="mx-auto h-6 w-6 text-[#71717a]" />
            <p className="mt-2 text-sm font-semibold text-white">Nenhum aluno cadastrado</p>
            <p className="mt-1 text-xs text-[#a1a1aa]">Cadastre seu primeiro aluno para começar a organizar as fichas.</p>
            <button
              type="button"
              onClick={() => onNavigateTab('alunos')}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#00ff66] hover:underline"
            >
              <UserPlus className="h-3.5 w-3.5" /> Cadastrar aluno
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
