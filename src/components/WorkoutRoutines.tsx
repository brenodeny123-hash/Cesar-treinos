import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext.tsx';
import { WorkoutRoutine, ExerciseItem } from '../types/crm.ts';
import {
  Play,
  Plus,
  Flame,
  ChevronRight,
  Clock,
  Layers,
  Sparkles,
  X,
  Check,
  Edit2,
  Trash2,
  Copy,
  Dumbbell,
  Settings,
} from 'lucide-react';
import { EXERCISE_LIBRARY } from '../data/mockData.ts';

interface WorkoutRoutinesProps {
  onStartRoutine: (routineId: string) => void;
}

export const WorkoutRoutines: React.FC<WorkoutRoutinesProps> = ({ onStartRoutine }) => {
  const {
    routines,
    addExerciseToRoutine,
    updateExerciseInRoutine,
    deleteExerciseFromRoutine,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    duplicateRoutine,
    activeWorkout,
  } = useWorkout();

  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(routines[0]?.id || 'routine-a');

  // Modals state
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseItem | null>(null);

  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);

  // Routine Form State
  const [routineCode, setRoutineCode] = useState('E');
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineMuscles, setRoutineMuscles] = useState('');
  const [routineDuration, setRoutineDuration] = useState(50);
  const [routineColor, setRoutineColor] = useState('#f97316');

  // Exercise Form State
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseMuscle, setExerciseMuscle] = useState<
    'Peito' | 'Costas' | 'Pernas' | 'Ombros' | 'Bíceps' | 'Tríceps' | 'Abdômen' | 'Glúteo'
  >('Peito');
  const [targetSets, setTargetSets] = useState(3);
  const [targetReps, setTargetReps] = useState('10 a 12 reps');
  const [restSeconds, setRestSeconds] = useState(60);
  const [exerciseNotes, setExerciseNotes] = useState('');

  const selectedRoutine = routines.find(r => r.id === selectedRoutineId) || routines[0] || {
    id: 'empty',
    code: 'A',
    title: 'Sem Treino',
    focusMuscles: '',
    estimatedMinutes: 50,
    color: '#f97316',
    exercises: [],
  };

  // Routine CRUD Handlers
  const handleOpenCreateRoutine = () => {
    setEditingRoutine(null);
    const nextCodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const usedCodes = routines.map(r => r.code);
    const available = nextCodes.find(c => !usedCodes.includes(c)) || `T${routines.length + 1}`;
    setRoutineCode(available);
    setRoutineTitle('');
    setRoutineMuscles('Grupamentos musculares focados');
    setRoutineDuration(50);
    setRoutineColor('#f97316');
    setIsRoutineModalOpen(true);
  };

  const handleOpenEditRoutine = (routine: WorkoutRoutine) => {
    setEditingRoutine(routine);
    setRoutineCode(routine.code);
    setRoutineTitle(routine.title);
    setRoutineMuscles(routine.focusMuscles);
    setRoutineDuration(routine.estimatedMinutes);
    setRoutineColor(routine.color || '#f97316');
    setIsRoutineModalOpen(true);
  };

  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineTitle.trim()) return;

    if (editingRoutine) {
      updateRoutine(editingRoutine.id, {
        code: routineCode.trim().toUpperCase(),
        title: routineTitle.trim(),
        focusMuscles: routineMuscles.trim(),
        estimatedMinutes: Number(routineDuration),
        color: routineColor,
      });
    } else {
      createRoutine({
        code: routineCode.trim().toUpperCase(),
        title: routineTitle.trim(),
        focusMuscles: routineMuscles.trim() || 'Foco muscular',
        estimatedMinutes: Number(routineDuration) || 50,
        color: routineColor,
        exercises: [
          {
            id: `ex-${Date.now()}-1`,
            name: 'Exercício Principal',
            muscleGroup: 'Peito',
            targetSets: 4,
            targetReps: '8 a 10 reps',
            defaultRestSec: 90,
            notes: 'Cadência controlada.',
            sets: [
              { id: `set-${Date.now()}-1`, setNumber: 1, weightKg: 20, reps: 10, completed: false },
              { id: `set-${Date.now()}-2`, setNumber: 2, weightKg: 20, reps: 10, completed: false },
              { id: `set-${Date.now()}-3`, setNumber: 3, weightKg: 20, reps: 10, completed: false },
              { id: `set-${Date.now()}-4`, setNumber: 4, weightKg: 20, reps: 10, completed: false },
            ],
          },
        ],
      });
    }
    setIsRoutineModalOpen(false);
  };

  const handleDeleteRoutine = (routineId: string, title: string) => {
    if (routines.length <= 1) {
      alert('Você precisa manter pelo menos uma ficha de treino cadastrada.');
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir o "${title}"?`)) {
      deleteRoutine(routineId);
      const remaining = routines.filter(r => r.id !== routineId);
      if (remaining[0]) {
        setSelectedRoutineId(remaining[0].id);
      }
    }
  };

  // Exercise CRUD Handlers
  const handleOpenAddExercise = () => {
    setEditingExercise(null);
    setExerciseName('');
    setExerciseMuscle('Peito');
    setTargetSets(3);
    setTargetReps('10 a 12 reps');
    setRestSeconds(60);
    setExerciseNotes('');
    setIsAddExerciseOpen(true);
  };

  const handleOpenEditExercise = (ex: ExerciseItem) => {
    setEditingExercise(ex);
    setExerciseName(ex.name);
    setExerciseMuscle(ex.muscleGroup);
    setTargetSets(ex.targetSets);
    setTargetReps(ex.targetReps);
    setRestSeconds(ex.defaultRestSec);
    setExerciseNotes(ex.notes || '');
    setIsAddExerciseOpen(true);
  };

  const handleSelectFromLibrary = (libItem: typeof EXERCISE_LIBRARY[0]) => {
    setExerciseName(libItem.name);
    setExerciseMuscle(libItem.muscleGroup as 'Peito');
    setRestSeconds(libItem.defaultRestSec);
  };

  const handleSaveExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;

    if (editingExercise) {
      updateExerciseInRoutine(selectedRoutine.id, editingExercise.id, {
        name: exerciseName.trim(),
        muscleGroup: exerciseMuscle,
        targetSets,
        targetReps,
        defaultRestSec: restSeconds,
        notes: exerciseNotes.trim() || undefined,
      });
    } else {
      addExerciseToRoutine(selectedRoutine.id, {
        name: exerciseName.trim(),
        muscleGroup: exerciseMuscle,
        targetSets,
        targetReps,
        defaultRestSec: restSeconds,
        notes: exerciseNotes.trim() || undefined,
      });
    }

    setIsAddExerciseOpen(false);
    setEditingExercise(null);
  };

  const handleDeleteExercise = (exerciseId: string, exName: string) => {
    if (selectedRoutine.exercises.length <= 1) {
      alert('A ficha deve possuir pelo menos 1 exercício.');
      return;
    }
    if (window.confirm(`Remover "${exName}" desta ficha?`)) {
      deleteExerciseFromRoutine(selectedRoutine.id, exerciseId);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header & Quick Routine Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Fichas de Treino (CRUD)</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Prescrição, montagem e edição de rotinas para alunos.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateRoutine}
          className="px-3.5 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold font-display flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nova Ficha</span>
        </button>
      </div>

      {/* Routine Tabs / Cards Scroller */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
        {routines.map(routine => {
          const isSelected = routine.id === selectedRoutine.id;
          const isActive = activeWorkout?.routineId === routine.id;

          return (
            <button
              key={routine.id}
              type="button"
              onClick={() => setSelectedRoutineId(routine.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all shrink-0 min-w-[145px] flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#171f33] border-[#f97316] shadow-md shadow-[#f97316]/10'
                  : 'bg-[#131b2e] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className="w-7 h-7 rounded-lg text-xs font-bold font-display flex items-center justify-center"
                  style={{
                    backgroundColor: `${routine.color || '#f97316'}25`,
                    color: routine.color || '#f97316',
                  }}
                >
                  {routine.code}
                </span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
                )}
              </div>

              <div className="mt-2">
                <span className="text-xs font-bold font-display text-white block truncate">
                  {routine.title}
                </span>
                <span className="text-[11px] text-[#94a3b8] mt-0.5 block">
                  {routine.exercises.length} exercícios
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Routine Detail Card */}
      {selectedRoutine && (
        <div className="bg-[#131b2e] rounded-3xl p-5 border border-white/5 space-y-4 shadow-sm">
          {/* Card Top Information */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#94a3b8] mb-1">
                <span
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold"
                  style={{
                    backgroundColor: `${selectedRoutine.color || '#f97316'}25`,
                    color: selectedRoutine.color || '#f97316',
                  }}
                >
                  Treino {selectedRoutine.code}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> ~{selectedRoutine.estimatedMinutes} min
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> {selectedRoutine.exercises.length} exercícios
                </span>
              </div>
              <h3 className="text-lg font-bold font-display text-white">
                {selectedRoutine.title}
              </h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">{selectedRoutine.focusMuscles}</p>
            </div>

            {/* Routine Controls (Start, Edit, Duplicate, Delete) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenEditRoutine(selectedRoutine)}
                className="w-9 h-9 rounded-xl bg-[#171f33] hover:bg-[#222a3d] text-[#89ceff] flex items-center justify-center transition-colors"
                title="Editar informações do Treino"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => duplicateRoutine(selectedRoutine.id)}
                className="w-9 h-9 rounded-xl bg-[#171f33] hover:bg-[#222a3d] text-[#dae2fd] flex items-center justify-center transition-colors"
                title="Duplicar Treino"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteRoutine(selectedRoutine.id, selectedRoutine.title)}
                className="w-9 h-9 rounded-xl bg-[#171f33] hover:bg-[#93000a]/30 text-[#ffb4ab] flex items-center justify-center transition-colors"
                title="Excluir Treino"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onStartRoutine(selectedRoutine.id)}
                className="px-4 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold font-display flex items-center gap-1.5 shadow-lg shadow-[#f97316]/20 active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{activeWorkout?.routineId === selectedRoutine.id ? 'Retomar' : 'Iniciar'}</span>
              </button>
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#94a3b8] px-1 font-semibold">
              <span>EXERCÍCIOS PRESCRITOS</span>
              <button
                type="button"
                onClick={handleOpenAddExercise}
                className="text-[#f97316] hover:underline flex items-center gap-1 font-bold"
              >
                <Plus className="w-4 h-4" /> Adicionar Exercício
              </button>
            </div>

            {selectedRoutine.exercises.map((ex, idx) => (
              <div
                key={ex.id}
                className="bg-[#171f33] rounded-2xl p-3.5 border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-xl bg-[#222a3d] text-xs font-bold font-mono text-[#dae2fd] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-white block truncate">
                      {ex.name}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-[#94a3b8] mt-0.5">
                      <span className="text-[#89ceff] font-medium">{ex.muscleGroup}</span>
                      <span>·</span>
                      <span>{ex.targetSets} séries</span>
                      <span>·</span>
                      <span>{ex.targetReps}</span>
                      <span>·</span>
                      <span>{ex.defaultRestSec}s desc.</span>
                    </div>
                    {ex.notes && (
                      <p className="text-[11px] text-[#94a3b8] italic mt-0.5 truncate max-w-sm">
                        "{ex.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ex.lastWeightKg !== undefined && (
                    <div className="hidden sm:flex items-center gap-1 text-xs font-mono font-bold text-[#f97316] bg-[#0b1326] px-2 py-1 rounded-lg border border-white/5">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{ex.lastWeightKg} kg</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenEditExercise(ex)}
                    className="w-8 h-8 rounded-lg bg-[#222a3d] text-[#89ceff] hover:text-white flex items-center justify-center"
                    title="Editar exercício"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExercise(ex.id, ex.name)}
                    className="w-8 h-8 rounded-lg bg-[#222a3d] text-[#ffb4ab] hover:text-red-400 flex items-center justify-center"
                    title="Excluir exercício"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routine Create / Edit Modal */}
      {isRoutineModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#171f33] border border-white/10 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold font-display text-white">
                  {editingRoutine ? 'Editar Ficha de Treino' : 'Nova Ficha de Treino'}
                </h3>
                <span className="text-xs text-[#94a3b8]">Configure divisão, foco e tempo estimado</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRoutineModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#222a3d] text-[#94a3b8] hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoutine} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">Código</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="Ex: A, B, E"
                    value={routineCode}
                    onChange={e => setRoutineCode(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-center font-bold text-white uppercase"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">Título do Treino *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Peito, Ombros e Tríceps"
                    value={routineTitle}
                    onChange={e => setRoutineTitle(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                  Grupos Musculares Focados
                </label>
                <input
                  type="text"
                  placeholder="Ex: Peitoral Maior, Deltoide Anterior e Tríceps Braquial"
                  value={routineMuscles}
                  onChange={e => setRoutineMuscles(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                    Duração Estimada (min)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={routineDuration}
                    onChange={e => setRoutineDuration(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                    Cor Temática
                  </label>
                  <div className="flex gap-2 items-center h-11">
                    {['#f97316', '#89ceff', '#91db2a', '#acf847', '#ffb4ab'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setRoutineColor(c)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          routineColor === c ? 'scale-110 border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRoutineModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-[#222a3d] text-xs font-semibold text-[#dae2fd]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold font-display shadow-lg active:scale-95"
                >
                  {editingRoutine ? 'Salvar Ficha' : 'Criar Ficha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exercise Create / Edit Modal */}
      {isAddExerciseOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#171f33] border border-white/10 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold font-display text-white">
                  {editingExercise ? 'Editar Exercício' : 'Adicionar Exercício'}
                </h3>
                <span className="text-xs text-[#94a3b8]">Treino {selectedRoutine.code} • {selectedRoutine.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddExerciseOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#222a3d] text-[#94a3b8] hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Pick from Library (only when creating) */}
            {!editingExercise && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#94a3b8]">Biblioteca rápida de exercícios:</span>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {EXERCISE_LIBRARY.slice(0, 10).map(item => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleSelectFromLibrary(item)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] text-xs text-[#dae2fd] whitespace-nowrap active:scale-95 transition-all"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveExercise} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                  Nome do Exercício *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Supino Inclinado com Halteres"
                  value={exerciseName}
                  onChange={e => setExerciseName(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">Grupo Muscular</label>
                  <select
                    value={exerciseMuscle}
                    onChange={e => setExerciseMuscle(e.target.value as 'Peito')}
                    className="w-full h-11 px-2.5 rounded-xl bg-[#0b1326] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f97316]"
                  >
                    <option value="Peito">Peito</option>
                    <option value="Costas">Costas</option>
                    <option value="Pernas">Pernas</option>
                    <option value="Ombros">Ombros</option>
                    <option value="Bíceps">Bíceps</option>
                    <option value="Tríceps">Tríceps</option>
                    <option value="Abdômen">Abdômen</option>
                    <option value="Glúteo">Glúteo</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">Séries Padrão</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={targetSets}
                    onChange={e => setTargetSets(parseInt(e.target.value, 10) || 3)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">Faixa de Reps</label>
                  <input
                    type="text"
                    value={targetReps}
                    onChange={e => setTargetReps(e.target.value)}
                    placeholder="Ex: 8 a 10 reps"
                    className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f97316]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">Descanso (segundos)</label>
                  <input
                    type="number"
                    step="15"
                    value={restSeconds}
                    onChange={e => setRestSeconds(parseInt(e.target.value, 10) || 60)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                  Orientações de Execução / Dica do Treinador
                </label>
                <input
                  type="text"
                  placeholder="Ex: Segurar 2s na descida, cotovelos alinhados com o peito."
                  value={exerciseNotes}
                  onChange={e => setExerciseNotes(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f97316]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddExerciseOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#222a3d] text-xs font-semibold text-[#dae2fd]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#f97316] text-white text-xs font-bold font-display shadow-lg active:scale-95"
                >
                  {editingExercise ? 'Salvar Alterações' : 'Salvar Exercício'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
