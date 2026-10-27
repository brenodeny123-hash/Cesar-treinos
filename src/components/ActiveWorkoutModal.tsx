import React, { useMemo, useState } from 'react';
import {
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  Info,
  Play,
  SkipForward,
  Timer,
  X,
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext.tsx';
import { FALLBACK_IMAGE, useExerciseImage } from '../hooks/useExerciseImage.ts';
import { formatClock, useWorkoutTimers } from '../hooks/useWorkoutTimers.ts';

interface ActiveWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({ isOpen, onClose }) => {
  const {
    activeWorkout,
    updateSet,
    toggleSetCompleted,
    addSetToExercise,
    removeSetFromExercise,
    setCurrentExerciseIndex,
    finishActiveWorkout,
    cancelActiveWorkout,
  } = useWorkout();
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<{
    durationSeconds: number;
    volume: number;
    sets: number;
    prs: string[];
  } | null>(null);

  const currentExercise = activeWorkout?.exercises[activeWorkout.currentExerciseIndex];
  const nextIncompleteSet = currentExercise?.sets.find(set => !set.completed);
  const restDuration = currentExercise?.defaultRestSec || 60;
  const timers = useWorkoutTimers({
    workoutStartTime: activeWorkout?.startTime || Date.now(),
    restDurationSeconds: restDuration,
  });
  const { imageUrl, isLoading } = useExerciseImage(currentExercise?.name || '');

  const completedSets = activeWorkout?.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter(set => set.completed).length,
    0,
  ) || 0;
  const totalSets = activeWorkout?.exercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0,
  ) || 0;
  const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  const hasNextSet = Boolean(currentExercise?.sets.some(set => !set.completed && set.id !== nextIncompleteSet?.id));
  const isLastExercise = Boolean(
    activeWorkout && activeWorkout.currentExerciseIndex >= activeWorkout.exercises.length - 1,
  );

  const setLabel = useMemo(() => {
    if (!currentExercise || !nextIncompleteSet) return 'Todas as séries concluídas';
    return 'Série ' + nextIncompleteSet.setNumber + ' de ' + currentExercise.sets.length +
      ' • ' + currentExercise.targetReps;
  }, [currentExercise, nextIncompleteSet]);

  if (!isOpen || (!activeWorkout && !completedSummary)) return null;

  const handleCompleteSet = () => {
    if (!currentExercise || !nextIncompleteSet) return;
    toggleSetCompleted(currentExercise.id, nextIncompleteSet.id);
    timers.completeSet(restDuration, hasNextSet);
  };

  const handleNextExercise = () => {
    if (isLastExercise) {
      setShowFinishConfirm(true);
      return;
    }
    setCurrentExerciseIndex(activeWorkout.currentExerciseIndex + 1);
    timers.skipRest();
  };

  const handlePreviousExercise = () => {
    if (activeWorkout.currentExerciseIndex === 0) return;
    setCurrentExerciseIndex(activeWorkout.currentExerciseIndex - 1);
    timers.skipRest();
  };

  const handleFinish = () => {
    const result = finishActiveWorkout();
    if (!result) return;
    setCompletedSummary({
      durationSeconds: timers.totalSeconds,
      volume: result.totalVolumeKg,
      sets: result.completedSetsCount,
      prs: result.prsAchieved,
    });
    setShowFinishConfirm(false);
    timers.skipRest();
  };

  const handleDismissSummary = () => {
    setCompletedSummary(null);
    onClose();
  };

  const handleCancel = () => {
    cancelActiveWorkout();
    setShowCancelConfirm(false);
    onClose();
  };

  const updateCurrentSet = (updates: { weightKg?: number; reps?: number }) => {
    if (!currentExercise || !nextIncompleteSet) return;
    updateSet(currentExercise.id, nextIncompleteSet.id, updates);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#0b1326] text-[#dae2fd]">
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#111827] px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <Timer aria-hidden="true" className="h-5 w-5 text-[#dcfce7]" />
            <span>Treino total</span>
            <span className="font-mono tabular-nums text-[#dae2fd]">{formatClock(timers.totalSeconds, true)}</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            className="flex min-h-12 items-center gap-2 rounded-xl bg-[#222a3d] px-3 text-base font-semibold text-white hover:bg-[#30394f]"
          >
            <X aria-hidden="true" className="h-5 w-5" /> Cancelar
          </button>
          <button
            type="button"
            onClick={() => setShowFinishConfirm(true)}
            className="flex min-h-12 items-center gap-2 rounded-xl bg-[#22c55e] px-4 text-base font-bold text-[#06210e] hover:bg-[#15803d] hover:text-white"
          >
            <Check aria-hidden="true" className="h-5 w-5" /> Finalizar
          </button>
        </div>
      </header>

      <div
        className="h-2 w-full shrink-0 bg-[#171f33]"
        role="progressbar"
        aria-label="Progresso do treino"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div className="h-full bg-[#22c55e] transition-all duration-300" style={{ width: progress + '%' }} />
      </div>

      <main className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        {currentExercise && (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={activeWorkout.currentExerciseIndex === 0}
                onClick={handlePreviousExercise}
                className="flex min-h-12 items-center gap-2 rounded-xl bg-[#171f33] px-3 text-base font-semibold text-white disabled:opacity-40"
              >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" /> Anterior
              </button>
              <span className="text-base font-semibold text-[#dcfce7]">
                Exercício {activeWorkout.currentExerciseIndex + 1} de {activeWorkout.exercises.length}
              </span>
              <button
                type="button"
                onClick={handleNextExercise}
                className="flex min-h-12 items-center gap-2 rounded-xl bg-[#171f33] px-3 text-base font-semibold text-white"
              >
                Próximo <ChevronRight aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <section className="overflow-hidden rounded-3xl border border-[#22c55e]/30 bg-[#111827] shadow-xl">
              <div className="relative h-[35vh] min-h-48 max-h-72 bg-[#0b1326]">
                {isLoading && (
                  <div
                    aria-label="Carregando imagem do exercício"
                    className="absolute inset-0 animate-pulse bg-[#22c55e]/10"
                  />
                )}
                <img
                  src={imageUrl}
                  alt={'Demonstração: ' + currentExercise.name}
                  onError={event => {
                    if (event.currentTarget.src !== FALLBACK_IMAGE) {
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }
                  }}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-base font-semibold text-[#dcfce7]">
                      {currentExercise.muscleGroup}
                    </span>
                    <h1 className="mt-1 break-words text-2xl font-bold leading-tight text-white">
                      {currentExercise.name}
                    </h1>
                    <p className="mt-2 text-base text-[#dae2fd]">{setLabel}</p>
                  </div>
                  <span className="flex min-h-12 items-center gap-2 rounded-xl bg-[#f97316]/15 px-3 text-base font-semibold text-[#f97316]">
                    <Timer aria-hidden="true" className="h-5 w-5" /> Descanso: {restDuration}s
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {currentExercise.lastWeightKg !== undefined && (
                    <div className="flex items-center gap-3 rounded-xl bg-[#171f33] p-3">
                      <Flame aria-hidden="true" className="h-6 w-6 shrink-0 text-[#22c55e]" />
                      <div>
                        <span className="block text-base text-[#dae2fd]">Última carga</span>
                        <span className="text-base font-bold text-white">
                          {currentExercise.lastWeightKg} kg × {currentExercise.lastReps || 10} repetições
                        </span>
                      </div>
                    </div>
                  )}
                  {currentExercise.notes && (
                    <div className="flex items-start gap-3 rounded-xl bg-[#171f33] p-3">
                      <Info aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-[#dcfce7]" />
                      <p className="text-base leading-6 text-[#dae2fd]">{currentExercise.notes}</p>
                    </div>
                  )}
                </div>

                <div className="rest-timer rounded-2xl border border-white/10 bg-[#0b1326] p-4 text-center">
                  {timers.phase === 'resting' ? (
                    <>
                      <span className="text-base font-semibold text-[#dae2fd]">Hora de descansar</span>
                      <div
                        className={'mx-auto mt-3 flex h-40 w-40 items-center justify-center rounded-full border-[10px] text-4xl font-bold tabular-nums ' +
                          (timers.restSeconds <= 10
                            ? 'animate-pulse border-red-500 text-red-400'
                            : 'border-[#f97316] text-[#f97316]')}
                        style={{
                          background: 'conic-gradient(#22c55e ' +
                            ((restDuration - timers.restSeconds) / Math.max(1, restDuration) * 100) +
                            '%, #222a3d 0)',
                        }}
                        role="timer"
                        aria-live="polite"
                      >
                        {formatClock(timers.restSeconds)}
                      </div>
                      <button
                        type="button"
                        onClick={timers.skipRest}
                        className="mx-auto mt-4 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#171f33] px-5 text-base font-bold text-white"
                      >
                        <SkipForward aria-hidden="true" className="h-5 w-5" /> Pular descanso
                      </button>
                    </>
                  ) : timers.phase === 'executing' ? (
                    <>
                      <span className="text-base font-semibold text-[#dcfce7]">Tempo da série</span>
                      <div className="mt-2 font-mono text-6xl font-bold tabular-nums text-[#22c55e]" role="timer">
                        {formatClock(timers.exerciseSeconds)}
                      </div>
                      <button
                        type="button"
                        onClick={handleCompleteSet}
                        className="mx-auto mt-4 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#22c55e] px-6 text-lg font-bold text-[#06210e] shadow-lg hover:bg-[#15803d] hover:text-white"
                      >
                        <Check aria-hidden="true" className="h-6 w-6" /> Série concluída
                      </button>
                    </>
                  ) : timers.phase === 'next-exercise' ? (
                    <>
                      <span className="text-base font-semibold text-[#dcfce7]">Exercício concluído</span>
                      <div className="mt-2 text-2xl font-bold text-white">
                        {isLastExercise ? 'Treino finalizado!' : 'Vamos para o próximo'}
                      </div>
                      <button
                        type="button"
                        onClick={handleNextExercise}
                        className="mx-auto mt-4 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#22c55e] px-6 text-lg font-bold text-[#06210e] shadow-lg hover:bg-[#15803d] hover:text-white"
                      >
                        <ChevronRight aria-hidden="true" className="h-6 w-6" />
                        {isLastExercise ? 'Ver resumo do treino' : 'Próximo exercício'}
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-base font-semibold text-[#dae2fd]">Pronto para começar?</span>
                      <div className="mt-2 font-mono text-6xl font-bold tabular-nums text-[#22c55e]">00:00</div>
                      {!nextIncompleteSet ? (
                        <button
                          type="button"
                          onClick={handleNextExercise}
                          className="mx-auto mt-4 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#22c55e] px-6 text-lg font-bold text-[#06210e] shadow-lg hover:bg-[#15803d] hover:text-white"
                        >
                          <ChevronRight aria-hidden="true" className="h-6 w-6" />
                          {isLastExercise ? 'Finalizar treino' : 'Próximo exercício'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={timers.startSet}
                          className="mx-auto mt-4 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#22c55e] px-6 text-lg font-bold text-[#06210e] shadow-lg hover:bg-[#15803d] hover:text-white"
                        >
                          <Play aria-hidden="true" className="h-6 w-6" /> Iniciar série
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2 text-base font-semibold text-white">
                    <span>Progresso das séries</span>
                    <span>{completedSets} de {totalSets}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#222a3d]">
                    <div className="h-full rounded-full bg-[#22c55e] transition-all" style={{ width: progress + '%' }} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-white">Séries deste exercício</h2>
                  {currentExercise.sets.map(set => (
                    <div
                      key={set.id}
                      className={'flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3 ' +
                        (set.completed ? 'border-[#22c55e]/50 bg-[#22c55e]/10' : 'border-white/10 bg-[#171f33]')}
                    >
                      <span className="text-base font-bold text-white">
                        Série {set.setNumber} {set.completed ? '✓ Concluída' : ''}
                      </span>
                      {set.completed ? (
                        <span className="text-base text-[#dcfce7]">{set.weightKg} kg × {set.reps} reps</span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex min-h-12 items-center gap-2 text-base text-white">
                            Carga
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={set.weightKg || ''}
                              onChange={event =>
                                updateSet(currentExercise.id, set.id, {
                                  weightKg: Number(event.target.value) || 0,
                                })
                              }
                              className="h-12 w-20 rounded-lg border border-white/20 bg-[#0b1326] px-2 text-center text-base text-white"
                              aria-label={'Carga da série ' + set.setNumber + ' em quilos'}
                            />
                            kg
                          </label>
                          <label className="flex min-h-12 items-center gap-2 text-base text-white">
                            Repetições
                            <input
                              type="number"
                              min="1"
                              value={set.reps}
                              onChange={event =>
                                updateSet(currentExercise.id, set.id, {
                                  reps: Number(event.target.value) || 1,
                                })
                              }
                              className="h-12 w-20 rounded-lg border border-white/20 bg-[#0b1326] px-2 text-center text-base text-white"
                              aria-label={'Repetições da série ' + set.setNumber}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSetToExercise(currentExercise.id)}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#22c55e]/50 px-4 text-base font-semibold text-[#dcfce7]"
                  >
                    <Dumbbell aria-hidden="true" className="h-5 w-5" /> Adicionar série
                  </button>
                  {currentExercise.sets.length > 1 && nextIncompleteSet && (
                    <button
                      type="button"
                      onClick={() => removeSetFromExercise(currentExercise.id, nextIncompleteSet.id)}
                      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#171f33] px-4 text-base font-semibold text-[#dae2fd]"
                    >
                      <X aria-hidden="true" className="h-5 w-5" /> Remover próxima série
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {showFinishConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
          <section className="w-full max-w-md space-y-5 rounded-3xl border border-white/10 bg-[#111827] p-6">
            <div className="text-center">
              <Award aria-hidden="true" className="mx-auto h-12 w-12 text-[#22c55e]" />
              <h2 className="mt-3 text-2xl font-bold text-white">Finalizar treino?</h2>
              <p className="mt-2 text-base leading-6 text-[#dae2fd]">
                Você concluiu {completedSets} de {totalSets} séries. Deseja salvar este treino no histórico?
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#222a3d] px-4 text-base font-semibold text-white"
              >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" /> Continuar treinando
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-4 text-base font-bold text-[#06210e]"
              >
                <Check aria-hidden="true" className="h-5 w-5" /> Salvar treino
              </button>
            </div>
          </section>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
          <section className="w-full max-w-md space-y-5 rounded-3xl border border-white/10 bg-[#111827] p-6 text-center">
            <h2 className="text-2xl font-bold text-white">Cancelar treino?</h2>
            <p className="text-base leading-6 text-[#dae2fd]">O progresso desta sessão será descartado.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#222a3d] px-4 text-base font-semibold text-white"
              >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" /> Voltar ao treino
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-base font-bold text-white"
              >
                <X aria-hidden="true" className="h-5 w-5" /> Descartar treino
              </button>
            </div>
          </section>
        </div>
      )}

      {completedSummary && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0b1326] p-4">
          <section className="w-full max-w-md space-y-5 rounded-3xl border border-[#22c55e]/40 bg-[#111827] p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e]/15 text-[#22c55e]">
              <Check aria-hidden="true" className="h-9 w-9 stroke-[3]" />
            </div>
            <div>
              <span className="text-base font-bold text-[#dcfce7]">Treino concluído!</span>
              <h2 className="mt-1 text-2xl font-bold text-white">Mandou muito bem!</h2>
              <p className="mt-2 text-base text-[#dae2fd]">
                Sua dedicação foi registrada. Continue nesse ritmo.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-left">
              <div className="rounded-xl bg-[#171f33] p-3">
                <span className="block text-base text-[#dae2fd]">Tempo</span>
                <strong className="mt-1 block text-lg text-white">
                  {formatClock(completedSummary.durationSeconds, true)}
                </strong>
              </div>
              <div className="rounded-xl bg-[#171f33] p-3">
                <span className="block text-base text-[#dae2fd]">Volume</span>
                <strong className="mt-1 block text-lg text-[#dcfce7]">
                  {completedSummary.volume.toLocaleString('pt-BR')} kg
                </strong>
              </div>
              <div className="rounded-xl bg-[#171f33] p-3">
                <span className="block text-base text-[#dae2fd]">Séries</span>
                <strong className="mt-1 block text-lg text-white">{completedSummary.sets}</strong>
              </div>
            </div>
            {completedSummary.prs.length > 0 && (
              <div className="rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/10 p-4 text-left">
                <div className="flex items-center gap-2 text-base font-bold text-[#dcfce7]">
                  <Award aria-hidden="true" className="h-5 w-5" /> Novo recorde pessoal
                </div>
                {completedSummary.prs.map((record, index) => (
                  <p key={index} className="mt-2 text-base text-white">{record}</p>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={handleDismissSummary}
              className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#22c55e] px-6 text-lg font-bold text-[#06210e]"
            >
              <Check aria-hidden="true" className="h-6 w-6" /> Ver meu progresso
            </button>
          </section>
        </div>
      )}
    </div>
  );
};
