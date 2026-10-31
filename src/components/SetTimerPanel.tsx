import React from 'react';
import { Pause, Play, RotateCcw, SkipForward, Square, Timer } from 'lucide-react';
import type { WorkoutTimer } from '../hooks/useWorkoutTimer.ts';

const fmt = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
const PHASE = { idle: 'Pronto', executing: 'Execução', resting: 'Descanso' } as const;

interface Props { timer: WorkoutTimer; startKey: string | null; label: string; autoNext: boolean; onAutoNext: (v: boolean) => void }

export const SetTimerPanel: React.FC<Props> = ({ timer, startKey, label, autoNext, onAutoNext }) => {
  const { state, remaining, dispatch } = timer;
  const running = state.phase !== 'idle';
  const total = (state.phase === 'executing' ? state.executionSec : state.restSec) * 1000;
  const pct = running ? Math.min(100, Math.max(0, ((total - remaining) / total) * 100)) : 0;
  const color = state.phase === 'resting' ? '#5be7ff' : '#00ff66';
  const big = 'w-full rounded-2xl py-4 text-base font-extrabold tracking-wide active:scale-[0.98] transition-transform';
  const small = 'flex-1 rounded-xl bg-white/10 px-3 py-3 text-xs font-semibold text-white flex items-center justify-center gap-1.5';
  const input = 'w-16 rounded-lg bg-[#09090b] border border-white/10 p-2 text-center text-white text-sm';

  return (
    <section className="rounded-2xl border bg-[#101014] p-4 space-y-3" style={{ borderColor: `${color}55`, boxShadow: `0 0 24px ${color}1a` }} aria-label="Cronômetro da série">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white flex items-center gap-2"><Timer className="w-4 h-4" style={{ color }} /> {label}</h4>
        <span className="text-[11px] font-bold px-2 py-1 rounded-lg" style={{ color, background: `${color}1a` }}>
          {state.paused ? 'Pausado' : PHASE[state.phase]}
        </span>
      </div>
      <div role="timer" aria-live="off" className="text-center font-mono text-6xl font-bold tabular-nums" style={{ color }}>
        {running ? fmt(remaining) : fmt(state.executionSec * 1000)}
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${pct}%`, background: color }} /></div>
      <p className="sr-only" aria-live="polite">{state.paused ? 'Pausado' : PHASE[state.phase]}</p>

      {state.phase === 'idle' && (
        <button type="button" disabled={!startKey} onClick={() => startKey && dispatch({ type: 'start', setKey: startKey })} className={`${big} bg-[#00ff66] text-[#04130a] disabled:opacity-40`}>
          {startKey ? 'INICIAR SÉRIE' : 'TODAS AS SÉRIES CONCLUÍDAS'}
        </button>
      )}
      {state.phase === 'executing' && (
        <div className="flex gap-2">
          <button type="button" onClick={() => dispatch({ type: state.paused ? 'resume' : 'pause' })} className={small}>{state.paused ? <><Play className="w-4 h-4" /> Continuar</> : <><Pause className="w-4 h-4" /> Pausar</>}</button>
          <button type="button" onClick={() => dispatch({ type: 'finish_execution' })} className="flex-[2] rounded-xl bg-[#00ff66] px-3 py-3 text-sm font-extrabold text-[#04130a]">FINALIZAR SÉRIE</button>
        </div>
      )}
      {state.phase === 'resting' && (
        <button type="button" onClick={() => dispatch({ type: 'skip_rest' })} className={`${big} bg-[#5be7ff] text-[#04131a] flex items-center justify-center gap-2`}><SkipForward className="w-5 h-5" /> PULAR DESCANSO</button>
      )}
      {running && (
        <div className="flex gap-2">
          <button type="button" onClick={() => dispatch({ type: 'adjust', deltaSec: -15 })} className={small}>−15s</button>
          <button type="button" onClick={() => dispatch({ type: 'adjust', deltaSec: 15 })} className={small}>+15s</button>
          <button type="button" onClick={() => dispatch({ type: 'restart_phase' })} className={small}><RotateCcw className="w-3.5 h-3.5" /> Reiniciar</button>
          <button type="button" aria-label="Parar cronômetro" onClick={() => dispatch({ type: 'stop' })} className={small}><Square className="w-3.5 h-3.5" /></button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-[#a1a1aa]">
        <label className="flex items-center gap-2">Execução (s)<input aria-label="Duração da execução em segundos" type="number" min={5} max={600} value={state.executionSec} onChange={e => dispatch({ type: 'set_execution_sec', seconds: Number(e.target.value) })} className={input} /></label>
        <label className="flex items-center gap-2">Descanso (s)<input aria-label="Descanso em segundos" type="number" min={10} max={600} value={state.restSec} onChange={e => dispatch({ type: 'set_rest_sec', seconds: Number(e.target.value) })} className={input} /></label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={autoNext} onChange={e => onAutoNext(e.target.checked)} /> Iniciar a próxima série sozinho</label>
      </div>
    </section>
  );
};
