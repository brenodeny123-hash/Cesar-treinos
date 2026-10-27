import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext.tsx';
import {
  Check,
  Plus,
  Minus,
  Timer,
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  Trash2,
  Minimize2,
  Info,
} from 'lucide-react';

interface ActiveWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({ isOpen, onClose }) => {
  const {
    activeWorkout,
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
  } = useWorkout();

  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<{
    duration: number;
    volume: number;
    sets: number;
    prs: string[];
  } | null>(null);

  if (!isOpen || !activeWorkout) return null;

  const currentExercise = activeWorkout.exercises[activeWorkout.currentExerciseIndex] || activeWorkout.exercises[0];

  const totalSets = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = activeWorkout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
    0
  );
  const progressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  // Format elapsed time
  const mins = Math.floor(activeWorkout.elapsedSeconds / 60);
  const secs = activeWorkout.elapsedSeconds % 60;
  const elapsedFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const handleFinish = () => {
    const result = finishActiveWorkout();
    if (result) {
      setCompletedSummary({
        duration: result.durationMinutes,
        volume: result.totalVolumeKg,
        sets: result.completedSetsCount,
        prs: result.prsAchieved,
      });
      setShowFinishConfirm(false);
    }
  };

  const handleDismissSummary = () => {
    setCompletedSummary(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0b1326] text-[#dae2fd] overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 px-4 bg-[#131b2e] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#171f33] hover:bg-[#222a3d] flex items-center justify-center text-[#94a3b8] hover:text-white transition-colors"
            title="Minimizar treino"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
              <h2 className="text-sm font-semibold font-display text-white truncate max-w-[200px]">
                {activeWorkout.routineTitle}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
              <span className="font-mono text-[#f97316] font-semibold">{elapsedFormatted}</span>
              <span>·</span>
              <span>{completedSets}/{totalSets} séries</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            className="px-3 py-1.5 rounded-lg bg-[#222a3d] text-xs text-[#94a3b8] hover:text-[#ffb4ab] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => setShowFinishConfirm(true)}
            className="px-4 py-2 rounded-lg bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-semibold font-display shadow-md active:scale-95 transition-all"
          >
            Finalizar
          </button>
        </div>
      </header>

      {/* Progress Strip */}
      <div className="w-full bg-[#171f33] h-1.5 shrink-0">
        <div
          className="bg-gradient-to-r from-[#f97316] to-[#91db2a] h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Exercise Navigation Tabs (Horizontal Scroll) */}
      <div className="px-3 py-2 bg-[#131b2e]/80 border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
        {activeWorkout.exercises.map((ex, idx) => {
          const isSelected = idx === activeWorkout.currentExerciseIndex;
          const isDone = ex.sets.every(s => s.completed);
          const doneCount = ex.sets.filter(s => s.completed).length;

          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => setCurrentExerciseIndex(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-all shrink-0 ${
                isSelected
                  ? 'bg-[#f97316] text-[#090d16] font-bold shadow-md'
                  : isDone
                  ? 'bg-[#172617] text-[#91db2a] border border-[#91db2a]/30'
                  : 'bg-[#171f33] text-[#94a3b8] hover:text-white'
              }`}
            >
              <span>{idx + 1}. {ex.name.split(' ')[0]}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isSelected ? 'bg-black/20 text-black' : isDone ? 'bg-[#91db2a]/20 text-[#91db2a]' : 'bg-[#222a3d]'
              }`}>
                {doneCount}/{ex.sets.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {currentExercise && (
          <div className="space-y-4 max-w-xl mx-auto">
            {/* Exercise Card Header */}
            <div className="bg-[#131b2e] rounded-2xl p-4 border border-white/5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#94a3b8] mb-1">
                    <span className="text-[#89ceff] font-medium">{currentExercise.muscleGroup}</span>
                    <span>·</span>
                    <span>Alvo: {currentExercise.targetReps}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-[#f97316]">
                      <Timer className="w-3.5 h-3.5" /> {currentExercise.defaultRestSec}s
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-display text-white">
                    {currentExercise.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={activeWorkout.currentExerciseIndex === 0}
                    onClick={() => setCurrentExerciseIndex(activeWorkout.currentExerciseIndex - 1)}
                    className="w-8 h-8 rounded-lg bg-[#171f33] disabled:opacity-30 text-[#dae2fd] flex items-center justify-center"
                    title="Exercício anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={activeWorkout.currentExerciseIndex === activeWorkout.exercises.length - 1}
                    onClick={() => setCurrentExerciseIndex(activeWorkout.currentExerciseIndex + 1)}
                    className="w-8 h-8 rounded-lg bg-[#171f33] disabled:opacity-30 text-[#dae2fd] flex items-center justify-center"
                    title="Próximo exercício"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Memory of Last Session & Coach Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {currentExercise.lastWeightKg !== undefined && (
                  <div className="bg-[#171f33] p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#f97316] shrink-0" />
                    <div>
                      <span className="text-[#94a3b8] block text-[11px]">Última Carga Registrada</span>
                      <span className="font-semibold text-white">
                        {currentExercise.lastWeightKg} kg × {currentExercise.lastReps || 10} reps
                      </span>
                    </div>
                  </div>
                )}
                {currentExercise.notes && (
                  <div className="bg-[#171f33] p-2.5 rounded-xl border border-white/5 flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#89ceff] shrink-0 mt-0.5" />
                    <span className="text-[#dae2fd] text-[11px] leading-relaxed">
                      {currentExercise.notes}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Timer Triggers */}
            <div className="flex items-center justify-between gap-2 px-1 text-xs">
              <span className="text-[#94a3b8] font-medium flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-[#f97316]" /> Iniciar Descanso:
              </span>
              <div className="flex gap-1.5">
                {[45, 60, 90, 120].map(sec => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => startRestTimer(sec, currentExercise.name)}
                    className="px-2.5 py-1 rounded-lg bg-[#171f33] hover:bg-[#222a3d] text-[#dae2fd] font-mono text-xs border border-white/5 active:scale-95 transition-all"
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Sets Tracker - Highly Tactile for Gym Floor */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#94a3b8] px-2 font-semibold">
                <span className="w-10">SÉRIE</span>
                <span className="flex-1 text-center">CARGA (KG)</span>
                <span className="w-24 text-center">REPS</span>
                <span className="w-16 text-right">FEITO</span>
              </div>

              {currentExercise.sets.map((set, sIdx) => {
                return (
                  <div
                    key={set.id}
                    className={`rounded-2xl p-3 border transition-all ${
                      set.completed
                        ? 'bg-[#12231b]/80 border-[#91db2a]/40 shadow-sm'
                        : 'bg-[#131b2e] border-white/5 shadow-sm hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Set Number */}
                      <div className="w-10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-sm font-bold font-display text-white">
                          #{set.setNumber}
                        </span>
                        {currentExercise.sets.length > 1 && !set.completed && (
                          <button
                            type="button"
                            onClick={() => removeSetFromExercise(currentExercise.id, set.id)}
                            className="text-[#94a3b8] hover:text-[#ffb4ab] mt-1 p-1"
                            title="Remover série"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Weight Stepper (-5, -1, [Input], +1, +5) */}
                      <div className="flex-1 flex items-center justify-center gap-1 min-w-0">
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => quickAdjustWeight(currentExercise.id, set.id, -5)}
                            className="w-7 h-9 rounded-lg bg-[#171f33] hover:bg-[#222a3d] text-[11px] font-mono font-bold text-[#94a3b8] active:scale-90 transition-all flex items-center justify-center"
                            title="-5 kg"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => quickAdjustWeight(currentExercise.id, set.id, -1)}
                            className="w-7 h-9 rounded-lg bg-[#171f33] hover:bg-[#222a3d] text-xs font-mono font-bold text-[#dae2fd] active:scale-90 transition-all flex items-center justify-center"
                            title="-1 kg"
                          >
                            -1
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            type="number"
                            step="0.5"
                            value={set.weightKg === 0 ? '' : set.weightKg}
                            onChange={e =>
                              updateSet(currentExercise.id, set.id, {
                                weightKg: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="0"
                            className="w-16 h-10 rounded-xl bg-[#0b1326] border border-white/10 text-center font-mono text-base font-bold text-white focus:outline-none focus:border-[#f97316] tabular-nums"
                          />
                          <span className="text-[10px] text-[#94a3b8] block text-center mt-0.5">kg</span>
                        </div>

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => quickAdjustWeight(currentExercise.id, set.id, 1)}
                            className="w-7 h-9 rounded-lg bg-[#171f33] hover:bg-[#222a3d] text-xs font-mono font-bold text-[#dae2fd] active:scale-90 transition-all flex items-center justify-center"
                            title="+1 kg"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => quickAdjustWeight(currentExercise.id, set.id, 5)}
                            className="w-7 h-9 rounded-lg bg-[#171f33] hover:bg-[#222a3d] text-[11px] font-mono font-bold text-[#f97316] active:scale-90 transition-all flex items-center justify-center"
                            title="+5 kg"
                          >
                            +5
                          </button>
                        </div>
                      </div>

                      {/* Reps Stepper */}
                      <div className="w-24 flex items-center justify-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => quickAdjustReps(currentExercise.id, set.id, -1)}
                          className="w-7 h-9 rounded-lg bg-[#171f33] hover:bg-[#222a3d] text-xs font-bold text-[#dae2fd] active:scale-90 flex items-center justify-center"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            value={set.reps}
                            onChange={e =>
                              updateSet(currentExercise.id, set.id, {
                                reps: parseInt(e.target.value, 10) || 1,
                              })
                            }
                            className="w-11 h-10 rounded-xl bg-[#0b1326] border border-white/10 text-center font-mono text-base font-bold text-white focus:outline-none focus:border-[#f97316] tabular-nums"
                          />
                          <span className="text-[10px] text-[#94a3b8] block text-center mt-0.5">reps</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => quickAdjustReps(currentExercise.id, set.id, 1)}
                          className="w-7 h-9 rounded-lg bg-[#171f33] hover:bg-[#222a3d] text-xs font-bold text-[#dae2fd] active:scale-90 flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Completion Check Button (Min 48px hit area) */}
                      <div className="w-16 flex items-center justify-end shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleSetCompleted(currentExercise.id, set.id)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-md ${
                            set.completed
                              ? 'bg-[#91db2a] text-[#090d16] ring-2 ring-[#91db2a]/50 shadow-[#91db2a]/20'
                              : 'bg-[#222a3d] text-[#94a3b8] hover:text-white hover:bg-[#2d3449]'
                          }`}
                          aria-label={set.completed ? 'Desmarcar série' : 'Marcar série como concluída'}
                        >
                          <Check className={`w-6 h-6 stroke-[3] ${set.completed ? 'scale-110' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add New Set Button */}
              <button
                type="button"
                onClick={() => addSetToExercise(currentExercise.id)}
                className="w-full py-3 rounded-xl border border-dashed border-white/15 hover:border-[#f97316]/50 bg-[#131b2e]/50 text-xs font-semibold text-[#94a3b8] hover:text-[#f97316] flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                Adicionar Série {currentExercise.sets.length + 1}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Finish Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171f33] border border-white/10 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-[#f97316]/20 text-[#f97316] flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold font-display text-white">Finalizar Treino?</h3>
              <p className="text-xs text-[#94a3b8] mt-1">
                Você completou <span className="font-semibold text-white">{completedSets}</span> de{' '}
                <span className="font-semibold text-white">{totalSets}</span> séries planejadas. Deseja registrar no seu histórico?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#222a3d] text-xs font-medium text-[#dae2fd] hover:bg-[#2d3449]"
              >
                Continuar Treinando
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold font-display shadow-lg active:scale-95"
              >
                Confirmar & Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Cancel Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171f33] border border-white/10 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="text-center">
              <h3 className="text-lg font-bold font-display text-white">Descartar Treino?</h3>
              <p className="text-xs text-[#94a3b8] mt-1">
                O progresso não salvo desta sessão atual será cancelado.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#222a3d] text-xs font-medium text-[#dae2fd]"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelActiveWorkout();
                  setShowCancelConfirm(false);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#93000a] hover:bg-red-700 text-white text-xs font-bold font-display"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workout Completed Celebration Summary Screen */}
      {completedSummary && (
        <div className="fixed inset-0 z-70 bg-[#0b1326] flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-[#f97316]/30 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-[#91db2a]/20 border border-[#91db2a]/40 text-[#91db2a] flex items-center justify-center mx-auto shadow-lg shadow-[#91db2a]/10">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#91db2a]">Treino Concluído!</span>
              <h2 className="text-2xl font-bold font-display text-white mt-1">Mandou Muito Bem! 🔥</h2>
              <p className="text-xs text-[#94a3b8] mt-1">
                Seu esforço e consistência foram registrados no seu histórico do #TeamCesar.
              </p>
            </div>

            {/* Performance Bento */}
            <div className="grid grid-cols-3 gap-2 text-left">
              <div className="bg-[#171f33] p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-[#94a3b8] uppercase">Tempo</span>
                <span className="text-lg font-bold font-display text-white block mt-0.5">
                  {completedSummary.duration} min
                </span>
              </div>
              <div className="bg-[#171f33] p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-[#94a3b8] uppercase">Volume Total</span>
                <span className="text-lg font-bold font-display text-[#f97316] block mt-0.5">
                  {completedSummary.volume.toLocaleString('pt-BR')} kg
                </span>
              </div>
              <div className="bg-[#171f33] p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-[#94a3b8] uppercase">Séries Feitas</span>
                <span className="text-lg font-bold font-display text-[#89ceff] block mt-0.5">
                  {completedSummary.sets}
                </span>
              </div>
            </div>

            {/* PRs achieved if any */}
            {completedSummary.prs.length > 0 && (
              <div className="bg-[#222a3d] p-3.5 rounded-2xl border border-[#acf847]/30 text-left space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#acf847]">
                  <Award className="w-4 h-4" /> Novo Recorde Pessoal Batido!
                </div>
                {completedSummary.prs.map((pr, idx) => (
                  <p key={idx} className="text-xs text-white">
                    🎯 {pr}
                  </p>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleDismissSummary}
              className="w-full py-3.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-bold font-display shadow-lg active:scale-95 transition-all"
            >
              Ver Meu Progresso Semanal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
