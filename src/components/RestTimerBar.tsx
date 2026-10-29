import React from 'react';
import { useWorkout } from '../context/WorkoutContext.tsx';
import { Timer, Plus, Minus, X, Check } from 'lucide-react';

export const RestTimerBar: React.FC = () => {
  const { restTimer, adjustRestTimer, stopRestTimer } = useWorkout();

  if (!restTimer.active && restTimer.secondsRemaining === 0) {
    return null;
  }

  const mins = Math.floor(restTimer.secondsRemaining / 60);
  const secs = restTimer.secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  const progressPct = restTimer.totalSeconds > 0
    ? Math.max(0, Math.min(100, ((restTimer.totalSeconds - restTimer.secondsRemaining) / restTimer.totalSeconds) * 100))
    : 100;

  const isComplete = restTimer.secondsRemaining === 0;

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className={`rounded-2xl p-3 shadow-xl backdrop-blur-md border ${
        isComplete 
          ? 'bg-[#172617]/95 border-[#39ff14]/50 shadow-[#39ff14]/10' 
          : 'bg-[#121214]/95 border-[#00ff66]/30 shadow-black/50'
      }`}>
        <div className="flex items-center justify-between gap-3">
          {/* Left: Icon & Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isComplete ? 'bg-[#39ff14] text-[#09090b]' : 'bg-[#00ff66]/20 text-[#00ff66]'
            }`}>
              {isComplete ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Timer className="w-5 h-5 animate-pulse" />}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#e8ffef] uppercase tracking-wider">
                  {isComplete ? 'Descanso Finalizado!' : 'Descanso Ativo'}
                </span>
                {restTimer.setNumber && (
                  <span className="text-[11px] text-[#a1a1aa]">
                    · Série {restTimer.setNumber}
                  </span>
                )}
              </div>
              <span className="text-xs text-[#a1a1aa] truncate">
                {isComplete ? 'Pronto para a próxima série 💪' : (restTimer.exerciseName || 'Recupere o fôlego')}
              </span>
            </div>
          </div>

          {/* Center/Right: Timer & Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {!isComplete && (
              <>
                <button
                  type="button"
                  onClick={() => adjustRestTimer(-15)}
                  className="w-8 h-8 rounded-lg bg-[#1c1c21] hover:bg-[#2d3449] text-[#e8ffef] flex items-center justify-center text-xs font-semibold active:scale-95 transition-all"
                  title="Menos 15 segundos"
                  aria-label="Diminuir 15 segundos"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="px-2.5 py-1 rounded-lg bg-[#09090b] border border-white/5 font-mono text-base font-bold tabular-nums text-[#00ff66] min-w-[58px] text-center">
                  {timeFormatted}
                </div>
                <button
                  type="button"
                  onClick={() => adjustRestTimer(15)}
                  className="w-8 h-8 rounded-lg bg-[#1c1c21] hover:bg-[#2d3449] text-[#e8ffef] flex items-center justify-center text-xs font-semibold active:scale-95 transition-all"
                  title="Mais 15 segundos"
                  aria-label="Aumentar 15 segundos"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={stopRestTimer}
              className={`h-8 px-2.5 rounded-lg flex items-center gap-1 text-xs font-semibold active:scale-95 transition-all ${
                isComplete
                  ? 'bg-[#39ff14] text-[#09090b] font-bold hover:brightness-110'
                  : 'bg-[#1c1c21] text-[#a1a1aa] hover:text-[#e8ffef]'
              }`}
            >
              {isComplete ? 'Continuar' : <X className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-[#09090b] h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isComplete ? 'bg-[#39ff14]' : 'bg-gradient-to-r from-[#00ff66] to-[#39ff14]'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
