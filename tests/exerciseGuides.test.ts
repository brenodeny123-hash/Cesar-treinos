import test from 'node:test';
import assert from 'node:assert/strict';
import { getExerciseGuide } from '../src/lib/exerciseGuides.ts';
import { EXERCISE_LIBRARY, INITIAL_ROUTINES } from '../src/data/mockData.ts';

test('todo exercício da biblioteca e das fichas tem guia com músculo e passos', () => {
  const all = [
    ...EXERCISE_LIBRARY.map(e => ({ name: e.name, group: e.muscleGroup })),
    ...INITIAL_ROUTINES.flatMap(r => r.exercises.map(e => ({ name: e.name, group: e.muscleGroup }))),
  ];
  for (const e of all) {
    const g = getExerciseGuide(e.name, e.group);
    assert.ok(g, `sem guia: ${e.name}`);
    assert.ok(g.primary.length > 0, `sem músculo principal: ${e.name}`);
    assert.ok(g.steps.length >= 3, `poucos passos: ${e.name}`);
  }
});

test('guias específicos: agachamento trabalha quadríceps; supino trabalha peitoral; tríceps corda não cai em outro', () => {
  assert.ok(getExerciseGuide('Agachamento Livre com Barra', 'Pernas')!.primary.includes('quads'));
  assert.deepEqual(getExerciseGuide('Supino Reto com Barra', 'Peito')!.primary, ['chest']);
  assert.deepEqual(getExerciseGuide('Tríceps Corda na Polia', 'Tríceps')!.primary, ['triceps']);
  assert.deepEqual(getExerciseGuide('Crucifixo Inverso no Peck Deck', 'Ombros')!.primary, ['shoulders', 'traps']);
  assert.deepEqual(getExerciseGuide('Rosca Martelo com Halteres', 'Bíceps')!.primary, ['biceps', 'forearms']);
});
