import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext.tsx';
import {
  Scale,
  Plus,
  TrendingDown,
  Activity,
  Calendar,
  X,
  Target,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';

export const BodyProgress: React.FC = () => {
  const { measurements, addBodyMeasurement } = useWorkout();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [weightKg, setWeightKg] = useState('');
  const [bodyFatPct, setBodyFatPct] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [armsCm, setArmsCm] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [thighsCm, setThighsCm] = useState('');
  const [notes, setNotes] = useState('');

  const latest = measurements[0] || {
    weightKg: 78.4,
    bodyFatPct: 13.8,
    waistCm: 81.5,
    armsCm: 39.2,
    chestCm: 106,
    thighsCm: 61.0,
  };

  const oldest = measurements[measurements.length - 1] || latest;
  const weightChange = Math.round((latest.weightKg - oldest.weightKg) * 10) / 10;
  const fatChange = latest.bodyFatPct && oldest.bodyFatPct
    ? Math.round((latest.bodyFatPct - oldest.bodyFatPct) * 10) / 10
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg) return;

    addBodyMeasurement({
      date: new Date().toISOString().split('T')[0],
      weightKg: parseFloat(weightKg),
      bodyFatPct: bodyFatPct ? parseFloat(bodyFatPct) : undefined,
      waistCm: waistCm ? parseFloat(waistCm) : undefined,
      armsCm: armsCm ? parseFloat(armsCm) : undefined,
      chestCm: chestCm ? parseFloat(chestCm) : undefined,
      thighsCm: thighsCm ? parseFloat(thighsCm) : undefined,
      notes: notes.trim() || undefined,
    });

    setIsModalOpen(false);
    setWeightKg('');
    setBodyFatPct('');
    setWaistCm('');
    setArmsCm('');
    setChestCm('');
    setThighsCm('');
    setNotes('');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Progresso Corporal</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Evolução de peso e circunferências antropométricas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold font-display flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Nova Medição
        </button>
      </div>

      {/* Target & Current Comparison Bento */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#131b2e] rounded-2xl p-3.5 border border-white/5 space-y-1">
          <span className="text-[10px] text-[#94a3b8] uppercase font-semibold">Peso Atual</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-display text-white tabular-nums">
              {latest.weightKg}
            </span>
            <span className="text-xs text-[#94a3b8]">kg</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#91db2a]">
            {weightChange <= 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
            <span>{weightChange > 0 ? `+${weightChange}` : weightChange} kg total</span>
          </div>
        </div>

        <div className="bg-[#131b2e] rounded-2xl p-3.5 border border-white/5 space-y-1">
          <span className="text-[10px] text-[#94a3b8] uppercase font-semibold">% Gordura (BF)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-display text-[#89ceff] tabular-nums">
              {latest.bodyFatPct || 14}%
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#89ceff]">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{fatChange}% desde início</span>
          </div>
        </div>

        <div className="bg-[#131b2e] rounded-2xl p-3.5 border border-white/5 space-y-1">
          <span className="text-[10px] text-[#94a3b8] uppercase font-semibold">Braço / Bíceps</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-display text-[#acf847] tabular-nums">
              {latest.armsCm || 39.2}
            </span>
            <span className="text-xs text-[#94a3b8]">cm</span>
          </div>
          <span className="text-[11px] text-[#94a3b8] block">+1.7 cm ganho</span>
        </div>

        <div className="bg-[#131b2e] rounded-2xl p-3.5 border border-white/5 space-y-1">
          <span className="text-[10px] text-[#94a3b8] uppercase font-semibold">Cintura</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-display text-white tabular-nums">
              {latest.waistCm || 81.5}
            </span>
            <span className="text-xs text-[#94a3b8]">cm</span>
          </div>
          <span className="text-[11px] text-[#91db2a] block">-5.0 cm redução</span>
        </div>
      </div>

      {/* Goal Card with Coach Cesar */}
      <div className="bg-gradient-to-r from-[#171f33] to-[#222a3d] rounded-2xl p-4 border border-[#f97316]/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f97316]/20 text-[#f97316] flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#f97316] uppercase">Meta Atual com Coach Cesar</span>
            <h4 className="text-sm font-bold font-display text-white">77.0 kg com 12% BF</h4>
            <p className="text-[11px] text-[#94a3b8]">Restam apenas 1.4 kg para a meta do ciclo atual.</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-bold text-[#91db2a] bg-[#91db2a]/15 px-2.5 py-1 rounded-full font-mono">
            85% concluído
          </span>
        </div>
      </div>

      {/* History of Measurements */}
      <div className="bg-[#131b2e] rounded-2xl p-4 border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-display text-white">Histórico de Pesagens & Medidas</h3>
          <span className="text-xs text-[#94a3b8]">{measurements.length} avaliações</span>
        </div>

        <div className="space-y-2.5">
          {measurements.map(item => {
            const dateObj = new Date(item.date);
            const dateStr = dateObj.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={item.id}
                className="bg-[#171f33] rounded-xl p-3.5 border border-white/5 space-y-2 hover:border-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#f97316]" />
                    <span className="text-xs font-semibold text-white">{dateStr}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono font-bold text-white text-sm">
                    <span>{item.weightKg} kg</span>
                    {item.bodyFatPct && (
                      <span className="text-xs text-[#89ceff]">({item.bodyFatPct}% BF)</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs bg-[#0b1326] p-2 rounded-lg border border-white/5">
                  <div>
                    <span className="text-[10px] text-[#94a3b8] block">Braço</span>
                    <span className="font-semibold text-[#dae2fd]">{item.armsCm || '-'} cm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94a3b8] block">Tórax</span>
                    <span className="font-semibold text-[#dae2fd]">{item.chestCm || '-'} cm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94a3b8] block">Cintura</span>
                    <span className="font-semibold text-[#dae2fd]">{item.waistCm || '-'} cm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94a3b8] block">Coxa</span>
                    <span className="font-semibold text-[#dae2fd]">{item.thighsCm || '-'} cm</span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-[#94a3b8] italic">"{item.notes}"</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* New Measurement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171f33] border border-white/10 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-display text-white">Nova Medição Corporal</h3>
                <span className="text-xs text-[#94a3b8]">Hoje, {new Date().toLocaleDateString('pt-BR')}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#222a3d] text-[#94a3b8] hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                    Peso Corporal (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Ex: 78.5"
                    value={weightKg}
                    onChange={e => setWeightKg(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                    % Gordura (BF)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 13.5"
                    value={bodyFatPct}
                    onChange={e => setBodyFatPct(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">Braço (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 39.5"
                    value={armsCm}
                    onChange={e => setArmsCm(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">Cintura (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 81.0"
                    value={waistCm}
                    onChange={e => setWaistCm(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">Tórax (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 106.5"
                    value={chestCm}
                    onChange={e => setChestCm(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">Coxa (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 61.5"
                    value={thighsCm}
                    onChange={e => setThighsCm(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#dae2fd] block mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Pesagem em jejum após acordar"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#222a3d] text-xs font-semibold text-[#dae2fd]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#f97316] text-white text-xs font-bold font-display shadow-lg active:scale-95"
                >
                  Salvar Medidas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
