import React, { useMemo, useState } from 'react';
import { Bot, CheckCircle } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext.tsx';
import { generatePlan, type AnamneseAnswers } from '../lib/anamnese.ts';

type Step = { key: keyof AnamneseAnswers; q: string; options?: { label: string; value: string | number }[] };
const STEPS: Step[] = [
  {
    key: 'goal',
    q: 'Qual é o seu objetivo principal?',
    options: [
      { label: '💪 Hipertrofia', value: 'hipertrofia' },
      { label: '🔥 Emagrecimento', value: 'emagrecimento' },
      { label: '🏃 Condicionamento', value: 'condicionamento' },
      { label: '🏋️ Força', value: 'forca' },
    ],
  },
  {
    key: 'days',
    q: 'Quantos dias por semana você pode treinar?',
    options: [2, 3, 4, 5, 6].map(n => ({ label: `${n} dias`, value: n })),
  },
  {
    key: 'minutes',
    q: 'Quanto tempo você tem por sessão?',
    options: [30, 45, 60, 90].map(n => ({ label: `${n} min`, value: n })),
  },
  {
    key: 'level',
    q: 'Qual é o seu nível de experiência na academia?',
    options: [
      { label: '🟢 Iniciante (< 1 ano)', value: 'iniciante' },
      { label: '🟡 Intermediário (1–3 anos)', value: 'intermediario' },
      { label: '🔴 Avançado (3+ anos)', value: 'avancado' },
    ],
  },
];

const DEFAULT_PLAN_PROFILE: Omit<AnamneseAnswers, 'goal' | 'days' | 'minutes' | 'level'> = {
  age: 30,
  sex: 'outro',
  weight: 0,
  height: 0,
  restrictions: '',
  cardioHistory: 'nenhum',
  sleepHours: 7,
  stressLevel: 'medio',
  preferredEquipment: 'academia_completa',
  weakPoints: [],
  avoidExercises: '',
};

export const Anamnese: React.FC = () => {
  const { createRoutine } = useWorkout();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Partial<AnamneseAnswers>>({});
  const [log, setLog] = useState<{ from: 'bot' | 'user'; text: string }[]>([{ from: 'bot', text: STEPS[0].q }]);
  const [saved, setSaved] = useState(false);
  const done = i >= STEPS.length;
  const plan = useMemo(() => done ? generatePlan({
    ...DEFAULT_PLAN_PROFILE,
    goal: answers.goal ?? 'hipertrofia',
    days: answers.days ?? 3,
    minutes: answers.minutes ?? 60,
    level: answers.level ?? 'iniciante',
  }) : [], [done, answers]);

  const answer = (label: string, value: string | number) => {
    const key = STEPS[i].key;
    setAnswers({ ...answers, [key]: value } as Partial<AnamneseAnswers>);
    const next = i + 1;
    setLog([...log, { from: 'user', text: label }, { from: 'bot', text: next < STEPS.length ? STEPS[next].q : 'Pronto! Montei uma sugestão de fichas para o seu perfil.' }]);
    setI(next);
  };
  const restart = () => { setI(0); setAnswers({}); setLog([{ from: 'bot', text: STEPS[0].q }]); setSaved(false); };
  const save = () => { plan.forEach(r => createRoutine(r)); setSaved(true); };

  return (
    <section className="rounded-2xl bg-[#121214] border border-[#00ff66]/20 p-4 mb-4">
      <h2 className="font-display text-base font-bold text-[#e8ffef] flex items-center gap-2"><Bot className="w-4 h-4 text-[#00ff66]" /> Anamnese inteligente</h2>
      <p className="text-[11px] text-[#a1a1aa] mt-1">Responda e receba uma sugestão de ficha. As fichas são criadas automaticamente e podem ser editadas depois.</p>
      <div className="mt-3 space-y-2 max-h-64 overflow-y-auto no-scrollbar" aria-live="polite">
        {log.map((m, idx) => (
          <div key={idx} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <span className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] ${m.from === 'user' ? 'bg-[#00ff66] text-[#04130a] font-semibold' : 'bg-[#1c1c21] text-[#e8ffef]'}`}>{m.text}</span>
          </div>
        ))}
      </div>
      {!done && STEPS[i].options && (
        <div className="flex flex-wrap gap-2 mt-3">
          {STEPS[i].options!.map(o => (
            <button key={String(o.value)} type="button" onClick={() => answer(o.label, o.value)} className="px-3 py-2 rounded-xl border border-[#00ff66]/40 text-[#00ff66] text-xs font-semibold hover:bg-[#00ff66]/10 active:scale-95">{o.label}</button>
          ))}
        </div>
      )}
      {done && (
        <div className="mt-3 space-y-2">
          {plan.map(r => (
            <div key={r.code} className="rounded-xl bg-[#09090b] border border-white/5 px-3 py-2">
              <p className="text-sm font-bold text-[#e8ffef]">Ficha {r.code} — {r.title}</p>
              <p className="text-[11px] text-[#a1a1aa]">{r.exercises.length} exercícios • {r.focusMuscles}</p>
            </div>
          ))}
          <div className="rounded-xl bg-[#09090b] border border-white/5 px-3 py-2 text-[11px] text-[#a1a1aa] space-y-0.5">
            <p className="font-bold text-[#e8ffef] text-xs mb-1">Perfil coletado</p>
            <p>Objetivo: <strong>{answers.goal}</strong> • Dias por semana: <strong>{answers.days}</strong></p>
            <p>Tempo por sessão: <strong>{answers.minutes} min</strong> • Nível: <strong>{answers.level}</strong></p>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" disabled={saved} onClick={save} className="flex-1 py-2.5 rounded-xl bg-[#00ff66] text-[#04130a] text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-1.5">
              {saved ? <><CheckCircle className="w-4 h-4" /> Fichas criadas com sucesso!</> : 'Salvar fichas sugeridas'}
            </button>
            <button type="button" onClick={restart} className="px-3 rounded-xl border border-white/10 text-xs text-[#a1a1aa]">Refazer</button>
          </div>
        </div>
      )}
    </section>
  );
};
