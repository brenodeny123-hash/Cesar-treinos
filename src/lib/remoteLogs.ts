import { supabase } from './supabase.ts';
import type { CompletedWorkoutLog } from '../types/crm.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isUuid = (v: string): boolean => UUID.test(v);

const toRow = (userId: string, l: CompletedWorkoutLog) => ({
  id: l.id, user_id: userId, routine_title: l.routineTitle, date: l.date,
  duration_minutes: l.durationMinutes, total_volume_kg: Math.round(l.totalVolumeKg),
  completed_sets_count: l.completedSetsCount, exercises_data: l.exercises, prs_achieved: l.prsAchieved,
  notes: (l as { notes?: string }).notes ?? null,
});

/** Envia um treino concluído. Duplicata (23505) conta como sucesso. Isolamento por aluno vem do RLS. */
export async function pushLog(userId: string, log: CompletedWorkoutLog): Promise<boolean> {
  if (!supabase || !isUuid(userId) || !isUuid(log.id)) return false;
  const { error } = await supabase.from('workout_logs').insert(toRow(userId, log));
  return !error || error.code === '23505';
}

/** Histórico do aluno logado (null = não foi possível consultar). */
export async function pullLogs(userId: string): Promise<CompletedWorkoutLog[] | null> {
  if (!supabase || !isUuid(userId)) return null;
  const { data, error } = await supabase.from('workout_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(500);
  if (error || !data) return null;
  return data.map((r): CompletedWorkoutLog => ({
    id: String(r.id), routineId: '', routineTitle: String(r.routine_title ?? ''), date: String(r.date).slice(0, 10),
    durationMinutes: Number(r.duration_minutes ?? 0), totalVolumeKg: Number(r.total_volume_kg ?? 0),
    completedSetsCount: Number(r.completed_sets_count ?? 0),
    exercises: Array.isArray(r.exercises_data) ? r.exercises_data : [], prsAchieved: Array.isArray(r.prs_achieved) ? r.prs_achieved : [],
    ...(r.notes ? { notes: String(r.notes) } : {}),
  }));
}

export const mergeLogs = (local: CompletedWorkoutLog[], remote: CompletedWorkoutLog[]): CompletedWorkoutLog[] => {
  const byId = new Map<string, CompletedWorkoutLog>();
  for (const l of local) byId.set(l.id, l);
  for (const l of remote) byId.set(l.id, l);
  return [...byId.values()].sort((a, b) => b.date.localeCompare(a.date));
};
