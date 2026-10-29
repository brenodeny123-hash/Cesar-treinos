import type { ExerciseItem, WorkoutRoutine } from '../types/crm.ts';

export type Goal = 'hipertrofia' | 'emagrecimento' | 'condicionamento';
export type Level = 'iniciante' | 'intermediario' | 'avancado';
export interface AnamneseAnswers { goal: Goal; days: number; minutes: number; level: Level; restrictions: string }

type Group = ExerciseItem['muscleGroup'];
type Option = { name: string; avoid?: string[] };

// "avoid" = palavras da restrição informada que excluem o exercício.
const CATALOG: Record<Group, Option[]> = {
  Peito: [{ name: 'Supino Reto com Barra', avoid: ['ombro'] }, { name: 'Supino Inclinado com Halteres', avoid: ['ombro'] }, { name: 'Crossover Polia Média' }, { name: 'Crucifixo Reto com Halteres', avoid: ['ombro'] }],
  Costas: [{ name: 'Puxada Frontal' }, { name: 'Remada Baixa' }, { name: 'Remada Unilateral com Halter' }, { name: 'Remada Curvada', avoid: ['lombar', 'coluna'] }],
  Pernas: [{ name: 'Leg Press 45°', avoid: ['joelho'] }, { name: 'Mesa Flexora' }, { name: 'Cadeira Extensora', avoid: ['joelho'] }, { name: 'Agachamento Livre', avoid: ['joelho', 'lombar', 'coluna'] }, { name: 'Panturrilha em Pé' }],
  Glúteo: [{ name: 'Elevação Pélvica' }, { name: 'Cadeira Abdutora' }, { name: 'Stiff com Halteres', avoid: ['lombar', 'coluna'] }],
  Ombros: [{ name: 'Elevação Lateral' }, { name: 'Crucifixo Inverso' }, { name: 'Desenvolvimento com Halteres', avoid: ['ombro'] }],
  Bíceps: [{ name: 'Rosca Direta' }, { name: 'Rosca Alternada com Halteres' }],
  Tríceps: [{ name: 'Tríceps Corda' }, { name: 'Tríceps Testa', avoid: ['cotovelo'] }],
  Abdômen: [{ name: 'Prancha Abdominal' }, { name: 'Abdominal Infra' }],
};

type Day = { code: string; title: string; groups: Group[] };
const FULL_A: Group[] = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Abdômen'];
const FULL_B: Group[] = ['Pernas', 'Costas', 'Peito', 'Glúteo', 'Bíceps', 'Tríceps'];
const SPLITS: Record<number, Day[]> = {
  2: [{ code: 'A', title: 'Full Body A', groups: FULL_A }, { code: 'B', title: 'Full Body B', groups: FULL_B }],
  3: [{ code: 'A', title: 'Full Body A', groups: FULL_A }, { code: 'B', title: 'Full Body B', groups: FULL_B }, { code: 'C', title: 'Full Body C', groups: ['Pernas', 'Ombros', 'Costas', 'Abdômen'] }],
  4: [{ code: 'A', title: 'Superiores A', groups: ['Peito', 'Costas', 'Ombros', 'Tríceps', 'Bíceps'] }, { code: 'B', title: 'Inferiores A', groups: ['Pernas', 'Glúteo', 'Abdômen'] }, { code: 'C', title: 'Superiores B', groups: ['Costas', 'Peito', 'Ombros', 'Bíceps', 'Tríceps'] }, { code: 'D', title: 'Inferiores B', groups: ['Glúteo', 'Pernas', 'Abdômen'] }],
  5: [{ code: 'A', title: 'Peito e Tríceps', groups: ['Peito', 'Tríceps'] }, { code: 'B', title: 'Costas e Bíceps', groups: ['Costas', 'Bíceps'] }, { code: 'C', title: 'Pernas', groups: ['Pernas', 'Glúteo'] }, { code: 'D', title: 'Ombros e Abdômen', groups: ['Ombros', 'Abdômen'] }, { code: 'E', title: 'Full Body', groups: FULL_A }],
  6: [{ code: 'A', title: 'Empurrar A', groups: ['Peito', 'Ombros', 'Tríceps'] }, { code: 'B', title: 'Puxar A', groups: ['Costas', 'Bíceps'] }, { code: 'C', title: 'Pernas A', groups: ['Pernas', 'Glúteo', 'Abdômen'] }, { code: 'D', title: 'Empurrar B', groups: ['Ombros', 'Peito', 'Tríceps'] }, { code: 'E', title: 'Puxar B', groups: ['Costas', 'Bíceps'] }, { code: 'F', title: 'Pernas B', groups: ['Glúteo', 'Pernas', 'Abdômen'] }],
};

const PROFILE: Record<Goal, { sets: number; reps: string; rest: number }> = {
  hipertrofia: { sets: 4, reps: '8-12', rest: 75 },
  emagrecimento: { sets: 3, reps: '12-15', rest: 45 },
  condicionamento: { sets: 3, reps: '15-20', rest: 30 },
};

/** Sugestão gerada por regras. Sempre criada como "pendente" para o professor revisar. */
export function generatePlan(a: AnamneseAnswers): Omit<WorkoutRoutine, 'id'>[] {
  const days = Math.min(6, Math.max(2, Math.round(a.days)));
  const perSession = a.minutes <= 30 ? 4 : a.minutes <= 45 ? 5 : a.minutes <= 60 ? 6 : 8;
  const restr = a.restrictions.toLowerCase();
  const base = PROFILE[a.goal];
  const sets = a.level === 'iniciante' ? Math.max(2, base.sets - 1) : a.level === 'avancado' ? Math.min(5, base.sets + 1) : base.sets;
  const stamp = Date.now();

  return SPLITS[days].map((day, di) => {
    const used = new Set<string>();
    const exercises: ExerciseItem[] = [];
    for (let round = 0; round < 4 && exercises.length < perSession; round++) {
      for (const group of day.groups) {
        if (exercises.length >= perSession) break;
        const opt = CATALOG[group].find(e => !used.has(e.name) && !(e.avoid ?? []).some(k => restr.includes(k)));
        if (!opt) continue;
        used.add(opt.name);
        const n = exercises.length;
        exercises.push({
          id: `ex-${stamp}-${di}-${n}`, name: opt.name, muscleGroup: group,
          targetSets: sets, targetReps: base.reps, defaultRestSec: base.rest,
          sets: Array.from({ length: sets }, (_, s) => ({ id: `set-${stamp}-${di}-${n}-${s}`, setNumber: s + 1, weightKg: 0, reps: parseInt(base.reps, 10), completed: false })),
        });
      }
    }
    return { code: day.code, title: day.title, focusMuscles: day.groups.join(' • '), estimatedMinutes: a.minutes, exercises, color: '#00ff66', approval: 'pending' as const };
  });
}
