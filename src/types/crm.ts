export interface ExerciseSet {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  completedAt?: string;
  rpe?: number; // Rate of Perceived Exertion (1-10)
}

export interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: 'Peito' | 'Costas' | 'Pernas' | 'Ombros' | 'Bíceps' | 'Tríceps' | 'Abdômen' | 'Glúteo';
  targetSets: number;
  targetReps: string; // e.g. "8-12"
  defaultRestSec: number;
  notes?: string;
  lastWeightKg?: number;
  lastReps?: number;
  videoGuide?: string;
  sets: ExerciseSet[];
}

export interface WorkoutRoutine {
  id: string;
  code: string; // A, B, C, D, E, Custom...
  title: string;
  focusMuscles: string;
  estimatedMinutes: number;
  exercises: ExerciseItem[];
  color: string;
}

export interface CompletedWorkoutLog {
  id: string;
  routineId: string;
  routineTitle: string;
  date: string; // ISO date YYYY-MM-DD
  durationMinutes: number;
  totalVolumeKg: number;
  completedSetsCount: number;
  exercises: {
    name: string;
    muscleGroup: string;
    sets: { weightKg: number; reps: number }[];
    maxWeightKg: number;
  }[];
  prsAchieved: string[]; // e.g. ["Supino Reto: 85kg (+5kg)"]
  notes?: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPct?: number;
  chestCm?: number;
  waistCm?: number;
  armsCm?: number;
  thighsCm?: number;
  notes?: string;
}

export interface PersonalRecord {
  exerciseName: string;
  weightKg: number;
  reps: number;
  date: string;
}

export interface StudentProfile {
  name: string;
  nickname: string;
  goal: string;
  plan: string;
  trainerName: string;
  streakDays: number;
  weeklyGoal: number;
  weeklyCompleted: number;
  totalWorkoutsLogged: number;
  joinedDate: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  plan: 'Mensal' | 'Trimestral VIP' | 'Semestral' | 'Anual';
  monthlyFee: number;
  status: 'Ativo' | 'Pendente' | 'Avaliação';
  currentRoutineCode: string;
  currentRoutineTitle: string;
  goal: string;
  weightKg: number;
  joinedDate: string;
  notes?: string;
}
