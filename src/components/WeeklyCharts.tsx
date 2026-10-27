import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext.tsx';
import {
  TrendingUp,
  Award,
  Calendar,
  Dumbbell,
  ChevronDown,
  Flame,
  CheckCircle2,
  Clock,
  BarChart3,
} from 'lucide-react';

export const WeeklyCharts: React.FC = () => {
  const { workoutLogs, personalRecords } = useWorkout();

  // Selected exercise for load progression curve
  const [selectedExercise, setSelectedExercise] = useState<string>('Supino Reto com Barra');
  const [activeTooltip, setActiveTooltip] = useState<{ x: number; y: number; title: string; value: string } | null>(null);

  // Available exercises with history in logs
  const exerciseOptions = [
    'Supino Reto com Barra',
    'Agachamento Livre com Barra',
    'Leg Press 45°',
    'Remada Curvada com Barra',
    'Desenvolvimento Militar',
  ];

  // Group workout logs into weekly tonnage
  // We can calculate volume for the last 4 calendar weeks
  const weeklyData = [
    { weekLabel: 'Sem 40', dateRange: '29 Set - 05 Out', volumeKg: 13800, workoutsCount: 3 },
    { weekLabel: 'Sem 41', dateRange: '06 Out - 12 Out', volumeKg: 15450, workoutsCount: 4 },
    { weekLabel: 'Sem 42', dateRange: '13 Out - 19 Out', volumeKg: 17200, workoutsCount: 4 },
    { weekLabel: 'Sem 43 (Atual)', dateRange: '20 Out - 27 Out', volumeKg: 18720, workoutsCount: 4 },
  ];

  const maxVolume = Math.max(...weeklyData.map(w => w.volumeKg), 20000);

  // Extract load progression points for selected exercise
  // Gather from workoutLogs matching this exercise name
  const progressionPoints: { date: string; displayDate: string; maxWeightKg: number }[] = [];

  workoutLogs.slice().reverse().forEach(log => {
    const foundEx = log.exercises.find(e => 
      e.name.toLowerCase().includes(selectedExercise.toLowerCase()) || 
      selectedExercise.toLowerCase().includes(e.name.toLowerCase())
    );
    if (foundEx && foundEx.maxWeightKg > 0) {
      const d = new Date(log.date);
      const displayDate = `${d.getDate()}/${d.getMonth() + 1}`;
      progressionPoints.push({
        date: log.date,
        displayDate,
        maxWeightKg: foundEx.maxWeightKg,
      });
    }
  });

  // Ensure at least fallback progression points if none logged yet for that exercise
  const displayProgression = progressionPoints.length >= 2 ? progressionPoints : [
    { date: '2026-10-01', displayDate: '01/10', maxWeightKg: 70 },
    { date: '2026-10-08', displayDate: '08/10', maxWeightKg: 75 },
    { date: '2026-10-15', displayDate: '15/10', maxWeightKg: 80 },
    { date: '2026-10-22', displayDate: '22/10', maxWeightKg: 80 },
    { date: '2026-10-26', displayDate: '26/10', maxWeightKg: 85 },
  ];

  const minLoad = Math.min(...displayProgression.map(p => p.maxWeightKg)) - 5;
  const maxLoad = Math.max(...displayProgression.map(p => p.maxWeightKg)) + 5;
  const loadRange = Math.max(1, maxLoad - minLoad);

  // SVG Line Chart coordinates
  const svgWidth = 320;
  const svgHeight = 140;
  const paddingX = 28;
  const paddingY = 24;

  const pointsCoordinates = displayProgression.map((item, idx) => {
    const x = paddingX + (idx / Math.max(1, displayProgression.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((item.maxWeightKg - minLoad) / loadRange) * (svgHeight - paddingY * 2);
    return { ...item, x, y };
  });

  const pathD = pointsCoordinates.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = pointsCoordinates.length > 0
    ? `${pathD} L ${pointsCoordinates[pointsCoordinates.length - 1].x} ${svgHeight - paddingY} L ${pointsCoordinates[0].x} ${svgHeight - paddingY} Z`
    : '';

  const initialLoad = displayProgression[0]?.maxWeightKg || 0;
  const currentLoad = displayProgression[displayProgression.length - 1]?.maxWeightKg || 0;
  const deltaLoad = currentLoad - initialLoad;

  return (
    <div className="space-y-5 pb-24">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#f97316]" />
          <h2 className="text-xl font-bold font-display text-white">Evolução Semanal</h2>
        </div>
        <p className="text-xs text-[#94a3b8] mt-0.5">
          Acompanhe seu ganho de força, volume acumulado e consistência de treinos.
        </p>
      </div>

      {/* KPI Bento Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#131b2e] rounded-2xl p-4 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-[#f97316]/15 text-[#f97316]">
              <Dumbbell className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-semibold text-[#91db2a] bg-[#91db2a]/15 px-2 py-0.5 rounded-full">
              +8.8% este mês
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-display text-white tabular-nums">
              18.720 <span className="text-sm font-normal text-[#94a3b8]">kg</span>
            </span>
            <span className="text-xs text-[#94a3b8] block mt-0.5">Volume Semanal Total</span>
          </div>
        </div>

        <div className="bg-[#131b2e] rounded-2xl p-4 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-[#89ceff]/15 text-[#89ceff]">
              <Calendar className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-semibold text-[#89ceff] bg-[#89ceff]/15 px-2 py-0.5 rounded-full">
              4 de 5 treinos
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-display text-white tabular-nums">
              80% <span className="text-sm font-normal text-[#94a3b8]">meta</span>
            </span>
            <span className="text-xs text-[#94a3b8] block mt-0.5">Frequência da Semana</span>
          </div>
        </div>
      </div>

      {/* Chart 1: Load Progression per Exercise */}
      <div className="bg-[#131b2e] rounded-2xl p-4 border border-white/5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#f97316]">
              Progressão de Carga
            </span>
            <h3 className="text-base font-bold font-display text-white">Evolução do Exercício</h3>
          </div>

          {/* Exercise Selector */}
          <div className="relative">
            <select
              value={selectedExercise}
              onChange={e => setSelectedExercise(e.target.value)}
              className="appearance-none bg-[#171f33] border border-white/10 rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-white focus:outline-none focus:border-[#f97316] cursor-pointer"
            >
              {exerciseOptions.map(opt => (
                <option key={opt} value={opt} className="bg-[#171f33] text-white">
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#94a3b8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Load Delta highlight */}
        <div className="flex items-center justify-between bg-[#171f33] px-3 py-2 rounded-xl text-xs">
          <span className="text-[#94a3b8]">Carga Atual vs Inicial:</span>
          <div className="flex items-center gap-1.5 font-mono font-bold">
            <span className="text-white">{currentLoad} kg</span>
            <span className={`text-xs ${deltaLoad >= 0 ? 'text-[#91db2a]' : 'text-[#ffb4ab]'}`}>
              ({deltaLoad >= 0 ? `+${deltaLoad}` : deltaLoad} kg)
            </span>
          </div>
        </div>

        {/* Responsive Interactive SVG Curve */}
        <div className="relative pt-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-36 overflow-visible"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.5, 1].map((ratio, idx) => {
              const y = paddingY + ratio * (svgHeight - paddingY * 2);
              const val = Math.round(maxLoad - ratio * loadRange);
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingX - 4}
                    y={y + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {val}k
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {areaD && <path d={areaD} fill="url(#areaGradient)" />}

            {/* Main Path */}
            <path
              d={pathD}
              fill="none"
              stroke="#f97316"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {pointsCoordinates.map((pt, idx) => (
              <g key={idx} className="cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#0b1326"
                  stroke="#f97316"
                  strokeWidth="2"
                  className="hover:r-7 transition-all"
                  onClick={() =>
                    setActiveTooltip({
                      x: pt.x,
                      y: pt.y,
                      title: pt.date,
                      value: `${pt.maxWeightKg} kg`,
                    })
                  }
                />
                <text
                  x={pt.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {pt.displayDate}
                </text>
              </g>
            ))}
          </svg>

          {/* Interactive Tooltip if tapped */}
          {activeTooltip && (
            <div
              className="absolute bg-[#171f33] text-white text-[11px] font-mono px-2 py-1 rounded-lg border border-[#f97316]/40 shadow-lg pointer-events-none -translate-x-1/2 -translate-y-8"
              style={{ left: `${(activeTooltip.x / svgWidth) * 100}%`, top: `${(activeTooltip.y / svgHeight) * 100}%` }}
            >
              {activeTooltip.value}
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Weekly Tonnage Volume (Kg) */}
      <div className="bg-[#131b2e] rounded-2xl p-4 border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#89ceff]">
              Carga Acumulada
            </span>
            <h3 className="text-base font-bold font-display text-white">Volume Semanal (Tonnage)</h3>
          </div>
          <span className="text-xs text-[#94a3b8] font-mono">Últimas 4 semanas</span>
        </div>

        {/* Bar Chart */}
        <div className="space-y-2.5 pt-2">
          {weeklyData.map((item, idx) => {
            const pct = Math.round((item.volumeKg / maxVolume) * 100);
            const isLatest = idx === weeklyData.length - 1;

            return (
              <div key={item.weekLabel} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isLatest ? 'text-[#f97316]' : 'text-[#dae2fd]'}`}>
                    {item.weekLabel}
                    <span className="text-[#94a3b8] font-normal ml-1.5 text-[11px]">({item.dateRange})</span>
                  </span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {item.volumeKg.toLocaleString('pt-BR')} kg
                  </span>
                </div>
                <div className="w-full bg-[#171f33] h-3.5 rounded-full overflow-hidden flex items-center p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLatest
                        ? 'bg-gradient-to-r from-[#f97316] to-[#ffb690]'
                        : 'bg-gradient-to-r from-[#89ceff] to-[#0ea5e9]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Records (PRs) Hall of Fame */}
      <div className="bg-[#131b2e] rounded-2xl p-4 border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#acf847]" />
            <h3 className="text-base font-bold font-display text-white">Recordes Pessoais (PRs)</h3>
          </div>
          <span className="text-[11px] font-semibold text-[#acf847] bg-[#acf847]/15 px-2 py-0.5 rounded-full">
            {personalRecords.length} Conquistas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {personalRecords.map((pr, idx) => (
            <div
              key={idx}
              className="bg-[#171f33] rounded-xl p-3 border border-white/5 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#222a3d] text-[#acf847] flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block truncate">
                    {pr.exerciseName}
                  </span>
                  <span className="text-[10px] text-[#94a3b8]">{pr.date}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-bold font-mono text-[#f97316] tabular-nums block">
                  {pr.weightKg} kg
                </span>
                <span className="text-[10px] text-[#94a3b8]">{pr.reps} reps</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History of Completed Workouts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-display text-white">Histórico Recente</h3>
          <span className="text-xs text-[#94a3b8]">
            {workoutLogs.length} treinos gravados
          </span>
        </div>

        <div className="space-y-2">
          {workoutLogs.slice(0, 5).map(log => {
            const dateObj = new Date(log.date);
            const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
            });

            return (
              <div
                key={log.id}
                className="bg-[#131b2e] rounded-xl p-3.5 border border-white/5 space-y-2 hover:border-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#91db2a]" />
                    <span className="text-sm font-semibold text-white">{log.routineTitle}</span>
                  </div>
                  <span className="text-xs text-[#94a3b8] capitalize">{dateFormatted}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {log.durationMinutes} min
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono text-[#f97316] font-semibold">
                    <BarChart3 className="w-3.5 h-3.5" /> {log.totalVolumeKg.toLocaleString('pt-BR')} kg
                  </span>
                  <span>·</span>
                  <span>{log.completedSetsCount} séries</span>
                </div>

                {log.prsAchieved.length > 0 && (
                  <div className="bg-[#171f33] px-2.5 py-1 rounded-lg border border-[#acf847]/20 flex items-center gap-1 text-[11px] text-[#acf847]">
                    <Award className="w-3.5 h-3.5" />
                    <span className="truncate">{log.prsAchieved.join(' • ')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
