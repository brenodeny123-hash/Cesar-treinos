/**
 * Imagens de execução (estilo "variações e músculos envolvidos").
 *
 * MAPEAMENTO PRIMÁRIO: slugs exatos via ARTWORK_SLUGS (nomes cadastrados no mockData).
 * MAPEAMENTO FUZZY: FUZZY_RULES com RegEx — cobre exercícios criados livremente pelo professor.
 *
 * Para adicionar uma nova imagem personalizada, salve em public/exercicios/<slug>.png e
 * registre um atalho em KEYWORD_IMAGES.
 */
export const exerciseSlug = (name: string): string =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ───────────────────────────────────────────────────────────────────────────────
// MAPEAMENTO EXATO (slugs dos exercícios do mockData)
// ───────────────────────────────────────────────────────────────────────────────
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

// ───────────────────────────────────────────────────────────────────────────────
// MAPEAMENTO FUZZY (RegEx) — cobre nomes livres criados pelo professor
// Ordem importa: mais específico primeiro.
// ───────────────────────────────────────────────────────────────────────────────
interface FuzzyRule { test: RegExp; artwork: string }

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const FUZZY_RULES: FuzzyRule[] = [
  // Peito
  { test: /supino.*declinado?|declin.*supino/,       artwork: 'decline-bench-press' },
  { test: /supino.*inclinado?|inclin.*supino|incline.*press|halter.*inclin/, artwork: 'incline-dumbbell-press' },
  { test: /supino/,                                   artwork: 'bench-press' },
  { test: /crossover|cross.?over|polia.*peito|fly.*cabo/, artwork: 'cable-fly' },
  { test: /crucifixo.*inverso|peck.?deck.*inverso|inverso.*peck/, artwork: 'reverse-pec-deck' },
  { test: /crucifixo|dumbbell.?fly|fly.*halter/,     artwork: 'dumbbell-fly' },
  // Costas
  { test: /puxada.*aberta|wide.?grip|puxada.*pronada/, artwork: 'wide-grip-lat-pulldown' },
  { test: /puxada|pulldown|lat.?pull/,               artwork: 'lat-pulldown' },
  { test: /remada.*curvada|remada.*barra|barbell.?row/, artwork: 'barbell-row' },
  { test: /remada.*baixa|remada.*triangulo|seated.?row|remada.*cabo/, artwork: 'seated-row' },
  { test: /remada/,                                   artwork: 'barbell-row' },
  { test: /levantamento.?terra|deadlift/,            artwork: 'deadlift' },
  // Pernas
  { test: /stiff|romeno|romanian/,                   artwork: 'romanian-deadlift' },
  { test: /agachamento|squat/,                       artwork: 'squat' },
  { test: /leg.?press/,                              artwork: 'leg-press' },
  { test: /extensora|leg.?extension|cadeira.*extens/, artwork: 'leg-extension' },
  { test: /mesa.?flexora|lying.*curl|flexora.*deitad/, artwork: 'lying-leg-curl' },
  { test: /cadeira.?flexora|seated.*curl|flexora.?sentad/, artwork: 'seated-leg-curl' },
  { test: /panturrilha|gemeos|calf.?raise|calf/,     artwork: 'standing-calf-raise' },
  // Ombros
  { test: /desenvolvimento|militar|shoulder.?press|dumbbell.?press|press.*halter/, artwork: 'seated-dumbbell-press' },
  { test: /elevacao.?lateral|lateral.?raise|elev.*lateral/, artwork: 'lateral-raise' },
  { test: /elevacao.?frontal|frontal.?raise|front.?raise|cabo.*frontal/, artwork: 'cable-front-raise' },
  // Bíceps
  { test: /rosca.?scott|preacher/,                   artwork: 'preacher-curl' },
  { test: /rosca.?martelo|hammer.?curl/,             artwork: 'hammer-curl' },
  { test: /rosca.?direta|ez.?bar|barra.?w|rosca.?barra/, artwork: 'ez-bar-curl' },
  // Tríceps
  { test: /triceps.?frances|french.?press|triceps.?unilateral/, artwork: 'single-arm-dumbbell-tricep-extension' },
  { test: /testa|skull.?crusher|triceps.?testa/,     artwork: 'skull-crusher' },
  { test: /corda|rope.*push|triceps.*corda|pushdown/, artwork: 'rope-tricep-pushdown' },
  // Abdômen / Core
  { test: /abdominal.?infra|infra.*abdom|elevacao.*perna|paralela|captain/, artwork: 'captains-chair-knee-raise' },
  { test: /prancha|plank/,                           artwork: 'plank' },
  { test: /abdominal.*polia|cable.?crunch|abdominal.?supra|polia.*abdom/, artwork: 'cable-crunch' },
];

/** Tenta encontrar SVGs via ARTWORK_SLUGS (exato) e depois via FUZZY_RULES (regex). */
export const exerciseArtworkFrames = (name: string): [string, string] | null => {
  // 1. Slug exato
  const slug = exerciseSlug(name);
  const exactArtwork = ARTWORK_SLUGS[slug];
  if (exactArtwork) {
    const base = `/exercicios/workout-guide/${exactArtwork}`;
    return [`${base}/frame-1.svg`, `${base}/frame-3.svg`];
  }

  // 2. Fuzzy RegEx — cobre exercícios criados livremente pelo professor
  const normalized = norm(name);
  const fuzzyRule = FUZZY_RULES.find(r => r.test.test(normalized));
  if (fuzzyRule) {
    const base = `/exercicios/workout-guide/${fuzzyRule.artwork}`;
    return [`${base}/frame-1.svg`, `${base}/frame-3.svg`];
  }

  return null;
};

export const KEYWORD_IMAGES: { test: RegExp; src: string; caption: string }[] = [
  { test: /agachamento|squat/i, src: '/referencia-agachamento.png', caption: 'Variações de agachamento e execução correta' },
];

/** Lista de caminhos para tentar, em ordem (fallback para imagens customizadas). */
export const exerciseImageCandidates = (name: string): string[] => {
  const slug = exerciseSlug(name);
  const list = ['png', 'jpg', 'webp'].map(ext => `/exercicios/${slug}.${ext}`);
  const kw = KEYWORD_IMAGES.find(k => k.test.test(name));
  if (kw) list.push(kw.src);
  return list;
};

export const exerciseCaption = (name: string): string =>
  KEYWORD_IMAGES.find(k => k.test.test(name))?.caption ?? 'Execução correta e músculos envolvidos';
