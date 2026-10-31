import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, Lightbulb } from 'lucide-react';
import { AnatomyFigure, PRIMARY_COLOR, SECONDARY_COLOR } from './AnatomyFigure.tsx';
import { MUSCLE_LABEL, getExerciseGuide } from '../lib/exerciseGuides.ts';

/** Guia visual do exercício: boneco anatômico com o músculo marcado + passo a passo de execução. */
export const ExerciseGuide: React.FC<{ name: string; muscleGroup: string }> = ({ name, muscleGroup }) => {
  const [open, setOpen] = useState(true);
  const guide = getExerciseGuide(name, muscleGroup);
  if (!guide) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0f0f12] overflow-hidden" aria-label={`Como executar ${name}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="text-sm font-bold font-display text-white">Como executar e músculos trabalhados</span>
        <ChevronDown className={`w-4 h-4 text-[#a1a1aa] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          <AnatomyFigure primary={guide.primary} secondary={guide.secondary} />

          <div className="space-y-1.5 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#e8ffef]">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: PRIMARY_COLOR }} /> Músculo principal:
              </span>
              {guide.primary.map(m => (
                <span key={m} className="px-2 py-0.5 rounded-full font-bold" style={{ background: '#fde2e7', color: '#8f1330' }}>{MUSCLE_LABEL[m]}</span>
              ))}
            </div>
            {guide.secondary.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#e8ffef]">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: SECONDARY_COLOR }} /> Ajudam também:
                </span>
                {guide.secondary.map(m => (
                  <span key={m} className="px-2 py-0.5 rounded-full font-semibold" style={{ background: '#fef0cf', color: '#7a4a00' }}>{MUSCLE_LABEL[m]}</span>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Passo a passo</h4>
            <ol className="space-y-2">
              {guide.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] leading-snug text-[#e8ffef]">
                  <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: '#12d95c', color: '#04130a' }}>{i + 1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {guide.tips.length > 0 && (
            <div className="rounded-xl p-3 text-xs space-y-1" style={{ background: '#e8f8ee', border: '1px solid #b7e6c6', color: '#14532d' }}>
              <div className="flex items-center gap-1.5 font-bold"><Lightbulb className="w-4 h-4" /> Dica</div>
              {guide.tips.map((t, i) => <p key={i}>{t}</p>)}
            </div>
          )}

          {guide.mistakes.length > 0 && (
            <div className="rounded-xl p-3 text-xs space-y-1" style={{ background: '#fdecec', border: '1px solid #f5c2c2', color: '#7f1d1d' }}>
              <div className="flex items-center gap-1.5 font-bold"><AlertTriangle className="w-4 h-4" /> Evite</div>
              {guide.mistakes.map((t, i) => <p key={i}>• {t}</p>)}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
