import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';

/** Imagem com fallback Dark Neon quando a URL falta ou retorna erro (404). */
export const ImageWithFallback: React.FC<{ src?: string; alt: string; className?: string }> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div role="img" aria-label={alt} className={`flex items-center justify-center bg-[#121214] border border-[#00ff66]/30 text-[#00ff66] ${className}`}>
        <Dumbbell className="w-1/3 h-1/3 opacity-70" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={className} />;
};
