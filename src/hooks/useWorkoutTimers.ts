import { useEffect, useRef, useState } from 'react';

export type WorkoutPhase = 'waiting' | 'executing' | 'resting' | 'next-exercise';

interface UseWorkoutTimersOptions {
  workoutStartTime: number;
  restDurationSeconds: number;
}

function wholeSecondsSince(timestamp: number): number {
  return Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
}

export function formatClock(seconds: number, includeHours = false): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainder = safeSeconds % 60;

  if (includeHours || hours > 0) {
    return [hours, minutes, remainder].map(value => String(value).padStart(2, '0')).join(':');
  }

  return [minutes, remainder].map(value => String(value).padStart(2, '0')).join(':');
}

export function useWorkoutTimers({
  workoutStartTime,
  restDurationSeconds,
}: UseWorkoutTimersOptions) {
  const [phase, setPhase] = useState<WorkoutPhase>('waiting');
  const [exerciseSeconds, setExerciseSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [restStartedAt, setRestStartedAt] = useState<number | null>(null);
  const [activeRestDuration, setActiveRestDuration] = useState(0);
  const exerciseStartedAt = useRef(Date.now());
  const [totalSeconds, setTotalSeconds] = useState(() => wholeSecondsSince(workoutStartTime));

  useEffect(() => {
    const update = () => setTotalSeconds(wholeSecondsSince(workoutStartTime));
    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [workoutStartTime]);

  useEffect(() => {
    if (phase !== 'executing' && phase !== 'resting') return;

    const update = () => {
      if (phase === 'executing') {
        setExerciseSeconds(wholeSecondsSince(exerciseStartedAt.current));
        return;
      }

      if (restStartedAt === null) return;
      const remaining = Math.max(0, activeRestDuration - wholeSecondsSince(restStartedAt));
      setRestSeconds(remaining);
      if (remaining === 0) {
        setPhase('waiting');
        setRestStartedAt(null);
      }
    };

    const interval = window.setInterval(update, 200);
    update();
    return () => window.clearInterval(interval);
  }, [phase, restStartedAt, activeRestDuration]);

  function startSet() {
    exerciseStartedAt.current = Date.now();
    setExerciseSeconds(0);
    setPhase('executing');
  }

  function completeSet(durationSeconds = restDurationSeconds, hasNextSet = true) {
    if (!hasNextSet) {
      setRestSeconds(0);
      setRestStartedAt(null);
      setPhase('next-exercise');
      return;
    }
    const duration = Math.max(1, durationSeconds);
    setActiveRestDuration(duration);
    setRestSeconds(duration);
    setRestStartedAt(Date.now());
    setPhase('resting');
  }

  function skipRest() {
    setRestSeconds(0);
    setRestStartedAt(null);
    setPhase('waiting');
  }

  return {
    phase,
    exerciseSeconds,
    restSeconds,
    totalSeconds,
    restDurationSeconds,
    startSet,
    completeSet,
    skipRest,
  };
}


