import React from 'react';
import { useWorkout } from '../context/WorkoutContext.tsx';
import { CalendarDays, CheckCircle2, Flame, TrendingUp } from 'lucide-react';

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

export const WeeklyCharts: React.FC = () => {
  const { workoutLogs, studentProfile } = useWorkout();
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateKey = toDateKey(date);
    const logs = workoutLogs.filter(log => log.date === dateKey);
    return {
      date,
      dateKey,
      logs,
      volume: logs.reduce((sum, log) => sum + log.totalVolumeKg, 0),
      isToday: dateKey === toDateKey(today),
    };
  });

  const trainedDays = days.filter(day => day.logs.length > 0).length;
  const weekVolume = days.reduce((sum, day) => sum + day.volume, 0);
  const maxVolume = Math.max(1, ...days.map(day => day.volume));
  const goal = Math.max(1, studentProfile.weeklyGoal);
  const goalProgress = Math.min(100, Math.round((trainedDays / goal) * 100));

  return (
    <main className="mx-auto w-full max-w-xl space-y-5 px-1 pb-28 pt-3">
      <header>
        <div className="flex items-center gap-3">
          <TrendingUp aria-hidden="true" className="h-7 w-7 text-[#22c55e]" />
          <h1 className="text-2xl font-bold text-white">Meu progresso</h1>
        </div>
        <p className="mt-2 text-base text-[#dae2fd]">Veja seus treinos desta semana, de um jeito simples.</p>
      </header>

      <section className="rounded-3xl border border-[#22c55e]/30 bg-[#111827] p-5">
        <div className="flex items-center gap-3">
          <CalendarDays aria-hidden="true" className="h-6 w-6 text-[#22c55e]" />
          <h2 className="text-xl font-bold text-white">Dias em que você treinou</h2>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-2">
          {days.map(day => {
            const label = day.date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
            const didTrain = day.logs.length > 0;
            return (
              <div
                key={day.dateKey}
                className={'flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border p-2 text-center ' +
                  (day.isToday
                    ? 'border-[#22c55e] bg-[#22c55e]/10'
                    : didTrain
                      ? 'border-[#22c55e]/30 bg-[#22c55e]/5'
                      : 'border-white/10 bg-[#0b1326]')}
              >
                <span className="text-base font-semibold capitalize text-[#dae2fd]">{label}</span>
                <span className="text-2xl" role="img" aria-label={didTrain ? 'Treinou' : 'Não treinou'}>
                  {didTrain ? '✅' : '⬜'}
                </span>
                <span className="text-base text-white">{day.date.getDate()}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3 text-base">
            <span className="font-semibold text-white">Meta da semana</span>
            <span className="text-[#dcfce7]">{trainedDays} de {goal} treinos</span>
          </div>
          <div
            className="mt-2 h-4 overflow-hidden rounded-full bg-[#222a3d]"
            role="progressbar"
            aria-label="Meta de treinos desta semana"
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-valuenow={trainedDays}
          >
            <div className="h-full rounded-full bg-[#22c55e] transition-all" style={{ width: goalProgress + '%' }} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#111827] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-[#dcfce7]">Atividade por dia</p>
            <h2 className="mt-1 text-xl font-bold text-white">Volume levantado</h2>
          </div>
          <div className="text-right">
            <span className="block text-2xl font-bold text-white">{weekVolume.toLocaleString('pt-BR')} kg</span>
            <span className="text-base text-[#dae2fd]">nesta semana</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 items-end gap-2">
          {days.map(day => {
            const label = day.date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
            const height = day.volume > 0 ? Math.max(12, Math.round((day.volume / maxVolume) * 100)) : 6;
            return (
              <div key={day.dateKey} className="flex min-w-0 flex-col items-center gap-2">
                <span className="max-w-full truncate text-base font-semibold text-white">
                  {day.volume > 0 ? Math.round(day.volume / 100) / 10 + 't' : '—'}
                </span>
                <div className="flex h-28 w-full items-end rounded-xl bg-[#0b1326] p-1">
                  <div
                    className={'w-full rounded-lg ' + (day.volume > 0 ? 'bg-[#22c55e]' : 'bg-[#30394f]')}
                    style={{ height: height + '%' }}
                    aria-label={day.volume + ' quilos'}
                  />
                </div>
                <span className="text-base capitalize text-[#dae2fd]">{label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex items-start gap-4 rounded-3xl border border-[#22c55e]/30 bg-[#22c55e]/10 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#22c55e]/15 text-[#22c55e]">
          {studentProfile.streakDays > 0
            ? <Flame aria-hidden="true" className="h-7 w-7" />
            : <CheckCircle2 aria-hidden="true" className="h-7 w-7" />}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            {studentProfile.streakDays >= 7
              ? 'Sua constância está incrível!'
              : studentProfile.streakDays > 0
                ? 'Você está no caminho certo!'
                : 'Todo começo vale a pena!'}
          </h2>
          <p className="mt-1 text-base leading-6 text-[#dae2fd]">
            {studentProfile.streakDays} {studentProfile.streakDays === 1 ? 'dia' : 'dias'} na sua sequência.
            Continue treinando no seu ritmo.
          </p>
        </div>
      </section>
    </main>
  );
};
