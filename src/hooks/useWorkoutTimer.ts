import { useCallback, useEffect, useRef, useState } from 'react';
import { initialTimerState, reduceTimer, remainingMs, restoreTimerState, type TimerEvent, type TimerState } from '../lib/workoutTimer.ts';

let audio: AudioContext | null = null;
/** Sinal sonoro discreto. Falha em silêncio se o navegador não permitir áudio. */
const beep = () => {
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.07;
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.18);
  } catch { /* sem áudio */ }
};

const load = (key: string): TimerState => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? restoreTimerState(JSON.parse(saved)) : initialTimerState();
  } catch {
    return initialTimerState();
  }
};

interface Handlers {
  onCompleteSet: (setKey: string) => void;
  onRestDone: (setKey: string, completedKeys: string[]) => void;
}

export function useWorkoutTimer(storageKey: string, handlers: Handlers) {
  const [state, setState] = useState<TimerState>(() => load(storageKey));
  const [now, setNow] = useState(() => Date.now());
  const ref = useRef(state);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const dispatch = useCallback((event: TimerEvent) => {
    const t = Date.now();
    const { state: next, effects } = reduceTimer(ref.current, event, t);
    if (next !== ref.current) {
      ref.current = next; // atualiza antes dos efeitos: eventos encadeados enxergam o estado novo
      setState(next);
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* sem armazenamento */ }
    }
    if (next.phase !== 'idle') setNow(t);
    for (const effect of effects) {
      if (effect.type === 'beep') beep();
      else if (effect.type === 'complete_set') handlersRef.current.onCompleteSet(effect.setKey);
      else handlersRef.current.onRestDone(effect.setKey, ref.current.completedKeys);
    }
  }, [storageKey]);

  useEffect(() => {
    dispatch({ type: 'tick' }); // recupera etapas vencidas após recarregar a página
    const id = window.setInterval(() => dispatch({ type: 'tick' }), 250); // só dispara a conferência; a verdade é o horário absoluto
    const wake = () => { if (document.visibilityState === 'visible') dispatch({ type: 'tick' }); };
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('focus', wake);
    window.addEventListener('pageshow', wake);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('focus', wake);
      window.removeEventListener('pageshow', wake);
    };
  }, [dispatch]);

  return { state, remaining: remainingMs(state, now), dispatch };
}

export type WorkoutTimer = ReturnType<typeof useWorkoutTimer>;
