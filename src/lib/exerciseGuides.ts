export type MuscleKey =
  | 'chest' | 'shoulders' | 'biceps' | 'triceps' | 'forearms' | 'abs' | 'obliques'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'traps' | 'lats' | 'lowerback';

export const MUSCLE_LABEL: Record<MuscleKey, string> = {
  chest: 'Peitoral', shoulders: 'Ombros (deltoides)', biceps: 'Bíceps', triceps: 'Tríceps', forearms: 'Antebraço',
  abs: 'Abdômen', obliques: 'Oblíquos', quads: 'Quadríceps (frente da coxa)', hamstrings: 'Posterior de coxa',
  glutes: 'Glúteos', calves: 'Panturrilhas', traps: 'Trapézio', lats: 'Dorsais (costas)', lowerback: 'Lombar',
};

export interface ExerciseGuideData {
  primary: MuscleKey[];
  secondary: MuscleKey[];
  steps: string[];
  tips: string[];
  mistakes: string[];
}

interface Rule extends ExerciseGuideData { test: RegExp }

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const RULES: Rule[] = [
  { test: /supino.*declinad/, primary: ['chest'], secondary: ['triceps', 'shoulders'],
    steps: ['Deite no banco declinado e prenda bem os pés.', 'Segure a barra um pouco mais aberta que os ombros.', 'Desça a barra até a parte baixa do peito, com controle.', 'Empurre para cima sem travar os cotovelos.'],
    tips: ['Escápulas juntas e peito aberto durante todo o movimento.'], mistakes: ['Quicar a barra no peito.', 'Tirar o quadril do banco.'] },
  { test: /supino.*inclinad/, primary: ['chest', 'shoulders'], secondary: ['triceps'],
    steps: ['Ajuste o banco entre 30° e 45° e sente com as costas apoiadas.', 'Com um halter em cada mão, leve-os à altura do peito, cotovelos levemente abertos.', 'Empurre para cima aproximando os halteres no topo.', 'Desça devagar (2 a 3 segundos) até sentir o peito alongar.'],
    tips: ['Não deixe os ombros subirem em direção às orelhas.'], mistakes: ['Inclinar demais o banco (vira exercício de ombro).', 'Descer rápido demais.'] },
  { test: /supino/, primary: ['chest'], secondary: ['triceps', 'shoulders'],
    steps: ['Deite no banco com os olhos alinhados à barra e os pés firmes no chão.', 'Segure a barra um pouco mais aberta que os ombros e junte as escápulas.', 'Desça a barra com controle até tocar de leve a parte média do peito.', 'Empurre para cima até estender os braços, sem travar os cotovelos.'],
    tips: ['Mantenha os punhos retos, alinhados com os antebraços.', 'Expire ao empurrar.'], mistakes: ['Tirar o glúteo do banco.', 'Abrir demais os cotovelos (cuidado com o ombro).'] },
  { test: /crossover|cross over|polia.*peito/, primary: ['chest'], secondary: ['shoulders'],
    steps: ['Fique no centro das polias, um pé à frente, tronco levemente inclinado.', 'Com os cotovelos levemente flexionados, abra os braços até sentir o peito alongar.', 'Traga as mãos para a frente do corpo, como um abraço, contraindo o peito.', 'Volte devagar, sem deixar o peso bater.'],
    tips: ['Mantenha o ângulo dos cotovelos fixo: o movimento é do ombro, não do cotovelo.'], mistakes: ['Usar o corpo para jogar o peso.', 'Dobrar e esticar os cotovelos como se fosse tríceps.'] },
  { test: /crucifixo.*inverso|peck deck.*inverso|inverso/, primary: ['shoulders', 'traps'], secondary: ['lats'],
    steps: ['Sente de frente para o apoio do aparelho, peito encostado.', 'Segure as manoplas com os cotovelos levemente flexionados.', 'Abra os braços para trás até a linha dos ombros.', 'Volte devagar, controlando o peso.'],
    tips: ['Pense em levar os cotovelos para trás, não as mãos.'], mistakes: ['Encolher os ombros.', 'Usar carga que faz o tronco balançar.'] },
  { test: /crucifixo/, primary: ['chest'], secondary: ['shoulders'],
    steps: ['Deite no banco com um halter em cada mão, braços estendidos sobre o peito.', 'Abra os braços em arco, cotovelos levemente dobrados, até sentir o peito alongar.', 'Feche o arco trazendo os halteres de volta para cima do peito.'],
    tips: ['Carga moderada: o foco é o alongamento do peitoral.'], mistakes: ['Descer além da linha do ombro.', 'Esticar totalmente os cotovelos.'] },
  { test: /puxada|pulldown|barra fixa/, primary: ['lats'], secondary: ['biceps', 'forearms', 'traps'],
    steps: ['Sente com as coxas firmes sob o apoio e segure a barra mais aberta que os ombros.', 'Incline o tronco levemente para trás e puxe a barra até a altura do queixo/clavícula.', 'Leve os cotovelos para baixo e para trás, apertando as costas.', 'Suba a barra devagar até esticar os braços, sem soltar o peso.'],
    tips: ['Imagine puxar com os cotovelos, não com as mãos.'], mistakes: ['Puxar a barra atrás da nuca.', 'Balançar o tronco para ganhar impulso.'] },
  { test: /remada.*curvada|remada.*barra/, primary: ['lats', 'traps'], secondary: ['biceps', 'lowerback', 'shoulders'],
    steps: ['Segure a barra, joelhos semiflexionados e tronco inclinado (~45°) com a coluna reta.', 'Puxe a barra em direção ao umbigo, cotovelos junto ao corpo.', 'Aperte as escápulas por um instante no topo.', 'Desça controlando, sem arredondar as costas.'],
    tips: ['Olhar para o chão, pescoço alinhado à coluna.'], mistakes: ['Arredondar a lombar.', 'Subir o tronco para puxar a carga.'] },
  { test: /remada/, primary: ['lats', 'traps'], secondary: ['biceps', 'lowerback'],
    steps: ['Sente com os pés apoiados, joelhos levemente flexionados e coluna ereta.', 'Puxe o triângulo em direção ao abdômen, cotovelos rentes ao corpo.', 'Junte as escápulas e segure 1 segundo.', 'Estenda os braços devagar, sem curvar as costas.'],
    tips: ['Peito aberto durante toda a série.'], mistakes: ['Balançar o tronco para frente e para trás.', 'Encolher os ombros.'] },
  { test: /levantamento terra|terra|deadlift/, primary: ['hamstrings', 'glutes', 'lowerback'], secondary: ['traps', 'lats', 'quads', 'forearms'],
    steps: ['Pés na largura do quadril, barra sobre o meio dos pés.', 'Flexione quadril e joelhos, segure a barra e mantenha a coluna neutra.', 'Empurre o chão com os pés e estenda quadril e joelhos juntos, barra rente às pernas.', 'Desça o quadril para trás, controlando a barra até o chão.'],
    tips: ['Barra sempre encostada no corpo.', 'Respire fundo e firme o abdômen antes de subir.'], mistakes: ['Arredondar a coluna.', 'Puxar a barra com os braços em vez de empurrar o chão.'] },
  { test: /stiff|romeno/, primary: ['hamstrings', 'glutes'], secondary: ['lowerback'],
    steps: ['Em pé, segure a barra à frente das coxas, joelhos levemente flexionados.', 'Leve o quadril para trás e desça a barra rente às pernas, coluna reta.', 'Desça até sentir o posterior da coxa alongar (geralmente abaixo do joelho).', 'Volte contraindo o glúteo e levando o quadril à frente.'],
    tips: ['O movimento é de dobradiça no quadril, não de agachar.'], mistakes: ['Arredondar as costas.', 'Dobrar demais os joelhos.'] },
  { test: /agachamento|squat/, primary: ['quads', 'glutes'], secondary: ['hamstrings', 'lowerback', 'abs', 'calves'],
    steps: ['Posicione a barra sobre o trapézio, pés na largura dos ombros, pontas levemente abertas.', 'Respire fundo, firme o abdômen e leve o quadril para trás e para baixo.', 'Desça até as coxas ficarem paralelas ao chão (ou o máximo confortável), joelhos na direção dos pés.', 'Empurre o chão e suba estendendo quadril e joelhos juntos.'],
    tips: ['Calcanhares sempre apoiados no chão.', 'Peito aberto e olhar à frente.'], mistakes: ['Joelhos entrando para dentro.', 'Arredondar a lombar na descida.'] },
  { test: /leg press|legpress/, primary: ['quads', 'glutes'], secondary: ['hamstrings', 'calves'],
    steps: ['Sente com as costas e o quadril totalmente apoiados no encosto.', 'Pés na largura dos ombros na plataforma, joelhos alinhados com os pés.', 'Destrave e desça até os joelhos formarem cerca de 90°.', 'Empurre a plataforma sem travar os joelhos no final.'],
    tips: ['Pés mais altos na plataforma = mais glúteo e posterior; mais baixos = mais quadríceps.'], mistakes: ['Tirar o quadril do banco na descida.', 'Travar os joelhos no topo.'] },
  { test: /extensora/, primary: ['quads'], secondary: [],
    steps: ['Ajuste o encosto para o joelho ficar alinhado com o eixo do aparelho.', 'Posicione o apoio logo acima dos pés.', 'Estenda as pernas até quase esticar os joelhos e segure 1 segundo.', 'Desça devagar, sem deixar o peso descansar na pilha.'],
    tips: ['Contraia bem a frente da coxa no topo.'], mistakes: ['Usar impulso para subir.', 'Levantar o quadril do banco.'] },
  { test: /flexora|mesa flexora/, primary: ['hamstrings'], secondary: ['calves', 'glutes'],
    steps: ['Ajuste o aparelho: o joelho alinhado com o eixo e o apoio logo acima dos calcanhares.', 'Flexione os joelhos trazendo o apoio em direção ao glúteo.', 'Segure 1 segundo contraindo o posterior da coxa.', 'Volte devagar até quase esticar as pernas.'],
    tips: ['Mantenha o quadril colado no banco.'], mistakes: ['Arquear a lombar.', 'Soltar o peso na volta.'] },
  { test: /panturrilha|gemeos|calf/, primary: ['calves'], secondary: [],
    steps: ['Apoie a ponta dos pés na plataforma, ombros sob o apoio, joelhos quase esticados.', 'Desça os calcanhares alongando bem a panturrilha.', 'Suba na ponta dos pés o mais alto que conseguir e segure 1 segundo.', 'Desça devagar.'],
    tips: ['Amplitude completa vale mais que muita carga.'], mistakes: ['Fazer repetições curtas e rápidas.', 'Flexionar os joelhos para ajudar.'] },
  { test: /desenvolvimento|militar|ombro.*press/, primary: ['shoulders'], secondary: ['triceps', 'traps'],
    steps: ['Sentado com as costas apoiadas, leve os halteres à altura das orelhas, cotovelos a ~90°.', 'Empurre os halteres para cima até quase estender os braços.', 'Desça devagar até a altura das orelhas.'],
    tips: ['Abdômen firme para não arquear a lombar.'], mistakes: ['Arquear demais as costas.', 'Bater os halteres no topo.'] },
  { test: /elevacao lateral|lateral/, primary: ['shoulders'], secondary: ['traps'],
    steps: ['Em pé, halteres ao lado do corpo, cotovelos levemente flexionados.', 'Eleve os braços para os lados até a altura dos ombros.', 'Segure 1 segundo e desça devagar.'],
    tips: ['Imagine despejar uma jarra de água: o dedo mínimo sobe um pouco mais que o polegar.'], mistakes: ['Balançar o corpo.', 'Subir acima da linha do ombro encolhendo o trapézio.'] },
  { test: /elevacao frontal|frontal/, primary: ['shoulders'], secondary: ['chest'],
    steps: ['Em pé, de costas para a polia ou com a barra/halter à frente das coxas.', 'Eleve o braço à frente até a altura dos ombros, cotovelo levemente flexionado.', 'Desça devagar, sem relaxar a tensão.'],
    tips: ['Tronco parado, sem se inclinar para trás.'], mistakes: ['Usar impulso do corpo.', 'Subir acima da altura dos olhos.'] },
  { test: /rosca.*martelo|martelo/, primary: ['biceps', 'forearms'], secondary: [],
    steps: ['Em pé, halteres ao lado do corpo com as palmas voltadas uma para a outra.', 'Flexione os cotovelos levando os halteres aos ombros, sem girar o punho.', 'Desça devagar até esticar os braços.'],
    tips: ['Cotovelos colados ao tronco.'], mistakes: ['Balançar o tronco.', 'Deixar os cotovelos irem à frente.'] },
  { test: /rosca/, primary: ['biceps'], secondary: ['forearms'],
    steps: ['Em pé, segure a barra com as palmas para cima, cotovelos junto ao corpo.', 'Flexione os cotovelos trazendo a barra até a altura dos ombros.', 'Aperte o bíceps no topo e desça devagar até quase esticar os braços.'],
    tips: ['Só o antebraço se move; ombros e cotovelos ficam parados.'], mistakes: ['Jogar o corpo para trás para subir a carga.', 'Descer rápido.'] },
  { test: /triceps.*(corda|polia|pulley)|corda/, primary: ['triceps'], secondary: [],
    steps: ['De frente para a polia alta, cotovelos colados ao corpo e tronco levemente inclinado.', 'Estenda os braços para baixo, abrindo as pontas da corda no final.', 'Segure 1 segundo contraindo o tríceps e volte devagar até 90°.'],
    tips: ['Os cotovelos não saem do lugar.'], mistakes: ['Deixar os cotovelos abrirem.', 'Usar o peso do corpo para empurrar.'] },
  { test: /triceps.*testa|testa/, primary: ['triceps'], secondary: ['shoulders'],
    steps: ['Deite no banco segurando a barra W com os braços estendidos sobre o peito.', 'Flexione apenas os cotovelos levando a barra em direção à testa.', 'Estenda os braços de volta, sem mexer os ombros.'],
    tips: ['Cotovelos apontados para o teto, sempre na mesma posição.'], mistakes: ['Abrir os cotovelos.', 'Descer com a carga rápido demais.'] },
  { test: /triceps|frances/, primary: ['triceps'], secondary: [],
    steps: ['Segure um halter com as duas mãos (ou uma) acima da cabeça, cotovelo apontando para cima.', 'Desça o halter atrás da cabeça flexionando só o cotovelo.', 'Estenda o braço de volta, apertando o tríceps no topo.'],
    tips: ['Mantenha o cotovelo próximo à cabeça.'], mistakes: ['Arquear a lombar.', 'Mover o ombro junto.'] },
  { test: /abdominal.*infra|infra|elevacao de pernas|paralela/, primary: ['abs'], secondary: ['obliques', 'quads'],
    steps: ['Apoie os antebraços na paralela, costas coladas no encosto.', 'Eleve os joelhos (ou as pernas) até a altura do quadril, enrolando a pelve para cima.', 'Desça devagar sem balançar o corpo.'],
    tips: ['Pense em levar o osso do quadril em direção às costelas.'], mistakes: ['Balançar para ganhar impulso.', 'Usar só a flexão do quadril sem contrair o abdômen.'] },
  { test: /prancha/, primary: ['abs'], secondary: ['obliques', 'lowerback', 'shoulders', 'glutes'],
    steps: ['Apoie os antebraços e a ponta dos pés no chão.', 'Alinhe cabeça, tronco e pernas em uma linha reta.', 'Contraia abdômen e glúteos e mantenha o tempo planejado, respirando normalmente.'],
    tips: ['Olhar para o chão para manter o pescoço neutro.'], mistakes: ['Deixar o quadril cair ou subir.', 'Prender a respiração.'] },
  { test: /abdominal/, primary: ['abs'], secondary: ['obliques'],
    steps: ['Posicione-se de frente para a polia alta, ajoelhado, segurando a corda junto à cabeça.', 'Enrole o tronco para baixo, aproximando as costelas da pelve.', 'Volte devagar até sentir o abdômen alongar.'],
    tips: ['O movimento vem do abdômen, não do braço.'], mistakes: ['Puxar com os braços.', 'Sentar o quadril para trás.'] },
];

const FALLBACK: Record<string, ExerciseGuideData> = {
  Peito: { primary: ['chest'], secondary: ['triceps', 'shoulders'], steps: ['Ajuste o aparelho ou banco para o seu tamanho.', 'Execute o movimento com controle, sentindo o peito trabalhar.', 'Volte devagar até alongar o músculo.'], tips: ['Prefira uma carga que permita boa técnica.'], mistakes: ['Usar impulso.'] },
  Costas: { primary: ['lats'], secondary: ['biceps', 'traps'], steps: ['Mantenha a coluna neutra e o peito aberto.', 'Puxe levando os cotovelos para trás, juntando as escápulas.', 'Volte devagar sem soltar o peso.'], tips: ['Pense em puxar com os cotovelos.'], mistakes: ['Balançar o tronco.'] },
  Pernas: { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'calves'], steps: ['Posicione os pés firmes, joelhos alinhados com a ponta dos pés.', 'Execute o movimento com controle, sem travar os joelhos.', 'Volte devagar até a posição inicial.'], tips: ['Mantenha o abdômen firme.'], mistakes: ['Deixar os joelhos entrarem.'] },
  Ombros: { primary: ['shoulders'], secondary: ['traps', 'triceps'], steps: ['Postura firme, ombros longe das orelhas.', 'Execute o movimento com controle até a altura indicada.', 'Desça devagar.'], tips: ['Evite balançar o corpo.'], mistakes: ['Encolher os ombros.'] },
  'Bíceps': { primary: ['biceps'], secondary: ['forearms'], steps: ['Cotovelos junto ao corpo.', 'Flexione levando a carga até o ombro.', 'Desça devagar.'], tips: ['Só o antebraço se move.'], mistakes: ['Balançar o tronco.'] },
  'Tríceps': { primary: ['triceps'], secondary: [], steps: ['Cotovelos parados.', 'Estenda os braços contraindo o tríceps.', 'Volte devagar.'], tips: ['Mantenha os cotovelos fixos.'], mistakes: ['Abrir os cotovelos.'] },
  'Abdômen': { primary: ['abs'], secondary: ['obliques'], steps: ['Contraia o abdômen antes de começar.', 'Mova o tronco ou as pernas com controle.', 'Volte devagar.'], tips: ['Expire na contração.'], mistakes: ['Puxar o pescoço.'] },
  'Glúteo': { primary: ['glutes'], secondary: ['hamstrings', 'quads'], steps: ['Apoio firme dos pés.', 'Empurre contraindo o glúteo.', 'Volte com controle.'], tips: ['Aperte o glúteo no topo.'], mistakes: ['Arquear a lombar.'] },
};

export const getExerciseGuide = (name: string, muscleGroup: string): ExerciseGuideData | null => {
  const n = norm(name);
  const hit = RULES.find(r => r.test.test(n));
  if (hit) return hit;
  return FALLBACK[muscleGroup] ?? null;
};
