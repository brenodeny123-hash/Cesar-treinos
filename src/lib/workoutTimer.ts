// Máquina de estados do cronômetro de séries.
// Fonte da verdade = horário absoluto (endsAt, em ms). Nunca depende de decrementos de setInterval.
// Fluxo: EXECUÇÃO -> DESCANSO -> (fim do descanso) -> PRÓXIMA SÉRIE.
export type Phase = 'idle' | 'executing' | 'resting';

export interface TimerState {
  phase: Phase;
  sessionId: number | null; // identifica o treino em andamento
  setKey: string | null; // "exerciseId|setId"
  endsAt: number | null; // epoch ms do fim da etapa (null se ocioso ou pausado)
  remainingMs: number; // usado somente quando pausado
  paused: boolean;
  executionSec: number;
  restSec: number;
  completedKeys: string[]; // séries já registradas pela máquina (anti-duplicação)
}

export type TimerEffect =
  | { type: 'complete_set'; setKey: string }
  | { type: 'rest_done'; setKey: string }
  | { type: 'beep' };

export type TimerEvent =
  | { type: 'begin_session'; sessionId: number | null }
  | { type: 'start'; setKey: string }
  | { type: 'forget_set'; setKey: string }
  | { type: 'start_rest'; setKey: string } // série marcada manualmente: vai direto ao descanso
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'tick' }
  | { type: 'finish_execution' }
  | { type: 'skip_rest' }
  | { type: 'restart_phase' }
  | { type: 'stop' }
  | { type: 'adjust'; deltaSec: number }
  | { type: 'set_execution_sec'; seconds: number }
  | { type: 'set_rest_sec'; seconds: number };

export const DEFAULT_EXECUTION_SEC = 40;
export const DEFAULT_REST_SEC = 60;

const clamp = (n: unknown, lo: number, hi: number): number => Math.min(hi, Math.max(lo, Math.round(Number(n) || lo)));

export const initialTimerState = (): TimerState => ({
  phase: 'idle', sessionId: null, setKey: null, endsAt: null, remainingMs: 0, paused: false,
  executionSec: DEFAULT_EXECUTION_SEC, restSec: DEFAULT_REST_SEC, completedKeys: [],
});

export const remainingMs = (s: TimerState, now: number): number =>
  s.phase === 'idle' ? 0 : s.paused ? s.remainingMs : Math.max(0, (s.endsAt ?? now) - now);

type Result = { state: TimerState; effects: TimerEffect[] };

const enterRest = (s: TimerState, from: number): Result => {
  const key = s.setKey as string;
  const first = !s.completedKeys.includes(key);
  return {
    state: { ...s, phase: 'resting', endsAt: from + s.restSec * 1000, remainingMs: 0, paused: false, completedKeys: first ? [...s.completedKeys, key] : s.completedKeys },
    effects: [...(first ? [{ type: 'complete_set', setKey: key } as TimerEffect] : []), { type: 'beep' }],
  };
};

const finishRest = (s: TimerState): Result => ({
  state: { ...s, phase: 'idle', setKey: null, endsAt: null, remainingMs: 0, paused: false },
  effects: [{ type: 'rest_done', setKey: s.setKey as string }, { type: 'beep' }],
});

// Avança as etapas vencidas. Se o aparelho ficou bloqueado, "recupera" as transições usando o horário previsto.
const advance = (state: TimerState, now: number): Result => {
  let s = state;
  const effects: TimerEffect[] = [];
  for (let i = 0; i < 4 && s.phase !== 'idle' && !s.paused && s.endsAt !== null && now >= s.endsAt; i++) {
    const r = s.phase === 'executing' ? enterRest(s, s.endsAt) : finishRest(s);
    s = r.state;
    effects.push(...r.effects);
  }
  return s === state ? { state, effects: [] } : { state: s, effects };
};

export function reduceTimer(state: TimerState, event: TimerEvent, now: number): Result {
  const none: Result = { state, effects: [] };
  const only = (patch: Partial<TimerState>): Result => ({ state: { ...state, ...patch }, effects: [] });
  switch (event.type) {
    case 'begin_session':
      if (state.sessionId === event.sessionId) return none;
      return { state: { ...initialTimerState(), executionSec: state.executionSec, restSec: state.restSec, sessionId: event.sessionId }, effects: [] };
    case 'start':
      if (state.phase !== 'idle' || state.completedKeys.includes(event.setKey)) return none; // um cronômetro por vez; sem série duplicada
      return only({ phase: 'executing', setKey: event.setKey, endsAt: now + state.executionSec * 1000, remainingMs: 0, paused: false });
    case 'forget_set':
      if (!state.completedKeys.includes(event.setKey)) return none;
      return only({ completedKeys: state.completedKeys.filter(k => k !== event.setKey) });
    case 'start_rest':
      if (state.phase !== 'idle') return none;
      return only({ phase: 'resting', setKey: event.setKey, endsAt: now + state.restSec * 1000, remainingMs: 0, paused: false,
        completedKeys: state.completedKeys.includes(event.setKey) ? state.completedKeys : [...state.completedKeys, event.setKey] });
    case 'pause':
      if (state.phase === 'idle' || state.paused || state.endsAt === null) return none;
      return only({ paused: true, remainingMs: Math.max(0, state.endsAt - now), endsAt: null });
    case 'resume':
      if (!state.paused) return none;
      return only({ paused: false, endsAt: now + state.remainingMs, remainingMs: 0 });
    case 'tick':
      return advance(state, now);
    case 'finish_execution':
      if (state.phase !== 'executing' || state.setKey === null) return none;
      return enterRest({ ...state, paused: false }, now);
    case 'skip_rest':
      if (state.phase !== 'resting' || state.setKey === null) return none;
      return finishRest(state);
    case 'restart_phase': {
      if (state.phase === 'idle') return none;
      const ms = (state.phase === 'executing' ? state.executionSec : state.restSec) * 1000;
      return only({ paused: false, endsAt: now + ms, remainingMs: 0 });
    }
    case 'stop':
      if (state.phase === 'idle') return none;
      return only({ phase: 'idle', setKey: null, endsAt: null, remainingMs: 0, paused: false });
    case 'adjust': {
      if (state.phase === 'idle') return none;
      const d = Math.round(event.deltaSec) * 1000;
      if (state.paused) return only({ remainingMs: Math.max(0, state.remainingMs + d) });
      return only({ endsAt: Math.max(now, (state.endsAt ?? now) + d) });
    }
    case 'set_execution_sec':
      return only({ executionSec: clamp(event.seconds, 5, 600) });
    case 'set_rest_sec':
      return only({ restSec: clamp(event.seconds, 10, 600) });
    default:
      return none;
  }
}

/** Valida o que veio do armazenamento (pode estar corrompido) e devolve um estado seguro. */
export function restoreTimerState(raw: unknown): TimerState {
  const base = initialTimerState();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  const state: TimerState = {
    ...base,
    sessionId: num(r.sessionId),
    executionSec: clamp(r.executionSec ?? base.executionSec, 5, 600),
    restSec: clamp(r.restSec ?? base.restSec, 10, 600),
    completedKeys: Array.isArray(r.completedKeys) ? r.completedKeys.filter(k => typeof k === 'string').slice(-500) as string[] : [],
  };
  if ((r.phase !== 'executing' && r.phase !== 'resting') || typeof r.setKey !== 'string') return state;
  const phase = r.phase as Phase;
  if (r.paused === true) {
    const rem = num(r.remainingMs);
    return rem === null ? state : { ...state, phase, setKey: r.setKey, paused: true, remainingMs: Math.max(0, rem), endsAt: null };
  }
  const endsAt = num(r.endsAt);
  return endsAt === null ? state : { ...state, phase, setKey: r.setKey, endsAt, paused: false, remainingMs: 0 };
}
