import test from 'node:test';
import assert from 'node:assert/strict';
import { initialTimerState, reduceTimer, remainingMs, restoreTimerState, type TimerEvent, type TimerState } from '../src/lib/workoutTimer.ts';

const T0 = 1_000_000;
const KEY = 'ex1|s1';
const run = (s: TimerState, e: TimerEvent, now: number) => reduceTimer(s, e, now);
const started = () => run(initialTimerState(), { type: 'start', setKey: KEY }, T0).state;

test('padrões: execução 40s e descanso 60s', () => {
  const s = initialTimerState();
  assert.equal(s.executionSec, 40);
  assert.equal(s.restSec, 60);
});

test('iniciar execução calcula o tempo restante pelo horário absoluto', () => {
  const s = started();
  assert.equal(s.phase, 'executing');
  assert.equal(remainingMs(s, T0), 40_000);
  assert.equal(remainingMs(s, T0 + 15_000), 25_000);
});

test('tick antes do fim não altera nada (mesma referência)', () => {
  const s = started();
  const r = run(s, { type: 'tick' }, T0 + 39_999);
  assert.equal(r.state, s);
  assert.deepEqual(r.effects, []);
});

test('execução zera: registra a série uma vez e inicia o descanso de 60s', () => {
  const r = run(started(), { type: 'tick' }, T0 + 40_000);
  assert.equal(r.state.phase, 'resting');
  assert.equal(r.state.endsAt, T0 + 100_000);
  assert.deepEqual(r.effects.map(e => e.type), ['complete_set', 'beep']);
  const again = run(r.state, { type: 'tick' }, T0 + 41_000);
  assert.deepEqual(again.effects, []);
});

test('descanso zera: avisa o fim e volta a ocioso', () => {
  const rest = run(started(), { type: 'tick' }, T0 + 40_000).state;
  const r = run(rest, { type: 'tick' }, T0 + 100_000);
  assert.equal(r.state.phase, 'idle');
  assert.deepEqual(r.effects.map(e => e.type), ['rest_done', 'beep']);
});

test('pular descanso encerra na hora e não registra a série de novo', () => {
  const rest = run(started(), { type: 'tick' }, T0 + 40_000).state;
  const r = run(rest, { type: 'skip_rest' }, T0 + 45_000);
  assert.equal(r.state.phase, 'idle');
  assert.equal(r.effects.filter(e => e.type === 'complete_set').length, 0);
  assert.equal(r.effects.filter(e => e.type === 'rest_done').length, 1);
  assert.equal(r.state.completedKeys.length, 1);
});

test('pausar congela o tempo e retomar continua do ponto certo', () => {
  const paused = run(started(), { type: 'pause' }, T0 + 10_000).state;
  assert.equal(remainingMs(paused, T0 + 999_999), 30_000);
  assert.deepEqual(run(paused, { type: 'tick' }, T0 + 999_999).effects, []);
  const resumed = run(paused, { type: 'resume' }, T0 + 50_000).state;
  assert.equal(resumed.endsAt, T0 + 80_000);
});

test('tela bloqueada: ao voltar, recupera as transições uma única vez', () => {
  const r = run(started(), { type: 'tick' }, T0 + 10 * 60_000);
  assert.equal(r.state.phase, 'idle');
  assert.equal(r.effects.filter(e => e.type === 'complete_set').length, 1);
  assert.equal(r.effects.filter(e => e.type === 'rest_done').length, 1);
});

test('não permite dois cronômetros nem repetir série já registrada', () => {
  const s = started();
  assert.equal(run(s, { type: 'start', setKey: 'ex1|s2' }, T0 + 1).state, s);
  const done = run(run(s, { type: 'tick' }, T0 + 40_000).state, { type: 'skip_rest' }, T0 + 41_000).state;
  assert.equal(run(done, { type: 'start', setKey: KEY }, T0 + 42_000).state, done);
  assert.equal(run(done, { type: 'start', setKey: 'ex1|s2' }, T0 + 42_000).state.phase, 'executing');
});

test('finalizar série antecipadamente registra uma vez e inicia o descanso', () => {
  const r = run(started(), { type: 'finish_execution' }, T0 + 12_000);
  assert.equal(r.state.phase, 'resting');
  assert.equal(r.state.endsAt, T0 + 72_000);
  assert.equal(r.effects.filter(e => e.type === 'complete_set').length, 1);
  assert.deepEqual(run(r.state, { type: 'finish_execution' }, T0 + 13_000).effects, []);
});

test('descanso editável: limites e ajuste de +/-15s', () => {
  let s = run(initialTimerState(), { type: 'set_rest_sec', seconds: 90 }, T0).state;
  assert.equal(s.restSec, 90);
  assert.equal(run(s, { type: 'set_rest_sec', seconds: 1 }, T0).state.restSec, 10);
  assert.equal(run(s, { type: 'set_rest_sec', seconds: 99999 }, T0).state.restSec, 600);
  s = run(s, { type: 'start', setKey: KEY }, T0).state;
  assert.equal(run(s, { type: 'adjust', deltaSec: 15 }, T0 + 1000).state.endsAt, T0 + 55_000);
});

test('série marcada à mão vai direto ao descanso sem duplicar', () => {
  const r = run(initialTimerState(), { type: 'start_rest', setKey: KEY }, T0);
  assert.equal(r.state.phase, 'resting');
  assert.equal(r.state.endsAt, T0 + 60_000);
  assert.deepEqual(r.effects, []);
  assert.deepEqual(r.state.completedKeys, [KEY]);
});

test('atualizar a página no meio da execução: o estado salvo é restaurado', () => {
  const saved = JSON.parse(JSON.stringify(started()));
  const restored = restoreTimerState(saved);
  assert.equal(restored.phase, 'executing');
  assert.equal(remainingMs(restored, T0 + 5_000), 35_000);
});

test('estado salvo corrompido volta ao padrão seguro', () => {
  assert.equal(restoreTimerState(null).phase, 'idle');
  assert.equal(restoreTimerState({ phase: 'executing' }).phase, 'idle');
  assert.equal(restoreTimerState({ phase: 'resting', setKey: 'a', endsAt: 'x' }).phase, 'idle');
});

test('novo treino zera as séries registradas e mantém as durações escolhidas', () => {
  let s = run(initialTimerState(), { type: 'set_rest_sec', seconds: 90 }, T0).state;
  s = run(s, { type: 'begin_session', sessionId: 1 }, T0).state;
  s = run(run(run(s, { type: 'start', setKey: KEY }, T0).state, { type: 'tick' }, T0 + 40_000).state, { type: 'skip_rest' }, T0 + 41_000).state;
  assert.equal(s.completedKeys.length, 1);
  assert.equal(run(s, { type: 'begin_session', sessionId: 1 }, T0).state, s);
  const next = run(s, { type: 'begin_session', sessionId: 2 }, T0).state;
  assert.equal(next.completedKeys.length, 0);
  assert.equal(next.restSec, 90);
});

test('desmarcar uma série permite cronometrá-la de novo', () => {
  let s = run(run(started(), { type: 'tick' }, T0 + 40_000).state, { type: 'skip_rest' }, T0 + 41_000).state;
  assert.equal(run(s, { type: 'start', setKey: KEY }, T0 + 42_000).state, s);
  s = run(s, { type: 'forget_set', setKey: KEY }, T0 + 42_000).state;
  assert.equal(run(s, { type: 'start', setKey: KEY }, T0 + 43_000).state.phase, 'executing');
});
