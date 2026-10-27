import { useEffect, useState } from 'react';

const EXERCISE_CATALOG_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const EXERCISE_IMAGE_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';
const CACHE_PREFIX = 'exercise_img_';
const NOT_FOUND = '__exercise_image_not_found__';

type ExerciseRecord = { id: string; name: string };
type ExerciseImageState = { imageUrl: string; isLoading: boolean };

const FALLBACK_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" role="img" aria-label="Pessoa se exercitando">' +
      '<rect width="640" height="420" rx="28" fill="#111827"/>' +
      '<circle cx="320" cy="100" r="35" fill="#22c55e"/>' +
      '<path d="M285 145h70l38 112-48 14-25-72-26 72-48-14z" fill="#dcfce7"/>' +
      '<path d="m286 166-82 58m150-58 82 58M320 270l-48 96m48-96 48 96" fill="none" stroke="#dcfce7" stroke-width="20" stroke-linecap="round"/>' +
      '<path d="M192 216v18m-18-9h36m220-9v18m-18-9h36" fill="none" stroke="#22c55e" stroke-width="9" stroke-linecap="round"/>' +
      '<text x="320" y="398" text-anchor="middle" fill="#dcfce7" font-family="Arial,sans-serif" font-size="22">Imagem do exercício</text></svg>',
  );

const PORTUGUESE_ALIASES: Record<string, string[]> = {
  'supino reto com barra': ['Barbell Bench Press', 'Bench Press'],
  'supino inclinado com halteres': ['Dumbbell Incline Bench Press', 'Incline Dumbbell Press'],
  'crossover na polia media': ['Cable Crossover', 'Cable Standing Fly'],
  'elevacao lateral com halteres': ['Dumbbell Lateral Raise', 'Side Lateral Raise'],
  'triceps corda na polia': ['Triceps Pushdown', 'Cable Rope Triceps Pushdown'],
  'puxada alta pronada': ['Wide Grip Lat Pulldown', 'Lat Pulldown'],
  'remada curvada com barra': ['Bent Over Barbell Row', 'Barbell Bent Over Row'],
  'rosca direta barra w': ['EZ Bar Curl', 'Barbell Curl'],
  'rosca martelo com halteres': ['Dumbbell Hammer Curl', 'Hammer Curls'],
  'agachamento livre com barra': ['Barbell Squat', 'Barbell Full Squat'],
  'leg press 45': ['Leg Press'],
  'cadeira extensora': ['Leg Extensions', 'Leg Extension'],
  'panturrilha em pe no smith': ['Smith Machine Calf Raise', 'Standing Calf Raises'],
  'desenvolvimento militar com halteres': ['Dumbbell Shoulder Press', 'Seated Dumbbell Press'],
  'elevacao frontal na polia': ['Cable Front Raise', 'Cable Front Raises'],
  'abdominal infra na paralela': ['Hanging Leg Raise', 'Vertical Leg Raise'],
};

let catalogPromise: Promise<ExerciseRecord[]> | null = null;

function normalizeExerciseName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function getCatalog(): Promise<ExerciseRecord[]> {
  if (!catalogPromise) {
    catalogPromise = fetch(EXERCISE_CATALOG_URL)
      .then(response => {
        if (!response.ok) throw new Error('Não foi possível carregar as imagens.');
        return response.json() as Promise<ExerciseRecord[]>;
      })
      .catch(error => {
        catalogPromise = null;
        throw error;
      });
  }

  return catalogPromise;
}

function readCachedImage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function cacheImage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // A imagem continua funcionando mesmo se o navegador bloquear o cache.
  }
}

async function findExerciseImage(name: string, cacheKey: string): Promise<string> {
  const cached = readCachedImage(cacheKey);
  if (cached) return cached === NOT_FOUND ? FALLBACK_IMAGE : cached;

  const catalog = await getCatalog();
  const wantedNames = [
    name,
    ...(PORTUGUESE_ALIASES[normalizeExerciseName(name)] ?? []),
  ].map(normalizeExerciseName);

  const record = catalog.find(item =>
    wantedNames.includes(normalizeExerciseName(item.name)) ||
    wantedNames.includes(normalizeExerciseName(item.id.replace(/_/g, ' '))),
  );

  if (!record) {
    cacheImage(cacheKey, NOT_FOUND);
    return FALLBACK_IMAGE;
  }

  const imageUrl = EXERCISE_IMAGE_BASE + '/' + encodeURIComponent(record.id) + '/0.jpg';
  cacheImage(cacheKey, imageUrl);
  return imageUrl;
}

/**
 * Busca uma imagem para o exercício. Enquanto a busca acontece, isLoading
 * permite mostrar um skeleton; qualquer falha usa a ilustração incorporada.
 */
export function useExerciseImage(exerciseName: string): ExerciseImageState {
  const [imageUrl, setImageUrl] = useState(FALLBACK_IMAGE);
  const [isLoading, setIsLoading] = useState(Boolean(exerciseName));

  useEffect(() => {
    let cancelled = false;
    const name = exerciseName.trim();

    if (!name) {
      setImageUrl(FALLBACK_IMAGE);
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const cacheKey = CACHE_PREFIX + normalizeExerciseName(name);
    setIsLoading(true);

    findExerciseImage(name, cacheKey)
      .then(url => {
        if (!cancelled) setImageUrl(url);
      })
      .catch(() => {
        if (!cancelled) setImageUrl(FALLBACK_IMAGE);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [exerciseName]);

  return { imageUrl, isLoading };
}

export { FALLBACK_IMAGE };
