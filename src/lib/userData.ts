import type { StudentProfile } from '../types/crm.ts';
import { todayFortaleza } from './time.ts';

/** Perfil de um aluno recém-cadastrado: zerado e com a data exata do cadastro. */
export const createFreshProfile = (displayName: string): StudentProfile => {
  const name = displayName.trim() || 'Aluno';
  return {
    name,
    nickname: name.split(' ')[0],
    goal: 'A definir na anamnese',
    plan: 'Aluno • #TeamCesar',
    trainerName: 'Prof. Cesar Treinos',
    streakDays: 0,
    weeklyGoal: 3,
    weeklyCompleted: 0,
    totalWorkoutsLogged: 0,
    joinedDate: todayFortaleza(),
  };
};
