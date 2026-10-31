import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext.tsx';
import { todayFortaleza, formatFortalezaDate, formatDateBR, countInCurrentWeek, computeStreak, addDays } from '../lib/time.ts';
import { createFreshProfile } from '../lib/userData.ts';
import { isUuid, mergeLogs, pullLogs, pushLog } from '../lib/remoteLogs.ts';
import {
  WorkoutRoutine,
  CompletedWorkoutLog,
  BodyMeasurement,
  PersonalRecord,
  StudentProfile,
  ExerciseSet,
  ExerciseItem,
  Student,
} from '../types/crm.ts';
import {
  INITIAL_ROUTINES,
  INITIAL_WORKOUT_LOGS,
  INITIAL_MEASUREMENTS,
  INITIAL_PRS,
  INITIAL_STUDENT_PROFILE,
  INITIAL_STUDENTS,
} from '../data/mockData.ts';

interface ActiveWorkoutState {
  routineId: string;
  routineTitle: string;
  startTime: number; // Date.now()
  elapsedSeconds: number;
  exercises: ExerciseItem[];
  currentExerciseIndex: number;
}

interface RestTimerState {
  active: boolean;
  totalSeconds: number;
  secondsRemaining: number;
  endsAt?: number; // horário absoluto do fim (evita atraso com a tela bloqueada)
  exerciseName?: string;
  setNumber?: number;
}

interface WorkoutContextType {
  // Data
  routines: WorkoutRoutine[];
  students: Student[];
  workoutLogs: CompletedWorkoutLog[];
  measurements: BodyMeasurement[];
  personalRecords: PersonalRecord[];
  studentProfile: StudentProfile;
  activeWorkout: ActiveWorkoutState | null;
  restTimer: RestTimerState;

  // Active workout execution
  startWorkout: (routineId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => void;
  toggleSetCompleted: (exerciseId: string, setId: string, options?: { skipRest?: boolean; onlyComplete?: boolean }) => void;
  quickAdjustWeight: (exerciseId: string, setId: string, deltaKg: number) => void;
  quickAdjustReps: (exerciseId: string, setId: string, deltaReps: number) => void;
  addSetToExercise: (exerciseId: string) => void;
  removeSetFromExercise: (exerciseId: string, setId: string) => void;
  setCurrentExerciseIndex: (index: number) => void;
  finishActiveWorkout: () => CompletedWorkoutLog | null;
  cancelActiveWorkout: () => void;

  // Rest timer
  startRestTimer: (seconds: number, exerciseName?: string, setNumber?: number) => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  stopRestTimer: () => void;

  // Students CRUD
  addStudent: (data: Omit<Student, 'id' | 'joinedDate'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Workout Routines CRUD
  createRoutine: (routine: Omit<WorkoutRoutine, 'id'>) => void;
  updateRoutine: (id: string, updates: Partial<WorkoutRoutine>) => void;
  deleteRoutine: (id: string) => void;
  duplicateRoutine: (id: string) => void;
  addExerciseToRoutine: (routineId: string, exerciseData: Partial<ExerciseItem>) => void;
  updateExerciseInRoutine: (routineId: string, exerciseId: string, updates: Partial<ExerciseItem>) => void;
  deleteExerciseFromRoutine: (routineId: string, exerciseId: string) => void;

  // Measurements
  addBodyMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => void;
  resetAllData: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

/** UUID v4 que funciona também em http (celular na rede local), onde crypto.randomUUID não existe. */
const newId = (): string => {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  const b = new Uint8Array(16);
  if (c && typeof c.getRandomValues === 'function') c.getRandomValues(b);
  else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

const DEMO_DATA_VERSION = '3-lucas-only';

// Web Audio API beep
const playTimerBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Ignore audio restrictions
  }
};

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const uid = user?.uid ?? 'anon';
  const isDemo = uid.startsWith('demo-');
  const k = (name: string) => `pulsefit:${uid}:${name}`;
  // Alunos reais recebem as fichas iniciais; perfil, histórico e medidas começam vazios.
  function seed<T>(demo: T, fresh: T): T { return isDemo ? demo : fresh; }
  // Versão dos dados de demonstração: ao mudar, descarta o que ficou salvo no navegador (ex.: alunos fictícios antigos).
  if (isDemo) {
    try {
      if (localStorage.getItem(k('dataver')) !== DEMO_DATA_VERSION) {
        ['routines', 'students', 'logs', 'measurements', 'prs', 'profile', 'active_workout', 'pending_logs'].forEach(n => localStorage.removeItem(k(n)));
        localStorage.setItem(k('dataver'), DEMO_DATA_VERSION);
      }
    } catch { /* sem armazenamento */ }
  }
  // Routines state
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(() => {
    try {
      const saved = localStorage.getItem(k('routines'));
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as WorkoutRoutine[];
      }
      return INITIAL_ROUTINES;
    } catch {
      return INITIAL_ROUTINES;
    }
  });

  // Students state (CRUD)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(k('students'));
      return saved ? JSON.parse(saved) : seed(INITIAL_STUDENTS, [] as Student[]);
    } catch {
      return seed(INITIAL_STUDENTS, [] as Student[]);
    }
  });

  // Logs state
  const [workoutLogs, setWorkoutLogs] = useState<CompletedWorkoutLog[]>(() => {
    try {
      const saved = localStorage.getItem(k('logs'));
      return saved ? JSON.parse(saved) : seed(INITIAL_WORKOUT_LOGS, [] as CompletedWorkoutLog[]);
    } catch {
      return seed(INITIAL_WORKOUT_LOGS, [] as CompletedWorkoutLog[]);
    }
  });

  // Measurements
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(() => {
    try {
      const saved = localStorage.getItem(k('measurements'));
      return saved ? JSON.parse(saved) : seed(INITIAL_MEASUREMENTS, [] as BodyMeasurement[]);
    } catch {
      return seed(INITIAL_MEASUREMENTS, [] as BodyMeasurement[]);
    }
  });

  // PRs
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(() => {
    try {
      const saved = localStorage.getItem(k('prs'));
      return saved ? JSON.parse(saved) : seed(INITIAL_PRS, [] as PersonalRecord[]);
    } catch {
      return seed(INITIAL_PRS, [] as PersonalRecord[]);
    }
  });

  // Profile
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(k('profile'));
      return saved ? JSON.parse(saved) : seed(INITIAL_STUDENT_PROFILE, createFreshProfile(user?.displayName ?? 'Aluno'));
    } catch {
      return seed(INITIAL_STUDENT_PROFILE, createFreshProfile(user?.displayName ?? 'Aluno'));
    }
  });

  // Active workout
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(() => {
    try {
      const saved = localStorage.getItem(k('active_workout'));
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Rest timer
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    active: false,
    totalSeconds: 60,
    secondsRemaining: 0,
  });

  // Histórico na nuvem (por aluno, protegido por RLS): reenvia pendências e baixa o que existe
  const readPending = (): CompletedWorkoutLog[] => { try { return JSON.parse(localStorage.getItem(k('pending_logs')) ?? '[]'); } catch { return []; } };
  const writePending = (list: CompletedWorkoutLog[]) => { try { localStorage.setItem(k('pending_logs'), JSON.stringify(list)); } catch { /* sem armazenamento */ } };
  useEffect(() => {
    if (isDemo || !isUuid(uid)) return;
    let active = true;
    (async () => {
      const stillPending: CompletedWorkoutLog[] = [];
      for (const log of readPending()) if (!(await pushLog(uid, log))) stillPending.push(log);
      writePending(stillPending);
      const remote = await pullLogs(uid);
      if (active && remote) setWorkoutLogs(local => mergeLogs(local, remote));
    })();
    return () => { active = false; };
  }, [uid, isDemo]);

  // Sequência/semana/total derivados dos registros reais (fuso America/Fortaleza)
  useEffect(() => {
    // Só contam treinos a partir da data de início do treino do aluno.
    const start = /^\d{4}-\d{2}-\d{2}$/.test(studentProfile.joinedDate) ? studentProfile.joinedDate : '';
    const dates = workoutLogs.map(l => l.date).filter(d => !start || d >= start);
    setStudentProfile(prev => ({ ...prev, totalWorkoutsLogged: dates.length, weeklyCompleted: countInCurrentWeek(dates), streakDays: computeStreak(dates) }));
  }, [workoutLogs, studentProfile.joinedDate]);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(k('routines'), JSON.stringify(routines));
    } catch (e) {
      console.warn('LocalStorage error routines', e);
    }
  }, [routines]);

  useEffect(() => {
    try {
      localStorage.setItem(k('students'), JSON.stringify(students));
    } catch (e) {
      console.warn('LocalStorage error students', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(k('logs'), JSON.stringify(workoutLogs));
    } catch (e) {
      console.warn('LocalStorage error logs', e);
    }
  }, [workoutLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(k('measurements'), JSON.stringify(measurements));
    } catch (e) {
      console.warn('LocalStorage error measurements', e);
    }
  }, [measurements]);

  useEffect(() => {
    try {
      localStorage.setItem(k('prs'), JSON.stringify(personalRecords));
    } catch (e) {
      console.warn('LocalStorage error prs', e);
    }
  }, [personalRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(k('profile'), JSON.stringify(studentProfile));
    } catch (e) {
      console.warn('LocalStorage error profile', e);
    }
  }, [studentProfile]);

  useEffect(() => {
    try {
      if (activeWorkout) {
        localStorage.setItem(k('active_workout'), JSON.stringify(activeWorkout));
      } else {
        localStorage.removeItem(k('active_workout'));
      }
    } catch (e) {
      console.warn('LocalStorage error activeWorkout', e);
    }
  }, [activeWorkout]);

  // Workout duration timer
  useEffect(() => {
    if (!activeWorkout) return;
    const interval = setInterval(() => {
      setActiveWorkout(prev => {
        if (!prev) return null;
        return {
          ...prev,
          elapsedSeconds: Math.floor((Date.now() - prev.startTime) / 1000),
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout?.startTime]);

  // Rest countdown (calculado pelo horário absoluto)
  useEffect(() => {
    if (!restTimer.active) return;
    const tick = () => setRestTimer(prev => {
      if (!prev.active) return prev;
      const remaining = prev.endsAt ? Math.max(0, Math.ceil((prev.endsAt - Date.now()) / 1000)) : Math.max(0, prev.secondsRemaining - 1);
      if (remaining <= 0) { playTimerBeep(); return { ...prev, active: false, secondsRemaining: 0 }; }
      return remaining === prev.secondsRemaining ? prev : { ...prev, secondsRemaining: remaining };
    });
    const timer = setInterval(tick, 500);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, [restTimer.active]);

  // --- WORKOUT EXECUTION METHODS ---
  const startWorkout = (routineId: string) => {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;

    const clonedExercises = routine.exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(s => ({
        ...s,
        completed: false,
      })),
    }));

    const newActiveSession: ActiveWorkoutState = {
      routineId: routine.id,
      routineTitle: routine.title,
      startTime: Date.now(),
      elapsedSeconds: 0,
      exercises: clonedExercises,
      currentExerciseIndex: 0,
    };

    setActiveWorkout(newActiveSession);
  };

  const updateSet = (exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => {
    if (!activeWorkout) return;
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.map(s => {
              if (s.id !== setId) return s;
              return { ...s, ...updates };
            }),
          };
        }),
      };
    });
  };

  const startRestTimer = (seconds: number, exerciseName?: string, setNumber?: number) => {
    setRestTimer({
      active: true,
      totalSeconds: seconds,
      secondsRemaining: seconds,
      endsAt: Date.now() + seconds * 1000,
      exerciseName,
      setNumber,
    });
  };

  const adjustRestTimer = (deltaSeconds: number) => {
    setRestTimer(prev => {
      const newRemaining = Math.max(0, prev.secondsRemaining + deltaSeconds);
      const newTotal = Math.max(prev.totalSeconds, newRemaining);
      return {
        ...prev,
        active: newRemaining > 0,
        endsAt: prev.endsAt ? prev.endsAt + deltaSeconds * 1000 : prev.endsAt,
        secondsRemaining: newRemaining,
        totalSeconds: newTotal,
      };
    });
  };

  const stopRestTimer = () => {
    setRestTimer(prev => ({ ...prev, active: false, secondsRemaining: 0 }));
  };

  const toggleSetCompleted = (exerciseId: string, setId: string, options?: { skipRest?: boolean; onlyComplete?: boolean }) => {
    if (!activeWorkout) return;

    const currentEx = activeWorkout.exercises.find(e => e.id === exerciseId);
    const targetSet = currentEx?.sets.find(s => s.id === setId);
    if (options?.onlyComplete && targetSet?.completed) return; // nunca registrar a mesma série duas vezes
    const willBeCompleted = targetSet ? !targetSet.completed : true;

    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.map(s => {
              if (s.id !== setId) return s;
              return {
                ...s,
                completed: willBeCompleted,
                completedAt: willBeCompleted ? new Date().toISOString() : undefined,
              };
            }),
          };
        }),
      };
    });

    if (willBeCompleted && currentEx && !options?.skipRest) {
      const restDuration = currentEx.defaultRestSec || 60;
      startRestTimer(restDuration, currentEx.name, targetSet?.setNumber);
    }
  };

  const quickAdjustWeight = (exerciseId: string, setId: string, deltaKg: number) => {
    if (!activeWorkout) return;
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.map(s => {
              if (s.id !== setId) return s;
              const newWeight = Math.max(0, Math.round((s.weightKg + deltaKg) * 10) / 10);
              return { ...s, weightKg: newWeight };
            }),
          };
        }),
      };
    });
  };

  const quickAdjustReps = (exerciseId: string, setId: string, deltaReps: number) => {
    if (!activeWorkout) return;
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.map(s => {
              if (s.id !== setId) return s;
              const newReps = Math.max(1, s.reps + deltaReps);
              return { ...s, reps: newReps };
            }),
          };
        }),
      };
    });
  };

  const addSetToExercise = (exerciseId: string) => {
    if (!activeWorkout) return;
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          const nextSetNum = ex.sets.length + 1;
          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet: ExerciseSet = {
            id: `set-${Date.now()}-${nextSetNum}`,
            setNumber: nextSetNum,
            weightKg: lastSet ? lastSet.weightKg : 20,
            reps: lastSet ? lastSet.reps : 10,
            completed: false,
          };
          return {
            ...ex,
            sets: [...ex.sets, newSet],
          };
        }),
      };
    });
  };

  const removeSetFromExercise = (exerciseId: string, setId: string) => {
    if (!activeWorkout) return;
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          if (ex.sets.length <= 1) return ex;
          const filtered = ex.sets.filter(s => s.id !== setId);
          const renumbered = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
          return { ...ex, sets: renumbered };
        }),
      };
    });
  };

  const setCurrentExerciseIndex = (index: number) => {
    if (!activeWorkout) return;
    setActiveWorkout(prev => prev ? { ...prev, currentExerciseIndex: index } : null);
  };

  const finishActiveWorkout = (): CompletedWorkoutLog | null => {
    if (!activeWorkout) return null;

    let totalVolume = 0;
    let completedSetsTotal = 0;
    const exerciseSummaries: CompletedWorkoutLog['exercises'] = [];
    const newPrsList: string[] = [];
    const updatedPrs = [...personalRecords];

    activeWorkout.exercises.forEach(ex => {
      const completedSets = ex.sets.filter(s => s.completed);
      if (completedSets.length > 0) {
        completedSetsTotal += completedSets.length;
        let maxWeight = 0;
        const setsData: { weightKg: number; reps: number }[] = [];

        completedSets.forEach(s => {
          totalVolume += s.weightKg * s.reps;
          setsData.push({ weightKg: s.weightKg, reps: s.reps });
          if (s.weightKg > maxWeight) maxWeight = s.weightKg;

          const existingPrIndex = updatedPrs.findIndex(p => p.exerciseName.toLowerCase() === ex.name.toLowerCase());
          if (existingPrIndex >= 0) {
            const existing = updatedPrs[existingPrIndex];
            if (s.weightKg > existing.weightKg) {
              const diff = s.weightKg - existing.weightKg;
              newPrsList.push(`${ex.name}: ${s.weightKg}kg (+${diff}kg)`);
              updatedPrs[existingPrIndex] = {
                exerciseName: ex.name,
                weightKg: s.weightKg,
                reps: s.reps,
                date: formatFortalezaDate(new Date(), { day: '2-digit', month: 'short' }),
              };
            }
          } else if (s.weightKg > 0) {
            newPrsList.push(`${ex.name}: ${s.weightKg}kg (Primeiro Registro!)`);
            updatedPrs.push({
              exerciseName: ex.name,
              weightKg: s.weightKg,
              reps: s.reps,
              date: formatFortalezaDate(new Date(), { day: '2-digit', month: 'short' }),
            });
          }
        });

        exerciseSummaries.push({
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          maxWeightKg: maxWeight,
          sets: setsData,
        });
      }
    });

    const durationMin = Math.max(1, Math.round(activeWorkout.elapsedSeconds / 60));

    const newLog: CompletedWorkoutLog = {
      id: newId(),
      routineId: activeWorkout.routineId,
      routineTitle: activeWorkout.routineTitle,
      date: todayFortaleza(),
      durationMinutes: durationMin,
      totalVolumeKg: Math.round(totalVolume),
      completedSetsCount: completedSetsTotal,
      exercises: exerciseSummaries,
      prsAchieved: newPrsList,
      notes: `Treino finalizado com sucesso! ${completedSetsTotal} séries executadas.`,
    };

    setRoutines(prevRoutines => {
      return prevRoutines.map(r => {
        if (r.id !== activeWorkout.routineId) return r;
        return {
          ...r,
          exercises: r.exercises.map(rEx => {
            const finishedEx = activeWorkout.exercises.find(ae => ae.id === rEx.id);
            if (!finishedEx) return rEx;
            const completedSets = finishedEx.sets.filter(s => s.completed);
            const lastSet = completedSets[completedSets.length - 1] || finishedEx.sets[0];
            return {
              ...rEx,
              lastWeightKg: lastSet?.weightKg,
              lastReps: lastSet?.reps,
              sets: finishedEx.sets.map(s => ({ ...s, completed: false })),
            };
          }),
        };
      });
    });

    setWorkoutLogs(prev => [newLog, ...prev]);
    if (!isDemo && isUuid(uid)) {
      void pushLog(uid, newLog).then(ok => { if (!ok) writePending([...readPending(), newLog]); });
    }
    setPersonalRecords(updatedPrs);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00ff66', '#39ff14', '#5be7ff', '#ffffff'],
      });
    } catch {
      // Ignore confetti error
    }

    setActiveWorkout(null);
    stopRestTimer();

    return newLog;
  };

  const cancelActiveWorkout = () => {
    setActiveWorkout(null);
    stopRestTimer();
  };

  // --- STUDENTS CRUD ---
  const addStudent = (data: Omit<Student, 'id' | 'joinedDate'>) => {
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      joinedDate: formatDateBR(todayFortaleza()),
      routineExpiresOn: addDays(todayFortaleza(), 28),
      ...data,
    };
    setStudents(prev => [newStudent, ...prev]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  // --- WORKOUT ROUTINES CRUD ---
  const createRoutine = (data: Omit<WorkoutRoutine, 'id'>) => {
    const newRoutine: WorkoutRoutine = {
      id: `routine-${Date.now()}`,
      ...data,
    };
    setRoutines(prev => [...prev, newRoutine]);
  };

  const updateRoutine = (id: string, updates: Partial<WorkoutRoutine>) => {
    setRoutines(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteRoutine = (id: string) => {
    if (routines.length <= 1) return; // Keep at least one routine
    setRoutines(prev => prev.filter(r => r.id !== id));
  };

  const duplicateRoutine = (id: string) => {
    const source = routines.find(r => r.id === id);
    if (!source) return;
    const newId = `routine-${Date.now()}`;
    const duplicated: WorkoutRoutine = {
      ...source,
      id: newId,
      code: `${source.code}2`,
      title: `${source.title} (Cópia)`,
      exercises: source.exercises.map(ex => ({
        ...ex,
        id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        sets: ex.sets.map(s => ({
          ...s,
          id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          completed: false,
        })),
      })),
    };
    setRoutines(prev => [...prev, duplicated]);
  };

  const addExerciseToRoutine = (routineId: string, exerciseData: Partial<ExerciseItem>) => {
    setRoutines(prev => {
      return prev.map(r => {
        if (r.id !== routineId) return r;
        const newExId = `ex-${Date.now()}`;
        const newExercise: ExerciseItem = {
          id: newExId,
          name: exerciseData.name || 'Novo Exercício',
          muscleGroup: exerciseData.muscleGroup || 'Peito',
          targetSets: exerciseData.targetSets || 3,
          targetReps: exerciseData.targetReps || '10 a 12 reps',
          defaultRestSec: exerciseData.defaultRestSec || 60,
          notes: exerciseData.notes || '',
          sets: [
            { id: `${newExId}-1`, setNumber: 1, weightKg: 20, reps: 10, completed: false },
            { id: `${newExId}-2`, setNumber: 2, weightKg: 20, reps: 10, completed: false },
            { id: `${newExId}-3`, setNumber: 3, weightKg: 20, reps: 10, completed: false },
          ],
        };
        return {
          ...r,
          exercises: [...r.exercises, newExercise],
        };
      });
    });
  };

  const updateExerciseInRoutine = (routineId: string, exerciseId: string, updates: Partial<ExerciseItem>) => {
    setRoutines(prev => {
      return prev.map(r => {
        if (r.id !== routineId) return r;
        return {
          ...r,
          exercises: r.exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;
            return { ...ex, ...updates };
          }),
        };
      });
    });
  };

  const deleteExerciseFromRoutine = (routineId: string, exerciseId: string) => {
    setRoutines(prev => {
      return prev.map(r => {
        if (r.id !== routineId) return r;
        if (r.exercises.length <= 1) return r; // Keep at least one exercise
        return {
          ...r,
          exercises: r.exercises.filter(ex => ex.id !== exerciseId),
        };
      });
    });
  };

  const addBodyMeasurement = (data: Omit<BodyMeasurement, 'id'>) => {
    const newMeas: BodyMeasurement = {
      id: `meas-${Date.now()}`,
      ...data,
    };
    setMeasurements(prev => [newMeas, ...prev]);
  };

  const resetAllData = () => {
    localStorage.removeItem(k('routines'));
    localStorage.removeItem(k('students'));
    localStorage.removeItem(k('logs'));
    localStorage.removeItem(k('measurements'));
    localStorage.removeItem(k('prs'));
    localStorage.removeItem(k('profile'));
    localStorage.removeItem(k('active_workout'));
    setRoutines(INITIAL_ROUTINES);
    setStudents(INITIAL_STUDENTS);
    setWorkoutLogs(INITIAL_WORKOUT_LOGS);
    setMeasurements(INITIAL_MEASUREMENTS);
    setPersonalRecords(INITIAL_PRS);
    setStudentProfile(INITIAL_STUDENT_PROFILE);
    setActiveWorkout(null);
    stopRestTimer();
  };

  return (
    <WorkoutContext.Provider
      value={{
        routines,
        students,
        workoutLogs,
        measurements,
        personalRecords,
        studentProfile,
        activeWorkout,
        restTimer,
        startWorkout,
        updateSet,
        toggleSetCompleted,
        quickAdjustWeight,
        quickAdjustReps,
        addSetToExercise,
        removeSetFromExercise,
        setCurrentExerciseIndex,
        finishActiveWorkout,
        cancelActiveWorkout,
        startRestTimer,
        adjustRestTimer,
        stopRestTimer,
        addStudent,
        updateStudent,
        deleteStudent,
        createRoutine,
        updateRoutine,
        deleteRoutine,
        duplicateRoutine,
        addExerciseToRoutine,
        updateExerciseInRoutine,
        deleteExerciseFromRoutine,
        addBodyMeasurement,
        resetAllData,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
