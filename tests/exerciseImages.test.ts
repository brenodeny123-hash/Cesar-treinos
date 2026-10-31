import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { EXERCISE_LIBRARY, INITIAL_ROUTINES } from '../src/data/mockData.ts';
import { exerciseArtworkFrames } from '../src/lib/exerciseImages.ts';

test('cada exercício da biblioteca e das fichas tem os dois quadros locais', () => {
  const names = new Set([
    ...EXERCISE_LIBRARY.map(exercise => exercise.name),
    ...INITIAL_ROUTINES.flatMap(routine => routine.exercises.map(exercise => exercise.name)),
  ]);

  for (const name of names) {
    const frames = exerciseArtworkFrames(name);
    assert.ok(frames, `sem ilustração mapeada: ${name}`);
    for (const frame of frames) {
      assert.ok(existsSync(resolve('public', `.${frame}`)), `quadro não encontrado: ${frame}`);
    }
  }
});
