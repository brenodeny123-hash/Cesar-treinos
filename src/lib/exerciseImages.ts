/**
 * Imagens de execução (estilo "variações e músculos envolvidos").
 * Para adicionar uma nova, salve o arquivo em public/exercicios/ com o nome do exercício
 * em minúsculas, sem acento e com hífens. Ex.: "Supino Reto com Barra" -> supino-reto-com-barra.png
 * (também vale .jpg/.webp). Ou registre um atalho por palavra-chave em KEYWORD_IMAGES.
 */
export const exerciseSlug = (name: string): string =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Exercise-specific start/end frames from the open Workout Guide library.
const ARTWORK_SLUGS: Record<string, string> = {
  'supino-reto-com-barra': 'bench-press',
  'supino-inclinado-com-halteres': 'incline-dumbbell-press',
  'supino-declinado': 'decline-bench-press',
  'crossover-polia-media': 'cable-fly',
  'crossover-na-polia-media': 'cable-fly',
  'crucifixo-reto-com-halteres': 'dumbbell-fly',
  'puxada-alta-pronada': 'wide-grip-lat-pulldown',
  'remada-curvada-com-barra': 'barbell-row',
  'remada-baixa-no-triangulo': 'seated-row',
  'levantamento-terra': 'deadlift',
  'pulldown-na-polia': 'lat-pulldown',
  'agachamento-livre-com-barra': 'squat',
  'leg-press-45': 'leg-press',
  'cadeira-extensora': 'leg-extension',
  'mesa-flexora-deitado': 'lying-leg-curl',
  'cadeira-flexora': 'seated-leg-curl',
  'stiff-com-barra': 'romanian-deadlift',
  'panturrilha-em-pe-no-smith': 'standing-calf-raise',
  'desenvolvimento-militar-com-halteres': 'seated-dumbbell-press',
  'elevacao-lateral-com-halteres': 'lateral-raise',
  'elevacao-frontal-na-polia': 'cable-front-raise',
  'crucifixo-inverso-no-peck-deck': 'reverse-pec-deck',
  'rosca-direta-barra-w': 'ez-bar-curl',
  'rosca-martelo-com-halteres': 'hammer-curl',
  'rosca-scott-maquina': 'preacher-curl',
  'triceps-corda-na-polia': 'rope-tricep-pushdown',
  'triceps-testa-com-barra-w': 'skull-crusher',
  'triceps-frances-unilateral': 'single-arm-dumbbell-tricep-extension',
  'abdominal-infra-na-paralela': 'captains-chair-knee-raise',
  'prancha-isometrica': 'plank',
  'abdominal-supra-na-polia': 'cable-crunch',
};

/** Dois quadros locais para cada exercício cadastrado: posição inicial e final. */
export const exerciseArtworkFrames = (name: string): [string, string] | null => {
  const artworkSlug = ARTWORK_SLUGS[exerciseSlug(name)];
  if (!artworkSlug) return null;
  const base = `/exercicios/workout-guide/${artworkSlug}`;
  return [`${base}/frame-1.svg`, `${base}/frame-3.svg`];
};

export const KEYWORD_IMAGES: { test: RegExp; src: string; caption: string }[] = [
  { test: /agachamento|squat/i, src: '/referencia-agachamento.png', caption: 'Variações de agachamento e execução correta' },
];

/** Lista de caminhos para tentar, em ordem. */
export const exerciseImageCandidates = (name: string): string[] => {
  const slug = exerciseSlug(name);
  const list = ['png', 'jpg', 'webp'].map(ext => `/exercicios/${slug}.${ext}`);
  const kw = KEYWORD_IMAGES.find(k => k.test.test(name));
  if (kw) list.push(kw.src);
  return list;
};

export const exerciseCaption = (name: string): string =>
  KEYWORD_IMAGES.find(k => k.test.test(name))?.caption ?? 'Execução correta e músculos envolvidos';
