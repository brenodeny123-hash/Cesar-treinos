import React from 'react';
import { useWorkout } from '../context/WorkoutContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { CheckCircle2, Flame, Play, Sparkles } from 'lucide-react';

type AppTab = 'inicio' | 'treinos' | 'evolucao' | 'medidas';

interface DashboardProps {
  onStartWorkout: (routineId: string) => void;
  onOpenCoachView: () => void;
  onOpenStudentManager: () => void;
  onNavigateTab: (tab: AppTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = props => {
  const { studentProfile, routines, activeWorkout, workoutLogs } = useWorkout();
  const { user } = useAuth();

  const lastRoutineId = workoutLogs[0]?.routineId;
  const lastRoutineIndex = routines.findIndex(routine => routine.id === lastRoutineId);
  const todayRoutine = routines.length
    ? routines[(lastRoutineIndex + 1 + routines.length) % routines.length]
    : null;
  const routineToStart = activeWorkout
    ? routines.find(routine => routine.id === activeWorkout.routineId) || todayRoutine
    : todayRoutine;
  const displayName = user?.displayName?.split(' ')[0] || studentProfile.nickname || 'aluno';

  const startLabel = activeWorkout ? 'Continuar meu treino' : 'Iniciar Treino de Hoje';
  const handleStart = () => {
    if (routineToStart) props.onStartWorkout(routineToStart.id);
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-1 pb-28 pt-3">
      <section aria-labelledby="dashboard-title" className="text-center">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-[#22c55e]/10 px-4 py-2 text-base font-semibold text-[#dcfce7]">
          <Sparkles aria-hidden="true" className="h-5 w-5 text-[#22c55e]" />
          Um passo de cada vez. Você consegue!
        </div>
        <p className="mt-5 text-base font-medium text-[#dae2fd]">Olá, {displayName}</p>
        <h1 id="dashboard-title" className="mt-1 text-3xl font-bold text-white">
          Meu treino de hoje
        </h1>
      </section>

      {routineToStart ? (
        <section className="rounded-3xl border border-[#22c55e]/40 bg-[#111827] p-6 text-center shadow-xl shadow-[#22c55e]/10">
          <span className="inline-flex min-h-10 items-center rounded-full bg-[#22c55e]/15 px-4 text-base font-bold text-[#dcfce7]">
            {activeWorkout ? 'Treino em andamento' : 'Treino recomendado'}
          </span>
          <h2 className="mt-4 text-2xl font-bold leading-tight text-white">
            {routineToStart.title}
          </h2>
          <p className="mt-2 text-base text-[#dae2fd]">
            {routineToStart.exercises.length} exercícios
            {routineToStart.estimatedMinutes ? ' • cerca de ' + routineToStart.estimatedMinutes + ' minutos' : ''}
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="mx-auto mt-6 flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#22c55e] px-6 py-4 text-xl font-bold text-[#06210e] shadow-lg shadow-[#22c55e]/20 transition hover:bg-[#15803d] hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.99]"
          >
            <Play aria-hidden="true" className="h-7 w-7 fill-current" />
            {startLabel}
          </button>
        </section>
      ) : (
        <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 text-center">
          <h2 className="text-xl font-bold text-white">Seu treino ainda não está pronto</h2>
          <p className="mt-2 text-base text-[#dae2fd]">Peça ao seu treinador para montar sua ficha.</p>
          <button
            type="button"
            onClick={() => props.onNavigateTab('treinos')}
            className="mx-auto mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-5 text-base font-bold text-[#06210e]"
          >
            <CheckCircle2 aria-hidden="true" className="h-5 w-5" /> Ver minhas fichas
          </button>
        </section>
      )}

      <section className="rounded-3xl border border-[#22c55e]/30 bg-[#111827] p-5" aria-label="Sequência de treinos">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22c55e]/15 text-[#22c55e]">
            <Flame aria-hidden="true" className="h-8 w-8" />
          </div>
          <div>
            <p className="text-base font-semibold text-[#dcfce7]">Sua sequência</p>
            <p className="text-2xl font-bold text-white">
              {studentProfile.streakDays} {studentProfile.streakDays === 1 ? 'dia' : 'dias'} seguidos
            </p>
          </div>
        </div>
        <p className="mt-4 text-center text-base text-[#dae2fd]">
          {studentProfile.streakDays >= 7
            ? 'Incrível! Você está criando um ótimo hábito.'
            : studentProfile.streakDays > 0
              ? 'Cada treino conta. Continue no seu ritmo!'
              : 'Hoje é um ótimo dia para começar sua sequência.'}
        </p>
      </section>
    </main>
  );
};
