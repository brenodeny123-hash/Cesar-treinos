import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext.tsx';
import { dayNumber, todayFortaleza } from '../lib/time.ts';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export const AttendanceCalendar: React.FC = () => {
  const { workoutLogs, studentProfile } = useWorkout();
  const today = todayFortaleza();
  const [ym, setYm] = useState(today.slice(0, 7));
  const [y, m] = ym.split('-').map(Number);
  const offset = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const total = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const trained = new Set(workoutLogs.map(l => l.date));
  const monthCount = Array.from({ length: total }, (_, i) => `${ym}-${String(i + 1).padStart(2, '0')}`).filter(d => trained.has(d)).length;
  const shift = (d: number) => setYm(new Date(Date.UTC(y, m - 1 + d, 1)).toISOString().slice(0, 7));
  const hasDate = /^\d{4}-\d{2}-\d{2}$/.test(studentProfile.joinedDate);

  return (
    <section className="rounded-2xl bg-[#121214] border border-[#00ff66]/20 p-4 my-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-[#e8ffef] flex items-center gap-2"><CalendarDays className="w-4 h-4 text-[#00ff66]" /> Frequência</h2>
        {hasDate && <span className="text-[11px] font-bold text-[#00ff66] bg-[#00ff66]/10 px-2 py-1 rounded-lg">Dia {dayNumber(studentProfile.joinedDate)}</span>}
      </div>
      <div className="flex items-center justify-between mt-3">
        <button type="button" aria-label="Mês anterior" onClick={() => shift(-1)} className="p-1.5 rounded-lg hover:bg-white/5 text-[#a1a1aa]"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-semibold text-[#e8ffef]">{MONTHS[m - 1]} {y}</span>
        <button type="button" aria-label="Próximo mês" onClick={() => shift(1)} className="p-1.5 rounded-lg hover:bg-white/5 text-[#a1a1aa]"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mt-3 text-center">
        {WEEK.map((w, i) => <span key={i} className="text-[10px] text-[#71717a] font-bold">{w}</span>)}
        {Array.from({ length: offset }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: total }, (_, i) => {
          const date = `${ym}-${String(i + 1).padStart(2, '0')}`;
          const did = trained.has(date);
          return (
            <span key={date} title={did ? 'Treino realizado' : undefined}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs tabular-nums ${did ? 'bg-[#00ff66] text-[#04130a] font-bold' : 'text-[#a1a1aa]'} ${date === today ? 'ring-2 ring-[#00ff66]/60' : ''}`}>
              {did ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </span>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-[#a1a1aa]">{monthCount} {monthCount === 1 ? 'dia treinado' : 'dias treinados'} neste mês • sequência atual: {studentProfile.streakDays} {studentProfile.streakDays === 1 ? 'dia' : 'dias'}</p>
    </section>
  );
};
