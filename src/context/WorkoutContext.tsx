import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
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
  toggleSetCompleted: (exerciseId: string, setId: string) => void;
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
  // Routines state
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(() => {
    try {
      const saved = localStorage.getItem('pulsefit_routines');
      return saved ? JSON.parse(saved) : INITIAL_ROUTINES;
    } catch {
      return INITIAL_ROUTINES;
    }
  });

  // Students state (CRUD)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('pulsefit_students');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  // Logs state
  const [workoutLogs, setWorkoutLogs] = useState<CompletedWorkoutLog[]>(() => {
    try {
      const saved = localStorage.getItem('pulsefit_logs');
      return saved ? JSON.parse(saved) : INITIAL_WORKOUT_LOGS;
    } catch {
      return INITIAL_WORKOUT_LOGS;
    }
  });

  // Measurements
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(() => {
    try {
      const saved = localStorage.getItem('pulsefit_measurements');
      return saved ? JSON.parse(saved) : INITIAL_MEASUREMENTS;
    } catch {
      return INITIAL_MEASUREMENTS;
    }
  });

  // PRs
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pulsefit_prs');
      return saved ? JSON.parse(saved) : INITIAL_PRS;
    } catch {
      return INITIAL_PRS;
    }
  });

  // Profile
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('pulsefit_profile');
      return saved ? JSON.parse(saved) : INITIAL_STUDENT_PROFILE;
    } catch {
      return INITIAL_STUDENT_PROFILE;
    }
  });

  // Active workout
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(() => {
    try {
      const saved = localStorage.getItem('pulsefit_active_workout');
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

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem('pulsefit_routines', JSON.stringify(routines));
    } catch (e) {
      console.warn('LocalStorage error routines', e);
    }
  }, [routines]);

  useEffect(() => {
    try {
      localStorage.setItem('pulsefit_students', JSON.stringify(students));
    } catch (e) {
      console.warn('LocalStorage error students', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('pulsefit_logs', JSON.stringify(workoutLogs));
    } catch (e) {
      console.warn('LocalStorage error logs', e);
    }
  }, [workoutLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('pulsefit_measurements', JSON.stringify(measurements));
    } catch (e) {
      console.warn('LocalStorage error measurements', e);
    }
  }, [measurements]);

  useEffect(() => {
    try {
      localStorage.setItem('pulsefit_prs', JSON.stringify(personalRecords));
    } catch (e) {
      console.warn('LocalStorage error prs', e);
    }
  }, [personalRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('pulsefit_profile', JSON.stringify(studentProfile));
    } catch (e) {
      console.warn('LocalStorage error profile', e);
    }
  }, [studentProfile]);

  useEffect(() => {
    try {
      if (activeWorkout) {
        localStorage.setItem('pulsefit_active_workout', JSON.stringify(activeWorkout));
      } else {
        localStorage.removeItem('pulsefit_active_workout');
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

  // Rest countdown
  useEffect(() => {
    if (!restTimer.active) return;
    const timer = setInterval(() => {
      setRestTimer(prev => {
        if (!prev.active) return prev;
        if (prev.secondsRemaining <= 1) {
          playTimerBeep();
          return { ...prev, active: false, secondsRemaining: 0 };
        }
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
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
        secondsRemaining: newRemaining,
        totalSeconds: newTotal,
      };
    });
  };

  const stopRestTimer = () => {
    setRestTimer(prev => ({ ...prev, active: false, secondsRemaining: 0 }));
  };

  const toggleSetCompleted = (exerciseId: string, setId: string) => {
    if (!activeWorkout) return;

    const currentEx = activeWorkout.exercises.find(e => e.id === exerciseId);
    const targetSet = currentEx?.sets.find(s => s.id === setId);
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

    if (willBeCompleted && currentEx) {
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
                date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
              };
            }
          } else if (s.weightKg > 0) {
            newPrsList.push(`${ex.name}: ${s.weightKg}kg (Primeiro Registro!)`);
            updatedPrs.push({
              exerciseName: ex.name,
              weightKg: s.weightKg,
              reps: s.reps,
              date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
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
      id: `log-${Date.now()}`,
      routineId: activeWorkout.routineId,
      routineTitle: activeWorkout.routineTitle,
      date: new Date().toISOString().split('T')[0],
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
    setPersonalRecords(updatedPrs);

    setStudentProfile(prev => ({
      ...prev,
      totalWorkoutsLogged: prev.totalWorkoutsLogged + 1,
      weeklyCompleted: prev.weeklyCompleted + 1,
      streakDays: prev.streakDays + 1,
    }));

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#91db2a', '#89ceff', '#ffffff'],
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
      joinedDate: new Date().toLocaleDateString('pt-BR'),
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
    localStorage.removeItem('pulsefit_routines');
    localStorage.removeItem('pulsefit_students');
    localStorage.removeItem('pulsefit_logs');
    localStorage.removeItem('pulsefit_measurements');
    localStorage.removeItem('pulsefit_prs');
    localStorage.removeItem('pulsefit_profile');
    localStorage.removeItem('pulsefit_active_workout');
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
