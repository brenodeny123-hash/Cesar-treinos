import test from 'node:test';
import assert from 'node:assert/strict';
import { todayFortaleza, weekStart, daysBetween, dayNumber, formatDateBR } from '../src/lib/time.ts';

test('meia-noite em Fortaleza (UTC-3): 02:00Z ainda é o dia anterior', () => {
  assert.equal(todayFortaleza(new Date('2026-10-30T02:59:59Z')), '2026-10-29');
  assert.equal(todayFortaleza(new Date('2026-10-30T03:00:00Z')), '2026-10-30');
});
test('a semana começa na segunda-feira (virada no domingo para segunda)', () => {
  assert.equal(weekStart('2026-10-26'), '2026-10-26');
  assert.equal(weekStart('2026-11-01'), '2026-10-26');
  assert.equal(weekStart('2026-11-02'), '2026-11-02');
});
test('dia do programa começa em 1 na data do cadastro', () => {
  assert.equal(dayNumber('2026-10-25', '2026-10-25'), 1);
  assert.equal(dayNumber('2026-10-25', '2026-10-27'), 3);
  assert.equal(daysBetween('2026-10-25', '2026-11-01'), 7);
});
test('formata a data em dd/mm/aaaa', () => assert.equal(formatDateBR('2026-10-05'), '05/10/2026'));

test('cycleWeek conta a semana do ciclo a partir da data de início', async () => {
  const { cycleWeek, addDays } = await import('../src/lib/time.ts');
  assert.deepEqual(cycleWeek('2026-10-31', '2026-10-31'), { week: 1, total: 4 });
  assert.deepEqual(cycleWeek('2026-10-31', '2026-11-06'), { week: 1, total: 4 });
  assert.deepEqual(cycleWeek('2026-10-31', '2026-11-07'), { week: 2, total: 4 });
  assert.deepEqual(cycleWeek('2026-10-31', '2026-11-28'), { week: 1, total: 4 });
  assert.equal(addDays('2026-10-31', 28), '2026-11-28');
});
