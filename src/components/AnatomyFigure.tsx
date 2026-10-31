import React, { useId } from 'react';
import type { MuscleKey } from '../lib/exerciseGuides.ts';
import { MUSCLE_LABEL } from '../lib/exerciseGuides.ts';

export const PRIMARY_COLOR = '#d91e3f';
export const SECONDARY_COLOR = '#f59e0b';
const IDLE = '#efd9cc';
const SKIN = '#e7d3c4';
const LINE = '#7a6455';

interface Part { key: MuscleKey; d: string; mirror: boolean }

// Metade esquerda (x < 100) desenhada; a direita é o espelho. "mirror:false" = peça central inteira.
const FRONT: Part[] = [
  { key: 'traps', mirror: true, d: 'M92 62 L74 72 Q82 77 98 79 L98 64 Z' },
  { key: 'shoulders', mirror: true, d: 'M70 72 Q55 72 53 91 Q53 105 64 107 Q75 100 77 84 Z' },
  { key: 'chest', mirror: true, d: 'M99 79 Q85 72 75 80 Q70 97 77 109 Q90 115 99 109 Z' },
  { key: 'obliques', mirror: true, d: 'M88 114 L78 112 Q73 135 78 170 L88 175 Z' },
  { key: 'abs', mirror: false, d: 'M90 112 Q100 110 110 112 L110 176 Q100 181 90 176 Z' },
  { key: 'biceps', mirror: true, d: 'M54 108 Q47 125 48 143 Q54 151 62 145 Q66 127 64 108 Z' },
  { key: 'forearms', mirror: true, d: 'M46 148 Q40 166 40 185 Q46 191 54 185 Q58 166 58 150 Z' },
  { key: 'quads', mirror: true, d: 'M98 187 Q80 187 74 201 Q70 241 76 283 Q86 289 96 285 Q100 241 98 187 Z' },
  { key: 'calves', mirror: true, d: 'M78 296 Q72 332 80 384 Q88 389 94 383 Q98 337 94 296 Z' },
];

const BACK: Part[] = [
  { key: 'lats', mirror: true, d: 'M98 118 Q82 110 74 92 Q69 114 74 140 Q82 160 98 162 Z' },
  { key: 'traps', mirror: false, d: 'M100 56 L88 62 L72 74 Q86 90 100 120 Q114 90 128 74 L112 62 Z' },
  { key: 'shoulders', mirror: true, d: 'M70 72 Q55 72 53 91 Q53 105 64 107 Q75 100 77 84 Z' },
  { key: 'triceps', mirror: true, d: 'M54 108 Q47 125 48 143 Q54 151 62 145 Q66 127 64 108 Z' },
  { key: 'forearms', mirror: true, d: 'M46 148 Q40 166 40 185 Q46 191 54 185 Q58 166 58 150 Z' },
  { key: 'lowerback', mirror: false, d: 'M89 150 Q100 146 111 150 L113 180 L87 180 Z' },
  { key: 'glutes', mirror: true, d: 'M99 182 Q80 178 74 193 Q72 215 86 223 Q98 221 99 207 Z' },
  { key: 'hamstrings', mirror: true, d: 'M98 224 Q82 228 76 242 Q74 267 78 289 Q88 293 96 289 Q100 257 98 224 Z' },
  { key: 'calves', mirror: true, d: 'M78 297 Q70 323 78 359 Q86 367 94 361 Q100 327 94 299 Z' },
];

const Base: React.FC<{ uid: string }> = ({ uid }) => (
  <g fill={SKIN} stroke={LINE} strokeWidth="1" strokeLinejoin="round">
    <ellipse cx="100" cy="30" rx="17" ry="21" />
    <path d="M92 48 L92 64 L108 64 L108 48 Z" />
    <path d="M70 70 Q100 60 130 70 L126 120 Q124 160 120 182 L80 182 Q76 160 74 120 Z" />
    <path d="M80 176 L120 176 L125 192 Q100 202 75 192 Z" />
    <g id={`limbs-${uid}`}>
      <path d="M62 74 Q50 78 50 100 Q44 130 46 150 Q38 170 40 188 L54 190 Q60 168 60 150 Q68 126 66 104 Z" />
      <ellipse cx="46" cy="198" rx="6.5" ry="9" />
      <path d="M76 188 Q70 240 76 290 Q72 330 78 386 L94 386 Q98 330 94 290 Q100 240 98 188 Z" />
      <ellipse cx="86" cy="290" rx="10" ry="7" />
      <path d="M78 384 Q74 404 70 411 L96 411 Q96 397 94 384 Z" />
    </g>
    <use href={`#limbs-${uid}`} transform="translate(200 0) scale(-1 1)" />
  </g>
);

const color = (k: MuscleKey, primary: MuscleKey[], secondary: MuscleKey[]) =>
  primary.includes(k) ? PRIMARY_COLOR : secondary.includes(k) ? SECONDARY_COLOR : IDLE;

const Layer: React.FC<{ parts: Part[]; primary: MuscleKey[]; secondary: MuscleKey[] }> = ({ parts, primary, secondary }) => (
  <>
    {parts.map((p, i) => {
      const fill = color(p.key, primary, secondary);
      const active = fill !== IDLE;
      const props = { d: p.d, fill, stroke: active ? '#7f1226' : LINE, strokeWidth: active ? 1.3 : 0.8, strokeLinejoin: 'round' as const, opacity: active ? 0.95 : 0.9 };
      return (
        <g key={`${p.key}-${i}`}>
          <path {...props} />
          {p.mirror && <path {...props} transform="translate(200 0) scale(-1 1)" />}
        </g>
      );
    })}
  </>
);

const AbsLines: React.FC = () => (
  <g stroke="#7a6455" strokeWidth="0.8" fill="none" opacity="0.7">
    <path d="M100 112 L100 178" />
    <path d="M90 128 Q100 130 110 128 M90 144 Q100 146 110 144 M90 160 Q100 162 110 160" />
  </g>
);

export const AnatomyFigure: React.FC<{ primary: MuscleKey[]; secondary: MuscleKey[] }> = ({ primary, secondary }) => {
  const rid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const label = `Boneco anatômico. Músculo principal: ${primary.map(m => MUSCLE_LABEL[m]).join(', ') || 'nenhum'}.${secondary.length ? ` Auxiliares: ${secondary.map(m => MUSCLE_LABEL[m]).join(', ')}.` : ''}`;
  return (
    <div role="img" aria-label={label} className="grid grid-cols-2 gap-2 rounded-2xl p-3" style={{ background: '#faf6f1', border: '1px solid #e5d9cd' }}>
      {([['FRENTE', FRONT, true], ['COSTAS', BACK, false]] as const).map(([title, parts, front]) => (
        <figure key={title} className="m-0">
          <svg viewBox="30 4 140 414" className="w-full h-auto max-h-[22rem]" aria-hidden="true">
            <Base uid={`${rid}${title}`} />
            <Layer parts={parts} primary={primary} secondary={secondary} />
            {front && <AbsLines />}
          </svg>
          <figcaption className="text-center text-[11px] font-bold tracking-wider" style={{ color: '#5b4a3d' }}>{title}</figcaption>
        </figure>
      ))}
    </div>
  );
};
