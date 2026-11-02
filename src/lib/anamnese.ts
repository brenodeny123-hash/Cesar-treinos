import type { ExerciseItem, WorkoutRoutine } from '../types/crm.ts';

export type Goal = 'hipertrofia' | 'emagrecimento' | 'condicionamento' | 'forca';
export type Level = 'iniciante' | 'intermediario' | 'avancado';

export interface AnamneseAnswers {
  goal: Goal;
  days: number;
  minutes: number;
  level: Level;
  age: number;
  sex: 'masculino' | 'feminino' | 'outro';
  weight: number;
  height: number;
  restrictions: string;
  cardioHistory: 'nenhum' | 'leve' | 'moderado' | 'intenso';
  sleepHours: number;
  stressLevel: 'baixo' | 'medio' | 'alto';
  preferredEquipment: 'academia_completa' | 'pesos_livres' | 'maquinas' | 'funcional';
  weakPoints: string[];
  avoidExercises: string;
}

type Group = ExerciseItem['muscleGroup'];
type Option = { name: string; avoid?: string[] };
type GeneratedRoutine = Omit<WorkoutRoutine, 'id'> & { notes: string };

const CATALOG: Record<Group, Option[]> = {
  Peito: [
    { name: 'Supino Reto com Barra', avoid: ['ombro'] },
    { name: 'Supino Inclinado com Halteres', avoid: ['ombro'] },
    { name: 'Crossover Polia Média' },
    { name: 'Crucifixo Reto com Halteres', avoid: ['ombro'] },
    { name: 'Supino Declinado com Barra', avoid: ['ombro'] },
    { name: 'Flexão de Braço', avoid: ['ombro'] },
  ],
  Costas: [
    { name: 'Puxada Frontal' },
    { name: 'Remada Baixa' },
    { name: 'Remada Unilateral com Halter' },
    { name: 'Remada Curvada', avoid: ['lombar', 'coluna'] },
    { name: 'Barra Fixa Pronada', avoid: ['ombro'] },
    { name: 'Puxada Alta com Triângulo' },
    { name: 'Remada Serrote com Halter', avoid: ['lombar'] },
  ],
  Pernas: [
    { name: 'Leg Press 45°', avoid: ['joelho'] },
    { name: 'Mesa Flexora' },
    { name: 'Cadeira Extensora', avoid: ['joelho'] },
    { name: 'Agachamento Livre', avoid: ['joelho', 'lombar', 'coluna'] },
    { name: 'Panturrilha em Pé' },
    { name: 'Agachamento Sumô com Halter', avoid: ['joelho', 'quadril'] },
    { name: 'Afundo com Halteres', avoid: ['joelho'] },
    { name: 'Stiff com Barra', avoid: ['lombar', 'coluna'] },
    { name: 'Leg Press Horizontal', avoid: ['joelho'] },
  ],
  'Glúteo': [
    { name: 'Elevação Pélvica' },
    { name: 'Cadeira Abdutora' },
    { name: 'Stiff com Halteres', avoid: ['lombar', 'coluna'] },
    { name: 'Agachamento Búlgaro', avoid: ['joelho'] },
    { name: 'Hip Thrust com Barra', avoid: ['lombar'] },
    { name: 'Extensão de Quadril na Polia' },
  ],
  Ombros: [
    { name: 'Elevação Lateral' },
    { name: 'Crucifixo Inverso' },
    { name: 'Desenvolvimento com Halteres', avoid: ['ombro'] },
    { name: 'Elevação Frontal com Halter', avoid: ['ombro'] },
    { name: 'Desenvolvimento Arnold', avoid: ['ombro'] },
    { name: 'Face Pull na Polia' },
  ],
  'Bíceps': [
    { name: 'Rosca Direta' },
    { name: 'Rosca Alternada com Halteres' },
    { name: 'Rosca Scott na Máquina' },
    { name: 'Rosca Concentrada com Halter' },
    { name: 'Rosca Martelo com Halteres' },
  ],
  'Tríceps': [
    { name: 'Tríceps Corda' },
    { name: 'Tríceps Testa', avoid: ['cotovelo'] },
    { name: 'Mergulho no Banco', avoid: ['ombro', 'cotovelo'] },
    { name: 'Tríceps Francês com Halter', avoid: ['cotovelo'] },
    { name: 'Pullover com Halter', avoid: ['ombro'] },
  ],
  'Abdômen': [
    { name: 'Prancha Abdominal' },
    { name: 'Abdominal Infra' },
    { name: 'Abdominal Supra na Polia', avoid: ['lombar'] },
    { name: 'Rotação com Disco', avoid: ['lombar'] },
    { name: 'Dead Bug' },
    { name: 'Elevação de Pernas Suspenso', avoid: ['lombar'] },
  ],
};

type Day = { code: string; title: string; groups: Group[] };
const FULL_A: Group[] = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Abdômen'];
const FULL_B: Group[] = ['Pernas', 'Costas', 'Peito', 'Glúteo', 'Bíceps', 'Tríceps'];

const SPLITS: Record<number, Day[]> = {
  2: [
    { code: 'A', title: 'Full Body A', groups: FULL_A },
    { code: 'B', title: 'Full Body B', groups: FULL_B },
  ],
  3: [
    { code: 'A', title: 'Full Body A', groups: FULL_A },
    { code: 'B', title: 'Full Body B', groups: FULL_B },
    { code: 'C', title: 'Full Body C', groups: ['Pernas', 'Ombros', 'Costas', 'Abdômen'] },
  ],
  4: [
    { code: 'A', title: 'Superiores A', groups: ['Peito', 'Costas', 'Ombros', 'Tríceps', 'Bíceps'] },
    { code: 'B', title: 'Inferiores A', groups: ['Pernas', 'Glúteo', 'Abdômen'] },
    { code: 'C', title: 'Superiores B', groups: ['Costas', 'Peito', 'Ombros', 'Bíceps', 'Tríceps'] },
    { code: 'D', title: 'Inferiores B', groups: ['Glúteo', 'Pernas', 'Abdômen'] },
  ],
  5: [
    { code: 'A', title: 'Peito e Tríceps', groups: ['Peito', 'Tríceps'] },
    { code: 'B', title: 'Costas e Bíceps', groups: ['Costas', 'Bíceps'] },
    { code: 'C', title: 'Pernas', groups: ['Pernas', 'Glúteo'] },
    { code: 'D', title: 'Ombros e Abdômen', groups: ['Ombros', 'Abdômen'] },
    { code: 'E', title: 'Full Body', groups: FULL_A },
  ],
  6: [
    { code: 'A', title: 'Empurrar A', groups: ['Peito', 'Ombros', 'Tríceps'] },
    { code: 'B', title: 'Puxar A', groups: ['Costas', 'Bíceps'] },
    { code: 'C', title: 'Pernas A', groups: ['Pernas', 'Glúteo', 'Abdômen'] },
    { code: 'D', title: 'Empurrar B', groups: ['Ombros', 'Peito', 'Tríceps'] },
    { code: 'E', title: 'Puxar B', groups: ['Costas', 'Bíceps'] },
    { code: 'F', title: 'Pernas B', groups: ['Glúteo', 'Pernas', 'Abdômen'] },
  ],
};

const PROFILE: Record<Goal, {
  sets: number;
  reps: string;
  rest: number;
  weeklyVolume: 'baixo' | 'medio' | 'alto';
  cardioNote: string;
}> = {
  hipertrofia: {
    sets: 4,
    reps: '8 a 12',
    rest: 75,
    weeklyVolume: 'medio',
    cardioNote: '2× cardio moderado de 20 min pós-treino',
  },
  emagrecimento: {
    sets: 3,
    reps: '12 a 15',
    rest: 45,
    weeklyVolume: 'alto',
    cardioNote: '3–4× cardio de 30–40 min (HIIT ou esteira)',
  },
  condicionamento: {
    sets: 3,
    reps: '15 a 20',
    rest: 30,
    weeklyVolume: 'alto',
    cardioNote: '4–5× cardio aeróbico de 30 min',
  },
  forca: {
    sets: 5,
    reps: '3 a 6',
    rest: 180,
    weeklyVolume: 'baixo',
    cardioNote: '1–2× cardio leve de 15 min (não no dia de treino pesado)',
  },
};

const normalize = (value: string): string =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const isFunctional = (name: string): boolean =>
  /(prancha|elastico|suspensao|kettlebell)/.test(normalize(name));

const RECOVERY_NOTE =
  'Volume reduzido automaticamente: estresse alto ou sono insuficiente. Considere ajustar após 2 semanas.';

/** Gera sugestões de ficha a partir do perfil e das preferências informadas. */
export function generatePlan(a: AnamneseAnswers): GeneratedRoutine[] {
  const days = Math.min(6, Math.max(2, Math.round(a.days)));
  const dayPlans = SPLITS[days] ?? SPLITS[3];
  const profile = PROFILE[a.goal];

  let sets = profile.sets;
  let reps = profile.reps;
  let rest = profile.rest;

  if (a.level === 'iniciante' && a.goal === 'forca') {
    sets = 3;
    reps = '4 a 6';
  }
  if (a.level === 'avancado' && a.goal === 'hipertrofia') {
    sets = Math.min(5, sets + 1);
  }
  if (a.level === 'avancado' && a.goal === 'emagrecimento') {
    rest = 35;
  }

  if (a.age >= 50) {
    sets = Math.max(2, sets - 1);
    rest += 15;
  }
  if (a.age < 18) {
    sets = 3;
    reps = '12 a 15';
  }

  const recoveryAdjustment = a.stressLevel === 'alto' || a.sleepHours < 6;
  if (recoveryAdjustment) rest += 15;

  const timeBasedExerciseCount =
    a.minutes <= 30 ? 4 : a.minutes <= 45 ? 5 : a.minutes <= 60 ? 6 : 8;
  const volumeAdjustment = profile.weeklyVolume === 'alto' ? 1 : profile.weeklyVolume === 'baixo' ? -1 : 0;
  const exerciseLimit = Math.max(
    2,
    timeBasedExerciseCount + volumeAdjustment - (recoveryAdjustment ? 1 : 0),
  );

  const normalizedRestrictions = normalize(a.restrictions);
  const blockedNames = a.avoidExercises
    .split(',')
    .map(normalize)
    .filter(term => term && term !== 'nenhum');
  const weakPoints = a.weakPoints
    .map(normalize)
    .filter(point => point && point !== 'nenhum');

  const equipment = a.preferredEquipment;
  const filterOptions = (group: Group): Option[] => {
    let options = CATALOG[group].filter(option => {
      const blockedByRestriction = (option.avoid ?? []).some(term =>
        normalizedRestrictions.includes(normalize(term)),
      );
      const normalizedName = normalize(option.name);
      const explicitlyAvoided = blockedNames.some(term => normalizedName.includes(term));
      return !blockedByRestriction && !explicitlyAvoided;
    });

    if (equipment === 'pesos_livres') {
      options = options.filter(option => !/(maquina|cadeira)/.test(normalize(option.name)));
    }
    if (equipment === 'maquinas') {
      options = options.filter(option => !/(halter|barra livre)/.test(normalize(option.name)));
    }

    const preferenceScore = (name: string): number => {
      const normalizedName = normalize(name);
      if (equipment === 'pesos_livres') return /(halter|barra)/.test(normalizedName) ? 1 : 0;
      if (equipment === 'maquinas') return /(maquina|cadeira|mesa|leg press)/.test(normalizedName) ? 1 : 0;
      if (equipment === 'funcional') return isFunctional(normalizedName) ? 1 : 0;
      return 0;
    };

    return options.sort((left, right) =>
      preferenceScore(right.name) - preferenceScore(left.name),
    );
  };

  const recoveryNotes = recoveryAdjustment ? ' ' + RECOVERY_NOTE : '';
  const routineStamp = Date.now();

  return dayPlans.map((day, dayIndex) => {
    const routineGroups = [...day.groups];
    if (equipment === 'funcional' && !routineGroups.includes('Abdômen')) {
      routineGroups.push('Abdômen');
    }

    const isWeakGroup = (group: Group): boolean => {
      const normalizedGroup = normalize(group);
      return weakPoints.some(point =>
        normalizedGroup.includes(point) || point.includes(normalizedGroup),
      );
    };

    const weakGroups = routineGroups.filter(isWeakGroup);
    if (equipment === 'funcional') {
      weakGroups.sort((left, right) => Number(right === 'Abdômen') - Number(left === 'Abdômen'));
    }
    const otherGroups = routineGroups.filter(group => !isWeakGroup(group));
    const used = new Set<string>();
    const exercises: ExerciseItem[] = [];
    const optionsByGroup = new Map<Group, Option[]>(
      routineGroups.map(group => [group, filterOptions(group)] as const),
    );

    const addExercise = (group: Group, option: Option) => {
      const exerciseIndex = exercises.length;
      const exerciseId = 'ex-' + routineStamp + '-' + dayIndex + '-' + exerciseIndex;
      exercises.push({
        id: exerciseId,
        name: option.name,
        muscleGroup: group,
        targetSets: sets,
        targetReps: reps,
        defaultRestSec: rest,
        sets: Array.from({ length: sets }, (_, setIndex) => ({
          id: 'set-' + routineStamp + '-' + dayIndex + '-' + exerciseIndex + '-' + setIndex,
          setNumber: setIndex + 1,
          weightKg: 0,
          reps: parseInt(reps, 10),
          completed: false,
        })),
      });
      used.add(option.name);
    };

    const fillGroups = (groups: Group[], limit: number) => {
      for (let round = 0; round < 12 && exercises.length < limit; round++) {
        for (const group of groups) {
          if (exercises.length >= limit) break;
          const option = (optionsByGroup.get(group) ?? []).find(item => !used.has(item.name));
          if (option) addExercise(group, option);
        }
      }
    };

    const functionalOption = equipment === 'funcional'
      ? (optionsByGroup.get('Abdômen') ?? []).find(option => isFunctional(option.name))
      : undefined;
    const needsFunctionalSlot =
      Boolean(functionalOption) && !weakGroups.includes('Abdômen');
    fillGroups(weakGroups, needsFunctionalSlot ? Math.max(0, exerciseLimit - 1) : exerciseLimit);

    if (functionalOption && !used.has(functionalOption.name) && exercises.length < exerciseLimit) {
      addExercise('Abdômen', functionalOption);
    }
    fillGroups(otherGroups, exerciseLimit);

    const notes = profile.cardioNote + recoveryNotes;
    return {
      code: day.code,
      title: day.title,
      focusMuscles: routineGroups.join(' • '),
      estimatedMinutes: a.minutes,
      exercises,
      color: '#00ff66',
      approval: 'pending' as const,
      notes,
    };
  });
}

