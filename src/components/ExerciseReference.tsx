import React, { useEffect, useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import { exerciseArtworkFrames, exerciseCaption, exerciseImageCandidates } from '../lib/exerciseImages.ts';

/** Sequência visual por exercício; usa quadros licenciados e mantém a referência legada como fallback. */
export const ExerciseReference: React.FC<{ name: string; fallback?: React.ReactNode }> = ({ name, fallback = null }) => {
  const candidates = exerciseImageCandidates(name);
  const artworkFrames = exerciseArtworkFrames(name);
  const [index, setIndex] = useState(0);
  const [sequenceFailed, setSequenceFailed] = useState(false);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const sequenceActive = Boolean(artworkFrames && !sequenceFailed);
  const sources = sequenceActive ? [...(artworkFrames ?? [])] : candidates[index] ? [candidates[index]] : [];

  useEffect(() => { setIndex(0); setSequenceFailed(false); setZoomIndex(null); }, [name]);

  if (!sources.length) return <>{fallback}</>;
  const handleError = () => {
    if (sequenceActive) setSequenceFailed(true);
    else setIndex(current => current + 1);
  };
  const zoomSource = zoomIndex === null ? null : sources[zoomIndex];

  return (
    <>
      <figure className="rounded-2xl border border-white/10 bg-[#121214] p-2">
        <div className={sequenceActive ? 'grid grid-cols-2 gap-2' : ''}>
          {sources.map((src, frameIndex) => (
            <div key={src} className="min-w-0">
              {sequenceActive && <p className="mb-1 text-center text-[10px] font-bold uppercase tracking-wider text-[#e8ffef]">{frameIndex === 0 ? 'Posição inicial' : 'Final do movimento'}</p>}
              <button
                type="button"
                onClick={() => setZoomIndex(frameIndex)}
                className="relative block w-full overflow-hidden rounded-xl bg-white"
                aria-label={`Ampliar ${sequenceActive ? (frameIndex === 0 ? 'posição inicial' : 'final do movimento') : 'imagem de execução'}: ${name}`}
              >
                <img
                  src={src}
                  alt={`${sequenceActive ? (frameIndex === 0 ? 'Posição inicial' : 'Final do movimento') : 'Execução correta'}: ${name}`}
                  onError={handleError}
                  className={`mx-auto w-full object-contain ${sequenceActive ? 'max-h-[18rem]' : 'max-h-[28rem]'}`}
                />
                <span className="absolute right-2 top-2 rounded-lg p-1.5" style={{ background: 'rgba(0,0,0,.6)', color: '#fff' }}><Maximize2 className="h-3.5 w-3.5" /></span>
              </button>
            </div>
          ))}
        </div>
        <figcaption className="mt-2 px-1 text-[11px] text-[#a1a1aa]">
          {sequenceActive ? (
            <>Quadros de execução • Ilustrações de Bryl Lim e Everkinetic • <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a> • toque para ampliar</>
          ) : <>{exerciseCaption(name)} • toque para ampliar</>}
        </figcaption>
      </figure>

      {zoomSource && zoomIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[70] flex items-center justify-center p-3"
          style={{ background: 'rgba(0,0,0,.92)' }}
          onClick={() => setZoomIndex(null)}
        >
          <button type="button" aria-label="Fechar" className="absolute right-4 top-4 rounded-xl p-2" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}><X className="h-5 w-5" /></button>
          <div className="max-h-full max-w-full">
            {sequenceActive && <p className="mb-2 text-center text-sm font-semibold text-white">{zoomIndex === 0 ? 'Posição inicial' : 'Final do movimento'} • {name}</p>}
            <img src={zoomSource} alt={`Execução de ${name}`} className="max-h-[85vh] max-w-full rounded-xl bg-white object-contain" />
          </div>
        </div>
      )}
    </>
  );
};
