import React, { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';

const CLASSES = [
  { max: 18.5, label: 'Abaixo do peso', color: '#5be7ff' },
  { max: 25, label: 'Peso ideal', color: '#00ff66' },
  { max: 30, label: 'Sobrepeso', color: '#facc15' },
  { max: 35, label: 'Obesidade I', color: '#fb923c' },
  { max: 40, label: 'Obesidade II', color: '#f87171' },
  { max: Infinity, label: 'Obesidade III', color: '#ef4444' },
];
const toNum = (v: string) => parseFloat(v.replace(',', '.'));

type Result = null | { invalid: true } | { invalid: false; imc: number; label: string; color: string; pos: number };

export const ImcCalculator: React.FC = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const result = useMemo<Result>(() => {
    let h = toNum(height);
    const w = toNum(weight);
    if (!Number.isFinite(h) || !Number.isFinite(w)) return null;
    if (h > 3) h /= 100; // aceita cm
    if (h < 0.5 || h > 2.5 || w < 20 || w > 400) return { invalid: true };
    const imc = w / (h * h);
    const c = CLASSES.find(x => imc < x.max)!;
    return { invalid: false, imc, label: c.label, color: c.color, pos: Math.min(100, Math.max(0, ((imc - 15) / 25) * 100)) };
  }, [height, weight]);

  const field = 'mt-1 w-full rounded-xl bg-[#09090b] border border-white/10 px-3 py-2 text-sm text-[#e8ffef] placeholder:text-[#71717a] focus:border-[#00ff66] outline-none';
  return (
    <section className="rounded-2xl bg-[#121214] border border-[#00ff66]/20 p-4 mb-4">
      <h2 className="font-display text-base font-bold text-[#e8ffef] flex items-center gap-2">
        <Calculator className="w-4 h-4 text-[#00ff66]" /> Calculadora de IMC
      </h2>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <label className="text-xs text-[#a1a1aa]">Altura (m ou cm)
          <input inputMode="decimal" value={height} onChange={e => setHeight(e.target.value)} placeholder="1,75 ou 175" className={field} />
        </label>
        <label className="text-xs text-[#a1a1aa]">Peso (kg)
          <input inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)} placeholder="72,5" className={field} />
        </label>
      </div>
      <div aria-live="polite">
        {result?.invalid && <p role="alert" className="mt-3 text-xs text-[#ffb4ab]">Confira os valores: altura entre 0,5 e 2,5 m e peso entre 20 e 400 kg.</p>}
        {result && !result.invalid && (
          <div className="mt-4">
            <div className="flex items-end justify-between">
              <span className="font-display text-4xl font-extrabold tabular-nums" style={{ color: result.color }}>{result.imc.toFixed(1).replace('.', ',')}</span>
              <span className="text-sm font-bold" style={{ color: result.color }}>{result.label}</span>
            </div>
            <div className="relative mt-3 h-2.5 rounded-full" style={{ background: 'linear-gradient(90deg,#5be7ff 0 14%,#00ff66 14% 40%,#facc15 40% 60%,#fb923c 60% 80%,#f87171 80% 100%)' }}>
              <span className="absolute -top-1 w-1 h-4.5 rounded bg-white shadow-[0_0_8px_#fff]" style={{ left: `calc(${result.pos}% - 2px)`, height: '18px' }} />
            </div>
            <p className="mt-2 text-[11px] text-[#a1a1aa]">O IMC é uma referência geral; não considera massa muscular. Converse com seu professor.</p>
          </div>
        )}
      </div>
    </section>
  );
};
