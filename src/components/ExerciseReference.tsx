import React, { useEffect, useState } from 'react';
import { Maximize2, Pause, Play, X } from 'lucide-react';
import { exerciseArtworkFrames, exerciseCaption, exerciseImageCandidates } from '../lib/exerciseImages.ts';

const MOVEMENT_PHASES = ['Posição inicial', 'Final do movimento'] as const;

/** Guia de duas posições para comparar o início e o final de cada exercício. */
export const ExerciseReference: React.FC<{ name: string; fallback?: React.ReactNode }> = ({ name, fallback = null }) => {
  const artworkFrames = exerciseArtworkFrames(name);
  const candidates = exerciseImageCandidates(name);
  const [activeFrame, setActiveFrame] = useState(0);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [sequenceFailed, setSequenceFailed] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const sequenceActive = Boolean(artworkFrames && !sequenceFailed);
  const source = sequenceActive
    ? artworkFrames?.[activeFrame]
    : candidates[fallbackIndex];

  useEffect(() => {
    setActiveFrame(0);
    setFallbackIndex(0);
    setSequenceFailed(false);
    setZoomOpen(false);
    setIsPlaying(true);
  }, [name]);

  useEffect(() => {
    if (!sequenceActive || !isPlaying || zoomOpen) return;
    const interval = window.setInterval(() => {
      setActiveFrame(frame => (frame + 1) % MOVEMENT_PHASES.length);
    }, 1400);
    return () => window.clearInterval(interval);
  }, [sequenceActive, isPlaying, zoomOpen]);

  if (!source) return <>{fallback}</>;

  const handleImageError = () => {
    if (sequenceActive) {
      setSequenceFailed(true);
      setActiveFrame(0);
      setIsPlaying(false);
      return;
    }
    setFallbackIndex(index => index + 1);
  };

  const phaseLabel = sequenceActive ? MOVEMENT_PHASES[activeFrame] : exerciseCaption(name);
  const imageAlt = sequenceActive ? `${phaseLabel}: ${name}` : `${exerciseCaption(name)}: ${name}`;

  return (
    <>
      <figure className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1411]">
        <div className="flex items-center justify-between gap-3 px-4 pt-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#00ff66]">Guia visual</span>
            <h4 className="mt-0.5 text-sm font-bold text-white">Veja o movimento</h4>
          </div>
          {sequenceActive && (
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-white/5 px-2 py-1 text-[11px] font-semibold text-[#a1a1aa]">
                {activeFrame + 1} de {MOVEMENT_PHASES.length}
              </span>
              <button
                type="button"
                aria-pressed={isPlaying}
                aria-label={isPlaying ? 'Pausar animação' : 'Reproduzir animação'}
                title={isPlaying ? 'Pausar movimento' : 'Reproduzir movimento'}
                onClick={() => setIsPlaying(playing => !playing)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#121214] px-2.5 py-2 text-[11px] font-semibold text-white hover:border-[#00ff66]/50"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5 text-[#00ff66]" /> : <Play className="h-3.5 w-3.5 text-[#00ff66]" />}
                <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
              </button>
            </div>
          )}
        </div>

        {sequenceActive && (
          <div className="grid grid-cols-2 gap-2 px-3 pt-3" role="group" aria-label="Etapa do movimento">
            {MOVEMENT_PHASES.map((phase, index) => (
              <button
                key={phase}
                type="button"
                aria-pressed={activeFrame === index}
                onClick={() => {
                  setActiveFrame(index);
                  setIsPlaying(false);
                }}
                className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                  activeFrame === index
                    ? 'border-[#00ff66]/60 bg-[#00ff66]/10 text-white'
                    : 'border-white/5 bg-[#121214] text-[#a1a1aa] hover:text-white'
                }`}
              >
                <span className="block text-[9px] font-bold uppercase tracking-wider text-[#00ff66]">
                  Etapa {index + 1}
                </span>
                <span className="mt-0.5 block text-xs font-semibold">{phase}</span>
              </button>
            ))}
          </div>
        )}

        <div
          className="relative mx-3 mt-3 aspect-[4/3] overflow-hidden rounded-xl border border-white/5"
          style={{ background: 'radial-gradient(ellipse at center, #23352a 0%, #111a14 68%, #0b100d 100%)' }}
        >
          {sequenceActive && artworkFrames ? (
            artworkFrames.map((frameSource, index) => (
              <img
                key={frameSource}
                src={frameSource}
                alt={activeFrame === index ? `${MOVEMENT_PHASES[index]}: ${name}` : ''}
                aria-hidden={activeFrame !== index}
                onError={handleImageError}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-contain p-4 transition-opacity duration-500 sm:p-6"
                style={{ opacity: activeFrame === index ? 1 : 0 }}
              />
            ))
          ) : (
            <img
              src={source}
              alt={imageAlt}
              onError={handleImageError}
              loading="lazy"
              className="h-full w-full object-contain p-4 sm:p-6"
            />
          )}
          <span className="pointer-events-none absolute bottom-2 left-2 rounded-lg border border-white/10 bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white">
            {phaseLabel}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setZoomOpen(true);
            }}
            aria-label={`Ampliar imagem: ${imageAlt}`}
            className="absolute right-2 top-2 rounded-lg border border-white/15 bg-black/70 p-2 text-white transition-colors hover:bg-black"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        <figcaption className="space-y-1 px-4 py-3">
          <p className="text-xs leading-relaxed text-[#e8ffef]">
            {sequenceActive
              ? 'Compare as duas posições e observe o caminho do corpo e do equipamento.'
              : exerciseCaption(name)}
          </p>
          {sequenceActive && (
            <p className="text-[10px] leading-relaxed text-[#a1a1aa]">
              {isPlaying
                ? 'As posições alternam em sequência para simular o movimento. Toque em cada etapa para estudar uma posição.'
                : 'Animação pausada. Escolha uma posição ou reproduza o movimento novamente.'}
            </p>
          )}
          {!sequenceActive && (
            <p className="text-[10px] leading-relaxed text-[#a1a1aa]">Toque na imagem para ampliar.</p>
          )}
          {sequenceActive && (
            <p className="pt-1 text-[10px] text-[#71717a]">
              Ilustrações de Bryl Lim e Everkinetic ·{' '}
              <a
                className="underline underline-offset-2 hover:text-white"
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noreferrer"
              >
                CC BY-SA 4.0
              </a>
            </p>
          )}
        </figcaption>
      </figure>

      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Imagem ampliada: ${imageAlt}`}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-3"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            aria-label="Fechar imagem ampliada"
            className="absolute right-4 top-4 rounded-xl border border-white/15 bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setZoomOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="max-h-full max-w-full" onClick={event => event.stopPropagation()}>
            <p className="mb-2 text-center text-sm font-semibold text-white">{phaseLabel} · {name}</p>
            <img src={source} alt={imageAlt} className="max-h-[85vh] max-w-full rounded-xl object-contain" />
          </div>
        </div>
      )}
    </>
  );
};
