export type MuscleRegion =
  | 'peito'
  | 'deltoid-front'
  | 'deltoid-side'
  | 'triceps'
  | 'biceps'
  | 'lat'
  | 'trapezio'
  | 'quadriceps'
  | 'posterior-coxa'
  | 'gluteo'
  | 'panturrilha'
  | 'abdomen'
  | 'adutores';

export type MuscleView = 'front' | 'back';

export interface MuscleHighlight {
  primary: MuscleRegion[];
  secondary: MuscleRegion[];
  view: MuscleView;
  label: string;
}

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const muscleGroupMap: Record<string, MuscleHighlight> = {
  peito: { primary: ['peito'], secondary: ['triceps'], view: 'front', label: 'Peitoral' },
  ombros: {
    primary: ['deltoid-front', 'deltoid-side'],
    secondary: ['triceps'],
    view: 'front',
    label: 'Deltoides',
  },
  triceps: { primary: ['triceps'], secondary: ['peito'], view: 'front', label: 'Tríceps' },
  costas: {
    primary: ['lat', 'trapezio'],
    secondary: ['biceps'],
    view: 'back',
    label: 'Costas',
  },
  biceps: { primary: ['biceps'], secondary: ['deltoid-side'], view: 'front', label: 'Bíceps' },
  pernas: {
    primary: ['quadriceps'],
    secondary: ['gluteo'],
    view: 'front',
    label: 'Quadríceps',
  },
  quadriceps: {
    primary: ['quadriceps'],
    secondary: ['gluteo'],
    view: 'front',
    label: 'Quadríceps',
  },
  posterior: {
    primary: ['posterior-coxa'],
    secondary: ['gluteo'],
    view: 'back',
    label: 'Posterior da coxa',
  },
  panturrilha: {
    primary: ['panturrilha'],
    secondary: ['posterior-coxa'],
    view: 'back',
    label: 'Panturrilha',
  },
  gluteo: { primary: ['gluteo'], secondary: ['posterior-coxa'], view: 'back', label: 'Glúteo' },
  abdomen: { primary: ['abdomen'], secondary: ['peito'], view: 'front', label: 'Abdômen' },
};

const EXERCISE_RULES: Array<{ words: string[]; highlight: MuscleHighlight }> = [
  { words: ['mesa flexora', 'stiff', 'posterior de coxa'], highlight: muscleGroupMap.posterior },
  { words: ['panturrilha', 'gemeos'], highlight: muscleGroupMap.panturrilha },
  {
    words: ['abducao', 'aducao', 'elevacao pelvica', 'hip thrust'],
    highlight: { primary: ['gluteo'], secondary: ['adutores'], view: 'back', label: 'Glúteos' },
  },
  { words: ['remada', 'puxada', 'pulldown', 'serrote'], highlight: muscleGroupMap.costas },
  { words: ['rosca', 'biceps'], highlight: muscleGroupMap.biceps },
  { words: ['triceps', 'pulley', 'mergulho', 'frances'], highlight: muscleGroupMap.triceps },
  {
    words: ['desenvolvimento', 'elevacao lateral', 'elevacao frontal'],
    highlight: muscleGroupMap.ombros,
  },
  { words: ['supino', 'crucifixo', 'crossover'], highlight: muscleGroupMap.peito },
  {
    words: ['agachamento', 'leg press', 'cadeira extensora'],
    highlight: muscleGroupMap.quadriceps,
  },
];

export function getMuscleHighlight(exerciseName: string, muscleGroup?: string): MuscleHighlight {
  const normalizedName = normalize(exerciseName);
  const exerciseRule = EXERCISE_RULES.find(rule =>
    rule.words.some(word => normalizedName.includes(normalize(word))),
  );
  if (exerciseRule) return exerciseRule.highlight;

  const normalizedGroup = normalize(muscleGroup || '');
  return muscleGroupMap[normalizedGroup] || muscleGroupMap.peito;
}

export function getMuscleRegionFill(
  region: MuscleRegion,
  highlight: MuscleHighlight,
): string {
  if (highlight.primary.includes(region)) return '#ef4444';
  if (highlight.secondary.includes(region)) return '#f97316';
  return '#374151';
}
